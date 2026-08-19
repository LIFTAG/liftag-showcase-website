<script setup lang="ts">
import type { CatalogIndexExercise } from '~/types/catalog'

/**
 * Homepage drop for the public exercise library. Search submits into
 * /exercises; the rack is a live slice of the same catalog, not a mock grid.
 * Fetches client-side so homepage prerender never depends on the catalog API.
 */
useReveal()

const FEATURED_SLUGS = [
  'barbell-bench-press',
  'barbell-back-squat',
  'conventional-deadlift',
  'pull-up',
  'barbell-romanian-deadlift-rdl',
  'barbell-front-squat',
  'trap-bar-deadlift',
  'incline-dumbbell-press',
] as const

const FEATURED_LIMIT = 6

const CHIP_SLUGS = ['chest', 'back', 'shoulders', 'quadriceps'] as const

const { data: index, error, status } = useCatalogIndex({ lazy: true, server: false })

const query = ref('')

const categoryNames = computed(() => {
  const names = new Map<string, string>()
  for (const category of index.value?.categories ?? []) names.set(category.slug, category.name)
  return names
})

const chips = computed(() => {
  const fromIndex = index.value?.categories ?? []
  if (fromIndex.length === 0) {
    return CHIP_SLUGS
      .map(slug => muscleHub(slug))
      .filter((hub): hub is NonNullable<typeof hub> => hub !== null)
      .map(hub => ({ slug: hub.slug, name: hub.name }))
  }
  const preferred = CHIP_SLUGS
    .map(slug => fromIndex.find(category => category.slug === slug))
    .filter((category): category is NonNullable<typeof category> => category !== null)
  return preferred.length > 0 ? preferred : fromIndex.slice(0, CHIP_SLUGS.length)
})

const tiles = computed(() => pickLibraryTiles(index.value?.exercises ?? []))

const exerciseCount = computed(() => index.value?.exercises.length ?? 0)

const catalogReady = computed(() => status.value === 'success' || Boolean(error.value))

const skeletonSlots = Array.from({ length: FEATURED_LIMIT }, (_, i) => i)

function pickLibraryTiles(exercises: CatalogIndexExercise[]): CatalogIndexExercise[] {
  const bySlug = new Map(exercises.map(exercise => [exercise.slug, exercise]))
  const picked: CatalogIndexExercise[] = []
  const used = new Set<string>()

  for (const slug of FEATURED_SLUGS) {
    const row = bySlug.get(slug)
    if (!row?.imageUrl) continue
    picked.push(row)
    used.add(row.id)
    if (picked.length >= FEATURED_LIMIT) return picked
  }

  const usedCats = new Set(picked.map(exercise => exercise.primaryCategory))
  const rest = exercises
    .filter(exercise => exercise.imageUrl && !used.has(exercise.id))
    .sort((a, b) => Number(b.isCompound) - Number(a.isCompound))

  for (const row of rest) {
    const cat = row.primaryCategory
    if (cat && usedCats.has(cat)) continue
    picked.push(row)
    used.add(row.id)
    if (cat) usedCats.add(cat)
    if (picked.length >= FEATURED_LIMIT) return picked
  }

  for (const row of rest) {
    if (used.has(row.id)) continue
    picked.push(row)
    if (picked.length >= FEATURED_LIMIT) break
  }

  return picked
}

function openLibrary() {
  const q = query.value.trim()
  return navigateTo(q ? { path: '/exercises', query: { q } } : '/exercises')
}
</script>

<template>
  <section id="library" class="library-section">
    <div class="section-glow is-green" style="--glow-blur: 60px;" />

    <div class="container library-split">
      <div class="library-copy">
        <Eyebrow>▸ EXERCISE LIBRARY</Eyebrow>
        <SectionTitle :max="560">
          Every lift.<br /><span class="lime">Now on<br />the web.</span>
        </SectionTitle>
        <p class="copy-soft reveal library-lead">
          The same catalog a gym tag opens. Search it, filter by muscle, see
          the setup. Then log the set in the app.
        </p>

        <form class="library-search reveal" @submit.prevent="openLibrary">
          <label class="sr-only" for="library-search">Search the exercise library</label>
          <span class="library-search__field">
            <svg class="library-search__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.4-3.4" />
            </svg>
            <input
              id="library-search"
              v-model="query"
              type="search"
              class="library-search__input"
              placeholder="Search bench, squat, pulldown…"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="none"
              spellcheck="false"
              enterkeyhint="search"
            >
          </span>
          <button type="submit" class="btn-primary library-search__submit">
            {{ query.trim() ? 'Search' : 'Browse all' }}
          </button>
        </form>

        <nav class="library-chips reveal" aria-label="Browse by muscle group">
          <NuxtLink to="/exercises" class="library-chip is-active">
            All
            <span v-if="exerciseCount" class="library-chip__count">{{ exerciseCount }}</span>
          </NuxtLink>
          <NuxtLink
            v-for="chip in chips"
            :key="chip.slug"
            :to="musclePath(chip.slug)"
            class="library-chip"
          >
            {{ chip.slug === 'quadriceps' ? 'Quads' : chip.name }}
          </NuxtLink>
        </nav>

        <p class="library-machines reveal">
          Know the machine, not the name?
          <NuxtLink to="/machines">Browse machines</NuxtLink>
        </p>
      </div>

      <div class="library-rack reveal" aria-label="Featured exercises">
        <template v-if="tiles.length">
          <CatalogExerciseTile
            v-for="exercise in tiles"
            :key="exercise.id"
            :to="`/exercises/${exercise.slug}`"
            :name="exercise.name"
            :image-url="exercise.imageUrl"
            :label="exercise.primaryCategory ? categoryNames.get(exercise.primaryCategory) : null"
          />
        </template>
        <template v-else-if="!catalogReady">
          <span v-for="n in skeletonSlots" :key="n" class="library-skel" aria-hidden="true" />
        </template>
        <NuxtLink v-else to="/exercises" class="library-fallback">
          Open the full exercise library
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.library-section {
  position: relative;
  overflow: hidden;
  padding: 160px 0;
  border-top: 1px solid var(--liftag-border-soft);
  background: #000;
}

.library-split {
  position: relative;
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(0, 1.15fr);
  gap: 72px;
  align-items: start;
}

.library-copy {
  min-width: 0;
}

.library-lead {
  max-width: 46ch;
  margin-top: 22px;
}

.library-search {
  display: flex;
  gap: 10px;
  align-items: stretch;
  margin-top: 32px;
}

.library-search__field {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  min-width: 0;
  border: 1px solid var(--liftag-border);
  border-radius: var(--liftag-r-pill);
  background: rgba(14, 14, 14, 0.86);
  transition: border-color 200ms var(--ease-out-expo), box-shadow 200ms var(--ease-out-expo);
}

.library-search__field:focus-within {
  border-color: rgba(204, 255, 0, 0.55);
  box-shadow: 0 0 0 1px rgba(204, 255, 0, 0.2), 0 0 28px rgba(204, 255, 0, 0.08);
}

.library-search__icon {
  flex: 0 0 auto;
  margin-left: 18px;
  color: var(--liftag-fg-tertiary);
}

.library-search__field:focus-within .library-search__icon {
  color: var(--liftag-primary);
}

.library-search__input {
  flex: 1 1 auto;
  min-width: 0;
  padding: 15px 16px 15px 12px;
  border: none;
  background: transparent;
  color: #fff;
  font-family: var(--liftag-font-body);
  font-size: 16px;
  caret-color: var(--liftag-primary);
}

.library-search__input:focus {
  outline: none;
}

.library-search__input::placeholder {
  color: var(--liftag-fg-dim);
}

.library-search__input::-webkit-search-cancel-button {
  display: none;
}

.library-search__submit {
  flex: 0 0 auto;
  min-width: 10.5em;
  padding: 0 26px;
  white-space: nowrap;
}

.library-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 22px 0 0;
  padding: 0;
}

.library-chip {
  display: inline-flex;
  flex: 0 0 auto;
  gap: 6px;
  align-items: center;
  min-height: 36px;
  padding: 7px 14px;
  border: 1px solid var(--liftag-border);
  border-radius: 999px;
  background: transparent;
  color: var(--liftag-fg-muted);
  font-family: var(--liftag-font-mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-decoration: none;
  text-transform: uppercase;
  transition: border-color 200ms var(--ease-out-expo), color 200ms var(--ease-out-expo), background-color 200ms var(--ease-out-expo);
}

.library-chip:hover {
  border-color: rgba(255, 255, 255, 0.32);
  color: #fff;
}

.library-chip:focus-visible {
  outline: 2px solid var(--liftag-primary);
  outline-offset: 2px;
}

.library-chip.is-active {
  border-color: rgba(204, 255, 0, 0.55);
  background: var(--liftag-primary-dim);
  color: var(--liftag-primary);
}

.library-chip__count {
  color: rgba(204, 255, 0, 0.7);
  font-size: 9px;
}

.library-machines {
  margin: 28px 0 0;
  color: var(--liftag-fg-dim);
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
}

.library-machines a {
  color: var(--liftag-primary);
  text-decoration: none;
  font-weight: 600;
}

.library-machines a:hover {
  text-decoration: underline;
}

.library-rack {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  min-height: 280px;
}

.library-skel {
  display: block;
  aspect-ratio: 3 / 2;
  border: 1px solid var(--liftag-border-strong);
  border-radius: var(--liftag-r-lg);
  background:
    linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.04) 50%, transparent 100%),
    var(--liftag-secondary);
  background-size: 200% 100%;
}

.library-fallback {
  grid-column: 1 / -1;
  display: grid;
  place-items: center;
  min-height: 240px;
  border: 1px solid var(--liftag-border-strong);
  border-radius: var(--liftag-r-xl);
  background: var(--liftag-surface-dark);
  color: var(--liftag-primary);
  font-family: var(--liftag-font-headline);
  font-size: 18px;
  font-weight: 600;
  text-decoration: none;
}

@media (max-width: 980px) {
  .library-split {
    grid-template-columns: 1fr;
    gap: 40px;
    align-items: start;
  }

  .library-rack {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .library-section {
    padding: 80px 0;
  }

  .library-search {
    flex-direction: column;
  }

  .library-search__submit {
    width: 100%;
    padding: 16px 26px;
    text-align: center;
  }

  .library-rack {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .library-rack > :nth-child(n + 5) {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .library-search__field,
  .library-chip {
    transition: none;
  }
}
</style>
