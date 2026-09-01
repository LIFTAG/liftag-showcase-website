// LIFTAG "machine intelligence" shader.
//
// The hero machine still has to read as real powder-coated steel in a dark
// room, so this augments the standard physical material through
// onBeforeCompile rather than replacing it - all the PBR lighting, the env map
// and the shadow terms stay intact, and the analysis effects are added on top
// of the lit result. Every machine material shares one uniform object, so the
// whole assembly scans as a single body.
//
// Two effects live here, both evaluated in world space so they stay put on the
// machine while the camera flies around it:
//
//   * rim        - a constant faint fresnel edge. This is what keeps the
//                  silhouette legible when the scene is otherwise near-black.
//   * probe      - a soft cursor-driven field with a noise-warped boundary,
//                  lifting the surface out of darkness where the pointer is.
//
// There used to be four. A scan plane swept the machine with a hot core line
// and a trailing region of contour slices, and a full-body fresnel outline
// fired for the identified state. Both are gone, and the machine now carries
// no analysis layer at all.
//
// They were brand lime first, then - when lime turned out to read as a green
// lamp pointed at the machine rather than as instrumentation - the room's cool
// white. Neutral colour fixed the hue and left the real problem standing: an
// effect drawn across the body of the machine is a light on the machine
// whatever colour it is, and this room's entire premise is that the machine is
// barely lit. The scan reads better as something happening to the *code* -
// which is what is actually being scanned - so it lives on the placard now,
// and the machine stays a dark machine.
//
// It also carries the machine's *surface detail*. The export deliberately
// ships no UVs and no texture maps, so all of it is procedural and evaluated
// from world position: micro-bump on the normal, multi-octave roughness
// breakup, settled dust on up-facing surfaces and grime at floor level. That
// detail is what separates a photograph of powder-coated steel from a render
// of it - a real machine has no uniform surface anywhere on it, and a perfectly
// even one reads as CG no matter how good the lighting is.
import * as THREE from 'three'

export interface ScanUniforms {
  uTime: { value: number }
  uRimColor: { value: THREE.Color }
  uRimAmp: { value: number }
  uProbe: { value: THREE.Vector3 }
  uProbeRadius: { value: number }
  uProbeAmp: { value: number }
  uProbeLive: { value: number }
  uDebug: { value: number }
}

/**
 * Per-material surface character. Unlike `ScanUniforms` these are *not* shared:
 * each material gets its own object so vinyl, powder coat and bare steel can
 * wear differently while still compiling to one cached program.
 */
export interface SurfaceUniforms {
  uBumpAmp: { value: number }
  uBumpScale: { value: number }
  uBumpAniso: { value: THREE.Vector3 }
  uDust: { value: number }
  uGrime: { value: number }
  uRoughVar: { value: number }
}

export type SurfaceKind = 'frame' | 'detail' | 'steel' | 'pad' | 'plate' | 'floor'

/**
 * How each material weathers.
 *
 * `bumpScale` is in cycles per metre, so the numbers read as physical feature
 * sizes: 12 is an 8 cm undulation, 40 is 2.5 cm.
 *
 * These are all *mesoscale* - the scale where a panel is not quite flat and a
 * tube is not quite straight. True micro-texture (powder coat's orange peel is
 * a few tenths of a millimetre) is far below a pixel at every camera station
 * in this sequence, and a normal perturbation below a pixel does not render as
 * texture, it renders as aliasing. Sub-pixel roughness is what represents it
 * correctly, which is what `roughVar` is for.
 */
const SURFACE_PRESETS: Record<SurfaceKind, {
  bumpAmp: number, bumpScale: number, aniso: [number, number, number],
  dust: number, grime: number, roughVar: number
}> = {
  // Powder coat over welded tube: gentle unevenness, dust on every upward face.
  frame:  { bumpAmp: 0.090, bumpScale: 14,  aniso: [1, 1, 1],     dust: 1.00, grime: 0.85, roughVar: 0.24 },
  // Moulded caps and feet are smoother mouldings but sit low and get filthy.
  detail: { bumpAmp: 0.055, bumpScale: 18,  aniso: [1, 1, 1],     dust: 0.70, grime: 1.15, roughVar: 0.16 },
  // Bare steel: machining marks stretched along the horn's axis, and polish
  // where plates and hands have rubbed it back.
  steel:  { bumpAmp: 0.050, bumpScale: 22,  aniso: [1, 0.22, 1],  dust: 0.55, grime: 0.35, roughVar: 0.44 },
  // Vinyl upholstery: wiped down, never dusty, and the closest surface to the
  // lens at the seated station - at 0.3 m an unbroken gradient across it reads
  // as moulded plastic, so this is the one that most needs the grain.
  pad:    { bumpAmp: 0.150, bumpScale: 34,  aniso: [1, 1, 1],     dust: 0.12, grime: 0.25, roughVar: 0.34 },
  // Footplate: tread relief plus scuffing from shoes.
  plate:  { bumpAmp: 0.130, bumpScale: 26,  aniso: [1, 1, 0.35],  dust: 0.30, grime: 0.90, roughVar: 0.50 },
  // The floor has real maps, so it wants no bump - only the world-space terms,
  // which is the one place large-scale variation can live without repeating.
  floor:  { bumpAmp: 0,     bumpScale: 1,   aniso: [1, 1, 1],     dust: 0.16, grime: 0.20, roughVar: 0.05 },
}

export function createSurfaceUniforms(kind: SurfaceKind): SurfaceUniforms {
  const s = SURFACE_PRESETS[kind]
  return {
    uBumpAmp: { value: s.bumpAmp },
    uBumpScale: { value: s.bumpScale },
    uBumpAniso: { value: new THREE.Vector3(...s.aniso) },
    uDust: { value: s.dust },
    uGrime: { value: s.grime },
    uRoughVar: { value: s.roughVar },
  }
}

export function createScanUniforms(): ScanUniforms {
  return {
    uTime: { value: 0 },
    uRimColor: { value: new THREE.Color(0x9fb3d0) },
    uRimAmp: { value: 0.044 },
    uProbe: { value: new THREE.Vector3(0, 1.1, 3) },
    uProbeRadius: { value: 0.85 },
    uProbeAmp: { value: 0 },
    uProbeLive: { value: 0 },
    uDebug: { value: 0 },
  }
}

// Shared by every injected material, analysed or not: the world-space varyings
// and the noise the surface detail is built from.
const COMMON_SURFACE = /* glsl */`
varying vec3 vLgWorldPos;
varying vec3 vLgWorldNormal;

uniform float uBumpAmp;
uniform float uBumpScale;
uniform vec3  uBumpAniso;
uniform float uDust;
uniform float uGrime;
uniform float uRoughVar;

float lgHash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float lgNoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(lgHash(i + vec3(0,0,0)), lgHash(i + vec3(1,0,0)), f.x),
        mix(lgHash(i + vec3(0,1,0)), lgHash(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(lgHash(i + vec3(0,0,1)), lgHash(i + vec3(1,0,1)), f.x),
        mix(lgHash(i + vec3(0,1,1)), lgHash(i + vec3(1,1,1)), f.x), f.y),
    f.z);
}
float lgFbm(vec3 p) {
#ifdef LG_LITE
  // Two octaves. The third sits at ~7 cycles/m, and on the one surface that
  // takes this path - the floor - it is a 14 cm ripple inside a term that
  // modulates albedo by at most 10%. It cost a third of the fbm to be
  // invisible.
  return lgNoise(p) * 0.65 + lgNoise(p * 2.03) * 0.35;
#else
  return lgNoise(p) * 0.55 + lgNoise(p * 2.03) * 0.30 + lgNoise(p * 4.11) * 0.15;
#endif
}
// Forward difference rather than a tetrahedron: lgNoise is smoothstep-filtered
// so it is C1, and three taps are enough for a bump this shallow. The epsilon
// is in the noise's own space, so it scales with uBumpScale automatically.
//
// Single-octave on purpose. Built on lgFbm this is four fbm evaluations, or
// ninety-six hash calls, on every fragment of the machine - and the extra
// octaves land below the pixel at every camera station in the sequence, so
// they were paying for detail that only ever aliased.
vec3 lgNoiseGrad(vec3 p) {
  const float e = 0.35;
  float n = lgNoise(p);
  return vec3(lgNoise(p + vec3(e, 0.0, 0.0)) - n,
              lgNoise(p + vec3(0.0, e, 0.0)) - n,
              lgNoise(p + vec3(0.0, 0.0, e)) - n) / e;
}
`

/** Only the hero carries the analysis pass, so its uniforms live separately. */
const COMMON_SCAN = /* glsl */`
uniform float uTime;
uniform vec3  uRimColor;
uniform float uRimAmp;
uniform vec3  uProbe;
uniform float uProbeRadius;
uniform float uProbeAmp;
uniform float uProbeLive;
uniform float uDebug;
`

const FRAGMENT_TAIL = /* glsl */`
  vec3 lgN = normalize(vLgWorldNormal);
  vec3 lgV = normalize(cameraPosition - vLgWorldPos);
  float lgFres = pow(1.0 - clamp(dot(lgN, lgV), 0.0, 1.0), 3.0);

  // Both terms below are *added* to the lit result, so they are absolute and
  // not relative: every time the room's exposure comes down they get louder
  // against the machine and have to come down with it.
  //
  // Always-on silhouette edge, and the only thing on the machine that is not
  // the room lighting it. Without it the machine does not read as dark, it
  // reads as absent.
  gl_FragColor.rgb += uRimColor * lgFres * uRimAmp;

  // --- cursor probe -------------------------------------------------------
  // The boundary is warped by drifting 3D noise so the reveal behaves like a
  // fluid front rather than a circular flashlight.
  if (uProbeAmp > 0.001) {
    float lgDist = length(vLgWorldPos - uProbe);
    float lgWob = lgNoise(vLgWorldPos * 2.1 + vec3(0.0, uTime * 0.22, uTime * 0.13));
    float lgR = uProbeRadius * (0.70 + 0.62 * lgWob);
    float lgProbe = (1.0 - smoothstep(lgR * 0.18, lgR, lgDist)) * uProbeAmp;
    // The flat component of the field is a fill light, and a fill light with
    // no cursor driving it is just a lift on the whole machine - idle, the
    // probe is reduced to its fresnel term and grazes edges only.
    //
    // Weighted heavily toward fresnel, and both weights kept very low. The
    // point of the cursor is that the machine is *noticing* it, which is a
    // grazing lift along the near edges - as soon as the flat term is large
    // enough to see on a face, it stops being a reaction and becomes a torch
    // being shone at the machine, and the room's darkness goes with it.
    gl_FragColor.rgb += vec3(0.58, 0.66, 0.80) * lgProbe * (lgFres * 0.13 + 0.0038 * uProbeLive);
  }

  // Dev-only channel inspector, driven from the debug handle in stage.ts.
  if (uDebug > 0.5) {
    if (uDebug < 1.5)      gl_FragColor.rgb = vec3(lgFres);
    else if (uDebug < 2.5) gl_FragColor.rgb = lgN * 0.5 + 0.5;
    else                   gl_FragColor.rgb = fract(vLgWorldPos);
    gl_FragColor.a = 1.0;
  }
`

// --- procedural surface detail ---------------------------------------------
// Runs before lighting, so it changes how the material *responds* to light
// rather than being painted on after the fact. Injected at
// <roughnessmap_fragment>, where diffuseColor and roughnessFactor both already
// exist and nothing has sampled the normal yet.
const SURFACE_DETAIL = /* glsl */`
  // Everything is keyed off world position, so the detail is anchored to the
  // machine and holds still while the camera moves - the giveaway of a
  // screen-space fake is detail that swims.
  vec3 lgSurfP = vLgWorldPos * uBumpAniso;
  vec3 lgSurfN = normalize(vLgWorldNormal);

  // Large soiling patches, panel-scale mottle, and a fine grain that stands in
  // for the micro-texture the bump cannot carry.
  float lgSoil  = lgFbm(vLgWorldPos * 1.7);
  float lgMottle = lgNoise(vLgWorldPos * 11.0);
#ifdef LG_LITE
  // 74 cycles/m against the floor's uRoughVar of 0.05 is a roughness wobble of
  // +/-0.022 - below what the grade can show - on a feature far under a pixel
  // at every camera station, which is the recipe for specular sparkle rather
  // than texture. The floor's real fine grain is in its roughness map.
  float lgFine = 0.5;
#else
  float lgFine = lgNoise(vLgWorldPos * 74.0);
#endif

  // Dust settles by gravity, so it is a function of how far a face points up
  // and nothing else. This single term does more for "used equipment" than any
  // amount of albedo tuning: it is the only cue in the frame that the machine
  // has been sitting in a room rather than being spawned in one.
  float lgUp = clamp(lgSurfN.y, 0.0, 1.0);
  float lgDust = smoothstep(0.34, 0.95, lgUp) * (0.35 + 0.65 * lgSoil) * uDust;

  // Grime creeps up from the floor - shoe scuff, chalk, mop line.
  float lgGrime = (1.0 - smoothstep(0.02, 0.42, vLgWorldPos.y))
                * (0.45 + 0.55 * lgMottle) * uGrime;

  // Dust is a thin dielectric layer: it lifts the albedo toward a dead grey
  // and takes the specular with it. Kept deliberately dark - this is a room
  // where the machine is meant to stay a silhouette.
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.0135, 0.0130, 0.0118), lgDust * 0.62);
  diffuseColor.rgb *= 1.0 - lgGrime * 0.34;

  roughnessFactor *= 1.0 + (lgMottle - 0.5) * 2.0 * uRoughVar
                         + (lgFine - 0.5) * 0.9 * uRoughVar;
  roughnessFactor = mix(roughnessFactor, 0.97, lgDust * 0.70);
  roughnessFactor = mix(roughnessFactor, 0.88, lgGrime * 0.35);
  roughnessFactor = clamp(roughnessFactor, 0.04, 1.0);
`

// Perturbs the shading normal *after* three has resolved front/back facing, so
// the bump survives on the inward-facing tubes the camera passes between.
const SURFACE_NORMAL = /* glsl */`
#ifndef LG_LITE
  if (uBumpAmp > 0.0001) {
    // Fade the bump out as its features approach a pixel. Below that it stops
    // being texture and starts being noise that crawls when the camera moves -
    // the same reason a normal map needs mips. fwidth of world position is
    // world units per pixel, so this is a direct cycles-per-pixel test.
    vec3 lgFwP = fwidth(vLgWorldPos);
    float lgTexel = max(lgFwP.x + lgFwP.y + lgFwP.z, 1e-5);
    float lgBumpFade = 1.0 - smoothstep(0.22, 0.62, uBumpScale * lgTexel);
    // viewMatrix's upper-left block is orthonormal, so multiplying on the left
    // is its inverse: this recovers the world-space normal three just decided
    // on rather than re-deriving it from the varying and losing the flip.
    vec3 lgWn = normalize((vec4(normal, 0.0) * viewMatrix).xyz);
    vec3 lgG = lgNoiseGrad(lgSurfP * uBumpScale);
    // Keep only the component in the surface plane; the along-normal part just
    // rescales the vector and does nothing.
    vec3 lgT = lgG - lgWn * dot(lgG, lgWn);
    // Dust fills the micro-relief in, so a dusty face is a flatter face.
    vec3 lgWp = normalize(lgWn + lgT * uBumpAmp * lgBumpFade * (1.0 - lgDust * 0.55));
    normal = normalize((viewMatrix * vec4(lgWp, 0.0)).xyz);
  }
#endif
`

const VERTEX_WORLD = /* glsl */`#include <project_vertex>
        vLgWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
        vLgWorldNormal = normalize(mat3(modelMatrix) * objectNormal);`

function injectSurface(shader: { vertexShader: string, fragmentShader: string }, lite = false): void {
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nvarying vec3 vLgWorldPos;\nvarying vec3 vLgWorldNormal;')
    .replace('#include <project_vertex>', VERTEX_WORLD)
  shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', `#include <common>\n${lite ? '#define LG_LITE\n' : ''}${COMMON_SURFACE}`)
    .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>\n${SURFACE_DETAIL}`)
    .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>\n${SURFACE_NORMAL}`)
}

/**
 * Procedural weathering only - no analysis pass, and on the reduced `LG_LITE`
 * path.
 *
 * The floor gets this and not `applyScanShader`. The sequence is about one
 * machine being read, and a scan plane that also swept across the ground the
 * machine is standing on would say the opposite.
 *
 * It is also the one surface that covers most of the screen, so it is the one
 * place where the per-fragment cost of this detail actually decides the frame
 * rate. `LG_LITE` drops the two noise evaluations that the floor's own
 * parameters make invisible - the 74 cycles/m grain and the third fbm octave -
 * and compiles out the bump block entirely, which the floor preset disables
 * anyway. Five noise lookups become three.
 */
export function applySurfaceShader(material: THREE.Material, surface: SurfaceUniforms): void {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, surface)
    injectSurface(shader, true)
  }
  material.customProgramCacheKey = () => 'liftag-surface'
  material.needsUpdate = true
}

/**
 * Injects the analysis shader into a standard/physical material in place.
 * Safe to call on every material of the hero GLB - they all share `uniforms`.
 *
 * `surface` is per-material and is *not* shared, which is what lets vinyl,
 * powder coat and bare steel weather differently. Three keys its program cache
 * on `customProgramCacheKey`, not on uniform values, so they still compile
 * once between them.
 */
export function applyScanShader(
  material: THREE.Material,
  uniforms: ScanUniforms,
  surface: SurfaceUniforms,
): void {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms, surface)
    injectSurface(shader)
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${COMMON_SCAN}`)
      .replace('#include <dithering_fragment>', `#include <dithering_fragment>\n${FRAGMENT_TAIL}`)
  }
  // All injected materials compile to the same program shape, so one key is
  // enough to keep them sharing cached programs.
  material.customProgramCacheKey = () => 'liftag-machine-scan'
  material.needsUpdate = true
}
