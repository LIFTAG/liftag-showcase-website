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
      Other formulas
      <span v-if="spreadPct != null" class="orm-compare-spread">spread {{ spreadPct.toFixed(1) }}%</span>
    </summary>
    <p class="orm-compare-note">
      Seven models, seven datasets. The spread is disagreement, not a confidence interval.
      Program from the low end if the set was ugly. LIFTAG’s log stays on Epley.
    </p>
    <div class="orm-table-wrap">
      <table class="orm-table">
        <caption class="orm-table-caption">Epley, Brzycki, Lombardi, Mayhew, O'Connor, Wathen, and Lander estimates</caption>
        <thead>
          <tr>
            <th scope="col">Formula</th>
            <th scope="col">Year</th>
            <th scope="col">Estimate</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.id"
            :class="{ 'is-active': row.id === activeId }"
          >
            <th scope="row">
              <button
                type="button"
                class="orm-compare-pick"
                :aria-pressed="row.id === activeId"
                @click="emit('select', row.id)"
              >
                {{ row.name }}
                <span v-if="row.id === DEFAULT_FORMULA_ID" class="orm-compare-default">default</span>
              </button>
            </th>
            <td>{{ row.year }}</td>
            <td class="orm-table-load">
              <template v-if="row.kg != null">{{ formatLoad(row.kg, unit) }} {{ unit }}</template>
              <template v-else>n/a</template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </details>
</template>

<style scoped>
.orm-compare {
  margin-top: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.02);
}
.orm-compare-summary {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  cursor: pointer;
  font-family: var(--liftag-font-headline);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  list-style: none;
}
.orm-compare-summary::-webkit-details-marker { display: none; }
.orm-compare-spread {
  font-family: var(--liftag-font-mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
}
.orm-compare-note {
  margin: 0 18px 12px;
  color: rgba(255, 255, 255, 0.58);
  font-size: 14px;
  font-weight: 300;
  line-height: 1.55;
}
.orm-table-wrap {
  overflow-x: auto;
  margin: 0 12px 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
}
.orm-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.orm-table-caption {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
.orm-table th,
.orm-table td {
  padding: 10px 14px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.orm-table thead th {
  font-family: var(--liftag-font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.48);
}
.orm-table-load {
  font-family: var(--liftag-font-mono);
  font-weight: 600;
  color: var(--liftag-primary);
}
.orm-table tbody tr.is-active {
  background: rgba(204, 255, 0, 0.07);
}
.orm-compare-pick {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #fff;
  font: inherit;
  cursor: pointer;
  text-align: left;
}
.orm-compare-pick:focus-visible {
  outline: 2px solid var(--liftag-primary);
  outline-offset: 3px;
}
.orm-compare-default {
  font-family: var(--liftag-font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--liftag-primary);
}
</style>
