import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync, statSync, existsSync } from "node:fs";
import { gymEquipment } from "../utils/gymscan/equipment.ts";
import { gymJourneyAt } from "../utils/gymscan/journey.ts";

const publicFile = (path: string) =>
  new URL(`../public${path}`, import.meta.url);
test("the opening machine still is a fallback, not a loading preview", () => {
  const cinema = readFileSync(
    new URL("../components/gym/GymCinema.vue", import.meta.url),
    "utf8",
  );
  assert.match(cinema, /v-if="showPoster"/);
  assert.doesNotMatch(cinema, /<noscript>/);
  assert.doesNotMatch(cinema, /fetchpriority="high"/);
});
test("the floor ships only optimized models with corresponding HTML fallbacks", () => {
  let total = 0;
  for (const item of gymEquipment) {
    const file = publicFile(item.model);
    const bytes = readFileSync(file);
    assert.equal(bytes.toString("ascii", 0, 4), "glTF");
    assert.equal(bytes.readUInt32LE(4), 2);
    assert.equal(bytes.readUInt32LE(8), bytes.length);
    assert.ok(statSync(publicFile(item.poster)).size > 0);
    total += bytes.length;
  }
  assert.ok(
    total < 1_700_000,
    `Equipment grew beyond the deferred 1.7 MB budget: ${total}`,
  );
  assert.ok(existsSync(publicFile("/assets/gym3d/equipment/floor.webp")));
  assert.ok(!existsSync(publicFile("/assets/gym3d/lat-pulldown-athlete.glb")));
});
test("header-offset chapter links complete the reveal and select the right chapter", () => {
  const atGymLink = gymJourneyAt(5490 - 76, 900, 3600, 5490, 7200);
  assert.equal(atGymLink.gallery, 1);
  assert.equal(atGymLink.chapter, "gyms");
  assert.equal(gymJourneyAt(3600 - 76, 900, 3600, 5490).film, 1);
  assert.equal(gymJourneyAt(3600 - 76, 900, 3600, 5490).chapter, "lifters");
  assert.equal(gymJourneyAt(900 - 76, 900, 3600, 5490).chapter, "the-tag");
});
