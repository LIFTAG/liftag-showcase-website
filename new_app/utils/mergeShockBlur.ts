/**
 * Cheap shockwave blur for the merge section.
 *
 * A backdrop-filter on MergeBurstHalo itself is not cheap: the outer ring's
 * border box is viewport-sized (72vmax × ~2.6), and even a ring mask still
 * snapshots that box. Underneath is the particle canvas, so the browser would
 * re-blur a full-scene moving backdrop on every --finale-p tick.
 *
 * The affordable version is a copy-column overlay: same ring geometry, fixed
 * blur radius, box only as big as the left text. The mask is written from JS
 * each frame so the band actually travels with the wave. A CSS-variable mask
 * on backdrop-filter often paints once and then sticks, which reads as a
 * single-frame flash. The band is a fat trailing front, not a 1px outline,
 * so it stays on the copy while the wave crosses instead of flickering past.
 */

export const MERGE_SHOCK_BLEED = 28

/** Matches MergeBurstHalo span 3, the wave that reaches the left copy. */
export const MERGE_SHOCK_BANG = 0.12
export const MERGE_SHOCK_RISE = 0.1
export const MERGE_SHOCK_FADE = 0.72
export const MERGE_SHOCK_EASE_START = 0.08
export const MERGE_SHOCK_SIZE_VMAX = 0.72
export const MERGE_SHOCK_S0 = 0.1
export const MERGE_SHOCK_S1 = 2.48

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

export function shockBurstEase(finaleP: number) {
  const t = Math.min(1, Math.max(0, (finaleP - MERGE_SHOCK_EASE_START) / (1 - MERGE_SHOCK_EASE_START)))
  return 1 - (1 - t) ** 3
}

export function shockwaveRadiusPx(finaleP: number, vmax: number) {
  const scale = MERGE_SHOCK_S0 + shockBurstEase(finaleP) * MERGE_SHOCK_S1
  return (vmax * MERGE_SHOCK_SIZE_VMAX * scale) / 2
}

/** Percentage stops of closest-side: a wide trailing front around the outline. */
export const MERGE_SHOCK_MASK_IMAGE
  = 'radial-gradient(circle closest-side, transparent 42%, #000 58%, #000 76%, transparent 94%)'

export function shockwaveMaskStyle(ox: number, oy: number, radius: number) {
  const d = Math.max(1, Math.round(radius * 2))
  return {
    image: MERGE_SHOCK_MASK_IMAGE,
    size: `${d}px ${d}px`,
    position: `${Math.round(ox - d / 2)}px ${Math.round(oy - d / 2)}px`,
  }
}
