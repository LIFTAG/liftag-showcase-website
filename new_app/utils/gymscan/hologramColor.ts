// Cage colour and draw rules, extracted from the hologram shader so they can
// be unit-tested without WebGL.
//
// Lime is the travelling core only - a line, not a second machine. The
// reconstructed mesh (sweep trail, cursor blob, reduced-motion shell) is the
// room's cool white. Mixing them as a max of gray weights plus a thin lime
// add keeps the hues from collapsing into pale sludge on the same triangles.

/** Cool-white reconstructed mesh. Same units as the cage shader's `uWireColor`. */
export const WIRE_RGB = [0.62, 0.80, 1.0] as const
/** Brand lime `#CCFF00`. Sweep core only. Same units as `uCoreColor`. */
export const CORE_RGB = [0xcc / 255, 1, 0] as const

export const CAGE_BODY_GAIN = 0.14
export const CAGE_CORE_GAIN = 0.95
/** Cursor blob on the cage. Matches body gain so probe and trail read as one mesh. */
export const CAGE_PROBE_GAIN = 0.14
/** Same epsilon the shell used to hide itself between sweep cycles. */
export const CAGE_DRAW_EPS = 0.002

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
   * Reduced-motion gray floor. Any value > 0 forces the core (lime) weight
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
 *   grayWeight = max(trail * bodyGain, probe * probeGain, steady)
 *   limeWeight = core * coreGain   (zeroed when steady > 0)
 *   col        = WIRE * grayWeight + CORE * limeWeight
 */
export function cageMixColor(w: CageMixWeights): Rgb {
  const steady = w.steady ?? 0
  const core = steady > 0 ? 0 : w.core
  const grayWeight = Math.max(
    w.trail * CAGE_BODY_GAIN,
    w.probe * CAGE_PROBE_GAIN,
    steady,
  )
  const limeWeight = core * CAGE_CORE_GAIN
  return {
    r: WIRE_RGB[0] * grayWeight + CORE_RGB[0] * limeWeight,
    g: WIRE_RGB[1] * grayWeight + CORE_RGB[1] * limeWeight,
    b: WIRE_RGB[2] * grayWeight + CORE_RGB[2] * limeWeight,
  }
}
