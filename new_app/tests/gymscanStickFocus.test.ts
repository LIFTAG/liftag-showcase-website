import assert from 'node:assert/strict'
import { test } from 'node:test'
import { CompositeShader } from '../utils/gymscan/composite.ts'
import { STICK_FOCUS_LAYER } from '../utils/gymscan/stickFocus.ts'

test('0C defocus follows sticker coverage, not a rounded-rect AABB', () => {
  const frag = CompositeShader.fragmentShader
  assert.equal('uFocusRect' in CompositeShader.uniforms, false)
  assert.equal(frag.includes('uFocusRect'), false)
  assert.equal(frag.includes('tFocus'), true)
  assert.equal(frag.includes('tBlur'), true)
  assert.equal(frag.includes('tFoil'), true)
  assert.equal('tFocus' in CompositeShader.uniforms, true)
  assert.equal('tBlur' in CompositeShader.uniforms, true)
  assert.equal('tFoil' in CompositeShader.uniforms, true)
})

test('transparent liner is over-blended onto a blurred gym, not kept sharp as coverage', () => {
  const frag = CompositeShader.fragmentShader
  assert.equal(frag.includes('film.a'), true)
  assert.equal(frag.includes('1.0 - card'), true)
})

test('coverage is drawn on its own camera layer so the gym is not in the mask', () => {
  assert.equal(STICK_FOCUS_LAYER, 2)
  assert.ok(STICK_FOCUS_LAYER !== 0)
})
