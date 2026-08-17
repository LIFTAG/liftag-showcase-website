<script setup lang="ts">
const description = 'Browse gym machines in the LIFTAG catalog. Every machine lists the exercises you can do on it, with photos and instruction videos, exactly like scanning its QR tag in the app.'

useLiftagSeo({
  title: 'Gym Machine Catalog | Exercises by Machine | LIFTAG',
  description,
  path: '/machines',
})

const route = useRoute()
const router = useRouter()

const { data: index, error, refresh } = await useCatalogIndex()

const query = ref(typeof route.query.q === 'string' ? route.query.q : '')
const muscle = ref(typeof route.query.muscle === 'string' ? route.query.muscle : '')

const categories = computed(() => index.value?.categories ?? [])
const categoryNames = computed(() => {
  const names = new Map<string, string>()
  for (const category of categories.value) names.set(category.slug, category.name)
  return names
})

const machineCategoryCounts = computed(() => {
  const counts = new Map<string, number>()
  for (const machine of index.value?.machines ?? []) {
    for (const slug of new Set(machine.categories)) {
      counts.set(slug, (counts.get(slug) ?? 0) + 1)
    }
  }
  return counts
})

const filtered = computed(() => {
  let rows = index.value?.machines ?? []
  if (muscle.value) {
    rows = rows.filter(machine => machine.categories.includes(muscle.value))
  }
  const tokens = normalizeCatalogQuery(query.value).split(/\s+/).filter(Boolean)
  if (tokens.length > 0) {
    rows = rows.filter((machine) => {
      const haystack = normalizeCatalogQuery(machine.name)
      return tokens.every(token => haystack.includes(token))
    })
  }
  return rows
})

watch([query, muscle], ([q, m]) => {
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

useLiftagStructuredData([
  liftagOrganization,
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: '/' },
    { name: 'Machines', path: '/machines' },
  ]),
  {
    '@type': 'CollectionPage',
    '@id': 'https://liftag.fit/machines#page',
    'name': 'LIFTAG Machine Catalog',
    'url': 'https://liftag.fit/machines',
    description,
    'isPartOf': { '@id': 'https://liftag.fit/#website' },
  },
])
</script>

<template>
  <div class="ma-index">
    <main>
      <header class="ma-hero container">
        <p class="protocol ma-eyebrow">MACHINE CATALOG · LIFTAG</p>
        <h1 class="display ma-title">Pick the machine.<br><span class="lime">Get the lifts.</span></h1>
        <p class="ma-lead">
          Every machine here lists the exercises you can do on it, the same
          screen the app opens when you scan a machine's QR tag.
        </p>

        <CatalogSearch
          v-model="query"
          placeholder="Search machines… leg press, cable tower, pec deck"
          class="ma-search"
        />

        <p v-if="index" class="protocol ma-stats">
          {{ index.machines.length }} MACHINES ·
          <NuxtLink to="/exercises" class="ma-stats-link">{{ index.exercises.length }} EXERCISES</NuxtLink>
        </p>
      </header>

      <nav v-if="categories.length" class="container ma-chips" aria-label="Filter by muscle group">
        <button
          type="button"
          class="ma-chip"
          :class="{ 'is-active': muscle === '' }"
          @click="muscle = ''"
        >
          All
        </button>
        <button
          v-for="category in categories"
          :key="category.slug"
          type="button"
          class="ma-chip"
          :class="{ 'is-active': muscle === category.slug }"
          @click="toggleMuscle(category.slug)"
        >
          {{ category.name }}
          <span class="ma-chip__count">{{ machineCategoryCounts.get(category.slug) ?? 0 }}</span>
        </button>
      </nav>

      <section class="container ma-results" aria-label="Machines">
        <div v-if="error" class="ma-empty">
          <p>The machine catalog did not load.</p>
          <button type="button" class="btn-ghost" @click="() => refresh()">Try again</button>
        </div>

        <div v-else-if="index && filtered.length === 0" class="ma-empty">
          <p>No machines match <strong v-if="query">“{{ query }}”</strong><template v-else>this filter</template>.</p>
          <button type="button" class="btn-ghost" @click="query = ''; muscle = ''">Clear search</button>
        </div>

        <div v-else class="ma-grid">
          <CatalogExerciseTile
            v-for="machine in filtered"
            :key="machine.id"
            :to="machinePath(machine)"
            :name="machine.name"
            :image-url="machine.photoUrl"
            :label="machine.categories[0] ? categoryNames.get(machine.categories[0]) : null"
          />
        </div>
      </section>
    </main>

    <AppCtaBar message="Scan machines, skip the search" />
  </div>
</template>

<style scoped>
.ma-index {
  min-height: var(--liftag-stable-vh);
  background:
    radial-gradient(circle at 16% 10%, rgba(204, 255, 0, 0.09), transparent 32%),
    radial-gradient(circle at 88% 66%, rgba(255, 45, 85, 0.045), transparent 36%),
    #000;
  color: #fff;
}

.ma-hero {
  padding: 150px 0 26px;
}

.ma-eyebrow {
  margin: 0 0 18px;
  color: var(--liftag-primary);
}

.ma-title {
  margin: 0;
  font-size: clamp(48px, 7.4vw, 104px);
}

.ma-lead {
  max-width: 54ch;
  margin: 22px 0 0;
  color: rgba(255, 255, 255, 0.64);
  font-size: 17px;
  font-weight: 300;
  line-height: 1.65;
}

.ma-search {
  margin-top: 34px;
}

.ma-stats {
  margin: 18px 0 0;
  color: var(--liftag-fg-tertiary);
  font-size: 10px;
}

.ma-stats-link {
  color: var(--liftag-primary);
  text-decoration: none;
}

.ma-stats-link:hover {
  text-decoration: underline;
}

.ma-chips {
  display: flex;
  gap: 8px;
  padding-top: 20px;
  padding-bottom: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.ma-chips::-webkit-scrollbar {
  display: none;
}

.ma-chip {
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

.ma-chip:hover {
  border-color: rgba(255, 255, 255, 0.32);
  color: #fff;
}

.ma-chip.is-active {
  border-color: rgba(204, 255, 0, 0.55);
  background: var(--liftag-primary-dim);
  color: var(--liftag-primary);
}

.ma-chip__count {
  color: var(--liftag-fg-dim);
  font-size: 10px;
}

.ma-chip.is-active .ma-chip__count {
  color: rgba(204, 255, 0, 0.7);
}

.ma-results {
  padding-top: 26px;
  padding-bottom: 110px;
}

.ma-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.ma-empty {
  display: grid;
  gap: 18px;
  justify-items: center;
  padding: 70px 0;
  color: var(--liftag-fg-muted);
  text-align: center;
}

.ma-empty p {
  margin: 0;
  font-size: 17px;
  font-weight: 300;
}

@media (max-width: 1080px) {
  .ma-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .ma-hero {
    padding-top: calc(120px + var(--liftag-safe-top));
  }
}

@media (max-width: 768px) {
  .ma-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
}

@media (max-width: 620px) {
  .ma-hero {
    padding: 112px 0 20px;
  }
}
</style>
