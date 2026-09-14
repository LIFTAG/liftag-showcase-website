<script setup lang="ts">
import type { ExploreGym } from '~/types/discovery'
import { activeDiscoveryFilters, discoveryHref } from '~/utils/discovery'
const timezone = shallowRef<string | null | undefined>(undefined)
const { locale, preference, copy } = useDiscoveryLocale(timezone)
const {
  search,
  settledSearch,
  filters,
  viewport,
  selectedId,
  scroll,
  location,
  locating,
  denied,
  contextTimezone,
  camera,
  visible,
  loading,
  error,
  meta,
  hasMore,
  select,
  updateViewport,
  findLocation,
  retry,
  loadMore,
  reset,
} = useExplore(locale)
watch(contextTimezone, (value) => {
  timezone.value = value
})
const filtersOpen = shallowRef(false)
const filterCount = computed(() => activeDiscoveryFilters(filters.value))
const results = useTemplateRef<HTMLElement>('results')
const viewportHeight = shallowRef<number>()
function resizeViewport() {
  viewportHeight.value = window.visualViewport?.height
}
onMounted(() => {
  resizeViewport()
  window.visualViewport?.addEventListener('resize', resizeViewport)
})
onBeforeUnmount(() => window.visualViewport?.removeEventListener('resize', resizeViewport))
let scrollRestored = false
let selectionToReveal: string | null = null
async function restoreScroll() {
  await nextTick()
  if (!scrollRestored && results.value && visible.value.length) {
    results.value.scrollTop = scroll.value
    results.value.scrollLeft = scroll.value
    scrollRestored = true
  }
}
onMounted(restoreScroll)
async function revealSelection() {
  await nextTick()
  const card = selectionToReveal
    ? results.value?.querySelector<HTMLElement>(`[data-gym-id="${selectionToReveal}"]`)
    : null
  if (card) {
    card.scrollIntoView({
      block: 'nearest',
      inline: 'center',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    })
    selectionToReveal = null
  }
}
watch(
  () => visible.value,
  () => {
    void restoreScroll()
    void revealSelection()
  },
)
watch(selectedId, (value) => {
  selectionToReveal = value
  void revealSelection()
})
function saveScroll() {
  if (results.value)
    scroll.value = window.innerWidth >= 1024 ? results.value.scrollTop : results.value.scrollLeft
}
function activateGym(gym: ExploreGym) {
  if (selectedId.value === gym.id) void navigateTo(gymHref(gym.id))
  else select(gym)
}
function gymHref(id: string) {
  return preference.value ? discoveryHref(`/gyms/${id}`, preference.value) : `/gyms/${id}`
}
useDiscoverySeo(
  () => copy.value.explore,
  () => copy.value.intro,
  locale,
)
</script>
<template>
  <main
    id="discovery-content"
    class="d-explore"
    :style="viewportHeight ? { '--d-viewport-height': `${viewportHeight}px` } : undefined"
  >
    <section class="d-explore-map" :aria-label="copy.map">
      <ClientOnly>
        <DiscoveryMap
          :gyms="visible"
          :selected-id="selectedId"
          :viewport="viewport"
          :camera="camera"
          :locale="locale"
          :location="location"
          @viewport="updateViewport"
          @select="activateGym"
        />
        <template #fallback><div class="d-map-placeholder" /></template>
      </ClientOnly>
      <button
        class="d-locate"
        :aria-label="locating ? copy.locating : copy.locate"
        :disabled="locating"
        @click="findLocation"
      >
        <DiscoveryIcon name="locate" :size="24" />
      </button>
    </section>
    <aside class="d-explore-sidebar" :aria-label="copy.list">
      <div class="d-explore-tools">
        <div class="d-explore-title">
          <h1 class="d-title">{{ copy.explore }}</h1>
          <p class="d-muted d-small">{{ copy.intro }}</p>
        </div>
        <DiscoverySearch
          v-model="search"
          :placeholder="copy.searchShort"
          :label="copy.search"
          :clear-label="copy.clear"
        >
          <button
            class="d-filter-trigger d-icon-button"
            :aria-label="`${copy.filters}${filterCount ? ` (${filterCount})` : ''}`"
            @click="filtersOpen = true"
          >
            <DiscoveryIcon name="filter" />
            <span v-if="filterCount" class="d-filter-count">{{ filterCount }}</span>
          </button>
        </DiscoverySearch>
        <p v-if="settledSearch.trim()" class="d-search-note">{{ copy.globalSearch }}</p>
        <div v-else-if="filterCount" class="d-active-filters">
          <button v-if="filters.distance !== null" class="d-chip is-active" @click="filters.distance = null">
            {{ filters.distance }} km
            <DiscoveryIcon name="close" :size="13" />
          </button>
          <button v-if="filters.rating !== null" class="d-chip is-active" @click="filters.rating = null">
            {{ filters.rating }}{{ filters.rating < 5 ? '+' : '' }}
            <DiscoveryIcon name="star" :size="13" />
            <DiscoveryIcon name="close" :size="13" />
          </button>
          <button v-if="filters.open" class="d-chip is-active" @click="filters.open = false">
            {{ copy.openNow }}
            <DiscoveryIcon name="close" :size="13" />
          </button>
          <button v-if="filters.supported" class="d-chip is-active" @click="filters.supported = false">
            LIFTAG
            <DiscoveryIcon name="close" :size="13" />
          </button>
          <button
            v-if="filters.manufacturers.length"
            class="d-chip is-active"
            @click="filters.manufacturers = []"
          >
            {{ copy.brands }} ({{ filters.manufacturers.length }})
            <DiscoveryIcon name="close" :size="13" />
          </button>
        </div>
        <p v-if="denied" class="d-search-note" role="status">{{ copy.locationDenied }}</p>
        <div class="d-results-count">
          <span>
            {{ copy.results }}
            <span class="d-muted">{{ visible.length }}</span>
          </span>
          <span v-if="loading" class="d-muted" role="status">{{ copy.loading }}</span>
        </div>
      </div>
      <div ref="results" class="d-explore-results" :aria-busy="loading" @scroll.passive="saveScroll">
        <DiscoveryState v-if="error" :locale="locale" error @retry="retry" />
        <DiscoveryState v-else-if="loading && !visible.length" :locale="locale" loading />
        <template v-else-if="visible.length">
          <DiscoveryGymCard
            v-for="gym in visible"
            :key="gym.id"
            :gym="gym"
            :locale="locale"
            :selected="selectedId === gym.id"
            :location="location"
            @activate="activateGym"
          />
        </template>
        <div v-else class="d-no-gyms">
          <DiscoveryState :locale="locale" :hint="copy.noGymsHint" />
          <button v-if="filterCount" class="d-link" @click="reset">
            {{ copy.clearFilters }}
          </button>
        </div>
        <div v-if="hasMore" class="d-pagination">
          <button class="d-button" :disabled="loading" @click="loadMore">{{ copy.more }}</button>
        </div>
        <p v-if="meta.truncated || meta.tooLarge" class="d-map-notice" role="status">{{ copy.zoomIn }}</p>
      </div>
    </aside>
    <DiscoveryFilters
      v-if="filtersOpen"
      v-model="filters"
      :locale="locale"
      :has-location="Boolean(location)"
      @close="filtersOpen = false"
      @locate="findLocation"
    />
  </main>
</template>
<style scoped>
.d-explore {
  height: calc(100dvh - var(--d-header));
  min-height: 400px;
  display: grid;
  grid-template-columns: 400px 1fr;
  position: relative;
  overflow: hidden;
}
.d-explore-map {
  grid-column: 2;
  grid-row: 1;
  position: relative;
  min-width: 0;
}
.d-explore-sidebar {
  grid-column: 1;
  grid-row: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-right: 1px solid var(--d-border);
  z-index: 2;
  background: var(--d-bg);
}
.d-explore-tools {
  padding: 28px 20px 0;
}
.d-explore-title {
  margin-bottom: 24px;
}
.d-explore-title .d-title {
  font-size: 1.625rem;
}
.d-explore-title p {
  margin: 8px 0 0;
}
.d-filter-trigger {
  position: relative;
}
.d-filter-count {
  position: absolute;
  top: 0;
  right: 0;
  width: 16px;
  height: 16px;
  display: grid;
  place-items: center;
  background: var(--d-accent);
  color: #141800;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 700;
}
.d-results-count {
  display: flex;
  justify-content: space-between;
  font-size: 0.8125rem;
  padding: 24px 0 14px;
}
.d-explore-results {
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px 20px 24px;
}
.d-active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding-top: 12px;
}
.d-active-filters .d-chip {
  padding: 6px 10px;
  min-height: 36px;
  font-size: 0.75rem;
}
.d-search-note,
.d-map-notice {
  font-size: 0.75rem;
  line-height: 1.5;
  color: var(--d-muted);
  margin: 10px 0 0;
}
.d-no-gyms {
  display: grid;
  justify-items: center;
}
.d-no-gyms .d-empty {
  padding-inline: 0;
}
.d-locate {
  position: absolute;
  right: 16px;
  bottom: 124px;
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 1px solid var(--d-border);
  color: var(--d-text);
  background: var(--d-panel);
  box-shadow: 0 4px 16px #0004;
  z-index: 1;
}
.d-map-placeholder {
  position: absolute;
  inset: 0;
  background: #202526;
}
@media (max-width: 1023px) {
  .d-explore {
    display: block;
    height: calc(var(--d-viewport-height, 100dvh) - var(--d-header));
    min-height: 240px;
  }
  .d-explore-map {
    position: absolute;
    inset: 0;
  }
  .d-explore-sidebar {
    position: absolute;
    inset: 0;
    background: none;
    border: 0;
    pointer-events: none;
  }
  .d-explore-tools {
    padding: 16px;
    pointer-events: auto;
  }
  .d-explore-title,
  .d-results-count {
    display: none;
  }
  .d-explore-tools :deep(.d-search) {
    box-shadow: 0 4px 16px #0003;
    border: 0;
    padding-block: 6px;
  }
  .d-active-filters {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 5px;
  }
  .d-active-filters .d-chip {
    flex-shrink: 0;
  }
  .d-search-note {
    display: table;
    background: var(--d-panel);
    border-radius: 10px;
    padding: 8px 12px;
    max-width: 45ch;
  }
  .d-explore-results {
    margin-top: auto;
    flex-direction: row;
    align-items: stretch;
    gap: 12px;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 6px 16px calc(28px + env(safe-area-inset-bottom, 0px));
    pointer-events: auto;
    scroll-snap-type: x proximity;
  }
  .d-explore-results > :deep(.d-gym-card) {
    flex: 0 0 310px;
    scroll-snap-align: center;
  }
  .d-explore-results > :deep(.d-stack) {
    display: flex;
    gap: 12px;
  }
  .d-explore-results :deep(.d-skeleton) {
    width: 310px;
    min-height: 112px;
  }
  .d-explore-results > :deep(.d-empty),
  .d-no-gyms {
    background: var(--d-panel);
    border-radius: 18px;
    width: min(100%, 420px);
    min-width: 280px;
    margin-inline: auto;
  }
  .d-explore-results :deep(.d-empty) {
    padding: 16px;
    min-height: 120px;
    gap: 6px;
  }
  .d-explore-results :deep(.d-empty > svg) {
    display: none;
  }
  .d-explore-results :deep(.d-empty .d-subtitle) {
    font-size: 1rem;
  }
  .d-locate {
    bottom: calc(172px + env(safe-area-inset-bottom, 0px));
  }
  .d-map-notice {
    width: 180px;
    flex-shrink: 0;
    border-radius: 16px;
    background: var(--d-panel);
    padding: 16px;
    margin: 0;
  }
}
</style>
