<script setup lang="ts">
import Phone3D from './Phone3D.vue'

const MOBILE_PHONE_MQL = '(max-width: 768px)'
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
  glow?: boolean
  scale?: number
  tiltDelayMs?: number
  screenTransition?: boolean
  screenTransitionDirection?: 'up' | 'down' | 'left' | 'right'
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
  glow: false,
  scale: 1,
  tiltDelayMs: 0,
  screenTransition: false,
  screenTransitionDirection: 'up',
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
const staticDisplaySrc = ref(preferredScreenSrc(props.src))

const render3dPhone = computed(() => (
  Boolean(props.src)
  && hasMounted.value
  && render3dEnabled.value
  && !renderStaticMockup.value
))
const renderStaticPhone = computed(() => Boolean(props.src) && !render3dPhone.value)
const phoneClasses = computed(() => ({
  'phone--3d': render3dPhone.value,
  'phone--static-mockup': renderStaticPhone.value,
  'phone--static-frameless': renderStaticPhone.value && !props.staticBezel,
}))
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
let nearViewportObserver: IntersectionObserver | null = null
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

watch(render3dPhone, () => {
  phone3dReady.value = false
}, { flush: 'sync' })

function activatePhone() {
  if (isNearViewport.value) return

  isNearViewport.value = true
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
  if (mobileMql && onMobileChange) {
    mobileMql.removeEventListener('change', onMobileChange)
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
      animation: props.glow ? 'pulse-glow 4s ease-in-out infinite' : undefined,
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
    <Transition
      v-else-if="props.src"
      :name="staticTransitionName"
    >
      <img
        :key="staticDisplaySrc"
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
