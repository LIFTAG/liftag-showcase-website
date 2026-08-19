<script setup lang="ts">
import {
  gymQrGlanceRows,
  gymQrMatrixFor,
  gymQrPlatforms,
  type GymQrCellMark,
  type GymQrTableVariant,
} from '~/utils/gymQrComparison'

const props = withDefaults(defineProps<{
  kind?: 'glance' | 'matrix'
  variant?: GymQrTableVariant
  label?: string
}>(), {
  kind: 'matrix',
  variant: 'full',
  label: 'QR and NFC gym tracking comparison',
})

const matrixRows = computed(() => gymQrMatrixFor(props.variant))

function markLabel(mark: GymQrCellMark | undefined) {
  if (mark === 'only') return 'Only LIFTAG'
  if (mark === 'best') return 'Best here'
  if (mark === 'theirs') return 'They win'
  return ''
}
</script>

<template>
  <div class="gqc-wrap" role="region" :aria-label="label">
    <table v-if="kind === 'glance'" class="gqc-table gqc-table--glance">
      <thead>
        <tr>
          <th scope="col">Platform</th>
          <th scope="col">Gym cost</th>
          <th scope="col">Unique strength</th>
          <th scope="col">Best for</th>
          <th scope="col">Weak spot</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in gymQrGlanceRows"
          :key="row.name"
          :class="{ 'gqc-row-self': row.name === 'LIFTAG' }"
        >
          <th scope="row">{{ row.name }}</th>
          <td>{{ row.gymCost }}</td>
          <td>{{ row.unique }}</td>
          <td>{{ row.bestFor }}</td>
          <td>{{ row.weakSpot }}</td>
        </tr>
      </tbody>
    </table>

    <table v-else class="gqc-table gqc-table--matrix">
      <thead>
        <tr>
          <th scope="col">Aspect</th>
          <th
            v-for="platform in gymQrPlatforms"
            :key="platform"
            scope="col"
            :class="{ 'gqc-col-self': platform === 'LIFTAG' }"
          >
            {{ platform }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in matrixRows" :key="row.id">
          <th scope="row">{{ row.aspect }}</th>
          <td
            v-for="platform in gymQrPlatforms"
            :key="platform"
            :class="{
              'gqc-col-self': platform === 'LIFTAG',
              'gqc-cell-only': row.cells[platform].mark === 'only',
              'gqc-cell-best': row.cells[platform].mark === 'best',
              'gqc-cell-theirs': row.cells[platform].mark === 'theirs',
            }"
          >
            <span
              v-if="row.cells[platform].mark"
              class="gqc-mark"
              :class="`gqc-mark--${row.cells[platform].mark}`"
            >{{ markLabel(row.cells[platform].mark) }}</span>
            {{ row.cells[platform].text }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.gqc-wrap {
  overflow-x: auto;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
}

.gqc-table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(5, 8, 9, 0.96);
  font-size: 14px;
}

.gqc-table--glance {
  min-width: 880px;
}

.gqc-table--matrix {
  min-width: 980px;
}

.gqc-table th,
.gqc-table td {
  padding: 16px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  text-align: left;
  vertical-align: top;
  color: rgba(255, 255, 255, 0.78);
  font-weight: 300;
  line-height: 1.5;
}

.gqc-table thead th {
  background: rgba(255, 255, 255, 0.03);
  color: var(--liftag-primary);
  font-family: var(--liftag-font-mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 700;
}

.gqc-table tbody th {
  color: #fff;
  font-family: var(--liftag-font-headline);
  font-style: italic;
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
}

.gqc-table--glance tbody th {
  font-size: 18px;
}

.gqc-row-self,
.gqc-col-self {
  background: rgba(204, 255, 0, 0.05);
}

.gqc-row-self th,
.gqc-table thead .gqc-col-self {
  color: var(--liftag-primary);
}

.gqc-cell-only,
.gqc-cell-best {
  color: rgba(255, 255, 255, 0.92);
}

.gqc-mark {
  display: inline-block;
  margin: 0 8px 8px 0;
  padding: 3px 7px;
  border: 1px solid transparent;
  border-radius: 999px;
  font-family: var(--liftag-font-mono);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  vertical-align: 1px;
}

.gqc-mark--only {
  border-color: rgba(204, 255, 0, 0.45);
  background: rgba(204, 255, 0, 0.14);
  color: var(--liftag-primary);
}

.gqc-mark--best {
  border-color: rgba(204, 255, 0, 0.28);
  background: rgba(204, 255, 0, 0.08);
  color: var(--liftag-primary);
}

.gqc-mark--theirs {
  border-color: rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.62);
}
</style>
