<script setup lang="ts">
import type { Coordinate, DiscoveryLocale, ExploreGym } from '~/types/discovery'
import { distanceKm } from '~/utils/discovery'
import { discoveryCopy, discoveryDistance, discoveryRating } from '~/utils/discoveryCopy'
const props = defineProps<{
  gym: ExploreGym
  locale: DiscoveryLocale
  selected: boolean
  location: Coordinate | null
}>()
defineEmits<{ activate: [gym: ExploreGym] }>()
const copy = computed(() => discoveryCopy(props.locale))
const distance = computed(() =>
  props.location ? discoveryDistance(distanceKm(props.location, props.gym), props.locale) : null,
)
const photoFailed = shallowRef(false)
</script>
<template>
  <button
    type="button"
    :aria-label="`${selected ? copy.viewGym : copy.showOnMap}: ${gym.name}`"
    :aria-current="selected ? 'true' : undefined"
    class="d-gym-card"
    :class="{ 'is-selected': selected }"
    :data-gym-id="gym.id"
    @click="$emit('activate', gym)"
  >
    <span class="d-gym-select">
      <img
        v-if="gym.photo && !photoFailed"
        :src="gym.photo"
        alt=""
        loading="lazy"
        @error="photoFailed = true"
      />
      <span v-else class="d-gym-placeholder"><DiscoveryIcon name="gym" :size="30" /></span>
      <span class="d-gym-info">
        <span class="d-gym-name">{{ gym.name }}</span>
        <span class="d-gym-meta">
          <span v-if="gym.rating !== null" class="d-stars">
            <DiscoveryIcon name="star" :size="15" />
            {{ discoveryRating(gym.rating, locale) }}
            <span v-if="gym.reviewCount !== null" class="d-muted">({{ gym.reviewCount }})</span>
          </span>
          <span v-if="gym.isOpen !== null" class="d-gym-open" :class="{ 'is-closed': !gym.isOpen }">
            {{ gym.isOpen ? copy.openNow : copy.closed }}
          </span>
        </span>
        <span v-if="distance" class="d-gym-distance">
          <DiscoveryIcon name="pin" :size="13" />
          {{ distance }} {{ copy.away }}
        </span>
        <span v-else-if="gym.supported" class="d-gym-distance">{{ copy.supported }}</span>
      </span>
    </span>
    <span class="d-gym-detail" aria-hidden="true">
      <DiscoveryIcon :name="selected ? 'arrow' : 'pin'" />
    </span>
  </button>
</template>
<style scoped>
.d-gym-card {
  display: flex;
  align-items: stretch;
  width: 100%;
  padding: 0;
  color: var(--d-text);
  text-align: left;
  background: var(--d-panel);
  border: 1px solid var(--d-border);
  border-radius: 20px;
  min-width: 0;
  transition:
    border-color 180ms,
    background 180ms;
}
.d-gym-card.is-selected {
  border-color: var(--d-accent);
  box-shadow: inset 0 0 0 1px var(--d-accent);
}
.d-gym-select {
  display: flex;
  gap: 12px;
  flex: 1;
  min-width: 0;
  padding: 16px 0 16px 16px;
  color: inherit;
  background: none;
  border: 0;
  text-align: left;
  border-radius: 20px;
}
.d-gym-select img,
.d-gym-placeholder {
  flex-shrink: 0;
  width: 76px;
  height: 76px;
  border-radius: 12px;
  object-fit: cover;
}
.d-gym-placeholder {
  display: grid;
  place-items: center;
  color: #79845c;
  background: #292d22;
}
.d-gym-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  min-width: 0;
}
.d-gym-name {
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.d-gym-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 0.8125rem;
}
.d-gym-distance {
  display: flex;
  gap: 3px;
  align-items: center;
  font-size: 0.75rem;
  color: var(--d-muted);
}
.d-gym-open {
  font-size: 0.6875rem;
  color: #67d48d;
}
.d-gym-open.is-closed {
  color: var(--d-muted);
}
.d-gym-detail {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  min-width: 44px;
  color: var(--d-accent);
  border-radius: 0 20px 20px 0;
}
.d-gym-card:hover {
  background: #ccff000c;
}
</style>
