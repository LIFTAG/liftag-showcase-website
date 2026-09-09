// Cage colour and draw rules, extracted from the hologram shader so they can
// be unit-tested without WebGL.
//
// The travelling core is scanner-bracket chrome (the four L-corners). The
// reconstructed mesh behind the line, and the cursor's local patch, stay the
// room's cool white, so a full-body lime cage cannot green the shot.

/** Cool-white reconstructed mesh. Same units as the cage shader's `uWireColor`. */
export const WIRE_RGB = [0.62, 0.80, 1.0] as const
/**
 * Untonemapped scanner chrome. Same vec3 as the L-corner overlay
 * (`reticleOverlay.ts`), which is drawn with `toneMapped: false`.
 */
export const RETICLE_RGB = [0.80, 1.0, 0.0] as const
/** Sweep core and floor-ring front. Alias of the L-corner colour. */
export const CORE_RGB = RETICLE_RGB
/**
 * Activation front. Paler and warmer than scanner lime so the plant is an
 * ignition, not another read of the same chrome. Idle sweep never uses this.
 */
export const HOT_RGB = [1.0, 1.0, 0.88] as const
/**
 * Plant hologram body. True signal green — not the cool-white reconstructed
 * mesh, not scanner lime (which is yellow-green with no blue).
 */
export const ACTIVATE_RGB = [0.00, 0.92, 0.34] as const
/**
 * Tag ignition on the plant pass. Brighter green, still not lime and not white.
 */
export const ACTIVATE_HOT_RGB = [0.08, 1.00, 0.42] as const

export const CAGE_BODY_GAIN = 0.14
export const CAGE_CORE_GAIN = 0.95
/** Cool-white interior of the activation sphere, added to grayWeight. */
export const CAGE_FILL_GAIN = 0.30
/** Cool-white lock pulse on top of the fill. Louder than the idle trail. */
export const CAGE_LOCK_GAIN = 0.36
/** Local cursor cage. Louder than the trail: a small gray patch, not a fill. */
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
   * Reduced-motion gray floor. Any value > 0 forces lime (core) to zero
   * so a parked band cannot paint a lime cap on the machine. The cursor
   * probe is gray, so it still contributes.
   */
  steady?: number
  /** Cool-white interior of the activation sphere. Already gained. */
  fill?: number
  /** Cool-white lock pulse. Already gained. */
  lock?: number
  /** 0 = scanner lime, 1 = HOT_RGB. Activation front only. */
  hot?: number
}

export interface Rgb {
  r: number
  g: number
  b: number
}

/**
 * How loud the cursor probe is this frame, 0..1.
 *
 * Live as soon as the planted machine exists, including the Act 0 hold
 * *before* the QR flies in. Gating on `assembleLive` deferred it until after
 * the press: 0B stays the current shot until the last millisecond of the
 * rain, which is exactly the native-scroll hold the gym page parks on.
 *
 * A falling mesh is not a surface to read yet (`dropLive`). After Act 1
 * starts, `approachMix` already fades the field out as the dolly commits
 * to the plate.
 */
export function cursorProbeReach(opts: {
  act1Live: boolean
  machineLive: boolean
  dropLive: boolean
  planted: boolean
  approachMix: number
}): number {
  if (!opts.act1Live) {
    return opts.machineLive && !opts.dropLive && opts.planted ? 1 : 0
  }
  return opts.approachMix
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
 *   grayWeight = max(trail * bodyGain + probe * probeGain + fill + lock, steady)
 *   limeWeight = core * coreGain   (zeroed when steady > 0)
 *   coreCol    = mix(RETICLE, HOT, hot)
 *   col        = WIRE * grayWeight + coreCol * limeWeight
 */
export function cageMixColor(w: CageMixWeights): Rgb {
  const steady = w.steady ?? 0
  const core = steady > 0 ? 0 : w.core
  const hot = w.hot ?? 0
  const grayWeight = Math.max(
    w.trail * CAGE_BODY_GAIN + w.probe * CAGE_PROBE_GAIN + (w.fill ?? 0) + (w.lock ?? 0),
    steady,
  )
  const limeWeight = core * CAGE_CORE_GAIN
  const cr = CORE_RGB[0] * (1 - hot) + HOT_RGB[0] * hot
  const cg = CORE_RGB[1] * (1 - hot) + HOT_RGB[1] * hot
  const cb = CORE_RGB[2] * (1 - hot) + HOT_RGB[2] * hot
  return {
    r: WIRE_RGB[0] * grayWeight + cr * limeWeight,
    g: WIRE_RGB[1] * grayWeight + cg * limeWeight,
    b: WIRE_RGB[2] * grayWeight + cb * limeWeight,
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
