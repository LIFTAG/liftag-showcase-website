// The one dispersion ramp, shared by every surface that splits light.
//
// These stops are lifted from `--liftag-prism-fringe` in assets/css/main.css,
// which draws the spin rim on the LIFTAG mark and the scan targets. The whole
// point of reusing them is that the roadmap shows the *same* spectrum the
// crystal refracts, so the palette lives here once and every consumer reads it
// from this file - a 2D canvas in Roadmap.vue, and GLSL uniforms in
// RoadmapParticles.vue. Do not retype these numbers at a call site.
//
// `at` is the stop's position along the ramp, not an even division: lime sits
// early and deliberately, because lime is the brand and the ramp has to pass
// through it rather than treat it as one colour among five.

export interface PrismStop {
  /** Position along the ramp, 0..1. Ascending, first is 0, last is 1. */
  at: number
  /** sRGB 0-255, matching the CSS fringe stop it came from. */
  rgb: readonly [number, number, number]
}

export const PRISM_SPECTRUM: readonly PrismStop[] = [
  { at: 0.00, rgb: [150, 255, 225] }, // mint - the short-wavelength fringe
  { at: 0.42, rgb: [204, 255,   0] }, // lime - LIFTAG, and the ramp's anchor
  { at: 0.62, rgb: [255, 246, 190] }, // the hot core where the fringes cross
  { at: 0.80, rgb: [255, 178,  30] }, // amber
  { at: 1.00, rgb: [255,  45,  85] }, // red - the long-wavelength fringe
]

/** Where lime sits. Anything fanning out of a common origin starts here. */
export const PRISM_LIME_AT = PRISM_SPECTRUM[1]!.at

// The particle field emits additively, so its colours are authored a touch
// below full sRGB or the overlaps blow out to white. This is the factor that
// turns the lime stop above into the (0.74, 0.94, ~0) the field already used.
const EMISSIVE_SCALE = 0.93

/** Shader-side palette: same stops, 0..1 floats, scaled for additive blending. */
export const PRISM_SPECTRUM_EMISSIVE: readonly (readonly [number, number, number])[] =
  PRISM_SPECTRUM.map(({ rgb }) => [
    (rgb[0] / 255) * EMISSIVE_SCALE,
    (rgb[1] / 255) * EMISSIVE_SCALE,
    (rgb[2] / 255) * EMISSIVE_SCALE,
  ] as const)

/**
 * GLSL body that ramps `t` through the stops into `c`, generated from the table
 * above so the shader cannot drift from the canvas. Expects a `vec3 uSpectrum[N]`
 * uniform in scope and declares `c` itself.
 */
export const PRISM_RAMP_GLSL: string = [
  'vec3 c = uSpectrum[0];',
  ...PRISM_SPECTRUM.slice(1).map((stop, i) =>
    `c = mix(c, uSpectrum[${i + 1}], smoothstep(${PRISM_SPECTRUM[i]!.at.toFixed(3)}, ${stop.at.toFixed(3)}, t));`,
  ),
].join('\n    ')

/** Canvas-side sampling. Returns sRGB 0-255, linearly interpolated between stops. */
export function samplePrismSpectrum(t: number): [number, number, number] {
  const p = t <= 0 ? 0 : t >= 1 ? 1 : t

  let hi = 1
  while (hi < PRISM_SPECTRUM.length - 1 && PRISM_SPECTRUM[hi]!.at < p) hi++

  const a = PRISM_SPECTRUM[hi - 1]!
  const b = PRISM_SPECTRUM[hi]!
  const span = b.at - a.at
  const k = span > 0 ? (p - a.at) / span : 0

  return [
    Math.round(a.rgb[0] + (b.rgb[0] - a.rgb[0]) * k),
    Math.round(a.rgb[1] + (b.rgb[1] - a.rgb[1]) * k),
    Math.round(a.rgb[2] + (b.rgb[2] - a.rgb[2]) * k),
  ]
}

/** `rgba(...)` string for the canvas, at a point on the ramp. */
export function prismStroke(t: number, alpha: number): string {
  const [r, g, b] = samplePrismSpectrum(t)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
