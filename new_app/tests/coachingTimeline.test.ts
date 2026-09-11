import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  coachingPhoneSlot,
  coachingPose,
  coachingUiAt,
} from '../utils/gymscan/coachingTimeline.ts';
import {
  coachingOverlayIsGym,
  coachingWipeTravel,
} from '../utils/gymscan/coachingWipe.ts';

const frame = { member: 0, owner: 0, isOwner: false, reduced: false };
test('the presented phone stays continuous across the two chapters', () => {
  const end = coachingPose({ ...frame, member: 1 });
  const start = coachingPose({ ...frame, member: 1, isOwner: true });
  assert.equal(end.reveal, 1);
  assert.equal(start.reveal, end.reveal);
  assert.equal(start.rewrite, 0);
  assert.equal(start.branded, false);
});
test('the gym clip replaces the guide at the turn, then the phone settles', () => {
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
test('the coaching phone occupies the right pane on desktop and the middle on a phone', () => {
  const desk = coachingPhoneSlot(1440, 900);
  assert.ok(desk.h > 680);
  assert.ok(desk.x + desk.w / 2 > 1440 * 0.55);
  assert.ok(desk.x > 1440 * 0.4);
  const shortDesk = coachingPhoneSlot(1024, 768);
  assert.ok(shortDesk.y + shortDesk.h < 700);
  const phone = coachingPhoneSlot(390, 844);
  assert.ok(Math.abs(phone.x + phone.w / 2 - 195) < 8);
  assert.ok(phone.y > 140);
  assert.ok(phone.y + phone.h < 660);
});
test('the gym replace is a held take, not a linear smear', () => {
  assert.equal(coachingWipeTravel(0), 0);
  assert.equal(coachingWipeTravel(1), 1);
  assert.ok(coachingWipeTravel(0.08) < 0.02);
  assert.ok(coachingWipeTravel(0.5) > 0.4 && coachingWipeTravel(0.5) < 0.6);
  assert.equal(coachingOverlayIsGym(0.2), false);
  assert.equal(coachingOverlayIsGym(0.9), true);
  let previous = 0;
  for (let i = 1; i <= 40; i++) {
    const next = coachingWipeTravel(i / 40);
    assert.ok(next >= previous);
    previous = next;
  }
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
