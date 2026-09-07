import { test } from 'node:test'
import assert from 'node:assert/strict'
import { coachingPose, recordingCycle } from '../utils/gymscan/coachingTimeline.ts'

const frame = { member: 0, owner: 0, isOwner: false, reduced: false }

test('member chapter establishes the logger without exposing the recording bay', () => {
  const pose = coachingPose({ ...frame, member: .6 })
  assert.equal(pose.logger, 1); assert.equal(pose.room, 0); assert.equal(pose.recording, 0); assert.equal(pose.docked, 0)
})

test('owner story widens, records, transfers, then docks in order', () => {
  const room = coachingPose({ ...frame, isOwner: true, owner: .22 })
  const record = coachingPose({ ...frame, isOwner: true, owner: .32 })
  const transfer = coachingPose({ ...frame, isOwner: true, owner: .82 })
  const dock = coachingPose({ ...frame, isOwner: true, owner: 1 })
  assert.ok(room.room > .8); assert.equal(room.docked, 0)
  assert.ok(record.recording > .9); assert.equal(record.transfer, 0)
  assert.ok(transfer.transfer > .8)
  assert.equal(dock.room, 0); assert.equal(dock.transfer, 1); assert.equal(dock.docked, 1)
})

test('all timeline channels stay continuous and bounded', () => {
  let previous = coachingPose({ ...frame, isOwner: true })
  for (let i = 1; i <= 1000; i++) {
    const next = coachingPose({ ...frame, isOwner: true, owner: i / 1000 })
    for (const key of Object.keys(next) as (keyof typeof next)[]) {
      assert.ok(next[key] >= 0 && next[key] <= 1)
      assert.ok(Math.abs(next[key] - previous[key]) < .03)
    }
    previous = next
  }
})

test('recording clock wraps exactly on the shared cycle duration', () => {
  assert.equal(recordingCycle(0), 0)
  assert.ok(Math.abs(recordingCycle(4.7) - 4.7) < 1e-9)
  assert.ok(Math.abs(recordingCycle(4.9) - .1) < 1e-9)
  assert.ok(Math.abs(recordingCycle(-.1) - 4.7) < 1e-9)
})

test('reduced motion presents semantic end states without transitional layers', () => {
  assert.deepEqual(coachingPose({ ...frame, member: .5, reduced: true }), { logger: 1, room: 0, recording: 0, transfer: 0, docked: 0 })
  assert.deepEqual(coachingPose({ ...frame, isOwner: true, owner: 1, reduced: true }), { logger: 0, room: 0, recording: 0, transfer: 0, docked: 1 })
})
