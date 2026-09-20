import assert from 'node:assert/strict'
import { test } from 'node:test'
import { splitHeroPresentationAt } from '../utils/gymscan/splitHeroPresentation.ts'

const neutral = { zoom: 1, offsetX: 0, lightGain: 1 }

test('hero presentation is opt-in and requires the demo scroll driver', () => {
  assert.deepEqual(splitHeroPresentationAt(false, 0, 'assemble', false), neutral)
  assert.deepEqual(splitHeroPresentationAt(true, null, 'assemble', false), neutral)
})

test('the flying tag always uses the original projection, even when scroll stops near the top', () => {
  for (const shot of ['fly', 'stick', 'hold'] as const) {
    for (const progress of [0, 0.001, 0.03, 0.5, 1]) {
      assert.deepEqual(splitHeroPresentationAt(true, progress, shot, false), neutral)
    }
  }
})

test('the editorial crop releases before the approach and retraces on reverse scroll', () => {
  const progress = [0, 0.01, 0.03, 0.05, 0.07, 0.1, 1]
  const frames = progress.map(value => splitHeroPresentationAt(true, value, 'assemble', false))
  assert.ok(frames[0]!.zoom > 1)
  assert.ok(frames[0]!.offsetX < 0)
  for (let i = 1; i < frames.length; i++) {
    assert.ok(frames[i]!.zoom <= frames[i - 1]!.zoom)
    assert.ok(frames[i]!.lightGain <= frames[i - 1]!.lightGain)
  }
  assert.deepEqual(frames[4], neutral)
  assert.deepEqual([...progress].reverse().map(value => splitHeroPresentationAt(true, value, 'assemble', false)), [...frames].reverse())
})

test('portrait widens its framing to fit the machine below the copy', () => {
  const portrait = splitHeroPresentationAt(true, 0, 'assemble', true)
  assert.ok(portrait.zoom < 1)
  assert.equal(portrait.offsetX, 0)
  assert.ok(portrait.lightGain > 1)
})
