<script setup lang="ts">
import { exerciseFor, loadQualifier } from '~/utils/oneRepMaxExercises'
import type { LiftId, WeightUnit } from '~/utils/oneRepMax'
import { strengthSource, strongerThanShare, type ComparisonSex, type StrengthComparison } from '~/utils/strengthStandards'
import OneRmExercisePicker from './OneRmExercisePicker.vue'
import OneRmMorphSwitch from './OneRmMorphSwitch.vue'
import OneRmStrengthGraph from './OneRmStrengthGraph.vue'
import OneRmStrengthProgression from './OneRmStrengthProgression.vue'

const sexOptions = [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }] as const
const bodyweight = defineModel<string>('bodyweight', { required: true })
const sex = defineModel<ComparisonSex | ''>('sex', { required: true })
const lift = defineModel<LiftId>('lift', { required: true })
const props = defineProps<{
  unit: WeightUnit
  bodyweightKg: number | null
  comparison: StrengthComparison | null
  bodyweightError: string | null
  validSet: boolean
}>()
const source = computed(() => strengthSource(lift.value))
const exercise = computed(() => exerciseFor(lift.value))
const qualifier = computed(() => loadQualifier(lift.value))
const share = computed(() => props.comparison ? strongerThanShare(props.comparison) : '')
const noteOpen = shallowRef(false)
const note = useTemplateRef<HTMLElement>('chart-note')
const emptyMessage = computed(() => {
  if (!source.value) return exercise.value.basis === 'bodyweight'
    ? 'This lift has a total-load estimate, but no compatible bodyweight-ratio ranking.'
    : 'Choose your exercise, then add your bodyweight and comparison group.'
  if (!props.validSet) return 'Enter a valid set above, then add your bodyweight and comparison group.'
  if (props.bodyweightError) return 'Check your bodyweight to reveal your comparison.'
  if (props.bodyweightKg == null && !sex.value) return 'Add your bodyweight and comparison group to find your place.'
  if (!sex.value) return 'Choose Male or Female to use the matching strength standards.'
  return 'Add your bodyweight to find your place.'
})

function toggleNote() {
  noteOpen.value = !noteOpen.value
}

function closeNote() {
  noteOpen.value = false
}

function onNoteKey(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !noteOpen.value) return
  event.preventDefault()
  closeNote()
  note.value?.querySelector('button')?.focus()
}

function onDocPointer(event: PointerEvent) {
  const target = event.target as Node | null
  if (target && note.value?.contains(target)) return
  closeNote()
}

watch(noteOpen, (open) => {
  if (!import.meta.client) return
  if (open) document.addEventListener('pointerdown', onDocPointer)
  else document.removeEventListener('pointerdown', onDocPointer)
})
watch(() => props.comparison, closeNote)
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocPointer))
</script>

<template>
  <section id="strength-comparison" class="strength" aria-labelledby="strength-title">
    <header class="strength-heading">
      <div><p class="eyebrow">PUT YOUR STRENGTH IN PERSPECTIVE</p><h2 id="strength-title">See where you stand.</h2></div>
      <p class="section-intro">One lift. A bigger picture.<br>Find your level and what comes next.</p>
    </header>

    <div class="comparison-stage">
      <div class="comparison-setup">
        <OneRmExercisePicker v-model="lift" />
        <div class="comparison-fields">
          <div>
            <label for="orm-bodyweight">Your bodyweight <span>{{ unit }}</span></label>
            <input id="orm-bodyweight" v-model="bodyweight" type="text" inputmode="decimal" autocomplete="off" :placeholder="unit === 'kg' ? 'e.g. 80' : 'e.g. 175'" :aria-invalid="Boolean(bodyweightError)" :aria-describedby="bodyweightError ? 'orm-bodyweight-error' : 'strength-method-note'">
          </div>
          <div>
            <span id="orm-sex-label">Compare with</span>
            <OneRmMorphSwitch v-model="sex" class="sex-switch" :options="sexOptions" aria-labelledby="orm-sex-label" />
          </div>
        </div>
        <p v-if="bodyweightError" id="orm-bodyweight-error" class="strength-error">{{ bodyweightError }}</p>
        <p class="setup-note">Strength relative to bodyweight.<br> For this exercise, in your selected group.</p>
        <p v-if="comparison" class="relative-strength"><strong>{{ comparison.ratio.toFixed(2) }}<span>×</span></strong><span>your bodyweight<br><small>estimated 1RM<span v-if="qualifier">, {{ qualifier }}</span></small></span></p>
      </div>

      <div class="comparison-result">
        <div class="rank-heading">
          <template v-if="comparison">
            <div ref="chart-note" class="chart-note-wrap" :class="{ open: noteOpen }" @keydown="onNoteKey">
              <span class="rank-context">
                {{ comparison.level }} <i /> {{ sex === 'male' ? 'Male' : 'Female' }} lifters
                <button
                  type="button"
                  class="chart-info"
                  aria-label="About this comparison"
                  :aria-expanded="noteOpen"
                  aria-controls="orm-chart-note"
                  @click="toggleNote"
                >
                  <span aria-hidden="true">i</span>
                </button>
              </span>
              <div class="chart-note" :aria-hidden="noteOpen ? undefined : 'true'">
                <p id="orm-chart-note">Approximate comparison with lifters who log on <a v-if="source" :href="source" :tabindex="noteOpen ? 0 : -1" rel="noopener">Strength Level</a><span v-else>Strength Level</span>. The chart is the density implied by those published percentiles<span v-if="comparison.level === 'World record' || comparison.next?.label === 'World record'">, stretched to the all-time raw world-record ratio as 100%</span>, not a measured histogram.</p>
              </div>
            </div>
            <p v-if="comparison.level === 'World record' && comparison.boundary === 'above'" class="rank-statement" role="status" aria-atomic="true">You’re past the<br><strong>world record</strong> <span>ratio for {{ sex }} lifters.</span></p>
            <p v-else-if="comparison.level === 'World record'" class="rank-statement" role="status" aria-atomic="true">You’re at the<br><strong>world record</strong> <span>ratio for {{ sex }} lifters.</span></p>
            <p v-else class="rank-statement" role="status" aria-atomic="true">You’re stronger than<br><strong>{{ share }}</strong> <span>of {{ sex }} lifters.</span></p>
          </template>
          <template v-else>
            <span class="rank-context">YOUR STRENGTH, IN CONTEXT</span>
            <p class="rank-statement empty-statement">Every lifter has<br>a place to start.</p>
          </template>
        </div>
        <OneRmStrengthGraph :comparison="comparison" :lift="lift" :sex="sex" :unit="unit" :bodyweight-kg="bodyweightError ? null : bodyweightKg" />
        <p v-if="!comparison" class="empty-instruction" role="status">{{ emptyMessage }}</p>
      </div>
    </div>

    <OneRmStrengthProgression :lift="lift" :sex="sex" :unit="unit" :bodyweight-kg="bodyweightError ? null : bodyweightKg" :comparison="comparison" :qualifier="qualifier" :supported="Boolean(source)" />
  </section>
</template>

<style scoped>
/* Override the marketing site’s global mobile section padding. */
.strength { padding: 36px 32px 26px !important; border-top: 1px solid var(--orm-line); background: radial-gradient(ellipse at 73% 40%, oklch(42% .07 120 / .10), transparent 55%), oklch(12% .007 115 / .70); }
.strength-heading { display: flex; justify-content: space-between; align-items: end; gap: 24px; margin-bottom: 32px; }
.eyebrow { margin: 0 0 10px; color: var(--orm-muted); font-size: 9px; font-weight: 500; letter-spacing: .16em; }
.strength-heading h2 { margin: 0; font-size: 32px; font-weight: 500; letter-spacing: -.05em; line-height: 1.12; }
.section-intro { margin: 0; color: var(--orm-muted); font-size: 12px; line-height: 1.7; }
.comparison-stage { display: grid; grid-template-columns: minmax(210px, .8fr) minmax(0, 1.5fr); gap: 52px; align-items: center; }
.comparison-setup { position: relative; z-index: 2; min-width: 0; }
.comparison-fields { display: grid; grid-template-columns: 1fr; gap: 18px; }
.comparison-fields > div { min-width: 0; }
.comparison-fields label, .comparison-fields > div > span { display: flex; justify-content: space-between; gap: 5px; margin-bottom: 8px; font-size: 12px; color: var(--orm-muted); }
.comparison-fields input { width: 100%; min-width: 0; height: 46px; padding: 0 12px; border: 1px solid var(--orm-glass-line); border-radius: 9px; background: var(--orm-field-glass); color: var(--orm-ink); font: inherit; font-size: 16px; color-scheme: dark; transition: border-color .2s; }
.comparison-fields input::placeholder { color: var(--orm-muted); }
.comparison-fields input:focus { outline: 0; }
.comparison-fields input:focus-visible { border-color: var(--orm-accent); outline: 1px solid var(--orm-accent); outline-offset: 2px; }
.comparison-fields input[aria-invalid="true"] { border-color: var(--orm-error); }
.strength-error { color: var(--orm-error); margin: 8px 0 0; font-size: 12px; }
.setup-note { margin: 16px 0 0; color: var(--orm-muted); font-size: 10px; line-height: 1.7; }
.relative-strength { display: flex; align-items: center; gap: 14px; margin: 22px 0 0; padding-top: 18px; border-top: 1px solid var(--orm-line); }
.relative-strength > strong { font-size: 32px; font-weight: 450; letter-spacing: -.05em; font-variant-numeric: tabular-nums; }
.relative-strength > strong span { font-size: 20px; color: var(--orm-muted); margin-left: 3px; }
.relative-strength > span { font-size: 11px; line-height: 1.65; }
.relative-strength small { color: var(--orm-muted); font-size: 10px; }
.comparison-result { min-width: 0; }
.rank-heading { position: relative; z-index: 3; min-height: 114px; }
.rank-context { display: flex; align-items: center; gap: 8px; color: var(--orm-muted); font-size: 10px; }
.rank-context i { width: 3px; height: 3px; border-radius: 50%; background: var(--orm-muted); }
.chart-note-wrap { position: relative; }
.chart-info {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin: -6px -4px -6px auto;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--orm-muted);
  font: inherit;
  cursor: pointer;
  touch-action: manipulation;
}
.chart-info span {
  display: grid;
  place-items: center;
  width: 16px;
  height: 16px;
  border: 1px solid currentColor;
  border-radius: 50%;
  font-family: var(--liftag-font-headline);
  font-size: 11px;
  font-style: italic;
  font-weight: 500;
  line-height: 1;
}
.chart-info:hover, .chart-note-wrap.open .chart-info { color: var(--orm-ink); }
.chart-info:focus-visible { outline: 2px solid var(--orm-accent); outline-offset: 2px; color: var(--orm-ink); }
.chart-note {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 4;
  width: min(280px, calc(100vw - 40px));
  padding-top: 8px;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translateY(-4px);
  transition: opacity .18s cubic-bezier(.22, 1, .36, 1), transform .18s cubic-bezier(.22, 1, .36, 1);
}
.chart-note p {
  margin: 0;
  padding: 12px 14px;
  border: 1px solid oklch(40% .012 115);
  border-radius: 10px;
  background: oklch(20% .008 115);
  box-shadow: 0 18px 44px oklch(8% .005 115 / .55);
  color: var(--orm-muted);
  font-size: 11px;
  line-height: 1.6;
  text-align: left;
}
.chart-note a { color: var(--orm-ink); text-underline-offset: 3px; }
.chart-note-wrap.open .chart-note {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: none;
}
.rank-statement { margin: 12px 0 0; font-size: 29px; font-weight: 450; letter-spacing: -.045em; line-height: 1.25; }
.rank-statement strong { color: var(--orm-accent); font-size: 1.45em; font-weight: 500; letter-spacing: -.055em; font-variant-numeric: tabular-nums; }
.rank-statement > span { font-size: .7em; letter-spacing: -.025em; white-space: nowrap; }
.empty-statement { color: oklch(83% .009 115); }
.empty-instruction { margin: 14px auto 0; color: var(--orm-muted); font-size: 11px; line-height: 1.65; text-align: center; max-width: 54ch; }
a:focus-visible { outline: 2px solid var(--orm-accent); outline-offset: 4px; }
@media (hover: hover) and (pointer: fine) {
  .chart-note-wrap:has(.chart-info:hover) .chart-note,
  .chart-note-wrap:has(.chart-note:hover) .chart-note {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transform: none;
  }
}
@media (max-width: 900px) { .comparison-stage { gap: 28px; grid-template-columns: minmax(190px, .85fr) minmax(0, 1.35fr); } .rank-statement { font-size: 26px; } }
@media (max-width: 700px) {
  .strength { padding: 28px 20px 24px !important; }
  .strength-heading { align-items: start; margin-bottom: 26px; }
  .strength-heading h2 { font-size: 29px; }
  .section-intro { display: none; }
  .eyebrow { font-size: 8px; }
  .comparison-stage { grid-template-columns: 1fr; gap: 30px; }
  .comparison-fields { grid-template-columns: 1fr 1fr; gap: 14px; }
  .comparison-fields input, .sex-switch { height: 48px; }
  .sex-switch { --switch-font-size: 13px; }
  .setup-note { margin-top: 12px; }
  .setup-note br { display: none; }
  .relative-strength { margin-top: 16px; padding-top: 14px; }
  .relative-strength > strong { font-size: 28px; }
  .rank-heading { min-height: 0; }
  .chart-note {
    position: static;
    display: none;
    width: auto;
    padding-top: 8px;
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transform: none;
  }
  .chart-note-wrap.open .chart-note { display: block; }
  .rank-statement { font-size: 28px; }

}
@media (prefers-reduced-motion: reduce) { .comparison-fields input, .chart-note { transition: none; } }
</style>
