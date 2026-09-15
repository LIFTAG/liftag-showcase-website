import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test, type TestContext } from 'node:test'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'
import { computed, effectScope, nextTick, reactive, ref, shallowRef, toValue, watch, type Ref } from 'vue'
import { parse } from 'vue/compiler-sfc'

// Run the production setup with Vue reactivity, controlling only transport and media APIs.
function compile(path: string, expose = '') {
  const file = readFileSync(new URL(path, import.meta.url), 'utf8')
  const source = path.endsWith('.vue') ? parse(file).descriptor.scriptSetup!.content : file
  return ts.transpileModule(source.replace("import('hls.js')", 'loadHls()') + expose, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
}
const gymScript = compile('../composables/useGymInstructionPreview.ts')
const discoveryScript = compile('../components/discovery/DiscoveryVideo.vue', '\nexports.player = { failed, onMediaError };')

function mediaHarness(t: TestContext) {
  const imports: Array<() => void> = []
  const instances: Player[] = []
  class Player {
    static Events = { ERROR: 'error' }
    static isSupported = () => true
    handlers = new Map<string, (event: string, data: { fatal: boolean }) => void>()
    loadSource = t.mock.fn()
    attachMedia = t.mock.fn()
    destroy = t.mock.fn()
    constructor() { instances.push(this) }
    on(event: string, callback: (event: string, data: { fatal: boolean }) => void) { this.handlers.set(event, callback) }
    error(fatal = true) { this.handlers.get('error')?.('error', { fatal }) }
  }
  const element = Object.assign(new EventTarget(), {
    src: '', pause: t.mock.fn(), load: t.mock.fn(), play: t.mock.fn(async () => {}),
    removeAttribute: t.mock.fn(), canPlayType: () => '',
  })
  const language = { bind: t.mock.fn(), unbind: t.mock.fn() }
  return {
    element, language, imports, instances,
    loadHls: () => new Promise(resolve => imports.push(() => resolve({ default: Player }))),
  }
}
async function settle() { await nextTick(); await new Promise(resolve => setImmediate(resolve)) }

function gym(t: TestContext) {
  const media = mediaHarness(t)
  const active = ref(true), locale = ref('en')
  const document = Object.assign(new EventTarget(), { hidden: false })
  let mount = () => {}, unmount = () => {}
  const scope = effectScope()
  const exports = {} as {
    useGymInstructionPreview: (video: Ref<unknown>, active: () => boolean, reduced: () => boolean, sameOrigin: boolean, locale: Ref<string>) => { failed: Ref<boolean>; loading: Ref<boolean> }
  }
  const source = ref('https://example.test/shared.m3u8')
  runInNewContext(gymScript, {
    exports, shallowRef, watch, nextTick, toValue, AbortController, document, navigator: {},
    onMounted: (fn: () => void) => { mount = fn }, onBeforeUnmount: (fn: () => void) => { unmount = fn },
    $fetch: async () => ({ videos: [] }), loadHls: media.loadHls,
    require(id: string) {
      if (id.includes('catalogVideo')) return { preferredCatalogVideoUrl: () => source.value }
      if (id.includes('equipment')) return { benchInstruction: { slug: 'bench' } }
      if (id.includes('coachingMedia')) return { coachingMediaSource: (s: string) => s }
      if (id.includes('useVideoLanguage')) return { useVideoLanguage: () => media.language }
      if (id.includes('exerciseVideoLanguage')) return { canUseNativeHls: () => false }
      throw Error(id)
    },
  })
  const preview = scope.run(() => exports.useGymInstructionPreview(ref(media.element), () => active.value, () => false, false, locale))
  const close = () => { unmount(); scope.stop() }
  t.after(close)
  mount()
  return { ...media, active, locale, source, document, preview, close }
}

for (const interruption of ['visibility', 'activity', 'locale', 'unmount'] as const) {
  test(`gym preview recovers from an import interrupted by ${interruption}`, async t => {
    const h = gym(t)
    await settle()
    assert.equal(h.imports.length, 1)
    if (interruption === 'visibility') { h.document.hidden = true; h.document.dispatchEvent(new Event('visibilitychange')) }
    if (interruption === 'activity') h.active.value = false
    if (interruption === 'locale') h.locale.value = 'sk'
    if (interruption === 'unmount') h.close()
    await settle()
    h.imports[0]!()
    await settle()
    assert.equal(h.instances.length, 0, 'obsolete work must not attach a player')
    if (interruption === 'unmount') return
    if (interruption === 'visibility') { h.document.hidden = false; h.document.dispatchEvent(new Event('visibilitychange')) }
    if (interruption === 'activity') h.active.value = true
    await settle()
    assert.equal(h.imports.length, 2)
    h.imports[1]!()
    await settle()
    assert.equal(h.instances.length, 1)
    assert.equal(h.language.bind.mock.callCount(), 1)
    assert.equal(h.element.play.mock.callCount(), 1)
    assert.equal(h.preview.failed.value, false)
    assert.equal(h.preview.loading.value, false)
  })
}

test('an old import finishing last cannot disturb a newer gym attachment', async t => {
  const h = gym(t)
  await settle()
  h.locale.value = 'sk'
  await settle()
  h.imports[1]!()
  await settle()
  h.imports[0]!()
  await settle()
  assert.equal(h.instances.length, 1)
  assert.equal(h.instances[0]!.destroy.mock.callCount(), 0)
  assert.equal(h.language.bind.mock.callCount(), 1)
})

for (const failure of ['hls', 'native'] as const) {
  test(`gym preview releases ${failure} errors and can retry the same element and source`, async t => {
    const h = gym(t)
    await settle(); h.imports[0]!(); await settle()
    if (failure === 'hls') h.instances[0]!.error()
    else h.element.dispatchEvent(new Event('error'))
    assert.equal(h.preview.failed.value, true)
    assert.equal(h.instances[0]!.destroy.mock.callCount(), 1)
    assert.equal(h.language.unbind.mock.callCount(), 1)
    assert.equal(h.element.load.mock.callCount(), 1)
    h.active.value = false; await settle(); h.active.value = true; await settle()
    h.imports[1]!(); await settle()
    assert.equal(h.preview.failed.value, false)
    assert.equal(h.instances.length, 2)
    h.instances[0]!.error()
    assert.equal(h.instances[1]!.destroy.mock.callCount(), 0, 'old error must not destroy the new player')
  })
}

test('same-source locale changes reuse gym playback; changed sources replace it', async t => {
  const h = gym(t)
  await settle(); h.imports[0]!(); await settle()
  h.locale.value = 'sk'; await settle()
  assert.equal(h.imports.length, 1)
  assert.equal(h.instances[0]!.destroy.mock.callCount(), 0)
  h.source.value = 'https://example.test/english.m3u8'
  h.locale.value = 'en'; await settle()
  assert.equal(h.instances[0]!.destroy.mock.callCount(), 1)
  h.imports[1]!(); await settle()
  assert.equal(h.instances[1]!.loadSource.mock.calls[0]!.arguments[0], h.source.value)
})

function discovery(t: TestContext) {
  const h = mediaHarness(t)
  const props = reactive({ src: 'https://example.test/video.m3u8', locale: 'sk', title: 'Test' })
  const exports = {} as {
    player: { failed: Ref<boolean>; onMediaError: (event: { currentTarget: EventTarget | null }) => void }
  }
  const scope = effectScope()
  let unmount = () => {}
  scope.run(() => runInNewContext(discoveryScript, {
    exports, computed, shallowRef, watch, nextTick, URL,
    defineProps: () => props, useTemplateRef: () => ref(h.element),
    onBeforeUnmount: (fn: () => void) => { unmount = fn },
    useVideoLanguage: () => h.language, loadHls: h.loadHls,
    require: () => ({ canUseNativeHls: () => false }),
  }))
  t.after(() => { unmount(); scope.stop() })
  return { ...h, props, player: exports.player }
}
for (const failure of ['hls', 'native'] as const) {
  test(`discovery ${failure} failure releases resources and a replacement source recovers`, async t => {
    const h = discovery(t)
    await settle(); h.imports[0]!(); await settle()
    h.instances[0]!.error(false)
    assert.equal(h.player.failed.value, false)
    if (failure === 'hls') h.instances[0]!.error()
    else h.player.onMediaError({ currentTarget: h.element })
    assert.equal(h.player.failed.value, true)
    assert.equal(h.instances[0]!.destroy.mock.callCount(), 1)
    assert.equal(h.language.unbind.mock.callCount(), 1)
    assert.equal(h.element.pause.mock.callCount(), 1)
    h.props.src = 'https://example.test/replacement.m3u8'
    await settle(); h.imports[1]!(); await settle()
    h.instances[0]!.error()
    assert.equal(h.player.failed.value, false)
    assert.equal(h.instances[1]!.destroy.mock.callCount(), 0)
  })
}

test('a native discovery error during the import cancels pending attachment', async t => {
  const h = discovery(t)
  await settle()
  h.player.onMediaError({ currentTarget: h.element })
  h.imports[0]!(); await settle()
  assert.equal(h.instances.length, 0)
  assert.equal(h.language.bind.mock.callCount(), 0)
  assert.equal(h.player.failed.value, true)
})

test('native gym media binds language, releases on error, and retries without HLS', async t => {
  const h = gym(t)
  h.source.value = 'https://example.test/video.mp4'
  await settle()
  assert.equal(h.imports.length, 0)
  assert.equal(h.element.src, h.source.value)
  assert.equal(h.language.bind.mock.callCount(), 1)
  h.element.dispatchEvent(new Event('error'))
  assert.equal(h.preview.failed.value, true)
  assert.equal(h.language.unbind.mock.callCount(), 1)
  h.active.value = false; await settle(); h.active.value = true; await settle()
  assert.equal(h.preview.failed.value, false)
  assert.equal(h.language.bind.mock.callCount(), 2)
})
