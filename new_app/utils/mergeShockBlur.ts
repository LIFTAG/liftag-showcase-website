/**
 * Cheap shockwave blur for the merge section.
 *
 * A backdrop-filter on MergeBurstHalo itself is not cheap: the outer ring's
 * border box is viewport-sized (72vmax × ~2.6), and even a ring mask still
 * snapshots that box. Underneath is the particle canvas, so the browser would
 * re-blur a full-scene moving backdrop on every --finale-p tick.
 *
 * The affordable version is a copy-column overlay: same ring geometry, fixed
 * blur radius, box only as big as the left text. Toggle the backdrop-filter
 * on only while the outer ring is actually crossing.
 */

export const MERGE_SHOCK_BLEED = 28

/** Matches MergeBurstHalo span 3, the wave that reaches the left copy. */
export const MERGE_SHOCK_BANG = 0.12
export const MERGE_SHOCK_RISE = 0.1
export const MERGE_SHOCK_FADE = 0.72

export function shockOriginInCopy(
  rayOriginX: number,
  rayOriginY: number,
  copyLeftInSticky: number,
  copyTopInSticky: number,
  bleed = MERGE_SHOCK_BLEED,
) {
  return {
    x: rayOriginX - copyLeftInSticky + bleed,
    y: rayOriginY - copyTopInSticky + bleed,
  }
}

export function shockBlurActive(
  finaleP: number,
  opts: { reduceMotion?: boolean; mobile?: boolean } = {},
) {
  if (opts.reduceMotion || opts.mobile) return false
  const start = MERGE_SHOCK_BANG
  const end = MERGE_SHOCK_BANG + MERGE_SHOCK_RISE + MERGE_SHOCK_FADE
  return finaleP >= start && finaleP <= end
}
