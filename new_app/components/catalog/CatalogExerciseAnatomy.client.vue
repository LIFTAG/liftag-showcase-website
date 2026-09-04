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
import {
  nearestAnatomySlug,
  parsePolygonPoints,
  stampAnatomyAssemble,
  stampAnatomyHoverOrigins,
  type AnatomyHitPoly,
} from '~/utils/anatomyAssemble'
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

const gridEl = ref<HTMLElement | null>(null)
const frontEl = ref<HTMLElement | null>(null)
const backEl = ref<HTMLElement | null>(null)
const assembled = ref(false)
const staticMotion = ref(false)
let frontInst: BodyHighlighterInstance | null = null
let backInst: BodyHighlighterInstance | null = null
let playTimer: ReturnType<typeof setTimeout> | null = null
let io: IntersectionObserver | null = null

// Function refs: `ref="frontEl"` compiles to a string ref under vue-tracer,
// so the script ref stays null in `nuxt dev` and the SVGs never mount.
function bindGrid(el: Element | ComponentPublicInstance | null) {
  gridEl.value = el instanceof HTMLElement ? el : null
}
function bindFront(el: Element | ComponentPublicInstance | null) {
  frontEl.value = el instanceof HTMLElement ? el : null
}
function bindBack(el: Element | ComponentPublicInstance | null) {
  backEl.value = el instanceof HTMLElement ? el : null
}

function prefersReducedMotion(): boolean {
  if (!import.meta.client) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function clearPlay() {
  if (playTimer != null) {
    clearTimeout(playTimer)
    playTimer = null
  }
  io?.disconnect()
  io = null
}

function destroyInstances() {
  clearPlay()
  assembled.value = false
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
  stampAnatomyAssemble(root, view)
  stampAnatomyHoverOrigins(root)
  root.querySelectorAll<SVGPolygonElement>('polygon[data-slug]').forEach((poly) => {
    const slug = poly.getAttribute('data-slug')
    if (slug) poly.setAttribute('title', muscleLabel(slug))
  })
}

function decorateInstances() {
  decorateView(frontEl.value, 'anterior')
  decorateView(backEl.value, 'posterior')
}

function startAssemble() {
  assembled.value = false
  requestAnimationFrame(() => {
    assembled.value = true
  })
}

function playAssemble() {
  clearPlay()
  staticMotion.value = prefersReducedMotion()
  if (staticMotion.value) {
    assembled.value = true
    return
  }

  const root = gridEl.value
  if (!root) {
    assembled.value = true
    return
  }

  const rect = root.getBoundingClientRect()
  const vh = window.innerHeight || 0
  const visible = rect.bottom > vh * 0.1 && rect.top < vh * 0.9

  if (visible) {
    playTimer = setTimeout(startAssemble, 90)
    return
  }

  io = new IntersectionObserver((entries) => {
    if (!entries.some(entry => entry.isIntersecting)) return
    io?.disconnect()
    io = null
    playTimer = setTimeout(startAssemble, 60)
  }, { threshold: 0.2, rootMargin: '0px 0px -6% 0px' })
  io.observe(root)
}

function goToSlug(slug: string) {
  const to = props.toFor?.(slug) ?? muscleChipPath(slug)
  void navigateTo(to)
}

function onMuscleClick(stats: IMuscleStats) {
  const slug = highlighterMuscleToSlug(stats.muscle)
  if (slug) goToSlug(slug)
}

let hotSlug: string | null = null

function setHotSlug(slug: string | null) {
  if (slug === hotSlug) return
  hotSlug = slug
  // Crevice hits land on the SVG, not a polygon — keep the pointer cursor
  // in lockstep with the hover/click target.
  gridEl.value?.classList.toggle('is-hot', slug != null)
  for (const root of [frontEl.value, backEl.value]) {
    root?.querySelectorAll('polygon[data-slug]').forEach((poly) => {
      poly.classList.toggle('is-hot', slug != null && poly.getAttribute('data-slug') === slug)
    })
  }
}

function clientToSvg(svg: SVGSVGElement, clientX: number, clientY: number): { x: number, y: number } | null {
  const ctm = svg.getScreenCTM()
  if (!ctm) return null
  const pt = svg.createSVGPoint()
  pt.x = clientX
  pt.y = clientY
  const mapped = pt.matrixTransform(ctm.inverse())
  return { x: mapped.x, y: mapped.y }
}

function hitsForSvg(svg: SVGSVGElement): AnatomyHitPoly[] {
  const hits: AnatomyHitPoly[] = []
  svg.querySelectorAll('polygon[data-slug]').forEach((poly) => {
    const slug = poly.getAttribute('data-slug')
    const points = parsePolygonPoints(poly.getAttribute('points') ?? '')
    if (slug && points) hits.push({ slug, points })
  })
  return hits
}

function slugFromPointer(event: PointerEvent): string | null {
  const target = event.target
  if (!(target instanceof Element)) return null
  const direct = target.closest('polygon')?.getAttribute('data-slug')
  if (direct) return direct
  const svg = target.closest('svg')
  if (!svg) return null
  const pt = clientToSvg(svg, event.clientX, event.clientY)
  if (!pt) return null
  return nearestAnatomySlug(hitsForSvg(svg), pt.x, pt.y)
}

function onPointerMove(event: PointerEvent) {
  setHotSlug(slugFromPointer(event))
}

function onPointerLeave() {
  setHotSlug(null)
}

function onGridClick(event: MouseEvent) {
  const target = event.target
  if (target instanceof Element && target.closest('polygon[data-slug]')) return
  if (hotSlug) goToSlug(hotSlug)
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
  playAssemble()
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
    :ref="bindGrid"
    class="anatomy-grid"
    :class="{ 'is-on': assembled, 'is-static': staticMotion }"
    role="group"
    aria-label="Muscle map"
    @pointermove="onPointerMove"
    @pointerleave="onPointerLeave"
    @click="onGridClick"
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
  --assemble-ease: cubic-bezier(0.25, 1, 0.5, 1);
  --ignite-ease: cubic-bezier(0.45, 0, 0.55, 1);
  /* Keep in lockstep with ANATOMY_ASSEMBLE.durationMs / hoverScale. */
  --assemble-dur: 680ms;
  --hover-scale: 1.055;
  display: flex;
  justify-content: center;
  gap: 2px;
  min-height: var(--anatomy-h, 230px);
  height: var(--anatomy-h, 230px);
}

.anatomy-cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 var(--anatomy-cell-w);
  width: var(--anatomy-cell-w);
  min-height: var(--anatomy-h, 230px);
  height: var(--anatomy-h, 230px);
  overflow: visible;
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
  overflow: visible;
  pointer-events: all;
}

.anatomy-grid.is-hot,
.anatomy-grid.is-hot :deep(.rbh-wrapper),
.anatomy-grid.is-hot :deep(.rbh) {
  cursor: pointer;
}

.anatomy-cell :deep(.rbh polygon) {
  cursor: default;
  pointer-events: none;
  transform-box: fill-box;
  transform-origin: 50% 50%;
  opacity: 0;
}

.anatomy-grid.is-on :deep(.rbh polygon),
.anatomy-grid.is-static :deep(.rbh polygon) {
  opacity: 1;
}

.anatomy-grid.is-static :deep(.rbh polygon) {
  transform: none;
  animation: none;
}

.anatomy-grid.is-on:not(.is-static) :deep(.rbh polygon) {
  animation: anatomy-assemble var(--assemble-dur) var(--assemble-ease)
    calc(var(--assemble-delay, 0) * 1ms) backwards;
}

.anatomy-grid.is-on:not(.is-static) :deep(.rbh polygon[data-heat='secondary']) {
  animation:
    anatomy-assemble var(--assemble-dur) var(--assemble-ease)
      calc(var(--assemble-delay, 0) * 1ms) backwards,
    anatomy-ignite-secondary 560ms var(--ignite-ease)
      calc(var(--ignite-delay, 0) * 1ms) none;
}

.anatomy-grid.is-on:not(.is-static) :deep(.rbh polygon[data-heat='primary']) {
  animation:
    anatomy-assemble var(--assemble-dur) var(--assemble-ease)
      calc(var(--assemble-delay, 0) * 1ms) backwards,
    anatomy-ignite-primary 620ms var(--ignite-ease)
      calc(var(--ignite-delay, 0) * 1ms) none;
}

.anatomy-cell :deep(.rbh polygon[data-slug]) {
  cursor: pointer;
  pointer-events: auto;
  transition:
    filter 200ms var(--assemble-ease),
    transform 220ms var(--assemble-ease);
}

.anatomy-cell :deep(.rbh polygon[data-heat='primary']) {
  filter: drop-shadow(0 0 2px rgba(204, 255, 0, 0.7));
}

.anatomy-cell :deep(.rbh polygon[data-slug].is-hot) {
  /* Shared slug origin so split parts (lat / lower-back) keep their gaps. */
  transform-box: view-box;
  transform-origin: var(--hover-ox, 50%) var(--hover-oy, 50%);
  transform: scale(var(--hover-scale));
  filter: brightness(1.55) saturate(1.12);
}

.anatomy-cell :deep(.rbh polygon[data-heat='primary'].is-hot) {
  filter: drop-shadow(0 0 5px rgba(204, 255, 0, 0.95)) brightness(1.14);
}

@keyframes anatomy-assemble {
  0% {
    opacity: 0;
    transform:
      translate(var(--assemble-x, 0px), var(--assemble-y, 0px))
      rotate(var(--assemble-rotate, 0deg))
      scale(var(--assemble-scale, 0.82));
  }
  22% {
    opacity: 0.82;
  }
  100% {
    opacity: 1;
    transform: translate(0px, 0px) rotate(0deg) scale(1);
  }
}

@keyframes anatomy-ignite-primary {
  0% {
    filter: drop-shadow(0 0 2px rgba(204, 255, 0, 0.7)) brightness(1);
    transform: scale(1);
  }
  38% {
    filter: drop-shadow(0 0 5px rgba(204, 255, 0, 0.95)) brightness(1.14);
    transform: scale(var(--hover-scale));
  }
  100% {
    filter: drop-shadow(0 0 2px rgba(204, 255, 0, 0.7)) brightness(1);
    transform: scale(1);
  }
}

@keyframes anatomy-ignite-secondary {
  0% {
    filter: brightness(1);
    transform: scale(1);
  }
  38% {
    filter: brightness(1.55) saturate(1.12);
    transform: scale(var(--hover-scale));
  }
  100% {
    filter: brightness(1);
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .anatomy-grid.is-on :deep(.rbh polygon) {
    animation: none !important;
  }

  .anatomy-cell :deep(.rbh polygon) {
    opacity: 1;
    transform: none;
    transition: none;
  }

  .anatomy-cell :deep(.rbh polygon[data-slug].is-hot) {
    transform: none;
  }
}
</style>
