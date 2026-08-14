import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import {
  applySharedMousePosition,
  resetSharedMouse,
  useSharedMouse,
} from '../composables/useSharedMouse.ts'

afterEach(() => {
  resetSharedMouse()
})

test('hasPointer stays false until a real pointer sample arrives', () => {
  const { latest } = useSharedMouse()
  assert.equal(latest.hasPointer, false)
  assert.equal(latest.mx, 0)
  assert.equal(latest.my, 0)
})

test('applySharedMousePosition marks the pointer live and maps the viewport center', () => {
  const { latest } = useSharedMouse()
  applySharedMousePosition(400, 300, 800, 600)
  assert.equal(latest.hasPointer, true)
  assert.equal(latest.mx, 0)
  assert.equal(latest.my, 0)
  assert.equal(latest.clientX, 400)
  assert.equal(latest.clientY, 300)
})

test('applySharedMousePosition maps the top-left corner to -1,-1', () => {
  const { latest } = useSharedMouse()
  applySharedMousePosition(0, 0, 800, 600)
  assert.equal(latest.hasPointer, true)
  assert.equal(latest.mx, -1)
  assert.equal(latest.my, -1)
})
