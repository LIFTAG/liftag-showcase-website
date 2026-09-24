// Chapters of the real dashboard screen recording (macbook-dashboard.*.mp4).
// The first two seconds are the sign-in screen; the tour loops past them.
import { clamp01 } from './timeline.ts'

/** Chapter edges in seconds: gyms, machines & tags, print studio, videos. */
export const DASHBOARD_TOUR_EDGES = [2, 9, 18, 38, 48.8] as const
export const DASHBOARD_TOUR_CHAPTERS = DASHBOARD_TOUR_EDGES.length - 1

export function dashboardChapterAt(time: number): number {
  for (let i = DASHBOARD_TOUR_CHAPTERS - 1; i > 0; i--) {
    if (time >= DASHBOARD_TOUR_EDGES[i]!) return i
  }
  return 0
}

export function dashboardChapterFill(time: number, chapter: number): number {
  const start = DASHBOARD_TOUR_EDGES[chapter] ?? 0
  const end = DASHBOARD_TOUR_EDGES[chapter + 1] ?? start
  return clamp01((time - start) / Math.max(1e-6, end - start))
}

/** Past the end, or still on the sign-in frames: where playback should be. */
export function dashboardTourWrap(time: number): number | null {
  if (time >= DASHBOARD_TOUR_EDGES[DASHBOARD_TOUR_CHAPTERS]! || time < DASHBOARD_TOUR_EDGES[0] - 0.25) {
    return DASHBOARD_TOUR_EDGES[0]
  }
  return null
}
