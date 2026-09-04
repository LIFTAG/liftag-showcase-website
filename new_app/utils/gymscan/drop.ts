// Analytic drop-and-bounce for the hero machine's entry.
//
// One group translation, no solver, no extra meshes. Height after each bounce
// is e² of the last apex, so two readable hops and a plant, then it is done
// and the stage stops writing. Theatrical gravity (not 9.81) so a 3.8 m drop
// reads as weight instead of a one-second hang in frame.

export const DROP_HEIGHT = 3.8
export const DROP_G = 24
export const DROP_RESTITUTION = 0.33
/** Seconds from release to first floor contact. */
export const DROP_IMPACT = Math.sqrt((2 * DROP_HEIGHT) / DROP_G)
/** Apex below this is treated as planted, metres. */
export const DROP_SETTLE = 0.012
/** Contact blob is fully stated once the feet are this close, metres. */
export const DROP_SHADOW_RANGE = 0.9

export interface DropPose {
  y: number
  /** True from first floor contact onward, including the hops after it. */
  impacted: boolean
  done: boolean
}

export const PLANTED_DROP: DropPose = { y: 0, impacted: true, done: true }

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

/**
 * Height of the machine above its rest pose at time `t` (seconds from
 * release). Always ≥ 0. `t <= 0` is the hang at DROP_HEIGHT.
 */
export function dropAt(t: number): DropPose {
  if (t <= 0) return { y: DROP_HEIGHT, impacted: false, done: false }

  let h = DROP_HEIGHT
  let tLeft = t
  let hop = 0
  for (let i = 0; i < 12; i++) {
    const tDown = Math.sqrt((2 * h) / DROP_G)
    if (tLeft < tDown) {
      const y = h - 0.5 * DROP_G * tLeft * tLeft
      return { y: y < 0 ? 0 : y, impacted: hop > 0, done: false }
    }
    tLeft -= tDown
    hop++
    h *= DROP_RESTITUTION * DROP_RESTITUTION
    if (h < DROP_SETTLE) return PLANTED_DROP
    const tUp = Math.sqrt((2 * h) / DROP_G)
    if (tLeft < tUp) {
      const v0 = Math.sqrt(2 * DROP_G * h)
      const y = v0 * tLeft - 0.5 * DROP_G * tLeft * tLeft
      return { y: y < 0 ? 0 : y, impacted: true, done: false }
    }
    tLeft -= tUp
  }
  return PLANTED_DROP
}

/**
 * Same hop algebra, scaled to a different release height. Time stretches with
 * sqrt(height) so a short drop is snappier, not a slow-motion 3.8 m fall.
 */
export function dropAtHeight(t: number, height: number): DropPose {
  if (height <= 0) return PLANTED_DROP
  const scale = height / DROP_HEIGHT
  const pose = dropAt(t / Math.sqrt(scale))
  return { y: pose.y * scale, impacted: pose.impacted, done: pose.done }
}

export function dropDurationFor(height: number): number {
  if (height <= 0) return 0
  return DROP_DURATION * Math.sqrt(height / DROP_HEIGHT)
}

/** Seconds until `dropAt` reports planted. Binary-searched so it stays in
 *  lockstep with DROP_* without restating the hop algebra. */
export const DROP_DURATION = (() => {
  let lo = 0
  let hi = 8
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2
    if (dropAt(mid).done) hi = mid
    else lo = mid
  }
  return hi
})()

/** 0 at DROP_SHADOW_RANGE, 1 on the floor. Squared by the caller if a tighter
 *  falloff is wanted; this is the linear proximity. */
export function dropPlanted(y: number): number {
  return clamp01(1 - y / DROP_SHADOW_RANGE)
}

/**
 * Map drop time onto the hologram pass so the floor peel coincides with
 * first impact. The cage travel is compressed into the fall; after contact
 * the clocks run 1:1 and the splash plays in real time.
 */
export function firstSweepTime(dropT: number, peelTime: number): number {
  const t = dropT < 0 ? 0 : dropT
  if (peelTime <= 0) return t
  if (t <= DROP_IMPACT) return peelTime * (t / DROP_IMPACT)
  return peelTime + (t - DROP_IMPACT)
}
