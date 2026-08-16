<script setup lang="ts">
// Look-through QR: a locked stencil over an analytic gym interior.
//
// The QR pattern does not parallax. Only the room does. That lock is what
// makes the card a window instead of a wobbling decal.
//
// The gym is a box you are already inside. Walls, floor, machines and neon
// tubes are slab / capsule hits — no sphere marching, no step budget.
//
// Lifecycle contract matches MergePrismCore:
//   • never initializes under prefers-reduced-motion
//   • creates a new canvas each init (a lost context stays dead)
//   • disposes when the host leaves the viewport
//   • pauses while the document is hidden
import { onBeforeUnmount, onMounted, ref } from 'vue'

const emit = defineEmits<{
  looked: []
}>()

const props = withDefaults(defineProps<{
  dprCap?: number
}>(), {
  dprCap: 1.25,
})

const mount = ref<HTMLElement | null>(null)

const QR_SRC = '/uploads/qr-code.webp'
const LOOK_MAX = 0.35
const POINTER_GAIN = 0.24
const IDLE_YAW = 0.11
const IDLE_PITCH = 0.07
const LOOKED_EPS2 = 0.01

let gl: WebGLRenderingContext | null = null
let canvasEl: HTMLCanvasElement | null = null
let program: WebGLProgram | null = null
let buffer: WebGLBuffer | null = null
let qrTexture: WebGLTexture | null = null
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
let qrImage: HTMLImageElement | null = null

let lastFrame = 0
let dpr = 1
let bufW = 0
let bufH = 0
let qrReady = 0
let approach = 0
let approachTarget = 0
let lookedEmitted = false

const look = {
  pointerX: 0,
  pointerY: 0,
  yaw: 0,
  pitch: 0,
  dragging: false,
  activeId: -1,
}

type Uniforms = {
  uRes: WebGLUniformLocation | null
  uLook: WebGLUniformLocation | null
  uQR: WebGLUniformLocation | null
  uQRReady: WebGLUniformLocation | null
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
  uniform vec4 uLook;
  uniform sampler2D uQR;
  uniform float uQRReady;

  #define uYaw      uLook.x
  #define uPitch    uLook.y
  #define uApproach uLook.z
  #define uTime     uLook.w

  const float BIG = 1.0e9;
  const vec3 LIME = vec3(0.80, 1.00, 0.00);
  const vec3 RED  = vec3(1.00, 0.18, 0.33);

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  vec3 rotateX(vec3 v, float a) {
    float c = cos(a);
    float s = sin(a);
    return vec3(v.x, c * v.y - s * v.z, s * v.y + c * v.z);
  }

  vec3 rotateY(vec3 v, float a) {
    float c = cos(a);
    float s = sin(a);
    return vec3(c * v.x + s * v.z, v.y, -s * v.x + c * v.z);
  }

  bool boxHit(vec3 ro, vec3 rd, vec3 bmin, vec3 bmax, out float tN, out float tF, out vec3 nN, out vec3 nF) {
    vec3 inv = 1.0 / rd;
    vec3 t0 = (bmin - ro) * inv;
    vec3 t1 = (bmax - ro) * inv;
    vec3 tsm = min(t0, t1);
    vec3 tlg = max(t0, t1);
    tN = max(max(tsm.x, tsm.y), tsm.z);
    tF = min(min(tlg.x, tlg.y), tlg.z);
    nN = vec3(0.0);
    nF = vec3(0.0);
    if (tN > tF) return false;

    nN = -sign(rd) * vec3(
      step(tsm.y, tsm.x) * step(tsm.z, tsm.x),
      step(tsm.x, tsm.y) * step(tsm.z, tsm.y),
      step(tsm.x, tsm.z) * step(tsm.y, tsm.z)
    );
    nF = sign(rd) * vec3(
      step(tlg.x, tlg.y) * step(tlg.x, tlg.z),
      step(tlg.y, tlg.x) * step(tlg.y, tlg.z),
      step(tlg.z, tlg.x) * step(tlg.z, tlg.y)
    );
    return true;
  }

  float capHit(vec3 ro, vec3 rd, vec3 pa, vec3 pb, float r) {
    vec3 ba = pb - pa;
    vec3 oa = ro - pa;
    float baba = dot(ba, ba);
    float bard = dot(ba, rd);
    float baoa = dot(ba, oa);
    float rdoa = dot(rd, oa);
    float oaoa = dot(oa, oa);
    float a = max(baba - bard * bard, 1.0e-6);
    float b = baba * rdoa - baoa * bard;
    float c = baba * oaoa - baoa * baoa - r * r * baba;
    float h = b * b - a * c;
    if (h < 0.0) return BIG;
    float t = (-b - sqrt(h)) / a;
    float y = baoa + t * bard;
    if (t > 0.0 && y > 0.0 && y < baba) return t;
    vec3 oc = y <= 0.0 ? oa : ro - pb;
    b = dot(rd, oc);
    c = dot(oc, oc) - r * r;
    h = b * b - c;
    if (h < 0.0) return BIG;
    t = -b - sqrt(h);
    return t > 0.0 ? t : BIG;
  }

  vec3 capNormal(vec3 p, vec3 pa, vec3 pb) {
    vec3 ba = pb - pa;
    float u = clamp(dot(p - pa, ba) / dot(ba, ba), 0.0, 1.0);
    return normalize(p - (pa + ba * u));
  }

  float finder(vec2 cell, vec2 origin) {
    vec2 d = abs(cell - origin - 3.0);
    float m = max(d.x, d.y);
    if (m > 3.5) return -1.0;
    if (m >= 2.5) return 0.0;
    if (m >= 1.5) return 1.0;
    return 0.0;
  }

  float proceduralQR(vec2 uv) {
    float n = 25.0;
    float q = 4.0;
    float cells = n + q * 2.0;
    vec2 p = uv * cells;
    vec2 cell = floor(p);
    vec2 local = cell - q;
    if (min(local.x, local.y) < 0.0 || max(local.x, local.y) >= n) return 1.0;

    float f = finder(local, vec2(0.0));
    if (f < 0.0) f = finder(local, vec2(n - 7.0, 0.0));
    if (f < 0.0) f = finder(local, vec2(0.0, n - 7.0));
    if (f >= 0.0) return f;

    float timing = 0.0;
    if (abs(local.y - 6.0) < 0.5 && local.x > 7.0 && local.x < n - 8.0) {
      timing = 1.0;
    }
    if (abs(local.x - 6.0) < 0.5 && local.y > 7.0 && local.y < n - 8.0) {
      timing = 1.0;
    }
    if (timing > 0.5) return mod(local.x + local.y, 2.0) < 0.5 ? 0.0 : 1.0;

    float h = hash(local + 17.3);
    return step(0.46, h);
  }

  vec3 shadeFloor(vec3 p) {
    vec2 g = abs(fract(p.xz * 0.72) - 0.5);
    float line = 1.0 - smoothstep(0.018, 0.038, min(g.x, g.y));
    float fade = exp(-length(p.xz) * 0.16);
    vec3 col = vec3(0.028, 0.032, 0.018);
    col += LIME * line * fade * 0.72;
    return col;
  }

  vec3 shadeWall(vec3 p, vec3 n) {
    vec3 col = vec3(0.016, 0.018, 0.012);
    col += LIME * pow(max(dot(n, normalize(vec3(-0.35, 0.72, 0.48))), 0.0), 4.0) * 0.10;
    col += RED * pow(max(dot(n, normalize(vec3(0.82, 0.12, 0.22))), 0.0), 3.0) * 0.16;
    float strip = smoothstep(0.92, 1.0, sin(p.y * 7.5 + p.x * 1.4));
    col += vec3(0.10, 0.14, 0.06) * strip * 0.22;
    return col;
  }

  vec3 shadeMetal(vec3 p, vec3 n, vec3 rd) {
    float spec = pow(max(dot(reflect(rd, n), normalize(vec3(-0.2, 0.8, 0.5))), 0.0), 28.0);
    vec3 col = vec3(0.055, 0.058, 0.062);
    col += LIME * spec * 0.55;
    col += RED * pow(max(n.x, 0.0), 2.0) * 0.08;
    col += vec3(0.04) * max(n.y, 0.0);
    return col + 0.012 * hash(p.xy * 40.0);
  }

  void considerCap(vec3 ro, vec3 rd, vec3 pa, vec3 pb, float r, inout float tHit, inout vec3 nHit, inout float kind) {
    float t = capHit(ro, rd, pa, pb, r);
    if (t < tHit) {
      tHit = t;
      nHit = capNormal(ro + rd * t, pa, pb);
      kind = 2.0;
    }
  }

  void considerBox(vec3 ro, vec3 rd, vec3 bmin, vec3 bmax, float nextKind, inout float tHit, inout vec3 nHit, inout float kind) {
    float tN;
    float tF;
    vec3 nN;
    vec3 nF;
    if (!boxHit(ro, rd, bmin, bmax, tN, tF, nN, nF)) return;
    if (tN > 0.0 && tN < tHit) {
      tHit = tN;
      nHit = nN;
      kind = nextKind;
    }
  }

  vec3 shadeGym(vec3 ro, vec3 rd) {
    vec3 roomMin = vec3(-2.55, -1.22, -7.15);
    vec3 roomMax = vec3( 2.55,  1.68,  0.95);

    float tN;
    float tF;
    vec3 nN;
    vec3 nF;
    if (!boxHit(ro, rd, roomMin, roomMax, tN, tF, nN, nF) || tF < 0.0) {
      return vec3(0.01, 0.012, 0.008);
    }

    float tHit = tF;
    vec3 nHit = -nF;
    float kind = nHit.y > 0.7 ? 0.0 : 1.0;

    considerBox(ro, rd, vec3(-1.55, -1.22, -5.35), vec3(-0.55, -0.28, -4.45), 3.0, tHit, nHit, kind);
    considerBox(ro, rd, vec3( 0.72, -1.22, -5.15), vec3( 1.58,  0.42, -4.38), 3.0, tHit, nHit, kind);
    considerBox(ro, rd, vec3( 0.86,  0.02, -4.37), vec3( 1.44,  0.36, -4.30), 4.0, tHit, nHit, kind);

    considerCap(ro, rd, vec3(-1.85, -1.18, -6.88), vec3(-1.85, 1.42, -6.88), 0.048, tHit, nHit, kind);
    considerCap(ro, rd, vec3(-0.62, -1.18, -6.88), vec3(-0.62, 1.42, -6.88), 0.048, tHit, nHit, kind);
    considerCap(ro, rd, vec3( 0.62, -1.18, -6.88), vec3( 0.62, 1.42, -6.88), 0.048, tHit, nHit, kind);
    considerCap(ro, rd, vec3( 1.85, -1.18, -6.88), vec3( 1.85, 1.42, -6.88), 0.048, tHit, nHit, kind);

    vec3 p = ro + rd * tHit;
    vec3 col;
    if (kind > 3.5) {
      float scan = 0.55 + 0.45 * sin(p.y * 42.0 + uTime * 3.2);
      col = LIME * (0.55 + scan * 0.55);
    } else if (kind > 2.5) {
      col = shadeMetal(p, nHit, rd);
    } else if (kind > 1.5) {
      col = LIME * 1.35;
    } else if (kind < 0.5) {
      col = shadeFloor(p);
    } else {
      col = shadeWall(p, nHit);
    }

    // Neon fill even when the ray misses a tube: cheap glow from the four axes.
    float glow = 0.0;
    glow += 0.018 / (0.012 + length(vec2(p.x + 1.85, p.z + 6.88)));
    glow += 0.018 / (0.012 + length(vec2(p.x + 0.62, p.z + 6.88)));
    glow += 0.018 / (0.012 + length(vec2(p.x - 0.62, p.z + 6.88)));
    glow += 0.018 / (0.012 + length(vec2(p.x - 1.85, p.z + 6.88)));
    col += LIME * glow * 0.55;

    float fog = 1.0 - exp(-tHit * 0.11);
    col = mix(col, vec3(0.012, 0.018, 0.008), fog);
    return col;
  }

  void main() {
    vec2 qrUv = gl_FragCoord.xy / uRes;
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);

    vec3 ro = vec3(0.0, 0.06, mix(0.28, 0.04, uApproach));
    vec3 rd = normalize(vec3(uv.x, uv.y, -1.28));
    rd = rotateY(rotateX(rd, uPitch), uYaw);

    vec3 gym = shadeGym(ro, rd);
    gym = 1.0 - exp(-gym * 1.25);

    float qr = uQRReady > 0.5
      ? texture2D(uQR, qrUv).r
      : proceduralQR(qrUv);
    float window = smoothstep(0.34, 0.62, qr);

    vec3 ink = vec3(0.035, 0.035, 0.038);
    ink += (hash(qrUv * 380.0) - 0.5) * 0.03;
    vec3 col = mix(ink, gym, window);
    col = clamp(col, 0.0, 1.0);

    gl_FragColor = vec4(col, 1.0);
  }
`

function compile(context: WebGLRenderingContext, type: number, source: string) {
  const shader = context.createShader(type)
  if (!shader) return null
  context.shaderSource(shader, source)
  context.compileShader(shader)
  if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
    if (import.meta.dev) console.error('[QrPortalCore]', context.getShaderInfoLog(shader))
    context.deleteShader(shader)
    return null
  }
  return shader
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v))
}

function localNorm(event: PointerEvent) {
  const host = mount.value
  if (!host) return { x: 0, y: 0 }
  const rect = host.getBoundingClientRect()
  const w = Math.max(rect.width, 1)
  const h = Math.max(rect.height, 1)
  return {
    x: clamp(((event.clientX - rect.left) / w) * 2 - 1, -1, 1),
    y: clamp(-(((event.clientY - rect.top) / h) * 2 - 1), -1, 1),
  }
}

function hasFinePointer() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

function considerLooked(x: number, y: number) {
  if (lookedEmitted) return
  if (x * x + y * y <= LOOKED_EPS2) return
  lookedEmitted = true
  emit('looked')
}

function setPointer(x: number, y: number) {
  look.pointerX = x
  look.pointerY = y
  considerLooked(x, y)
}

function clearPointer() {
  look.pointerX = 0
  look.pointerY = 0
}

function onPointerMove(event: PointerEvent) {
  if (hasFinePointer()) {
    const { x, y } = localNorm(event)
    setPointer(x, y)
    return
  }
  if (!look.dragging || event.pointerId !== look.activeId) return
  event.preventDefault()
  const { x, y } = localNorm(event)
  setPointer(x, y)
}

function onPointerDown(event: PointerEvent) {
  if (hasFinePointer()) return
  look.dragging = true
  look.activeId = event.pointerId
  mount.value?.setPointerCapture?.(event.pointerId)
  const { x, y } = localNorm(event)
  setPointer(x, y)
}

function onPointerUp(event: PointerEvent) {
  if (event.pointerId !== look.activeId && look.activeId !== -1) return
  look.dragging = false
  look.activeId = -1
  if (!hasFinePointer()) clearPointer()
}

function onPointerLeave() {
  if (look.dragging) return
  clearPointer()
}

function bindPointer() {
  const host = mount.value
  if (!host) return
  host.addEventListener('pointermove', onPointerMove, { passive: false })
  host.addEventListener('pointerdown', onPointerDown, { passive: true })
  host.addEventListener('pointerup', onPointerUp, { passive: true })
  host.addEventListener('pointercancel', onPointerUp, { passive: true })
  host.addEventListener('pointerleave', onPointerLeave, { passive: true })
}

function unbindPointer() {
  const host = mount.value
  if (!host) return
  host.removeEventListener('pointermove', onPointerMove)
  host.removeEventListener('pointerdown', onPointerDown)
  host.removeEventListener('pointerup', onPointerUp)
  host.removeEventListener('pointercancel', onPointerUp)
  host.removeEventListener('pointerleave', onPointerLeave)
}

function uploadQr(image: HTMLImageElement) {
  if (!gl || !qrTexture) return
  gl.bindTexture(gl.TEXTURE_2D, qrTexture)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  qrReady = 1
}

function primeQrTexture() {
  if (!gl) return
  qrTexture = gl.createTexture()
  if (!qrTexture) return
  gl.bindTexture(gl.TEXTURE_2D, qrTexture)
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([255, 255, 255, 255]),
  )
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

  const image = new Image()
  qrImage = image
  image.onload = () => {
    if (qrImage !== image) return
    uploadQr(image)
  }
  image.onerror = () => {
    if (qrImage !== image) return
    qrReady = 0
  }
  image.src = QR_SRC
}

function resizeBuffer() {
  const host = mount.value
  if (!host || !canvasEl || !gl) return
  const width = Math.max(1, Math.round((host.clientWidth || 1) * dpr))
  const height = Math.max(1, Math.round((host.clientHeight || 1) * dpr))
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
    alpha: false,
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
    if (import.meta.dev) console.error('[QrPortalCore]', context.getProgramInfoLog(prog))
    context.deleteProgram(prog)
    contextBroken = true
    return
  }

  gl = context
  canvasEl = canvas
  program = prog
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
    uLook: context.getUniformLocation(prog, 'uLook'),
    uQR: context.getUniformLocation(prog, 'uQR'),
    uQRReady: context.getUniformLocation(prog, 'uQRReady'),
  }

  context.disable(context.DEPTH_TEST)
  context.disable(context.BLEND)
  context.clearColor(0.04, 0.04, 0.04, 1)

  primeQrTexture()
  context.uniform1i(uniforms.uQR, 0)

  onContextLost = (event: Event) => {
    event.preventDefault()
    contextBroken = true
    stopLoop()
    disposeScene()
  }
  canvas.addEventListener('webglcontextlost', onContextLost, false)

  bufW = 0
  bufH = 0
  lastFrame = 0
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
  qrImage = null

  if (gl) {
    if (qrTexture) gl.deleteTexture(qrTexture)
    if (buffer) gl.deleteBuffer(buffer)
    if (program) gl.deleteProgram(program)
    if (!contextBroken) loseContext?.loseContext()
  }
  canvasEl?.remove()

  gl = null
  canvasEl = null
  program = null
  buffer = null
  qrTexture = null
  uniforms = null
  loseContext = null
  disposed = true
  qrReady = 0
  bufW = 0
  bufH = 0
}

function releaseField() {
  stopLoop()
  disposeScene()
  contextBroken = false
}

function watchArmed() {
  watching = false
  rafId = 0
  if (!intersecting || document.hidden) return

  if (disposed) init()
  if (!disposed) {
    startLoop()
    return
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

  rafId = requestAnimationFrame(frame)

  const dt = (lastFrame === 0 ? 16 : Math.min(now - lastFrame, 48)) * 0.001
  lastFrame = now
  const t = now * 0.001
  const ease = 1 - Math.exp(-dt * 8)

  const idleYaw = Math.sin(t * 0.4) * IDLE_YAW
  const idlePitch = Math.cos(t * 0.31) * IDLE_PITCH
  const targetYaw = clamp(idleYaw - look.pointerX * POINTER_GAIN, -LOOK_MAX, LOOK_MAX)
  const targetPitch = clamp(idlePitch + look.pointerY * POINTER_GAIN, -LOOK_MAX, LOOK_MAX)
  look.yaw += (targetYaw - look.yaw) * ease
  look.pitch += (targetPitch - look.pitch) * ease
  approach += (approachTarget - approach) * ease

  resizeBuffer()

  if (qrTexture) {
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, qrTexture)
  }

  gl.uniform2f(uniforms.uRes, bufW, bufH)
  gl.uniform4f(uniforms.uLook, look.yaw, look.pitch, approach, t)
  gl.uniform1f(uniforms.uQRReady, qrReady)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
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

onMounted(() => {
  const host = mount.value
  if (!host) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const cores = navigator.hardwareConcurrency ?? 8
  const cap = cores <= 4 ? 1 : (window.innerWidth <= 768 ? 1.5 : props.dprCap)
  dpr = Math.min(window.devicePixelRatio || 1, cap)

  bindPointer()

  io = new IntersectionObserver(
    (entries) => {
      const entry = entries[entries.length - 1]
      intersecting = Boolean(entry?.isIntersecting)
      approachTarget = intersecting ? clamp(entry?.intersectionRatio ?? 0, 0, 1) : 0
      if (intersecting) startWatch()
      else releaseField()
    },
    { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] },
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
  unbindPointer()
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
  <div
    ref="mount"
    class="qr-portal-core"
    aria-hidden="true"
  />
</template>

<style scoped>
.qr-portal-core {
  position: absolute;
  inset: 0;
  z-index: 2;
  touch-action: none;
  pointer-events: auto;
  contain: layout paint style;
}

.qr-portal-core :deep(canvas) {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .qr-portal-core {
    display: none;
  }
}
</style>
