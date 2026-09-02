import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  GYM_SCAN_STICKY_SVH,
  GYM_SCROLL_DAMP_RATE,
  HERO_FRONT_PHONE_CSS_W,
  HERO_PHONE_TILT_X,
  HERO_PHONE_TILT_Y,
  SCENE_END,
  fallbackHeroSlot,
  heroBodyTargetFromPhoneBox,
  heroMorphAt,
  heroPointerTilt,
  heroScaleEase,
  heroTiltMix,
  heroTravelEase,
  lerpPhoneBox,
  phoneVisibleHeight,
  sceneProgress,
  travelPhoneBox,
} from '../utils/gymscan/handoff.ts'
import { PHONE_H, PHONE_W } from '../utils/phoneModel.ts'
import { damp } from '../utils/gymscan/timeline.ts'

test('scene window keeps the original 7.6 svh 3D act', () => {
  assert.ok(Math.abs(SCENE_END * GYM_SCAN_STICKY_SVH - 7.6) < 0.02)
})

test('scanner scroll catches up within ten frames without snapping', () => {
  let progress = 0
  for (let frame = 0; frame < 10; frame++) {
    progress = damp(progress, 1, GYM_SCROLL_DAMP_RATE, 1 / 60)
  }
  assert.ok(progress > 0.95, `expected >95% catch-up, got ${progress}`)
  assert.ok(progress < 1, 'scroll response should retain a short ease')
})

test('progress below SCENE_END is the 3D act, morph stays 0', () => {
  assert.equal(sceneProgress(0), 0)
  assert.ok(Math.abs(sceneProgress(SCENE_END) - 1) < 1e-9)
  assert.equal(heroMorphAt(0), 0)
  assert.equal(heroMorphAt(SCENE_END), 0)
  assert.equal(heroMorphAt(1), 1)
  assert.ok(sceneProgress(SCENE_END / 2) > 0.49 && sceneProgress(SCENE_END / 2) < 0.51)
})

test('hero travel eases out and is clamped', () => {
  assert.equal(heroTravelEase(0), 0)
  assert.equal(heroTravelEase(1), 1)
  assert.equal(heroTravelEase(-1), 0)
  assert.equal(heroTravelEase(2), 1)
  const mid = heroTravelEase(0.5)
  assert.ok(mid > 0.9, `ease-out quart at 0.5 should be late, got ${mid}`)
})

test('hero body target is the Phone3D body inside the CSS phone box', () => {
  const box = { x: 100, y: 40, w: 258, h: 558 }
  const target = heroBodyTargetFromPhoneBox(box)
  const fill = PHONE_H / phoneVisibleHeight()
  assert.ok(Math.abs(target.h - box.h * fill) < 1e-6)
  assert.ok(Math.abs(target.w / target.h - PHONE_W / PHONE_H) < 1e-6)
  assert.ok(Math.abs(target.x + target.w / 2 - (box.x + box.w / 2)) < 1e-6)
  assert.ok(Math.abs(target.y + target.h / 2 - (box.y + box.h / 2)) < 1e-6)
  assert.ok(target.h < box.h, 'body is smaller than the CSS phone box')
})

test('rect lerp is component-wise', () => {
  const out = lerpPhoneBox(
    { x: 0, y: 0, w: 100, h: 200 },
    { x: 10, y: 20, w: 200, h: 400 },
    0.5,
  )
  assert.deepEqual(out, { x: 5, y: 10, w: 150, h: 300 })
})

test('hero scale ease lags travel so the phone shrinks into place', () => {
  assert.equal(heroScaleEase(0), 0)
  assert.equal(heroScaleEase(1), 1)
  const midScale = heroScaleEase(0.5)
  const midTravel = heroTravelEase(0.5)
  assert.ok(midScale < midTravel, `scale ${midScale} should lag travel ${midTravel}`)
  assert.ok(midScale > 0.8, `ease-out cubic at 0.5 should still be late, got ${midScale}`)
})

test('travel box uses independent position and scale eases', () => {
  const park = { x: 0, y: 0, w: 200, h: 400 }
  const slot = { x: 100, y: 80, w: 100, h: 200 }
  const mid = travelPhoneBox(park, slot, 0.5, false)
  const posT = heroTravelEase(0.5)
  const sizeT = heroScaleEase(0.5)
  assert.ok(Math.abs(mid.w - lerp(200, 100, sizeT)) < 1e-9)
  assert.ok(Math.abs(mid.h - lerp(400, 200, sizeT)) < 1e-9)
  const cx = mid.x + mid.w / 2
  const cy = mid.y + mid.h / 2
  assert.ok(Math.abs(cx - lerp(100, 150, posT)) < 1e-9)
  assert.ok(Math.abs(cy - lerp(200, 180, posT)) < 1e-9)
  assert.deepEqual(travelPhoneBox(park, slot, 0, false), park)
  assert.deepEqual(travelPhoneBox(park, slot, 1, false), slot)
  assert.deepEqual(travelPhoneBox(park, slot, 0.4, true), slot)
})

test('pointer tilt matches Phone3D applyPointerTilt gains', () => {
  const t = heroPointerTilt(1, -1)
  assert.equal(t.rotY, HERO_PHONE_TILT_Y)
  assert.equal(t.rotX, -HERO_PHONE_TILT_X)
  assert.deepEqual(heroPointerTilt(0, 0), { rotX: 0, rotY: 0 })
})

test('tilt mix is off at full-bleed and on once the bezel reads', () => {
  assert.equal(heroTiltMix(0), 0)
  assert.ok(heroTiltMix(0.04) < 0.01)
  assert.ok(heroTiltMix(0.15) > 0.4 && heroTiltMix(0.15) < 0.6)
  assert.equal(heroTiltMix(1), 1)
})

test('fallback hero slot is the smaller front-phone body', () => {
  const parkH = 620
  const slot = fallbackHeroSlot(1440, 900)
  assert.ok(slot.h < parkH, `hero slot ${slot.h} should be smaller than park ${parkH}`)
  assert.ok(Math.abs(slot.w / slot.h - PHONE_W / PHONE_H) < 1e-6)
  const cssH = HERO_FRONT_PHONE_CSS_W / (393 / 852)
  assert.ok(slot.h < cssH, 'body is smaller than the CSS phone box')
})

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

