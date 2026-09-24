import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  MEMBER_PHONE_SHAPE,
  memberPhonePerspective,
  memberPhoneSlot,
  memberPhoneTransform,
} from "../utils/gymscan/memberPhone.ts";
import {
  MEMBER_BEAT_EDGES,
  memberBeatAt,
  memberBeatFill,
  memberBeatTarget,
  memberProgress,
} from "../utils/gymscan/memberStory.ts";
import {
  DASHBOARD_TOUR_CHAPTERS,
  DASHBOARD_TOUR_EDGES,
  dashboardChapterAt,
  dashboardChapterFill,
  dashboardTourWrap,
} from "../utils/gymscan/dashboardTour.ts";
import { gymJourneyAt } from "../utils/gymscan/journey.ts";
import { PHONE_CAM_FOV, PHONE_H, PHONE_W } from "../utils/phoneModel.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("the film parks its phone on the member pane's own slot", () => {
  const cinema = read("../components/gym/GymCinema.vue");
  assert.match(cinema, /stage\.setHeroSlot\(memberPhoneSlot\(width, height\)\)/);
  assert.match(cinema, /parkAfterScan: true/);
  assert.doesNotMatch(cinema, /readCoaching/);
  const member = read("../components/gym/GymMemberStory.vue");
  assert.match(member, /slot = memberPhoneSlot\(width, height\)/);
  // The DOM phone only takes over once the parked glass shows what it shows.
  assert.match(member, /settled\.value \|\| !props\.enhanced \|\| next > 0/);
});

test("the member slot keeps the mesh's proportions on every layout", () => {
  for (const [w, h] of [[1440, 900], [1920, 1080], [1024, 768], [1180, 820], [390, 844], [375, 667]]) {
    const slot = memberPhoneSlot(w, h);
    assert.ok(Math.abs(slot.w / slot.h - PHONE_W / PHONE_H) < 1e-9, `${w}x${h} aspect`);
    assert.ok(slot.x >= 0 && slot.x + slot.w <= w, `${w}x${h} fits horizontally`);
    assert.ok(slot.y >= 0 && slot.y + slot.h <= h, `${w}x${h} fits vertically`);
  }
  const desk = memberPhoneSlot(1440, 900);
  assert.equal(desk.h, 684);
  assert.ok(desk.x > 1440 * 0.4, "desktop phone leaves the copy column free");
  const phone = memberPhoneSlot(390, 844);
  assert.ok(Math.abs(phone.x + phone.w / 2 - 195) < 1e-9, "phone layout centres the device");
  assert.ok(phone.y >= 76, "compact device clears the nav");
});

test("the DOM phone reproduces the overlay camera and rest pose", () => {
  // 30° vertical FOV over a 900 px pane → the camera sits ~1679 px away.
  assert.ok(Math.abs(memberPhonePerspective(900) - 450 / Math.tan((PHONE_CAM_FOV * Math.PI) / 360)) < 1e-9);
  assert.ok(Math.abs(memberPhonePerspective(900) - 1679.4) < 0.1);
  // Three is y-up and CSS y-down: X flips, Y does not.
  assert.equal(memberPhoneTransform(0.08, -0.12), "rotateX(-0.0800rad) rotateY(-0.1200rad)");
  assert.ok(MEMBER_PHONE_SHAPE.islandTop > 0 && MEMBER_PHONE_SHAPE.islandTop < 0.05);
  assert.ok(Math.abs(MEMBER_PHONE_SHAPE.radius - 0.14 / 0.95) < 1e-9);
  const css = read("../assets/css/gym-member.css");
  // coverFitScreenUVs crops a tall capture from the bottom: top-aligned glass.
  assert.match(css, /\.gm-phone__ui \{[\s\S]*?top: 0;[\s\S]*?aspect-ratio: 620 \/ 1344;/);
  // The glass sits PHONE_SCREEN_Z (0.053) in front of the body centre.
  assert.match(css, /translateZ\(calc\(var\(--gm-h\) \* 0\.02718\)\)/);
  assert.ok(Math.abs((0.04 + 0.013) / PHONE_H - 0.02718) < 1e-4);
});

test("member beats tile the pinned range and land inside their own band", () => {
  assert.deepEqual([...MEMBER_BEAT_EDGES], [0, 0.3, 0.62, 1]);
  assert.equal(memberBeatAt(-1), 0);
  assert.equal(memberBeatAt(0.29), 0);
  assert.equal(memberBeatAt(0.3), 1);
  assert.equal(memberBeatAt(0.61), 1);
  assert.equal(memberBeatAt(0.62), 2);
  assert.equal(memberBeatAt(2), 2);
  for (const beat of [0, 1, 2]) {
    assert.equal(memberBeatAt(memberBeatTarget(beat)), beat, `beat ${beat} link lands in its band`);
  }
  assert.equal(memberBeatFill(0.15, 0), 0.5);
  assert.equal(memberBeatFill(0.15, 1), 0);
  assert.equal(memberBeatFill(1, 2), 1);
  assert.equal(memberProgress(0, 3000, 900), 0);
  assert.equal(memberProgress(-2100, 3000, 900), 1);
  assert.equal(memberProgress(-1050, 3000, 900), 0.5);
});

test("dashboard chapters follow the recording and loop past the sign-in", () => {
  assert.equal(DASHBOARD_TOUR_CHAPTERS, 4);
  assert.equal(dashboardChapterAt(0), 0);
  assert.equal(dashboardChapterAt(8.9), 0);
  assert.equal(dashboardChapterAt(9), 1);
  assert.equal(dashboardChapterAt(20), 2);
  assert.equal(dashboardChapterAt(45), 3);
  assert.equal(dashboardChapterFill(5.5, 0), 0.5);
  assert.equal(dashboardChapterFill(5.5, 1), 0);
  assert.equal(dashboardTourWrap(0.4), DASHBOARD_TOUR_EDGES[0]);
  assert.equal(dashboardTourWrap(48.9), DASHBOARD_TOUR_EDGES[0]);
  assert.equal(dashboardTourWrap(12), null);
});

test("the dashboard follows the map and yields to the kit in either direction", () => {
  const at = (scroll: number) => gymJourneyAt(scroll, 900, 3600, 5490, 12000, 8000, 10000);
  assert.equal(at(7904).chapter, "discover");
  assert.equal(at(9904).chapter, "dashboard");
  assert.equal(at(9903).chapter, "discover");
  assert.equal(at(11904).chapter, "kit");
  assert.equal(at(11903).chapter, "dashboard");
});

test("owner chapters play real footage and never invent a trainer", () => {
  const member = read("../components/gym/GymMemberStory.vue");
  assert.match(member, /legPressInstruction\.slug/);
  assert.match(member, /src="\/assets\/gym3d\/log-set\.webp"/);
  const trainer = read("../components/gym/GymTrainerStory.vue");
  assert.match(trainer, /legPressInstruction\.slug/);
  // The trainer's side is a viewfinder or the visitor's own local clip.
  assert.match(trainer, /v-if="customSrc"/);
  assert.match(trainer, /class="gt-finder"/);
  const dashboard = read("../components/gym/GymDashboardStory.vue");
  assert.match(dashboard, /macbook-dashboard\.av1\.mp4/);
  assert.match(dashboard, /macbook-dashboard\.mp4/);
  const map = read("../components/gym/GymMapStory.vue");
  assert.match(map, /t\('map\.note'\)/);
});
