export type DashboardScrollState = {
  open: number
  zoom: number
  video: number
  exit: number
  chrome: number
}

export const DASHBOARD_SCROLL = {
  closedEnd: 0.07,
  openEnd: 0.32,
  zoomEnd: 0.52,
  videoEnd: 0.84,
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
 * Maps sticky-section scroll progress into the cinematic dashboard beat:
 * closed hold → lid open → camera punch-in → footage scrub → exit.
 */
export function mapDashboardScroll(
  p: number,
  reduceMotion = false,
): DashboardScrollState {
  if (reduceMotion) {
    return {
      open: 1,
      zoom: 0,
      video: 0,
      exit: 0,
      chrome: 1,
    }
  }

  const t = clamp01(p)
  const { closedEnd, openEnd, zoomEnd, videoEnd } = DASHBOARD_SCROLL

  const open = smoothstep(span(t, closedEnd, openEnd))
  const zoom = smootherstep(span(t, openEnd, zoomEnd))
  const video = smoothstep(span(t, zoomEnd, videoEnd))
  const exit = smoothstep(span(t, videoEnd, 1))
  const chrome = 1 - zoom

  return { open, zoom, video, exit, chrome }
}
