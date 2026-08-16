import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  HOLO_AX_WEIGHT,
  HOLO_DEMO_UNLOCK,
  HOLO_REST_PHASE,
  HOLO_UNLOCK_HALF,
  HOLO_UNLOCK_PEAK,
  holoFace,
  holoHueT,
  holoPhase,
  holoSheetTravel,
  holoUnlock,
} from '../utils/holoFoil.ts'

test('a centred pointer sits at rest phase and does not unlock', () => {
  const phase = holoPhase(0, 0)
  assert.equal(phase, HOLO_REST_PHASE)
  assert.equal(holoUnlock(phase), 0)
  assert.equal(holoFace(phase), 0)
})

test('rest sits outside the unlock lobe so the latent image stays hidden', () => {
  assert.ok(HOLO_UNLOCK_PEAK - HOLO_UNLOCK_HALF > HOLO_REST_PHASE)
})

test('the designed tilt reconstructs the latent image at full strength', () => {
  const ax = (HOLO_UNLOCK_PEAK - HOLO_REST_PHASE) / HOLO_AX_WEIGHT
  const phase = holoPhase(ax, 0)
  assert.ok(Math.abs(phase - HOLO_UNLOCK_PEAK) < 1e-9)
  assert.equal(holoUnlock(phase), 1)
})

test('the idle demo addend carries a still pointer to the unlock peak', () => {
  assert.equal(HOLO_DEMO_UNLOCK, HOLO_UNLOCK_PEAK - HOLO_REST_PHASE)
  assert.equal(holoPhase(0, 0, HOLO_DEMO_UNLOCK), HOLO_UNLOCK_PEAK)
  assert.equal(holoUnlock(holoPhase(0, 0, HOLO_DEMO_UNLOCK)), 1)
})

test('past the lobe the reconstruction falls back to zero', () => {
  assert.equal(holoUnlock(HOLO_UNLOCK_PEAK + HOLO_UNLOCK_HALF), 0)
  assert.equal(holoUnlock(HOLO_UNLOCK_PEAK - HOLO_UNLOCK_HALF), 0)
  assert.equal(holoUnlock(0), 0)
  assert.equal(holoUnlock(1), 0)
})

test('sticky reveal keeps the face lit after the sheet has settled', () => {
  assert.equal(holoFace(HOLO_REST_PHASE, 1), 1)
  assert.equal(holoFace(HOLO_UNLOCK_PEAK, 0.2), 1)
})

test('the rainbow sheet is still off the plate at rest and mid-cross at the peak', () => {
  const rest = holoSheetTravel(HOLO_REST_PHASE)
  const peak = holoSheetTravel(HOLO_UNLOCK_PEAK)
  assert.ok(rest <= 0)
  assert.ok(peak > 0.45 && peak < 0.65)
})

test('hue walks the prism ramp with the viewing phase and stays in 0..1', () => {
  assert.equal(holoHueT(-0.2), 0)
  assert.equal(holoHueT(0.4), 0.4)
  assert.equal(holoHueT(1.4), 1)
})
