<script setup lang="ts">
// Refractive prism core for the app-merge section.
//
// The crystal is real raytraced glass, not a gradient stack. Its body is the
// intersection of two counter-rotating octahedra and a sphere — all three are
// convex, so the ray/solid intersection is *analytic*: eight slab tests plus
// one quadratic, no sphere tracing, no distance field, no fixed step budget.
// That is what keeps a per-pixel refraction shader affordable here.
//
// Each view ray does:
//   1. entry hit + Fresnel
//   2. three refracted paths (one per channel, three different IORs) through
//      up to three total-internal-reflection bounces -> real dispersion
//   3. an analytic line integral to the centre for the volumetric filament,
//      so the core is seen split and repeated through every facet
//   4. one reflection sample for the studio highlights
//
// The environment it refracts is the section itself: a lime key, a red-neon
// kick, and eight coloured lights, one per mock app, that brighten as their
// icon flies in. The crystal literally refracts the apps being absorbed.
//
// Sharpness: the outline already has analytic chord coverage, so the plate's
// leftover-SDF AA does not apply. What does: a higher backing-store scale
// (capped below the plate, this path is heavier) and quieter static dither.
// There is no stamp texture to mipmap. Context MSAA cannot help a fullscreen
// triangle.
//
// Lifecycle contract matches MergeParticles:
//   • never initializes under prefers-reduced-motion
//   • lazy-inits only while the shared field is armed AND the core has charge
//   • disposes when the pin releases
//   • pauses while the document is hidden
//
// After ignite crosses the existing crack threshold the implicit solid is
// replaced by rasterized pyramidal shards that tile the dual octahedron.
// Charge, swell, spin, and the 3-IOR path are unchanged until that frame.
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useMergeParticleField } from '../composables/useMergeParticleField'
import { prismBufferScale } from '../utils/mergePrism'
import {
  SHARD_FLOATS_PER_VERT,
  SHARD_MAX_VERTS,
  clipIntersectionFaces,
  poseShards,
  shardFade,
  writeShardMesh,
} from '../utils/mergePrismShards'

const props = withDefaults(defineProps<{
  /** Eight lights, one per mock app: unit direction + linear rgb. */
  icons?: { dir: number[]; color: number[] }[]
  /** Device-pixel-ratio ceiling for the render target. */
  dprCap?: number
}>(), {
  icons: () => [],
  dprCap: 1.75,
})

const mount = ref<HTMLElement | null>(null)
const mergeField = useMergeParticleField()

const ICON_COUNT = 8
const IOR = 1.52
const CAM_Z = 3.2
const FOCAL = 1.85

// Growth curve. The crystal appears early and stays a speck through the whole
// wide part of the orbit, then swells exponentially once the icons are closing
// on each other, then bursts outward as the logo arrives.
/** Size while the eight icons are still far apart — a chip of glass, ~1/10th. */
const SEED_GROW = 0.10
/** Charge at which the orbit has closed enough for the crystal to take off. */
const SWELL_START = 0.54
/** Charge span of the exponential run-up; ends as the logo intro begins. */
const SWELL_SPAN = 0.36
/** exp(SWELL_K) * SEED_GROW === 1, so the swell tops out at the old full size. */
const SWELL_K = Math.log(1 / SEED_GROW)
/** Ignite span the shell takes to expand past the logo and dissolve. */
const BURST_SPAN = 0.38
/** Extra size the shell throws off on the way out. */
const BURST_GROW = 2.0

let gl: WebGLRenderingContext | null = null
// Owned by init/dispose, never by the template. Once a context is lost,
// getContext on the same element hands back the dead one, so re-entering the
// section has to start from a brand new canvas.
let canvasEl: HTMLCanvasElement | null = null
let program: WebGLProgram | null = null
let buffer: WebGLBuffer | null = null
let shardProgram: WebGLProgram | null = null
let shardBuffer: WebGLBuffer | null = null
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

let lastFrame = 0
let dpr = 1
let bufW = 0
let bufH = 0
// Phone stages keep the icons near full size inside a much smaller orbit, so a
// desktop-proportioned crystal sits entirely behind the cluster. Scale it up
// there and it reads as the halo the icons collapse into.
let compact = false

// Two independent orientations, integrated in place so the crystal keeps
// turning across frames instead of snapping to a function of scroll.
const angA = [0.62, 0.31, 0.12]
const angB = [-0.24, 0.87, 0.44]

const planeA = new Float32Array(12)
const planeB = new Float32Array(12)
const iconDir = new Float32Array(ICON_COUNT * 3)
const iconCol = new Float32Array(ICON_COUNT * 4)

type Uniforms = {
  uRes: WebGLUniformLocation | null
  uPhase: WebGLUniformLocation | null
  uShape: WebGLUniformLocation | null
  uMix: WebGLUniformLocation | null
  uPlaneA: WebGLUniformLocation | null
  uPlaneB: WebGLUniformLocation | null
  uIconDir: WebGLUniformLocation | null
  uIconCol: WebGLUniformLocation | null
}
type ShardUniforms = {
  uRes: WebGLUniformLocation | null
  uPhase: WebGLUniformLocation | null
  uMix: WebGLUniformLocation | null
  uIconDir: WebGLUniformLocation | null
  uIconCol: WebGLUniformLocation | null
}
let uniforms: Uniforms | null = null
let shardUniforms: ShardUniforms | null = null
let gemPosLoc = 0
let shardPosLoc = 0
let shardNrmLoc = 1
const shardScratch = new Float32Array(SHARD_MAX_VERTS * SHARD_FLOATS_PER_VERT)

const vertexSource = /* glsl */ `
  attribute vec2 aPos;
  void main() {
    gl_Position = vec4(aPos, 0.0, 1.0);
  }
`

const fragmentSource = /* glsl */ `
  precision highp float;

  uniform vec2 uRes;
  uniform vec4 uPhase;   // time, charge, ignite, flash
  uniform vec4 uShape;   // slabA, slabB, radius, dispersion
  uniform vec4 uMix;     // shell, fade, aura, ringRadius
  uniform vec3 uPlaneA[4];
  uniform vec3 uPlaneB[4];
  uniform vec3 uIconDir[${ICON_COUNT}];
  uniform vec4 uIconCol[${ICON_COUNT}];

  #define uTime   uPhase.x
  #define uCharge uPhase.y
  #define uIgnite uPhase.z
  #define uFlash  uPhase.w
  #define uSlabA  uShape.x
  #define uSlabB  uShape.y
  #define uRadius uShape.z
  #define uDisp   uShape.w
  #define uShell  uMix.x
  #define uFade   uMix.y
  #define uAura   uMix.z
  #define uRingR  uMix.w

  const float BIG = 1.0e9;

  struct Span {
    float tN;
    float tF;
    vec3 nN;
    vec3 nF;
  };

  float pow8(float x) {
    float a = x * x;
    a = a * a;
    return a * a;
  }

  float pow16(float x) {
    float a = pow8(x);
    return a * a;
  }

  float pow5(float x) {
    float a = x * x;
    return a * a * x;
  }

  // |dot(n, p)| <= s is one pair of opposite octahedron faces. Four of them
  // build the whole solid, so an eight-plane polyhedron costs four slab tests.
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

  // Intersection of three convex solids, so the entry/exit interval is just
  // the intersection of three intervals. Exact, and sharp at every edge.
  Span traceShape(vec3 ro, vec3 rd) {
    Span span;
    span.tN = -BIG;
    span.tF = BIG;
    span.nN = vec3(0.0, 0.0, 1.0);
    span.nF = vec3(0.0, 0.0, -1.0);

    float b = dot(ro, rd);
    float c = dot(ro, ro) - uRadius * uRadius;
    float h = b * b - c;
    if (h < 0.0) {
      span.tN = BIG;
      span.tF = -BIG;
      return span;
    }
    h = sqrt(h);

    float t1 = -b - h;
    float t2 = -b + h;
    span.tN = t1;
    span.nN = (ro + rd * t1) / uRadius;
    span.tF = t2;
    span.nF = (ro + rd * t2) / uRadius;

    for (int i = 0; i < 4; i++) slab(uPlaneA[i], uSlabA, ro, rd, span);
    for (int i = 0; i < 4; i++) slab(uPlaneB[i], uSlabB, ro, rd, span);
    return span;
  }

  // The world the crystal refracts. No cube map, no texture fetch: a lime key,
  // a red-neon kick, softbox strips, and the eight app lights.
  vec3 envSample(vec3 d) {
    // Near-black fill. Anything brighter reads as milk inside the glass.
    vec3 col = mix(vec3(0.002, 0.004, 0.002), vec3(0.009, 0.015, 0.004), d.y * 0.5 + 0.5);

    col += vec3(1.0, 1.0, 0.92) * pow16(max(dot(d, vec3(-0.436, 0.698, 0.568)), 0.0)) * 3.6;
    col += vec3(0.78, 1.0, 0.02) * pow8(max(dot(d, vec3(0.578, 0.368, 0.728)), 0.0)) * (0.55 + uCharge * 1.20);
    col += vec3(1.0, 0.16, 0.32) * pow8(max(dot(d, vec3(0.276, -0.862, -0.424)), 0.0)) * 0.60;

    // Softbox strips. Crossed at two angles so no facet can face a flat void:
    // a large plane catching no band at all is what makes glass read as plastic.
    float strip = sin(d.y * 14.0 + d.x * 3.4 + uTime * 0.22);
    float cross = sin(d.x * 11.0 - d.z * 6.0 - uTime * 0.14);
    col += vec3(0.58, 0.78, 0.42) * smoothstep(0.93, 1.0, strip) * 0.85;
    col += vec3(0.72, 0.86, 0.60) * smoothstep(0.95, 1.0, cross) * 0.70;

    for (int i = 0; i < ${ICON_COUNT}; i++) {
      float e = uIconCol[i].w;
      if (e > 0.0) {
        col += uIconCol[i].rgb * pow8(max(dot(d, uIconDir[i]), 0.0)) * e * 1.5;
      }
    }
    return col;
  }

  // One channel's path through the glass. Refract in, bounce on total internal
  // reflection, refract out. The out param is the analytic line integral of the
  // centre filament over every interior segment the ray walks.
  vec3 glassPath(vec3 p0, vec3 rd, vec3 nEntry, float ior, out float glow) {
    glow = 0.0;

    vec3 dir = refract(rd, nEntry, 1.0 / ior);
    if (dot(dir, dir) < 0.5) return envSample(reflect(rd, nEntry));

    vec3 pos = p0;
    vec3 outDir = dir;
    float path = 0.0;
    bool escaped = false;

    for (int i = 0; i < 3; i++) {
      if (escaped) break;

      vec3 o = pos + dir * 0.0015;
      Span span = traceShape(o, dir);
      float t = max(span.tF, 0.0);

      float ts = -dot(o, dir);
      if (ts > 0.0 && ts < t) {
        vec3 q = o + dir * ts;
        glow += 1.0 / (dot(q, q) * 170.0 + 0.02);
      }

      path += t;
      pos = o + dir * t;

      vec3 nIn = -span.nF;
      vec3 refr = refract(dir, nIn, ior);
      if (dot(refr, refr) > 0.5) {
        outDir = refr;
        escaped = true;
      } else {
        dir = reflect(dir, nIn);
        outDir = dir;
      }
    }

    // Beer absorption toward lime: blue dies fastest, so a long path through
    // the body goes deep green while a clipped corner stays near-white.
    vec3 tint = exp(-path * vec3(0.55, 0.18, 2.40) * (2.4 - uCharge * 0.9));
    return envSample(outDir) * tint;
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);
    float r = length(uv);
    vec3 col = vec3(0.0);

    // Charge glow, then the detonation, then the standing aura that survives it.
    //
    // The charge glow is a core lit *inside* the gem, so its falloff has to
    // follow the gem instead of the canvas: the crystal spends most of the
    // section as a speck, and a fixed-radius glow around a speck reads as a
    // blob with a chip in it. uRadius is the sphere in world units; scaling by
    // focal/camera-z turns it into the silhouette radius in uv.
    float gemR = uRadius * ${(FOCAL / CAM_Z).toFixed(5)};
    float chargeFall = 1.0 / max(gemR * 0.40, 0.006);
    col += vec3(0.62, 1.0, 0.10) * exp(-r * chargeFall) * uCharge * 0.16 * uShell;
    // The detonation is explosion-scale, not gem-scale, so it stays anchored.
    col += vec3(0.62, 1.0, 0.10) * exp(-r * 11.0) * uFlash * 0.7;
    col += vec3(0.55, 1.0, 0.18) * exp(-r * 8.0) * uAura * 0.34;

    if (uFlash > 0.002) {
      col += vec3(0.88, 1.0, 0.55) * exp(-r * 6.0) * uFlash * 3.6;

      // Anamorphic flare. A camera would smear a blowout like this across its
      // barrel and split it into a starburst; a plain radial blob would not.
      float streakH = exp(-abs(uv.y) * 130.0) * exp(-abs(uv.x) * 5.5);
      float streakV = exp(-abs(uv.x) * 150.0) * exp(-abs(uv.y) * 7.5);
      col += vec3(0.86, 1.0, 0.62) * (streakH + streakV * 0.55) * uFlash * 2.2;

      float spikes = pow(abs(cos(atan(uv.y, uv.x) * 3.0)), 26.0);
      col += vec3(0.92, 1.0, 0.58) * spikes * exp(-r * 9.0) * uFlash * 1.8;
    }

    // Spectral ring left behind once the shell is gone: the same radius sampled
    // at three slightly different distances, so its edges split into colour.
    if (uAura > 0.002) {
      vec3 rr = vec3(r) - vec3(-0.006, 0.0, 0.006) - uRingR;
      col += vec3(0.66, 0.98, 0.42) * exp(-rr * rr / 0.0009) * uAura * 0.46;
    }

    if (uShell > 0.002) {
      vec3 ro = vec3(0.0, 0.0, ${CAM_Z.toFixed(2)});
      vec3 rd = normalize(vec3(uv, -${FOCAL.toFixed(2)}));
      Span span = traceShape(ro, rd);

      if (span.tN < span.tF && span.tF > 0.0) {
        vec3 p = ro + rd * span.tN;
        vec3 n = span.nN;
        float facing = max(dot(-rd, n), 0.0);
        float fres = 0.035 + 0.965 * pow5(1.0 - facing);

        float d = 0.010 + uDisp * 0.055;
        float gR;
        float gG;
        float gB;
        vec3 refracted = vec3(
          glassPath(p, rd, n, ${IOR.toFixed(3)} - d, gR).r,
          glassPath(p, rd, n, ${IOR.toFixed(3)}, gG).g,
          glassPath(p, rd, n, ${IOR.toFixed(3)} + d, gB).b
        );

        vec3 glass = mix(refracted, envSample(reflect(rd, n)), fres);

        vec3 coreTint = mix(vec3(0.74, 1.0, 0.06), vec3(1.0, 1.0, 0.92), uIgnite);
        float coreEnergy = (0.10 + uCharge * 0.92) * (0.45 + uIgnite * 3.6);
        glass += coreTint * vec3(gR, gG, gB) * coreEnergy * 0.030;

        float rim = 1.0 - facing;
        glass += vec3(0.80, 1.0, 0.10) * rim * rim * rim * (0.22 + uCharge * 0.55);

        // Analytic silhouette coverage: the chord collapses to zero at the
        // outline, which is the only geometric edge a raytrace can alias on.
        float px = 2.0 * ${CAM_Z.toFixed(2)} / (${FOCAL.toFixed(2)} * min(uRes.x, uRes.y));
        float cover = smoothstep(0.0, px * 2.4, span.tF - span.tN);
        col += glass * uShell * cover;
      }
    }

    // The bloom is wider than the gem, so it has to reach zero *inside* the
    // canvas or the element's own rectangle shows up as a hard edge under the
    // screen blend. Window on the box, not the radius: the canvas is square and
    // uv is normalized by its shorter side, so the border is |uv| = 0.5.
    col = max(col * uFade * smoothstep(0.50, 0.28, max(abs(uv.x), abs(uv.y))), vec3(0.0));
    col = 1.0 - exp(-col * 1.15);

    // Dither only where there is signal. A flat noise floor is still coverage,
    // and coverage across an empty canvas is the same visible rectangle.
    float lum = max(max(col.r, col.g), col.b);
    col += (hash(gl_FragCoord.xy) - 0.5) * 0.004 * smoothstep(0.0, 0.05, lum);
    col = clamp(col, 0.0, 1.0);

    // Premultiplied emissive: black is absent, bright is additive under the
    // element's screen blend.
    float a = clamp(max(max(col.r, col.g), col.b) * 1.35, 0.0, 1.0);
    gl_FragColor = vec4(col, a);
  }
`

const shardVertexSource = /* glsl */ `
  attribute vec3 aPosition;
  attribute vec3 aNormal;
  uniform vec2 uRes;
  varying vec3 vPos;
  varying vec3 vN;

  void main() {
    float minR = min(uRes.x, uRes.y);
    float viewZ = max(${CAM_Z.toFixed(2)} - aPosition.z, 0.05);
    float ndcZ = (viewZ - 0.45) / 6.0 * 2.0 - 1.0;
    gl_Position = vec4(
      aPosition.x * ${FOCAL.toFixed(2)} * (2.0 * minR / uRes.x),
      aPosition.y * ${FOCAL.toFixed(2)} * (2.0 * minR / uRes.y),
      ndcZ * viewZ,
      viewZ
    );
    vPos = aPosition;
    vN = aNormal;
  }
`

const shardFragmentSource = /* glsl */ `
  precision highp float;

  uniform vec2 uRes;
  uniform vec4 uPhase;
  uniform vec4 uMix;
  uniform vec3 uIconDir[${ICON_COUNT}];
  uniform vec4 uIconCol[${ICON_COUNT}];
  varying vec3 vPos;
  varying vec3 vN;

  #define uCharge uPhase.y

  float pow8(float x) {
    float a = x * x;
    a = a * a;
    return a * a;
  }

  float pow16(float x) {
    float a = pow8(x);
    return a * a;
  }

  vec3 envSample(vec3 d) {
    vec3 col = mix(vec3(0.002, 0.004, 0.002), vec3(0.009, 0.015, 0.004), d.y * 0.5 + 0.5);

    col += vec3(1.0, 1.0, 0.92) * pow16(max(dot(d, vec3(-0.436, 0.698, 0.568)), 0.0)) * 3.6;
    col += vec3(0.78, 1.0, 0.02) * pow8(max(dot(d, vec3(0.578, 0.368, 0.728)), 0.0)) * (0.55 + uCharge * 1.20);
    col += vec3(1.0, 0.16, 0.32) * pow8(max(dot(d, vec3(0.276, -0.862, -0.424)), 0.0)) * 0.60;

    float strip = sin(d.y * 14.0 + d.x * 3.4 + uPhase.x * 0.22);
    float crossB = sin(d.x * 11.0 - d.z * 6.0 - uPhase.x * 0.14);
    col += vec3(0.58, 0.78, 0.42) * smoothstep(0.93, 1.0, strip) * 0.85;
    col += vec3(0.72, 0.86, 0.60) * smoothstep(0.95, 1.0, crossB) * 0.70;

    for (int i = 0; i < ${ICON_COUNT}; i++) {
      float e = uIconCol[i].w;
      if (e > 0.0) {
        col += uIconCol[i].rgb * pow8(max(dot(d, uIconDir[i]), 0.0)) * e * 1.5;
      }
    }
    return col;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);
    vec3 ro = vec3(0.0, 0.0, ${CAM_Z.toFixed(2)});
    vec3 rd = normalize(vPos - ro);
    vec3 n = normalize(vN);
    if (dot(n, -rd) < 0.0) n = -n;

    float facing = max(dot(-rd, n), 0.0);
    float fres = 0.035 + 0.965 * pow(1.0 - facing, 5.0);
    vec3 refl = envSample(reflect(rd, n));
    vec3 refrDir = refract(rd, n, 1.0 / ${IOR.toFixed(3)});
    vec3 refr = dot(refrDir, refrDir) > 0.5 ? envSample(refrDir) : refl;
    float thick = 0.16 / max(facing, 0.12);
    vec3 tint = exp(-thick * vec3(0.55, 0.18, 2.40) * 2.1);
    vec3 glass = mix(refr * tint, refl, fres);
    float rim = 1.0 - facing;
    glass += vec3(0.80, 1.0, 0.10) * rim * rim * rim * (0.22 + uCharge * 0.55);

    glass *= uMix.x * uMix.y;
    glass *= smoothstep(0.50, 0.28, max(abs(uv.x), abs(uv.y)));
    glass = max(glass, vec3(0.0));
    glass = 1.0 - exp(-glass * 1.15);
    glass = clamp(glass, 0.0, 1.0);
    float a = clamp(max(max(glass.r, glass.g), glass.b) * 1.35, 0.0, 1.0);
    gl_FragColor = vec4(glass, a);
  }
`

function compile(context: WebGLRenderingContext, type: number, source: string) {
  const shader = context.createShader(type)
  if (!shader) return null
  context.shaderSource(shader, source)
  context.compileShader(shader)
  if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
    // A silent bail here looks identical to "the section just does not render",
    // and the shader is interpolated from JS constants, so keep the log in dev.
    if (import.meta.dev) console.error('[MergePrismCore]', context.getShaderInfoLog(shader))
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
    if (import.meta.dev) console.error('[MergePrismCore]', context.getProgramInfoLog(prog))
    context.deleteProgram(prog)
    return null
  }
  return prog
}

function buildPlanes(out: Float32Array, rx: number, ry: number, rz: number) {
  const cx = Math.cos(rx)
  const sx = Math.sin(rx)
  const cy = Math.cos(ry)
  const sy = Math.sin(ry)
  const cz = Math.cos(rz)
  const sz = Math.sin(rz)

  // R = Rz * Ry * Rx, applied to the four octahedron face normals. Doing it on
  // the CPU means the shader never touches a matrix.
  const m0 = cz * cy
  const m1 = cz * sy * sx - sz * cx
  const m2 = cz * sy * cx + sz * sx
  const m3 = sz * cy
  const m4 = sz * sy * sx + cz * cx
  const m5 = sz * sy * cx - cz * sx
  const m6 = -sy
  const m7 = cy * sx
  const m8 = cy * cx

  const k = 0.5773502691896258 // 1 / sqrt(3)
  const base = [1, 1, 1, 1, 1, -1, 1, -1, 1, -1, 1, 1]

  for (let i = 0; i < 4; i++) {
    const x = base[i * 3] * k
    const y = base[i * 3 + 1] * k
    const z = base[i * 3 + 2] * k
    out[i * 3] = m0 * x + m1 * y + m2 * z
    out[i * 3 + 1] = m3 * x + m4 * y + m5 * z
    out[i * 3 + 2] = m6 * x + m7 * y + m8 * z
  }
}

/** Directions and colours are fixed by the orbit layout, so prime them once. */
function primeIconUniforms() {
  for (let i = 0; i < ICON_COUNT; i++) {
    const icon = props.icons[i]
    const dir = icon?.dir
    const color = icon?.color
    iconDir[i * 3] = dir?.[0] ?? 0
    iconDir[i * 3 + 1] = dir?.[1] ?? 0
    iconDir[i * 3 + 2] = dir?.[2] ?? 1
    iconCol[i * 4] = color?.[0] ?? 0
    iconCol[i * 4 + 1] = color?.[1] ?? 0
    iconCol[i * 4 + 2] = color?.[2] ?? 0
  }
}

/** Only the intensity changes per frame, as each icon flies in and is absorbed. */
function syncIconEnergy() {
  const core = mergeField.core
  for (let i = 0; i < ICON_COUNT; i++) {
    iconCol[i * 4 + 3] = core.icons[i] ?? 0
  }
}

function currentBufferScale() {
  return Math.min(
    prismBufferScale(
      window.devicePixelRatio || 1,
      navigator.hardwareConcurrency ?? 8,
      window.innerWidth,
    ),
    props.dprCap,
  )
}

function resizeBuffer() {
  const host = mount.value
  if (!host || !canvasEl || !gl) return
  dpr = currentBufferScale()
  const width = Math.max(1, Math.round((host.clientWidth || 1) * dpr))
  const height = Math.max(1, Math.round((host.clientHeight || 1) * dpr))
  compact = (host.clientWidth || 0) < 400
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
    depth: true,
    stencil: false,
    powerPreference: 'low-power',
  }

  const context = (canvas.getContext('webgl2', attrs) as WebGLRenderingContext | null)
    ?? (canvas.getContext('webgl', attrs) as WebGLRenderingContext | null)

  if (!context) {
    contextBroken = true
    return
  }

  // The shader packs its scalars into vec4s, but a device with the bare GLSL ES
  // minimum still cannot hold the eight lights. Sit out rather than fail.
  if (context.getParameter(context.MAX_FRAGMENT_UNIFORM_VECTORS) < 40) {
    contextBroken = true
    return
  }

  const prog = linkProgram(context, vertexSource, fragmentSource)
  if (!prog) {
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
  gemPosLoc = context.getAttribLocation(prog, 'aPos')
  context.enableVertexAttribArray(gemPosLoc)
  context.vertexAttribPointer(gemPosLoc, 2, context.FLOAT, false, 0, 0)

  uniforms = {
    uRes: context.getUniformLocation(prog, 'uRes'),
    uPhase: context.getUniformLocation(prog, 'uPhase'),
    uShape: context.getUniformLocation(prog, 'uShape'),
    uMix: context.getUniformLocation(prog, 'uMix'),
    uPlaneA: context.getUniformLocation(prog, 'uPlaneA[0]'),
    uPlaneB: context.getUniformLocation(prog, 'uPlaneB[0]'),
    uIconDir: context.getUniformLocation(prog, 'uIconDir[0]'),
    uIconCol: context.getUniformLocation(prog, 'uIconCol[0]'),
  }

  const shatter = linkProgram(context, shardVertexSource, shardFragmentSource)
  if (shatter) {
    shardProgram = shatter
    shardBuffer = context.createBuffer()
    shardPosLoc = context.getAttribLocation(shatter, 'aPosition')
    shardNrmLoc = context.getAttribLocation(shatter, 'aNormal')
    shardUniforms = {
      uRes: context.getUniformLocation(shatter, 'uRes'),
      uPhase: context.getUniformLocation(shatter, 'uPhase'),
      uMix: context.getUniformLocation(shatter, 'uMix'),
      uIconDir: context.getUniformLocation(shatter, 'uIconDir[0]'),
      uIconCol: context.getUniformLocation(shatter, 'uIconCol[0]'),
    }
  }

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
    if (program) gl.deleteProgram(program)
    if (shardBuffer) gl.deleteBuffer(shardBuffer)
    if (shardProgram) gl.deleteProgram(shardProgram)
    if (!contextBroken) loseContext?.loseContext()
  }
  canvasEl?.remove()

  gl = null
  canvasEl = null
  program = null
  buffer = null
  shardProgram = null
  shardBuffer = null
  uniforms = null
  shardUniforms = null
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

function coreIsLit() {
  const core = mergeField.core
  return core.fade > 0.002 && (core.charge > 0.004 || core.ignite > 0.002)
}

function watchArmed() {
  watching = false
  rafId = 0
  if (!intersecting || document.hidden) return

  if (mergeField.armed && coreIsLit()) {
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

  if (!mergeField.armed || !coreIsLit()) {
    releaseField()
    if (intersecting) startWatch()
    return
  }

  rafId = requestAnimationFrame(frame)

  const dt = (lastFrame === 0 ? 16 : Math.min(now - lastFrame, 48)) * 0.001
  lastFrame = now

  const core = mergeField.core
  const charge = core.charge
  const ignite = core.ignite

  // The crystal is seeded almost the moment the icons start moving, so the
  // whole convergence has something at its centre to converge *on* — but it
  // arrives as a speck, not as scenery that was always there.
  const bloomIn = Math.min(1, Math.max(0, (charge - 0.012) / 0.09))
  const bloom = bloomIn * bloomIn * (3 - 2 * bloomIn)

  // The shell tears open as the logo takes the centre and keeps accelerating
  // outward while it dissolves, so LIFTAG reads as what was inside the glass
  // rather than as something that faded in over it.
  const crack = Math.min(1, Math.max(0, (ignite - 0.02) / BURST_SPAN))
  const shell = bloom * Math.max(0, 1 - crack)

  // Once the shell is gone the crystal leaves a spectral pool behind the logo.
  // It rides out on core.fade with the rest of the section.
  const auraIn = Math.max(0, Math.min(1, (ignite - 0.28) / 0.34))
  const aura = auraIn * auraIn * (3 - 2 * auraIn)

  // Size is held at the speck until the orbit has visibly closed — the icons
  // are more than half collapsed by charge ~0.55 — and then runs exponentially,
  // so the crystal becomes a gem in the last stretch of the convergence instead
  // of creeping up the whole way. `** 1.5` keeps the opening of that window
  // nearly flat, and exp(SWELL_K) lands the seed back on full size just as the
  // logo intro begins, which is the moment the shell has to burst.
  const swellT = Math.min(1, Math.max(0, (charge - SWELL_START) / SWELL_SPAN))
  const seed = SEED_GROW * Math.exp(swellT ** 1.5 * SWELL_K)
  // Shards replace the inflate-and-fade. Until crack is live the extra term
  // is zero either way, so the charged gem is the same size as before.
  const shatterLive = crack > 0.002 && !!shardProgram && !!shardBuffer && !!shardUniforms
  const grow = (seed + (shatterLive ? 0 : crack * crack * BURST_GROW)) * (compact ? 1.38 : 1)

  const spin = 0.055 + charge * 0.16 + ignite * 0.55
  angA[0] += dt * spin * 0.62
  angA[1] += dt * spin * 1.05
  angB[0] -= dt * spin * 0.84
  angB[2] += dt * spin * 0.71

  buildPlanes(planeA, angA[0] + core.tiltY * 0.22, angA[1] + core.tiltX * 0.26, angA[2])
  buildPlanes(planeB, angB[0] + core.tiltY * 0.14, angB[1] + core.tiltX * 0.18, angB[2])
  syncIconEnergy()

  resizeBuffer()

  gl.useProgram(program)
  gl.uniform2f(uniforms.uRes, bufW, bufH)
  gl.uniform4f(uniforms.uPhase, now * 0.001, charge, ignite, core.flash)
  // At full swell this sits between the LIFTAG icon shell and the inner orbit
  // ring: the icons have to visibly fall *into* it, not disappear behind it.
  // The sphere grows faster than the octahedra, so facets sharpen as the
  // section charges.
  gl.uniform4f(
    uniforms.uShape,
    0.270 * grow,
    0.258 * grow,
    (0.285 + charge * 0.110) * grow,
    0.10 + charge * 0.34 + core.flash * 0.85,
  )
  // The ring keeps travelling after the shell is gone, so the boundary the
  // crystal threw off is still opening around the logo that came out of it.
  gl.uniform4f(uniforms.uMix, shatterLive ? 0 : shell, core.fade, aura, 0.16 + ignite * 0.17)
  gl.uniform3fv(uniforms.uPlaneA, planeA)
  gl.uniform3fv(uniforms.uPlaneB, planeB)
  gl.uniform3fv(uniforms.uIconDir, iconDir)
  gl.uniform4fv(uniforms.uIconCol, iconCol)

  if (shatterLive) drawShatter(now, crack, 0.270 * grow, 0.258 * grow)
  else gl.drawArrays(gl.TRIANGLES, 0, 3)
}

function bindGemAttribs() {
  if (!gl || !buffer) return
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.enableVertexAttribArray(gemPosLoc)
  gl.vertexAttribPointer(gemPosLoc, 2, gl.FLOAT, false, 0, 0)
  if (shardPosLoc >= 0 && shardPosLoc !== gemPosLoc) gl.disableVertexAttribArray(shardPosLoc)
  if (shardNrmLoc >= 0 && shardNrmLoc !== gemPosLoc && shardNrmLoc !== shardPosLoc) {
    gl.disableVertexAttribArray(shardNrmLoc)
  }
}

function bindShardAttribs() {
  if (!gl || !shardBuffer) return
  gl.bindBuffer(gl.ARRAY_BUFFER, shardBuffer)
  gl.enableVertexAttribArray(shardPosLoc)
  gl.vertexAttribPointer(shardPosLoc, 3, gl.FLOAT, false, 24, 0)
  gl.enableVertexAttribArray(shardNrmLoc)
  gl.vertexAttribPointer(shardNrmLoc, 3, gl.FLOAT, false, 24, 12)
  if (gemPosLoc >= 0 && gemPosLoc !== shardPosLoc && gemPosLoc !== shardNrmLoc) {
    gl.disableVertexAttribArray(gemPosLoc)
  }
}

function drawShatter(now: number, crack: number, slabA: number, slabB: number) {
  if (!gl || !program || !uniforms || !shardProgram || !shardBuffer || !shardUniforms) return

  const faces = clipIntersectionFaces(planeA, slabA, planeB, slabB)
  const posed = poseShards(faces, crack)
  const vertCount = writeShardMesh(posed, shardScratch)
  const core = mergeField.core

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  // Flash, aura, and the spectral ring stay on the implicit pass with the
  // shell forced off so the old inflate-and-fade body does not draw.
  gl.disable(gl.DEPTH_TEST)
  gl.disable(gl.BLEND)
  gl.useProgram(program)
  bindGemAttribs()
  gl.drawArrays(gl.TRIANGLES, 0, 3)

  if (vertCount >= 3) {
    gl.useProgram(shardProgram)
    bindShardAttribs()
    gl.bufferData(
      gl.ARRAY_BUFFER,
      shardScratch.subarray(0, vertCount * SHARD_FLOATS_PER_VERT),
      gl.DYNAMIC_DRAW,
    )
    gl.uniform2f(shardUniforms.uRes, bufW, bufH)
    gl.uniform4f(shardUniforms.uPhase, now * 0.001, core.charge, core.ignite, core.flash)
    gl.uniform4f(shardUniforms.uMix, shardFade(crack), core.fade, 0, 0)
    gl.uniform3fv(shardUniforms.uIconDir, iconDir)
    gl.uniform4fv(shardUniforms.uIconCol, iconCol)

    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    gl.drawArrays(gl.TRIANGLES, 0, vertCount)
  }

  gl.disable(gl.DEPTH_TEST)
  gl.disable(gl.BLEND)
  gl.useProgram(program)
  bindGemAttribs()
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

  // Same sharpness idea as the plate, with a lower desktop cap: this shader
  // traces three IOR paths and shares the section with the particle field.
  primeIconUniforms()
  dpr = currentBufferScale()

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
  <div ref="mount" class="merge-prism-core" aria-hidden="true" />
</template>

<style scoped>
.merge-prism-core {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(100%, 560px);
  max-height: 100%;
  aspect-ratio: 1;
  z-index: 5;
  pointer-events: none;
  transform: translate3d(-50%, -50%, 0);
  contain: layout paint style;
}

.merge-prism-core :deep(canvas) {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  mix-blend-mode: screen;
}

@media (max-width: 620px) {
  .merge-prism-core {
    width: min(112%, 340px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .merge-prism-core {
    display: none;
  }
}
</style>
