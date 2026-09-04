import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  FLOOR_DESKTOP,
  FLOOR_MAX_R,
  FLOOR_PHONE,
  FLOOR_STEM_R,
  PBR_BAND,
  PBR_OPEN,
  PBR_TAIL_R,
  floorConstructAt,
  floorDuration,
  matDuration,
} from '../utils/gymscan/floorConstruct.ts'
import { FLOOR_TILES, TILE_FIELD_HALF, tileFrontR } from '../utils/gymscan/floorTiles.ts'
import { PASS_SPAN, TRAVEL } from '../utils/gymscan/hologramPass.ts'

test('desktop 0A is one hologram pass; phone compresses it', () => {
  assert.equal(floorDuration(false), FLOOR_DESKTOP)
  assert.equal(floorDuration(true), FLOOR_PHONE)
  assert.equal(FLOOR_DESKTOP, PASS_SPAN)
  assert.ok(FLOOR_PHONE < FLOOR_DESKTOP)
})

test('the first frame is void — no PBR mat, the line has not left the stem', () => {
  const s = floorConstructAt(0, { phone: false })
  assert.equal(s.pbrR, 0, 'rubber is not there yet')
  assert.equal(s.draw, true)
  assert.equal(s.done, false)
  assert.ok(s.pass.cageAmp < 0.05)
  assert.equal(s.pass.groundDraw, false)
  assert.ok(Math.abs(s.pass.waveR - FLOOR_STEM_R) < 1e-6)
})

test('while the cage is still travelling, the mat has not been written', () => {
  const s = floorConstructAt(TRAVEL * 0.35, { phone: false })
  assert.ok(s.pass.cageAmp > 0.3)
  assert.equal(s.pbrR, 0)
  assert.ok(s.pass.splashU <= 0)
})

test('the mat rides the slab spread, not the shockwave', () => {
  // The plane used to be clipped to the hologram front, which stops at maxR
  // and left everything past it with nothing to arrive on. It is on
  // `tileFrontR` now - the same curve the slabs spread along - so it is
  // already out past the shockwave while the splash is still running.
  const s = floorConstructAt(FLOOR_DESKTOP * 0.72, { phone: false })
  assert.equal(s.pass.groundDraw, true)
  assert.ok(s.pass.splashU > 0)
  assert.ok(s.pbrR > FLOOR_STEM_R + 0.4, `mat should have grown, pbrR=${s.pbrR}`)
  assert.ok(s.pbrR > s.pass.waveR, 'the ground leads the light it is written by')
  assert.ok(
    Math.abs(s.pbrR - tileFrontR(s.sweepT)) < 1e-9,
    'and it is exactly the slab field front',
  )
  assert.ok(s.pass.wakeR < 0.32, `wake must stay a band, got ${s.pass.wakeR}`)
})

test('the plane picks the front up where the slabs run out, with no seam', () => {
  // A slab at the field corner and a plane cell just beyond it are the same
  // front one metre apart, so they must arrive within a frame of each other.
  const corner = Math.hypot(TILE_FIELD_HALF - 0.5, TILE_FIELD_HALF - 0.5)
  let handoff = 0
  for (let i = 0; i <= 4000; i++) {
    const t = (i / 4000) * FLOOR_DESKTOP
    if (floorConstructAt(t, { phone: false }).pbrR >= corner) { handoff = t; break }
  }
  assert.ok(handoff > 0 && handoff < FLOOR_DESKTOP, `front never left the field, ${handoff}`)
  const last = FLOOR_TILES.reduce((m, tile) => Math.max(m, tile.delay), 0)
  assert.ok(
    handoff < last + 0.05,
    `plane must take over while slabs are still launching: ${handoff} vs ${last}`,
  )
})

test('the far mat starts writing well before the pass ends', () => {
  // It used to wait for the splash to finish and then had a third of a second
  // for everything - it started 89% of the way through the birth. The visible
  // plane begins at the tile field edge, so that is where the clock starts.
  let firstPlane = Infinity
  for (let i = 0; i <= 4000; i++) {
    const t = (i / 4000) * FLOOR_DESKTOP
    if (floorConstructAt(t, { phone: false }).pbrR >= TILE_FIELD_HALF) { firstPlane = t; break }
  }
  assert.ok(
    firstPlane < FLOOR_DESKTOP * 0.7,
    `far mat starts at ${(firstPlane / matDuration(false) * 100).toFixed(0)}% of the birth`,
  )
})

test('phone plays the same pass, time-scaled, and still writes the mat', () => {
  const s = floorConstructAt(FLOOR_PHONE * 0.72, { phone: true })
  assert.equal(s.draw, true)
  assert.ok(Math.abs(s.sweepT - PASS_SPAN * 0.72) < 1e-6)
  assert.ok(s.pbrR > FLOOR_STEM_R)
})

test('one pass: past duration the sweep dies, but the plane keeps writing', () => {
  const end = floorConstructAt(FLOOR_DESKTOP, { phone: false })
  assert.equal(end.draw, false, 'the hologram is over')
  assert.equal(end.envelope, 0)
  assert.equal(end.tiles, false, 'and so are the slabs')
  assert.equal(end.done, false, 'the mat is not open yet')
  assert.ok(end.pbrR > FLOOR_MAX_R && end.pbrR < PBR_TAIL_R, `mid-wash, pbrR=${end.pbrR}`)
  assert.equal(end.pbrBand, PBR_BAND)

  const open = floorConstructAt(matDuration(false), { phone: false })
  assert.equal(open.done, true)
  assert.equal(open.pbrR, PBR_OPEN)
  assert.equal(open.pbrBand, 0, 'no fade band once there is nothing left to write')
  const later = floorConstructAt(matDuration(false) + 8, { phone: false })
  assert.equal(later.draw, false)
  assert.equal(later.pbrR, PBR_OPEN)
})

test('kill after 0B swap keeps the assembled mat and hides the sweep', () => {
  const s = floorConstructAt(1.0, { phone: false, kill: true })
  assert.equal(s.draw, false)
  assert.equal(s.done, true)
  assert.equal(s.pbrR, PBR_OPEN)
  assert.equal(s.pbrBand, 0)
})

test('the slab field owns the centre for the whole of 0A, and nothing after', () => {
  assert.equal(floorConstructAt(0, { phone: false }).tiles, true)
  assert.equal(floorConstructAt(FLOOR_DESKTOP * 0.9, { phone: false }).tiles, true)
  assert.equal(floorConstructAt(FLOOR_DESKTOP, { phone: false }).tiles, false)
  assert.equal(floorConstructAt(1.0, { phone: false, kill: true }).tiles, false)
})

test('the tail opens the plane outward instead of dropping it and snapping back', () => {
  // The splash dies before 0A does. Across that tail the plane used to read
  // pbrR 0 - no floor at all - and then jump straight to the full 90 m.
  const tail = FLOOR_DESKTOP * 0.96
  const s = floorConstructAt(tail, { phone: false })
  assert.equal(s.pass.splashU, 0, 'the splash is over by here')
  assert.ok(s.pbrR > FLOOR_MAX_R, `plane must keep opening, pbrR=${s.pbrR}`)
  const later = floorConstructAt(FLOOR_DESKTOP * 0.995, { phone: false })
  assert.ok(later.pbrR > s.pbrR, 'and keep going')
  assert.ok(later.pbrR <= PBR_TAIL_R)
})

test('the front never jumps: the mat is written monotonically, edge to fog', () => {
  for (const phone of [false, true]) {
    const end = matDuration(phone)
    let prev = -1
    for (let i = 0; i <= 400; i++) {
      const s = floorConstructAt((i / 400) * end * 0.999, { phone })
      assert.ok(s.pbrR >= prev - 1e-9, `pbrR went backwards at ${i}`)
      prev = s.pbrR
    }
  }
})

test('the far ground is crossed slowly enough to be watched arriving', () => {
  // The old ease-out cubic put 6 m to 18 m - all of the ground the fog leaves
  // visible - inside 40 ms, which is what made the back of the mat appear
  // rather than arrive. Everything past ~20 m is fog and may go as fast as it
  // likes.
  const at = (r: number) => {
    const end = matDuration(false)
    for (let i = 0; i <= 4000; i++) {
      const t = (i / 4000) * end
      if (floorConstructAt(t, { phone: false }).pbrR >= r) return t
    }
    return Infinity
  }
  const crossing = at(18) - at(FLOOR_MAX_R + 0.01)
  assert.ok(crossing > 0.28, `visible far ground crossed in ${crossing.toFixed(3)}s`)
})

test('a cell is inside the fade band far longer than the edge takes to pass it', () => {
  // The band, not the front's speed, is what stops the wash reading as a snap:
  // a cell at 10 m must still be coming up well after the edge has left it.
  const end = matDuration(false)
  const rAt = (t: number) => floorConstructAt(t, { phone: false }).pbrR
  let start = 0
  let full = 0
  for (let i = 0; i <= 4000; i++) {
    const t = (i / 4000) * end
    if (!start && rAt(t) >= 10) start = t
    if (!full && rAt(t) >= 10 + PBR_BAND) { full = t; break }
  }
  assert.ok(full - start > 0.15, `cell at 10 m faded up in ${(full - start).toFixed(3)}s`)
})

test('the plane cell fades in over about as long as a slab takes to rise', () => {
  // The two halves of the mat are one gesture, so a cell coming up out on the
  // plane has to read at the same speed as a slab launching inside the field.
  // Slabs rise in 0.34-0.52 s; measured across the ground the fog still
  // leaves visible.
  const end = matDuration(false)
  const tAt = (r: number) => {
    for (let i = 0; i <= 8000; i++) {
      const t = (i / 8000) * end
      if (floorConstructAt(t, { phone: false }).pbrR >= r) return t
    }
    return Infinity
  }
  for (const r of [7, 9, 11, 13]) {
    // 0.7 is the shortest band any cell draws; the slowest cell takes 1.3x it.
    const quickest = tAt(r + PBR_BAND * 0.7) - tAt(r)
    assert.ok(quickest > 0.18, `cell at ${r} m snapped up in ${quickest.toFixed(2)}s`)
    assert.ok(quickest < 0.6, `cell at ${r} m crawled for ${quickest.toFixed(2)}s`)
  }
})

test('the front never outruns the scatter: cells break out ahead of their turn', () => {
  // The shader scatters a cell's arrival by -1 m to +2 m around the front. For
  // that to read as chaos rather than a soft ring, the scatter has to be worth
  // a real slice of time - the slabs jitter theirs by 0.30 s.
  const end = matDuration(false)
  const tAt = (r: number) => {
    for (let i = 0; i <= 8000; i++) {
      const t = (i / 8000) * end
      if (floorConstructAt(t, { phone: false }).pbrR >= r) return t
    }
    return Infinity
  }
  const scatter = tAt(TILE_FIELD_HALF + 2) - tAt(TILE_FIELD_HALF - 1)
  assert.ok(scatter > 0.25, `scatter is only worth ${scatter.toFixed(2)}s of front travel`)
})
