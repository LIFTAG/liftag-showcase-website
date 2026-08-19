<script setup lang="ts">
import {
  GYM_QR_COMPARISON_PATH,
  GYM_QR_COMPARISON_UPDATED,
  gymQrCards,
  gymQrSources,
} from '~/utils/gymQrComparison'

const title = 'Best QR and NFC gym tracking app in <span class="lime">2026.</span>'
const description = 'An honest head-to-head of gym QR and NFC tracking platforms in 2026, covering LIFTAG, Liftd, ScanLiftLog, and RepTag, written by the team that ships one of them.'

const path = GYM_QR_COMPARISON_PATH
const lastUpdated = GYM_QR_COMPARISON_UPDATED

useLiftagSeo({
  title: 'Best QR and NFC Gym Tracking App 2026 | LIFTAG',
  description,
  path,
})

const exclusives = [
  {
    tag: 'ONLY LIFTAG',
    title: 'Free core for gym owners',
    body: 'Tags, listing, machine setup, and the core dashboard stay free forever. Liftd starts at $39/mo, ScanLiftLog at $30/mo, RepTag at 150 €/mo. Nobody else in this category gives the gym a free operating layer.',
  },
  {
    tag: 'ONLY LIFTAG',
    title: 'NFC + QR tags shipped free',
    body: 'The physical kit arrives ready to stick on the floor. Liftd has gyms print QR codes. ScanLiftLog ships QR labels on a paid plan. RepTag sells or prints QR stickers. LIFTAG is the only one that ships both NFC and QR at no cost.',
  },
]

const bests = [
  {
    tag: 'BEST HERE',
    title: 'NFC first, QR always',
    body: 'Tap is faster than a camera scan. LIFTAG treats NFC and QR as the default kit on every machine. Liftd supports NFC, but QR is the primary path and the gym supplies the tags. ScanLiftLog and RepTag are QR only.',
  },
  {
    tag: 'BEST HERE',
    title: 'Your trainers, on your machines',
    body: 'Gyms can film their own coaches on the exact equipment members will use. The tag opens that video, not a generic stock clip. That is the onboarding loop LIFTAG is built around.',
  },
  {
    tag: 'BEST HERE',
    title: 'Serious-lifter metrics',
    body: 'Auto PRs, estimated 1RM, volume trends from 4 to 52 weeks, body-part splits, RPE, and streaks. The other scan platforms log the set. LIFTAG keeps the progressive-overload record.',
  },
]

const faqs = [
  {
    question: 'What is the cheapest QR or NFC gym tracking platform for gym owners?',
    answer: 'LIFTAG. Core gym tools and the physical NFC + QR tag kit are free forever. Liftd is $39 to $239 per month by machine count. ScanLiftLog is $30 to $150 per month plus a $99 setup fee, which is waived on a longer term. RepTag is 150 € per month excl. VAT. Member apps are free on all four.',
  },
  {
    question: 'Which gym tracking apps use NFC and QR codes on machines?',
    answer: 'LIFTAG ships both NFC and QR as the default kit. Liftd is QR-primary and also supports NFC if the gym supplies tags. ScanLiftLog and RepTag are QR only. General workout trackers such as Strong and Hevy do not have machine tags.',
  },
  {
    question: 'How does LIFTAG compare to Liftd?',
    answer: 'Both open the machine and log a set quickly. Liftd currently leads on owner-side utilization and silent-churn analytics. LIFTAG leads on gym cost (free core), the shipped NFC + QR kit, gym-filmed trainer videos, and serious-lifter progress metrics. Pick Liftd if you are buying retention intelligence. Pick LIFTAG if you want the floor tagged without a monthly platform bill.',
  },
  {
    question: 'Is there a gym QR tracker that does not need an app?',
    answer: 'Yes. ScanLiftLog is browser-only, with an optional add-to-home-screen PWA and on-device storage. RepTag has a strong web fallback for exercise, video, and defect reports, then unlocks tracking in the app. LIFTAG and Liftd need the member app for full logging.',
  },
  {
    question: 'Does LIFTAG have a gym discovery map?',
    answer: 'Yes. Partner gyms get a verified listing on the LIFTAG map as part of the free core. RepTag also has a studio map and partner listing, included with its paid platform. Liftd’s multi-gym story is a member travel passport, not a public gym-acquisition map.',
  },
  {
    question: 'Why should I trust this comparison if LIFTAG wrote it?',
    answer: 'The page is written by the team behind LIFTAG, which is a conflict of interest by definition. Where Liftd, ScanLiftLog, or RepTag genuinely win, we say so on the same page. Pricing and features are taken from each product’s public site as of August 2026. Follow the source links and verify before you buy.',
  },
]

useLiftagStructuredData([
  liftagOrganization,
  liftagMobileApplication,
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: '/' },
    { name: 'Best QR and NFC gym tracking app', path },
  ]),
  liftagArticle({
    headline: 'Best QR and NFC gym tracking app in 2026: honest head-to-head',
    description,
    path,
    datePublished: lastUpdated,
  }),
  liftagFAQPage(faqs),
])
</script>

<template>
  <div class="seo-page">
    <main>
      <section class="gqc-hero">
        <div class="container">
          <p class="protocol gqc-eyebrow">COMPARISON · UPDATED AUG 2026</p>
          <h1 class="display gqc-title" v-html="title"></h1>
          <p class="gqc-lead">{{ description }}</p>
          <div class="gqc-actions">
            <a href="/for-gyms" class="btn-primary">For gym owners</a>
            <a href="#table" class="btn-ghost">Jump to comparison</a>
          </div>

          <div class="gqc-tldr">
            <p class="protocol">TL;DR</p>
            <p>
              For gyms,
              <strong class="lime">LIFTAG</strong>
              is the only platform in this category that ships NFC and QR tags and keeps core gym tools free.
              <strong>Liftd</strong>
              is the pick if you will pay for deep retention and utilization analytics.
              <strong>ScanLiftLog</strong>
              wins if members must never install an app.
              <strong>RepTag</strong>
              wins for DACH studios that want trainer chat, challenges, and a digital floor plan.
            </p>
          </div>
        </div>
      </section>

      <section id="table" class="gqc-section">
        <div class="container">
          <h2 class="gqc-section-title">At-a-glance comparison</h2>
          <p class="gqc-section-lead">
            Four scan-the-machine platforms. Sorted with LIFTAG first because we are LIFTAG. The rows that decide a gym rollout are cost and who pays for the tags.
          </p>
          <GymQrComparisonTable kind="glance" label="QR and NFC gym platform comparison" />
        </div>
      </section>

      <section class="gqc-section">
        <div class="container">
          <h2 class="gqc-section-title">What only LIFTAG has</h2>
          <p class="gqc-section-lead">
            These are the two rows nobody else in the category can match. They are also the biggest reasons a gym says yes.
          </p>
          <ol class="gqc-exclusive">
            <li v-for="item in exclusives" :key="item.title">
              <p class="protocol gqc-exclusive-tag">{{ item.tag }}</p>
              <h3>{{ item.title }}</h3>
              <p>{{ item.body }}</p>
            </li>
          </ol>

          <h2 class="gqc-section-title gqc-section-title--follow">Where LIFTAG is best, not only</h2>
          <p class="gqc-section-lead">
            The next three still matter. Competitors touch pieces of them. None of them ship the whole stack as the default.
          </p>
          <ol class="gqc-exclusive gqc-exclusive--best" start="3">
            <li v-for="item in bests" :key="item.title">
              <p class="protocol gqc-exclusive-tag">{{ item.tag }}</p>
              <h3>{{ item.title }}</h3>
              <p>{{ item.body }}</p>
            </li>
          </ol>
        </div>
      </section>

      <section class="gqc-section">
        <div class="container">
          <h2 class="gqc-section-title">Feature by feature</h2>
          <p class="gqc-section-lead">
            Rows are ordered by how much they change a gym decision, then by whether LIFTAG is the only one that has them. Competitor wins stay on the same table.
          </p>
          <GymQrComparisonTable kind="matrix" variant="full" label="QR and NFC gym feature matrix" />
        </div>
      </section>

      <section class="gqc-section">
        <div class="container">
          <h2 class="gqc-section-title">Honest breakdown, platform by platform</h2>
          <p class="gqc-section-lead">
            What each one is genuinely good at, where each one loses, and who we would actually send there. Including the cases where LIFTAG is the wrong answer.
          </p>

          <div class="gqc-cards">
            <article
              v-for="card in gymQrCards"
              :key="card.name"
              class="gqc-card"
              :class="{ 'gqc-card-self': card.name === 'LIFTAG' }"
            >
              <header class="gqc-card-head">
                <h3>{{ card.name }}</h3>
                <p class="gqc-card-oneliner">{{ card.oneLine }}</p>
              </header>

              <div class="gqc-card-cols">
                <div>
                  <p class="protocol gqc-card-h">Good at</p>
                  <ul>
                    <li v-for="item in card.goodAt" :key="item">{{ item }}</li>
                  </ul>
                </div>
                <div>
                  <p class="protocol gqc-card-h">Not good at</p>
                  <ul>
                    <li v-for="item in card.notGoodAt" :key="item">{{ item }}</li>
                  </ul>
                </div>
              </div>

              <p class="gqc-card-pick">
                <span class="protocol">Pick when</span> {{ card.pickWhen }}
              </p>
            </article>
          </div>
        </div>
      </section>

      <section class="gqc-section">
        <div class="container">
          <h2 class="gqc-section-title">When LIFTAG is the right answer</h2>
          <ul class="gqc-when-list">
            <li>You own or run a gym and you want every machine tagged without a monthly platform fee.</li>
            <li>You want NFC tap and QR scan on the same sticker, shipped to you, not printed in the back office.</li>
            <li>You want members to see a video your trainers filmed on that exact machine, then log the set on the same screen.</li>
            <li>You want a verified listing on a lifter-facing discovery map as part of the core, not as a paid add-on.</li>
            <li>You train, and you want a full standalone tracker that gets faster the day your gym installs tags.</li>
          </ul>

          <h2 class="gqc-section-title gqc-section-title--follow">When you should pick something else</h2>
          <ul class="gqc-when-list">
            <li>You are buying owner-side silent-churn and utilization intelligence and you will pay for it: Liftd.</li>
            <li>Members must never install an app or create an account: ScanLiftLog.</li>
            <li>You run a DACH studio and want trainer chat, booking, challenges, and a digital floor plan in one product: RepTag.</li>
            <li>You only need a general set logger and your gym has no machine tags: start at the <a href="/best-workout-tracking-app">workout tracker comparison</a>.</li>
          </ul>
        </div>
      </section>

      <section class="gqc-section">
        <div class="container">
          <p class="protocol gqc-eyebrow">Common questions</p>
          <h2 class="gqc-section-title">Common questions</h2>
          <FaqAccordion
            class="gqc-faq-list"
            :items="faqs"
            id-prefix="gqc-faq"
          />
        </div>
      </section>

      <section class="gqc-section gqc-method">
        <div class="container">
          <p class="protocol gqc-eyebrow">Methodology</p>
          <p class="gqc-method-body">
            This comparison is written and maintained by the team behind LIFTAG. Feature and pricing notes are taken from public product pages as of {{ lastUpdated }}:
            <template v-for="(source, index) in gymQrSources" :key="source.href">
              <a :href="source.href" target="_blank" rel="noopener noreferrer">{{ source.label }}</a><template v-if="index < gymQrSources.length - 1">, </template>
            </template>.
            Pricing and feature gating change. Verify on each site before deciding. Where LIFTAG is not the best pick, we point at the competitor that actually is.
          </p>
          <p class="gqc-method-body">
            Conflict of interest: LIFTAG benefits when a gym partners with LIFTAG or a lifter installs LIFTAG. We do not benefit when a gym buys Liftd, ScanLiftLog, or RepTag. Read accordingly. Scale and retention claims from competitors are self-reported.
          </p>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.seo-page {
  min-height: var(--liftag-stable-vh);
  background:
    radial-gradient(circle at 82% 18%, rgba(204, 255, 0, 0.11), transparent 34%),
    radial-gradient(circle at 18% 76%, rgba(255, 45, 85, 0.045), transparent 36%),
    #000;
  color: #fff;
}

.gqc-hero {
  padding: 150px 0 72px;
}

.gqc-eyebrow {
  color: var(--liftag-primary);
  margin: 0 0 18px;
}

.gqc-title {
  max-width: 980px;
  font-size: clamp(48px, 7.5vw, 116px);
}

.gqc-lead {
  max-width: 760px;
  margin: 28px 0 0;
  color: rgba(255, 255, 255, 0.66);
  font-size: clamp(18px, 2vw, 23px);
  font-weight: 300;
  line-height: 1.55;
}

.gqc-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 34px;
}

.gqc-actions a {
  text-decoration: none;
}

.gqc-tldr {
  margin: 52px 0 0;
  padding: 28px;
  border: 1px solid rgba(204, 255, 0, 0.22);
  border-radius: 10px;
  background: rgba(11, 18, 21, 0.7);
  max-width: 880px;
}

.gqc-tldr p:first-child {
  margin: 0 0 12px;
  color: var(--liftag-primary);
}

.gqc-tldr p:last-child {
  margin: 0;
  font-size: 17px;
  font-weight: 300;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.85);
}

.gqc-tldr strong {
  color: #fff;
  font-weight: 700;
}

.gqc-tldr .lime {
  color: var(--liftag-primary);
}

.gqc-section {
  padding: 64px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

#table {
  scroll-margin-top: calc(88px + var(--liftag-safe-top));
}

.gqc-section-title {
  margin: 0;
  font-family: var(--liftag-font-headline);
  font-size: clamp(32px, 4.4vw, 56px);
  font-style: italic;
  text-transform: uppercase;
  line-height: 0.98;
}

.gqc-section-title--follow {
  margin-top: 56px;
}

.gqc-section-lead {
  max-width: 760px;
  margin: 16px 0 36px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 17px;
  font-weight: 300;
  line-height: 1.65;
}

.gqc-exclusive {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 1px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  overflow: hidden;
}

.gqc-exclusive li {
  padding: clamp(24px, 3vw, 36px);
  background: rgba(5, 8, 9, 0.96);
}

.gqc-exclusive-tag {
  margin: 0 0 12px;
  color: var(--liftag-primary);
}

.gqc-exclusive h3 {
  margin: 0;
  font-family: var(--liftag-font-headline);
  font-size: clamp(24px, 3vw, 36px);
  font-style: italic;
  text-transform: uppercase;
  line-height: 1;
}

.gqc-exclusive p:last-child {
  max-width: 72ch;
  margin: 14px 0 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  font-weight: 300;
  line-height: 1.65;
}

.gqc-exclusive--best {
  margin-top: 8px;
}

.gqc-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.gqc-card {
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  background: rgba(11, 18, 21, 0.7);
}

.gqc-card-self {
  border-color: rgba(204, 255, 0, 0.28);
  box-shadow: 0 0 0 1px rgba(204, 255, 0, 0.08) inset;
}

.gqc-card-head h3 {
  margin: 0;
  font-family: var(--liftag-font-headline);
  font-size: 28px;
  font-style: italic;
  text-transform: uppercase;
  letter-spacing: -0.01em;
}

.gqc-card-self h3 {
  color: var(--liftag-primary);
}

.gqc-card-oneliner {
  margin: 8px 0 22px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-weight: 300;
  line-height: 1.55;
}

.gqc-card-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 20px;
}

.gqc-card-h {
  margin: 0 0 10px;
  color: var(--liftag-primary);
  font-size: 10px;
}

.gqc-card ul {
  margin: 0;
  padding: 0 0 0 18px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13.5px;
  font-weight: 300;
  line-height: 1.55;
}

.gqc-card li {
  margin-bottom: 6px;
}

.gqc-card-pick {
  margin: 0;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.78);
  font-size: 14px;
  font-weight: 300;
  line-height: 1.6;
}

.gqc-card-pick .protocol {
  display: inline-block;
  margin-right: 8px;
  color: var(--liftag-primary);
}

.gqc-when-list {
  margin: 0;
  padding: 0 0 0 20px;
  max-width: 820px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 16px;
  font-weight: 300;
  line-height: 1.7;
}

.gqc-when-list li {
  margin-bottom: 10px;
}

.gqc-when-list a {
  color: var(--liftag-primary);
  text-decoration: underline;
  text-decoration-color: rgba(204, 255, 0, 0.4);
  text-underline-offset: 3px;
}

.gqc-faq-list {
  margin-top: 24px;
}

.gqc-method-body {
  max-width: 820px;
  color: rgba(255, 255, 255, 0.55);
  font-size: 14px;
  font-weight: 300;
  line-height: 1.7;
}

.gqc-method-body + .gqc-method-body {
  margin-top: 14px;
}

.gqc-method-body a {
  color: var(--liftag-primary);
  text-decoration: underline;
  text-decoration-color: rgba(204, 255, 0, 0.35);
  text-underline-offset: 3px;
}

@media (max-width: 900px) {
  .gqc-hero {
    padding-top: calc(120px + var(--liftag-safe-top));
  }

  .gqc-cards {
    grid-template-columns: 1fr;
  }

  .gqc-card-cols {
    grid-template-columns: 1fr;
    gap: 14px;
  }
}

@media (max-width: 620px) {
  .gqc-hero {
    padding: 108px 0 54px;
  }

  .gqc-actions {
    flex-direction: column;
  }

  .gqc-actions a {
    width: 100%;
    text-align: center;
  }
}
</style>
