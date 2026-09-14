<script setup lang="ts">
import type { DiscoveryLocale, PublicTrainer } from '~/types/discovery'
import { discoveryHref } from '~/utils/discovery'
import { discoveryLabel } from '~/utils/discoveryCopy'
defineProps<{ trainer: PublicTrainer; locale: DiscoveryLocale }>()
</script>
<template>
  <NuxtLink :to="discoveryHref(`/explore/trainers/${trainer.id}`, locale)" class="d-trainer-card">
    <img v-if="trainer.avatar" :src="trainer.avatar" alt="" loading="lazy" />
    <span v-else class="d-trainer-avatar">{{ trainer.name.slice(0, 1) }}</span>
    <span class="d-trainer-info">
      <strong>
        {{ trainer.name }}
        <DiscoveryIcon name="check" :size="15" />
      </strong>
      <span class="d-muted d-small">
        {{ trainer.specializations.map((s) => discoveryLabel(s, locale)).join(' · ') }}
      </span>
    </span>
    <DiscoveryIcon name="arrow" />
  </NuxtLink>
</template>
<style scoped>
.d-trainer-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--d-border);
  border-radius: 16px;
  background: var(--d-panel);
}
.d-trainer-card:hover {
  border-color: #748344;
}
.d-trainer-card img,
.d-trainer-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.d-trainer-avatar {
  display: grid;
  place-items: center;
  background: #303822;
  color: var(--d-accent);
  font-weight: 600;
}
.d-trainer-info {
  display: grid;
  gap: 6px;
  min-width: 0;
  flex: 1;
}
.d-trainer-info strong {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9375rem;
}
.d-trainer-card svg {
  flex-shrink: 0;
  color: var(--d-accent);
}
</style>
