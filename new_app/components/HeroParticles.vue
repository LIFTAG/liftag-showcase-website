<script setup lang="ts">
// GPU particle field for the hero background. One draw call replaces the old
// 28-div DOM particle layer: ~1200 points simulated entirely in the vertex
// shader (drift, wrap, twinkle, cursor repulsion, laser-wall swirl, scroll
// parallax), so the CPU cost per frame is a handful of uniform writes.
//
// Lifecycle contract:
//   • never initializes under prefers-reduced-motion
//   • lazy-inits when the hero is near the viewport, disposes fully (context
//     released) once it is scrolled well past - re-inits on the way back up
//   • pauses while the document is hidden
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'
import { useSharedMouse } from '../composables/useSharedMouse'
import {
  decayHeroParticleWake,
  emptyDisplayedWall,
  shouldTransferLiveWall,
  stepDisplayedWall,
  transferDisplayedWall,
  useHeroParticleField,
  wallToParticleWorld,
} from '../composables/useHeroParticleField'

const props = withDefaults(defineProps<{
  /** Particle budget. The component halves it on low-core devices. */
  count?: number
  /** Device-pixel-ratio ceiling for the render target. */
  dprCap?: number
  /** Couple the field to the shared cursor (disable on touch layouts). */
  interactive?: boolean
  /** Render the cursor-warped background grid in the same scene/draw batch. */
  gridWarp?: boolean
}>(), {
  count: 1200,
  dprCap: 1.75,
  interactive: true,
  gridWarp: true,
})

const mount = ref<HTMLElement | null>(null)
const sharedMouse = useSharedMouse()

const FOV = 55
const CAM_Z = 60
/** Reveal floor on re-entry so the field never replays the full fade-in. */
const REENTRY_REVEAL_FLOOR = 0.35

// Background grid warp: same 80px cell as the CSS grid it replaces on desktop
// (see Hero.vue), rendered as one extra full-screen quad in this component's
// existing scene/renderer/rAF loop instead of a second canvas + GL context.
const GRID_CELL_PX = 80
const GRID_WARP_RADIUS_PX = 190
const GRID_WARP_STRENGTH_PX = 16
const GRID_LINE_ALPHA = 0.035
/** Mirrors the CSS mask: radial-gradient(ellipse 90% 80% at 60% 40%, black 20%, transparent 80%). */
const GRID_MASK_CENTER_X = 0.6
const GRID_MASK_CENTER_Y = 0.6 // CSS y=40% from top -> UV y=60% from bottom
const GRID_MASK_RX = 0.45
const GRID_MASK_RY = 0.4
const GRID_MASK_INNER = 0.2
const GRID_MASK_OUTER = 0.8

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let material: THREE.ShaderMaterial | null = null
let geometry: THREE.BufferGeometry | null = null
let points: THREE.Points | null = null
let gridGeometry: THREE.PlaneGeometry | null = null
let gridMaterial: THREE.ShaderMaterial | null = null
let gridMesh: THREE.Mesh | null = null

let rafId = 0
let running = false
let intersecting = false
let disposed = true
let contextBroken = false
let lastFrame = 0
let revealLinear = 0
let everInitialized = false

let io: IntersectionObserver | null = null
let resizeObserver: ResizeObserver | null = null
let resizeTimer: ReturnType<typeof setTimeout> | null = null
let onVisibility: (() => void) | null = null
let onContextLost: ((e: Event) => void) | null = null

const mouseWorld = new THREE.Vector2(9999, 9999)
const mouseTarget = new THREE.Vector2(9999, 9999)
let mouseArmed = false
const wallWorld0 = new THREE.Vector4()
const wallWorld1 = new THREE.Vector4()
const wallVel0 = new THREE.Vector2()
const wallVel1 = new THREE.Vector2()
const heroParticleField = useHeroParticleField()
let displayed0 = emptyDisplayedWall()
let displayed1 = emptyDisplayedWall()
let previousLiveStrength = 0
const WALL_LERP = 0.1
const WAKE_DECAY_MS = 700

function halfExtentsAt(distance: number, aspect: number) {
  const halfH = Math.tan((FOV * Math.PI) / 360) * distance
  return { halfW: halfH * aspect, halfH }
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec2 uMouse;
  uniform float uScroll;
  uniform float uReveal;
  uniform vec4 uWall0;
  uniform vec2 uWall0Vel;
  uniform float uWall0K;
  uniform vec4 uWall1;
  uniform vec2 uWall1Vel;
  uniform float uWall1K;
  attribute float aSeed;
  attribute float aSize;
  attribute float aTint;
  attribute float aRangeX;
  attribute float aRangeY;
  varying float vAlpha;
  varying float vTint;

  vec2 vortexOffset(vec2 p, vec2 vortex, float circ) {
    vec2 d = p - vortex;
    float dist = length(d);
    float g = exp(-(dist * dist) * 0.02);
    vec2 perp = vec2(-d.y, d.x) / max(dist, 0.0001);
    return perp * g * circ * 1.6;
  }

  vec3 applyWall(vec2 p, vec4 wall, vec2 vel, float k, float depth01) {
    if (k < 0.001) return vec3(0.0);
    vec2 c = wall.xy;
    vec2 h = max(wall.zw, vec2(0.08));
    float facing = vel.y == 0.0 ? 1.0 : sign(vel.y);
    float leadX = c.x + facing * h.x;
    float closestY = clamp(p.y, c.y - h.y, c.y + h.y);
    vec2 toLead = p - vec2(leadX, closestY);
    float dist = length(toLead);
    float infl = (1.0 - smoothstep(0.0, 13.0, dist)) * k;
    float depth = 0.35 + 0.65 * depth01;
    vec2 dir = toLead / max(dist, 0.0001);
    vec2 off = dir * infl * 2.1 * depth;
    off.x += facing * infl * 1.1 * depth;
    float speed = clamp(abs(vel.x) / 50.0, 0.2, 0.75);
    float circ = facing * speed * infl;
    off += vortexOffset(p, vec2(leadX, c.y + h.y), circ);
    off += vortexOffset(p, vec2(leadX, c.y - h.y), -circ);
    return vec3(off, infl * 0.45);
  }

  void main() {
    vec3 p = position;
    float phase = aSeed * 6.2831853;
    float depth01 = (p.z + 40.0) / 80.0;

    // Autonomous rise with per-particle wrap range, plus lateral sway.
    float speed = 0.55 + aSeed * 1.15;
    float travel = p.y + uTime * speed + uScroll * (0.35 + 0.65 * depth01);
    float y = mod(travel + aRangeY, 2.0 * aRangeY) - aRangeY;
    float x = p.x + sin(uTime * (0.16 + aSeed * 0.2) + phase) * (1.1 + aSeed * 1.9);

    // Perspective-correct cursor repulsion: project the z=0 cursor point onto
    // this particle's depth plane before measuring distance.
    vec2 mouseAtDepth = uMouse * ((${CAM_Z.toFixed(1)} - p.z) / ${CAM_Z.toFixed(1)});
    vec2 toMouse = vec2(x, y) - mouseAtDepth;
    float dist = length(toMouse);
    float push = 1.0 - smoothstep(0.0, 15.0, dist);
    vec2 dir = toMouse / max(dist, 0.0001);
    x += dir.x * push * 5.0 * (0.35 + 0.65 * depth01);
    y += dir.y * push * 5.0 * (0.35 + 0.65 * depth01);

    vec3 wall0 = applyWall(vec2(x, y), uWall0, uWall0Vel, uWall0K, depth01);
    x += wall0.x;
    y += wall0.y;
    vec3 wall1 = applyWall(vec2(x, y), uWall1, uWall1Vel, uWall1K, depth01);
    x += wall1.x;
    y += wall1.y;
    push += wall0.z + wall1.z;

    float twinkle = 0.76 + 0.24 * sin(uTime * (0.6 + aSeed * 1.1) + phase * 3.0);
    float edgeFade = (1.0 - smoothstep(aRangeY * 0.86, aRangeY, abs(y)))
                   * (1.0 - smoothstep(aRangeX * 0.9, aRangeX, abs(x)));

    vAlpha = uReveal * twinkle * mix(0.24, 0.68, depth01) * edgeFade * (1.0 + push * 0.55);
    vTint = aTint;

    vec4 mv = modelViewMatrix * vec4(x, y, p.z, 1.0);
    float size = aSize * uPixelRatio * (1.0 + push * 0.38) * (135.0 / -mv.z);
    gl_PointSize = clamp(size, 1.0, 8.5 * uPixelRatio);
    gl_Position = projectionMatrix * mv;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vAlpha;
  varying float vTint;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float core = 1.0 - smoothstep(0.06, 0.5, d);
    float hot = 1.0 - smoothstep(0.0, 0.16, d);
    float a = core * vAlpha;
    if (a < 0.004) discard;
    vec3 col = mix(uColorA, uColorB, vTint) + hot * 0.24;
    gl_FragColor = vec4(col, a);
  }
`

function buildGeometry(count: number, aspect: number) {
  const geo = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  const seeds = new Float32Array(count)
  const sizes = new Float32Array(count)
  const tints = new Float32Array(count)
  const rangesX = new Float32Array(count)
  const rangesY = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const z = Math.random() * 80 - 40
    // Fill each depth layer's own frustum slice so far planes reach the corners.
    const { halfW, halfH } = halfExtentsAt(CAM_Z - z, aspect)
    const rangeX = halfW * 1.12
    const rangeY = halfH * 1.15
    const lime = Math.random() < 0.13

    positions[i * 3] = (Math.random() * 2 - 1) * rangeX
    positions[i * 3 + 1] = (Math.random() * 2 - 1) * rangeY
    positions[i * 3 + 2] = z
    seeds[i] = Math.random()
    sizes[i] = (lime ? 1.4 : 1.0) * (0.8 + Math.random() * 1.45)
    tints[i] = lime ? 1 : 0
    rangesX[i] = rangeX
    rangesY[i] = rangeY
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  geo.setAttribute('aTint', new THREE.BufferAttribute(tints, 1))
  geo.setAttribute('aRangeX', new THREE.BufferAttribute(rangesX, 1))
  geo.setAttribute('aRangeY', new THREE.BufferAttribute(rangesY, 1))
  return geo
}

// A flat, unrotated plane at z=0 - the same reference depth `mouseWorld` is
// already expressed in (see the mouseTarget calc in frame()), so the grid
// reads the cursor with zero extra projection math. Local xy therefore equals
// world xy, which is why the vertex shader below skips a normal matrix.
const gridVertexShader = /* glsl */ `
  varying vec2 vPos;
  varying vec2 vUv2;

  void main() {
    vPos = position.xy;
    vUv2 = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Classic inverse-warp lookup: sample the procedural grid at
// (fragment - displacement) so lines visually bulge *away* from the cursor,
// like a lens pressing into the plane. fwidth() keeps the lines a soft ~1px
// wide at any zoom without a texture or a second draw pass.
const gridFragmentShader = /* glsl */ `
  uniform vec2 uMouse;
  uniform float uCellSize;
  uniform float uWarpRadius;
  uniform float uWarpStrength;
  uniform float uOpacity;
  uniform float uReveal;
  varying vec2 vPos;
  varying vec2 vUv2;

  void main() {
    vec2 toCursor = vPos - uMouse;
    float dist = length(toCursor);
    float falloff = exp(-(dist * dist) / max(uWarpRadius * uWarpRadius, 0.0001));
    vec2 dir = toCursor / max(dist, 0.0001);
    vec2 displaced = vPos - dir * uWarpStrength * falloff;

    vec2 guv = displaced / uCellSize;
    vec2 gridD = fwidth(guv);
    vec2 gridAA = abs(fract(guv - 0.5) - 0.5) / max(gridD, vec2(0.0001));
    float line = 1.0 - min(min(gridAA.x, gridAA.y), 1.0);

    vec2 m = vUv2 - vec2(${GRID_MASK_CENTER_X.toFixed(2)}, ${GRID_MASK_CENTER_Y.toFixed(2)});
    m.x /= ${GRID_MASK_RX.toFixed(2)};
    m.y /= ${GRID_MASK_RY.toFixed(2)};
    float r = length(m);
    float mask = clamp(1.0 - (r - ${GRID_MASK_INNER.toFixed(2)}) / ${(GRID_MASK_OUTER - GRID_MASK_INNER).toFixed(2)}, 0.0, 1.0);

    float alpha = line * uOpacity * mask * uReveal;
    if (alpha < 0.001) discard;
    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
  }
`

function buildGridGeometry(aspect: number) {
  const { halfW, halfH } = halfExtentsAt(CAM_Z, aspect)
  // Margin so a mid-resize frame (before the debounced rebuild lands) never
  // shows a seam at the plane's edge.
  const margin = 1.2
  return new THREE.PlaneGeometry(halfW * 2 * margin, halfH * 2 * margin)
}

function updateGridUniforms(widthPx: number, aspect: number) {
  if (!gridMaterial) return
  const { halfW } = halfExtentsAt(CAM_Z, aspect)
  const unitsPerPx = (halfW * 2) / Math.max(widthPx, 1)
  gridMaterial.uniforms.uCellSize.value = GRID_CELL_PX * unitsPerPx
  gridMaterial.uniforms.uWarpRadius.value = GRID_WARP_RADIUS_PX * unitsPerPx
  gridMaterial.uniforms.uWarpStrength.value = GRID_WARP_STRENGTH_PX * unitsPerPx
}

function init() {
  const host = mount.value
  if (!host || !disposed || contextBroken) return

  const width = host.clientWidth || 1
  const height = host.clientHeight || 1
  const aspect = width / height

  const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency ?? 8 : 8
  const count = cores <= 3 ? Math.round(props.count / 2) : props.count

  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: 'low-power',
    })
  } catch {
    contextBroken = true
    return
  }

  const dpr = Math.min(window.devicePixelRatio || 1, props.dprCap)
  renderer.setPixelRatio(dpr)
  renderer.setSize(width, height)
  renderer.setClearColor(0x000000, 0)

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(FOV, aspect, 0.1, 220)
  camera.position.z = CAM_Z

  geometry = buildGeometry(count, aspect)
  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: Math.random() * 40 },
      uPixelRatio: { value: dpr },
      uMouse: { value: mouseWorld },
      uScroll: { value: 0 },
      uReveal: { value: 0 },
      uWall0: { value: wallWorld0 },
      uWall0Vel: { value: wallVel0 },
      uWall0K: { value: 0 },
      uWall1: { value: wallWorld1 },
      uWall1Vel: { value: wallVel1 },
      uWall1K: { value: 0 },
      uColorA: { value: new THREE.Color(0.28, 0.30, 0.26) },
      uColorB: { value: new THREE.Color(0.72, 0.92, 0.0) },
    },
  })
  points = new THREE.Points(geometry, material)
  points.frustumCulled = false
  scene.add(points)

  if (props.gridWarp) {
    gridGeometry = buildGridGeometry(aspect)
    gridMaterial = new THREE.ShaderMaterial({
      vertexShader: gridVertexShader,
      fragmentShader: gridFragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uMouse: { value: mouseWorld },
        uCellSize: { value: GRID_CELL_PX },
        uWarpRadius: { value: GRID_WARP_RADIUS_PX },
        uWarpStrength: { value: GRID_WARP_STRENGTH_PX },
        uOpacity: { value: GRID_LINE_ALPHA },
        uReveal: { value: 0 },
      },
    })
    updateGridUniforms(width, aspect)
    gridMesh = new THREE.Mesh(gridGeometry, gridMaterial)
    gridMesh.frustumCulled = false
    scene.add(gridMesh)
  }

  onContextLost = (e: Event) => {
    e.preventDefault()
    contextBroken = true
    stopLoop()
    disposeScene()
  }
  renderer.domElement.addEventListener('webglcontextlost', onContextLost, false)
  renderer.domElement.style.position = 'absolute'
  renderer.domElement.style.inset = '0'
  host.appendChild(renderer.domElement)

  disposed = false
  revealLinear = everInitialized ? REENTRY_REVEAL_FLOOR : 0
  everInitialized = true
  lastFrame = 0
  mouseArmed = false
  mouseWorld.set(9999, 9999)
  mouseTarget.set(9999, 9999)
  displayed0 = emptyDisplayedWall()
  displayed1 = emptyDisplayedWall()
  previousLiveStrength = 0
  wallWorld0.set(0, 0, 0, 0)
  wallWorld1.set(0, 0, 0, 0)
  wallVel0.set(0, 0)
  wallVel1.set(0, 0)
}

function disposeScene() {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = 0
  running = false

  if (renderer) {
    if (onContextLost) {
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost)
      onContextLost = null
    }
    renderer.domElement.remove()
    renderer.dispose()
    if (!contextBroken) renderer.forceContextLoss()
  }
  geometry?.dispose()
  material?.dispose()
  gridGeometry?.dispose()
  gridMaterial?.dispose()
  renderer = null
  scene = null
  camera = null
  geometry = null
  material = null
  points = null
  gridGeometry = null
  gridMaterial = null
  gridMesh = null
  disposed = true
  mouseArmed = false
  mouseWorld.set(9999, 9999)
  displayed0 = emptyDisplayedWall()
  displayed1 = emptyDisplayedWall()
  previousLiveStrength = 0
}

function frame(now: number) {
  if (!running || !renderer || !scene || !camera || !material) {
    rafId = 0
    return
  }
  rafId = requestAnimationFrame(frame)

  const dt = lastFrame === 0 ? 16 : Math.min(now - lastFrame, 48)
  lastFrame = now

  const u = material.uniforms
  u.uTime.value += dt * 0.001

  revealLinear = Math.min(1, revealLinear + dt * 0.0007)
  u.uReveal.value = 1 - Math.pow(1 - revealLinear, 3)
  if (gridMaterial) gridMaterial.uniforms.uReveal.value = u.uReveal.value

  u.uScroll.value = window.scrollY * 0.02

  if (props.interactive && sharedMouse.latest.hasPointer) {
    const { halfW, halfH } = halfExtentsAt(CAM_Z, camera.aspect)
    mouseTarget.set(sharedMouse.latest.mx * halfW, -sharedMouse.latest.my * halfH)
    if (!mouseArmed) {
      mouseWorld.copy(mouseTarget)
      mouseArmed = true
    } else {
      mouseWorld.lerp(mouseTarget, 0.07)
    }
  }

  syncWallUniforms(dt, u)

  renderer.render(scene, camera)
}

function writeDisplayedWall(
  displayed: ReturnType<typeof emptyDisplayedWall>,
  world: THREE.Vector4,
  vel: THREE.Vector2,
  kUniform: { value: number },
) {
  world.set(displayed.cx, displayed.cy, displayed.hw, displayed.hh)
  vel.set(displayed.vx, displayed.facing)
  kUniform.value = displayed.k
}

function syncWallUniforms(dt: number, u: THREE.ShaderMaterial['uniforms']) {
  decayHeroParticleWake(dt, WAKE_DECAY_MS)

  const slot0 = heroParticleField.walls[0]
  const slot1 = heroParticleField.walls[1]

  if (shouldTransferLiveWall(previousLiveStrength, slot0.strength, slot1.strength)) {
    const next = transferDisplayedWall(displayed0)
    displayed0 = next.live
    displayed1 = next.wake
  }
  previousLiveStrength = slot0.strength

  const anySource = slot0.strength > 0.001 || slot1.strength > 0.001
  const anyDisplay = displayed0.k > 0.001 || displayed1.k > 0.001
  if (!anySource && !anyDisplay) {
    if (u.uWall0K.value !== 0 || u.uWall1K.value !== 0) {
      displayed0 = emptyDisplayedWall()
      displayed1 = emptyDisplayedWall()
      wallWorld0.set(0, 0, 0, 0)
      wallWorld1.set(0, 0, 0, 0)
      wallVel0.set(0, 0)
      wallVel1.set(0, 0)
      u.uWall0K.value = 0
      u.uWall1K.value = 0
    }
    return
  }

  const host = mount.value
  if (!host || !camera) return
  const canvas = host.getBoundingClientRect()
  const { halfW, halfH } = halfExtentsAt(CAM_Z, camera.aspect)
  const world0 = wallToParticleWorld(slot0, canvas, halfW, halfH)
  const world1 = wallToParticleWorld(slot1, canvas, halfW, halfH)

  displayed0 = stepDisplayedWall(displayed0, {
    cx: world0.cx,
    cy: world0.cy,
    hw: world0.hw,
    hh: world0.hh,
    vx: world0.vx,
    facing: world0.facing,
    k: world0.strength,
  }, WALL_LERP)
  displayed1 = stepDisplayedWall(displayed1, {
    cx: world1.cx,
    cy: world1.cy,
    hw: world1.hw,
    hh: world1.hh,
    vx: world1.vx,
    facing: world1.facing,
    k: world1.strength,
  }, WALL_LERP)

  writeDisplayedWall(displayed0, wallWorld0, wallVel0, u.uWall0K)
  writeDisplayedWall(displayed1, wallWorld1, wallVel1, u.uWall1K)
}

function startLoop() {
  if (running || disposed || document.hidden) return
  running = true
  lastFrame = 0
  rafId = requestAnimationFrame(frame)
}

function stopLoop() {
  running = false
  if (rafId) cancelAnimationFrame(rafId)
  rafId = 0
}

function handleResize() {
  const host = mount.value
  if (!host || !renderer || !camera) return
  const width = host.clientWidth || 1
  const height = host.clientHeight || 1
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)

  if (gridMesh) {
    gridGeometry?.dispose()
    gridGeometry = buildGridGeometry(camera.aspect)
    gridMesh.geometry = gridGeometry
    updateGridUniforms(width, camera.aspect)
  }
}

onMounted(() => {
  const host = mount.value
  if (!host) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  io = new IntersectionObserver(
    (entries) => {
      const entry = entries[entries.length - 1]
      intersecting = entry.isIntersecting
      if (intersecting) {
        if (disposed) init()
        startLoop()
      } else {
        // Fully release the GL context once the hero is well off screen.
        stopLoop()
        disposeScene()
        contextBroken = false
      }
    },
    { rootMargin: '360px 0px 360px 0px' },
  )
  io.observe(host)

  onVisibility = () => {
    if (document.hidden) stopLoop()
    else if (intersecting) startLoop()
  }
  document.addEventListener('visibilitychange', onVisibility)

  resizeObserver = new ResizeObserver(() => {
    if (resizeTimer) clearTimeout(resizeTimer)
    resizeTimer = setTimeout(handleResize, 150)
  })
  resizeObserver.observe(host)
})

onBeforeUnmount(() => {
  io?.disconnect()
  io = null
  resizeObserver?.disconnect()
  resizeObserver = null
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = null
  if (onVisibility) {
    document.removeEventListener('visibilitychange', onVisibility)
    onVisibility = null
  }
  stopLoop()
  disposeScene()
})
</script>

<template>
  <div ref="mount" class="hero-particles" aria-hidden="true" />
</template>

<style scoped>
.hero-particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  contain: strict;
}
</style>
