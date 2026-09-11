/** Pixels of horizontal travel before the field steps once. */
export const NUMBER_SCRUB_THRESHOLD = 24

const LINE_PX = 16
const PAGE_PX = 800

export function consumeScrubDelta(
  remainder: number,
  delta: number,
  threshold = NUMBER_SCRUB_THRESHOLD,
): { remainder: number, steps: number } {
  if (threshold <= 0) return { remainder, steps: 0 }
  const next = remainder + delta
  const steps = Math.trunc(next / threshold)
  return { remainder: next - steps * threshold, steps }
}

function wheelScale(deltaMode: number) {
  if (deltaMode === 1) return LINE_PX
  if (deltaMode === 2) return PAGE_PX
  return 1
}

/**
 * Horizontal gesture in CSS pixels, signed so motion toward the right
 * (the + control) is positive. Vertical-dominant wheels return null so
 * the page can still scroll.
 */
export function horizontalWheelDelta(event: {
  deltaX: number
  deltaY: number
  deltaMode: number
  shiftKey: boolean
}): number | null {
  const scale = wheelScale(event.deltaMode)
  const x = (event.shiftKey ? event.deltaY : event.deltaX) * scale
  const y = (event.shiftKey ? event.deltaX : event.deltaY) * scale
  if (Math.abs(x) <= Math.abs(y) || Math.abs(x) < 0.5) return null
  return -x
}
