import assert from "node:assert/strict";
import { test } from "node:test";
import * as dims from "../utils/gymscan/phoneDims.ts";
import * as model from "../utils/phoneModel.ts";

test("the three-free phone dimensions match the phone mesh exactly", () => {
  const names = Object.keys(dims);
  assert.ok(names.length > 0);
  for (const name of names) {
    assert.ok(name in model, `${name} is missing from utils/phoneModel.ts`);
    assert.deepEqual(
      (dims as Record<string, unknown>)[name],
      (model as Record<string, unknown>)[name],
      `${name} drifted from utils/phoneModel.ts`,
    );
  }
});
