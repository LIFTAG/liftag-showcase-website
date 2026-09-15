<script setup lang="ts">
import type { DiscoveryLocale, DiscoveryMedia } from '~/types/discovery'
import { discoveryCopy } from '~/utils/discoveryCopy'
const props = defineProps<{ media: DiscoveryMedia[]; name: string; locale: DiscoveryLocale }>()
const index = shallowRef(0),
  expanded = shallowRef(false)
const failed = ref(new Set<string>())
const current = computed(() => props.media[index.value])
const copy = computed(() => discoveryCopy(props.locale))
const zoomed = shallowRef(false)
let viewport: VisualViewport | null = null
function updateZoom() {
  zoomed.value = (viewport?.scale ?? 1) > 1
}
onMounted(() => {
  viewport = window.visualViewport
  updateZoom()
  viewport?.addEventListener('resize', updateZoom)
})
onBeforeUnmount(() => viewport?.removeEventListener('resize', updateZoom))
let swipeStart: Touch | null = null
watch(
  () => props.media,
  () => {
    index.value = 0
    expanded.value = false
    swipeStart = null
  },
)
function step(delta: number) {
  if (props.media.length < 2) return
  index.value = (index.value + delta + props.media.length) % props.media.length
}
function startSwipe(event: TouchEvent) {
  swipeStart = null
  // Leave navigation buttons, links and native/embedded video controls in charge of their gestures.
  if (
    props.media.length < 2 ||
    event.touches.length !== 1 ||
    (window.visualViewport?.scale ?? 1) > 1 ||
    (event.target instanceof Element &&
      event.target.closest('video, iframe, a, button:not(.d-gallery-image)'))
  )
    return
  swipeStart = event.touches[0] ?? null
}
function cancelSwipe() {
  swipeStart = null
}
function moveSwipe(event: TouchEvent) {
  if (!swipeStart) return
  const touch = event.touches[0]
  if (!touch || event.touches.length !== 1 || touch.identifier !== swipeStart.identifier) {
    cancelSwipe()
    return
  }
  const dx = touch.clientX - swipeStart.clientX
  const dy = touch.clientY - swipeStart.clientY
  // Once a gesture becomes a vertical scroll, it cannot turn into a gallery swipe.
  if (Math.abs(dy) > 10 && Math.abs(dy) >= Math.abs(dx)) cancelSwipe()
}
function endSwipe(event: TouchEvent) {
  const start = swipeStart
  cancelSwipe()
  if (!start || event.touches.length) return
  const touch = Array.from(event.changedTouches).find(item => item.identifier === start.identifier)
  if (!touch) return
  const dx = touch.clientX - start.clientX
  const dy = touch.clientY - start.clientY
  if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return
  // A swipe must not also trigger the photo button's fullscreen click.
  if (event.cancelable) event.preventDefault()
  step(dx < 0 ? 1 : -1)
}
function viewerKeydown(event: KeyboardEvent) {
  if (
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') ||
    (event.target instanceof HTMLElement &&
      event.target.closest('video, iframe, input, textarea, select, [contenteditable]'))
  )
    return
  event.preventDefault()
  step(event.key === 'ArrowLeft' ? -1 : 1)
}
</script>
<template>
  <section class="d-gallery" :aria-label="copy.gallery">
    <div
      v-if="current"
      class="d-gallery-stage"
      @touchstart.passive="startSwipe"
      @touchmove.passive="moveSwipe"
      @touchend="endSwipe"
      @touchcancel.passive="cancelSwipe"
    >
      <DiscoveryVideo
        v-if="current.type === 'video'"
        :key="current.url"
        :src="current.url"
        :poster="current.posterUrl"
        :title="name"
        :locale="locale"
      />
      <button
        v-else
        class="d-gallery-image"
        :style="{ touchAction: zoomed ? 'auto' : 'pan-y pinch-zoom' }"
        :aria-label="`${copy.photos}: ${name}`"
        @click="expanded = true"
      >
        <img
          v-if="!failed.has(current.url)"
          :src="current.url"
          :alt="`${name}, ${index + 1}`"
          fetchpriority="high"
          @error="failed.add(current.url)"
        />
        <span v-else class="d-gallery-empty"><DiscoveryIcon name="image" :size="40" /></span>
      </button>
      <DiscoveryGalleryNav
        v-if="media.length > 1"
        class="d-gallery-controls"
        :index="index"
        :total="media.length"
        :locale="locale"
        @step="step"
      />
    </div>
    <div v-else class="d-gallery-empty">
      <DiscoveryIcon name="image" :size="40" />
      <span>{{ copy.noMedia }}</span>
    </div>
    <div v-if="media.length > 1" class="d-gallery-thumbs">
      <button
        v-for="(item, i) in media"
        :key="item.url"
        :aria-label="`${item.type === 'video' ? copy.video : copy.photos} ${i + 1}`"
        :aria-pressed="i === index"
        @click="index = i"
      >
        <img
          v-if="item.type === 'image' || item.posterUrl"
          :src="item.type === 'image' ? item.url : item.posterUrl!"
          alt=""
          loading="lazy"
        />
        <DiscoveryIcon v-else name="play" />
        <span v-if="item.type === 'video'" class="d-thumb-play">
          <DiscoveryIcon name="play" :size="13" />
        </span>
      </button>
    </div>
    <DiscoveryDialog
      v-if="expanded && current"
      :title="name"
      :locale="locale"
      fullscreen
      @close="expanded = false"
      @keydown="viewerKeydown"
    >
      <div
        class="d-expanded-media"
        @touchstart.passive="startSwipe"
        @touchmove.passive="moveSwipe"
        @touchend="endSwipe"
        @touchcancel.passive="cancelSwipe"
      >
        <DiscoveryVideo
          v-if="current.type === 'video'"
          :key="current.url"
          :src="current.url"
          :poster="current.posterUrl"
          :title="name"
          :locale="locale"
        />
        <img
          v-else-if="!failed.has(current.url)"
          :key="current.url"
          :src="current.url"
          :alt="`${name}, ${index + 1}`"
          class="d-expanded-image"
          :style="{ touchAction: zoomed ? 'auto' : 'pan-y pinch-zoom' }"
          @error="failed.add(current.url)"
        />
        <div v-else class="d-empty" role="status">
          <DiscoveryIcon name="image" :size="40" />
          <p>{{ copy.loadError }}</p>
        </div>
      </div>
      <DiscoveryGalleryNav
        v-if="media.length > 1"
        class="d-expanded-controls"
        :index="index"
        :total="media.length"
        :locale="locale"
        live
        @step="step"
      />
    </DiscoveryDialog>
  </section>
</template>
<style scoped>
.d-gallery {
  min-width: 0;
}
.d-gallery-stage {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
}
.d-gallery-image {
  display: block;
  border: 0;
  padding: 0;
  width: 100%;
  background: var(--d-panel);
  cursor: zoom-in;
}
.d-gallery-image img {
  display: block;
  width: 100%;
  aspect-ratio: 16/10;
  object-fit: cover;
}
.d-gallery-empty {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  background: var(--d-panel);
  color: var(--d-muted);
  border-radius: 20px;
}
.d-gallery-controls {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  background: #111e;
  color: #f5f5f3;
  border-radius: 24px;
}
.d-gallery-thumbs {
  scrollbar-width: none;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 12px 3px 4px;
}
.d-gallery-thumbs button {
  position: relative;
  display: grid;
  place-items: center;
  flex: 0 0 64px;
  height: 48px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 10px;
  overflow: hidden;
  background: var(--d-panel);
  color: var(--d-muted);
}
.d-gallery-thumbs img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.d-gallery-thumbs button[aria-pressed='true'] {
  border-color: var(--d-accent);
}
.d-thumb-play {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: #0003;
  color: #f5f5f3;
}
.d-expanded-media {
  display: grid;
  place-items: center;
  flex: 1;
  min-width: 0;
  min-height: 0;
  padding: 12px max(12px, env(safe-area-inset-right, 0px))
    max(12px, env(safe-area-inset-bottom, 0px)) max(12px, env(safe-area-inset-left, 0px));
}
.d-expanded-image,
.d-expanded-media :deep(.d-video) {
  display: block;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  max-height: none;
  aspect-ratio: auto;
  object-fit: contain;
  border-radius: 0;
}
.d-expanded-controls {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 8px max(16px, env(safe-area-inset-right, 0px))
    max(8px, env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px));
  border-top: 1px solid var(--d-border);
}
/* The counter lives inside <DiscoveryGalleryNav>, past this component's scope. */
.d-expanded-controls :deep(span) {
  min-width: 64px;
  text-align: center;
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;
}
@media (max-width: 767px) {
  .d-gallery-stage,
  .d-gallery-image {
    border-radius: 16px;
  }
  .d-gallery-image img {
    aspect-ratio: 1.75;
  }
}
</style>
