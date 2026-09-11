import assert from "node:assert/strict";
import { test } from "node:test";
import { kitContactPayload, validateKit } from "../utils/gymscan/kit.ts";
import {
  GYM_DEMO_PATH,
  gymAnchor,
  isGymDemoPath,
} from "../utils/gymscan/navigation.ts";

test("public, encoded, and legacy anchors resolve while malformed hashes remain harmless", () => {
  assert.equal(gymAnchor("#trainers"), "trainers");
  assert.equal(gymAnchor("#%67yms"), "gyms");
  assert.equal(gymAnchor("#demo"), "lifters");
  assert.equal(gymAnchor("#all-in-one"), "gyms");
  assert.equal(gymAnchor("#unknown"), null);
  assert.equal(gymAnchor("#%E0%A4%A"), null);
  assert.equal(GYM_DEMO_PATH, "/demo");
  assert.equal(isGymDemoPath("/demo"), true);
  assert.equal(isGymDemoPath("/demo/"), true);
  assert.equal(isGymDemoPath("/"), false);
  assert.equal(isGymDemoPath("/gym-scan"), false);
});
const fields = {
  name: " Ada Owner ",
  email: " ada@example.com ",
  gym: " Steel & Chalk ",
  city: " Bratislava ",
  equipment: "",
  notes: "",
};
test("kit request preserves the contact API and accepts optional empty fields", () => {
  assert.deepEqual(validateKit(fields), {});
  const payload = kitContactPayload(fields, "test-challenge");
  assert.deepEqual(Object.keys(payload).sort(), [
    "email",
    "message",
    "name",
    "subject",
    "turnstileToken",
  ]);
  assert.equal(payload.name, "Ada Owner");
  assert.equal(payload.email, "ada@example.com");
  assert.match(payload.message, /^Gym partnership request\nGym: Steel & Chalk\nCity: Bratislava/);
  assert.equal(payload.subject, "Gym partnership inquiry");
  assert.equal(payload.turnstileToken, "test-challenge");
});
test("kit validation rejects missing context and invalid counts without mutating input", () => {
  const invalid = {
    ...fields,
    name: " ",
    email: "bad@",
    gym: "",
    city: "",
    equipment: "2.5",
    notes: "n".repeat(2001),
  };
  const snapshot = structuredClone(invalid);
  assert.deepEqual(Object.keys(validateKit(invalid)).sort(), [
    "city",
    "email",
    "equipment",
    "gym",
    "name",
    "notes",
  ]);
  assert.deepEqual(invalid, snapshot);
  for (const count of ["0", "-1", "10001", "three"])
    assert.ok(validateKit({ ...fields, equipment: count }).equipment);
  assert.deepEqual(validateKit({ ...fields, equipment: "10000" }), {});
  assert.ok(validateKit({ ...fields, name: "n".repeat(121) }).name);
  assert.ok(validateKit({ ...fields, city: "c".repeat(121) }).city);
  assert.deepEqual(
    validateKit({
      ...fields,
      name: "n".repeat(120),
      city: "c".repeat(120),
      gym: "g".repeat(160),
    }),
    {},
  );
});
