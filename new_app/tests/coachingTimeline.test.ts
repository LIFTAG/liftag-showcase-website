import { test } from 'node:test';
import assert from 'node:assert/strict';
import { coachingPose } from '../utils/gymscan/coachingTimeline.ts';

const frame = { member: 0, owner: 0, isOwner: false, reduced: false };
test('instruction panel returns to the same dock before ownership changes', () => {
  const end = coachingPose({ ...frame, member: 1 });
  const start = coachingPose({ ...frame, member: 1, isOwner: true });
  assert.equal(end.reveal, 0);
  assert.equal(start.reveal, 0);
  assert.equal(start.rewrite, 0);
  assert.equal(start.branded, false);
});
test('the catalog clip lifts out, rewrites, then docks as a gym slot', () => {
  const start = coachingPose({ ...frame, isOwner: true, owner: 0 });
  const lifted = coachingPose({ ...frame, isOwner: true, owner: .12 });
  const rewriting = coachingPose({ ...frame, isOwner: true, owner: .4 });
  const written = coachingPose({ ...frame, isOwner: true, owner: .65 });
  const end = coachingPose({ ...frame, isOwner: true, owner: 1 });
  assert.equal(start.reveal, 0);
  assert.equal(start.rewrite, 0);
  assert.ok(lifted.reveal > .8);
  assert.ok(lifted.rewrite < .05);
  assert.ok(rewriting.reveal > .9);
  assert.ok(rewriting.rewrite > .4 && rewriting.rewrite < .9);
  assert.equal(rewriting.branded, false);
  assert.ok(written.reveal > .9);
  assert.equal(written.rewrite, 1);
  assert.equal(written.branded, true);
  assert.equal(end.reveal, 0);
  assert.equal(end.rewrite, 1);
  assert.equal(end.branded, true);
});
test('rewrite is continuous, bounded, and does not brand the catalog clip', () => {
  let last = coachingPose({ ...frame, isOwner: true });
  for (let i = 1; i <= 1000; i++) {
    const next = coachingPose({ ...frame, isOwner: true, owner: i / 1000 });
    assert.ok(next.rewrite >= last.rewrite);
    assert.ok(Math.abs(next.rewrite - last.rewrite) < .02);
    if (next.branded) assert.ok(next.rewrite > .75);
    last = next;
  }
  assert.equal(last.rewrite, 1);
  assert.equal(last.branded, true);
});
test('reduced motion keeps the video in the phone and shows the gym slot', () => {
  assert.equal(coachingPose({ ...frame, member: .4, reduced: true }).reveal, 0);
  assert.equal(coachingPose({ ...frame, isOwner: true, owner: 1, reduced: true }).rewrite, 1);
  assert.equal(coachingPose({ ...frame, isOwner: true, owner: 1, reduced: true }).branded, true);
});
