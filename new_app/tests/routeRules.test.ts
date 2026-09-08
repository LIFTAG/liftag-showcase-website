import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const config = readFileSync(new URL("../nuxt.config.ts", import.meta.url), "utf8");
const routeRules = config.slice(
  config.indexOf("routeRules:"),
  config.indexOf("\n  nitro:"),
);
const keys = [...routeRules.matchAll(/['"](\/[^'"]+)['"]\s*:/g)].map(
  (match) => match[1]!,
);

test("legacy /gym-scan is a single Nitro redirect, not a trailing-slash pair", () => {
  assert.ok(keys.includes("/gym-scan"), "slashless /gym-scan must keep redirecting");
  assert.equal(
    keys.includes("/gym-scan/"),
    false,
    "a second /gym-scan/ rule collides on gym-scan.func and kills the Vercel build",
  );
});

test("no routeRule is paired with its trailing-slash twin", () => {
  const twins = keys.filter(
    (key) => key.endsWith("/") && keys.includes(key.slice(0, -1)),
  );
  assert.deepEqual(
    twins,
    [],
    `Nitro Vercel names /path and /path/ the same function: ${twins.join(", ")}`,
  );
});
