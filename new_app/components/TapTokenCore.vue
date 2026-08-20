<script setup lang="ts">
// Refractive glass NFC tap-token for the scan section.
//
// Same bet as MergePrismCore: the body is convex, so every hit is analytic
// (sphere + cylinder + slab), no sphere tracing, no step budget. The coil and
// the LIFTAG mark live on a flat picture inside the glass. A ray goes in,
// bends, samples that picture, hits the metal back, and bends out.
//
// Dispersion is rim-only. A full-body RGB split would make this Crystal Two;
// a coin has to stay a coin in a still frame.
//
// Sharpness: the canvas tracks native DPR (2.5 on phones, 1.25 on desktop).
// iOS reports 4 cores on every iPhone, so width is checked before core count.
// The loop stays at 60fps; the token idle-spins and can be dragged.
//
// Lifecycle matches the crystal:
//   • never initializes under prefers-reduced-motion (CSS still instead)
//   • new canvas each init (a lost context cannot be revived)
//   • full dispose when the token leaves the viewport
//   • pause while the document is hidden
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { TOKEN_DESKTOP_DPR_CAP, tokenBufferScale } from '../utils/tapToken'

const props = withDefaults(defineProps<{
  dprCap?: number
}>(), {
  dprCap: TOKEN_DESKTOP_DPR_CAP,
})

const mount = ref<HTMLElement | null>(null)
const reduceMotion = ref(false)
const hintGone = ref(false)
const coarsePointer = ref(false)
const stillUrl = ref('')

const IOR = 1.52
const CAM_Z = 3.2
const FOCAL = 1.38
const LOOK_MAX = 0.38
const POINTER_GAIN = 0.55
const IDLE_YAW = 0.22
const IDLE_PITCH = 0.10

let gl: WebGLRenderingContext | null = null
let canvasEl: HTMLCanvasElement | null = null
let program: WebGLProgram | null = null
let buffer: WebGLBuffer | null = null
let decalTex: WebGLTexture | null = null
let loseContext: WEBGL_lose_context | null = null

let rafId = 0
let running = false
let intersecting = false
let disposed = true
let contextBroken = false
let io: IntersectionObserver | null = null
let resizeObserver: ResizeObserver | null = null
let resizeTimer: ReturnType<typeof setTimeout> | null = null
let onVisibility: (() => void) | null = null
let onContextLost: ((e: Event) => void) | null = null

let lastFrame = 0
let dpr = 1
let bufW = 0
let bufH = 0
let timeSec = 0

const look = { yaw: 0, pitch: 0.08 }
const lookTarget = { yaw: 0, pitch: 0.08 }
let spinVel = 0
let dragging = false
let hovering = false
let lastPtrX = 0
let lastPtrY = 0
let hostRect: DOMRect | null = null

type Uniforms = {
  uRes: WebGLUniformLocation | null
  uLook: WebGLUniformLocation | null
  uDecal: WebGLUniformLocation | null
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
  uniform vec4 uLook; // yaw, pitch, time, unused
  uniform sampler2D uDecal;

  #define uYaw   uLook.x
  #define uPitch uLook.y
  #define uTime  uLook.z

  const float BIG = 1.0e9;
  const float CYL_R = 1.0;
  const float SLAB_H = 0.20;
  const float SPH_R = 1.085;
  const float DECAL_Z = 0.03;
  const float METAL_Z = -0.11;
  const float DECAL_R = 0.86;
  const float IOR = ${IOR.toFixed(3)};
  const float CAM_Z = ${CAM_Z.toFixed(2)};
  const float FOCAL = ${FOCAL.toFixed(2)};

  const vec3 LIME = vec3(0.80, 1.00, 0.00);
  const vec3 RED  = vec3(1.00, 0.18, 0.33);

  struct Span {
    float tN;
    float tF;
    vec3 nN;
    vec3 nF;
  };

  float pow5(float x) {
    float a = x * x;
    return a * a * x;
  }

  float pow8(float x) {
    float a = x * x;
    a = a * a;
    return a * a;
  }

  float pow16(float x) {
    float a = pow8(x);
    return a * a;
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
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

  void slab(vec3 n, float s, vec3 ro, vec3 rd, inout Span span) {
    float b = dot(n, rd);
    float a = dot(n, ro);

    if (abs(b) < 1.0e-6) {
      if (abs(a) > s) {
        span.tN = BIG;
        span.tF = -BIG;
      }
      return;
    }

    float inv = 1.0 / b;
    float t1 = (-s - a) * inv;
    float t2 = (s - a) * inv;
    vec3 n1 = -n;
    vec3 n2 = n;

    if (t1 > t2) {
      float tt = t1;
      t1 = t2;
      t2 = tt;
      vec3 nt = n1;
      n1 = n2;
      n2 = nt;
    }

    if (t1 > span.tN) {
      span.tN = t1;
      span.nN = n1;
    }
    if (t2 < span.tF) {
      span.tF = t2;
      span.nF = n2;
    }
  }

  // Convex coin: sphere ∩ cylinder ∩ slab. One interval intersection.
  Span traceCoin(vec3 ro, vec3 rd) {
    Span span;
    span.tN = -BIG;
    span.tF = BIG;
    span.nN = vec3(0.0, 0.0, 1.0);
    span.nF = vec3(0.0, 0.0, -1.0);

    float b = dot(ro, rd);
    float c = dot(ro, ro) - SPH_R * SPH_R;
    float h = b * b - c;
    if (h < 0.0) {
      span.tN = BIG;
      span.tF = -BIG;
      return span;
    }
    h = sqrt(h);
    span.tN = -b - h;
    span.nN = (ro + rd * span.tN) / SPH_R;
    span.tF = -b + h;
    span.nF = (ro + rd * span.tF) / SPH_R;

    float A = rd.x * rd.x + rd.y * rd.y;
    if (A < 1.0e-8) {
      if (ro.x * ro.x + ro.y * ro.y > CYL_R * CYL_R) {
        span.tN = BIG;
        span.tF = -BIG;
        return span;
      }
    } else {
      float B = ro.x * rd.x + ro.y * rd.y;
      float Cyl = ro.x * ro.x + ro.y * ro.y - CYL_R * CYL_R;
      float d = B * B - A * Cyl;
      if (d < 0.0) {
        span.tN = BIG;
        span.tF = -BIG;
        return span;
      }
      d = sqrt(d);
      float invA = 1.0 / A;
      float t1 = (-B - d) * invA;
      float t2 = (-B + d) * invA;
      vec3 n1 = vec3(ro.x + rd.x * t1, ro.y + rd.y * t1, 0.0);
      vec3 n2 = vec3(ro.x + rd.x * t2, ro.y + rd.y * t2, 0.0);
      n1 = normalize(n1);
      n2 = normalize(n2);
      if (t1 > span.tN) {
        span.tN = t1;
        span.nN = n1;
      }
      if (t2 < span.tF) {
        span.tF = t2;
        span.nF = n2;
      }
    }

    slab(vec3(0.0, 0.0, 1.0), SLAB_H, ro, rd, span);
    return span;
  }

  vec3 envSample(vec3 d) {
    vec3 col = mix(vec3(0.012, 0.014, 0.010), vec3(0.045, 0.055, 0.022), d.y * 0.5 + 0.5);
    col += vec3(1.0, 1.0, 0.94) * pow16(max(dot(d, vec3(-0.38, 0.72, 0.58)), 0.0)) * 4.6;
    col += LIME * pow8(max(dot(d, vec3(0.52, 0.42, 0.74)), 0.0)) * 1.85;
    col += RED * pow8(max(dot(d, vec3(0.62, -0.55, 0.56)), 0.0)) * 1.05;
    col += LIME * pow16(max(dot(d, vec3(0.05, -0.82, 0.57)), 0.0)) * 0.85;

    float strip = sin(d.y * 12.0 + d.x * 3.1 + uTime * 0.18);
    float cross = sin(d.x * 9.5 - d.z * 5.4 - uTime * 0.11);
    col += vec3(0.72, 0.92, 0.48) * smoothstep(0.92, 1.0, strip) * 0.95;
    col += vec3(0.86, 0.94, 0.70) * smoothstep(0.94, 1.0, cross) * 0.62;
    return col;
  }

  vec3 shadeMetal(vec3 p, vec3 n, vec3 rd) {
    vec3 r = reflect(rd, n);
    float spec = pow(max(dot(r, normalize(vec3(-0.22, 0.78, 0.58))), 0.0), 28.0);
    vec3 col = vec3(0.10, 0.11, 0.12);
    col += LIME * spec * 1.7;
    col += RED * pow(max(n.x, 0.0), 2.0) * 0.28;
    col += vec3(0.10) * max(n.y, 0.0);
    float grit = hash(p.xy * 48.0) * 0.04;
    return col + grit;
  }

  bool insideDisc(vec3 p, float radius) {
    return dot(p.xy, p.xy) < radius * radius;
  }

  vec4 sampleDecal(vec3 p) {
    vec2 uv = p.xy / DECAL_R * 0.5 + 0.5;
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
      return vec4(0.0);
    }
    return texture2D(uDecal, uv);
  }

  // One channel through the glass. Decal is a translucent print; metal is opaque.
  vec3 glassPath(vec3 p0, vec3 rd, vec3 nEntry, float ior) {
    vec3 dir = refract(rd, nEntry, 1.0 / ior);
    if (dot(dir, dir) < 0.5) return envSample(reflect(rd, nEntry));

    vec3 pos = p0;
    vec3 outDir = dir;
    vec3 printCol = vec3(0.0);
    float printW = 0.0;
    float path = 0.0;
    bool escaped = false;
    bool hitMetal = false;
    vec3 metalCol = vec3(0.0);

    for (int i = 0; i < 3; i++) {
      if (escaped || hitMetal) break;

      vec3 o = pos + dir * 0.0018;
      Span span = traceCoin(o, dir);
      float tExit = max(span.tF, 0.0);
      float tHit = tExit;
      float kind = 0.0;
      vec3 nHit = -span.nF;

      if (abs(dir.z) > 1.0e-5) {
        float tDecal = (DECAL_Z - o.z) / dir.z;
        if (tDecal > 0.002 && tDecal < tHit) {
          vec3 q = o + dir * tDecal;
          if (insideDisc(q, DECAL_R)) {
            tHit = tDecal;
            kind = 1.0;
            nHit = vec3(0.0, 0.0, sign(-dir.z));
          }
        }
        float tMetal = (METAL_Z - o.z) / dir.z;
        if (tMetal > 0.002 && tMetal < tHit) {
          vec3 q = o + dir * tMetal;
          if (insideDisc(q, 0.93)) {
            tHit = tMetal;
            kind = 2.0;
            nHit = vec3(0.0, 0.0, 1.0);
          }
        }
      }

      path += tHit;
      pos = o + dir * tHit;

      if (kind > 1.5) {
        metalCol = shadeMetal(pos, nHit, dir);
        hitMetal = true;
      } else if (kind > 0.5) {
        vec4 decal = sampleDecal(pos);
        printCol += decal.rgb * decal.a;
        printW += decal.a;
        // Keep walking: the print sits in the glass, it does not occlude the back.
      } else {
        vec3 refr = refract(dir, nHit, ior);
        if (dot(refr, refr) > 0.5) {
          outDir = refr;
          escaped = true;
        } else {
          dir = reflect(dir, nHit);
          outDir = dir;
        }
      }
    }

    vec3 tint = exp(-path * vec3(0.22, 0.08, 0.95));
    vec3 col = hitMetal ? metalCol * tint : envSample(outDir) * tint;
    col = mix(col, printCol, clamp(printW, 0.0, 1.0));
    return col;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);

    vec3 ro = rotY(rotX(vec3(0.0, 0.0, CAM_Z), -uPitch), -uYaw);
    vec3 rd = normalize(rotY(rotX(vec3(uv, -FOCAL), -uPitch), -uYaw));

    Span span = traceCoin(ro, rd);
    vec3 col = vec3(0.0);
    float alpha = 0.0;

    if (span.tN < span.tF && span.tF > 0.0) {
      vec3 p = ro + rd * span.tN;
      vec3 n = span.nN;
      float facing = max(dot(-rd, n), 0.0);
      float fres = 0.04 + 0.96 * pow5(1.0 - facing);
      float rim = 1.0 - facing;

      // Rim-only split. Faces stay a single IOR so the still reads as a coin.
      float d = 0.004 + rim * rim * 0.042;
      vec3 refracted = vec3(
        glassPath(p, rd, n, IOR - d).r,
        glassPath(p, rd, n, IOR).g,
        glassPath(p, rd, n, IOR + d).b
      );

      vec3 glass = mix(refracted, envSample(reflect(rd, n)), fres);
      glass += vec3(0.05, 0.07, 0.03) * facing;
      glass += LIME * rim * rim * 0.72;
      glass += RED * pow(max(n.x, 0.0), 2.4) * rim * 0.28;
      glass += vec3(1.0, 1.0, 0.92) * pow(rim, 5.0) * 0.35;

      // Thin-film seasoning on the face, not the whole body.
      float film = 0.5 + 0.5 * sin(facing * 14.0 + uYaw * 6.0 + uPitch * 8.0);
      vec3 slick = mix(LIME, RED, film);
      glass += slick * pow(facing, 4.0) * 0.07;

      float px = 2.0 * CAM_Z / (FOCAL * min(uRes.x, uRes.y));
      float cover = smoothstep(0.0, px * 2.2, span.tF - span.tN);
      col = glass * cover;
      alpha = cover;
    }

    col = 1.0 - exp(-col * 1.12);
    col += (hash(gl_FragCoord.xy + fract(uTime) * 71.3) - 0.5) * 0.008 * alpha;
    col = clamp(col, 0.0, 1.0);

    gl_FragColor = vec4(col, alpha);
  }
`

function compile(context: WebGLRenderingContext, type: number, source: string) {
  const shader = context.createShader(type)
  if (!shader) return null
  context.shaderSource(shader, source)
  context.compileShader(shader)
  if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
    if (import.meta.dev) console.error('[TapTokenCore]', context.getShaderInfoLog(shader))
    context.deleteShader(shader)
    return null
  }
  return shader
}

function drawDecal(size: number) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  const cx = size / 2
  const cy = size / 2

  ctx.clearRect(0, 0, size, size)

  ctx.beginPath()
  ctx.arc(cx, cy, size * 0.495, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(10, 16, 8, 0.78)'
  ctx.fill()

  const turns = 6.25
  const r0 = size * 0.145
  const r1 = size * 0.438
  const steps = 900

  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = 'rgba(92, 42, 14, 0.55)'
  ctx.lineWidth = size * 0.028
  ctx.beginPath()
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const ang = t * turns * Math.PI * 2 - 0.4
    const r = r0 + (r1 - r0) * t
    const x = cx + Math.cos(ang) * r
    const y = cy + Math.sin(ang) * r
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()

  ctx.strokeStyle = '#d4782c'
  ctx.lineWidth = size * 0.016
  ctx.shadowColor = 'rgba(212, 120, 44, 0.55)'
  ctx.shadowBlur = size * 0.012
  ctx.beginPath()
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const ang = t * turns * Math.PI * 2 - 0.4
    const r = r0 + (r1 - r0) * t
    const x = cx + Math.cos(ang) * r
    const y = cy + Math.sin(ang) * r
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()
  ctx.shadowBlur = 0

  const endAng = turns * Math.PI * 2 - 0.4
  ctx.fillStyle = '#e8a056'
  ctx.beginPath()
  ctx.arc(cx + Math.cos(-0.4) * r0, cy + Math.sin(-0.4) * r0, size * 0.016, 0, Math.PI * 2)
  ctx.arc(cx + Math.cos(endAng) * r1, cy + Math.sin(endAng) * r1, size * 0.016, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.arc(cx, cy, size * 0.122, 0, Math.PI * 2)
  ctx.fillStyle = '#070907'
  ctx.fill()
  ctx.lineWidth = size * 0.006
  ctx.strokeStyle = 'rgba(204, 255, 0, 0.28)'
  ctx.stroke()

  ctx.fillStyle = '#ccff00'
  ctx.shadowColor = 'rgba(204, 255, 0, 0.45)'
  ctx.shadowBlur = size * 0.018
  ctx.font = `800 ${Math.round(size * 0.052)}px "Space Grotesk", "Inter", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('LIFTAG', cx, cy + size * 0.004)
  ctx.shadowBlur = 0

  ctx.font = `700 ${Math.round(size * 0.028)}px "JetBrains Mono", ui-monospace, monospace`
  ctx.fillStyle = 'rgba(204, 255, 0, 0.7)'
  ctx.fillText('NFC', cx, cy + size * 0.168)

  return canvas
}

function paintStill() {
  const decal = drawDecal(640)
  const still = document.createElement('canvas')
  still.width = 640
  still.height = 640
  const ctx = still.getContext('2d')
  if (!ctx) return

  const g = ctx.createRadialGradient(250, 210, 20, 320, 320, 300)
  g.addColorStop(0, '#1a2210')
  g.addColorStop(0.45, '#0b0d0a')
  g.addColorStop(1, '#050605')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(320, 320, 300, 0, Math.PI * 2)
  ctx.fill()

  ctx.save()
  ctx.beginPath()
  ctx.arc(320, 320, 292, 0, Math.PI * 2)
  ctx.clip()
  ctx.drawImage(decal, 0, 0)
  ctx.restore()

  const sheen = ctx.createRadialGradient(230, 190, 10, 280, 240, 220)
  sheen.addColorStop(0, 'rgba(220, 255, 160, 0.16)')
  sheen.addColorStop(1, 'rgba(220, 255, 160, 0)')
  ctx.fillStyle = sheen
  ctx.beginPath()
  ctx.arc(320, 320, 292, 0, Math.PI * 2)
  ctx.fill()

  stillUrl.value = still.toDataURL('image/png')
}

function currentBufferScale() {
  return tokenBufferScale(
    window.devicePixelRatio || 1,
    navigator.hardwareConcurrency ?? 8,
    window.innerWidth,
    props.dprCap,
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

function uploadDecal(context: WebGLRenderingContext) {
  const decal = drawDecal(1024)
  const tex = context.createTexture()
  if (!tex) return null
  context.bindTexture(context.TEXTURE_2D, tex)
  context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, 1)
  context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, decal)
  context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR)
  context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR)
  context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE)
  context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE)
  return tex
}

function init() {
  const host = mount.value
  if (!host || !disposed || contextBroken) return

  const canvas = document.createElement('canvas')
  const attrs: WebGLContextAttributes = {
    alpha: true,
    premultipliedAlpha: false,
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
    if (import.meta.dev) console.error('[TapTokenCore]', context.getProgramInfoLog(prog))
    context.deleteProgram(prog)
    contextBroken = true
    return
  }

  const tex = uploadDecal(context)
  if (!tex) {
    context.deleteProgram(prog)
    contextBroken = true
    return
  }

  gl = context
  canvasEl = canvas
  program = prog
  decalTex = tex
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
    uDecal: context.getUniformLocation(prog, 'uDecal'),
  }

  context.disable(context.DEPTH_TEST)
  context.enable(context.BLEND)
  context.blendFunc(context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA)
  context.clearColor(0, 0, 0, 0)
  context.activeTexture(context.TEXTURE0)
  context.bindTexture(context.TEXTURE_2D, tex)
  context.uniform1i(uniforms.uDecal, 0)

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

  if (gl) {
    if (buffer) gl.deleteBuffer(buffer)
    if (decalTex) gl.deleteTexture(decalTex)
    if (program) gl.deleteProgram(program)
    if (!contextBroken) loseContext?.loseContext()
  }
  canvasEl?.remove()

  gl = null
  canvasEl = null
  program = null
  buffer = null
  decalTex = null
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

function frame(now: number) {
  if (!running || !gl || !program || !uniforms) {
    rafId = 0
    running = false
    return
  }

  rafId = requestAnimationFrame(frame)

  const dt = (lastFrame === 0 ? 16 : Math.min(now - lastFrame, 48)) * 0.001
  lastFrame = now
  timeSec += dt

  if (!dragging && !hovering) {
    lookTarget.yaw = IDLE_YAW * Math.sin(timeSec * 0.32) + spinVel
    lookTarget.pitch = 0.10 + IDLE_PITCH * Math.sin(timeSec * 0.41)
    spinVel *= Math.exp(-dt * 2.8)
  } else if (!dragging) {
    spinVel *= Math.exp(-dt * 3.2)
  }

  const ease = 1 - Math.exp(-dt * 8)
  look.yaw += (lookTarget.yaw - look.yaw) * ease
  look.pitch += (lookTarget.pitch - look.pitch) * ease
  look.yaw = Math.max(-LOOK_MAX, Math.min(LOOK_MAX, look.yaw))
  look.pitch = Math.max(-0.08, Math.min(LOOK_MAX, look.pitch))

  resizeBuffer()

  gl.uniform2f(uniforms.uRes, bufW, bufH)
  gl.uniform4f(uniforms.uLook, look.yaw, look.pitch, timeSec, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
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

function localNorm(event: PointerEvent) {
  const host = mount.value
  if (!host) return { x: 0, y: 0 }
  const rect = hostRect ?? host.getBoundingClientRect()
  return {
    x: ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1,
    y: ((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1,
  }
}

function aimFromPointer(event: PointerEvent) {
  const n = localNorm(event)
  lookTarget.yaw = n.x * LOOK_MAX
  lookTarget.pitch = -n.y * LOOK_MAX
}

function onPointerEnter(event: PointerEvent) {
  hovering = true
  hostRect = mount.value?.getBoundingClientRect() ?? null
  if (coarsePointer.value) return
  aimFromPointer(event)
}

function onPointerMove(event: PointerEvent) {
  if (coarsePointer.value && !dragging) return
  if (dragging) {
    const dx = event.clientX - lastPtrX
    const dy = event.clientY - lastPtrY
    lastPtrX = event.clientX
    lastPtrY = event.clientY
    lookTarget.yaw += dx * 0.01 * POINTER_GAIN
    lookTarget.pitch -= dy * 0.01 * POINTER_GAIN
    lookTarget.pitch = Math.max(-LOOK_MAX, Math.min(LOOK_MAX, lookTarget.pitch))
    spinVel = dx * 0.045
    hintGone.value = true
    return
  }
  aimFromPointer(event)
  hintGone.value = true
}

function onPointerDown(event: PointerEvent) {
  dragging = true
  lastPtrX = event.clientX
  lastPtrY = event.clientY
  hostRect = mount.value?.getBoundingClientRect() ?? null
  mount.value?.setPointerCapture(event.pointerId)
  hintGone.value = true
}

function onPointerUp(event: PointerEvent) {
  dragging = false
  hostRect = null
  if (mount.value?.hasPointerCapture(event.pointerId)) {
    mount.value.releasePointerCapture(event.pointerId)
  }
}

function onPointerLeave() {
  hovering = false
  if (dragging) return
  hostRect = null
  lookTarget.pitch = IDLE_PITCH
}

function bindPointer(host: HTMLElement) {
  host.addEventListener('pointerenter', onPointerEnter)
  host.addEventListener('pointermove', onPointerMove)
  host.addEventListener('pointerdown', onPointerDown)
  host.addEventListener('pointerup', onPointerUp)
  host.addEventListener('pointercancel', onPointerUp)
  host.addEventListener('pointerleave', onPointerLeave)
}

function unbindPointer(host: HTMLElement) {
  host.removeEventListener('pointerenter', onPointerEnter)
  host.removeEventListener('pointermove', onPointerMove)
  host.removeEventListener('pointerdown', onPointerDown)
  host.removeEventListener('pointerup', onPointerUp)
  host.removeEventListener('pointercancel', onPointerUp)
  host.removeEventListener('pointerleave', onPointerLeave)
}

onMounted(async () => {
  const host = mount.value
  if (!host) return

  reduceMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  coarsePointer.value = window.matchMedia('(hover: none), (pointer: coarse)').matches

  try {
    await document.fonts.ready
  } catch {
    // Decal falls back to the system stack already listed on the fillText calls.
  }

  paintStill()
  if (reduceMotion.value) return

  dpr = currentBufferScale()

  bindPointer(host)

  io = new IntersectionObserver(
    (entries) => {
      const entry = entries[entries.length - 1]
      intersecting = Boolean(entry?.isIntersecting)
      if (intersecting) {
        if (disposed) init()
        if (!disposed) startLoop()
      } else {
        releaseField()
      }
    },
    { threshold: 0 },
  )
  io.observe(host)

  onVisibility = () => {
    if (document.hidden) stopLoop()
    else if (intersecting && !disposed) startLoop()
    else if (intersecting && disposed) {
      init()
      if (!disposed) startLoop()
    }
  }
  document.addEventListener('visibilitychange', onVisibility)

  resizeObserver = new ResizeObserver(() => {
    hostRect = null
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
  const host = mount.value
  if (host) unbindPointer(host)
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
    class="tap-token-core"
    :class="{ 'is-coarse': coarsePointer }"
  >
    <img
      v-if="reduceMotion && stillUrl"
      class="tap-token-still"
      :src="stillUrl"
      alt="LIFTAG gym tag"
      width="640"
      height="640"
      aria-hidden="true"
    >
    <p
      v-if="!reduceMotion && !hintGone"
      class="tap-token-hint protocol"
    >
      {{ coarsePointer ? 'DRAG TO TILT' : 'MOVE TO TILT' }}
    </p>
  </div>
</template>

<style scoped>
.tap-token-core {
  position: absolute;
  inset: 0;
  touch-action: none;
  contain: layout paint style;
  cursor: grab;
}

.tap-token-core.is-coarse {
  cursor: grab;
}

.tap-token-core:active {
  cursor: grabbing;
}

.tap-token-core :deep(canvas) {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}

.tap-token-still {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}

.tap-token-hint {
  position: absolute;
  left: 50%;
  bottom: 10%;
  z-index: 2;
  margin: 0;
  color: #ccff00;
  font-size: 9px;
  letter-spacing: 0.14em;
  text-shadow: 0 0 12px rgba(204, 255, 0, 0.35);
  pointer-events: none;
  transform: translateX(-50%);
}

@media (prefers-reduced-motion: reduce) {
  .tap-token-core {
    touch-action: auto;
    cursor: default;
  }
}
</style>
