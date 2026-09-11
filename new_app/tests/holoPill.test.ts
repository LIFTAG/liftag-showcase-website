import assert from 'node:assert/strict'
import { test } from 'node:test'
import { holoShouldLatchFocus } from '../composables/useHoloPill.ts'

test('pointer click focus does not keep the hologram after leave', () => {
  assert.equal(holoShouldLatchFocus(true, false), false)
  assert.equal(holoShouldLatchFocus(true, true), false)
})

test('keyboard focus-visible keeps the hologram until blur', () => {
  assert.equal(holoShouldLatchFocus(false, true), true)
  assert.equal(holoShouldLatchFocus(false, false), false)
})
