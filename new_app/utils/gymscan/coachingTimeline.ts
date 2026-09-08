import { smoothstep } from './timeline.ts';

export interface CoachingFrame {
  member: number;
  owner: number;
  isOwner: boolean;
  reduced: boolean;
}

export type CoachingUi = {
  isOwner: boolean;
  docked: boolean;
  isGymVideo: boolean;
};

/** Discrete Vue state for the sticky coaching copy. Progress stays off this. */
export function coachingUiAt(
  frame: Pick<CoachingFrame, "isOwner" | "owner">,
): CoachingUi {
  return {
    isOwner: frame.isOwner,
    docked: frame.isOwner && frame.owner > 0.88,
    isGymVideo: frame.isOwner && frame.owner >= 0.42,
  };
}

/**
 * One continuous take: open the video, turn it over to the gym's guide,
 * then return it to the phone. Hold it open across the chapter boundary.
 */
export function coachingPose(frame: CoachingFrame) {
  const memberReveal = smoothstep((frame.member + .04) / .3);
  const ownerLift = 1 - smoothstep((frame.owner - .76) / .24);
  const rewrite = frame.isOwner ? smoothstep((frame.owner - .22) / .4) : 0;
  return {
    reveal: frame.reduced ? 0 : (frame.isOwner ? ownerLift : memberReveal),
    rewrite,
    branded: frame.isOwner && rewrite >= .5,
  };
}
