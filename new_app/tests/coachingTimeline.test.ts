import { test } from 'node:test';
import assert from 'node:assert/strict';
import { coachingPose, coachingUiAt } from '../utils/gymscan/coachingTimeline.ts';

const frame = { member: 0, owner: 0, isOwner: false, reduced: false };
test('one expanded video stays continuous across the two chapters', () => {
  const end = coachingPose({ ...frame, member: 1 });
  const start = coachingPose({ ...frame, member: 1, isOwner: true });
  assert.equal(end.reveal, 1);
  assert.equal(start.reveal, end.reveal);
  assert.equal(start.rewrite, 0);
  assert.equal(start.branded, false);
});
test('the gym face replaces the guide at the turn, then docks fully', () => {
  const before = coachingPose({ ...frame, isOwner: true, owner: .3 });
  const after = coachingPose({ ...frame, isOwner: true, owner: .6 });
  const end = coachingPose({ ...frame, isOwner: true, owner: 1 });
  assert.equal(before.reveal, 1);
  assert.equal(before.branded, false);
  assert.equal(after.reveal, 1);
  assert.equal(after.branded, true);
  assert.equal(end.reveal, 0);
  assert.equal(end.rewrite, 1);
  assert.equal(end.branded, true);
});
test('turn and docking stay continuous and bounded under reverse scrolling', () => {
  let previous = coachingPose({ ...frame, isOwner: true });
  for (let i = 1; i <= 1000; i++) {
    const next = coachingPose({ ...frame, isOwner: true, owner: i / 1000 });
    assert.ok(next.rewrite >= previous.rewrite);
    assert.ok(next.reveal <= previous.reveal);
    assert.ok(Math.abs(next.rewrite - previous.rewrite) < .02);
    assert.ok(Math.abs(next.reveal - previous.reveal) < .02);
    assert.equal(next.branded, next.rewrite >= .5);
    previous = next;
  }
});
test('reduced motion preserves source selection while keeping the video docked', () => {
  assert.equal(coachingPose({ ...frame, member: .4, reduced: true }).reveal, 0);
  assert.equal(coachingPose({ ...frame, isOwner: true, owner: .12, reduced: true }).branded, false);
  const gym = coachingPose({ ...frame, isOwner: true, owner: .68, reduced: true });
  assert.equal(gym.reveal, 0);
  assert.equal(gym.rewrite, 1);
  assert.equal(gym.branded, true);
});
test('sticky coaching copy only flips at chapter and source thresholds', () => {
  assert.deepEqual(coachingUiAt({ isOwner: false, owner: 0 }), {
    isOwner: false,
    docked: false,
    isGymVideo: false,
  });
  assert.equal(coachingUiAt({ isOwner: true, owner: 0.3 }).isGymVideo, false);
  assert.equal(coachingUiAt({ isOwner: true, owner: 0.42 }).isGymVideo, true);
  assert.equal(coachingUiAt({ isOwner: true, owner: 0.88 }).docked, false);
  assert.equal(coachingUiAt({ isOwner: true, owner: 0.881 }).docked, true);
});
