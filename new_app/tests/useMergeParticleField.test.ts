import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import {
  MERGE_BODY_COUNT,
  MERGE_LOGO_INDEX,
  bodyToParticleWorld,
  mergeBodyVelocity,
  mergeStormFromProgress,
  publishMergeBody,
  publishMergeStorm,
  publishMergeWell,
  resetMergeParticleField,
  useMergeParticleField,
  wellToParticleWorld,
} from '../composables/useMergeParticleField.ts'

afterEach(() => {
  resetMergeParticleField()
})

test('useMergeParticleField returns the same shared buffer', () => {
  assert.equal(useMergeParticleField(), useMergeParticleField())
})

test('the field has nine body slots plus a well and storm', () => {
  const field = useMergeParticleField()
  assert.equal(MERGE_BODY_COUNT, 9)
  assert.equal(MERGE_LOGO_INDEX, 8)
  assert.equal(field.bodies.length, 9)
  assert.deepEqual(field.well, { cx: 0, cy: 0, strength: 0 })
  assert.deepEqual(field.storm, { tornado: 0, burst: 0, settle: 0, spin: 0 })
})

test('publishMergeBody writes only the requested slot', () => {
  const field = useMergeParticleField()
  publishMergeBody(2, {
    cx: 12,
    cy: 24,
    radius: 18,
    vx: -40,
    vy: 15,
    spin: 90,
    strength: 0.6,
  })

  assert.deepEqual(field.bodies[2], {
    cx: 12,
    cy: 24,
    radius: 18,
    vx: -40,
    vy: 15,
    spin: 90,
    strength: 0.6,
  })
  assert.equal(field.bodies[0].strength, 0)
  assert.equal(field.bodies[8].strength, 0)
})

test('publishMergeBody ignores out-of-range indexes', () => {
  const field = useMergeParticleField()
  publishMergeBody(-1, {
    cx: 1,
    cy: 1,
    radius: 1,
    vx: 1,
    vy: 1,
    spin: 1,
    strength: 1,
  })
  publishMergeBody(9, {
    cx: 1,
    cy: 1,
    radius: 1,
    vx: 1,
    vy: 1,
    spin: 1,
    strength: 1,
  })

  for (const body of field.bodies) {
    assert.equal(body.strength, 0)
  }
})

test('publishMergeWell writes the shared well', () => {
  const field = useMergeParticleField()
  publishMergeWell({ cx: 110, cy: 70, strength: 0.8 })
  assert.deepEqual(field.well, { cx: 110, cy: 70, strength: 0.8 })
})

test('resetMergeParticleField zeros every body and the well', () => {
  const field = useMergeParticleField()
  publishMergeBody(0, {
    cx: 10,
    cy: 20,
    radius: 8,
    vx: 4,
    vy: -2,
    spin: 30,
    strength: 1,
  })
  publishMergeWell({ cx: 3, cy: 4, strength: 0.5 })
  publishMergeStorm({ tornado: 1, burst: 0.4, settle: 0.2, spin: 3 })

  resetMergeParticleField()

  for (const body of field.bodies) {
    assert.deepEqual(body, {
      cx: 0,
      cy: 0,
      radius: 0,
      vx: 0,
      vy: 0,
      spin: 0,
      strength: 0,
    })
  }
  assert.deepEqual(field.well, { cx: 0, cy: 0, strength: 0 })
  assert.deepEqual(field.storm, { tornado: 0, burst: 0, settle: 0, spin: 0 })
})

test('publishMergeStorm writes the shared storm', () => {
  const field = useMergeParticleField()
  publishMergeStorm({ tornado: 0.8, burst: 0.2, settle: 0.1, spin: 2.1 })
  assert.deepEqual(field.storm, { tornado: 0.8, burst: 0.2, settle: 0.1, spin: 2.1 })
})

test('mergeStormFromProgress is idle before the merge starts', () => {
  const storm = mergeStormFromProgress(0, 0, 0)
  assert.equal(storm.tornado, 0)
  assert.equal(storm.burst, 0)
  assert.equal(storm.settle, 0)
  assert.equal(storm.spin, 0)
})

test('mergeStormFromProgress sucks in hard while icons collapse', () => {
  const storm = mergeStormFromProgress(1, 0, 0)
  assert.ok(storm.tornado > 0.7)
  assert.ok(storm.burst < 0.05)
  assert.ok(storm.settle < 0.05)
})

test('mergeStormFromProgress keeps the suck-in as the logo first appears', () => {
  const storm = mergeStormFromProgress(1, 0.12, 0)
  assert.ok(storm.tornado > 0.35)
  assert.ok(storm.burst < 0.65)
  assert.ok(storm.settle < 0.05)
})

test('mergeStormFromProgress peaks at a screen-wide burst as LIFTAG appears', () => {
  const peakBurst = Math.max(
    ...[0.18, 0.24, 0.28, 0.34, 0.40].map((intro) => mergeStormFromProgress(1, intro, 0).burst),
  )
  const storm = mergeStormFromProgress(1, 0.28, 0)
  assert.ok(peakBurst > 0.65)
  assert.ok(storm.burst > 0.65)
  assert.ok(storm.settle < 0.12)
})

test('mergeStormFromProgress holds the dispersed field after the burst', () => {
  const storm = mergeStormFromProgress(1, 0.7, 0)
  assert.ok(storm.settle > 0.8)
  assert.ok(storm.tornado < 0.05)
})

test('mergeStormFromProgress keeps the hold as the logo spin finishes', () => {
  const storm = mergeStormFromProgress(1, 1, 0)
  assert.ok(storm.settle > 0.95)
  assert.ok(storm.tornado < 0.05)
  assert.ok(storm.burst < 0.05)
})

test('mergeStormFromProgress dies on section exit', () => {
  const storm = mergeStormFromProgress(1, 1, 1)
  assert.ok(storm.tornado < 0.02)
  assert.ok(storm.burst < 0.02)
  assert.ok(storm.settle < 0.02)
  assert.ok(storm.spin < 0.02)
})

test('mergeBodyVelocity derives px/s and deg/s from the previous pose', () => {
  assert.deepEqual(
    mergeBodyVelocity(
      { x: 10, y: 20, spin: 40 },
      { x: 20, y: 10, spin: 100 },
      100,
    ),
    { vx: 100, vy: -100, spin: 600 },
  )
})

test('mergeBodyVelocity treats a missing dt as one millisecond', () => {
  assert.deepEqual(
    mergeBodyVelocity(
      { x: 0, y: 0, spin: 0 },
      { x: 2, y: 0, spin: 0 },
      0,
    ),
    { vx: 2000, vy: 0, spin: 0 },
  )
})

test('bodyToParticleWorld scales the disc and velocity into camera space', () => {
  const canvas = { left: 0, top: 0, width: 200, height: 100 }
  const world = bodyToParticleWorld(
    {
      cx: 50,
      cy: 25,
      radius: 25,
      vx: 100,
      vy: 50,
      spin: 180,
      strength: 1,
    },
    canvas,
    40,
    20,
  )

  assert.equal(world.cx, -20)
  assert.equal(world.cy, 10)
  assert.equal(world.radius, 10)
  assert.equal(world.vx, 40)
  assert.equal(world.vy, -20)
  assert.equal(world.spin, 180)
  assert.equal(world.strength, 1)
})

test('wellToParticleWorld maps the well center and keeps strength', () => {
  const canvas = { left: 10, top: 20, width: 200, height: 100 }
  const world = wellToParticleWorld({ cx: 110, cy: 70, strength: 0.7 }, canvas, 40, 20)
  assert.deepEqual(world, { cx: 0, cy: 0, strength: 0.7 })
})
