<script setup lang="ts">
import { siInstagram, siReddit, siTiktok, siX, siYoutube } from 'simple-icons'

interface FooterLink {
  label: string
  href: string
}

const productLinks: FooterLink[] = [
  { label: 'Demo', href: '/#demo' },
  { label: 'Exercise Library', href: '/exercises' },
  { label: 'Machine Catalog', href: '/machines' },
  { label: 'For Lifters', href: '/for-lifters' },
  { label: 'For Trainers', href: '/for-trainers' },
  { label: 'Become a Coach', href: '/become-a-coach' },
  { label: 'For Gyms', href: '/for-gyms' },
  { label: 'NFC + QR Tags', href: '/qr-nfc-gym-tags' },
  { label: 'Roadmap', href: '/#roadmap' },
  { label: 'Partner with us', href: '/contact/partner' },
  { label: 'Support', href: '/contact/support' },
]

const libraryLinks: FooterLink[] = [
  { label: 'All muscles', href: '/muscles' },
  { label: 'Chest', href: '/muscles/chest' },
  { label: 'Back', href: '/muscles/back' },
  { label: 'Shoulders', href: '/muscles/shoulders' },
  { label: 'Quads', href: '/muscles/quadriceps' },
  { label: 'Hamstrings', href: '/muscles/hamstrings' },
  { label: 'Glutes', href: '/muscles/glutes' },
  { label: 'Abs', href: '/muscles/abs' },
  { label: 'Bench press', href: '/exercises/barbell-bench-press' },
  { label: 'Back squat', href: '/exercises/barbell-back-squat' },
  { label: 'Deadlift', href: '/exercises/conventional-deadlift' },
]

const guideLinks: FooterLink[] = [
  { label: 'All Guides', href: '/guides' },
  { label: 'Best Workout Tracking App', href: '/best-workout-tracking-app' },
  { label: 'Best Gym QR + NFC App', href: '/best-gym-qr-nfc-app' },
  { label: 'Best Free Workout Tracker', href: '/guides/best-free-workout-tracker' },
  { label: 'Strong vs Hevy vs LIFTAG', href: '/guides/strong-vs-hevy-vs-liftag' },
  { label: 'How to Track Workouts', href: '/guides/how-to-track-workouts' },
  { label: 'Best App for Powerlifting', href: '/guides/best-workout-app-for-powerlifting' },
  { label: 'QR + NFC Gym Tracking', href: '/guides/qr-nfc-gym-tracking' },
  { label: 'NFC Tags for Gym Equipment', href: '/guides/nfc-tags-for-gym-equipment' },
]

const legalLinks: FooterLink[] = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms & Conditions', href: '/terms-and-conditions' },
]

const socialLinks = [
  {
    key: 'instagram',
    href: 'https://www.instagram.com/liftag.fit/',
    aria: 'Liftag on Instagram',
    path: siInstagram.path,
  },
  {
    key: 'tiktok',
    href: 'https://www.tiktok.com/@liftag',
    aria: 'Liftag on TikTok',
    path: siTiktok.path,
  },
  {
    key: 'x',
    href: 'https://x.com/liftag_fit',
    aria: 'Liftag on X',
    path: siX.path,
  },
  {
    key: 'youtube',
    href: 'https://www.youtube.com/@liftag_fit',
    aria: 'Liftag on YouTube',
    path: siYoutube.path,
  },
  {
    key: 'reddit',
    href: 'https://www.reddit.com/r/liftag/',
    aria: 'Liftag on Reddit',
    path: siReddit.path,
  },
] as const

const markWord = 'LIFTAG'
const outlineFilterId = 'footer-mark-union-outline'
const route = useRoute()
const compactHandoff = computed(() => /^\/(?:exercises|machines|muscles)(?:\/|$)/.test(route.path))

const markRef = ref<HTMLElement | null>(null)

let motionMql: MediaQueryList | null = null
let reduceMotion = false

function setFill(p: number) {
  const el = markRef.value
  if (!el) return
  el.style.setProperty('--fill-p', p.toFixed(4))
  el.classList.toggle('is-complete', p >= 1)
}

function updateFill() {
  const el = markRef.value
  if (!el || reduceMotion) return
  const rect = el.getBoundingClientRect()
  const vh = window.innerHeight
  const scroller = document.scrollingElement || document.documentElement
  const maxScroll = Math.max(0, scroller.scrollHeight - window.innerHeight)
  const y = window.scrollY || scroller.scrollTop
  const atEnd = maxScroll <= 0 || y >= maxScroll - 64
  // Finish once most of the word is on screen. Requiring the mark bottom to
  // reach the viewport leaves the last letter (G) outlined at page end.
  const entered = vh - rect.top
  const travel = Math.max(1, rect.height * 0.65)
  setFill(atEnd ? 1 : Math.min(1, Math.max(0, entered / travel)))
}

// updateFill reads getBoundingClientRect + scrollHeight, so running it raw on
// every scroll event forces a layout per event. One rAF per burst is enough:
// the fill can only change once per painted frame anyway.
let fillRaf = 0

function scheduleFill() {
  if (fillRaf !== 0) return
  fillRaf = requestAnimationFrame(() => {
    fillRaf = 0
    updateFill()
  })
}

function onMotionChange() {
  reduceMotion = Boolean(motionMql?.matches)
  if (reduceMotion) setFill(1)
  else updateFill()
}

onMounted(() => {
  motionMql = window.matchMedia('(prefers-reduced-motion: reduce)')
  reduceMotion = motionMql.matches
  motionMql.addEventListener('change', onMotionChange)
  if (reduceMotion) setFill(1)
  else updateFill()

  window.addEventListener('scroll', scheduleFill, { passive: true })
  window.addEventListener('resize', scheduleFill)
})

onBeforeUnmount(() => {
  motionMql?.removeEventListener('change', onMotionChange)
  motionMql = null
  window.removeEventListener('scroll', scheduleFill)
  window.removeEventListener('resize', scheduleFill)
  if (fillRaf !== 0) {
    cancelAnimationFrame(fillRaf)
    fillRaf = 0
  }
})
</script>

<template>
  <footer class="site-footer" :class="{ 'site-footer--compact': compactHandoff }">
    <div class="container footer-grid">
      <!-- Logo + tagline column -->
      <div class="footer-col">
        <div class="footer-brand">
          <img
            src="/assets/logo.svg"
            width="32"
            height="32"
            class="footer-logo-img"
            alt="LIFTAG logo"
          />
          <span class="footer-wordmark">LIFTAG</span>
        </div>
        <p class="footer-tagline">
          Because serious training deserves more than a notes app and a spreadsheet.
        </p>
      </div>

      <div class="footer-col">
        <a href="/#all-in-one" class="protocol footer-col-heading footer-heading-link">Product</a>
        <ul class="footer-link-list">
          <li v-for="item in productLinks" :key="item.label">
            <a :href="item.href" class="footer-link">{{ item.label }}</a>
          </li>
        </ul>
      </div>

      <div class="footer-col">
        <NuxtLink to="/muscles" class="protocol footer-col-heading footer-heading-link">Library</NuxtLink>
        <ul class="footer-link-list">
          <li v-for="item in libraryLinks" :key="item.label">
            <a :href="item.href" class="footer-link">{{ item.label }}</a>
          </li>
        </ul>
      </div>

      <div class="footer-col">
        <span class="protocol footer-col-heading">Guides</span>
        <ul class="footer-link-list">
          <li v-for="item in guideLinks" :key="item.label">
            <a :href="item.href" class="footer-link">{{ item.label }}</a>
          </li>
        </ul>
      </div>

      <div class="footer-col">
        <span class="protocol footer-col-heading">Legal</span>
        <ul class="footer-link-list">
          <li v-for="item in legalLinks" :key="item.label">
            <a :href="item.href" class="footer-link">{{ item.label }}</a>
          </li>
        </ul>
      </div>

    </div>

    <!-- Bottom bar -->
    <div
      class="container"
      style="
        margin-top: 48px;
        padding-top: 24px;
        border-top: 1px solid rgba(255,255,255,0.05);
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
      "
    >
      <span class="protocol" style="color: #666;">© 2026 LIFTAG · BRATISLAVA · BUILT BY LIFTERS</span>
      <div class="footer-bottom-actions">
        <div class="footer-socials">
          <a
            v-for="social in socialLinks"
            :key="social.key"
            :href="social.href"
            class="footer-social-link"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="social.aria"
          >
            <svg
              class="footer-social-icon"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path :d="social.path" />
            </svg>
          </a>
        </div>
        <span class="protocol footer-stores">Available on · <a href="/get" class="footer-stores-link">IOS AND ANDROID</a></span>
      </div>
    </div>

    <div ref="markRef" class="footer-mark" aria-hidden="true">
      <svg class="footer-mark-fx" focusable="false">
        <filter
          :id="outlineFilterId"
          x="-12%"
          y="-30%"
          width="124%"
          height="160%"
          color-interpolation-filters="sRGB"
        >
          <feMorphology in="SourceAlpha" operator="dilate" radius="1" result="spread" />
          <feComposite in="spread" in2="SourceAlpha" operator="out" result="ring" />
          <feFlood flood-color="#CCFF00" flood-opacity="0.3" result="lime" />
          <feComposite in="lime" in2="ring" operator="in" />
        </filter>
      </svg>
      <div
        class="footer-mark-row footer-mark-outline"
        :style="{ filter: `url(#${outlineFilterId})` }"
      >{{ markWord }}</div>
      <div class="footer-mark-row footer-mark-bloom">{{ markWord }}</div>
      <div class="footer-mark-row footer-mark-fill">{{ markWord }}</div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background: #000;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  /* Last thing on the page, so it is what the home indicator overlaps. */
  padding:
    60px
    max(32px, var(--liftag-safe-right))
    calc(56px + var(--liftag-safe-bottom))
    max(32px, var(--liftag-safe-left));
}

.site-footer--compact {
  padding-top: 32px;
}

.footer-mark {
  --fill-p: 0;
  position: relative;
  display: grid;
  justify-content: center;
  margin: 48px auto 0;
  max-width: 100%;
  padding: 0.08em 0.22em 0.2em;
  pointer-events: none;
}

.footer-mark-row {
  display: block;
  text-align: center;
  font-family: var(--liftag-font-headline);
  font-weight: 700;
  font-style: italic;
  font-size: clamp(88px, 15vw, 240px);
  letter-spacing: -0.07em;
  line-height: 0.8;
  text-transform: uppercase;
  text-wrap: nowrap;
  user-select: none;
  padding: 0.02em 0.2em 0.06em;
}

.footer-mark-fx {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  pointer-events: none;
}

.footer-mark-outline {
  grid-area: 1 / 1;
  color: #000;
}

.footer-mark-bloom {
  grid-area: 1 / 1;
  color: var(--liftag-primary);
  filter: blur(18px);
  opacity: 0.5;
  -webkit-mask-image: linear-gradient(
    to right,
    #000 0,
    #000 calc(var(--fill-p, 0) * 100% - 5%),
    transparent calc(var(--fill-p, 0) * 100% + 8%)
  );
  mask-image: linear-gradient(
    to right,
    #000 0,
    #000 calc(var(--fill-p, 0) * 100% - 5%),
    transparent calc(var(--fill-p, 0) * 100% + 8%)
  );
}

.footer-mark-fill {
  grid-area: 1 / 1;
  color: var(--liftag-primary);
  clip-path: inset(0 max(0%, calc((1 - var(--fill-p, 0)) * 100% - 0.28em)) 0 0);
}

.footer-mark.is-complete .footer-mark-fill {
  clip-path: none;
}

.footer-mark.is-complete .footer-mark-bloom {
  -webkit-mask-image: none;
  mask-image: none;
}

@media (prefers-reduced-motion: reduce) {
  .footer-mark-fill {
    clip-path: none;
    opacity: 0.9;
  }

  .footer-mark-bloom {
    -webkit-mask-image: none;
    mask-image: none;
    opacity: 0.35;
  }

  .footer-col {
    transition-delay: 0ms;
  }
}

.footer-grid {
  display: grid;
  grid-template-columns: minmax(220px, 1.2fr) minmax(140px, 0.65fr) minmax(140px, 0.65fr) minmax(170px, 0.7fr) minmax(140px, 0.55fr);
  gap: 48px;
  overflow-x: clip;
}

@media (max-width: 960px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 36px;
  }
}

@media (max-width: 560px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.footer-logo-img {
  filter: drop-shadow(0 0 14px rgba(204, 255, 0, 0.5));
}

.footer-wordmark {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  font-style: italic;
  font-size: 24px;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  color: #fff;
}

.footer-tagline {
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  font-weight: 300;
  line-height: 1.6;
  max-width: 280px;
  margin: 0;
}

.footer-col-heading {
  display: inline-block;
  color: #CCFF00;
  margin-bottom: 16px;
}

.footer-heading-link {
  text-decoration: none;
  transition: color 200ms ease;
}

.footer-heading-link:hover {
  color: #fff;
}

.footer-link-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-link {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 13px;
  font-weight: 400;
  transition: color 200ms ease;
}

.footer-link:hover {
  color: #CCFF00;
}

.footer-bottom-actions {
  display: inline-flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
}

.footer-socials {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.footer-social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: rgba(255, 255, 255, 0.54);
  text-decoration: none;
  transition:
    color 200ms ease,
    transform 200ms ease;
}

@media (hover: hover) and (pointer: fine) {
  .footer-social-link:hover {
    color: #CCFF00;
    transform: translateY(-1px);
  }
}

.footer-social-icon {
  display: block;
  width: 20px;
  height: 20px;
  flex: 0 0 auto;
}

.footer-stores {
  color: #666;
}

.footer-stores-link {
  color: inherit;
  text-decoration: none;
  transition: color 200ms ease;
}

@media (hover: hover) and (pointer: fine) {
  .footer-stores-link:hover {
    color: #CCFF00;
  }
}
</style>
