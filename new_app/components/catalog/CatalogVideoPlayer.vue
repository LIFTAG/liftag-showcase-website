<script setup lang="ts">
/**
 * Exercise hero media, mirroring the app's Focus header: photo first, one tap
 * morphs it into the instruction video. Handles the three video shapes the
 * catalog serves: HLS playlists (hls.js where MSE is needed), plain files,
 * and YouTube links (iframe embed).
 */
import type Hls from 'hls.js'
import { CATALOG_VIDEOS_ENABLED } from '~/utils/catalogVideo'

const props = defineProps<{
  videoUrl: string | null
  poster: string | null
  name: string
}>()

const enabledVideoUrl = computed(() => (CATALOG_VIDEOS_ENABLED ? props.videoUrl : null))

const emit = defineEmits<{
  playing: [value: boolean]
}>()

const playing = ref(false)
const ended = ref(false)
const posterFailed = ref(false)
const cinemaViewport = ref(false)
const cinemaDismissed = ref(false)
const videoRef = ref<HTMLVideoElement | null>(null)
let hls: Hls | null = null
let cinemaQuery: MediaQueryList | null = null
let playbackRequest = 0

watch(() => props.poster, () => {
  posterFailed.value = false
})

/** Native Fullscreen needs a fresh gesture after rotation. Use a CSS cinema
 *  view only for phone-shaped coarse-pointer viewports, never desktop. */
const isCinema = computed(() => playing.value && cinemaViewport.value && !cinemaDismissed.value)

function syncCinemaViewport() {
  cinemaViewport.value = Boolean(cinemaQuery?.matches)
  if (!cinemaViewport.value) cinemaDismissed.value = false
}

function setCinemaLock(on: boolean) {
  if (!import.meta.client) return
  document.documentElement.classList.toggle('cat-player-cinema', on)
}

watch(isCinema, setCinemaLock)

function exitCinema() {
  cinemaDismissed.value = true
}

function stop() {
  playbackRequest += 1
  const video = videoRef.value

  video?.pause()
  hls?.destroy()
  hls = null

  if (video) {
    video.removeAttribute('src')
    video.load()
  }

  playing.value = false
  ended.value = false
  cinemaDismissed.value = false
  emit('playing', false)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isCinema.value) exitCinema()
}

const youTubeId = computed(() => {
  if (!enabledVideoUrl.value) return null
  const match = enabledVideoUrl.value.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/,
  )
  return match?.[1] ?? null
})

const isHlsSource = computed(() => Boolean(enabledVideoUrl.value && /\.m3u8(\?|$)/i.test(enabledVideoUrl.value)))

async function play() {
  const source = enabledVideoUrl.value
  if (!source || playing.value) return
  const request = ++playbackRequest
  playing.value = true
  emit('playing', true)
  if (youTubeId.value) return
  await nextTick()
  const video = videoRef.value
  if (!video || request !== playbackRequest || !playing.value) return

  if (isHlsSource.value && !video.canPlayType('application/vnd.apple.mpegurl')) {
    const HlsCtor = (await import('hls.js')).default
    if (request !== playbackRequest || !playing.value) return
    if (HlsCtor.isSupported()) {
      hls = new HlsCtor()
      hls.loadSource(source)
      hls.attachMedia(video)
    }
  }
  else {
    video.src = source
  }
  video.play().catch(() => {})
}

function onEnded() {
  ended.value = true
}

function onPlaybackResume() {
  ended.value = false
}

function replay() {
  ended.value = false
  const video = videoRef.value
  if (!video) return
  try {
    video.currentTime = 0
  }
  catch {
    // Some HLS attachments reject a seek before the first fragment lands.
  }
  video.play().catch(() => {})
}

onMounted(() => {
  cinemaQuery = window.matchMedia(
    '(orientation: landscape) and (max-width: 1024px) and (max-height: 600px) and (pointer: coarse)',
  )
  syncCinemaViewport()
  cinemaQuery.addEventListener('change', syncCinemaViewport)
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  cinemaQuery?.removeEventListener('change', syncCinemaViewport)
  cinemaQuery = null
  window.removeEventListener('keydown', onKeydown)
  setCinemaLock(false)
  hls?.destroy()
  hls = null
})
</script>

<template>
  <div class="cat-player" :class="{ 'is-playing': playing, 'is-cinema': isCinema }">
    <template v-if="playing && enabledVideoUrl">
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
        :controls="!ended"
        playsinline
        preload="auto"
        @ended="onEnded"
        @play="onPlaybackResume"
      />
      <button
        v-if="ended && !youTubeId"
        type="button"
        class="cat-player__cta"
        :aria-label="`Replay ${name} instructions`"
        @click="replay"
      >
        <span class="cat-player__cta-ring cat-player__cta-ring--replay">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M2.5 12a9.5 9.5 0 1 0 2.4-6.3" />
            <path d="M2.5 4.5v5h5" />
          </svg>
        </span>
        <span class="cat-player__cta-label">Replay</span>
      </button>
    </template>

    <template v-else>
      <img
        v-if="poster && !posterFailed"
        class="cat-player__poster"
        :src="poster"
        :alt="name"
        fetchpriority="high"
        decoding="async"
        @error="posterFailed = true"
      >
      <span v-else class="cat-player__placeholder" aria-hidden="true">{{ name.slice(0, 1) }}</span>
      <div v-if="$slots.overlay" class="cat-player__chrome">
        <slot name="overlay" />
      </div>
      <button
        v-if="enabledVideoUrl"
        type="button"
        class="cat-player__cta"
        :aria-label="`Watch ${name} instructions`"
        @click="play"
      >
        <span class="cat-player__cta-ring">
          <svg width="14" height="16" viewBox="0 0 10 12" fill="currentColor" aria-hidden="true">
            <path d="M0 0.9c0-.7.8-1.2 1.4-.8l8 5.1c.6.4.6 1.2 0 1.6l-8 5.1c-.6.4-1.4-.1-1.4-.8V.9Z" />
          </svg>
        </span>
        <span class="cat-player__cta-label">Watch instructions</span>
      </button>
    </template>

    <button
      v-if="playing"
      type="button"
      class="cat-player__close"
      aria-label="Close video and show exercise image"
      @click="stop"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true">
        <path d="M6 6l12 12M18 6 6 18" />
      </svg>
    </button>
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

.cat-player__chrome {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
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
  z-index: 2;
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

.cat-player__cta-ring--replay {
  padding-left: 0;
}

.cat-player.is-cinema {
  position: fixed;
  inset: 0;
  z-index: 1000;
  width: 100vw;
  width: 100dvw;
  max-width: none;
  height: 100vh;
  height: 100dvh;
  max-height: none;
  aspect-ratio: auto;
  border: 0;
  border-radius: 0;
  background: #000;
}

.cat-player.is-cinema .cat-player__video,
.cat-player.is-cinema .cat-player__frame {
  object-fit: contain;
}

.cat-player__close {
  position: absolute;
  top: max(12px, var(--liftag-safe-top));
  right: max(12px, var(--liftag-safe-right));
  z-index: 3;
  display: none;
  place-items: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.68);
  color: #fff;
  cursor: pointer;
}

.cat-player.is-cinema .cat-player__close {
  display: grid;
}

.cat-player__close:focus-visible {
  outline: 2px solid var(--liftag-primary);
  outline-offset: 2px;
}

@media (max-width: 768px) and (orientation: portrait) {
  .cat-player.is-playing:not(.is-cinema) .cat-player__close {
    display: grid;
  }
}

:global(html.cat-player-cinema),
:global(html.cat-player-cinema body) {
  overflow: hidden;
  overscroll-behavior: none;
}

:global(html.cat-player-cinema .site-nav) {
  visibility: hidden;
  pointer-events: none;
}
</style>
