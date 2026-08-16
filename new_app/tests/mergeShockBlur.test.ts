import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  MERGE_SHOCK_BANG,
  MERGE_SHOCK_BLEED,
  MERGE_SHOCK_EASE_START,
  MERGE_SHOCK_FADE,
  MERGE_SHOCK_MASK_IMAGE,
  MERGE_SHOCK_RISE,
  MERGE_SHOCK_S0,
  MERGE_SHOCK_S1,
  MERGE_SHOCK_SIZE_VMAX,
  shockBlurActive,
  shockBurstEase,
  shockOriginInCopy,
  shockwaveMaskStyle,
  shockwaveRadiusPx,
} from '../utils/mergeShockBlur.ts'

test('shock origin is the ray origin translated into the padded copy box', () => {
  // Stage centre at (720, 400) in sticky space; copy starts at (80, 220).
  assert.deepEqual(shockOriginInCopy(720, 400, 80, 220), {
    x: 720 - 80 + MERGE_SHOCK_BLEED,
    y: 400 - 220 + MERGE_SHOCK_BLEED,
  })
})

test('a custom bleed shifts the origin by that inset', () => {
  assert.deepEqual(shockOriginInCopy(100, 50, 0, 0, 12), { x: 112, y: 62 })
})

test('blur is off before the outer ring bangs and after it fades', () => {
  assert.equal(shockBlurActive(0), false)
  assert.equal(shockBlurActive(MERGE_SHOCK_BANG - 0.001), false)
  assert.equal(shockBlurActive(MERGE_SHOCK_BANG), true)
  assert.equal(shockBlurActive(0.5), true)
  const end = MERGE_SHOCK_BANG + MERGE_SHOCK_RISE + MERGE_SHOCK_FADE
  assert.equal(shockBlurActive(end), true)
  assert.equal(shockBlurActive(end + 0.001), false)
  assert.equal(shockBlurActive(1), false)
})

test('reduced motion and mobile never attach the backdrop-filter', () => {
  assert.equal(shockBlurActive(0.5, { reduceMotion: true }), false)
  assert.equal(shockBlurActive(0.5, { mobile: true }), false)
  assert.equal(shockBlurActive(0.5, { reduceMotion: true, mobile: true }), false)
})

test('burst ease matches the halo cubic and stays in 0..1', () => {
  assert.equal(shockBurstEase(MERGE_SHOCK_EASE_START), 0)
  assert.equal(shockBurstEase(0), 0)
  assert.equal(shockBurstEase(1), 1)
  // t = 0.5 → 1 - 0.5³ = 0.875, same cubic the halo uses.
  assert.ok(Math.abs(shockBurstEase(0.08 + 0.5 * 0.92) - 0.875) < 1e-9)
})

test('wave radius matches 72vmax * halo scale / 2', () => {
  const vmax = 1000
  assert.equal(shockwaveRadiusPx(MERGE_SHOCK_EASE_START, vmax), vmax * MERGE_SHOCK_SIZE_VMAX * MERGE_SHOCK_S0 / 2)
  assert.equal(
    shockwaveRadiusPx(1, vmax),
    vmax * MERGE_SHOCK_SIZE_VMAX * (MERGE_SHOCK_S0 + MERGE_SHOCK_S1) / 2,
  )
})

test('mask box is centred on the origin and grows with the wave', () => {
  const mask = shockwaveMaskStyle(400, 200, 250)
  assert.equal(mask.image, MERGE_SHOCK_MASK_IMAGE)
  assert.equal(mask.size, '500px 500px')
  assert.equal(mask.position, '150px -50px')
})
