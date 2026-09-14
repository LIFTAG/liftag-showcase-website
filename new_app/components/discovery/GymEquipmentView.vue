<script setup lang="ts">
import EquipmentCard from '~/components/discovery/EquipmentCard.vue'
import type { EquipmentItem, GymDetail } from '~/types/discovery'
import { normalizedIds, toggleDiscoveryId } from '~/utils/discovery'
import { discoveryCount } from '~/utils/discoveryCopy'
import { muscleDisplayName } from '~/utils/catalogLocale'
/** Server caps: the equipment endpoint accepts 100 brands and 32 muscle groups. */
const MANUFACTURER_CAP = 100,
  CATEGORY_CAP = 32
const props = defineProps<{ id: string }>()
const route = useRoute()
const searchField = useTemplateRef<{ focus: () => void }>('searchField')
onMounted(() => {
  if (route.query.focus === '1') searchField.value?.focus()
})
/** The gym's timezone only arrives with the response, so the locale resolves after it. */
const { preference } = useSiteLocale()
const {
  data: detail,
  error: detailError,
  refresh,
} = await useDiscoveryResource<GymDetail>(() => `/api/explore/gyms/${props.id}`, preference)
const { locale, copy, href } = useDiscoveryLocale(() => detail.value?.gym.timezone)
const search = shallowRef(typeof route.query.q === 'string' ? route.query.q : ''),
  settled = shallowRef(search.value)
const manufacturers = ref(normalizedIds(route.query.manufacturers, MANUFACTURER_CAP)),
  categories = ref(normalizedIds(route.query.categories, CATEGORY_CAP))
watch(search, (value, _, cleanup) => {
  const timeout = setTimeout(() => {
    settled.value = value
  }, 300)
  cleanup(() => clearTimeout(timeout))
})
const query = computed(() => ({
  lang: locale.value,
  search: settled.value,
  manufacturers: manufacturers.value.join(','),
  categories: categories.value.join(','),
}))
const equipment = await useDiscoveryPage<EquipmentItem>(
  () => `/api/explore/gyms/${props.id}/equipment`,
  query,
)
const { data: muscleGroups } = useFetch<{ id: string; name: string; slug: string }[]>(
  '/api/explore/categories',
  { query: computed(() => ({ lang: locale.value })) },
)
const filtered = computed(
  () => manufacturers.value.length > 0 || categories.value.length > 0 || Boolean(search.value),
)
function clearFilters() {
  search.value = ''
  manufacturers.value = []
  categories.value = []
}
watch(
  () => [
    typeof route.query.q === 'string' ? route.query.q : '',
    normalizedIds(route.query.manufacturers, MANUFACTURER_CAP).join(','),
    normalizedIds(route.query.categories, CATEGORY_CAP).join(','),
  ] as const,
  ([q, brands, muscles], [previousQ, previousBrands, previousMuscles]) => {
    // Language-only navigation must not replace edits awaiting the URL write.
    if (q !== previousQ) search.value = q
    if (brands !== previousBrands) manufacturers.value = normalizedIds(brands, MANUFACTURER_CAP)
    if (muscles !== previousMuscles) categories.value = normalizedIds(muscles, CATEGORY_CAP)
  },
)
watch(
  () => JSON.stringify([search.value, manufacturers.value, categories.value, locale.value]),
  (_, __, cleanup) => {
    const timeout = setTimeout(
      () =>
        void navigateTo(
          {
            path: route.path,
            query: {
              lang: locale.value,
              ...(search.value ? { q: search.value } : {}),
              ...(manufacturers.value.length ? { manufacturers: manufacturers.value.join(',') } : {}),
              ...(categories.value.length ? { categories: categories.value.join(',') } : {}),
            },
          },
          { replace: true },
        ),
      100,
    )
    cleanup(() => clearTimeout(timeout))
  },
)
useDiscoverySeo({
  name: () => `${detail.value?.gym.name ?? ''} · ${copy.value.equipment}`,
  description: () => copy.value.searchEquipment,
  locale,
})
</script>
<template>
  <main id="discovery-content" class="d-wrap">
    <nav class="d-breadcrumb" :aria-label="copy.back">
      <NuxtLink :to="href(`/gyms/${id}`)">
        <DiscoveryIcon name="back" />
        {{ detail?.gym.name ?? copy.gym }}
      </NuxtLink>
    </nav>
    <DiscoveryState
      v-if="detailError"
      :locale="locale"
      error
      :unavailable="detailError.statusCode === 404"
      @retry="refresh()"
    />
    <template v-else>
      <header class="d-equipment-header">
        <div>
          <h1 class="d-title">{{ copy.equipment }}</h1>
          <p class="d-muted d-small">
            {{ detail?.gym.name }}
            <span v-if="equipment.total.value !== null">
              · {{ discoveryCount(equipment.total.value, 'machines', locale) }}
            </span>
          </p>
        </div>
        <button v-if="filtered" class="d-link" @click="clearFilters">
          {{ copy.clearFilters }}
        </button>
      </header>
      <div class="d-equipment-layout">
        <aside class="d-equipment-filters">
          <DiscoverySearch
            ref="searchField"
            v-model="search"
            :placeholder="copy.searchEquipment"
            :clear-label="copy.clear"
          />
          <details v-if="detail?.equipment?.manufacturers.length" open>
            <summary>{{ copy.manufacturers }}</summary>
            <div class="d-chips">
              <button
                v-for="brand in detail.equipment!.manufacturers"
                :key="brand.id"
                class="d-chip"
                :aria-pressed="manufacturers.includes(brand.id)"
                @click="manufacturers = toggleDiscoveryId(manufacturers, brand.id)"
              >
                {{ brand.name }}
              </button>
            </div>
          </details>
          <details v-if="muscleGroups?.length" open>
            <summary>{{ copy.muscles }}</summary>
            <div class="d-chips">
              <button
                v-for="group in muscleGroups"
                :key="group.id"
                class="d-chip"
                :aria-pressed="categories.includes(group.id)"
                @click="categories = toggleDiscoveryId(categories, group.id)"
              >
                {{ muscleDisplayName(group.slug, group.name, locale) }}
              </button>
            </div>
          </details>
        </aside>
        <section class="d-section" :aria-label="copy.equipment" :aria-busy="equipment.loading.value">
          <DiscoveryList :state="equipment" :locale="locale">
            <template #empty>
              <DiscoveryState
                :locale="locale"
                :title="filtered ? copy.noEquipmentMatch : copy.noEquipment"
              />
            </template>
            <template #default="{ items }">
              <div class="d-equipment-grid">
                <EquipmentCard
                  v-for="item in items"
                  :key="item.gymMachineId"
                  :item="item"
                  :gym-id="id"
                  :locale="locale"
                />
              </div>
            </template>
          </DiscoveryList>
        </section>
      </div>
    </template>
  </main>
</template>
<style scoped>
.d-equipment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 28px;
}
.d-equipment-header p {
  margin: 8px 0 0;
}
.d-equipment-layout {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 36px;
}
.d-equipment-filters {
  min-width: 0;
  display: grid;
  gap: 24px;
  align-self: start;
  position: sticky;
  top: calc(var(--liftag-nav-h, 80px) + 24px);
}
.d-equipment-filters summary {
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 12px;
}
.d-equipment-filters .d-chip {
  font-size: 0.75rem;
  padding: 6px 12px;
}
@media (max-width: 767px) {
  .d-equipment-layout {
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;
  }
  .d-equipment-filters {
    position: static;
    gap: 16px;
  }
  .d-equipment-filters details {
    min-width: 0;
  }
  .d-equipment-filters .d-chips {
    scrollbar-width: none;
    flex-wrap: nowrap;
    overflow-x: auto;
    padding: 4px;
  }
  .d-equipment-filters .d-chip {
    flex-shrink: 0;
  }
  .d-equipment-header {
    margin-bottom: 24px;
  }
}
</style>
