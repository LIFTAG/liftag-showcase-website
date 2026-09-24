import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { inflateSync } from "node:zlib";
import { discoveryGyms, discoveryHub } from "../utils/gymscan/discoveryGyms.ts";
import {
  ORBIT_MASK,
  SLOVAKIA_OUTLINE,
  geo,
  orbitArc,
  orbitCamera,
  orbitCities,
  orbitExtras,
  orbitFrame,
  orbitGym,
  orbitHorizon,
  orbitProject,
  orbitRoutes,
  orbitShot,
  type OrbitCamera,
} from "../utils/gymscan/orbitMap.ts";
import { buildOrbitDots } from "../utils/gymscan/orbitPaint.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const sizes = [[1440, 900], [1920, 1080], [1024, 768], [390, 460], [375, 440]] as const;
const altitudeKm = (cam: OrbitCamera) => (Math.hypot(...cam.eye) - 1) * 6371;

function outlineBox(cam: OrbitCamera) {
  const points = SLOVAKIA_OUTLINE.map(([lon, lat]) => orbitProject(cam, geo(lat, lon))!);
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}

/** The mask is 8-bit grey; decode it the way a browser would, without one. */
function decodeMask() {
  const png = readFileSync(new URL(`../public${ORBIT_MASK.src}`, import.meta.url));
  let offset = 8;
  let width = 0;
  let height = 0;
  const idat: Buffer[] = [];
  while (offset < png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.toString("latin1", offset + 4, offset + 8);
    const data = png.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      assert.equal(data[8], 8, "8-bit");
      assert.equal(data[9], 0, "greyscale");
    }
    if (type === "IDAT") idat.push(data);
    offset += 12 + length;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const out = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (width + 1)]!;
    for (let x = 0; x < width; x++) {
      const v = raw[y * (width + 1) + 1 + x]!;
      const left = x ? out[y * width + x - 1]! : 0;
      const up = y ? out[(y - 1) * width + x]! : 0;
      const corner = x && y ? out[(y - 1) * width + x - 1]! : 0;
      const p = left + up - corner;
      const paeth = [left, up, corner].sort((a, b) => Math.abs(p - a) - Math.abs(p - b))[0]!;
      const predict = [0, left, up, (left + up) >> 1, paeth][filter]!;
      out[y * width + x] = (v + predict) & 255;
    }
  }
  return { width, height, data: out };
}

test("Slovakia fills its frame from orbit at every size", () => {
  for (const [w, h] of sizes) {
    const cam = orbitCamera(w, h, orbitShot(1));
    const frame = orbitFrame(w, h);
    const box = outlineBox(cam);
    assert.ok(box.x0 >= frame.x - 1 && box.x1 <= frame.x + frame.w + 1, `${w}x${h} inside x`);
    assert.ok(box.y0 >= frame.y - 1 && box.y1 <= frame.y + frame.h + 1, `${w}x${h} inside y`);
    const fills = Math.max((box.x1 - box.x0) / frame.w, (box.y1 - box.y0) / frame.h);
    assert.ok(fills > 0.99, `${w}x${h} fills its frame (${fills.toFixed(3)})`);
  }
});

test("the horizon curves across the sky above Slovakia", () => {
  for (const [w, h] of sizes) {
    const cam = orbitCamera(w, h, orbitShot(1));
    const box = outlineBox(cam);
    const limb = orbitHorizon(cam).filter((p) => p.x >= 0 && p.x <= w);
    assert.ok(limb.length > 10, `${w}x${h} limb in view`);
    const top = Math.min(...limb.map((p) => p.y));
    assert.ok(top > h * 0.1, `${w}x${h} limb clears the nav`);
    assert.ok(Math.max(...limb.map((p) => p.y)) < box.y0, `${w}x${h} limb above the country`);
    if (w > 760) {
      // A dome, not a ruler: the ends sag well below the crest.
      const left = limb.reduce((a, b) => (b.x < a.x ? b : a));
      assert.ok(left.y - top > h * 0.08, `${w}x${h} limb is curved`);
    }
  }
});

test("the crane starts high enough to show the planet, then settles", () => {
  const start = orbitCamera(1440, 900, orbitShot(0));
  const end = orbitCamera(1440, 900, orbitShot(1));
  assert.ok(altitudeKm(start) > 1500, `approach at ${altitudeKm(start).toFixed(0)} km`);
  assert.ok(altitudeKm(end) > 200 && altitudeKm(end) < 450, `settled at ${altitudeKm(end).toFixed(0)} km`);
  let previous = Infinity;
  for (let t = 0; t <= 1.0001; t += 0.05) {
    const alt = altitudeKm(orbitCamera(1440, 900, orbitShot(t)));
    assert.ok(alt < previous, "always descending");
    previous = alt;
  }
  // Scroll drift sways the camera without losing the country.
  for (const drift of [-1, 1]) {
    const cam = orbitCamera(1440, 900, orbitShot(1, drift));
    for (const gym of discoveryGyms) {
      const { base } = orbitGym(cam, gym);
      assert.ok(base && base.x > 0 && base.x < 1440 && base.y > 0 && base.y < 900);
    }
  }
});

test("every gym stands on the lit side, its pin rising up the screen", () => {
  for (const [w, h] of sizes) {
    const cam = orbitCamera(w, h, orbitShot(1));
    for (const gym of discoveryGyms) {
      const { base, head } = orbitGym(cam, gym);
      assert.ok(base && head, gym.id);
      assert.ok(base.facing > 0.3, `${gym.id} faces the camera`);
      assert.ok(head.y < base.y - 2, `${gym.id} pin stands up`);
    }
  }
});

test("one route lifts off the ground from Bratislava to each other city", () => {
  assert.equal(discoveryGyms.length, 8);
  assert.equal(discoveryHub.id, "bratislava-eurovea");
  assert.deepEqual(
    orbitRoutes.map((gym) => gym.city),
    ["Trenčín", "Banská Bystrica", "Spišská Nová Ves", "Košice", "Prešov"],
  );
  // One tappable pin per city; a city's second gym is a ground dot.
  assert.deepEqual(orbitCities.map((gym) => gym.city), ["Bratislava", ...orbitRoutes.map((gym) => gym.city)]);
  assert.deepEqual(orbitExtras.map((gym) => gym.id), ["bratislava-lamac", "kosice-hypertesco"]);
  const cam = orbitCamera(1440, 900, orbitShot(1));
  const hub = orbitProject(cam, geo(discoveryHub.latitude, discoveryHub.longitude))!;
  for (const gym of orbitRoutes) {
    const d = orbitArc(cam, discoveryHub, gym);
    assert.ok(d.startsWith(`M${hub.x.toFixed(1)} ${hub.y.toFixed(1)}L`));
    const points = d.slice(1).split("L").map((pair) => pair.split(" ").map(Number));
    const [x0, y0] = points[0]!;
    const [x1, y1] = points[points.length - 1]!;
    const [, ym] = points[points.length >> 1]!;
    assert.ok(ym! < (y0! + y1!) / 2 - 10, `${gym.city} route arcs above its chord`);
    assert.ok(Math.hypot(x1! - x0!, y1! - y0!) > 20);
  }
});

test("the land mask marks sea, land and Slovakia where they are", () => {
  const mask = decodeMask();
  assert.equal(mask.width, ORBIT_MASK.cols);
  assert.equal(mask.height, ORBIT_MASK.rows);
  const at = (lat: number, lon: number) =>
    mask.data[
      Math.floor((ORBIT_MASK.north - lat) / ORBIT_MASK.step) * mask.width +
        Math.floor((lon - ORBIT_MASK.west) / ORBIT_MASK.step)
    ];
  for (const gym of discoveryGyms) assert.equal(at(gym.latitude, gym.longitude), 255, gym.city);
  assert.equal(at(48.21, 16.37), 128, "Vienna is land, not Slovakia");
  assert.equal(at(43.5, 15), 0, "the Adriatic is sea");
  assert.equal(at(55.5, 18), 0, "the Baltic is sea");
  assert.ok(readFileSync(new URL(`../public${ORBIT_MASK.src}`, import.meta.url)).length < 40_000);
});

test("the dot field lights Slovakia and stays within a paint budget", () => {
  const { data } = decodeMask();
  const cams = [orbitShot(1), orbitShot(1, -1), orbitShot(1, 1), orbitShot(0.5), orbitShot(0)].map((shot) =>
    orbitCamera(1440, 900, shot),
  );
  const dots = buildOrbitDots(data, cams, 6.5);
  let home = 0;
  for (let k = 0; k < dots.count; k++) if (dots.meta[k]! & 8) home++;
  assert.ok(home > 1500, `Slovakia has ${home} dots`);
  assert.ok(dots.count < 60_000, `${dots.count} dots kept`);
  assert.equal(dots.xyz.length, dots.count * 3);
  assert.equal(dots.hub.length, dots.count);
});

test("the map chapter moves its overlay without Vue and loads the globe lazily", () => {
  const story = read("../components/gym/GymMapStory.vue");
  assert.match(story, /import\('~\/utils\/gymscan\/orbitPaint'\)/);
  assert.doesNotMatch(story, /import \{[^}]*\} from '~\/utils\/gymscan\/orbitPaint'/);
  assert.match(story, /pin\.style\.transform = `translate3d/);
  assert.match(story, /arcNodes\[i\]\?\.setAttribute\('d'/);
  assert.doesNotMatch(story, /:style="\{[^"]*\bx\b/);
  // The card and pins land even when the mask fails to load.
  assert.match(story, /failed = true;\s*start\(\);/);
  assert.match(story, /rootMargin: '150% 0px'/);
  const css = read("../assets/css/gym-map.css");
  assert.match(css, /\.gmap\.is-landed \.gmap-card \{/);
});
