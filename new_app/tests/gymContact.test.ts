import assert from "node:assert/strict";
import { test } from "node:test";
import { useContactSubmit } from "../composables/useContactSubmit.ts";

// Exercise the real composable with a controlled transport; no contact is sent.
Object.assign(globalThis, {
  ref: (value: unknown) => ({ value }),
  useRuntimeConfig: () => ({
    public: { apiBaseUrl: "https://contact.invalid" },
  }),
});
const body = {
  name: "Test Owner",
  email: "test@example.com",
  subject: "Gym partnership inquiry",
  message: "Free LIFTAG kit request\nGym: Test Gym\nCity: Test City",
  turnstileToken: "test-challenge",
};
test("contact remains pending until the transport resolves and then succeeds", async () => {
  let finish!: () => void;
  Object.assign(globalThis, {
    $fetch: (url: string, options: { body: unknown; method: string }) => {
      assert.equal(url, "https://contact.invalid/v1/contact");
      assert.equal(options.method, "POST");
      assert.deepEqual(options.body, body);
      return new Promise<void>((resolve) => {
        finish = resolve;
      });
    },
  });
  const contact = useContactSubmit();
  const request = contact.submit(body);
  assert.equal(contact.status.value, "submitting");
  finish();
  await request;
  assert.equal(contact.status.value, "success");
  assert.equal(contact.errorMessage.value, null);
});
test("network, validation, challenge, rate limit and service failures preserve the payload and support retry", async () => {
  const snapshot = structuredClone(body);
  const cases = [
    [undefined, /Network error/],
    [403, /Verification failed/],
    [422, /fields look off/],
    [429, /2 minutes/],
    [502, /couldn’t send/],
    [503, /couldn’t send/],
  ] as const;
  for (const [status, message] of cases) {
    Object.assign(globalThis, {
      $fetch: async () => {
        throw {
          response: { status, headers: new Headers({ "retry-after": "120" }) },
        };
      },
    });
    const contact = useContactSubmit();
    await contact.submit(body);
    assert.equal(contact.status.value, "error");
    assert.match(contact.errorMessage.value!, message);
    assert.deepEqual(body, snapshot);
    Object.assign(globalThis, { $fetch: async () => ({}) });
    await contact.submit(body);
    assert.equal(contact.status.value, "success");
    assert.equal(contact.errorMessage.value, null);
  }
});
