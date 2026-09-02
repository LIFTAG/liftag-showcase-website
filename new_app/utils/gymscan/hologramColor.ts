// Cage colour and draw rules, extracted from the hologram shader so they can
// be unit-tested without WebGL.
//
// The travelling core and the cursor blob share the scanner-bracket chrome
// (the four L-corners). The reconstructed mesh behind the line stays the
// room's cool white, so a full-body lime cage cannot green the shot.

/** Cool-white reconstructed mesh. Same units as the cage shader's `uWireColor`. */
export const WIRE_RGB = [0.62, 0.80, 1.0] as const
/**
 * Untonemapped scanner chrome. Same vec3 as the L-corner overlay
 * (`reticleOverlay.ts`), which is drawn with `toneMapped: false`.
 */
export const RETICLE_RGB = [0.80, 1.0, 0.0] as const
/** Sweep core and cursor blob. Alias of the L-corner colour. */
export const CORE_RGB = RETICLE_RGB

export const CAGE_BODY_GAIN = 0.14
export const CAGE_CORE_GAIN = 0.95
/** Local cursor cage. Louder than the trail: a small patch of chrome, not a fill. */
export const CAGE_PROBE_GAIN = 0.26
/** Same epsilon the shell used to hide itself between sweep cycles. */
export const CAGE_DRAW_EPS = 0.002
/**
 * Screen-space probe radius in aspect-corrected CSS NDC. 0.24 is ~12% of
 * the viewport height: enough to read the cage under the pointer, not enough
 * to light the machine from a screen corner.
 */
export const CAGE_PROBE_SCREEN_RADIUS = 0.24
/** Inner falloff as a fraction of the screen radius. */
export const CAGE_PROBE_SCREEN_INNER = 0.22

export interface CageDrawState {
  envelope: number
  cageAmp: number
  probeAmp: number
  steady: boolean
}

export interface CageMixWeights {
  core: number
  trail: number
  probe: number
  /**
   * Reduced-motion gray floor. Any value > 0 forces lime (core and probe)
   * to zero so a parked band cannot paint a lime cap on the machine.
   */
  steady?: number
}

export interface Rgb {
  r: number
  g: number
  b: number
}

/**
 * Whether the cage mesh should be submitted this frame.
 *
 * Envelope still gates everything off. Between sweep cycles the shell stays
 * up when the cursor probe is live, and reduced-motion keeps the faint gray
 * cage without a travelling line.
 *
 * `probeAmp` is the live-gated field (`amp * live`). The idle 0.16 surface
 * graze must not be passed here or the cage would stay submitted all window.
 */
export function cageShouldDraw(s: CageDrawState): boolean {
  if (s.envelope <= 0) return false
  if (s.steady) return true
  return s.cageAmp > CAGE_DRAW_EPS || s.probeAmp > CAGE_DRAW_EPS
}

/**
 * Shader colour contract, minus wire/facing/amp:
 *   grayWeight = max(trail * bodyGain, steady)
 *   limeWeight = core * coreGain + probe * probeGain   (zeroed when steady > 0)
 *   col        = WIRE * grayWeight + RETICLE * limeWeight
 */
export function cageMixColor(w: CageMixWeights): Rgb {
  const steady = w.steady ?? 0
  const core = steady > 0 ? 0 : w.core
  const probe = steady > 0 ? 0 : w.probe
  const grayWeight = Math.max(w.trail * CAGE_BODY_GAIN, steady)
  const limeWeight = core * CAGE_CORE_GAIN + probe * CAGE_PROBE_GAIN
  return {
    r: WIRE_RGB[0] * grayWeight + CORE_RGB[0] * limeWeight,
    g: WIRE_RGB[1] * grayWeight + CORE_RGB[1] * limeWeight,
    b: WIRE_RGB[2] * grayWeight + CORE_RGB[2] * limeWeight,
  }
}

/**
 * How much of the cursor cage a fragment receives, in CSS NDC (y down,
 * matching `useSharedMouse`). Aspect-correct so the blob is circular on
 * screen: a pointer in the corner cannot light a machine in the middle.
 */
export function screenProbeWeight(
  fragX: number,
  fragY: number,
  pointerX: number,
  pointerY: number,
  aspect: number,
  radius: number = CAGE_PROBE_SCREEN_RADIUS,
): number {
  const dx = (fragX - pointerX) * aspect
  const dy = fragY - pointerY
  const dist = Math.hypot(dx, dy)
  const inner = radius * CAGE_PROBE_SCREEN_INNER
  if (dist <= inner) return 1
  if (dist >= radius) return 0
  const t = (dist - inner) / Math.max(radius - inner, 1e-6)
  return 1 - t * t * (3 - 2 * t)
}
