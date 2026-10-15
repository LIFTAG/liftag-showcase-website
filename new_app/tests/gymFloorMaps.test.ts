import assert from "node:assert/strict";
import { test } from "node:test";
import { floorHeightRows, floorNormalRows } from "../utils/gymscan/environment.ts";

// The per-texel formulation the floor maps were generated with before the
// loops were hoisted and cut into row bands. Kept here as the reference.
function seededGrain(S: number) {
  let seed = 0x9e3779b9;
  const rnd = () => {
    seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
    return ((seed >>> 0) % 100000) / 100000;
  };
  const grain = new Float32Array(S * S);
  for (let i = 0; i < grain.length; i++) grain[i] = rnd();
  return grain;
}

function referenceHeights(S: number, grain: Float32Array) {
  const out = new Uint8ClampedArray(S * S * 4);
  const at = (x: number, y: number) => grain[((y + S) % S) * S + ((x + S) % S)]!;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      let sum = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) sum += at(x + dx, y + dy);
      const v = 118 + (sum / 9 - 0.5) * 34;
      const o = (y * S + x) * 4;
      out[o] = out[o + 1] = out[o + 2] = Math.round(v);
      out[o + 3] = 255;
    }
  }
  return out;
}

function referenceNormals(S: number, hData: Uint8ClampedArray) {
  const out = new Uint8ClampedArray(S * S * 4);
  const h = (x: number, y: number) => hData[(((y + S) % S) * S + ((x + S) % S)) * 4]! / 255;
  const strength = 1.1;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const dx = (h(x + 1, y) - h(x - 1, y)) * strength;
      const dy = (h(x, y + 1) - h(x, y - 1)) * strength;
      const len = Math.hypot(dx, dy, 1);
      const o = (y * S + x) * 4;
      out[o] = Math.round((-dx / len * 0.5 + 0.5) * 255);
      out[o + 1] = Math.round((-dy / len * 0.5 + 0.5) * 255);
      out[o + 2] = Math.round((1 / len * 0.5 + 0.5) * 255);
      out[o + 3] = 255;
    }
  }
  return out;
}

for (const S of [256, 512]) {
  test(`floor map row bands are byte-identical to the per-texel maps (${S}px)`, () => {
    const grain = seededGrain(S);
    const heights = new Uint8ClampedArray(S * S * 4);
    // Uneven bands, to cover band edges that do not divide the size.
    for (let y = 0; y < S; y += 37) floorHeightRows(S, grain, heights, y, Math.min(S, y + 37));
    assert.deepEqual(heights, referenceHeights(S, grain));

    const normals = new Uint8ClampedArray(S * S * 4);
    for (let y = 0; y < S; y += 16) floorNormalRows(S, heights, normals, y, Math.min(S, y + 16));
    assert.deepEqual(normals, referenceNormals(S, heights));
  });
}
