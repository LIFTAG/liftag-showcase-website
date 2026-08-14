<script setup lang="ts">
// GPU particle field for the app-merge background. Same single-draw-call
// point field as the hero, driven by nine moving discs (eight icons + logo)
// and a center well instead of the laser walls.
//
// Lifecycle contract:
//   • never initializes under prefers-reduced-motion
//   • lazy-inits when the merge section is near the viewport, disposes fully
//     once it is scrolled well past - re-inits on the way back
//   • pauses while the document is hidden
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'
import { useSharedMouse } from '../composables/useSharedMouse'
import {
  MERGE_BODY_COUNT,
  bodyToParticleWorld,
  useMergeParticleField,
  wellToParticleWorld,
} from '../composables/useMergeParticleField'

const props = withDefaults(defineProps<{
  /** Particle budget. The component halves it on low-core devices. */
  count?: number
  /** Device-pixel-ratio ceiling for the render target. */
  dprCap?: number
  /** Couple the field to the shared cursor (disable on touch layouts). */
  interactive?: boolean
}>(), {
  count: 800,
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
let uniformsCleared = true

let io: IntersectionObserver | null = null
let resizeObserver: ResizeObserver | null = null
let resizeTimer: ReturnType<typeof setTimeout> | null = null
let onVisibility: (() => void) | null = null
let onContextLost: ((e: Event) => void) | null = null

const mouseWorld = new THREE.Vector2(9999, 9999)
const mouseTarget = new THREE.Vector2(9999, 9999)
let mouseArmed = false
const bodyUniforms = Array.from({ length: MERGE_BODY_COUNT }, () => new THREE.Vector4())
const bodyMotionUniforms = Array.from({ length: MERGE_BODY_COUNT }, () => new THREE.Vector4())
const wellUniform = new THREE.Vector3()
const mergeParticleField = useMergeParticleField()

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
  uniform vec4 uBodies[9];
  uniform vec4 uBodyMotion[9];
  uniform vec3 uWell;
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

  vec3 applyBody(vec2 p, vec4 body, vec4 motion, float depth01) {
    float k = body.w;
    if (k < 0.001) return vec3(0.0);
    vec2 c = body.xy;
    float radius = max(body.z, 0.08);
    vec2 d = p - c;
    float dist = length(d);
    float infl = (1.0 - smoothstep(0.0, radius * 3.2, dist)) * k;
    float depth = 0.35 + 0.65 * depth01;
    vec2 dir = d / max(dist, 0.0001);
    vec2 off = dir * infl * 2.15 * depth;
    vec2 wake = motion.xy * 0.03;
    float wakeLen = length(wake);
    wake *= min(wakeLen, 3.6) / max(wakeLen, 0.0001);
    off += wake * infl * depth;
    float circ = clamp(motion.z / 360.0, -2.0, 2.0) * infl;
    off += vortexOffset(p, c, circ);
    return vec3(off, infl * 0.45);
  }

  vec3 applyWell(vec2 p, vec3 well, float depth01) {
    if (well.z < 0.001) return vec3(0.0);
    vec2 d = well.xy - p;
    float dist = length(d);
    float infl = (1.0 - smoothstep(0.0, 26.0, dist)) * well.z;
    float depth = 0.35 + 0.65 * depth01;
    vec2 dir = d / max(dist, 0.0001);
    return vec3(dir * infl * 3.1 * depth, infl * 0.4);
  }

  void main() {
    vec3 p = position;
    float phase = aSeed * 6.2831853;
    float depth01 = (p.z + 40.0) / 80.0;

    float speed = 0.55 + aSeed * 1.15;
    float travel = p.y + uTime * speed + uScroll * (0.35 + 0.65 * depth01);
    float y = mod(travel + aRangeY, 2.0 * aRangeY) - aRangeY;
    float x = p.x + sin(uTime * (0.16 + aSeed * 0.2) + phase) * (1.1 + aSeed * 1.9);

    vec2 mouseAtDepth = uMouse * ((${CAM_Z.toFixed(1)} - p.z) / ${CAM_Z.toFixed(1)});
    vec2 toMouse = vec2(x, y) - mouseAtDepth;
    float dist = length(toMouse);
    float push = 1.0 - smoothstep(0.0, 15.0, dist);
    vec2 dir = toMouse / max(dist, 0.0001);
    x += dir.x * push * 5.0 * (0.35 + 0.65 * depth01);
    y += dir.y * push * 5.0 * (0.35 + 0.65 * depth01);

    for (int i = 0; i < 9; i++) {
      vec3 body = applyBody(vec2(x, y), uBodies[i], uBodyMotion[i], depth01);
      x += body.x;
      y += body.y;
      push += body.z;
    }

    vec3 well = applyWell(vec2(x, y), uWell, depth01);
    x += well.x;
    y += well.y;
    push += well.z;

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

function clearForceUniforms() {
  for (const body of bodyUniforms) body.set(0, 0, 0, 0)
  for (const motion of bodyMotionUniforms) motion.set(0, 0, 0, 0)
  wellUniform.set(0, 0, 0)
  uniformsCleared = true
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
      uBodies: { value: bodyUniforms },
      uBodyMotion: { value: bodyMotionUniforms },
      uWell: { value: wellUniform },
      uColorA: { value: new THREE.Color(0.28, 0.30, 0.26) },
      uColorB: { value: new THREE.Color(0.72, 0.92, 0.0) },
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
  mouseArmed = false
  mouseWorld.set(9999, 9999)
  mouseTarget.set(9999, 9999)
  clearForceUniforms()
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
  mouseArmed = false
  mouseWorld.set(9999, 9999)
  clearForceUniforms()
}

function fieldHasForces() {
  if (mergeParticleField.well.strength > 0.001) return true
  for (const body of mergeParticleField.bodies) {
    if (body.strength > 0.001) return true
  }
  return false
}

function syncBodyUniforms() {
  if (!fieldHasForces()) {
    if (!uniformsCleared) clearForceUniforms()
    return
  }

  const host = mount.value
  if (!host || !camera) return
  const canvas = host.getBoundingClientRect()
  const { halfW, halfH } = halfExtentsAt(CAM_Z, camera.aspect)

  for (let i = 0; i < MERGE_BODY_COUNT; i++) {
    const body = mergeParticleField.bodies[i]
    const worldSlot = bodyUniforms[i]
    const motionSlot = bodyMotionUniforms[i]
    if (!body || !worldSlot || !motionSlot) continue
    const world = bodyToParticleWorld(body, canvas, halfW, halfH)
    worldSlot.set(world.cx, world.cy, world.radius, world.strength)
    motionSlot.set(world.vx, world.vy, world.spin, 0)
  }

  const well = wellToParticleWorld(mergeParticleField.well, canvas, halfW, halfH)
  wellUniform.set(well.cx, well.cy, well.strength)
  uniformsCleared = false
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

  syncBodyUniforms()
  renderer.render(scene, camera)
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
  <div ref="mount" class="merge-particles" aria-hidden="true" />
</template>

<style scoped>
.merge-particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  contain: strict;
  z-index: 0;
}
</style>
