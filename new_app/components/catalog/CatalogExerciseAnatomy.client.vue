<script setup lang="ts">
import createBodyHighlighter, {
  type BodyHighlighterInstance,
  type IExerciseData,
  type IMuscleStats,
} from 'body-highlighter'
import {
  BODY_COLOR,
  HEAT_COLORS,
  buildExerciseBodyData,
  highlighterMuscleToSlug,
  stampHighlighterPolygons,
} from '~/utils/exerciseAnatomy'
import { muscleChipPath } from '~/utils/catalogLocale'
import { muscleHub } from '~/utils/muscles'

const props = withDefaults(defineProps<{
  primarySlug?: string | null
  primaryName?: string | null
  secondary?: Array<{ slug: string, name: string }>
  toFor?: (slug: string) => string
  nameFor?: (slug: string, fallback: string) => string
}>(), {
  primarySlug: null,
  primaryName: null,
  secondary: () => [],
})

const bodyData = computed<IExerciseData[]>(() => {
  const names: Record<string, string> = {}
  if (props.primarySlug && props.primaryName) names[props.primarySlug] = props.primaryName
  for (const muscle of props.secondary) names[muscle.slug] = muscle.name
  return buildExerciseBodyData(
    props.primarySlug,
    props.secondary.map(muscle => muscle.slug),
    names,
  )
})

const frontEl = ref<HTMLElement | null>(null)
const backEl = ref<HTMLElement | null>(null)
let frontInst: BodyHighlighterInstance | null = null
let backInst: BodyHighlighterInstance | null = null

// Function refs: `ref="frontEl"` compiles to a string ref under vue-tracer,
// so the script ref stays null in `nuxt dev` and the SVGs never mount.
function bindFront(el: Element | ComponentPublicInstance | null) {
  frontEl.value = el instanceof HTMLElement ? el : null
}
function bindBack(el: Element | ComponentPublicInstance | null) {
  backEl.value = el instanceof HTMLElement ? el : null
}

function destroyInstances() {
  setHotSlug(null)
  frontInst?.destroy()
  backInst?.destroy()
  frontInst = null
  backInst = null
}

function muscleLabel(slug: string): string {
  const fallback = muscleHub(slug)?.name ?? slug
  return props.nameFor?.(slug, fallback) ?? fallback
}

function decorateView(root: HTMLElement | null, view: 'anterior' | 'posterior') {
  if (!root) return
  stampHighlighterPolygons(root, view)
  root.querySelectorAll<SVGPolygonElement>('polygon[data-slug]').forEach((poly) => {
    const slug = poly.getAttribute('data-slug')
    if (slug) poly.setAttribute('title', muscleLabel(slug))
  })
}

function decorateInstances() {
  decorateView(frontEl.value, 'anterior')
  decorateView(backEl.value, 'posterior')
}

function onMuscleClick(stats: IMuscleStats) {
  const slug = highlighterMuscleToSlug(stats.muscle)
  if (!slug) return
  const to = props.toFor?.(slug) ?? muscleChipPath(slug)
  void navigateTo(to)
}

let hotSlug: string | null = null

function setHotSlug(slug: string | null) {
  if (slug === hotSlug) return
  hotSlug = slug
  for (const root of [frontEl.value, backEl.value]) {
    root?.querySelectorAll('polygon[data-slug]').forEach((poly) => {
      poly.classList.toggle('is-hot', slug != null && poly.getAttribute('data-slug') === slug)
    })
  }
}

function onPointerOver(event: PointerEvent) {
  const target = event.target
  if (!(target instanceof Element)) return
  const poly = target.closest('polygon')
  setHotSlug(poly?.getAttribute('data-slug') ?? null)
}

function onPointerLeave() {
  setHotSlug(null)
}

function buildInstances() {
  destroyInstances()
  const shared = {
    bodyColor: BODY_COLOR,
    highlightedColors: HEAT_COLORS,
    data: bodyData.value,
    svgStyle: { height: '100%', width: '100%' },
    onClick: onMuscleClick,
  }
  if (frontEl.value) {
    frontInst = createBodyHighlighter({ ...shared, container: frontEl.value, type: 'anterior' })
  }
  if (backEl.value) {
    backInst = createBodyHighlighter({ ...shared, container: backEl.value, type: 'posterior' })
  }
  decorateInstances()
}

watch(bodyData, (data) => {
  if (frontInst || backInst) {
    frontInst?.update({ data })
    backInst?.update({ data })
    decorateInstances()
    return
  }
  buildInstances()
})

watch([frontEl, backEl], () => {
  buildInstances()
}, { flush: 'post' })

onBeforeUnmount(destroyInstances)
</script>

<template>
  <div
    class="anatomy-grid"
    role="group"
    aria-label="Muscle map"
    @pointerover="onPointerOver"
    @pointerleave="onPointerLeave"
  >
    <div :ref="bindFront" class="anatomy-cell" />
    <div :ref="bindBack" class="anatomy-cell" />
  </div>
</template>

<style scoped>
.anatomy-grid {
  /* viewBox is 100×200; size cells to that so the pair sits tight instead
     of two small figures floating in full-width columns. */
  --anatomy-cell-w: calc(var(--anatomy-h, 230px) * 0.5);
  display: flex;
  justify-content: center;
  gap: 2px;
  min-height: var(--anatomy-h, 230px);
  height: var(--anatomy-h, 230px);
}

.anatomy-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 var(--anatomy-cell-w);
  width: var(--anatomy-cell-w);
  min-height: var(--anatomy-h, 230px);
  height: var(--anatomy-h, 230px);
  overflow: hidden;
}

.anatomy-cell :deep(.rbh-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.anatomy-cell :deep(.rbh) {
  display: block;
  width: 100%;
  height: 100%;
}

.anatomy-cell :deep(.rbh polygon) {
  cursor: default;
  transition: filter 160ms ease;
}

.anatomy-cell :deep(.rbh polygon[data-slug]) {
  cursor: pointer;
}

.anatomy-cell :deep(.rbh polygon[style*='#ccff00']) {
  filter: drop-shadow(0 0 2px rgba(204, 255, 0, 0.7));
}

.anatomy-cell :deep(.rbh polygon:hover),
.anatomy-cell :deep(.rbh polygon.is-hot) {
  filter: brightness(1.55) saturate(1.12);
}

.anatomy-cell :deep(.rbh polygon[style*='#ccff00']:hover),
.anatomy-cell :deep(.rbh polygon[style*='#ccff00'].is-hot) {
  filter: drop-shadow(0 0 5px rgba(204, 255, 0, 0.95)) brightness(1.14);
}

@media (prefers-reduced-motion: reduce) {
  .anatomy-cell :deep(.rbh polygon) {
    transition: none;
  }
}
</style>
