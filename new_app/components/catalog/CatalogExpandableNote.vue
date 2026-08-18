<script setup lang="ts">
const props = defineProps<{
  text: string
}>()

const noteId = useId()
const textRef = ref<HTMLElement | null>(null)
const toggleRef = ref<HTMLButtonElement | null>(null)
const expanded = ref(false)
const overflowing = ref(false)

let phoneQuery: MediaQueryList | null = null
let resizeObserver: ResizeObserver | null = null
let measureFrame: number | null = null

function measureOverflow() {
  measureFrame = null

  if (!phoneQuery?.matches) {
    expanded.value = false
    overflowing.value = false
    return
  }

  const text = textRef.value
  if (!text || expanded.value) return
  overflowing.value = text.scrollHeight > text.clientHeight + 1
}

function scheduleOverflowMeasure() {
  if (!import.meta.client) return
  if (measureFrame !== null) cancelAnimationFrame(measureFrame)
  measureFrame = requestAnimationFrame(measureOverflow)
}

function syncPhoneLayout() {
  if (!phoneQuery?.matches) {
    expanded.value = false
    overflowing.value = false
    return
  }

  scheduleOverflowMeasure()
}

async function toggleExpanded() {
  const collapsing = expanded.value
  expanded.value = !expanded.value
  await nextTick()

  if (collapsing) toggleRef.value?.scrollIntoView({ block: 'nearest' })
  scheduleOverflowMeasure()
}

watch(() => props.text, async () => {
  expanded.value = false
  overflowing.value = false
  await nextTick()
  scheduleOverflowMeasure()
})

onMounted(() => {
  phoneQuery = window.matchMedia('(max-width: 768px)')
  phoneQuery.addEventListener('change', syncPhoneLayout)

  resizeObserver = new ResizeObserver(scheduleOverflowMeasure)
  if (textRef.value) resizeObserver.observe(textRef.value)
  scheduleOverflowMeasure()
})

onBeforeUnmount(() => {
  phoneQuery?.removeEventListener('change', syncPhoneLayout)
  phoneQuery = null
  resizeObserver?.disconnect()
  resizeObserver = null
  if (measureFrame !== null) cancelAnimationFrame(measureFrame)
  measureFrame = null
})
</script>

<template>
  <div class="catalog-note" :class="{ 'is-expanded': expanded }">
    <p :id="noteId" ref="textRef" class="catalog-note__text">{{ text }}</p>
    <button
      v-if="overflowing"
      ref="toggleRef"
      type="button"
      class="catalog-note__toggle"
      :aria-controls="noteId"
      :aria-expanded="expanded"
      @click="toggleExpanded"
    >
      <span>{{ expanded ? 'Show less' : 'Show more' }}</span>
      <svg
        class="catalog-note__chevron"
        viewBox="0 0 16 16"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m4 6 4 4 4-4" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.catalog-note__text {
  margin: 0;
  color: inherit;
  font: inherit;
  white-space: inherit;
}

.catalog-note__toggle {
  display: none;
  align-items: center;
  gap: 5px;
  min-height: 44px;
  margin: 4px 0 -8px;
  padding: 6px 0;
  border: 0;
  border-radius: var(--liftag-r-sm);
  background: transparent;
  color: var(--liftag-primary);
  font-family: var(--liftag-font-mono);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  line-height: 1;
  text-transform: uppercase;
  white-space: nowrap;
  cursor: pointer;
}

.catalog-note__toggle:focus-visible {
  outline: 2px solid var(--liftag-primary);
  outline-offset: 3px;
}

.catalog-note__chevron {
  transition: transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
}

.catalog-note.is-expanded .catalog-note__chevron {
  transform: rotate(180deg);
}

@media (max-width: 768px) {
  .catalog-note:not(.is-expanded) .catalog-note__text {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }

  .catalog-note__toggle {
    display: inline-flex;
  }
}

@media (prefers-reduced-motion: reduce) {
  .catalog-note__chevron {
    transition: none;
  }
}
</style>
