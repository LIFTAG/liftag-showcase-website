<script setup lang="ts">
import { siInstagram, siReddit, siTiktok, siX, siYoutube } from 'simple-icons'
import { en, sk } from '~/i18n/messages/shell'

interface FooterLink {
  key: string
  href: string
}

const { t } = useI18n({ useScope: 'local', messages: { en, sk } })
const { href: localeHref } = useSiteLocale()

const productLinks: FooterLink[] = [
  { key: 'gyms', href: '/explore' }, { key: 'demo', href: '/demo' }, { key: 'calculator', href: '/tools/1rm-calculator' }, { key: 'exercises', href: '/exercises' }, { key: 'machines', href: '/machines' }, { key: 'lifters', href: '/for-lifters' }, { key: 'trainers', href: '/for-trainers' }, { key: 'coach', href: '/become-a-coach' }, { key: 'owners', href: '/for-gyms' }, { key: 'tags', href: '/qr-nfc-gym-tags' }, { key: 'pricing', href: '/pricing' }, { key: 'about', href: '/about' }, { key: 'press', href: '/press' }, { key: 'roadmap', href: '/#roadmap' }, { key: 'partner', href: '/contact/partner' }, { key: 'support', href: '/contact/support' },
]

const libraryLinks: FooterLink[] = [
  { key: 'muscles', href: '/muscles' }, { key: 'chest', href: '/muscles/chest' }, { key: 'back', href: '/muscles/back' }, { key: 'shoulders', href: '/muscles/shoulders' }, { key: 'quads', href: '/muscles/quadriceps' }, { key: 'hamstrings', href: '/muscles/hamstrings' }, { key: 'glutes', href: '/muscles/glutes' }, { key: 'abs', href: '/muscles/abs' }, { key: 'bench', href: '/exercises/barbell-bench-press' }, { key: 'squat', href: '/exercises/barbell-back-squat' }, { key: 'deadlift', href: '/exercises/conventional-deadlift' },
]

const guideLinks: FooterLink[] = [
  { key: 'articles', href: '/journal' }, { key: 'bestTracking', href: '/best-workout-tracking-app' }, { key: 'bestGym', href: '/best-gym-qr-nfc-app' }, { key: 'bestLogger', href: '/journal/best-workout-logger' }, { key: 'freeTracker', href: '/journal/best-free-workout-tracker' }, { key: 'vsHevy', href: '/alternatives/hevy' }, { key: 'vsStrong', href: '/vs/strong' }, { key: 'comparison', href: '/journal/strong-vs-hevy-vs-liftag' }, { key: 'logger', href: '/journal/workout-logger' }, { key: 'howTrack', href: '/journal/how-to-track-workouts' }, { key: 'powerlifting', href: '/journal/best-workout-app-for-powerlifting' }, { key: 'qrTracking', href: '/journal/qr-nfc-gym-tracking' }, { key: 'nfcTags', href: '/journal/nfc-tags-for-gym-equipment' }, { key: 'rpe', href: '/journal/what-is-rpe-lifting' }, { key: 'overload', href: '/journal/progressive-overload' }, { key: 'oneRmPaper', href: '/journal/fitbod-1rm-formula' }, { key: 'rollout', href: '/journal/gym-nfc-rollout' },
]

const legalLinks: FooterLink[] = [
  { key: 'privacy', href: '/privacy-policy' }, { key: 'terms', href: '/terms-and-conditions' },
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

// The social buttons carry no text, so their index swaps the icon itself: one
// copy leaves through the top of a 20px window as a lime duplicate arrives from
// below, on the nav's travel and curve. The duplicate rides the same gate as
// IndexedText's split - it is a second full simple-icons path, and neither a
// crawler nor a phone has any use for it.
const iconIndexed = useIndexedTextSplit('hover')

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
          :alt="t('shell.nav.logoAlt')"
          />
          <span class="footer-wordmark">LIFTAG</span>
        </div>
        <p class="footer-tagline">
          {{ t('shell.footer.tagline') }}
        </p>
        <div class="footer-badges">
          <!-- LaunchBuff go-live check: crawler looks for this product href on liftag.fit. -->
          <a
            href="https://launchbuff.com/products/liftag-q97d57"
            class="footer-badge"
            target="_blank"
            rel="noopener noreferrer"
            :title="t('shell.footer.featuredLaunchBuff')"
          >
            <img
              src="https://launchbuff.com/badge-featured-dark.svg"
              :alt="t('shell.footer.featuredLaunchBuff')"
              width="256"
              height="80"
              loading="lazy"
              decoding="async"
            />
          </a>
          <!-- Launchstag free listing: crawler looks for this product href on liftag.fit. -->
          <a
            href="https://launchstag.com/p/liftag"
            class="footer-badge"
            target="_blank"
            rel="noopener noreferrer"
            :title="t('shell.footer.featuredLaunchstag')"
          >
            <img
              src="https://launchstag.com/badge-dark.svg"
              :alt="t('shell.footer.featuredLaunchstag')"
              width="198"
              height="62"
              loading="lazy"
              decoding="async"
            />
          </a>
        </div>
      </div>

      <!-- Every hoverable label below carries the nav's character index; the two
           column headings that are not links keep plain text. -->
      <div class="footer-col">
        <a :href="localeHref('/#all-in-one')" class="protocol footer-col-heading footer-heading-link ti-host">
          <IndexedText :text="t('shell.footer.product')" />
        </a>
        <ul class="footer-link-list">
          <li v-for="item in productLinks" :key="item.key">
            <a :href="localeHref(item.href)" class="footer-link ti-host"><IndexedText :text="t(`shell.footer.links.${item.key}`)" /></a>
          </li>
        </ul>
      </div>

      <div class="footer-col">
        <NuxtLink :to="localeHref('/muscles')" class="protocol footer-col-heading footer-heading-link ti-host">
          <IndexedText :text="t('shell.footer.library')" />
        </NuxtLink>
        <ul class="footer-link-list">
          <li v-for="item in libraryLinks" :key="item.key">
            <a :href="localeHref(item.href)" class="footer-link ti-host"><IndexedText :text="t(`shell.footer.links.${item.key}`)" /></a>
          </li>
        </ul>
      </div>

      <div class="footer-col">
        <NuxtLink :to="localeHref('/journal')" class="protocol footer-col-heading footer-heading-link ti-host">
          <IndexedText :text="t('shell.footer.journal')" />
        </NuxtLink>
        <ul class="footer-link-list">
          <li v-for="item in guideLinks" :key="item.key">
            <a :href="localeHref(item.href)" class="footer-link ti-host"><IndexedText :text="t(`shell.footer.links.${item.key}`)" /></a>
          </li>
        </ul>
      </div>

      <div class="footer-col">
        <span class="protocol footer-col-heading">{{ t('shell.footer.legal') }}</span>
        <ul class="footer-link-list">
          <li v-for="item in legalLinks" :key="item.key">
            <a :href="localeHref(item.href)" class="footer-link ti-host"><IndexedText :text="t(`shell.footer.links.${item.key}`)" /></a>
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
      <span class="protocol footer-copy">{{ t('shell.footer.copyright') }}</span>
      <div class="footer-bottom-actions">
        <div class="footer-socials">
          <a
            v-for="social in socialLinks"
            :key="social.key"
            :href="social.href"
            class="footer-social-link"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="t(`shell.footer.social.${social.key}`)"
          >
            <span class="footer-social-index" :class="{ 'is-indexed': iconIndexed }">
              <svg
                class="footer-social-icon footer-social-icon--out"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path :d="social.path" />
              </svg>
              <svg
                v-if="iconIndexed"
                class="footer-social-icon footer-social-icon--in"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path :d="social.path" />
              </svg>
            </span>
          </a>
        </div>
        <span class="protocol footer-stores">{{ t('shell.footer.available') }} <a :href="localeHref('/get')" class="footer-stores-link ti-host"><IndexedText :text="t('shell.app.mobile')" /></a></span>
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

.footer-badges {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  margin-top: 20px;
}

.footer-badge {
  display: inline-block;
  line-height: 0;
  border-radius: 12px;
  outline: none;
  transition:
    opacity 200ms ease,
    transform 200ms ease;
}

.footer-badge img {
  display: block;
  width: 200px;
  max-width: 100%;
  height: auto;
}

.footer-badge:focus-visible {
  outline: 2px solid var(--liftag-primary);
  outline-offset: 3px;
}

@media (hover: hover) and (pointer: fine) {
  .footer-badge:hover {
    transform: translateY(-1px);
  }
}

.footer-col-heading {
  display: inline-block;
  color: #CCFF00;
  margin-bottom: 16px;
}

/* --ti-rest / --ti-accent are the two ends of the character index (see the
   .ti-* block in main.css): the colour the label rests on, and the colour the
   arriving copy carries. They restate the values the :hover rules below already
   use, because those rules are the fallback for anyone who never gets the split
   and would otherwise drag the outgoing copy along with the arriving one. */
.footer-heading-link {
  --ti-rest: #CCFF00;
  --ti-accent: #fff;
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
  --ti-rest: rgba(255, 255, 255, 0.7);
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

/* The icon's own index window. Sized to the icon so the travel is exactly one
   icon height, and an overflow rather than a clip-path is fine here: it is a
   flex item, so nothing downstream reads its baseline. */
.footer-social-index {
  position: relative;
  display: block;
  width: 20px;
  height: 20px;
  flex: 0 0 auto;
  overflow: hidden;
}

.footer-social-icon {
  display: block;
  width: 20px;
  height: 20px;
  flex: 0 0 auto;
  transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* Pinned to the resting tint so the link's own hover colour - the fallback when
   there is no duplicate to swap in - does not follow the icon out of the window. */
.footer-social-index.is-indexed .footer-social-icon--out {
  color: rgba(255, 255, 255, 0.54);
}

.footer-social-icon--in {
  position: absolute;
  inset: 0;
  color: var(--liftag-primary);
  transform: translate3d(0, 100%, 0);
}

@media (hover: hover) and (pointer: fine) {
  .footer-social-link:hover .footer-social-icon--out,
  .footer-social-link:focus-visible .footer-social-icon--out {
    transform: translate3d(0, -100%, 0);
  }

  .footer-social-link:hover .footer-social-icon--in,
  .footer-social-link:focus-visible .footer-social-icon--in {
    transform: translate3d(0, 0, 0);
  }

  .footer-social-link:hover .footer-social-icon,
  .footer-social-link:focus-visible .footer-social-icon {
    transition-duration: 500ms;
  }
}

/* Only reachable if the preference flips mid-session, before the duplicate is
   dropped from the render. */
@media (prefers-reduced-motion: reduce) {
  .footer-social-icon {
    transition: none !important;
  }

  .footer-social-icon--out {
    transform: none !important;
  }

  .footer-social-icon--in {
    display: none !important;
  }
}

.footer-copy,
.footer-stores {
  color: #a8a8a8;
}

/* Restates .footer-stores' own colour rather than inheriting it: --ti-rest is
   substituted into `color`, so `inherit` there would resolve against the link,
   which is exactly the value being overridden on hover. */
.footer-stores-link {
  --ti-rest: #a8a8a8;
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
