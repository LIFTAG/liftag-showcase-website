<script setup lang="ts">
import type { DiscoveryLocale, ExploreGym } from '~/types/discovery'
import { discoveryCopy, discoveryWeekdays } from '~/utils/discoveryCopy'
import { weekdayIndex } from '~/utils/discoveryData'
const props = defineProps<{ gym: ExploreGym; locale: DiscoveryLocale }>()
const copy = computed(() => discoveryCopy(props.locale))
const weekdays = computed(() => discoveryWeekdays(props.locale))
const today = shallowRef(-1)
onMounted(() => {
  try {
    today.value =
      weekdayIndex(
        new Intl.DateTimeFormat('en', {
          weekday: 'long',
          timeZone: props.gym.timezone ?? undefined,
        }).format(new Date()),
      ) ?? -1
  } catch {
    /* No local-day emphasis for invalid legacy zones. */
  }
})
const rows = computed(() =>
  weekdays.value.map((label, day) => ({
    day,
    label,
    hours: props.gym.hours.find((h) => h.day === day),
  })),
)
</script>
<template>
  <details class="d-panel d-hours" open>
    <summary>
      <span>{{ copy.hours }}</span>
      <span v-if="gym.isOpen !== null" class="d-status" :class="{ 'd-status--closed': !gym.isOpen }">
        {{ gym.isOpen ? copy.openNow : copy.closed }}
      </span>
      <DiscoveryIcon name="arrow" :size="16" />
    </summary>
    <div v-if="gym.hours.length" class="d-hours-rows">
      <div v-for="row in rows" :key="row.day" :class="{ 'is-today': today === row.day }">
        <span>{{ row.label }}</span>
        <span>
          {{ row.hours?.open && row.hours?.close ? `${row.hours.open} – ${row.hours.close}` : copy.closed }}
        </span>
      </div>
    </div>
    <p v-else class="d-muted d-small">{{ copy.hoursUnknown }}</p>
  </details>
</template>
<style scoped>
.d-hours summary {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-weight: 600;
  list-style: none;
  min-height: 44px;
}
.d-hours summary::-webkit-details-marker {
  display: none;
}
.d-hours summary > svg {
  margin-left: auto;
  transform: rotate(90deg);
}
.d-hours[open] summary > svg {
  transform: rotate(-90deg);
}
.d-hours-rows {
  display: grid;
  gap: 8px;
  margin-top: 16px;
}
.d-hours-rows > div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 0.875rem;
  color: var(--d-muted);
  font-variant-numeric: tabular-nums;
}
.d-hours-rows > .is-today {
  color: var(--d-text);
  font-weight: 600;
}
</style>
