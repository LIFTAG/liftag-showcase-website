import assert from 'node:assert/strict'
import { test } from 'node:test'
import { CORE_RGB, WIRE_RGB } from '../utils/gymscan/hologramColor.ts'
import { splashTravel } from '../utils/gymscan/hologramPass.ts'
import {
  PARTNER_CORE,
  PARTNER_PROBE_R,
  PARTNER_WAKE,
  buildPartnerMesh,
  createPartnerDraw,
  inStadium,
  lightPartnerMesh,
  partnerIncoming,
  partnerSplashMaxR,
  partnerSplashR,
  partnerTriField,
  partnerTriShade,
  stepPartnerHeat,
  type PartnerHoloState,
} from '../utils/gymscan/partnerHolo.ts'

const W = 120
const H = 48

function state(partial: Partial<PartnerHoloState> = {}): PartnerHoloState {
  return {
    originX: 24,
    originY: 24,
    cursorX: 24,
    cursorY: 24,
    velX: 0,
    velY: 0,
    splashR: 0,
    hover: 1,
    probe: 1,
    ...partial,
  }
}

test('the mesh is deterministic and covers the pill', () => {
  const a = buildPartnerMesh(W, H)
  const b = buildPartnerMesh(W, H)
  assert.equal(a.count, b.count)
  assert.deepEqual(a.verts, b.verts)
  assert.ok(a.count > 60, `too sparse: ${a.count}`)
  assert.ok(a.count < 400, `too dense: ${a.count}`)
  let inside = 0
  for (let i = 0; i < a.count; i++) {
    if (inStadium(a.cx[i]!, a.cy[i]!, W, H, 1.4)) inside++
  }
  assert.equal(inside, a.count)
})

test('the AABB corners of a pill are outside the stadium', () => {
  assert.equal(inStadium(W / 2, H / 2, W, H), true)
  assert.equal(inStadium(0, 0, W, H), false)
  assert.equal(inStadium(W, 0, W, H), false)
  assert.equal(inStadium(0, H, W, H), false)
})

test('splash radius uses the floor kick and covers the far corner', () => {
  const maxR = partnerSplashMaxR(0, 0, W, H)
  assert.ok(Math.abs(maxR - Math.hypot(W, H)) < 1e-9)
  assert.equal(partnerSplashR(0, maxR), 0)
  assert.ok(Math.abs(partnerSplashR(1, maxR) - maxR) < 1e-9)
  const mid = partnerSplashR(0.5, maxR)
  assert.ok(Math.abs(mid - maxR * splashTravel(0.5)) < 1e-9)
  assert.ok(mid > 0 && mid < maxR)
})

test('the splash front is lime, the wake is cool white, ahead is dark', () => {
  const origin = state({ splashR: 40, probe: 0 })
  const at = partnerTriField(24 + 40, 24, 0, origin)
  const behind = partnerTriField(24 + 40 - PARTNER_WAKE, 24, 0, origin)
  const deep = partnerTriField(24, 24, 0, origin)
  const ahead = partnerTriField(24 + 40 + PARTNER_CORE * 4, 24, 0, origin)

  assert.ok(at.core > 0.85, `front core ${at.core}`)
  assert.ok(at.trail < 0.05, 'the front itself is not a wake fill')

  assert.ok(behind.trail > 0.3, `wake trail ${behind.trail}`)
  assert.ok(behind.core < at.core)

  assert.ok(deep.trail < 0.12, `interior must not stay a filled disc, trail=${deep.trail}`)
  assert.ok(deep.seen > 0.9, 'the interior has been read')
  assert.ok(ahead.core < 0.05 && ahead.trail === 0 && ahead.seen === 0)
})

test('shade at the front is lime; residual seen is cool white', () => {
  const front = partnerTriShade(
    partnerTriField(64, 24, 0, state({ originX: 24, splashR: 40, probe: 0 })),
    0,
  )
  assert.ok(front.wireG > front.wireR, 'lime is green-heavy')
  assert.ok(front.wireB < 0.25, `front should not be white, b=${front.wireB}`)
  assert.ok(front.fillA > 0.15, 'the front fills the triangle, not just the edge')

  const residual = partnerTriShade(
    partnerTriField(24, 24, 0, state({ originX: 24, splashR: 80, probe: 0 })),
    0,
  )
  assert.ok(residual.wireB > residual.wireR, 'reconstructed mesh is cool white')
  assert.ok(residual.fillA < front.fillA, 'settled faces are thinner than the front fill')
})

test('the cursor probe fills a local patch and dies off the pointer', () => {
  const s = state({ splashR: 200, probe: 1, cursorX: 90, cursorY: 24, originX: 0 })
  const hot = partnerTriField(90, 24, 0, s)
  const far = partnerTriField(12, 24, 0, s)
  assert.ok(hot.probe > 0.85)
  assert.ok(hot.probeInner > 0.8)
  assert.ok(far.probe < 0.02, `probe leaked across the pill: ${far.probe}`)
  assert.ok(partnerIncoming(hot) > partnerIncoming(far))
})

test('probe stretch follows cursor velocity along the travel axis', () => {
  const still = partnerTriField(70, 24, 0, state({
    splashR: 200, originX: 0, cursorX: 40, cursorY: 24, velX: 0, velY: 0,
  }))
  const moving = partnerTriField(70, 24, 0, state({
    splashR: 200, originX: 0, cursorX: 40, cursorY: 24, velX: 80, velY: 0,
  }))
  assert.ok(moving.probe > still.probe, 'velocity must elongate the blob along travel')
})

test('the machine band is a horizontal slice at the cursor, not a disc', () => {
  const s = state({ splashR: 200, probe: 1, cursorX: 60, cursorY: 24, originX: 0 })
  const on = partnerTriField(20, 24, 0, s)
  const off = partnerTriField(20, 6, 0, s)
  assert.ok(on.band > 0.8)
  assert.ok(off.band < 0.15, `band leaked vertically: ${off.band}`)
})

test('heat latches the wake then decays to the residual', () => {
  const peak = stepPartnerHeat(0, 1, 0)
  assert.equal(peak, 1)
  const later = stepPartnerHeat(1, 0, 0.4)
  assert.ok(later < 0.2, `heat should have seated, got ${later}`)
  assert.ok(later > 0)
  const held = stepPartnerHeat(0.2, 0.5, 0.016)
  assert.ok(held >= 0.5)
})

test('the cursor probe stays a local read, not an opaque fill', () => {
  const s = state({ splashR: 200, probe: 1, cursorX: 90, cursorY: 24, originX: 0 })
  const hot = partnerTriShade(partnerTriField(90, 24, 0, s), 1)
  const far = partnerTriShade(partnerTriField(12, 24, 0, s), 0)
  assert.ok(hot.fillA > 0.32, `probe fill too quiet: ${hot.fillA}`)
  assert.ok(hot.fillA < 0.55, `probe fill too loud: ${hot.fillA}`)
  assert.ok(hot.wireA > 0.45, `probe wire too quiet: ${hot.wireA}`)
  assert.ok(hot.wireA < 0.75, `probe wire too loud: ${hot.wireA}`)
  assert.ok(hot.fillA > far.fillA)
  assert.ok(far.fillA < 0.09, `settled fill leaked: ${far.fillA}`)
})

test('hover 0 kills the field; lightPartnerMesh writes caller buffers', () => {
  const dark = partnerTriField(24, 24, 0, state({ hover: 0, splashR: 0 }))
  assert.equal(dark.core, 0)
  assert.equal(dark.seen, 0)
  assert.equal(dark.probe, 0)

  const mesh = buildPartnerMesh(W, H)
  const heat = new Float32Array(mesh.count)
  const draw = createPartnerDraw(mesh.count)
  lightPartnerMesh(mesh, heat, state({ splashR: 36 }), 1 / 60, draw)
  assert.equal(draw.fill.length, mesh.count * 4)
  let lit = 0
  for (let i = 0; i < mesh.count; i++) {
    if (draw.wire[i * 4 + 3]! > 0.05) lit++
  }
  assert.ok(lit > 8, `expected a lit front, got ${lit}`)

  const shade = partnerTriShade(
    partnerTriField(24, 24, 0, state({ splashR: 0, probe: 1 })),
    1,
  )
  assert.ok(shade.fillR > 0 || shade.fillG > 0)
  assert.ok(CORE_RGB[1] === 1)
  assert.ok(WIRE_RGB[2] > WIRE_RGB[0])
})
