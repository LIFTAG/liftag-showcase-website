<script setup lang="ts">
import OneRmCurve from './OneRmCurve.vue'
import OneRmDial from './OneRmDial.vue'
import OneRmAura from './OneRmAura.vue'
import OneRmIcon from './OneRmIcon.vue'
import {
  CONFIDENCE_LABEL,
  DEFAULT_FORMULA_ID,
  FORMULAS,
  formatLoad,
  type Confidence,
  type FormulaEstimate,
  type FormulaId,
  type WeightUnit,
} from '~/utils/oneRepMax'

const props = defineProps<{
  kg: number | null
  unit: WeightUnit
  reps: number | null
  weightKg: number | null
  formula: string
  formulaId: FormulaId
  estimates: FormulaEstimate[]
  confidence: Confidence | null
  trainingMax: number | null
  qualifier: string
  summary: string
}>()
const emit = defineEmits<{
  select: [id: FormulaId]
}>()
const formattedMax = computed(() => props.kg == null ? '' : formatLoad(props.kg, props.unit))
const alternate = computed(() => props.kg == null ? '' : `${formatLoad(props.kg, props.unit === 'kg' ? 'lb' : 'kg')} ${props.unit === 'kg' ? 'lb' : 'kg'}`)
const pickerOpen = shallowRef(false)
const picker = useTemplateRef<HTMLElement>('formula-picker')
const formulaChoices = computed(() => {
  if (props.estimates.length) return props.estimates
  return FORMULAS.map(item => ({ id: item.id, name: item.name, year: item.year, equation: item.equation, kg: null }))
})

function togglePicker() {
  pickerOpen.value = !pickerOpen.value
}

function chooseFormula(id: FormulaId) {
  emit('select', id)
  pickerOpen.value = false
}

function onPickerKey(event: KeyboardEvent) {
  if (event.key === 'Escape') pickerOpen.value = false
}

function onDocPointer(event: PointerEvent) {
  const target = event.target as Node | null
  if (target && picker.value?.contains(target)) return
  pickerOpen.value = false
}

watch(pickerOpen, (open) => {
  if (!import.meta.client) return
  if (open) document.addEventListener('pointerdown', onDocPointer)
  else document.removeEventListener('pointerdown', onDocPointer)
})
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocPointer))
</script>

<template>
  <section class="max-result" aria-labelledby="orm-result-title">
    <OneRmAura :kg="kg" />
    <div class="result-heading">
      <h2 id="orm-result-title"><OneRmIcon kind="trophy" :value="kg" />{{ reps === 1 ? 'Your one-rep max' : 'Your estimated 1RM' }}</h2>
      <span class="live-indicator"><i aria-hidden="true" /> Updates live</span>
    </div>
    <p class="sr-only" role="status" aria-atomic="true">{{ summary }}</p>
    <template v-if="kg != null">
      <div class="max-readout" aria-hidden="true">
        <OneRmDial class="max-number" :class="{ compact: formattedMax.length > 5 }" :value="formattedMax" /><span class="max-unit">{{ unit }}</span>
      </div>
      <div class="result-context">
        <p class="max-equivalent">{{ alternate }}<template v-if="qualifier"> · {{ qualifier }}</template></p>
        <span v-if="reps === 1" class="formula-label">Completed single</span>
        <div v-else ref="formula-picker" class="formula-picker" @keydown="onPickerKey">
          <button
            type="button"
            class="formula-label is-action"
            aria-haspopup="true"
            :aria-expanded="pickerOpen"
            aria-controls="orm-formula-menu"
            :aria-label="`Formula ${formula}. Change formula`"
            @click="togglePicker"
          >{{ formula }}</button>
          <div
            v-if="pickerOpen"
            id="orm-formula-menu"
            class="formula-menu"
            role="group"
            aria-label="1RM formulas"
          >
            <button
              v-for="item in formulaChoices"
              :key="item.id"
              type="button"
              class="formula-option"
              :aria-pressed="item.id === formulaId"
              :disabled="item.kg == null && estimates.length > 0"
              @click="chooseFormula(item.id)"
            >
              <span>{{ item.name }} <small v-if="item.id === DEFAULT_FORMULA_ID">default</small></span>
              <span v-if="item.kg != null" class="formula-option-load">{{ formatLoad(item.kg, unit) }} {{ unit }}</span>
            </button>
          </div>
        </div>
      </div>
      <OneRmCurve v-if="weightKg != null && reps != null" :weight-kg="weightKg" :reps="reps" :formula-id="formulaId" :unit="unit" :qualifier="qualifier" />
    </template>
    <div v-else class="empty-result">
      <svg viewBox="0 0 300 100" aria-hidden="true"><path d="M10 15C80 28 110 67 290 86" /><circle cx="10" cy="15" r="4" /><circle cx="158" cy="65" r="4" /></svg>
      <span aria-hidden="true">— <small>{{ unit }}</small></span>
      <p>It starts with one set.</p><small>Enter a weight and 1–30 reps to reveal your strength curve.</small>
    </div>
    <div v-if="kg != null" class="result-footnote">
      <p class="result-note" :class="{ 'is-warning': reps != null && reps > 10 }">
        <span class="confidence-dot" aria-hidden="true" />
        <template v-if="reps === 1">Completed single. No prediction needed.</template>
        <template v-else-if="reps != null && reps > 10">High-rep estimate. A shorter set gives a more useful max.</template>
        <template v-else>{{ confidence ? CONFIDENCE_LABEL[confidence] : '' }} · Estimated, not tested.</template>
      </p>
      <p class="training-max">90% training max <strong>{{ trainingMax == null ? '—' : formatLoad(trainingMax, unit) }} {{ unit }}</strong><span>rounded</span></p>
    </div>
  </section>
</template>

<style scoped>
.max-result { position: relative; isolation: isolate; }
.max-result { min-width: 0; padding: 30px 36px 22px !important; background: linear-gradient(145deg, oklch(96% .007 115 / .025), oklch(18% .007 115 / .12) 60%); border-left: 1px solid var(--orm-line); box-shadow: inset 1px 0 0 oklch(96% .007 115 / .025); }
.result-heading { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.result-heading h2 { margin: 0; font-size: 13px; font-weight: 500; color: var(--orm-muted); }
.result-heading h2 { display: flex; align-items: center; gap: 8px; }
.result-heading .orm-icon { width: 28px; height: 28px; }
.live-indicator { display: inline-flex; align-items: center; gap: 6px; color: var(--orm-muted); font-size: 10px; white-space: nowrap; }
.live-indicator i { width: 5px; height: 5px; border-radius: 50%; background: var(--orm-accent); box-shadow: 0 0 9px oklch(92% .23 120 / .4); }
.max-readout { display: flex; align-items: baseline; gap: 12px; margin: 18px 0 8px; line-height: 1; }
.max-number { min-width: 0; margin-block: -.12em; color: var(--orm-ink); font-size: 94px; font-weight: 450; letter-spacing: -.075em; font-variant-numeric: tabular-nums; }
.max-number.compact { font-size: 60px; }
.max-unit { font-size: 23px; color: var(--orm-muted); font-weight: 400; }
.result-context { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.max-equivalent { margin: 0; font-size: 12px; color: var(--orm-muted); font-variant-numeric: tabular-nums; }
.formula-picker { position: relative; z-index: 5; }
.formula-label { color: var(--orm-muted); font-size: 10px; }
.formula-label.is-action {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--orm-muted);
  font: inherit;
  font-size: 10px;
  letter-spacing: .02em;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-style: dotted;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  text-decoration-color: oklch(73% .009 115 / .55);
}
.formula-label.is-action::after {
  content: '';
  width: 5px;
  height: 5px;
  margin: 0 0 2px 6px;
  border-right: 1px solid currentColor;
  border-bottom: 1px solid currentColor;
  transform: rotate(45deg);
  opacity: .7;
}
.formula-label.is-action[aria-expanded="true"] {
  color: var(--orm-ink);
  text-decoration-style: solid;
  text-decoration-color: currentColor;
}
.formula-label.is-action[aria-expanded="true"]::after { margin-bottom: -1px; transform: rotate(225deg); }
.formula-label.is-action:focus-visible { outline: 2px solid var(--orm-accent); outline-offset: 3px; }
.formula-menu {
  position: absolute;
  right: 0;
  top: calc(100% - 2px);
  z-index: 5;
  display: grid;
  min-width: 196px;
  padding: 6px;
  border: 1px solid oklch(40% .012 115);
  border-radius: 10px;
  background: oklch(20% .008 115);
  box-shadow: 0 18px 44px oklch(8% .005 115 / .55);
}
.formula-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  min-height: 40px;
  padding: 0 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--orm-ink);
  font: inherit;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  touch-action: manipulation;
}
.formula-option small { margin-left: 7px; color: var(--orm-accent); font-size: 10px; font-weight: 400; }
.formula-option-load { color: var(--orm-muted); font-size: 11px; font-variant-numeric: tabular-nums; }
.formula-option[aria-pressed="true"] { background: var(--orm-accent-soft); }
@media (hover: hover) {
  .formula-label.is-action:hover {
    color: var(--orm-ink);
    text-decoration-style: solid;
    text-decoration-color: currentColor;
  }
  .formula-option:hover:not(:disabled) { background: oklch(96% .007 115 / .05); }
}
.formula-option:disabled { color: var(--orm-muted); cursor: default; }
.formula-option:focus-visible { outline: 2px solid var(--orm-accent); outline-offset: 2px; }
.result-footnote { border-top: 1px solid var(--orm-line); margin-top: 15px; padding-top: 14px; }
.result-note { display: flex; align-items: baseline; gap: 6px; margin: 0; font-size: 10px; line-height: 1.6; color: var(--orm-muted); }
.confidence-dot { flex-shrink: 0; width: 4px; height: 4px; border-radius: 50%; background: var(--orm-accent); }
.result-note.is-warning { color: var(--orm-warning); }
.result-note.is-warning .confidence-dot { background: var(--orm-warning); }
.training-max { display: flex; align-items: baseline; flex-wrap: wrap; gap: 6px; margin: 7px 0 0; font-size: 10px; color: var(--orm-muted); }
.training-max strong { color: var(--orm-ink); font-weight: 500; font-variant-numeric: tabular-nums; }
.training-max > span { font-size: 9px; }
.empty-result { display: flex; flex-direction: column; justify-content: center; min-height: 450px; position: relative; }
.empty-result svg { position: absolute; top: 25px; width: 100%; fill: var(--orm-result); stroke: var(--orm-line); stroke-width: 1.5; }
.empty-result > span { font-size: 72px; letter-spacing: -.06em; }
.empty-result > span small { font-size: 24px; color: var(--orm-muted); }
.empty-result p { margin: 14px 0 5px; font-size: 20px; }
.empty-result > small { max-width: 28ch; color: var(--orm-muted); font-size: 13px; line-height: 1.7; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
@media (max-width: 1000px) and (min-width: 701px) { .max-result { padding: 28px 25px 22px !important; } .max-number { font-size: 78px; } }
@media (max-width: 700px) {
  .max-result { padding: 24px 22px 20px !important; border-left: 0; border-top: 1px solid var(--orm-line); }
  .max-readout { margin: 17px 0 8px; }
  .max-number { font-size: 76px; }
  .max-number.compact { font-size: 46px; }
  .max-unit { font-size: 21px; }
  .formula-label.is-action { min-height: 40px; font-size: 11px; }
  .result-note, .training-max { font-size: 11px; }
  .empty-result { min-height: 350px; }
}
@media (max-width: 360px) { .max-number { font-size: 66px; } .live-indicator { font-size: 9px; } }
</style>
