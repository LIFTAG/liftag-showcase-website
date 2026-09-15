import assert from 'node:assert/strict'
import { test } from 'node:test'
import { en, sk } from '../i18n/messages/gymFaqs.ts'
import { gymFaqsForLocale } from '../utils/gymscan/content.ts'

test('free NFC and QR copy means dashboard plus app, not physical stickers', () => {
  assert.match(en.hardwareAnswer, /dashboard/)
  assert.match(en.hardwareAnswer, /full LIFTAG app/)
  assert.match(en.hardwareAnswer, /does not buy or ship/)
  assert.match(en.hardwareAnswer, /purchase those themselves/)
  assert.match(sk.hardwareAnswer, /nekupuje a neposiela/)
  assert.match(sk.hardwareAnswer, /kupujú samy/)
  for (const [locale, messages] of [
    ['en', en],
    ['sk', sk],
  ] as const) {
    assert.ok(
      gymFaqsForLocale(locale).some(
        (faq) => faq.question === messages.hardwareQuestion && faq.answer === messages.hardwareAnswer,
      ),
    )
  }
})
