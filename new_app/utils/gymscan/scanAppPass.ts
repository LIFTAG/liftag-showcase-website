import { clamp01, lerp, smoothstep } from './timeline.ts'

/** Scene progress where the folded phone is a phone with the QR in the viewfinder. */
export const APP_PLAY_AT = 0.86
/** Wall-clock blend from the gym QR onto the matching scan-flow frame. */
export const APP_BLEND_SEC = 0.12

export const APP_STILL_SRC = '/assets/gym3d/log-set.webp'

/**
 * Where the flattened code sits in scan-flow.mp4 at the 3.2s LOG cut,
 * as a fraction of the phone screenshot (origin top-left). The gym QR is
 * steered onto this same point so the cut is QR-on-QR, not a fade.
 */
export const VIDEO_QR_ANCHOR = { x: 0.5, y: 0.46 }

export function appScreenMix(
  scene: number,
  reducedMotion: boolean,
  holdSec = 0,
): number {
  if (scene < APP_PLAY_AT) return 0
  if (reducedMotion) return 1
  return smoothstep(clamp01(holdSec / APP_BLEND_SEC))
}

export function canvasUvFromCssBox(
  box: { x: number, y: number, w: number, h: number },
  width: number,
  heightPx: number,
): { x: number, y: number } {
  return {
    x: (box.x + box.w / 2) / Math.max(width, 1e-6),
    // Gym RT is y-up; CSS boxes are y-down from the top of the canvas.
    y: 1 - (box.y + box.h / 2) / Math.max(heightPx, 1e-6),
  }
}

/** Corner radius of the clear focus window as a fraction of its full side. */
export const STICKER_FOCUS_CORNER_FRAC = 0.14
/** Breathing room around the QR so the clear window reads larger than the sticker. */
export const STICKER_FOCUS_PAD = 1.32
/** Blur ramp, as a fraction of the shorter half-axis. Tight enough to read as a lock, not a vignette. */
export const STICKER_FOCUS_FEATHER = 0.18
/** Finer mip used by the stable five-tap blur outside the plate. */
export const STICKER_FOCUS_LOD = 4.0
/** Physical render-target radius for the phone's rack-focus blur. */
export const STICKER_FOCUS_RADIUS_PX = 28.0

export type GymQrUvBox = {
  cx: number
  cy: number
  hx: number
  hy: number
}

/** Gym-texture UV box of a CSS-pixel QR AABB. Origin bottom-left, matching tGym. */
export function gymQrUvBox(
  qr: { x: number, y: number, w: number, h: number },
  width: number,
  heightPx: number,
): GymQrUvBox {
  const uv = canvasUvFromCssBox(qr, width, heightPx)
  return {
    cx: uv.x,
    cy: uv.y,
    hx: 0.5 * qr.w / Math.max(width, 1e-6),
    hy: 0.5 * qr.h / Math.max(heightPx, 1e-6),
  }
}

/**
 * Rack-focus amount on the phone screen. Off while the gym is still
 * full-bleed so the establishing shot does not suddenly go soft.
 */
export function phoneFocusBlur(shrink: number): number {
  return smoothstep((clamp01(shrink) - 0.06) / 0.38)
}

/**
 * 0 on the sticker, 1 well outside. Same rounded-box as the overlay shader,
 * so a test failure here is a QR that would get blurred on screen.
 */
export function stickerFocusOutside(
  gymUv: { x: number, y: number },
  box: GymQrUvBox,
  textureSize: { width: number, height: number } = { width: 1, height: 1 },
): number {
  const halfSidePx = Math.max(box.hx * textureSize.width, box.hy * textureSize.height)
  const hx = halfSidePx / Math.max(textureSize.width, 1e-6) * STICKER_FOCUS_PAD
  const hy = halfSidePx / Math.max(textureSize.height, 1e-6) * STICKER_FOCUS_PAD
  if (hx < 1e-6 || hy < 1e-6) return 0
  const rr = STICKER_FOCUS_CORNER_FRAC * 2 * Math.min(hx, hy)
  const qx = Math.abs(gymUv.x - box.cx) - hx + rr
  const qy = Math.abs(gymUv.y - box.cy) - hy + rr
  const sd = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - rr
  const feather = Math.max(Math.min(hx, hy) * STICKER_FOCUS_FEATHER, 1e-5)
  return smoothstep(sd / feather)
}

/**
 * Gym-texture offset that keeps the canvas centre on the phone at shrink 0
 * and lands the QR on VIDEO_QR_ANCHOR once the bezel has formed.
 */
export function gymScreenOffset(opts: {
  shrink: number
  rx: number
  ry: number
  qrUv: { x: number, y: number } | null
  anchorX?: number
  anchorYCss?: number
}): { ox: number, oy: number } {
  const restOx = 0.5 - 0.5 * opts.rx
  const restOy = 0.5 - 0.5 * opts.ry
  const t = clamp01(opts.shrink)
  if (!opts.qrUv || t <= 0) return { ox: restOx, oy: restOy }
  const ax = opts.anchorX ?? VIDEO_QR_ANCHOR.x
  const ay = 1 - (opts.anchorYCss ?? VIDEO_QR_ANCHOR.y)
  return {
    ox: lerp(restOx, opts.qrUv.x - ax * opts.rx, t),
    oy: lerp(restOy, opts.qrUv.y - ay * opts.ry, t),
  }
}
