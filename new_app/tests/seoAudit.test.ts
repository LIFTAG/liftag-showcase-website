import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { auditHtml, discoveryInventoryPaths, discoverySitemapAvailability, expectedStaticPaths, routeFile, runAudit, validateDiscoveryInventory } from '../scripts/seo-audit.ts'

function validHtml(path = '/for-lifters', lang = 'en') {
  return `<!doctype html><html lang="${lang}"><head>
    <title>Workout tracking that stays useful | LIFTAG</title>
    <meta name="description" content="Track strength training with a clear workout log, useful progress data, and exercise guidance built for consistent lifters.">
    <meta property="og:title" content="Workout tracking"><meta property="og:description" content="A useful workout log"><meta property="og:image" content="https://liftag.fit/og.jpg"><meta property="og:url" content="https://liftag.fit${path}">
    <meta name="robots" content="index,follow,max-image-preview:large"><meta name="twitter:card" content="summary_large_image"><link rel="canonical" href="https://liftag.fit${path}">
    <link rel="alternate" hreflang="en" href="https://liftag.fit${path}"><link rel="alternate" hreflang="sk" href="https://liftag.fit/sk${path}"><link rel="alternate" hreflang="x-default" href="https://liftag.fit${path}">
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage"}</script></head>
    <body><h1>Workout tracking</h1><p>${'Useful evidence for people and answer engines. '.repeat(20)}</p></body></html>`
}

test('audits a complete server-rendered page without errors', () => {
  const result = auditHtml('/for-lifters', validHtml())
  assert.equal(result.findings.filter(item => item.severity === 'error').length, 0)
  assert.equal(result.facts.jsonLdCount, 1)
})

test('decodes decimal and hexadecimal entities before measuring metadata', () => {
  const html = validHtml().replace(
    'Workout tracking that stays useful | LIFTAG',
    'Workout tracking &#x2F; strength &#39; log | LIFTAG',
  )
  const result = auditHtml('/for-lifters', html)
  assert.equal(result.facts.title, "Workout tracking / strength ' log | LIFTAG")
})

test('returns actionable errors for indexability and head regressions', () => {
  const result = auditHtml('/for-lifters', '<html lang="sk"><head><meta name="robots" content="noindex"></head><body><h1>A</h1><h1>B</h1></body></html>')
  const codes = new Set(result.findings.filter(item => item.severity === 'error').map(item => item.code))
  assert.ok(codes.has('title.invalid_count'))
  assert.ok(codes.has('description.invalid_count'))
  assert.ok(codes.has('canonical.invalid_count'))
  assert.ok(codes.has('html.lang'))
  assert.ok(codes.has('h1.invalid_count'))
  assert.ok(codes.has('robots.noindex'))
})

test('filtered search pages require noindex,follow and an unfiltered canonical', () => {
  const html = validHtml('/for-lifters').replace('index,follow,max-image-preview:large', 'noindex,follow')
  const result = auditHtml('/for-lifters?q=bench', html, 'fixture', { canonicalPath: '/for-lifters', expectNoindex: true })
  assert.equal(result.findings.filter(item => item.severity === 'error').length, 0)
  const missing = auditHtml('/for-lifters?q=bench', validHtml('/for-lifters'), 'fixture', { canonicalPath: '/for-lifters', expectNoindex: true })
  assert.ok(missing.findings.some(item => item.code === 'robots.indexed_search'))
})

test('equipment filters are noindex and canonicalize to the clean equipment route', () => {
  const gym = '11111111-1111-4111-8111-111111111111'
  const path = `/gyms/${gym}/equipment`
  const html = validHtml(path)
    .replace('index,follow,max-image-preview:large', 'noindex,follow')
  const result = auditHtml(`${path}?q=bench`, html, 'fixture', { canonicalPath: path, expectNoindex: true })
  assert.equal(result.findings.filter(item => item.severity === 'error').length, 0)
  assert.equal(result.facts.canonical, `https://liftag.fit${path}`)
})

test('static inventory covers every EN/SK route and CS legal routes', () => {
  const paths = expectedStaticPaths()
  assert.ok(paths.includes('/'))
  assert.ok(paths.includes('/sk'))
  assert.ok(paths.includes('/cs/privacy-policy'))
  assert.ok(paths.includes('/cs/terms-and-conditions'))
  assert.equal(paths.some(path => path === '/cs/for-lifters'), false)
  assert.equal(new Set(paths).size, paths.length)
})

test('local audit resolves file endpoints directly and HTML routes to index files', () => {
  assert.equal(routeFile('/build', '/robots.txt'), '/build/robots.txt')
  assert.equal(routeFile('/build', '/sitemap-pages.xml'), '/build/sitemap-pages.xml')
  assert.equal(routeFile('/build', '/llms-full.txt'), '/build/llms-full.txt')
  assert.equal(routeFile('/build', '/sk/exercises?page=2'), '/build/sk/exercises/index.html')
  assert.equal(routeFile('/build', '/'), '/build/index.html')
})

test('discovery sitemap inventory accepts only supported same-origin public families', () => {
  const gym = '11111111-1111-4111-8111-111111111111'
  const entity = '22222222-2222-4222-8222-222222222222'
  const urls = [
    `https://liftag.fit/gyms/${gym}`,
    `https://liftag.fit/sk/gyms/${gym}`,
    `https://liftag.fit/gyms/${gym}/equipment`,
    `https://liftag.fit/machines/${entity}?gym=${gym}`,
    `https://liftag.fit/explore/trainers/${entity}`,
    `https://liftag.fit/explore/routines/${entity}`,
    `https://example.com/gyms/${gym}`,
    `https://liftag.fit/explore/routines/not-a-uuid`,
  ]
  const xml = `<urlset>${urls.map(url => `<url><loc>${url}</loc></url>`).join('')}</urlset>`
  const all = discoveryInventoryPaths(xml, true)
  assert.equal(all.length, 6)
  assert.ok(all.includes(`/machines/${entity}?gym=${gym}`))
  assert.equal(discoveryInventoryPaths(xml).length, 6)
})

test('discovery pages retain their family-specific schema type requirement', () => {
  const gym = '11111111-1111-4111-8111-111111111111'
  const path = `/gyms/${gym}`
  const wrong = auditHtml(path, validHtml(path))
  assert.ok(wrong.findings.some(item => item.code === 'jsonld.discovery_type'))
  const valid = auditHtml(path, validHtml(path).replace('"WebPage"', '"ExerciseGym"'))
  assert.equal(valid.findings.some(item => item.code === 'jsonld.discovery_type'), false)
})

test('declared discovery sitemap failures block while old undeclared deployments only warn', () => {
  const declared = '<sitemapindex><sitemap><loc>https://liftag.fit/sitemap-discovery.xml</loc></sitemap></sitemapindex>'
  const failed = discoverySitemapAvailability(declared, null, new Error('HTTP 503'))
  assert.equal(failed[0]?.severity, 'error')
  assert.equal(failed[0]?.code, 'sitemap.discovery_unreadable')

  const oldIndex = '<sitemapindex><sitemap><loc>https://liftag.fit/sitemap-pages.xml</loc></sitemap></sitemapindex>'
  const unavailable = discoverySitemapAvailability(oldIndex, null, new Error('HTTP 404'))
  assert.equal(unavailable[0]?.severity, 'warning')
  assert.equal(unavailable[0]?.code, 'sitemap.discovery_unavailable')

  const orphaned = discoverySitemapAvailability(oldIndex, '<urlset></urlset>')
  assert.equal(orphaned[0]?.code, 'sitemap.discovery_unindexed')
})

test('discovery inventory rejects empty and unsupported URL sets', () => {
  assert.ok(validateDiscoveryInventory('<urlset></urlset>').findings.some(item => item.code === 'sitemap.discovery_empty'))
  const invalid = validateDiscoveryInventory('<urlset><url><loc>not a URL</loc></url><url><loc>https://example.com/gyms/11111111-1111-4111-8111-111111111111</loc></url></urlset>')
  assert.ok(invalid.findings.some(item => item.code === 'sitemap.discovery_invalid_loc'))
  assert.ok(invalid.findings.some(item => item.code === 'sitemap.discovery_unsupported_loc'))
})

test('discovery inventory requires reciprocal locales and complete gym roots', () => {
  const gym = '11111111-1111-4111-8111-111111111111'
  const partial = `<urlset><url><loc>https://liftag.fit/gyms/${gym}/equipment</loc></url></urlset>`
  const codes = new Set(validateDiscoveryInventory(partial).findings.map(item => item.code))
  assert.ok(codes.has('sitemap.discovery_reciprocal_missing'))
  assert.ok(codes.has('sitemap.discovery_gym_roots_missing'))
})

test('complete bilingual gym roots satisfy discovery inventory contract', () => {
  const gym = '11111111-1111-4111-8111-111111111111'
  const paths = [`/gyms/${gym}`, `/sk/gyms/${gym}`, `/gyms/${gym}/equipment`, `/sk/gyms/${gym}/equipment`]
  const xml = `<urlset>${paths.map(path => `<url><loc>https://liftag.fit${path}</loc></url>`).join('')}</urlset>`
  assert.deepEqual(validateDiscoveryInventory(xml).findings, [])
})

test('runAudit rejects a declared zero-byte discovery sitemap', async () => {
  const root = await mkdtemp(join(tmpdir(), 'liftag-seo-audit-'))
  try {
    await writeFile(join(root, 'sitemap.xml'), '<sitemapindex><sitemap><loc>https://liftag.fit/sitemap-discovery.xml</loc></sitemap></sitemapindex>')
    await writeFile(join(root, 'sitemap-discovery.xml'), '')
    const report = await runAudit({ root })
    assert.ok(report.globalFindings.some(item => item.code === 'sitemap.discovery_empty' && item.severity === 'error'))
  }
  finally {
    await rm(root, { recursive: true, force: true })
  }
})
