<script setup lang="ts">
// GPU particle field for the roadmap background. Same single-draw-call
// point field as the hero/merge, but it only exists while #roadmap is
// intersecting. Lime dust along the timeline, node wells, a spine wake.
//
// Lifecycle contract:
//   • never initializes under prefers-reduced-motion
//   • never allocates a GL context until the shared field is armed
//   • disposes fully when the section leaves the viewport
//   • pauses while the document is hidden
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'
import { useSharedMouse } from '../composables/useSharedMouse'
import {
  ROADMAP_NODE_COUNT,
  ROADMAP_SPARK_COUNT,
  nodeToParticleWorld,
  sparkToParticleWorld,
  spineToParticleWorld,
  useRoadmapParticleField,
} from '../composables/useRoadmapParticleField'
import {
  PRISM_LIME_AT,
  PRISM_RAMP_GLSL,
  PRISM_SPECTRUM,
  PRISM_SPECTRUM_EMISSIVE,
} from '../composables/usePrismSpectrum'

const props = withDefaults(defineProps<{
  /** Particle budget. The component halves it on low-core devices. */
  count?: number
  /** Device-pixel-ratio ceiling for the render target. */
  dprCap?: number
  /** Couple the field to the shared cursor (disable on touch layouts). */
  interactive?: boolean
}>(), {
  count: 220,
  dprCap: 1.2,
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
let watching = false

let io: IntersectionObserver | null = null
let resizeObserver: ResizeObserver | null = null
let resizeTimer: ReturnType<typeof setTimeout> | null = null
let onVisibility: (() => void) | null = null
let onContextLost: ((e: Event) => void) | null = null

const mouseWorld = new THREE.Vector2(9999, 9999)
const mouseTarget = new THREE.Vector2(9999, 9999)
let mouseArmed = false
const nodeUniforms = Array.from({ length: ROADMAP_NODE_COUNT }, () => new THREE.Vector4())
const sparkUniforms = Array.from({ length: ROADMAP_SPARK_COUNT }, () => new THREE.Vector4())
const spineUniform = new THREE.Vector4()
const roadmapParticleField = useRoadmapParticleField()

function halfExtentsAt(distance: number, aspect: number) {
  const halfH = Math.tan((FOV * Math.PI) / 360) * distance
  return { halfW: halfH * aspect, halfH }
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec2 uMouse;
  uniform float uEnter;
  uniform float uForceEnergy;
  uniform vec4 uNodes[4];
  uniform vec4 uSpine;
  uniform vec4 uSparks[4];
  attribute float aSeed;
  attribute float aSize;
  attribute float aTint;
  attribute float aRangeX;
  attribute float aRangeY;
  attribute float aRay;
  varying float vAlpha;
  varying float vGlow;
  varying float vHue;

  vec3 applyNode(vec2 p, vec4 node, float depth01, float seed) {
    float k = node.w;
    if (k < 0.001) return vec3(0.0);
    vec2 c = node.xy;
    float radius = max(node.z, 0.08);
    vec2 d = p - c;
    float dist = length(d);
    float reach = max(radius * 1.8, 10.0);
    float infl = (1.0 - smoothstep(0.0, reach, dist)) * k;
    float depth = 0.42 + 0.58 * depth01;
    vec2 dir = d / max(dist, 0.0001);
    vec2 perp = vec2(-d.y, d.x) / max(dist, 0.0001);
    float breathe = 0.92 + 0.08 * sin(uTime * 0.52 + seed * 6.2831853);
    vec2 off = -dir * infl * 1.35 * depth * breathe;
    off += perp * infl * 0.55 * depth * breathe;
    return vec3(off, infl * 0.28);
  }

  vec3 applySpine(vec2 p, vec4 spine, float depth01) {
    float k = spine.w;
    if (k < 0.001) return vec3(0.0);
    vec2 c = spine.xy;
    float drawn = max(spine.z, 1.2);
    float depth = 0.4 + 0.6 * depth01;
    float dx = p.x - c.x;
    float lineY = p.y - c.y;
    float along = 1.0 - smoothstep(0.0, 3.4, max(-lineY, lineY - drawn));
    float rail = (1.0 - smoothstep(0.0, 5.6, abs(dx))) * along * k;
    float tipDist = length(p - c);
    float tip = (1.0 - smoothstep(0.0, 7.2, tipDist)) * k;
    vec2 toTip = (c - p) / max(tipDist, 0.0001);
    vec2 off = vec2(-dx, 0.0) * rail * 1.15 * depth;
    off += toTip * tip * 1.35 * depth;
    off.y -= tip * 0.4 * depth;
    return vec3(off, rail * 0.2 + tip * 0.36);
  }

  vec3 applySpark(vec2 p, vec4 spark, float depth01) {
    float k = spark.w;
    if (k < 0.001) return vec3(0.0);
    vec2 d = p - spark.xy;
    float dist = length(d);
    float infl = (1.0 - smoothstep(0.0, 5.2, dist)) * k;
    vec2 dir = d / max(dist, 0.0001);
    vec2 off = -dir * infl * 1.05 * (0.4 + 0.6 * depth01);
    return vec3(off, infl * 0.4);
  }

  void main() {
    vec3 p = position;
    float phase = aSeed * 6.2831853;
    float depth01 = (p.z + 40.0) / 80.0;

    float x = p.x + cos(uTime * (0.09 + aSeed * 0.1) + phase) * (0.2 + aSeed * 0.32);
    float y = p.y + sin(uTime * (0.08 + aSeed * 0.09) + phase) * (0.18 + aSeed * 0.28);

    vec2 mouseAtDepth = uMouse * ((${CAM_Z.toFixed(1)} - p.z) / ${CAM_Z.toFixed(1)});
    vec2 toMouse = vec2(x, y) - mouseAtDepth;
    float dist = length(toMouse);
    float push = 1.0 - smoothstep(0.0, 11.0, dist);
    vec2 dir = toMouse / max(dist, 0.0001);
    x += dir.x * push * 1.6 * (0.35 + 0.65 * depth01);
    y += dir.y * push * 1.6 * (0.35 + 0.65 * depth01);

    if (uForceEnergy > 0.001) {
      for (int i = 0; i < 4; i++) {
        vec3 node = applyNode(vec2(x, y), uNodes[i], depth01, aSeed);
        x += node.x;
        y += node.y;
        push += node.z;
      }

      vec3 spine = applySpine(vec2(x, y), uSpine, depth01);
      x += spine.x;
      y += spine.y;
      push += spine.z;

      for (int i = 0; i < 4; i++) {
        vec3 spark = applySpark(vec2(x, y), uSparks[i], depth01);
        x += spark.x;
        y += spark.y;
        push += spark.z;
      }
    }

    float twinkle = 0.8 + 0.2 * sin(uTime * (0.38 + aSeed * 0.72) + phase * 2.6);
    float edgeFade = (1.0 - smoothstep(aRangeY * 0.92, aRangeY, abs(y)))
                   * (1.0 - smoothstep(aRangeX * 0.94, aRangeX, abs(x)));

    vAlpha = uEnter * twinkle * mix(0.22, 0.58, depth01) * edgeFade * (1.0 + push * 0.42);
    vGlow = min(1.0, aTint + push * 0.32);

    // Dispersion the way a prism does it: one beam entering at the top of the
    // section, separated into ordered rays by the bottom. The roadmap reads
    // top-down from shipped (V1) to furthest-out (V4), so the fan is simply how
    // far down the particle sits. Energy widens it too, so the cursor, a powered
    // node or a growing root tip pulls colour out of a stretch that was lime.
    //
    // aRay is a discrete stop, not a continuous position - a prism throws
    // separated rays, and spreading hue smoothly instead just piles most of the
    // field near lime and reads as mush. Every particle still leaves from lime;
    // spread is how far along its own ray it has travelled.
    float fan = clamp(0.5 - p.y / max(aRangeY * 2.0, 0.0001), 0.0, 1.0);
    float spread = clamp(fan * sqrt(fan) + push * 0.55, 0.0, 1.0);
    vHue = mix(${PRISM_LIME_AT.toFixed(3)}, aRay, spread);

    vec4 mv = modelViewMatrix * vec4(x, y, p.z, 1.0);
    float size = aSize * uPixelRatio * (1.0 + push * 0.4) * (124.0 / -mv.z);
    gl_PointSize = clamp(size, 1.0, 7.8 * uPixelRatio);
    gl_Position = projectionMatrix * mv;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uDust;
  uniform vec3 uSpectrum[${PRISM_SPECTRUM_EMISSIVE.length}];
  varying float vAlpha;
  varying float vGlow;
  varying float vHue;

  vec3 prismRamp(float t) {
    ${PRISM_RAMP_GLSL}
    return c;
  }

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float core = 1.0 - smoothstep(0.06, 0.5, d);
    float hot = 1.0 - smoothstep(0.0, 0.16, d);
    float a = core * vAlpha;
    if (a < 0.004) discard;
    // A particle is two or three pixels blended additively, which walks any hue
    // toward white - mint especially, since it is pale to begin with. So the ray
    // gets its saturation pushed back up before blending, and the white core
    // boost below is cut for spectral particles. This is compensation for the
    // point size, not a different palette: the stops stay exactly as authored,
    // which is what keeps this the same spectrum the roots and the rim show.
    vec3 ray = prismRamp(vHue);
    ray = clamp(mix(vec3(dot(ray, vec3(0.3333))), ray, 1.45), 0.0, 1.0);

    // Most of the field stays neutral dust. vGlow is what lifts a particle onto
    // the spectrum, so the section still reads black-and-lime at a glance and
    // the dispersion is something you find rather than something shouted at you.
    vec3 col = mix(uDust, ray, vGlow) + hot * mix(0.2, 0.05, vGlow);
    gl_FragColor = vec4(col, a);
  }
`

function buildGeometry(count: number, aspect: number) {
  const geo = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  const seeds = new Float32Array(count)
  const sizes = new Float32Array(count)
  const tints = new Float32Array(count)
  const rays = new Float32Array(count)
  const rangesX = new Float32Array(count)
  const rangesY = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const z = Math.random() * 80 - 40
    const { halfW, halfH } = halfExtentsAt(CAM_Z - z, aspect)
    const rangeX = halfW * 1.12
    const rangeY = halfH * 1.15
    // The minority that sits on the prism ramp; the rest stays neutral dust.
    const spectral = Math.random() < 0.28
    const alongRail = Math.random() > 0.28
    // Which ray this particle rides, taken straight from the stop table so the
    // fully-separated end of the fan lands on pure stop colours rather than on
    // whatever an even subdivision of the ramp happens to fall between.
    const ray = PRISM_SPECTRUM[Math.floor(Math.random() * PRISM_SPECTRUM.length)]!.at

    positions[i * 3] = (Math.random() * 2 - 1) * rangeX * (alongRail ? 0.44 : 0.94)
    positions[i * 3 + 1] = (Math.random() * 2 - 1) * rangeY
    positions[i * 3 + 2] = z
    seeds[i] = Math.random()
    sizes[i] = (spectral ? 1.25 : 0.9) * (0.72 + Math.random() * 1.08)
    tints[i] = spectral ? 1 : 0
    rays[i] = ray
    rangesX[i] = rangeX
    rangesY[i] = rangeY
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  geo.setAttribute('aTint', new THREE.BufferAttribute(tints, 1))
  geo.setAttribute('aRay', new THREE.BufferAttribute(rays, 1))
  geo.setAttribute('aRangeX', new THREE.BufferAttribute(rangesX, 1))
  geo.setAttribute('aRangeY', new THREE.BufferAttribute(rangesY, 1))
  return geo
}

function clearForceUniforms() {
  for (const node of nodeUniforms) node.set(0, 0, 0, 0)
  for (const spark of sparkUniforms) spark.set(0, 0, 0, 0)
  spineUniform.set(0, 0, 0, 0)
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
      uForceEnergy: { value: 0 },
      uNodes: { value: nodeUniforms },
      uSpine: { value: spineUniform },
      uSparks: { value: sparkUniforms },
      uDust: { value: new THREE.Color(0.32, 0.36, 0.3) },
      uSpectrum: {
        value: PRISM_SPECTRUM_EMISSIVE.map(([r, g, b]) => new THREE.Color(r, g, b)),
      },
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
  if (roadmapParticleField.spine.strength > 0.001) return true
  for (const node of roadmapParticleField.nodes) {
    if (node.strength > 0.001) return true
  }
  for (const spark of roadmapParticleField.sparks) {
    if (spark.strength > 0.001) return true
  }
  return false
}

function syncForceUniforms() {
  if (!material) return

  if (!fieldHasForces()) {
    if (!uniformsCleared) {
      clearForceUniforms()
      material.uniforms.uForceEnergy.value = 0
    }
    return
  }

  const host = mount.value
  if (!host || !camera) return
  const canvas = host.getBoundingClientRect()
  const { halfW, halfH } = halfExtentsAt(CAM_Z, camera.aspect)

  for (let i = 0; i < ROADMAP_NODE_COUNT; i++) {
    const node = roadmapParticleField.nodes[i]
    const slot = nodeUniforms[i]
    if (!node || !slot) continue
    const world = nodeToParticleWorld(node, canvas, halfW, halfH)
    slot.set(world.cx, world.cy, world.radius, world.strength)
  }

  const spine = spineToParticleWorld(roadmapParticleField.spine, canvas, halfW, halfH)
  spineUniform.set(spine.cx, spine.cy, spine.vy, spine.strength)

  for (let i = 0; i < ROADMAP_SPARK_COUNT; i++) {
    const spark = roadmapParticleField.sparks[i]
    const slot = sparkUniforms[i]
    if (!spark || !slot) continue
    const world = sparkToParticleWorld(spark, canvas, halfW, halfH)
    slot.set(world.cx, world.cy, 0, world.strength)
  }

  material.uniforms.uForceEnergy.value = 1
  uniformsCleared = false
}

function releaseField() {
  stopLoop()
  disposeScene()
  contextBroken = false
}

function frame(now: number) {
  if (!running || !renderer || !scene || !camera || !material) {
    rafId = 0
    running = false
    return
  }

  if (!roadmapParticleField.armed) {
    releaseField()
    if (intersecting) startWatch()
    return
  }

  rafId = requestAnimationFrame(frame)

  const dt = lastFrame === 0 ? 16 : Math.min(now - lastFrame, 48)
  lastFrame = now

  const u = material.uniforms
  u.uTime.value += dt * 0.001

  enterLinear = Math.min(1, enterLinear + dt * 0.0016)
  u.uEnter.value = 1 - Math.pow(1 - enterLinear, 3)

  if (props.interactive && sharedMouse.latest.hasPointer) {
    const { halfW, halfH } = halfExtentsAt(CAM_Z, camera.aspect)
    mouseTarget.set(sharedMouse.latest.mx * halfW, -sharedMouse.latest.my * halfH)
    if (!mouseArmed) {
      mouseWorld.copy(mouseTarget)
      mouseArmed = true
    } else {
      mouseWorld.lerp(mouseTarget, 0.06)
    }
  }

  syncForceUniforms()
  renderer.render(scene, camera)
}

function watch() {
  watching = false
  rafId = 0
  if (!intersecting || document.hidden) return
  if (roadmapParticleField.armed) {
    if (disposed) init()
    startLoop()
    return
  }
  if (!disposed) releaseField()
  startWatch()
}

function startWatch() {
  if (watching || running || document.hidden || !intersecting) return
  watching = true
  rafId = requestAnimationFrame(watch)
}

function startLoop() {
  if (running || disposed || document.hidden) return
  running = true
  watching = false
  lastFrame = 0
  rafId = requestAnimationFrame(frame)
}

function stopLoop() {
  running = false
  watching = false
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
      if (intersecting) startWatch()
      else releaseField()
    },
    { threshold: 0 },
  )
  io.observe(host)

  onVisibility = () => {
    if (document.hidden) stopLoop()
    else if (intersecting) startWatch()
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
  <div ref="mount" class="roadmap-particles" aria-hidden="true" />
</template>

<style scoped>
.roadmap-particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  contain: strict;
  z-index: 0;
}
</style>
