import { smoothstep } from './timeline.ts';

export interface CoachingFrame {
  member: number;
  owner: number;
  isOwner: boolean;
  reduced: boolean;
}

/**
 * One instruction surface. Members see the catalog clip lift out of the
 * logger. Owners see that same surface rewritten, then docked back on the
 * phone. The chapter boundary stays docked so the lift-off is a new beat,
 * not a pop.
 */
export function coachingPose(frame: CoachingFrame) {
  const memberReveal = smoothstep(frame.member / .32) * (1 - smoothstep((frame.member - .58) / .3));
  const ownerLift = smoothstep(frame.owner / .14) * (1 - smoothstep((frame.owner - .72) / .22));
  const rewrite = frame.isOwner ? smoothstep((frame.owner - .16) / .42) : 0;
  return {
    reveal: frame.reduced ? 0 : (frame.isOwner ? ownerLift : memberReveal),
    rewrite: frame.reduced ? (frame.isOwner ? 1 : 0) : rewrite,
    branded: frame.isOwner && (frame.reduced || rewrite > .82),
  };
}
