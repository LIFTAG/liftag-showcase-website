// Timing for the hologram sweep and the floor shockwave it becomes.
//
// Pure functions so the choreography can be unit-tested without WebGL. The
// renderer in hologram.ts is a thin playback of these numbers.

/** Free-running period of one idle pass, seconds. */
export const PERIOD = 4.40
/** How long the line takes to travel the machine. */
export const TRAVEL = 1.70
/**
 * How long the floor splash lasts after the line reaches the ground.
 * Starts PEEL before contact, so the ring is already travelling when the
 * line arrives - that overlap is what makes the two read as one motion
 * rather than a parked stem that then takes off.
 */
export const SPLASH = 1.36
/** One full idle pass: line travel plus the splash that finishes it. */
export const PASS_SPAN = TRAVEL + SPLASH
/** Trail length on the machine cage, metres. */
export const TRAIL = 0.22
/** Launch hardness. Same family as the cage: fast start, no overshoot. */
export const KICK = 3.1
/**
 * Height above the floor where the line is on the lowest tubes. Used as a
 * bound: the floor must still be dark here. The old pass lit a parked stem
 * ring between this and Y_CONTACT (~250 ms of fade, no motion), which is
 * what made the handoff stutter.
 */
export const Y_APPROACH = 0.18
/** Height where the descending line meets the mat. */
export const Y_CONTACT = 0.04
/**
 * Cage bounds the birth sweep runs between. They live here, with the pass they
 * parameterise, rather than in `floorConstruct`: the slab field needs them to
 * fix its own clock, and the plane needs the slab field's spread law, so any
 * other home for them is an import cycle. `floorConstruct` re-exports them.
 */
export const FLOOR_Y_TOP = 1.55
export const FLOOR_Y_BOTTOM = -0.02
/**
 * Seconds before contact that the ring starts travelling. Short enough that
 * the front is still at the feet when the line arrives; long enough that
 * the floor is already a moving front rather than a parked ring that then
 * takes off.
 */
export const PEEL = 0.05
/** Splash-U over which floor amp rises. Coupled to expansion, so a still
 *  ring is never visible. */
const APPEAR_U = 0.04

export interface HologramPassOpts {
  yTop: number
  yBottom: number
  stemR: number
  maxR: number
}

export interface HologramPass {
  bandY: number
  cageAmp: number
  cageTrail: number
  groundAmp: number
  waveR: number
  /** Metres of reconstructed mesh behind the front. A band, not a disc. */
  wakeR: number
  /**
   * 0 when the ring starts travelling (PEEL before contact), 1 when the
   * splash has finished expanding.
   */
  splashU: number
  /**
   * Draw the floor mesh this frame. True slightly before amp comes up so
   * the first lit frame is not also the mesh's first draw.
   */
  groundDraw: boolean
}

/**
 * Floor expansion. Gentler than the cage kick so the front stays a readable
 * ring for most of the pass instead of jumping to full radius in a fifth of
 * a second and leaving the rest as a filled disc waiting to fade.
 */
const SPLASH_KICK = 1.45

export function splashTravel(u: number): number {
  const t = u < 0 ? 0 : u > 1 ? 1 : u
  const end = 1 - Math.exp(-SPLASH_KICK)
  return (1 - Math.exp(-SPLASH_KICK * t)) / end
}

export function kickTravel(u: number): number {
  const t = u < 0 ? 0 : u > 1 ? 1 : u
  const end = 1 - Math.exp(-KICK)
  return (1 - Math.exp(-KICK * t)) / end
}

export function inverseKickTravel(s: number): number {
  const y = s < 0 ? 0 : s > 1 ? 1 : s
  const end = 1 - Math.exp(-KICK)
  const inner = 1 - y * end
  if (inner <= 1e-6) return 1
  const u = -Math.log(inner) / KICK
  return u < 0 ? 0 : u > 1 ? 1 : u
}

export function smooth01(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

/** Time, within one period, at which the descending line reaches `y`. */
export function timeAtHeight(y: number, yTop: number, yBottom: number): number {
  const span = yTop - yBottom
  if (span <= 1e-6) return 0
  const s = (yTop - y) / span
  return inverseKickTravel(s) * TRAVEL
}

/**
 * One sample of the idle pass. `t` is seconds into the current period
 * (already wrapped). Envelope is the scroll gate.
 *
 * After TRAVEL the cage is dark, but the splash keeps running until
 * contact + SPLASH so the floor can finish the motion the line started.
 */
export function hologramPassAt(
  t: number,
  envelope: number,
  opts: HologramPassOpts,
): HologramPass {
  const off: HologramPass = {
    bandY: opts.yTop,
    cageAmp: 0,
    cageTrail: TRAIL,
    groundAmp: 0,
    waveR: opts.stemR,
    wakeR: 0.42,
    splashU: 0,
    groundDraw: false,
  }
  if (envelope <= 0.001) return off

  const tContact = timeAtHeight(Y_CONTACT, opts.yTop, opts.yBottom)
  const tPeel = Math.max(0, tContact - PEEL)
  const splashEnd = tContact + SPLASH
  if (t > splashEnd && t > TRAVEL) return off

  const inRamp = Math.min(t / 0.11, 1)
  const onMachine = t <= TRAVEL
  const s = onMachine ? kickTravel(t / TRAVEL) : 1
  const bandY = opts.yTop + (opts.yBottom - opts.yTop) * s
  const cageAmp = onMachine
    ? envelope * inRamp * (1 - smooth01(1.42, 1.68, t))
    : 0
  const cageTrail = TRAIL * (1 - smooth01(0.88, 1.00, s))

  // One clock through the handoff: radius starts moving PEEL before the
  // line arrives, amp follows the moving front. A still ring is never lit.
  const splashU = t <= tPeel ? 0 : Math.min(1, (t - tPeel) / SPLASH)
  const grown = splashTravel(splashU)
  const splashOut = 1 - smooth01(0.78, 1.00, splashU)
  const appear = splashU <= 0 ? 0 : Math.min(1, splashU / APPEAR_U)
  const groundAmp = envelope * inRamp * appear * splashOut
  const groundDraw = t >= tPeel - 0.05 && t <= splashEnd
  const waveR = opts.stemR + (opts.maxR - opts.stemR) * grown
  // Thin at the stem so the first readable floor is a line around the
  // feet, not a pad filling the base that then opens. Grows a little as
  // the front moves out, still a band rather than a disc.
  const wakeR = 0.11 + grown * 0.16

  return { bandY, cageAmp, cageTrail, groundAmp, waveR, wakeR, splashU, groundDraw }
}
