<script setup lang="ts">
import { useReveal } from '~/composables/useReveal'

const APP_STORE = 'https://apps.apple.com/app/id6761140080'
const PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.liftag.app'

const description
  = 'Coach where your clients already train. Build your profile inside LIFTAG, get discovered by lifters, share routines, and track real progress. Free while we are in beta.'

useLiftagSeo({
  title: 'Become a Coach on LIFTAG | Train Clients Where They Lift',
  description,
  path: '/become-a-coach',
})

useLiftagStructuredData([
  liftagOrganization,
  liftagMobileApplication,
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: '/' },
    { name: 'Become a Coach', path: '/become-a-coach' },
  ]),
  liftagFAQPage([
    {
      question: 'Does it cost anything to coach on LIFTAG?',
      answer: 'No. Coaching on LIFTAG is free while we are in beta. You can build your profile, manage clients, share routines, and track their progress at no cost.',
    },
    {
      question: 'How do I apply to become a coach?',
      answer: 'Download the LIFTAG app, then open Profile and tap Become a Trainer. Fill out your coach application with your bio, specializations, experience, and location. It takes a couple of minutes, then our team reviews it.',
    },
    {
      question: 'How long does approval take?',
      answer: 'Each application is reviewed by our team. You get a notification the moment a decision is made, and you can keep editing your application while it is still pending.',
    },
    {
      question: 'Can I coach online and in person?',
      answer: 'Yes. You choose whether you offer online coaching, in-person coaching, or both, and set your location so nearby lifters can find you in the directory.',
    },
    {
      question: 'Where do clients find me once I am approved?',
      answer: 'Approved coaches appear in the in-app LIFTAG trainer directory, where lifters search and filter by specialty, experience, gym, and location, then contact you directly.',
    },
  ]),
])

useReveal()

/* ── Hero staggered entrance ── */
const entered = ref(false)
let enterTimer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    entered.value = true
    return
  }
  enterTimer = setTimeout(() => {
    entered.value = true
    enterTimer = null
  }, 80)
})

onBeforeUnmount(() => {
  if (enterTimer) clearTimeout(enterTimer)
})

const heroPills: Array<{ label: string, hot: boolean }> = [
  { label: 'Free while in beta', hot: true },
  { label: 'Online & in-person', hot: false },
  { label: 'Verified coach badge', hot: false },
]

/* ── Why coach here ── */
interface WhyCard {
  title: string
  body: string
  icon: 'chart' | 'coin' | 'badge' | 'devices'
  lime: boolean
}

const whyCards: WhyCard[] = [
  {
    title: 'Tied to real training data',
    body: 'Every routine you write and every rep your client logs live in the same place. No exported spreadsheets, no screenshot threads, no guessing what they actually did.',
    icon: 'chart',
    lime: false,
  },
  {
    title: 'Free while we are in beta',
    body: 'Build your whole roster, online and in person, without a subscription gating your growth. You start coaching today, not after a paywall.',
    icon: 'coin',
    lime: true,
  },
  {
    title: 'A verified, searchable profile',
    body: 'Approved coaches get a verified badge and a spot in the in-app directory lifters actually browse, filtered by specialty, experience, gym, and location.',
    icon: 'badge',
    lime: false,
  },
  {
    title: 'Online and in person, one app',
    body: 'Coach remote clients and the regulars at your gym from a single dashboard. The same product handles discovery, plans, and progress for both.',
    icon: 'devices',
    lime: false,
  },
]

const replaces = ['the notes app', 'the spreadsheet', 'the third-party plan builder', 'the screenshot threads', 'the separate client app']

const specialties = [
  'Strength', 'Powerlifting', 'Bodybuilding', 'Olympic Lifting', 'Nutrition Coaching',
  'Mobility', 'Conditioning', 'Boxing', 'HIIT', 'Weight Loss', 'Yoga', 'Pilates', 'Posture', 'Dance Fitness',
]

/* ── Steps ── */
interface Step {
  no: string
  title: string
  body: string
  store?: boolean
}

const steps: Step[] = [
  {
    no: '01',
    title: 'Download the app',
    body: 'Get LIFTAG free on iOS (Android coming soon) and create your account. It is the same app your future clients use to train, so everything stays in one place.',
    store: true,
  },
  {
    no: '02',
    title: 'Open your coach application',
    body: 'Go to Profile and tap Become a Trainer. Add your bio, specializations, years of experience, location, socials, and whether you coach online, in person, or both.',
  },
  {
    no: '03',
    title: 'We review your profile',
    body: 'Your application goes under review. You get a notification the moment a decision is made, and you can keep editing it while it is still pending.',
  },
  {
    no: '04',
    title: 'Go live and start coaching',
    body: 'Once approved, your profile is published to the trainer directory. Lifters discover you, reach out, and you start building routines and tracking their progress.',
  },
]

/* ── Showcase (what you get) ── */
interface Feature {
  tag: string
  title: string
  body: string
  screen: string
  bullets: string[]
  chip1: { label: string, value: string, sub: string }
  chip2: { label: string, value: string, sub: string }
}

const features: Feature[] = [
  {
    tag: 'YOUR PROFILE',
    title: 'Own how you appear.',
    body: 'Specialisms, years of experience, location, linked gyms, and social links, full control over the profile lifters see when they are choosing a coach.',
    screen: '/assets/screens/coach-profile.webp',
    bullets: ['Verified trainer badge on approval', 'Link your gyms and socials', 'Set online, in-person, or both'],
    chip1: { label: 'PROFILE', value: 'Verified badge', sub: 'active on approval' },
    chip2: { label: 'REACH', value: 'Online & in-person', sub: 'your choice' },
  },
  {
    tag: 'BE DISCOVERED',
    title: 'Clients find you.',
    body: 'Appear in the in-app LIFTAG trainer directory. Lifters browse and filter verified coaches by specialty, experience, gym, and location, then contact you directly.',
    screen: '/assets/screens/trainer-discover.webp',
    bullets: ['Listed in the searchable directory', 'Filtered by specialty & location', 'Lifters reach out directly, no fee'],
    chip1: { label: 'DIRECTORY', value: 'Filter by specialty', sub: 'specialty · gym · location' },
    chip2: { label: 'CONTACT', value: 'Direct to you', sub: 'no paywall, no cut' },
  },
  {
    tag: 'CLIENT PROGRESS',
    title: 'See every rep they log.',
    body: 'Review real set history, volume trends, PRs, and estimated 1RM per client. Know when to push and what to adjust, from the same data your client trains on.',
    screen: '/assets/screens/progression.webp',
    bullets: ['Per-exercise progression charts', 'Volume, top weight & estimated 1RM', 'Dated set history, never a screenshot'],
    chip1: { label: 'PER-EXERCISE', value: 'Volume · 1RM · PRs', sub: 'tracked over time' },
    chip2: { label: 'SET HISTORY', value: 'Every rep, dated', sub: 'real logged data' },
  },
  {
    tag: 'YOUR CLIENTS',
    title: 'Manage who you train.',
    body: 'Clients share their workout data with you in-app, no exports, no third-party tools. Build custom routines and exercises, and follow their progress as they train.',
    screen: '/assets/screens/trainer-profile.webp',
    bullets: ['Clients share data in a tap', 'Build routines & custom exercises', 'Online & in-person in one dashboard'],
    chip1: { label: 'SHARING', value: 'In-app, in a tap', sub: 'no exports needed' },
    chip2: { label: 'ROUTINES', value: 'Custom + videos', sub: 'shared instantly' },
  },
]

const active = ref(0)
const f = computed(() => features[active.value])

interface Essential {
  title: string
  body: string
  icon: 'badge' | 'video' | 'coin'
}

const essentials: Essential[] = [
  { title: 'Verified coach badge', body: 'Approved coaches get a verified badge so clients know they are reaching a real, reviewed trainer.', icon: 'badge' },
  { title: 'Custom exercises & videos', body: 'Add your own exercises with instructional videos, then share them inside the routines you build.', icon: 'video' },
  { title: 'Free while in beta', body: 'No subscription, no per-client fee. Build your roster now and grow it without a paywall in the way.', icon: 'coin' },
]

/* ── FAQ ── */
const faqs = [
  { q: 'Does it cost anything to coach on LIFTAG?', a: 'No. Coaching on LIFTAG is free while we are in beta. You can build your profile, manage clients, share routines, and track their progress at no cost.' },
  { q: 'How do I apply to become a coach?', a: 'Download the LIFTAG app, then open Profile and tap Become a Trainer. Fill out your application with your bio, specializations, experience, and location. It takes a couple of minutes, then our team reviews it.' },
  { q: 'How long does approval take?', a: 'Each application is reviewed by our team. You get a notification the moment a decision is made, and you can keep editing your application while it is still pending.' },
  { q: 'Can I coach online and in person?', a: 'Yes. You choose whether you offer online coaching, in-person coaching, or both, and set your location so nearby lifters can find you in the directory.' },
  { q: 'Where do clients find me once I am approved?', a: 'Approved coaches appear in the in-app LIFTAG trainer directory, where lifters search and filter by specialty, experience, gym, and location, then contact you directly.' },
]

const openFaq = ref(0)
function toggleFaq(i: number) {
  openFaq.value = openFaq.value === i ? -1 : i
}
</script>

<template>
  <div class="coach-page">
    <SiteNav />

    <main>
      <!-- ───────────────── HERO ───────────────── -->
      <section class="coach-hero" :class="{ 'is-entered': entered }">
        <div class="coach-hero-grid" aria-hidden="true" />
        <div class="coach-hero-atmos coach-hero-atmos--red" aria-hidden="true" />
        <div class="coach-hero-atmos coach-hero-atmos--lime" aria-hidden="true" />

        <div class="container coach-split coach-hero-inner">
          <!-- LEFT: copy -->
          <div class="coach-hero-copy">
            <p class="protocol coach-eyebrow enter h-eyebrow">
              <span class="coach-eyebrow-tick" aria-hidden="true" />
              Join as a coach · Free in beta
            </p>

            <h1 class="display coach-hero-title">
              <span class="enter h-pre">Coach where your clients already </span><span class="accent enter h-accent">train.</span>
            </h1>

            <p class="coach-hero-lead enter h-lead">
              Build your coaching profile inside LIFTAG, get discovered by lifters, and track real
              progress, from the same app your clients open every single session.
            </p>

            <div class="coach-pills enter h-pills">
              <span
                v-for="pill in heroPills"
                :key="pill.label"
                class="coach-pill"
                :class="{ 'is-hot': pill.hot }"
              >{{ pill.label }}</span>
            </div>

            <div class="coach-store-row enter h-badges">
              <AppStoreBtn store="apple" :href="APP_STORE" />
              <AppStoreBtn store="google" :href="PLAY_STORE" coming-soon />
            </div>

            <div class="coach-hero-links enter h-links">
              <a href="#join" class="coach-jumplink">How it works <span aria-hidden="true">↓</span></a>
              <a href="#showcase" class="coach-jumplink">What you get <span aria-hidden="true">→</span></a>
            </div>
          </div>

          <!-- RIGHT: gym photo + peeking phone + chips -->
          <div class="coach-hero-visual coach-hide-mobile">
            <div class="coach-hero-photo">
              <img src="/assets/img/deadlift.webp" alt="Lifter performing a deadlift in a dark gym" >
              <span class="coach-hero-photo-shade coach-hero-photo-shade--side" aria-hidden="true" />
              <span class="coach-hero-photo-shade coach-hero-photo-shade--bottom" aria-hidden="true" />
              <span class="coach-hero-tick coach-hero-tick--tr" aria-hidden="true" />
              <span class="coach-hero-tick coach-hero-tick--bl" aria-hidden="true" />
            </div>

            <!-- verified chip -->
            <div class="coach-hero-chip coach-hero-chip--verified">
              <span class="coach-hero-chip-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 12l2 2 4-4" />
                  <path d="M12 3l2.3 1.6 2.8.2 1 2.6 2 2-1 2.6.2 2.8L19 19l-2.8.2L14 21l-2-1.5L9 21l-2.2-1.8L4 19l-1.5-2.3.2-2.8-1-2.6 2-2 1-2.6 2.8-.2z" />
                </svg>
              </span>
              <div>
                <div class="protocol coach-hero-chip-kicker">PROFILE STATUS</div>
                <div class="coach-hero-chip-value">VERIFIED COACH</div>
              </div>
            </div>

            <!-- directory chip -->
            <div class="coach-hero-chip coach-hero-chip--directory">
              <div class="protocol coach-hero-chip-kicker coach-hero-chip-kicker--muted">WHERE CLIENTS FIND YOU</div>
              <div class="coach-hero-chip-value">TRAINER DIRECTORY</div>
            </div>

            <!-- peeking phone — 3D model on desktop, static screenshot on phones -->
            <div class="coach-hero-phone">
              <span class="coach-hero-phone-glow" aria-hidden="true" />
              <Phone
                src="/assets/screens/coach-profile.webp"
                :style="{ width: '208px', position: 'relative', zIndex: '2' }"
              />
            </div>
          </div>
        </div>

        <!-- scroll cue -->
        <div class="coach-scrollcue coach-hide-mobile">
          <span class="protocol">SCROLL</span>
          <span class="coach-scrollcue-line" aria-hidden="true" />
        </div>
      </section>

      <!-- ───────────────── WHY ───────────────── -->
      <section id="why" class="coach-why">
        <div class="container">
          <header class="coach-section-head reveal">
            <p class="protocol coach-eyebrow"><span class="coach-eyebrow-tick" aria-hidden="true" />Why coach on LIFTAG</p>
            <h2 class="display coach-section-title">
              Not a directory. The same app<br >your clients <span class="accent">train in.</span>
            </h2>
            <p class="coach-section-lead">
              Most coaching tools sit beside the workout. LIFTAG is the workout, so the routine you
              write, the sets your client logs, and the progress you review are never more than one tap apart.
            </p>
          </header>

          <div class="coach-why-grid">
            <article
              v-for="card in whyCards"
              :key="card.title"
              class="coach-why-card reveal"
              :class="{ 'is-lime': card.lime }"
            >
              <div class="coach-why-card-head">
                <span class="coach-why-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <template v-if="card.icon === 'chart'"><path d="M4 4v16h16" /><path d="M7.5 14.5 11 11l2.5 2.5L20 7" /></template>
                    <template v-else-if="card.icon === 'coin'"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5v9M9.5 10.2c0-1.2 1.1-2 2.5-2s2.5.8 2.5 2-1.1 1.7-2.5 1.7-2.5.6-2.5 1.8 1.1 2 2.5 2 2.5-.8 2.5-2" /></template>
                    <template v-else-if="card.icon === 'badge'"><path d="M12 3l2.3 1.6 2.8.2 1 2.6 2 2-1 2.6.2 2.8L19 19l-2.8.2L14 21l-2-1.5L9 21l-2.2-1.8L4 19l-1.5-2.3.2-2.8-1-2.6 2-2 1-2.6 2.8-.2z" /><path d="M9 12l2 2 4-4" /></template>
                    <template v-else><rect x="3" y="4.5" width="13" height="9" rx="1.6" /><path d="M9.5 17.5h-3M18 9.5h3v8a1.5 1.5 0 0 1-1.5 1.5H17a1.5 1.5 0 0 1-1.5-1.5V11" /></template>
                  </svg>
                </span>
                <h3 class="coach-why-card-title">{{ card.title }}</h3>
              </div>
              <p class="coach-why-card-body">{{ card.body }}</p>
            </article>
          </div>

          <!-- what you're replacing -->
          <div class="coach-replaces reveal">
            <span class="protocol coach-replaces-label">REPLACES</span>
            <div class="coach-replaces-items">
              <span v-for="(item, i) in replaces" :key="item" class="coach-replaces-item">
                <span class="coach-replaces-strike">{{ item }}</span>
                <span v-if="i < replaces.length - 1" class="coach-replaces-dot">·</span>
              </span>
            </div>
          </div>
        </div>

        <!-- specialty marquee -->
        <div class="coach-marquee reveal">
          <div class="coach-marquee-track">
            <div v-for="rep in 2" :key="rep" class="coach-marquee-group" :aria-hidden="rep === 2">
              <span
                v-for="(s, i) in specialties"
                :key="s + rep"
                class="coach-marquee-item"
              >
                <span class="coach-marquee-word" :class="{ 'is-accent': i % 3 === 1 }">{{ s }}</span>
                <span class="coach-marquee-dot" aria-hidden="true" />
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- ───────────────── STEPS / HOW TO JOIN ───────────────── -->
      <section id="join" class="coach-steps">
        <div class="coach-steps-glow" aria-hidden="true" />
        <div class="container">
          <div class="coach-split coach-steps-split">
            <header class="coach-steps-intro reveal">
              <p class="protocol coach-eyebrow"><span class="coach-eyebrow-tick" aria-hidden="true" />How to join</p>
              <h2 class="display coach-steps-title">
                Four steps from<br >lifter to <span class="accent">coach.</span>
              </h2>
              <p class="coach-steps-lead">
                There is no web form to fill in. You apply straight from the LIFTAG app, and once a
                quick review is done your profile goes live in the directory.
              </p>
              <div class="coach-steps-pill">
                <span class="coach-steps-pill-dot" aria-hidden="true" />
                <span class="protocol">TAKES ~2 MINUTES</span>
              </div>
            </header>

            <ol class="coach-steps-list">
              <li
                v-for="(step, i) in steps"
                :key="step.no"
                class="coach-step reveal"
                :class="{ 'is-last': i === steps.length - 1 }"
              >
                <div class="coach-step-rail">
                  <span class="coach-step-no">{{ step.no }}</span>
                  <span v-if="i < steps.length - 1" class="coach-step-line" aria-hidden="true" />
                </div>
                <div class="coach-step-body">
                  <h3 class="coach-step-title">{{ step.title }}</h3>
                  <p class="coach-step-text">{{ step.body }}</p>
                  <div v-if="step.store" class="coach-store-row coach-store-row--inline">
                    <AppStoreBtn store="apple" :href="APP_STORE" />
                    <AppStoreBtn store="google" :href="PLAY_STORE" coming-soon />
                  </div>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <!-- ───────────────── SHOWCASE / WHAT YOU GET ───────────────── -->
      <section id="showcase" class="coach-showcase">
        <span class="coach-showcase-topline" aria-hidden="true" />
        <div class="coach-showcase-glow" aria-hidden="true" />

        <div class="container">
          <header class="coach-showcase-head">
            <div class="reveal">
              <p class="protocol coach-eyebrow"><span class="coach-eyebrow-tick" aria-hidden="true" />What you get</p>
              <h2 class="display coach-section-title">
                Everything you need<br >to <span class="accent">coach.</span>
              </h2>
            </div>
            <p class="coach-showcase-lead reveal">
              A full coaching surface, not just a listing. Profile, discovery, shared plans, and client
              progress tied to real set history, with nothing else to stitch together.
            </p>
          </header>

          <div class="coach-showcase-grid">
            <!-- LEFT: active copy -->
            <div class="coach-showcase-copy reveal">
              <div class="protocol coach-showcase-tag">{{ f.tag }}</div>
              <h3 class="coach-showcase-title">{{ f.title }}</h3>
              <p class="coach-showcase-body">{{ f.body }}</p>
              <div class="coach-showcase-bullets">
                <div v-for="item in f.bullets" :key="item" class="coach-showcase-bullet">
                  <span class="coach-showcase-bullet-dot" aria-hidden="true" />
                  <span>{{ item }}</span>
                </div>
                <div class="coach-showcase-bullet-end" />
              </div>
              <a href="#join" class="btn-primary coach-showcase-cta">Apply as a coach</a>
            </div>

            <!-- CENTER: phone + chips -->
            <div class="coach-showcase-center reveal">
              <div class="coach-showcase-phone-wrap">
                <span class="coach-showcase-phone-glow" aria-hidden="true" />
                <div class="coach-showcase-phone-float">
                  <Phone
                    :src="f.screen"
                    screen-transition
                    :style="{ width: '270px', position: 'relative', zIndex: '2' }"
                  />
                </div>
              </div>
              <div class="coach-showcase-chips">
                <div class="coach-showcase-chip is-accent">
                  <div class="protocol coach-showcase-chip-label">{{ f.chip1.label }}</div>
                  <div class="coach-showcase-chip-value">{{ f.chip1.value }}</div>
                  <div class="coach-showcase-chip-sub">{{ f.chip1.sub }}</div>
                </div>
                <div class="coach-showcase-chip">
                  <div class="protocol coach-showcase-chip-label">{{ f.chip2.label }}</div>
                  <div class="coach-showcase-chip-value">{{ f.chip2.value }}</div>
                  <div class="coach-showcase-chip-sub">{{ f.chip2.sub }}</div>
                </div>
              </div>
            </div>

            <!-- RIGHT: vertical tabs -->
            <div class="coach-tabs coach-hide-mobile">
              <button
                v-for="(feat, i) in features"
                :key="feat.tag"
                type="button"
                class="coach-tab"
                :class="{ 'is-active': active === i }"
                @click="active = i"
              >
                <div class="protocol coach-tab-tag">{{ feat.tag }}</div>
                <div class="coach-tab-title">{{ feat.title }}</div>
              </button>
              <div class="coach-tab-end" />
            </div>

            <!-- MOBILE dots -->
            <div class="coach-dots">
              <button
                v-for="(feat, i) in features"
                :key="feat.tag"
                type="button"
                class="coach-dot"
                :class="{ 'is-active': active === i }"
                :aria-label="`Feature ${i + 1}`"
                @click="active = i"
              />
            </div>
          </div>

          <!-- essentials -->
          <div class="coach-essentials">
            <article v-for="e in essentials" :key="e.title" class="coach-essential reveal">
              <span class="coach-essential-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <template v-if="e.icon === 'badge'"><path d="M12 3l2.3 1.6 2.8.2 1 2.6 2 2-1 2.6.2 2.8L19 19l-2.8.2L14 21l-2-1.5L9 21l-2.2-1.8L4 19l-1.5-2.3.2-2.8-1-2.6 2-2 1-2.6 2.8-.2z" /><path d="M9 12l2 2 4-4" /></template>
                  <template v-else-if="e.icon === 'video'"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m10 9 5 3-5 3z" /></template>
                  <template v-else><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5v9M9.5 10.2c0-1.2 1.1-2 2.5-2s2.5.8 2.5 2-1.1 1.7-2.5 1.7-2.5.6-2.5 1.8 1.1 2 2.5 2 2.5-.8 2.5-2" /></template>
                </svg>
              </span>
              <h3 class="coach-essential-title">{{ e.title }}</h3>
              <p class="coach-essential-body">{{ e.body }}</p>
            </article>
          </div>
        </div>
      </section>

      <!-- ───────────────── FAQ ───────────────── -->
      <section id="faq" class="coach-faq">
        <div class="container">
          <div class="coach-faq-split">
            <header class="coach-faq-intro reveal">
              <p class="protocol coach-eyebrow"><span class="coach-eyebrow-tick" aria-hidden="true" />Common questions</p>
              <h2 class="display coach-faq-title">Before you<br ><span class="accent">apply.</span></h2>
            </header>
            <div class="coach-faq-list reveal">
              <div
                v-for="(item, i) in faqs"
                :key="item.q"
                class="coach-faq-item"
                :class="{ 'is-open': openFaq === i }"
              >
                <button type="button" class="coach-faq-q" :aria-expanded="openFaq === i" @click="toggleFaq(i)">
                  <span>{{ item.q }}</span>
                  <span class="coach-faq-plus" aria-hidden="true">+</span>
                </button>
                <div class="coach-faq-a">
                  <p>{{ item.a }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ───────────────── FINAL CTA ───────────────── -->
      <section class="coach-final">
        <img src="/assets/img/bench-press.webp" alt="" aria-hidden="true" class="coach-final-bg" >
        <span class="coach-final-vignette" aria-hidden="true" />
        <span class="coach-final-glow" aria-hidden="true" />

        <div class="container coach-final-inner reveal">
          <p class="protocol coach-eyebrow coach-final-eyebrow"><span class="coach-eyebrow-tick" aria-hidden="true" />For lifters / by lifters</p>
          <h2 class="display coach-final-title">
            Ready to coach<br >on <span class="accent coach-final-accent">LIFTAG?</span>
          </h2>
          <p class="coach-final-lead">
            Download the app, open your application, and start building your roster. Free while we are in beta.
          </p>
          <div class="coach-store-row coach-final-store">
            <AppStoreBtn store="apple" :href="APP_STORE" />
            <AppStoreBtn store="google" :href="PLAY_STORE" coming-soon />
          </div>
          <div class="coach-final-links">
            <a href="/for-trainers" class="coach-textlink">Explore trainer features →</a>
            <a href="/" class="coach-textlink coach-textlink--muted">Back to home</a>
          </div>
        </div>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>

<style scoped>
.coach-page {
  --coach-accent: #FF2D55;
  --coach-accent-glow: rgba(255, 45, 85, 0.4);
  --coach-accent-soft: rgba(255, 45, 85, 0.12);
  --coach-accent-line: rgba(255, 45, 85, 0.3);
  min-height: var(--liftag-stable-vh);
  background: #000;
  color: #fff;
}

.accent {
  color: var(--coach-accent);
}

.coach-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--coach-accent);
  margin: 0;
}

.coach-eyebrow-tick {
  display: inline-block;
  width: 24px;
  height: 1px;
  background: var(--coach-accent);
  box-shadow: 0 0 8px var(--coach-accent);
}

.coach-store-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

/* ───────── HERO ───────── */
.coach-hero {
  position: relative;
  min-height: var(--liftag-stable-vh);
  overflow: hidden;
  background: #000;
  padding: 132px 0 80px;
}

.coach-hero-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 80px 80px;
  -webkit-mask-image: radial-gradient(ellipse 90% 80% at 30% 40%, black 20%, transparent 80%);
  mask-image: radial-gradient(ellipse 90% 80% at 30% 40%, black 20%, transparent 80%);
}

.coach-hero-atmos {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}

.coach-hero-atmos--red {
  top: -12%;
  right: -8%;
  width: 720px;
  height: 720px;
  background: radial-gradient(circle, var(--coach-accent-soft), transparent 62%);
}

.coach-hero-atmos--lime {
  bottom: -22%;
  left: -12%;
  width: 620px;
  height: 620px;
  background: radial-gradient(circle, rgba(204, 255, 0, 0.07), transparent 62%);
}

.coach-hero-inner {
  position: relative;
  z-index: 3;
  display: grid;
  grid-template-columns: 1.04fr 1fr;
  align-items: center;
  gap: 56px;
  min-height: calc(var(--liftag-stable-vh) - 212px);
}

.coach-hero-title {
  font-size: clamp(46px, 6.6vw, 96px);
  margin: 26px 0 0;
}

.coach-hero-title .accent {
  text-shadow: 0 0 60px var(--coach-accent-glow), 0 0 120px var(--coach-accent-soft);
}

.coach-hero-lead {
  max-width: 540px;
  margin: 38px 0 0;
  color: rgba(255, 255, 255, 0.66);
  font-size: clamp(17px, 1.6vw, 20px);
  font-weight: 300;
  line-height: 1.6;
}

.coach-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 30px;
}

.coach-pill {
  font-family: var(--liftag-font-mono);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  padding: 9px 14px;
  background: rgba(255, 255, 255, 0.03);
}

.coach-pill.is-hot {
  color: #0E0E0E;
  background: #CCFF00;
  border-color: transparent;
  box-shadow: 0 0 24px rgba(204, 255, 0, 0.32);
}

.coach-hero .coach-store-row {
  margin-top: 34px;
}

.coach-hero-links {
  display: flex;
  flex-wrap: wrap;
  gap: 26px;
  margin-top: 30px;
}

.coach-jumplink {
  color: rgba(255, 255, 255, 0.62);
  text-decoration: none;
  font-family: var(--liftag-font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  transition: color 220ms ease;
}

.coach-jumplink:hover {
  color: var(--coach-accent);
}

/* hero right column */
.coach-hero-visual {
  position: relative;
  height: 580px;
}

.coach-hero-photo {
  position: absolute;
  top: 22px;
  right: 0;
  bottom: 22px;
  left: 96px;
  border-radius: 28px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.7);
}

.coach-hero-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: contrast(1.05) brightness(0.92);
}

.coach-hero-photo-shade {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.coach-hero-photo-shade--side {
  background: linear-gradient(110deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.12) 40%, transparent 68%);
}

.coach-hero-photo-shade--bottom {
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.5), transparent 42%);
}

.coach-hero-tick {
  position: absolute;
  width: 24px;
  height: 24px;
  box-shadow: 0 0 16px var(--coach-accent-glow);
}

.coach-hero-tick--tr {
  top: 16px;
  right: 16px;
  border-top: 2px solid var(--coach-accent);
  border-right: 2px solid var(--coach-accent);
}

.coach-hero-tick--bl {
  bottom: 16px;
  left: 16px;
  border-bottom: 2px solid var(--coach-accent);
  border-left: 2px solid var(--coach-accent);
}

.coach-hero-chip {
  position: absolute;
  z-index: 6;
  background: rgba(10, 10, 10, 0.92);
  border-radius: 14px;
  padding: 11px 15px;
  backdrop-filter: blur(20px);
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.7);
}

.coach-hero-chip--verified {
  top: 44px;
  right: 18px;
  display: flex;
  align-items: center;
  gap: 11px;
  border: 1px solid var(--coach-accent-line);
  box-shadow: 0 16px 50px rgba(0, 0, 0, 0.7), 0 0 30px var(--coach-accent-soft);
}

.coach-hero-chip--directory {
  bottom: 44px;
  right: 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.coach-hero-chip-icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  flex-shrink: 0;
  background: var(--coach-accent-soft);
  color: var(--coach-accent);
}

.coach-hero-chip-icon svg {
  width: 19px;
  height: 19px;
}

.coach-hero-chip-kicker {
  color: var(--coach-accent);
  font-size: 9px;
  white-space: nowrap;
}

.coach-hero-chip-kicker--muted {
  color: rgba(255, 255, 255, 0.4);
}

.coach-hero-chip-value {
  font-family: var(--liftag-font-headline);
  font-weight: 700;
  font-style: italic;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: -0.02em;
  margin-top: 2px;
  white-space: nowrap;
}

.coach-hero-phone {
  position: absolute;
  bottom: 16px;
  left: -44px;
  z-index: 5;
  animation: coachFloat 6s ease-in-out infinite;
}

.coach-hero-phone-glow {
  position: absolute;
  inset: -30px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--coach-accent-soft), transparent 65%);
  filter: blur(26px);
}

.coach-scrollcue {
  position: absolute;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  z-index: 5;
  opacity: 0;
}

.coach-scrollcue .protocol {
  color: rgba(255, 255, 255, 0.35);
  font-size: 9px;
}

.coach-scrollcue-line {
  width: 1px;
  height: 46px;
  background: linear-gradient(180deg, var(--coach-accent) 0%, transparent 100%);
  animation: coachScroll 2s ease-in-out infinite;
}

/* hero entrance */
.coach-hero .enter {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 900ms cubic-bezier(0.16, 1, 0.3, 1), transform 900ms cubic-bezier(0.16, 1, 0.3, 1);
}

.coach-hero.is-entered .enter {
  opacity: 1;
  transform: translateY(0);
}

.coach-hero.is-entered .h-eyebrow { transition-delay: 120ms; }
.coach-hero.is-entered .h-pre { transition-delay: 200ms; }
.coach-hero.is-entered .h-accent { transition-delay: 320ms; }
.coach-hero.is-entered .h-lead { transition-delay: 440ms; }
.coach-hero.is-entered .h-pills { transition-delay: 540ms; }
.coach-hero.is-entered .h-badges { transition-delay: 640ms; }
.coach-hero.is-entered .h-links { transition-delay: 740ms; }

.coach-hero-photo,
.coach-hero-chip,
.coach-hero-phone,
.coach-scrollcue {
  opacity: 0;
}

.coach-hero-photo {
  transform: scale(1.04);
  transition: opacity 1200ms 200ms ease, transform 1400ms 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

.coach-hero-chip,
.coach-hero-phone {
  transition: opacity 1000ms ease;
}

.coach-hero-chip--verified { transition-delay: 800ms; }
.coach-hero-chip--directory { transition-delay: 1000ms; }
.coach-hero-phone { transition-delay: 500ms; }
.coach-scrollcue { transition: opacity 1200ms 1400ms ease; }

.coach-hero.is-entered .coach-hero-photo {
  opacity: 1;
  transform: scale(1);
}

.coach-hero.is-entered .coach-hero-chip,
.coach-hero.is-entered .coach-hero-phone {
  opacity: 1;
}

.coach-hero.is-entered .coach-scrollcue {
  opacity: 0.7;
}

/* ───────── shared section heads ───────── */
.coach-section-head {
  max-width: 760px;
  margin-bottom: 56px;
}

.coach-section-head .coach-eyebrow {
  margin-bottom: 20px;
}

.coach-section-title {
  font-size: clamp(32px, 4.8vw, 60px);
}

.coach-section-lead {
  margin: 22px 0 0;
  max-width: 600px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 17px;
  font-weight: 300;
  line-height: 1.65;
}

/* ───────── WHY ───────── */
.coach-why {
  padding: 120px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.coach-why-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.coach-why-card {
  padding: clamp(24px, 2.6vw, 34px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  background: rgba(10, 10, 10, 0.7);
  transition: border-color 280ms ease, transform 280ms ease, background 280ms ease;
}

.coach-why-card:hover {
  transform: translateY(-3px);
  border-color: var(--coach-accent-line);
}

.coach-why-card.is-lime {
  border-color: rgba(204, 255, 0, 0.28);
  background: linear-gradient(150deg, rgba(204, 255, 0, 0.07), transparent 52%), rgba(10, 12, 6, 0.8);
}

.coach-why-card.is-lime:hover {
  border-color: rgba(204, 255, 0, 0.5);
}

.coach-why-card-head {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
}

.coach-why-icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 13px;
  flex-shrink: 0;
  background: var(--coach-accent-soft);
  color: var(--coach-accent);
}

.coach-why-icon svg {
  width: 23px;
  height: 23px;
}

.coach-why-card.is-lime .coach-why-icon {
  background: rgba(204, 255, 0, 0.14);
  color: #CCFF00;
}

.coach-why-card-title {
  margin: 0;
  font-family: var(--liftag-font-headline);
  font-weight: 700;
  font-style: italic;
  font-size: clamp(20px, 2vw, 25px);
  text-transform: uppercase;
  letter-spacing: -0.02em;
  line-height: 1.05;
}

.coach-why-card-body {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 15px;
  font-weight: 300;
  line-height: 1.65;
}

.coach-replaces {
  margin-top: 16px;
  padding: 22px 28px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(255, 255, 255, 0.02);
  display: flex;
  align-items: center;
  gap: clamp(14px, 3vw, 40px);
  flex-wrap: wrap;
}

.coach-replaces-label {
  color: var(--coach-accent);
  font-size: 10px;
  flex-shrink: 0;
}

.coach-replaces-items {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(10px, 2vw, 26px);
  color: rgba(255, 255, 255, 0.45);
  font-size: 15px;
}

.coach-replaces-item {
  display: inline-flex;
  align-items: center;
  gap: clamp(10px, 2vw, 26px);
}

.coach-replaces-strike {
  text-decoration: line-through;
  text-decoration-color: var(--coach-accent-line);
}

.coach-replaces-dot {
  color: rgba(255, 255, 255, 0.2);
}

.coach-marquee {
  margin-top: 64px;
  overflow: hidden;
  position: relative;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding: 26px 0;
  -webkit-mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
  mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
}

.coach-marquee-track {
  display: flex;
  width: max-content;
  animation: coachMarquee 38s linear infinite;
}

.coach-marquee-group {
  display: flex;
  align-items: center;
}

.coach-marquee-item {
  display: inline-flex;
  align-items: center;
  gap: 40px;
  padding-right: 40px;
}

.coach-marquee-word {
  font-family: var(--liftag-font-headline);
  font-weight: 700;
  font-style: italic;
  font-size: clamp(20px, 2.4vw, 30px);
  text-transform: uppercase;
  letter-spacing: -0.02em;
  color: rgba(255, 255, 255, 0.82);
  white-space: nowrap;
}

.coach-marquee-word.is-accent {
  color: var(--coach-accent);
}

.coach-marquee-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  flex-shrink: 0;
}

/* ───────── STEPS ───────── */
.coach-steps {
  padding: 120px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  position: relative;
  overflow: hidden;
}

.coach-steps-glow {
  position: absolute;
  top: 30%;
  right: -12%;
  width: 540px;
  height: 540px;
  background: radial-gradient(circle, var(--coach-accent-soft), transparent 62%);
  filter: blur(90px);
  pointer-events: none;
}

.coach-steps-split {
  position: relative;
  display: grid;
  grid-template-columns: 0.85fr 1.15fr;
  gap: clamp(32px, 5vw, 80px);
  align-items: start;
}

.coach-steps-intro {
  position: sticky;
  top: 110px;
}

.coach-steps-intro .coach-eyebrow {
  margin-bottom: 20px;
}

.coach-steps-title {
  font-size: clamp(30px, 4vw, 52px);
}

.coach-steps-lead {
  margin: 22px 0 0;
  color: rgba(255, 255, 255, 0.62);
  font-size: 16px;
  font-weight: 300;
  line-height: 1.65;
  max-width: 380px;
}

.coach-steps-pill {
  margin-top: 28px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: 999px;
  border: 1px solid var(--coach-accent-line);
  background: var(--coach-accent-soft);
}

.coach-steps-pill .protocol {
  color: var(--coach-accent);
  font-size: 10px;
}

.coach-steps-pill-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--coach-accent);
  box-shadow: 0 0 10px var(--coach-accent);
  animation: coachPulse 3s ease-in-out infinite;
}

.coach-steps-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.coach-step {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr);
  gap: clamp(16px, 2.4vw, 30px);
  padding-bottom: 38px;
}

.coach-step.is-last {
  padding-bottom: 0;
}

.coach-step-rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.coach-step-no {
  font-family: var(--liftag-font-mono);
  font-weight: 800;
  font-size: clamp(30px, 3.4vw, 42px);
  line-height: 1;
  color: var(--coach-accent);
  letter-spacing: -0.02em;
  text-shadow: 0 0 26px var(--coach-accent-glow);
}

.coach-step-line {
  flex: 1;
  width: 1px;
  min-height: 30px;
  background: linear-gradient(180deg, var(--coach-accent-line), rgba(255, 255, 255, 0.06));
}

.coach-step-body {
  padding-top: 2px;
}

.coach-step-title {
  margin: 0;
  font-family: var(--liftag-font-headline);
  font-weight: 700;
  font-style: italic;
  font-size: clamp(21px, 2.4vw, 28px);
  text-transform: uppercase;
  letter-spacing: -0.02em;
}

.coach-step-text {
  margin: 12px 0 0;
  max-width: 560px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 15.5px;
  font-weight: 300;
  line-height: 1.65;
}

.coach-store-row--inline {
  margin-top: 20px;
}

/* ───────── SHOWCASE ───────── */
.coach-showcase {
  background: linear-gradient(180deg, #000 0%, #050505 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding: 120px 0;
  position: relative;
  overflow: hidden;
}

.coach-showcase-topline {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--coach-accent) 50%, transparent);
  opacity: 0.5;
}

.coach-showcase-glow {
  position: absolute;
  top: 18%;
  left: -10%;
  width: 520px;
  height: 520px;
  background: radial-gradient(circle, var(--coach-accent-soft), transparent 60%);
  filter: blur(90px);
  pointer-events: none;
}

.coach-showcase .container {
  position: relative;
}

.coach-showcase-head {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 56px;
  align-items: end;
  margin-bottom: 68px;
}

.coach-showcase-head .coach-eyebrow {
  margin-bottom: 20px;
}

.coach-showcase-lead {
  color: rgba(255, 255, 255, 0.62);
  font-size: 17px;
  font-weight: 300;
  line-height: 1.65;
  max-width: 440px;
  margin: 0;
}

.coach-showcase-grid {
  display: grid;
  grid-template-columns: 1fr 1.1fr 1fr;
  gap: clamp(28px, 4vw, 56px);
  align-items: center;
}

.coach-showcase-tag {
  color: var(--coach-accent);
  margin-bottom: 12px;
  font-size: 10px;
}

.coach-showcase-title {
  margin: 0;
  font-family: var(--liftag-font-headline);
  font-weight: 700;
  font-style: italic;
  font-size: clamp(28px, 3.2vw, 42px);
  line-height: 1;
  letter-spacing: -0.04em;
  text-transform: uppercase;
}

.coach-showcase-body {
  color: rgba(255, 255, 255, 0.6);
  font-weight: 300;
  font-size: 15px;
  line-height: 1.6;
  margin: 16px 0 0;
}

.coach-showcase-bullets {
  margin-top: 30px;
}

.coach-showcase-bullet {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.coach-showcase-bullet-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--coach-accent);
  box-shadow: 0 0 8px var(--coach-accent-glow);
}

.coach-showcase-bullet span:last-child {
  color: rgba(255, 255, 255, 0.72);
  font-size: 13.5px;
}

.coach-showcase-bullet-end {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.coach-showcase-cta {
  display: inline-block;
  margin-top: 30px;
  padding: 14px 26px;
  font-size: 12px;
  text-decoration: none;
}

.coach-showcase-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.coach-showcase-phone-wrap {
  position: relative;
}

.coach-showcase-phone-glow {
  position: absolute;
  inset: -40px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--coach-accent-soft), transparent 65%);
  filter: blur(30px);
}

.coach-showcase-phone-float {
  position: relative;
  z-index: 2;
  animation: coachFloat 6s ease-in-out infinite;
}

.coach-showcase-chips {
  display: flex;
  gap: 12px;
  width: 100%;
  justify-content: center;
}

.coach-showcase-chip {
  background: rgba(10, 10, 10, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 12px 16px;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
  flex: 1;
  min-width: 0;
}

.coach-showcase-chip.is-accent {
  border-color: var(--coach-accent-line);
}

.coach-showcase-chip-label {
  color: rgba(255, 255, 255, 0.4);
  font-size: 9px;
}

.coach-showcase-chip-value {
  font-family: var(--liftag-font-headline);
  font-weight: 700;
  font-style: italic;
  font-size: 15px;
  letter-spacing: -0.02em;
  margin-top: 5px;
  color: #fff;
  line-height: 1.1;
}

.coach-showcase-chip.is-accent .coach-showcase-chip-value {
  color: var(--coach-accent);
}

.coach-showcase-chip-sub {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
  margin-top: 3px;
}

.coach-tabs {
  display: flex;
  flex-direction: column;
}

.coach-tab {
  padding: 20px 0 20px 20px;
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  border-left: 2px solid transparent;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: opacity 300ms ease, border-color 300ms ease;
  opacity: 0.45;
}

.coach-tab:hover {
  opacity: 0.75;
}

.coach-tab.is-active {
  opacity: 1;
  border-left-color: var(--coach-accent);
}

.coach-tab-tag {
  color: rgba(255, 255, 255, 0.5);
  font-size: 9px;
  margin-bottom: 6px;
  transition: color 300ms ease;
}

.coach-tab.is-active .coach-tab-tag {
  color: var(--coach-accent);
}

.coach-tab-title {
  font-family: var(--liftag-font-headline);
  font-weight: 700;
  font-style: italic;
  font-size: 19px;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  line-height: 1.1;
  color: #fff;
}

.coach-tab-end {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.coach-dots {
  display: none;
  justify-content: center;
  gap: 8px;
  grid-column: 1 / -1;
}

.coach-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.2);
  transition: all 300ms ease;
}

.coach-dot.is-active {
  width: 26px;
  background: var(--coach-accent);
}

.coach-essentials {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 64px;
}

.coach-essential {
  padding: 28px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(10, 10, 10, 0.6);
  transition: border-color 280ms ease, transform 280ms ease;
}

.coach-essential:hover {
  transform: translateY(-3px);
  border-color: var(--coach-accent-line);
}

.coach-essential-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--coach-accent-soft);
  color: var(--coach-accent);
  margin-bottom: 18px;
}

.coach-essential-icon svg {
  width: 22px;
  height: 22px;
}

.coach-essential-title {
  margin: 0;
  font-family: var(--liftag-font-headline);
  font-weight: 700;
  font-size: 19px;
  letter-spacing: -0.01em;
}

.coach-essential-body {
  margin: 12px 0 0;
  color: rgba(255, 255, 255, 0.58);
  font-size: 14.5px;
  font-weight: 300;
  line-height: 1.6;
}

/* ───────── FAQ ───────── */
.coach-faq {
  padding: 120px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.coach-faq-split {
  display: grid;
  grid-template-columns: 0.7fr 1.3fr;
  gap: clamp(28px, 5vw, 70px);
  align-items: start;
}

.coach-faq-intro .coach-eyebrow {
  margin-bottom: 20px;
}

.coach-faq-title {
  font-size: clamp(30px, 4vw, 52px);
}

.coach-faq-list {
  display: grid;
  gap: 10px;
}

.coach-faq-item {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  background: rgba(11, 11, 11, 0.72);
  overflow: hidden;
  transition: border-color 240ms ease;
}

.coach-faq-item.is-open {
  border-color: var(--coach-accent-line);
}

.coach-faq-q {
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 22px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  font-family: var(--liftag-font-headline);
  font-weight: 700;
  font-style: italic;
  font-size: clamp(17px, 1.9vw, 20px);
  text-transform: uppercase;
  letter-spacing: -0.01em;
  color: #fff;
}

.coach-faq-plus {
  flex-shrink: 0;
  color: var(--coach-accent);
  font-family: var(--liftag-font-mono);
  font-size: 22px;
  line-height: 1;
  font-style: normal;
  transition: transform 240ms ease;
}

.coach-faq-item.is-open .coach-faq-plus {
  transform: rotate(45deg);
}

.coach-faq-a {
  max-height: 0;
  overflow: hidden;
  transition: max-height 320ms cubic-bezier(0.16, 1, 0.3, 1);
}

.coach-faq-item.is-open .coach-faq-a {
  max-height: 560px;
}

.coach-faq-a p {
  margin: 0;
  padding: 0 24px 22px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 15.5px;
  font-weight: 300;
  line-height: 1.65;
  max-width: 680px;
}

/* ───────── FINAL CTA ───────── */
.coach-final {
  position: relative;
  overflow: hidden;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding: 130px 0;
}

.coach-final-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.22;
  filter: grayscale(0.3) contrast(1.05);
}

.coach-final-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 80% 70% at 50% 50%, transparent 10%, #000 78%);
}

.coach-final-glow {
  position: absolute;
  top: -20%;
  left: 50%;
  transform: translateX(-50%);
  width: 700px;
  height: 500px;
  background: radial-gradient(ellipse, var(--coach-accent-soft), transparent 65%);
  filter: blur(80px);
  pointer-events: none;
}

.coach-final-inner {
  position: relative;
  text-align: center;
}

.coach-final-eyebrow {
  justify-content: center;
  margin-bottom: 24px;
}

.coach-final-title {
  font-size: clamp(36px, 5.6vw, 84px);
  margin: 0 auto;
  max-width: 900px;
}

.coach-final-accent {
  text-shadow: 0 0 60px var(--coach-accent-glow);
}

.coach-final-lead {
  margin: 24px auto 0;
  max-width: 540px;
  color: rgba(255, 255, 255, 0.66);
  font-size: 18px;
  font-weight: 300;
  line-height: 1.6;
}

.coach-final-store {
  justify-content: center;
  margin-top: 36px;
}

.coach-final-links {
  display: flex;
  justify-content: center;
  gap: 26px;
  flex-wrap: wrap;
  margin-top: 32px;
}

.coach-textlink {
  color: var(--coach-accent);
  text-decoration: none;
  font-family: var(--liftag-font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  transition: opacity 200ms ease;
}

.coach-textlink:hover {
  opacity: 0.7;
}

.coach-textlink--muted {
  color: rgba(255, 255, 255, 0.5);
}

/* ───────── keyframes ───────── */
@keyframes coachFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

@keyframes coachScroll {
  0% { transform: scaleY(0); transform-origin: top; opacity: 0; }
  40% { transform: scaleY(1); transform-origin: top; opacity: 1; }
  60% { transform: scaleY(1); transform-origin: bottom; opacity: 1; }
  100% { transform: scaleY(0); transform-origin: bottom; opacity: 0; }
}

@keyframes coachPulse {
  0%, 100% { box-shadow: 0 0 0 rgba(255, 45, 85, 0); }
  50% { box-shadow: 0 0 14px var(--coach-accent-glow); }
}

@keyframes coachMarquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

/* ───────── responsive ───────── */
@media (max-width: 980px) {
  .coach-showcase-grid {
    grid-template-columns: 1fr;
    gap: 36px;
  }

  .coach-showcase-copy,
  .coach-showcase-center {
    max-width: 480px;
    margin: 0 auto;
    width: 100%;
  }

  .coach-dots {
    display: flex;
  }
}

@media (max-width: 880px) {
  .coach-hero-inner,
  .coach-steps-split,
  .coach-faq-split,
  .coach-showcase-head,
  .coach-why-grid {
    grid-template-columns: 1fr;
  }

  .coach-steps-intro {
    position: static;
  }

  .coach-hide-mobile {
    display: none !important;
  }
}

@media (max-width: 880px) {
  .coach-hero {
    min-height: auto;
    padding-top: 120px;
  }

  .coach-hero-inner {
    min-height: 0;
  }

  .coach-why-grid {
    gap: 14px;
  }
}

@media (max-width: 620px) {
  .coach-why,
  .coach-steps,
  .coach-showcase,
  .coach-faq {
    padding: 84px 0;
  }

  .coach-step {
    grid-template-columns: 52px minmax(0, 1fr);
  }

  .coach-store-row {
    flex-direction: column;
  }

  .coach-store-row :deep(.app-store-btn) {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .coach-hero .enter,
  .coach-hero-photo,
  .coach-hero-chip,
  .coach-hero-phone {
    transition: none !important;
  }

  .coach-hero-phone,
  .coach-showcase-phone-float,
  .coach-scrollcue-line,
  .coach-steps-pill-dot,
  .coach-marquee-track {
    animation: none !important;
  }
}
</style>
