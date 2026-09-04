import assert from 'node:assert/strict'
import { test } from 'node:test'
import { act1At, act1Windows, FOLD_AT_DOLLY, phoneFillAmp } from '../utils/gymscan/act1.ts'

test('desktop uses the 2.9 / 0.12 / 0.48 approach-lock-fold cut', () => {
  const w = act1Windows(false)
  assert.ok(Math.abs(w.approachEnd - 2.9 / 3.5) < 1e-12)
  assert.ok(Math.abs(w.lockEnd - 3.02 / 3.5) < 1e-12)
  assert.ok(Math.abs(w.foldStart - w.approachEnd * FOLD_AT_DOLLY) < 1e-12)
  assert.equal(w.foldEnd, 1)
  assert.deepEqual(act1At(0, false), { shot: 'approach', dollyU: 0, lockU: 0, foldU: 0 })
  const atApproachEnd = act1At(w.approachEnd, false)
  assert.equal(atApproachEnd.shot, 'lock')
  assert.equal(atApproachEnd.dollyU, 1)
  assert.equal(atApproachEnd.lockU, 0)
  assert.ok(atApproachEnd.foldU > 0, 'glass is already forming when the dolly parks')
  const atLockEnd = act1At(w.lockEnd, false)
  assert.equal(atLockEnd.shot, 'fold')
  assert.equal(atLockEnd.dollyU, 1)
  assert.equal(atLockEnd.lockU, 1)
  assert.ok(atLockEnd.foldU > atApproachEnd.foldU)
  assert.ok(atLockEnd.foldU < 1)
  assert.deepEqual(act1At(1, false), { shot: 'fold', dollyU: 1, lockU: 1, foldU: 1 })
})

test('phone runs the same three shots on a shorter budget', () => {
  const w = act1Windows(true)
  assert.ok(Math.abs(w.approachEnd - 1.45 / 1.75) < 1e-12)
  assert.ok(Math.abs(w.lockEnd - 1.51 / 1.75) < 1e-12)
  assert.ok(Math.abs(w.foldStart - w.approachEnd * FOLD_AT_DOLLY) < 1e-12)
  assert.equal(w.foldEnd, 1)
  const atApproachEnd = act1At(w.approachEnd, true)
  assert.equal(atApproachEnd.shot, 'lock')
  assert.equal(atApproachEnd.dollyU, 1)
  assert.ok(atApproachEnd.foldU > 0)
  const atLockEnd = act1At(w.lockEnd, true)
  assert.equal(atLockEnd.shot, 'fold')
  assert.equal(atLockEnd.lockU, 1)
  assert.ok(atLockEnd.foldU > atApproachEnd.foldU)
  assert.deepEqual(act1At(1, true), { shot: 'fold', dollyU: 1, lockU: 1, foldU: 1 })
})

test('the lock is a beat, not a chapter: the move owns most of the budget', () => {
  // A parked camera narrating itself is what the recut removed. Whatever the
  // spans become, the approach has to dominate and the lock has to be the
  // shortest of the three.
  for (const phone of [false, true]) {
    const w = act1Windows(phone)
    const lock = w.lockEnd - w.approachEnd
    const fold = 1 - w.lockEnd
    assert.ok(w.approachEnd > 0.6, `approach should own the budget, got ${w.approachEnd}`)
    assert.ok(lock < 0.15, `lock should be a beat, got ${lock}`)
    assert.ok(lock < fold, 'the lock must not outlast the fold it exists to trigger')
  }
})

test('there is no rep between the approach and the lock', () => {
  for (const phone of [false, true]) {
    const shots = new Set<string>()
    for (let i = 0; i <= 200; i++) shots.add(act1At(i / 200, phone).shot)
    assert.deepEqual([...shots].sort(), ['approach', 'fold', 'lock'])
  }
})

test('channels are phase-local, clamped, and the QR never resolves on approach', () => {
  for (const phone of [false, true]) {
    const w = act1Windows(phone)
    const midApproach = act1At(w.approachEnd / 2, phone)
    assert.equal(midApproach.shot, 'approach')
    assert.ok(midApproach.dollyU > 0.4 && midApproach.dollyU < 0.6)
    assert.equal(midApproach.lockU, 0)
    assert.equal(midApproach.foldU, 0)

    const midLock = act1At((w.approachEnd + w.lockEnd) / 2, phone)
    assert.equal(midLock.shot, 'lock')
    assert.equal(midLock.dollyU, 1)
    assert.ok(midLock.lockU > 0.4 && midLock.lockU < 0.6)
    assert.ok(midLock.foldU > 0, 'lock plays on a phone that is already forming')

    // The dolly is finished before anything resolves: the plate is scenery on
    // the way in, which is the whole reason the lock is its own shot.
    assert.equal(act1At(w.approachEnd - 1e-9, phone).lockU, 0)

    assert.deepEqual(act1At(-1, phone), act1At(0, phone))
    assert.deepEqual(act1At(2, phone), act1At(1, phone))
  }
})

test('the phone starts forming before the zoom onto the QR finishes', () => {
  for (const phone of [false, true]) {
    const w = act1Windows(phone)
    assert.ok(w.foldStart < w.approachEnd, 'fold must overlap the last of the dolly')
    assert.ok(w.foldStart > w.approachEnd * 0.45, 'not during the establishing walk')
    assert.ok(w.foldStart < w.approachEnd * 0.65, 'on the close, not the last push')

    const before = act1At(w.foldStart - 1e-9, phone)
    assert.equal(before.shot, 'approach')
    assert.equal(before.foldU, 0)
    assert.ok(Math.abs(before.dollyU - FOLD_AT_DOLLY) < 0.01)

    const lateApproach = act1At(w.approachEnd - 1e-9, phone)
    assert.equal(lateApproach.shot, 'approach')
    assert.ok(lateApproach.dollyU < 1)
    assert.equal(lateApproach.lockU, 0)
    assert.ok(
      lateApproach.foldU > 0.4,
      `bezel must already be in on the last of the zoom, got foldU=${lateApproach.foldU}`,
    )
    assert.ok(lateApproach.foldU < 0.8, 'the glass must not finish before the dolly parks')
  }
})

test('the phone fill is on for the zoomed plate and off once the glass covers it', () => {
  for (const phone of [false, true]) {
    const w = act1Windows(phone)
    const start = act1At(0, phone)
    assert.equal(phoneFillAmp(start.dollyU, start.foldU), 0)

    const midWalk = act1At(w.foldStart - 1e-9, phone)
    assert.equal(phoneFillAmp(midWalk.dollyU, midWalk.foldU), 0, 'still the establishing walk')

    const late = act1At(w.approachEnd - 1e-9, phone)
    assert.ok(
      phoneFillAmp(late.dollyU, late.foldU) > 0.85,
      `zoomed plate is filled, got ${phoneFillAmp(late.dollyU, late.foldU)}`,
    )

    const lock = act1At((w.approachEnd + w.lockEnd) / 2, phone)
    assert.ok(
      phoneFillAmp(lock.dollyU, lock.foldU) > 0.7,
      `still filled while the code resolves, got ${phoneFillAmp(lock.dollyU, lock.foldU)}`,
    )

    const end = act1At(1, phone)
    assert.equal(phoneFillAmp(end.dollyU, end.foldU), 0)
  }
})
