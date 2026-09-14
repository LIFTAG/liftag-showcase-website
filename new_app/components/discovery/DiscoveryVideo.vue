<script setup lang="ts">
import type Hls from 'hls.js'
import type { DiscoveryLocale } from '~/types/discovery'
import { discoveryCopy } from '~/utils/discoveryCopy'
import { canUseNativeHls } from '~/utils/exerciseVideoLanguage'
const props = defineProps<{ src: string; poster?: string | null; title: string; locale: DiscoveryLocale }>()
const video = useTemplateRef<HTMLVideoElement>('video')
const failed = shallowRef(false)
const language = useVideoLanguage(() => props.locale)
let hls: Hls | undefined
let attached: HTMLVideoElement | undefined
function release() {
  if (attached) {
    language.unbind(attached)
    attached.pause()
    attached.removeAttribute('src')
    attached.load()
  }
  hls?.destroy()
  hls = undefined
  attached = undefined
}
const youtube = computed(() => {
  try {
    const u = new URL(props.src)
    const id =
      u.hostname === 'youtu.be'
        ? u.pathname.slice(1)
        : /(^|\.)youtube\.com$/.test(u.hostname)
          ? (u.searchParams.get('v') ?? u.pathname.split('/').at(-1))
          : null
    return id && /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null
  } catch {
    return null
  }
})
// Watch the source, not the locale: the shared helper changes audio on a stable URL.
watch(() => props.src, async (src, _previous, onCleanup) => {
  let cancelled = false
  onCleanup(() => { cancelled = true; release() })
  failed.value = false
  await nextTick()
  if (cancelled || !video.value || youtube.value) return
  const element = video.value
  attached = element
  if (/\.m3u8(?:\?|$)/i.test(src) && !canUseNativeHls(element)) {
    try {
      const { default: HlsPlayer } = await import('hls.js')
      if (cancelled) return
      if (!HlsPlayer.isSupported()) { failed.value = true; return }
      hls = new HlsPlayer()
      hls.loadSource(src)
      hls.attachMedia(element)
      language.bind(element, hls)
      hls.on(HlsPlayer.Events.ERROR, (_, data) => {
        if (data.fatal && !cancelled) failed.value = true
      })
    } catch { if (!cancelled) failed.value = true }
  } else {
    element.src = src
    language.bind(element)
  }
}, { immediate: true, flush: 'post' })
onBeforeUnmount(release)
</script>
<template>
  <iframe
    v-if="youtube"
    :src="youtube"
    :title="title"
    allow="fullscreen; picture-in-picture"
    allowfullscreen
    class="d-video"
  />
  <div v-else-if="failed" class="d-empty">
    <p>{{ discoveryCopy(locale).loadError }}</p>
    <a class="d-link" :href="src" target="_blank" rel="noopener noreferrer">
      {{ discoveryCopy(locale).video }}
    </a>
  </div>
  <video
    v-else
    ref="video"
    class="d-video"
    :poster="poster ?? undefined"
    :aria-label="title"
    controls
    playsinline
    preload="metadata"
    @error="failed = true"
  />
</template>
<style scoped>
.d-video {
  display: block;
  width: 100%;
  aspect-ratio: 16/10;
  max-height: 65dvh;
  object-fit: contain;
  border: 0;
  border-radius: 16px;
  background: #141414;
}
</style>
