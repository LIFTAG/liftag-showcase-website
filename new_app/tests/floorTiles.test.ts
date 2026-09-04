import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  buildFloorTiles,
  FLOOR_MACHINE_R,
  floorClearAt,
  floorTilePoseAt,
  TILE_FIELD_HALF,
  TILE_SIZE,
  TILE_T0,
  tileOvershoot,
  tileSpring,
} from '../utils/gymscan/floorTiles.ts'
import { FLOOR_DESKTOP, FLOOR_PHONE, floorConstructAt } from '../utils/gymscan/floorConstruct.ts'
import { PASS_SPAN, TRAVEL } from '../utils/gymscan/hologramPass.ts'

const tiles = buildFloorTiles()
const centre = () => tiles.reduce((a, b) => (b.r < a.r ? b : a))
const corner = () => tiles.reduce((a, b) => (b.r > a.r ? b : a))

test('the field is a whole square of 1 m slabs on the mat seam pitch', () => {
  const perAxis = (TILE_FIELD_HALF * 2) / TILE_SIZE
  assert.equal(tiles.length, perAxis * perAxis)
  // Seams in the mat maps land on integer metres, so centres are half-metres.
  for (const t of tiles) {
    assert.ok(Math.abs(Math.abs(t.x % 1) - 0.5) < 1e-9, `x off the seam grid: ${t.x}`)
    assert.ok(Math.abs(Math.abs(t.z % 1) - 0.5) < 1e-9, `z off the seam grid: ${t.z}`)
    assert.ok(Math.max(Math.abs(t.x), Math.abs(t.z)) < TILE_FIELD_HALF)
  }
})

test('the field is deterministic — same jitter every build', () => {
  const again = buildFloorTiles()
  assert.deepEqual(again, tiles)
})

test('it is rooted at the centre and spreads outward', () => {
  assert.ok(centre().delay < corner().delay - 0.5, 'the corner must be well behind the centre')
  // Rank correlation, not a strict ordering: the scatter is the point.
  const near = tiles.filter(t => t.r < 2)
  const far = tiles.filter(t => t.r > 6)
  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
  assert.ok(mean(near.map(t => t.delay)) < mean(far.map(t => t.delay)) - 0.6)
})

test('the front is ragged — neighbours do not march in as a ring', () => {
  // Some slab must break out ahead of a strictly nearer one, or this is a wipe
  // with extra steps.
  const jumped = tiles.some(a => tiles.some(b => b.r > a.r + 0.9 && b.delay < a.delay))
  assert.ok(jumped, 'no slab broke ahead of a nearer neighbour')
  const spread = new Set(tiles.map(t => Math.round(t.dur * 1000))).size
  assert.ok(spread > 20, `rise times should vary, got ${spread} distinct`)
})

test('a slab starts below the mat, out of sight, and arrives flush', () => {
  const t = centre()
  const before = floorTilePoseAt(t, t.delay - 0.01)
  assert.equal(before.live, false, 'not drawn until it is called')

  const mid = floorTilePoseAt(t, t.delay + t.dur * 0.1)
  assert.equal(mid.live, true)
  assert.ok(mid.lift < -0.05, `should still be underground, lift=${mid.lift}`)
  assert.ok(Math.abs(mid.tiltX) > 0, 'still cocked over on the way up')

  const seated = floorTilePoseAt(t, t.delay + t.dur + 1)
  assert.equal(seated.seated, true)
  assert.equal(seated.lift, 0)
  assert.equal(seated.yaw, 0)
  assert.equal(seated.tiltX, 0)
  assert.equal(seated.tiltZ, 0)
  assert.equal(seated.grow, 1)
  assert.equal(seated.glow, 0, 'a seated slab must be indistinguishable from the plane')
})

test('a slab carries the write-in light and sheds it before it seats', () => {
  for (const t of tiles) {
    assert.ok(floorTilePoseAt(t, t.delay).glow > 0.2, `r=${t.r.toFixed(2)} arrived dark`)
    let last = Infinity
    for (let s = t.delay; s <= t.delay + t.dur; s += 0.01) {
      const g = floorTilePoseAt(t, s).glow
      assert.ok(g <= last + 1e-9, 'the carry must only ever fade')
      last = g
    }
    // Shed well before the seat, so the handoff to the plane is not a fade-out.
    assert.equal(floorTilePoseAt(t, t.delay + t.dur * 0.75).glow, 0)
    assert.equal(floorTilePoseAt(t, t.delay + t.dur + 1).glow, 0)
  }
  // The lamps are over the machine, so the back needs far more of it.
  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
  const near = mean(tiles.filter(t => t.r < 2).map(t => t.glowGain))
  const far = mean(tiles.filter(t => t.r > 6).map(t => t.glowGain))
  assert.ok(near < 0.5 && far > 0.85, `carry gradient off: ${near} vs ${far}`)
})

test('the spring launches from the slot, overshoots it, and rings back to flush', () => {
  assert.equal(tileSpring(0, 0.55), 1)
  assert.equal(tileSpring(1, 0.55), 0)
  // Standard second-order overshoot: less damping, more proud.
  assert.ok(tileOvershoot(0.48) > tileOvershoot(0.62))
  for (const z of [0.48, 0.55, 0.62]) {
    let peak = 0
    for (let u = 0; u <= 1; u += 0.002) peak = Math.min(peak, tileSpring(u, z))
    assert.ok(Math.abs(-peak - tileOvershoot(z)) < 0.01, `peak off for zeta ${z}`)
  }
})

const peakOf = (t: typeof tiles[number]) => {
  let peak = 0
  for (let s = t.delay; s <= t.delay + t.dur; s += 0.004) {
    peak = Math.max(peak, floorTilePoseAt(t, s).lift)
  }
  return peak
}

test('every slab stands a few inches proud before it snaps back', () => {
  for (const t of tiles) {
    const peak = peakOf(t)
    assert.ok(peak > 0.02, `slab at r=${t.r.toFixed(2)} barely rose proud: ${peak}`)
    assert.ok(peak < 0.30, `slab at r=${t.r.toFixed(2)} launched out of the room: ${peak}`)
  }
  // Near the camera a few inches is a few inches. Out at the field edge, seen
  // at a grazing angle through the fog, the same throw is a couple of pixels —
  // so the far slabs are thrown harder to keep the cascade readable.
  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
  const near = mean(tiles.filter(t => t.r < 2).map(peakOf))
  const far = mean(tiles.filter(t => t.r > 6).map(peakOf))
  assert.ok(near > 0.03 && near < 0.11, `near overshoot off: ${near}`)
  assert.ok(far > near * 1.6, `the back must be thrown harder: ${near} vs ${far}`)
})

test('the snap back carries through the mat — the slab settles from below', () => {
  const t = corner()
  let apex = -1
  let apexAt = 0
  for (let s = t.delay; s <= t.delay + t.dur; s += 0.002) {
    const lift = floorTilePoseAt(t, s).lift
    if (lift > apex) { apex = lift; apexAt = s }
  }
  let deepest = 0
  for (let s = apexAt; s <= t.delay + t.dur; s += 0.002) {
    deepest = Math.min(deepest, floorTilePoseAt(t, s).lift)
  }
  assert.ok(deepest < -0.004, `no snap-through after the peak, deepest=${deepest}`)
  assert.ok(deepest > -apex, 'the return swing must be smaller than the overshoot')
})

test('the overshoot cascade runs outward from the centre', () => {
  const apexOf = (t: typeof tiles[number]) => {
    let apex = -1
    let at = 0
    for (let s = t.delay; s <= t.delay + t.dur; s += 0.004) {
      const lift = floorTilePoseAt(t, s).lift
      if (lift > apex) { apex = lift; at = s }
    }
    return at
  }
  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
  const near = mean(tiles.filter(t => t.r < 2).map(apexOf))
  const far = mean(tiles.filter(t => t.r > 6).map(apexOf))
  assert.ok(far > near + 0.6, `the peak must travel outward: ${near} then ${far}`)
})

test('the whole field is seated and settled before the pass hands over', () => {
  for (const t of tiles) {
    const pose = floorTilePoseAt(t, PASS_SPAN)
    assert.ok(pose.seated, `slab at r=${t.r.toFixed(2)} was still moving at handover`)
    assert.equal(pose.lift, 0)
  }
})

test('the first slab waits for the line, then meets it on the way down', () => {
  assert.ok(TILE_T0 > 0.5, `the void must hold for a beat, T0=${TILE_T0}`)
  assert.ok(TILE_T0 < TRAVEL, 'the ground comes up while the line is still descending')
  for (const t of tiles) assert.ok(t.delay >= TILE_T0 - 0.101)
  const early = floorConstructAt(FLOOR_DESKTOP * 0.2, { phone: false })
  assert.ok(tiles.every(t => !floorTilePoseAt(t, early.sweepT).live), 'void on the early frames')
})

test('phone runs the same field, time-scaled by the sweep clock', () => {
  const desktop = floorConstructAt(FLOOR_DESKTOP * 0.8, { phone: false })
  const phone = floorConstructAt(FLOOR_PHONE * 0.8, { phone: true })
  assert.ok(Math.abs(desktop.sweepT - phone.sweepT) < 1e-9)
  const t = centre()
  assert.deepEqual(
    floorTilePoseAt(t, phone.sweepT),
    floorTilePoseAt(t, desktop.sweepT),
  )
})

test('the ground under the machine goes solid well before the mat is finished', () => {
  const clear = floorClearAt(FLOOR_MACHINE_R)
  assert.ok(clear < PASS_SPAN * 0.8, `footprint must not hold up 0B, clear=${clear}`)
  // Everything overlapping the footprint disc is settled by then, and nothing
  // outside it was counted.
  for (const t of tiles) {
    const dx = Math.max(0, Math.abs(t.x) - TILE_SIZE / 2)
    const dz = Math.max(0, Math.abs(t.z) - TILE_SIZE / 2)
    if (dx * dx + dz * dz > FLOOR_MACHINE_R ** 2) continue
    assert.ok(floorTilePoseAt(t, clear).seated, `r=${t.r.toFixed(2)} still moving at clear`)
  }
  assert.ok(floorClearAt(TILE_FIELD_HALF * 2) > clear, 'the whole mat takes longer')
})
