<script setup lang="ts">
import { formatLoad, type LiftId, type WeightUnit } from '~/utils/oneRepMax'
import { standardsFor, STRENGTH_LEVELS, type ComparisonSex, type StrengthComparison } from '~/utils/strengthStandards'
import { worldRecordRatio } from '~/utils/worldRecords'

const props = defineProps<{
  lift: LiftId
  sex: ComparisonSex | ''
  unit: WeightUnit
  bodyweightKg: number | null
  comparison: StrengthComparison | null
  qualifier: string
  supported: boolean
}>()
const selectedBenchmark = shallowRef<string | null>(null)
const benchmarks = computed(() => {
  const standard = standardsFor(props.lift)
  const levels = STRENGTH_LEVELS.map((level, index) => {
    const ratio = standard && props.sex ? standard[props.sex][index]! : null
    return { ...level, ratio, kg: ratio != null && props.bodyweightKg != null ? ratio * props.bodyweightKg : null,
      reached: ratio != null && props.comparison != null && props.comparison.ratio >= ratio }
  })
  const record = worldRecordRatio(props.lift, props.sex)
  if (record == null) return levels
  return [...levels, {
    label: 'World record',
    percentile: 100,
    ratio: record,
    kg: props.bodyweightKg != null ? record * props.bodyweightKg : null,
    reached: props.comparison != null && props.comparison.ratio >= record,
  }]
})
const focusedBenchmark = computed(() => benchmarks.value.find(item => item.label === selectedBenchmark.value)
  ?? benchmarks.value.find(item => item.label === props.comparison?.next?.label)
  ?? (props.comparison?.level === 'World record' ? benchmarks.value[benchmarks.value.length - 1]! : benchmarks.value[4]!))
const gapKg = computed(() => {
  if (!props.comparison || props.bodyweightKg == null || focusedBenchmark.value.kg == null) return null
  return Math.max(0, focusedBenchmark.value.kg - props.comparison.ratio * props.bodyweightKg)
})
const pastEliteKg = computed(() => {
  if (!props.comparison || props.bodyweightKg == null || focusedBenchmark.value.kg == null) return null
  if (focusedBenchmark.value.percentile !== 95) return null
  const delta = props.comparison.ratio * props.bodyweightKg - focusedBenchmark.value.kg
  return delta > 1e-9 ? delta : null
})
const progress = computed(() => {
  if (!props.comparison || focusedBenchmark.value.ratio == null) return 0
  return Math.min(1, props.comparison.ratio / focusedBenchmark.value.ratio)
})
watch(() => [props.lift, props.sex], () => { selectedBenchmark.value = null })
</script>

<template>
    <div class="strength-progression">
      <div class="progression-heading"><h3>Your next chapter.</h3><span>{{ comparison ? 'Explore a benchmark' : 'Benchmarks. Your own pace.' }}</span></div>
      <div class="benchmark-ladder" :class="{ 'has-record': benchmarks.length > 5 }" aria-label="Strength benchmarks">
        <button v-for="(benchmark, index) in benchmarks" :key="benchmark.label" type="button" class="benchmark" :class="{ reached: benchmark.reached, selected: comparison && focusedBenchmark.label === benchmark.label, current: comparison?.level === benchmark.label }" :disabled="!comparison" :aria-pressed="Boolean(comparison && focusedBenchmark.label === benchmark.label)" @click="selectedBenchmark = benchmark.label">
          <span class="benchmark-track" aria-hidden="true"><i>{{ benchmark.reached ? '✓' : String(index + 1).padStart(2, '0') }}</i></span>
          <span class="benchmark-name">{{ benchmark.label }}</span>
          <span class="benchmark-load">{{ benchmark.kg != null ? formatLoad(benchmark.kg, unit) : '· · ·' }} <small v-if="benchmark.kg != null">{{ unit }}</small></span>
          <span class="benchmark-percentile">Stronger than {{ benchmark.percentile }}%</span>
          <span class="benchmark-state">{{ comparison?.level === benchmark.label ? 'Your level' : comparison?.next?.label === benchmark.label ? 'Next benchmark' : benchmark.reached ? 'Reached' : ' ' }}</span>
        </button>
      </div>
      <div v-if="comparison && focusedBenchmark.kg != null" class="benchmark-detail">
        <div class="target-copy">
          <span class="target-icon" aria-hidden="true">{{ focusedBenchmark.reached ? '✓' : '↗' }}</span>
          <div><p><strong>{{ focusedBenchmark.label }}</strong> at <strong>{{ formatLoad(focusedBenchmark.kg, unit) }} {{ unit }}</strong><span v-if="qualifier">, {{ qualifier }}</span></p>
            <span v-if="gapKg != null && gapKg > 0">{{ formatLoad(gapKg, unit) === '0' ? `Less than 0.1 ${unit}` : `${formatLoad(gapKg, unit)} ${unit}` }} from your estimated max to this benchmark.</span>
            <span v-else-if="focusedBenchmark.label === 'World record' && comparison.boundary === 'above'">Past the all-time raw world-record ratio.</span>
            <span v-else-if="focusedBenchmark.label === 'World record'">This is the all-time raw world-record ratio.</span>
            <span v-else-if="pastEliteKg != null">{{ formatLoad(pastEliteKg, unit) === '0' ? `Less than 0.1 ${unit}` : `${formatLoad(pastEliteKg, unit)} ${unit}` }} past the published elite standard.</span>
            <span v-else>You’ve reached this benchmark. Keep building on it.</span>
          </div>
        </div>
        <div class="target-progress" aria-hidden="true"><span>{{ focusedBenchmark.reached ? (pastEliteKg != null ? 'Past elite' : 'Reached') : `${Math.floor(progress * 100)}% of target load` }}</span><div><i :style="{ transform: `scaleX(${progress})` }" /></div></div>
      </div>
      <p v-else class="progression-note">{{ supported ? 'Your benchmark weights appear once you add your bodyweight and comparison group.' : 'Select a supported exercise to see its strength benchmarks.' }}</p>
    </div>
</template>

<style scoped>
.strength-progression { margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--orm-line); }
.progression-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
.progression-heading h3 { margin: 0; font-size: 18px; font-weight: 450; letter-spacing: -.025em; }
.progression-heading > span { color: var(--orm-muted); font-size: 10px; }
.benchmark-ladder { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); margin-top: 22px; }
.benchmark-ladder.has-record { grid-template-columns: repeat(6, minmax(0, 1fr)); }
.benchmark { padding: 0 10px 8px; border: 0; background: transparent; text-align: left; color: var(--orm-muted); font: inherit; cursor: pointer; border-radius: 4px; transition: color .2s, background .2s; }
.benchmark:first-child { padding-left: 0; }
.benchmark:last-child { padding-right: 0; }
.benchmark:disabled { cursor: default; }
.benchmark:not(:disabled):hover { background: oklch(80% .05 120 / .035); color: var(--orm-ink); }
.benchmark-track { display: flex; align-items: center; height: 28px; position: relative; margin: 0 -10px 12px; }
.benchmark:first-child .benchmark-track { margin-left: 0; }
.benchmark:last-child .benchmark-track { margin-right: 0; }
.benchmark-track::after { content: ''; position: absolute; height: 1px; left: 0; right: 0; background: var(--orm-line); }
.benchmark-track i { position: relative; z-index: 1; margin-left: 10px; width: 26px; height: 26px; border: 1px solid var(--orm-line); border-radius: 50%; display: grid; place-items: center; background: oklch(16% .009 115); font-size: 9px; font-style: normal; }
.benchmark:first-child .benchmark-track i { margin-left: 0; }
.reached .benchmark-track::after { background: oklch(55% .09 120); }
.reached .benchmark-track i { color: var(--orm-accent); border-color: oklch(55% .09 120); }
.selected .benchmark-track i { border-color: var(--orm-accent); color: var(--orm-accent); box-shadow: 0 0 18px oklch(85% .18 120 / .14); }
.benchmark-name, .benchmark-load, .benchmark-percentile, .benchmark-state { display: block; }
.benchmark-name { font-size: 12px; font-weight: 500; }
.benchmark-load { margin-top: 7px; font-size: 23px; font-weight: 450; letter-spacing: -.04em; font-variant-numeric: tabular-nums; color: var(--orm-ink); }
.benchmark-load small { font-size: 11px; color: var(--orm-muted); letter-spacing: 0; }
.benchmark-percentile { margin-top: 5px; font-size: 9px; }
.benchmark-state { margin-top: 9px; min-height: 12px; font-size: 9px; color: var(--orm-muted); }
.current .benchmark-name, .current .benchmark-state, .selected .benchmark-name { color: var(--orm-accent); }
.benchmark-detail { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 20px 0 0; margin-top: 12px; border-top: 1px solid var(--orm-line); }
.target-copy { display: flex; align-items: center; gap: 12px; }
.target-icon { font-size: 28px; color: var(--orm-accent); font-weight: 300; }
.target-copy p { margin: 0; font-size: 12px; line-height: 1.6; }
.target-copy strong { font-weight: 550; }
.target-copy div > span { display: block; margin-top: 4px; font-size: 11px; line-height: 1.5; color: var(--orm-muted); }
.target-progress { width: 160px; flex-shrink: 0; }
.target-progress > span { display: block; margin-bottom: 9px; font-size: 10px; color: var(--orm-muted); text-align: right; }
.target-progress > div { height: 3px; background: var(--orm-line); border-radius: 3px; overflow: hidden; }
.target-progress i { display: block; height: 100%; width: 100%; background: var(--orm-accent); transform-origin: left; transition: transform .3s cubic-bezier(.22, 1, .36, 1); }
.progression-note { margin: 16px 0 0; font-size: 11px; color: var(--orm-muted); line-height: 1.6; }

.benchmark:focus-visible { outline: 2px solid var(--orm-accent); outline-offset: 4px; }
@media (max-width: 900px) { .benchmark-percentile { font-size: 8px; } }
@media (max-width: 700px) {
  .strength-progression { margin-top: 26px; }
  .progression-heading { align-items: start; }
  .progression-heading > span { max-width: 110px; text-align: right; line-height: 1.5; }
  .benchmark-ladder { grid-template-columns: 1fr; margin-top: 20px; }
  .benchmark, .benchmark:first-child, .benchmark:last-child { display: grid; grid-template-columns: 32px minmax(0, 1fr) auto; gap: 0 10px; align-items: center; padding: 11px 0; border-radius: 0; border-bottom: 1px solid var(--orm-line); }
  .benchmark-track, .benchmark:first-child .benchmark-track, .benchmark:last-child .benchmark-track { grid-row: 1 / 3; margin: 0; }
  .benchmark-track::after { display: none; }
  .benchmark-track i { margin: 0; }
  .benchmark-name { font-size: 13px; }
  .benchmark-load { grid-column: 3; grid-row: 1 / 3; margin: 0; font-size: 24px; }
  .benchmark-percentile { grid-column: 2; margin-top: 4px; font-size: 10px; }
  .benchmark-state { display: none; }
  .current .benchmark-name::after { content: ' · You'; font-size: 10px; font-weight: 400; }
  .benchmark-detail { align-items: stretch; flex-direction: column; gap: 16px; padding-top: 16px; }
  .target-progress { width: auto; margin-left: 36px; }
  .target-progress > span { text-align: left; }
}
@media (prefers-reduced-motion: reduce) { .benchmark, .target-progress i { transition: none; } }
</style>
