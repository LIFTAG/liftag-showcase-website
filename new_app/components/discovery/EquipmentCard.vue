<script setup lang="ts">
import type { DiscoveryLocale, EquipmentItem } from '~/types/discovery'
import { gymMachineHref } from '~/utils/gymCatalog'
import { discoveryCount } from '~/utils/discoveryCopy'
const props = defineProps<{ item: EquipmentItem; gymId: string; locale: DiscoveryLocale }>()
const failed = shallowRef(false)
const multipleUnits = computed(() =>
  props.item.quantity !== null && props.item.quantity > 1 ? props.item.quantity : null,
)
</script>
<template>
  <NuxtLink :to="gymMachineHref(gymId, item.gymMachineId, locale)" class="d-equipment-card">
    <span class="d-equipment-art">
      <img
        v-if="item.photoUrl && !failed"
        :src="item.photoUrl"
        alt=""
        loading="lazy"
        @error="failed = true"
      />
      <span v-else class="d-equipment-placeholder"><DiscoveryIcon name="gym" :size="28" /></span>
      <span v-if="item.manufacturer" class="d-equipment-brand">{{ item.manufacturer.name }}</span>
      <span v-if="multipleUnits !== null" class="d-equipment-quantity" aria-hidden="true">
        ×{{ multipleUnits }}
      </span>
    </span>
    <span class="d-equipment-info">
      <strong>{{ item.name }}</strong>
      <span class="d-muted">
        <template v-if="item.exerciseCount !== null">
          {{ discoveryCount(item.exerciseCount, 'exercises', locale) }}
        </template>
        <template v-if="multipleUnits !== null">
          <span v-if="item.exerciseCount !== null" class="d-equipment-separator">·</span>
          {{ discoveryCount(multipleUnits, 'units', locale) }}
        </template>
      </span>
      <span v-if="item.matchedExerciseName" class="d-equipment-match">{{ item.matchedExerciseName }}</span>
    </span>
  </NuxtLink>
</template>
<style scoped>
.d-equipment-brand {
  position: absolute;
  bottom: 10px;
  left: 10px;
  max-width: calc(100% - 20px);
  padding: 5px 9px;
  border: 1px solid var(--d-border);
  border-radius: 8px;
  background: var(--d-bg);
  color: var(--d-text);
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1.4;
  overflow-wrap: anywhere;
}
.d-equipment-art {
  position: relative;
  display: block;
  flex-shrink: 0;
  aspect-ratio: 1;
  overflow: hidden;
}
.d-equipment-quantity {
  position: absolute;
  top: 10px;
  right: 10px;
  color: var(--d-text);
  background: var(--d-bg);
  border: 1px solid var(--d-border);
  border-radius: 8px;
  padding: 2px 6px;
  font-size: 12px;
  font-weight: 600;
}
.d-equipment-separator {
  margin-inline: 4px;
}
.d-equipment-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  border: 1px solid var(--d-border);
  border-radius: 16px;
  background: var(--d-panel);
  min-width: 0;
}
.d-equipment-card:hover {
  border-color: #748344;
}
.d-equipment-card img,
.d-equipment-placeholder {
  width: 100%;
  height: 100%;
  flex-shrink: 0;
  object-fit: contain;
  background: #252525;
  border-radius: 0;
}
.d-equipment-placeholder {
  display: grid;
  place-items: center;
  color: var(--d-muted);
}
.d-equipment-info {
  padding: 16px;
  display: grid;
  align-content: start;
  gap: 6px;
  flex: 1;
  min-width: 0;
  font-size: 0.75rem;
}
.d-equipment-info strong {
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1.3;
}
.d-equipment-card > svg,
.d-equipment-match {
  color: var(--d-accent);
}
.d-equipment-card > svg {
  flex-shrink: 0;
}
</style>
