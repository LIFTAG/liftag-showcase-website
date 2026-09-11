<script setup lang="ts">
import { buildRepCurves } from '~/utils/oneRepMaxCurve'
import { formatLoad, fromKg, loadIncrement, roundToIncrement, toKg, type FormulaId, type WeightUnit } from '~/utils/oneRepMax'

const props = defineProps<{
  weightKg: number
  reps: number
  formulaId: FormulaId
  unit: WeightUnit
  qualifier: string
}>()
const uid = useId()
const chart = useTemplateRef<HTMLElement>('chart')
const viewWidth = shallowRef(580)
let resizeObserver: ResizeObserver | undefined
onMounted(() => {
  if (!chart.value) return
  resizeObserver = new ResizeObserver(([entry]) => {
    if (entry && entry.contentRect.width > 0) viewWidth.value = entry.contentRect.width
  })
  resizeObserver.observe(chart.value)
})
onBeforeUnmount(() => resizeObserver?.disconnect())
const targetReps = shallowRef(8)
const showFormulas = shallowRef(false)
const curves = computed(() => buildRepCurves(props.weightKg, props.reps))
const lastRep = computed(() => Math.max(15, props.reps))
const active = computed(() => curves.value.find(curve => curve.id === props.formulaId)!)
const target = computed(() => active.value.points[targetReps.value - 1]!)
const maxKg = computed(() => active.value.points[0]!.kg)
const roundedKg = computed(() => toKg(roundToIncrement(fromKg(target.value.kg, props.unit), loadIncrement(props.unit)), props.unit))
const domain = computed(() => {
  const loads = curves.value.flatMap(curve => curve.points.map(point => point.kg))
  const low = fromKg(Math.min(...loads), props.unit) * .82
  const high = fromKg(Math.max(...loads), props.unit) * 1.08
  const roughStep = (high - low) / 3
  const magnitude = 10 ** Math.floor(Math.log10(roughStep))
  const step = ([1, 2, 2.5, 5, 10].find(value => value * magnitude >= roughStep) ?? 10) * magnitude
  const start = Math.floor(low / step) * step
  const end = Math.ceil(high / step) * step
  return { low: toKg(start, props.unit), high: toKg(end, props.unit), step: toKg(step, props.unit) }
})
const chartHeight = 204
const plot = computed(() => ({ left: 38, right: viewWidth.value - 22, top: 28, bottom: chartHeight - 26 }))
const x = (reps: number) => plot.value.left + (reps - 1) / (lastRep.value - 1) * (plot.value.right - plot.value.left)
const y = (kg: number) => plot.value.bottom - (kg - domain.value.low) / (domain.value.high - domain.value.low) * (plot.value.bottom - plot.value.top)
const geometry = computed(() => curves.value.map(curve => ({
  ...curve,
  points: curve.points.map(point => ({ x: x(point.reps), y: y(point.kg) })),
})))
const displayedGeometry = shallowRef(geometry.value)
const displayedSetProgress = shallowRef((props.reps - 1) / (lastRep.value - 1))
type ChartPoint = { x: number, y: number }
const mix = (from: number, to: number, progress: number) => from + (to - from) * progress
function pointAt(points: ChartPoint[], progress: number): ChartPoint {
  const index = Math.max(0, Math.min(1, progress)) * (points.length - 1)
  const lower = points[Math.floor(index)]!
  const upper = points[Math.min(Math.floor(index) + 1, points.length - 1)]!
  return { x: mix(lower.x, upper.x, index % 1), y: mix(lower.y, upper.y, index % 1) }
}
const displayedActive = computed(() => displayedGeometry.value.find(curve => curve.id === props.formulaId)!)
const paths = computed(() => displayedGeometry.value.map(curve => ({
  ...curve,
  d: curve.points.map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(' '),
})))
const activePath = computed(() => paths.value.find(curve => curve.id === props.formulaId)!.d)
const fillPath = computed(() => `${activePath.value} L${plot.value.right},${plot.value.bottom} L${plot.value.left},${plot.value.bottom} Z`)
const guides = computed(() => Array.from({ length: Math.round((domain.value.high - domain.value.low) / domain.value.step) + 1 }, (_, index) => {
  const kg = domain.value.low + index * domain.value.step
  return { kg, y: y(kg) }
}))
const anchor = computed(() => pointAt(displayedActive.value.points, displayedSetProgress.value))
const displayedReps = shallowRef({ dot: targetReps.value, pillar: targetReps.value, slider: targetReps.value, glow: targetReps.value })
const clampRep = (reps: number) => Math.max(1, Math.min(lastRep.value, reps))
const visualReps = computed(() => clampRep(displayedReps.value.dot))
// Sample the visible line so the dot stays attached during both animations.
const cursor = computed(() => pointAt(displayedActive.value.points, (visualReps.value - 1) / (lastRep.value - 1)))
const pillarX = computed(() => x(clampRep(displayedReps.value.pillar)))
const glowX = computed(() => x(clampRep(displayedReps.value.glow)))
const sliderProgress = computed(() => (clampRep(displayedReps.value.slider) - 1) / (lastRep.value - 1))
let motionQuery: MediaQueryList | undefined
let cursorFrame = 0
let morphFrame = 0

function settleGeometry() {
  cancelAnimationFrame(morphFrame)
  morphFrame = 0
  displayedGeometry.value = geometry.value
  displayedSetProgress.value = (props.reps - 1) / (lastRep.value - 1)
}

watch(geometry, (destination) => {
  if (!import.meta.client) return
  cancelAnimationFrame(morphFrame)
  if (!motionQuery || motionQuery.matches) {
    settleGeometry()
    return
  }
  // Resample the current visible shape when the rep range changes its point
  // count. Rapid edits start here too, without jumping back to an old input.
  const origin = destination.map(curve => {
    const previous = displayedGeometry.value.find(item => item.id === curve.id)!
    return curve.points.map((_, index) => pointAt(previous.points, index / (curve.points.length - 1)))
  })
  const fromSet = displayedSetProgress.value
  const toSet = (props.reps - 1) / (lastRep.value - 1)
  const startedAt = performance.now()
  const animate = (now: number) => {
    const progress = Math.min(1, (now - startedAt) / 240)
    const eased = 1 - (1 - progress) ** 4
    displayedGeometry.value = progress === 1 ? destination : destination.map((curve, curveIndex) => ({
      ...curve,
      points: curve.points.map((point, index) => ({
        x: mix(origin[curveIndex]![index]!.x, point.x, eased),
        y: mix(origin[curveIndex]![index]!.y, point.y, eased),
      })),
    }))
    displayedSetProgress.value = mix(fromSet, toSet, eased)
    morphFrame = progress < 1 ? requestAnimationFrame(animate) : 0
  }
  morphFrame = requestAnimationFrame(animate)
})

function settleCursor() {
  cancelAnimationFrame(cursorFrame)
  cursorFrame = 0
  const reps = targetReps.value
  displayedReps.value = { dot: reps, pillar: reps, slider: reps, glow: reps }
}

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  motionQuery.addEventListener('change', settleCursor)
  motionQuery.addEventListener('change', settleGeometry)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(cursorFrame)
  cancelAnimationFrame(morphFrame)
  motionQuery?.removeEventListener('change', settleCursor)
  motionQuery?.removeEventListener('change', settleGeometry)
})

watch(targetReps, (destination) => {
  if (!import.meta.client) return
  cancelAnimationFrame(cursorFrame)
  if (motionQuery?.matches) {
    settleCursor()
    return
  }
  const origin = displayedReps.value
  const startedAt = performance.now()
  const animate = (now: number) => {
    const elapsed = now - startedAt
    const follow = (from: number, duration: number) => {
      const progress = Math.min(1, elapsed / duration)
      const eased = 1 - (1 - progress) ** 4
      return clampRep(from) + (destination - clampRep(from)) * eased
    }
    // Slower layers trail the dot without a start delay that would keep
    // restarting (and freezing them) during continuous cursor movement.
    displayedReps.value = {
      dot: follow(origin.dot, 180),
      pillar: follow(origin.pillar, 230),
      slider: follow(origin.slider, 270),
      glow: follow(origin.glow, 320),
    }
    cursorFrame = elapsed < 320 ? requestAnimationFrame(animate) : 0
  }
  cursorFrame = requestAnimationFrame(animate)
})
const ticks = computed(() => [...new Set([1, 5, 10, 15, lastRep.value])]
  .filter(tick => tick === lastRep.value || lastRep.value - tick >= 3))
const targetLabel = computed(() => `${targetReps.value} ${targetReps.value === 1 ? 'rep' : 'reps'}, estimated maximum ${formatLoad(target.value.kg, props.unit)} ${props.unit}`)
const formulaRange = computed(() => {
  const values = curves.value.map(curve => curve.points[targetReps.value - 1]!.kg)
  return `${formatLoad(Math.min(...values), props.unit)}–${formatLoad(Math.max(...values), props.unit)} ${props.unit}`
})

watch(lastRep, (last) => { targetReps.value = Math.min(targetReps.value, last) })

function explore(event: PointerEvent) {
  if (event.type === 'pointermove' && event.pointerType !== 'mouse' && !event.buttons) return
  const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const svgX = (event.clientX - bounds.left) / bounds.width * viewWidth.value
  targetReps.value = Math.max(1, Math.min(lastRep.value, Math.round(1 + (svgX - plot.value.left) / (plot.value.right - plot.value.left) * (lastRep.value - 1))))
}
</script>

<template>
  <div class="strength-curve">
    <div class="curve-heading">
      <h3>Your strength curve</h3>
      <button type="button" class="formula-toggle" :aria-pressed="showFormulas" @click="showFormulas = !showFormulas">
        <HoloPill />
        <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true"><path d="M2 4c6 0 8 12 16 12M2 10h16M2 16C8 16 10 4 18 4" /></svg>
        7 formulas
      </button>
    </div>
    <div ref="chart" class="curve-plot" @pointerdown="explore" @pointermove="explore">
      <svg class="curve-svg" :viewBox="`0 0 ${viewWidth} ${chartHeight}`" :style="{ height: `${chartHeight}px` }" aria-hidden="true">
        <defs>
          <linearGradient :id="`${uid}-fill`" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="currentColor" stop-opacity=".2" />
            <stop offset="1" stop-color="currentColor" stop-opacity="0" />
          </linearGradient>
          <linearGradient :id="`${uid}-scan`">
            <stop offset="0" stop-color="currentColor" stop-opacity="0" />
            <stop offset=".5" stop-color="currentColor" stop-opacity=".2" />
            <stop offset="1" stop-color="currentColor" stop-opacity="0" />
          </linearGradient>
          <clipPath :id="`${uid}-area`"><path :d="fillPath" /></clipPath>
        </defs>
        <g v-for="guide in guides" :key="guide.y" class="grid-guide">
          <line :x1="plot.left" :x2="plot.right" :y1="guide.y" :y2="guide.y" />
          <text x="28" :y="guide.y + 4" text-anchor="end">{{ formatLoad(guide.kg, unit) }}</text>
        </g>
        <path :d="fillPath" :fill="`url(#${uid}-fill)`" />
        <g class="curve-ribs" :clip-path="`url(#${uid}-area)`">
          <line v-for="n in 69" :key="n" :x1="plot.left + (n - 1) / 68 * (plot.right - plot.left)" :x2="plot.left + (n - 1) / 68 * (plot.right - plot.left)" :y1="plot.top" :y2="plot.bottom" />
          <rect class="cursor-sweep" x="-50" :style="{ transform: `translateX(${glowX}px)` }" :y="plot.top" width="100" :height="plot.bottom - plot.top" :fill="`url(#${uid}-scan)`" />
        </g>
        <g class="alternate-curves" :class="{ visible: showFormulas }">
          <path v-for="curve in paths" :key="curve.id" :d="curve.d" />
        </g>
        <path class="curve-glow" :d="activePath" />
        <path class="curve-line" :d="activePath" />
        <g class="input-anchor" :transform="`translate(${anchor.x}, ${anchor.y})`">
          <circle r="4" />
          <text class="input-label" :y="anchor.y < plot.top + 32 ? 21 : -13" :text-anchor="reps > lastRep - 3 ? 'end' : 'start'" :x="reps > lastRep - 3 ? -10 : 10">Your set</text>
        </g>
        <g class="curve-cursor">
          <line class="cursor-line" :style="{ transform: `translateX(${pillarX}px)` }" :y1="plot.top" :y2="plot.bottom" />
          <g :style="{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }" class="cursor-dot">
            <circle class="cursor-halo" r="15" /><circle class="cursor-ring" r="8" /><circle class="cursor-core" r="3.5" />
          </g>
        </g>
        <text v-for="tick in ticks" :key="tick" class="axis-tick" :x="x(tick)" :y="chartHeight - 5" :text-anchor="tick === lastRep ? 'end' : 'middle'">{{ tick }}<tspan v-if="tick === lastRep"> reps</tspan></text>
        <text x="28" :y="plot.top - 16" text-anchor="end" class="axis-unit">{{ unit }}</text>
      </svg>
    </div>
    <div class="target-control">
      <div class="target-heading">
        <label :for="`${uid}-reps`">Explore a rep target</label>
        <span class="target-reps">{{ targetReps }} <small>{{ targetReps === 1 ? 'rep' : 'reps' }}</small></span>
      </div>
      <div class="target-slider">
        <div class="target-slider-visual" aria-hidden="true">
          <span class="target-slider-track" />
          <span class="target-slider-fill" :style="{ transform: `scaleX(${sliderProgress})` }" />
          <span class="target-slider-position" :style="{ transform: `translateX(${sliderProgress * 100}%)` }"><span class="target-slider-thumb" /></span>
        </div>
        <input :id="`${uid}-reps`" v-model.number="targetReps" type="range" min="1" :max="lastRep" step="1" :aria-valuetext="targetLabel">
      </div>
    </div>
    <div class="target-result">
      <div><span class="target-caption">{{ targetReps === reps ? 'Your completed set' : 'Estimated rep max' }}</span><p><strong>{{ formatLoad(target.kg, unit) }}</strong> {{ unit }} <span class="target-times">×</span> <strong>{{ targetReps }}</strong> <span class="target-unit">{{ targetReps === 1 ? 'rep' : 'reps' }}</span></p></div>
      <div class="target-context"><strong>{{ Math.round(target.kg / maxKg * 100) }}% <span>of 1RM</span></strong><span>{{ formatLoad(roundedKg, unit) }} {{ unit }} rounded</span></div>
    </div>
    <p class="curve-explanation" aria-live="polite">
      <template v-if="showFormulas">{{ formulaRange }} across seven formulas at {{ targetReps }} {{ targetReps === 1 ? 'rep' : 'reps' }}. Their spread is disagreement, not a confidence interval.</template>
      <template v-else>More reps, less weight. The same estimated strength.<template v-if="targetReps > 10 || reps > 10"> Above 10 reps, predictions are rougher.</template><template v-else> Rep maxes assume a hard set.</template></template>
      <template v-if="qualifier"> Loads {{ qualifier }}.</template>
    </p>
  </div>
</template>

<style scoped>
.strength-curve { min-width: 0; margin-top: 26px; }
.curve-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.curve-heading h3 { margin: 0; font-size: 12px; font-weight: 500; }
.formula-toggle { position: relative; isolation: isolate; overflow: hidden; display: flex; align-items: center; justify-content: center; gap: 7px; min-height: 36px; padding: 0 9px; border: 1px solid var(--orm-line); border-radius: 7px; color: var(--orm-muted); background: transparent; font: inherit; font-size: 11px; cursor: pointer; transition: color .2s, border-color .2s, background .2s, box-shadow .2s; }
.formula-toggle > :not(canvas) { position: relative; z-index: 1; }
.formula-toggle[aria-pressed="true"] { color: var(--orm-accent); border-color: oklch(60% .12 120); background: var(--orm-accent-soft); }
.formula-toggle:focus-visible { outline: 2px solid var(--orm-accent); outline-offset: 3px; }
@media (hover: hover) and (pointer: fine) {
  .formula-toggle:hover,
  .formula-toggle:focus-visible,
  .formula-toggle:has(> .holo-pill-canvas.is-holo) {
    color: var(--orm-accent);
    border-color: oklch(92% .23 120 / .32);
    box-shadow: 0 0 12px oklch(80% .12 240 / .1), 0 0 16px oklch(92% .23 120 / .09);
  }
  .formula-toggle[aria-pressed="true"]:hover,
  .formula-toggle[aria-pressed="true"]:has(> .holo-pill-canvas.is-holo) {
    border-color: oklch(60% .12 120);
  }
}
.curve-plot { margin: 8px -8px 0 -27px; touch-action: pan-y; cursor: crosshair; }
.curve-svg { width: 100%; display: block; overflow: visible; color: var(--orm-accent); }
.grid-guide line { stroke: var(--orm-line); stroke-width: .7; stroke-dasharray: 2 5; }
.grid-guide text, .axis-tick, .axis-unit { fill: var(--orm-muted); font: 10px var(--liftag-font-body); font-variant-numeric: tabular-nums; }
.axis-unit { font-size: 9px; }
.curve-ribs line { stroke: currentColor; stroke-opacity: .12; stroke-width: 1; }
.curve-glow, .curve-line, .alternate-curves path { fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; }
.curve-line { stroke-width: 2; }
.curve-glow { stroke-width: 8; opacity: .12; filter: blur(3px); }
.alternate-curves { opacity: 0; transition: opacity .24s; }
.alternate-curves.visible { opacity: .42; }
.alternate-curves path { stroke-width: 1; }
.input-anchor circle { fill: var(--orm-result); stroke: var(--orm-ink); stroke-width: 2; }
.input-label { fill: var(--orm-ink); font: 500 11px var(--liftag-font-body); filter: drop-shadow(0 0 2px var(--orm-result)) drop-shadow(0 0 4px var(--orm-result)); }
.cursor-line { stroke: currentColor; opacity: .35; stroke-dasharray: 3 4; }
.cursor-halo { fill: currentColor; opacity: .1; }
.cursor-ring { fill: var(--orm-result); stroke: currentColor; stroke-opacity: .6; }
.cursor-core { fill: currentColor; }
.target-control { margin-top: 13px; }
.target-heading { display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: var(--orm-muted); }
.target-reps { color: var(--orm-ink); font-variant-numeric: tabular-nums; font-size: 13px; }
.target-reps small { font-size: 11px; color: var(--orm-muted); }
.target-slider { position: relative; }
.target-slider-visual { position: absolute; inset: 0 8px; pointer-events: none; }
.target-slider-track, .target-slider-fill { position: absolute; inset: calc(50% - 1.5px) 0 auto; height: 3px; border-radius: 3px; background: var(--orm-line); }
.target-slider-fill { background: var(--orm-accent); transform-origin: left; }
.target-slider-position { position: absolute; inset: 0; }
.target-slider-thumb { position: absolute; top: calc(50% - 8px); left: -8px; box-sizing: border-box; width: 16px; height: 16px; background: var(--orm-accent); border: 4px solid var(--orm-result); border-radius: 50%; box-shadow: 0 0 0 1px var(--orm-accent); }
.target-control input { position: relative; display: block; appearance: none; width: 100%; height: 32px; margin: 0; padding: 0; background: transparent; cursor: ew-resize; }
.target-control input::-webkit-slider-runnable-track { height: 3px; background: transparent; }
.target-control input::-moz-range-track { height: 3px; background: transparent; }
.target-control input::-moz-range-progress { background: transparent; }
.target-control input::-webkit-slider-thumb { appearance: none; width: 16px; height: 16px; margin-top: -6.5px; border: 0; background: transparent; }
.target-control input::-moz-range-thumb { width: 16px; height: 16px; border: 0; background: transparent; }
.target-control input:focus-visible { outline: 2px solid var(--orm-accent); outline-offset: 3px; border-radius: 3px; }
.target-result { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 8px; }
.target-caption { font-size: 10px; color: var(--orm-muted); }
.target-result p { margin: 5px 0 0; color: var(--orm-muted); font-size: 13px; font-variant-numeric: tabular-nums; }
.target-result p strong { color: var(--orm-ink); font-size: 25px; font-weight: 500; letter-spacing: -.04em; }
.target-times { margin: 0 7px; color: var(--orm-muted); }
.target-context { display: grid; gap: 6px; text-align: right; font-size: 10px; color: var(--orm-muted); font-variant-numeric: tabular-nums; }
.target-context strong { color: var(--orm-accent); font-size: 13px; font-weight: 500; }
.target-context strong span { color: var(--orm-muted); font-size: 10px; font-weight: 400; }
.curve-explanation { margin: 13px 0 0; min-height: 32px; color: var(--orm-muted); font-size: 10px; line-height: 1.6; }
@media (max-width: 700px) {
  .strength-curve { margin-top: 22px; }
  .curve-plot { margin-left: -18px; }
  .target-control input { height: 40px; }
  .formula-toggle { min-height: 40px; }
  .curve-explanation { font-size: 11px; min-height: 36px; }
  .target-result p strong { font-size: 23px; }
}
@media (prefers-reduced-motion: reduce) { .alternate-curves, .formula-toggle { transition: none; } }
</style>
