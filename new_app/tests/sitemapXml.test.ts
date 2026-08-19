import assert from 'node:assert/strict'
import { test } from 'node:test'
import { sitemapIndexXml, urlEntry, xmlEscape } from '../utils/sitemapXml.ts'

test('escapes XML special characters in sitemap fields', () => {
  assert.equal(xmlEscape('a&b<c>"d\'e'), 'a&amp;b&lt;c&gt;&quot;d&apos;e')
})

test('builds a loc + lastmod url entry', () => {
  assert.equal(
    urlEntry('/exercises/barbell-bench-press', '2026-08-07T12:00:00.000Z'),
    '<url><loc>https://liftag.fit/exercises/barbell-bench-press</loc><lastmod>2026-08-07</lastmod></url>',
  )
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
