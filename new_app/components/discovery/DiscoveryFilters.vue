<script setup lang="ts">
import type { DiscoveryFilters, DiscoveryLocale, Manufacturer } from '~/types/discovery'
import { DISTANCE_OPTIONS, emptyDiscoveryFilters, toggleDiscoveryId } from '~/utils/discovery'
import { discoveryCopy } from '~/utils/discoveryCopy'
const filters = defineModel<DiscoveryFilters>({ required: true })
const props = defineProps<{ locale: DiscoveryLocale; hasLocation: boolean }>()
defineEmits<{ close: []; locate: [] }>()
const copy = computed(() => discoveryCopy(props.locale))
const brandSearch = shallowRef('')
const {
  data: brands,
  status,
  error,
  refresh,
} = useFetch<Manufacturer[]>('/api/explore/manufacturers', { key: 'discovery-manufacturers', server: false })
const visibleBrands = computed(() =>
  (brands.value ?? []).filter((brand) => brand.name.toLowerCase().includes(brandSearch.value.toLowerCase())),
)
function set<K extends keyof DiscoveryFilters>(key: K, value: DiscoveryFilters[K]) {
  filters.value = { ...filters.value, [key]: value }
}
function toggleBrand(id: string) {
  set('manufacturers', toggleDiscoveryId(filters.value.manufacturers, id))
}
</script>
<template>
  <DiscoveryDialog :title="copy.filters" :locale="locale" @close="$emit('close')">
    <div class="d-stack">
      <div class="d-between">
        <span class="d-muted d-small">{{ copy.filters }}</span>
        <button class="d-link" @click="filters = emptyDiscoveryFilters()">{{ copy.reset }}</button>
      </div>
      <fieldset class="d-filter-group">
        <legend>{{ copy.distance }}</legend>
        <div class="d-chips">
          <PillChip :active="filters.distance === null" @click="set('distance', null)">
            {{ copy.any }}
          </PillChip>
          <PillChip
            v-for="value in DISTANCE_OPTIONS"
            :key="value"
            :disabled="!hasLocation"
            :active="filters.distance === value"
            @click="set('distance', value)"
          >
            {{ value }} km
          </PillChip>
        </div>
        <button v-if="!hasLocation" class="d-link d-small" @click="$emit('locate')">
          <DiscoveryIcon name="locate" />
          {{ copy.locationHint }}
        </button>
      </fieldset>
      <fieldset class="d-filter-group">
        <legend>{{ copy.rating }}</legend>
        <div class="d-chips">
          <PillChip :active="filters.rating === null" @click="set('rating', null)">
            {{ copy.any }}
          </PillChip>
          <PillChip
            v-for="value in 5"
            :key="value"
            :active="filters.rating === value"
            @click="set('rating', value)"
          >
            {{ value }}{{ value < 5 ? '+' : '' }}
            <DiscoveryIcon name="star" :size="14" />
          </PillChip>
        </div>
      </fieldset>
      <button class="d-toggle" role="switch" :aria-checked="filters.open" @click="set('open', !filters.open)">
        <span>{{ copy.openNow }}</span>
        <span class="d-toggle-track" :class="{ 'is-on': filters.open }"><span /></span>
      </button>
      <fieldset class="d-filter-group">
        <legend>{{ copy.manufacturers }}</legend>
        <DiscoverySearch v-model="brandSearch" :placeholder="copy.brandSearch" :clear-label="copy.clear" />
        <div class="d-brand-options">
          <DiscoveryState v-if="error" :locale="locale" error @retry="refresh()" />
          <p v-else-if="status === 'pending'" role="status">{{ copy.loading }}</p>
          <div v-else class="d-chips">
            <PillChip
              v-for="brand in visibleBrands"
              :key="brand.id"
              :active="filters.manufacturers.includes(brand.id)"
              @click="toggleBrand(brand.id)"
            >
              {{ brand.name }}
            </PillChip>
            <span v-if="!visibleBrands.length" class="d-muted">{{ copy.noEquipmentMatch }}</span>
          </div>
        </div>
      </fieldset>
      <button
        class="d-toggle"
        role="switch"
        :aria-checked="filters.supported"
        @click="set('supported', !filters.supported)"
      >
        <span>{{ copy.supported }}</span>
        <span class="d-toggle-track" :class="{ 'is-on': filters.supported }"><span /></span>
      </button>
      <button class="d-button d-button--primary d-button--wide" @click="$emit('close')">
        {{ copy.apply }}
      </button>
    </div>
  </DiscoveryDialog>
</template>
<style scoped>
.d-filter-group {
  display: grid;
  gap: 12px;
  border: 0;
  margin: 0;
  padding: 0;
  min-width: 0;
}
.d-filter-group legend {
  font-weight: 600;
  padding: 0 0 12px;
}
.d-brand-options {
  max-height: 260px;
  overflow: auto;
  padding: 5px;
  margin-inline: -5px;
}
.d-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: inherit;
  border: 0;
  padding: 8px 0;
  background: none;
  min-height: 48px;
  font-weight: 600;
  text-align: left;
}
.d-toggle-track {
  display: flex;
  width: 48px;
  height: 28px;
  padding: 3px;
  background: var(--d-raised);
  border: 1px solid var(--d-border);
  border-radius: 20px;
  flex-shrink: 0;
}
.d-toggle-track span {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #f5f5f3;
  transition: transform 180ms;
}
.d-toggle-track.is-on {
  background: var(--d-accent);
}
.d-toggle-track.is-on span {
  transform: translateX(20px);
  background: #1a1a1a;
}
</style>
