<script setup lang="ts">
import type { DiscoveryLocale, PublicRoutine } from '~/types/discovery'
import { discoveryHref } from '~/utils/discovery'
import { discoveryCopy, discoveryLabel } from '~/utils/discoveryCopy'
const props = defineProps<{ routine: PublicRoutine; locale: DiscoveryLocale }>()
const copy = computed(() => discoveryCopy(props.locale))
</script>
<template>
  <NuxtLink class="d-routine-card" :to="discoveryHref(`/explore/routines/${routine.id}`, locale)">
    <div class="d-routine-art">
      <img v-if="routine.image" :src="routine.image" alt="" loading="lazy" />
      <DiscoveryIcon v-else name="gym" :size="40" />
    </div>
    <div class="d-routine-summary">
      <span class="d-routine-eyebrow">{{ copy.publicWorkout }}</span>
      <h3>{{ routine.name }}</h3>
      <p v-if="routine.author" class="d-muted">{{ routine.author }}</p>
      <div class="d-row d-small d-muted">
        <span v-if="routine.duration !== null">{{ routine.duration }} {{ copy.minutes }}</span>
        <span v-if="routine.difficulty">{{ discoveryLabel(routine.difficulty, locale) }}</span>
        <span v-if="routine.rating !== null && routine.ratingCount" class="d-stars">
          <DiscoveryIcon name="star" :size="14" />
          {{ routine.rating.toFixed(1) }}
        </span>
      </div>
    </div>
    <DiscoveryIcon name="arrow" :size="18" />
  </NuxtLink>
</template>
<style scoped>
.d-routine-card {
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid var(--d-border);
  border-radius: 16px;
  overflow: hidden;
  padding: 12px;
  background: var(--d-panel);
}
.d-routine-card:hover {
  border-color: #748344;
}
.d-routine-art {
  display: grid;
  place-items: center;
  flex: 0 0 84px;
  height: 104px;
  color: #87945e;
  background: #262b20;
  border-radius: 12px;
  overflow: hidden;
}
.d-routine-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.d-routine-summary {
  flex: 1;
  min-width: 0;
}
.d-routine-summary h3 {
  margin: 4px 0;
  font: 600 1rem/1.3 var(--liftag-font-headline);
}
.d-routine-summary p {
  margin: 4px 0;
  font-size: 0.75rem;
}
.d-routine-eyebrow {
  color: var(--d-accent);
  font-size: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 0.09em;
}
.d-routine-card > svg {
  color: var(--d-accent);
  flex-shrink: 0;
}
</style>
