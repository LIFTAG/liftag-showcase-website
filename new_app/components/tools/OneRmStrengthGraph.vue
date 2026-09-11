<script setup lang="ts">
import { formatLoad, type LiftId, type WeightUnit } from '~/utils/oneRepMax'
import {
  densityMarkerRatio,
  sampleSmoothedDensity,
  smoothedDensityAt,
  strengthDensity,
  strongerThanShare,
  type ComparisonSex,
  type StrengthComparison,
} from '~/utils/strengthStandards'

const props = defineProps<{
  comparison: StrengthComparison | null
  lift: LiftId
  sex: ComparisonSex | ''
  unit: WeightUnit
  bodyweightKg: number | null
}>()
const id = `strength-graph-${useId()}`
const plot = { left: 18, right: 502, top: 36, bottom: 204 }
const density = computed(() => strengthDensity(props.lift, props.sex))
const chart = computed(() => {
  const model = density.value
  if (!model) return null
  const samples = sampleSmoothedDensity(model)
  if (!samples.length) return null
  const peak = Math.max(1e-6, ...samples.map(sample => sample.density))
  const domainStart = samples[0]!.ratio
  const domainEnd = samples[samples.length - 1]!.ratio
  const x = (ratio: number) => plot.left + (ratio - domainStart) / Math.max(domainEnd - domainStart, 1e-9) * (plot.right - plot.left)
  const y = (value: number) => plot.bottom - value / peak * (plot.bottom - plot.top)
  const markerRatio = props.comparison ? densityMarkerRatio(props.comparison, model) : null
  const markerX = markerRatio == null ? plot.left : x(markerRatio)
  const markerY = markerRatio == null ? plot.bottom : y(smoothedDensityAt(model, markerRatio))
  const nearRight = markerX > plot.right - 56
  const start = !nearRight
  const silhouette = curvePath(samples, x, y)
  const area = `${silhouette} L${x(samples[samples.length - 1]!.ratio).toFixed(2)} ${plot.bottom} L${x(samples[0]!.ratio).toFixed(2)} ${plot.bottom} Z`
  return {
    area,
    silhouette,
    markerX,
    markerY,
    markerOffset: start ? 8 : -8,
    markerLabel: props.comparison?.boundary === 'below' ? '← You' : props.comparison?.boundary === 'above' || nearRight ? 'You →' : 'You',
    markerAnchor: start ? 'start' : 'end',
    revealWidth: markerRatio == null ? 0 : Math.max(0, markerX - plot.left),
    anchors: model.anchors
      .filter((anchor, index, list) => index === list.findLastIndex(item => item.ratio === anchor.ratio))
      .map((anchor, index, list) => ({
        ...anchor,
        x: x(anchor.ratio),
        value: props.bodyweightKg != null
          ? `${formatLoad(anchor.ratio * props.bodyweightKg, props.unit)}${index === list.length - 1 ? ` ${props.unit}` : ''}`
          : formatRatio(anchor.ratio),
        named: index === 0 || anchor.percentile === 50 || anchor.percentile === 95 || anchor.percentile === 100 || index === list.length - 1,
        start: index === 0,
        end: index === list.length - 1,
      })),
  }
})
const axisLegend = computed(() => props.bodyweightKg != null ? `Estimated 1RM (${props.unit})` : '× bodyweight')
const description = computed(() => {
  if (props.comparison) return `You are stronger than ${strongerThanShare(props.comparison)} of lifters in your comparison group. The chart is the density implied by the published beginner to elite bodyweight ratios. The highlighted area is the share you are ahead of.${props.comparison.boundary ? ` Your marker is at the ${props.comparison.boundary === 'below' ? '5%' : 'modeled tail'} edge; your exact position lies beyond it.` : ''}`
  if (density.value) return 'Approximate distribution of lifters for this exercise, reconstructed from published beginner to elite percentiles. Add your details to see your place.'
  return 'Strength distribution for the selected exercise. Choose a comparison group to reveal it.'
})

function formatRatio(ratio: number) {
  return `${String(+ratio.toFixed(2))}×`
}

function curvePath(
  samples: { ratio: number, density: number }[],
  x: (ratio: number) => number,
  y: (value: number) => number,
) {
  return samples.map((sample, index) => `${index ? 'L' : 'M'}${x(sample.ratio).toFixed(2)} ${y(sample.density).toFixed(2)}`).join(' ')
}
</script>

<template>
  <figure class="strength-graph" :class="{ 'has-result': comparison, 'has-density': chart }" :aria-label="description">
    <svg class="density-svg" viewBox="0 0 520 272" aria-hidden="true">
      <defs>
        <linearGradient :id="`${id}-ink`" gradientUnits="userSpaceOnUse" x1="0" :y1="plot.top" x2="0" :y2="plot.bottom">
          <stop offset="0" stop-color="var(--orm-accent)" stop-opacity=".95" />
          <stop offset="1" stop-color="var(--orm-accent)" stop-opacity=".18" />
        </linearGradient>
        <clipPath :id="`${id}-area`">
          <path v-if="chart" :d="chart.area" />
        </clipPath>
        <clipPath :id="`${id}-reveal`">
          <rect :x="plot.left" y="0" :width="plot.right - plot.left" :height="plot.bottom + 8" class="reveal-mask" :style="{ transform: `scaleX(${chart ? chart.revealWidth / (plot.right - plot.left) : 0})` }" />
        </clipPath>
      </defs>

      <g class="graph-guides">
        <path :d="`M${plot.left} ${plot.bottom}H${plot.right}`" />
        <path v-if="!chart" :d="`M${plot.left} ${plot.bottom + 6}V${plot.bottom} M${(plot.left + plot.right) / 2} ${plot.bottom + 6}V${plot.bottom} M${plot.right} ${plot.bottom + 6}V${plot.bottom}`" />
      </g>

      <template v-if="chart">
        <g class="unlit">
          <path class="known-area" :d="chart.area" />
          <g class="ribs" :clip-path="`url(#${id}-area)`">
            <path v-for="n in 72" :key="n" :d="`M${plot.left + (n - 0.5) / 72 * (plot.right - plot.left)} ${plot.top}V${plot.bottom}`" />
          </g>
          <path class="silhouette" :d="chart.silhouette" />
        </g>

        <g class="lit" :clip-path="`url(#${id}-reveal)`">
          <path class="known-area" :d="chart.area" :fill="`url(#${id}-ink)`" />
          <g class="ribs" :clip-path="`url(#${id}-area)`" :stroke="`url(#${id}-ink)`">
            <path v-for="n in 72" :key="n" :d="`M${plot.left + (n - 0.5) / 72 * (plot.right - plot.left)} ${plot.top}V${plot.bottom}`" />
          </g>
          <path class="silhouette" :d="chart.silhouette" />
          <path :d="`M${plot.left} ${plot.bottom}H${plot.right}`" class="highlight-baseline" />
        </g>

        <g v-if="comparison" class="position" :style="{ transform: `translate(${chart.markerX}px, ${chart.markerY}px)` }">
          <path :d="`M0 8V${plot.bottom - chart.markerY}`" class="position-line" />
          <circle r="12" class="position-halo" />
          <circle r="4.5" class="position-dot" />
          <text :x="chart.markerOffset" y="-22" :text-anchor="chart.markerAnchor" class="position-label">{{ chart.markerLabel }}</text>
        </g>

        <g class="axis-labels">
          <g v-for="anchor in chart.anchors" :key="anchor.label">
            <path :d="`M${anchor.x} ${plot.bottom}V${plot.bottom + 6}`" />
            <text :x="anchor.x" y="228" :text-anchor="anchor.start ? 'start' : anchor.end ? 'end' : 'middle'">{{ anchor.value }}</text>
            <text :x="anchor.x" y="246" :text-anchor="anchor.start ? 'start' : anchor.end ? 'end' : 'middle'" class="anchor-name" :class="{ secondary: !anchor.named }">{{ anchor.label }}</text>
          </g>
        </g>
      </template>
    </svg>
    <div class="graph-direction" aria-hidden="true">
      <span>Weaker</span>
      <svg viewBox="0 0 40 12"><path d="M1 6H38M33 1l5 5-5 5" /></svg>
      <span class="axis-legend">{{ axisLegend }}</span>
      <svg class="axis-legend" viewBox="0 0 40 12"><path d="M1 6H38M33 1l5 5-5 5" /></svg>
      <span>Stronger</span>
    </div>
    <figcaption class="graph-key">
      <span class="highlight-key"><i />{{ comparison ? 'Lifters you’re ahead of' : 'Your result lights up here' }}</span>
      <span>{{ density ? 'Height = more lifters at that strength' : 'Pick a group to see the distribution' }}</span>
    </figcaption>
    <p v-if="comparison?.boundary" class="boundary-note">Marker shown at the {{ comparison.boundary === 'below' ? '5% boundary' : 'edge of the modeled tail' }}. Your position lies {{ comparison.boundary === 'below' ? 'below' : 'above' }} it.</p>
  </figure>
</template>

<style scoped>
.strength-graph { margin: 8px 0 0; min-width: 0; }
.density-svg { display: block; width: 100%; overflow: visible; }
.graph-guides { fill: none; stroke: var(--orm-line); stroke-width: 1; }
.unlit .known-area { fill: oklch(58% .02 115 / .20); }
.unlit .silhouette { fill: none; stroke: oklch(62% .02 115 / .55); stroke-width: 1.6; stroke-linejoin: round; stroke-linecap: round; }
.unlit .ribs { fill: none; stroke: oklch(49% .018 115 / .42); stroke-width: 1.6; stroke-linecap: round; }
.strength-graph:not(.has-result) .unlit .ribs { opacity: .7; }
.lit .silhouette { fill: none; stroke: var(--orm-accent); stroke-width: 1.8; stroke-linejoin: round; stroke-linecap: round; }
.lit .ribs { fill: none; stroke-width: 1.8; stroke-linecap: round; }
.highlight-baseline { fill: none; stroke: var(--orm-accent); stroke-width: 1.5; }
.reveal-mask { transform-origin: 18px 0; transition: transform .65s cubic-bezier(.22, 1, .36, 1); }
.position { transition: transform .65s cubic-bezier(.22, 1, .36, 1); }
.position-line { fill: none; stroke: var(--orm-accent); stroke-width: 1; stroke-dasharray: 2 4; opacity: .65; }
.position-halo { fill: var(--orm-accent); opacity: .10; }
.position-dot { fill: var(--orm-accent); stroke: oklch(18% .02 115); stroke-width: 2; }
.position-label { fill: var(--orm-ink); font-family: var(--liftag-font-body); font-size: 14px; font-weight: 550; filter: drop-shadow(0 0 2px var(--orm-result)) drop-shadow(0 0 4px var(--orm-result)); }
.axis-labels { fill: var(--orm-muted); font-size: 11px; font-family: var(--liftag-font-mono); font-variant-numeric: tabular-nums; }
.axis-labels path { fill: none; stroke: var(--orm-line); stroke-width: 1; }
.anchor-name { font-family: var(--liftag-font-body); font-size: 9px; }
.anchor-name.secondary { display: none; }
.graph-direction { display: flex; align-items: center; justify-content: center; gap: 10px; margin: 6px 0 22px; color: var(--orm-muted); font-size: 10px; }
.graph-direction svg { width: 28px; height: 10px; fill: none; stroke: currentColor; stroke-width: 1; }
.graph-key { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px 16px; padding-top: 14px; border-top: 1px solid var(--orm-line); color: var(--orm-muted); font-size: 10px; line-height: 1.5; }
.highlight-key { display: flex; align-items: center; gap: 7px; }
.highlight-key i { width: 3px; height: 12px; border-radius: 2px; background: var(--orm-muted); }
.has-result .highlight-key i { background: var(--orm-accent); }
.boundary-note { margin: 12px 0 0; color: var(--orm-muted); font-size: 10px; line-height: 1.6; }
@media (max-width: 700px) {
  .strength-graph { margin-top: 16px; }
  .position-label { font-size: 18px; }
  .axis-labels { font-size: 13px; }
  .anchor-name { font-size: 11px; }
  .graph-direction { margin-bottom: 18px; }
  .axis-legend { display: none; }
}
@media (prefers-reduced-motion: reduce) { .reveal-mask, .position { transition: none; } }
</style>
