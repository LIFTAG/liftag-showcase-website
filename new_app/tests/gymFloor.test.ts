import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { floorEquipment } from "../utils/gymscan/floorEquipment.ts";
import {
  FLOOR_BEAT_EDGES,
  FLOOR_CAM_FOV,
  FLOOR_D,
  FLOOR_FOOTPRINT,
  FLOOR_SPAWN_DURATION,
  FLOOR_SPAWN_STAGGER,
  FLOOR_TILE,
  FLOOR_TITLE_TILES,
  FLOOR_W,
  floorAppDivider,
  floorAppName,
  floorAppNumber,
  floorAppRow,
  floorAt,
  floorBeatAt,
  floorBeatTarget,
  floorCameraAt,
  floorLabelAt,
  floorLabelLanded,
  floorMachinePoseAt,
  floorMorphRect,
  floorPhoneBodyRect,
  floorScreenWorldY,
  floorSeamAt,
  floorSpawnAt,
  floorSpawnDone,
  floorTitleAt,
  floorTitleLanded,
  floorTitlePoseAt,
  floorTitleScreenWorld,
} from "../utils/gymscan/floorTimeline.ts";
import { memberPhoneSlot } from "../utils/gymscan/memberPhone.ts";
import { gymJourneyAt } from "../utils/gymscan/journey.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const samples = Array.from({ length: 401 }, (_, i) => i / 400);

test("the floor carries every machine inside its outline all the way into the phone", () => {
  for (const progress of samples) {
    const rect = floorMorphRect(floorAt(progress).morph);
    floorEquipment.forEach((item, i) => {
      const pose = floorMachinePoseAt(progress, i);
      const reach = FLOOR_FOOTPRINT * item.span * pose.scale;
      assert.ok(Math.abs(pose.x) + reach <= rect.w / 2 + 1e-9, `${item.id} overhangs x at ${progress}`);
      assert.ok(Math.abs(pose.z) + reach <= rect.d / 2 + 1e-9, `${item.id} overhangs z at ${progress}`);
    });
  }
  assert.deepEqual(floorMorphRect(0), { x: 0, z: 0, w: FLOOR_W, d: FLOOR_D });
  const body = floorPhoneBodyRect();
  const end = floorMorphRect(1);
  assert.ok(Math.abs(end.w - body.w) < 1e-9 && Math.abs(end.d - body.d) < 1e-9);
});

test("the finished phone lands on the member chapter's slot", () => {
  const t = Math.tan((FLOOR_CAM_FOV * Math.PI) / 360);
  const body = floorPhoneBodyRect();
  for (const [width, height] of [[1440, 900], [1920, 1080], [1024, 768], [390, 844], [375, 667]]) {
    const cam = floorCameraAt(1, 1, width, height);
    const slot = memberPhoneSlot(width, height);
    assert.equal(cam.overhead, 1);
    assert.ok(Math.abs(cam.x) < 1e-9 && Math.abs(cam.z) < 1e-9, "plumb over the device");
    // Pinhole projection of the body outline on the glass plane.
    const pxPerMetre = height / 2 / ((cam.y - floorScreenWorldY()) * t);
    assert.ok(Math.abs(body.d * pxPerMetre - slot.h) < 0.5, `${width}x${height} height`);
    assert.ok(Math.abs(body.w * pxPerMetre - slot.w) < 0.5, `${width}x${height} width`);
    assert.ok(Math.abs(width / 2 - cam.offsetX - (slot.x + slot.w / 2)) < 1e-6);
    assert.ok(Math.abs(height / 2 - cam.offsetY - (slot.y + slot.h / 2)) < 1e-6);
  }
});

test("the crane starts low and pulled back, and only turns plumb for the morph", () => {
  const start = floorCameraAt(0, 1, 1440, 900);
  const approach = floorCameraAt(0, 0, 1440, 900);
  const elevation = (cam: typeof start) =>
    (Math.atan2(cam.y - cam.targetY, Math.hypot(cam.x, cam.z)) * 180) / Math.PI;
  assert.ok(elevation(start) > 25 && elevation(start) < 35);
  assert.ok(Math.hypot(approach.x, approach.y, approach.z) > Math.hypot(start.x, start.y, start.z) * 1.25);
  assert.ok(start.x < 0, "from the front-left, away from the painted title");
  const list = floorCameraAt(0.4, 1, 1440, 900);
  assert.ok(elevation(list) > 55 && elevation(list) < 70, "steep, but still dimensional");
  assert.equal(list.overhead, 0);
});

test("tags scan in with their machine, then land their number and name in the app row", () => {
  assert.equal(floorSpawnAt(0, 0).amount, 0);
  assert.equal(floorSpawnDone(FLOOR_SPAWN_DURATION + 2 * FLOOR_SPAWN_STAGGER), false);
  assert.equal(floorSpawnDone(FLOOR_SPAWN_DURATION + 3 * FLOOR_SPAWN_STAGGER), true);
  assert.equal(floorLabelAt(0.2, 0, 0).alpha, 0, "no tag before its machine exists");
  const onFloor = floorLabelAt(0.2, 0, 1);
  assert.equal(onFloor.alpha, 1);
  assert.equal(onFloor.leader, 1);
  assert.equal(onFloor.pill, 1);
  assert.equal(onFloor.travel, 0);
  for (let i = 0; i < floorEquipment.length; i++) {
    const landed = floorLabelAt(1, i, 1);
    assert.equal(landed.travel, 1);
    assert.equal(landed.leader, 0);
    assert.equal(landed.pill, 0, "bare text reaches the row");
    assert.equal(landed.alpha, 0, "the painted row takes over");
    assert.equal(floorLabelLanded(0.6, i), false);
    assert.equal(floorLabelLanded(1, i), true);
  }
  // The app paints a row only once its tag sits exactly on it, and the tag
  // only fades once that row is painted: no ghost, and no gap.
  for (const progress of samples) {
    for (let i = 0; i < floorEquipment.length; i++) {
      const label = floorLabelAt(progress, i, 1);
      if (floorLabelLanded(progress, i)) assert.equal(label.travel, 1, `tag ${i} still flying at ${progress}`);
      if (label.alpha < 1) assert.ok(floorLabelLanded(progress, i), `tag ${i} fades unpainted at ${progress}`);
    }
  }
});

test("a machine's name lands between its area line and the View link", () => {
  for (let i = 0; i < floorEquipment.length; i++) {
    const row = floorAppRow(i);
    const number = floorAppNumber(i);
    const one = floorAppName(i, 1);
    const two = floorAppName(i, 2);
    assert.equal(one.x, number.areaX, "name aligns with the area label");
    assert.equal(two.x, number.areaX);
    assert.ok(one.y < number.baselineY - one.size && one.y > row.y - row.rowH / 2);
    // A wrapped name starts higher, so its two lines sit about the row's centre.
    assert.ok(two.y > one.y && two.y - two.leading < one.y);
  }
});

test("'Your gym' moves from the tiles to the app title before handing off", () => {
  assert.equal(floorTitleAt(0.1).alpha, 0);
  assert.equal(floorTitleAt(0.34).alpha, 1);
  assert.deepEqual(
    (({ x, z, w }) => ({ x, z, w }))(floorTitlePoseAt(0.34)),
    { x: FLOOR_TITLE_TILES.x, z: FLOOR_TITLE_TILES.z, w: FLOOR_TITLE_TILES.w },
  );
  const end = floorTitlePoseAt(1);
  const screen = floorTitleScreenWorld();
  assert.ok(Math.abs(end.x - screen.x) < 1e-9 && Math.abs(end.z - screen.z) < 1e-9);
  assert.equal(end.opacity, 0);
  assert.equal(floorTitleLanded(0.6), false);
  assert.equal(floorTitleLanded(1), true);
});

test("tile joints become the list rules", () => {
  for (let i = 0; i < 3; i++) {
    assert.equal(floorSeamAt(0, i).y, (FLOOR_D / 2 - (i + 1) * FLOOR_TILE) / (FLOOR_D / 1.95));
    assert.deepEqual(floorSeamAt(1, i), floorAppDivider(i));
  }
});

test("floor beats tile the pinned range and each link lands in its band", () => {
  assert.deepEqual([...FLOOR_BEAT_EDGES], [0, 0.3, 0.6, 1]);
  for (const beat of [0, 1, 2]) assert.equal(floorBeatAt(floorBeatTarget(beat)), beat);
  // The list beat is overhead; the app beat starts once the floor is contracting.
  assert.ok(floorAt(FLOOR_BEAT_EDGES[1]).overhead > 0.8);
  assert.ok(floorAt(FLOOR_BEAT_EDGES[2]).morph > 0.2);
  assert.equal(floorAt(0.84).morph, 1);
});

test("the floor chapter sits between the map and the dashboard", () => {
  const at = (scroll: number) => gymJourneyAt(scroll, 900, 3600, 5490, 14000, 8000, 12000, 10000);
  assert.equal(at(9903).chapter, "discover");
  assert.equal(at(9904).chapter, "floor");
  assert.equal(at(11904).chapter, "dashboard");
  const experience = read("../components/gym/GymExperience.vue");
  assert.match(experience, /<GymMapStory[^>]*\/>\s*<GymFloorStory :reduced="reducedMotion" \/>\s*<GymDashboardStory/);
  assert.match(experience, /id: 'floor', label: t\('chapters\.floor'\)/);
});

test("the floor film keeps per-frame work off Vue and has a real fallback", () => {
  const story = read("../components/gym/GymFloorStory.vue");
  assert.match(story, /style\.setProperty\(`--gf-fill-\$\{i\}`/);
  assert.match(story, /node\.style\.setProperty\('--gf-mix'/);
  assert.match(story, /label\.style\.setProperty\('--gf-mix'/);
  // Names are their own layer under the badges, so they can fly to their rows.
  assert.match(story, /class="gf-label"[\s\S]*class="gf-tag"/);
  assert.doesNotMatch(story, /:style="\{[^"]*progress/);
  // The finished screen exists as markup for screen readers and still mode.
  assert.match(story, /class="gf-app" :aria-label="t\('floor\.screenAlt'\)"/);
  assert.match(story, /v-for="item in machines"/);
  assert.match(story, /import\('~\/utils\/gymscan\/floorStage'\)/);
  const stage = read("../utils/gymscan/floorStage.ts");
  assert.match(stage, /vec3\(\.8,1\.,0\.\)/, "the scan line is lime");
  assert.match(stage, /specularIntensity = lerp\(1, 0, beats\.ink\)/);
  const css = read("../assets/css/gym-floor.css");
  assert.match(css, /\.gf-pane \{[\s\S]*?position: sticky;\s*top: 0;\s*height: 100svh;\s*min-height: 480px;/);
});
