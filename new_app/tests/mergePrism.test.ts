import assert from 'node:assert/strict'
import { test } from 'node:test'
import { prismBufferScale } from '../utils/mergePrism.ts'

test('the crystal tracks native DPR without matching the plate\'s desktop cap', () => {
  assert.equal(prismBufferScale(2, 8, 1440), 1.75)
  assert.equal(prismBufferScale(3, 8, 1440), 1.75)
  assert.equal(prismBufferScale(2, 8, 390), 1.75)
  assert.equal(prismBufferScale(2, 4, 1440), 1)
  assert.equal(prismBufferScale(1, 8, 1440), 1)
})
