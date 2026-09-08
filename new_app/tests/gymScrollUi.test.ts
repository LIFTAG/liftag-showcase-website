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

  const coaching = read("../components/gym/GymCoachingStory.vue");
  assert.doesNotMatch(coaching, /progressStyle/);
  assert.match(coaching, /ui\.isOwner/);
  assert.match(read("../composables/useCoachingScroll.ts"), /setProperty/);

  const globe = read("../components/gym/GymGlobeStory.vue");
  assert.doesNotMatch(globe, /:progress="progress"/);
  assert.match(globe, /:film="film"/);
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
});
