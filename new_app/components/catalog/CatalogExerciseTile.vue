<script setup lang="ts">
/**
 * Catalog tile mirroring the app's machine-exercise grid: 3:2 photo,
 * name + muscle footer, and a lazy desktop hover preview when video exists.
 */
import type Hls from 'hls.js'

const props = defineProps<{
  to: string
  name: string
  imageUrl: string | null
  label?: string | null
  hasVideo?: boolean
  previewVideoUrl?: string | null
}>()

const previewRef = ref<HTMLVideoElement | null>(null)
const previewMounted = ref(false)
const previewVisible = ref(false)
const previewCapable = ref(false)
let pointerQuery: MediaQueryList | null = null
let motionQuery: MediaQueryList | null = null
let hls: Hls | null = null
let previewRequest = 0

const youTubeId = computed(() => {
  if (!props.previewVideoUrl) return null
  const match = props.previewVideoUrl.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/,
  )
  return match?.[1] ?? null
})

function stopPreview() {
  previewRequest += 1
  previewVisible.value = false

  const video = previewRef.value
  video?.pause()
  hls?.destroy()
  hls = null

  if (video) {
    video.removeAttribute('src')
    video.load()
  }

  previewMounted.value = false
}

function syncPreviewCapability() {
  previewCapable.value = Boolean(
    props.previewVideoUrl
    && pointerQuery?.matches
    && !motionQuery?.matches,
  )
  if (!previewCapable.value) stopPreview()
}

function markPreviewVisible(request: number) {
  if (request === previewRequest && previewMounted.value) previewVisible.value = true
}

async function startPreview() {
  const source = props.previewVideoUrl
  if (!source || !previewCapable.value || previewMounted.value) return

  const request = ++previewRequest
  previewMounted.value = true

  // YouTube previews autoplay muted in an isolated iframe; its load event is
  // the closest reliable readiness signal available cross-origin.
  if (youTubeId.value) return

  await nextTick()
  const video = previewRef.value
  if (!video || request !== previewRequest || !previewMounted.value) return

  if (/\.m3u8(\?|$)/i.test(source) && !video.canPlayType('application/vnd.apple.mpegurl')) {
    const HlsCtor = (await import('hls.js')).default
    if (request !== previewRequest || !previewMounted.value) return
    if (!HlsCtor.isSupported()) {
      stopPreview()
      return
    }
    hls = new HlsCtor()
    hls.loadSource(source)
    hls.attachMedia(video)
  }
  else {
    video.src = source
  }

  video.play().catch(() => stopPreview())
}

watch(() => props.previewVideoUrl, () => {
  stopPreview()
  syncPreviewCapability()
})

onMounted(() => {
  pointerQuery = window.matchMedia('(min-width: 769px) and (hover: hover) and (pointer: fine)')
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  syncPreviewCapability()
  pointerQuery.addEventListener('change', syncPreviewCapability)
  motionQuery.addEventListener('change', syncPreviewCapability)
})

onBeforeUnmount(() => {
  pointerQuery?.removeEventListener('change', syncPreviewCapability)
  motionQuery?.removeEventListener('change', syncPreviewCapability)
  pointerQuery = null
  motionQuery = null
  stopPreview()
})
</script>

<template>
  <NuxtLink
    :to="to"
    class="ex-tile"
    :class="{ 'is-previewing': previewVisible }"
    @pointerenter="startPreview"
    @pointerleave="stopPreview"
    @pointercancel="stopPreview"
  >
    <span class="ex-tile__media">
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="name"
        loading="lazy"
        decoding="async"
      >
      <span v-else class="ex-tile__placeholder" aria-hidden="true">{{ name.slice(0, 1) }}</span>
      <iframe
        v-if="previewMounted && youTubeId"
        class="ex-tile__preview"
        :src="`https://www.youtube-nocookie.com/embed/${youTubeId}?autoplay=1&mute=1&controls=0&playsinline=1&loop=1&playlist=${youTubeId}&rel=0`"
        :title="`${name} video preview`"
        tabindex="-1"
        allow="autoplay; encrypted-media"
        @load="markPreviewVisible(previewRequest)"
      />
      <video
        v-else-if="previewMounted"
        ref="previewRef"
        class="ex-tile__preview"
        muted
        loop
        playsinline
        preload="none"
        aria-hidden="true"
        @playing="markPreviewVisible(previewRequest)"
        @error="stopPreview"
      />
      <span v-if="hasVideo" class="ex-tile__play" aria-hidden="true">
        <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
          <path d="M0 0.9c0-.7.8-1.2 1.4-.8l8 5.1c.6.4.6 1.2 0 1.6l-8 5.1c-.6.4-1.4-.1-1.4-.8V.9Z" />
        </svg>
      </span>
    </span>
    <span class="ex-tile__body">
      <span class="ex-tile__name">{{ name }}</span>
      <span v-if="label" class="ex-tile__label">{{ label }}</span>
    </span>
  </NuxtLink>
</template>

<style scoped>
.ex-tile {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--liftag-border-strong);
  border-radius: var(--liftag-r-lg);
  background: var(--liftag-secondary);
  text-decoration: none;
  transition: border-color 240ms cubic-bezier(0.16, 1, 0.3, 1), transform 240ms cubic-bezier(0.16, 1, 0.3, 1);
}

.ex-tile:hover {
  border-color: rgba(204, 255, 0, 0.45);
  transform: translateY(-2px);
}

.ex-tile__media {
  position: relative;
  display: block;
  aspect-ratio: 3 / 2;
  overflow: hidden;
  background: var(--liftag-surface-dark);
}

.ex-tile__media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 420ms cubic-bezier(0.16, 1, 0.3, 1);
}

.ex-tile:hover .ex-tile__media img {
  transform: scale(1.04);
}

.ex-tile__preview {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  object-fit: cover;
  opacity: 0;
  pointer-events: none;
  transition: opacity 180ms ease;
}

.ex-tile.is-previewing .ex-tile__preview {
  opacity: 1;
}

.ex-tile.is-previewing .ex-tile__media img {
  transform: none;
}

.ex-tile__placeholder {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  color: rgba(204, 255, 0, 0.34);
  font-family: var(--liftag-font-headline);
  font-size: 44px;
  font-style: italic;
  font-weight: 700;
}

.ex-tile__play {
  position: absolute;
  right: 10px;
  bottom: 10px;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  padding-left: 2px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.62);
  border: 1px solid rgba(204, 255, 0, 0.5);
  color: var(--liftag-primary);
  transition: opacity 160ms ease, transform 160ms ease;
}

.ex-tile.is-previewing .ex-tile__play {
  opacity: 0;
  transform: scale(0.82);
}

.ex-tile__body {
  position: relative;
  display: grid;
  gap: 3px;
  padding: 12px 14px 13px;
}

.ex-tile__body::before {
  position: absolute;
  top: -36px;
  right: 0;
  left: 0;
  height: 38px;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(7, 8, 6, 0),
    rgba(7, 8, 6, 0.72) 56%,
    var(--liftag-secondary) 100%
  );
  content: '';
}

.ex-tile__name {
  color: #fff;
  font-family: var(--liftag-font-headline);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.25;
}

.ex-tile__label {
  color: var(--liftag-fg-tertiary);
  font-family: var(--liftag-font-mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

@media (prefers-reduced-motion: reduce) {
  .ex-tile,
  .ex-tile__media img,
  .ex-tile__preview,
  .ex-tile__play {
    transition: none;
  }
}
</style>
