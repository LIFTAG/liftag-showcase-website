// Beats of a pinned chapter. Each beat owns one band of the section's scroll
// progress; `edges` lists the band boundaries from 0 to 1.
import { clamp01 } from './timeline.ts'

export function storyBeatAt(edges: readonly number[], progress: number): number {
  const p = clamp01(progress)
  let beat = 0
  for (let i = 1; i < edges.length - 1; i++) if (p >= edges[i]!) beat = i
  return beat
}

/** 0→1 fill of one beat's own band, for its progress rail. */
export function storyBeatFill(edges: readonly number[], progress: number, beat: number): number {
  const start = edges[beat] ?? 1
  const end = edges[beat + 1] ?? 1
  return clamp01((clamp01(progress) - start) / Math.max(1e-6, end - start))
}

/** Where a beat link lands: a little inside its band, never on an edge. */
export function storyBeatTarget(edges: readonly number[], beat: number): number {
  const start = edges[beat] ?? 0
  const end = edges[beat + 1] ?? 1
  return beat === 0 ? 0.04 : start + (end - start) * 0.3
}

/** Section progress from its pinned rectangle, 0 at the pin, 1 at release. */
export function storyProgress(top: number, height: number, pane: number): number {
  // `|| 0` folds the -0 of an exactly pinned top into a plain 0.
  return clamp01(-top / Math.max(1, height - pane)) || 0
}
