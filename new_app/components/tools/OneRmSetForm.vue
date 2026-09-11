<script setup lang="ts">
import { exerciseHint, exerciseFor } from '~/utils/oneRepMaxExercises'
import { MIN_REPS, MAX_REPS, formatInputWeight, parseRepsInput, parseWeightInput, type LiftId, type WeightUnit } from '~/utils/oneRepMax'
import OneRmDial from './OneRmDial.vue'
import OneRmMorphSwitch from './OneRmMorphSwitch.vue'
import OneRmIcon from './OneRmIcon.vue'

const unitOptions = [{ value: 'kg', label: 'kg' }, { value: 'lb', label: 'lb' }] as const

const weight = defineModel<string>('weight', { required: true })
const reps = defineModel<string>('reps', { required: true })
const props = defineProps<{ unit: WeightUnit, lift: LiftId, weightKg: number | null, weightError: string | null, repsError: string | null }>()
const emit = defineEmits<{ unit: [value: WeightUnit], step: [direction: number] }>()
const selectedReps = computed(() => parseRepsInput(reps.value).value)
const quickReps = Array.from({ length: 12 }, (_, index) => index + 1)
const weightFocused = shallowRef(false)
const repsFocused = shallowRef(false)
const weightControl = useTemplateRef<HTMLElement>('weight-control')
const repsControl = useTemplateRef<HTMLElement>('reps-control')
const weightInput = useTemplateRef<HTMLInputElement>('weight-input')
const repsInput = useTemplateRef<HTMLInputElement>('reps-input')
// Unmount while the input is focused so typing keeps a real caret instead of
// stacking CSS rolls (and a blur) on every keystroke.
const showWeightDial = computed(() => weight.value.length > 0 && !weightFocused.value)
const showRepsDial = computed(() => reps.value.length > 0 && !repsFocused.value)

function stepReps(steps: number) {
  reps.value = String(Math.min(MAX_REPS, Math.max(MIN_REPS, (selectedReps.value ?? 0) + steps)))
}

function stepWeight(steps: number) {
  emit('step', steps)
}

function scrubWeight(steps: number) {
  const current = parseWeightInput(weight.value).value ?? 0
  weight.value = formatInputWeight(Math.max(1, current + steps), props.unit)
}

function focusWeight(event: FocusEvent) {
  weightFocused.value = true
  ;(event.target as HTMLInputElement).select()
}

function focusReps(event: FocusEvent) {
  repsFocused.value = true
  ;(event.target as HTMLInputElement).select()
}

useNumberScrub(weightControl, { step: scrubWeight, onActivate: () => weightInput.value?.focus() })
useNumberScrub(repsControl, { step: stepReps, onActivate: () => repsInput.value?.focus() })
</script>

<template>
  <form class="set-form" @submit.prevent>
    <div class="form-heading">
      <div><span class="form-eyebrow">START HERE</span><h2>Your last set.</h2></div>
      <OneRmMorphSwitch :model-value="unit" :options="unitOptions" aria-label="Weight unit" @update:model-value="$event && $emit('unit', $event)" />
    </div>
    <div class="set-fields">
      <div class="load-field">
        <label for="orm-weight"><span class="field-label"><OneRmIcon kind="weight" :value="weightKg" :active="weightFocused" />{{ exerciseFor(lift).basis === 'dumbbell' ? 'One dumbbell' : exerciseFor(lift).basis === 'bodyweight' ? 'Total load' : 'Weight lifted' }}</span><span>{{ unit }}</span></label>
        <div ref="weight-control" class="number-control" :class="{ invalid: weightError, 'is-editing': weightFocused }">
          <button type="button" :aria-label="`Decrease weight by ${unit === 'kg' ? '2.5 kg' : '5 lb'}`" @click="stepWeight(-1)">−</button>
          <div class="number-stage" :class="{ 'is-dial': showWeightDial, 'long-value': weight.length > 5 }">
            <span v-if="showWeightDial" class="number-face" aria-hidden="true">
              <OneRmDial :value="weight" />
            </span>
            <input id="orm-weight" ref="weight-input" v-model="weight" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" placeholder="100" :aria-invalid="Boolean(weightError)" :aria-describedby="weightError ? 'orm-weight-error' : 'orm-set-hint'" @focus="focusWeight" @blur="weightFocused = false">
          </div>
          <button type="button" :aria-label="`Increase weight by ${unit === 'kg' ? '2.5 kg' : '5 lb'}`" @click="stepWeight(1)">+</button>
        </div>
      </div>
      <div class="reps-field">
        <label for="orm-reps"><span class="field-label"><OneRmIcon kind="reps" :value="selectedReps" :active="repsFocused" />Repetitions</span></label>
        <div ref="reps-control" class="number-control" :class="{ invalid: repsError, 'is-editing': repsFocused }">
          <button type="button" aria-label="Decrease reps by 1" :disabled="selectedReps === MIN_REPS" @click="stepReps(-1)">−</button>
          <div class="number-stage" :class="{ 'is-dial': showRepsDial }">
            <span v-if="showRepsDial" class="number-face" aria-hidden="true">
              <OneRmDial :value="reps" />
            </span>
            <input id="orm-reps" ref="reps-input" v-model="reps" type="text" inputmode="numeric" autocomplete="off" spellcheck="false" placeholder="5" maxlength="2" :aria-invalid="Boolean(repsError)" :aria-describedby="repsError ? 'orm-reps-error' : 'orm-set-hint'" @focus="focusReps" @blur="repsFocused = false">
          </div>
          <button type="button" aria-label="Increase reps by 1" :disabled="selectedReps === MAX_REPS" @click="stepReps(1)">+</button>
        </div>
      </div>
    </div>
    <p v-if="weightError" id="orm-weight-error" class="field-error">{{ weightError }}</p>
    <p v-if="repsError" id="orm-reps-error" class="field-error">{{ repsError }}</p>
    <div class="rep-shortcuts" role="group" aria-labelledby="quick-reps-label" aria-describedby="quick-reps-hint">
      <div class="shortcut-heading"><span id="quick-reps-label">Quick-set reps</span><span id="quick-reps-hint">1–12</span></div>
      <div class="shortcut-options">
        <button v-for="n in quickReps" :key="n" type="button" :aria-pressed="selectedReps === n" :aria-label="`Set ${n} reps`" aria-controls="orm-reps" @click="reps = String(n)"><HoloPill /><strong>{{ n }}</strong></button>
      </div>
    </div>
    <div class="rep-quality" aria-hidden="true"><i /><span>Best estimates: 2–10 clean reps</span></div>
    <p id="orm-set-hint" class="set-hint">{{ exerciseHint(lift) }}</p>
  </form>
</template>

<style scoped>
.set-form { display: flex; flex-direction: column; padding: 30px 32px; min-width: 0; }
.form-eyebrow { display: block; margin-bottom: 7px; color: var(--orm-muted); font-size: 9px; font-weight: 500; letter-spacing: .14em; }
.form-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 30px; }
.form-heading h2 { margin: 0; font-size: 21px; font-weight: 500; letter-spacing: -.03em; }
label { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 9px; font-size: 12px; font-weight: 500; color: var(--orm-muted); }
label span { color: var(--orm-ink); }
label { align-items: center; }
label .field-label { display: inline-flex; align-items: center; gap: 7px; color: inherit; }
.field-label .orm-icon { width: 20px; height: 20px; }
.set-fields { display: grid; grid-template-columns: 1fr; gap: 24px; }
.number-control { display: flex; align-items: center; min-width: 0; height: 82px; border: 1px solid var(--orm-glass-line); border-radius: 14px; background: var(--orm-field-glass); -webkit-backdrop-filter: var(--orm-glass-filter); backdrop-filter: var(--orm-glass-filter); box-shadow: var(--orm-glass-shadow); touch-action: pan-y; overscroll-behavior-x: contain; scrollbar-width: none; -ms-overflow-style: none; transition: border-color .2s, box-shadow .2s; }
.number-control::-webkit-scrollbar { display: none; width: 0; height: 0; }
.number-control:not(.is-editing) { user-select: none; }
.number-control:not(.is-editing) .number-stage { cursor: ew-resize; }
.number-control:not(.is-editing) input { pointer-events: none; }
.number-control:focus-within { border-color: var(--orm-accent); box-shadow: inset 0 1px 0 oklch(96% .007 115 / .1), 0 0 0 3px oklch(92% .23 120 / .06), 0 0 26px oklch(92% .23 120 / .06); }
.number-control.invalid { border-color: var(--orm-error); }
.number-control button { flex-shrink: 0; width: 52px; height: 60px; background: transparent; color: var(--orm-muted); border: 0; cursor: pointer; font-size: 22px; }
.number-stage { position: relative; flex: 1; min-width: 0; height: 100%; overflow: hidden; font-size: 40px; font-weight: 500; letter-spacing: -.05em; font-variant-numeric: tabular-nums; }
.number-face { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; }
.number-control input { width: 100%; height: 100%; min-width: 0; padding: 0 3px; border: 0; outline: 0; background: transparent; color: var(--orm-ink); font-family: inherit; font-size: inherit; font-weight: inherit; letter-spacing: inherit; text-align: center; font-variant-numeric: inherit; }
.number-stage.is-dial input { color: transparent; caret-color: transparent; -webkit-text-fill-color: transparent; }
.number-control input::placeholder { color: var(--orm-muted); opacity: .6; }
.rep-shortcuts { margin-top: 24px; }
.shortcut-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 9px; font-size: 12px; }
.shortcut-heading > span:first-child { color: var(--orm-ink); font-weight: 500; }
.shortcut-heading > span:last-child { color: var(--orm-muted); font-size: 11px; }
.shortcut-options { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 6px; }
.shortcut-options button { position: relative; isolation: isolate; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; min-width: 0; min-height: 40px; padding: 5px 2px; border: 1px solid var(--orm-line); border-radius: 8px; background: transparent; color: var(--orm-muted); font: inherit; cursor: pointer; transition: color .18s ease-out, border-color .18s ease-out, background .18s ease-out, box-shadow .18s ease-out, transform .18s ease-out; }
.shortcut-options strong { position: relative; z-index: 1; color: var(--orm-ink); font-size: 15px; line-height: 1; font-weight: 500; font-variant-numeric: tabular-nums; }
.shortcut-options button { background: linear-gradient(155deg, oklch(96% .007 115 / .055), oklch(96% .007 115 / .008) 60%); box-shadow: inset 0 1px 0 oklch(96% .007 115 / .05); }
.shortcut-options button[aria-pressed="true"] { background: linear-gradient(155deg, oklch(92% .15 120 / .18), oklch(70% .13 120 / .055) 60%, oklch(92% .15 120 / .1)); color: var(--orm-accent); border-color: var(--orm-accent); box-shadow: inset 0 1px 0 oklch(96% .1 120 / .2), 0 0 16px oklch(92% .2 120 / .055); }
.shortcut-options button[aria-pressed="true"] strong { color: var(--orm-accent); }
@media (hover: hover) and (pointer: fine) {
  .shortcut-options button:hover,
  .shortcut-options button:focus-visible,
  .shortcut-options button:has(> .holo-pill-canvas.is-holo) {
    color: var(--orm-accent);
    border-color: oklch(92% .23 120 / .32);
    box-shadow: inset 0 1px 0 oklch(96% .007 115 / .05), 0 0 12px oklch(80% .12 240 / .1), 0 0 16px oklch(92% .23 120 / .09);
  }
  .shortcut-options button:hover strong,
  .shortcut-options button:has(> .holo-pill-canvas.is-holo) strong { color: var(--orm-accent); }
  .shortcut-options button[aria-pressed="true"]:hover,
  .shortcut-options button[aria-pressed="true"]:has(> .holo-pill-canvas.is-holo) {
    border-color: var(--orm-accent);
    box-shadow: inset 0 1px 0 oklch(96% .1 120 / .2), 0 0 16px oklch(92% .2 120 / .055);
  }
}
.number-control button:disabled { opacity: .3; cursor: default; transform: none; }
.set-hint { margin: 10px 0 0; color: var(--orm-muted); font-size: 12px; line-height: 1.5; }
.rep-quality { display: flex; align-items: center; gap: 6px; margin-top: 14px; font-size: 10px; color: var(--orm-muted); }
.rep-quality i { width: 4px; height: 4px; background: var(--orm-accent); border-radius: 50%; }
.field-error { margin: 8px 0 0; color: var(--orm-error); font-size: 12px; }
button:focus-visible { outline: 2px solid var(--orm-accent); outline-offset: 3px; }
button:not(:disabled):active { transform: translateY(1px); }
@media (hover: hover) { button:not(:disabled):hover { color: var(--orm-accent); } }
@media (max-width: 700px) {
  .set-form { padding: 22px; }
  .form-eyebrow { display: none; }
  .form-heading h2 { font-size: 19px; }
  .rep-quality { display: none; }
  .form-heading { margin-bottom: 16px; }
  .number-control { height: 62px; }
  .number-stage { font-size: 26px; }
  .number-stage.long-value { font-size: 16px; letter-spacing: -.06em; }
  .number-control button { width: 36px; height: 60px; }
  .set-fields { grid-template-columns: 1fr 1fr; gap: 12px; }
  .rep-shortcuts { margin-top: 12px; }
  .set-hint { margin-top: 12px; font-size: 11px; }
}
@media (max-width: 360px) { .number-control button { width: 28px; } .number-stage { font-size: 23px; } }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } }
</style>
