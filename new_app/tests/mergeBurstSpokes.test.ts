import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  MERGE_SPOKE_TWIST,
  burstSpokesFromOrbit,
  spokeAngleDeg,
  spokeTwistDeg,
} from '../utils/mergeBurstSpokes.ts'

test('a point to the right sits on the CSS 0deg axis', () => {
  assert.equal(spokeAngleDeg(100, 0), 0)
})

test('a point below sits near 90deg (screen y grows downward)', () => {
  assert.equal(spokeAngleDeg(0, 100), 90)
})

test('a point to the left sits at 180deg', () => {
  assert.equal(spokeAngleDeg(-40, 0), 180)
})

test('adjacent spokes twist open in opposite directions', () => {
  assert.equal(spokeTwistDeg(0), MERGE_SPOKE_TWIST)
  assert.equal(spokeTwistDeg(1), -MERGE_SPOKE_TWIST)
  assert.equal(spokeTwistDeg(2), MERGE_SPOKE_TWIST)
})

test('burstSpokesFromOrbit keeps one spoke per app, aimed at its rest pose', () => {
  const spokes = burstSpokesFromOrbit([
    { key: 'a', x: 10, y: 0, core: '#ccff00', delay: 0 },
    { key: 'b', x: 0, y: 10, core: '#ff2d55', delay: 1 },
  ])
  assert.equal(spokes.length, 2)
  assert.equal(spokes[0].key, 'a')
  assert.equal(spokes[0].deg, 0)
  assert.equal(spokes[0].turn, MERGE_SPOKE_TWIST)
  assert.equal(spokes[1].deg, 90)
  assert.equal(spokes[1].turn, -MERGE_SPOKE_TWIST)
  assert.equal(spokes[1].core, '#ff2d55')
})
