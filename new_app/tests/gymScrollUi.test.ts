import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path: string) =>
  readFileSync(new URL(path, import.meta.url), "utf8");

test("gym demo copy does not bind the per-frame film in Vue templates", () => {
  const experience = read("../components/gym/GymExperience.vue");
  assert.doesNotMatch(experience, /:journey="current"/);
  assert.doesNotMatch(experience, /current\.chapter/);
  assert.match(experience, /provide\(gymJourneyKey/);
  assert.match(experience, /v-show="chapter !== 'kit'"/);
  assert.match(experience, /class="gx-chapters"[\s\S]*<HoloPill \/>/);
  assert.match(experience, /arriving = shallowRef\(!arrivalSeen\.value\)/);
  assert.match(
    experience,
    /<GymArrival[\s\S]*?<GymNav/,
    "boot overlay must be the first painted child so it can cover nav and copy",
  );

  // The member chapter keeps per-frame progress off Vue: the beat is one
  // discrete ref, and rails and fills are custom properties written directly.
  const member = read("../components/gym/GymMemberStory.vue");
  assert.match(member, /`is-beat-\$\{beat\}`/);
  assert.match(member, /style\.setProperty\(`--gm-fill-\$\{i\}`/);
  assert.doesNotMatch(member, /:style="\{[^"]*progress/);
  const dashboard = read("../components/gym/GymDashboardStory.vue");
  assert.match(dashboard, /style\.setProperty\(`--gdb-fill-\$\{i\}`/);
  assert.match(dashboard, /setProperty\('--gdb-rise'/);
  const coachingStage = read("../utils/gymscan/coachingStage.ts");
  assert.doesNotMatch(coachingStage, /LineSegments/);
  assert.doesNotMatch(coachingStage, /expandedScale/);
  assert.doesNotMatch(coachingStage, /YOUR VIDEO HERE/);
  assert.match(coachingStage, /phoneScreenHeaderGeometry/);
  assert.match(coachingStage, /coachingWipeTravel/);
  assert.doesNotMatch(coachingStage, /PlaneGeometry/);

  // Beat readouts crossfade in place instead of remounting their copy.
  assert.match(member, /class="gm-readout" :class="\{ 'is-on': reduced \|\| beat === 0 \}"/);
  assert.doesNotMatch(member, /GymHeroEntry/);
  assert.match(read("../assets/css/gym-member.css"), /\.gm-readout\.is-on \{/);
});

test("phone sticky copy does not live-filter glyphs during the pin", () => {
  const css = read("../assets/css/gym-experience.css");
  assert.match(
    css,
    /@media \(max-width: 760px\)[\s\S]*is-copy-blur[\s\S]*filter:\s*none/,
  );
  const chapters = css.match(/\.gx-chapters \{[\s\S]*?\}/);
  assert.ok(chapters);
  assert.doesNotMatch(chapters[0], /translateX\(-50%\)/);
});

test("tag and member panes share the cinema's top:0 / 100svh box on a phone", () => {
  const experience = read("../assets/css/gym-experience.css");
  assert.match(
    experience,
    /\.gx-install__copy \{[\s\S]*top: 0;[\s\S]*height: 100svh;/,
  );
  // The DOM phone takes the parked device over on the cinema's own pixels, so
  // its pane has to be exactly the sticky box `.gx-cinema` renders into.
  const cinema = experience.match(/\.gx-cinema \{[\s\S]*?\}/);
  assert.ok(cinema);
  assert.match(cinema[0], /top: 0;[\s\S]*height: 100svh;[\s\S]*min-height: 480px;/);
  const member = read("../assets/css/gym-member.css");
  const pane = member.match(/\.gm-pane \{[\s\S]*?\n\}/);
  assert.ok(pane);
  assert.match(pane[0], /position: sticky;\s*top: 0;\s*height: 100svh;\s*min-height: 480px;/);
  assert.match(pane[0], /overflow: clip;/);
  assert.match(
    member,
    /@media \(max-width: 760px\)[\s\S]*\.gm\.is-pinned \{[\s\S]*overflow-x: visible !important;/,
  );
  const hero = read("../components/gym/GymHeroEntry.vue");
  assert.match(hero, /is-mesh-playing \.gx-hero-entry__mesh/);
  assert.match(hero, /is-static:not\(\.is-reduced\) \.gx-hero-entry__content/);
});

test("gym arrival overlay is in the first HTML and sits above the nav", () => {
  const arrival = read("../components/gym/GymArrival.vue");
  assert.match(arrival, /visible = shallowRef\(!seen\.value\)/);
  assert.match(arrival, /GYM_ARRIVAL_OVERLAY_ID/);
  assert.match(arrival, /z-index: 80;/);
  assert.match(arrival, /<ClientOnly>\s*<GymLogoEntry \/>/);
  assert.doesNotMatch(arrival, /visible = shallowRef\(false\)/);

  const css = read("../assets/css/gym-experience.css");
  const nav = css.match(/\.gx-nav-root \{[\s\S]*?\}/);
  assert.ok(nav);
  assert.match(nav[0], /z-index: 60;/);
  assert.match(css, /\.gx\.is-arriving \.gx-nav-root \{[\s\S]*z-index: 30;/);
  assert.match(css, /\.gx\.is-arriving \.gx-chapters/);
  assert.match(css, /\.gx\.is-arriving \.gx-opening/);
});
