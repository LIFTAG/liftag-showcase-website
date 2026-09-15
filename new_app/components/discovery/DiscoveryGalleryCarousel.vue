<script setup lang="ts">
import type { DiscoveryLocale, DiscoveryMedia } from '~/types/discovery'
import { discoveryCopy } from '~/utils/discoveryCopy'

const props = withDefaults(defineProps<{
  media: DiscoveryMedia[]
  index: number
  name: string
  locale: DiscoveryLocale
  fullscreen?: boolean
  active?: boolean
  animate?: boolean
  direction?: number
  zoomed?: boolean
}>(), { active: true, animate: true, direction: 1 })
const emit = defineEmits<{ select: [index: number]; open: [] }>()
const viewport = useTemplateRef<HTMLDivElement>('viewport')
const mounted = shallowRef(false)
const failed = ref(new Set<string>())
const copy = computed(() => discoveryCopy(props.locale))
const looping = computed(() => mounted.value && props.media.length > 1)
const slides = computed(() => {
  const items = props.media.map((item, index) => ({ item, index, key: item.url, clone: false }))
  if (!looping.value) return items
  return [
    { ...items[items.length - 1]!, key: 'loop-last', clone: true },
    ...items,
    { ...items[0]!, key: 'loop-first', clone: true },
  ]
})
let selected = props.index
let ready = false
let touching = false
let width = 0
let resize: ResizeObserver | undefined
let settleTimer: ReturnType<typeof setTimeout> | undefined

function scrollToSlide(position: number, smooth = false) {
  const element = viewport.value
  if (!element) return
  element.scrollTo({ left: position * element.clientWidth, behavior: smooth ? 'auto' : 'instant' })
}
function align() {
  selected = props.index
  scrollToSlide(selected + Number(looping.value))
}
function settle() {
  clearTimeout(settleTimer)
  const element = viewport.value
  if (!ready || touching || !element?.clientWidth || props.zoomed || !props.media.length) return
  const position = Math.round(element.scrollLeft / element.clientWidth)
  const index = looping.value
    ? (position - 1 + props.media.length) % props.media.length
    : Math.max(0, Math.min(position, props.media.length - 1))
  selected = index
  // The two inert bookends keep swipes continuous at either end without duplicate players.
  if (looping.value && (position === 0 || position === props.media.length + 1)) scrollToSlide(index + 1)
  if (index !== props.index) emit('select', index)
}
function onScroll() {
  // Older Safari releases do not dispatch scrollend.
  if (!viewport.value || 'onscrollend' in viewport.value) return
  clearTimeout(settleTimer)
  settleTimer = setTimeout(settle, 150)
}
function touchStart() {
  touching = true
}
function touchEnd(event: TouchEvent) {
  touching = event.touches.length > 0
  if (!touching) onScroll()
}
watch(() => props.index, (index) => {
  if (!ready || index === selected) return
  const previous = selected
  selected = index
  let position = index + Number(looping.value)
  const wrapsForward = looping.value && props.direction > 0 && previous === props.media.length - 1 && index === 0
  const wrapsBackward = looping.value && props.direction < 0 && previous === 0 && index === props.media.length - 1
  if (wrapsForward) position = props.media.length + 1
  if (wrapsBackward) position = 0
  scrollToSlide(position, props.active && props.animate && (Math.abs(index - previous) === 1 || wrapsForward || wrapsBackward))
})
watch(() => props.media, async () => {
  ready = false
  await nextTick()
  align()
  ready = true
})
watch(() => props.zoomed, align)
onMounted(async () => {
  mounted.value = true
  await nextTick()
  const element = viewport.value
  if (!element) return
  width = element.clientWidth
  align()
  ready = true
  resize = new ResizeObserver(() => {
    if (element.clientWidth === width) return
    width = element.clientWidth
    align()
  })
  resize.observe(element)
})
onBeforeUnmount(() => {
  ready = false
  resize?.disconnect()
  clearTimeout(settleTimer)
})
</script>
<template>
  <div
    ref="viewport"
    class="d-carousel"
    :class="{ 'd-carousel--fullscreen': fullscreen, 'd-carousel--zoomed': zoomed }"
    @scroll.passive="onScroll"
    @scrollend="settle"
    @touchstart.passive="touchStart"
    @touchend.passive="touchEnd"
    @touchcancel.passive="touchEnd"
  >
    <div
      v-for="slide in slides"
      :key="slide.key"
      class="d-carousel-slide"
      :inert="slide.clone || slide.index !== index"
      :aria-hidden="slide.clone || slide.index !== index"
    >
      <DiscoveryVideo
        v-if="slide.item.type === 'video' && !slide.clone && slide.index === index && active"
        :src="slide.item.url"
        :poster="slide.item.posterUrl"
        :title="name"
        :locale="locale"
      />
      <button
        v-else-if="slide.item.type === 'image' && !fullscreen"
        class="d-carousel-photo"
        :aria-label="`${copy.photos}: ${name}`"
        @click="emit('open')"
      >
        <img
          v-if="!failed.has(slide.item.url)"
          :src="slide.item.url"
          :alt="`${name}, ${slide.index + 1}`"
          :loading="slide.index === index && !slide.clone ? 'eager' : 'lazy'"
          :fetchpriority="slide.index === index && !slide.clone ? 'high' : 'auto'"
          draggable="false"
          @error="failed.add(slide.item.url)"
        />
        <span v-else class="d-carousel-placeholder"><DiscoveryIcon name="image" :size="40" /></span>
      </button>
      <img
        v-else-if="(slide.item.type === 'image' || slide.item.posterUrl) && !failed.has(slide.item.url)"
        class="d-carousel-poster"
        :src="slide.item.type === 'image' ? slide.item.url : slide.item.posterUrl!"
        :alt="slide.item.type === 'image' ? `${name}, ${slide.index + 1}` : ''"
        loading="lazy"
        draggable="false"
        @error="failed.add(slide.item.url)"
      />
      <div v-else class="d-carousel-placeholder">
        <DiscoveryIcon :name="slide.item.type === 'video' ? 'play' : 'image'" :size="40" />
        <p v-if="failed.has(slide.item.url)">{{ copy.loadError }}</p>
      </div>
    </div>
  </div>
</template>
<style scoped>
.d-carousel {
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  scrollbar-width: none;
  overscroll-behavior-x: contain;
  min-width: 0;
  width: 100%;
  aspect-ratio: 16/10;
}
.d-carousel::-webkit-scrollbar { display: none; }
.d-carousel-slide {
  flex: 0 0 100%;
  min-width: 0;
  height: 100%;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}
.d-carousel-photo {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  padding: 0;
  background: var(--d-panel);
  cursor: zoom-in;
}
.d-carousel-photo img,
.d-carousel-poster,
.d-carousel-slide :deep(.d-video) {
  display: block;
  width: 100%;
  height: 100%;
  max-height: none;
  aspect-ratio: auto;
  object-fit: cover;
  border-radius: 0;
}
.d-carousel-slide :deep(.d-video) { object-fit: contain; }
.d-carousel-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 100%;
  background: var(--d-panel);
  color: var(--d-muted);
}
.d-carousel--fullscreen {
  flex: 1;
  min-height: 0;
  aspect-ratio: auto;
}
.d-carousel--fullscreen .d-carousel-slide {
  padding: 12px max(12px, env(safe-area-inset-right, 0px))
    max(12px, env(safe-area-inset-bottom, 0px)) max(12px, env(safe-area-inset-left, 0px));
}
.d-carousel--fullscreen .d-carousel-poster { object-fit: contain; }
.d-carousel--zoomed {
  overflow-x: hidden;
  scroll-snap-type: none;
  overscroll-behavior-x: auto;
}
@media (max-width: 767px) {
  .d-carousel:not(.d-carousel--fullscreen) { aspect-ratio: 1.75; }
}
@media (prefers-reduced-motion: reduce) {
  .d-carousel { scroll-behavior: auto; }
}
</style>
