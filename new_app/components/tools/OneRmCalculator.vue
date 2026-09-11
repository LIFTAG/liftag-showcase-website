<script setup lang="ts">
import OneRmSetForm from './OneRmSetForm.vue'
import OneRmGlass from './OneRmGlass.vue'
import OneRmResult from './OneRmResult.vue'
import OneRmStrength from './OneRmStrength.vue'
import OneRmFormulaCompare from './OneRmFormulaCompare.vue'
import OneRmNrmTable from './OneRmNrmTable.vue'
import OneRmPercentTable from './OneRmPercentTable.vue'
import { exerciseFor, loadQualifier } from '~/utils/oneRepMaxExercises'
import { FORMULAS } from '~/utils/oneRepMax'
import { strengthSource } from '~/utils/strengthStandards'

const {
  weightText, repsText, unit, lift, formulaId, copied, copyError, weightError, repsError,
  reps, weightKg, oneRmKg, estimates, cluster, confidence, percentRows, nrmRows, trainingMax,
  liveSummary, caveat, canShare, setUnit, setFormula, copyLink, copyResult, share,
  formatLoad, bodyweightText, bodyweightKg, comparisonSex, bodyweightError, comparison, stepWeight,
} = useOneRepMaxCalculator()
const formulaName = computed(() => FORMULAS.find(item => item.id === formulaId.value)?.name ?? 'Epley')
const sourceHref = computed(() => strengthSource(lift.value))
</script>

<template>
  <div class="orm">
    <div class="calculator-workspace">
      <OneRmGlass />
      <div class="calculator-main">
        <OneRmSetForm v-model:weight="weightText" v-model:reps="repsText" :lift="lift" :unit="unit" :weight-kg="weightKg" :weight-error="weightError" :reps-error="repsError" @unit="setUnit" @step="stepWeight" />
        <OneRmResult :kg="oneRmKg" :weight-kg="weightKg" :unit="unit" :reps="reps" :formula="formulaName" :formula-id="formulaId" :estimates="estimates" :confidence="confidence" :training-max="trainingMax" :summary="liveSummary" :qualifier="loadQualifier(lift)" @select="setFormula" />
      </div>
      <OneRmStrength v-model:bodyweight="bodyweightText" v-model:sex="comparisonSex" v-model:lift="lift" :unit="unit" :comparison="comparison" :bodyweight-kg="bodyweightKg" :bodyweight-error="bodyweightError" :valid-set="oneRmKg != null" />
      <div class="calculator-footer">
        <p>Calculated on your device. No signup.</p>
        <div class="result-actions">
          <button type="button" :disabled="oneRmKg == null" @click="copyResult">{{ copied === 'result' ? 'Copied ✓' : 'Copy result' }}</button>
          <button type="button" :disabled="oneRmKg == null" @click="copyLink">{{ copied === 'link' ? 'Copied ✓' : 'Copy link' }}</button>
          <button v-if="canShare" type="button" :disabled="oneRmKg == null" @click="share">Share</button>
        </div>
        <p v-if="copyError" class="copy-error" role="status">{{ copyError }}</p>
        <span class="sr-only" role="status">{{ copied ? `${copied === 'link' ? 'Link' : 'Result'} copied.` : '' }}</span>
      </div>
    </div>
    <p id="strength-method-note" class="strength-method">
      Data from <a v-if="sourceHref" :href="sourceHref" rel="noopener">Strength Level</a><span v-else>Strength Level</span>’s published bodyweight-ratio standards for people who log lifts there.
      <template v-if="exerciseFor(lift).basis === 'machine'">Machine designs and pulley ratios vary; comparisons are especially approximate.</template>
      Not the general population. No age adjustment. Approximate. <a href="#percentile-method">How it works <span aria-hidden="true">↗</span></a>
    </p>

    <div class="training-details">
      <details class="training-disclosure">
        <summary><span><strong>Training load tables</strong><small>Percentages & rep maxes</small></span><span class="disclosure-icon" aria-hidden="true">+</span></summary>
        <div class="training-content">
          <p v-if="!percentRows.length">Enter a valid set to get training loads.</p>
          <template v-else>
            <h3>Training percentages</h3>
            <p>Based on your {{ formulaName }} 1RM<span v-if="loadQualifier(lift)">, {{ loadQualifier(lift) }}</span>. Loads rounded to {{ unit === 'kg' ? '2.5 kg' : '5 lb' }} increments; exact values shown alongside.</p>
            <OneRmPercentTable :rows="percentRows" :unit="unit" :format-load="formatLoad" />
            <h3>Estimated rep maxes</h3>
            <p>Predicted maximum weight for each rep target, using {{ formulaName }}<span v-if="loadQualifier(lift)">, {{ loadQualifier(lift) }}</span>.</p>
            <OneRmNrmTable :rows="nrmRows" :unit="unit" :format-load="formatLoad" />
          </template>
        </div>
      </details>
      <OneRmFormulaCompare v-if="estimates.length" :rows="estimates" :active-id="formulaId" :unit="unit" :spread-pct="cluster?.spreadPct ?? null" :format-load="formatLoad" @select="setFormula" />
    </div>
    <p v-if="caveat" class="lift-context">{{ caveat }}</p>
  </div>
</template>

<style scoped>
.orm {
  --orm-surface: oklch(16% .005 115);
  --orm-result: oklch(18% .007 115);
  --orm-input: oklch(20% .006 115 / .72);
  --orm-field-glass: linear-gradient(155deg, oklch(96% .007 115 / .12), oklch(96% .007 115 / .018) 42%, oklch(96% .007 115 / .045)), oklch(18% .006 115 / .38);
  --orm-glass-line: oklch(88% .012 115 / .16);
  --orm-glass-shadow: inset 0 1px 0 oklch(98% .005 115 / .15), inset 0 -1px 0 oklch(96% .007 115 / .04), 0 5px 16px oklch(8% .005 115 / .16);
  --orm-glass-filter: blur(12px) saturate(1.35);
  --orm-line: oklch(29% .008 115);
  --orm-ink: oklch(96% .007 115);
  --orm-muted: oklch(73% .009 115);
  --orm-accent: oklch(92% .23 120);
  --orm-accent-soft: oklch(25% .04 120);
  --orm-error: oklch(76% .15 20);
  --orm-warning: oklch(81% .12 85);
  color: var(--orm-ink);
  font-family: var(--liftag-font-body);
}
.calculator-workspace {
  position: relative;
  isolation: isolate;
  border: 1px solid oklch(79% .025 115 / .16);
  border-radius: 24px;
  background: var(--orm-surface);
  overflow: clip;
  box-shadow: 0 28px 80px oklch(8% .005 115 / .4), 0 0 60px oklch(80% .16 120 / .025);
}
/* A static hairline reflection frames the workspace without intercepting input. */
.calculator-workspace::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 2;
  border-radius: inherit;
  pointer-events: none;
  box-shadow: inset 0 1px 0 oklch(96% .007 115 / .14), inset 1px 0 0 oklch(96% .007 115 / .035), inset 0 -1px 0 oklch(92% .12 120 / .06);
}
.calculator-main, .calculator-footer, .calculator-workspace > :deep(.strength) { position: relative; z-index: 1; }
.calculator-main { display: grid; grid-template-columns: minmax(0, .83fr) minmax(0, 1.17fr); }
.calculator-footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px 20px; padding: 8px 32px; border-top: 1px solid var(--orm-line); background: oklch(12% .005 115 / .35); }
.calculator-footer > p { margin: 0; font-size: 11px; line-height: 1.6; color: var(--orm-muted); }
.result-actions { display: flex; align-items: center; gap: 18px; }
.result-actions button { display: inline-flex; align-items: center; min-height: 44px; padding: 0; border: 0; background: transparent; color: var(--orm-ink); font: inherit; font-size: 11px; cursor: pointer; transition: color .2s; }
.result-actions button:hover { color: var(--orm-accent); }
.result-actions button:disabled { opacity: .4; cursor: default; }
.result-actions button:focus-visible, summary:focus-visible { outline: 2px solid var(--orm-accent); outline-offset: 3px; }
.calculator-footer .copy-error { flex-basis: 100%; color: var(--orm-error); }
.strength-method { margin: 12px 4px 0; max-width: 72ch; font-size: 11px; line-height: 1.65; color: oklch(58% .007 115); }
.strength-method a { color: inherit; text-underline-offset: 2px; }
.strength-method a:last-child { white-space: nowrap; }
.strength-method a:focus-visible { outline: 2px solid var(--orm-accent); outline-offset: 3px; }
.training-details { margin-top: 20px; }
.training-disclosure { border-top: 1px solid var(--orm-line); border-bottom: 1px solid var(--orm-line); }
.training-disclosure summary { display: flex; align-items: center; justify-content: space-between; padding: 20px 4px; cursor: pointer; list-style: none; gap: 12px; }
.training-disclosure summary::-webkit-details-marker { display: none; }
.training-disclosure strong { font-size: 15px; font-weight: 500; }
.training-disclosure small { font-size: 12px; color: var(--orm-muted); margin-left: 18px; }
.disclosure-icon { font-size: 22px; font-weight: 300; color: var(--orm-muted); transition: transform .2s; }
.training-disclosure[open] .disclosure-icon { transform: rotate(45deg); }
.training-content { padding: 0 4px 28px; }
.training-content h3 { margin: 24px 0 8px; font-size: 17px; font-weight: 500; }
.training-content p { color: var(--orm-muted); font-size: 13px; line-height: 1.6; }
.lift-context { margin: 18px 0 0; font-size: 12px; color: var(--orm-muted); line-height: 1.7; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
@media (max-width: 700px) {
  .calculator-main { grid-template-columns: 1fr; }
  .calculator-workspace { border-radius: 16px; }
  .calculator-footer { padding: 12px 20px; }
  .result-actions { gap: 24px; }
  .result-actions button { min-height: 40px; font-size: 12px; }
  .training-disclosure small { display: block; margin: 5px 0 0; }
}
@media (prefers-reduced-motion: reduce) { .disclosure-icon, .result-actions button { transition: none; } }
@media (prefers-reduced-transparency: reduce) {
  .orm { --orm-field-glass: var(--orm-surface); --orm-glass-filter: none; }
}
</style>
