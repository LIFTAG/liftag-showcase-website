import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test, type TestContext } from 'node:test'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'
import { computed, effectScope, nextTick, reactive, ref, shallowRef, watch } from 'vue'
import { parse } from 'vue/compiler-sfc'
import * as discoveryCopy from '../utils/discoveryCopy.ts'

const { descriptor } = parse(readFileSync(new URL('../components/discovery/DiscoveryGalleryCarousel.vue', import.meta.url), 'utf8'))
const script = ts.transpileModule(
  descriptor.scriptSetup!.content + '\nexports.carousel = { settle, slides };',
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
).outputText

async function setupCarousel(t: TestContext, count = 3) {
  const props = reactive({
    media: Array.from({ length: count }, (_, i) => ({ type: i === 1 ? 'video' : 'image', url: `/media-${i}` })),
    index: 0, name: 'Gym', locale: 'sk', active: true, animate: true, direction: 1, zoomed: false,
  })
  const element = {
    clientWidth: 390, scrollLeft: 0, onscrollend: null,
    scrollTo: t.mock.fn(({ left }: { left: number; behavior: string }) => { element.scrollLeft = left }),
  }
  const mounted: (() => Promise<void>)[] = []
  const cleanup: (() => void)[] = []
  const disconnect = t.mock.fn()
  let onResize = () => {}
  class ResizeObserver {
    constructor(callback: () => void) { onResize = callback }
    observe() {}
    disconnect = disconnect
  }
  const exports = {} as { carousel: { settle: () => void; slides: { value: { clone: boolean }[] } } }
  const scope = effectScope()
  t.after(() => { cleanup.forEach(fn => fn()); scope.stop() })
  scope.run(() => runInNewContext(script, {
    exports, computed, ref, shallowRef, watch, nextTick, setTimeout, clearTimeout, ResizeObserver,
    defineProps: () => props, withDefaults: (value: unknown) => value,
    defineEmits: () => (_name: string, index: number) => { props.index = index },
    useTemplateRef: () => shallowRef(element),
    onMounted: (fn: () => Promise<void>) => mounted.push(fn),
    onBeforeUnmount: (fn: () => void) => cleanup.push(fn),
    require: (id: string) => { assert.equal(id, '~/utils/discoveryCopy'); return discoveryCopy },
  }))
  for (const mount of mounted) await mount()
  return { props, element, carousel: exports.carousel, onResize, cleanup, disconnect }
}

test('looping initializes on the first real slide and recenters either bookend', async t => {
  const { carousel, element, props } = await setupCarousel(t)
  assert.equal(carousel.slides.value.length, 5)
  assert.equal(element.scrollLeft, 390)
  element.scrollLeft = 0
  carousel.settle()
  await nextTick()
  assert.equal(props.index, 2)
  assert.equal(element.scrollLeft, 1170)
  element.scrollLeft = 1560
  carousel.settle()
  await nextTick()
  assert.equal(props.index, 0)
  assert.equal(element.scrollLeft, 390)
})

test('native scrolling selects the settled media without restarting its scroll', async t => {
  const { carousel, element, props } = await setupCarousel(t)
  element.scrollTo.mock.resetCalls()
  element.scrollLeft = 780
  carousel.settle()
  await nextTick()
  assert.equal(props.index, 1)
  assert.equal(element.scrollTo.mock.callCount(), 0)
})

test('two-item loops preserve previous and next animation direction', async t => {
  const { element, props } = await setupCarousel(t, 2)
  props.direction = -1
  props.index = 1
  await nextTick()
  assert.equal(element.scrollLeft, 0)
  assert.equal(element.scrollTo.mock.calls.at(-1)!.arguments[0].behavior, 'auto')
  props.direction = 1
  props.index = 0
  await nextTick()
  assert.equal(element.scrollLeft, 1170)
})

test('keyboard changes and hidden-gallery synchronization jump without motion', async t => {
  const { element, props } = await setupCarousel(t)
  props.animate = false
  props.index = 1
  await nextTick()
  assert.equal(element.scrollTo.mock.calls.at(-1)!.arguments[0].behavior, 'instant')
  props.animate = true
  props.active = false
  props.index = 2
  await nextTick()
  assert.equal(element.scrollTo.mock.calls.at(-1)!.arguments[0].behavior, 'instant')
})

test('resizing and zoom changes keep the same selected media', async t => {
  const { element, props, carousel, onResize, cleanup, disconnect } = await setupCarousel(t)
  props.index = 1
  await nextTick()
  element.clientWidth = 600
  onResize()
  assert.equal(element.scrollLeft, 1200)
  props.zoomed = true
  await nextTick()
  element.scrollLeft = 0
  carousel.settle()
  assert.equal(props.index, 1)
  props.zoomed = false
  await nextTick()
  assert.equal(element.scrollLeft, 1200)
  cleanup.forEach(fn => fn())
  assert.equal(disconnect.mock.callCount(), 1)
})

test('single media does not get cloned, and replacing media resets alignment', async t => {
  const { element, props, carousel } = await setupCarousel(t, 1)
  assert.equal(carousel.slides.value.length, 1)
  assert.equal(element.scrollLeft, 0)
  props.media = [{ type: 'image', url: '/new-photo' }, { type: 'video', url: '/new-video' }]
  await nextTick()
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(carousel.slides.value.length, 4)
  assert.equal(element.scrollLeft, 390)
})
