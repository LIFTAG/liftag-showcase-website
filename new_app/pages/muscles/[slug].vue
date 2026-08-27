<script setup lang="ts">
import type { CatalogIndexExercise } from '~/types/catalog'

const route = useRoute()
const param = String(route.params.slug)
const hub = muscleHub(param)

if (!hub) {
  throw createError({ statusCode: 404, statusMessage: 'Muscle group not found', fatal: true })
}

const { data: index, error, refresh } = await useCatalogIndex()

const query = ref(typeof route.query.q === 'string' ? route.query.q : '')

// Full-screen search mode, phone breakpoint only. Focusing the field enters
// it; only the Cancel button, leaving the page, or growing past the phone
// breakpoint exits. Blur deliberately does not: the keyboard's Search key
// collapses the keyboard and leaves the full-screen list up for browsing.
//
// While the mode is open the input sits at the very top of the layout
// viewport and the page scroll is locked, so iOS never has to offset the
// visual viewport to reveal the caret. The sticky bar this replaces chased
// that offset from JS (--liftag-vv-top), always a frame behind the scroll,
// which is what read as the bar shivering.
const searchOpen = ref(false)
const searchFieldFocused = ref(false)
const rootEl = ref<HTMLElement | null>(null)
const isMobile = ref(false)
let mobileQuery: MediaQueryList | null = null
let onMobileChange: (() => void) | null = null

// Body scroll lock, the position: fixed variant - overflow: hidden alone does
// not stop iOS Safari from scrolling the page behind an overlay.
let lockedScrollY = 0
let scrollLocked = false

function lockBodyScroll() {
  if (scrollLocked) return
  scrollLocked = true
  lockedScrollY = window.scrollY
  const body = document.body
  body.style.position = 'fixed'
  body.style.top = `-${lockedScrollY}px`
  body.style.left = '0'
  body.style.right = '0'
  body.style.width = '100%'
}

function unlockBodyScroll() {
  if (!scrollLocked) return
  scrollLocked = false
  const body = document.body
  body.style.position = ''
  body.style.top = ''
  body.style.left = ''
  body.style.right = ''
  body.style.width = ''
  window.scrollTo(0, lockedScrollY)
}

function activateSearch() {
  searchFieldFocused.value = true
  if (isMobile.value) openSearch()
}

function deactivateSearch() {
  searchFieldFocused.value = false
}

function openSearch() {
  if (searchOpen.value) return
  searchOpen.value = true
  lockBodyScroll()
}

function closeSearch() {
  if (!searchOpen.value) return
  searchOpen.value = false
  unlockBodyScroll()
  updateKeyboardInset()
  const active = document.activeElement
  if (active instanceof HTMLElement) active.blur()
}

// The software keyboard covers the bottom of the internal results scroller,
// so pad the scroller by the keyboard's height. visualViewport resize is a
// discrete open/close event - unlike the per-frame scroll events the old
// sticky compensation chased - so this padding cannot shiver mid-scroll.
// Same threshold SiteNav uses to tell a keyboard from URL-bar wobble.
const KEYBOARD_MIN_INSET_PX = 120
let onViewportResize: (() => void) | null = null

function updateKeyboardInset() {
  const root = rootEl.value
  if (!root) return
  const viewport = window.visualViewport
  const inset = searchOpen.value && viewport
    ? Math.round(document.documentElement.clientHeight - viewport.height)
    : 0
  root.style.setProperty('--mu-kb-inset', `${inset >= KEYBOARD_MIN_INSET_PX ? inset : 0}px`)
}

// Native lists drop the keyboard as soon as you start browsing the results.
function onResultsTouchMove() {
  if (!searchOpen.value || !searchFieldFocused.value) return
  const active = document.activeElement
  if (active instanceof HTMLElement) active.blur()
}

onMounted(() => {
  mobileQuery = window.matchMedia('(max-width: 768px)')
  onMobileChange = () => {
    isMobile.value = Boolean(mobileQuery?.matches)
    if (!isMobile.value) closeSearch()
  }
  onMobileChange()
  mobileQuery.addEventListener('change', onMobileChange)

  onViewportResize = () => updateKeyboardInset()
  window.visualViewport?.addEventListener('resize', onViewportResize, { passive: true })

  nextTick(() => {
    const activeChip = rootEl.value?.querySelector<HTMLElement>('.mu-filter.is-active')
    activeChip?.scrollIntoView({ inline: 'center', block: 'nearest' })
  })
})

onBeforeUnmount(() => {
  unlockBodyScroll()
  if (mobileQuery && onMobileChange) mobileQuery.removeEventListener('change', onMobileChange)
  if (onViewportResize) window.visualViewport?.removeEventListener('resize', onViewportResize)
})

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

const chrome = catalogChrome('en')

const allForMuscle = computed(() =>
  partitionExercisesByMuscle(index.value?.exercises ?? [], hub.slug),
)
const exercises = computed(() => [...allForMuscle.value.primary, ...allForMuscle.value.secondary])

const grouped = computed(() => {
  const tokens = normalizeCatalogQuery(query.value).split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return allForMuscle.value
  const matches = (exercise: CatalogIndexExercise) => {
    const haystack = `${normalizeCatalogQuery(exercise.name)} ${exercise.aliases ?? ''}`
    return tokens.every(token => haystack.includes(token))
  }
  return {
    primary: allForMuscle.value.primary.filter(matches),
    secondary: allForMuscle.value.secondary.filter(matches),
  }
})

const filtered = computed(() => [...grouped.value.primary, ...grouped.value.secondary])
const sliced = computed(() =>
  sliceMuscleGroups(grouped.value.primary, grouped.value.secondary, visibleCount.value),
)
const listForSchema = computed(() => exercises.value.slice(0, 30))

const otherHubs = MUSCLE_HUBS.filter(item => item.slug !== hub.slug)

const path = musclePath(hub.slug)

// Keep filters shareable without asking Vue Router to navigate on every
// keystroke. A router replace invokes the app's scroll behavior, which can move
// the focused input while the phone keyboard is opening.
watch(query, (q) => {
  visibleCount.value = PAGE_SIZE
  if (!import.meta.client) return

  const url = new URL(window.location.href)
  if (q) url.searchParams.set('q', q)
  else url.searchParams.delete('q')
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
})

useLiftagSeo({
  title: `${hub.name} Exercises: How to Log Them | LIFTAG`,
  description: hub.description,
  path,
})

const cdnOrigin = computed(() => {
  const first = exercises.value.find(exercise => exercise.imageUrl)?.imageUrl
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
  liftagSoftwareApplication,
  liftagWebPage({
    path,
    name: `${hub.name} exercises`,
    description: hub.description,
    type: 'CollectionPage',
  }),
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: '/' },
    { name: 'Exercise Library', path: '/exercises' },
    { name: 'Muscles', path: '/muscles' },
    { name: hub.name, path },
  ]),
  liftagItemList({
    name: `${hub.name} exercises in LIFTAG`,
    items: listForSchema.value.map(exercise => ({
      name: exercise.name,
      url: `https://liftag.fit/exercises/${exercise.slug}`,
    })),
  }),
])
</script>

<template>
  <div ref="rootEl" class="mu-hub" :class="{ 'is-search-open': searchOpen }">
    <main>
      <nav class="container mu-breadcrumb" aria-label="Breadcrumb">
        <NuxtLink to="/exercises" class="protocol mu-crumb">EXERCISES</NuxtLink>
        <span class="mu-crumb-sep" aria-hidden="true">/</span>
        <NuxtLink to="/muscles" class="protocol mu-crumb">MUSCLES</NuxtLink>
      </nav>

      <header class="mu-hero container">
        <p class="protocol mu-eyebrow">{{ hub.name.toUpperCase() }} · LIFTAG LIBRARY</p>
        <h1 class="display mu-title">{{ hub.headline.replace('.', '') }}. <span class="lime">Log them.</span></h1>
        <p class="mu-lead">{{ hub.intro }}</p>
        <p class="mu-stats">
          <span>{{ exercises.length }} exercises</span>
          <span class="mu-stats-dot" aria-hidden="true">·</span>
          <NuxtLink to="/exercises" class="mu-stats-link">Full library</NuxtLink>
          <span class="mu-stats-dot" aria-hidden="true">·</span>
          <NuxtLink to="/machines" class="mu-stats-link">Machines</NuxtLink>
        </p>
      </header>

      <div class="mu-search-anchor">
        <div class="mu-search-shell">
          <div class="container mu-search-tools">
            <div class="mu-search-row">
              <CatalogSearch
                v-model="query"
                placeholder="Search exercises…"
                class="mu-search"
                @focus="activateSearch"
                @blur="deactivateSearch"
              />
              <button
                v-if="searchOpen"
                type="button"
                class="mu-search-cancel"
                @click="closeSearch"
              >
                Cancel
              </button>
            </div>

            <nav v-if="categories.length" class="mu-filters" aria-label="Browse by muscle group">
              <NuxtLink
                to="/exercises"
                class="mu-filter"
              >
                All
              </NuxtLink>
              <NuxtLink
                v-for="category in categories"
                :key="category.slug"
                :to="musclePath(category.slug)"
                class="mu-filter"
                :class="{ 'is-active': category.slug === hub.slug }"
                :aria-current="category.slug === hub.slug ? 'page' : undefined"
              >
                {{ category.name }}
                <span class="mu-filter__count">{{ categoryCounts.get(category.slug) ?? 0 }}</span>
              </NuxtLink>
            </nav>
          </div>
        </div>
      </div>

      <section
        class="container mu-results"
        :aria-label="`${hub.name} exercises`"
        @touchmove.passive="onResultsTouchMove"
      >
        <div v-if="error" class="mu-empty">
          <p>The exercise library did not load.</p>
          <button type="button" class="btn-ghost" @click="() => refresh()">Try again</button>
        </div>

        <div v-else-if="index && exercises.length === 0" class="mu-empty">
          <p>No {{ hub.name.toLowerCase() }} exercises in the catalog yet.</p>
          <NuxtLink to="/exercises" class="btn-ghost">Browse all exercises</NuxtLink>
        </div>

        <div v-else-if="index && filtered.length === 0" class="mu-empty">
          <p>No exercises match <strong v-if="query">“{{ query }}”</strong><template v-else>this filter</template>.</p>
          <button type="button" class="btn-ghost" @click="query = ''">Clear search</button>
        </div>

        <template v-else>
          <div class="mu-grid">
            <CatalogExerciseTile
              v-for="exercise in sliced.visiblePrimary"
              :key="exercise.id"
              :to="`/exercises/${exercise.slug}`"
              :name="exercise.name"
              :image-url="exercise.imageUrl"
              :label="exercise.primaryCategory ? categoryNames.get(exercise.primaryCategory) : null"
              :has-video="exercise.hasVideo"
              :preview-video-url="exercise.previewVideoUrl"
            />
            <CatalogMuscleSplit
              v-if="sliced.showSplit"
              :label="chrome.alsoTrains(hub.name)"
              :count="grouped.secondary.length"
              :leading="sliced.visiblePrimary.length === 0"
            />
            <CatalogExerciseTile
              v-for="exercise in sliced.visibleSecondary"
              :key="exercise.id"
              :to="`/exercises/${exercise.slug}`"
              :name="exercise.name"
              :image-url="exercise.imageUrl"
              :label="exercise.primaryCategory ? categoryNames.get(exercise.primaryCategory) : null"
              :has-video="exercise.hasVideo"
              :preview-video-url="exercise.previewVideoUrl"
            />
          </div>
          <div v-if="filtered.length > visibleCount" class="mu-more">
            <button type="button" class="btn-ghost" @click="visibleCount += PAGE_SIZE">
              Show more ({{ filtered.length - visibleCount }} left)
            </button>
          </div>
        </template>
      </section>

      <section class="container mu-others" aria-label="Other muscle groups">
        <h2 class="protocol mu-section-title">OTHER MUSCLE GROUPS</h2>
        <div class="mu-chips">
          <NuxtLink
            v-for="item in otherHubs"
            :key="item.slug"
            :to="musclePath(item.slug)"
            class="mu-chip"
          >
            {{ item.name }}
          </NuxtLink>
        </div>
      </section>
    </main>

    <AppCtaBar :message="`Track ${hub.name.toLowerCase()} work`" />
  </div>
</template>

<style scoped>
.mu-hub {
  min-height: var(--liftag-stable-vh);
  background:
    radial-gradient(circle at 84% 12%, rgba(204, 255, 0, 0.1), transparent 34%),
    radial-gradient(circle at 12% 70%, rgba(255, 45, 85, 0.04), transparent 36%),
    #000;
  color: #fff;
  padding-bottom: 48px;
}

.mu-breadcrumb {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 128px 0 0;
}

.mu-crumb {
  color: var(--liftag-fg-tertiary);
  font-size: 10px;
  text-decoration: none;
}

.mu-crumb:hover {
  color: var(--liftag-primary);
}

.mu-crumb-sep {
  color: var(--liftag-fg-dim);
  font-size: 10px;
}

.mu-hero {
  padding: 26px 0 0;
}

.mu-eyebrow {
  margin: 0 0 18px;
  color: var(--liftag-primary);
}

.mu-title {
  margin: 0;
  max-width: 16ch;
  font-size: clamp(48px, 7.4vw, 104px);
  line-height: 0.92;
}

.mu-lead {
  max-width: 58ch;
  margin: 22px 0 0;
  color: rgba(255, 255, 255, 0.64);
  font-size: 17px;
  font-weight: 300;
  line-height: 1.65;
}

.mu-stats {
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

.mu-stats > :not(.mu-stats-dot) {
  white-space: nowrap;
}

.mu-stats-dot {
  color: var(--liftag-fg-dim);
}

.mu-stats-link {
  color: var(--liftag-primary);
  text-decoration: none;
}

.mu-stats-link:hover {
  text-decoration: underline;
}

.mu-search-tools {
  padding-top: 12px;
  padding-bottom: 8px;
}

.mu-search-row {
  display: flex;
  gap: 6px;
  align-items: center;
}

.mu-search {
  flex: 1 1 auto;
}

/* Rendered only while the full-screen search mode is open (phone only). */
.mu-search-cancel {
  flex: 0 0 auto;
  padding: 10px 4px 10px 12px;
  border: none;
  background: transparent;
  color: var(--liftag-primary);
  font-family: var(--liftag-font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
}

.mu-filters {
  display: flex;
  flex-wrap: nowrap;
  gap: 4px;
  padding-top: 12px;
  padding-bottom: 2px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.mu-filters::-webkit-scrollbar {
  display: none;
}

.mu-filter {
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
  text-decoration: none;
  text-transform: uppercase;
  cursor: pointer;
  transition: border-color 200ms ease, color 200ms ease, background-color 200ms ease;
}

.mu-filter:hover {
  border-color: rgba(255, 255, 255, 0.32);
  color: #fff;
}

.mu-filter.is-active {
  border-color: rgba(204, 255, 0, 0.55);
  background: var(--liftag-primary-dim);
  color: var(--liftag-primary);
}

.mu-filter__count {
  color: var(--liftag-fg-dim);
  font-size: 8.5px;
}

.mu-filter.is-active .mu-filter__count {
  color: rgba(204, 255, 0, 0.7);
}

.mu-results {
  padding-top: 26px;
  padding-bottom: 40px;
}

.mu-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.mu-more {
  display: flex;
  justify-content: center;
  padding-top: 34px;
}

.mu-empty {
  display: grid;
  gap: 18px;
  justify-items: center;
  padding: 70px 0;
  color: var(--liftag-fg-muted);
  text-align: center;
}

.mu-empty p {
  margin: 0;
  font-size: 17px;
  font-weight: 300;
}

.mu-others {
  padding: 12px 0 48px;
}

.mu-section-title {
  margin: 0 0 16px;
  color: var(--liftag-fg-tertiary);
}

.mu-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mu-chip {
  display: inline-flex;
  padding: 7px 14px;
  border: 1px solid var(--liftag-border);
  border-radius: 999px;
  background: var(--liftag-secondary);
  color: var(--liftag-fg-muted);
  font-family: var(--liftag-font-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-decoration: none;
  text-transform: uppercase;
}

.mu-chip:hover {
  border-color: rgba(204, 255, 0, 0.45);
  color: var(--liftag-primary);
}

@media (min-width: 769px) {
  .mu-breadcrumb,
  .mu-hero,
  .mu-search-tools,
  .mu-results,
  .mu-others {
    width: calc(100% - 64px);
    max-width: 1240px;
    padding-right: 0;
    padding-left: 0;
  }

  /* Match /exercises: one row, 12px type, steal width from padding/gap. */
  .mu-filters {
    flex-wrap: nowrap;
    gap: 4px;
    overflow-x: auto;
  }

  .mu-filter {
    flex: 1 0 auto;
    padding: 8px;
    font-size: 12px;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }

  .mu-filter__count {
    font-size: 11px;
  }
}

@media (max-width: 1080px) {
  .mu-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .mu-breadcrumb {
    padding-top: calc(96px + var(--liftag-safe-top));
    padding-right: max(16px, var(--liftag-safe-right));
    padding-left: max(16px, var(--liftag-safe-left));
  }

  .mu-hero {
    padding:
      18px
      max(16px, var(--liftag-safe-right))
      10px
      max(16px, var(--liftag-safe-left));
  }

  .mu-eyebrow {
    margin-bottom: 12px;
    font-size: 10px;
    letter-spacing: 0.14em;
  }

  .mu-title {
    font-size: clamp(40px, 10.5vw, 56px);
  }

  .mu-lead {
    margin-top: 14px;
    font-size: 15px;
  }

  .mu-stats {
    margin-top: 16px;
  }

  /* The tinted radial wash the desktop page carries is what made the opaque
     search bar read as a grey band against it on a phone: an OLED-black page
     with a near-black strip pinned across it shows every point of difference.
     Flat black on both, so the pinned row is invisible until it has content
     scrolling under it. */
  .mu-hub {
    background: #000;
  }

  /* Browsing state: the search workspace stays in normal flow and pins below
     the fixed nav for the full results scroll. --liftag-nav-h is the bar's
     measured height published by SiteNav. */
  .mu-search-anchor {
    position: sticky;
    top: var(--liftag-nav-h);
    z-index: 30;
  }

  .mu-search-shell {
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    background: #000;
  }

  .mu-search-tools {
    padding:
      8px
      max(16px, var(--liftag-safe-right))
      7px
      max(16px, var(--liftag-safe-left));
  }

  .mu-search {
    max-width: none;
  }

  .mu-search :deep(.cat-search__input) {
    padding-top: 12px;
    padding-bottom: 12px;
  }

  .mu-search :deep(.cat-search__icon) {
    margin-left: 14px;
  }

  .mu-search :deep(.cat-search__clear) {
    width: 36px;
    height: 36px;
    margin-right: 4px;
  }

  /* Full-screen search mode: the whole <main> becomes a fixed flex column
     above the nav, the search row is its pinned header, and the results grid
     is an internal scroller. */
  .mu-hub.is-search-open main {
    position: fixed;
    inset: 0;
    z-index: 120;
    display: flex;
    flex-direction: column;
    background: #000;
    animation: muSearchModeIn 200ms ease-out;
  }

  .mu-hub.is-search-open .mu-breadcrumb,
  .mu-hub.is-search-open .mu-hero,
  .mu-hub.is-search-open .mu-others {
    display: none;
  }

  .mu-hub.is-search-open .mu-search-anchor {
    position: static;
    flex: 0 0 auto;
  }

  /* The overlay covers the nav, so its header row takes over the safe-area
     inset the nav normally absorbs. */
  .mu-hub.is-search-open .mu-search-tools {
    padding-top: calc(var(--liftag-safe-top) + 10px);
  }

  /* !important mirrors the browsing-state .mu-results paddings above, which
     need it against .container. --mu-kb-inset is the software keyboard's
     height, written from discrete visualViewport open/close resizes, so the
     tail of the list stays reachable while typing. */
  .mu-hub.is-search-open .mu-results {
    flex: 1 1 auto;
    align-self: stretch;
    width: 100%;
    min-width: 0;
    min-height: 0;
    margin-right: 0;
    margin-left: 0;
    padding-bottom: calc(20px + var(--liftag-safe-bottom) + var(--mu-kb-inset, 0px)) !important;
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
  }

  .mu-hub.is-search-open .mu-search-shell {
    border-bottom-color: rgba(204, 255, 0, 0.18);
    box-shadow: 0 10px 24px rgba(4, 5, 3, 0.3);
  }

  .mu-hub.is-search-open :deep(.app-cta) {
    display: none;
  }

  .mu-filters {
    flex-wrap: nowrap;
    gap: 6px;
    margin: 0 -1px;
    padding: 7px 1px 0;
    overflow-x: auto;
    overscroll-behavior-inline: contain;
  }

  .mu-filter {
    flex: 0 0 auto;
    min-height: 32px;
    padding: 7px 12px;
    font-size: 10px;
  }

  .mu-results {
    padding-top: 8px !important;
    padding-bottom: 20px !important;
  }

  .mu-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .mu-hub.is-search-open .mu-grid {
    width: 100%;
    grid-template-columns: minmax(0, 1fr);
    justify-items: stretch;
    gap: 0;
    border-top: 1px solid var(--liftag-border-soft);
  }

  .mu-hub.is-search-open .mu-grid :deep(.ex-tile) {
    display: grid;
    grid-template-columns: 84px minmax(0, 1fr) 16px;
    gap: 12px;
    align-items: center;
    width: 100%;
    min-width: 0;
    min-height: 76px;
    padding: 6px 2px;
    overflow: visible;
    border: 0;
    border-bottom: 1px solid var(--liftag-border-soft);
    border-radius: 0;
    background: transparent;
  }

  .mu-hub.is-search-open .mu-grid :deep(.ex-tile:hover) {
    border-bottom-color: var(--liftag-border-soft);
    transform: none;
  }

  .mu-hub.is-search-open .mu-grid :deep(.ex-tile:active) {
    background: rgba(204, 255, 0, 0.055);
  }

  .mu-hub.is-search-open .mu-grid :deep(.ex-tile::after) {
    width: 7px;
    height: 7px;
    border-top: 1px solid var(--liftag-fg-dim);
    border-right: 1px solid var(--liftag-fg-dim);
    content: '';
    transform: rotate(45deg);
  }

  .mu-hub.is-search-open .mu-grid :deep(.ex-tile__media) {
    width: 84px;
    height: 64px;
    aspect-ratio: auto;
    border-radius: 9px;
  }

  .mu-hub.is-search-open .mu-grid :deep(.ex-tile__body) {
    min-width: 0;
    gap: 4px;
    padding: 0;
  }

  .mu-hub.is-search-open .mu-grid :deep(.ex-tile__body::before) {
    content: none;
  }

  .mu-hub.is-search-open .mu-grid :deep(.ex-tile__name) {
    overflow: hidden;
    font-size: 14px;
    line-height: 1.25;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mu-hub.is-search-open .mu-grid :deep(.ex-tile__label) {
    overflow: hidden;
    font-size: 9px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mu-hub.is-search-open .mu-grid :deep(.ex-tile__play) {
    right: 6px;
    bottom: 6px;
    width: 24px;
    height: 24px;
  }

  .mu-hub.is-search-open .mu-grid :deep(.cat-split) {
    margin: 0;
    padding: 14px 2px 10px;
    background: rgba(204, 255, 0, 0.035);
    border-top-color: rgba(204, 255, 0, 0.16);
    border-bottom: 1px solid var(--liftag-border-soft);
  }

  .mu-hub.is-search-open .mu-grid :deep(.cat-split.is-leading) {
    border-top: 0;
  }
}

@media (max-width: 620px) {
  .mu-title {
    font-size: clamp(40px, 12vw, 64px);
  }
}

/* The transform clears at animation end (no fill), so the fixed overlay is
   not left inside a transform containing block. */
@keyframes muSearchModeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mu-hub.is-search-open main {
    animation: none;
  }
}
</style>
