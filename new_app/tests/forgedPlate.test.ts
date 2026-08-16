import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  PLATE_PRESS_MS,
  PLATE_REST_TILT,
  plateIdleSway,
  platePhaseAt,
  platePointerTilt,
} from '../utils/forgedPlate.ts'

test('reduced motion is a finished plate with no residual motion', () => {
  const phase = platePhaseAt(0, true)
  assert.equal(phase.pour, 0)
  assert.equal(phase.settle, 1)
  assert.equal(phase.stamp, 1)
  assert.equal(phase.squash, 0)
  assert.equal(phase.shock, 1)
  assert.equal(phase.live, 0)
})

test('t=0 is a molten pour with no stamp and no press', () => {
  const phase = platePhaseAt(0)
  assert.ok(phase.pour > 0.98)
  assert.ok(phase.settle < 0.02)
  assert.equal(phase.stamp, 0)
  assert.equal(phase.squash, 0)
  assert.equal(phase.shock, 0)
})

test('the metal settles before the number is fully stamped', () => {
  const midPour = platePhaseAt(800)
  const atStamp = platePhaseAt(1400)
  assert.ok(midPour.pour > atStamp.pour)
  assert.ok(midPour.stamp < 0.05)
  assert.ok(atStamp.stamp > 0.4)
  assert.ok(atStamp.settle > 0.9)
})

test('squash is a pulse around the press, not a lasting flatten', () => {
  const before = platePhaseAt(1000)
  const peak = platePhaseAt(1280)
  const after = platePhaseAt(1800)
  assert.ok(before.squash < 0.15)
  assert.ok(peak.squash > 0.85)
  assert.ok(after.squash < 0.05)
})

test('after the press the plate is solid chrome with a living residual', () => {
  const phase = platePhaseAt(PLATE_PRESS_MS + 400)
  assert.equal(phase.pour, 0)
  assert.equal(phase.settle, 1)
  assert.equal(phase.stamp, 1)
  assert.equal(phase.squash, 0)
  assert.equal(phase.shock, 1)
  assert.ok(phase.live > 0.4)
})

test('pointer tilt is a small offset around the resting pose', () => {
  const rest = platePointerTilt(0, 0)
  assert.equal(rest.rotX, PLATE_REST_TILT.rotX)
  assert.equal(rest.rotY, PLATE_REST_TILT.rotY)

  const left = platePointerTilt(-1, 0)
  const right = platePointerTilt(1, 0)
  assert.ok(left.rotY < rest.rotY)
  assert.ok(right.rotY > rest.rotY)
})

test('idle sway is zero when the plate has no residual life', () => {
  const still = plateIdleSway(4000, 0)
  assert.equal(still.rotX, 0)
  assert.equal(still.rotY, 0)

  const living = plateIdleSway(4000, 1)
  assert.ok(Math.abs(living.rotX) + Math.abs(living.rotY) > 0)
})
