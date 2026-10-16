import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test, type TestContext } from 'node:test'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'
import { computed, effectScope, nextTick, reactive, ref, shallowRef, watch, type Ref } from 'vue'
import { parse } from 'vue/compiler-sfc'
import * as catalogVideo from '../utils/catalogVideo.ts'
import * as catalogMedia from '../i18n/messages/catalogMedia.ts'
import * as videoLanguage from '../utils/exerciseVideoLanguage.ts'
import * as exerciseHls from '../utils/exerciseHls.ts'

// Execute the component's actual setup script with Vue reactivity and controlled media objects.
// This keeps source changes testable without a browser or an additional test framework.
const { descriptor } = parse(readFileSync(new URL('../components/catalog/CatalogVideoPlayer.vue', import.meta.url), 'utf8'))
const script = ts.transpileModule(
  descriptor.scriptSetup!.content.replaceAll('import.meta.client', 'false') +
    '\nexports.player = { play, stop, videoRef, previewRef, previewMounted, startPreview, previewCapable, playing, ended, onEnded, isCinema, cinemaViewport };',
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
).outputText

function setupPlayer(t: TestContext) {
  const props = reactive({ videoUrl: 'https://example.com/a.mp4' as string | null, poster: null as string | null, name: 'Machine' })
  const media = () => ({
    src: '',
    pause: t.mock.fn(),
    load: t.mock.fn(),
    play: t.mock.fn(async () => {}),
    canPlayType: () => 'probably',
    removeAttribute(name: string) { if (name === 'src') this.src = '' },
  })
  const video = media()
  const preview = media()
  const emit = t.mock.fn()
  const hls = { on: t.mock.fn(), loadSource: t.mock.fn(), attachMedia: t.mock.fn(), destroy: t.mock.fn() }
  const Hls = Object.assign(function () { return hls }, { isSupported: () => true, Events: { ERROR: 'hlsError' } })
  const exports: { player?: {
    play: () => Promise<void>; stop: () => void; startPreview: () => Promise<void>; onEnded: () => void
    videoRef: Ref<typeof video | null>; previewRef: Ref<typeof preview | null>
    previewMounted: Ref<boolean>; previewCapable: Ref<boolean>; playing: Ref<boolean>; ended: Ref<boolean>
    isCinema: Ref<boolean>; cinemaViewport: Ref<boolean>
  } } = {}
  const scope = effectScope()
  t.after(() => scope.stop())
  scope.run(() => runInNewContext(script, {
    exports, computed, ref, shallowRef, watch, nextTick, setTimeout, clearTimeout,
    defineProps: () => props,
    useSiteLocale: () => ({ locale: ref('en') }),
    useI18n: () => ({ t: (key: string) => key }),
    useVideoLanguage: () => ({ bind: t.mock.fn(), unbind: t.mock.fn() }),
    defineEmits: () => emit,
    useTemplateRef: () => ref(null),
    onMounted: () => {},
    onBeforeUnmount: () => {},
    require: (id: string) => {
      if (id === 'hls.js') return { default: Hls }
      if (id === '~/i18n/messages/catalogMedia') return catalogMedia
      if (id === '~/utils/exerciseVideoLanguage') return videoLanguage
      if (id === '~/utils/exerciseHls') return exerciseHls
      assert.equal(id, '~/utils/catalogVideo')
      return catalogVideo
    },
  }))
  const player = exports.player!
  player.videoRef.value = video
  player.previewRef.value = preview
  return { props, video, preview, player, emit, hls }
}

async function settlePlayback() {
  await nextTick()
  await new Promise(resolve => setImmediate(resolve))
}

for (const nextSource of ['https://example.com/b.mp4', 'https://example.com/b.m3u8', 'https://youtu.be/abcdefghijk', null]) {
  test(`changing the source to ${nextSource} releases active playback`, async (t) => {
    const { props, video, player, emit, hls } = setupPlayer(t)
    await player.play()
    assert.equal(video.src, 'https://example.com/a.mp4')
    player.onEnded()
    player.cinemaViewport.value = true
    props.videoUrl = nextSource
    await settlePlayback()
    assert.equal(video.pause.mock.callCount(), 1)
    assert.equal(video.load.mock.callCount(), 1)
    assert.equal(player.ended.value, false)
    assert.ok(emit.mock.calls.some(call => call.arguments[0] === 'playing' && call.arguments[1] === false))
    // A locale-specific URL replacement releases the old media before resuming.
    assert.equal(player.playing.value, Boolean(nextSource))
    assert.equal(video.src, nextSource?.endsWith('.mp4') ? nextSource : '')
    if (nextSource?.endsWith('.m3u8')) assert.equal(hls.loadSource.mock.calls.at(-1)!.arguments[0], nextSource)
    if (!nextSource) assert.equal(player.isCinema.value, false)
  })
}

test('changing sources cancels obsolete playback waiting for the video element', async (t) => {
  const { props, video, player } = setupPlayer(t)
  props.videoUrl = 'https://example.com/b.mp4'
  const pending = player.play()
  props.videoUrl = 'https://example.com/c.mp4'
  await pending
  await settlePlayback()
  assert.equal(video.src, 'https://example.com/c.mp4')
  assert.equal(video.play.mock.callCount(), 1)
  assert.equal(player.playing.value, true)
})

test('changing an HLS source destroys its streaming attachment', async (t) => {
  const { props, video, player, hls } = setupPlayer(t)
  video.canPlayType = () => ''
  props.videoUrl = 'https://example.com/a.m3u8'
  await nextTick()
  await player.play()
  assert.equal(hls.loadSource.mock.calls[0]!.arguments[0], props.videoUrl)
  props.videoUrl = 'https://example.com/b.m3u8'
  await settlePlayback()
  assert.equal(hls.destroy.mock.callCount(), 1)
  assert.equal(hls.loadSource.mock.calls.at(-1)!.arguments[0], 'https://example.com/b.m3u8')
  assert.equal(player.playing.value, true)
})

test('unchanged source and poster updates do not interrupt playback', async (t) => {
  const { props, video, player } = setupPlayer(t)
  await player.play()
  props.videoUrl = 'https://example.com/a.mp4'
  props.poster = 'https://example.com/poster.jpg'
  props.name = 'Updated title'
  await nextTick()
  assert.equal(video.pause.mock.callCount(), 0)
  assert.equal(player.playing.value, true)
})

test('changing sources still releases hover previews', async (t) => {
  const { props, preview, player } = setupPlayer(t)
  player.previewCapable.value = true
  await player.startPreview()
  assert.equal(preview.src, 'https://example.com/a.mp4')
  props.videoUrl = 'https://example.com/b.mp4'
  await nextTick()
  assert.equal(preview.src, '')
  assert.equal(player.previewMounted.value, false)
})
