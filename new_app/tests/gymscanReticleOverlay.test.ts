import assert from 'node:assert/strict'
import { test } from 'node:test'

import { reticlePixelBounds, reticlePixelState } from '../utils/gymscan/reticleOverlay.ts'

test('reticle geometry scales from CSS pixels into the WebGL drawing buffer', () => {
  const state = reticlePixelState(
    { x: 100, y: 80, w: 60, h: 72, arm: 14, opacity: 1, capture: 0 },
    1280,
    720,
    1920,
    1080,
  )
  assert.deepEqual(state, {
    x: 150,
    y: 120,
    w: 90,
    h: 108,
    arm: 21,
    stroke: 2.25,
    outset: 1,
  })
})

test('reticle geometry remains finite on a zero-size bootstrap canvas', () => {
  const state = reticlePixelState(
    { x: 0, y: 0, w: 1, h: 1, arm: 16, opacity: 1, capture: 0 },
    0,
    0,
    1,
    1,
  )
  assert.ok(Object.values(state).every(Number.isFinite))
})

test('reticle shader only draws its local bracket region', () => {
  const bounds = reticlePixelBounds(
    { x: 150, y: 120, w: 90, h: 108, arm: 21, stroke: 2.25, outset: 1 },
    1920,
    1080,
  )
  assert.deepEqual(bounds, [121.5, 91.5, 268.5, 256.5])
  assert.ok((bounds[2] - bounds[0]) * (bounds[3] - bounds[1]) < 1920 * 1080 * 0.02)
})

test('a closed capture frame still draws only its local plate region', () => {
  const state = reticlePixelState(
    { x: 100, y: 80, w: 60, h: 72, arm: 14, opacity: 1, capture: 0.36 },
    1280,
    720,
    1920,
    1080,
  )
  assert.ok(state.outset < 0.02)
  assert.ok(state.arm > 21, 'closed arms span the plate, not the hunting L')
  const bounds = reticlePixelBounds(state, 1920, 1080)
  assert.ok((bounds[2] - bounds[0]) * (bounds[3] - bounds[1]) < 1920 * 1080 * 0.03)
})
