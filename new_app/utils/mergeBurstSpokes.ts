/**
 * Finale spokes for the merge bang. One hairline per orbiting app, aimed
 * from the prism along that app's rest pose. CSS rotate uses screen space
 * (y down), so atan2(y, x) matches the orbit without a flip.
 */

export const MERGE_SPOKE_TWIST = 8

export function spokeAngleDeg(x: number, y: number) {
  return Math.atan2(y, x) * (180 / Math.PI)
}

export function spokeTwistDeg(index: number, amount = MERGE_SPOKE_TWIST) {
  return index % 2 === 0 ? amount : -amount
}

export function burstSpokesFromOrbit(
  apps: { key: string; x: number; y: number; core: string; delay: number }[],
) {
  return apps.map((app, index) => ({
    key: app.key,
    deg: spokeAngleDeg(app.x, app.y),
    core: app.core,
    turn: spokeTwistDeg(index),
    delay: app.delay,
  }))
}
