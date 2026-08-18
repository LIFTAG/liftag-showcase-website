<script setup lang="ts">
import type { CatalogIndexMachine } from '~/types/catalog'

const description = 'Browse gym machines in the LIFTAG catalog. Every machine lists the exercises you can do on it, with photos and instruction videos, exactly like scanning its QR tag in the app.'

useLiftagSeo({
  title: 'Gym Machine Catalog | Exercises by Machine | LIFTAG',
  description,
  path: '/machines',
})

const route = useRoute()

const { data: index, error, refresh } = await useCatalogIndex()

const query = ref(typeof route.query.q === 'string' ? route.query.q : '')
const muscle = ref(typeof route.query.muscle === 'string' ? route.query.muscle : '')

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
  root.style.setProperty('--ma-kb-inset', `${inset >= KEYBOARD_MIN_INSET_PX ? inset : 0}px`)
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

const machineCategoryCounts = computed(() => {
  const counts = new Map<string, number>()
  for (const machine of index.value?.machines ?? []) {
    for (const slug of new Set(machine.categories)) {
      counts.set(slug, (counts.get(slug) ?? 0) + 1)
    }
  }
  return counts
})

const filtered = computed<CatalogIndexMachine[]>(() => {
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

const visible = computed(() => filtered.value.slice(0, visibleCount.value))

// Keep filters shareable without asking Vue Router to navigate on every
// keystroke. A router replace invokes the app's scroll behavior, which can move
// the focused input while the phone keyboard is opening.
watch([query, muscle], ([q, m]) => {
  visibleCount.value = PAGE_SIZE
  if (!import.meta.client) return

  const url = new URL(window.location.href)
  if (q) url.searchParams.set('q', q)
  else url.searchParams.delete('q')
  if (m) url.searchParams.set('muscle', m)
  else url.searchParams.delete('muscle')
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
})

function toggleMuscle(slug: string) {
  muscle.value = muscle.value === slug ? '' : slug
}

// Machine photos come from the catalog CDN; open the connection before the
// first tile image is requested.
const cdnOrigin = computed(() => {
  const first = index.value?.machines.find(machine => machine.photoUrl)?.photoUrl
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
  <div ref="rootEl" class="ma-index" :class="{ 'is-search-open': searchOpen }">
    <main>
      <header class="ma-hero container">
        <p class="protocol ma-eyebrow">MACHINE CATALOG · LIFTAG</p>
        <h1 class="display ma-title">Pick the machine.<br><span class="lime">Get the lifts.</span></h1>
        <p class="ma-lead">
          Every machine here lists the exercises you can do on it, the same
          screen the app opens when you scan a machine's QR tag.
        </p>

        <p v-if="index" class="ma-stats">
          <span>{{ index.machines.length }} machines</span>
          <span class="ma-stats-dot" aria-hidden="true">·</span>
          <NuxtLink to="/exercises" class="ma-stats-link">{{ index.exercises.length }} exercises</NuxtLink>
        </p>
      </header>

      <div class="ma-search-anchor">
        <div class="ma-search-shell">
          <div class="container ma-search-tools">
            <div class="ma-search-row">
              <CatalogSearch
                v-model="query"
                placeholder="Search machines… leg press, cable tower, pec deck"
                class="ma-search"
                @focus="activateSearch"
                @blur="deactivateSearch"
              />
              <button
                v-if="searchOpen"
                type="button"
                class="ma-search-cancel"
                @click="closeSearch"
              >
                Cancel
              </button>
            </div>

            <nav v-if="categories.length" class="ma-chips" aria-label="Filter by muscle group">
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
          </div>
        </div>
      </div>

      <section
        class="container ma-results"
        aria-label="Machines"
        @touchmove.passive="onResultsTouchMove"
      >
        <div v-if="error" class="ma-empty">
          <p>The machine catalog did not load.</p>
          <button type="button" class="btn-ghost" @click="() => refresh()">Try again</button>
        </div>

        <div v-else-if="index && filtered.length === 0" class="ma-empty">
          <p>No machines match <strong v-if="query">“{{ query }}”</strong><template v-else>this filter</template>.</p>
          <button type="button" class="btn-ghost" @click="query = ''; muscle = ''">Clear search</button>
        </div>

        <template v-else>
          <div class="ma-grid">
            <CatalogExerciseTile
              v-for="machine in visible"
              :key="machine.id"
              :to="machinePath(machine)"
              :name="machine.name"
              :image-url="machine.photoUrl"
              :label="machine.categories[0] ? categoryNames.get(machine.categories[0]) : null"
            />
          </div>
          <div v-if="filtered.length > visibleCount" class="ma-more">
            <button type="button" class="btn-ghost" @click="visibleCount += PAGE_SIZE">
              Show more ({{ filtered.length - visibleCount }} left)
            </button>
          </div>
        </template>
      </section>

      <section class="container ma-exercises-band">
        <div class="ma-exercises-band__inner">
          <div>
            <p class="protocol ma-exercises-band__eyebrow">BROWSE BY EXERCISE</p>
            <h2 class="display ma-exercises-band__title">Know the lift, <span class="lime">not the machine?</span></h2>
            <p class="ma-exercises-band__copy">
              Every exercise lists the machines it runs on — pick the lift and
              we'll show you where to find it.
            </p>
          </div>
          <NuxtLink to="/exercises" class="btn-primary ma-exercises-band__cta">Browse exercises</NuxtLink>
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
  padding: 150px 0 0;
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

.ma-search-tools {
  padding-top: 12px;
  padding-bottom: 8px;
}

.ma-search-row {
  display: flex;
  gap: 6px;
  align-items: center;
}

.ma-search {
  flex: 1 1 auto;
}

/* Rendered only while the full-screen search mode is open (phone only). */
.ma-search-cancel {
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

.ma-stats {
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

.ma-stats > :not(.ma-stats-dot) {
  white-space: nowrap;
}

.ma-stats-dot {
  color: var(--liftag-fg-dim);
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
  flex-wrap: nowrap;
  gap: 4px;
  padding-top: 12px;
  padding-bottom: 2px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.ma-chips::-webkit-scrollbar {
  display: none;
}

.ma-chip {
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
  font-size: 8.5px;
}

.ma-chip.is-active .ma-chip__count {
  color: rgba(204, 255, 0, 0.7);
}

.ma-results {
  padding-top: 26px;
  padding-bottom: 40px;
}

.ma-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.ma-more {
  display: flex;
  justify-content: center;
  padding-top: 34px;
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

.ma-exercises-band {
  padding-bottom: 24px;
}

.ma-exercises-band__inner {
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

.ma-exercises-band__eyebrow {
  margin: 0 0 12px;
  color: var(--liftag-primary);
}

.ma-exercises-band__title {
  margin: 0;
  font-size: clamp(26px, 3.4vw, 42px);
}

.ma-exercises-band__copy {
  max-width: 46ch;
  margin: 14px 0 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 15px;
  font-weight: 300;
  line-height: 1.6;
}

.ma-exercises-band__cta {
  text-decoration: none;
}

@media (min-width: 769px) {
  .ma-hero,
  .ma-search-tools,
  .ma-results,
  .ma-exercises-band {
    width: calc(100% - 64px);
    max-width: 1240px;
    padding-right: 0;
    padding-left: 0;
  }
}

@media (max-width: 1080px) {
  .ma-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .ma-hero {
    padding-top: calc(var(--liftag-safe-top) + 80px);
  }
}

@media (max-width: 768px) {
  .ma-hero {
    padding:
      calc(var(--liftag-safe-top) + 84px)
      max(16px, var(--liftag-safe-right))
      10px
      max(16px, var(--liftag-safe-left));
  }

  .ma-eyebrow {
    margin-bottom: 12px;
    font-size: 10px;
    letter-spacing: 0.14em;
  }

  .ma-title {
    font-size: clamp(40px, 10.5vw, 56px);
  }

  .ma-lead {
    margin-top: 14px;
    font-size: 15px;
  }

  /* The tinted radial wash the desktop page carries is what made the opaque
     search bar read as a grey band against it on a phone: an OLED-black page
     with a near-black strip pinned across it shows every point of difference.
     Flat black on both, so the pinned row is invisible until it has content
     scrolling under it. */
  .ma-index {
    background: #000;
  }

  /* Browsing state: the search workspace stays in normal flow and pins below
     the fixed nav for the full results scroll. --liftag-nav-h is the bar's
     measured height published by SiteNav (a hardcoded 76px left a visible gap
     under the nav's progress hairline). The top is a constant while scrolling
     - the old --liftag-vv-top keyboard term is gone; a JS-chased offset always
     lands a frame behind the compositor and read as the bar shivering. The
     keyboard case now belongs to the full-screen search mode below, where the
     input sits at the top of the layout viewport and the page scroll is
     locked, so the visual viewport never offsets in the first place. */
  .ma-search-anchor {
    position: sticky;
    top: var(--liftag-nav-h);
    z-index: 30;
  }

  .ma-search-shell {
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    background: #000;
  }

  .ma-search-tools {
    padding:
      8px
      max(16px, var(--liftag-safe-right))
      7px
      max(16px, var(--liftag-safe-left));
  }

  .ma-search {
    max-width: none;
  }

  .ma-search :deep(.cat-search__input) {
    padding-top: 12px;
    padding-bottom: 12px;
  }

  .ma-search :deep(.cat-search__icon) {
    margin-left: 14px;
  }

  .ma-search :deep(.cat-search__clear) {
    width: 36px;
    height: 36px;
    margin-right: 4px;
  }

  /* Full-screen search mode: the whole <main> becomes a fixed flex column
     above the nav, the search row is its pinned header, and the results grid
     is an internal scroller. Nothing in here tracks the visual viewport while
     scrolling, which is what made the old keyboard-compensated sticky bar
     shiver. */
  .ma-index.is-search-open main {
    position: fixed;
    inset: 0;
    z-index: 120;
    display: flex;
    flex-direction: column;
    background: #000;
    animation: maSearchModeIn 200ms ease-out;
  }

  .ma-index.is-search-open .ma-hero {
    display: none;
  }

  .ma-index.is-search-open .ma-search-anchor {
    position: static;
    flex: 0 0 auto;
  }

  /* The overlay covers the nav, so its header row takes over the safe-area
     inset the nav normally absorbs. */
  .ma-index.is-search-open .ma-search-tools {
    padding-top: calc(var(--liftag-safe-top) + 10px);
  }

  /* !important mirrors the browsing-state .ma-results paddings above, which
     need it against .container. --ma-kb-inset is the software keyboard's
     height, written from discrete visualViewport open/close resizes, so the
     tail of the list stays reachable while typing. */
  .ma-index.is-search-open .ma-results {
    flex: 1 1 auto;
    align-self: stretch;
    width: 100%;
    min-width: 0;
    min-height: 0;
    margin-right: 0;
    margin-left: 0;
    padding-bottom: calc(20px + var(--liftag-safe-bottom) + var(--ma-kb-inset, 0px)) !important;
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
  }

  .ma-index.is-search-open .ma-search-shell {
    border-bottom-color: rgba(204, 255, 0, 0.18);
    box-shadow: 0 10px 24px rgba(4, 5, 3, 0.3);
  }

  .ma-index.is-search-open :deep(.app-cta) {
    display: none;
  }

  .ma-index.is-search-open .ma-exercises-band {
    display: none;
  }

  .ma-stats {
    margin-top: 16px;
  }

  .ma-chips {
    flex-wrap: nowrap;
    gap: 6px;
    margin: 0 -1px;
    padding: 7px 1px 0;
    overflow-x: auto;
    overscroll-behavior-inline: contain;
  }

  .ma-chip {
    flex: 0 0 auto;
    min-height: 32px;
    padding: 7px 12px;
    font-size: 10px;
  }

  .ma-results {
    padding-top: 8px !important;
    padding-bottom: 20px !important;
  }

  .ma-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .ma-index.is-search-open .ma-grid {
    width: 100%;
    grid-template-columns: minmax(0, 1fr);
    justify-items: stretch;
    gap: 0;
    border-top: 1px solid var(--liftag-border-soft);
  }

  .ma-index.is-search-open .ma-grid :deep(.ex-tile) {
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

  .ma-index.is-search-open .ma-grid :deep(.ex-tile:hover) {
    border-bottom-color: var(--liftag-border-soft);
    transform: none;
  }

  .ma-index.is-search-open .ma-grid :deep(.ex-tile:active) {
    background: rgba(204, 255, 0, 0.055);
  }

  .ma-index.is-search-open .ma-grid :deep(.ex-tile::after) {
    width: 7px;
    height: 7px;
    border-top: 1px solid var(--liftag-fg-dim);
    border-right: 1px solid var(--liftag-fg-dim);
    content: '';
    transform: rotate(45deg);
  }

  .ma-index.is-search-open .ma-grid :deep(.ex-tile__media) {
    width: 84px;
    height: 64px;
    aspect-ratio: auto;
    border-radius: 9px;
  }

  .ma-index.is-search-open .ma-grid :deep(.ex-tile__body) {
    min-width: 0;
    gap: 4px;
    padding: 0;
  }

  .ma-index.is-search-open .ma-grid :deep(.ex-tile__body::before) {
    content: none;
  }

  .ma-index.is-search-open .ma-grid :deep(.ex-tile__name) {
    overflow: hidden;
    font-size: 14px;
    line-height: 1.25;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ma-index.is-search-open .ma-grid :deep(.ex-tile__label) {
    overflow: hidden;
    font-size: 9px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ma-index.is-search-open .ma-grid :deep(.ex-tile__play) {
    right: 6px;
    bottom: 6px;
    width: 24px;
    height: 24px;
  }

  .ma-exercises-band {
    padding-bottom: 0;
  }

  .ma-exercises-band__inner {
    padding: 24px 18px;
  }
}

/* The transform clears at animation end (no fill), so the fixed overlay is
   not left inside a transform containing block. */
@keyframes maSearchModeIn {
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
  .ma-index.is-search-open main {
    animation: none;
  }
}
</style>
