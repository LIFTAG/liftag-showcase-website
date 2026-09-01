import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  CAGE_CORE_GAIN,
  CORE_RGB,
  cageMixColor,
  cageShouldDraw,
} from '../utils/gymscan/hologramColor.ts'
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

test('cage stays down when the envelope is off', () => {
  assert.equal(
    cageShouldDraw({ envelope: 0, cageAmp: 1, probeAmp: 1, steady: true }),
    false,
  )
})

test('cage stays up between sweeps when the cursor probe is live', () => {
  assert.equal(
    cageShouldDraw({ envelope: 1, cageAmp: 0, probeAmp: 0.4, steady: false }),
    true,
  )
})

test('cage stays up for a sweep and for reduced-motion', () => {
  assert.equal(
    cageShouldDraw({ envelope: 1, cageAmp: 0.5, probeAmp: 0, steady: false }),
    true,
  )
  assert.equal(
    cageShouldDraw({ envelope: 1, cageAmp: 0, probeAmp: 0, steady: true }),
    true,
  )
})

test('cage is hidden between cycles with no live probe and no sweep', () => {
  // Idle surface graze (amp 0.16, live 0) arrives here as 0.
  assert.equal(
    cageShouldDraw({ envelope: 1, cageAmp: 0, probeAmp: 0, steady: false }),
    false,
  )
})

test('trail-only cage mix is cool white, not lime', () => {
  const trail = cageMixColor({ core: 0, trail: 1, probe: 0 })
  assert.ok(trail.b >= trail.g, `trail should be cool, got ${JSON.stringify(trail)}`)
  assert.ok(trail.g > trail.r)
})

test('probe-only cage mix is cool white, not lime', () => {
  const probe = cageMixColor({ core: 0, trail: 0, probe: 1 })
  assert.ok(probe.b >= probe.g, `probe should be cool, got ${JSON.stringify(probe)}`)
  assert.ok(probe.g > probe.r)
})

test('core-only cage mix is brand lime', () => {
  const core = cageMixColor({ core: 1, trail: 0, probe: 0 })
  assert.ok(core.g > core.r, `lime must have g > r, got ${JSON.stringify(core)}`)
  assert.ok(core.g > core.b)
  assert.ok(core.r > 0.5 && core.g > 0.5, `lime r and g must both be high, got ${JSON.stringify(core)}`)
  assert.ok(Math.abs(core.g - CORE_RGB[1] * CAGE_CORE_GAIN) < 1e-9)
})

test('core plus probe still reads lime rather than pale sludge', () => {
  const lime = cageMixColor({ core: 1, trail: 0, probe: 0 })
  const mixed = cageMixColor({ core: 1, trail: 0, probe: 1 })
  const limeGR = lime.g - lime.r
  assert.ok(mixed.g > mixed.r)
  assert.ok(
    mixed.g - mixed.r > limeGR * 0.5,
    `lime g-r must survive probe, mixed=${JSON.stringify(mixed)} limeGR=${limeGR}`,
  )
  assert.ok(
    mixed.b < mixed.r,
    `sludge would lift blue toward red; mixed=${JSON.stringify(mixed)}`,
  )
})

test('reduced-motion forces lime off even if a core weight is supplied', () => {
  const still = cageMixColor({ core: 1, trail: 0, probe: 0, steady: 0.20 })
  const body = cageMixColor({ core: 0, trail: 1, probe: 0 })
  assert.ok(still.b >= still.g, `steady must be cool, got ${JSON.stringify(still)}`)
  assert.ok(still.g > still.r)
  assert.ok(
    Math.abs(still.r / still.g - body.r / body.g) < 1e-9,
    'steady must share the gray body hue, not lime',
  )
})
