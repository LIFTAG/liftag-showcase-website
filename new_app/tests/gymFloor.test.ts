import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { floorEquipment } from "../utils/gymscan/floorEquipment.ts";
import {
  FLOOR_APP_CANVAS,
  FLOOR_APP_RADIUS,
  FLOOR_APP_CHROME,
  FLOOR_BEAT_EDGES,
  FLOOR_BEATS,
  FLOOR_CAM_FOV,
  FLOOR_COACH_ORDER,
  FLOOR_FILM,
  FLOOR_PHONE_SCALE,
  FLOOR_PLAN_LAYOUT,
  FLOOR_PLAN_ORDER,
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
  floorFilm,
  floorLabelAt,
  floorLabelLanded,
  floorMachinePoseAt,
  floorMorphRect,
  floorOfferFrame,
  floorOpenAt,
  floorOpenFrame,
  floorPhoneBodyRect,
  floorPlanAt,
  floorPlanLanded,
  floorPlanSlot,
  floorPlanTravel,
  floorScreenLocalToWorld,
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

test("View exercises is tapped once every row has landed, then opens into the machine screen", () => {
  const tapped = floorFilm(FLOOR_BEAT_EDGES[2]!) + 0.1;
  assert.equal(floorOpenAt(tapped).press, 0);
  for (let i = 0; i < floorEquipment.length; i++) assert.equal(floorLabelLanded(tapped, i), true);
  assert.equal(floorTitleLanded(tapped), true);
  // The press lands before the button starts to grow.
  assert.equal(floorOpenAt(0.78).press, 1);
  assert.equal(floorOpenAt(0.78).expand, 0);
  // The Browse link lands on the open screen.
  assert.equal(floorOpenAt(floorFilm(floorBeatTarget(2))).expand, 1);

  const button = { x: 240, y: 520, w: 190, h: 38 };
  const start = floorOpenFrame(button, 1, 0);
  assert.deepEqual(
    [start.cx, start.cy, start.hw, start.hh, start.radius],
    [button.x + button.w / 2, button.y + button.h / 2, button.w / 2, button.h / 2, button.h / 2],
  );
  assert.equal(start.fill, 0);
  assert.equal(start.content, 0);
  assert.ok(start.tint > 0, "the tapped button lights up");
  // The card has turned solid before it is much bigger than the button.
  const lifted = floorOpenFrame(button, 1, 0.16);
  assert.equal(lifted.fill, 1);
  assert.equal(lifted.content, 0);
  assert.ok(lifted.hw * 2 < button.w * 1.5 && lifted.hh * 2 < button.h * 2);
  // Width leads height through the middle.
  const mid = floorOpenFrame(button, 1, 0.5);
  assert.ok(mid.hw / (FLOOR_APP_CANVAS.w / 2) > mid.hh / (FLOOR_APP_CANVAS.h / 2));

  const end = floorOpenFrame(button, 1, 1);
  assert.deepEqual(
    [end.cx, end.cy, end.hw, end.hh, end.left, end.top, end.scale, end.radius],
    [FLOOR_APP_CANVAS.w / 2, FLOOR_APP_CANVAS.h / 2, FLOOR_APP_CANVAS.w / 2, FLOOR_APP_CANVAS.h / 2, 0, 0, 1, FLOOR_APP_RADIUS],
  );
  assert.equal(end.content, 1);
  assert.ok(end.shadow < 1e-9);
  // The finished card takes the glass's own corners.
  assert.ok(Math.abs(FLOOR_APP_RADIUS - 92) < 1e-9);
});

test("floor beats tile the pinned range and each link lands in its band", () => {
  assert.equal(FLOOR_BEAT_EDGES.length, FLOOR_BEATS + 1);
  assert.equal(FLOOR_BEAT_EDGES[0], 0);
  assert.equal(FLOOR_BEAT_EDGES[FLOOR_BEATS], 1);
  for (let beat = 0; beat < FLOOR_BEATS; beat++) assert.equal(floorBeatAt(floorBeatTarget(beat)), beat);
  // The floor still becomes the app over the first unit of film.
  assert.deepEqual(FLOOR_BEAT_EDGES.slice(0, 4).map(floorFilm), [0, 0.3, 0.6, 1].map((t) => t * 1));
  assert.equal(floorFilm(1), FLOOR_FILM);
  // The list beat is overhead; the app beat starts once the floor is contracting.
  assert.ok(floorAt(floorFilm(FLOOR_BEAT_EDGES[1]!)).overhead > 0.8);
  assert.ok(floorAt(floorFilm(FLOOR_BEAT_EDGES[2]!)).morph > 0.2);
  assert.equal(floorAt(0.84).morph, 1);
});

test("the machine screen closes, then an AI pill rises, is tapped and opens into the workout", () => {
  assert.equal(floorOpenAt(1).expand, 1, "Browse still holds the machine screen");
  assert.equal(floorOpenAt(1.08).expand, 0);
  assert.equal(floorOpenAt(1.1).press, 0, "the machine card is gone");
  assert.equal(floorPlanAt(1.07).offer, 0);
  assert.equal(floorPlanAt(1.12).offer, 1);
  assert.equal(floorPlanAt(1.12).press, 0, "the pill is in place before it is tapped");
  assert.equal(floorPlanAt(1.155).press, 1);
  assert.equal(floorPlanAt(1.155).expand, 0);
  assert.equal(floorPlanAt(floorFilm(floorBeatTarget(3))).expand, 1, "the Plan link lands on the workout");

  const pill = { x: 180, y: FLOOR_PLAN_LAYOUT.offer.y, w: 360, h: FLOOR_PLAN_LAYOUT.offer.h };
  const rising = floorOfferFrame(pill, 0, 0, 0);
  assert.equal(rising.face, 0);
  assert.ok(rising.cy > pill.y + pill.h / 2, "it rises from below its place");
  const resting = floorOfferFrame(pill, 1, 0, 0);
  assert.deepEqual([resting.cx, resting.cy, resting.hw, resting.hh], [pill.x + pill.w / 2, pill.y + pill.h / 2, pill.w / 2, pill.h / 2]);
  assert.equal(resting.face, 1);
  assert.equal(resting.tint, 0);
  assert.ok(resting.shadow > 0, "a floating button casts a shadow");
  // The pill floats above the home indicator.
  assert.ok(pill.y + pill.h < FLOOR_APP_CANVAS.h - FLOOR_APP_CHROME.bottom);
  const open = floorOfferFrame(pill, 1, 1, 1);
  assert.deepEqual([open.left, open.top, open.scale, open.content], [0, 0, 1, 1]);
});

test("this gym's machines move into the AI workout, then into the coach's routine", () => {
  const machines = floorEquipment.map((_, i) => i);
  assert.deepEqual([...FLOOR_PLAN_ORDER].sort(), machines);
  assert.deepEqual([...FLOOR_COACH_ORDER].sort(), machines);
  const { rowsTop, pitch, action } = FLOOR_PLAN_LAYOUT;
  assert.ok(rowsTop + pitch * FLOOR_PLAN_ORDER.length < action.y, "rows clear the action button");

  const planHold = floorFilm(floorBeatTarget(3));
  const coachHold = floorFilm(floorBeatTarget(4));
  const at = (t: number, order: readonly number[]) =>
    order.forEach((index, slot) => {
      const pose = floorMachinePoseAt(t, index);
      const well = floorPlanSlot(slot);
      const dest = floorScreenLocalToWorld(well.x, well.y);
      assert.ok(Math.abs(pose.x - dest.x) < 1e-9 && Math.abs(pose.z - dest.z) < 1e-9, `machine ${index} in slot ${slot}`);
    });
  // Before the plan, every machine still sits in its list row.
  for (const i of machines) assert.deepEqual(floorMachinePoseAt(1.2, i), floorMachinePoseAt(0.95, i));
  at(planHold, FLOOR_PLAN_ORDER);
  at(coachHold, FLOOR_COACH_ORDER);
  assert.ok(floorPlanLanded(planHold).plan.every(Boolean));
  assert.ok(!floorPlanLanded(planHold).coach.some(Boolean));
  assert.ok(floorPlanLanded(coachHold).coach.every(Boolean));
  assert.equal(floorPlanAt(coachHold).published, true, "the Coach link lands on the published routine");

  // The coach's builder takes over only once the workout is built, and
  // before any machine moves again; Publish waits for the last machine.
  const swapped = FLOOR_PLAN_ORDER.length;
  for (let t = 1; t <= FLOOR_FILM; t += 0.0025) {
    const plan = floorPlanAt(t);
    const landed = floorPlanLanded(t);
    if (plan.swap > 0) assert.equal(landed.plan.filter(Boolean).length, swapped, `swap at ${t}`);
    if (plan.swap < 1) for (const i of machines) assert.equal(floorPlanTravel(t, i).coach, 0, `coach move at ${t}`);
    if (plan.publishing) assert.ok(landed.coach.every(Boolean), `publish at ${t}`);
    // A row is painted only once its machine has all but settled into the well.
    FLOOR_PLAN_ORDER.forEach((index, slot) => {
      if (landed.plan[slot]) assert.ok(floorPlanTravel(t, index).plan >= 0.9);
    });
    // Machines that trade wells pass each other instead of overlapping.
    for (const a of machines)
      for (const b of machines) {
        if (a >= b) continue;
        const pa = floorMachinePoseAt(t, a);
        const pb = floorMachinePoseAt(t, b);
        const gap = Math.hypot(pa.x - pb.x, pa.z - pb.z) / FLOOR_PHONE_SCALE;
        assert.ok(gap > floorAppRow(0).thumb * 0.8, `machines ${a} and ${b} overlap at ${t.toFixed(4)}`);
      }
  }
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
