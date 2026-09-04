import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  PEEL_AXIS, PEEL_FLAT, peelArc, peelAt, peelSpan, peelTurn, type PeelParams,
} from '../utils/gymscan/peel.ts'

const W = 0.1467
const H = 0.155

function params(over: Partial<PeelParams> = {}): PeelParams {
  return {
    axisX: PEEL_AXIS.x,
    axisY: PEEL_AXIS.y,
    front: 0,
    radius: 0.02,
    maxTurn: Math.PI * 2.6,
    side: 1,
    grow: 0,
    thickness: 0,
    ...over,
  }
}

test('the axis is the diagonal, so the extremes are opposite corners', () => {
  const span = peelSpan(W, H)
  const tr = W / 2 * PEEL_AXIS.x + H / 2 * PEEL_AXIS.y
  assert.ok(Math.abs(span.max - tr) < 1e-9)
  assert.ok(Math.abs(span.min + tr) < 1e-9)
})

test('a fold line past the far corner leaves every vertex where it was', () => {
  const p = params({ front: PEEL_FLAT })
  for (const [x, y] of [[-W / 2, -H / 2], [W / 2, H / 2], [0, 0], [W / 2, -H / 2]]) {
    const s = peelAt(x!, y!, p)
    assert.ok(Math.abs(s.x - x!) < 1e-12)
    assert.ok(Math.abs(s.y - y!) < 1e-12)
    assert.equal(s.z, 0)
    assert.equal(s.turn, 0)
    assert.ok(Math.abs(s.nz - 1) < 1e-12)
  }
})

test('material before the fold is untouched, material past it lifts off', () => {
  const p = params({ front: 0 })
  const flat = peelAt(-W / 2, -H / 2, p)
  assert.equal(flat.z, 0)
  assert.equal(flat.turn, 0)
  const rolled = peelAt(W / 2, H / 2, p)
  assert.ok(rolled.z > 0, `past the fold must leave the plane, z=${rolled.z}`)
  assert.ok(rolled.turn > 0)
})

test('the roll preserves arc length - the print does not stretch', () => {
  // Sample along the axis and integrate the 3D path. A curve that lifts by a
  // height function instead of wrapping would come back longer than the
  // material it is made of, and the artwork on it would visibly smear.
  const p = params({ front: -0.05, radius: 0.02 })
  const s0 = -0.09
  const s1 = 0.09
  const steps = 4000
  let len = 0
  let prev = peelAt(s0 * PEEL_AXIS.x, s0 * PEEL_AXIS.y, p)
  for (let i = 1; i <= steps; i++) {
    const s = s0 + (s1 - s0) * (i / steps)
    const cur = peelAt(s * PEEL_AXIS.x, s * PEEL_AXIS.y, p)
    len += Math.hypot(cur.x - prev.x, cur.y - prev.y, cur.z - prev.z)
    prev = cur
  }
  assert.ok(Math.abs(len - (s1 - s0)) < 1e-4, `arc length drifted: ${len} vs ${s1 - s0}`)
})

test('position and normal stay continuous across the fold line', () => {
  const p = params({ front: 0.01, radius: 0.012 })
  const eps = 1e-6
  const before = peelAt((0.01 - eps) * PEEL_AXIS.x, (0.01 - eps) * PEEL_AXIS.y, p)
  const after = peelAt((0.01 + eps) * PEEL_AXIS.x, (0.01 + eps) * PEEL_AXIS.y, p)
  assert.ok(Math.hypot(after.x - before.x, after.y - before.y, after.z - before.z) < 1e-5)
  assert.ok(Math.abs(after.nz - before.nz) < 1e-5)
})

test('the normal is unit length and perpendicular to the surface tangent', () => {
  const p = params({ front: -0.04, radius: 0.018 })
  for (const s of [-0.02, 0, 0.02, 0.06]) {
    const eps = 1e-5
    const a = peelAt((s - eps) * PEEL_AXIS.x, (s - eps) * PEEL_AXIS.y, p)
    const b = peelAt((s + eps) * PEEL_AXIS.x, (s + eps) * PEEL_AXIS.y, p)
    const m = peelAt(s * PEEL_AXIS.x, s * PEEL_AXIS.y, p)
    assert.ok(Math.abs(Math.hypot(m.nx, m.ny, m.nz) - 1) < 1e-9)
    const tx = b.x - a.x, ty = b.y - a.y, tz = b.z - a.z
    const tl = Math.hypot(tx, ty, tz) || 1
    const dot = (m.nx * tx + m.ny * ty + m.nz * tz) / tl
    assert.ok(Math.abs(dot) < 1e-4, `normal not perpendicular at s=${s}, dot=${dot}`)
  }
})

test('past maxTurn the surface leaves along the tangent instead of spiralling in', () => {
  const p = params({ front: 0, radius: 0.01, maxTurn: 1.0 })
  const far = peelAt(0.2 * PEEL_AXIS.x, 0.2 * PEEL_AXIS.y, p)
  assert.ok(Math.abs(far.turn - 1.0) < 1e-9, 'turn must clamp')
  // Still travelling: an unclamped wrap would have wound it back on itself.
  const nearer = peelAt(0.15 * PEEL_AXIS.x, 0.15 * PEEL_AXIS.y, p)
  assert.ok(far.z > nearer.z)
})

test('thickness offsets a layer along its own deformed normal', () => {
  const t = 0.0007
  const flat = params({ front: PEEL_FLAT, thickness: t })
  const s = peelAt(0, 0, flat)
  assert.ok(Math.abs(s.z - t) < 1e-12, 'a flat layer offsets straight out')

  const rolled = params({ front: -0.05, radius: 0.02, thickness: t })
  const base = peelAt(0.02 * PEEL_AXIS.x, 0.02 * PEEL_AXIS.y, params({ front: -0.05, radius: 0.02 }))
  const off = peelAt(0.02 * PEEL_AXIS.x, 0.02 * PEEL_AXIS.y, rolled)
  const d = Math.hypot(off.x - base.x, off.y - base.y, off.z - base.z)
  assert.ok(Math.abs(d - t) < 1e-9, `layer gap should stay ${t} on the roll, got ${d}`)
})

test('side -1 is an exact mirror: same fold line, same arc, opposite face', () => {
  // The liner is on the back of the card, so its roll has to leave through
  // -Z. Anything other than a mirror here and the two faces would peel from
  // different corners, which is what ties the peel to the press.
  const front = params({ front: -0.02, radius: 0.015, thickness: 0.0012 })
  const back = params({ front: -0.02, radius: 0.015, thickness: 0.0012, side: -1 })
  for (const s of [-0.05, -0.02, 0.01, 0.05]) {
    const a = peelAt(s * PEEL_AXIS.x, s * PEEL_AXIS.y, front)
    const b = peelAt(s * PEEL_AXIS.x, s * PEEL_AXIS.y, back)
    assert.ok(Math.abs(a.x - b.x) < 1e-12, `in-plane x must not move at s=${s}`)
    assert.ok(Math.abs(a.y - b.y) < 1e-12, `in-plane y must not move at s=${s}`)
    assert.ok(Math.abs(a.z + b.z) < 1e-12, `z must mirror at s=${s}`)
    assert.equal(a.turn, b.turn)
    assert.ok(Math.abs(a.nz + b.nz) < 1e-12)
    assert.ok(Math.abs(a.nx - b.nx) < 1e-12)
  }
  // A flat back layer offsets away from the print, not into it.
  const flat = peelAt(0, 0, params({ front: PEEL_FLAT, thickness: 0.0012, side: -1 }))
  assert.ok(Math.abs(flat.z + 0.0012) < 1e-12, `flat back layer sits behind, z=${flat.z}`)
  assert.ok(Math.abs(flat.nz + 1) < 1e-12, 'and faces away from the print')
})

test('the mirrored normal is still unit and still perpendicular', () => {
  const p = params({ front: -0.04, radius: 0.018, side: -1 })
  for (const s of [-0.02, 0, 0.02, 0.06]) {
    const eps = 1e-5
    const a = peelAt((s - eps) * PEEL_AXIS.x, (s - eps) * PEEL_AXIS.y, p)
    const b = peelAt((s + eps) * PEEL_AXIS.x, (s + eps) * PEEL_AXIS.y, p)
    const m = peelAt(s * PEEL_AXIS.x, s * PEEL_AXIS.y, p)
    assert.ok(Math.abs(Math.hypot(m.nx, m.ny, m.nz) - 1) < 1e-9)
    const tx = b.x - a.x, ty = b.y - a.y, tz = b.z - a.z
    const tl = Math.hypot(tx, ty, tz) || 1
    const dot = (m.nx * tx + m.ny * ty + m.nz * tz) / tl
    assert.ok(Math.abs(dot) < 1e-4, `normal not perpendicular at s=${s}, dot=${dot}`)
  }
})

test('a growing roll preserves arc length and stays small doing it', () => {
  // The reason the roll grows at all: 22 cm of liner on a constant-radius
  // cylinder needs a 3.8 cm radius, which is a rolled carpet beside a 15 cm
  // card. Winding it inward from an outer radius makes the same material four
  // turns of a 12 mm roll.
  const grow = 0.0018 / (Math.PI * 2)
  const core = 0.004
  const outer = Math.sqrt(core * core + 2 * grow * 0.2234)
  assert.ok(outer < 0.013, `the whole liner still fits a 13 mm roll, got ${outer}`)
  assert.ok(peelTurn(0.2234, outer, grow) > Math.PI * 8, 'and it takes several turns to do it')
  for (const t of [0.005, 0.05, 0.2234]) {
    const turn = peelTurn(t, outer, grow)
    assert.ok(Math.abs(peelArc(turn, outer, grow) - t) < 1e-12, `peelTurn must invert peelArc at t=${t}`)
  }
  // Winding all the way in lands on the core, not through it.
  const full = outer - grow * peelTurn(0.2234, outer, grow)
  assert.ok(Math.abs(full - core) < 1e-9, `the last of the film is the core, got ${full}`)

  const p = params({ front: -0.05, radius: outer, grow, maxTurn: 1e6 })
  const s0 = -0.09
  const s1 = 0.09
  const steps = 8000
  let len = 0
  let prev = peelAt(s0 * PEEL_AXIS.x, s0 * PEEL_AXIS.y, p)
  for (let i = 1; i <= steps; i++) {
    const s = s0 + (s1 - s0) * (i / steps)
    const cur = peelAt(s * PEEL_AXIS.x, s * PEEL_AXIS.y, p)
    len += Math.hypot(cur.x - prev.x, cur.y - prev.y, cur.z - prev.z)
    prev = cur
  }
  // Looser than the cylinder's 1e-4. The solve integrates r dtheta and drops
  // the (dr/dtheta)^2 term, so a growing roll trades a fraction of a percent
  // of arc length for its winding gap. Only the liner grows, and the liner
  // carries no artwork; the card's own bend keeps grow at 0 and stays exact.
  const drift = Math.abs(len - (s1 - s0)) / (s1 - s0)
  assert.ok(drift < 0.004, `arc length drifted ${(drift * 100).toFixed(3)}%`)
})

test('successive windings are held apart by the spiral, not stacked', () => {
  const grow = 0.0018 / (Math.PI * 2)
  const outer = Math.sqrt(0.004 * 0.004 + 2 * grow * 0.2234)
  const p = params({ front: 0, radius: outer, grow, maxTurn: 1e6 })
  // Two points a full turn apart on the roll must not land on each other -
  // that coincidence is the milky-slab failure, and the z-fight behind it.
  for (const turnA of [0.4, Math.PI, Math.PI * 2, Math.PI * 4.5]) {
    const aArc = peelArc(turnA, outer, grow)
    const bArc = peelArc(turnA + Math.PI * 2, outer, grow)
    const a = peelAt(aArc * PEEL_AXIS.x, aArc * PEEL_AXIS.y, p)
    const b = peelAt(bArc * PEEL_AXIS.x, bArc * PEEL_AXIS.y, p)
    const gap = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)
    assert.ok(Math.abs(gap - 0.0018) < 1e-5, `windings must clear by the pitch, got ${gap}`)
  }
})
