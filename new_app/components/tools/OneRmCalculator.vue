<script setup lang="ts">
import OneRmFormulaCompare from '~/components/tools/OneRmFormulaCompare.vue'
import OneRmNrmTable from '~/components/tools/OneRmNrmTable.vue'
import OneRmPercentTable from '~/components/tools/OneRmPercentTable.vue'
import { CONFIDENCE_LABEL, CONFIDENCE_NOTE, FORMULAS, LIFTS } from '~/utils/oneRepMax'

const calc = useOneRepMaxCalculator()
const {
  weightText,
  repsText,
  unit,
  lift,
  formulaId,
  copied,
  idle,
  weightError,
  repsError,
  weightKg,
  reps,
  oneRmKg,
  estimates,
  cluster,
  confidence,
  percentRows,
  nrmRows,
  trainingMax,
  liveSummary,
  caveat,
  otherUnit,
  canShare,
  setUnit,
  setLift,
  setFormula,
  copyLink,
  copyResult,
  share,
  formatLoad,
  formatLoadWithUnit,
} = calc

const formulaName = computed(() => FORMULAS.find(item => item.id === formulaId.value)?.name ?? 'Epley')
</script>

<template>
  <div class="orm">
    <div class="orm-top">
    <form class="orm-form" @submit.prevent>
      <div class="orm-fields">
        <div class="orm-field">
          <label class="orm-label" for="orm-weight">Weight</label>
          <input
            id="orm-weight"
            v-model="weightText"
            class="orm-input"
            type="text"
            inputmode="decimal"
            autocomplete="off"
            spellcheck="false"
            placeholder="100"
            :aria-invalid="Boolean(weightError)"
            :aria-describedby="weightError ? 'orm-weight-error' : 'orm-weight-hint'"
          >
          <p id="orm-weight-hint" class="orm-hint">The load you lifted. Plates count.</p>
          <p v-if="weightError" id="orm-weight-error" class="orm-error">{{ weightError }}</p>
        </div>
        <div class="orm-field">
          <label class="orm-label" for="orm-reps">Reps</label>
          <input
            id="orm-reps"
            v-model="repsText"
            class="orm-input"
            type="text"
            inputmode="numeric"
            autocomplete="off"
            spellcheck="false"
            placeholder="5"
            maxlength="2"
            :aria-invalid="Boolean(repsError)"
            :aria-describedby="repsError ? 'orm-reps-error' : 'orm-reps-hint'"
          >
          <p id="orm-reps-hint" class="orm-hint">Clean reps. 1–30.</p>
          <p v-if="repsError" id="orm-reps-error" class="orm-error">{{ repsError }}</p>
        </div>
        <fieldset class="orm-field orm-units">
          <legend class="orm-label">Units</legend>
          <div class="orm-seg" role="radiogroup" aria-label="Weight unit">
            <button
              type="button"
              class="orm-seg-btn"
              role="radio"
              :aria-checked="unit === 'kg'"
              @click="setUnit('kg')"
            >kg</button>
            <button
              type="button"
              class="orm-seg-btn"
              role="radio"
              :aria-checked="unit === 'lb'"
              @click="setUnit('lb')"
            >lb</button>
          </div>
        </fieldset>
      </div>

      <fieldset class="orm-lifts">
        <legend class="orm-label">Lift</legend>
        <div class="orm-chips" role="radiogroup" aria-label="Lift">
          <button
            v-for="item in LIFTS"
            :key="item.id"
            type="button"
            class="orm-chip"
            role="radio"
            :aria-checked="lift === item.id"
            @click="setLift(item.id)"
          >{{ item.label }}</button>
        </div>
      </fieldset>
    </form>

    <div class="orm-result" aria-live="polite" aria-atomic="true">
      <p class="visually-hidden">{{ liveSummary }}</p>
      <template v-if="idle || oneRmKg == null || weightKg == null || reps == null || !confidence">
        <p class="orm-idle">Enter a set.</p>
        <p class="orm-idle-sub">Weight, reps, estimated max. Epley, same formula as the app.</p>
      </template>
      <template v-else>
        <p class="protocol orm-result-kicker">{{ formulaName }} · {{ CONFIDENCE_LABEL[confidence] }}</p>
        <p class="orm-max">
          <span class="orm-max-num">{{ formatLoad(oneRmKg, unit) }}</span>
          <span class="orm-max-unit">{{ unit }}</span>
        </p>
        <p class="orm-set">
          {{ formatLoad(weightKg, unit) }} {{ unit }} × {{ reps }}
          <span class="orm-set-alt">· {{ formatLoadWithUnit(oneRmKg, otherUnit) }}</span>
        </p>
        <p v-if="trainingMax != null" class="orm-tm">
          Training max {{ formatLoadWithUnit(trainingMax, unit) }} (90%). Use this for percentages, not the {{ formatLoad(oneRmKg, unit) }}.
        </p>
        <p class="orm-note">{{ CONFIDENCE_NOTE[confidence] }}</p>
        <p v-if="caveat" class="orm-note">{{ caveat }}</p>
        <p class="orm-disclaimer">Estimate, not a tested max. Not medical advice.</p>
        <div class="orm-actions">
          <button type="button" class="orm-action" @click="copyLink">{{ copied ? 'Copied' : 'Copy link' }}</button>
          <button type="button" class="orm-action" @click="copyResult">Copy result</button>
          <button v-if="canShare" type="button" class="orm-action" @click="share">Share</button>
        </div>
      </template>
    </div>
    </div>

    <section v-if="percentRows.length" class="orm-block" aria-labelledby="orm-percents-title">
      <h3 id="orm-percents-title" class="orm-block-title">Training percentages</h3>
      <p class="orm-block-lead">Linear off the estimated 1RM, rounded to a loadable plate. Exact stays in the next column.</p>
      <OneRmPercentTable :rows="percentRows" :unit="unit" :format-load="formatLoad" />
    </section>

    <section v-if="nrmRows.length" class="orm-block" aria-labelledby="orm-nrm-title">
      <h3 id="orm-nrm-title" class="orm-block-title">Estimated n-rep max</h3>
      <p class="orm-block-lead">Inverted {{ formulaName }}, 1 to 10 only. Past 10 the math is endurance.</p>
      <OneRmNrmTable :rows="nrmRows" :unit="unit" :format-load="formatLoad" />
    </section>

    <OneRmFormulaCompare
      v-if="estimates.length"
      :rows="estimates"
      :active-id="formulaId"
      :unit="unit"
      :spread-pct="cluster?.spreadPct ?? null"
      :format-load="formatLoad"
      @select="setFormula"
    />
  </div>
</template>

<style scoped>
.orm {
  display: grid;
  gap: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 22px;
  background:
    radial-gradient(circle at 12% 0%, rgba(204, 255, 0, 0.08), transparent 42%),
    #0e0e0e;
  overflow: clip;
}
.orm-top {
  display: grid;
  grid-template-columns: 1fr;
}
.orm-form {
  display: grid;
  gap: 22px;
  padding: 28px 28px 22px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}
@media (min-width: 900px) {
  .orm-top {
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
    align-items: start;
  }
  .orm-form {
    border-bottom: 0;
    border-right: 1px solid rgba(255, 255, 255, 0.07);
  }
  .orm-result {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 100%;
  }
  .orm-max-num {
    font-size: clamp(52px, 6.4vw, 80px);
  }
}
.orm-fields {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 0.8fr) auto;
  gap: 16px;
  align-items: start;
}
.orm-field {
  display: grid;
  gap: 8px;
  min-width: 0;
}
.orm-units {
  border: 0;
  margin: 0;
  padding: 0;
  min-width: 132px;
}
.orm-lifts {
  border: 0;
  margin: 0;
  padding: 0;
}
.orm-label {
  font-family: var(--liftag-font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
}
.orm-input {
  width: 100%;
  height: 64px;
  padding: 0 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  background: #161616;
  color: #fff;
  font-family: var(--liftag-font-mono);
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.03em;
}
.orm-input::placeholder {
  color: rgba(255, 255, 255, 0.22);
}
.orm-input:focus {
  outline: 2px solid var(--liftag-primary);
  outline-offset: 2px;
  border-color: transparent;
}
.orm-input[aria-invalid="true"] {
  border-color: var(--liftag-red-neon);
}
.orm-hint,
.orm-error {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.4;
}
.orm-hint { color: rgba(255, 255, 255, 0.38); }
.orm-error { color: var(--liftag-red-neon); }
.orm-seg {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 64px;
  padding: 4px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  background: #161616;
}
.orm-seg-btn,
.orm-chip,
.orm-action {
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.62);
  cursor: pointer;
  font-family: var(--liftag-font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.orm-seg-btn {
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
}
.orm-seg-btn[aria-checked="true"],
.orm-chip[aria-checked="true"] {
  background: var(--liftag-primary);
  color: #0e0e0e;
}
.orm-seg-btn:focus-visible,
.orm-chip:focus-visible,
.orm-action:focus-visible {
  outline: 2px solid var(--liftag-primary);
  outline-offset: 2px;
}
.orm-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.orm-chip {
  height: 36px;
  padding: 0 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}
.orm-result {
  min-height: 220px;
  padding: 32px 28px 28px;
}
.orm-idle {
  margin: 0;
  font-family: var(--liftag-font-headline);
  font-size: clamp(36px, 6vw, 64px);
  font-style: italic;
  font-weight: 700;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  line-height: 0.95;
}
.orm-idle-sub {
  max-width: 36ch;
  margin: 14px 0 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 16px;
  font-weight: 300;
  line-height: 1.5;
}
.orm-result-kicker {
  color: var(--liftag-primary);
  margin: 0 0 10px;
}
.orm-max {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin: 0;
  line-height: 0.85;
}
.orm-max-num {
  font-family: var(--liftag-font-mono);
  font-size: clamp(64px, 12vw, 112px);
  font-weight: 700;
  letter-spacing: -0.06em;
  color: var(--liftag-primary);
}
.orm-max-unit {
  font-family: var(--liftag-font-mono);
  font-size: clamp(18px, 3vw, 28px);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
}
.orm-set,
.orm-tm,
.orm-note,
.orm-disclaimer {
  margin: 12px 0 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 15px;
  font-weight: 300;
  line-height: 1.55;
}
.orm-set {
  font-family: var(--liftag-font-mono);
  font-size: 16px;
  font-weight: 500;
  color: #fff;
}
.orm-set-alt { color: rgba(255, 255, 255, 0.45); }
.orm-disclaimer {
  color: rgba(255, 255, 255, 0.48);
  font-size: 13.5px;
}
.orm-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
}
.orm-action {
  height: 40px;
  padding: 0 14px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
}
@media (hover: hover) and (pointer: fine) {
  .orm-action:hover { border-color: var(--liftag-primary); color: var(--liftag-primary); }
}
.orm-block {
  padding: 8px 28px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}
.orm-block-title {
  margin: 16px 0 0;
  font-family: var(--liftag-font-headline);
  font-size: 20px;
  font-style: italic;
  text-transform: uppercase;
}
.orm-block-lead {
  margin: 8px 0 0;
  color: rgba(255, 255, 255, 0.52);
  font-size: 14px;
  font-weight: 300;
  line-height: 1.5;
}
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
@media (max-width: 720px) {
  .orm-fields { grid-template-columns: 1fr 1fr; }
  .orm-units { grid-column: 1 / -1; }
  .orm-form, .orm-result, .orm-block { padding-left: 18px; padding-right: 18px; }
  .orm-input, .orm-seg { height: 56px; }
  .orm-input { font-size: 24px; }
}
</style>
