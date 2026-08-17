<script setup lang="ts">
import type { CatalogCategoryRef } from '~/types/catalog'

/**
 * Muscle chips with the app's treatment: primary muscle lime-tinted,
 * secondaries muted. Each chip filters the exercise library.
 */
defineProps<{
  primary?: CatalogCategoryRef | null
  secondary?: CatalogCategoryRef[]
}>()
</script>

<template>
  <ul class="muscle-chips" aria-label="Muscles worked">
    <li v-if="primary">
      <NuxtLink :to="`/exercises?muscle=${primary.slug}`" class="muscle-chip muscle-chip--primary">
        {{ primary.name }}
      </NuxtLink>
    </li>
    <li v-for="muscle in secondary ?? []" :key="muscle.slug">
      <NuxtLink :to="`/exercises?muscle=${muscle.slug}`" class="muscle-chip">
        {{ muscle.name }}
      </NuxtLink>
    </li>
  </ul>
</template>

<style scoped>
.muscle-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.muscle-chip {
  display: inline-flex;
  align-items: center;
  padding: 7px 14px;
  border: 1px solid var(--liftag-border);
  border-radius: 999px;
  background: var(--liftag-secondary);
  color: var(--liftag-fg-muted);
  font-family: var(--liftag-font-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-decoration: none;
  text-transform: uppercase;
  transition: border-color 200ms ease, color 200ms ease;
}

.muscle-chip:hover {
  border-color: rgba(255, 255, 255, 0.3);
  color: #fff;
}

.muscle-chip--primary {
  border-color: rgba(204, 255, 0, 0.4);
  background: var(--liftag-primary-dim);
  color: var(--liftag-primary);
}

.muscle-chip--primary:hover {
  border-color: var(--liftag-primary);
  color: var(--liftag-primary);
}
</style>
