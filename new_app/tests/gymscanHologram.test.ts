import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  hologramPassAt,
  inverseKickTravel,
  kickTravel,
  PEEL,
  PERIOD,
  SPLASH,
  splashTravel,
  TRAVEL,
  timeAtHeight,
  Y_APPROACH,
  Y_CONTACT,
} from '../utils/gymscan/hologramPass.ts'

const OPTS = {
  yTop: 1.62,
  yBottom: -0.12,
  stemR: 0.32,
  maxR: 4.35,
}

test('kick travel lands on the endpoints and never overshoots', () => {
  assert.equal(kickTravel(0), 0)
  assert.ok(Math.abs(kickTravel(1) - 1) < 1e-10)
  let prev = 0
  for (let i = 1; i <= 20; i++) {
    const s = kickTravel(i / 20)
    assert.ok(s >= prev, `kickTravel must be monotonic at ${i}`)
    assert.ok(s <= 1)
    prev = s
  }
})

test('inverse kick travel round-trips the forward curve', () => {
  for (const u of [0, 0.15, 0.4, 0.68, 0.92, 1]) {
    const back = inverseKickTravel(kickTravel(u))
    assert.ok(Math.abs(back - u) < 1e-6, `round trip at u=${u}: ${back}`)
  }
})

test('the descending line is still above the floor at the approach height', () => {
  const t = timeAtHeight(Y_APPROACH, OPTS.yTop, OPTS.yBottom)
  const pass = hologramPassAt(t, 1, OPTS)
  assert.ok(pass.bandY > Y_CONTACT)
  assert.ok(pass.groundAmp < 0.08, `stem should only just be lighting, got ${pass.groundAmp}`)
  assert.ok(Math.abs(pass.waveR - OPTS.stemR) < 1e-6)
})

test('the floor is already travelling when the line reaches contact', () => {
  const tC = timeAtHeight(Y_CONTACT, OPTS.yTop, OPTS.yBottom)
  const before = hologramPassAt(tC - PEEL * 0.5, 1, OPTS)
  const at = hologramPassAt(tC, 1, OPTS)
  const after = hologramPassAt(tC + 0.04, 1, OPTS)
  assert.ok(before.waveR > OPTS.stemR, 'peel has left the stem before contact')
  assert.ok(at.waveR > before.waveR)
  assert.ok(after.waveR > at.waveR)
  assert.ok(at.groundAmp > 0.85)
  assert.ok(at.splashU > 0)
  const frac = (at.waveR - OPTS.stemR) / (OPTS.maxR - OPTS.stemR)
  assert.ok(frac < 0.16, `ring should still be at the feet, frac=${frac}`)
  assert.ok(at.wakeR > 0.08 && at.wakeR < 0.22, 'trail is a thin band at the feet')
  assert.ok(at.cageAmp > 0.5, 'cage is still on when the floor takes over')
})

test('the floor never lights a parked stem ring', () => {
  const tA = timeAtHeight(Y_APPROACH, OPTS.yTop, OPTS.yBottom)
  const tC = timeAtHeight(Y_CONTACT, OPTS.yTop, OPTS.yBottom)
  const step = (tC - tA) / 12
  for (let i = 0; i <= 12; i++) {
    const pass = hologramPassAt(tA + step * i, 1, OPTS)
    if (pass.groundAmp > 0.12) {
      assert.ok(
        pass.waveR > OPTS.stemR + 0.02,
        `bright still stem at t=${(tA + step * i).toFixed(3)} amp=${pass.groundAmp.toFixed(3)} r=${pass.waveR.toFixed(3)}`,
      )
    }
  }
})

test('the splash is a growing ring, not a disc that fills then fades', () => {
  const t0 = timeAtHeight(Y_CONTACT, OPTS.yTop, OPTS.yBottom)
  const early = hologramPassAt(t0 + 0.05, 1, OPTS)
  const mid = hologramPassAt(t0 + SPLASH * 0.35, 1, OPTS)
  const late = hologramPassAt(t0 + SPLASH * 0.75, 1, OPTS)
  assert.ok(early.waveR > OPTS.stemR)
  assert.ok(mid.waveR > early.waveR)
  assert.ok(late.waveR > mid.waveR)
  assert.ok(late.waveR < OPTS.maxR)
  // Gentler than the cage kick: at a third of the pass the ring is still
  // a ring, not already the finished circle.
  const midFrac = (mid.waveR - OPTS.stemR) / (OPTS.maxR - OPTS.stemR)
  assert.ok(midFrac > 0.22, `ring should be moving by mid, frac=${midFrac}`)
  assert.ok(midFrac < 0.62, `ring should not have filled the disc by mid, frac=${midFrac}`)
  // Wake is a band behind the front, shorter than the radius, from the
  // first expanded centimetre - not something that only appears at the end.
  assert.ok(early.wakeR > 0.10)
  assert.ok(early.wakeR < 0.28, 'trail stays a band behind the front')
  assert.ok(late.wakeR < 0.32, 'the ring stays thin as it opens')
})

test('splash travel is gentler than the cage kick', () => {
  assert.equal(splashTravel(0), 0)
  assert.ok(Math.abs(splashTravel(1) - 1) < 1e-10)
  assert.ok(splashTravel(0.35) < kickTravel(0.35))
})

test('the cage can go dark while the floor is still finishing the pass', () => {
  const t0 = timeAtHeight(Y_CONTACT, OPTS.yTop, OPTS.yBottom)
  assert.ok(t0 + SPLASH > TRAVEL, 'splash is meant to outlive the cage')
  const afterCage = hologramPassAt(TRAVEL + 0.08, 1, OPTS)
  assert.equal(afterCage.cageAmp, 0)
  assert.ok(afterCage.groundAmp > 0.25)
  assert.ok(afterCage.waveR > OPTS.stemR + 0.5)
})

test('the whole pass is dark between cycles', () => {
  const idle = hologramPassAt(TRAVEL + SPLASH + 0.2, 1, OPTS)
  assert.equal(idle.cageAmp, 0)
  assert.equal(idle.groundAmp, 0)
  const wrapped = hologramPassAt(0.02, 1, OPTS)
  assert.ok(wrapped.groundAmp === 0)
  assert.ok(wrapped.cageAmp > 0)
  assert.ok(PERIOD > TRAVEL + 1)
})

test('scroll envelope silences cage and floor together', () => {
  const t = timeAtHeight(Y_CONTACT, OPTS.yTop, OPTS.yBottom) + 0.2
  const pass = hologramPassAt(t, 0, OPTS)
  assert.equal(pass.cageAmp, 0)
  assert.equal(pass.groundAmp, 0)
})
