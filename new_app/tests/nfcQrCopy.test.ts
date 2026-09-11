import assert from "node:assert/strict";
import { test } from "node:test";
import {
  NFC_QR_FREE_MEANS,
  NFC_QR_HARDWARE_FAQ,
  NFC_QR_HARDWARE_SELF_BUY,
} from "../utils/nfcQrCopy.ts";

test("free NFC and QR copy means dashboard plus app, not physical stickers", () => {
  assert.match(NFC_QR_FREE_MEANS, /dashboard/);
  assert.match(NFC_QR_FREE_MEANS, /full LIFTAG app/);
  assert.match(NFC_QR_HARDWARE_SELF_BUY, /does not buy or ship/);
  assert.match(NFC_QR_HARDWARE_SELF_BUY, /purchase those themselves/);
  assert.equal(NFC_QR_HARDWARE_FAQ.question, "Are NFC tags and QR codes free?");
  assert.equal(NFC_QR_HARDWARE_FAQ.answer, NFC_QR_FREE_MEANS);
});
