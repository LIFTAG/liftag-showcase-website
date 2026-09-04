// Scroll sizing for the gym-scan film and the seam that leaves it.
//
// The film does not end in this room. Once the plate is scanned the frame folds
// onto a phone, and that phone travels into the landing hero's own front-phone
// slot - so the sticky range is split: the first `SCENE_END` of progress is the
// 3D act, and the tail is the handoff. Keeping the two on one scroll is what
// makes the seam a cut rather than a page change.
import {
  PHONE_CAM_FOV,
  PHONE_CAM_Z,
  PHONE_H,
  PHONE_W,
} from '../phoneModel.ts'
import { clamp01, lerp, smoothstep } from './timeline.ts'

/**
 * Fraction of gym-scan scroll that is the 3D act. The remaining tail is the
 * morph into the landing hero, and it is short on purpose: the phone should
 * arrive, not be flown across the screen while the visitor waits for it.
 */
export const SCENE_END = 0.84

/** FROM THE FLOOR: one viewport for Act 0, five for the scroll-owned act. */
export const GYM_SCAN_STICKY_SVH = 6
/** FROM THE SEAT: one viewport for Act 0, two and a half for the scroll act. */
export const GYM_SCAN_PHONE_STICKY_SVH = 3.5
/** Reduced motion is a held still followed immediately by the working DOM. */
export const GYM_SCAN_REDUCED_STICKY_SVH = 1

export function gymScanStickySvh(phone: boolean, reducedMotion: boolean): number {
  if (reducedMotion) return GYM_SCAN_REDUCED_STICKY_SVH
  return phone ? GYM_SCAN_PHONE_STICKY_SVH : GYM_SCAN_STICKY_SVH
}

/** Per-frame scroll catch-up at 60fps. Reaches 95% in roughly 150ms. */
export const GYM_SCROLL_DAMP_RATE = 0.28

export type PhoneBox = {
  x: number
  y: number
  w: number
  h: number
}

export function sceneProgress(p: number): number {
  return clamp01(p / SCENE_END)
}

export function heroMorphAt(p: number): number {
  return clamp01((p - SCENE_END) / (1 - SCENE_END))
}

/** Ease-out quart. The phone should arrive, not coast. */
export function heroTravelEase(t: number): number {
  const x = clamp01(t)
  const inv = 1 - x
  return 1 - inv * inv * inv * inv
}

/** Ease-out cubic. Scale lags the slide so the device shrinks into the slot. */
export function heroScaleEase(t: number): number {
  const x = clamp01(t)
  const inv = 1 - x
  return 1 - inv * inv * inv
}

/**
 * Pointer tilt on Phone3D.vue's front hero phone (`applyPointerTilt`).
 * Overlay uses the same gains so the gym-scan mesh leans identically.
 */
export const HERO_PHONE_TILT_X = 0.15
export const HERO_PHONE_TILT_Y = 0.35
/** Per-frame catch-up at 60fps; overlay damps at this rate. */
export const HERO_PHONE_TILT_LERP = 0.06
export const HERO_PHONE_KEY_LIGHT = { x: 2, y: 3, z: 5, xGain: 1.5 }

/** `.phone` width × HeroDesktop front scale (0.92). */
export const HERO_FRONT_PHONE_CSS_W = 280 * 0.92
export const HERO_FRONT_PHONE_ASPECT = 393 / 852

/**
 * How much of Phone3D's pointer tilt to apply, given overlay shrink.
 * Zero while the frame is still full-bleed; full once the bezel reads.
 */
export function heroTiltMix(shrink: number): number {
  return smoothstep((shrink - 0.04) / 0.22)
}

export function heroPointerTilt(mx: number, my: number): { rotX: number, rotY: number } {
  return {
    rotX: my * HERO_PHONE_TILT_X,
    rotY: mx * HERO_PHONE_TILT_Y,
  }
}

export function heroFrontPhoneCssBox(viewW: number, top = 68): PhoneBox {
  const w = HERO_FRONT_PHONE_CSS_W
  const h = w / HERO_FRONT_PHONE_ASPECT
  return {
    x: viewW / 2 - w / 2,
    y: top,
    w,
    h,
  }
}

/** Desktop-shaped fallback so the morph can shrink before the hero hydrates. */
export function fallbackHeroSlot(viewW: number, viewH: number): PhoneBox {
  const top = Math.max(24, Math.min(viewH * 0.08, 80))
  return heroBodyTargetFromPhoneBox(heroFrontPhoneCssBox(viewW, top))
}

/**
 * Slide the park box onto the hero slot. Position uses the snappy travel ease;
 * size uses the slower scale ease so the device visibly shrinks into place.
 */
export function travelPhoneBox(
  park: PhoneBox,
  slot: PhoneBox,
  morph: number,
  reducedMotion: boolean,
): PhoneBox {
  if (morph <= 0) return park
  if (reducedMotion || morph >= 1) return slot
  const posT = heroTravelEase(morph)
  const sizeT = heroScaleEase(morph)
  const w = lerp(park.w, slot.w, sizeT)
  const h = lerp(park.h, slot.h, sizeT)
  const cx = lerp(park.x + park.w / 2, slot.x + slot.w / 2, posT)
  const cy = lerp(park.y + park.h / 2, slot.y + slot.h / 2, posT)
  return { x: cx - w / 2, y: cy - h / 2, w, h }
}

export function phoneVisibleHeight(): number {
  return 2 * Math.tan((PHONE_CAM_FOV * Math.PI) / 180 / 2) * PHONE_CAM_Z
}

/**
 * Convert a laid-out `.phone` CSS box (the hero's front device, including its
 * CSS scale) into the overlay body target.
 *
 * Phone3D frames the same mesh with the same camera: the body fills
 * PHONE_H / visibleHeight of the canvas. Feeding that body size to the overlay
 * makes the two devices the same pixel size at morph = 1.
 */
export function heroBodyTargetFromPhoneBox(box: PhoneBox): PhoneBox {
  const fill = PHONE_H / phoneVisibleHeight()
  const bodyH = box.h * fill
  const bodyW = bodyH * (PHONE_W / PHONE_H)
  return {
    x: box.x + box.w / 2 - bodyW / 2,
    y: box.y + box.h / 2 - bodyH / 2,
    w: bodyW,
    h: bodyH,
  }
}

export function lerpPhoneBox(a: PhoneBox, b: PhoneBox, t: number): PhoneBox {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    w: lerp(a.w, b.w, t),
    h: lerp(a.h, b.h, t),
  }
}
