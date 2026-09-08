import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  ACTIVATE_FLOOR_MAX_R,
  ACTIVATE_SPAN,
  ACTIVATE_TRAIL,
  ACTIVATE_TRAVEL,
  advanceActivationClock,
  hologramActivateAt,
  hologramActivateTag,
} from '../utils/gymscan/hologramActivate.ts'
import {
  kickTravel,
  TRAIL,
} from '../utils/gymscan/hologramPass.ts'

const OPTS = {
  maxR: 2.20,
  originY: 1.255,
  stemR: 0.45,
}

test('activation is dark before the plant and after the pass', () => {
  assert.equal(hologramActivateAt(-0.01, 1, OPTS).cageAmp, 0)
  assert.equal(hologramActivateAt(-0.01, 1, OPTS).ignite, 0)
  assert.equal(hologramActivateAt(-0.01, 1, OPTS).fill, 0)
  assert.equal(hologramActivateAt(-0.01, 1, OPTS).hot, 0)
  assert.equal(hologramActivateAt(-0.01, 1, OPTS).tag, 0)
  assert.equal(hologramActivateAt(ACTIVATE_SPAN + 0.02, 1, OPTS).cageAmp, 0)
  assert.equal(hologramActivateAt(ACTIVATE_SPAN + 0.02, 1, OPTS).groundAmp, 0)
  assert.equal(hologramActivateAt(ACTIVATE_SPAN + 0.02, 1, OPTS).lock, 0)
  assert.equal(hologramActivateAt(ACTIVATE_SPAN + 0.02, 1, OPTS).fill, 0)
  assert.equal(hologramActivateAt(ACTIVATE_SPAN + 0.02, 1, OPTS).tag, 0)
})

test('scroll envelope silences the activation the same way it silences idle', () => {
  const live = hologramActivateAt(0.4, 1, OPTS)
  const dead = hologramActivateAt(0.4, 0, OPTS)
  assert.ok(live.cageAmp > 0.5)
  assert.equal(dead.cageAmp, 0)
  assert.equal(dead.ignite, 0)
  assert.equal(dead.lock, 0)
  assert.equal(dead.fill, 0)
  assert.equal(dead.hot, 0)
  assert.equal(dead.tag, 0)
  assert.equal(dead.groundAmp, 0)
})

test('the front starts on the tag and covers the cage without overshooting', () => {
  const first = hologramActivateAt(0.02, 1, OPTS)
  assert.ok(first.frontR < 0.25, `ignition must sit on the tag, r=${first.frontR}`)
  let prev = first.frontR
  for (let i = 1; i <= 20; i++) {
    const r = hologramActivateAt((ACTIVATE_TRAVEL * i) / 20, 1, OPTS).frontR
    assert.ok(r >= prev - 1e-9, `front reversed at i=${i}`)
    assert.ok(r <= OPTS.maxR + 1e-9)
    prev = r
  }
  const done = hologramActivateAt(ACTIVATE_TRAVEL, 1, OPTS)
  assert.ok(Math.abs(done.frontR - OPTS.maxR) < 1e-6)
})

test('the sticker flashes before the cage fills, and the bloom holds on the tag', () => {
  const first = hologramActivateAt(0.08, 1, OPTS)
  const mid = hologramActivateAt(ACTIVATE_TRAVEL * 0.5, 1, OPTS)
  const lock = hologramActivateAt(1.20, 1, OPTS)
  assert.ok(first.tag > 0.7, `sticker should already be on, tag=${first.tag}`)
  assert.ok(first.fill < 0.05, `fill must wait for the tag flash, fill=${first.fill}`)
  assert.ok(first.ignite > 0.6)
  assert.ok(first.lock === 0)
  assert.ok(mid.ignite > 0.3, 'beam bloom stays on the tag while the skeleton grows')
  assert.ok(lock.lock > 0.7, `lock should be the online beat, lock=${lock.lock}`)
  assert.ok(hologramActivateTag(0.08, 1) === first.tag)
})

test('lock is a pulse after the cage is covered, not a second lime sweep', () => {
  const early = hologramActivateAt(0.2, 1, OPTS)
  const peak = hologramActivateAt(1.20, 1, OPTS)
  const late = hologramActivateAt(1.70, 1, OPTS)
  assert.equal(early.lock, 0)
  assert.ok(peak.lock > 0.8)
  assert.ok(peak.frontR > OPTS.maxR * 0.9, 'lock waits until the fill has covered the machine')
  assert.ok(late.lock < 0.2)
  assert.ok(late.cageAmp > 0, 'the silhouette is still fading, not cut')
})

test('activation dissolves instead of cutting, and is still on after a fast-scroll beat', () => {
  const a = hologramActivateAt(1.35, 1, OPTS)
  const b = hologramActivateAt(1.75, 1, OPTS)
  const c = hologramActivateAt(2.05, 1, OPTS)
  assert.ok(a.cageAmp > b.cageAmp, 'fade must already be dropping')
  assert.ok(b.cageAmp > c.cageAmp)
  assert.ok(b.fill > 0.15, `mid-fade must still be visible, fill=${b.fill}`)
  assert.ok(c.cageAmp > 0, 'the last frames are a dissolve, not a pop')
  assert.equal(hologramActivateAt(ACTIVATE_SPAN + 0.01, 1, OPTS).cageAmp, 0)
})

test('the plant clock plays out while the sticker is down and rewinds off the mount', () => {
  assert.equal(advanceActivationClock(-1, 0.016, false, false), -1)
  assert.equal(advanceActivationClock(-1, 0.016, true, false), 0.016)
  assert.equal(advanceActivationClock(0.4, 0.016, true, false), 0.4 + 0.016)
  assert.equal(advanceActivationClock(0.4, 0.016, false, false), -1)
  assert.equal(advanceActivationClock(0.4, 0.016, true, true), -1)
})

test('activation does not spawn a floor sweep', () => {
  for (const t of [0.1, 0.4, 0.8, 1.2, 1.6]) {
    const pass = hologramActivateAt(t, 1, OPTS)
    assert.equal(pass.groundAmp, 0, `floor lit at t=${t}`)
    assert.equal(pass.groundDraw, false)
  }
})

test('activation cover is gentler than the idle kick so the tag stays the source', () => {
  const u = 0.35
  const pass = hologramActivateAt(ACTIVATE_TRAVEL * u, 1, OPTS)
  const kicked = 0.04 + (OPTS.maxR - 0.04) * kickTravel(u)
  assert.ok(pass.frontR < kicked - 0.15, `cover jumped like a scan, r=${pass.frontR} kick=${kicked}`)
})

test('activation fills the covered cage instead of leaving a scan band', () => {
  const first = hologramActivateAt(0.08, 1, OPTS)
  const mid = hologramActivateAt(ACTIVATE_TRAVEL * 0.5, 1, OPTS)
  const covered = hologramActivateAt(ACTIVATE_TRAVEL, 1, OPTS)
  const lock = hologramActivateAt(1.20, 1, OPTS)
  assert.ok(first.fill < mid.fill, 'fill grows as the sphere covers the machine')
  assert.ok(mid.fill > 0.45, `mid-travel must already be a resolved interior, fill=${mid.fill}`)
  assert.ok(covered.fill > 0.85, `covered cage must be online, fill=${covered.fill}`)
  assert.ok(lock.fill > 0.7, 'the lock holds the filled skeleton, it does not drop back to a band')
  assert.ok(ACTIVATE_TRAIL > TRAIL)
  assert.equal(covered.spark, 0)
})

test('activation core stays hot on the tag, not a travelling front', () => {
  const spark = hologramActivateAt(0.08, 1, OPTS)
  const mid = hologramActivateAt(ACTIVATE_TRAVEL * 0.5, 1, OPTS)
  const lock = hologramActivateAt(1.20, 1, OPTS)
  assert.ok(spark.hot > 0.7, `tag ignition should be hot, hot=${spark.hot}`)
  assert.ok(mid.hot > 0.2, 'tag bloom stays warmer than a scan through the fill')
  assert.ok(lock.hot < spark.hot)
})
