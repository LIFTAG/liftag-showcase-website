import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'
import * as vue from 'vue'
import { renderToString } from 'vue/server-renderer'
import { compileScript, parse } from 'vue/compiler-sfc'
import * as handoff from '../i18n/messages/handoff.ts'
import * as qrCode from '../utils/qrCode.ts'
import * as siteLocale from '../utils/siteLocale.ts'
import * as userAgent from '../utils/userAgent.ts'

const id = '11111111-1111-4111-8111-111111111111'
const safari = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'
const instagram = `${safari} Instagram 400.0.0`
const macChrome = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'
const resources = ['routines', 'plans', 'qr', 'trainer-invites']

// Compile the real Vue scripts AND templates so tests exercise the complete
// page-to-handoff wiring, including the user-visible native app anchor.
async function renderHandoff(resource: string | null, ua: string, locale = 'en', sharedName: string | null = null) {
  const mounted: (() => void)[] = []
  const navigations: string[] = []
  const location = { href: '', replace: (url: string) => navigations.push(url) }
  function component(path: string): vue.Component {
    const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    const { descriptor } = parse(source, { filename: path })
    const compiled = compileScript(descriptor, { id: path, inlineTemplate: true }).content
    const code = ts.transpileModule(compiled.replaceAll('import.meta.client', 'true'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText
    const exports: { default?: vue.Component } = {}
    runInNewContext(code, {
      ...vue, ...userAgent, ...qrCode, exports,
      window: { location }, navigator: { userAgent: ua },
      useRequestHeaders: () => ({ 'user-agent': ua }),
      useRoute: () => ({ params: { id }, query: { v: 'f', lang: locale } }),
      useSiteLocale: () => ({ locale: vue.ref(locale), href: (path: string) => siteLocale.withSiteLocaleQuery(path, locale as 'en' | 'sk') }),
      useI18n: () => ({ t: (key: string) => (locale === 'sk' ? handoff.sk : handoff.en).handoff[key.split('.')[1] as keyof typeof handoff.en.handoff] }),
      useAsyncData: async () => ({ data: vue.ref(sharedName ? { name: sharedName } : null) }),
      useState: (_key: string, init: () => unknown) => vue.ref(init()),
      useHead: () => {}, useLiftagSeo: () => {}, definePageMeta: () => {},
      absoluteUrl: (path: string) => `https://liftag.fit${path}`,
      onMounted: (callback: () => void) => mounted.push(callback),
      onBeforeUnmount: () => {},
      require: (name: string) => {
        if (name === 'vue') return vue
        if (name === '~/i18n/messages/handoff') return handoff
        if (name === '~/utils/siteLocale') return siteLocale
        throw new Error(`Unexpected import: ${name}`)
      },
    })
    return exports.default!
  }
  const escape = component('../components/StoreEscape.vue')
  const app = resource
    ? vue.createSSRApp(component(`../pages/${resource}/[id].vue`))
    : vue.createSSRApp(escape, { shareUrl: 'https://liftag.fit/get' })
  Object.assign(app.config.globalProperties, {
    APP_STORE_URL: userAgent.APP_STORE_URL,
    absoluteUrl: (path: string) => `https://liftag.fit${path}`,
  })
  app.component('StoreEscape', escape)
  app.component('DesktopHandoff', component('../components/DesktopHandoff.vue'))
  app.component('ShareQrCode', component('../components/ShareQrCode.vue'))
  app.component('QrPrismFrame', component('../components/QrPrismFrame.vue'))
  app.component('ShareLinkField', component('../components/ShareLinkField.vue'))
  app.component('ExerciseWall', component('../components/ExerciseWall.vue'))
  const html = await renderToString(app)
  for (const mount of mounted) mount()
  return { html, location, navigations }
}

for (const resource of resources) {
  test(`${resource}: Instagram forwards the shared resource and locale, not the store`, async () => {
    const { html, location, navigations } = await renderHandoff(resource, instagram, 'sk')
    const external = new URL(location.href)
    assert.equal(external.protocol, 'instagram:')
    assert.equal(external.hostname, 'extbrowser')
    const target = new URL(external.searchParams.get('url')!)
    assert.equal(target.origin, 'https://liftag.fit')
    assert.equal(target.pathname, `/${resource}/${id}`)
    assert.equal(target.searchParams.get('lang'), 'sk')
    if (resource === 'routines' || resource === 'plans') assert.equal(target.searchParams.get('v'), 'f')
    assert.match(html, /Pokračovať do LIFTAGu/)
    assert.deepEqual(navigations, [])
  })

  test(`${resource}: Safari keeps the native app destination available without a store redirect`, async () => {
    const { html, location, navigations } = await renderHandoff(resource, safari)
    assert.ok(html.includes(`href="liftag://${resource}/${id}"`))
    assert.match(html, /Open in LIFTAG/)
    assert.match(html, /Need LIFTAG\? Download on the App Store/)
    assert.doesNotMatch(html, /class="escape__steps"/)
    assert.equal(location.href, '')
    assert.deepEqual(navigations, [])
  })

  test(`${resource}: Android retains its app intent and Play Store fallback`, async () => {
    const { navigations } = await renderHandoff(resource, 'Mozilla/5.0 (Linux; Android 15) Chrome/130.0')
    assert.equal(navigations.length, 1)
    assert.ok(navigations[0]!.startsWith(`intent://liftag.fit/${resource}/${id}#Intent;`))
    assert.ok(navigations[0]!.includes('package=com.liftag.app;'))
    assert.ok(navigations[0]!.includes(encodeURIComponent(userAgent.PLAY_STORE_URL)))
  })
}

test('Instagram install-only pages still hand off to the App Store', async () => {
  const { html, location } = await renderHandoff(null, instagram)
  assert.equal(new URL(location.href).searchParams.get('url'), userAgent.APP_STORE_URL)
  assert.match(html, /Open LIFTAG in App Store/)
})

for (const locale of ['en', 'sk'] as const) {
  test(`routines: desktop (${locale}) stays on the page and offers the full share URL as a QR code`, async () => {
    const { html, location, navigations } = await renderHandoff('routines', macChrome, locale)
    const shareUrl = `https://liftag.fit/routines/${id}?v=f&lang=${locale}`
    const messages = handoff[locale].handoff
    assert.deepEqual(navigations, [])
    assert.equal(location.href, '')
    assert.ok(html.includes(messages.desktopRoutineHeading))
    assert.ok(html.includes(messages.desktopRoutineBody))
    assert.ok(html.includes(`value="${shareUrl.replaceAll('&', '&amp;')}"`))
    assert.ok(
      html.includes(`d="${qrCode.qrCodeSvg(shareUrl, { markRatio: qrCode.QR_LOGO_RATIO }).path}"`),
      'QR encodes the share URL, query included',
    )
    assert.match(html, /class="prism-rim qr-frame__rim"/, 'QR sits in the prism frame with the logo')
    assert.ok(html.includes(`aria-label="${messages.qrLabel}"`))
    assert.ok(html.includes(`href="${userAgent.APP_STORE_URL}"`))
    assert.ok(html.includes(`href="${userAgent.PLAY_STORE_URL}"`))
    assert.doesNotMatch(html, /escape__primary|routine-redirect/)
  })
}

test('routines: desktop copy stays generic even when the routine name is known', async () => {
  const { html } = await renderHandoff('routines', macChrome, 'en', 'Coach Ana: private deload week')
  assert.doesNotMatch(html, /private deload week/)
})

test('QR encoding keeps a share link large enough to scan off a screen', () => {
  const { size, path, mark } = qrCode.qrCodeSvg(`https://liftag.fit/routines/${id}?v=f&lang=sk`)
  // Version 5 (37 modules) plus a four-module quiet zone on each side.
  assert.equal(size, 45)
  assert.equal(mark, 0)
  assert.match(path, /^M4 4h7v1h-7z/, 'finder pattern starts inside the quiet zone')
})

test('QR encoding clears a centred square for the logo and nothing else', () => {
  const url = `https://liftag.fit/routines/${id}?v=f&lang=sk`
  const { size, path, mark } = qrCode.qrCodeSvg(url, { markRatio: qrCode.QR_LOGO_RATIO })
  // Level H for the logo: version 8 (49 modules) plus the quiet zone.
  assert.equal(size, 57)
  assert.equal(mark, 13)
  assert.match(path, /^M4 4h7v1h-7z/, 'finder pattern is untouched')
  const start = (size - mark) / 2
  const runs = [...path.matchAll(/M(\d+) (\d+)h(\d+)/g)].map(([, x, y, run]) => [Number(x), Number(y), Number(run)])
  const inMark = runs.filter(([x, y, run]) => y >= start && y < start + mark && x < start + mark && x + run > start)
  assert.deepEqual(inMark, [], 'no module is drawn under the logo')
  assert.ok(runs.some(([, y]) => y === start - 1), 'modules still border the logo')
})
