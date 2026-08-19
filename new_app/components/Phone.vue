<script setup lang="ts">
// Async: Phone is rendered eagerly in the hero, and a static import here would
// drag three.js (~142KB gzip) into the modulepreloaded entry chunk. The
// placeholder <img> below covers the load - it stays visible until Phone3D
// emits `ready`, so a slower chunk fetch only lengthens the placeholder window.
const Phone3D = defineAsyncComponent(() => import('./Phone3D.vue'))

import type { ScreenVideoSegment, ScreenVideoSource } from '../utils/screenVideo'
import { createSegmentPlayback } from '../utils/screenVideo'

const MOBILE_PHONE_MQL = '(max-width: 768px)'
const REDUCED_MOTION_MQL = '(prefers-reduced-motion: reduce)'
const PHONE_PRELOAD_MARGIN = '800px 0px'
const staticScreenPreloadCache = new Map<string, Promise<void>>()

function preloadStaticScreen(src: string) {
  const cached = staticScreenPreloadCache.get(src)
  if (cached) return cached

  const promise = new Promise<void>((resolve) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => {
      const decodePromise = image.decode ? image.decode() : Promise.resolve()
      decodePromise
        .then(() => resolve())
        .catch(() => resolve())
    }
    image.onerror = () => resolve()
    image.src = src
  })

  staticScreenPreloadCache.set(src, promise)
  return promise
}

function screenVariant(src: string | undefined, width: 360 | 560 | 640) {
  if (!src?.startsWith('/assets/screens/') || !src.endsWith('.webp')) return undefined
  return `${src.slice(0, -'.webp'.length)}-${width}.webp`
}

function preferredScreenSrc(src: string | undefined) {
  return screenVariant(src, 560) ?? src ?? ''
}

const props = withDefaults(defineProps<{
  src?: string
  // Screen footage that replaces the still `src` on the display. `src` stays
  // the poster: it covers the load, and it is what reduced motion keeps.
  videoSources?: ScreenVideoSource[]
  videoSegment?: ScreenVideoSegment
  scale?: number
  tiltDelayMs?: number
  screenTransition?: boolean
  screenTransitionDirection?: 'up' | 'down' | 'left' | 'right'
  screenTransitionKey?: string | number
  style?: Record<string, string>
  lite?: boolean
  enableMobile3d?: boolean
  interactive3d?: boolean
  crisp3d?: boolean
  idle3d?: boolean
  priority?: boolean
  sizes?: string
  staticBezel?: boolean
}>(), {
  videoSources: undefined,
  videoSegment: undefined,
  scale: 1,
  tiltDelayMs: 0,
  screenTransition: false,
  screenTransitionDirection: 'up',
  screenTransitionKey: 0,
  lite: false,
  enableMobile3d: false,
  interactive3d: true,
  crisp3d: false,
  idle3d: false,
  priority: false,
  sizes: '(max-width: 768px) 46vw, 280px',
  staticBezel: true,
})

const hasMounted = ref(false)
const phoneRef = ref<HTMLDivElement | null>(null)
const renderStaticMockup = ref(false)
const render3dEnabled = ref(false)
const phone3dReady = ref(false)
const isNearViewport = ref(false)
const reduceMotion = ref(false)
const staticVideoRef = ref<HTMLVideoElement | null>(null)
const staticVideoOnScreen = ref(false)
// The element is transparent until it has a decoded frame, and goes
// transparent again whenever the segment controller reports it starved, so the
// still screenshot underneath covers both instead of a blank or frozen video.
const staticVideoHasFrame = ref(false)
const staticVideoStarved = ref(false)
const staticDisplaySrc = ref(preferredScreenSrc(props.src))

const render3dPhone = computed(() => (
  Boolean(props.src)
  && hasMounted.value
  && render3dEnabled.value
  && !renderStaticMockup.value
))
const renderStaticPhone = computed(() => Boolean(props.src) && !render3dPhone.value)
// Gated on `renderStaticMockup` rather than `renderStaticPhone`: the latter is
// also briefly true on desktop while Phone3D's chunk loads, and mounting the
// footage there would start a fetch that the 3D path immediately abandons.
const renderStaticVideo = computed(() => (
  Boolean(props.src)
  && Boolean(props.videoSources?.length)
  && hasMounted.value
  && renderStaticMockup.value
  && isNearViewport.value
  && !reduceMotion.value
))
const phoneClasses = computed(() => ({
  'phone--3d': render3dPhone.value,
  'phone--static-mockup': renderStaticPhone.value,
  'phone--static-frameless': renderStaticPhone.value && !props.staticBezel,
}))
const staticVideoVisible = computed(() => staticVideoHasFrame.value && !staticVideoStarved.value)
const staticTransitionName = computed(() => {
  if (!props.screenTransition) return 'phone-static-fade'
  return `phone-static-${props.screenTransitionDirection}`
})
const phone3dScreenshotSrc = computed(() => (
  props.crisp3d ? props.src ?? '' : preferredScreenSrc(props.src)
))
const imageLoading = computed(() => props.priority ? 'eager' : 'lazy')
const imageFetchPriority = computed(() => props.priority ? 'high' : 'auto')

let mobileMql: MediaQueryList | null = null
let onMobileChange: ((event: MediaQueryListEvent) => void) | null = null
let motionMql: MediaQueryList | null = null
let onMotionChange: ((event: MediaQueryListEvent) => void) | null = null
let nearViewportObserver: IntersectionObserver | null = null
let onScreenObserver: IntersectionObserver | null = null
let onDocumentVisibilityChange: (() => void) | null = null
let staticPlayback: ReturnType<typeof createSegmentPlayback> | null = null
let detachStaticVideo: (() => void) | null = null
let staticScreenRequestId = 0

function queueStaticScreen(src: string | undefined) {
  if (!src) {
    staticDisplaySrc.value = ''
    return Promise.resolve()
  }

  const displaySrc = preferredScreenSrc(src)
  const requestId = ++staticScreenRequestId
  return preloadStaticScreen(displaySrc).finally(() => {
    if (requestId === staticScreenRequestId) {
      staticDisplaySrc.value = displaySrc
    }
  })
}

watch(() => props.src, (src) => {
  if (!isNearViewport.value) return

  primeScreen(src)
})

// The 2D screen has no render loop of its own, so the segment controller owns
// playback here: it seeks each new segment to its start and parks the element
// on the segment's last frame.
watch(staticVideoRef, (video) => {
  staticPlayback?.dispose()
  staticPlayback = null
  detachStaticVideo?.()
  detachStaticVideo = null
  staticVideoHasFrame.value = false
  staticVideoStarved.value = false
  if (!video) return

  const onLoadedData = () => { staticVideoHasFrame.value = true }
  // HAVE_CURRENT_DATA: a source that was already decoded (a remount over a warm
  // cache) may never fire `loadeddata` again after this listener attaches.
  if (video.readyState >= 2) staticVideoHasFrame.value = true
  video.addEventListener('loadeddata', onLoadedData)
  detachStaticVideo = () => video.removeEventListener('loadeddata', onLoadedData)

  staticPlayback = createSegmentPlayback(video, {
    onStarvedChange: (starved) => { staticVideoStarved.value = starved },
  })
  staticPlayback.setSegment(props.videoSegment)
  staticPlayback.setActive(staticVideoOnScreen.value && !document.hidden)
})

watch(() => props.videoSegment, (segment) => staticPlayback?.setSegment(segment))

watch(render3dPhone, () => {
  phone3dReady.value = false
}, { flush: 'sync' })

function activatePhone() {
  if (isNearViewport.value) return

  isNearViewport.value = true
  // Overlap the async chunk fetch with the static-screen decode below.
  import('./Phone3D.vue').catch(() => {})
  primeScreen(props.src)
}

function primeScreen(requestedSrc: string | undefined) {
  return queueStaticScreen(requestedSrc).finally(() => {
    if (requestedSrc === props.src) {
      render3dEnabled.value = true
    }
  })
}

onMounted(() => {
  if (props.src) {
    mobileMql = window.matchMedia(MOBILE_PHONE_MQL)
    renderStaticMockup.value = mobileMql.matches && !props.enableMobile3d
    onMobileChange = (event) => {
      renderStaticMockup.value = event.matches && !props.enableMobile3d

      if (!renderStaticMockup.value && isNearViewport.value) {
        primeScreen(props.src)
      }
    }
    mobileMql.addEventListener('change', onMobileChange)
  }

  if (props.videoSources?.length) {
    motionMql = window.matchMedia(REDUCED_MOTION_MQL)
    reduceMotion.value = motionMql.matches
    onMotionChange = (event) => { reduceMotion.value = event.matches }
    motionMql.addEventListener('change', onMotionChange)

    onDocumentVisibilityChange = () => {
      staticPlayback?.setActive(staticVideoOnScreen.value && !document.hidden)
    }
    document.addEventListener('visibilitychange', onDocumentVisibilityChange)

    if (typeof IntersectionObserver !== 'undefined' && phoneRef.value) {
      onScreenObserver = new IntersectionObserver(
        (entries) => {
          staticVideoOnScreen.value = entries[0]?.isIntersecting ?? false
          staticPlayback?.setActive(staticVideoOnScreen.value && !document.hidden)
        },
        { threshold: 0 },
      )
      onScreenObserver.observe(phoneRef.value)
    } else {
      staticVideoOnScreen.value = true
    }
  }

  hasMounted.value = true

  if (props.priority || typeof IntersectionObserver === 'undefined') {
    activatePhone()
    return
  }

  nearViewportObserver = new IntersectionObserver(
    (entries) => {
      if (!entries[0]?.isIntersecting) return

      nearViewportObserver?.disconnect()
      nearViewportObserver = null
      activatePhone()
    },
    { rootMargin: PHONE_PRELOAD_MARGIN },
  )

  if (phoneRef.value) {
    nearViewportObserver.observe(phoneRef.value)
  }
})

onBeforeUnmount(() => {
  nearViewportObserver?.disconnect()
  onScreenObserver?.disconnect()
  staticPlayback?.dispose()
  staticPlayback = null
  detachStaticVideo?.()
  detachStaticVideo = null
  if (mobileMql && onMobileChange) {
    mobileMql.removeEventListener('change', onMobileChange)
  }
  if (motionMql && onMotionChange) {
    motionMql.removeEventListener('change', onMotionChange)
  }
  if (onDocumentVisibilityChange) {
    document.removeEventListener('visibilitychange', onDocumentVisibilityChange)
  }
})
</script>

<template>
  <div
    ref="phoneRef"
    class="phone"
    :class="phoneClasses"
    :style="{
      transform: `scale(${props.scale})`,
      transformOrigin: 'center',
      ...props.style,
    }"
  >
    <ClientOnly v-if="props.src && render3dPhone">
      <div class="phone-3d-stage">
        <img
          class="phone-3d-placeholder"
          :class="{ 'phone-3d-placeholder--hidden': phone3dReady }"
          :src="staticDisplaySrc"
          alt=""
          width="393"
          height="852"
          aria-hidden="true"
          decoding="async"
        />
        <Phone3D
          class="phone-3d-renderer"
          :class="{ 'phone-3d-renderer--ready': phone3dReady }"
          :screenshot-src="phone3dScreenshotSrc"
          :video-sources="props.videoSources"
          :video-segment="props.videoSegment"
          :tilt-delay-ms="props.tiltDelayMs"
          :screen-transition="props.screenTransition"
          :screen-transition-direction="props.screenTransitionDirection"
          :lite="props.lite"
          :interactive="props.interactive3d"
          :crisp-screen="props.crisp3d"
          :idle-motion="props.idle3d"
          @ready="phone3dReady = true"
        />
      </div>
      <template #fallback>
        <img
          class="phone-static-screen"
          :src="staticDisplaySrc"
          alt="LIFTAG screen"
          width="393"
          height="852"
          :loading="imageLoading"
          decoding="async"
          :fetchpriority="imageFetchPriority"
        />
      </template>
    </ClientOnly>
    <template v-else-if="props.src">
      <Transition :name="staticTransitionName">
        <img
          :key="`${staticDisplaySrc}-${props.screenTransitionKey}`"
          class="phone-static-screen"
          :src="staticDisplaySrc"
          alt="LIFTAG screen"
          width="393"
          height="852"
          :loading="imageLoading"
          decoding="async"
          :fetchpriority="imageFetchPriority"
        />
      </Transition>
      <video
        v-if="renderStaticVideo"
        ref="staticVideoRef"
        class="phone-static-screen phone-static-video"
        :class="{ 'phone-static-video--hidden': !staticVideoVisible }"
        muted
        playsinline
        webkit-playsinline
        preload="auto"
        width="393"
        height="852"
        aria-hidden="true"
      >
        <source
          v-for="source in props.videoSources"
          :key="source.src"
          :src="source.src"
          :type="source.type"
        />
      </video>
    </template>
    <slot v-else />
  </div>
</template>

<style scoped>
.phone-static-screen {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  object-fit: cover;
}

/* Sits over the still screenshot, which stays mounted underneath as the poster
   - for the window before the first decoded frame, and again any time the
   footage runs dry mid-segment. Uncovering it there is what keeps a starved
   decoder from showing as a frozen frame. */
.phone-static-video {
  z-index: 2;
  object-fit: cover;
  opacity: 1;
  transition: opacity 180ms ease;
}

.phone-static-video--hidden {
  opacity: 0;
}

.phone-3d-stage {
  position: absolute;
  inset: 0;
}

.phone-3d-placeholder {
  position: absolute;
  inset: 0;
  z-index: 1;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  border: 3px solid #2a2a2a;
  border-radius: 52px;
  object-fit: cover;
  opacity: 1;
  visibility: visible;
  box-shadow:
    0 0 0 1px #1a1a1a,
    0 30px 80px rgba(0, 0, 0, 0.8),
    0 0 60px rgba(204, 255, 0, 0.08);
  transition:
    opacity 140ms cubic-bezier(0.16, 1, 0.3, 1),
    visibility 0s linear;
}

.phone-3d-placeholder--hidden {
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 140ms cubic-bezier(0.16, 1, 0.3, 1),
    visibility 0s linear 140ms;
}

.phone-3d-renderer {
  z-index: 2;
  opacity: 0;
  transition: opacity 140ms cubic-bezier(0.16, 1, 0.3, 1);
}

.phone-3d-renderer--ready {
  opacity: 1;
}

.phone--static-mockup {
  border: 2px solid #050605;
  background: #050605;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.07),
    0 30px 80px rgba(0, 0, 0, 0.8),
    0 0 60px rgba(204, 255, 0, 0.08);
}

.phone--static-mockup.phone--static-frameless {
  border: 0;
  background: transparent;
  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.8),
    0 0 60px rgba(204, 255, 0, 0.08);
}

.phone--static-mockup::after {
  display: none;
}

/* Source screenshots include their own status chrome, but the captured Dynamic
   Island geometry is not perfectly consistent. On phone layouts, place one
   shared island above every static 2D device. Hero phones opt out through the
   frameless variant so their bespoke 3D treatment remains untouched. */
@media (max-width: 768px) {
  .phone--static-mockup:not(.phone--static-frameless)::before {
    content: '';
    position: absolute;
    z-index: 2;
    top: 1.8%;
    left: 50%;
    width: 32%;
    height: 4.1%;
    border-radius: 999px;
    background: #020302;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.38);
    transform: translateX(-50%);
    pointer-events: none;
  }
}

.phone-static-fade-enter-active,
.phone-static-fade-leave-active,
.phone-static-up-enter-active,
.phone-static-up-leave-active,
.phone-static-down-enter-active,
.phone-static-down-leave-active,
.phone-static-left-enter-active,
.phone-static-left-leave-active,
.phone-static-right-enter-active,
.phone-static-right-leave-active {
  transition:
    opacity 220ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 220ms cubic-bezier(0.16, 1, 0.3, 1);
}

.phone-static-fade-enter-from,
.phone-static-fade-leave-to {
  opacity: 0;
  transform: scale(1.015);
}

.phone-static-up-enter-from,
.phone-static-down-leave-to {
  opacity: 0;
  transform: translateY(7%);
}

.phone-static-up-leave-to,
.phone-static-down-enter-from {
  opacity: 0;
  transform: translateY(-7%);
}

.phone-static-left-enter-from,
.phone-static-right-leave-to {
  opacity: 0;
  transform: translateX(7%);
}

.phone-static-left-leave-to,
.phone-static-right-enter-from {
  opacity: 0;
  transform: translateX(-7%);
}

@media (prefers-reduced-motion: reduce) {
  .phone-static-video {
    transition: none;
  }

  .phone-3d-placeholder,
  .phone-3d-placeholder--hidden,
  .phone-3d-renderer {
    transition: none;
  }

  .phone-static-fade-enter-active,
  .phone-static-fade-leave-active,
  .phone-static-up-enter-active,
  .phone-static-up-leave-active,
  .phone-static-down-enter-active,
  .phone-static-down-leave-active,
  .phone-static-left-enter-active,
  .phone-static-left-leave-active,
  .phone-static-right-enter-active,
  .phone-static-right-leave-active {
    transition: none;
  }
}
</style>
