<script setup lang="ts">
// Volumetric lime charge beam for FinalCta.
//
// Ports LaserFlow's beam/wisp/fog math, then rewires it so the beam IS the
// existing CHARGE ▸ n% latch: intensity, vertical reach, and flow all read
// `charge` (0..1) from FinalCta. Color is hardcoded #CCFF00. The canvas is
// additive and alpha-cleared so it cannot punch a black rect through the CTA.
//
// Lifecycle matches CursorGridWarp: fullscreen triangle, dummy camera, lazy
// init near the viewport, pause offscreen / hidden, dispose on leave, DPR cap,
// context-lost abort. Callers must keep this off the mobile layout so three
// is never imported on a 390px Lighthouse run.
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'
import { useSharedMouse } from '../composables/useSharedMouse'

const props = withDefaults(defineProps<{
  /** FinalCta CHARGE 0..1. Latch holds 1. */
  charge?: number
  dprCap?: number
}>(), {
  charge: 0,
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
let pixelRatio = 1

const BEAM_Y = -0.18
const FADE_MAX = 0.7
const mousePx = new THREE.Vector2(0, 0)
const mouseTargetPx = new THREE.Vector2(0, 0)
let beamX = 0
let beamY = BEAM_Y

let io: IntersectionObserver | null = null
let resizeObserver: ResizeObserver | null = null
let resizeTimer: ReturnType<typeof setTimeout> | null = null
let onVisibility: (() => void) | null = null
let onContextLost: ((e: Event) => void) | null = null

const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`

// LaserFlow fragment math, lime-only and charge-driven. No fwidth so we do
// not need OES_standard_derivatives. Three ShaderMaterial supplies precision.
const fragmentShader = /* glsl */ `
  uniform vec3 iResolution;
  uniform vec4 iMouse;
  uniform float uWispDensity;
  uniform float uTiltScale;
  uniform float uFlowTime;
  uniform float uFogTime;
  uniform float uBeamXFrac;
  uniform float uBeamYFrac;
  uniform float uFlowSpeed;
  uniform float uVLenFactor;
  uniform float uHLenFactor;
  uniform float uFogIntensity;
  uniform float uFogScale;
  uniform float uWSpeed;
  uniform float uWIntensity;
  uniform float uFlowStrength;
  uniform float uDecay;
  uniform float uFalloffStart;
  uniform float uFogFallSpeed;
  uniform float uFade;
  uniform float uCharge;

  #define PI 3.14159265359
  #define TWO_PI 6.28318530718
  #define EPS 1e-6
  #define DT_LOCAL 0.0038
  #define EDGE_SOFT (DT_LOCAL*4.0)
  #define TAP_RADIUS 6
  #define R_H 90.0
  #define R_V 175.0
  #define FLARE_HEIGHT 22.0
  #define FLARE_AMOUNT 5.0
  #define FLARE_EXP 2.0
  #define TOP_FADE_START 0.1
  #define TOP_FADE_EXP 1.0
  #define FLOW_PERIOD 0.5
  #define FLOW_SHARPNESS 1.5

  #define W_BASE_X 1.5
  #define W_LAYER_GAP 0.25
  #define W_LANES 8
  #define W_SIDE_DECAY 0.5
  #define W_HALF 0.01
  #define W_AA 0.15
  #define W_CELL 20.0
  #define W_SEG_MIN 0.01
  #define W_SEG_MAX 0.55
  #define W_CURVE_AMOUNT 15.0
  #define W_CURVE_RANGE (FLARE_HEIGHT - 3.0)
  #define W_BOTTOM_EXP 10.0

  #define FOG_CONTRAST 1.2
  #define FOG_OCTAVES 4
  #define FOG_BOTTOM_BIAS 0.8
  #define FOG_TILT_MAX_X 0.35
  #define FOG_TILT_SHAPE 1.5
  #define FOG_BEAM_MIN 0.0
  #define FOG_BEAM_MAX 0.75
  #define FOG_MASK_GAMMA 0.5
  #define FOG_EXPAND_SHAPE 12.2
  #define FOG_EDGE_MIX 0.5

  #define HFOG_EDGE_START 0.20
  #define HFOG_EDGE_END 0.98
  #define HFOG_EDGE_GAMMA 1.4
  #define HFOG_Y_RADIUS 25.0
  #define HFOG_Y_SOFT 60.0

  #define EDGE_X0 0.22
  #define EDGE_X1 0.995
  #define EDGE_X_GAMMA 1.25
  #define EDGE_LUMA_T0 0.0
  #define EDGE_LUMA_T1 2.0
  #define DITHER_STRENGTH 1.0

  const vec3 LIME = vec3(0.8, 1.0, 0.0);

  float toSrgb(float x) {
    return x <= 0.00031308 ? 12.92 * x : 1.055 * pow(x, 1.0 / 2.4) - 0.055;
  }
  float bs(vec2 p, vec2 q, float powr) {
    float d = distance(p, q), f = powr * uFalloffStart, r = (f * f) / (d * d + EPS);
    return powr * min(1.0, r);
  }
  float bsa(vec2 p, vec2 q, float powr, vec2 s) {
    vec2 d = p - q;
    float dd = (d.x * d.x) / (s.x * s.x) + (d.y * d.y) / (s.y * s.y);
    float f = powr * uFalloffStart, r = (f * f) / (dd + EPS);
    return powr * min(1.0, r);
  }
  float tri01(float x) {
    float f = fract(x);
    return 1.0 - abs(f * 2.0 - 1.0);
  }
  float tauWf(float t, float tmin, float tmax) {
    float a = smoothstep(tmin, tmin + EDGE_SOFT, t);
    float b = 1.0 - smoothstep(tmax - EDGE_SOFT, tmax, t);
    return max(0.0, a * b);
  }
  float h21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 34.123);
    return fract(p.x * p.y);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    float a = h21(i), b = h21(i + vec2(1.0, 0.0)), c = h21(i + vec2(0.0, 1.0)), d = h21(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  float fbm2(vec2 p) {
    float v = 0.0, amp = 0.6;
    mat2 m = mat2(0.86, 0.5, -0.5, 0.86);
    for (int i = 0; i < FOG_OCTAVES; ++i) {
      v += amp * vnoise(p);
      p = m * p * 2.03 + 17.1;
      amp *= 0.52;
    }
    return v;
  }
  float rGate(float x, float l) {
    float a = smoothstep(0.0, W_AA, x);
    float b = 1.0 - smoothstep(l, l + W_AA, x);
    return max(0.0, a * b);
  }
  float flareY(float y) {
    float t = clamp(1.0 - (clamp(y, 0.0, FLARE_HEIGHT) / max(FLARE_HEIGHT, EPS)), 0.0, 1.0);
    return pow(t, FLARE_EXP);
  }

  float vWisps(vec2 uv, float topF) {
    float y = uv.y, yf = (y + uFlowTime * uWSpeed) / W_CELL;
    float dRaw = clamp(uWispDensity, 0.0, 2.0);
    float d = dRaw <= 0.0 ? 1.0 : dRaw;
    float lanesF = floor(float(W_LANES) * min(d, 1.0) + 0.5);
    int lanes = int(max(1.0, lanesF));
    float sp = min(d, 1.0), ep = max(d - 1.0, 0.0);
    float fm = flareY(max(y, 0.0));
    float rm = clamp(1.0 - (y / max(W_CURVE_RANGE, EPS)), 0.0, 1.0);
    float cm = fm * rm;
    const float G = 0.05;
    float xS = 1.0 + (FLARE_AMOUNT * W_CURVE_AMOUNT * G) * cm;
    float sPix = clamp(y / R_V, 0.0, 1.0);
    float bGain = pow(1.0 - sPix, W_BOTTOM_EXP);
    float sum = 0.0;
    for (int s = 0; s < 2; ++s) {
      float sgn = s == 0 ? -1.0 : 1.0;
      for (int i = 0; i < W_LANES; ++i) {
        if (i >= lanes) break;
        float off = W_BASE_X + float(i) * W_LAYER_GAP;
        float xc = sgn * (off * xS);
        float dx = abs(uv.x - xc);
        float lat = 1.0 - smoothstep(W_HALF, W_HALF + W_AA, dx);
        float amp = exp(-off * W_SIDE_DECAY);
        float seed = h21(vec2(off, sgn * 17.0));
        float yf2 = yf + seed * 7.0;
        float ci = floor(yf2), fy = fract(yf2);
        float seg = mix(W_SEG_MIN, W_SEG_MAX, h21(vec2(ci, off * 2.3)));
        float spR = h21(vec2(ci, off + sgn * 31.0));
        float seg1 = rGate(fy, seg) * step(spR, sp);
        if (ep > 0.0) {
          float spR2 = h21(vec2(ci * 3.1 + 7.0, off * 5.3 + sgn * 13.0));
          float f2 = fract(fy + 0.5);
          seg1 += rGate(f2, seg * 0.9) * step(spR2, ep);
        }
        sum += amp * lat * seg1;
      }
    }
    float span = smoothstep(-3.0, 0.0, y) * (1.0 - smoothstep(R_V - 6.0, R_V, y));
    return uWIntensity * sum * topF * bGain * span;
  }

  void mainImage(out vec4 fc, in vec2 frag) {
    vec2 C = iResolution.xy * 0.5;
    float invW = 1.0 / max(C.x, 1.0);
    vec2 sc = (512.0 / iResolution.xy) * 0.4;
    vec2 uv = (frag - C) * sc;
    vec2 off = vec2(uBeamXFrac * iResolution.x * sc.x, uBeamYFrac * iResolution.y * sc.y);
    vec2 uvc = uv - off;
    float a = 0.0, b = 0.0;
    float basePhase = 1.5 * PI + uDecay * 0.5;
    float tauMin = basePhase - uDecay;
    float tauMax = basePhase;
    float cx = clamp(uvc.x / (R_H * uHLenFactor), -1.0, 1.0);
    float tH = clamp(TWO_PI - acos(cx), tauMin, tauMax);
    for (int k = -TAP_RADIUS; k <= TAP_RADIUS; ++k) {
      float tu = tH + float(k) * DT_LOCAL;
      float wt = tauWf(tu, tauMin, tauMax);
      if (wt <= 0.0) continue;
      float spd = max(abs(sin(tu)), 0.02);
      float u = clamp((basePhase - tu) / max(uDecay, EPS), 0.0, 1.0);
      float env = pow(1.0 - abs(u * 2.0 - 1.0), 0.8);
      vec2 p = vec2((R_H * uHLenFactor) * cos(tu), 0.0);
      a += wt * bs(uvc, p, env * spd);
    }
    float yPix = uvc.y;
    float cy = clamp(-yPix / (R_V * uVLenFactor), -1.0, 1.0);
    float tV = clamp(TWO_PI - acos(cy), tauMin, tauMax);
    for (int k = -TAP_RADIUS; k <= TAP_RADIUS; ++k) {
      float tu = tV + float(k) * DT_LOCAL;
      float wt = tauWf(tu, tauMin, tauMax);
      if (wt <= 0.0) continue;
      float yb = (-R_V) * cos(tu);
      float s = clamp(yb / R_V, 0.0, 1.0);
      float spd = max(abs(sin(tu)), 0.02);
      float env = pow(1.0 - s, 0.6) * spd;
      float cap = 1.0 - smoothstep(TOP_FADE_START, 1.0, s);
      cap = pow(cap, TOP_FADE_EXP);
      env *= cap;
      float ph = s / max(FLOW_PERIOD, EPS) + uFlowTime * uFlowSpeed;
      float fl = pow(tri01(ph), FLOW_SHARPNESS);
      env *= mix(1.0 - uFlowStrength, 1.0, fl);
      float yp = (-R_V * uVLenFactor) * cos(tu);
      float m = pow(smoothstep(FLARE_HEIGHT, 0.0, yp), FLARE_EXP);
      float wx = 1.0 + FLARE_AMOUNT * m;
      vec2 sig = vec2(wx, 1.0);
      vec2 p = vec2(0.0, yp);
      float mask = step(0.0, yp);
      b += wt * bsa(uvc, p, mask * env, sig);
    }
    float sPix = clamp(yPix / R_V, 0.0, 1.0);
    float topA = pow(1.0 - smoothstep(TOP_FADE_START, 1.0, sPix), TOP_FADE_EXP);
    float L = a + b * topA;
    float w = vWisps(vec2(uvc.x, yPix), topA);

    float charge = clamp(uCharge, 0.0, 1.0);
    float yNorm = max(yPix, 0.0) / max(R_V * uVLenFactor, EPS);
    float reach = mix(0.16, 1.12, charge);
    float reachMask = 1.0 - smoothstep(reach, reach + 0.22, yNorm);
    L *= reachMask;
    w *= reachMask;

    // Tight core filament: the CHARGE column, not the stock wide T-laser.
    float filament = exp(-uvc.x * uvc.x * 0.12) * reachMask;
    filament *= 0.18 + 0.7 * charge;
    L += filament * (1.0 - smoothstep(0.0, 1.0, yNorm)) * 0.42;

    vec2 fuv = uvc * uFogScale;
    float mAct = step(1.0, length(iMouse.xy));
    float nx = ((iMouse.x - C.x) * invW) * mAct;
    float ax = abs(nx);
    float stMag = mix(ax, pow(ax, FOG_TILT_SHAPE), 0.35);
    float st = sign(nx) * stMag * uTiltScale;
    st = clamp(st, -FOG_TILT_MAX_X, FOG_TILT_MAX_X);
    vec2 dir = normalize(vec2(st, 1.0));
    fuv += uFogTime * uFogFallSpeed * dir;
    vec2 prp = vec2(-dir.y, dir.x);
    fuv += prp * (0.08 * sin(dot(uvc, prp) * 0.08 + uFogTime * 0.9));
    float n = fbm2(fuv + vec2(fbm2(fuv + vec2(7.3, 2.1)), fbm2(fuv + vec2(-3.7, 5.9))) * 0.6);
    n = pow(clamp(n, 0.0, 1.0), FOG_CONTRAST);
    float pixW = 1.0 / max(iResolution.y, 1.0);
    float m0 = pow(smoothstep(FOG_BEAM_MIN - pixW, FOG_BEAM_MAX + pixW, L), FOG_MASK_GAMMA);
    float bm = 1.0 - pow(1.0 - m0, FOG_EXPAND_SHAPE);
    bm = mix(bm * m0, bm, FOG_EDGE_MIX);
    float yP = 1.0 - smoothstep(HFOG_Y_RADIUS, HFOG_Y_RADIUS + HFOG_Y_SOFT, abs(yPix));
    float nxF = abs((frag.x - C.x) * invW);
    float hE = 1.0 - smoothstep(HFOG_EDGE_START, HFOG_EDGE_END, nxF);
    hE = pow(clamp(hE, 0.0, 1.0), HFOG_EDGE_GAMMA);
    float hW = mix(1.0, hE, clamp(yP, 0.0, 1.0));
    float bBias = mix(1.0, 1.0 - sPix, FOG_BOTTOM_BIAS);
    float radialFade = 1.0 - smoothstep(0.0, 0.7, length(uvc) / 120.0);
    float fog = n * uFogIntensity * bBias * bm * hW * radialFade * mix(reachMask, 1.0, 0.28);

    float LF = L + fog;
    float dith = (h21(frag) - 0.5) * (DITHER_STRENGTH / 255.0);
    float tone = toSrgb(LF + w);
    vec3 col = tone * LIME + dith;
    float alpha = clamp(toSrgb(L + w * 0.6) + dith * 0.6, 0.0, 1.0);
    float nxE = abs((frag.x - C.x) * invW);
    float xF = pow(clamp(1.0 - smoothstep(EDGE_X0, EDGE_X1, nxE), 0.0, 1.0), EDGE_X_GAMMA);
    float scene = LF + max(0.0, w) * 0.5;
    float hi = smoothstep(EDGE_LUMA_T0, EDGE_LUMA_T1, scene);
    float eM = mix(xF, 1.0, hi);
    col *= eM;
    alpha *= eM;
    col *= uFade;
    alpha *= uFade;
    if (max(alpha, max(col.r, max(col.g, col.b))) < 0.002) discard;
    // Premultiplied emissive: rgb is the lime light (can exceed a), so the
    // canvas composites as a glow over the CTA instead of a black clear.
    fc = vec4(col, alpha);
  }

  void main() {
    vec4 fc;
    mainImage(fc, gl_FragCoord.xy);
    gl_FragColor = fc;
  }
`

function buildTriangle() {
  const geo = new THREE.BufferGeometry()
  const positions = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0])
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  return geo
}

function chargeEnergy(charge: number) {
  const c = Math.min(1, Math.max(0, charge))
  return c * c * (3 - 2 * c)
}

function applyCharge(charge: number) {
  if (!material) return
  const e = chargeEnergy(charge)
  const u = material.uniforms
  u.uCharge.value = e
  u.uFade.value = e * FADE_MAX
  u.uVLenFactor.value = 0.72 + e * 1.58
  u.uHLenFactor.value = 0.2 + e * 0.22
  u.uWIntensity.value = 1.05 + e * 2.15
  u.uFogIntensity.value = 0.06 + e * 0.16
  u.uFlowSpeed.value = 0.14 + e * 0.3
  u.uWSpeed.value = 7 + e * 11
  u.uFlowStrength.value = 0.12 + e * 0.26
  u.uWispDensity.value = 0.55 + e * 0.7
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
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      powerPreference: 'low-power',
    })
  } catch {
    contextBroken = true
    return
  }

  pixelRatio = Math.min(window.devicePixelRatio || 1, props.dprCap)
  renderer.setPixelRatio(pixelRatio)
  renderer.setSize(width, height)
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace
  renderer.toneMapping = THREE.NoToneMapping

  scene = new THREE.Scene()
  camera = new THREE.Camera()

  geometry = buildTriangle()
  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    premultipliedAlpha: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
    toneMapped: false,
    uniforms: {
      iResolution: { value: new THREE.Vector3(width * pixelRatio, height * pixelRatio, pixelRatio) },
      iMouse: { value: new THREE.Vector4(0, 0, 0, 0) },
      uWispDensity: { value: 0.55 },
      uTiltScale: { value: 0.22 },
      uFlowTime: { value: 0 },
      uFogTime: { value: 0 },
      uBeamXFrac: { value: 0 },
      uBeamYFrac: { value: BEAM_Y },
      uFlowSpeed: { value: 0.14 },
      uVLenFactor: { value: 0.72 },
      uHLenFactor: { value: 0.2 },
      uFogIntensity: { value: 0.06 },
      uFogScale: { value: 0.22 },
      uWSpeed: { value: 7 },
      uWIntensity: { value: 1.05 },
      uFlowStrength: { value: 0.12 },
      uDecay: { value: 1.05 },
      uFalloffStart: { value: 1.15 },
      uFogFallSpeed: { value: 0.45 },
      uFade: { value: 0 },
      uCharge: { value: 0 },
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
  renderer.domElement.style.pointerEvents = 'none'
  renderer.domElement.style.width = '100%'
  renderer.domElement.style.height = '100%'
  host.appendChild(renderer.domElement)

  disposed = false
  lastFrame = 0
  beamX = 0
  beamY = BEAM_Y
  mousePx.set(0, 0)
  mouseTargetPx.set(0, 0)
  applyCharge(props.charge)
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
}

function frame(now: number) {
  if (!running || !renderer || !scene || !camera || !material) {
    rafId = 0
    return
  }
  rafId = requestAnimationFrame(frame)

  const dt = lastFrame === 0 ? 16 : Math.min(now - lastFrame, 48)
  lastFrame = now
  const dtSec = dt * 0.001

  const u = material.uniforms
  u.uFlowTime.value += dtSec
  u.uFogTime.value += dtSec
  applyCharge(props.charge)

  const host = mount.value
  if (host && sharedMouse.latest.hasPointer) {
    const rect = host.getBoundingClientRect()
    mouseTargetPx.set(
      (sharedMouse.latest.clientX - rect.left) * pixelRatio,
      (rect.height - (sharedMouse.latest.clientY - rect.top)) * pixelRatio,
    )
    beamX += (sharedMouse.latest.mx * 0.045 - beamX) * 0.06
    beamY += (BEAM_Y + sharedMouse.latest.my * 0.03 - beamY) * 0.06
  } else {
    mouseTargetPx.set(0, 0)
    beamX += (0 - beamX) * 0.06
    beamY += (BEAM_Y - beamY) * 0.06
  }
  mousePx.lerp(mouseTargetPx, 0.09)
  u.iMouse.value.set(mousePx.x, mousePx.y, 0, 0)
  u.uBeamXFrac.value = beamX
  u.uBeamYFrac.value = beamY

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
  pixelRatio = Math.min(window.devicePixelRatio || 1, props.dprCap)
  renderer.setPixelRatio(pixelRatio)
  renderer.setSize(width, height)
  material.uniforms.iResolution.value.set(width * pixelRatio, height * pixelRatio, pixelRatio)
}

onMounted(() => {
  const host = mount.value
  if (!host) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (window.matchMedia('(max-width: 768px)').matches) return

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
  <div ref="mount" class="charge-beam" aria-hidden="true" />
</template>

<style scoped>
.charge-beam {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  contain: strict;
}

@media (max-width: 768px) {
  .charge-beam {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .charge-beam {
    display: none;
  }
}
</style>
