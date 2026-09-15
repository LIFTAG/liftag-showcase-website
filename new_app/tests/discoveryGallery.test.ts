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
  descriptor.scriptSetup!.content + '\nexports.gallery = { index, expanded, startSwipe, moveSwipe, endSwipe, cancelSwipe, step };',
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
  const viewport = { scale: 1 }
  const exports = {} as { gallery: {
    index: Ref<number>; expanded: Ref<boolean>
    startSwipe: (event: TouchEvent) => void; moveSwipe: (event: TouchEvent) => void
    endSwipe: (event: TouchEvent) => void; cancelSwipe: () => void; step: (delta: number) => void
  } }
  const scope = effectScope()
  t.after(() => scope.stop())
  scope.run(() => runInNewContext(script, {
    exports, computed, ref, shallowRef, watch, Element,
    window: { visualViewport: viewport },
    defineProps: () => props,
    require: (id: string) => {
      assert.equal(id, '~/utils/discoveryCopy')
      return discoveryCopy
    },
  }))
  return { gallery: exports.gallery, props, viewport }
}

const touch = (x: number, y = 100, identifier = 1) => ({ clientX: x, clientY: y, identifier }) as Touch
function event(touches: Touch[], changedTouches = touches, target = new Element()) {
  return {
    touches, changedTouches, target, cancelable: true, defaultPrevented: false,
    preventDefault() { this.defaultPrevented = true },
  } as unknown as TouchEvent
}

for (const fullscreen of [false, true]) {
  test(`horizontal swipes navigate once and wrap in ${fullscreen ? 'fullscreen' : 'inline'} view`, t => {
    const { gallery } = setupGallery(t)
    gallery.expanded.value = fullscreen
    gallery.startSwipe(event([touch(200)]))
    gallery.moveSwipe(event([touch(120)]))
    assert.equal(gallery.index.value, 0)
    const end = event([], [touch(100)])
    gallery.endSwipe(end)
    assert.equal(gallery.index.value, 1)
    assert.equal(gallery.expanded.value, fullscreen)
    assert.equal(end.defaultPrevented, true)
    gallery.endSwipe(end)
    assert.equal(gallery.index.value, 1)
    gallery.step(-1)
    gallery.startSwipe(event([touch(100)]))
    gallery.endSwipe(event([], [touch(200)]))
    assert.equal(gallery.index.value, 2)
    gallery.startSwipe(event([touch(200)]))
    gallery.endSwipe(event([], [touch(100)]))
    assert.equal(gallery.index.value, 0)
  })
}

test('taps, short drags and diagonal gestures retain native behavior', t => {
  const { gallery } = setupGallery(t)
  for (const endPoint of [touch(200), touch(151), touch(140, 150)]) {
    gallery.startSwipe(event([touch(200)]))
    const end = event([], [endPoint])
    gallery.endSwipe(end)
    assert.equal(gallery.index.value, 0)
    assert.equal(end.defaultPrevented, false)
  }
})

test('vertical scrolling cannot become a swipe even if it ends horizontally', t => {
  const { gallery } = setupGallery(t)
  gallery.startSwipe(event([touch(200)]))
  const move = event([touch(195, 150)])
  gallery.moveSwipe(move)
  const end = event([], [touch(50, 150)])
  gallery.endSwipe(end)
  assert.equal(gallery.index.value, 0)
  assert.equal(move.defaultPrevented, false)
  assert.equal(end.defaultPrevented, false)
})

test('multi-touch and cancelled gestures never navigate', t => {
  const { gallery } = setupGallery(t)
  for (const cancel of [
    () => gallery.startSwipe(event([touch(200), touch(100, 100, 2)])),
    () => gallery.moveSwipe(event([touch(150), touch(100, 100, 2)])),
    () => gallery.cancelSwipe(),
  ]) {
    gallery.startSwipe(event([touch(200)]))
    cancel()
    const end = event([], [touch(100)])
    gallery.endSwipe(end)
    assert.equal(gallery.index.value, 0)
    assert.equal(end.defaultPrevented, false)
  }
})

test('unrelated touches and partially released gestures never navigate', t => {
  const { gallery } = setupGallery(t)
  for (const end of [event([], [touch(100, 100, 2)]), event([touch(100, 100, 2)], [touch(100)])]) {
    gallery.startSwipe(event([touch(200)]))
    gallery.endSwipe(end)
    assert.equal(gallery.index.value, 0)
    assert.equal(end.defaultPrevented, false)
  }
})

test('player controls and zoomed-page gestures retain native behavior', t => {
  const { gallery, viewport } = setupGallery(t)
  for (const [scale, interactive] of [[1, true], [2, false]] as const) {
    viewport.scale = scale
    gallery.startSwipe(event([touch(200)], undefined, new Element(interactive)))
    const end = event([], [touch(100)])
    gallery.endSwipe(end)
    assert.equal(gallery.index.value, 0)
    assert.equal(end.defaultPrevented, false)
  }
})

test('empty and single-item galleries do not consume gestures', t => {
  for (const count of [0, 1]) {
    const { gallery } = setupGallery(t, count)
    gallery.startSwipe(event([touch(200)]))
    const end = event([], [touch(100)])
    gallery.endSwipe(end)
    assert.equal(gallery.index.value, 0)
    assert.equal(end.defaultPrevented, false)
  }
})

test('changing gyms cancels a pending swipe and resets the viewer', async t => {
  const { gallery, props } = setupGallery(t)
  gallery.step(1)
  gallery.expanded.value = true
  gallery.startSwipe(event([touch(200)]))
  props.media = [{ type: 'image', url: '/another-gym.jpg' }]
  await nextTick()
  const end = event([], [touch(100)])
  gallery.endSwipe(end)
  assert.equal(gallery.index.value, 0)
  assert.equal(gallery.expanded.value, false)
  assert.equal(end.defaultPrevented, false)
})
