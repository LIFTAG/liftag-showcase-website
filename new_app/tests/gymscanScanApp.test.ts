import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  APP_BLEND_SEC,
  APP_PLAY_AT,
  APP_STILL_SRC,
  STICKER_FOCUS_CORNER_FRAC,
  STICKER_FOCUS_LOD,
  STICKER_FOCUS_PAD,
  STICKER_FOCUS_RADIUS_PX,
  VIDEO_QR_ANCHOR,
  appScreenMix,
  canvasUvFromCssBox,
  gymQrUvBox,
  gymScreenOffset,
  phoneFocusBlur,
  stickerFocusOutside,
} from '../utils/gymscan/scanAppPass.ts'
import {
  GYM_SCAN_FLOW_SOURCES,
  SCAN_FLOW_LOG,
  SCAN_FLOW_SCAN,
  SCAN_FLOW_SEGMENTS,
} from '../utils/scanFlow.ts'

test('app mix waits for the fold, then blends on a short clock', () => {
  assert.equal(appScreenMix(0, false, 10), 0)
  assert.equal(appScreenMix(APP_PLAY_AT - 0.001, false, 10), 0)
  assert.equal(appScreenMix(APP_PLAY_AT, false, 0), 0)
  const mid = appScreenMix(APP_PLAY_AT, false, APP_BLEND_SEC / 2)
  assert.ok(mid > 0.4 && mid < 0.6, `mid mix should sit near 0.5, got ${mid}`)
  assert.equal(appScreenMix(APP_PLAY_AT, false, APP_BLEND_SEC), 1)
  assert.equal(appScreenMix(1, false, APP_BLEND_SEC), 1)
})

test('reduced motion snaps to the settled log screen at the lock', () => {
  assert.equal(appScreenMix(APP_PLAY_AT - 0.01, true, 0), 0)
  assert.equal(appScreenMix(APP_PLAY_AT, true, 0), 1)
  assert.equal(appScreenMix(1, true, 0), 1)
})

test('LOG slice starts on the scan-flow keyframe ScanSection already uses', () => {
  assert.equal(SCAN_FLOW_SCAN.end, SCAN_FLOW_LOG.start)
  assert.equal(SCAN_FLOW_LOG.start, 3.2)
  assert.equal(SCAN_FLOW_LOG.end, 6.4)
  assert.equal(SCAN_FLOW_SEGMENTS[1], SCAN_FLOW_LOG)
  assert.equal(APP_STILL_SRC, '/assets/gym3d/log-set.webp')
  assert.equal(GYM_SCAN_FLOW_SOURCES[1].src, '/assets/videos/gym-scan-flow.mp4')
})

test('canvas UV converts a CSS box with y-up', () => {
  const uv = canvasUvFromCssBox({ x: 400, y: 100, w: 200, h: 200 }, 1000, 1000)
  assert.equal(uv.x, 0.5)
  assert.ok(Math.abs(uv.y - 0.8) < 1e-9)
})

test('gym UVs keep the canvas centre until shrink, then lock the QR to the video anchor', () => {
  const rx = 0.4
  const ry = 1
  const rest = gymScreenOffset({ shrink: 0, rx, ry, qrUv: { x: 0.5, y: 0.7 } })
  assert.ok(Math.abs(rest.ox - (0.5 - 0.5 * rx)) < 1e-9)
  assert.ok(Math.abs(rest.oy - (0.5 - 0.5 * ry)) < 1e-9)

  const locked = gymScreenOffset({
    shrink: 1,
    rx,
    ry,
    qrUv: { x: 0.5, y: 0.7 },
  })
  const ay = 1 - VIDEO_QR_ANCHOR.y
  assert.ok(Math.abs(locked.ox - (0.5 - VIDEO_QR_ANCHOR.x * rx)) < 1e-9)
  assert.ok(Math.abs(locked.oy - (0.7 - ay * ry)) < 1e-9)
})

test('gym QR UV box is a y-up AABB around the CSS plate', () => {
  const box = gymQrUvBox({ x: 400, y: 100, w: 200, h: 200 }, 1000, 1000)
  assert.equal(box.cx, 0.5)
  assert.ok(Math.abs(box.cy - 0.8) < 1e-9)
  assert.equal(box.hx, 0.1)
  assert.equal(box.hy, 0.1)
})

test('phone focus blur stays off while full-bleed, then racks on', () => {
  assert.equal(phoneFocusBlur(0), 0)
  assert.equal(phoneFocusBlur(0.05), 0)
  const mid = phoneFocusBlur(0.25)
  assert.ok(mid > 0.2 && mid < 0.8, `mid focus should be in flight, got ${mid}`)
  assert.equal(phoneFocusBlur(0.5), 1)
  assert.equal(phoneFocusBlur(1), 1)
})

test('sticker focus is a larger rounded square around the plate', () => {
  const textureSize = { width: 1200, height: 800 }
  // These unequal UV half-axes describe a physically square 120px QR.
  const box = { cx: 0.5, cy: 0.5, hx: 0.05, hy: 0.075 }
  assert.equal(stickerFocusOutside({ x: 0.5, y: 0.5 }, box), 0)
  assert.ok(stickerFocusOutside({ x: 0.5, y: 0.5 + box.hy * 0.4 }, box) < 0.02)
  const rim = stickerFocusOutside({ x: 0.5, y: 0.5 + box.hy }, box, textureSize)
  assert.ok(rim < 0.35, `plate edge should still be mostly sharp, got ${rim}`)
  const clearHalfX = box.hx * STICKER_FOCUS_PAD
  const clearHalfY = box.hy * STICKER_FOCUS_PAD
  assert.equal(stickerFocusOutside({ x: 0.5 + clearHalfX * 0.8, y: 0.5 }, box, textureSize), 0)
  assert.equal(stickerFocusOutside({ x: 0.5, y: 0.5 + clearHalfY * 0.8 }, box, textureSize), 0)
  const roundedCorner = stickerFocusOutside(
    { x: 0.5 + clearHalfX, y: 0.5 + clearHalfY },
    box,
    textureSize,
  )
  assert.ok(roundedCorner > 0.5, `outer corner should round into blur, got ${roundedCorner}`)
  const far = stickerFocusOutside({ x: 0.5, y: 0.92 }, box, textureSize)
  assert.ok(far > 0.98, `far gym should be fully soft, got ${far}`)
  assert.equal(STICKER_FOCUS_CORNER_FRAC, 0.14)
  assert.equal(STICKER_FOCUS_PAD, 1.32)
  assert.equal(STICKER_FOCUS_LOD, 4)
  assert.equal(STICKER_FOCUS_RADIUS_PX, 28)
})
