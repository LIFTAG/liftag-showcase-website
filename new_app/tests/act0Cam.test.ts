import assert from 'node:assert/strict'
import { test } from 'node:test'
import { act0At, act0Windows } from '../utils/gymscan/act0.ts'
import { act0CamAt, ESTABLISH } from '../utils/gymscan/act0Cam.ts'
import { PRESS_DUR } from '../utils/gymscan/stick.ts'

function sameStation(cam: { x: number, y: number, z: number, tx: number, ty: number, tz: number }) {
  assert.ok(Math.abs(cam.x - ESTABLISH.x) < 1e-6)
  assert.ok(Math.abs(cam.y - ESTABLISH.y) < 1e-6)
  assert.ok(Math.abs(cam.z - ESTABLISH.z) < 1e-6)
  assert.ok(Math.abs(cam.tx - ESTABLISH.tx) < 1e-6)
  assert.ok(Math.abs(cam.ty - ESTABLISH.ty) < 1e-6)
  assert.ok(Math.abs(cam.tz - ESTABLISH.tz) < 1e-6)
}

test('0A holds the establishing station — the hologram sweep is the shot', () => {
  sameStation(act0CamAt(act0At(0.6, false)))
})

test('0C does not punch in — the card flies into this POV', () => {
  const w = act0Windows(false)
  const fly = act0At(w.assembleEnd + 0.9, false)
  assert.equal(fly.shot, 'fly')
  sameStation(act0CamAt(fly))
  sameStation(act0CamAt(act0At(w.flyEnd - 0.8, false)))
})

test('0D does not punch in either: the press plays on the establishing lens', () => {
  // The move out to the mount and back is gone by owner call. Sampling the
  // whole stick window rather than its ends, because a lens that leaves and
  // returns would still pass both.
  for (const phone of [false, true]) {
    const w = act0Windows(phone)
    const from = w.flyEnd - 0.6
    const to = w.stickEnd + 0.1
    for (let i = 0; i <= 60; i++) {
      sameStation(act0CamAt(act0At(from + ((to - from) * i) / 60, phone)))
    }
    sameStation(act0CamAt(act0At(w.flyEnd + PRESS_DUR * 0.5, phone)))
  }
})

test('the whole act is one locked-off shot', () => {
  for (const phone of [false, true]) {
    const w = act0Windows(phone)
    for (let t = 0; t <= w.stickEnd + 1; t += 0.05) {
      sameStation(act0CamAt(act0At(t, phone)))
    }
    sameStation(act0CamAt(act0At(1e6, phone)))
  }
})
