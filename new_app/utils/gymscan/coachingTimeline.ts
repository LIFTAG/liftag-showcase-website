import { smoothstep } from './timeline.ts'

export interface CoachingFrame { member: number; owner: number; isOwner: boolean; reduced: boolean }
export interface CoachingPose { logger: number; room: number; recording: number; transfer: number; docked: number }

const enter = (value: number, start: number, end: number) => smoothstep((value - start) / (end - start))
const window = (value: number, start: number, hold: number, end: number) => enter(value, start, hold) * (1 - enter(value, hold, end))

/** Logger -> same machine bay -> trainer capture -> logger instruction slot. */
export function coachingPose(frame: CoachingFrame): CoachingPose {
  if (frame.reduced) return { logger: frame.isOwner ? 0 : 1, room: 0, recording: 0, transfer: 0, docked: frame.isOwner ? 1 : 0 }
  if (!frame.isOwner) return { logger: enter(frame.member, .06, .3), room: 0, recording: 0, transfer: 0, docked: 0 }
  return {
    logger: 1 - enter(frame.owner, .08, .2),
    room: enter(frame.owner, .08, .24) * (1 - enter(frame.owner, .76, .9)),
    recording: window(frame.owner, .2, .3, .7),
    transfer: enter(frame.owner, .64, .86),
    docked: enter(frame.owner, .79, .94),
  }
}

/** A complete 4.8 second press repeats while the recording bay is visible. */
export function recordingCycle(seconds: number, duration = 4.8): number {
  if (!Number.isFinite(seconds) || duration <= 0) return 0
  return ((seconds % duration) + duration) % duration
}
