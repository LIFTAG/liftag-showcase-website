import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  PLATE_CANVAS_HALF,
  PLATE_PHONE_SETTLED_PRESENT_MS,
  PLATE_PRESS_MS,
  PLATE_REST_TILT,
  plateExtremeTilt,
  plateBufferScale,
  plateIdleSway,
  plateMaxProjectedExtent,
  platePhaseAt,
  platePointerTilt,
  platePresentIntervalMs,
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

test('rest and extreme tilts keep the rim inside the canvas', () => {
  const rest = plateMaxProjectedExtent(PLATE_REST_TILT.rotX, PLATE_REST_TILT.rotY)
  const extreme = plateExtremeTilt()
  const tilted = plateMaxProjectedExtent(extreme.rotX, extreme.rotY)
  const left = platePointerTilt(-1, 0)
  const yawed = plateMaxProjectedExtent(left.rotX, left.rotY)

  assert.ok(rest.x < PLATE_CANVAS_HALF - 0.04, `rest x ${rest.x}`)
  assert.ok(rest.y < PLATE_CANVAS_HALF - 0.04, `rest y ${rest.y}`)
  assert.ok(tilted.x < PLATE_CANVAS_HALF - 0.04, `extreme x ${tilted.x}`)
  assert.ok(tilted.y < PLATE_CANVAS_HALF - 0.04, `extreme y ${tilted.y}`)
  assert.ok(yawed.x < PLATE_CANVAS_HALF - 0.04, `yaw x ${yawed.x}`)
})

test('the plate canvas tracks native DPR up to a still-cheap cap', () => {
  assert.equal(plateBufferScale(2, 8, 1440), 2)
  assert.equal(plateBufferScale(3, 8, 1440), 2)
  assert.equal(plateBufferScale(3, 4, 390), 2.5)
  assert.equal(plateBufferScale(2, 8, 390), 2)
  assert.equal(plateBufferScale(2, 4, 1440), 1.25)
  assert.equal(plateBufferScale(2, 2, 390), 1.5)
  assert.equal(plateBufferScale(1, 8, 1440), 1)
})

test('phones present every other frame only after the press', () => {
  assert.equal(platePresentIntervalMs(390, 0), 0)
  assert.equal(platePresentIntervalMs(390, PLATE_PRESS_MS - 1), 0)
  assert.equal(platePresentIntervalMs(390, PLATE_PRESS_MS), PLATE_PHONE_SETTLED_PRESENT_MS)
  assert.equal(platePresentIntervalMs(1440, PLATE_PRESS_MS + 400), 0)
})

test('idle sway is zero when the plate has no residual life', () => {
  const still = plateIdleSway(4000, 0)
  assert.equal(still.rotX, 0)
  assert.equal(still.rotY, 0)

  const living = plateIdleSway(4000, 1)
  assert.ok(Math.abs(living.rotX) + Math.abs(living.rotY) > 0)
})
