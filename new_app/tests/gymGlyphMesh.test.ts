import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import {
  advanceGlyphLine,
  glyphBaseline,
  isSoftWrap,
  lineHeightPx,
  pickGlyphBox,
  snapTallGlyphBox,
} from '../utils/gymGlyphMesh.ts'

test('computed line-height in px falls back when the style is normal', () => {
  assert.equal(lineHeightPx('normal', 40), 48)
  assert.equal(lineHeightPx('40.8px', 40), 40.8)
  assert.equal(lineHeightPx('', 20), 24)
})

test('a wrap-boundary leftover on the previous line is dropped for the real glyph', () => {
  const picked = pickGlyphBox(
    [
      { left: 190, top: 0, width: 0, height: 40 },
      { left: 0, top: 40.8, width: 25, height: 40 },
    ],
    40.8,
  )
  assert.deepEqual(picked, { left: 0, top: 40.8, width: 25, height: 40 })
})

test('a union box covering two lines snaps onto the last line', () => {
  const snapped = snapTallGlyphBox(
    { left: 0, top: -5, width: 25, height: 86 },
    40.8,
  )
  assert.equal(snapped.top, -5 + 86 - 40.8)
  assert.equal(snapped.height, 40.8)
  assert.equal(snapped.left, 0)
})

test('a single-line box is left alone', () => {
  const box = { left: 0, top: 35.7, width: 25, height: 51 }
  assert.equal(snapTallGlyphBox(box, 40.8), box)
})

test('a wrapped capital whose Range still reports the previous line is a wrap', () => {
  const prev = { left: 181, top: -5.1, width: 9, height: 51 }
  const next = { left: 0, top: -5.1, width: 25, height: 51 }
  assert.equal(isSoftWrap(prev, next, 40.8), true)
})

test('a pre-line newline starts a new line even when the Range stays on the previous line', () => {
  const prev = { left: 181, top: -5.1, width: 9.5, height: 51 }
  const next = { left: 0, top: -5.1, width: 25, height: 51 }
  assert.equal(advanceGlyphLine(0, true, prev, next, 40.8), 1)
})

test('the next character on the same line is not a wrap', () => {
  const prev = { left: 0, top: -5.1, width: 21, height: 51 }
  const next = { left: 20, top: -5.1, width: 20, height: 51 }
  assert.equal(isSoftWrap(prev, next, 40.8), false)
})

test('centering the font box in the range recovers the alphabetic baseline', () => {
  const rect = { left: 0, top: 35.7, width: 25, height: 51 }
  assert.equal(glyphBaseline(rect, 39, 12), 35.7 + 39)
})

test('the hologram mesh samples glyphs from CSS line baselines, not a wrap Range', () => {
  const source = readFileSync(new URL('../composables/useGymGlyphMesh.ts', import.meta.url), 'utf8')
  assert.match(source, /placeContentGlyphs/)
  assert.doesNotMatch(source, /range\.getBoundingClientRect\(\)/)
})
