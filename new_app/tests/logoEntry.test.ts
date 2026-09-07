import assert from "node:assert/strict";
import { test } from "node:test";
import {
  LOGO_ASSEMBLY_MS,
  LOGO_FLIGHT_MS,
  LOGO_NAME_MS,
  LOGO_OPEN_MS,
  LOGO_SIGN_MS,
  logoAssemblyFrame,
} from "../utils/brand/logoEntry.ts";

test("the lockup signs its name while the mark is still drawing", () => {
  assert.equal(logoAssemblyFrame(1).complete, true);
  assert.ok(
    LOGO_NAME_MS > 600,
    "the mark draws on centre stage before it yields for the word",
  );
  assert.ok(LOGO_NAME_MS < LOGO_ASSEMBLY_MS);
  assert.ok(
    LOGO_NAME_MS + LOGO_SIGN_MS < LOGO_ASSEMBLY_MS,
    "the word finishes before the lockup flies into the header",
  );
  assert.ok(LOGO_FLIGHT_MS <= LOGO_OPEN_MS);
  assert.ok(
    LOGO_ASSEMBLY_MS > LOGO_OPEN_MS,
    "drawing owns the stage; the flight is shorter than the draw",
  );
});
