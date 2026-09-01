import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  DROP_G,
  DROP_HEIGHT,
  DROP_IMPACT,
  DROP_RESTITUTION,
  DROP_SETTLE,
  dropAt,
  dropPlanted,
  firstSweepTime,
} from '../utils/gymscan/drop.ts'
import {
  hologramPassAt,
  PEEL,
  timeAtHeight,
  Y_CONTACT,
} from '../utils/gymscan/hologramPass.ts'

const tImpact = DROP_IMPACT
const h1 = DROP_HEIGHT * DROP_RESTITUTION * DROP_RESTITUTION

test('release hangs at DROP_HEIGHT and is not yet a landing', () => {
  const a = dropAt(0)
  const b = dropAt(-1)
  assert.equal(a.y, DROP_HEIGHT)
  assert.equal(a.impacted, false)
  assert.equal(a.done, false)
  assert.equal(b.y, DROP_HEIGHT)
})

test('first flight is a falling parabola that lands on the nose', () => {
  const mid = dropAt(tImpact * 0.5)
  const nose = dropAt(tImpact - 1e-6)
  assert.ok(mid.y < DROP_HEIGHT)
  assert.ok(mid.y > 0)
  assert.equal(mid.impacted, false)
  assert.ok(nose.y < 0.02, `expected nearly on the floor, got ${nose.y}`)
  assert.equal(nose.impacted, false)
  assert.equal(dropAt(tImpact).impacted, true)
})

test('first bounce peaks near e² of the drop, then a smaller hop', () => {
  const tUp = Math.sqrt((2 * h1) / DROP_G)
  const apex = dropAt(tImpact + tUp)
  assert.ok(Math.abs(apex.y - h1) < 1e-6, `apex ${apex.y} vs ${h1}`)
  assert.equal(apex.impacted, true)
  assert.ok(h1 > 0.3 && h1 < 0.5, `first hop should read as weight, got ${h1}`)
  const h2 = h1 * DROP_RESTITUTION * DROP_RESTITUTION
  assert.ok(h2 > DROP_SETTLE, 'second hop is still visible')
  assert.ok(h2 < 0.08, `second hop is a shudder, got ${h2}`)
})

test('height stays in [0, DROP_HEIGHT] and each hop is shorter', () => {
  const tUp1 = Math.sqrt((2 * h1) / DROP_G)
  const tImpact2 = tImpact + 2 * tUp1
  for (let i = 0; i <= 200; i++) {
    const t = i / 100
    const pose = dropAt(t)
    assert.ok(pose.y >= -1e-12, `negative at t=${t}`)
    assert.ok(pose.y <= DROP_HEIGHT + 1e-9, `above release at t=${t}`)
    if (t >= tImpact) assert.ok(pose.y <= h1 + 1e-6, `first hop overshot at t=${t}`)
    if (t >= tImpact2) {
      const h2 = h1 * DROP_RESTITUTION * DROP_RESTITUTION
      assert.ok(pose.y <= h2 + 1e-6, `second hop overshot at t=${t}`)
    }
    if (pose.done) {
      assert.equal(pose.y, 0)
      assert.equal(pose.impacted, true)
      return
    }
  }
  assert.fail('drop did not settle within 2 s')
})

test('settles once and stays planted', () => {
  let doneAt = -1
  for (let i = 0; i <= 300; i++) {
    const pose = dropAt(i / 100)
    if (pose.done) {
      doneAt = i / 100
      break
    }
  }
  assert.ok(doneAt > 0.8 && doneAt < 1.4, `settle at ${doneAt}s`)
  assert.deepEqual(dropAt(doneAt + 1), { y: 0, impacted: true, done: true })
  assert.deepEqual(dropAt(50), { y: 0, impacted: true, done: true })
})

test('contact blob is off at release and full on the floor', () => {
  assert.equal(dropPlanted(DROP_HEIGHT), 0)
  assert.equal(dropPlanted(0), 1)
  assert.ok(dropPlanted(0.45) > 0.4 && dropPlanted(0.45) < 0.6)
})

test('first sweep peels the floor at the moment of impact', () => {
  const peel = 1.07
  assert.equal(firstSweepTime(0, peel), 0)
  assert.ok(Math.abs(firstSweepTime(DROP_IMPACT, peel) - peel) < 1e-10)
  assert.ok(Math.abs(firstSweepTime(DROP_IMPACT + 0.2, peel) - (peel + 0.2)) < 1e-10)
  let prev = -1
  for (let i = 0; i <= 40; i++) {
    const t = firstSweepTime(i / 40, peel)
    assert.ok(t >= prev, `firstSweepTime must be monotonic at ${i}`)
    prev = t
  }

  const opts = { yTop: 1.62, yBottom: -0.12, stemR: 0.32, maxR: 4.35 }
  const tPeel = Math.max(0, timeAtHeight(Y_CONTACT, opts.yTop, opts.yBottom) - PEEL)
  const atLand = hologramPassAt(firstSweepTime(DROP_IMPACT, tPeel), 1, opts)
  const before = hologramPassAt(firstSweepTime(DROP_IMPACT - 0.03, tPeel), 1, opts)
  const after = hologramPassAt(firstSweepTime(DROP_IMPACT + 0.04, tPeel), 1, opts)
  assert.equal(before.splashU, 0)
  assert.ok(atLand.groundDraw, 'floor mesh is submitted on impact')
  assert.ok(atLand.splashU < 0.06, `ring should still be at the feet, splashU=${atLand.splashU}`)
  assert.ok(atLand.waveR <= opts.stemR + 0.05)
  assert.ok(after.splashU > 0, 'ring is travelling the frame after impact')
})
