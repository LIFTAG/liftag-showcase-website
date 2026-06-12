<script setup lang="ts">
import Phone3D from './Phone3D.vue'

const MOBILE_PHONE_MQL = '(max-width: 768px)'
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
  priority?: boolean
  sizes?: string
}>(), {
  glow: false,
  scale: 1,
  tiltDelayMs: 0,
  screenTransition: false,
  screenTransitionDirection: 'up',
  lite: false,
  priority: false,
  sizes: '(max-width: 768px) 46vw, 280px',
})

const hasMounted = ref(false)
const renderStaticMockup = ref(false)
const staticDisplaySrc = ref(preferredScreenSrc(props.src))

const render3dPhone = computed(() => Boolean(props.src) && hasMounted.value && !renderStaticMockup.value)
const renderStaticPhone = computed(() => Boolean(props.src) && !render3dPhone.value)
const phoneClasses = computed(() => ({
  'phone--3d': render3dPhone.value,
  'phone--static-mockup': renderStaticPhone.value,
}))
const staticTransitionName = computed(() => {
  if (!props.screenTransition) return 'phone-static-fade'
  return `phone-static-${props.screenTransitionDirection}`
})
const responsiveSrcset = computed(() => {
  if (!props.src?.startsWith('/assets/screens/') || !props.src.endsWith('.webp')) return undefined

  const base = props.src.slice(0, -'.webp'.length)
  const originalWidth = props.src.includes('/home-hero-no-qr.webp') ? 1100 : 800

  return `${base}-360.webp 360w, ${base}-560.webp 560w, ${base}-640.webp 640w, ${props.src} ${originalWidth}w`
})
const phone3dScreenshotSrc = computed(() => preferredScreenSrc(props.src))
const imageLoading = computed(() => props.priority ? 'eager' : 'lazy')
const imageFetchPriority = computed(() => props.priority ? 'high' : 'auto')

let mobileMql: MediaQueryList | null = null
let onMobileChange: ((event: MediaQueryListEvent) => void) | null = null
let staticScreenRequestId = 0

function queueStaticScreen(src: string | undefined) {
  if (!src) {
    staticDisplaySrc.value = ''
    return
  }

  const displaySrc = preferredScreenSrc(src)
  const requestId = ++staticScreenRequestId
  preloadStaticScreen(displaySrc).finally(() => {
    if (requestId === staticScreenRequestId) {
      staticDisplaySrc.value = displaySrc
    }
  })
}

watch(() => props.src, (src) => {
  queueStaticScreen(src)
})

onMounted(() => {
  queueStaticScreen(props.src)

  if (props.src) {
    mobileMql = window.matchMedia(MOBILE_PHONE_MQL)
    renderStaticMockup.value = mobileMql.matches
    onMobileChange = (event) => {
      renderStaticMockup.value = event.matches
    }
    mobileMql.addEventListener('change', onMobileChange)
  }
  hasMounted.value = true
})

onBeforeUnmount(() => {
  if (mobileMql && onMobileChange) {
    mobileMql.removeEventListener('change', onMobileChange)
  }
})
</script>

<template>
  <div
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
      <Phone3D
        :screenshot-src="phone3dScreenshotSrc"
        :tilt-delay-ms="props.tiltDelayMs"
        :screen-transition="props.screenTransition"
        :screen-transition-direction="props.screenTransitionDirection"
        :lite="props.lite"
      />
      <template #fallback>
        <img
          class="phone-static-screen"
          :src="props.src"
          :srcset="responsiveSrcset"
          :sizes="props.sizes"
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
        :srcset="responsiveSrcset"
        :sizes="props.sizes"
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

.phone--static-mockup::after {
  content: '';
  position: absolute;
  inset: 8px;
  z-index: 2;
  border-radius: 24px;
  pointer-events: none;
  box-shadow:
    inset 0 10px 24px rgba(255, 255, 255, 0.04),
    inset 0 -22px 34px rgba(0, 0, 0, 0.28);
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
