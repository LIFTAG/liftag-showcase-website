<script setup lang="ts">
import type { FormulaEstimate, FormulaId, WeightUnit } from '~/utils/oneRepMax'
import { DEFAULT_FORMULA_ID } from '~/utils/oneRepMax'

defineProps<{
  rows: FormulaEstimate[]
  activeId: FormulaId
  unit: WeightUnit
  spreadPct: number | null
  formatLoad: (kg: number, unit: WeightUnit) => string
}>()

const emit = defineEmits<{
  select: [id: FormulaId]
}>()

const open = shallowRef(false)
</script>

<template>
  <details class="orm-compare" :open="open" @toggle="open = ($event.target as HTMLDetailsElement).open">
    <summary class="orm-compare-summary">
      Compare all seven formulas
      <span v-if="spreadPct != null" class="orm-compare-spread">{{ spreadPct.toFixed(1) }}% spread</span>
    </summary>
    <p class="orm-compare-note">
      Select a formula to update your result. The spread shows disagreement between equations,
      not a confidence interval. The LIFTAG app uses Epley.
    </p>
    <div class="orm-compare-list" role="group" aria-label="Epley, Brzycki, Lombardi, Mayhew, O'Connor, Wathen, and Lander estimates">
      <div class="orm-compare-head" aria-hidden="true">
        <span>Formula</span>
        <span>Year</span>
        <span>Estimate</span>
      </div>
      <button
        v-for="row in rows"
        :key="row.id"
        type="button"
        class="orm-compare-card"
        :class="{ 'is-active': row.id === activeId }"
        :aria-pressed="row.id === activeId"
        :disabled="row.kg == null"
        @click="emit('select', row.id)"
      >
        <span class="orm-compare-name">
          {{ row.name }}
          <span v-if="row.id === DEFAULT_FORMULA_ID" class="orm-compare-default">default</span>
        </span>
        <span>{{ row.year }}</span>
        <span class="orm-compare-load">
          <template v-if="row.kg != null">{{ formatLoad(row.kg, unit) }} {{ unit }}</template>
          <template v-else>n/a</template>
        </span>
      </button>
    </div>
  </details>
</template>

<style scoped>
.orm-compare { border-bottom: 1px solid var(--orm-line); }
.orm-compare-summary { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 20px 4px; cursor: pointer; font-size: 15px; font-weight: 500; list-style: none; }
.orm-compare-summary::-webkit-details-marker { display: none; }
.orm-compare-summary::after { content: '+'; font-size: 22px; font-weight: 300; color: var(--orm-muted); transition: transform .2s; }
.orm-compare[open] .orm-compare-summary::after { transform: rotate(45deg); }
.orm-compare-spread { margin-left: auto; color: var(--orm-muted); font-size: 12px; font-weight: 400; }
.orm-compare-note { margin: 0 4px 16px; color: var(--orm-muted); font-size: 13px; line-height: 1.7; }
.orm-compare-list { display: grid; gap: 4px; margin: 0 4px 24px; }
.orm-compare-head, .orm-compare-card {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) 64px minmax(7.5ch, 1fr);
  align-items: center;
  gap: 12px;
  padding: 0 12px;
  text-align: left;
}
.orm-compare-head { color: var(--orm-muted); font-size: 11px; font-weight: 400; }
.orm-compare-card {
  width: 100%;
  min-height: 48px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: var(--orm-ink);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
  touch-action: manipulation;
  transition: background .16s ease-out, border-color .16s ease-out;
}
.orm-compare-card.is-active { background: var(--orm-accent-soft); border-color: oklch(60% .12 120 / .28); }
@media (hover: hover) {
  .orm-compare-card:hover:not(:disabled):not(.is-active) { background: oklch(96% .007 115 / .035); }
}
.orm-compare-card:disabled { color: var(--orm-muted); cursor: default; }
.orm-compare-card:focus-visible, .orm-compare-summary:focus-visible { outline: 2px solid var(--orm-accent); outline-offset: 3px; }
.orm-compare-name { display: inline-flex; align-items: center; gap: 8px; font-weight: 500; }
.orm-compare-load { font-variant-numeric: tabular-nums; }
.orm-compare-default { color: var(--orm-accent); font-size: 10px; font-weight: 400; }
@media (max-width: 400px) { .orm-compare-spread { font-size: 10px; } }
@media (prefers-reduced-motion: reduce) { .orm-compare-summary::after, .orm-compare-card { transition: none; } }
</style>
