<script setup lang="ts" generic="T extends string">
const model = defineModel<T | ''>({ required: true })
const props = defineProps<{
  options: readonly [{ value: T, label: string }, { value: T, label: string }]
}>()

const selection = useTemplateRef<HTMLElement>('selection')
const selectedIndex = computed(() => props.options.findIndex(option => option.value === model.value))
const selectedTransform = computed(() => `translateX(${Math.max(0, selectedIndex.value) * 100}%)`)
const MORPH_MS = 240
let motion: Animation | undefined
let reducedMotion: MediaQueryList | undefined

function stopMotion() {
  motion?.cancel()
  motion = undefined
}

// Capture the painted capsule before Vue updates its destination. Interrupted
// gestures continue from that position and shape; calculator values never wait.
watch(selectedIndex, (index, previous) => {
  const element = selection.value
  if (!element || !import.meta.client) return
  if (index < 0 || reducedMotion?.matches) {
    stopMotion()
    return
  }

  const style = getComputedStyle(element)
  const matrix = new DOMMatrixReadOnly(style.transform)
  const width = parseFloat(style.width)
  const from = width > 0 ? matrix.m41 / width : Math.max(0, previous)
  stopMotion()

  const keyframes: Keyframe[] = previous < 0
    ? [{ opacity: 0, transform: `translateX(${index * 100}%) scale(.94)` },
        { opacity: 1, transform: `translateX(${index * 100}%) scale(1)` }]
    : Array.from({ length: 25 }, (_, frame) => {
        const offset = frame / 24
        const progress = 1 - (1 - offset) ** 4
        const travel = from + (index - from) * progress
        // A brief, continuous stretch gives the capsule liquid weight. Only
        // transforms animate, with no delayed edge, layout animation or text warp.
        const stretch = Math.sin(Math.PI * progress) * Math.min(1, Math.abs(index - from))
        const scaleX = 1 + (matrix.m11 - 1) * (1 - progress) + stretch * .2
        const scaleY = 1 + (matrix.m22 - 1) * (1 - progress) - stretch * .055
        return { offset, transform: `translateX(${travel * 100}%) scale(${scaleX}, ${scaleY})` }
      })

  motion = element.animate(keyframes, {
    duration: previous < 0 ? 160 : MORPH_MS,
    easing: previous < 0 ? 'cubic-bezier(.22, 1, .36, 1)' : 'linear',
  })
})

onMounted(() => {
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.addEventListener('change', stopMotion)
})

onUnmounted(() => {
  stopMotion()
  reducedMotion?.removeEventListener('change', stopMotion)
})
</script>

<template>
  <div class="morph-switch" role="group">
    <span
      ref="selection"
      class="morph-selection"
      aria-hidden="true"
      :style="{ transform: selectedTransform, visibility: selectedIndex < 0 ? 'hidden' : 'visible' }"
    ><span class="morph-glass" /></span>
    <button
      v-for="option in options"
      :key="option.value"
      class="morph-option"
      type="button"
      :aria-pressed="model === option.value"
      @click="model = option.value"
    >{{ option.label }}</button>
  </div>
</template>

<style scoped>
.morph-switch {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  flex-shrink: 0;
  isolation: isolate;
  min-width: 104px;
  height: 46px;
  padding: 4px;
  border: 1px solid oklch(96% .007 115 / .1);
  border-radius: 999px;
  background: oklch(12% .008 115 / .38);
  box-shadow: inset 0 1px 3px oklch(6% .005 115 / .24), 0 1px 0 oklch(96% .007 115 / .035);
  font-size: var(--switch-font-size, 13px);
  font-weight: 550;
}
.morph-option {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  padding: 0 13px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--orm-muted);
  font: inherit;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: color 100ms ease-out, transform 120ms cubic-bezier(.22, 1, .36, 1);
}
.morph-option[aria-pressed="true"] { color: var(--orm-ink); }
.morph-selection {
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 4px;
  width: calc((100% - 8px) / 2);
  pointer-events: none;
}
.morph-glass {
  position: absolute;
  inset: 0;
  border: 1px solid oklch(96% .007 115 / .22);
  border-radius: 999px;
  background: linear-gradient(165deg, oklch(96% .007 115 / .2), oklch(96% .007 115 / .075) 58%, oklch(92% .055 120 / .12));
  box-shadow: inset 0 1px 0 oklch(98% .005 115 / .18), inset 0 -1px 0 oklch(96% .007 115 / .045), 0 2px 5px oklch(6% .005 115 / .24);
  transition: transform 120ms cubic-bezier(.22, 1, .36, 1);
}
.morph-switch:has(.morph-option:active) .morph-glass { transform: scale(.96); }
.morph-option:active { transform: scale(.96); }
.morph-option:focus-visible { outline: 2px solid var(--orm-accent); outline-offset: 3px; }
@media (hover: hover) { .morph-option:hover { color: var(--orm-ink); } }
@media (prefers-reduced-motion: reduce) {
  .morph-option, .morph-glass { transition: none; }
  .morph-option:active, .morph-switch:has(.morph-option:active) .morph-glass { transform: none; }
}
@media (prefers-reduced-transparency: reduce) {
  .morph-switch { background: var(--orm-surface); }
  .morph-glass { background: var(--orm-ink); }
  .morph-option[aria-pressed="true"] { color: var(--orm-surface); }
}
</style>
