import assert from 'node:assert/strict'
import { test } from 'node:test'
import { act0At, act0Duration, act0Windows, ACT0_SKIP_AT } from '../utils/gymscan/act0.ts'
import { assembleWindows, firstImpactAt } from '../utils/gymscan/assemble.ts'
import { floorDuration, matDuration } from '../utils/gymscan/floorConstruct.ts'
import { FLOOR_MACHINE_R, floorClearAt } from '../utils/gymscan/floorTiles.ts'
import { PASS_SPAN } from '../utils/gymscan/hologramPass.ts'
import { flyDuration, PRESS_DUR, stickDuration } from '../utils/gymscan/stick.ts'

test('Act 0 is floor then assemble then fly then stick then hold', () => {
  const w = act0Windows(false)
  assert.ok(Math.abs(w.floorEnd - floorDuration(false)) < 1e-9)
  assert.ok(Math.abs(w.assembleEnd - (w.assembleAt + assembleWindows(false).doneAt)) < 1e-9)
  assert.ok(Math.abs(w.flyEnd - (w.assembleEnd + flyDuration(false))) < 1e-9)
  assert.ok(Math.abs(w.stickEnd - (w.flyEnd + stickDuration(false))) < 1e-9)
  assert.equal(w.skipAt, ACT0_SKIP_AT)
  assert.ok(Math.abs(w.doorsAt - (w.flyEnd + PRESS_DUR)) < 1e-9)

  assert.equal(act0At(0.2, false).shot, 'floor')
  assert.equal(act0At(w.floorEnd + 0.05, false).shot, 'assemble')
  assert.equal(act0At(w.assembleEnd + 0.05, false).shot, 'fly')
  assert.equal(act0At(w.flyEnd + 0.05, false).shot, 'stick')
  assert.equal(act0At(w.stickEnd + 0.01, false).shot, 'hold')
  assert.equal(act0At(w.stickEnd + 0.01, false).done, true)
})

test('assemble local time starts at 0 on release, not at the end of 0A', () => {
  const w = act0Windows(false)
  const a = act0At(w.assembleAt, false)
  assert.equal(a.shot, 'assemble')
  assert.ok(Math.abs(a.assembleT) < 1e-9)
  const floor = act0At(w.assembleAt - 0.01, false)
  assert.equal(floor.shot, 'floor')
  assert.equal(floor.assembleT, -1)
})

test('skip is on from 800ms until the hold; doors wait for the press', () => {
  assert.equal(act0At(0.4, false).skipVisible, false)
  assert.equal(act0At(0.81, false).skipVisible, true)
  const w = act0Windows(false)
  assert.equal(act0At(w.flyEnd + PRESS_DUR * 0.4, false).skipVisible, true)
  assert.equal(act0At(w.flyEnd + PRESS_DUR * 0.4, false).doorsVisible, false)
  assert.equal(act0At(w.doorsAt, false).skipVisible, false)
  assert.equal(act0At(w.doorsAt + 0.01, false).doorsVisible, true)
  assert.equal(act0At(w.stickEnd, false).skipVisible, false)
  assert.equal(act0At(w.stickEnd, false).doorsVisible, true)
})

test('hold starts the frame the press lands, which is when scroll may start', () => {
  const w = act0Windows(false)
  const before = act0At(w.doorsAt - 1e-6, false)
  assert.equal(before.shot, 'stick')
  assert.equal(before.done, false)
  assert.equal(before.doorsVisible, false)
  assert.equal(before.skipVisible, true)
  const after = act0At(w.doorsAt, false)
  assert.equal(after.shot, 'hold')
  assert.equal(after.done, true)
  assert.equal(after.doorsVisible, true)
  assert.equal(after.skipVisible, false)
})

test('phone compresses every window and still holds the order', () => {
  const d = act0Windows(false)
  const p = act0Windows(true)
  assert.ok(p.floorEnd < d.floorEnd)
  assert.ok(p.assembleEnd < d.assembleEnd)
  assert.ok(p.stickEnd < d.stickEnd)
  assert.ok(act0Duration(true) < act0Duration(false))
  assert.equal(act0At(p.floorEnd + 0.02, true).shot, 'assemble')
  assert.equal(act0At(p.stickEnd, true).done, true)
})

test('0B starts under 0A — the machine falls while the mat is still writing', () => {
  for (const phone of [false, true]) {
    const w = act0Windows(phone)
    assert.ok(w.assembleAt > 0, 'the rain still waits for some ground')
    assert.ok(
      w.assembleAt < w.floorEnd - 0.3,
      `0B must overlap 0A, assembleAt=${w.assembleAt} floorEnd=${w.floorEnd}`,
    )
    // The first piece lands on ground that is already solid and still.
    const landsAt = w.assembleAt + firstImpactAt(phone)
    const groundReady = (floorClearAt(FLOOR_MACHINE_R) / PASS_SPAN) * w.floorEnd
    assert.ok(
      landsAt >= groundReady - 1e-9,
      `first piece lands at ${landsAt}, ground ready at ${groundReady}`,
    )
  }
})

test('the floor birth runs on its own clock through the overlap', () => {
  const w = act0Windows(false)
  const mid = (w.assembleAt + w.floorEnd) / 2
  const a0 = act0At(mid, false)
  assert.equal(a0.shot, 'assemble', 'the rain has started')
  assert.equal(a0.floorT, mid, 'and the mat is still being written')
  assert.equal(act0At(w.matEnd + 1, false).floorT, w.matEnd, 'clamped once the mat is open')
  assert.equal(act0At(-1, false).floorT, 0)
})

test('the plane finishes writing before the fly-in kills the birth', () => {
  // The sweep and the slabs end at floorEnd; the plane washes on past them out
  // to the fog. `kill` at the fly-in snaps whatever is left straight open, so
  // the wash has to be finished by then - on the phone, whose 0A is
  // compressed but whose 0B is not, that margin is thin.
  for (const phone of [false, true]) {
    const w = act0Windows(phone)
    assert.equal(w.matEnd, matDuration(phone))
    assert.ok(w.matEnd > w.floorEnd, 'the plane outlives the sweep')
    assert.ok(
      w.matEnd < w.assembleEnd,
      `mat must be open before the fly-in, matEnd=${w.matEnd} assembleEnd=${w.assembleEnd}`,
    )
  }
})
