import type Hls from 'hls.js'
import type { MaybeRefOrGetter } from 'vue'
import type { SiteLocale } from '~/types/locale'
import { bindVideoAudioLanguage } from '../utils/exerciseVideoLanguage.ts'

/** A locale switch also updates audio when the master playlist URL stays unchanged. */
export function useVideoLanguage(locale: MaybeRefOrGetter<SiteLocale>) {
  const bindings = new Map<HTMLVideoElement, ReturnType<typeof bindVideoAudioLanguage>>()
  function unbind(video: HTMLVideoElement) {
    bindings.get(video)?.dispose()
    bindings.delete(video)
  }
  function bind(video: HTMLVideoElement, hls?: Hls | null) {
    unbind(video)
    bindings.set(
      video,
      bindVideoAudioLanguage(video, () => toValue(locale), hls),
    )
  }
  watch(
    () => toValue(locale),
    () => {
      for (const binding of bindings.values()) binding.sync()
    },
  )
  onScopeDispose(() => {
    for (const binding of bindings.values()) binding.dispose()
    bindings.clear()
  })
  return { bind, unbind }
}
