import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync, statSync } from "node:fs";
import {
  DISCOVERY_APP_TITLE,
  DISCOVERY_FLOOR_D,
  DISCOVERY_FLOOR_W,
  DISCOVERY_MORPH_START,
  DISCOVERY_PHONE_SCALE,
  DISCOVERY_PHONE_ROT_X,
  DISCOVERY_THUMB_ROT_X,
  DISCOVERY_TILE,
  DISCOVERY_TITLE_FLOOR,
  discoveryAppDivider,
  discoveryAppNumber,
  discoveryAppNumberWorld,
  discoveryAppRow,
  discoveryAt,
  discoveryCameraPose,
  discoveryListingBox,
  DISCOVERY_LISTING_PHOTO_ASPECT,
  DISCOVERY_LISTING_RADIUS,
  discoveryCornerRadius,
  discoveryFloorRect,
  discoveryFloorSeamAt,
  discoveryIslandAt,
  discoveryLabelAt,
  discoveryLabelsLanded,
  discoveryMachinePoseAt,
  discoveryMachineSpawnAt,
  discoverySpawnDone,
  DISCOVERY_SPAWN_DURATION,
  DISCOVERY_SPAWN_STAGGER,
  discoveryTitleAt,
  discoveryTitleLanded,
  discoveryTitlePoseAt,
  discoveryTitleScreenWorld,
  discoveryMorphBeats,
  discoveryMorphRect,
  discoveryPhoneBodyRect,
  discoveryPhoneScreenRect,
  globeAssemblyAt,
  globeNetworkAt,
  globeJourneyAt,
  globePullbackAltitude,
  globePriorScale,
  globeBadgeAt,
  globeBadgeScale,
  globeBadgeWorld,
  globeBadgeWorldScale,
  DISCOVERY_BADGE_PX,
  DISCOVERY_GLOBE_BADGE,
  GLOBE_SETTLE_AT,
  GLOBE_REVEAL_PROGRESS,
  GLOBE_FOCUS_PROGRESS,
  GLOBE_SURFACE_ALTITUDE,
  GLOBE_PRIOR_SCALE,
  equipmentOrderAt,
} from "../utils/gymscan/discoveryTimeline.ts";
import {
  discoveryEquipment,
  discoveryLocation,
} from "../utils/gymscan/discoveryEquipment.ts";
import {
  discoveryGymArcs,
  discoveryGyms,
  discoveryHub,
} from "../utils/gymscan/discoveryGyms.ts";
import {
  PHONE_H,
  PHONE_R,
  PHONE_SCR_H,
  PHONE_SCR_W,
  PHONE_W,
} from "../utils/phoneModel.ts";
import {
  cinemaPhoneSlot,
  heroPointerTilt,
  overheadPointerTilt,
  HERO_PHONE_TILT_X,
  HERO_PHONE_TILT_Y,
} from "../utils/gymscan/handoff.ts";
import * as THREE from "three";
import {
  isLandPixel,
  placeGlobeDot,
} from "../utils/gymscan/discoveryGlobe.ts";
import {
  discoveryHubLocationIndex,
  discoveryMapLocations,
} from "../utils/gymscan/discoveryMapLocations.ts";

test("planet zoom-out follows scroll, not elapsed time", () => {
  const timeline = readFileSync(
    new URL("../utils/gymscan/discoveryTimeline.ts", import.meta.url),
    "utf8",
  );
  assert.match(timeline, /progress \/ GLOBE_REVEAL_PROGRESS/);
  assert.doesNotMatch(timeline, /seconds \/ GLOBE_REVEAL/);
  assert.deepEqual(globeJourneyAt(0), { reveal: 0, focus: 0, labels: 0 });
  assert.equal(globeJourneyAt(12, 0).reveal, 0, "waiting does not pull back from the gym");
  assert.equal(globeJourneyAt(0, GLOBE_REVEAL_PROGRESS).reveal, 1);
  assert.equal(globeJourneyAt(0, GLOBE_REVEAL_PROGRESS).focus, 0);
  const mid = globeJourneyAt(0, GLOBE_REVEAL_PROGRESS / 2).reveal;
  assert.ok(mid > 0.4 && mid < 0.6);
  let previous = 0;
  for (let step = 0; step <= 200; step++) {
    const { reveal } = globeJourneyAt(0, (step / 200) * GLOBE_REVEAL_PROGRESS);
    assert.ok(reveal >= previous && reveal <= 1);
    assert.ok(reveal - previous < 0.02, "zoom-out must stay continuous");
    previous = reveal;
  }
});

test("Slovakia approach waits until the zoom-out has finished", () => {
  const timeline = readFileSync(
    new URL("../utils/gymscan/discoveryTimeline.ts", import.meta.url),
    "utf8",
  );
  const stage = readFileSync(
    new URL("../utils/gymscan/discoveryStage.ts", import.meta.url),
    "utf8",
  );
  assert.match(timeline, /progress - GLOBE_REVEAL_PROGRESS/);
  assert.doesNotMatch(timeline, /holdSeconds/);
  assert.doesNotMatch(stage, /holdSeconds/);
  assert.equal(globeJourneyAt(8, 0).focus, 0);
  assert.equal(
    globeJourneyAt(12, GLOBE_REVEAL_PROGRESS).focus,
    0,
    "waiting on the whole Earth does not fly to Slovakia",
  );
  assert.equal(globeJourneyAt(0, GLOBE_REVEAL_PROGRESS).focus, 0);
  assert.equal(globeJourneyAt(0, GLOBE_FOCUS_PROGRESS).focus, 1);
  const mid = globeJourneyAt(
    0,
    (GLOBE_REVEAL_PROGRESS + GLOBE_FOCUS_PROGRESS) / 2,
  ).focus;
  assert.ok(mid > 0.4 && mid < 0.6);
  assert.ok(globeJourneyAt(0, GLOBE_FOCUS_PROGRESS).labels > 0.9);
  assert.equal(globeJourneyAt(0, 0.32).labels, 0);
  let previous = 0;
  const span = GLOBE_FOCUS_PROGRESS - GLOBE_REVEAL_PROGRESS;
  for (let step = 0; step <= 200; step++) {
    const { focus } = globeJourneyAt(
      0,
      GLOBE_REVEAL_PROGRESS + (step / 200) * span,
    );
    assert.ok(focus >= previous && focus <= 1);
    assert.ok(focus - previous < 0.02, "camera movement must stay continuous");
    previous = focus;
  }
});

test("as the gym floor unzooms, the globe morphs into the black 04 badge", () => {
  assert.equal(discoveryEquipment[DISCOVERY_GLOBE_BADGE]?.number, "04");
  assert.deepEqual(globeBadgeAt(0), { travel: 0, detail: 1, handoff: 0 });
  assert.deepEqual(globeBadgeAt(1), { travel: 1, detail: 0, handoff: 1 });
  const mid = globeBadgeAt(0.4);
  assert.ok(mid.travel > 0.6 && mid.travel < 0.95, "globe must already be small while the floor is still arriving");
  assert.ok(mid.detail < 0.15, "land and arcs must die before the sphere is small");
  assert.equal(mid.handoff, 0, "the HTML 04 badge waits until the sphere is the right size");
  assert.ok(globeBadgeAt(0.75).handoff > 0.05);
  assert.equal(globeBadgeScale(0, 0.94, 0.05), 0.94);
  assert.ok(Math.abs(globeBadgeScale(1, 0.94, 0.05) - 0.05) < 1e-9);
  let previous = globeBadgeScale(0, 1, 0.05);
  for (let step = 1; step <= 40; step++) {
    const scale = globeBadgeScale(step / 40, 1, 0.05);
    assert.ok(scale <= previous);
    previous = scale;
  }
  const rest = globeBadgeWorld();
  const bike = discoveryEquipment[DISCOVERY_GLOBE_BADGE]!;
  assert.ok(rest.x < bike.x && rest.z < bike.z, "04 sits up-left of the indoor bike");
  assert.equal(DISCOVERY_BADGE_PX, 24);
  const pixelScale = globeBadgeWorldScale(11, 800, 38, 2, 24);
  assert.ok(pixelScale > 0.03 && pixelScale < 0.12);
  assert.ok(discoveryLabelAt(0.566, 3).appear > 0, "04 appears as the globe lands");
  assert.equal(discoveryLabelAt(0.566, 0).appear, 0, "the other badges still wait for spawn");
  const stage = readFileSync(
    new URL("../utils/gymscan/discoveryStage.ts", import.meta.url),
    "utf8",
  );
  assert.match(stage, /globeBadgeAt/);
  assert.match(stage, /globeBadgeScale/);
  assert.match(stage, /DISCOVERY_GLOBE_BADGE/);
  assert.match(stage, /GLOBE_RADIUS \* globeScale/);
  assert.doesNotMatch(stage, /frame\.floor \* 0\.99/);
  const globe = readFileSync(
    new URL("../utils/gymscan/discoveryGlobe.ts", import.meta.url),
    "utf8",
  );
  assert.match(globe, /uDetail/);
  assert.match(globe, /surface > 0\.04/);
  const css = readFileSync(
    new URL("../assets/css/gym-discovery.css", import.meta.url),
    "utf8",
  );
  assert.match(css, /width:\s*24px/);
});

test("the globe zoom-out starts at gym scale and ends at a whole-Earth altitude", () => {
  assert.ok(Math.abs(globePullbackAltitude(0, 5.8) - GLOBE_SURFACE_ALTITUDE) < 1e-9);
  assert.ok(Math.abs(globePullbackAltitude(1, 5.8) - 5.8) < 1e-9);
  assert.equal(globePriorScale(0), 1);
  assert.ok(Math.abs(globePriorScale(1) - GLOBE_PRIOR_SCALE) < 1e-9);
  let previous = 0;
  for (let step = 0; step <= 40; step++) {
    const altitude = globePullbackAltitude(step / 40, 5.8);
    assert.ok(altitude >= previous);
    previous = altitude;
  }
});

test("regional labels cluster same-city gyms without stacking Bratislava or Košice", () => {
  assert.equal(discoveryMapLocations.reduce((sum, place) => sum + place.count, 0), discoveryGyms.length);
  assert.equal(discoveryMapLocations.find(place => place.city === "Bratislava")?.count, 2);
  assert.equal(discoveryMapLocations.find(place => place.city === "Košice")?.count, 2);
  assert.deepEqual(
    discoveryMapLocations.map(place => place.city),
    ["Bratislava", "Trenčín", "Banská Bystrica", "Spišská Nová Ves", "Košice", "Prešov"],
  );
  assert.ok(discoveryMapLocations.every(place => place.country === "Slovakia"));
});

test("the gym listing morphs out of the parked cinema phone", () => {
  assert.equal(discoveryHubLocationIndex, 0);
  assert.equal(discoveryAt(0).lift, 0);
  assert.equal(discoveryAt(0.05).lift, 1);
  assert.equal(discoveryAt(GLOBE_FOCUS_PROGRESS).listing, 0);
  assert.equal(discoveryAt(GLOBE_FOCUS_PROGRESS).phase, 1);
  assert.ok(discoveryAt(GLOBE_FOCUS_PROGRESS + 0.05).listing > 0.4);
  assert.equal(discoveryAt(GLOBE_FOCUS_PROGRESS + 0.1).listing, 1);
  assert.equal(discoveryAt(0.4).floor, 0);
  const phone = cinemaPhoneSlot(1440, 900);
  const rest = { left: 822, top: 171, width: 333, height: 507 };
  const start = discoveryListingBox(phone, rest, 0);
  const end = discoveryListingBox(phone, rest, 1);
  assert.ok(Math.abs(start.left - phone.x) < 1e-6);
  assert.ok(Math.abs(start.top - phone.y) < 1e-6);
  assert.ok(Math.abs(start.width - phone.w) < 1e-6);
  assert.ok(Math.abs(start.height - phone.h) < 1e-6);
  assert.ok(Math.abs(start.photoH - phone.h) < 1e-6);
  assert.deepEqual(
    { left: end.left, top: end.top, width: end.width, height: end.height },
    rest,
  );
  assert.equal(end.radius, DISCOVERY_LISTING_RADIUS);
  assert.ok(Math.abs(end.photoH - rest.width / DISCOVERY_LISTING_PHOTO_ASPECT) < 1e-6);
  assert.ok(start.radius > end.radius);
  const mid = discoveryListingBox(phone, rest, 0.5);
  assert.ok(mid.width > start.width && mid.width < end.width);
  assert.ok(mid.photoH < start.photoH && mid.photoH > end.photoH);
  const stage = readFileSync(
    new URL("../utils/gymscan/discoveryStage.ts", import.meta.url),
    "utf8",
  );
  assert.match(stage, /journey\.focus \* \(1 - frame\.floor\)/);
  assert.doesNotMatch(stage, /journey\.focus \* \(1 - frame\.listing\)/);
  const host = readFileSync(
    new URL("../components/gym/GymDiscoveryStage.vue", import.meta.url),
    "utf8",
  );
  assert.match(host, /publishListing/);
  assert.match(host, /cinemaPhoneSlot/);
  assert.match(host, /--gd-box-left/);
  assert.match(host, /discoveryAt\(progress\)\.floor < 0\.12/);
  assert.doesNotMatch(host, /mapVisible\.value = progress < GLOBE_FOCUS_PROGRESS/);
  const globe = readFileSync(
    new URL("../components/gym/GymGlobeStory.vue", import.meta.url),
    "utf8",
  );
  assert.match(globe, /gd-profile-island/);
  assert.doesNotMatch(globe, /gd-profile-stem/);
  assert.doesNotMatch(globe, /gd-profile-caret/);
  assert.doesNotMatch(globe, /:progress="progress"/);
  const css = readFileSync(
    new URL("../assets/css/gym-discovery.css", import.meta.url),
    "utf8",
  );
  assert.match(css, /--gd-box-left/);
  assert.match(css, /--gd-listing/);
  assert.match(css, /--gd-lift/);
  assert.match(css, /gd-profile-island/);
  assert.doesNotMatch(css, /gd-profile-stem/);
  assert.doesNotMatch(
    css,
    /\.gd-profile\.is-shown \{[\s\S]*transform: perspective/,
  );
});

test("blue marble land heuristic keeps continents and ice, drops ocean", () => {
  assert.equal(isLandPixel(66, 72, 38), true);
  assert.equal(isLandPixel(197, 173, 124), true);
  assert.equal(isLandPixel(237, 240, 237), true);
  assert.equal(isLandPixel(3, 5, 20), false);
  assert.equal(isLandPixel(10, 30, 50), false);
});

test("land discs face away from the globe center", () => {
  const dummy = new THREE.Object3D();
  const position = new THREE.Vector3(1.2, 0.9, -0.5)
    .normalize()
    .multiplyScalar(2.018);
  placeGlobeDot(dummy, position, 0.01);
  const z = new THREE.Vector3().setFromMatrixColumn(dummy.matrix, 2).normalize();
  assert.ok(z.dot(position.clone().normalize()) > 0.99);
});

test("globe reconstruction has two finite passes and a clean resting state", () => {
  assert.equal(globeAssemblyAt(0).assembly, 0);
  assert.equal(globeAssemblyAt(0).hologram, 0);
  assert.ok(globeAssemblyAt(0.65).hologram > 0.8);
  assert.equal(globeAssemblyAt(1.3).hologram, 0);
  assert.ok(globeAssemblyAt(1.95).hologram > 0.8);
  for (const time of [2.8, 3, 10, 1000]) {
    assert.equal(globeAssemblyAt(time).assembly, 1);
    assert.equal(globeAssemblyAt(time).hologram, 0);
    assert.equal(globeAssemblyAt(time).settled, true);
  }
});

test("after the globe settles, Bratislava blinks and a shockwave then arcs run", () => {
  assert.equal(globeNetworkAt(0).blink, 0);
  assert.equal(globeNetworkAt(0).wave, 0);
  assert.equal(globeNetworkAt(0).arcs, 0);
  assert.equal(globeNetworkAt(GLOBE_SETTLE_AT - 0.01).arcs, 0);
  assert.ok(globeNetworkAt(GLOBE_SETTLE_AT + 0.25).blink > 0.8);
  assert.ok(globeNetworkAt(GLOBE_SETTLE_AT + 1.4).wave > 1);
  assert.equal(globeNetworkAt(GLOBE_SETTLE_AT + 2).arcs, 1);
});

test("eight gyms hub from Bratislava with one arc per other city", () => {
  assert.equal(discoveryGyms.length, 8);
  assert.equal(discoveryHub.id, "bratislava-eurovea");
  assert.equal(discoveryHub.city, "Bratislava");
  assert.equal(discoveryGyms.filter((gym) => gym.hub).length, 1);
  assert.ok(discoveryGyms.every((gym) => gym.country === "Slovakia"));
  const arcs = discoveryGymArcs();
  assert.equal(arcs.length, 5);
  assert.ok(arcs.every((link) => link.from.id === "bratislava-eurovea"));
  assert.deepEqual(
    arcs.map((link) => link.to.city),
    ["Trenčín", "Banská Bystrica", "Spišská Nová Ves", "Košice", "Prešov"],
  );
  assert.equal(discoveryLocation.city, discoveryHub.city);
  const gymsSource = readFileSync(
    new URL("../utils/gymscan/discoveryGyms.ts", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(gymsSource, /365|Fit&Co/i);
  assert.deepEqual(
    discoveryGyms.map((gym) => [gym.id, gym.latitude, gym.longitude]),
    [
      ["bratislava-eurovea", 48.140371, 17.123888],
      ["bratislava-lamac", 48.176884, 17.065937],
      ["trencin", 48.874729, 18.045468],
      ["banska-bystrica", 48.713435, 19.136993],
      ["spisska-nova-ves", 48.947847, 20.549648],
      ["kosice-roca", 48.697428, 21.262861],
      ["kosice-hypertesco", 48.741347, 21.266033],
      ["presov", 48.988772, 21.262391],
    ],
  );
});

test("the floor is complete before overhead movement and ordering finishes in row order", () => {
  assert.equal(discoveryAt(0.61).floor, 1);
  assert.equal(discoveryAt(0.61).overhead, 0);
  assert.equal(discoveryAt(0.78).overhead, 1);
  assert.equal(discoveryAt(0.78).order, 0);
  assert.ok(equipmentOrderAt(0.88, 0) > equipmentOrderAt(0.88, 3));
  for (let index = 0; index < 4; index++)
    assert.equal(equipmentOrderAt(0.97, index), 1);
  assert.equal(discoveryAt(0).floor, 0);
  assert.equal(discoveryAt(0).order, 0);
});

test("floor machines hologram-scan in top row then bottom row", () => {
  assert.equal(discoveryMachineSpawnAt(0, 0).amount, 0);
  assert.equal(discoveryMachineSpawnAt(0, 3).amount, 0);
  assert.equal(discoverySpawnDone(0), false);
  const mid = DISCOVERY_SPAWN_DURATION * 0.85;
  assert.ok(discoveryMachineSpawnAt(mid, 0).amount > 0.9, "far-left machine is already up");
  assert.ok(
    discoveryMachineSpawnAt(mid, 0).amount > discoveryMachineSpawnAt(mid, 2).amount,
    "top row must lead the bottom row",
  );
  assert.ok(discoveryMachineSpawnAt(mid, 2).amount < 0.5, "near machines are still scanning");
  assert.equal(discoverySpawnDone(mid), false);
  const doneAt =
    (discoveryEquipment.length - 1) * DISCOVERY_SPAWN_STAGGER + DISCOVERY_SPAWN_DURATION;
  assert.equal(discoveryMachineSpawnAt(doneAt, 3).amount, 1);
  assert.equal(discoverySpawnDone(doneAt), true);
  const stage = readFileSync(
    new URL("../utils/gymscan/discoveryStage.ts", import.meta.url),
    "utf8",
  );
  assert.match(stage, /discoveryMachineSpawnAt/);
  assert.match(stage, /reveals\[index\]/);
  assert.doesNotMatch(stage, /scan\.value = frame\.floor/);
  const host = readFileSync(
    new URL("../components/gym/GymDiscoveryStage.vue", import.meta.url),
    "utf8",
  );
  assert.match(host, /spawning/);
});

test("morph mix stays at 0 until the rectangular floor is fully overhead", () => {
  for (const progress of [0, 0.22, 0.43, 0.5, 0.61]) {
    const frame = discoveryAt(progress);
    assert.equal(frame.morph, 0);
    assert.ok(
      frame.floor < 1 || frame.overhead === 0,
      `progress ${progress} should still be before a finished overhead floor`,
    );
  }
  assert.ok(discoveryAt(0.5).floor < 1);
  assert.equal(discoveryAt(0.5).morph, 0);
  assert.equal(discoveryAt(0.61).overhead, 0);
  assert.equal(discoveryAt(0.61).morph, 0);
  assert.equal(discoveryAt(0.77).overhead, 1);
  assert.equal(discoveryAt(0.77).morph, 0);
  assert.equal(discoveryAt(DISCOVERY_MORPH_START).morph, 0);
});

test("after overhead is 1, morph mix increases and reaches 1", () => {
  assert.equal(discoveryAt(0.78).overhead, 1);
  assert.equal(discoveryAt(0.78).morph, 0);
  const mid = discoveryAt(0.85);
  assert.equal(mid.overhead, 1);
  assert.ok(mid.morph > 0 && mid.morph < 1, `expected a rising morph, got ${mid.morph}`);
  assert.ok(discoveryAt(0.9).morph > mid.morph);
  assert.equal(discoveryAt(0.96).morph, 1);
  assert.equal(discoveryAt(1).morph, 1);
});

test("floor contracts directly to the screen-up phone with overlapping motion", () => {
  const middle = discoveryMorphBeats(0.6);
  assert.ok(middle.shape > 0.9);
  assert.ok(middle.device > 0 && middle.screen > 0);
  assert.ok(middle.layout > 0.5);
  assert.equal(DISCOVERY_PHONE_ROT_X, -Math.PI / 2);
  assert.equal(discoveryCornerRadius(0), 0);
  assert.ok(Math.abs(discoveryCornerRadius(1) - PHONE_R * DISCOVERY_PHONE_SCALE) < 1e-9);
  let previous = discoveryMorphBeats(0);
  for (let step = 1; step <= 100; step++) {
    const next = discoveryMorphBeats(step / 100);
    for (const key of ["shape", "device", "screen", "layout"] as const) {
      assert.ok(next[key] >= previous[key] && next[key] <= 1);
      assert.ok(next[key] - previous[key] < 0.05, `${key} should remain continuous`);
    }
    previous = next;
  }
  assert.deepEqual(previous, { shape: 1, device: 1, screen: 1, layout: 1 });
});

test("at morph=1 the destination rectangle uses the shared phone 3D aspect", () => {
  const floor = discoveryFloorRect();
  const body = discoveryPhoneBodyRect();
  const screen = discoveryPhoneScreenRect();
  const start = discoveryMorphRect(0);
  const end = discoveryMorphRect(1);
  assert.deepEqual(start, floor);
  assert.deepEqual(end, body);
  assert.equal(floor.w, DISCOVERY_FLOOR_W);
  assert.equal(floor.d, DISCOVERY_FLOOR_D);
  assert.ok(Math.abs(body.w / body.d - PHONE_W / PHONE_H) < 1e-9);
  assert.ok(Math.abs(screen.w / screen.d - PHONE_SCR_W / PHONE_SCR_H) < 1e-9);
  assert.ok(
    Math.abs(floor.w / floor.d - PHONE_W / PHONE_H) > 0.2,
    "the floor tile field must not already be the phone aspect",
  );
  assert.ok(Math.abs(end.w / end.d - floor.w / floor.d) > 0.2);
});

test("each tile row seam lands exactly on its machine-list divider before the screen reveals", () => {
  for (let index = 0; index < discoveryEquipment.length - 1; index++) {
    const start = discoveryFloorSeamAt(0, index);
    assert.equal(start.y * DISCOVERY_PHONE_SCALE, DISCOVERY_FLOOR_D / 2 - (index + 1) * DISCOVERY_TILE);
    const row = discoveryAppRow(index);
    const divider = discoveryAppDivider(index);
    assert.equal(divider.y, row.y - row.rowH / 2);
    assert.ok(Math.abs(divider.thickness / PHONE_SCR_H * 1520 - 1) < 1e-12);
    for (const morph of [0.52, 0.54, 0.7, 1])
      assert.deepEqual(discoveryFloorSeamAt(morph, index), divider);
  }
  for (let step = 0; step <= 100; step++) {
    const morph = step / 100;
    const rect = discoveryMorphRect(morph);
    const seams = [0, 1, 2].map(index => discoveryFloorSeamAt(morph, index));
    assert.ok(seams[0]!.y > seams[1]!.y && seams[1]!.y > seams[2]!.y, "rows must never cross");
    for (const seam of seams) {
      assert.ok(seam.halfWidth * DISCOVERY_PHONE_SCALE <= rect.w / 2 + 1e-9);
      assert.ok(Math.abs(seam.y * DISCOVERY_PHONE_SCALE) < rect.d / 2);
    }
  }
});

test("notch enters independently as the app appears and settles without overshoot", () => {
  assert.deepEqual(discoveryIslandAt(0), { opacity: 0, scale: 0.88 });
  assert.equal(discoveryIslandAt(0.62).opacity, 0);
  assert.deepEqual(discoveryIslandAt(1), { opacity: 1, scale: 1 });
  let previous = discoveryIslandAt(0);
  for (let step = 1; step <= 100; step++) {
    const current = discoveryIslandAt(step / 100);
    assert.ok(current.opacity >= previous.opacity && current.opacity <= 1);
    assert.ok(current.scale >= previous.scale && current.scale <= 1);
    previous = current;
  }
});

test("at morph=1 machines sit in named in-app rows as thumbnails, inside the phone screen", () => {
  const screen = discoveryPhoneScreenRect();
  const halfW = screen.w / 2;
  const halfD = screen.d / 2;
  const poses = discoveryEquipment.map((item, index) => {
    const start = discoveryMachinePoseAt(0.78, index);
    assert.equal(start.x, item.x);
    assert.equal(start.z, item.z);
    assert.equal(start.rotX, 0);
    const pose = discoveryMachinePoseAt(1, index);
    const radius = item.span * pose.scale * 0.5;
    assert.ok(
      Math.abs(pose.x) + radius <= halfW + 1e-9,
      `machine ${item.id} x ${pose.x} ± ${radius} leaves screen width ${halfW}`,
    );
    assert.ok(
      Math.abs(pose.z) + radius <= halfD + 1e-9,
      `machine ${item.id} z ${pose.z} ± ${radius} leaves screen depth ${halfD}`,
    );
    assert.ok(
      Math.abs(pose.rotX - DISCOVERY_THUMB_ROT_X) < 1e-9,
      `machine ${item.id} should rotate into a thumbnail, got rotX ${pose.rotX}`,
    );
    return pose;
  });
  const xs = poses.map((pose) => pose.x);
  assert.ok(
    Math.max(...xs) - Math.min(...xs) < screen.w * 0.12,
    "thumbnails share one column, not the floor corners",
  );
  for (let i = 1; i < poses.length; i++)
    assert.ok(poses[i]!.z > poses[i - 1]!.z, "rows stack top-to-bottom on the phone screen");
  const row0 = discoveryAppRow(0);
  const row1 = discoveryAppRow(1);
  assert.ok(row0.y > row1.y);
  assert.ok(row0.x < 0);
});

test("in-app machine numbers sit on the area line, right of each thumbnail", () => {
  const halfW = PHONE_SCR_W / 2;
  const halfH = PHONE_SCR_H / 2;
  for (let index = 0; index < discoveryEquipment.length; index++) {
    const row = discoveryAppRow(index);
    const number = discoveryAppNumber(index);
    assert.ok(number.x > row.x + row.thumb / 2, "index sits in the text column");
    assert.ok(number.areaX > number.x, "STRENGTH follows 01");
    assert.ok(number.y > row.y, "area line is toward the island");
    assert.ok(Math.abs(number.x) < halfW);
    assert.ok(Math.abs(number.y) < halfH);
    const world = discoveryAppNumberWorld(index);
    assert.ok(world.y > 0);
    assert.ok(world.h > 0);
  }
  assert.ok(discoveryAppNumber(0).y > discoveryAppNumber(1).y);
});

test("floor 01-04 badges travel into the in-app numbers instead of fading on morph", () => {
  const start = DISCOVERY_MORPH_START;
  const appearing = discoveryLabelAt(0.7, 0);
  assert.equal(appearing.travel, 0);
  assert.ok(appearing.alpha > 0.9, "badges are fully on the machines before the morph");
  const earlyMorph = discoveryLabelAt(start + 0.02, 0);
  assert.ok(
    earlyMorph.alpha > 0.9,
    "badges must not fade as soon as the floor starts becoming a phone",
  );
  const mid = discoveryLabelAt(0.88, 0);
  assert.ok(mid.travel > 0 && mid.travel < 1);
  assert.ok(mid.alpha > 0.5, "badges stay visible while they fly into the list");
  assert.ok(discoveryLabelAt(0.88, 0).travel > discoveryLabelAt(0.88, 3).travel);
  assert.equal(discoveryLabelAt(1, 0).travel, 1);
  assert.equal(discoveryLabelAt(1, 0).mix, 1);
  assert.equal(discoveryLabelAt(1, 0).alpha, 0, "canvas numbers take over once they land");
  assert.equal(discoveryLabelsLanded(start), false);
  assert.equal(discoveryLabelsLanded(1), true);
  const stage = readFileSync(
    new URL("../utils/gymscan/discoveryStage.ts", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(stage, /frame\.morph \/ 0\.24/);
  assert.match(stage, /discoveryLabelAt/);
  assert.match(stage, /discoveryAppNumberWorld/);
  assert.match(stage, /discoveryLabelsLanded/);
});

test("Your gym sits on the floor then moves into the in-app title", () => {
  const start = DISCOVERY_MORPH_START;
  const onFloor = discoveryTitleAt(0.7);
  assert.equal(onFloor.travel, 0);
  assert.ok(onFloor.alpha > 0.9, "caption is on the tiles before the morph");
  const floorPose = discoveryTitlePoseAt(0.7);
  assert.equal(floorPose.x, DISCOVERY_TITLE_FLOOR.x);
  assert.equal(floorPose.z, DISCOVERY_TITLE_FLOOR.z);
  assert.ok(floorPose.x < -1.8 && floorPose.z < -2, "caption sits in the top-left tiles");
  assert.ok(
    Math.abs(floorPose.w / floorPose.d - DISCOVERY_APP_TITLE.boxW / DISCOVERY_APP_TITLE.boxH) < 1e-9,
    "floor caption keeps the in-app title aspect so the quad does not shear",
  );
  const earlyMorph = discoveryTitleAt(start + 0.02);
  assert.ok(earlyMorph.alpha > 0.9, "caption must not fade as soon as the floor becomes a phone");
  const mid = discoveryTitleAt(0.88);
  assert.ok(mid.travel > 0 && mid.travel < 1);
  assert.ok(mid.alpha > 0.5, "caption stays visible while it moves into the header");
  const end = discoveryTitlePoseAt(1);
  const screen = discoveryTitleScreenWorld();
  assert.ok(Math.abs(end.x - screen.x) < 1e-9);
  assert.ok(Math.abs(end.z - screen.z) < 1e-9);
  assert.ok(Math.abs(end.w - screen.w) < 1e-9);
  assert.equal(discoveryTitleAt(1).travel, 1);
  assert.equal(discoveryTitleAt(1).alpha, 0, "canvas title takes over once it lands");
  assert.equal(discoveryTitleLanded(start), false);
  assert.equal(discoveryTitleLanded(1), true);
  const stage = readFileSync(
    new URL("../utils/gymscan/discoveryStage.ts", import.meta.url),
    "utf8",
  );
  const title = readFileSync(
    new URL("../utils/gymscan/discoveryTitle.ts", import.meta.url),
    "utf8",
  );
  const appScreen = readFileSync(
    new URL("../utils/gymscan/discoveryAppScreen.ts", import.meta.url),
    "utf8",
  );
  assert.match(stage, /createDiscoveryTitle/);
  assert.match(stage, /discoveryTitleLanded/);
  assert.match(stage, /title: landedTitle/);
  assert.match(title, /floor-title-your-gym/);
  assert.doesNotMatch(title, /chalk|uWrite|uMix/);
  assert.match(appScreen, /options\.title/);
  assert.match(appScreen, /DISCOVERY_APP_TITLE/);
});

test("the morph camera stays overhead looking down at the floor and phone", () => {
  for (const progress of [0.78, 0.85, 1]) {
    for (const compact of [false, true]) {
      const pose = discoveryCameraPose(progress, compact, 1440, 900);
      const dx = pose.lookX - pose.x;
      const dy = pose.lookY - pose.y;
      const dz = pose.lookZ - pose.z;
      const len = Math.hypot(dx, dy, dz);
      assert.ok(len > 0);
      assert.ok(
        dy / len < -0.95,
        `progress ${progress} compact=${compact} should look down, got ${dy / len}`,
      );
      assert.ok(Math.abs(dx / len) < 0.15);
      assert.ok(Math.abs(dz / len) < 0.15);
      assert.ok(pose.y > 8, "overhead height must stay above the floor/phone");
    }
  }
});

test("discovery phone tilt uses the same hero pointer gains", () => {
  const tilt = heroPointerTilt(1, -1);
  assert.equal(tilt.rotY, HERO_PHONE_TILT_Y);
  assert.equal(tilt.rotX, -HERO_PHONE_TILT_X);
  const lean = overheadPointerTilt(1, -1);
  assert.equal(lean.rotX, tilt.rotX);
  assert.equal(lean.rotZ, -tilt.rotY);
});

test("the numbered inventory and its optimized models remain paired within budget", () => {
  const base = new URL("../public", import.meta.url);
  let bytes = 0,
    triangles = 0,
    primitives = 0;
  assert.equal(discoveryEquipment.length, 4);
  discoveryEquipment.forEach((item, index) => {
    assert.equal(item.number, String(index + 1).padStart(2, "0"));
    const data = readFileSync(new URL("." + item.model, base.href + "/"));
    assert.equal(data.toString("ascii", 0, 4), "glTF");
    const gltf = JSON.parse(
      data.subarray(20, 20 + data.readUInt32LE(12)).toString(),
    );
    for (const mesh of gltf.meshes)
      for (const primitive of mesh.primitives) {
        primitives++;
        triangles += gltf.accessors[primitive.indices].count / 3;
      }
    bytes += data.length;
    assert.ok(statSync(new URL("." + item.poster, base.href + "/")).size > 0);
  });
  assert.ok(bytes < 1_300_000, `Deferred models exceed 1.3 MB: ${bytes}`);
  assert.ok(triangles <= 54_000, `Triangle budget exceeded: ${triangles}`);
  assert.ok(primitives <= 24, `Draw-call budget exceeded: ${primitives}`);
  assert.equal(discoveryLocation.city, "Bratislava");
  assert.ok(discoveryLocation.latitude > 48 && discoveryLocation.latitude < 49);
  assert.ok(
    discoveryLocation.longitude > 17 && discoveryLocation.longitude < 18,
  );
});

test("the discovery stage morphs a phone-curved stand-in, then the shared 3D phone, and lists machines in-app", () => {
  const stage = readFileSync(
    new URL("../utils/gymscan/discoveryStage.ts", import.meta.url),
    "utf8",
  );
  assert.match(stage, /createPhoneModel/);
  assert.match(stage, /discoveryCornerRadius/);
  assert.match(stage, /discoveryMorphBeats/);
  assert.match(stage, /overheadPointerTilt/);
  assert.match(stage, /pointerTowardBox/);
  assert.match(stage, /tilt\.rotation\.set\(tiltX, 0, tiltZ\)/);
  assert.match(stage, /drawDiscoveryAppScreen/);
  assert.match(stage, /JetBrains Mono/);
  assert.match(stage, /uRadius/);
  assert.match(stage, /DISCOVERY_PHONE_ROT_X/);
  assert.match(stage, /createFloorMaps/);
  assert.doesNotMatch(stage, /TIRE|discoveryTire|discoveryBump|const bump/);
  assert.match(stage, /camera\.up\.set\(0, 1 - frame\.overhead, -frame\.overhead\)/);
  assert.match(stage, /tilt\.add\(rig\)/);
  assert.match(stage, /globePullbackAltitude/);
  assert.match(stage, /0\.02, 80/);
  const story = readFileSync(
    new URL("../components/gym/GymGlobeStory.vue", import.meta.url),
    "utf8",
  );
  assert.match(story, /In the app/);
  assert.match(story, /Every gym/);
  assert.match(story, /One place/);
  assert.match(story, /Eight gyms across Slovakia/);
  assert.doesNotMatch(story, /365|Fit&Co/);
  assert.match(story, /v-if="simple"/);
  const globe = readFileSync(
    new URL("../utils/gymscan/discoveryGlobe.ts", import.meta.url),
    "utf8",
  );
  assert.match(globe, /InstancedMesh/);
  assert.match(globe, /CubicBezierCurve3/);
  assert.match(globe, /sampleLandDots/);
  assert.match(globe, /LAND_LAT_STEP/);
  assert.match(globe, /placeGlobeDot/);
  assert.match(globe, /position\.x \* 2/);
  assert.match(globe, /MeshBasicMaterial/);
  assert.match(globe, /b \/ \(sum \+ 1\) > 0\.38/);
  assert.doesNotMatch(globe, /lookAt\(0, 0, 0\)/);
  assert.doesNotMatch(globe, /material\.map/);
  assert.doesNotMatch(globe, /MeshPhongMaterial/);
  assert.doesNotMatch(globe, /MeshStandardMaterial/);
  const css = readFileSync(
    new URL("../assets/css/gym-discovery.css", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(css, /earth\.webp/);
  assert.match(css, /--gd-reveal/);
  assert.match(
    css,
    /opacity:\s*clamp\(0,\s*calc\(var\(--gd-reveal, 0\) \* 3\.5\), 1\)/,
  );
  assert.match(
    css,
    /oklch\(12% 0\.012 151 \/ var\(--gx-earth-out, 0\)\)/,
  );
  assert.match(
    css,
    /oklch\(19% 0\.026 151 \/ var\(--gd-reveal, 0\)\)/,
  );
  assert.match(css, /--gd-label-mix/);
  const experienceCss = readFileSync(
    new URL("../assets/css/gym-experience.css", import.meta.url),
    "utf8",
  );
  assert.match(experienceCss, /--gx-earth-scale/);
  assert.match(
    experienceCss,
    /is-ready\.is-discovery canvas/,
  );
  assert.match(
    experienceCss,
    /opacity:\s*clamp\(0,\s*calc\(1 - var\(--gx-earth-out, 0\) \* 8\), 1\)/,
  );
  assert.doesNotMatch(
    experienceCss,
    /\.gx-cinema\.is-discovery \{[^}]*transform:\s*scale/,
  );
  assert.doesNotMatch(
    experienceCss,
    /--gx-earth-out, 0\) \* var\(--gx-earth-out/,
  );
  assert.doesNotMatch(
    experienceCss,
    /is-member canvas, \.gx-cinema\.is-discovery canvas/,
  );
  assert.match(stage, /globe\.applyLand/);
  assert.match(stage, /Promise\.all/);
  const host = readFileSync(
    new URL("../components/gym/GymDiscoveryStage.vue", import.meta.url),
    "utf8",
  );
  assert.match(host, /useSharedMouse/);
  assert.match(host, /onMouseEvent/);
  assert.match(host, /clientX/);
  assert.match(host, /8 gyms in Slovakia/);
  assert.match(host, /v-if="reduced"/);
  assert.doesNotMatch(host, /!ready \|\| reduced/);
  assert.doesNotMatch(host, /365|Fit&Co/);
  assert.match(host, /globePriorScale/);
  assert.match(host, /--gx-earth-scale/);
  assert.match(host, /--gd-label-mix/);
  const appScreen = readFileSync(
    new URL("../utils/gymscan/discoveryAppScreen.ts", import.meta.url),
    "utf8",
  );
  assert.match(appScreen, /options\.numbers/);
  assert.match(appScreen, /options\.title/);
  assert.match(appScreen, /item\.number/);
  assert.match(appScreen, /JetBrains Mono/);
});
