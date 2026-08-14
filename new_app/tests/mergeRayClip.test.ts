import assert from 'node:assert/strict'
import { test } from 'node:test'
import { rayDissolvedLength, rayRectVisibleLength } from '../utils/mergeRayClip.ts'

const SQRT_HALF = Math.SQRT1_2

test('leftward ray from an interior point reaches the left clip edge', () => {
  // Stage-like origin on the right half of a 1000x800 sticky viewport.
  const length = rayRectVisibleLength(638, 400, -1, 0, 0, 0, 1000, 800)
  assert.equal(length, 638)
})

test('rightward ray from the same point reaches the right clip edge', () => {
  const length = rayRectVisibleLength(638, 400, 1, 0, 0, 0, 1000, 800)
  assert.equal(length, 362)
})

test('upward and downward rays reach the sticky top and bottom', () => {
  assert.equal(rayRectVisibleLength(500, 400, 0, -1, 0, 0, 1000, 800), 400)
  assert.equal(rayRectVisibleLength(500, 400, 0, 1, 0, 0, 1000, 800), 400)
})

test('diagonal ray exits at the nearer boundary', () => {
  const length = rayRectVisibleLength(100, 50, -SQRT_HALF, -SQRT_HALF, 0, 0, 200, 100)
  assert.ok(Math.abs(length - 50 * Math.SQRT2) < 1e-9)
})

test('returns 0 when the start is outside the clip rect', () => {
  assert.equal(rayRectVisibleLength(-10, 50, 1, 0, 0, 0, 200, 100), 0)
  assert.equal(rayRectVisibleLength(100, -4, 0, 1, 0, 0, 200, 100), 0)
})

test('returns 0 for a zero direction or a degenerate rect', () => {
  assert.equal(rayRectVisibleLength(50, 50, 0, 0, 0, 0, 200, 100), 0)
  assert.equal(rayRectVisibleLength(50, 50, 1, 0, 0, 0, 0, 100), 0)
})

test('a start on the left edge going right spans the full width', () => {
  assert.equal(rayRectVisibleLength(0, 50, 1, 0, 0, 0, 200, 100), 200)
})

test('a start on the left edge going left does not draw outside', () => {
  assert.equal(rayRectVisibleLength(0, 50, -1, 0, 0, 0, 200, 100), 0)
})

test('rayDissolvedLength pulls the tip back from the clip edge', () => {
  assert.equal(rayDissolvedLength(400, 96), 304)
})

test('rayDissolvedLength never eats more than a third of a short beam', () => {
  assert.equal(rayDissolvedLength(100, 96), 68)
})

test('rayDissolvedLength hides degenerate lengths', () => {
  assert.equal(rayDissolvedLength(0), 0)
  assert.equal(rayDissolvedLength(1), 0)
})
