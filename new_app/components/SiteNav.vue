<script setup lang="ts">
import { scrollToTrainerHandoff } from '~/utils/dashboardScroll'
import { discoveryHref } from '~/utils/discovery'
import { NAV_ACTIVE_PREFIXES, navCurrent, type NavCurrent } from '~/utils/navActive'
import { en, sk } from '~/i18n/messages/shell'

const props = withDefaults(defineProps<{
  deferred?: boolean
  visible?: boolean
}>(), {
  deferred: false,
  visible: true,
})

const scrolled = ref(false)
const open = ref(false)
const isMobileNav = ref(false)
const navRoot = ref<HTMLElement | null>(null)
const route = useRoute()
const { locale, basePath, href } = useSiteLocale()
const { t } = useI18n({ useScope: 'local', messages: { en, sk } })
const localeReady = ref(false)
onMounted(() => { localeReady.value = true })

// True when the browser drives the progress hairline natively via
// animation-timeline: scroll(); the JS fallback then never writes the var.
let nativeScrollTimeline = false

const isHomeLike = computed(() => basePath.value === '/')
const sectionHref = (hash: string) => isHomeLike.value ? hash : href(`/${hash}`)

// `current` is the link's aria-current value, and any value marks it active.
// It is matched on the locale-stripped route path rather than the href, which
// carries a query and changes once the locale is ready.
const current = (prefixes: readonly [string, ...string[]]) => navCurrent(basePath.value, prefixes)

interface PageLink { id: string, label: string, href: string, current: NavCurrent }
type AudienceId = 'lifters' | 'owners' | 'trainers'
interface AudienceLink { id: AudienceId, label: string, hint: string, href: string }

const pageLinks = computed<PageLink[]>(() => [
  { id: 'exercises', label: t('shell.nav.exercises'), href: href('/exercises'), current: current(NAV_ACTIVE_PREFIXES.exercises) },
  { id: 'gyms', label: t('shell.nav.gyms'), href: localeReady.value ? discoveryHref('/explore', locale.value) : href('/explore'), current: current(NAV_ACTIVE_PREFIXES.gyms) },
  { id: 'demo', label: t('shell.nav.demo'), href: href('/demo'), current: current(NAV_ACTIVE_PREFIXES.demo) },
  { id: 'journal', label: t('shell.nav.journal'), href: href('/journal'), current: current(NAV_ACTIVE_PREFIXES.journal) },
  { id: 'pricing', label: t('shell.nav.pricing'), href: href('/pricing'), current: current(NAV_ACTIVE_PREFIXES.pricing) },
])

// The three audiences are homepage sections, which the URL cannot tell apart,
// so none of them is ever current. They sit behind one "Who it's for" menu so
// the bar reads as pages, and each carries a line saying what that side of
// LIFTAG is, rather than leaving a bare "Trainers" to be guessed at.
const audienceLinks = computed<AudienceLink[]>(() => [
  { id: 'lifters', label: t('shell.nav.lifters'), hint: t('shell.nav.liftersHint'), href: sectionHref('#lifters') },
  { id: 'owners', label: t('shell.nav.owners'), hint: t('shell.nav.ownersHint'), href: sectionHref('#gyms') },
  { id: 'trainers', label: t('shell.nav.trainers'), hint: t('shell.nav.trainersHint'), href: sectionHref('#trainers') },
])

// Desktop order: the audience menu keeps the slot the three section links held,
// between the catalog pages and the rest. The entry stagger counts it as one.
const AUDIENCE_SLOT = 2
const leadLinks = computed(() => pageLinks.value.slice(0, AUDIENCE_SLOT))
const trailLinks = computed(() => pageLinks.value.slice(AUDIENCE_SLOT))

// "Trainers" is the MacBook coach chapter, not TrainersSection. Direct
// `#trainers` loads are handled in plugins/trainer-hash-scroll.client.ts;
// this intercepts same-page nav clicks (pushState would not run Vue Router).
function onAudienceClick(id: AudienceId, target: string, event: MouseEvent) {
  open.value = false
  closeAudience()
  if (id !== 'trainers' || !isHomeLike.value) return
  if (!document.getElementById('dashboard')) return

  event.preventDefault()
  window.history.pushState(null, '', target)
  scrollToTrainerHandoff()
}

// "Who it's for" disclosure. A mouse opens it by hovering, with a short intent
// delay so sweeping across the bar does not flash it, and a grace period on the
// way out so the pointer can cross the gap to the panel. Touch and keyboard open
// it by activating the button. A click that lands on a menu the hover already
// opened keeps it open instead of toggling it shut under the pointer.
const AUDIENCE_OPEN_DELAY_MS = 70
const AUDIENCE_CLOSE_DELAY_MS = 220

const audienceOpen = ref(false)
const audienceRoot = ref<HTMLElement | null>(null)
const audienceTrigger = ref<HTMLButtonElement | null>(null)
const audiencePanelId = useId()
let audienceOpenedByHover = false
let audienceTimer: ReturnType<typeof setTimeout> | null = null

function clearAudienceTimer() {
  if (audienceTimer) clearTimeout(audienceTimer)
  audienceTimer = null
}

function closeAudience() {
  clearAudienceTimer()
  audienceOpen.value = false
  audienceOpenedByHover = false
}

function onAudiencePointerEnter(event: PointerEvent) {
  if (event.pointerType !== 'mouse') return
  clearAudienceTimer()
  if (audienceOpen.value) return
  audienceTimer = setTimeout(() => {
    audienceTimer = null
    audienceOpen.value = true
    audienceOpenedByHover = true
  }, AUDIENCE_OPEN_DELAY_MS)
}

function onAudiencePointerLeave(event: PointerEvent) {
  if (event.pointerType !== 'mouse') return
  clearAudienceTimer()
  if (audienceOpen.value) audienceTimer = setTimeout(closeAudience, AUDIENCE_CLOSE_DELAY_MS)
}

function toggleAudience() {
  clearAudienceTimer()
  if (audienceOpen.value && audienceOpenedByHover) {
    audienceOpenedByHover = false
    return
  }
  audienceOpen.value = !audienceOpen.value
  audienceOpenedByHover = false
}

function audienceItems() {
  return Array.from(audienceRoot.value?.querySelectorAll<HTMLAnchorElement>('.nav-audience__item') ?? [])
}

async function onAudienceKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && audienceOpen.value) {
    event.preventDefault()
    closeAudience()
    audienceTrigger.value?.focus()
    return
  }
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return

  const items = audienceItems()
  const index = items.indexOf(document.activeElement as HTMLAnchorElement)
  event.preventDefault()
  if (!audienceOpen.value) {
    audienceOpen.value = true
    audienceOpenedByHover = false
    await nextTick()
  }
  const step = event.key === 'ArrowDown' ? 1 : -1
  const next = index === -1
    ? (step === 1 ? 0 : items.length - 1)
    : (index + step + items.length) % items.length
  items[next]?.focus()
}

// Only a focus move that lands somewhere real closes the menu. A click on a
// panel link in Safari does not focus the link, so the trigger blurs with no
// related target, and closing on that would hide the panel under the click.
// Pointer presses elsewhere are the document listener's job.
function onAudienceFocusOut(event: FocusEvent) {
  const next = event.relatedTarget as Node | null
  if (next && !audienceRoot.value?.contains(next)) closeAudience()
}

function onDocumentPointerDown(event: PointerEvent) {
  if (!audienceRoot.value?.contains(event.target as Node)) closeAudience()
}

watch(audienceOpen, (isOpen, _, onCleanup) => {
  if (!isOpen) return
  document.addEventListener('pointerdown', onDocumentPointerDown, true)
  onCleanup(() => document.removeEventListener('pointerdown', onDocumentPointerDown, true))
})

watch(() => route.fullPath, closeAudience)

let _onScroll: (() => void) | null = null
let _onResize: (() => void) | null = null
let _onViewportChange: (() => void) | null = null
let _onVisualViewportResize: (() => void) | null = null
let _onVisualViewportScroll: (() => void) | null = null
let _mobileQuery: MediaQueryList | null = null

// The bar's height feeds every box that parks under it - today the sticky
// catalog search. Padding, the safe-area inset and the control row all move it,
// so publish the measured value rather than asking each consumer to guess.
// Observed as a border box, not the default content box: most of what moves the
// bar's lower edge is padding, and a content-box observation misses all of it.
let navResizeObserver: ResizeObserver | null = null

function publishNavHeight() {
  const el = navRoot.value
  if (!el) return
  document.documentElement.style.setProperty('--liftag-nav-h', `${el.offsetHeight}px`)
}

// A software keyboard shrinks the visual viewport and pushes it down inside the
// layout viewport. `position: fixed` resolves against the layout viewport, so
// without this offset the bar sits above the visible area for as long as the
// keyboard is open - it looks like the nav vanished the moment the caret lands
// in a field. The bar spends it as top padding rather than as `top`, so the
// glass still covers the strip it is clearing (see the .site-nav padding rule).
// (The catalog's search bar used to consume this var for its sticky
// top as well; it now opens a scroll-locked full-screen search mode instead,
// so the nav is the only consumer left.)
//
// Two dampers, both there because this bar carries a backdrop blur and any
// correction to its position is plainly visible:
//
// - The offset is only chased while something has actually taken a large bite
//   out of the visible area. Phone browsers report small transient offsets
//   during ordinary rubber-band scrolling, and following those wobbles the bar
//   for no reason.
// - Once a keyboard is up, small offsets that arrive mid-scroll are held until
//   the scrolling settles. Chasing every event puts the correction a frame or
//   more behind the scroll, which reads as the bar shivering against the page.
//   Anything large still lands immediately, so a real shift never lags.
const KEYBOARD_MIN_INSET_PX = 120
const OFFSET_SETTLE_DELAY_MS = 120
const OFFSET_IMMEDIATE_PX = 8

let publishedViewportTop = 0
let viewportSettleTimer: ReturnType<typeof setTimeout> | null = null

function readVisualViewportTop() {
  const viewport = window.visualViewport
  if (!viewport) return 0
  const inset = document.documentElement.clientHeight - viewport.height
  if (inset < KEYBOARD_MIN_INSET_PX) return 0
  return Math.max(0, Math.round(viewport.offsetTop))
}

function writeVisualViewportTop(offset: number) {
  if (offset === publishedViewportTop) return
  publishedViewportTop = offset
  document.documentElement.style.setProperty('--liftag-vv-top', `${offset}px`)
}

function publishVisualViewportTop(immediate: boolean) {
  if (viewportSettleTimer) {
    clearTimeout(viewportSettleTimer)
    viewportSettleTimer = null
  }

  const offset = readVisualViewportTop()
  if (immediate || Math.abs(offset - publishedViewportTop) >= OFFSET_IMMEDIATE_PX) {
    writeVisualViewportTop(offset)
    return
  }

  viewportSettleTimer = setTimeout(() => {
    viewportSettleTimer = null
    writeVisualViewportTop(readVisualViewportTop())
  }, OFFSET_SETTLE_DELAY_MS)
}

// The open drawer covers the viewport with a 70% black tint under a 20px
// backdrop blur, and the browser re-runs that blur for every frame its backdrop
// paints. Anything still animating underneath is therefore paying twice while
// being completely invisible. Publishing the state lets the hero park its
// motion for the duration: `data-liftag-nav-open` drives the CSS-only pieces,
// the event reaches the Three.js phones that CSS cannot pause.
function publishNavOpen(isOpen: boolean) {
  if (!import.meta.client) return

  const root = document.documentElement
  if (isOpen) root.setAttribute('data-liftag-nav-open', 'true')
  else root.removeAttribute('data-liftag-nav-open')

  window.dispatchEvent(new CustomEvent('liftag:nav-open-change', {
    detail: { open: isOpen },
  }))
}

watch(open, publishNavOpen)

// Scrollable distance for the progress hairline, cached. Reading
// documentElement.scrollHeight forces a synchronous layout, and this ran on
// every scroll frame in the browsers that need the JS fallback - Safari among
// them. The number only moves when the document or the viewport resizes, and
// the ResizeObserver below already runs after layout, so measuring there is
// free where measuring mid-scroll was not.
let scrollMax = 0
let docResizeObserver: ResizeObserver | null = null

function measureScrollMax() {
  scrollMax = document.documentElement.scrollHeight - window.innerHeight
}

function updateScrolled() {
  const threshold = isMobileNav.value ? 0 : 40
  const next = window.scrollY > threshold
  if (next !== scrolled.value) scrolled.value = next

  if (!nativeScrollTimeline && navRoot.value) {
    const p = scrollMax > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollMax)) : 0
    navRoot.value.style.setProperty('--nav-scroll-p', p.toFixed(4))
  }
}

onMounted(() => {
  nativeScrollTimeline = typeof CSS !== 'undefined' && CSS.supports('animation-timeline: scroll()')
  _mobileQuery = window.matchMedia('(max-width: 768px)')
  _onViewportChange = () => {
    isMobileNav.value = Boolean(_mobileQuery?.matches)
    measureScrollMax()
    updateScrolled()
  }
  _onViewportChange()

  // <html> grows with its content, so this covers lazily hydrated sections and
  // late-loading images. It does not cover the viewport half of the subtraction
  // (an unpinned <html> is content-sized, not viewport-sized), which is what the
  // resize listener below is for - mostly the mobile URL bar collapsing.
  if (typeof ResizeObserver !== 'undefined') {
    docResizeObserver = new ResizeObserver(() => {
      measureScrollMax()
      updateScrolled()
    })
    docResizeObserver.observe(document.documentElement)
  }

  _onResize = () => {
    measureScrollMax()
    updateScrolled()
  }
  window.addEventListener('resize', _onResize, { passive: true })

  if (_mobileQuery.addEventListener) {
    _mobileQuery.addEventListener('change', _onViewportChange)
  } else {
    _mobileQuery.addListener(_onViewportChange)
  }

  let queued = false
  _onScroll = () => {
    if (queued) return
    queued = true
    requestAnimationFrame(() => {
      queued = false
      updateScrolled()
    })
  }
  window.addEventListener('scroll', _onScroll, { passive: true })

  publishNavHeight()
  if (typeof ResizeObserver !== 'undefined') {
    navResizeObserver = new ResizeObserver(publishNavHeight)
    navResizeObserver.observe(navRoot.value!, { box: 'border-box' })
  }

  publishVisualViewportTop(true)
  // The keyboard both resizes the visible area and scrolls it inside the layout
  // viewport, and phone browsers fire those as separate events. A resize is the
  // keyboard itself opening or closing and has to land at once; a scroll is the
  // damped path described above.
  _onVisualViewportResize = () => publishVisualViewportTop(true)
  _onVisualViewportScroll = () => publishVisualViewportTop(false)
  window.visualViewport?.addEventListener('resize', _onVisualViewportResize, { passive: true })
  window.visualViewport?.addEventListener('scroll', _onVisualViewportScroll, { passive: true })
})

onBeforeUnmount(() => {
  publishNavOpen(false)
  clearAudienceTimer()
  docResizeObserver?.disconnect()
  docResizeObserver = null
  navResizeObserver?.disconnect()
  navResizeObserver = null
  if (viewportSettleTimer) clearTimeout(viewportSettleTimer)
  viewportSettleTimer = null
  if (_onVisualViewportResize) {
    window.visualViewport?.removeEventListener('resize', _onVisualViewportResize)
  }
  if (_onVisualViewportScroll) {
    window.visualViewport?.removeEventListener('scroll', _onVisualViewportScroll)
  }
  if (_onScroll) window.removeEventListener('scroll', _onScroll)
  if (_onResize) window.removeEventListener('resize', _onResize)
  if (_mobileQuery && _onViewportChange) {
    if (_mobileQuery.removeEventListener) {
      _mobileQuery.removeEventListener('change', _onViewportChange)
    } else {
      _mobileQuery.removeListener(_onViewportChange)
    }
  }
})
</script>

<template>
  <!-- Sticky header, pinned to the top edge of the layout viewport it is fixed
       to. The offset that keeps its contents inside the visible area
       (--liftag-vv-top) is carried by the top padding in the stylesheet rather
       than by `top`, so the blurred surface always starts at y=0 - see the
       padding rule for why that distinction matters. -->
  <header
    ref="navRoot"
    class="site-nav"
    :class="{
      'is-open': open,
      'is-scrolled': scrolled,
      'is-deferred': props.deferred,
      'is-deferred-in': props.deferred && props.visible,
    }"
    :style="{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }"
  >
    <span class="nav-entry-beam" aria-hidden="true"></span>
    <span class="nav-scroll-progress" aria-hidden="true"></span>

    <!-- Logo -->
    <a :href="href('/')" class="nav-logo">
      <span class="nav-logo__mark">
        <img
          src="/assets/logo.svg"
          width="28"
          height="28"
          class="nav-logo__img"
          :alt="t('shell.nav.logoAlt')"
        />
      </span>
      <span class="nav-logo__wordmark">LIFTAG</span>
    </a>

    <!-- Desktop nav links. Labels index on hover through IndexedText, which
         splits them client side only; aria-label carries the accessible name so
         the split run and its parked duplicates are never read out. -->
    <nav class="nav-desktop nav-center-links">
      <a
        v-for="(link, index) in leadLinks"
        :key="link.id"
        :href="link.href"
        class="nav-link ti-host"
        :class="{ 'is-active': link.current }"
        :aria-current="link.current"
        :aria-label="link.label"
        :style="{ '--nav-i': index }"
      ><IndexedText :text="link.label" /></a>

      <div
        ref="audienceRoot"
        class="nav-audience"
        :class="{ 'is-open': audienceOpen }"
        :style="{ '--nav-i': AUDIENCE_SLOT }"
        @pointerenter="onAudiencePointerEnter"
        @pointerleave="onAudiencePointerLeave"
        @focusout="onAudienceFocusOut"
        @keydown="onAudienceKeydown"
      >
        <button
          ref="audienceTrigger"
          type="button"
          class="nav-link nav-audience__trigger ti-host"
          :aria-label="t('shell.nav.audience')"
          :aria-expanded="audienceOpen"
          :aria-controls="audiencePanelId"
          @click="toggleAudience"
        >
          <IndexedText :text="t('shell.nav.audience')" />
          <svg class="nav-audience__chevron" viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden="true">
            <path d="m4 6 4 4 4-4" />
          </svg>
        </button>

        <!-- Closed, the panel is visibility: hidden, which also takes its links
             out of the tab order and the accessibility tree. -->
        <div :id="audiencePanelId" class="nav-audience__panel">
          <a
            v-for="audience in audienceLinks"
            :key="audience.id"
            :href="audience.href"
            class="nav-audience__item ti-host"
            :aria-label="audience.label"
            :aria-describedby="`${audiencePanelId}-${audience.id}`"
            @click="onAudienceClick(audience.id, audience.href, $event)"
          >
            <span class="nav-audience__title"><IndexedText :text="audience.label" /></span>
            <span :id="`${audiencePanelId}-${audience.id}`" class="nav-audience__hint">{{ audience.hint }}</span>
            <svg class="nav-audience__arrow" viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </a>
        </div>
      </div>

      <a
        v-for="(link, index) in trailLinks"
        :key="link.id"
        :href="link.href"
        class="nav-link ti-host"
        :class="{ 'is-active': link.current }"
        :aria-current="link.current"
        :aria-label="link.label"
        :style="{ '--nav-i': AUDIENCE_SLOT + 1 + index }"
      ><IndexedText :text="link.label" /></a>
    </nav>

    <!-- Right side: language, dashboard, primary CTA, hamburger -->
    <div class="nav-actions">
      <!-- Personalized UI hydrates separately from cached marketing pages. -->
      <ClientOnly>
        <SiteLanguageSelect @select="open = false" />
        <template #fallback><span class="nav-language-placeholder" aria-hidden="true" /></template>
      </ClientOnly>
      <!-- Desktop CTA -->
      <a
        href="https://app.liftag.fit/login"
        rel="nofollow"
        class="btn-ghost nav-desktop nav-dashboard-cta"
      >
        <HoloPill />{{ t('shell.nav.dashboard') }}
      </a>
      <span data-magnetic class="nav-desktop nav-app-cta-wrap">
        <NuxtLink
          :to="href('/get')"
          class="btn-primary nav-app-cta"
          @click="open = false"
        >
          {{ t('shell.nav.getApp') }}
        </NuxtLink>
      </span>

      <!-- Mobile hamburger: same 600ms stroke-dash morph as Tenus. -->
      <button
        type="button"
        class="nav-mobile-toggle"
        @click="open = !open"
        :aria-label="t('shell.nav.toggleMenu')"
        :aria-expanded="open"
        aria-controls="mobile-navigation"
      >
        <svg width="24" height="24" viewBox="0 0 100 100" fill="none" aria-hidden="true">
          <path class="line line1" d="M20 29h60s14.499-.183 14.533 37.711c.01 11.27-3.567 14.96-9.274 14.958C79.552 81.668 75 74.999 75 74.999L25 25" />
          <path class="line line2" d="M20 50h60" />
          <path class="line line3" d="M20 71h60s14.499.183 14.533-37.711c.01-11.27-3.567-14.96-9.274-14.958-5.707.001-10.259 6.67-10.259 6.67L25 75" />
        </svg>
      </button>
    </div>
  </header>

  <!-- Mobile drawer -->
  <div
    id="mobile-navigation"
    class="nav-mobile-drawer"
    :class="{ 'is-open': open }"
    :aria-hidden="!open"
  >
    <nav class="nav-drawer-pages">
      <a
        v-for="link in pageLinks"
        :key="link.id"
        :href="link.href"
        class="nav-drawer-link"
        :class="{ 'is-active': link.current }"
        :aria-current="link.current"
        @click="open = false"
      >{{ link.label }}</a>
    </nav>
    <nav class="nav-drawer-audience" :aria-labelledby="`${audiencePanelId}-drawer`">
      <p :id="`${audiencePanelId}-drawer`" class="nav-drawer-audience__label">{{ t('shell.nav.audience') }}</p>
      <a
        v-for="audience in audienceLinks"
        :key="audience.id"
        :href="audience.href"
        class="nav-drawer-audience__item"
        @click="onAudienceClick(audience.id, audience.href, $event)"
      >
        <span class="nav-drawer-audience__title">{{ audience.label }}</span>
        <span class="nav-drawer-audience__hint">{{ audience.hint }}</span>
        <svg class="nav-drawer-audience__arrow" viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
      </a>
    </nav>
    <a
      href="https://app.liftag.fit/login"
      rel="nofollow"
      class="nav-dashboard-mobile"
      @click="open = false"
    >
      {{ t('shell.nav.dashboard') }}
    </a>
    <div class="nav-store-buttons">
      <GetAppBtn :label="t('shell.nav.getApp')" />
    </div>
  </div>
</template>

<style scoped>
/* The scrolled/open surface lives here rather than in the `:style` binding on
   the element: an inline background outranks any stylesheet rule, so a
   translucent glass background declared here would silently lose to it and the
   bar would keep rendering as opaque black no matter what backdrop-filter says.

   `backwards`, not `both`: navShellIn's 100% keyframe is visually identical to
   the element's resting state, but `both` kept it applied forever, permanently
   pinning `clip-path: inset(0 0 0 0 round 0)` on the header. clip-path on the
   same element as backdrop-filter breaks the blur in WebKit and Chromium. */
.site-nav.is-deferred {
  animation: none;
  opacity: 0;
  transform: translate3d(0, -16px, 0);
  pointer-events: none;
  transition:
    opacity 800ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 800ms cubic-bezier(0.16, 1, 0.3, 1);
}
.site-nav.is-deferred.is-deferred-in {
  opacity: 1;
  transform: none;
  pointer-events: auto;
}
@media (prefers-reduced-motion: reduce) {
  .site-nav.is-deferred {
    transition-duration: 0.01ms;
  }
}

/* Clipped sideways only, so the entry sweep cannot spill past the viewport
   edge while the "Who it's for" panel is free to hang below the bar. `clip`,
   unlike `hidden`, does not turn the other axis into a scroller. Engines
   without it fall back to visible: the bar is fixed, and a fixed box never
   extends the page's scrollable area, so the sweep still cannot add a
   horizontal scrollbar. */
.site-nav {
  overflow: visible;
  overflow-x: clip;
  /* Padding lives here rather than in the inline :style above, because inline
     styles outrank scoped CSS and would pin it flat at 14px 32px. The bar
     spans the full width so its background bleeds behind the cutout; only the
     padding keeps the logo, links and CTA out from under it.

     --liftag-vv-top is a term in the top padding rather than the element's
     `top` for a related reason. It is how far the visible area has been pushed
     down inside the layout viewport this bar is fixed to, so offsetting the box
     by it leaves that strip of page uncovered: the tint and the blur start
     below it, and the raw page stays sharp above it. On any screen whose first
     pixel is a photo - every catalog detail page - that reads as a hard seam
     between the frosted bar and the untouched image beside the browser's own
     URL chrome. Growing the padding keeps the box anchored at y=0, so the glass
     runs continuously from the top of the layout viewport to the bar's lower
     edge while the contents still land where they can be seen. */
  padding:
    calc(14px + var(--liftag-safe-top) + var(--liftag-vv-top))
    max(32px, var(--liftag-safe-right))
    14px
    max(32px, var(--liftag-safe-left));
  animation: navShellIn 860ms cubic-bezier(0.16, 1, 0.3, 1) backwards;
  background: transparent;
  border-bottom: 1px solid transparent;
  transition:
    background-color .35s cubic-bezier(0.16, 1, 0.3, 1),
    border-color .35s cubic-bezier(0.16, 1, 0.3, 1);
}

/* backdrop-filter is deliberately absent from the transition above: none ->
   blur() interpolates discretely in every engine, so listing it buys nothing,
   and giving the base state a blur(0px) just to make it interpolable would keep
   a backdrop layer alive across the whole hero for no visible gain. */
.site-nav.is-scrolled,
.site-nav.is-open {
  background: rgba(0, 0, 0, 0.55);
  border-bottom-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px) saturate(140%);
}

.site-nav::before,
.site-nav::after {
  content: '';
  position: absolute;
  pointer-events: none;
}

.site-nav::before {
  inset: 0;
  z-index: 0;
  background:
    linear-gradient(90deg, transparent 0%, rgba(204, 255, 0, 0.1) 46%, rgba(255, 255, 255, 0.14) 50%, rgba(204, 255, 0, 0.08) 54%, transparent 100%);
  transform: translateX(-120%);
  animation: navLightSweep 1180ms cubic-bezier(0.16, 1, 0.3, 1) 120ms both;
}

.site-nav::after {
  left: max(32px, var(--liftag-safe-left));
  right: max(32px, var(--liftag-safe-right));
  bottom: 0;
  z-index: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(204, 255, 0, 0.78), rgba(255, 255, 255, 0.35), transparent);
  transform: scaleX(0);
  transform-origin: center;
  animation: navLineIn 900ms cubic-bezier(0.16, 1, 0.3, 1) 180ms both;
}

.nav-entry-beam {
  position: absolute;
  left: 50%;
  bottom: 0;
  z-index: 0;
  width: min(420px, 42vw);
  height: 72px;
  pointer-events: none;
  background: radial-gradient(ellipse at center bottom, rgba(204, 255, 0, 0.18), transparent 66%);
  opacity: 0;
  transform: translateX(-50%) scaleX(0.42);
  animation: navBeamBloom 980ms cubic-bezier(0.16, 1, 0.3, 1) 260ms both;
}

.nav-logo,
.nav-center-links,
.nav-actions,
.nav-mobile-toggle {
  position: relative;
  z-index: 2;
}

/* Page scroll progress hairline pinned to the nav's bottom edge. Driven by
   the native CSS scroll timeline where supported, otherwise by --nav-scroll-p
   written from the existing rAF scroll handler. Scroll-proportional motion,
   so it intentionally stays active under prefers-reduced-motion. */
.nav-scroll-progress {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  height: 2px;
  pointer-events: none;
  background: linear-gradient(90deg, rgba(204, 255, 0, 0.55), var(--liftag-primary) 82%, #ffffff);
  box-shadow: 0 0 12px rgba(204, 255, 0, 0.45);
  transform: scaleX(var(--nav-scroll-p, 0));
  transform-origin: left center;
  opacity: 0;
  transition: opacity 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

.site-nav.is-scrolled .nav-scroll-progress {
  opacity: 1;
}

@keyframes navScrollProgressFill {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

@supports (animation-timeline: scroll()) {
  .nav-scroll-progress {
    animation: navScrollProgressFill linear both;
    animation-timeline: scroll(root block);
  }
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  opacity: 0;
  transform: translate3d(-18px, -10px, 0) rotate(-3deg);
  animation: navLogoIn 780ms cubic-bezier(0.16, 1, 0.3, 1) 220ms both;
}

.nav-logo__mark {
  position: relative;
  display: grid;
  place-items: center;
}

.nav-logo__mark::before {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: 999px;
  border: 1px solid rgba(204, 255, 0, 0.34);
  box-shadow: 0 0 18px rgba(204, 255, 0, 0.18);
  opacity: 0;
  transform: scale(0.5) rotate(-28deg);
  animation: navMarkRing 880ms cubic-bezier(0.16, 1, 0.3, 1) 300ms both;
}

.nav-logo__img {
  filter: drop-shadow(0 0 14px rgba(204, 255, 0, 0.5));
  animation: navMarkSnap 760ms cubic-bezier(0.16, 1, 0.3, 1) 260ms both;
}

.nav-logo__wordmark {
  display: inline-block;
  padding-right: 0.16em;
  margin-right: -0.16em;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  font-style: italic;
  font-size: 22px;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  color: #fff;
  clip-path: inset(0 100% 0 0);
  animation: navWordReveal 680ms cubic-bezier(0.16, 1, 0.3, 1) 390ms both;
}

.nav-logo,
.nav-link {
  cursor: pointer;
}

/* Sentence-case body type rather than tracked mono capitals. At 0.22em of
   tracking the gap inside "For gym owners" was as wide as the gap between two
   links, so multi-word labels read as several links and the row as one long
   run. Normal spacing lets the whitespace between items do the separating.

   Hover indexes the label (IndexedText, the same effect the footer uses): the
   resting glyph leaves through the top as a lime copy arrives from below. No
   underline; the swap is the affordance. */
.nav-link {
  --ti-rest: var(--nav-link-rest);
  --nav-link-rest: rgba(255, 255, 255, 0.74);
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  /* The vertical padding is hit area; the row is centred either way. */
  padding: 6px 0;
  border: 0;
  border-radius: 6px;
  background: none;
  color: var(--nav-link-rest);
  font-family: var(--liftag-font-body);
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.005em;
  white-space: nowrap;
  text-decoration: none;
  opacity: 0;
  transform: translate3d(0, -14px, 0) skewX(-9deg);
  /* Stagger from the link's index rather than a fixed nth-child list, so every
     link gets a delay no matter how many the nav holds. */
  animation: navItemIn 700ms cubic-bezier(0.16, 1, 0.3, 1) calc(360ms + var(--nav-i, 0) * 70ms) both;
  transition: color 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* The fallback for every label IndexedText leaves whole (touch, reduced
   motion, before the idle split): a plain colour change. --ti-rest keeps the
   split glyph that is leaving at its resting colour. */
@media (hover: hover) and (pointer: fine) {
  .nav-link:hover {
    color: var(--liftag-primary);
  }
}

.nav-link:focus-visible {
  color: var(--liftag-primary);
  outline: 1px solid rgba(204, 255, 0, 0.55);
  outline-offset: 4px;
}

/* Current page: a scanner lock. LIFTAG is read by pointing a phone at a tag,
   so the page you are on is framed the way the app frames a tag it has found -
   four hairline corner ticks that close in once the link has landed and settle
   with a small overshoot, over a low pool of lime light. One pseudo-element
   carries all eight strokes as sized gradients, so the reticle costs no DOM.
   Nothing loops: after the lock the state is static, and hover only tightens
   the frame a touch while the character index runs as usual. */
.nav-link.is-active {
  --nav-lock-tick: 7px;
  --nav-lock-stroke: 1.5px;
  --nav-lock-x: -11px;
  --nav-lock-y: 1px;
  --nav-link-rest: var(--liftag-primary);
  text-shadow: 0 0 14px rgba(204, 255, 0, 0.35);
}

.nav-link.is-active::before,
.nav-link.is-active::after {
  content: '';
  position: absolute;
  pointer-events: none;
}

.nav-link.is-active::before {
  inset: var(--nav-lock-y) var(--nav-lock-x);
  --c: var(--liftag-primary);
  background:
    linear-gradient(var(--c), var(--c)) top left / var(--nav-lock-tick) var(--nav-lock-stroke),
    linear-gradient(var(--c), var(--c)) top left / var(--nav-lock-stroke) var(--nav-lock-tick),
    linear-gradient(var(--c), var(--c)) top right / var(--nav-lock-tick) var(--nav-lock-stroke),
    linear-gradient(var(--c), var(--c)) top right / var(--nav-lock-stroke) var(--nav-lock-tick),
    linear-gradient(var(--c), var(--c)) bottom left / var(--nav-lock-tick) var(--nav-lock-stroke),
    linear-gradient(var(--c), var(--c)) bottom left / var(--nav-lock-stroke) var(--nav-lock-tick),
    linear-gradient(var(--c), var(--c)) bottom right / var(--nav-lock-tick) var(--nav-lock-stroke),
    linear-gradient(var(--c), var(--c)) bottom right / var(--nav-lock-stroke) var(--nav-lock-tick);
  background-repeat: no-repeat;
  filter: drop-shadow(0 0 4px rgba(204, 255, 0, 0.55));
  /* Hover tightens through the standalone `scale` property: it stays on the
     compositor, and unlike `transform` it is not pinned by the lock-on
     animation's fill. */
  transition: scale 420ms cubic-bezier(0.16, 1, 0.3, 1);
  /* Lands after the link's own entry (navItemIn: 360ms + 70ms per index, 700ms). */
  animation: navLockOn 760ms cubic-bezier(0.34, 1.56, 0.64, 1) calc(820ms + var(--nav-i, 0) * 70ms) both;
}

.nav-link.is-active::after {
  inset: -6px -18px;
  z-index: -1;
  background: radial-gradient(closest-side, rgba(204, 255, 0, 0.16), rgba(204, 255, 0, 0.05) 55%, transparent);
  animation: navLockGlow 900ms ease-out calc(900ms + var(--nav-i, 0) * 70ms) both;
}

.nav-link.is-active:hover::before,
.nav-link.is-active:focus-visible::before {
  scale: 0.95 0.86;
}

@keyframes navLockOn {
  0% { opacity: 0; transform: scale(1.45, 1.9); }
  35% { opacity: 1; }
  /* The reticle blinks once as it seats, like a read confirming. */
  70% { opacity: 1; }
  80% { opacity: 0.35; }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes navLockGlow {
  0% { opacity: 0; }
  40% { opacity: 1; }
  100% { opacity: 0.7; }
}

/* "Who it's for". The wrapper takes the entry stagger for its slot, so the
   trigger inside it must not run its own. */
.nav-audience {
  position: relative;
  display: flex;
  opacity: 0;
  transform: translate3d(0, -14px, 0) skewX(-9deg);
  animation: navItemIn 700ms cubic-bezier(0.16, 1, 0.3, 1) calc(360ms + var(--nav-i, 0) * 70ms) both;
}

.nav-audience__trigger {
  opacity: 1;
  transform: none;
  animation: none;
  cursor: pointer;
}

.nav-audience.is-open .nav-audience__trigger {
  --nav-link-rest: #fff;
}

.nav-audience__chevron {
  flex-shrink: 0;
  margin-right: -2px;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.7;
  transition: transform 260ms cubic-bezier(0.16, 1, 0.3, 1);
}

.nav-audience.is-open .nav-audience__chevron {
  transform: rotate(180deg);
}

/* Drops from the trigger to just under the bar's lower edge. The panel sits
   inside the bar, which is a backdrop root once scrolled, so a backdrop blur
   here would have nothing of the page to sample: the surface is solid, the
   same one the language menu uses. */
.nav-audience__panel {
  --nav-panel-gap: 22px;
  position: absolute;
  top: calc(100% + var(--nav-panel-gap));
  left: 50%;
  z-index: 3;
  display: grid;
  gap: 2px;
  box-sizing: border-box;
  width: 344px;
  padding: 6px;
  border: 1px solid var(--liftag-border-strong);
  border-radius: 16px;
  background: var(--liftag-surface-dark);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 24px 64px rgba(0, 0, 0, 0.55);
  opacity: 0;
  visibility: hidden;
  transform: translate3d(-50%, -6px, 0);
  transition:
    opacity 140ms ease-out,
    transform 200ms cubic-bezier(0.16, 1, 0.3, 1),
    visibility 0s linear 200ms;
}

/* Bridges the gap between the trigger and the panel, so a pointer travelling
   down to it never leaves the menu on the way. */
.nav-audience__panel::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 100%;
  height: calc(var(--nav-panel-gap) + 4px);
}

.nav-audience.is-open .nav-audience__panel {
  opacity: 1;
  visibility: visible;
  transform: translate3d(-50%, 0, 0);
  transition:
    opacity 180ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 260ms cubic-bezier(0.16, 1, 0.3, 1),
    visibility 0s;
}

.nav-audience__item {
  --ti-rest: #fff;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  column-gap: 16px;
  row-gap: 3px;
  padding: 12px 14px;
  border-radius: 11px;
  color: #fff;
  text-decoration: none;
  transition: background-color 160ms ease-out;
}

.nav-audience__title {
  font-family: var(--liftag-font-body);
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  letter-spacing: -0.005em;
}

.nav-audience__hint {
  grid-column: 1;
  color: var(--liftag-fg-soft);
  font-family: var(--liftag-font-body);
  font-size: 13px;
  line-height: 1.45;
  text-wrap: pretty;
}

.nav-audience__arrow {
  grid-column: 2;
  grid-row: 1 / span 2;
  stroke: var(--liftag-primary);
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0;
  transform: translate3d(-4px, 0, 0);
  transition:
    opacity 160ms ease-out,
    transform 260ms cubic-bezier(0.16, 1, 0.3, 1);
}

@media (hover: hover) and (pointer: fine) {
  .nav-audience__item:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .nav-audience__item:hover .nav-audience__title {
    color: var(--liftag-primary);
  }

  .nav-audience__item:hover .nav-audience__arrow {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.nav-audience__item:focus-visible {
  outline: 1px solid rgba(204, 255, 0, 0.55);
  outline-offset: -1px;
  background: rgba(255, 255, 255, 0.05);
}

.nav-audience__item:focus-visible .nav-audience__title {
  color: var(--liftag-primary);
}

.nav-audience__item:focus-visible .nav-audience__arrow {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}

.nav-center-links {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  align-items: center;
  gap: 32px;
  transform: translate(-50%, -50%);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  opacity: 0;
  transform: translate3d(22px, -12px, 0);
  animation: navActionsIn 760ms cubic-bezier(0.16, 1, 0.3, 1) 640ms both;
}

.nav-app-cta-wrap {
  display: inline-flex;
}

.nav-app-cta {
  position: relative;
  display: inline-flex;
  align-items: center;
  overflow: hidden;
  padding: 10px 20px;
  font-size: 11px;
  box-shadow: 0 0 24px rgba(204, 255, 0, 0.32);
  /* Was a <button> until it gained a real destination; as a link it picks up
     the global anchor underline, which .btn-primary never had to suppress. */
  text-decoration: none;
}

.nav-app-cta::before {
  content: '';
  position: absolute;
  inset: -1px;
  pointer-events: none;
  background: linear-gradient(100deg, transparent 15%, rgba(255, 255, 255, 0.5), transparent 42%);
  transform: translateX(-150%);
  animation: navCtaSheen 1100ms cubic-bezier(0.16, 1, 0.3, 1) 900ms both;
}

.nav-dashboard-cta {
  padding: 10px 18px;
  font-size: 11px;
  line-height: 1;
  text-decoration: none;
}

.nav-mobile-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #fff;
}

.nav-mobile-toggle .line {
  fill: none;
  stroke: currentColor;
  stroke-width: 7;
  opacity: 1;
  transition:
    stroke-dasharray 600ms cubic-bezier(0.4, 0, 0.2, 1),
    stroke-dashoffset 600ms cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-mobile-toggle .line1 {
  stroke-dasharray: 60 207;
}

.nav-mobile-toggle .line2 {
  stroke-dasharray: 60 60;
}

.nav-mobile-toggle .line3 {
  stroke-dasharray: 60 207;
}

.site-nav.is-open .nav-mobile-toggle .line1 {
  stroke-dasharray: 90 207;
  stroke-dashoffset: -134;
}

.site-nav.is-open .nav-mobile-toggle .line2 {
  stroke-dasharray: 1 60;
  stroke-dashoffset: -30;
}

.site-nav.is-open .nav-mobile-toggle .line3 {
  stroke-dasharray: 90 207;
  stroke-dashoffset: -134;
}

.nav-mobile-drawer:not(.is-open) :deep(.get-app-btn),
.nav-mobile-drawer:not(.is-open) :deep(.get-app-btn)::before,
.nav-mobile-drawer:not(.is-open) :deep(.get-app-btn)::after,
.nav-mobile-drawer:not(.is-open) :deep(.get-app-btn .get-app-btn__shine) {
  animation: none;
}

.nav-mobile-drawer {
  position: fixed;
  top: var(--liftag-nav-h, calc(60px + var(--liftag-safe-top) + var(--liftag-vv-top)));
  left: 0;
  right: 0;
  z-index: 99;
  box-sizing: border-box;
  /* Follow the measured bar, including language controls and safe-area insets. */
  max-height: calc(var(--liftag-stable-vh) - var(--liftag-nav-h, 60px));
  padding:
    20px
    max(24px, var(--liftag-safe-right))
    calc(24px + var(--liftag-safe-bottom))
    max(24px, var(--liftag-safe-left));
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  /* Heavier tint than the bar (0.55): the drawer covers most of the phone
     screen and carries 28px display type, so it needs more backing contrast. */
  background: rgba(0, 0, 0, 0.7);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translate3d(0, calc(-100% - 2px), 0);
  transition:
    transform 320ms cubic-bezier(0.16, 1, 0.3, 1),
    opacity 180ms ease-out,
    visibility 0s linear 320ms,
    backdrop-filter 0s linear 320ms;
  /* No `contain: paint` here: it makes the drawer its own backdrop root, so the
     blur below would sample nothing and render as flat tint. The overflow
     rules on this same block already provide the clipping it was there for. */
}

/* The blur lives on .is-open rather than on the base rule, for the same reason
   it is left off .site-nav's base state (see the note above that rule): a
   declared backdrop-filter makes this element a backdrop root, and this drawer
   is fixed, full width, and covers most of the hero. Declaring it only while
   the drawer is actually shown keeps the closed state out of that path.

   The 320ms delay in the transition above is what keeps this invisible:
   backdrop-filter interpolates discretely, so `none` flips back in one step
   once the panel has finished sliding out, rather than dropping the blur under
   a still-visible panel on the first frame of the close. */
.nav-mobile-drawer.is-open {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translate3d(0, 0, 0);
  backdrop-filter: blur(20px) saturate(140%);
  transition-delay: 0s;
}

.nav-drawer-link {
  color: #fff;
  text-decoration: none;
  font-family: var(--liftag-font-headline);
  font-weight: 700;
  font-style: italic;
  font-size: 28px;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  transition: color 200ms ease;
}

.nav-drawer-link:hover,
.nav-drawer-link.is-active {
  color: #CCFF00;
}

/* The drawer's rows are full width, so the lock reads as a lit edge instead of
   a reticle: a glowing lime rule on the left with light washing into the row,
   and the label stepped in to make room for it. */
.nav-drawer-link.is-active {
  position: relative;
  padding-left: 18px;
  text-shadow: 0 0 22px rgba(204, 255, 0, 0.3);
  background: linear-gradient(90deg, rgba(204, 255, 0, 0.1), rgba(204, 255, 0, 0.02) 45%, transparent 75%);
}

.nav-drawer-link.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 12px;
  bottom: 12px;
  width: 2px;
  background: var(--liftag-primary);
  box-shadow: 0 0 10px rgba(204, 255, 0, 0.8), 0 0 24px rgba(204, 255, 0, 0.35);
  transform-origin: center;
  transform: scaleY(0);
  transition: transform 520ms cubic-bezier(0.16, 1, 0.3, 1) 180ms;
}

.nav-mobile-drawer.is-open .nav-drawer-link.is-active::before {
  transform: scaleY(1);
}

.nav-drawer-pages {
  display: flex;
  flex-direction: column;
}

/* The audiences sit under the pages as a quieter group: a label naming what
   the three have in common, then one row each with the line that says what
   that side of LIFTAG does. Smaller type than the pages above, so the drawer
   reads as pages first and audiences second rather than eight equal shouts. */
.nav-drawer-audience {
  display: flex;
  flex-direction: column;
  margin-top: 28px;
}

.nav-drawer-audience__label {
  margin: 0 0 4px;
  color: var(--liftag-fg-dim);
  font-family: var(--liftag-font-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.nav-drawer-audience__item {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  column-gap: 16px;
  row-gap: 2px;
  padding: 14px 0;
  border-bottom: 1px solid var(--liftag-border-soft);
  color: #fff;
  text-decoration: none;
}

.nav-drawer-audience__title {
  font-family: var(--liftag-font-headline);
  font-size: 19px;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.015em;
  transition: color 200ms ease;
}

.nav-drawer-audience__hint {
  grid-column: 1;
  color: var(--liftag-fg-dim);
  font-family: var(--liftag-font-body);
  font-size: 13px;
  line-height: 1.45;
  text-wrap: pretty;
}

.nav-drawer-audience__arrow {
  grid-column: 2;
  grid-row: 1 / span 2;
  stroke: var(--liftag-primary);
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.nav-drawer-audience__item:hover .nav-drawer-audience__title,
.nav-drawer-audience__item:focus-visible .nav-drawer-audience__title {
  color: var(--liftag-primary);
}

.nav-dashboard-mobile {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 400px;
  min-height: 52px;
  margin-top: 22px;
  padding: 0 18px;
  border: 1px solid rgba(204, 255, 0, 0.5);
  border-radius: 14px;
  background:
    linear-gradient(135deg, rgba(204, 255, 0, 0.14), transparent 44%),
    rgba(7, 10, 8, 0.78);
  color: #CCFF00;
  text-decoration: none;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 0 24px rgba(204, 255, 0, 0.12);
}

.nav-store-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
  padding-bottom: 2px;
  max-width: 400px;
}

.nav-store-buttons :deep(.get-app-btn) {
  width: 100%;
  justify-content: center;
}

@keyframes navShellIn {
  0% {
    opacity: 0;
    transform: translate3d(0, -22px, 0) scaleX(0.92);
    clip-path: inset(0 46% 100% 46% round 999px);
  }
  48% {
    opacity: 1;
    clip-path: inset(0 12% 0 12% round 999px);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scaleX(1);
    clip-path: inset(0 0 0 0 round 0);
  }
}

@keyframes navLightSweep {
  0% { opacity: 0; transform: translateX(-120%); }
  22% { opacity: 0.9; }
  100% { opacity: 0; transform: translateX(120%); }
}

@keyframes navLineIn {
  0% { opacity: 0; transform: scaleX(0); }
  58% { opacity: 0.95; }
  100% { opacity: 0.38; transform: scaleX(1); }
}

@keyframes navBeamBloom {
  0% { opacity: 0; transform: translateX(-50%) scaleX(0.42); }
  45% { opacity: 1; }
  100% { opacity: 0; transform: translateX(-50%) scaleX(1.25); }
}

@keyframes navLogoIn {
  0% { opacity: 0; transform: translate3d(-18px, -10px, 0) rotate(-3deg); }
  100% { opacity: 1; transform: translate3d(0, 0, 0) rotate(0); }
}

@keyframes navMarkRing {
  0% { opacity: 0; transform: scale(0.5) rotate(-28deg); }
  50% { opacity: 1; }
  100% { opacity: 0; transform: scale(1.25) rotate(18deg); }
}

@keyframes navMarkSnap {
  0% { transform: scale(0.62) rotate(-24deg); }
  62% { transform: scale(1.12) rotate(5deg); }
  100% { transform: scale(1) rotate(0); }
}

@keyframes navWordReveal {
  0% { clip-path: inset(0 100% 0 0); transform: translateX(-8px); }
  100% { clip-path: inset(0 -0.16em 0 0); transform: translateX(0); }
}

@keyframes navItemIn {
  0% { opacity: 0; transform: translate3d(0, -14px, 0) skewX(-9deg); }
  100% { opacity: 1; transform: translate3d(0, 0, 0) skewX(0); }
}

@keyframes navActionsIn {
  0% { opacity: 0; transform: translate3d(22px, -12px, 0); }
  100% { opacity: 1; transform: translate3d(0, 0, 0); }
}

@keyframes navCtaSheen {
  0% { opacity: 0; transform: translateX(-150%); }
  25% { opacity: 1; }
  100% { opacity: 0; transform: translateX(150%); }
}

/* Below this the centred row would run into the actions, so it becomes the
   flexible middle of the bar instead. */
@media (max-width: 1600px) {
  .nav-logo,
  .nav-actions {
    flex: 0 0 auto;
  }

  .nav-center-links {
    position: static;
    flex: 1 1 auto;
    justify-content: center;
    min-width: 0;
    margin: 0 clamp(18px, 2vw, 30px);
    gap: clamp(22px, 2vw, 30px);
    transform: none;
  }

  /* The links close up to ~22px apart; pull the reticle in to clear them. */
  .nav-link.is-active {
    --nav-lock-x: -9px;
    --nav-lock-tick: 6px;
  }
}

.nav-language-placeholder {
  display: block;
  flex: 0 0 88px;
  height: 44px;
}

/* Five links and one menu fit a 1200px laptop with room to spare in both
   languages; the hamburger only takes over below that. */
@media (max-width: 1199px) {
  .nav-center-links {
    display: none;
  }

  .nav-mobile-toggle {
    display: flex !important;
  }
}

@media (max-width: 768px) {
  /* At the top of a phone viewport the hero should meet a completely clear
     nav. Bring the lime lower edge in with the same state that enables the
     blurred surface on the first real scroll pixel. */
  .site-nav::after {
    opacity: 0;
    transform: scaleX(0.72);
    animation: none;
    transition:
      opacity 350ms cubic-bezier(0.16, 1, 0.3, 1),
      transform 350ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .site-nav.is-scrolled::after {
    opacity: 0.38;
    transform: scaleX(1);
  }

  .nav-actions {
    animation-delay: 420ms;
  }
}

@media (max-width: 390px) {
  .site-nav {
    padding-left: max(20px, var(--liftag-safe-left));
    padding-right: max(20px, var(--liftag-safe-right));
  }

  .nav-store-buttons {
    gap: 8px;
  }
}

/* Both fallbacks restore the exact opaque values the nav used before the glass
   pass, so anyone who cannot get the blur keeps the previous design rather than
   a translucent bar with nothing behind it. */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .site-nav.is-scrolled,
  .site-nav.is-open {
    background: rgba(0, 0, 0, 0.92);
  }

  .nav-mobile-drawer {
    background: rgba(0, 0, 0, 0.98);
  }
}

@media (prefers-reduced-transparency: reduce) {
  .site-nav.is-scrolled,
  .site-nav.is-open {
    background: rgba(0, 0, 0, 0.92);
    backdrop-filter: none;
  }

  /* .is-open too: it is where the blur is declared, and it out-specifies a bare
     .nav-mobile-drawer no matter which block comes last. */
  .nav-mobile-drawer,
  .nav-mobile-drawer.is-open {
    background: rgba(0, 0, 0, 0.98);
    backdrop-filter: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .nav-link.is-active::before,
  .nav-link.is-active::after {
    animation: none !important;
    transition: none !important;
  }

  .nav-drawer-link.is-active::before {
    transition: none !important;
  }

  .site-nav,
  .site-nav::before,
  .site-nav::after,
  .nav-entry-beam,
  .nav-logo,
  .nav-logo__mark::before,
  .nav-logo__img,
  .nav-logo__wordmark,
  .nav-link,
  .nav-audience,
  .nav-actions,
  .nav-app-cta::before {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    clip-path: none !important;
    filter: none !important;
  }

  .nav-mobile-toggle .line,
  .nav-mobile-drawer {
    transition-duration: 0.01ms !important;
  }

  /* The panel still fades, it just does not travel. IndexedText keeps every
     label whole under this preference, so hover is the colour change alone. */
  .nav-audience__panel,
  .nav-audience.is-open .nav-audience__panel {
    transform: translate3d(-50%, 0, 0);
  }

  .nav-audience__chevron,
  .nav-audience__arrow {
    transition: none;
  }
}

@media (prefers-reduced-motion: reduce) and (max-width: 768px) {
  .site-nav::after {
    opacity: 0 !important;
    transform: scaleX(1) !important;
    transition: none !important;
  }

  .site-nav.is-scrolled::after {
    opacity: 0.38 !important;
  }
}
</style>
