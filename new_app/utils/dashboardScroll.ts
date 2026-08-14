export type DashboardScrollState = {
  open: number
  zoom: number
  exit: number
  chrome: number
}

export const DASHBOARD_SCROLL = {
  closedEnd: 0.08,
  openEnd: 0.34,
  chromeEnd: 0.42,
  zoomEnd: 0.58,
  exitStart: 0.80,
} as const

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

/**
 * Maps sticky-section scroll progress:
 * closed hold → lid open → camera punch-in to the screen center → hold → exit.
 * Footage plays on its own once the section is visible.
 */
export function mapDashboardScroll(
  p: number,
  reduceMotion = false,
): DashboardScrollState {
  if (reduceMotion) {
    return {
      open: 1,
      zoom: 0,
      exit: 0,
      chrome: 1,
    }
  }

  const t = clamp01(p)
  const { closedEnd, openEnd, chromeEnd, zoomEnd, exitStart } = DASHBOARD_SCROLL

  const open = smoothstep(span(t, closedEnd, openEnd))
  const zoom = smootherstep(span(t, openEnd, zoomEnd))
  const exit = smoothstep(span(t, exitStart, 1))
  const chrome = 1 - smootherstep(span(t, openEnd, chromeEnd))

  return { open, zoom, exit, chrome }
}
