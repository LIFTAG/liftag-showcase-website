// Scroll beats of the member chapter: scan → watch → log. The pane is pinned
// for the whole section, and each beat owns a band of its scroll range.
import { storyBeatAt, storyBeatFill, storyBeatTarget, storyProgress } from './storyBeats.ts'

export const MEMBER_BEATS = 3
/** Beat boundaries along section progress. The last beat gets a longer hold. */
export const MEMBER_BEAT_EDGES = [0, 0.3, 0.62, 1] as const

export type MemberBeat = 0 | 1 | 2

export function memberBeatAt(progress: number): MemberBeat {
  return storyBeatAt(MEMBER_BEAT_EDGES, progress) as MemberBeat
}

/** 0→1 fill of one beat's own band, for its progress rail. */
export function memberBeatFill(progress: number, beat: number): number {
  return storyBeatFill(MEMBER_BEAT_EDGES, progress, beat)
}

/** Where a beat link lands: a little inside its band, never on an edge. */
export function memberBeatTarget(beat: number): number {
  return storyBeatTarget(MEMBER_BEAT_EDGES, beat)
}

/** Section progress from its pinned rectangle, 0 at the pin, 1 at release. */
export const memberProgress = storyProgress
