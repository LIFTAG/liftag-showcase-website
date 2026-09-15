import assert from 'node:assert/strict'
import { test, type TestContext } from 'node:test'
import { computed, effectScope, nextTick, onScopeDispose, reactive, ref, shallowRef, watch } from 'vue'
import { useExplore } from '../composables/useExplore.ts'
import { discoveryMapKey } from '../utils/discovery.ts'
import { normalizeExploreGym } from '../utils/discoveryData.ts'
import { fixtureGym } from './fixtures/discovery.ts'

function setupExplore(t: TestContext, query: Record<string, string> = {}) {
  t.mock.timers.enable({ apis: ['setTimeout', 'Date'], now: 100000 })
  const route = reactive({ path: '/explore', query })
  const session = ref<unknown>(null)
  const switching = ref(false)
  let mount: () => Promise<void> = async () => {}
  let beforeUnmount: () => void = () => {}
  const requests: {
    query: Record<string, unknown>
    signal: AbortSignal
    resolve: (value: unknown) => void
    reject: (reason: Error) => void
  }[] = []
  const globals = {
    computed,
    ref,
    shallowRef,
    watch,
    onScopeDispose,
    useRoute: () => route,
    useSiteLocale: () => ({ switching }),
    useRouter: () => ({
      replace: ({ query }: { query: Record<string, string> }) => {
        route.query = query
      },
    }),
    useState: () => session,
    useDiscoveryLocation: () => ({
      location: ref(null),
      locating: ref(false),
      denied: ref(false),
      locate: async () => null,
    }),
    onMounted: (callback: typeof mount) => {
      mount = callback
    },
    onBeforeUnmount: (callback: () => void) => { beforeUnmount = callback },
    $fetch: (_url: string, options: { signal: AbortSignal; query: Record<string, unknown> }) =>
      new Promise((resolve, reject) => {
        requests.push({ ...options, resolve, reject })
      }),
  }
  for (const [key, value] of Object.entries(globals)) {
    Object.defineProperty(globalThis, key, { value, configurable: true })
    t.after(() => {
      Reflect.deleteProperty(globalThis, key)
    })
  }
  const locale = ref<'en' | 'sk'>('en')
  const gym = normalizeExploreGym(fixtureGym())
  const result = (name: string) => ({
    items: [{ ...gym, name }],
    meta: { truncated: false, tooLarge: false, currentPage: 1, lastPage: 2 },
  })
  const flush = async () => {
    await Promise.resolve()
    await Promise.resolve()
    await nextTick()
    await Promise.resolve()
  }
  const tick = async (milliseconds: number) => {
    t.mock.timers.tick(milliseconds)
    await flush()
  }
  async function create() {
    route.path = '/explore'
    const scope = effectScope()
    t.after(() => scope.stop())
    const browse = scope.run(() => useExplore(locale))!
    const persist = beforeUnmount
    await mount()
    await flush()
    return {
      browse,
      leave: () => {
        persist()
        scope.stop()
        route.path = '/gyms/example'
      },
    }
  }
  return { route, locale, switching, gym, requests, result, flush, tick, create }
}

test('Explore keeps viewport state, rejects obsolete responses, and preserves pending input across language changes', async (t) => {
  const { route, locale, gym, requests, result, flush, create } = setupExplore(t)
  const { browse } = await create()
  requests[0]!.resolve(result('Original gym'))
  await flush()
  assert.equal(browse.visible.value[0]?.name, 'Original gym')

  const original = browse.visible.value[0]
  const nextView = { ...browse.viewport.value, north: 51.5 }
  browse.updateViewport(nextView)
  await nextTick()
  assert.equal(browse.loading.value, true)
  assert.equal(browse.visible.value[0], original, 'Refreshing must retain the displayed marker data')
  t.mock.timers.tick(250)
  await nextTick()
  assert.equal(requests.length, 2)

  browse.updateViewport({ ...nextView, lat: nextView.lat + 0.0000001, north: nextView.north + 0.0000001 })
  await nextTick()
  t.mock.timers.tick(250)
  assert.equal(requests.length, 2, 'Sub-meter camera jitter must not refetch')
  assert.deepEqual(discoveryMapKey(nextView), discoveryMapKey(browse.viewport.value))

  browse.updateViewport({ ...nextView, north: 52 })
  await nextTick()
  assert.equal(requests[1]!.signal.aborted, true)
  t.mock.timers.tick(250)
  requests[2]!.resolve(result('Current viewport'))
  await flush()
  requests[1]!.resolve(result('Obsolete viewport'))
  await flush()
  assert.equal(browse.visible.value[0]?.name, 'Current viewport')
  assert.equal(browse.loading.value, false)

  browse.filters.value.manufacturers = ['66666666-6666-4666-8666-666666666666']
  await nextTick()
  assert.equal(
    browse.visible.value.length,
    0,
    'Old manufacturer results must not masquerade as filtered results',
  )

  // Switch language before the pending 100ms URL write can persist user input.
  browse.search.value = 'Matrix gym'
  browse.select(gym)
  await nextTick()
  const pendingView = { ...browse.viewport.value }
  route.query = { ...route.query, lang: 'sk' }
  locale.value = 'sk'
  await nextTick()
  assert.equal(browse.search.value, 'Matrix gym')
  assert.equal(browse.selectedId.value, gym.id)
  assert.deepEqual(browse.viewport.value, pendingView)
  assert.deepEqual(browse.filters.value.manufacturers, ['66666666-6666-4666-8666-666666666666'])
  t.mock.timers.tick(100)
  await nextTick()
  assert.equal(route.query.q, 'Matrix gym')
  assert.equal(route.query.lang, 'sk')
  assert.equal(route.query.gym, gym.id)

  // Actual Back/Forward query changes must still restore the requested state.
  route.query = { ...route.query, q: 'Another gym' }
  await nextTick()
  assert.equal(browse.search.value, 'Another gym')
})

test('trim-equivalent search edits preserve pending requests, results, and pagination', async (t) => {
  const { requests, result, flush, tick, create } = setupExplore(t, { q: 'Matrix' })
  const { browse } = await create()
  browse.search.value = ' Matrix '
  await tick(1000)
  assert.equal(requests[0]!.signal.aborted, false)
  assert.equal(requests.length, 1)
  requests[0]!.resolve(result('Matrix result'))
  await flush()
  browse.search.value = 'Matrix  '
  await flush()
  await tick(1000)
  assert.equal(browse.loading.value, false)
  assert.equal(requests.length, 1)
  const more = browse.loadMore()
  assert.equal(requests[1]!.query.page, 2)
  requests[1]!.resolve({ ...result('Next page'), meta: { currentPage: 2, lastPage: 2 } })
  await more

  browse.search.value = 'Booty'
  await flush()
  await tick(100)
  browse.search.value = 'Booty '
  await flush()
  await tick(200)
  await tick(250)
  assert.equal(requests[2]!.query.search, 'Booty')
  requests[2]!.resolve(result('Booty result'))
  await flush()
  assert.equal(browse.loading.value, false)
  assert.equal(browse.visible.value[0]?.name, 'Booty result')
})

test('returning to a completed search restores its results and list position without refetching', async (t) => {
  const { requests, result, flush, create } = setupExplore(t, { q: 'Matrix' })
  const first = await create()
  requests[0]!.resolve(result('Matrix result'))
  await flush()
  first.browse.scroll.value = 120
  first.leave()
  const second = await create()
  assert.equal(requests.length, 1)
  assert.equal(second.browse.visible.value[0]?.name, 'Matrix result')
  assert.equal(second.browse.scroll.value, 120)
  assert.equal(second.browse.loading.value, false)
})

for (const phase of ['debounce', 'pending', 'failed'] as const) {
  test(`returning during a ${phase} search cannot reuse another search's freshness`, async (t) => {
    const { requests, result, flush, tick, create } = setupExplore(t, { q: 'Matrix' })
    const first = await create()
    requests[0]!.resolve(result('Matrix result'))
    await flush()
    first.browse.search.value = 'Booty'
    await flush()
    await tick(100)
    if (phase !== 'debounce') {
      await tick(200)
      await tick(250)
      if (phase === 'failed') {
        requests[1]!.reject(new Error('Temporary API failure'))
        await flush()
      }
    }
    first.leave()
    const before = requests.length
    const second = await create()
    assert.equal(second.browse.search.value, 'Booty')
    assert.deepEqual(second.browse.visible.value, [])
    assert.equal(requests.length, before + 1)
    assert.equal(requests.at(-1)!.query.search, 'Booty')
    requests.at(-1)!.resolve(result('Booty result'))
    await flush()
    assert.equal(second.browse.visible.value[0]?.name, 'Booty result')
    assert.equal(second.browse.loading.value, false)
  })
}


test('a pending query write cannot cancel a slower locale navigation', async (t) => {
  const { route, locale, switching, create, tick, flush } = setupExplore(t, { lang: 'en' })
  const { browse } = await create()
  browse.search.value = 'Pending search'
  await flush()
  switching.value = true
  await flush()
  await tick(200)
  assert.equal(route.query.q, undefined, 'Do not replace the route while its language switch is pending')
  route.path = '/sk/explore'
  route.query = { ...route.query, lang: 'sk' }
  locale.value = 'sk'
  switching.value = false
  await flush()
  await tick(100)
  assert.equal(route.query.q, 'Pending search')
  assert.equal(route.query.lang, 'sk')
  assert.equal(browse.search.value, 'Pending search')
})
