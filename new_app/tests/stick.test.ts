import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ESTABLISH } from '../utils/gymscan/act0Cam.ts'
import { CAM_FOV_Y } from '../utils/gymscan/act1Cam.ts'
import { PEEL_FLAT, peelSpan } from '../utils/gymscan/peel.ts'
import {
  FACE_CAM,
  FLY_BACK_END,
  FLY_IN_END,
  FLY_PEEL_END,
  FLY_TURN_END,
  flyDof,
  flyDuration,
  flyShowLight,
  foilAt,
  PLACARD_H,
  PLACARD_REST,
  PLACARD_W,
  PRESS_DUR,
  PRESS_GAP,
  PRESS_HUNT_U,
  pressShowLight,
  SHOWCASE,
  SHOWCASE_DIST,
  SHOWCASE_DIST_PHONE,
  SHOWCASE_PHONE,
  showcaseKeyPos,
  stickAt,
  stickDuration,
  stickHidden,
  turnPhase,
} from '../utils/gymscan/stick.ts'

const SPAN = peelSpan(PLACARD_W, PLACARD_H)

function distToCam(p: { x: number, y: number, z: number }) {
  return Math.hypot(p.x - ESTABLISH.x, p.y - ESTABLISH.y, p.z - ESTABLISH.z)
}

function dist(a: { x: number, y: number, z: number }, b: { x: number, y: number, z: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)
}

/** NDC of a world point in the establishing camera, x/y in −1..1 if on screen. */
function ndcOf(p: { x: number, y: number, z: number }, aspect: number) {
  const dx = ESTABLISH.tx - ESTABLISH.x
  const dy = ESTABLISH.ty - ESTABLISH.y
  const dz = ESTABLISH.tz - ESTABLISH.z
  const len = Math.hypot(dx, dy, dz) || 1
  const fx = dx / len
  const fy = dy / len
  const fz = dz / len
  // Same camera-right as stick.ts: forward × world-up, world-horizontal.
  const rx = -fz
  const rz = fx
  const rlen = Math.hypot(rx, rz) || 1
  const rightX = rx / rlen
  const rightZ = rz / rlen
  const ux = -rightZ * fy
  const uy = rightZ * fx - rightX * fz
  const uz = rightX * fy
  const vx = p.x - ESTABLISH.x
  const vy = p.y - ESTABLISH.y
  const vz = p.z - ESTABLISH.z
  const depth = vx * fx + vy * fy + vz * fz
  const x = vx * rightX + vz * rightZ
  const y = vx * ux + vy * uy + vz * uz
  const tanHalfV = Math.tan((CAM_FOV_Y * Math.PI) / 360)
  const tanHalfH = tanHalfV * aspect
  return {
    x: x / (depth * tanHalfH),
    y: y / (depth * tanHalfV),
    depth,
  }
}

test('the hidden card is off-stage until 0C', () => {
  const h = stickHidden()
  assert.equal(h.visible, false)
  assert.equal(h.planted, false)
  assert.equal(h.hunting, false)
  assert.equal(h.dof, 0)
  assert.equal(h.foilVisible, false)
  assert.equal(h.mountVisible, false)
})

test('showcase sits on the look, in front of the establishing camera', () => {
  assert.ok(Math.abs(distToCam(SHOWCASE) - SHOWCASE_DIST) < 1e-6)
  assert.ok(Math.abs(distToCam(SHOWCASE_PHONE) - SHOWCASE_DIST_PHONE) < 1e-6)
  assert.ok(SHOWCASE_DIST < SHOWCASE_DIST_PHONE, 'phone stays further so the card fits the narrow width')
  assert.ok(distToCam(SHOWCASE) < 0.4)
  assert.ok(distToCam(PLACARD_REST) > 5, 'the mount is still metres behind the lens')
})

test('fly enters from the gym, holds in the POV, then commits to the beam', () => {
  const a = stickAt(0, 'fly', false)
  assert.equal(a.visible, true)
  assert.ok(distToCam(a) > 2.5, `enter is still in the room, dist=${distToCam(a)}`)
  const mid = stickAt(flyDuration(false) * 0.5, 'fly', false)
  assert.ok(Math.abs(mid.x - SHOWCASE.x) < 0.04)
  assert.ok(Math.abs(mid.y - SHOWCASE.y) < 0.04)
  assert.ok(Math.abs(mid.z - SHOWCASE.z) < 0.04)
  assert.ok(distToCam(mid) < 0.4, `mid-hold must fill the POV, dist=${distToCam(mid)}`)
  const end = stickAt(flyDuration(false), 'fly', false)
  assert.ok(dist(end, PLACARD_REST) < PRESS_GAP + 0.01, `fly end should be the press gap, dist=${dist(end, PLACARD_REST)}`)
  assert.equal(end.dof, 0)
})

test('the card starts outside the frame and travels in — it does not pop on', () => {
  const dur = flyDuration(false)
  const enter = stickAt(0, 'fly', false)
  for (const aspect of [16 / 9, 21 / 9]) {
    const ndc = ndcOf(enter, aspect)
    assert.ok(
      ndc.x > 1.08,
      `enter must be off the right edge at ${aspect.toFixed(2)}, ndc.x=${ndc.x.toFixed(3)}`,
    )
  }
  const phoneEnter = stickAt(0, 'fly', true)
  for (const aspect of [9 / 19.5, 16 / 9]) {
    const ndc = ndcOf(phoneEnter, aspect)
    assert.ok(
      ndc.x > 1.08,
      `phone enter must be off-frame at ${aspect.toFixed(2)}, ndc.x=${ndc.x.toFixed(3)}`,
    )
  }

  const early = stickAt(dur * FLY_IN_END * 0.20, 'fly', false)
  assert.ok(
    ndcOf(early, 16 / 9).x > 1.02,
    `a fifth of the way in it is still off the right edge, ndc.x=${ndcOf(early, 16 / 9).x.toFixed(3)}`,
  )

  const hang = stickAt(dur * FLY_IN_END * 0.48, 'fly', false)
  const hangNdc = ndcOf(hang, 16 / 9)
  assert.ok(Math.abs(hangNdc.x) < 0.95 && Math.abs(hangNdc.y) < 0.95, 'the hang is in frame')
  assert.ok(distToCam(hang) > 0.7, 'and still far enough that the commit has room to grow')

  const settled = stickAt(dur * FLY_IN_END, 'fly', false)
  assert.ok(distToCam(settled) < 0.4, 'IN ends on the close-up')

  const d0 = distToCam(hang)
  const d1 = distToCam(stickAt(dur * (FLY_IN_END * 0.48 + FLY_IN_END * 0.52 * 0.5), 'fly', false))
  const d2 = distToCam(settled)
  assert.ok(d0 > d1 && d1 > d2, 'the commit only ever closes')
  assert.ok(
    d1 / d2 < 2.2,
    `the last half of the commit must not double in a flash, grew ${ (d1 / d2).toFixed(2) }`,
  )
})

test('the card turns onto its back, holds there, and finishes the revolution', () => {
  assert.equal(turnPhase(0), 0)
  assert.equal(turnPhase(1), 1)

  let prev = -1
  for (let i = 0; i <= 200; i++) {
    const t = turnPhase(i / 200)
    assert.ok(t >= prev - 1e-12, 'the turn never reverses')
    prev = t
  }

  const dur = flyDuration(false)
  // The whole of the peel plays on a card that is exactly half turned over.
  // The liner is on the back, so a card still rotating during the pull would
  // be peeling a face that is swinging away from the lens.
  const peelSamples = [
    FLY_TURN_END + 0.01,
    (FLY_TURN_END + FLY_PEEL_END) / 2,
    FLY_PEEL_END - 0.04,
    FLY_PEEL_END - 0.01,
  ]
  for (const u of peelSamples) {
    const held = stickAt(dur * u, 'fly', false)
    assert.ok(
      Math.abs(held.rotY - (FACE_CAM.rotY + Math.PI)) < 1e-9,
      `the antenna must stay square to the lens at u=${u}, rotY=${held.rotY}`,
    )
    assert.ok(foilAt(u).peel.front <= SPAN.max, `and the pull must be under way at u=${u}`)
  }

  // The last frame before the outbound leg. The leg itself restates the same
  // orientation without the winding, so it reads FACE_CAM.rotY, not + 2*PI.
  const round = stickAt(dur * (FLY_BACK_END - 0.0001), 'fly', false)
  assert.ok(
    Math.abs(round.rotY - (FACE_CAM.rotY + Math.PI * 2)) < 0.02,
    `the revolution must complete before it leaves, rotY=${round.rotY}`,
  )
  const leaving = stickAt(dur * (FLY_BACK_END + 0.0001), 'fly', false)
  assert.ok(Math.abs(leaving.rotY - FACE_CAM.rotY) < 0.02, 'and the out leg is the same pose')
  const end = stickAt(dur, 'fly', false)
  assert.ok(Math.abs(end.rotY) < 0.08, `fly end yaw should face the seat, got ${end.rotY}`)
})

test('the liner is on and flat until it is grabbed, then rolls off corner to corner', () => {
  const dur = flyDuration(false)
  const early = stickAt(dur * 0.25, 'fly', false)
  assert.equal(early.foilVisible, true)
  assert.equal(early.foilOpacity, 1)
  assert.ok(early.foil.front > SPAN.max, 'nothing on the roll before the grab')

  // The fold line only ever travels one way: from the grabbed corner to the
  // opposite one. A peel that backs up is a film being scrubbed, not pulled.
  let prev = Infinity
  for (let i = 0; i <= 80; i++) {
    const u = FLY_TURN_END + (FLY_PEEL_END - FLY_TURN_END) * (i / 80)
    const f = foilAt(u)
    assert.ok(f.peel.front <= prev + 1e-9, `fold line reversed at u=${u}`)
    prev = f.peel.front
  }

  const half = foilAt((FLY_TURN_END + FLY_PEEL_END) / 2)
  assert.ok(half.peel.front < SPAN.max && half.peel.front > SPAN.min, 'mid-peel is mid-card')
  assert.ok(
    half.peel.radius > foilAt(FLY_TURN_END + 0.04).peel.radius,
    'the roll fattens as film winds on',
  )

  const done = foilAt(FLY_PEEL_END)
  assert.ok(done.peel.front <= SPAN.min, 'the whole face has passed over the roll')
  assert.equal(done.opacity, 0)
  assert.equal(done.visible, false)
  // Card-local -Z: the liner is on the back, and the back is what the lens is
  // looking at while it comes off.
  assert.ok(done.drift.z < 0, 'the roll leaves toward the lens')

  const gone = stickAt(dur * 0.80, 'fly', false)
  assert.equal(gone.foilVisible, false)
  assert.equal(stickAt(0, 'hold', false).foilVisible, false)
})

test('the card curls before it reaches the beam and is flat once planted', () => {
  const dur = flyDuration(false)
  const held = stickAt(dur * 0.50, 'fly', false)
  assert.equal(held.bend.front, PEEL_FLAT, 'no bend while it is being shown')

  const arriving = stickAt(dur, 'fly', false)
  assert.ok(arriving.bend.front < SPAN.max, 'it arrives already bent')
  assert.ok(arriving.bend.front > SPAN.min, 'the leading corner is flat, not the whole face')

  assert.equal(stickAt(0, 'hold', false).bend.front, PEEL_FLAT)
})

test('press touches down corner first, then rolls the fold line flat', () => {
  const start = stickAt(0, 'stick', false)
  const mid = stickAt(PRESS_DUR * 0.5, 'stick', false)
  const end = stickAt(PRESS_DUR, 'stick', false)

  assert.ok(start.z > PLACARD_REST.z, 'it still stands off the mount')
  assert.ok(mid.z < start.z && mid.z >= PLACARD_REST.z)

  // The fold line walks up the diagonal: at the start only the corner is
  // down, at the end nothing is left off the surface.
  assert.ok(start.bend.front < mid.bend.front, 'the fold line advances')
  assert.ok(mid.bend.front < SPAN.max, 'mid-press still has material off the mount')
  assert.equal(end.bend.front, PEEL_FLAT)

  assert.ok(mid.squeegee > 0.2, 'the air line rides the fold')
  assert.equal(start.squeegee, 0)
  assert.equal(end.squeegee, 0)

  assert.equal(end.planted, true)
  assert.equal(end.mountVisible, true)
  assert.ok(Math.abs(end.x - PLACARD_REST.x) < 1e-6)
  assert.ok(Math.abs(end.y - PLACARD_REST.y) < 1e-6)
  assert.ok(Math.abs(end.z - PLACARD_REST.z) < 1e-6)
  assert.equal(end.dof, 0)
  assert.equal(end.showLight, 0, 'press key is already out so the hold does not snap it')
  assert.equal(end.hunting, true)

  const hold = stickAt(stickDuration(false), 'hold', false)
  assert.equal(hold.planted, true)
  assert.equal(hold.visible, true)
  assert.equal(hold.hunting, true)
  assert.equal(hold.showLight, 0)
})

test('the lens is wide open across the whole close-up and shut at both ends', () => {
  assert.equal(flyDof(0.05, false), 0)
  assert.ok(flyDof(FLY_IN_END * 0.4, false) < 0.05, 'still shut while the card is sliding in')
  assert.ok(flyDof(FLY_TURN_END, false) > 0.9, 'open through the turn')
  assert.ok(flyDof(0.60, false) > 0.9, 'and through the peel')
  assert.ok(flyDof(FLY_BACK_END - 0.02, false) > 0.9, 'and through the turn back')
  assert.equal(flyDof(0.98, false), 0, 'shut again before the beam')
  // The phone runs the same close-up shallower rather than not at all - a
  // sharp background there was the loudest CG tell in the shot.
  assert.ok(flyDof(0.5, true) > 0.5 && flyDof(0.5, true) < flyDof(0.5, false))
  const mid = stickAt(flyDuration(false) * 0.5, 'fly', false)
  assert.ok(mid.dof > 0.9)
})

test('0C is long enough to hold the card up, turn it and strip it', () => {
  // Five beats, and the peel is two seconds of it. The IN beat has to be long
  // enough that the card travels into frame rather than appearing in it.
  assert.equal(flyDuration(false), 6.2)
  assert.equal(flyDuration(true), 5.2)
  assert.ok(flyDuration(false) * FLY_IN_END >= 1.7, 'the entrance is a travel, not a flash')
})

test('the showcase key is on for the hold and gone by the beam', () => {
  assert.equal(flyShowLight(0.02), 0)
  assert.ok(flyShowLight(0.4) > 0.99)
  assert.equal(flyShowLight(1), 0)
  assert.equal(stickAt(0, 'stick', false).showLight, 0)
  assert.equal(stickAt(0, 'hold', false).showLight, 0)
})

test('the press key fades out before the plant, not on it', () => {
  assert.equal(pressShowLight(0), 0)
  assert.ok(pressShowLight(0.4) > 0.3)
  assert.ok(pressShowLight(0.72) > 0.3, 'still on while the vinyl is rolling')
  assert.ok(pressShowLight(0.85) < pressShowLight(0.72), 'dying on the last stretch')
  assert.equal(pressShowLight(1), 0)
  assert.equal(stickAt(PRESS_DUR * 0.4, 'stick', false).showLight, pressShowLight(0.4))
  assert.equal(stickAt(PRESS_DUR, 'stick', false).showLight, 0)
  assert.equal(stickAt(PRESS_DUR, 'stick', false).showLight, stickAt(0, 'hold', false).showLight)
})

test('the scanner may hunt before the plant frame, not during the fly', () => {
  assert.equal(stickAt(flyDuration(false) * 0.5, 'fly', false).hunting, false)
  assert.equal(stickAt(PRESS_DUR * (PRESS_HUNT_U - 0.02), 'stick', false).hunting, false)
  assert.equal(stickAt(PRESS_DUR * PRESS_HUNT_U, 'stick', false).hunting, true)
  assert.equal(stickAt(PRESS_DUR * PRESS_HUNT_U, 'stick', false).planted, false)
  assert.equal(stickAt(0, 'hold', false).hunting, true)
})

test('the showcase key hangs on the card, not on the room behind it', () => {
  for (const phone of [false, true]) {
    const show = phone ? SHOWCASE_PHONE : SHOWCASE
    const key = showcaseKeyPos(phone)
    const toCard = dist(key, show)
    assert.ok(toCard > 0.1 && toCard < 0.7, `key sits close to the card, got ${toCard}`)
    // Inverse-square falloff over this ratio is more than two orders of
    // magnitude, so the machine cannot pick the close-up light up.
    assert.ok(dist(key, PLACARD_REST) > 12 * toCard)
    assert.ok(key.y > show.y, 'it comes from above')
  }
})

test('the 0C key rides with the card, then stays at the lens as the card leaves', () => {
  const dur = flyDuration(false)
  const restOff = dist(showcaseKeyPos(false), SHOWCASE)

  const arriving = stickAt(dur * FLY_IN_END, 'fly', false)
  assert.ok(Math.abs(dist(arriving.keyPos!, arriving) - restOff) < 1e-6, 'offset holds as it commits')

  const hold = stickAt(dur * 0.5, 'fly', false)
  assert.ok(Math.abs(dist(hold.keyPos!, hold) - restOff) < 1e-6, 'offset holds through the close-up')

  const leaving = stickAt(dur * 0.95, 'fly', false)
  assert.ok(dist(leaving, SHOWCASE) > 1, 'already off the lens')
  assert.ok(
    Math.abs(dist(leaving.keyPos!, SHOWCASE) - restOff) < 1e-6,
    'key stays at the close-up so the cutoff cannot reach the machine',
  )
  assert.ok(dist(leaving.keyPos!, PLACARD_REST) > 12 * restOff)
})

test('phone showcase sits further from the lens so the card fits the portrait width', () => {
  const desk = stickAt(flyDuration(false) * 0.5, 'fly', false)
  const phone = stickAt(flyDuration(true) * 0.5, 'fly', true)
  assert.ok(distToCam(phone) > distToCam(desk))
})
