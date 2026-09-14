import { bindVideoAudioLanguage } from '../utils/exerciseVideoLanguage.ts'
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
