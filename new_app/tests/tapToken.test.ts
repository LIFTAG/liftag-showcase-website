import assert from 'node:assert/strict'
import { test } from 'node:test'
import { tokenBufferScale } from '../utils/tapToken.ts'

test('the token canvas tracks native DPR without the iOS 4-core trap', () => {
  assert.equal(tokenBufferScale(2, 8, 1440), 1.25)
  assert.equal(tokenBufferScale(3, 8, 1440), 1.25)
  assert.equal(tokenBufferScale(3, 4, 390), 2.5)
  assert.equal(tokenBufferScale(2, 8, 390), 2)
  assert.equal(tokenBufferScale(2, 4, 1440), 1)
  assert.equal(tokenBufferScale(2, 2, 390), 1.5)
  assert.equal(tokenBufferScale(1, 8, 1440), 1)
})

test('desktop still honors an explicit dpr cap', () => {
  assert.equal(tokenBufferScale(2, 8, 1440, 1), 1)
  assert.equal(tokenBufferScale(3, 4, 390, 1), 2.5)
})
