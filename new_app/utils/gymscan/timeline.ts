// Tiny keyframe helpers for the scroll-driven hero.
//
// The section is a long scroll container with a sticky canvas; every visual in
// it is a pure function of one normalised progress value. Rather than pull in a
// timeline library, each animated quantity declares its own stop list and reads
// itself out of that - which keeps the whole choreography legible in one table
// (see SCAN_TIMELINE in useGymScanStage) instead of scattered tween calls.

export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

/** Normalised position of `p` inside the [`a`, `b`] window, clamped to 0..1. */
export function span(p: number, a: number, b: number): number {
  return b === a ? (p >= b ? 1 : 0) : clamp01((p - a) / (b - a))
}

export function smoothstep(t: number): number {
  const x = clamp01(t)
  return x * x * (3 - 2 * x)
}

/** Smoothstep over a window - the shape used for nearly every fade here. */
export function ease(p: number, a: number, b: number): number {
  return smoothstep(span(p, a, b))
}

export function easeInOutCubic(t: number): number {
  const x = clamp01(t)
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/**
 * Frame-rate independent damping. `rate` is roughly "fraction of the remaining
 * distance covered per 1/60s", so the same value feels identical at 60 and
 * 144Hz instead of snapping on fast displays.
 */
export function damp(current: number, target: number, rate: number, dt: number): number {
  const t = 1 - Math.pow(1 - rate, dt * 60)
  return current + (target - current) * t
}

export type ScalarStop = readonly [pos: number, value: number]
export type Vec3Stop = readonly [pos: number, value: readonly [number, number, number]]

/** Piecewise value lookup with eased interpolation between neighbouring stops. */
export function scalarAt(stops: readonly ScalarStop[], p: number): number {
  if (stops.length === 0) return 0
  if (p <= stops[0]![0]) return stops[0]![1]
  for (let i = 1; i < stops.length; i++) {
    const a = stops[i - 1]!
    const b = stops[i]!
    if (p <= b[0]) return lerp(a[1], b[1], easeInOutCubic(span(p, a[0], b[0])))
  }
  return stops[stops.length - 1]![1]
}

/**
 * C1-continuous sample through a stop list - Catmull-Rom tangents on
 * non-uniform knots, and no easing inside a segment.
 *
 * `vec3At` eases in *and* out of every stop it passes. That is right for a
 * fade and wrong for a camera: velocity hits zero at each keyframe, so a
 * nine-stop path renders as eight separate moves with a pause between each -
 * which is exactly what a scroll-driven dolly must never look like. Here the
 * tangent at a stop is shared by the segments either side of it, so speed
 * carries across the joint and the whole list is one continuous move.
 *
 * Shaping *when* the move accelerates is then a separate job, done once, by
 * whatever function feeds this its parameter - which is the only way to get a
 * single acceleration and a single deceleration out of a multi-stop path.
 */
export function vec3HermiteAt(
  stops: readonly Vec3Stop[],
  u: number,
  out: { x: number, y: number, z: number },
): void {
  const n = stops.length
  if (n === 0) return
  const first = stops[0]!
  const last = stops[n - 1]!
  if (n === 1 || u <= first[0]) {
    out.x = first[1][0]; out.y = first[1][1]; out.z = first[1][2]
    return
  }
  if (u >= last[0]) {
    out.x = last[1][0]; out.y = last[1][1]; out.z = last[1][2]
    return
  }
  let i = 1
  while (i < n - 1 && u > stops[i]![0]) i++
  const a = stops[i - 1]!
  const b = stops[i]!
  const h = b[0] - a[0]
  if (h <= 0) {
    out.x = b[1][0]; out.y = b[1][1]; out.z = b[1][2]
    return
  }
  // Neighbours supply the tangents; at the ends the segment stands in for its
  // missing neighbour, which degrades cleanly to a one-sided difference.
  const prev = stops[i - 2] ?? a
  const next = stops[i + 1] ?? b
  const d0 = b[0] - prev[0]
  const d1 = next[0] - a[0]
  const t = (u - a[0]) / h
  const t2 = t * t
  const t3 = t2 * t
  const h00 = 2 * t3 - 3 * t2 + 1
  const h10 = t3 - 2 * t2 + t
  const h01 = -2 * t3 + 3 * t2
  const h11 = t3 - t2
  const axis: ('x' | 'y' | 'z')[] = ['x', 'y', 'z']
  for (let k = 0; k < 3; k++) {
    const m0 = (b[1][k]! - prev[1][k]!) / d0
    const m1 = (next[1][k]! - a[1][k]!) / d1
    out[axis[k]!] = h00 * a[1][k]! + h10 * h * m0 + h01 * b[1][k]! + h11 * h * m1
  }
}

export function vec3At(
  stops: readonly Vec3Stop[],
  p: number,
  out: { x: number, y: number, z: number },
): void {
  if (stops.length === 0) return
  const first = stops[0]!
  if (p <= first[0]) {
    out.x = first[1][0]; out.y = first[1][1]; out.z = first[1][2]
    return
  }
  for (let i = 1; i < stops.length; i++) {
    const a = stops[i - 1]!
    const b = stops[i]!
    if (p <= b[0]) {
      const t = easeInOutCubic(span(p, a[0], b[0]))
      out.x = lerp(a[1][0], b[1][0], t)
      out.y = lerp(a[1][1], b[1][1], t)
      out.z = lerp(a[1][2], b[1][2], t)
      return
    }
  }
  const last = stops[stops.length - 1]!
  out.x = last[1][0]; out.y = last[1][1]; out.z = last[1][2]
}
