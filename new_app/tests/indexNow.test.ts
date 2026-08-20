import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import {
  buildIndexNowPayload,
  collectIndexNowEntries,
  INDEXNOW_COOLDOWN_MS,
  INDEXNOW_HOST,
  INDEXNOW_KEY,
  INDEXNOW_KEY_LOCATION,
  INDEXNOW_MAX_URLS,
  isIndexNowUrl,
  liftagUrl,
  selectIndexNowUrls,
  shouldSkipIndexNowPing,
  type IndexNowCatalogInput,
} from '../utils/indexNow.ts'
import { SITE_URL } from '../utils/seoSchema.ts'
import { urlEntry } from '../utils/sitemapXml.ts'
import { LEGAL_HREFLANG_PAGES, STATIC_PAGES } from '../utils/staticPages.ts'

const catalog: IndexNowCatalogInput = {
  fetchedAt: '2026-08-20T12:00:00.000Z',
  exercises: [
    { slug: 'barbell-bench-press', createdAt: '2026-08-01T00:00:00.000Z', updatedAt: '2026-08-21T12:00:00.000Z' },
    { slug: null, createdAt: '2026-08-01T00:00:00.000Z', updatedAt: '2026-08-21T00:00:00.000Z' },
  ],
  machines: [
    { id: 'm1', slug: 'lat-pulldown-machine', createdAt: '2026-08-01T00:00:00.000Z', updatedAt: '2026-08-02T00:00:00.000Z' },
    { id: 'm2', createdAt: '2026-08-01T00:00:00.000Z', updatedAt: null },
  ],
  categories: [
    { slug: 'chest', isActive: true },
    { slug: 'not-a-hub', isActive: true },
    { slug: 'back', isActive: false },
  ],
}

test('IndexNow key matches the protocol charset and the public key file', () => {
  assert.match(INDEXNOW_KEY, /^[a-zA-Z0-9-]{8,128}$/)
  assert.equal(INDEXNOW_HOST, 'liftag.fit')
  assert.equal(INDEXNOW_KEY_LOCATION, `${SITE_URL}/${INDEXNOW_KEY}.txt`)
  assert.equal(INDEXNOW_KEY_LOCATION, `https://liftag.fit/${INDEXNOW_KEY}.txt`)
  assert.ok(urlEntry('/').startsWith(`<url><loc>https://${INDEXNOW_HOST}/`))

  const raw = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), `../public/${INDEXNOW_KEY}.txt`),
  )
  assert.equal(raw[0], 0x6c, 'key file must not start with a UTF-8 BOM')
  const text = raw.toString('utf8')
  assert.equal(text.trim(), INDEXNOW_KEY)
  assert.equal(text.replace(/\n$/, ''), INDEXNOW_KEY)
})

test('allows only https://liftag.fit marketing and catalog URLs', () => {
  assert.equal(isIndexNowUrl('https://liftag.fit/'), true)
  assert.equal(isIndexNowUrl('https://liftag.fit/exercises/barbell-bench-press'), true)
  assert.equal(isIndexNowUrl('https://liftag.fit/qr-nfc-gym-tags'), true)
  assert.equal(isIndexNowUrl('https://liftag.fit/sk/privacy-policy'), true)
  assert.equal(isIndexNowUrl('http://liftag.fit/'), false)
  assert.equal(isIndexNowUrl('https://www.liftag.fit/'), false)
  assert.equal(isIndexNowUrl('https://app.liftag.fit/'), false)
  assert.equal(isIndexNowUrl('https://liftag.fit:8443/'), false)
  assert.equal(isIndexNowUrl('https://liftag.fit/auth/callback'), false)
  assert.equal(isIndexNowUrl('https://liftag.fit/qr/abc'), false)
  assert.equal(isIndexNowUrl('https://liftag.fit/routines/abc'), false)
  assert.equal(isIndexNowUrl('https://liftag.fit/plans/abc'), false)
  assert.equal(isIndexNowUrl('https://liftag.fit/trainer-invites/abc'), false)
  assert.equal(isIndexNowUrl('https://liftag.fit/get'), false)
  assert.equal(isIndexNowUrl('https://liftag.fit/get/ios'), false)
  assert.equal(isIndexNowUrl('not-a-url'), false)
})

test('collects static pages, legal hreflang URLs, and catalog paths', () => {
  const entries = collectIndexNowEntries(catalog)
  const urls = entries.map(entry => entry.url)

  for (const page of STATIC_PAGES) {
    assert.ok(urls.includes(liftagUrl(page.path)), page.path)
  }
  for (const locale of ['sk', 'cs'] as const) {
    for (const path of LEGAL_HREFLANG_PAGES) {
      assert.ok(urls.includes(`https://liftag.fit/${locale}${path}`), `/${locale}${path}`)
    }
  }

  assert.ok(urls.includes('https://liftag.fit/exercises'))
  assert.ok(urls.includes('https://liftag.fit/sk/exercises'))
  assert.ok(urls.includes('https://liftag.fit/machines'))
  assert.ok(urls.includes('https://liftag.fit/muscles'))
  assert.ok(urls.includes('https://liftag.fit/muscles/chest'))
  assert.ok(urls.includes('https://liftag.fit/exercises/barbell-bench-press'))
  assert.ok(urls.includes('https://liftag.fit/sk/exercises/barbell-bench-press'))
  assert.ok(urls.includes('https://liftag.fit/machines/lat-pulldown-machine'))
  assert.ok(urls.includes('https://liftag.fit/machines/m2'))

  assert.equal(urls.includes('https://liftag.fit/muscles/not-a-hub'), false)
  assert.equal(urls.some(url => url.includes('/cs/exercises')), false)
  assert.equal(urls.some(url => url.includes('/auth/') || url.includes('/qr/') || url.endsWith('/get')), false)
})

test('drops slug-less exercises and denied URLs from the payload', () => {
  const payload = buildIndexNowPayload(selectIndexNowUrls(collectIndexNowEntries(catalog)))
  assert.equal(payload.host, 'liftag.fit')
  assert.equal(payload.key, INDEXNOW_KEY)
  assert.equal(payload.keyLocation, INDEXNOW_KEY_LOCATION)
  assert.ok(payload.urlList.includes('https://liftag.fit/exercises/barbell-bench-press'))
  assert.equal(payload.urlList.some(url => url.includes('null')), false)
  assert.equal(payload.urlList.includes('https://www.liftag.fit/'), false)
  assert.deepEqual(
    buildIndexNowPayload([
      'https://liftag.fit/for-lifters',
      'https://www.liftag.fit/for-lifters',
      'https://app.liftag.fit/for-lifters',
      'http://liftag.fit/for-lifters',
      'https://liftag.fit/get',
      'https://liftag.fit/for-lifters',
    ]).urlList,
    ['https://liftag.fit/for-lifters'],
  )
})

test('delta select keeps URLs newer than the last successful ping', () => {
  const entries = collectIndexNowEntries(catalog)
  const since = Date.parse('2026-08-20T12:00:00.000Z')
  const delta = selectIndexNowUrls(entries, since)
  assert.ok(delta.includes('https://liftag.fit/exercises/barbell-bench-press'))
  assert.ok(delta.includes('https://liftag.fit/sk/exercises/barbell-bench-press'))
  assert.equal(delta.includes('https://liftag.fit/machines/lat-pulldown-machine'), false)
  assert.equal(delta.includes('https://liftag.fit/'), false)
  assert.equal(delta.includes('https://liftag.fit/exercises'), false)
})

test('caps a batch at 10,000 URLs', () => {
  const tooMany = Array.from({ length: INDEXNOW_MAX_URLS + 5 }, (_, i) => `https://liftag.fit/exercises/e-${i}`)
  assert.equal(buildIndexNowPayload(tooMany).urlList.length, INDEXNOW_MAX_URLS)
})

test('process cooldown skips a second full ping within six hours', () => {
  const now = Date.parse('2026-08-20T18:00:00.000Z')
  assert.equal(shouldSkipIndexNowPing(null, now), false)
  assert.equal(shouldSkipIndexNowPing(now - INDEXNOW_COOLDOWN_MS + 1, now), true)
  assert.equal(shouldSkipIndexNowPing(now - INDEXNOW_COOLDOWN_MS, now), false)
})
