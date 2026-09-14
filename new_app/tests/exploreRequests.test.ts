import assert from 'node:assert/strict'
import { test } from 'node:test'
import { computed, effectScope, nextTick, onScopeDispose, reactive, ref, shallowRef, watch } from 'vue'
import { useExplore } from '../composables/useExplore.ts'
import { discoveryMapKey } from '../utils/discovery.ts'
import { normalizeExploreGym } from '../utils/discoveryData.ts'
import { fixtureGym } from './fixtures/discovery.ts'

test('Explore keeps viewport state, rejects obsolete responses, and preserves pending input across language changes', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const route = reactive({ path: '/explore', query: {} as Record<string, string> })
  let mount: () => Promise<void> = async () => {}
  const requests: { signal: AbortSignal; resolve: (value: unknown) => void }[] = []
  const globals = {
    computed,
    ref,
    shallowRef,
    watch,
    onScopeDispose,
    useRoute: () => route,
    useRouter: () => ({
      replace: ({ query }: { query: Record<string, string> }) => {
        route.query = query
      },
    }),
    useState: (_key: string, initial: () => unknown) => ref(initial()),
    useDiscoveryLocation: () => ({
      location: ref(null),
      locating: ref(false),
      denied: ref(false),
      locate: async () => null,
    }),
    onMounted: (callback: typeof mount) => {
      mount = callback
    },
    onBeforeUnmount: () => {},
    $fetch: (_url: string, options: { signal: AbortSignal }) =>
      new Promise((resolve) => {
        requests.push({ signal: options.signal, resolve })
      }),
  }
  for (const [key, value] of Object.entries(globals)) {
    Object.defineProperty(globalThis, key, { value, configurable: true })
    t.after(() => {
      Reflect.deleteProperty(globalThis, key)
    })
  }
  const scope = effectScope()
  t.after(() => scope.stop())
  const locale = ref<'en' | 'sk'>('en')
  const browse = scope.run(() => useExplore(locale))!
  const gym = normalizeExploreGym(fixtureGym())
  const result = (name: string) => ({
    items: [{ ...gym, name }],
    meta: { truncated: false, tooLarge: false },
  })
  const flush = async () => {
    await Promise.resolve()
    await Promise.resolve()
    await nextTick()
    await Promise.resolve()
  }
  await mount()
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
