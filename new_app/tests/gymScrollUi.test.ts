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

  const coaching = read("../components/gym/GymCoachingStory.vue");
  assert.doesNotMatch(coaching, /progressStyle/);
  assert.match(coaching, /ui\.isOwner/);
  assert.match(coaching, /gc-switch/);
  assert.match(read("../composables/useCoachingScroll.ts"), /setProperty/);
  const coachingStage = read("../utils/gymscan/coachingStage.ts");
  assert.doesNotMatch(coachingStage, /LineSegments/);
  assert.doesNotMatch(coachingStage, /expandedScale/);
  assert.doesNotMatch(coachingStage, /YOUR VIDEO HERE/);
  assert.match(coachingStage, /phoneScreenHeaderGeometry/);
  assert.match(coachingStage, /coachingWipeTravel/);
  assert.doesNotMatch(coachingStage, /PlaneGeometry/);

  const globe = read("../components/gym/GymGlobeStory.vue");
  assert.doesNotMatch(globe, /:progress="progress"/);
  assert.match(globe, /:film="film"/);
  assert.match(globe, /class="gd-copy-swap"/);
  assert.match(globe, /:class="\{ 'is-on': phase === index \}"/);
  assert.doesNotMatch(
    globe,
    /GymHeroEntry/,
    "phase copy must crossfade in place, not remount the opening glyph",
  );
  const discovery = read("../assets/css/gym-discovery.css");
  assert.match(discovery, /\.gd-copy-swap\.is-on/);
  assert.match(discovery, /opacity 0\.32s ease-out/);
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

test("tag and map sticky panes share the cinema's top:0 / 100svh box on a phone", () => {
  const experience = read("../assets/css/gym-experience.css");
  assert.match(
    experience,
    /\.gx-install__copy \{[\s\S]*top: 0;[\s\S]*height: 100svh;/,
  );
  const discovery = read("../assets/css/gym-discovery.css");
  assert.match(discovery, /overflow:\s*clip;/);
  assert.match(
    discovery,
    /@media \(max-width: 760px\)[\s\S]*\.gx \.gd-sticky \{[\s\S]*min-height: 0;/,
  );
  assert.match(
    discovery,
    /\.gx \.gd-steps \{[\s\S]*bottom: 155px;/,
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
