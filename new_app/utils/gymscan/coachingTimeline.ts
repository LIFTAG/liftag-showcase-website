import { PHONE_H, PHONE_W } from "../phoneModel.ts";
import { smoothstep } from "./timeline.ts";

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

export type CoachingSlot = {
  x: number;
  y: number;
  w: number;
  h: number;
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
 * Present the phone as the cinema. `rewrite` is the gym-clip *intent* along
 * the owner chapter; the glass plays that as a timed take, not a scrub.
 */
export function coachingPose(frame: CoachingFrame) {
  const memberReveal = smoothstep((frame.member + 0.04) / 0.3);
  const ownerLift = 1 - smoothstep((frame.owner - 0.76) / 0.24);
  const rewrite = frame.isOwner ? smoothstep((frame.owner - 0.22) / 0.4) : 0;
  return {
    reveal: frame.reduced ? 0 : frame.isOwner ? ownerLift : memberReveal,
    rewrite,
    branded: frame.isOwner && rewrite >= 0.5,
  };
}

/** Pixel box for the 3D phone while the video guide is on screen. */
export function coachingPhoneSlot(
  width: number,
  height: number,
): CoachingSlot {
  const compact = width <= 760;
  const short = compact && height <= 740;
  const h = compact
    ? Math.min(height * (short ? 0.4 : 0.48), 430)
    : Math.min(height * 0.78, height - 176, 820);
  const w = h * (PHONE_W / PHONE_H);
  return {
    x: compact ? (width - w) / 2 : width * 0.66 - w / 2,
    y: compact ? height * (short ? 0.28 : 0.255) : (height - h) / 2 + 8,
    w,
    h,
  };
}
