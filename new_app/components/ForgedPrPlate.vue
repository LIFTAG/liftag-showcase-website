<script setup lang="ts">
// Forged PR plate for the progress section.
//
// Progress has to become a physical object here, not another NFC tag and not a
// stock Three.js chrome disc. The body is a raymarched weight plate: a face
// disc, a raised rim, a centre hole, and a collar. The big number is a
// depression in that face, pressed in after the metal settles out of a pour.
//
// Cheap chrome would look like a product render next to the merge crystal.
// Two things keep it in the same family:
//   1. a living pour that never fully dies (domain warp + molten veins)
//   2. a thin-film rainbow split on the rim and the stamp edges, lit by the
//      same lime key and red-neon kick the rest of the page uses
//
// Sharpness is free on this island: the canvas tracks native DPR (capped at 2),
// the silhouette uses leftover SDF coverage instead of a hard hit/miss, and the
// stamp heightmap has mipmaps. Context MSAA cannot help a fullscreen triangle.
//
// Lifecycle matches the other WebGL islands:
//   • lazy-inits when the mount is near the viewport
//   • one static stamped frame under prefers-reduced-motion
//   • pauses while the document is hidden
//   • disposes the GL context when the mount leaves, so browsers do not
//     accumulate live contexts
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useSharedMouse } from '../composables/useSharedMouse'
import {
  PLATE_CAM_Z,
  PLATE_FOCAL,
  PLATE_REST_TILT,
  plateBufferScale,
  plateIdleSway,
  platePhaseAt,
  platePointerTilt,
} from '../utils/forgedPlate'

const CAM_Z = PLATE_CAM_Z
const FOCAL = PLATE_FOCAL

const mount = ref<HTMLElement | null>(null)

let gl: WebGLRenderingContext | null = null
let canvasEl: HTMLCanvasElement | null = null
let program: WebGLProgram | null = null
let buffer: WebGLBuffer | null = null
let stampTex: WebGLTexture | null = null
let loseContext: WEBGL_lose_context | null = null

let rafId = 0
let running = false
let intersecting = false
let disposed = true
let contextBroken = false
let reduceMotion = false
let startedAt = 0

let io: IntersectionObserver | null = null
let resizeObserver: ResizeObserver | null = null
let resizeTimer: ReturnType<typeof setTimeout> | null = null
let onVisibility: (() => void) | null = null
let onContextLost: ((e: Event) => void) | null = null
let onMotionChange: ((e: MediaQueryListEvent) => void) | null = null
let motionMql: MediaQueryList | null = null

let dpr = 1
let bufW = 0
let bufH = 0

let rotX = PLATE_REST_TILT.rotX
let rotY = PLATE_REST_TILT.rotY
let targetRotX = PLATE_REST_TILT.rotX
let targetRotY = PLATE_REST_TILT.rotY

type Uniforms = {
  uRes: WebGLUniformLocation | null
  uPhase: WebGLUniformLocation | null
  uLife: WebGLUniformLocation | null
  uRot: WebGLUniformLocation | null
  uStamp: WebGLUniformLocation | null
}
let uniforms: Uniforms | null = null

const vertexSource = /* glsl */ `
  attribute vec2 aPos;
  void main() {
    gl_Position = vec4(aPos, 0.0, 1.0);
  }
`

const fragmentSource = /* glsl */ `
  precision highp float;

  uniform vec2 uRes;
  uniform vec4 uPhase; // time, pour, stamp, squash
  uniform vec4 uLife;  // settle, shock, live, unused
  uniform vec2 uRot;
  uniform sampler2D uStamp;

  #define uTime   uPhase.x
  #define uPour   uPhase.y
  #define uStampD uPhase.z
  #define uSquash uPhase.w
  #define uSettle uLife.x
  #define uShock  uLife.y
  #define uLive   uLife.z

  const float CAM_Z = ${CAM_Z.toFixed(2)};
  const float FOCAL = ${FOCAL.toFixed(2)};

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }

  float smax(float a, float b, float k) {
    return -smin(-a, -b, k);
  }

  vec3 rotX(vec3 p, float a) {
    float c = cos(a);
    float s = sin(a);
    return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z);
  }

  vec3 rotY(vec3 p, float a) {
    float c = cos(a);
    float s = sin(a);
    return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
  }

  float sdTorus(vec3 p, float R, float r) {
    vec2 q = vec2(length(p.xy) - R, p.z);
    return length(q) - r;
  }

  float sdCyl(vec3 p, float r, float h) {
    vec2 d = abs(vec2(length(p.xy), p.z)) - vec2(r, h);
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
  }

  float stampSample(vec2 xy) {
    vec2 uv = xy * 0.50 + 0.50;
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0;
    return texture2D(uStamp, uv).r;
  }

  float sdPlate(vec3 p) {
    p.xy *= 1.0 + uSquash * 0.05;
    p.z  *= 1.0 - uSquash * 0.24;

    float amp = uPour * 0.086 + uLive * 0.006;
    if (amp > 0.0004) {
      vec3 w1 = vec3(
        sin(p.y * 4.8 + p.z * 2.2 + uTime * 1.35),
        sin(p.z * 5.1 - p.x * 3.4 - uTime * 1.15),
        sin(p.x * 4.2 + p.y * 3.6 + uTime * 0.95)
      );
      vec3 w2 = vec3(
        sin(p.x * 9.0 + uTime * 2.1),
        sin(p.y * 8.2 - uTime * 1.7),
        sin(dot(p, vec3(6.4, 5.8, 7.1)) + uTime * 1.4)
      );
      p += amp * (w1 * 0.58 + w2 * 0.34);
    }

    float radial = length(p.xy);
    float face = sdCyl(p, 0.96, 0.052);
    float hole = sdCyl(p, 0.188, 0.18);
    float plate = smax(face, -hole, 0.010);
    plate = smin(plate, sdTorus(p, 0.908, 0.094), 0.022);
    plate = smin(plate, sdTorus(p, 0.228, 0.042), 0.014);

    float band = smoothstep(0.26, 0.34, radial) * smoothstep(0.86, 0.76, radial);
    plate += sin(radial * 48.0) * 0.0014 * band;

    if (p.z > -0.04 && p.z < 0.24 && band > 0.0) {
      float glyph = stampSample(p.xy);
      float front = smoothstep(-0.008, 0.018, p.z);
      plate += glyph * uStampD * 0.11 * front * band;
    }

    float ringR = 0.26 + uShock * 0.68;
    float ring = exp(-(radial - ringR) * (radial - ringR) * 380.0);
    plate -= ring * (1.0 - uShock) * uStampD * 0.018 * smoothstep(-0.01, 0.02, p.z);

    return plate;
  }

  vec3 calcNormal(vec3 p) {
    vec2 e = vec2(0.0024, 0.0);
    return normalize(vec3(
      sdPlate(p + e.xyy) - sdPlate(p - e.xyy),
      sdPlate(p + e.yxy) - sdPlate(p - e.yxy),
      sdPlate(p + e.yyx) - sdPlate(p - e.yyx)
    ));
  }

  vec3 march(vec3 ro, vec3 rd) {
    float t = 0.0;
    float d = 1.0;
    for (int i = 0; i < 56; i++) {
      d = sdPlate(ro + rd * t);
      if (d < 0.0014 * (1.0 + t)) return vec3(t, d, 1.0);
      if (t > 8.0) break;
      t += d * 0.84;
    }
    return vec3(t, d, 0.0);
  }

  vec3 envSample(vec3 d) {
    vec3 col = mix(vec3(0.010, 0.014, 0.010), vec3(0.048, 0.058, 0.030), d.y * 0.5 + 0.5);

    col += vec3(1.00, 0.98, 0.92) * pow(max(dot(d, normalize(vec3(-0.42, 0.72, 0.55))), 0.0), 36.0) * 6.2;
    col += vec3(0.80, 1.00, 0.05) * pow(max(dot(d, normalize(vec3(0.55, 0.38, 0.74))), 0.0), 12.0) * (1.55 + uSettle * 0.70);
    col += vec3(1.00, 0.14, 0.32) * pow(max(dot(d, normalize(vec3(0.32, -0.78, -0.54))), 0.0), 11.0) * 1.65;
    col += vec3(0.70, 1.00, 0.12) * pow(max(dot(d, normalize(vec3(-0.62, -0.15, 0.77))), 0.0), 8.0) * 0.55;

    float strip = sin(d.y * 16.0 + d.x * 4.0 + uTime * 0.16);
    float cross = sin(d.x * 12.0 - d.z * 7.0 - uTime * 0.11);
    col += vec3(0.62, 0.82, 0.40) * smoothstep(0.92, 1.0, strip) * 0.95;
    col += vec3(0.90, 0.55, 0.62) * smoothstep(0.94, 1.0, cross) * 0.55;
    col += vec3(0.85, 0.90, 1.00) * smoothstep(0.96, 1.0, sin(d.y * 9.0 - d.z * 3.0)) * 0.38;
    return col;
  }

  vec3 iridescence(float facing, float radial) {
    float film = (1.0 - facing) * 8.2 + radial * 4.0 + uTime * 0.22 + uPour * 2.4;
    vec3 irid = 0.5 + 0.5 * sin(vec3(film, film + 2.094393, film + 4.188790));
    irid = mix(irid, vec3(0.75, 1.0, 0.15), 0.16);
    irid = mix(irid, vec3(1.0, 0.18, 0.36), 0.10 + 0.08 * sin(film * 0.45));
    return irid;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);

    vec3 roW = vec3(0.0, 0.10, CAM_Z);
    vec3 rdW = normalize(vec3(uv, -FOCAL));
    vec3 ro = rotX(rotY(roW, -uRot.y), -uRot.x);
    vec3 rd = rotX(rotY(rdW, -uRot.y), -uRot.x);

    vec3 bloom = vec3(0.0);
    bloom += vec3(0.78, 1.0, 0.06) * exp(-length(uv - vec2(-0.22, 0.06)) * 7.5) * 0.26;
    bloom += vec3(1.00, 0.14, 0.32) * exp(-length(uv - vec2(0.26, 0.10)) * 8.0) * 0.18;
    bloom *= smoothstep(0.74, 0.20, length(uv));
    float ba = clamp(max(max(bloom.r, bloom.g), bloom.b) * 1.15, 0.0, 1.0);

    float b = dot(ro, rd);
    float c = dot(ro, ro) - 1.28;
    if (b * b - c < 0.0) {
      gl_FragColor = vec4(bloom * ba, ba);
      return;
    }

    vec3 traced = march(ro, rd);
    float t = traced.x;
    float lastD = traced.y;
    float px = 2.0 * CAM_Z / (FOCAL * min(uRes.x, uRes.y));
    float cover = traced.z > 0.5
      ? 1.0
      : (1.0 - smoothstep(0.0, px * 1.65, max(lastD, 0.0)));

    if (cover < 0.01) {
      gl_FragColor = vec4(bloom * ba, ba);
      return;
    }

    vec3 p = ro + rd * t;
    vec3 n = calcNormal(p);
    vec3 nW = rotY(rotX(n, uRot.x), uRot.y);
    float radial = length(p.xy);
    float facing = max(dot(-rdW, nW), 0.0);
    float fres = 0.045 + 0.955 * pow(1.0 - facing, 5.0);

    vec3 T = vec3(-p.y, p.x, 0.0);
    vec3 R = reflect(rdW, nW);
    if (dot(T, T) > 0.002) {
      T = normalize(rotY(rotX(normalize(T), uRot.x), uRot.y));
      R = normalize(R + T * dot(R, T) * 0.40);
    }

    vec3 Rlime = normalize(R + nW * 0.028);
    vec3 Rred = normalize(R - nW * 0.028);
    vec3 spec = vec3(envSample(Rlime).r, envSample(R).g, envSample(Rred).b);

    vec3 irid = iridescence(facing, radial);
    float iridMix = 0.30 + fres * 0.48 + uPour * 0.20;
    spec *= mix(vec3(0.88, 0.90, 0.94), irid, iridMix);

    float glyph = stampSample(p.xy);
    float stampAo = 1.0 - glyph * uStampD * 0.78;
    float stampEdge = abs(stampSample(p.xy + vec2(0.0035, 0.0)) - stampSample(p.xy - vec2(0.0035, 0.0)))
      + abs(stampSample(p.xy + vec2(0.0, 0.0035)) - stampSample(p.xy - vec2(0.0, 0.0035)));
    spec *= stampAo;
    spec += irid * stampEdge * uStampD * 0.95;
    spec += vec3(0.72, 1.0, 0.12) * glyph * uStampD * 0.16 * facing;

    float vein = sin(radial * 6.2 - atan(p.y, p.x) * 3.0 - uTime * 0.72);
    vein = smoothstep(0.90, 1.0, vein) * (uPour * 0.85 + uLive * 0.22);

    vec3 col = spec * (0.24 + 0.76 * fres);
    col += vec3(0.80, 1.0, 0.12) * pow(1.0 - facing, 3.0) * 0.34;
    col += vec3(1.00, 0.16, 0.32) * pow(1.0 - facing, 3.0) * 0.16;
    col += vec3(1.00, 0.32, 0.06) * vein * 0.42;
    col += vec3(0.85, 1.00, 0.15) * vein * 0.22;
    col += vec3(1.00, 0.28, 0.06) * uPour * 0.22 * (0.35 + 0.65 * facing);

    float rimBand = smoothstep(0.82, 0.90, radial) * smoothstep(1.02, 0.94, radial);
    col += vec3(0.92, 1.0, 0.55) * rimBand * fres * 0.42;
    col += irid * rimBand * 0.28;

    col = 1.0 - exp(-max(col, 0.0) * 1.28);
    col += (hash(gl_FragCoord.xy) - 0.5) * 0.004;
    col = clamp(col, 0.0, 1.0);

    float a = 0.98 * cover;
    float outA = clamp(a + ba * (1.0 - cover), 0.0, 1.0);
    gl_FragColor = vec4(col * a + bloom * ba * (1.0 - cover), outA);
  }
`

function compile(context: WebGLRenderingContext, type: number, source: string) {
  const shader = context.createShader(type)
  if (!shader) return null
  context.shaderSource(shader, source)
  context.compileShader(shader)
  if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
    if (import.meta.dev) console.error('[ForgedPrPlate]', context.getShaderInfoLog(shader))
    context.deleteShader(shader)
    return null
  }
  return shader
}

function drawStamp(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = canvas.width
  const h = canvas.height
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, w, h)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#fff'

  ctx.save()
  ctx.filter = 'blur(2.6px)'
  ctx.font = `700 ${Math.round(w * 0.24)}px "Space Grotesk", system-ui, sans-serif`
  ctx.fillText('225', w * 0.5, h * 0.30)
  ctx.font = `700 ${Math.round(w * 0.052)}px "Space Grotesk", system-ui, sans-serif`
  ctx.fillText('LB', w * 0.5, h * 0.43)
  ctx.restore()

  ctx.save()
  ctx.globalAlpha = 0.78
  ctx.filter = 'blur(0.6px)'
  ctx.font = `700 ${Math.round(w * 0.24)}px "Space Grotesk", system-ui, sans-serif`
  ctx.fillText('225', w * 0.5, h * 0.30)
  ctx.font = `700 ${Math.round(w * 0.052)}px "Space Grotesk", system-ui, sans-serif`
  ctx.fillText('LB', w * 0.5, h * 0.43)
  ctx.restore()
}

function uploadStamp(context: WebGLRenderingContext) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  drawStamp(canvas)

  const texture = context.createTexture()
  if (!texture) return null
  context.bindTexture(context.TEXTURE_2D, texture)
  context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, 1)
  context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR)
  context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR)
  context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE)
  context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE)
  context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, canvas)
  context.generateMipmap(context.TEXTURE_2D)
  context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR_MIPMAP_LINEAR)
  return texture
}

function currentBufferScale() {
  return plateBufferScale(
    window.devicePixelRatio || 1,
    navigator.hardwareConcurrency ?? 8,
    window.innerWidth,
  )
}

function resizeBuffer() {
  const host = mount.value
  if (!host || !canvasEl || !gl) return
  dpr = currentBufferScale()
  const width = Math.max(1, Math.round((host.clientWidth || 1) * dpr))
  const height = Math.max(1, Math.round((host.clientHeight || 1) * dpr))
  if (width === bufW && height === bufH) return
  canvasEl.width = width
  canvasEl.height = height
  bufW = width
  bufH = height
  gl.viewport(0, 0, width, height)
}

function renderFrame(now: number) {
  if (!gl || !program || !uniforms) return

  const elapsed = reduceMotion ? 4000 : Math.max(0, now - startedAt)
  const phase = platePhaseAt(elapsed, reduceMotion)
  resizeBuffer()

  gl.uniform2f(uniforms.uRes, bufW, bufH)
  gl.uniform4f(uniforms.uPhase, now * 0.001, phase.pour, phase.stamp, phase.squash)
  gl.uniform4f(uniforms.uLife, phase.settle, phase.shock, phase.live, 0)
  gl.uniform2f(uniforms.uRot, rotX, rotY)
  gl.uniform1i(uniforms.uStamp, 0)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
}

function applyTilt(now: number, live: number) {
  if (reduceMotion) {
    targetRotX = PLATE_REST_TILT.rotX
    targetRotY = PLATE_REST_TILT.rotY
    rotX = targetRotX
    rotY = targetRotY
    return
  }

  const mouse = useSharedMouse().latest
  const pointer = platePointerTilt(
    mouse.hasPointer ? mouse.mx : 0,
    mouse.hasPointer ? mouse.my : 0,
  )
  const sway = plateIdleSway(now - startedAt, live)
  targetRotX = pointer.rotX + sway.rotX
  targetRotY = pointer.rotY + sway.rotY
  rotX += (targetRotX - rotX) * 0.07
  rotY += (targetRotY - rotY) * 0.07
}

function frame(now: number) {
  if (!running || !gl || !program) {
    rafId = 0
    running = false
    return
  }

  rafId = requestAnimationFrame(frame)
  const phase = platePhaseAt(Math.max(0, now - startedAt), reduceMotion)
  applyTilt(now, phase.live)
  renderFrame(now)
}

function startLoop() {
  if (running || disposed || document.hidden || reduceMotion) return
  running = true
  rafId = requestAnimationFrame(frame)
}

function stopLoop() {
  running = false
  if (rafId) cancelAnimationFrame(rafId)
  rafId = 0
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

  const context = (canvas.getContext('webgl2', attrs) as WebGLRenderingContext | null)
    ?? (canvas.getContext('webgl', attrs) as WebGLRenderingContext | null)

  if (!context) {
    contextBroken = true
    return
  }

  const vs = compile(context, context.VERTEX_SHADER, vertexSource)
  const fs = compile(context, context.FRAGMENT_SHADER, fragmentSource)
  const prog = vs && fs ? context.createProgram() : null

  if (!vs || !fs || !prog) {
    if (vs) context.deleteShader(vs)
    if (fs) context.deleteShader(fs)
    contextBroken = true
    return
  }

  context.attachShader(prog, vs)
  context.attachShader(prog, fs)
  context.linkProgram(prog)
  context.deleteShader(vs)
  context.deleteShader(fs)

  if (!context.getProgramParameter(prog, context.LINK_STATUS)) {
    if (import.meta.dev) console.error('[ForgedPrPlate]', context.getProgramInfoLog(prog))
    context.deleteProgram(prog)
    contextBroken = true
    return
  }

  gl = context
  canvasEl = canvas
  program = prog
  loseContext = context.getExtension('WEBGL_lose_context')
  host.appendChild(canvas)
  host.classList.add('is-live')

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
    uPhase: context.getUniformLocation(prog, 'uPhase'),
    uLife: context.getUniformLocation(prog, 'uLife'),
    uRot: context.getUniformLocation(prog, 'uRot'),
    uStamp: context.getUniformLocation(prog, 'uStamp'),
  }

  stampTex = uploadStamp(context)
  context.activeTexture(context.TEXTURE0)
  context.bindTexture(context.TEXTURE_2D, stampTex)

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
  startedAt = performance.now()
  disposed = false
  resizeBuffer()

  if (reduceMotion) {
    applyTilt(startedAt, 0)
    renderFrame(startedAt)
    return
  }

  startLoop()

  const fonts = document.fonts
  if (fonts?.ready) {
    fonts.ready.then(() => {
      if (!gl || disposed || !stampTex) return
      gl.deleteTexture(stampTex)
      stampTex = uploadStamp(gl)
      gl.bindTexture(gl.TEXTURE_2D, stampTex)
      if (reduceMotion) renderFrame(performance.now())
    }).catch(() => {})
  }
}

function disposeScene() {
  stopLoop()

  if (canvasEl && onContextLost) {
    canvasEl.removeEventListener('webglcontextlost', onContextLost)
  }
  onContextLost = null

  if (gl) {
    if (stampTex) gl.deleteTexture(stampTex)
    if (buffer) gl.deleteBuffer(buffer)
    if (program) gl.deleteProgram(program)
    if (!contextBroken) loseContext?.loseContext()
  }
  canvasEl?.remove()
  mount.value?.classList.remove('is-live')

  gl = null
  canvasEl = null
  program = null
  buffer = null
  stampTex = null
  uniforms = null
  loseContext = null
  disposed = true
  bufW = 0
  bufH = 0
}

function syncVisibility() {
  if (!intersecting || document.hidden) {
    stopLoop()
    if (!intersecting && !disposed) disposeScene()
    return
  }

  if (disposed) init()
  else if (!reduceMotion) startLoop()
}

onMounted(() => {
  const host = mount.value
  if (!host) return

  motionMql = window.matchMedia('(prefers-reduced-motion: reduce)')
  reduceMotion = motionMql.matches
  onMotionChange = (event: MediaQueryListEvent) => {
    reduceMotion = event.matches
    if (reduceMotion) {
      stopLoop()
      if (!disposed && gl) {
        applyTilt(performance.now(), 0)
        renderFrame(performance.now())
      }
      return
    }
    if (intersecting && !document.hidden) {
      if (disposed) init()
      else startLoop()
    }
  }
  motionMql.addEventListener('change', onMotionChange)

  dpr = currentBufferScale()

  io = new IntersectionObserver(
    (entries) => {
      const entry = entries[entries.length - 1]
      intersecting = Boolean(entry?.isIntersecting)
      syncVisibility()
    },
    { rootMargin: '80px 0px', threshold: 0.12 },
  )
  io.observe(host)

  onVisibility = () => {
    if (document.hidden) stopLoop()
    else syncVisibility()
  }
  document.addEventListener('visibilitychange', onVisibility)

  resizeObserver = new ResizeObserver(() => {
    if (resizeTimer) clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      bufW = 0
      bufH = 0
      resizeBuffer()
      if (reduceMotion && !disposed) renderFrame(performance.now())
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
  if (motionMql && onMotionChange) {
    motionMql.removeEventListener('change', onMotionChange)
  }
  motionMql = null
  onMotionChange = null
  stopLoop()
  disposeScene()
})
</script>

<template>
  <div ref="mount" class="forged-pr-plate" aria-hidden="true">
    <svg class="forged-pr-plate-fallback" viewBox="0 0 200 200" focusable="false">
      <defs>
        <radialGradient id="forged-plate-face" cx="36%" cy="30%" r="72%">
          <stop offset="0%" stop-color="#d7e0cc" />
          <stop offset="28%" stop-color="#8b9480" />
          <stop offset="58%" stop-color="#2a2e26" />
          <stop offset="100%" stop-color="#080908" />
        </radialGradient>
        <linearGradient id="forged-plate-rim" x1="8%" y1="0%" x2="92%" y2="100%">
          <stop offset="0%" stop-color="#e8ff6a" />
          <stop offset="22%" stop-color="#f4f7ef" />
          <stop offset="48%" stop-color="#7a8188" />
          <stop offset="72%" stop-color="#ff4d73" />
          <stop offset="100%" stop-color="#c8ff3a" />
        </linearGradient>
        <filter id="forged-plate-stamp" x="-20%" y="-20%" width="140%" height="140%">
          <feOffset dx="0" dy="1" in="SourceAlpha" result="off" />
          <feGaussianBlur stdDeviation="1.2" in="off" result="blur" />
          <feComposite in="blur" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="inner" />
          <feColorMatrix
            in="inner"
            type="matrix"
            values="0 0 0 0 0.08  0 0 0 0 0.12  0 0 0 0 0.04  0 0 0 0.85 0"
          />
        </filter>
      </defs>
      <circle cx="100" cy="104" r="78" fill="rgba(204,255,0,0.08)" />
      <circle cx="108" cy="108" r="70" fill="rgba(255,45,85,0.07)" />
      <circle cx="100" cy="100" r="86" fill="url(#forged-plate-face)" stroke="url(#forged-plate-rim)" stroke-width="13" />
      <circle cx="100" cy="100" r="78" fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="1.2" />
      <circle cx="100" cy="100" r="22" fill="none" stroke="#9aa394" stroke-width="4" />
      <circle cx="100" cy="100" r="16" fill="#050505" />
      <text
        x="100"
        y="78"
        text-anchor="middle"
        fill="#1b2014"
        font-family="Space Grotesk, system-ui, sans-serif"
        font-size="34"
        font-weight="700"
        filter="url(#forged-plate-stamp)"
      >225</text>
      <text
        x="100"
        y="96"
        text-anchor="middle"
        fill="#3d4534"
        font-family="Space Grotesk, system-ui, sans-serif"
        font-size="8"
        font-weight="700"
        letter-spacing="0.18em"
      >LB</text>
    </svg>
  </div>
</template>

<style scoped>
.forged-pr-plate {
  position: absolute;
  inset: 0;
  pointer-events: none;
  contain: layout style;
}

.forged-pr-plate-fallback {
  position: absolute;
  inset: 6%;
  width: 88%;
  height: 88%;
  display: block;
}

.forged-pr-plate :deep(canvas) {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  opacity: 0;
}

.forged-pr-plate.is-live .forged-pr-plate-fallback {
  opacity: 0;
}

.forged-pr-plate.is-live :deep(canvas) {
  opacity: 1;
  transition: opacity 420ms cubic-bezier(0.16, 1, 0.3, 1);
}

@media (prefers-reduced-motion: reduce) {
  .forged-pr-plate.is-live :deep(canvas) {
    transition: none;
  }
}
</style>
