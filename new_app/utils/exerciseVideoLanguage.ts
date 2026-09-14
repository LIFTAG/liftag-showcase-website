import type Hls from 'hls.js'
import type { SiteLocale } from '../types/locale.ts'
export function audioLanguage(value: string | undefined): string {
  const language = (value ?? '').toLowerCase().split('-')[0]!
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

/** Bind a player without owning its playback lifecycle or changing the stream URL. */
export function bindVideoAudioLanguage(video: HTMLVideoElement, locale: () => SiteLocale, hls?: Hls | null) {
  const tracks = (video as HTMLVideoElement & { audioTracks?: NativeAudioTracks }).audioTracks
  const sync = () => {
    if (hls) {
      const track = preferredAudioTrack(hls.audioTracks, locale())
      if (track) hls.setAudioOption(track)
    } else if (tracks) {
      const available = Array.from({ length: tracks.length }, (_, index) => tracks[index]!)
      const selected = preferredAudioTrack(available, locale())
      if (selected) for (const track of available) track.enabled = track === selected
    }
  }
  const event = 'hlsAudioTracksUpdated' as Parameters<Hls['on']>[0]
  hls?.on(event, sync)
  video.addEventListener('loadedmetadata', sync)
  tracks?.addEventListener('addtrack', sync)
  sync()
  return {
    sync,
    dispose() {
      hls?.off(event, sync)
      video.removeEventListener('loadedmetadata', sync)
      tracks?.removeEventListener('addtrack', sync)
    },
  }
}
