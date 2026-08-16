<script setup lang="ts">
// Standalone cursor-warped background grid, reused by FinalCta and HowItWorks.
// (Hero's own copy stays embedded in HeroParticles.vue instead of using this -
// it already owns a WebGL canvas for the particle field, and folding the grid
// into that scene costs one extra draw call instead of a second canvas + GL
// context.) This component is desktop-only by convention: callers gate it
// behind the same `!isMobile && !prefersReducedMotion` check used elsewhere
// and keep rendering their static CSS grid as the fallback.
//
// Renders a single oversized full-screen triangle - no camera, no projection
// matrix, 3 vertices - and does everything in the fragment shader from
// gl_FragCoord, which is the cheapest way to draw a full-viewport effect.
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'
import { useSharedMouse } from '../composables/useSharedMouse'

const props = withDefaults(defineProps<{
  /** Grid cell size in CSS px - matches the static fallback's backgroundSize. */
  cellPx?: number
  /** Line opacity at rest - matches the static fallback's rgba alpha. */
  lineAlpha?: number
  /** Radius (CSS px) of the cursor's warp influence. */
  warpRadiusPx?: number
  /** Peak outward bulge (CSS px) at the cursor's center. */
  warpStrengthPx?: number
  /** Autonomous diagonal drift, CSS px/sec on each axis. 0 = static at rest. */
  driftPxPerSec?: number
  /** Mask ellipse center, CSS mask-image percentage convention (0..1, y down). */
  maskCenterX?: number
  maskCenterY?: number
  /** Mask ellipse semi-axes, as a fraction of the viewport (0..1). */
  maskRx?: number
  maskRy?: number
  /** Mask gradient stops, as a fraction of the ellipse's own radius (0..1). */
  maskInner?: number
  maskOuter?: number
  dprCap?: number
}>(), {
  cellPx: 80,
  lineAlpha: 0.035,
  warpRadiusPx: 190,
  warpStrengthPx: 16,
  driftPxPerSec: 0,
  maskCenterX: 0.5,
  maskCenterY: 0.5,
  maskRx: 0.5,
  maskRy: 0.5,
  maskInner: 0.2,
  maskOuter: 0.8,
  dprCap: 1.75,
})

const mount = ref<HTMLElement | null>(null)
const sharedMouse = useSharedMouse()

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.Camera | null = null
let geometry: THREE.BufferGeometry | null = null
let material: THREE.ShaderMaterial | null = null
let mesh: THREE.Mesh | null = null

let rafId = 0
let running = false
let intersecting = false
let disposed = true
let contextBroken = false
let lastFrame = 0
let revealLinear = 0
let timeSec = 0
let mouseArmed = false
const mousePx = new THREE.Vector2(-9999, -9999)
const mouseTargetPx = new THREE.Vector2(-9999, -9999)

let io: IntersectionObserver | null = null
let resizeObserver: ResizeObserver | null = null
let resizeTimer: ReturnType<typeof setTimeout> | null = null
let onVisibility: (() => void) | null = null
let onContextLost: ((e: Event) => void) | null = null

// A single triangle covering all of clip space is the standard cheapest
// full-screen quad - 3 vertices instead of 4-6, no index buffer.
const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform vec2 uResolutionPx;
  uniform vec2 uMousePx;
  uniform float uCellPx;
  uniform float uWarpRadiusPx;
  uniform float uWarpStrengthPx;
  uniform float uDriftPx;
  uniform float uOpacity;
  uniform float uReveal;
  uniform vec2 uMaskCenter;
  uniform vec2 uMaskR;
  uniform float uMaskInner;
  uniform float uMaskOuter;

  void main() {
    // gl_FragCoord.y is bottom-up in GL; flip so both the warp and the mask
    // share the same top-left, y-down convention as CSS.
    vec2 fragPx = vec2(gl_FragCoord.x, uResolutionPx.y - gl_FragCoord.y);

    vec2 toCursor = fragPx - uMousePx;
    float dist = length(toCursor);
    float falloff = exp(-(dist * dist) / max(uWarpRadiusPx * uWarpRadiusPx, 0.0001));
    vec2 dir = toCursor / max(dist, 0.0001);
    vec2 displaced = fragPx - dir * uWarpStrengthPx * falloff + uDriftPx;

    vec2 guv = displaced / uCellPx;
    vec2 gridD = fwidth(guv);
    vec2 gridAA = abs(fract(guv - 0.5) - 0.5) / max(gridD, vec2(0.0001));
    float line = 1.0 - min(min(gridAA.x, gridAA.y), 1.0);

    vec2 uv01 = fragPx / uResolutionPx;
    vec2 m = (uv01 - uMaskCenter) / uMaskR;
    float r = length(m);
    float mask = clamp(1.0 - (r - uMaskInner) / max(uMaskOuter - uMaskInner, 0.0001), 0.0, 1.0);

    float alpha = line * uOpacity * mask * uReveal;
    if (alpha < 0.001) discard;
    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
  }
`

function buildTriangle() {
  const geo = new THREE.BufferGeometry()
  // Clip-space triangle: (-1,-1), (3,-1), (-1,3) - covers [-1,1]x[-1,1] and then some.
  const positions = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0])
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  return geo
}

function init() {
  const host = mount.value
  if (!host || !disposed || contextBroken) return

  const width = host.clientWidth || 1
  const height = host.clientHeight || 1

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
  camera = new THREE.Camera()

  geometry = buildTriangle()
  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    uniforms: {
      uResolutionPx: { value: new THREE.Vector2(width, height) },
      uMousePx: { value: mousePx },
      uCellPx: { value: props.cellPx },
      uWarpRadiusPx: { value: props.warpRadiusPx },
      uWarpStrengthPx: { value: props.warpStrengthPx },
      uDriftPx: { value: 0 },
      uOpacity: { value: props.lineAlpha },
      uReveal: { value: 0 },
      uMaskCenter: { value: new THREE.Vector2(props.maskCenterX, props.maskCenterY) },
      uMaskR: { value: new THREE.Vector2(props.maskRx, props.maskRy) },
      uMaskInner: { value: props.maskInner },
      uMaskOuter: { value: props.maskOuter },
    },
  })
  mesh = new THREE.Mesh(geometry, material)
  mesh.frustumCulled = false
  scene.add(mesh)

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
  revealLinear = 0
  timeSec = 0
  lastFrame = 0
  mouseArmed = false
  mousePx.set(-9999, -9999)
  mouseTargetPx.set(-9999, -9999)
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
  mesh = null
  disposed = true
  mouseArmed = false
}

function frame(now: number) {
  if (!running || !renderer || !scene || !camera || !material) {
    rafId = 0
    return
  }
  rafId = requestAnimationFrame(frame)

  const dt = lastFrame === 0 ? 16 : Math.min(now - lastFrame, 48)
  lastFrame = now
  timeSec += dt * 0.001

  const u = material.uniforms
  revealLinear = Math.min(1, revealLinear + dt * 0.0022)
  u.uReveal.value = 1 - Math.pow(1 - revealLinear, 3)

  if (props.driftPxPerSec) {
    u.uDriftPx.value = timeSec * props.driftPxPerSec
  }

  const host = mount.value
  if (host && sharedMouse.latest.hasPointer) {
    const rect = host.getBoundingClientRect()
    mouseTargetPx.set(
      sharedMouse.latest.clientX - rect.left,
      sharedMouse.latest.clientY - rect.top,
    )
    if (!mouseArmed) {
      mousePx.copy(mouseTargetPx)
      mouseArmed = true
    } else {
      mousePx.lerp(mouseTargetPx, 0.09)
    }
  }

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
  if (!host || !renderer || !material) return
  const width = host.clientWidth || 1
  const height = host.clientHeight || 1
  renderer.setSize(width, height)
  material.uniforms.uResolutionPx.value.set(width, height)
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
  <div ref="mount" class="cursor-grid-warp" aria-hidden="true" />
</template>

<style scoped>
.cursor-grid-warp {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  contain: strict;
}
</style>
