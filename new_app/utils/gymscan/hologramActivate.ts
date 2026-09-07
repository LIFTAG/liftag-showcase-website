// One-shot activation pass, played the frame the QR sticker lands.
//
// Idle is a read: a lime line walks the machine. Activation is the tag
// coming online. The sticker itself flashes first, then a cool-white
// skeleton grows out of that point. There is no travelling lime front and
// no floor shockwave — those are the periodic sweep. Lime on this pass
// lives only on the tag (the print, and a local cage bloom on the beam).
//
// Pure functions so the choreography can be unit-tested without WebGL.

import {
  inverseKickTravel,
  smooth01,
} from './hologramPass.ts'

/** Seconds the cool-white fill takes to cover the cage. Gentler than the
 *  idle kick so the growth is seen leaving the sticker. */
export const ACTIVATE_TRAVEL = 1.12
/** Whole pass: tag flash, fill, lock, fade. */
export const ACTIVATE_SPAN = 1.85
/** Soft edge of the growing fill, metres. Not a scan trail. */
export const ACTIVATE_TRAIL = 0.55
/** Unused as a travelling core. Kept so the cage uniform stays defined. */
export const ACTIVATE_CORE = 0.040
/** Floor ping is retired: it read as another sweep. Kept for the renderer. */
export const ACTIVATE_FLOOR_MAX_R = 1.72
export const ACTIVATE_SPLASH = 0.72
/** Local cage bloom on the beam, metres. About the sticker. */
const IGNITE_CORE = 0.072
const IN_RAMP = 0.10
const LOCK_IN = 1.02
const LOCK_PEAK = 1.20
const LOCK_OUT = 1.58
/** Gentler than hologramPass KICK (3.1) so the origin stays readable. */
const COVER_KICK = 1.20

function coverTravel(u: number): number {
  const t = u < 0 ? 0 : u > 1 ? 1 : u
  const end = 1 - Math.exp(-COVER_KICK)
  return (1 - Math.exp(-COVER_KICK * t)) / end
}

export interface HologramActivateOpts {
  /** Distance from the sticker to the farthest cage vertex, metres. */
  maxR: number
  /** World Y of the sticker. The floor ping waits until the sphere reaches it. */
  originY: number
  stemR: number
  floorMaxR?: number
}

export interface HologramActivate {
  /** Metres from the sticker. */
  frontR: number
  cageAmp: number
  cageTrail: number
  coreWidth: number
  /** Local cage bloom at the sticker. Holds through the fill so the source stays. */
  ignite: number
  /** Cool-white silhouette pulse. Does not add lime. */
  lock: number
  /**
   * Cool-white interior of the sphere, 0..1. Grows out of the tag after the
   * sticker has already flashed.
   */
  fill: number
  /** 0 = scanner lime, 1 = white-hot. Stays on the tag bloom. */
  hot: number
  /** Print emission on the sticker itself, 0..1. The cause, not the cage. */
  tag: number
  /** Unused on this pass: there is no travelling core to spark. */
  spark: number
  groundAmp: number
  waveR: number
  wakeR: number
  splashU: number
  groundDraw: boolean
}

function off(opts: HologramActivateOpts): HologramActivate {
  return {
    frontR: 0.04,
    cageAmp: 0,
    cageTrail: ACTIVATE_TRAIL,
    coreWidth: IGNITE_CORE,
    ignite: 0,
    lock: 0,
    fill: 0,
    hot: 0,
    tag: 0,
    spark: 0,
    groundAmp: 0,
    waveR: opts.stemR,
    wakeR: 0.11,
    splashU: 0,
    groundDraw: false,
  }
}

/** Print emission on the sticker. Independent of cage geometry. */
export function hologramActivateTag(t: number, envelope: number): number {
  return hologramActivateAt(t, envelope, { maxR: 1, originY: 1, stemR: 0.3 }).tag
}

/** Seconds into the pass at which the expanding sphere reaches the mat. */
export function activateFloorTime(opts: HologramActivateOpts): number {
  const span = Math.max(opts.maxR, 1e-4)
  const s = Math.min(1, Math.max(0, opts.originY / span))
  return inverseKickTravel(s) * ACTIVATE_TRAVEL
}

/**
 * One sample of the activation. `t` is seconds since the sticker planted.
 * Envelope is the same scroll gate the idle cage uses.
 */
export function hologramActivateAt(
  t: number,
  envelope: number,
  opts: HologramActivateOpts,
): HologramActivate {
  const idle = off(opts)
  if (envelope <= 0.001 || t < 0 || t > ACTIVATE_SPAN) return idle

  const inRamp = Math.min(t / IN_RAMP, 1)
  const fade = 1 - smooth01(1.40, ACTIVATE_SPAN, t)
  const covered = t >= ACTIVATE_TRAVEL ? 1 : coverTravel(t / ACTIVATE_TRAVEL)
  const frontR = 0.04 + (opts.maxR - 0.04) * covered
  const cageAmp = envelope * inRamp * fade
  const cageTrail = ACTIVATE_TRAIL
  const coreWidth = IGNITE_CORE
  // Sticker first. The cage bloom on the beam holds so the source is still
  // there while the skeleton grows out of it.
  const tag = envelope * inRamp * fade * (0.40 + 0.60 * (1 - smooth01(0.08, 0.36, t)))
  const ignite = envelope * inRamp * fade * (0.35 + 0.65 * (1 - smooth01(0.10, 0.42, t)))
  const hot = envelope * inRamp * fade * (1 - smooth01(0.55, 1.10, t))
  const lock = envelope * smooth01(LOCK_IN, LOCK_PEAK, t) * (1 - smooth01(LOCK_PEAK, LOCK_OUT, t))
  // Fill waits for the tag flash so the growth has a visible origin.
  const fill = envelope * inRamp * fade * smooth01(0.14, 0.32, t) * (0.20 + 0.80 * covered)
  const spark = 0

  return {
    frontR,
    cageAmp,
    cageTrail,
    coreWidth,
    ignite,
    lock,
    fill,
    hot,
    tag,
    spark,
    groundAmp: 0,
    waveR: opts.stemR,
    wakeR: 0.11,
    splashU: 0,
    groundDraw: false,
  }
}
