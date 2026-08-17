<script setup lang="ts">
import type { CatalogIndexExercise } from '~/types/catalog'

const description = 'Browse the LIFTAG exercise library: gym exercises by muscle group and machine, with setup photos, instruction videos, and the muscles each lift works.'

useLiftagSeo({
  title: 'Exercise Library | Gym Exercises by Muscle & Machine | LIFTAG',
  description,
  path: '/exercises',
})

const route = useRoute()
const router = useRouter()

const { data: index, error, refresh } = await useCatalogIndex()

const query = ref(typeof route.query.q === 'string' ? route.query.q : '')
const muscle = ref(typeof route.query.muscle === 'string' ? route.query.muscle : '')

const PAGE_SIZE = 48
const visibleCount = ref(PAGE_SIZE)

const categories = computed(() => index.value?.categories ?? [])
const categoryNames = computed(() => {
  const names = new Map<string, string>()
  for (const category of categories.value) names.set(category.slug, category.name)
  return names
})

const categoryCounts = computed(() => {
  const counts = new Map<string, number>()
  for (const exercise of index.value?.exercises ?? []) {
    for (const slug of new Set([exercise.primaryCategory, ...exercise.categories])) {
      if (!slug) continue
      counts.set(slug, (counts.get(slug) ?? 0) + 1)
    }
  }
  return counts
})

const filtered = computed<CatalogIndexExercise[]>(() => {
  let rows = index.value?.exercises ?? []
  if (muscle.value) {
    rows = rows.filter(exercise =>
      exercise.primaryCategory === muscle.value || exercise.categories.includes(muscle.value))
  }
  const tokens = normalizeCatalogQuery(query.value).split(/\s+/).filter(Boolean)
  if (tokens.length > 0) {
    rows = rows.filter((exercise) => {
      const haystack = `${normalizeCatalogQuery(exercise.name)} ${exercise.aliases ?? ''}`
      return tokens.every(token => haystack.includes(token))
    })
  }
  return rows
})

const visible = computed(() => filtered.value.slice(0, visibleCount.value))

// Keep filters shareable without spamming history.
watch([query, muscle], ([q, m]) => {
  visibleCount.value = PAGE_SIZE
  router.replace({
    query: {
      ...(q ? { q } : {}),
      ...(m ? { muscle: m } : {}),
    },
  })
})

function toggleMuscle(slug: string) {
  muscle.value = muscle.value === slug ? '' : slug
}

// Exercise photos come from the catalog CDN; open the connection before the
// first tile image is requested.
const cdnOrigin = computed(() => {
  const first = index.value?.exercises.find(exercise => exercise.imageUrl)?.imageUrl
  try {
    return first ? new URL(first).origin : null
  }
  catch {
    return null
  }
})

useHead(() => ({
  link: cdnOrigin.value
    ? [{ rel: 'preconnect', href: cdnOrigin.value, crossorigin: 'anonymous' as const }]
    : [],
}))

useLiftagStructuredData([
  liftagOrganization,
  liftagMobileApplication,
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: '/' },
    { name: 'Exercise Library', path: '/exercises' },
  ]),
  {
    '@type': 'CollectionPage',
    '@id': 'https://liftag.fit/exercises#page',
    'name': 'LIFTAG Exercise Library',
    'url': 'https://liftag.fit/exercises',
    description,
    'isPartOf': { '@id': 'https://liftag.fit/#website' },
  },
])
</script>

<template>
  <div class="ex-index">
    <main>
      <header class="ex-hero container">
        <p class="protocol ex-eyebrow">EXERCISE LIBRARY · LIFTAG</p>
        <h1 class="display ex-title">Every machine.<br><span class="lime">Every lift.</span></h1>
        <p class="ex-lead">
          The same exercise catalog that powers the LIFTAG app: setup photos,
          instruction videos, and the muscles behind every movement.
        </p>

        <CatalogSearch
          v-model="query"
          placeholder="Search exercises… bench press, lat pulldown, squat"
          class="ex-search"
        />

        <p v-if="index" class="protocol ex-stats">
          {{ index.exercises.length }} EXERCISES ·
          <NuxtLink to="/machines" class="ex-stats-link">{{ index.machines.length }} MACHINES</NuxtLink>
          · {{ index.categories.length }} MUSCLE GROUPS
        </p>
      </header>

      <nav v-if="categories.length" class="container ex-chips" aria-label="Filter by muscle group">
        <button
          type="button"
          class="ex-chip"
          :class="{ 'is-active': muscle === '' }"
          @click="muscle = ''"
        >
          All
        </button>
        <button
          v-for="category in categories"
          :key="category.slug"
          type="button"
          class="ex-chip"
          :class="{ 'is-active': muscle === category.slug }"
          @click="toggleMuscle(category.slug)"
        >
          {{ category.name }}
          <span class="ex-chip__count">{{ categoryCounts.get(category.slug) ?? 0 }}</span>
        </button>
      </nav>

      <section class="container ex-results" aria-label="Exercises">
        <div v-if="error" class="ex-empty">
          <p>The exercise library did not load.</p>
          <button type="button" class="btn-ghost" @click="() => refresh()">Try again</button>
        </div>

        <div v-else-if="index && filtered.length === 0" class="ex-empty">
          <p>No exercises match <strong v-if="query">“{{ query }}”</strong><template v-else>this filter</template>.</p>
          <button type="button" class="btn-ghost" @click="query = ''; muscle = ''">Clear search</button>
        </div>

        <template v-else>
          <div class="ex-grid">
            <CatalogExerciseTile
              v-for="exercise in visible"
              :key="exercise.id"
              :to="`/exercises/${exercise.slug}`"
              :name="exercise.name"
              :image-url="exercise.imageUrl"
              :label="exercise.primaryCategory ? categoryNames.get(exercise.primaryCategory) : null"
              :has-video="exercise.hasVideo"
            />
          </div>
          <div v-if="filtered.length > visibleCount" class="ex-more">
            <button type="button" class="btn-ghost" @click="visibleCount += PAGE_SIZE">
              Show more ({{ filtered.length - visibleCount }} left)
            </button>
          </div>
        </template>
      </section>

      <section class="container ex-machines-band">
        <div class="ex-machines-band__inner">
          <div>
            <p class="protocol ex-machines-band__eyebrow">BROWSE BY MACHINE</p>
            <h2 class="display ex-machines-band__title">Know the machine, <span class="lime">not the name?</span></h2>
            <p class="ex-machines-band__copy">
              Every partner-gym machine lists its exercises, exactly like scanning
              its QR tag in the app.
            </p>
          </div>
          <NuxtLink to="/machines" class="btn-primary ex-machines-band__cta">Browse machines</NuxtLink>
        </div>
      </section>
    </main>

    <AppCtaBar message="Track any of these exercises" />
  </div>
</template>

<style scoped>
.ex-index {
  min-height: var(--liftag-stable-vh);
  background:
    radial-gradient(circle at 84% 12%, rgba(204, 255, 0, 0.1), transparent 34%),
    radial-gradient(circle at 12% 70%, rgba(255, 45, 85, 0.04), transparent 36%),
    #000;
  color: #fff;
}

.ex-hero {
  padding: 150px 0 26px;
}

.ex-eyebrow {
  margin: 0 0 18px;
  color: var(--liftag-primary);
}

.ex-title {
  margin: 0;
  font-size: clamp(48px, 7.4vw, 104px);
}

.ex-lead {
  max-width: 54ch;
  margin: 22px 0 0;
  color: rgba(255, 255, 255, 0.64);
  font-size: 17px;
  font-weight: 300;
  line-height: 1.65;
}

.ex-search {
  margin-top: 34px;
}

.ex-stats {
  margin: 18px 0 0;
  color: var(--liftag-fg-tertiary);
  font-size: 10px;
}

.ex-stats-link {
  color: var(--liftag-primary);
  text-decoration: none;
}

.ex-stats-link:hover {
  text-decoration: underline;
}

.ex-chips {
  display: flex;
  gap: 8px;
  padding-top: 20px;
  padding-bottom: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.ex-chips::-webkit-scrollbar {
  display: none;
}

.ex-chip {
  display: inline-flex;
  flex: 0 0 auto;
  gap: 7px;
  align-items: center;
  padding: 9px 16px;
  border: 1px solid var(--liftag-border);
  border-radius: 999px;
  background: transparent;
  color: var(--liftag-fg-muted);
  font-family: var(--liftag-font-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: border-color 200ms ease, color 200ms ease, background-color 200ms ease;
}

.ex-chip:hover {
  border-color: rgba(255, 255, 255, 0.32);
  color: #fff;
}

.ex-chip.is-active {
  border-color: rgba(204, 255, 0, 0.55);
  background: var(--liftag-primary-dim);
  color: var(--liftag-primary);
}

.ex-chip__count {
  color: var(--liftag-fg-dim);
  font-size: 10px;
}

.ex-chip.is-active .ex-chip__count {
  color: rgba(204, 255, 0, 0.7);
}

.ex-results {
  padding-top: 26px;
  padding-bottom: 40px;
}

.ex-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.ex-more {
  display: flex;
  justify-content: center;
  padding-top: 34px;
}

.ex-empty {
  display: grid;
  gap: 18px;
  justify-items: center;
  padding: 70px 0;
  color: var(--liftag-fg-muted);
  text-align: center;
}

.ex-empty p {
  margin: 0;
  font-size: 17px;
  font-weight: 300;
}

.ex-machines-band {
  padding-bottom: 110px;
}

.ex-machines-band__inner {
  display: flex;
  flex-wrap: wrap;
  gap: 28px;
  align-items: center;
  justify-content: space-between;
  padding: 40px 44px;
  border: 1px solid var(--liftag-border-strong);
  border-radius: var(--liftag-r-2xl);
  background:
    radial-gradient(circle at 90% 0%, rgba(204, 255, 0, 0.09), transparent 42%),
    var(--liftag-surface-dark);
}

.ex-machines-band__eyebrow {
  margin: 0 0 12px;
  color: var(--liftag-primary);
}

.ex-machines-band__title {
  margin: 0;
  font-size: clamp(26px, 3.4vw, 42px);
}

.ex-machines-band__copy {
  max-width: 46ch;
  margin: 14px 0 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 15px;
  font-weight: 300;
  line-height: 1.6;
}

.ex-machines-band__cta {
  text-decoration: none;
}

@media (max-width: 1080px) {
  .ex-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .ex-hero {
    padding-top: calc(120px + var(--liftag-safe-top));
  }
}

@media (max-width: 768px) {
  .ex-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .ex-machines-band__inner {
    padding: 30px 24px;
  }
}

@media (max-width: 620px) {
  .ex-hero {
    padding: 112px 0 20px;
  }
}
</style>
