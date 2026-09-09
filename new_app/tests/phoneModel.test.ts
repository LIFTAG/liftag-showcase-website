import assert from "node:assert/strict";
import { test } from "node:test";
import {
  PHONE_ISLAND,
  PHONE_SCR_H,
  PHONE_SCR_R,
  PHONE_SCR_W,
  phoneScreenHeaderGeometry,
  phoneScreenHeaderShape,
} from "../utils/phoneModel.ts";

test("the coaching video header uses the screen corner radius and leaves the island open", () => {
  const headerH = PHONE_SCR_H * 0.4;
  const shape = phoneScreenHeaderShape(headerH);
  assert.equal(shape.holes.length, 1);
  const holePts = shape.holes[0]!.getPoints(24);
  let holeMinX = Infinity;
  let holeMaxX = -Infinity;
  let holeMinY = Infinity;
  let holeMaxY = -Infinity;
  for (const pt of holePts) {
    holeMinX = Math.min(holeMinX, pt.x);
    holeMaxX = Math.max(holeMaxX, pt.x);
    holeMinY = Math.min(holeMinY, pt.y);
    holeMaxY = Math.max(holeMaxY, pt.y);
  }
  assert.ok(holeMaxX - holeMinX > PHONE_ISLAND.width);
  assert.ok(holeMaxY - holeMinY > PHONE_ISLAND.height);
  assert.ok(holeMinX < 0 && holeMaxX > 0);
  assert.ok(
    PHONE_ISLAND.y > holeMinY && PHONE_ISLAND.y < holeMaxY,
    "island centre sits inside the hole",
  );

  const geo = phoneScreenHeaderGeometry(headerH);
  const pos = geo.attributes.position!;
  let meshMaxX = -Infinity;
  let meshMaxY = -Infinity;
  let meshMinY = Infinity;
  for (let i = 0; i < pos.count; i += 1) {
    meshMaxX = Math.max(meshMaxX, pos.getX(i));
    meshMaxY = Math.max(meshMaxY, pos.getY(i));
    meshMinY = Math.min(meshMinY, pos.getY(i));
  }
  assert.ok(Math.abs(meshMaxX - PHONE_SCR_W / 2) < 0.002);
  assert.ok(Math.abs(meshMaxY - PHONE_SCR_H / 2) < 0.002);
  assert.ok(Math.abs(meshMinY - (PHONE_SCR_H / 2 - headerH)) < 0.002);
  assert.ok(PHONE_SCR_R > 0.05);
  geo.dispose();
});
