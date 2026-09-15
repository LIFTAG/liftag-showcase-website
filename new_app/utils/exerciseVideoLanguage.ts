import type Hls from 'hls.js'
import type { SiteLocale } from '../types/locale.ts'
export function audioLanguage(value: string | null | undefined): string {
  const language = (value ?? '').trim().toLowerCase().split('-')[0]!
  return ({ eng: 'en', slk: 'sk', slo: 'sk' } as Record<string, string>)[language] ?? language
}
export function preferredAudioTrack<T extends { lang?: string; language?: string }>(
  tracks: readonly T[],
  locale: SiteLocale,
): T | undefined {
  return (
    tracks.find((track) => audioLanguage(track.lang ?? track.language) === locale) ??
    tracks.find((track) => audioLanguage(track.lang ?? track.language) === 'en')
  )
}

interface NativeAudioTrack {
  language: string
  enabled: boolean
}
interface NativeAudioTracks extends EventTarget {
  length: number
  [index: number]: NativeAudioTrack
}

function nativeAudioTracks(video: HTMLVideoElement): NativeAudioTracks | undefined {
  return (video as HTMLVideoElement & { audioTracks?: NativeAudioTracks }).audioTracks
}

/** Chromium can play native HLS without exposing track selection. Use HLS.js there. */
export function canUseNativeHls(video: HTMLVideoElement): boolean {
  return Boolean(video.canPlayType('application/vnd.apple.mpegurl') && nativeAudioTracks(video))
}

/** Bind a player without owning its playback lifecycle or changing the stream URL. */
export function bindVideoAudioLanguage(video: HTMLVideoElement, locale: () => SiteLocale, hls?: Hls | null) {
  let tracks: NativeAudioTracks | undefined
  const trackEvents = ['addtrack', 'removetrack', 'change'] as const
  const detachTracks = () => {
    for (const event of trackEvents) tracks?.removeEventListener(event, sync)
  }
  const sync = () => {
    if (hls) {
      const track = preferredAudioTrack(hls.audioTracks, locale())
      if (track && hls.audioTracks[hls.audioTrack] !== track) {
        // Discard buffered speech in the previous language when switching.
        hls.setAudioOption({ ...track, flushImmediate: true })
      }
      return
    }
    const currentTracks = nativeAudioTracks(video)
    if (currentTracks !== tracks) {
      detachTracks()
      tracks = currentTracks
      for (const event of trackEvents) tracks?.addEventListener(event, sync)
    }
    if (!currentTracks) return
    const available = Array.from({ length: currentTracks.length }, (_, index) => currentTracks[index]!)
    const selected = preferredAudioTrack(available, locale())
    if (!selected) return
    for (const track of available) {
      const enabled = track === selected
      if (track.enabled !== enabled) track.enabled = enabled
    }
  }
  // Like the app, react to available tracks and the player's active track.
  const hlsEvents = ['hlsAudioTracksUpdated', 'hlsAudioTrackSwitched'] as Parameters<Hls['on']>[0][]
  for (const event of hlsEvents) hls?.on(event, sync)
  video.addEventListener('loadedmetadata', sync)
  sync()
  return {
    sync,
    dispose() {
      for (const event of hlsEvents) hls?.off(event, sync)
      video.removeEventListener('loadedmetadata', sync)
      detachTracks()
    },
  }
}
