<script setup lang="ts">
import type { TrainingPercentRow, WeightUnit } from '~/utils/oneRepMax'

defineProps<{
  rows: TrainingPercentRow[]
  unit: WeightUnit
  formatLoad: (kg: number, unit: WeightUnit) => string
}>()
</script>

<template>
  <div class="orm-table-wrap">
    <table class="orm-table">
      <caption class="orm-table-caption">Training percentages from the estimated 1RM</caption>
      <thead>
        <tr>
          <th scope="col">%</th>
          <th scope="col">Load</th>
          <th scope="col">Exact</th>
          <th scope="col">~Reps</th>
          <th scope="col">Purpose</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.percent">
          <th scope="row">{{ row.percent }}</th>
          <td class="orm-table-load">{{ formatLoad(row.roundedKg, unit) }} {{ unit }}</td>
          <td class="orm-table-exact">{{ formatLoad(row.kg, unit) }}</td>
          <td>{{ row.nscaReps }}</td>
          <td>{{ row.purpose }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.orm-table-wrap {
  overflow-x: auto;
  margin-top: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
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
  white-space: nowrap;
}
.orm-table thead th {
  font-family: var(--liftag-font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.48);
  background: rgba(255, 255, 255, 0.03);
}
.orm-table tbody th {
  font-family: var(--liftag-font-mono);
  font-weight: 600;
  color: #fff;
}
.orm-table-load {
  font-family: var(--liftag-font-mono);
  font-weight: 600;
  color: var(--liftag-primary);
}
.orm-table-exact {
  font-family: var(--liftag-font-mono);
  color: rgba(255, 255, 255, 0.5);
}
.orm-table tbody tr:last-child th,
.orm-table tbody tr:last-child td {
  border-bottom: 0;
}
@media (max-width: 620px) {
  .orm-table th,
  .orm-table td {
    padding: 9px 10px;
    font-size: 13px;
  }
}
</style>
