<script setup lang="ts">
import type Hls from 'hls.js'
import type { DiscoveryLocale } from '~/types/discovery'
import { discoveryCopy } from '~/utils/discoveryCopy'
const props = defineProps<{ src: string; poster?: string | null; title: string; locale: DiscoveryLocale }>()
const video = useTemplateRef<HTMLVideoElement>('video')
const failed = shallowRef(false)
let hls: Hls | undefined,
  disposed = false
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
onMounted(async () => {
  if (!video.value || youtube.value) return
  if (/\.m3u8(?:\?|$)/i.test(props.src) && !video.value.canPlayType('application/vnd.apple.mpegurl')) {
    try {
      const { default: HlsPlayer } = await import('hls.js')
      if (disposed || !video.value) return
      if (!HlsPlayer.isSupported()) {
        failed.value = true
        return
      }
      hls = new HlsPlayer()
      hls.loadSource(props.src)
      hls.attachMedia(video.value)
      hls.on(HlsPlayer.Events.ERROR, (_, data) => {
        if (data.fatal) failed.value = true
      })
    } catch {
      if (!disposed) failed.value = true
    }
  } else video.value.src = props.src
})
onBeforeUnmount(() => {
  disposed = true
  hls?.destroy()
  video.value?.pause()
})
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
