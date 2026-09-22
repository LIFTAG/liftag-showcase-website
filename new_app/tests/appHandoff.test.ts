import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'
import * as vue from 'vue'
import { renderToString } from 'vue/server-renderer'
import { compileScript, parse } from 'vue/compiler-sfc'
import * as handoff from '../i18n/messages/handoff.ts'
import * as siteLocale from '../utils/siteLocale.ts'
import * as userAgent from '../utils/userAgent.ts'

const id = '11111111-1111-4111-8111-111111111111'
const safari = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'
const instagram = `${safari} Instagram 400.0.0`
const resources = ['routines', 'plans', 'qr', 'trainer-invites']

// Compile the real Vue scripts AND templates so tests exercise the complete
// page-to-handoff wiring, including the user-visible native app anchor.
async function renderHandoff(resource: string | null, ua: string, locale = 'en') {
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
      ...vue, ...userAgent, exports,
      window: { location }, navigator: { userAgent: ua },
      useRequestHeaders: () => ({ 'user-agent': ua }),
      useRoute: () => ({ params: { id }, query: { v: 'f', lang: locale } }),
      useSiteLocale: () => ({ locale: vue.ref(locale), href: (path: string) => siteLocale.withSiteLocaleQuery(path, locale as 'en' | 'sk') }),
      useI18n: () => ({ t: (key: string) => (locale === 'sk' ? handoff.sk : handoff.en).handoff[key.split('.')[1] as keyof typeof handoff.en.handoff] }),
      useAsyncData: async () => ({ data: vue.ref(null) }),
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
