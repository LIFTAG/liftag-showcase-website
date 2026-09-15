<script lang="ts">
import type { DiscoveryLocale, ExploreGym, GymDetail } from '~/types/discovery'

type GymHoursSource = Pick<ExploreGym, 'hours' | 'timezone' | 'temporarilyClosed'>
/** Shared by every card: each gym's full record is requested at most once per page. */
const hoursCache = new Map<string, Promise<GymHoursSource | null>>()

/**
 * Map rows (`/v1/gyms/map`) carry no opening hours or timezone, so a selected
 * card borrows them from the gym's full record. A failure only drops the time.
 */
function loadGymHours(id: string, locale: DiscoveryLocale): Promise<GymHoursSource | null> {
  let pending = hoursCache.get(id)
  if (!pending) {
    pending = $fetch<GymDetail>(`/api/explore/gyms/${id}`, { query: { lang: locale }, retry: 0 })
      .then(({ gym }) => ({ hours: gym.hours, timezone: gym.timezone, temporarilyClosed: gym.temporarilyClosed }))
      .catch(() => {
        hoursCache.delete(id)
        return null
      })
    hoursCache.set(id, pending)
  }
  return pending
}
</script>
<script setup lang="ts">
import type { Coordinate } from '~/types/discovery'
import { distanceKm, googleDirections } from '~/utils/discovery'
import { discoveryCopy, discoveryDistance, discoveryRating } from '~/utils/discoveryCopy'
import { gymTodayStatus } from '~/utils/gymHours'
const props = defineProps<{
  gym: ExploreGym
  locale: DiscoveryLocale
  selected: boolean
  location: Coordinate | null
  detailHref: string
}>()
defineEmits<{ activate: [gym: ExploreGym] }>()
const copy = computed(() => discoveryCopy(props.locale))
const distance = computed(() =>
  props.location ? discoveryDistance(distanceKm(props.location, props.gym), props.locale) : null,
)
const photoFailed = shallowRef(false)
const banner = computed(() => props.selected && Boolean(props.gym.photo) && !photoFailed.value)
/**
 * Client clock only, so the server and the first client render agree. It is
 * re-read on every selection, which is when the time is shown.
 */
const now = shallowRef<Date | null>(null)
onMounted(() => {
  now.value = new Date()
})
watch(
  () => props.selected,
  (selected) => {
    if (selected) now.value = new Date()
  },
)
const fetchedHours = shallowRef<GymHoursSource | null>(null)
watch(
  () => [props.selected, props.gym.id] as const,
  ([selected, id]) => {
    if (!import.meta.client || !selected || props.gym.hours.length || fetchedHours.value) return
    void loadGymHours(id, props.locale).then((value) => {
      if (props.gym.id === id) fetchedHours.value = value
    })
  },
  { immediate: true },
)
/** The selected card spells out today's time in place of the plain open/closed label. */
const status = computed(() => {
  // `isOpen` always comes from the live row; fetched data only fills in hours for map rows.
  const gym = props.gym.hours.length || !fetchedHours.value ? props.gym : { ...props.gym, ...fetchedHours.value }
  if (props.selected && gym.temporarilyClosed) return { text: copy.value.closedTemporarily, open: false }
  if (gym.isOpen === null) return null
  const today = props.selected && now.value ? gymTodayStatus(gym, now.value) : null
  if (today?.kind === 'openUntil') return { text: `${copy.value.openUntil} ${today.time}`, open: true }
  if (today?.kind === 'opensAt')
    return { text: `${copy.value.closed} · ${copy.value.opensAt} ${today.time}`, open: false }
  return { text: gym.isOpen ? copy.value.openNow : copy.value.closed, open: gym.isOpen }
})
</script>
<template>
  <article class="d-gym-card" :class="{ 'is-selected': selected, 'has-banner': banner }" :data-gym-id="gym.id">
    <img v-if="banner" :src="gym.photo!" alt="" class="d-gym-banner" loading="lazy" @error="photoFailed = true" />
    <button
      type="button"
      class="d-gym-main"
      :aria-label="`${selected ? copy.viewGym : copy.showOnMap}: ${gym.name}`"
      :aria-current="selected ? 'true' : undefined"
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
            <span v-if="status" class="d-gym-open" :class="{ 'is-closed': !status.open }">
              {{ status.text }}
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
    <div v-if="selected" class="d-gym-actions">
      <a :href="googleDirections(gym)" target="_blank" rel="noopener noreferrer" class="d-button">
        <DiscoveryIcon name="directions" :size="17" />
        {{ copy.directions }}
      </a>
      <NuxtLink :to="detailHref" class="d-button d-button--primary">
        {{ copy.viewDetail }}
        <DiscoveryIcon name="arrow" :size="15" />
      </NuxtLink>
    </div>
  </article>
</template>
<style scoped>
.d-gym-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  color: var(--d-text);
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
.d-gym-main {
  display: flex;
  align-items: stretch;
  width: 100%;
  min-width: 0;
  padding: 0;
  color: inherit;
  text-align: left;
  background: none;
  border: 0;
  border-radius: 20px;
}
/* Phones keep the thumbnail so the expanded card covers as little map as possible. */
.d-gym-banner {
  display: none;
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
.d-gym-card.is-selected .d-gym-select {
  padding-bottom: 12px;
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
.d-gym-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 0 16px 16px;
  animation: d-gym-expand 200ms ease-out both;
}
.d-gym-actions .d-button {
  min-width: 0;
  min-height: 40px;
  padding: 8px 10px;
  gap: 6px;
  font-size: 0.8125rem;
  white-space: nowrap;
}
@keyframes d-gym-expand {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
}
@media (min-width: 1024px) {
  /* Inset by the border so the lime selection frame stays visible around the photo. */
  .d-gym-banner {
    display: block;
    width: calc(100% - 2px);
    margin: 1px 1px 0;
    aspect-ratio: 16 / 9;
    max-height: 180px;
    object-fit: cover;
    border-radius: 18px 18px 0 0;
  }
  .d-gym-card.has-banner .d-gym-select > img {
    display: none;
  }
}
/* Opaque equivalent of a 5% accent tint over --d-panel: the card floats over the map, so it must never be see-through. */
@media (hover: hover) {
  .d-gym-card:hover {
    background: #222519;
  }
}
@media (prefers-reduced-motion: reduce) {
  .d-gym-actions {
    animation: none;
  }
}
</style>
