import { audioLanguage, bindVideoAudioLanguage, canUseNativeHls } from '../utils/exerciseVideoLanguage.ts'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { preferredAudioTrack } from '../utils/exerciseVideoLanguage.ts'
test('shared HLS streams select Slovak audio aliases with English fallback', () => {
  const en = { lang: 'eng' },
    sk = { lang: 'slk' }
  assert.equal(preferredAudioTrack([en, sk], 'sk'), sk)
  assert.equal(preferredAudioTrack([en, sk], 'en'), en)
  assert.equal(preferredAudioTrack([en], 'sk'), en)
  assert.equal(preferredAudioTrack([{ language: 'sk-SK' }], 'sk')?.language, 'sk-SK')
  assert.equal(preferredAudioTrack([], 'sk'), undefined)
  assert.equal(audioLanguage(' SLK '), 'sk')
  assert.equal(preferredAudioTrack([{ language: 'de' }], 'sk'), undefined)
})

test('native HLS requires audio-track control, not only a playable MIME type', () => {
  const chromium = { canPlayType: () => 'maybe' }
  assert.equal(canUseNativeHls(chromium as unknown as HTMLVideoElement), false)
  const safari = { ...chromium, audioTracks: { length: 0 } }
  assert.equal(canUseNativeHls(safari as unknown as HTMLVideoElement), true)
  assert.equal(canUseNativeHls({ ...safari, canPlayType: () => '' } as unknown as HTMLVideoElement), false)
})

test('native HLS changes enabled audio on the same video and releases metadata listeners', () => {
  const en = { language: 'eng', enabled: false }
  const sk = { language: 'slk', enabled: false }
  const tracks = Object.assign(new EventTarget(), { 0: en, 1: sk, length: 2 })
  const video = Object.assign(new EventTarget(), { audioTracks: tracks })
  let locale: 'en' | 'sk' = 'en'
  const binding = bindVideoAudioLanguage(video as unknown as HTMLVideoElement, () => locale)
  assert.equal(en.enabled, true)
  locale = 'sk'
  binding.sync()
  assert.equal(en.enabled, false)
  assert.equal(sk.enabled, true)
  binding.dispose()
  en.enabled = true
  sk.enabled = false
  video.dispatchEvent(new Event('loadedmetadata'))
  assert.equal(sk.enabled, false)
})

test('HLS.js reacts to arriving tracks and language switches without replacing media', () => {
  const events = new EventTarget()
  const selected: string[] = []
  const hls = {
    audioTracks: [] as { lang: string }[],
    setAudioOption: (track: { lang: string }) => selected.push(track.lang),
    on: (event: string, listener: EventListener) => events.addEventListener(event, listener),
    off: (event: string, listener: EventListener) => events.removeEventListener(event, listener),
  }
  let locale: 'en' | 'sk' = 'sk'
  const binding = bindVideoAudioLanguage(
    new EventTarget() as unknown as HTMLVideoElement,
    () => locale,
    hls as never,
  )
  assert.deepEqual(selected, [])
  hls.audioTracks = [{ lang: 'en' }, { lang: 'sk' }]
  events.dispatchEvent(new Event('hlsAudioTracksUpdated'))
  locale = 'en'
  binding.sync()
  assert.deepEqual(selected, ['sk', 'en'])
  binding.dispose()
  events.dispatchEvent(new Event('hlsAudioTracksUpdated'))
  assert.deepEqual(selected, ['sk', 'en'])
})

test('native tracks can arrive after binding and recover when the player changes its active track', () => {
  const en = { language: 'eng', enabled: true }
  const sk = { language: 'slo', enabled: false }
  const tracks = Object.assign(new EventTarget(), { 0: en, 1: sk, length: 2 })
  const video = Object.assign(new EventTarget(), { audioTracks: undefined as typeof tracks | undefined })
  const binding = bindVideoAudioLanguage(video as unknown as HTMLVideoElement, () => 'sk')
  video.audioTracks = tracks
  video.dispatchEvent(new Event('loadedmetadata'))
  assert.equal(sk.enabled, true)
  assert.equal(en.enabled, false)

  en.enabled = true
  sk.enabled = false
  tracks.dispatchEvent(new Event('change'))
  assert.equal(sk.enabled, true)
  assert.equal(en.enabled, false)

  tracks.length = 1
  tracks.dispatchEvent(new Event('removetrack'))
  assert.equal(en.enabled, true)
  binding.dispose()
  en.enabled = false
  for (const event of ['addtrack', 'removetrack', 'change']) tracks.dispatchEvent(new Event(event))
  assert.equal(en.enabled, false)
})

test('HLS.js switches buffered speech immediately and ignores its own completed switch', () => {
  const events = new EventTarget()
  const selections: { lang: string; flushImmediate: boolean }[] = []
  const hls = {
    audioTracks: [{ lang: 'eng' }, { lang: 'slk' }],
    audioTrack: 0,
    setAudioOption: (track: { lang: string; flushImmediate: boolean }) => {
      selections.push(track)
      hls.audioTrack = hls.audioTracks.findIndex((item) => item.lang === track.lang)
      events.dispatchEvent(new Event('hlsAudioTrackSwitched'))
    },
    on: (event: string, listener: EventListener) => events.addEventListener(event, listener),
    off: (event: string, listener: EventListener) => events.removeEventListener(event, listener),
  }
  let locale: 'en' | 'sk' = 'sk'
  const binding = bindVideoAudioLanguage(new EventTarget() as HTMLVideoElement, () => locale, hls as never)
  assert.deepEqual(selections, [{ lang: 'slk', flushImmediate: true }])
  events.dispatchEvent(new Event('hlsAudioTracksUpdated'))
  assert.equal(selections.length, 1)
  hls.audioTrack = 0
  events.dispatchEvent(new Event('hlsAudioTrackSwitched'))
  assert.equal(hls.audioTrack, 1)
  locale = 'en'
  binding.sync()
  assert.deepEqual(selections.at(-1), { lang: 'eng', flushImmediate: true })
  binding.dispose()
  const count = selections.length
  hls.audioTrack = 1
  events.dispatchEvent(new Event('hlsAudioTrackSwitched'))
  events.dispatchEvent(new Event('hlsAudioTracksUpdated'))
  assert.equal(selections.length, count)
})

test('the locale watcher changes audio without restarting the same video and stops on disposal', async (t) => {
  const { effectScope, nextTick, onScopeDispose, ref, toValue, watch } = await import('vue')
  const { useVideoLanguage } = await import('../composables/useVideoLanguage.ts')
  for (const [key, value] of Object.entries({ onScopeDispose, toValue, watch })) {
    const original = Object.getOwnPropertyDescriptor(globalThis, key)
    Object.defineProperty(globalThis, key, { value, configurable: true })
    t.after(() => original
      ? Object.defineProperty(globalThis, key, original)
      : Reflect.deleteProperty(globalThis, key))
  }
  const en = { language: 'en', enabled: true }
  const sk = { language: 'sk', enabled: false }
  const tracks = Object.assign(new EventTarget(), { 0: en, 1: sk, length: 2 })
  const video = Object.assign(new EventTarget(), { audioTracks: tracks, src: '/master.m3u8', currentTime: 12 })
  const locale = ref<'en' | 'sk'>('en')
  const scope = effectScope()
  t.after(() => scope.stop())
  scope.run(() => useVideoLanguage(locale).bind(video as unknown as HTMLVideoElement))
  locale.value = 'sk'
  await nextTick()
  assert.equal(sk.enabled, true)
  assert.equal(en.enabled, false)
  assert.equal(video.src, '/master.m3u8')
  assert.equal(video.currentTime, 12)
  scope.stop()
  locale.value = 'en'
  await nextTick()
  tracks.dispatchEvent(new Event('change'))
  assert.equal(sk.enabled, true)
})
