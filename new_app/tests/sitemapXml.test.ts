import assert from 'node:assert/strict'
import { test } from 'node:test'
import { exerciseHreflangAlternates } from '../utils/catalogLocale.ts'
import { STATIC_PAGES } from '../utils/staticPages.ts'
import { assertStablePagination, discoverySitemapPaths, requireUniqueIds } from '../utils/discoverySitemap.ts'
import { defaultSitemapIndexXml, hreflangUrlEntry, sitemapIndexXml, urlEntry, xmlEscape } from '../utils/sitemapXml.ts'

test('escapes XML special characters in sitemap fields', () => {
  assert.equal(xmlEscape('a&b<c>"d\'e'), 'a&amp;b&lt;c&gt;&quot;d&apos;e')
})

test('builds a loc + lastmod url entry', () => {
  assert.equal(
    urlEntry('/exercises/barbell-bench-press', '2026-08-07T12:00:00.000Z'),
    '<url><loc>https://liftag.fit/exercises/barbell-bench-press</loc><lastmod>2026-08-07</lastmod></url>',
  )
})

test('builds loc + xhtml alternates for EN and SK exercise URLs', () => {
  const alternates = exerciseHreflangAlternates('lat-pulldown')
  const xml = hreflangUrlEntry('/sk/exercises/lat-pulldown', '2026-08-07T12:00:00.000Z', alternates)
  assert.match(xml, /<loc>https:\/\/liftag\.fit\/sk\/exercises\/lat-pulldown<\/loc>/)
  assert.match(xml, /hreflang="en" href="https:\/\/liftag\.fit\/exercises\/lat-pulldown"/)
  assert.match(xml, /hreflang="sk" href="https:\/\/liftag\.fit\/sk\/exercises\/lat-pulldown"/)
  assert.match(xml, /hreflang="x-default" href="https:\/\/liftag\.fit\/exercises\/lat-pulldown"/)
  assert.doesNotMatch(xml, /hreflang="cs"/)
})

test('builds a sitemap index', () => {
  const xml = sitemapIndexXml([
    { path: '/sitemap-pages.xml', lastmod: '2026-08-19' },
    { path: '/sitemap-catalog.xml' },
  ])
  assert.match(xml, /<sitemapindex /)
  assert.match(xml, /https:\/\/liftag\.fit\/sitemap-pages\.xml/)
  assert.match(xml, /<lastmod>2026-08-19<\/lastmod>/)
  assert.match(xml, /https:\/\/liftag\.fit\/sitemap-catalog\.xml/)
})

test('builds canonical gym-rooted discovery paths without inventing entities', () => {
  assert.deepEqual(discoverySitemapPaths({
    gyms: [{
      id: 'gym-1',
      equipmentIds: ['machine-1'],
      trainerIds: ['trainer-1'],
      routineIds: ['routine-1'],
    }],
  }), [
    '/gyms/gym-1',
    '/gyms/gym-1/equipment',
    '/machines/machine-1?gym=gym-1',
    '/explore/trainers/trainer-1',
    '/explore/routines/routine-1',
  ])
})

test('rejects incomplete discovery inventory evidence', () => {
  assert.throws(
    () => requireUniqueIds(['gym-1', 'gym-1'], 'gym'),
    /duplicate IDs/,
  )
  assert.throws(
    () => requireUniqueIds(['gym-1', null], 'gym'),
    /invalid IDs/,
  )
  assert.throws(
    () => assertStablePagination(
      { total: 101, lastPage: 2 },
      { total: 99, lastPage: 1 },
      '/v1/gyms',
    ),
    /pagination changed/,
  )
})

test('press kit, about, and discovery are static sitemap URLs', () => {
  const paths = STATIC_PAGES.map(page => page.path)
  assert.ok(paths.includes('/press'))
  assert.ok(paths.includes('/about'))
  assert.ok(paths.includes('/explore'))
  assert.ok(paths.includes('/tools/1rm-calculator'))
  assert.equal(STATIC_PAGES.find(page => page.path === '/contact/partner')?.lastmod, '2026-10-02')
})

test('default index lists every child sitemap and does not wait on lastmod', () => {
  const xml = defaultSitemapIndexXml()
  assert.match(xml, /<sitemapindex /)
  assert.match(xml, /https:\/\/liftag\.fit\/sitemap-pages\.xml/)
  assert.match(xml, /https:\/\/liftag\.fit\/sitemap-catalog\.xml/)
  assert.match(xml, /https:\/\/liftag\.fit\/sitemap-discovery\.xml/)
  assert.match(xml, /https:\/\/liftag\.fit\/sitemap-images\.xml/)
  assert.match(xml, /https:\/\/liftag\.fit\/sitemap-videos\.xml/)
  assert.doesNotMatch(xml, /<lastmod>/)
})
