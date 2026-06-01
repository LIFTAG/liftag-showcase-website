<script setup lang="ts">
import { useReveal } from '~/composables/useReveal'

const APP_STORE_APP_ID = '6761140080'
const APP_STORE = `https://apps.apple.com/app/id${APP_STORE_APP_ID}`
const PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.liftag.app'

const description
  = 'Become a coach on LIFTAG: build your trainer profile inside the app, get discovered by lifters, share routines, and track real client progress. Free while we are in beta.'

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

interface Step {
  no: string
  title: string
  body: string
}

const steps: Step[] = [
  {
    no: '01',
    title: 'Download the app',
    body: 'Get LIFTAG free on iOS or Android and create your account. It is the same app your future clients use to train, so everything stays in one place.',
  },
  {
    no: '02',
    title: 'Open your coach application',
    body: 'Inside the app, go to Profile and tap Become a Trainer. Add your bio, specializations, years of experience, location, your socials, and whether you coach online, in person, or both.',
  },
  {
    no: '03',
    title: 'We review your profile',
    body: 'Your application goes under review. You will get a notification the moment a decision is made, and you can keep editing the application while it is still pending.',
  },
  {
    no: '04',
    title: 'Go live and start coaching',
    body: 'Once approved, your profile is published to the trainer directory. Lifters discover you, reach out, and you start building routines and tracking their progress.',
  },
]

interface Perk {
  icon: string
  title: string
  body: string
  highlight?: boolean
}

const perks: Perk[] = [
  {
    icon: 'clients',
    title: 'Manage clients in one place',
    body: 'One profile for your online and in-person clients. Free while we are in beta, so you can build your roster without a subscription getting in the way.',
    highlight: true,
  },
  {
    icon: 'chart',
    title: 'See every rep they log',
    body: 'Real set history, volume trends, PRs, and estimated 1RM per client. Know when to push and what to adjust from the same data your client trains on.',
  },
  {
    icon: 'plan',
    title: 'Build programs and routines',
    body: 'Create custom routines and share them by email. Clients activate them and follow your live updates, with no third-party plan tools in the loop.',
  },
  {
    icon: 'discover',
    title: 'Get discovered',
    body: 'Appear in the LIFTAG trainer directory. Lifters filter by specialty, experience, gym, and location, then contact you directly. No paywall, no fee.',
  },
  {
    icon: 'profile',
    title: 'Own how you appear',
    body: 'Specialisms, experience, location, linked gyms, and social links. Full control over the profile lifters see when they are choosing a coach.',
  },
  {
    icon: 'badge',
    title: 'Verified coach badge',
    body: 'Approved coaches get a verified badge and stand out in the directory, so clients know they are reaching a real, reviewed trainer.',
  },
]
</script>

<template>
  <div class="coach-page">
    <SiteNav />

    <main>
      <!-- HERO -->
      <section class="coach-hero">
        <span class="coach-glow coach-glow--red" aria-hidden="true" />
        <span class="coach-glow coach-glow--lime" aria-hidden="true" />

        <div class="container coach-hero-inner">
          <p class="protocol coach-eyebrow">Join as a coach</p>
          <h1 class="display coach-hero-title">
            Coach where your clients<br >already <span class="lime">train.</span>
          </h1>
          <p class="coach-lead">
            Build your coaching profile inside LIFTAG, get discovered by lifters, share routines,
            and track real progress, all from the same app your clients use every session.
          </p>

          <div class="coach-pills">
            <span class="coach-pill coach-pill--free">Free while in beta</span>
            <span class="coach-pill">Online &amp; in-person</span>
            <span class="coach-pill">Verified coach badge</span>
          </div>

          <div class="coach-store-row">
            <AppStoreBtn store="apple" :href="APP_STORE" />
            <AppStoreBtn store="google" :href="PLAY_STORE" />
          </div>

          <div class="coach-hero-links">
            <a href="#apply" class="coach-jumplink">How it works <span aria-hidden="true">↓</span></a>
            <a href="#features" class="coach-jumplink">What you get <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </section>

      <!-- APPLY / HOW TO JOIN -->
      <section id="apply" class="coach-flow">
        <div class="container">
          <header class="coach-section-head reveal">
            <p class="protocol coach-section-eyebrow">How to join</p>
            <h2 class="display coach-section-title">Four steps from lifter to coach.</h2>
            <p class="coach-section-lead">
              There is no web form to fill in. You apply straight from the LIFTAG app, and once a
              quick review is done your profile goes live in the trainer directory.
            </p>
          </header>

          <ol class="coach-steps">
            <li
              v-for="step in steps"
              :key="step.no"
              class="coach-step reveal"
            >
              <span class="coach-step-no">{{ step.no }}</span>
              <div class="coach-step-body">
                <h3 class="coach-step-title">{{ step.title }}</h3>
                <p class="coach-step-text">{{ step.body }}</p>
                <div v-if="step.no === '01'" class="coach-store-row coach-store-row--inline">
                  <AppStoreBtn store="apple" :href="APP_STORE" />
                  <AppStoreBtn store="google" :href="PLAY_STORE" />
                </div>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <!-- FEATURES / LEARN MORE -->
      <section id="features" class="coach-perks">
        <div class="container">
          <header class="coach-section-head reveal">
            <p class="protocol coach-section-eyebrow">What you get</p>
            <h2 class="display coach-section-title">Everything you need to coach.</h2>
            <p class="coach-section-lead">
              LIFTAG gives trainers a profile, a discovery surface, shared plans, and client progress
              tied to real set history, with no extra tools to stitch together.
            </p>
          </header>

          <div class="coach-perk-grid">
            <article
              v-for="perk in perks"
              :key="perk.title"
              class="coach-perk reveal"
              :class="{ 'is-highlight': perk.highlight }"
            >
              <span class="coach-perk-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <template v-if="perk.icon === 'clients'">
                    <circle cx="9" cy="8" r="3.2" />
                    <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
                    <path d="M16 5.2a3 3 0 0 1 0 5.6M17 14.4a5.5 5.5 0 0 1 3.5 5.1" />
                  </template>
                  <template v-else-if="perk.icon === 'chart'">
                    <path d="M4 4v16h16" />
                    <path d="M7.5 14.5 11 11l2.5 2.5L20 7" />
                  </template>
                  <template v-else-if="perk.icon === 'plan'">
                    <rect x="4" y="3.5" width="16" height="17" rx="2" />
                    <path d="M8 8h8M8 12h8M8 16h5" />
                  </template>
                  <template v-else-if="perk.icon === 'discover'">
                    <circle cx="11" cy="11" r="6.5" />
                    <path d="m20 20-4-4" />
                  </template>
                  <template v-else-if="perk.icon === 'profile'">
                    <circle cx="12" cy="8" r="3.4" />
                    <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
                  </template>
                  <template v-else>
                    <path d="M12 3.5 14.6 9l6 .5-4.5 3.9 1.4 5.8L12 16.9 6.5 19.2 7.9 13.4 3.4 9.5l6-.5z" />
                  </template>
                </svg>
              </span>
              <h3 class="coach-perk-title">{{ perk.title }}</h3>
              <p class="coach-perk-text">{{ perk.body }}</p>
            </article>
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section class="coach-faq">
        <div class="container">
          <p class="protocol coach-section-eyebrow reveal">Common questions</p>
          <div class="coach-faq-list reveal">
            <details class="coach-faq-item">
              <summary>Does it cost anything to coach on LIFTAG?</summary>
              <p>No. Coaching on LIFTAG is free while we are in beta. You can build your profile, manage clients, share routines, and track their progress at no cost.</p>
            </details>
            <details class="coach-faq-item">
              <summary>How do I apply to become a coach?</summary>
              <p>Download the LIFTAG app, then open Profile and tap Become a Trainer. Fill out your coach application with your bio, specializations, experience, and location. It takes a couple of minutes, then our team reviews it.</p>
            </details>
            <details class="coach-faq-item">
              <summary>How long does approval take?</summary>
              <p>Each application is reviewed by our team. You get a notification the moment a decision is made, and you can keep editing your application while it is still pending.</p>
            </details>
            <details class="coach-faq-item">
              <summary>Can I coach online and in person?</summary>
              <p>Yes. You choose whether you offer online coaching, in-person coaching, or both, and set your location so nearby lifters can find you in the directory.</p>
            </details>
            <details class="coach-faq-item">
              <summary>Where do clients find me once I am approved?</summary>
              <p>Approved coaches appear in the in-app LIFTAG trainer directory, where lifters search and filter by specialty, experience, gym, and location, then contact you directly.</p>
            </details>
          </div>
        </div>
      </section>

      <!-- FINAL CTA -->
      <section class="coach-final">
        <div class="container coach-final-inner reveal">
          <h2 class="display coach-final-title">Ready to coach on LIFTAG?</h2>
          <p class="coach-final-lead">Download the app, open your application, and start building your roster.</p>
          <div class="coach-store-row">
            <AppStoreBtn store="apple" :href="APP_STORE" />
            <AppStoreBtn store="google" :href="PLAY_STORE" />
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
  min-height: 100dvh;
  background:
    radial-gradient(circle at 82% 12%, rgba(255, 45, 85, 0.1), transparent 36%),
    radial-gradient(circle at 12% 78%, rgba(204, 255, 0, 0.06), transparent 40%),
    #000;
  color: #fff;
}

/* ── Hero ── */
.coach-hero {
  position: relative;
  padding: 160px 0 84px;
  overflow: hidden;
}

.coach-glow {
  position: absolute;
  width: 620px;
  height: 620px;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}

.coach-glow--red {
  top: -180px;
  right: -160px;
  background: radial-gradient(circle, rgba(255, 45, 85, 0.18), transparent 62%);
}

.coach-glow--lime {
  bottom: -260px;
  left: -200px;
  background: radial-gradient(circle, rgba(204, 255, 0, 0.1), transparent 62%);
}

.coach-hero-inner {
  position: relative;
  z-index: 1;
  max-width: 880px;
}

.coach-eyebrow {
  color: var(--liftag-red-neon);
  margin: 0 0 20px;
}

.coach-hero-title {
  font-size: clamp(46px, 8vw, 104px);
  margin: 0;
}

.coach-lead {
  max-width: 640px;
  margin: 28px 0 0;
  color: rgba(255, 255, 255, 0.66);
  font-size: clamp(17px, 2vw, 21px);
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
  padding: 9px 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.03);
}

.coach-pill--free {
  color: #0E0E0E;
  background: var(--liftag-primary);
  border-color: transparent;
  box-shadow: 0 0 24px rgba(204, 255, 0, 0.32);
}

.coach-store-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 34px;
}

.coach-store-row--inline {
  margin-top: 22px;
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
  color: var(--liftag-primary);
}

/* ── Shared section heads ── */
.coach-flow,
.coach-perks,
.coach-faq {
  padding: 84px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.coach-section-head {
  max-width: 660px;
  margin-bottom: 52px;
}

.coach-section-eyebrow {
  color: var(--liftag-red-neon);
  margin: 0 0 18px;
}

.coach-section-title {
  font-size: clamp(32px, 4.6vw, 58px);
}

.coach-section-lead {
  margin: 22px 0 0;
  color: rgba(255, 255, 255, 0.62);
  font-size: 17px;
  font-weight: 300;
  line-height: 1.65;
}

/* ── Steps ── */
.coach-steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0;
}

.coach-step {
  position: relative;
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  gap: clamp(16px, 3vw, 40px);
  padding: 30px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}

.coach-step:last-child {
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.coach-step-no {
  font-family: var(--liftag-font-mono);
  font-weight: 800;
  font-size: clamp(34px, 4vw, 48px);
  line-height: 1;
  color: var(--liftag-red-neon);
  letter-spacing: -0.02em;
  text-shadow: 0 0 26px rgba(255, 45, 85, 0.4);
}

.coach-step-title {
  margin: 0;
  font-family: var(--liftag-font-headline);
  font-weight: 700;
  font-style: italic;
  font-size: clamp(22px, 2.6vw, 30px);
  text-transform: uppercase;
  letter-spacing: -0.02em;
}

.coach-step-text {
  margin: 12px 0 0;
  max-width: 620px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 16px;
  font-weight: 300;
  line-height: 1.65;
}

/* ── Perks ── */
.coach-perk-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.coach-perk {
  padding: clamp(22px, 2.4vw, 30px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--liftag-r-lg);
  background: rgba(10, 10, 10, 0.7);
  transition: border-color 280ms ease, transform 280ms ease, background 280ms ease;
}

.coach-perk:hover {
  border-color: rgba(255, 45, 85, 0.34);
  transform: translateY(-3px);
  background: rgba(14, 14, 14, 0.86);
}

.coach-perk.is-highlight {
  border-color: rgba(204, 255, 0, 0.34);
  background:
    linear-gradient(150deg, rgba(204, 255, 0, 0.08), transparent 52%),
    rgba(10, 12, 6, 0.8);
}

.coach-perk.is-highlight:hover {
  border-color: rgba(204, 255, 0, 0.55);
}

.coach-perk-icon {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: rgba(255, 45, 85, 0.12);
  color: var(--liftag-red-neon);
  margin-bottom: 20px;
}

.coach-perk.is-highlight .coach-perk-icon {
  background: rgba(204, 255, 0, 0.14);
  color: var(--liftag-primary);
}

.coach-perk-icon svg {
  width: 22px;
  height: 22px;
}

.coach-perk-title {
  margin: 0;
  font-family: var(--liftag-font-headline);
  font-weight: 700;
  font-size: 19px;
  letter-spacing: -0.01em;
}

.coach-perk-text {
  margin: 12px 0 0;
  color: rgba(255, 255, 255, 0.58);
  font-size: 15px;
  font-weight: 300;
  line-height: 1.6;
}

/* ── FAQ ── */
.coach-faq-list {
  display: grid;
  gap: 10px;
  margin-top: 28px;
  max-width: 820px;
}

.coach-faq-item {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--liftag-r-sm);
  background: rgba(11, 11, 11, 0.72);
  padding: 20px 24px;
}

.coach-faq-item summary {
  cursor: pointer;
  color: #fff;
  font-family: var(--liftag-font-headline);
  font-size: 19px;
  font-weight: 700;
  font-style: italic;
  text-transform: uppercase;
  letter-spacing: -0.01em;
  list-style: none;
}

.coach-faq-item summary::-webkit-details-marker {
  display: none;
}

.coach-faq-item summary::after {
  content: '+';
  float: right;
  color: var(--liftag-red-neon);
  font-style: normal;
  font-weight: 400;
  transition: transform 220ms ease;
}

.coach-faq-item[open] summary::after {
  content: '−';
}

.coach-faq-item p {
  margin: 16px 0 0;
  color: rgba(255, 255, 255, 0.62);
  font-size: 16px;
  font-weight: 300;
  line-height: 1.65;
}

/* ── Final CTA ── */
.coach-final {
  padding: 96px 0 110px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.coach-final-inner {
  text-align: center;
}

.coach-final-title {
  font-size: clamp(34px, 5vw, 64px);
}

.coach-final-lead {
  margin: 20px auto 0;
  max-width: 520px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 18px;
  font-weight: 300;
}

.coach-final .coach-store-row {
  justify-content: center;
}

.coach-final-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24px;
  margin-top: 30px;
}

.coach-textlink {
  color: var(--liftag-primary);
  text-decoration: none;
  font-family: var(--liftag-font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  transition: opacity 220ms ease;
}

.coach-textlink:hover {
  opacity: 0.7;
}

.coach-textlink--muted {
  color: rgba(255, 255, 255, 0.5);
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .coach-hero {
    padding-top: 128px;
  }

  .coach-perk-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 620px) {
  .coach-step {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .coach-perk-grid {
    grid-template-columns: 1fr;
  }

  .coach-store-row {
    flex-direction: column;
  }

  .coach-store-row :deep(.app-store-btn) {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .coach-perk {
    transition: none;
  }
}
</style>
