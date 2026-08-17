<script setup lang="ts">
import type { CatalogIndexExercise } from '~/types/catalog'

const description = 'Browse the LIFTAG exercise library: gym exercises by muscle group and machine, with setup photos, instruction videos, and the muscles each lift works.'

useLiftagSeo({
  title: 'Exercise Library | Gym Exercises by Muscle & Machine | LIFTAG',
  description,
  path: '/exercises',
})

const route = useRoute()

const { data: index, error, refresh } = await useCatalogIndex()

const query = ref(typeof route.query.q === 'string' ? route.query.q : '')
const muscle = ref(typeof route.query.muscle === 'string' ? route.query.muscle : '')
const searchShellRef = ref<HTMLElement | null>(null)
const searchFocused = ref(false)
let searchVisibilityTimer: ReturnType<typeof setTimeout> | null = null

function activateSearch(event: FocusEvent) {
  searchFocused.value = true

  if (!import.meta.client || !window.matchMedia('(max-width: 768px)').matches) return

  // Sticky positioning normally keeps the field clear of the fixed nav. Some
  // mobile browsers still perform their own focus scroll before the keyboard
  // has finished resizing the visual viewport, so repair only genuinely
  // obscured positions instead of jumping every search back to the hero.
  const ensureSearchIsVisible = () => {
    const input = event.target as HTMLInputElement
    const rect = input.getBoundingClientRect()
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight
    const navBottom = document.querySelector('.site-nav')?.getBoundingClientRect().bottom ?? 76
    if (rect.top < navBottom + 4 || rect.bottom > viewportHeight - 12) {
      scrollMobileResultsToStart()
    }
  }

  nextTick(() => {
    scrollMobileResultsToStart()
    requestAnimationFrame(ensureSearchIsVisible)
  })
  if (searchVisibilityTimer) clearTimeout(searchVisibilityTimer)
  searchVisibilityTimer = setTimeout(() => {
    ensureSearchIsVisible()
    searchVisibilityTimer = null
  }, 280)
}

function deactivateSearch() {
  if (searchVisibilityTimer) clearTimeout(searchVisibilityTimer)
  searchVisibilityTimer = null
  searchFocused.value = false
}

onBeforeUnmount(() => {
  if (searchVisibilityTimer) clearTimeout(searchVisibilityTimer)
})

function scrollMobileResultsToStart() {
  const shell = searchShellRef.value
  if (!shell) return
  const navBottom = document.querySelector('.site-nav')?.getBoundingClientRect().bottom ?? 76
  const navClearance = Math.max(76, navBottom)
  window.scrollTo({ top: Math.max(0, shell.offsetTop - navClearance), behavior: 'auto' })
}

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

// Keep filters shareable without asking Vue Router to navigate on every
// keystroke. A router replace invokes the app's scroll behavior, which can move
// the focused input while the phone keyboard is opening.
watch([query, muscle], ([q, m], [previousQuery, previousMuscle]) => {
  visibleCount.value = PAGE_SIZE
  if (!import.meta.client) return

  const url = new URL(window.location.href)
  if (q) url.searchParams.set('q', q)
  else url.searchParams.delete('q')
  if (m) url.searchParams.set('muscle', m)
  else url.searchParams.delete('muscle')
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)

  const changedQuery = q !== previousQuery
  const changedMuscle = m !== previousMuscle
  const shouldResetResults = changedMuscle || (searchFocused.value && changedQuery)
  if (window.matchMedia('(max-width: 768px)').matches && shouldResetResults) {
    nextTick(scrollMobileResultsToStart)
  }
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
  <div class="ex-index" :class="{ 'is-searching': searchFocused }">
    <main>
      <header class="ex-hero container">
        <p class="protocol ex-eyebrow">EXERCISE LIBRARY · LIFTAG</p>
        <h1 class="display ex-title">Every machine.<br><span class="lime">Every lift.</span></h1>
        <p class="ex-lead">
          The same exercise catalog that powers the LIFTAG app: setup photos,
          instruction videos, and the muscles behind every movement.
        </p>

        <p v-if="index" class="ex-stats">
          <span>{{ index.exercises.length }} exercises</span>
          <span class="ex-stats-dot" aria-hidden="true">·</span>
          <NuxtLink to="/machines" class="ex-stats-link">{{ index.machines.length }} machines</NuxtLink>
          <span class="ex-stats-dot" aria-hidden="true">·</span>
          <span>{{ index.categories.length }} muscles</span>
        </p>

      </header>

      <div ref="searchShellRef" class="ex-search-anchor">
        <div class="ex-search-shell">
          <div class="container ex-search-tools">
            <CatalogSearch
              v-model="query"
              placeholder="Search exercises…"
              class="ex-search"
              @focus="activateSearch"
              @blur="deactivateSearch"
            />

            <nav v-if="categories.length" class="ex-chips" aria-label="Filter by muscle group">
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
          </div>
        </div>
      </div>

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
              :preview-video-url="exercise.previewVideoUrl"
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
  padding: 150px 0 0;
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

.ex-search-tools {
  padding-top: 12px;
  padding-bottom: 8px;
}

.ex-stats {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0 8px;
  margin: 22px 0 0;
  color: var(--liftag-fg-tertiary);
  font-family: var(--liftag-font-mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.ex-stats > :not(.ex-stats-dot) {
  white-space: nowrap;
}

.ex-stats-dot {
  color: var(--liftag-fg-dim);
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
  flex-wrap: nowrap;
  gap: 4px;
  padding-top: 12px;
  padding-bottom: 2px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.ex-chips::-webkit-scrollbar {
  display: none;
}

.ex-chip {
  display: inline-flex;
  flex: 1 0 auto;
  gap: 3px;
  align-items: center;
  justify-content: center;
  padding: 8px 7px;
  border: 1px solid var(--liftag-border);
  border-radius: 999px;
  background: transparent;
  color: var(--liftag-fg-muted);
  font-family: var(--liftag-font-mono);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.04em;
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
  font-size: 8.5px;
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
  padding-bottom: 24px;
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

@media (min-width: 769px) {
  .ex-hero,
  .ex-search-tools,
  .ex-results,
  .ex-machines-band {
    width: calc(100% - 64px);
    max-width: 1240px;
    padding-right: 0;
    padding-left: 0;
  }
}

@media (max-width: 1080px) {
  .ex-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .ex-hero {
    padding-top: calc(var(--liftag-safe-top) + 80px);
  }
}

@media (max-width: 768px) {
  .ex-hero {
    padding:
      calc(var(--liftag-safe-top) + 84px)
      max(16px, var(--liftag-safe-right))
      10px
      max(16px, var(--liftag-safe-left));
  }

  .ex-eyebrow {
    margin-bottom: 12px;
    font-size: 10px;
    letter-spacing: 0.14em;
  }

  .ex-title {
    font-size: clamp(40px, 10.5vw, 56px);
  }

  .ex-lead {
    margin-top: 14px;
    font-size: 15px;
  }

  /* Keep the whole search workspace in normal flow, then pin that workspace
     below the fixed nav for the full results scroll. This must not depend on
     input focus: phone browsers can change focus state while the user scrolls
     or while the software keyboard resizes the visual viewport. */
  .ex-search-anchor {
    position: sticky;
    top: calc(76px + var(--liftag-safe-top));
    z-index: 30;
  }

  .ex-search-shell {
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    background: rgba(7, 8, 6, 0.96);
  }

  .ex-search-tools {
    padding:
      8px
      max(16px, var(--liftag-safe-right))
      7px
      max(16px, var(--liftag-safe-left));
  }

  .ex-search {
    max-width: none;
  }

  .ex-search :deep(.cat-search__input) {
    padding-top: 12px;
    padding-bottom: 12px;
  }

  .ex-search :deep(.cat-search__icon) {
    margin-left: 14px;
  }

  .ex-search :deep(.cat-search__clear) {
    width: 36px;
    height: 36px;
    margin-right: 4px;
  }

  .ex-index.is-searching .ex-search-shell {
    border-bottom-color: rgba(204, 255, 0, 0.18);
    box-shadow: 0 10px 24px rgba(4, 5, 3, 0.3);
  }

  .ex-index.is-searching :deep(.app-cta) {
    display: none;
  }

  .ex-index.is-searching .ex-machines-band {
    display: none;
  }

  .ex-stats {
    margin-top: 16px;
  }

  .ex-chips {
    flex-wrap: nowrap;
    gap: 6px;
    margin: 0 -1px;
    padding: 7px 1px 0;
    overflow-x: auto;
    overscroll-behavior-inline: contain;
  }

  .ex-chip {
    flex: 0 0 auto;
    min-height: 32px;
    padding: 7px 12px;
    font-size: 10px;
  }

  .ex-results {
    padding-top: 8px !important;
    padding-bottom: 20px !important;
  }

  .ex-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .ex-index.is-searching .ex-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
    border-top: 1px solid var(--liftag-border-soft);
  }

  .ex-index.is-searching .ex-grid :deep(.ex-tile) {
    display: grid;
    grid-template-columns: 84px minmax(0, 1fr) 16px;
    gap: 12px;
    align-items: center;
    min-height: 76px;
    padding: 6px 2px;
    overflow: visible;
    border: 0;
    border-bottom: 1px solid var(--liftag-border-soft);
    border-radius: 0;
    background: transparent;
  }

  .ex-index.is-searching .ex-grid :deep(.ex-tile:hover) {
    border-bottom-color: var(--liftag-border-soft);
    transform: none;
  }

  .ex-index.is-searching .ex-grid :deep(.ex-tile:active) {
    background: rgba(204, 255, 0, 0.055);
  }

  .ex-index.is-searching .ex-grid :deep(.ex-tile::after) {
    width: 7px;
    height: 7px;
    border-top: 1px solid var(--liftag-fg-dim);
    border-right: 1px solid var(--liftag-fg-dim);
    content: '';
    transform: rotate(45deg);
  }

  .ex-index.is-searching .ex-grid :deep(.ex-tile__media) {
    width: 84px;
    height: 64px;
    aspect-ratio: auto;
    border-radius: 9px;
  }

  .ex-index.is-searching .ex-grid :deep(.ex-tile__body) {
    min-width: 0;
    gap: 4px;
    padding: 0;
  }

  .ex-index.is-searching .ex-grid :deep(.ex-tile__body::before) {
    content: none;
  }

  .ex-index.is-searching .ex-grid :deep(.ex-tile__name) {
    font-size: 14px;
    line-height: 1.25;
  }

  .ex-index.is-searching .ex-grid :deep(.ex-tile__label) {
    overflow: hidden;
    font-size: 9px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ex-index.is-searching .ex-grid :deep(.ex-tile__play) {
    right: 6px;
    bottom: 6px;
    width: 24px;
    height: 24px;
  }

  .ex-machines-band {
    padding-bottom: 0;
  }

  .ex-machines-band__inner {
    padding: 24px 18px;
  }
}
</style>
