import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync, statSync } from "node:fs";
import {
  DISCOVERY_FLOOR_D,
  DISCOVERY_FLOOR_W,
  DISCOVERY_MORPH_START,
  DISCOVERY_PHONE_SCALE,
  DISCOVERY_PHONE_ROT_X,
  DISCOVERY_THUMB_ROT_X,
  DISCOVERY_TILE,
  discoveryAppDivider,
  discoveryAppRow,
  discoveryAt,
  discoveryCameraPose,
  discoveryCornerRadius,
  discoveryFloorRect,
  discoveryFloorSeamAt,
  discoveryIslandAt,
  discoveryMachinePoseAt,
  discoveryMorphBeats,
  discoveryMorphRect,
  discoveryPhoneBodyRect,
  discoveryPhoneScreenRect,
  globeAssemblyAt,
  globeNetworkAt,
  globeJourneyAt,
  GLOBE_SETTLE_AT,
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
import { heroPointerTilt, HERO_PHONE_TILT_X, HERO_PHONE_TILT_Y } from "../utils/gymscan/handoff.ts";
import * as THREE from "three";
import {
  isLandPixel,
  placeGlobeDot,
} from "../utils/gymscan/discoveryGlobe.ts";
import { discoveryMapLocations } from "../utils/gymscan/discoveryMapLocations.ts";

test("the world holds before an automatic Slovakia approach, then labels settle", () => {
  assert.deepEqual(globeJourneyAt(0), { focus: 0, labels: 0 });
  assert.deepEqual(globeJourneyAt(3.6), { focus: 0, labels: 0 });
  assert.ok(globeJourneyAt(5.7).focus > 0.4);
  assert.equal(globeJourneyAt(5.7).labels, 0);
  assert.deepEqual(globeJourneyAt(8), { focus: 1, labels: 1 });
  assert.equal(globeJourneyAt(8, 0.27).labels, 0);
  assert.equal(globeJourneyAt(1, 0.2).focus, 1, "scrolling can advance the approach");
  let previous = 0;
  for (let step = 0; step <= 1000; step++) {
    const { focus } = globeJourneyAt(step / 100);
    assert.ok(focus >= previous && focus <= 1);
    assert.ok(focus - previous < 0.01, "camera movement must stay continuous");
    previous = focus;
  }
});

test("regional labels preserve every gym without stacking three Prague labels", () => {
  assert.equal(discoveryMapLocations.reduce((sum, place) => sum + place.count, 0), discoveryGyms.length);
  assert.equal(discoveryMapLocations.find(place => place.city === "Praha")?.count, 3);
  assert.deepEqual(discoveryMapLocations.filter(place => place.country === "Slovakia").map(place => place.city), ["Bratislava", "Košice"]);
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

test("eight registered gyms hub from Bratislava with one arc each", () => {
  assert.equal(discoveryGyms.length, 8);
  assert.equal(discoveryHub.city, "Bratislava");
  assert.equal(discoveryGyms.filter((gym) => gym.hub).length, 1);
  const arcs = discoveryGymArcs();
  assert.equal(arcs.length, 7);
  assert.ok(arcs.every((link) => link.from.id === "bratislava"));
  assert.equal(discoveryLocation.city, discoveryHub.city);
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
  assert.match(stage, /heroPointerTilt/);
  assert.match(stage, /drawDiscoveryAppScreen/);
  assert.match(stage, /uRadius/);
  assert.match(stage, /DISCOVERY_PHONE_ROT_X/);
  assert.match(stage, /createFloorMaps/);
  assert.doesNotMatch(stage, /TIRE|discoveryTire|discoveryBump|const bump/);
  assert.match(stage, /camera\.up\.set\(0, 1 - frame\.overhead, -frame\.overhead\)/);
  assert.match(stage, /tilt\.add\(rig\)/);
  const story = readFileSync(
    new URL("../components/gym/GymGlobeStory.vue", import.meta.url),
    "utf8",
  );
  assert.match(story, /In the app/);
  assert.match(story, /Every gym/);
  assert.match(story, /One place/);
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
  assert.match(stage, /globe\.applyLand/);
  assert.match(stage, /Promise\.all/);
  const host = readFileSync(
    new URL("../components/gym/GymDiscoveryStage.vue", import.meta.url),
    "utf8",
  );
  assert.match(host, /useSharedMouse/);
});
