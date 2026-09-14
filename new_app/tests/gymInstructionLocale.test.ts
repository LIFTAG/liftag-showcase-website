import assert from 'node:assert/strict'
import { test } from 'node:test'
import { effectScope, nextTick, onScopeDispose, ref, shallowRef, toValue, watch } from 'vue'
import { useGymInstructionPreview } from '../composables/useGymInstructionPreview.ts'

test('demo instructions abort and reject the old language response after switching', async (t) => {
  let mount = () => {}
  let unmount = () => {}
  const requests: { url: string; signal: AbortSignal; resolve: (value: unknown) => void }[] = []
  const scope = effectScope()
  t.after(() => {
    unmount()
    scope.stop()
  })
  const globals = {
    shallowRef,
    nextTick,
    toValue,
    watch,
    onScopeDispose,
    onMounted: (fn: typeof mount) => {
      mount = fn
    },
    onBeforeUnmount: (fn: typeof unmount) => {
      unmount = fn
    },
    document: Object.assign(new EventTarget(), { hidden: false }),
    navigator: {},
    $fetch: (url: string, options: { signal: AbortSignal }) =>
      new Promise((resolve) => requests.push({ url, signal: options.signal, resolve })),
  }
  for (const [key, value] of Object.entries(globals)) {
    const original = Object.getOwnPropertyDescriptor(globalThis, key)
    Object.defineProperty(globalThis, key, { value, configurable: true })
    t.after(() =>
      original ? Object.defineProperty(globalThis, key, original) : Reflect.deleteProperty(globalThis, key),
    )
  }
  const locale = ref<'en' | 'sk'>('en')
  const preview = scope.run(() =>
    useGymInstructionPreview(
      ref(null),
      () => true,
      () => false,
      false,
      locale,
    ),
  )!
  mount()
  assert.match(requests[0]!.url, /locale=en$/)
  locale.value = 'sk'
  await nextTick()
  assert.equal(requests[0]!.signal.aborted, true)
  assert.match(requests[1]!.url, /locale=sk$/)
  const slovak = { name: 'Slovak instruction', videos: [] }
  requests[1]!.resolve(slovak)
  await nextTick()
  await nextTick()
  assert.deepEqual(preview.exercise.value, slovak)
  requests[0]!.resolve({ name: 'Obsolete English instruction', videos: [] })
  await nextTick()
  assert.deepEqual(preview.exercise.value, slovak)
  assert.equal(preview.loading.value, false)
})
