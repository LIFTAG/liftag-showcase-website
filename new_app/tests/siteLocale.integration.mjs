import assert from 'node:assert/strict'

const origin = process.env.DISCOVERY_TEST_ORIGIN ?? 'http://127.0.0.1:3002'
const read = async (path, options) => {
  const response = await fetch(new URL(path, origin), options)
  return { response, html: await response.text() }
}
const { html: sitemap } = await read('/sitemap-pages.xml')
const publicPaths = [...sitemap.matchAll(/<loc>https:\/\/liftag\.fit([^<]*)<\/loc>/g)]
  .map((match) => match[1] || '/')
  .filter((path) => !path.startsWith('/cs/'))
assert.ok(publicPaths.length > 40, 'both languages must be represented in the public sitemap')
for (const path of publicPaths) {
  const language = path === '/sk' || path.startsWith('/sk/') ? 'sk' : 'en'
  const { response, html } = await read(path, {
    headers: { accept: 'text/html', cookie: `liftag-language=${language === 'en' ? 'sk' : 'en'}` },
  })
  assert.equal(response.status, 200, `${path}: sitemap destination`)
  assert.match(html, new RegExp(`<html[^>]*lang="${language}"`), `${path}: initial HTML`)
  assert.ok(html.includes(`href="https://liftag.fit${path}"`), `${path}: canonical`)
  assert.match(html, /hreflang="en"/, path)
  assert.match(html, /hreflang="sk"/, path)
  for (const match of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    const structured = JSON.parse(match[1])
    for (const item of structured['@graph'] ?? []) {
      if (item['@type'] !== 'FAQPage') continue
      for (const question of item.mainEntity) {
        assert.equal(typeof question.name, 'string', `${path}: FAQ question must be resolved text`)
        assert.equal(
          typeof question.acceptedAnswer.text,
          'string',
          `${path}: FAQ answer must be resolved text`,
        )
      }
    }
  }
}
for (const [path, language, title] of [
  ['/contact/support', 'en', 'Support | LIFTAG'],
  ['/sk/contact/support', 'sk', 'Podpora | LIFTAG'],
  ['/privacy-policy', 'en'],
  ['/sk/privacy-policy', 'sk'],
  ['/cs/privacy-policy', 'cs'],
  ['/terms-and-conditions', 'en'],
  ['/sk/terms-and-conditions', 'sk'],
  ['/cs/terms-and-conditions', 'cs'],
]) {
  // Repeated, interleaved requests must not borrow another language's rendered HTML.
  for (const cookie of ['en', 'sk']) {
    const { response, html } = await read(path, {
      headers: { cookie: `liftag-language=${cookie}`, 'accept-language': 'sk-SK' },
    })
    assert.equal(response.status, 200, path)
    assert.match(html, new RegExp(`<html[^>]*lang="${language}"`), path)
    if (title) assert.ok(html.includes(`<title>${title}</title>`), path)
    assert.ok(html.includes(`href="https://liftag.fit${path}"`), `${path}: canonical`)
    if (language !== 'cs') {
      assert.match(html, /hreflang="en"/)
      assert.match(html, /hreflang="sk"/)
    }
    assert.doesNotMatch(response.headers.get('set-cookie') ?? '', /liftag-language=/)
  }
}
for (const [path, expected] of [
  ['/pricing?lang=sk&campaign=test', '/sk/pricing?lang=sk&campaign=test'],
  ['/sk/pricing?lang=en&campaign=test', '/pricing?lang=en&campaign=test'],
  ['/?lang=sk&campaign=test', '/sk?lang=sk&campaign=test'],
  [
    '/exercises/barbell-bench-press?lang=sk&gymId=fixture',
    '/sk/exercises/barbell-bench-press?lang=sk&gymId=fixture',
  ],
  ['/gym-scan?lang=sk&campaign=test', '/sk/gym-scan?lang=sk&campaign=test'],
]) {
  const { response } = await read(path, { redirect: 'manual' })
  assert.ok([302, 307, 308].includes(response.status), path)
  assert.equal(
    new URL(response.headers.get('location'), origin).pathname +
      new URL(response.headers.get('location'), origin).search,
    expected,
  )
  assert.match(response.headers.get('cache-control') ?? '', /no-store/, path)
}
for (const path of ['/get?lang=sk', '/auth/callback?lang=sk', '/plans/fixture?lang=sk']) {
  const { response, html } = await read(path)
  assert.equal(response.status, 200, path)
  assert.equal(new URL(response.url).pathname, path.split('?')[0], path)
  assert.match(html, /<html[^>]*lang="sk"/, path)
}
for (const [path, language] of [
  ['/sk/exercises/not-a-real-exercise', 'sk'],
  ['/sk/does-not-exist', 'sk'],
  ['/exercises/not-a-real-exercise', 'en'],
]) {
  const { response, html } = await read(path, { headers: { accept: 'text/html' } })
  assert.equal(response.status, 404)
  assert.match(html, new RegExp(`<html[^>]*lang="${language}"`), path)
  assert.match(html, /noindex/)
}
console.log(
  'Locale integration checks passed: SSR, precedence, legacy redirects, stable routes, canonicals, alternates and cookie isolation.',
)
