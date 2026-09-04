<script setup lang="ts">
import { scrollToTrainerHandoff } from '~/utils/dashboardScroll'

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

// True when the browser drives the progress hairline natively via
// animation-timeline: scroll(); the JS fallback then never writes the var.
let nativeScrollTimeline = false

const isHomeLike = computed(() => route.path === '/' || route.path === '/gym-scan')
const sectionHref = (hash: string) => isHomeLike.value ? hash : `/${hash}`

// Per-character spans for the desktop nav's hover index (see .nav-link__char).
// Array.from, not split(''), so an accented or non-BMP label would still index
// one glyph at a time rather than tearing a surrogate pair in half.
const navChars = (label: string) => Array.from(label)

const navLinks = computed<[string, string][]>(() => [
  ['Demo', '/gym-scan'],
  ['Lifters', sectionHref('#lifters')],
  ['Gyms', sectionHref('#gyms')],
  ['Trainers', sectionHref('#trainers')],
  ['Exercises', '/exercises'],
  ['Journal', '/journal'],
  ['Pricing', '/pricing'],
])

// "Trainers" is the MacBook coach chapter, not TrainersSection. Direct
// `#trainers` loads are handled in plugins/trainer-hash-scroll.client.ts;
// this intercepts same-page nav clicks (pushState would not run Vue Router).
function onNavLinkClick(label: string, href: string, event: MouseEvent) {
  if (label !== 'Trainers' || !isHomeLike.value) return
  if (!document.getElementById('dashboard')) return

  event.preventDefault()
  window.history.pushState(null, '', href)
  scrollToTrainerHandoff()
}

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
    <a href="/" class="nav-logo">
      <span class="nav-logo__mark">
        <img
          src="/assets/logo.svg"
          width="28"
          height="28"
          class="nav-logo__img"
          alt="LIFTAG logo"
        />
      </span>
      <span class="nav-logo__wordmark">LIFTAG</span>
    </a>

    <!-- Desktop nav links. The label is split into characters so hover can
         index them through their own clip windows; the real text stays in the
         DOM for crawlers, and aria-label carries the accessible name so a
         screen reader never has to reassemble the split run. -->
    <nav class="nav-desktop nav-center-links">
      <a
        v-for="[label, href] in navLinks"
        :key="label"
        :href="href"
        class="nav-link"
        :aria-label="label"
        @click="onNavLinkClick(label, href, $event)"
      ><span class="nav-link__chars" aria-hidden="true"><span
        v-for="(char, index) in navChars(label)"
        :key="index"
        class="nav-link__char"
        :data-char="char"
        :style="{ '--i': index }"
      ><span class="nav-link__glyph">{{ char }}</span></span></span></a>
    </nav>

    <!-- Right side: CTA + hamburger -->
    <div class="nav-actions" style="display: flex; align-items: center; gap: 12px;">
      <!-- Desktop CTA -->
      <a
        href="https://app.liftag.fit/login"
        rel="nofollow"
        class="btn-ghost nav-desktop nav-dashboard-cta"
      >
        <HoloPill />Dashboard
      </a>
      <span data-magnetic class="nav-desktop" style="display: inline-flex;">
        <NuxtLink
          to="/get"
          class="btn-primary nav-app-cta"
          style="padding: 10px 20px; font-size: 11px; box-shadow: 0 0 24px rgba(204,255,0,0.4);"
          @click="open = false"
        >
          Get the app
        </NuxtLink>
      </span>

      <!-- Mobile hamburger: same 600ms stroke-dash morph as Tenus. -->
      <button
        type="button"
        class="nav-mobile-toggle"
        @click="open = !open"
        aria-label="Toggle menu"
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
    <nav style="display: flex; flex-direction: column; gap: 0;">
      <a
        v-for="[label, href] in navLinks"
        :key="label"
        :href="href"
        class="nav-drawer-link"
        @click="open = false; onNavLinkClick(label, href, $event)"
      >{{ label }}</a>
    </nav>
    <a
      href="https://app.liftag.fit/login"
      rel="nofollow"
      class="nav-dashboard-mobile"
      @click="open = false"
    >
      Dashboard
    </a>
    <div class="nav-store-buttons">
      <GetAppBtn label="Get the app" />
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

.site-nav {
  overflow: hidden;
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

.nav-link {
  color: #fff;
  text-decoration: none;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  position: relative;
  /* Flex rather than inline text: a character window is an overflow: hidden
     inline-block, whose baseline is its bottom edge, so leaving these in a
     line box would drop the whole row against the logo and the CTA. The
     symmetric padding is hit area only; the row is centred either way. */
  display: inline-flex;
  align-items: center;
  padding: 6px 0;
  opacity: 0;
  transform: translate3d(0, -14px, 0) skewX(-9deg);
  animation: navItemIn 700ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.nav-link:nth-child(1) { animation-delay: 360ms; }
.nav-link:nth-child(2) { animation-delay: 430ms; }
.nav-link:nth-child(3) { animation-delay: 500ms; }
.nav-link:nth-child(4) { animation-delay: 570ms; }
.nav-link:nth-child(5) { animation-delay: 640ms; }
.nav-link:nth-child(6) { animation-delay: 710ms; }
.nav-link:nth-child(7) { animation-delay: 780ms; }

/* Hover index. Each character owns a clip window holding two copies of itself
   stacked vertically: the white one in flow, the lime one waiting one full
   window below. Hovering drives both up by exactly one window, so the label is
   not re-coloured, it is indexed - the white glyph leaves through the top as
   the lime one arrives from the bottom, one hard step with no fade and no
   scale. The 12ms per-character offset runs the swap left to right, and both
   copies share the travel and the curve, so the seam between them never opens.
   Rising from below matches the plate-wipe section titles.
   No underline: the swap is the affordance. */
.nav-link__chars {
  display: inline-flex;
}

.nav-link__char {
  position: relative;
  display: inline-block;
  overflow: hidden;
  /* Every label is uppercased, so the window only ever has to clear cap height;
     the leading this leaves is what the glyph exits through. `pre` keeps a
     space-bearing label from collapsing to a zero-width window. */
  line-height: 1.15;
  white-space: pre;
}

.nav-link__glyph,
.nav-link__char::after {
  display: block;
  transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

.nav-link__char::after {
  content: attr(data-char);
  position: absolute;
  left: 0;
  top: 0;
  color: var(--liftag-primary);
  transform: translate3d(0, 100%, 0);
}

.nav-link:hover .nav-link__glyph,
.nav-link:focus-visible .nav-link__glyph {
  transform: translate3d(0, -100%, 0);
}

.nav-link:hover .nav-link__char::after,
.nav-link:focus-visible .nav-link__char::after {
  transform: translate3d(0, 0, 0);
}

/* Stagger and the slower expo travel belong to the entry only. The rest state
   above keeps a flat 300ms with no delay, so pulling the pointer away returns
   every character at once instead of unwinding the stagger back at the reader. */
.nav-link:hover .nav-link__glyph,
.nav-link:focus-visible .nav-link__glyph,
.nav-link:hover .nav-link__char::after,
.nav-link:focus-visible .nav-link__char::after {
  transition-duration: 500ms;
  transition-delay: calc(var(--i) * 12ms);
}

.nav-center-links {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  align-items: center;
  gap: 36px;
  transform: translate(-50%, -50%);
}

.nav-actions {
  opacity: 0;
  transform: translate3d(22px, -12px, 0);
  animation: navActionsIn 760ms cubic-bezier(0.16, 1, 0.3, 1) 640ms both;
}

.nav-app-cta {
  position: relative;
  display: inline-flex;
  align-items: center;
  overflow: hidden;
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
  top: calc(60px + var(--liftag-safe-top) + var(--liftag-vv-top));
  left: 0;
  right: 0;
  z-index: 99;
  box-sizing: border-box;
  /* 60px is the nav's own height; both it and this offset grow by the top
     inset and by the visible-area offset the bar's padding carries, so the
     drawer still hangs off the bar's bottom edge. */
  max-height: calc(var(--liftag-stable-vh) - 60px - var(--liftag-safe-top) - var(--liftag-vv-top));
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

.nav-drawer-link:hover {
  color: #CCFF00;
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

@media (max-width: 1080px) {
  .nav-center-links {
    gap: 24px;
  }

  .nav-link {
    font-size: 10px;
    letter-spacing: 0.16em;
  }
}

@media (max-width: 1240px) {
  .nav-logo,
  .nav-actions {
    flex: 0 0 auto;
  }

  .nav-center-links {
    position: static;
    flex: 1 1 auto;
    justify-content: center;
    min-width: 0;
    margin: 0 clamp(18px, 3vw, 34px);
    gap: clamp(18px, 2.3vw, 30px);
    transform: none;
  }
}

@media (max-width: 980px) {
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
  .site-nav,
  .site-nav::before,
  .site-nav::after,
  .nav-entry-beam,
  .nav-logo,
  .nav-logo__mark::before,
  .nav-logo__img,
  .nav-logo__wordmark,
  .nav-link,
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

  /* The hover index collapses to the colour change it was carrying. The lime
     copy is dropped rather than hidden, so nothing is left stacked under the
     window, and the white glyph is pinned in place - the hover rules above
     would otherwise still drive it out through the top with no replacement. */
  .nav-link__char::after {
    content: none;
  }

  .nav-link__glyph,
  .nav-link:hover .nav-link__glyph,
  .nav-link:focus-visible .nav-link__glyph {
    transform: none !important;
    transition: none !important;
  }

  .nav-link {
    transition: color 200ms ease !important;
  }

  .nav-link:hover,
  .nav-link:focus-visible {
    color: var(--liftag-primary);
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
