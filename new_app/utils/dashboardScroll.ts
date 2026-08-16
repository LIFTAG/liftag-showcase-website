export type DashboardScrollState = {
  open: number
  zoom: number
  chrome: number
  card: number
  blend: number
  rail: number
  coach: number
  exit: number
}

/**
 * One pinned section, two acts.
 *
 * Act 1 is the gym dashboard: the lid opens, the page chrome clears, and the
 * camera punches into the screen. Act 2 hands that same screen over to the
 * coach dashboard - a title card rises over the footage, the footage
 * cross-fades underneath it, the scroll dwells on the result, and only then
 * does the camera pull back out to a new rest pose with the coach copy around
 * it.
 *
 * There is deliberately one MacBook and one WebGL context across both acts.
 * Every boundary below is a scroll fraction of the same sticky section, so the
 * handoff is a continuous shot rather than a cut between two components.
 */
export const DASHBOARD_JOURNEY = {
  closedEnd: 0.045,
  openEnd: 0.200,
  chromeEnd: 0.245,
  zoomEnd: 0.335,
  cardStart: 0.375,
  cardFull: 0.435,
  swapStart: 0.425,
  swapEnd: 0.505,
  cardOutEnd: 0.560,
  dwellEnd: 0.635,
  unzoomEnd: 0.775,
  // Halfway through the un-zoom, deliberately: the coach copy materialises
  // while the laptop is still travelling back out, so the reveal is one
  // movement rather than a camera move followed by a separate fade-in.
  coachStart: 0.705,
  coachChromeEnd: 0.825,
  exitStart: 0.925,
} as const

/**
 * Where the footage handover lands along the rail, as a 0-1 fraction of its
 * width.
 *
 * Keyed to the *middle* of the cross-fade, not its end. The two recordings
 * dissolve into each other, so the moment a reader registers as "it changed"
 * is when the incoming one takes the majority - marking `swapEnd` instead put
 * the tick 13% of the track late, and the footage visibly changed well before
 * the fill reached it.
 *
 * Derived rather than hand-placed so it cannot drift away from the swap it is
 * marking when the phase boundaries are retuned.
 */
export const DASHBOARD_SWAP_MIDPOINT
  = (DASHBOARD_JOURNEY.swapStart + DASHBOARD_JOURNEY.swapEnd) / 2

export const DASHBOARD_RAIL_SWITCH_AT
  = (DASHBOARD_SWAP_MIDPOINT - DASHBOARD_JOURNEY.zoomEnd)
    / (DASHBOARD_JOURNEY.dwellEnd - DASHBOARD_JOURNEY.zoomEnd)

export function clamp01(v: number) {
  return Math.max(0, Math.min(1, v))
}

export function smoothstep(v: number) {
  const t = clamp01(v)
  return t * t * (3 - 2 * t)
}

export function smootherstep(v: number) {
  const t = clamp01(v)
  return t * t * t * (t * (t * 6 - 15) + 10)
}

function span(p: number, start: number, end: number) {
  return clamp01((p - start) / (end - start))
}

export function mapDashboardJourney(
  p: number,
  reduceMotion = false,
): DashboardScrollState {
  // Reduced motion drops the whole camera performance and shows both acts at
  // once as static blocks: lid open, no punch-in, coach footage already on the
  // screen so act 2's copy is not describing something the reader cannot see.
  if (reduceMotion) {
    return {
      open: 1,
      zoom: 0,
      chrome: 1,
      card: 0,
      blend: 1,
      rail: 1,
      coach: 1,
      exit: 0,
    }
  }

  const t = clamp01(p)
  const {
    closedEnd,
    openEnd,
    chromeEnd,
    zoomEnd,
    cardStart,
    cardFull,
    swapStart,
    swapEnd,
    cardOutEnd,
    dwellEnd,
    unzoomEnd,
    coachStart,
    coachChromeEnd,
    exitStart,
  } = DASHBOARD_JOURNEY

  const open = smoothstep(span(t, closedEnd, openEnd))

  // The only non-monotonic channel: in over openEnd..zoomEnd, locked at 1
  // through the card, the swap and the dwell, then back out over
  // dwellEnd..unzoomEnd. Multiplying the two halves keeps a single expression
  // that is exactly 1 across the entire hold.
  const zoomIn = smootherstep(span(t, openEnd, zoomEnd))
  const zoomOut = 1 - smootherstep(span(t, dwellEnd, unzoomEnd))
  const zoom = zoomIn * zoomOut

  const chrome = 1 - smootherstep(span(t, openEnd, chromeEnd))

  // Rises while the camera is already locked, holds through the swap, then
  // dissolves and leaves the coach footage alone on screen for the dwell.
  const card = smoothstep(span(t, cardStart, cardFull))
    * (1 - smoothstep(span(t, cardFull, cardOutEnd)))

  const blend = smootherstep(span(t, swapStart, swapEnd))

  // Progress along the locked-camera window, drawn as a rail under the screen.
  // Without it the dwell reads as the page having frozen; with it the reader
  // can see how much scroll is left before the footage hands over, and that
  // standing still just leaves the video playing. Linear on purpose - it is a
  // measure of remaining scroll, so easing it would misreport the distance.
  const rail = span(t, zoomEnd, dwellEnd)

  // Gated on an explicit boundary rather than on `zoom`, because the punch-in
  // passes through the same zoom values on the way in - keying off the number
  // alone would fade the coach copy up over act 1.
  const coach = smoothstep(span(t, coachStart, coachChromeEnd))

  const exit = smoothstep(span(t, exitStart, 1))

  return { open, zoom, chrome, card, blend, rail, coach, exit }
}
