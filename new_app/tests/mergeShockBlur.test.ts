import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  MERGE_SHOCK_BANG,
  MERGE_SHOCK_BLEED,
  MERGE_SHOCK_FADE,
  MERGE_SHOCK_RISE,
  shockBlurActive,
  shockOriginInCopy,
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
