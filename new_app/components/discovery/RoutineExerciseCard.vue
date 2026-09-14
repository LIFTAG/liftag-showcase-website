<script setup lang="ts">
import type { DiscoveryLocale, RoutineExercise, SetPrescription } from '~/types/discovery'
import { discoveryCopy, discoveryCount } from '~/utils/discoveryCopy'
const props = defineProps<{ exercise: RoutineExercise; position: number; locale: DiscoveryLocale }>()
defineEmits<{ select: [] }>()
const copy = computed(() => discoveryCopy(props.locale))
const columns = computed(() =>
  (
    [
      { key: 'reps', label: copy.value.reps, unit: '' },
      { key: 'weightKg', label: copy.value.weight, unit: 'kg' },
      { key: 'durationSeconds', label: copy.value.duration, unit: copy.value.seconds },
      { key: 'calories', label: copy.value.calories, unit: 'kcal' },
      { key: 'restSeconds', label: copy.value.rest, unit: copy.value.seconds },
      { key: 'rpe', label: 'RPE', unit: '' },
    ] satisfies { key: keyof SetPrescription; label: string; unit: string }[]
  ).filter((column) => props.exercise.sets.some((set) => set[column.key] !== undefined)),
)
</script>
<template>
  <article class="d-prescription">
    <button class="d-prescription-heading" @click="$emit('select')">
      <img v-if="exercise.image" :src="exercise.image" alt="" loading="lazy" />
      <span v-else class="d-prescription-art"><DiscoveryIcon name="gym" :size="26" /></span>
      <span>
        <span class="d-muted d-small">{{ String(position).padStart(2, '0') }}</span>
        <h3>{{ exercise.name || copy.exerciseDetails }}</h3>
        <span v-if="exercise.sets.length" class="d-muted d-small">
          {{ discoveryCount(exercise.sets.length, 'sets', locale) }}
        </span>
      </span>
      <DiscoveryIcon :name="exercise.videos.length ? 'play' : 'arrow'" />
    </button>
    <div
      v-if="exercise.sets.length && columns.length"
      class="d-table-scroll"
      tabindex="0"
      :aria-label="`${exercise.name}: ${copy.sets}`"
    >
      <table>
        <caption class="sr-only">
          {{ exercise.name }}
          ·
          {{ copy.sets }}
        </caption>
        <thead>
          <tr>
            <th scope="col">{{ copy.set }}</th>
            <th v-for="column in columns" :key="column.key" scope="col">{{ column.label }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(set, index) in exercise.sets" :key="index">
            <th scope="row">{{ index + 1 }}</th>
            <td v-for="column in columns" :key="column.key">
              <template v-if="set[column.key] !== undefined">
                {{ set[column.key] }}
                <span v-if="column.unit" class="d-muted">{{ column.unit }}</span>
              </template>
              <span v-else class="d-muted">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="exercise.notes" class="d-prescription-notes">
      <strong>{{ copy.notes }}</strong>
      <p class="d-copy">{{ exercise.notes }}</p>
    </div>
  </article>
</template>
<style scoped>
.d-prescription {
  overflow: hidden;
  border: 1px solid var(--d-border);
  border-radius: 18px;
  background: var(--d-panel);
}
.d-prescription-heading {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 18px;
  color: var(--d-text);
  background: transparent;
  border: 0;
  text-align: left;
}
.d-prescription-heading:hover {
  background: #ffffff05;
}
.d-prescription-heading > img,
.d-prescription-art {
  display: grid;
  place-items: center;
  width: 76px;
  height: 76px;
  flex-shrink: 0;
  object-fit: cover;
  border-radius: 12px;
  background: #292d24;
  color: #8d9b6c;
}
.d-prescription-heading > span:not(.d-prescription-art) {
  flex: 1;
  display: grid;
  gap: 4px;
}
.d-prescription-heading h3 {
  margin: 0;
  font-size: 1rem;
  line-height: 1.45;
  font-weight: 600;
}
.d-prescription-heading > svg {
  flex-shrink: 0;
  color: var(--d-accent);
}
.d-table-scroll {
  overflow-x: auto;
  padding: 0 18px 12px;
}
.d-table-scroll table {
  border-collapse: collapse;
  width: 100%;
  white-space: nowrap;
  text-align: left;
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
}
.d-table-scroll th,
.d-table-scroll td {
  padding: 12px 16px 12px 0;
  border-bottom: 1px solid var(--d-border);
}
.d-table-scroll thead th {
  font-size: 0.6875rem;
  color: var(--d-muted);
  font-weight: 500;
}
.d-table-scroll tbody th {
  color: var(--d-accent);
  font-weight: 500;
}
.d-table-scroll tr:last-child > td,
.d-table-scroll tr:last-child > th {
  border-bottom: 0;
}
.d-prescription-notes {
  padding: 16px 18px;
  background: #ffffff03;
  border-top: 1px solid var(--d-border);
  font-size: 0.8125rem;
  color: var(--d-muted);
}
.d-prescription-notes p {
  margin-top: 6px;
}
@media (max-width: 430px) {
  .d-prescription-heading {
    padding: 14px;
    gap: 12px;
  }
  .d-prescription-heading > img,
  .d-prescription-art {
    width: 60px;
    height: 60px;
  }
  .d-prescription-heading h3 {
    font-size: 0.875rem;
  }
}
</style>
