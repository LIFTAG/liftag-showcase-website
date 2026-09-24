// The film's last shot parks the scan phone here, and the member chapter's DOM
// phone takes over on the same pixels. Both sides read this one box, so the
// handoff is a crossfade between two renders of one device, not a jump.
import {
  PHONE_BEZEL,
  PHONE_CAM_FOV,
  PHONE_H,
  PHONE_ISLAND,
  PHONE_R,
  PHONE_REST_ROT_X,
  PHONE_REST_ROT_Y,
  PHONE_SCR_H,
  PHONE_W,
} from '../phoneModel.ts'
import type { PhoneBox } from './handoff.ts'

/** Compact layouts stack copy under the device instead of beside it. */
export const MEMBER_COMPACT_MAX = 760

/**
 * Body box of the parked phone, in the sticky pane's CSS pixels. The pane and
 * the cinema canvas share `top: 0; height: 100svh`, so this is also the canvas
 * box the overlay projects into.
 */
export function memberPhoneSlot(width: number, height: number): PhoneBox {
  const compact = width <= MEMBER_COMPACT_MAX
  if (compact) {
    const short = height <= 740
    const h = Math.min(height * (short ? 0.44 : 0.5), 460)
    const w = h * (PHONE_W / PHONE_H)
    return { x: (width - w) / 2, y: Math.max(76, height * 0.11), w, h }
  }
  const h = Math.min(height * 0.76, height - 176, 780)
  const w = h * (PHONE_W / PHONE_H)
  const cx = width * (width < 1100 ? 0.62 : 0.555)
  return { x: cx - w / 2, y: (height - h) / 2 + 8, w, h }
}

/** DOM proportions of the shared phone mesh, as fractions of the body box. */
export const MEMBER_PHONE_SHAPE = {
  radius: PHONE_R / PHONE_W,
  bezelX: PHONE_BEZEL / PHONE_W,
  bezelY: PHONE_BEZEL / PHONE_H,
  screenRadius: (PHONE_R - PHONE_BEZEL) / PHONE_W,
  islandWidth: PHONE_ISLAND.width / PHONE_W,
  islandHeight: PHONE_ISLAND.height / PHONE_H,
  islandTop:
    (PHONE_H / 2 - PHONE_ISLAND.y - PHONE_ISLAND.height / 2) / PHONE_H,
  screenHeight: PHONE_SCR_H / PHONE_H,
} as const

/**
 * CSS perspective that reproduces the overlay camera: a vertical FOV over the
 * whole pane, viewed from its centre.
 */
export function memberPhonePerspective(paneHeight: number): number {
  return paneHeight / 2 / Math.tan((PHONE_CAM_FOV * Math.PI) / 360)
}

/**
 * Three's Euler rotation of the parked phone, as a CSS transform. Three is
 * y-up and CSS is y-down, so X flips sign while Y does not.
 */
export function memberPhoneTransform(rotX: number, rotY: number): string {
  return `rotateX(${(-rotX).toFixed(4)}rad) rotateY(${rotY.toFixed(4)}rad)`
}

export const MEMBER_PHONE_REST = { x: PHONE_REST_ROT_X, y: PHONE_REST_ROT_Y } as const
