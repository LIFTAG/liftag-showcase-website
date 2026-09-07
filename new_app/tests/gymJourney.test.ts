import assert from "node:assert/strict";
import { test } from "node:test";
import { gymJourneyAt, experienceDevice } from "../utils/gymscan/journey.ts";

test("the original installation completes before the scan and phone reveal", () => {
  const start = gymJourneyAt(0, 900, 3600, 5490);
  assert.equal(start.assembly, 0);
  assert.equal(start.film, 0);
  const installed = gymJourneyAt(1980, 900, 3600, 5490);
  assert.equal(installed.assembly, 1);
  assert.equal(installed.film, 0);
  const member = gymJourneyAt(3600, 900, 3600, 5490);
  assert.equal(member.film, 1);
  assert.equal(member.gallery, 0);
  assert.equal(member.chapter, "lifters");
  assert.equal(gymJourneyAt(5490, 900, 3600, 5490).gallery, 1);
});
test("chapter jumps and reverse scrolling depend on current layout, not elapsed time", () => {
  assert.equal(gymJourneyAt(100000, 900, 3600, 5490).chapter, "gyms");
  assert.equal(gymJourneyAt(900, 900, 3600, 5490).chapter, "the-tag");
  assert.equal(gymJourneyAt(-200, 900, 3600, 5490).assembly, 0);
  assert.equal(gymJourneyAt(1600, 400, 1600, 2440).film, 1);
});
test("graphics fallbacks apply on desktops and phones while retaining the same film", () => {
  const capable = { webgl2: true, probeFailed: false, maxTextureSize: 8192 };
  assert.equal(experienceDevice(capable, false, false).cut, "floor");
  assert.equal(experienceDevice(capable, false, true).cut, "floor");
  assert.equal(experienceDevice(capable, false, true).bloom, false);
  assert.equal(experienceDevice(capable, true, false).startStage, false);
  assert.equal(
    experienceDevice({ ...capable, webgl2: false }, false, false).startStage,
    false,
  );
  assert.equal(
    experienceDevice({ ...capable, probeFailed: true }, false, true).startStage,
    false,
  );
});
test("the kit is an explicit destination for chapter and abandonment tracking", () => {
  assert.equal(gymJourneyAt(7300, 900, 3600, 5490, 7200).chapter, "kit");
  assert.equal(gymJourneyAt(5490, 900, 3600, 5490, 7200).chapter, "gyms");
});
test("discovery follows the instructions chapter and yields to the kit in either scroll direction", () => {
  const at = (scroll: number) =>
    gymJourneyAt(scroll, 900, 3600, 5490, 11000, 8000);
  assert.equal(at(8000).chapter, "discover");
  assert.equal(at(10904).chapter, "kit");
  assert.equal(at(10903).chapter, "discover");
  assert.equal(at(7903).chapter, "gyms");
});
