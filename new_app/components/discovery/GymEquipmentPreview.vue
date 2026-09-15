<script setup lang="ts">
import EquipmentCard from '~/components/discovery/EquipmentCard.vue'
import type { DiscoveryLocale, GymDetail } from '~/types/discovery'
import { discoveryHref } from '~/utils/discovery'
import { discoveryCopy, discoveryCount } from '~/utils/discoveryCopy'
const props = defineProps<{ detail: GymDetail; locale: DiscoveryLocale }>()
defineEmits<{ retry: [] }>()
const copy = computed(() => discoveryCopy(props.locale))
</script>
<template>
  <section class="d-section">
    <div class="d-equipment-heading">
      <h2 class="d-subtitle">{{ copy.equipment }}</h2>
      <strong v-if="detail.gym.equipmentCount !== null" class="d-equipment-total">
        {{ discoveryCount(detail.gym.equipmentCount, 'units', locale) }}
      </strong>
    </div>
    <DiscoveryState v-if="!detail.equipment" :locale="locale" error @retry="$emit('retry')" />
    <template v-else>
      <div v-if="detail.equipment.manufacturers.length" class="d-chips">
        <PillChip
          v-for="brand in detail.equipment.manufacturers"
          :key="brand.id"
          :to="discoveryHref(`/gyms/${detail.gym.id}/equipment`, locale, { manufacturers: brand.id })"
        >
          {{ brand.name }}
        </PillChip>
      </div>
      <template v-if="detail.equipment.totalEntries">
        <NuxtLink
          :to="discoveryHref(`/gyms/${detail.gym.id}/equipment`, locale, { focus: '1' })"
          class="d-equipment-search"
        >
          <DiscoveryIcon name="search" />
          {{ copy.searchEquipment }}
        </NuxtLink>
        <div class="d-equipment-grid">
          <EquipmentCard
            v-for="item in detail.equipment.preview"
            :key="item.gymMachineId"
            :item="item"
            :gym-id="detail.gym.id"
            :locale="locale"
          />
        </div>
        <NuxtLink :to="discoveryHref(`/gyms/${detail.gym.id}/equipment`, locale)" class="d-button">
          {{ copy.viewAllEquipment }}
          <DiscoveryIcon name="arrow" :size="16" />
        </NuxtLink>
      </template>
      <p v-else class="d-muted d-small">{{ copy.noEquipment }}</p>
    </template>
  </section>
</template>
<style scoped>
.d-equipment-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px 20px;
}
.d-equipment-total {
  color: var(--d-text);
  font-size: 2rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.035em;
  line-height: 1.2;
}
.d-equipment-search {
  display: flex;
  gap: 10px;
  align-items: center;
  border: 1px solid var(--d-border);
  border-radius: 14px;
  padding: 14px 16px;
  color: var(--d-muted);
  font-size: 0.875rem;
}
/* Match the two-column equipment grid breakpoint in discovery.css. */
@media (max-width: 1100px) {
  .d-equipment-grid > :nth-child(n + 3) {
    display: none;
  }
}
@media (max-width: 767px) {
  .d-equipment-total {
    font-size: 1.75rem;
  }
}
</style>
