import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'
import { computed, nextTick, reactive, readonly, ref, type Ref } from 'vue'
import * as localeUtils from '../utils/siteLocale.ts'

const source = readFileSync(new URL('../composables/useSiteLocale.ts', import.meta.url), 'utf8')
const script = ts.transpileModule(source.replaceAll('import.meta.server', 'false'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText

for (const outcome of ['success', 'failure'] as const) {
  test(`manual language navigation waits for the router during other middleware (${outcome})`, async () => {
    const route = reactive({ path: '/explore', query: { lang: 'en', gym: 'selected-gym' }, hash: '#results' })
    const switching = ref(false)
    const saved = ref<string | null>(null)
    let complete!: () => void
    let fail!: (error: Error) => void
    const navigation = new Promise<void>((resolve, reject) => { complete = resolve; fail = reject })
    let target: unknown
    const exports = {} as { useSiteLocale: () => { setLocale: (value: string) => Promise<void>; switching: Ref<boolean> } }
    runInNewContext(script, {
      exports, computed, nextTick, readonly, navigator: { language: 'en-US' },
      useRoute: () => route,
      useRouter: () => ({ replace: (location: unknown) => { target = location; return navigation } }),
      useNuxtApp: () => ({ $i18n: { locale: ref('en') }, _processingMiddleware: true }),
      useState: (key: string, init: () => unknown) => key === 'site-locale-switching' ? switching : ref(init()),
      useCookie: () => saved,
      // Nuxt returns a redirect object while middleware is active. A user
      // action must still perform navigation, rather than await this object.
      navigateTo: (location: object) => ({ ...location, replace: true }),
      require: () => localeUtils,
    })
    const site = exports.useSiteLocale()
    const pending = site.setLocale('sk')
    await nextTick()
    assert.deepEqual(target, { path: '/sk/explore', query: { lang: 'sk', gym: 'selected-gym' }, hash: '#results' })
    assert.equal(site.switching.value, true, 'debounced search writes remain paused until navigation settles')
    assert.equal(saved.value, 'sk')
    if (outcome === 'success') {
      complete()
      await pending
    } else {
      const rejected = assert.rejects(pending, /Navigation failed/)
      fail(new Error('Navigation failed'))
      await rejected
    }
    assert.equal(site.switching.value, false)
  })
}
