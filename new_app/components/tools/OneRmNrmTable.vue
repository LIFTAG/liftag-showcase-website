<script setup lang="ts">
import type { NrmRow, WeightUnit } from '~/utils/oneRepMax'

defineProps<{
  rows: NrmRow[]
  unit: WeightUnit
  formatLoad: (kg: number, unit: WeightUnit) => string
}>()
</script>

<template>
  <div class="orm-table-wrap">
    <table class="orm-table">
      <caption class="orm-table-caption">Estimated n-rep maxes from the active formula, 1 to 10</caption>
      <thead>
        <tr>
          <th scope="col">nRM</th>
          <th scope="col">Load</th>
          <th scope="col">% of e1RM</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.reps" :class="{ 'is-input': row.isInput }">
          <th scope="row">{{ row.reps }}{{ row.isInput ? ' (this set)' : '' }}</th>
          <td class="orm-table-load">{{ formatLoad(row.kg, unit) }} {{ unit }}</td>
          <td class="orm-table-exact">{{ Math.round(row.percentOfMax) }}%</td>
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
.orm-table tbody tr.is-input {
  background: rgba(204, 255, 0, 0.07);
}
.orm-table tbody tr:last-child th,
.orm-table tbody tr:last-child td {
  border-bottom: 0;
}
</style>
