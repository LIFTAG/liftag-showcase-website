import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  HOLO_AX_WEIGHT,
  HOLO_DEMO_UNLOCK,
  HOLO_POINTER_RANGE,
  HOLO_REST_PHASE,
  HOLO_UNLOCK_HALF,
  HOLO_UNLOCK_PEAK,
  clampHoloAxis,
  holoFace,
  holoHueT,
  holoPhase,
  holoPointerTilt,
  holoScrollTilt,
  holoSheetTravel,
  holoUnlock,
  holoViewportProgress,
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

test('axis values clamp to the pointer cube', () => {
  assert.equal(clampHoloAxis(-4), -1)
  assert.equal(clampHoloAxis(0.25), 0.25)
  assert.equal(clampHoloAxis(2), 1)
})

test('scroll progress at the bottom of the viewport stays locked', () => {
  const { ax, ay } = holoScrollTilt(0)
  assert.equal(holoUnlock(holoPhase(ax, ay)), 0)
})

test('scroll progress at mid-viewport reconstructs the latent image', () => {
  const { ax, ay } = holoScrollTilt(0.5)
  const phase = holoPhase(ax, ay)
  assert.ok(Math.abs(phase - HOLO_UNLOCK_PEAK) < 0.03)
  assert.ok(holoUnlock(phase) > 0.8)
})

test('scroll progress at the top of the viewport walks past the lobe', () => {
  const { ax, ay } = holoScrollTilt(1)
  assert.equal(holoUnlock(holoPhase(ax, ay)), 0)
})

test('viewport progress is 0 at the bottom, 1 at the top, 0.5 when centred', () => {
  assert.equal(holoViewportProgress(1000, 0, 1000), 0)
  assert.equal(holoViewportProgress(0, 0, 1000), 1)
  assert.equal(holoViewportProgress(400, 200, 1000), 0.5)
})

test('pointer tilt is zero over the sticker centre and saturates outside the plate', () => {
  const rect = { left: 100, top: 50, width: 200, height: 100 }
  assert.deepEqual(holoPointerTilt(200, 100, rect), { ax: 0, ay: 0 })
  const edge = holoPointerTilt(100, 100, rect).ax
  assert.ok(edge < 0 && edge > -1)
  assert.equal(holoPointerTilt(-200, 100, rect).ax, -1)
  assert.equal(holoPointerTilt(800, 100, rect).ax, 1)
  assert.equal(HOLO_POINTER_RANGE, 1.8)
})
