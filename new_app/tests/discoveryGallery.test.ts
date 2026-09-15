import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test, type TestContext } from 'node:test'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'
import { computed, effectScope, nextTick, reactive, ref, shallowRef, watch, type Ref } from 'vue'
import { parse } from 'vue/compiler-sfc'
import type { DiscoveryMedia } from '../types/discovery.ts'
import * as discoveryCopy from '../utils/discoveryCopy.ts'

// Exercise the real setup handlers, following the existing media-player test harness.
const { descriptor } = parse(readFileSync(new URL('../components/discovery/DiscoveryGallery.vue', import.meta.url), 'utf8'))
const script = ts.transpileModule(
  descriptor.scriptSetup!.content + '\nexports.gallery = { index, expanded, zoomed, animate, direction, select, viewerKeydown, step };',
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
).outputText

class Element {
  interactive: boolean
  constructor(interactive = false) { this.interactive = interactive }
  closest() { return this.interactive ? this : null }
}

function setupGallery(t: TestContext, count = 3) {
  const props = reactive({
    media: Array.from({ length: count }, (_, i): DiscoveryMedia => i === 1
      ? { type: 'video', url: '/gym.mp4' }
      : { type: 'image', url: `/photo-${i}.jpg` }),
    name: 'Gym', locale: 'sk',
  })
  const viewport = Object.assign(new EventTarget(), { scale: 1 })
  const mounted: (() => void)[] = []
  const cleanup: (() => void)[] = []
  const exports = {} as { gallery: {
    index: Ref<number>; expanded: Ref<boolean>; zoomed: Ref<boolean>; animate: Ref<boolean>; direction: Ref<number>
    select: (index: number) => void; viewerKeydown: (event: KeyboardEvent) => void; step: (delta: number) => void
  } }
  const scope = effectScope()
  t.after(() => { cleanup.forEach(fn => fn()); scope.stop() })
  scope.run(() => runInNewContext(script, {
    exports, computed, ref, shallowRef, watch, nextTick, HTMLElement: Element,
    useTemplateRef: () => shallowRef(null),
    window: { visualViewport: viewport },
    onMounted: (fn: () => void) => mounted.push(fn),
    onBeforeUnmount: (fn: () => void) => cleanup.push(fn),
    defineProps: () => props,
    require: (id: string) => {
      assert.equal(id, '~/utils/discoveryCopy')
      return discoveryCopy
    },
  }))
  mounted.forEach(fn => fn())
  return { gallery: exports.gallery, props, viewport, cleanup }
}

test('arrows wrap in their direction while direct selection follows its target', t => {
  const { gallery } = setupGallery(t)
  gallery.step(-1)
  assert.equal(gallery.index.value, 2)
  assert.equal(gallery.direction.value, -1)
  gallery.step(1)
  assert.equal(gallery.index.value, 0)
  assert.equal(gallery.direction.value, 1)
  gallery.select(2)
  assert.equal(gallery.index.value, 2)
  assert.equal(gallery.direction.value, 1)
})

test('keyboard navigation is immediate and does not take over video controls', t => {
  const { gallery } = setupGallery(t)
  const key = (interactive = false) => ({
    key: 'ArrowRight', target: new Element(interactive), preventDefault: t.mock.fn(),
  }) as unknown as KeyboardEvent
  gallery.viewerKeydown(key(true))
  assert.equal(gallery.index.value, 0)
  gallery.viewerKeydown(key())
  assert.equal(gallery.index.value, 1)
  assert.equal(gallery.animate.value, false)
  gallery.step(1)
  assert.equal(gallery.animate.value, true)
})

test('photo touch behavior follows viewport zoom and releases its listener on unmount', t => {
  const { gallery, viewport, cleanup } = setupGallery(t)
  assert.equal(gallery.zoomed.value, false)
  viewport.scale = 2
  viewport.dispatchEvent(new Event('resize'))
  assert.equal(gallery.zoomed.value, true)
  viewport.scale = 1
  viewport.dispatchEvent(new Event('resize'))
  assert.equal(gallery.zoomed.value, false)
  cleanup.forEach(fn => fn())
  viewport.scale = 2
  viewport.dispatchEvent(new Event('resize'))
  assert.equal(gallery.zoomed.value, false)
})

test('empty and single-item galleries do not navigate', t => {
  for (const count of [0, 1]) {
    const { gallery } = setupGallery(t, count)
    gallery.step(1)
    assert.equal(gallery.index.value, 0)
  }
})

test('changing gyms resets the selected media and closes fullscreen', async t => {
  const { gallery, props } = setupGallery(t)
  gallery.step(1)
  gallery.expanded.value = true
  props.media = [{ type: 'image', url: '/another-gym.jpg' }]
  await nextTick()
  assert.equal(gallery.index.value, 0)
  assert.equal(gallery.expanded.value, false)
})
