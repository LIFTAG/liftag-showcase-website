<script setup lang="ts">
// GPU particle field for the hero background. One draw call replaces the old
// 28-div DOM particle layer: ~1300 points simulated entirely in the vertex
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
}>(), {
  count: 1300,
  dprCap: 1.75,
  interactive: true,
})

const mount = ref<HTMLElement | null>(null)
const sharedMouse = useSharedMouse()

const FOV = 55
const CAM_Z = 60
/** Reveal floor on re-entry so the field never replays the full fade-in. */
const REENTRY_REVEAL_FLOOR = 0.35

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let material: THREE.ShaderMaterial | null = null
let geometry: THREE.BufferGeometry | null = null
let points: THREE.Points | null = null

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
const wallWorld0 = new THREE.Vector4()
const wallWorld1 = new THREE.Vector4()
const wallVel0 = new THREE.Vector2()
const wallVel1 = new THREE.Vector2()
const wallTarget0 = new THREE.Vector4()
const wallTarget1 = new THREE.Vector4()
const wallVelTarget0 = new THREE.Vector2()
const wallVelTarget1 = new THREE.Vector2()
const heroParticleField = useHeroParticleField()
let wall0Live = false
let wall1Live = false
const WALL_LERP = 0.07
const WAKE_DECAY_MS = 500

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

  float sdBox(vec2 p, vec2 c, vec2 h) {
    vec2 q = abs(p - c) - h;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
  }

  vec2 sdBoxNormal(vec2 p, vec2 c, vec2 h) {
    vec2 rel = p - c;
    vec2 q = abs(rel) - h;
    vec2 s = vec2(rel.x >= 0.0 ? 1.0 : -1.0, rel.y >= 0.0 ? 1.0 : -1.0);
    if (q.x > 0.0 && q.y > 0.0) {
      return normalize(s * q);
    }
    return q.x > q.y ? vec2(s.x, 0.0) : vec2(0.0, s.y);
  }

  vec2 vortexOffset(vec2 p, vec2 vortex, float circ) {
    vec2 d = p - vortex;
    float dist = length(d);
    float g = exp(-(dist * dist) * 0.0138889);
    vec2 perp = vec2(-d.y, d.x) / max(dist, 0.0001);
    return perp * g * circ * 5.0;
  }

  vec3 applyWall(vec2 p, vec4 wall, vec2 vel, float k, float depth01) {
    if (k < 0.001) return vec3(0.0);
    vec2 c = wall.xy;
    vec2 h = max(wall.zw, vec2(0.08));
    float sd = sdBox(p, c, h);
    float infl = (1.0 - smoothstep(0.0, 15.0, max(sd, 0.0))) * k;
    vec2 n = sdBoxNormal(p, c, h);
    float occ = sd < 0.0 ? 1.4 : 1.0;
    float depth = 0.35 + 0.65 * depth01;
    vec2 off = n * infl * 4.0 * occ * depth;
    float travel = vel.x == 0.0 ? 0.0 : sign(vel.x);
    off.x += travel * infl * 3.0 * depth;
    float leadX = c.x + travel * h.x;
    float speed = clamp(abs(vel.x) / 40.0, 0.15, 1.35);
    float circ = (travel == 0.0 ? 1.0 : travel) * speed * infl;
    off += vortexOffset(p, vec2(leadX, c.y + h.y), circ);
    off += vortexOffset(p, vec2(leadX, c.y - h.y), -circ);
    return vec3(off, infl);
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

    float twinkle = 0.72 + 0.28 * sin(uTime * (0.6 + aSeed * 1.1) + phase * 3.0);
    float edgeFade = (1.0 - smoothstep(aRangeY * 0.86, aRangeY, abs(y)))
                   * (1.0 - smoothstep(aRangeX * 0.9, aRangeX, abs(x)));

    vAlpha = uReveal * twinkle * mix(0.30, 0.85, depth01) * edgeFade * (1.0 + push * 0.9);
    vTint = aTint;

    vec4 mv = modelViewMatrix * vec4(x, y, p.z, 1.0);
    float size = aSize * uPixelRatio * (1.0 + push * 0.55) * (135.0 / -mv.z);
    gl_PointSize = clamp(size, 1.0, 10.0 * uPixelRatio);
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
    vec3 col = mix(uColorA, uColorB, vTint) + hot * 0.32;
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
    const lime = Math.random() < 0.16

    positions[i * 3] = (Math.random() * 2 - 1) * rangeX
    positions[i * 3 + 1] = (Math.random() * 2 - 1) * rangeY
    positions[i * 3 + 2] = z
    seeds[i] = Math.random()
    sizes[i] = (lime ? 1.5 : 1.0) * (0.8 + Math.random() * 1.6)
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
      uColorA: { value: new THREE.Color(0.30, 0.33, 0.28) },
      uColorB: { value: new THREE.Color(0.80, 1.0, 0.0) },
    },
  })
  points = new THREE.Points(geometry, material)
  points.frustumCulled = false
  scene.add(points)

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
  wall0Live = false
  wall1Live = false
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
  renderer = null
  scene = null
  camera = null
  geometry = null
  material = null
  points = null
  disposed = true
  wall0Live = false
  wall1Live = false
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

  u.uScroll.value = window.scrollY * 0.02

  if (props.interactive) {
    const { halfW, halfH } = halfExtentsAt(CAM_Z, camera.aspect)
    mouseTarget.set(sharedMouse.latest.mx * halfW, -sharedMouse.latest.my * halfH)
    mouseWorld.lerp(mouseTarget, 0.07)
  }

  syncWallUniforms(dt, u)

  renderer.render(scene, camera)
}

function syncWallSlot(
  live: boolean,
  strength: number,
  target: THREE.Vector4,
  velTarget: THREE.Vector2,
  world: THREE.Vector4,
  vel: THREE.Vector2,
  kUniform: { value: number },
) {
  if (strength <= 0.001) {
    world.set(0, 0, 0, 0)
    vel.set(0, 0)
    kUniform.value = 0
    return false
  }
  if (!live) {
    world.copy(target)
    vel.copy(velTarget)
    kUniform.value = strength
    return true
  }
  world.lerp(target, WALL_LERP)
  vel.lerp(velTarget, WALL_LERP)
  kUniform.value += (strength - kUniform.value) * WALL_LERP
  return true
}

function syncWallUniforms(dt: number, u: THREE.ShaderMaterial['uniforms']) {
  decayHeroParticleWake(dt, WAKE_DECAY_MS)

  const slot0 = heroParticleField.walls[0]
  const slot1 = heroParticleField.walls[1]
  if (slot0.strength <= 0.001 && slot1.strength <= 0.001) {
    if (u.uWall0K.value !== 0 || u.uWall1K.value !== 0) {
      wall0Live = false
      wall1Live = false
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

  wallTarget0.set(world0.cx, world0.cy, world0.hw, world0.hh)
  wallTarget1.set(world1.cx, world1.cy, world1.hw, world1.hh)
  wallVelTarget0.set(world0.vx, 0)
  wallVelTarget1.set(world1.vx, 0)

  wall0Live = syncWallSlot(wall0Live, world0.strength, wallTarget0, wallVelTarget0, wallWorld0, wallVel0, u.uWall0K)
  wall1Live = syncWallSlot(wall1Live, world1.strength, wallTarget1, wallVelTarget1, wallWorld1, wallVel1, u.uWall1K)
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
