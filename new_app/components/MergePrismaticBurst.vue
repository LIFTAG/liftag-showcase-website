<script setup lang="ts">
// Prismatic burst overlay for the app-merge detonation.
//
// A raw-WebGL port of ReactBits' Prismatic Burst shader (reactbits.dev/
// backgrounds/prismatic-burst): a short raymarch through noise-bent light
// rays, coloured by a 1D gradient sampled along march depth, comb-filtered
// into discrete spokes. No ogl dependency — same hand-rolled style as
// MergePrismCore.
//
// It lives only inside the flash band: the loop runs while mergeField.core
// carries the detonation pulse and the scene is disposed the moment it ends,
// so the section pays nothing outside that moment. The canvas spans the whole
// pinned viewport and uCenter anchors the emission point on the crystal, so
// the burst fills the screen instead of sitting in a stage-sized frame.
// Recolored from the reference's spectral rainbow to the LIFTAG palette —
// white-hot lime at the core, a lime plateau through the body, red-neon at
// the ray tips.
//
// Lifecycle contract matches MergePrismCore:
//   • never initializes under prefers-reduced-motion
//   • lazy-inits only while the shared field is armed AND flash is live
//   • disposes when the flash window closes or the pin releases
//   • pauses while the document is hidden
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useMergeParticleField } from '../composables/useMergeParticleField'
import { prismBufferScale } from '../utils/mergePrism'

const mount = ref<HTMLElement | null>(null)
const mergeField = useMergeParticleField()

/** March steps. The reference fires 44; this shows for a fraction of a second. */
const MARCH_STEPS = 20
/** Comb teeth — one spoke per absorbed app icon. */
const RAY_COUNT = 8
/** Ray bend amount, the reference's uDistort axis. */
const DISTORT = 6.0
/** Pattern churn rate, the reference's uSpeed. */
const SPEED = 0.9
/** Step-count compensation: brightness scales with marched samples. */
const GAIN = 2.1

// Gradient sampled along march depth, taken from the same dispersion ramp as
// --liftag-prism-fringe in main.css (the prism-rim spin border): white-hot
// emission splitting into cyan / lime / warm-white / amber before dying in the
// red-neon tail — the way MergePrismCore's facets split a ray.
const GRADIENT_STOPS = ['#f2ffdf', '#96ffe1', '#ccff00', '#eeff82', '#fff6be', '#ffb21e', '#ff2d55']

// Flash thresholds with a small deadband between them so rapid scrubbing
// across the band edge cannot thrash init/dispose.
const FLASH_START = 0.0015
const FLASH_STOP = 0.0004
const FADE_FLOOR = 0.002

let gl: WebGLRenderingContext | null = null
// Owned by init/dispose, never by the template. Once a context is lost,
// getContext on the same element hands back the dead one, so re-entering the
// flash band has to start from a brand new canvas.
let canvasEl: HTMLCanvasElement | null = null
let program: WebGLProgram | null = null
let buffer: WebGLBuffer | null = null
let gradientTex: WebGLTexture | null = null
let loseContext: WEBGL_lose_context | null = null

let rafId = 0
let running = false
let watching = false
let intersecting = false
let disposed = true
let contextBroken = false
let io: IntersectionObserver | null = null
let resizeObserver: ResizeObserver | null = null
let resizeTimer: ReturnType<typeof setTimeout> | null = null
let onVisibility: (() => void) | null = null
let onContextLost: ((e: Event) => void) | null = null

let bufW = 0
let bufH = 0

type Uniforms = {
  uRes: WebGLUniformLocation | null
  uCenter: WebGLUniformLocation | null
  uTime: WebGLUniformLocation | null
  uEnergy: WebGLUniformLocation | null
  uGradient: WebGLUniformLocation | null
}
let uniforms: Uniforms | null = null

// Burst origin in device px, GL bottom-left origin. Recomputed every flash
// frame from the live stage rect so it tracks resize and layout shifts.
let centerX = 0
let centerY = 0

const vertexSource = /* glsl */ `
  attribute vec2 aPos;
  void main() {
    gl_Position = vec4(aPos, 0.0, 1.0);
  }
`

const fragmentSource = /* glsl */ `
  precision highp float;

  uniform vec2 uRes;
  uniform vec2 uCenter;  // burst origin, fragment px, GL bottom-left origin
  uniform float uTime;
  uniform float uEnergy;
  uniform sampler2D uGradient;

  float hash21(vec2 p) {
    p = floor(p);
    return fract(52.9829189 * fract(dot(p, vec2(0.065, 0.005))));
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float layeredNoise(vec2 fragPx) {
    vec2 p = mod(fragPx + vec2(uTime * 30.0, -uTime * 21.0), 1024.0);
    float n = 0.0;
    n += 0.40 * hash21(p);
    n += 0.25 * hash21(p * 2.0 + 17.0);
    n += 0.20 * hash21(p * 4.0 + 47.0);
    n += 0.10 * hash21(p * 8.0 + 113.0);
    n += 0.05 * hash21(p * 16.0 + 191.0);
    return n;
  }

  // Camera ray from the burst origin instead of the canvas middle, so the
  // emission point lands on the crystal no matter where it sits in the frame.
  vec3 rayDir(vec2 frag, vec2 res, vec2 center) {
    float focal = res.y;
    return normalize(vec3(2.0 * (frag - center), focal));
  }

  // Vignette measured from the burst origin too: rays die into black toward
  // the far edges of the viewport rather than at a fixed box around centre.
  float edgeFade(vec2 frag, vec2 res, vec2 center) {
    vec2 toC = frag - center;
    float r = length(toC) / (0.5 * min(res.x, res.y));
    float x = clamp(r, 0.0, 1.0);
    float q = x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
    float s = q * 0.5;
    s = pow(s, 1.5);
    float tail = 1.0 - pow(1.0 - s, 2.0);
    s = mix(s, tail, 0.2);
    float dn = (hash(frag * 0.15) - 0.5) * 0.0015 * s;
    return clamp(s + dn, 0.0, 1.0);
  }

  vec3 sampleGradient(float t) {
    t = clamp(t, 0.0, 1.0);
    return texture2D(uGradient, vec2(t, 0.5)).rgb;
  }

  vec2 rot2(vec2 v, float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c) * v;
  }

  float bendAngle(vec3 q, float t) {
    return 0.8 * sin(q.x * 0.55 + t * 0.6)
      + 0.7 * sin(q.y * 0.50 - t * 0.5)
      + 0.6 * sin(q.z * 0.60 + t * 0.7);
  }

  void main() {
    vec2 frag = gl_FragCoord.xy;
    float t = uTime * ${(SPEED).toFixed(3)};
    float jitterAmp = 0.08;
    vec3 dir = rayDir(frag, uRes, uCenter);
    float marchT = 0.0;
    vec3 col = vec3(0.0);
    float n = layeredNoise(frag);

    vec4 c = cos(t * 0.2 + vec4(0.0, 33.0, 11.0, 0.0));
    mat2 M2 = mat2(c.x, c.y, c.z, c.w);
    float amp = ${(DISTORT).toFixed(3)} * 0.15;

    for (int i = 0; i < ${MARCH_STEPS}; ++i) {
      vec3 P = marchT * dir;
      P.z -= 2.0;
      float rad = length(P);
      vec3 Pl = P * (10.0 / max(rad, 1e-6));
      Pl.xz *= M2;

      float stepLen = min(rad - 0.3, n * jitterAmp) + 0.1;

      float grow = smoothstep(0.35, 3.0, marchT);
      float a1 = amp * grow * bendAngle(Pl * 0.6, t);
      float a2 = 0.5 * amp * grow * bendAngle(Pl.zyx * 0.5 + 3.1, t * 0.9);
      vec3 Pb = Pl;
      Pb.xz = rot2(Pb.xz, a1);
      Pb.xy = rot2(Pb.xy, a2);

      float rayPattern = smoothstep(
        0.5, 0.7,
        sin(Pb.x + cos(Pb.y) * cos(Pb.z)) *
        sin(Pb.z + sin(Pb.y) * cos(Pb.x + t))
      );

      float ang = atan(Pb.y, Pb.x);
      float comb = 0.5 + 0.5 * cos(${RAY_COUNT}.0 * ang);
      comb = pow(comb, 3.0);
      rayPattern *= smoothstep(0.15, 0.95, comb);

      // LIFTAG ramp instead of the spectral default: the gradient texture is
      // always bound, so the reference's uColorCount branch collapses away.
      float saw = fract(marchT * 0.25);
      float tRay = saw * saw * (3.0 - 2.0 * saw);
      vec3 spectral = 2.0 * sampleGradient(tRay);

      vec3 base = (0.05 / (0.4 + stepLen))
        * smoothstep(5.0, 0.0, rad)
        * spectral;

      col += base * rayPattern;
      marchT += stepLen;
    }

    col *= edgeFade(frag, uRes, uCenter);
    col *= uEnergy * ${(GAIN).toFixed(3)};
    col = 1.0 - exp(-col * 1.15);

    // Dither only where there is signal, so the fade tail never bands.
    float lum = max(col.r, max(col.g, col.b));
    col += (hash(gl_FragCoord.xy) - 0.5) * 0.006 * smoothstep(0.0, 0.05, lum);
    col = clamp(col, 0.0, 1.0);

    // Premultiplied emissive: black is absent, bright is additive under the
    // element's screen blend.
    float a = clamp(max(col.r, max(col.g, col.b)) * 1.2, 0.0, 1.0);
    gl_FragColor = vec4(col, a);
  }
`

function hexToRgb01(hex: string): [number, number, number] {
  const int = parseInt(hex.slice(1, 7), 16)
  return [
    ((int >> 16) & 255) / 255,
    ((int >> 8) & 255) / 255,
    (int & 255) / 255,
  ]
}

function compile(context: WebGLRenderingContext, type: number, source: string) {
  const shader = context.createShader(type)
  if (!shader) return null
  context.shaderSource(shader, source)
  context.compileShader(shader)
  if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
    if (import.meta.dev) console.error('[MergePrismaticBurst]', context.getShaderInfoLog(shader))
    context.deleteShader(shader)
    return null
  }
  return shader
}

function linkProgram(
  context: WebGLRenderingContext,
  vsSource: string,
  fsSource: string,
) {
  const vs = compile(context, context.VERTEX_SHADER, vsSource)
  const fs = compile(context, context.FRAGMENT_SHADER, fsSource)
  const prog = vs && fs ? context.createProgram() : null
  if (!vs || !fs || !prog) {
    if (vs) context.deleteShader(vs)
    if (fs) context.deleteShader(fs)
    return null
  }
  context.attachShader(prog, vs)
  context.attachShader(prog, fs)
  context.linkProgram(prog)
  context.deleteShader(vs)
  context.deleteShader(fs)
  if (!context.getProgramParameter(prog, context.LINK_STATUS)) {
    if (import.meta.dev) console.error('[MergePrismaticBurst]', context.getProgramInfoLog(prog))
    context.deleteProgram(prog)
    return null
  }
  return prog
}

function createGradientTexture(context: WebGLRenderingContext) {
  const tex = context.createTexture()
  if (!tex) return null

  const data = new Uint8Array(GRADIENT_STOPS.length * 4)
  for (let i = 0; i < GRADIENT_STOPS.length; i++) {
    const [r, g, b] = hexToRgb01(GRADIENT_STOPS[i])
    data[i * 4] = Math.round(r * 255)
    data[i * 4 + 1] = Math.round(g * 255)
    data[i * 4 + 2] = Math.round(b * 255)
    data[i * 4 + 3] = 255
  }

  context.bindTexture(context.TEXTURE_2D, tex)
  context.texImage2D(
    context.TEXTURE_2D,
    0,
    context.RGBA,
    GRADIENT_STOPS.length,
    1,
    0,
    context.RGBA,
    context.UNSIGNED_BYTE,
    data,
  )
  context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR)
  context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR)
  context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE)
  context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE)
  return tex
}

function resizeBuffer() {
  const host = mount.value
  if (!host || !canvasEl || !gl) return

  const scale = Math.min(
    prismBufferScale(
      window.devicePixelRatio || 1,
      navigator.hardwareConcurrency ?? 8,
      window.innerWidth,
    ),
    1.25,
  )
  const width = Math.max(1, Math.round((host.clientWidth || 1) * scale))
  const height = Math.max(1, Math.round((host.clientHeight || 1) * scale))
  if (width === bufW && height === bufH) return
  canvasEl.width = width
  canvasEl.height = height
  bufW = width
  bufH = height
  gl.viewport(0, 0, width, height)
}

function init() {
  const host = mount.value
  if (!host || !disposed || contextBroken) return

  const canvas = document.createElement('canvas')
  const attrs: WebGLContextAttributes = {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'low-power',
  }

  const context = (canvas.getContext('webgl', attrs) as WebGLRenderingContext | null)

  if (!context) {
    contextBroken = true
    return
  }

  const prog = linkProgram(context, vertexSource, fragmentSource)
  if (!prog) {
    contextBroken = true
    return
  }

  const tex = createGradientTexture(context)
  if (!tex) {
    context.deleteProgram(prog)
    contextBroken = true
    return
  }

  gl = context
  canvasEl = canvas
  program = prog
  gradientTex = tex
  loseContext = context.getExtension('WEBGL_lose_context')
  host.appendChild(canvas)

  buffer = context.createBuffer()
  context.bindBuffer(context.ARRAY_BUFFER, buffer)
  context.bufferData(
    context.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    context.STATIC_DRAW,
  )

  context.useProgram(prog)
  const posLoc = context.getAttribLocation(prog, 'aPos')
  context.enableVertexAttribArray(posLoc)
  context.vertexAttribPointer(posLoc, 2, context.FLOAT, false, 0, 0)

  uniforms = {
    uRes: context.getUniformLocation(prog, 'uRes'),
    uCenter: context.getUniformLocation(prog, 'uCenter'),
    uTime: context.getUniformLocation(prog, 'uTime'),
    uEnergy: context.getUniformLocation(prog, 'uEnergy'),
    uGradient: context.getUniformLocation(prog, 'uGradient'),
  }
  context.activeTexture(context.TEXTURE0)
  context.bindTexture(context.TEXTURE_2D, tex)
  if (uniforms.uGradient) context.uniform1i(uniforms.uGradient, 0)

  context.disable(context.CULL_FACE)
  context.disable(context.DEPTH_TEST)
  context.disable(context.BLEND)
  context.clearColor(0, 0, 0, 0)

  onContextLost = (event: Event) => {
    event.preventDefault()
    contextBroken = true
    stopLoop()
    disposeScene()
  }
  canvas.addEventListener('webglcontextlost', onContextLost, false)

  bufW = 0
  bufH = 0
  disposed = false
  resizeBuffer()
}

function disposeScene() {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = 0
  running = false

  if (canvasEl && onContextLost) {
    canvasEl.removeEventListener('webglcontextlost', onContextLost)
  }
  onContextLost = null

  if (gl) {
    if (buffer) gl.deleteBuffer(buffer)
    if (program) gl.deleteProgram(program)
    if (gradientTex) gl.deleteTexture(gradientTex)
    if (!contextBroken) loseContext?.loseContext()
  }
  canvasEl?.remove()

  gl = null
  canvasEl = null
  program = null
  buffer = null
  gradientTex = null
  uniforms = null
  loseContext = null
  disposed = true
  bufW = 0
  bufH = 0
}

function releaseField() {
  stopLoop()
  disposeScene()
  contextBroken = false
}

/** The burst renders only inside the detonation band, scaled by section fade. */
function burstIsLive() {
  const core = mergeField.core
  return mergeField.armed && core.fade > FADE_FLOOR && core.flash > FLASH_STOP
}

function watchArmed() {
  watching = false
  rafId = 0
  if (!intersecting || document.hidden) return

  if (mergeField.core.fade > 0.01 && mergeField.core.flash > FLASH_START) {
    if (disposed) init()
    if (!disposed) {
      startLoop()
      return
    }
  } else if (!disposed) {
    releaseField()
  }
  startWatch()
}

function startWatch() {
  if (watching || running || document.hidden || !intersecting) return
  watching = true
  rafId = requestAnimationFrame(watchArmed)
}

function frame(now: number) {
  if (!running || !gl || !program || !uniforms) {
    rafId = 0
    running = false
    return
  }

  if (!burstIsLive()) {
    releaseField()
    if (intersecting) startWatch()
    return
  }

  rafId = requestAnimationFrame(frame)

  const core = mergeField.core
  const flash = Math.min(1, Math.max(0, core.flash))
  // Squared-smooth the pulse so the attack stays sharp and the tail cuts clean.
  const energy = flash * flash * (3 - 2 * flash) * Math.min(1, Math.max(0, core.fade))

  // The stage centre is the burst origin. Measured from the live rect every
  // frame so it tracks resize and layout shifts; flipped into GL's bottom-left
  // fragment origin and scaled into device pixels to match uRes.
  const stage = document.querySelector('.merge-stage')
  if (stage && canvasEl) {
    const sr = stage.getBoundingClientRect()
    const cr = canvasEl.getBoundingClientRect()
    if (cr.width > 0 && cr.height > 0) {
      const scaleX = bufW > 0 ? bufW / cr.width : 1
      const scaleY = bufH > 0 ? bufH / cr.height : 1
      centerX = (sr.left + sr.width * 0.5 - cr.left) * scaleX
      centerY = (cr.height - (sr.top + sr.height * 0.5 - cr.top)) * scaleY
    }
  }

  resizeBuffer()

  gl.useProgram(program)
  gl.uniform2f(uniforms.uRes, bufW, bufH)
  gl.uniform2f(uniforms.uCenter, centerX, centerY)
  gl.uniform1f(uniforms.uTime, now * 0.001)
  gl.uniform1f(uniforms.uEnergy, energy)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
}

function startLoop() {
  if (running || disposed || document.hidden) return
  running = true
  watching = false
  rafId = requestAnimationFrame(frame)
}

function stopLoop() {
  running = false
  watching = false
  if (rafId) cancelAnimationFrame(rafId)
  rafId = 0
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
    resizeTimer = setTimeout(() => {
      bufW = 0
      bufH = 0
      resizeBuffer()
    }, 150)
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
  <div ref="mount" class="merge-prismatic-burst" aria-hidden="true" />
</template>

<style scoped>
.merge-prismatic-burst {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  overflow: hidden;
}

.merge-prismatic-burst :deep(canvas) {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  mix-blend-mode: screen;
}

@media (prefers-reduced-motion: reduce) {
  .merge-prismatic-burst {
    display: none;
  }
}
</style>
