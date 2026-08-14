<script setup lang="ts">
// GPU particle field for the app-merge background. Same single-draw-call
// point field as the hero. Particles fly in when the sticky stage is on
// screen, swirl lightly with the icons, then pulse and settle as LIFTAG
// appears.
//
// Lifecycle contract:
//   • never initializes under prefers-reduced-motion
//   • lazy-inits when the sticky stage is on screen, disposes when it leaves
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
  count: 320,
  dprCap: 1.25,
  interactive: true,
})

const mount = ref<HTMLElement | null>(null)
const sharedMouse = useSharedMouse()

const FOV = 55
const CAM_Z = 60

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
let enterLinear = 0
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
const stormUniform = new THREE.Vector4()
const mergeParticleField = useMergeParticleField()

function halfExtentsAt(distance: number, aspect: number) {
  const halfH = Math.tan((FOV * Math.PI) / 360) * distance
  return { halfW: halfH * aspect, halfH }
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec2 uMouse;
  uniform float uEnter;
  uniform vec4 uBodies[9];
  uniform vec4 uBodyMotion[9];
  uniform vec3 uWell;
  uniform vec4 uStorm;
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
    float g = exp(-(dist * dist) * 0.028);
    vec2 perp = vec2(-d.y, d.x) / max(dist, 0.0001);
    return perp * g * circ * 1.2;
  }

  vec3 applyBody(vec2 p, vec4 body, vec4 motion, float depth01) {
    float k = body.w;
    if (k < 0.001) return vec3(0.0);
    vec2 c = body.xy;
    float radius = max(body.z, 0.08);
    vec2 d = p - c;
    float dist = length(d);
    float infl = (1.0 - smoothstep(0.0, radius * 4.2, dist)) * k;
    float depth = 0.35 + 0.65 * depth01;
    vec2 dir = d / max(dist, 0.0001);
    vec2 off = -dir * infl * 1.8 * depth;
    vec2 wake = motion.xy * 0.02;
    float wakeLen = length(wake);
    wake *= min(wakeLen, 2.4) / max(wakeLen, 0.0001);
    off += wake * infl * depth;
    off += vortexOffset(p, c, clamp(motion.z / 280.0, -1.4, 1.4) * infl);
    return vec3(off, infl * 0.32);
  }

  vec3 applyStorm(vec2 p, vec3 well, vec4 storm, float depth01, float seed) {
    float energy = storm.x + storm.y + storm.z;
    if (energy < 0.001) return vec3(0.0);

    vec2 d = p - well.xy;
    float dist = length(d);
    float ang = atan(d.y, d.x);
    float depth = 0.4 + 0.6 * depth01;
    float infl = (1.0 - smoothstep(0.0, 28.0, dist)) * storm.x;
    float twist = uTime * storm.w * (0.35 + 0.85 * infl) + seed * 1.4;
    float contracted = mix(dist, dist * 0.7, infl * 0.45);

    // Quiet pulse just outside the halo. A wide ring read as an explosion.
    float burstRing = mix(6.4, 8.4, seed);
    float exploded = mix(contracted, burstRing, storm.y);

    float halo = mix(6.2, 9.6, seed);
    float settled = mix(exploded, mix(exploded, halo, 0.86), storm.z);

    float finalAng = ang + twist * (storm.x * 0.55 + storm.y * 0.12 + storm.z * 0.14);
    vec2 target = well.xy + vec2(cos(finalAng), sin(finalAng)) * settled;

    float k = clamp(energy, 0.0, 1.0);
    vec2 off = (target - p) * k * (0.72 + 0.28 * depth);
    return vec3(off, infl * 0.28 + storm.y * 0.16 + storm.z * 0.22);
  }

  void main() {
    vec3 p = position;
    float phase = aSeed * 6.2831853;
    float depth01 = (p.z + 40.0) / 80.0;

    float homeX = p.x + cos(uTime * (0.13 + aSeed * 0.16) + phase) * (0.32 + aSeed * 0.5);
    float homeY = p.y + sin(uTime * (0.11 + aSeed * 0.14) + phase) * (0.32 + aSeed * 0.4);

    float lane = aSeed * 3.0;
    vec2 from = lane < 1.0
      ? vec2(-aRangeX * 1.18, homeY * 0.35 + (aSeed - 0.5) * aRangeY)
      : lane < 2.0
        ? vec2(aRangeX * 1.18, homeY * 0.35 + (aSeed - 0.5) * aRangeY)
        : vec2(homeX * 0.4, -aRangeY * 1.22 - aSeed * 8.0);
    float x = mix(from.x, homeX, uEnter);
    float y = mix(from.y, homeY, uEnter);

    vec2 mouseAtDepth = uMouse * ((${CAM_Z.toFixed(1)} - p.z) / ${CAM_Z.toFixed(1)});
    vec2 toMouse = vec2(x, y) - mouseAtDepth;
    float dist = length(toMouse);
    float push = 1.0 - smoothstep(0.0, 15.0, dist);
    vec2 dir = toMouse / max(dist, 0.0001);
    x += dir.x * push * 5.0 * (0.35 + 0.65 * depth01);
    y += dir.y * push * 5.0 * (0.35 + 0.65 * depth01);

    if (uStorm.x + uStorm.y + uStorm.z < 0.28) {
      for (int i = 0; i < 9; i++) {
        vec3 body = applyBody(vec2(x, y), uBodies[i], uBodyMotion[i], depth01);
        x += body.x;
        y += body.y;
        push += body.z;
      }
    }

    vec3 storm = applyStorm(vec2(x, y), uWell, uStorm, depth01, aSeed);
    x += storm.x;
    y += storm.y;
    push += storm.z;

    float twinkle = 0.76 + 0.24 * sin(uTime * (0.6 + aSeed * 1.1) + phase * 3.0);
    float edgeFade = (1.0 - smoothstep(aRangeY * 0.92, aRangeY, abs(y)))
                   * (1.0 - smoothstep(aRangeX * 0.94, aRangeX, abs(x)));

    vAlpha = uEnter * twinkle * mix(0.24, 0.68, depth01) * edgeFade * (1.0 + push * 0.7);
    vTint = min(1.0, aTint + uStorm.y * 0.1);

    vec4 mv = modelViewMatrix * vec4(x, y, p.z, 1.0);
    float size = aSize * uPixelRatio * (1.0 + push * 0.7) * (135.0 / -mv.z);
    gl_PointSize = clamp(size, 1.0, 11.0 * uPixelRatio);
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
  stormUniform.set(0, 0, 0, 0)
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
      uEnter: { value: 0 },
      uBodies: { value: bodyUniforms },
      uBodyMotion: { value: bodyMotionUniforms },
      uWell: { value: wellUniform },
      uStorm: { value: stormUniform },
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
  enterLinear = 0
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
  const storm = mergeParticleField.storm
  if (storm.tornado + storm.burst + storm.settle > 0.001) return true
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
  const storm = mergeParticleField.storm
  stormUniform.set(storm.tornado, storm.burst, storm.settle, storm.spin)
  uniformsCleared = false
}

function frame(now: number) {
  if (!running || !renderer || !scene || !camera || !material) {
    rafId = 0
    running = false
    return
  }
  rafId = requestAnimationFrame(frame)

  const dt = lastFrame === 0 ? 16 : Math.min(now - lastFrame, 48)
  lastFrame = now

  const u = material.uniforms
  u.uTime.value += dt * 0.001

  enterLinear = Math.min(1, enterLinear + dt * 0.00145)
  u.uEnter.value = 1 - Math.pow(1 - enterLinear, 3)

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
      intersecting = Boolean(entry?.isIntersecting)
      if (intersecting) {
        if (disposed) init()
        startLoop()
      } else {
        stopLoop()
        disposeScene()
        contextBroken = false
      }
    },
    { threshold: 0 },
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
