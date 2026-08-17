<script setup lang="ts">
/**
 * Exercise hero media, mirroring the app's Focus header: photo first, one tap
 * morphs it into the instruction video. Handles the three video shapes the
 * catalog serves: HLS playlists (hls.js where MSE is needed), plain files,
 * and YouTube links (iframe embed).
 */
import type Hls from 'hls.js'

const props = defineProps<{
  videoUrl: string | null
  poster: string | null
  name: string
}>()

const playing = ref(false)
const videoRef = ref<HTMLVideoElement | null>(null)
let hls: Hls | null = null

const youTubeId = computed(() => {
  if (!props.videoUrl) return null
  const match = props.videoUrl.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/,
  )
  return match?.[1] ?? null
})

const isHlsSource = computed(() => Boolean(props.videoUrl && /\.m3u8(\?|$)/i.test(props.videoUrl)))

async function play() {
  if (!props.videoUrl || playing.value) return
  playing.value = true
  if (youTubeId.value) return
  await nextTick()
  const video = videoRef.value
  if (!video) return

  if (isHlsSource.value && !video.canPlayType('application/vnd.apple.mpegurl')) {
    const HlsCtor = (await import('hls.js')).default
    if (HlsCtor.isSupported()) {
      hls = new HlsCtor()
      hls.loadSource(props.videoUrl)
      hls.attachMedia(video)
    }
  }
  else {
    video.src = props.videoUrl
  }
  video.play().catch(() => {})
}

onBeforeUnmount(() => {
  hls?.destroy()
  hls = null
})
</script>

<template>
  <div class="cat-player">
    <template v-if="playing && videoUrl">
      <iframe
        v-if="youTubeId"
        class="cat-player__frame"
        :src="`https://www.youtube-nocookie.com/embed/${youTubeId}?autoplay=1&rel=0`"
        :title="`${name} instruction video`"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowfullscreen
      />
      <video
        v-else
        ref="videoRef"
        class="cat-player__video"
        :poster="poster ?? undefined"
        controls
        playsinline
        preload="auto"
      />
    </template>

    <template v-else>
      <img
        v-if="poster"
        class="cat-player__poster"
        :src="poster"
        :alt="name"
        fetchpriority="high"
        decoding="async"
      >
      <span v-else class="cat-player__placeholder" aria-hidden="true">{{ name.slice(0, 1) }}</span>
      <button
        v-if="videoUrl"
        type="button"
        class="cat-player__cta"
        @click="play"
      >
        <span class="cat-player__cta-ring">
          <svg width="14" height="16" viewBox="0 0 10 12" fill="currentColor" aria-hidden="true">
            <path d="M0 0.9c0-.7.8-1.2 1.4-.8l8 5.1c.6.4.6 1.2 0 1.6l-8 5.1c-.6.4-1.4-.1-1.4-.8V.9Z" />
          </svg>
        </span>
        Watch instructions
      </button>
    </template>
  </div>
</template>

<style scoped>
.cat-player {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4 / 3;
  border: 1px solid var(--liftag-border-strong);
  border-radius: var(--liftag-r-xl);
  background: var(--liftag-surface-dark);
}

.cat-player__poster,
.cat-player__video,
.cat-player__frame {
  display: block;
  width: 100%;
  height: 100%;
  border: none;
}

.cat-player__poster,
.cat-player__video {
  object-fit: cover;
}

.cat-player__placeholder {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  color: rgba(204, 255, 0, 0.3);
  font-family: var(--liftag-font-headline);
  font-size: 120px;
  font-style: italic;
  font-weight: 700;
}

.cat-player__cta {
  position: absolute;
  left: 50%;
  bottom: 18px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px 10px 10px;
  border: 1px solid rgba(204, 255, 0, 0.5);
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.66);
  color: #fff;
  font-family: var(--liftag-font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  transform: translateX(-50%);
  transition: border-color 200ms ease, box-shadow 200ms ease;
}

.cat-player__cta:hover {
  border-color: var(--liftag-primary);
  box-shadow: 0 0 24px rgba(204, 255, 0, 0.25);
}

.cat-player__cta-ring {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  padding-left: 3px;
  border-radius: 999px;
  background: var(--liftag-primary);
  color: var(--liftag-fg-on-primary);
}
</style>
