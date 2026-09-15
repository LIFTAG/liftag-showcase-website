<script setup lang="ts">
import GymEquipmentPreview from '~/components/discovery/GymEquipmentPreview.vue'
import GymOpeningHours from '~/components/discovery/GymOpeningHours.vue'
import GymReviews from '~/components/discovery/GymReviews.vue'
import GymWorkouts from '~/components/discovery/GymWorkouts.vue'
import type { GymDetail } from '~/types/discovery'
import { distanceKm, googleDirections } from '~/utils/discovery'
import { discoveryCount, discoveryDistance, discoveryRating } from '~/utils/discoveryCopy'
const props = defineProps<{ id: string }>()
/** The gym's timezone only arrives with the response, so the locale resolves after it. */
const { preference } = useSiteLocale()
const { data, status, error, refresh } = await useDiscoveryResource<GymDetail>(
  () => `/api/explore/gyms/${props.id}`,
  preference,
)
const { locale, copy, href } = useDiscoveryLocale(() => data.value?.gym.timezone)
const gym = computed(() => data.value?.gym)
const { location } = useDiscoveryLocation()
const distance = computed(() =>
  location.value && gym.value ? discoveryDistance(distanceKm(location.value, gym.value), locale.value) : null,
)
const gate = shallowRef(false)
useDiscoverySeo({
  name: () => gym.value?.name ?? copy.value.gym,
  description: () => gym.value?.description ?? gym.value?.address ?? copy.value.intro,
  locale,
  photo: () => gym.value?.photo,
  kind: 'gym',
  details: () =>
    gym.value
      ? {
          ...(gym.value.address ? { address: gym.value.address } : {}),
          geo: { '@type': 'GeoCoordinates', latitude: gym.value.lat, longitude: gym.value.lng },
        }
      : {},
})
</script>
<template>
  <main id="discovery-content" class="d-wrap">
    <nav class="d-breadcrumb" :aria-label="copy.back">
      <NuxtLink :to="href('/explore')">
        <DiscoveryIcon name="back" />
        {{ copy.explore }}
      </NuxtLink>
      <span>/</span>
      <span>{{ copy.gym }}</span>
    </nav>
    <DiscoveryState
      v-if="error || !gym || !data"
      :locale="locale"
      :loading="status === 'pending'"
      :error="Boolean(error)"
      :unavailable="error?.statusCode === 404"
      @retry="refresh()"
    />
    <div v-else class="d-gym-layout">
      <header class="d-gym-heading">
        <div class="d-row">
          <span v-if="gym.supported" class="d-gym-supported">
            <DiscoveryIcon name="check" :size="14" />
            {{ copy.supported }}
          </span>
        </div>
        <h1 class="d-title">{{ gym.name }}</h1>
        <p v-if="gym.address" class="d-gym-address">
          <DiscoveryIcon name="pin" />
          {{ gym.address }}
        </p>
        <div class="d-row d-small">
          <span v-if="gym.rating !== null" class="d-stars">
            <DiscoveryIcon name="star" />
            {{ discoveryRating(gym.rating, locale) }}
            <span v-if="gym.reviewCount !== null" class="d-muted">
              ({{ discoveryCount(gym.reviewCount, 'reviews', locale) }})
            </span>
          </span>
          <PillChip v-if="distance" plain>{{ distance }} {{ copy.away }}</PillChip>
        </div>
        <div v-if="gym.temporarilyClosed" class="d-closure" role="status">
          <strong>{{ copy.closedTemporarily }}</strong>
          <p v-if="gym.closureReason">{{ gym.closureReason }}</p>
          <p v-if="gym.reopensAt">
            {{ copy.reopens }}:
            {{ new Date(gym.reopensAt).toLocaleDateString(locale, { timeZone: gym.timezone ?? 'UTC' }) }}
          </p>
        </div>
      </header>
      <div class="d-gym-gallery">
        <DiscoveryGallery :media="gym.media" :name="gym.name" :locale="locale" />
      </div>
      <aside class="d-gym-aside">
        <GymOpeningHours :gym="gym" :locale="locale" />
        <div class="d-gym-directions">
          <a
            :href="googleDirections(gym)"
            target="_blank"
            rel="noopener noreferrer"
            class="d-button d-button--primary d-button--wide"
          >
            <DiscoveryIcon name="directions" />
            {{ copy.directions }}
          </a>
          <NuxtLink :to="href('/explore', { gym: gym.id })" class="d-button d-button--wide d-show-map">
            <DiscoveryIcon name="map" />
            {{ copy.showOnMap }}
          </NuxtLink>
        </div>
        <!-- App teaser next to the primary actions. Generation builds on this gym's equipment in LIFTAG,
             so it shows for supported gyms and for any gym whose equipment is already set up. -->
        <template v-if="gym.supported || Boolean(data.equipment?.totalEntries)">
          <button class="d-ai-action" @click="gate = true">
            <DiscoveryIcon name="gym" :size="28" />
            <span>
              <strong>{{ copy.generate }}</strong>
              <span>{{ copy.generateHint }}</span>
            </span>
            <DiscoveryIcon name="arrow" />
          </button>
          <DiscoveryAppGate v-if="gate" kind="generate" :locale="locale" @close="gate = false" />
        </template>
      </aside>
      <div class="d-gym-content">
        <p v-if="gym.description" class="d-copy d-muted">{{ gym.description }}</p>
        <GymEquipmentPreview :detail="data" :locale="locale" @retry="refresh()" />
        <section v-if="data.trainers.length" class="d-section">
          <h2 class="d-subtitle">{{ copy.trainers }}</h2>
          <DiscoveryTrainerCard
            v-for="trainer in data.trainers"
            :key="trainer.id"
            :trainer="trainer"
            :locale="locale"
          />
        </section>
        <GymWorkouts :gym-id="gym.id" :locale="locale" />
        <GymReviews :gym-id="gym.id" :locale="locale" :count="gym.reviewCount" />
      </div>
    </div>
  </main>
</template>
<style scoped>
.d-gym-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 28px 40px;
}
.d-gym-heading {
  grid-column: 1/-1;
  display: grid;
  gap: 16px;
}
.d-gym-heading .d-row:empty {
  display: none;
}
.d-gym-address {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0;
  color: var(--d-muted);
  max-width: 72ch;
  font-size: 0.9375rem;
}
.d-gym-address svg {
  flex-shrink: 0;
  margin-top: 2px;
}
.d-gym-supported {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--d-accent);
  font-size: 0.75rem;
}
.d-gym-gallery {
  grid-column: 1;
  min-width: 0;
}
.d-gym-aside {
  grid-column: 2;
  grid-row: 2/4;
  align-self: start;
  position: sticky;
  top: calc(var(--liftag-nav-h, 80px) + 24px);
  display: grid;
  gap: 20px;
}
.d-gym-directions {
  display: grid;
  gap: 10px;
}
.d-gym-content {
  display: grid;
  gap: 36px;
  grid-column: 1;
  min-width: 0;
}
.d-closure {
  padding: 16px;
  border: 1px solid #62473c;
  border-radius: 14px;
  background: #2b201b;
  color: #edb6a1;
}
.d-closure p {
  margin: 6px 0 0;
  font-size: 0.875rem;
}
.d-ai-action {
  display: flex;
  align-items: center;
  gap: 16px;
  text-align: left;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid #4d5c27;
  background: #1c2211;
  color: var(--d-accent);
}
.d-ai-action > span {
  flex: 1;
  display: grid;
  gap: 6px;
}
.d-ai-action strong {
  font-size: 0.9375rem;
}
.d-ai-action > span > span {
  color: #b4bba6;
  font-size: 0.8125rem;
}
.d-ai-action > svg {
  flex-shrink: 0;
}
@media (max-width: 1023px) {
  .d-gym-layout {
    grid-template-columns: minmax(0, 1fr) 300px;
    gap: 24px;
  }
}
@media (max-width: 767px) {
  .d-gym-layout {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .d-gym-aside {
    position: static;
    align-self: stretch;
  }
  .d-gym-content {
    gap: 28px;
  }
  .d-gym-directions {
    position: fixed;
    inset: auto 0 0;
    padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px));
    background: var(--d-bg);
    border-top: 1px solid var(--d-border);
    z-index: 10;
  }
  .d-gym-directions > a {
    min-height: 52px;
  }
  .d-show-map {
    display: none;
  }
  .d-gym-address {
    font-size: 0.875rem;
  }
  .d-gym-heading {
    gap: 12px;
  }
}
</style>
