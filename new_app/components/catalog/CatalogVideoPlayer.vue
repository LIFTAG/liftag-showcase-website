<script setup lang="ts">
/**
 * Exercise hero media, mirroring the app's Focus header: photo first, one tap
 * morphs it into the instruction video. Desktop hover plays a muted preview
 * the same way catalog tiles do on /exercises. Stills without video get a
 * pointer-tracked scan lock-on instead of a generic zoom. Handles HLS
 * playlists (hls.js where MSE is needed), plain files, and YouTube embeds.
 */
import type Hls from 'hls.js'
import { CATALOG_VIDEOS_ENABLED, catalogMediaAspectRatio } from '~/utils/catalogVideo'

const props = defineProps<{
  videoUrl: string | null
  poster: string | null
  name: string
}>()

const enabledVideoUrl = computed(() => (CATALOG_VIDEOS_ENABLED ? props.videoUrl : null))

const emit = defineEmits<{
  playing: [value: boolean]
}>()

const rootRef = ref<HTMLElement | null>(null)
const playing = ref(false)
const ended = ref(false)
const posterFailed = ref(false)
const posterRatio = shallowRef<number | null>(null)
const posterRef = useTemplateRef<HTMLImageElement>('poster')
const cinemaViewport = ref(false)
const cinemaDismissed = ref(false)
const videoRef = ref<HTMLVideoElement | null>(null)
const previewRef = ref<HTMLVideoElement | null>(null)
const previewMounted = ref(false)
const previewVisible = ref(false)
const previewCapable = ref(false)
const stillHoverCapable = ref(false)
const hovering = ref(false)
const showMuteHint = computed(() =>
  previewCapable.value && Boolean(enabledVideoUrl.value) && !playing.value && hovering.value,
)
let hls: Hls | null = null
let previewHls: Hls | null = null
let cinemaQuery: MediaQueryList | null = null
let pointerQuery: MediaQueryList | null = null
let motionQuery: MediaQueryList | null = null
let playbackRequest = 0
let previewRequest = 0
let previewLeaveTimer: ReturnType<typeof setTimeout> | null = null

function clearPreviewLeaveTimer() {
  if (!previewLeaveTimer) return
  clearTimeout(previewLeaveTimer)
  previewLeaveTimer = null
}

watch(() => props.poster, () => {
  posterFailed.value = false
  posterRatio.value = null
})

function applyPosterRatio(img: HTMLImageElement) {
  posterRatio.value = catalogMediaAspectRatio(img.naturalWidth, img.naturalHeight)
}

function onPosterLoad(event: Event) {
  const img = event.currentTarget
  if (img instanceof HTMLImageElement) applyPosterRatio(img)
}

watch(posterRef, (img) => {
  if (img?.complete) applyPosterRatio(img)
}, { immediate: true })

const mediaStyle = computed<Record<string, string> | undefined>(() => {
  const ratio = posterRatio.value
  if (ratio == null) return undefined
  return { '--media-ar': String(ratio) }
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

function stopPreview() {
  clearPreviewLeaveTimer()
  previewRequest += 1
  previewVisible.value = false

  const video = previewRef.value
  video?.pause()
  previewHls?.destroy()
  previewHls = null

  if (video) {
    video.removeAttribute('src')
    video.load()
  }

  previewMounted.value = false
}

function clearStillPointer() {
  const el = rootRef.value
  el?.style.removeProperty('--still-x')
  el?.style.removeProperty('--still-y')
}

function syncHoverCapability() {
  const hoverOk = Boolean(pointerQuery?.matches && !motionQuery?.matches)
  previewCapable.value = hoverOk
  stillHoverCapable.value = hoverOk && !enabledVideoUrl.value
  if (!previewCapable.value || playing.value) stopPreview()
}

function stop() {
  playbackRequest += 1
  stopPreview()
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

function markPreviewVisible(request: number) {
  if (request === previewRequest && previewMounted.value) previewVisible.value = true
}

async function startPreview() {
  const source = enabledVideoUrl.value
  if (!source || !previewCapable.value || previewMounted.value || playing.value) return

  const request = ++previewRequest
  previewMounted.value = true

  // YouTube previews autoplay muted in an isolated iframe; its load event is
  // the closest reliable readiness signal available cross-origin.
  if (youTubeId.value) return

  await nextTick()
  const video = previewRef.value
  if (!video || request !== previewRequest || !previewMounted.value) return

  if (isHlsSource.value && !video.canPlayType('application/vnd.apple.mpegurl')) {
    const HlsCtor = (await import('hls.js')).default
    if (request !== previewRequest || !previewMounted.value) return
    if (!HlsCtor.isSupported()) {
      stopPreview()
      return
    }
    previewHls = new HlsCtor()
    previewHls.loadSource(source)
    previewHls.attachMedia(video)
  }
  else {
    video.src = source
  }

  video.play().catch(() => stopPreview())
}

function onPointerEnter() {
  hovering.value = true
  clearPreviewLeaveTimer()
  startPreview()
  if (previewMounted.value && !playing.value) previewVisible.value = true
}

function onPointerLeave() {
  hovering.value = false
  clearStillPointer()
  if (playing.value) return
  previewVisible.value = false
  clearPreviewLeaveTimer()
  previewLeaveTimer = setTimeout(() => {
    previewLeaveTimer = null
    if (!hovering.value && !playing.value) stopPreview()
  }, 400)
}

function onStillPointerMove(event: PointerEvent) {
  if (!stillHoverCapable.value) return
  const el = rootRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const width = rect.width || 1
  const height = rect.height || 1
  el.style.setProperty('--still-x', String((event.clientX - rect.left) / width))
  el.style.setProperty('--still-y', String((event.clientY - rect.top) / height))
}

function onRootClick(event: MouseEvent) {
  if (playing.value || !enabledVideoUrl.value || !previewCapable.value) return
  const target = event.target
  if (!(target instanceof Element)) return
  if (target.closest('.cat-player__cta') || target.closest('.cat-player__close')) return
  play()
}

async function play() {
  const source = enabledVideoUrl.value
  if (!source || playing.value) return
  stopPreview()
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

watch(enabledVideoUrl, () => {
  stopPreview()
  syncHoverCapability()
})

onMounted(() => {
  cinemaQuery = window.matchMedia(
    '(orientation: landscape) and (max-width: 1024px) and (max-height: 600px) and (pointer: coarse)',
  )
  pointerQuery = window.matchMedia('(min-width: 769px) and (hover: hover) and (pointer: fine)')
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  syncCinemaViewport()
  syncHoverCapability()
  cinemaQuery.addEventListener('change', syncCinemaViewport)
  pointerQuery.addEventListener('change', syncHoverCapability)
  motionQuery.addEventListener('change', syncHoverCapability)
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  cinemaQuery?.removeEventListener('change', syncCinemaViewport)
  pointerQuery?.removeEventListener('change', syncHoverCapability)
  motionQuery?.removeEventListener('change', syncHoverCapability)
  cinemaQuery = null
  pointerQuery = null
  motionQuery = null
  window.removeEventListener('keydown', onKeydown)
  setCinemaLock(false)
  clearPreviewLeaveTimer()
  stopPreview()
  hls?.destroy()
  hls = null
})
</script>

<template>
  <div
    ref="rootRef"
    class="cat-player"
    :class="{
      'is-playing': playing,
      'is-cinema': isCinema,
      'is-previewing': previewVisible,
      'is-still': stillHoverCapable,
      'has-video': Boolean(enabledVideoUrl),
      'is-mute-hint': showMuteHint,
    }"
    :style="mediaStyle"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @pointercancel="onPointerLeave"
    @pointermove="onStillPointerMove"
    @click="onRootClick"
  >
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
          </svg>
        </span>
        <span class="cat-player__cta-label">Replay</span>
      </button>
    </template>

    <template v-else>
      <img
        v-if="poster && !posterFailed"
        ref="poster"
        class="cat-player__poster"
        :src="poster"
        :alt="name"
        fetchpriority="high"
        decoding="async"
        @load="onPosterLoad"
        @error="posterFailed = true"
      >
      <span v-else class="cat-player__placeholder" aria-hidden="true">{{ name.slice(0, 1) }}</span>
      <div v-if="previewMounted" class="cat-player__preview-stage">
        <iframe
          v-if="youTubeId"
          class="cat-player__preview"
          :src="`https://www.youtube-nocookie.com/embed/${youTubeId}?autoplay=1&mute=1&controls=0&playsinline=1&loop=1&playlist=${youTubeId}&rel=0`"
          :title="`${name} video preview`"
          tabindex="-1"
          allow="autoplay; encrypted-media"
          @load="markPreviewVisible(previewRequest)"
        />
        <video
          v-else
          ref="previewRef"
          class="cat-player__preview"
          muted
          loop
          playsinline
          preload="none"
          aria-hidden="true"
          @playing="markPreviewVisible(previewRequest)"
          @error="stopPreview"
        />
      </div>
      <div v-if="!enabledVideoUrl" class="cat-player__still" aria-hidden="true">
        <span class="cat-player__still-scan-rail">
          <span class="cat-player__still-scan" />
        </span>
        <span class="cat-player__still-frame">
          <i />
          <i />
          <i />
          <i />
        </span>
      </div>
      <div v-if="$slots.overlay" class="cat-player__chrome">
        <slot name="overlay" />
      </div>
      <Transition name="cat-mute-hint">
        <p v-if="showMuteHint" class="cat-player__mute-hint" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M3 9.2v5.6h3.3L12 19.5V4.5L6.3 9.2H3Z" />
            <path fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" d="M16.2 9.2 21 14M21 9.2l-4.8 4.8" />
          </svg>
          Muted preview
        </p>
      </Transition>
      <button
        v-if="enabledVideoUrl"
        type="button"
        class="cat-player__cta"
        :aria-label="showMuteHint
          ? 'Preview is muted. Click to watch with sound.'
          : `Watch ${name} instructions`"
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
  --still-x: 0.5;
  --still-y: 0.5;
  position: relative;
  overflow: hidden;
  /* Stills report --media-ar from the poster bitmap. Catalog photos are a mix
     of ~16:9 and 4:3; a fixed box + contain left grey pillarboxes. */
  aspect-ratio: var(--media-ar, 1.7778);
  border: 1px solid var(--liftag-border-strong);
  border-radius: var(--liftag-r-xl);
  background: #000;
  transition: border-color 240ms cubic-bezier(0.16, 1, 0.3, 1);
}

.cat-player.is-playing:not(.is-cinema) {
  aspect-ratio: 16 / 9;
}

.cat-player.has-video:not(.is-playing) {
  cursor: pointer;
}

.cat-player.is-still {
  perspective: 1100px;
}

.cat-player__poster,
.cat-player__video,
.cat-player__frame {
  display: block;
  width: 100%;
  height: 100%;
  border: none;
}

.cat-player__poster {
  object-fit: cover;
}

.cat-player__video {
  object-fit: contain;
}

.cat-player.has-video:not(.is-playing) .cat-player__poster {
  transition: transform 420ms cubic-bezier(0.16, 1, 0.3, 1);
}

.cat-player.has-video:not(.is-playing):hover .cat-player__poster {
  transform: scale(1.04);
}

.cat-player.is-previewing .cat-player__poster {
  transform: none;
}

.cat-player.is-still .cat-player__poster,
.cat-player.is-still .cat-player__placeholder {
  transform-origin: center;
  transition:
    transform 280ms cubic-bezier(0.16, 1, 0.3, 1),
    filter 280ms cubic-bezier(0.16, 1, 0.3, 1);
}

.cat-player.is-still:hover .cat-player__poster,
.cat-player.is-still:hover .cat-player__placeholder {
  transform:
    translateZ(20px)
    scale(1.055)
    rotateX(calc((0.5 - var(--still-y)) * 8deg))
    rotateY(calc((var(--still-x) - 0.5) * 10deg));
  filter: contrast(1.12) saturate(0.78) brightness(1.05);
}

.cat-player__preview-stage {
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;
  pointer-events: none;
  background: #000;
  opacity: 0;
  clip-path: circle(6% at 50% 50%);
  transform: scale(1.05);
  filter: brightness(0.72) saturate(0.85);
  transition:
    opacity 420ms cubic-bezier(0.16, 1, 0.3, 1),
    clip-path 620ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 620ms cubic-bezier(0.16, 1, 0.3, 1),
    filter 520ms cubic-bezier(0.22, 1, 0.36, 1);
}

.cat-player.is-previewing .cat-player__preview-stage {
  opacity: 1;
  clip-path: circle(150% at 50% 50%);
  transform: none;
  filter: none;
}

.cat-player__preview {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  object-fit: cover;
}

.cat-player__still {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.cat-player__still-scan-rail {
  position: absolute;
  inset: 0;
  opacity: 0;
  transform: translate3d(0, -6%, 0);
}

.cat-player.is-still:hover .cat-player__still-scan-rail {
  animation: cat-still-scan 1.15s cubic-bezier(0.16, 1, 0.3, 1);
}

.cat-player__still-scan {
  position: absolute;
  top: 0;
  left: 7%;
  right: 7%;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.85),
    #ccff00,
    rgba(255, 255, 255, 0.85),
    transparent
  );
  box-shadow:
    0 0 10px rgba(204, 255, 0, 0.95),
    0 0 26px rgba(204, 255, 0, 0.5);
}

.cat-player__still-frame i {
  position: absolute;
  width: 22px;
  height: 22px;
  border: 1.5px solid var(--liftag-primary);
  opacity: 0;
  transform: scale(0.72);
  filter: drop-shadow(0 0 6px rgba(204, 255, 0, 0.55));
  transition:
    opacity 280ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 280ms cubic-bezier(0.16, 1, 0.3, 1);
}

.cat-player.is-still:hover .cat-player__still-frame i {
  opacity: 1;
  transform: scale(1);
}

.cat-player__still-frame i:nth-child(1) {
  top: 14px;
  left: 14px;
  border-right: 0;
  border-bottom: 0;
}

.cat-player__still-frame i:nth-child(2) {
  top: 14px;
  right: 14px;
  border-left: 0;
  border-bottom: 0;
}

.cat-player__still-frame i:nth-child(3) {
  bottom: 14px;
  left: 14px;
  border-right: 0;
  border-top: 0;
}

.cat-player__still-frame i:nth-child(4) {
  right: 14px;
  bottom: 14px;
  border-left: 0;
  border-top: 0;
}

@keyframes cat-still-scan {
  0% {
    transform: translate3d(0, -6%, 0);
    opacity: 0;
  }
  12% {
    opacity: 1;
  }
  100% {
    transform: translate3d(0, 104%, 0);
    opacity: 0;
  }
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

.cat-player__mute-hint {
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 7px 12px 7px 9px;
  border: 1px solid rgba(204, 255, 0, 0.45);
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.72);
  color: var(--liftag-primary);
  font-family: var(--liftag-font-mono);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  pointer-events: none;
}

.cat-mute-hint-enter-active,
.cat-mute-hint-leave-active {
  transition:
    opacity 320ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 320ms cubic-bezier(0.16, 1, 0.3, 1);
}

.cat-mute-hint-enter-from,
.cat-mute-hint-leave-to {
  opacity: 0;
  transform: translate3d(-8px, 0, 0);
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
  transition:
    border-color 200ms ease,
    box-shadow 200ms ease,
    padding 280ms cubic-bezier(0.16, 1, 0.3, 1),
    gap 280ms cubic-bezier(0.16, 1, 0.3, 1);
}

.cat-player.is-mute-hint .cat-player__cta {
  gap: 0;
  padding: 10px;
}

.cat-player__cta:hover {
  border-color: var(--liftag-primary);
  box-shadow: 0 0 24px rgba(204, 255, 0, 0.25);
}

.cat-player__cta-label {
  overflow: hidden;
  max-width: 18rem;
  white-space: nowrap;
  transition:
    max-width 280ms cubic-bezier(0.16, 1, 0.3, 1),
    opacity 180ms ease;
}

.cat-player.is-mute-hint .cat-player__cta-label {
  max-width: 0;
  opacity: 0;
}

.cat-player__cta-ring {
  display: grid;
  flex: 0 0 auto;
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

@media (prefers-reduced-motion: reduce) {
  .cat-player,
  .cat-player__poster,
  .cat-player__placeholder,
  .cat-player__preview,
  .cat-player__preview-stage,
  .cat-player__cta,
  .cat-player__cta-label,
  .cat-player__cta-ring,
  .cat-player__still-frame i {
    transition: none;
  }

  .cat-player.is-still:hover .cat-player__still-scan-rail {
    animation: none;
  }

  .cat-mute-hint-enter-active,
  .cat-mute-hint-leave-active {
    transition: none;
  }

  .cat-player.has-video:not(.is-playing):hover .cat-player__poster,
  .cat-player.is-still:hover .cat-player__poster,
  .cat-player.is-still:hover .cat-player__placeholder {
    transform: none;
    filter: none;
  }

  .cat-player__preview-stage,
  .cat-player.is-previewing .cat-player__preview-stage {
    clip-path: none;
    filter: none;
    transform: none;
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
