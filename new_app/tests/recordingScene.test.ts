import { test } from 'node:test'
import assert from 'node:assert/strict'
import { RECORDING_DURATION, sampleRecordingMotion } from '../utils/gymscan/recordingScene.ts'

const motion = { durationSeconds: RECORDING_DURATION, carriage: { axis: [0, 1, 0] as [number, number, number], displacementMeters: .3, samples: [[0, 0], [.5, 1], [1, 0]] as [number, number][] } }

test('carriage begins and ends retracted with full extension mid-cycle', () => {
  assert.equal(sampleRecordingMotion(motion, 0), 0)
  assert.ok(Math.abs(sampleRecordingMotion(motion, RECORDING_DURATION / 2) - 1) < 1e-9)
  assert.equal(sampleRecordingMotion(motion, RECORDING_DURATION), 0)
})

test('carriage and athlete share a continuous looping clock', () => {
  assert.ok(Math.abs(sampleRecordingMotion(motion, RECORDING_DURATION - .001) - sampleRecordingMotion(motion, -.001)) < 1e-9)
})
