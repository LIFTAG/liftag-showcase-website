import assert from 'node:assert/strict'
import { test } from 'node:test'
import { consumeScrubDelta, horizontalWheelDelta, NUMBER_SCRUB_THRESHOLD } from '../utils/numberScrub.ts'

test('travel under the threshold only banks remainder', () => {
  assert.deepEqual(consumeScrubDelta(0, 10), { remainder: 10, steps: 0 })
})

test('rightward travel past the threshold steps up and keeps the leftover', () => {
  const { remainder, steps } = consumeScrubDelta(0, NUMBER_SCRUB_THRESHOLD + 6)
  assert.equal(steps, 1)
  assert.equal(remainder, 6)
})

test('leftward travel steps down', () => {
  const { remainder, steps } = consumeScrubDelta(0, -(NUMBER_SCRUB_THRESHOLD * 2 + 3))
  assert.equal(steps, -2)
  assert.equal(remainder, -3)
})

test('banked remainder carries into the next delta', () => {
  const first = consumeScrubDelta(0, NUMBER_SCRUB_THRESHOLD - 4)
  const second = consumeScrubDelta(first.remainder, 10)
  assert.equal(first.steps, 0)
  assert.equal(second.steps, 1)
  assert.equal(second.remainder, 6)
})

test('a horizontal wheel toward the plus control is positive', () => {
  // Natural trackpad: fingers right, content follows, deltaX is negative.
  assert.equal(horizontalWheelDelta({ deltaX: -40, deltaY: 4, deltaMode: 0, shiftKey: false }), 40)
})

test('a vertical wheel is ignored so the page can still scroll', () => {
  assert.equal(horizontalWheelDelta({ deltaX: 8, deltaY: 40, deltaMode: 0, shiftKey: false }), null)
})

test('shift+wheel uses the vertical delta as horizontal travel', () => {
  assert.equal(horizontalWheelDelta({ deltaX: 0, deltaY: -24, deltaMode: 0, shiftKey: true }), 24)
})

test('line-mode deltas are converted to pixels', () => {
  assert.equal(horizontalWheelDelta({ deltaX: -2, deltaY: 0, deltaMode: 1, shiftKey: false }), 32)
})
