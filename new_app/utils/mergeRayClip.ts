const DIR_EPS = 1e-9
const OUTSIDE_SLACK = 1

/**
 * Forward distance from an interior start point to where a unit-direction
 * ray leaves an axis-aligned clip rect. Used by the merge-section beams so
 * scaleX equals only the on-screen segment (no oversized lines).
 *
 * Returns 0 when the start is outside the rect, the direction is zero,
 * or the forward ray does not leave through a finite edge.
 */
export function rayRectVisibleLength(
  sx: number,
  sy: number,
  dx: number,
  dy: number,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
): number {
  if (!(maxX > minX) || !(maxY > minY)) return 0
  if (sx < minX - OUTSIDE_SLACK || sx > maxX + OUTSIDE_SLACK) return 0
  if (sy < minY - OUTSIDE_SLACK || sy > maxY + OUTSIDE_SLACK) return 0
  if (dx * dx + dy * dy < DIR_EPS * DIR_EPS) return 0

  const x = Math.min(maxX, Math.max(minX, sx))
  const y = Math.min(maxY, Math.max(minY, sy))

  let t = Infinity
  if (dx > DIR_EPS) t = Math.min(t, (maxX - x) / dx)
  else if (dx < -DIR_EPS) t = Math.min(t, (minX - x) / dx)
  if (dy > DIR_EPS) t = Math.min(t, (maxY - y) / dy)
  else if (dy < -DIR_EPS) t = Math.min(t, (minY - y) / dy)

  return Number.isFinite(t) && t > 0 ? t : 0
}
