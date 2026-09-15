<script setup lang="ts">
import type { DiscoveryLocale, DiscoveryMedia } from '~/types/discovery'
import { discoveryCopy } from '~/utils/discoveryCopy'
const props = defineProps<{ media: DiscoveryMedia[]; name: string; locale: DiscoveryLocale }>()
const index = shallowRef(0),
  expanded = shallowRef(false)
const animate = shallowRef(true)
const direction = shallowRef(1)
const expandButton = useTemplateRef<HTMLButtonElement>('expandButton')
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
watch(
  () => props.media,
  () => {
    index.value = 0
    expanded.value = false
  },
)
function select(next: number, smooth = true) {
  animate.value = smooth
  direction.value = Math.sign(next - index.value) || 1
  index.value = next
}
function step(delta: number, smooth = true) {
  if (props.media.length < 2) return
  select((index.value + delta + props.media.length) % props.media.length, smooth)
  direction.value = Math.sign(delta)
}
async function closeViewer() {
  expanded.value = false
  await nextTick()
  // The originally opened photo may now be an inert, offscreen slide.
  expandButton.value?.focus({ preventScroll: true })
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
  step(event.key === 'ArrowLeft' ? -1 : 1, false)
}
</script>
<template>
  <section class="d-gallery" :aria-label="copy.gallery">
    <div v-if="current" class="d-gallery-stage">
      <DiscoveryGalleryCarousel
        :media="media"
        :index="index"
        :name="name"
        :locale="locale"
        :active="!expanded"
        :animate="animate"
        :direction="direction"
        :zoomed="zoomed"
        @select="select"
        @open="expanded = true"
      />
      <button ref="expandButton" class="d-gallery-expand d-icon-button" :aria-label="copy.openGallery" @click="expanded = true">
        <DiscoveryIcon name="expand" />
      </button>
      <DiscoveryGalleryNav
        v-if="media.length > 1"
        class="d-gallery-controls"
        :class="{ 'd-gallery-controls--video': current.type === 'video' }"
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
        @click="select(i)"
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
      @close="closeViewer"
      @keydown="viewerKeydown"
    >
      <DiscoveryGalleryCarousel
        :media="media"
        :index="index"
        :name="name"
        :locale="locale"
        :animate="animate"
        :direction="direction"
        :zoomed="zoomed"
        fullscreen
        @select="select"
      />
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
.d-gallery-controls--video {
  top: 12px;
  bottom: auto;
}
.d-gallery-expand {
  position: absolute;
  top: 12px;
  left: 12px;
  color: #f5f5f3;
  background: #111e;
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
  .d-gallery-stage {
    border-radius: 16px;
  }
}
</style>
