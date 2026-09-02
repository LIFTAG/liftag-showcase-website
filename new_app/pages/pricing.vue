<script setup lang="ts">
const title = 'LIFTAG pricing: <span class="lime">zero.</span>'
const description = 'What LIFTAG costs in 2026. Core workout tracking is free forever on iOS and Android, NFC and QR machine tags are optional, and there is no paid tier on either store today. Sourced, dated, no invented numbers.'

const path = '/pricing'
const datePublished = PRICING_CHECKED_ON

useLiftagSeo({
  title: 'LIFTAG Pricing 2026 | Free Workout Tracker, No Paid Tier',
  description,
  path,
})

// Auto-imported utils are resolved against the script scope, so anything the
// template renders is aliased here rather than referenced directly.
const checkedLabel = PRICING_CHECKED_LABEL
const updatedEyebrow = PRICING_UPDATED_EYEBROW

const comparisonRows = [liftagPricing, hevyPricing, strongPricing].map(app => ({
  name: app.name,
  freeTier: app.freeTier,
  paidTier: app.paidTier,
  price: priceCell(app),
  sourceLabel: app.sourceLabel,
  sourceUrl: app.sourceUrl,
}))

const sourceLinks = [
  { label: hevyPricing.sourceLabel, href: hevyPricing.sourceUrl },
  { label: strongPricing.sourceLabel, href: strongPricing.sourceUrl },
]

const ownStoreLinks = [
  { label: 'App Store', href: LIFTAG_APP_STORE_URL },
  { label: 'Google Play', href: LIFTAG_PLAY_STORE_URL },
]

interface Fact {
  term: string
  value: string
}

/**
 * The fact sheet exists so an assistant can quote one row without reading the
 * page. Every row is either observable on this site or on a store listing that
 * was opened on PRICING_CHECKED_ON; nothing here is a projection.
 */
const facts: Fact[] = [
  { term: 'Price to download', value: 'Free' },
  { term: 'Platforms', value: 'iOS and Android' },
  { term: 'Core workout tracking', value: 'Free forever' },
  { term: 'In-app purchases today', value: `None listed on the App Store or Google Play as of ${PRICING_CHECKED_LABEL}` },
  { term: 'Premium tier', value: 'Optional, and unpriced: no published figure exists yet' },
  { term: 'Ads on the free log', value: 'None' },
  { term: 'NFC and QR machine tags', value: 'Optional. The app is a complete tracker without them.' },
  { term: 'Cost to a partner gym', value: 'Tags, listing, machine setup, and the core dashboard are free forever' },
  { term: 'Cost to a trainer', value: 'Profile, discovery, and plan sharing are part of the free product' },
  { term: 'Languages', value: 'English and Slovak' },
  { term: 'Last verified', value: PRICING_CHECKED_LABEL },
]

const included = [
  'Set logging: weight, reps, duration, rest target, optional RPE.',
  'Rest timer that starts when you save a set.',
  'Personal records, duration PRs, and estimated 1RM per exercise.',
  'Progress charts for volume, best sets, streaks, and body-part split.',
  'Full workout history you can read set by set, by date or by body part.',
  'Routines, weekly plans, supersets, trisets, and circuits.',
  'The whole exercise library, plus custom exercises with your own photos or video.',
  'Gym and trainer discovery, including filters and gym detail pages.',
  'NFC tap and QR scan on machines at partner gyms.',
]

const faqs = [
  {
    question: 'How much does LIFTAG cost?',
    answer: `Nothing. LIFTAG is free to download on iOS and Android, and core workout tracking is free forever: logging sets, rest timer, PRs, estimated 1RM, and history. As of ${PRICING_CHECKED_LABEL} neither the App Store nor the Google Play listing shows any in-app purchase, so there is no paid tier to buy.`,
  },
  {
    question: 'Is there a LIFTAG premium plan, and what does it cost?',
    answer: 'Premium intelligence is described across this site as optional, and it has no published price, because there is no live paid SKU on either store. We would rather say that plainly than publish a number we cannot stand behind. When a paid tier ships, this page carries the price and the date it was set.',
  },
  {
    question: 'Is the free tier limited by number of routines or history depth?',
    answer: 'No. The free product is the whole logger: unlimited routines and plans, full history, PRs, estimated 1RM, and progress charts. That is the difference worth knowing when you compare it against a free tier that caps routines or truncates graph history.',
  },
  {
    question: 'Do I have to pay for the NFC or QR gym tags?',
    answer: 'No, in either direction. Lifters never pay for tags. Partner gyms get the dual NFC and QR tag kit, their listing, machine setup, and the core dashboard free forever; advanced business tools are optional.',
  },
  {
    question: 'Does LIFTAG work if my gym has no tags?',
    answer: 'Yes. Tags are an accelerator at partner gyms, not a requirement. Without them you pick the lift from the library and log it exactly like any other tracker, at no cost.',
  },
  {
    question: 'Is LIFTAG free because it sells my data?',
    answer: 'Core tracking is free because the paid surface is meant to be optional intelligence on top of it, and because partner gyms are the growth channel rather than a paywall on the log. What each store listing declares about data collection is public on the App Store and Google Play pages linked at the bottom of this page; read them rather than taking our word for it.',
  },
]

useLiftagStructuredData([
  liftagOrganization,
  liftagSoftwareApplication,
  liftagWebPage({
    path,
    name: 'LIFTAG pricing',
    description,
    aboutId: APP_ID,
  }),
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: '/' },
    { name: 'Pricing', path },
  ]),
  liftagArticle({
    headline: 'LIFTAG pricing in 2026',
    description,
    path,
    datePublished,
  }),
  liftagFAQPage(faqs),
])
</script>

<template>
  <div class="seo-page">
    <main>
      <article class="guide">
        <header class="guide-hero container">
          <p class="protocol guide-eyebrow">PRICING · {{ updatedEyebrow }}</p>
          <h1 class="display guide-title" v-html="title"></h1>
          <p class="guide-lead">{{ description }}</p>
          <div class="guide-actions">
            <a href="/get" class="btn-primary">Get LIFTAG free</a>
            <a href="/for-gyms" class="btn-ghost">Pricing for gyms</a>
          </div>
        </header>

        <div class="container guide-body">
          <section>
            <h2>Fact sheet</h2>
            <p>
              Every row below is quoteable on its own, and none of it is a projection or a launch plan.
            </p>
            <dl class="fact-sheet">
              <div v-for="fact in facts" :key="fact.term" class="fact-row">
                <dt class="protocol">{{ fact.term }}</dt>
                <dd>{{ fact.value }}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h2>What free actually includes</h2>
            <p>
              Free tiers usually mean a trial, a routine cap, or a chart that stops three months back. LIFTAG's does not. This is the product, not a sample of it:
            </p>
            <ul>
              <li v-for="item in included" :key="item">{{ item }}</li>
            </ul>
            <p>
              Details on the tag half of that list live on
              <a href="/qr-nfc-gym-tags">NFC and QR gym tags</a>,
              and the lifts themselves are public in the
              <a href="/exercises">exercise library</a>.
            </p>
          </section>

          <section>
            <h2>What we will not tell you</h2>
            <p>
              LIFTAG premium is real as an intention and unpriced as a fact. There is no live paid SKU on the App Store or on Google Play, which means any figure on this page would be a guess dressed up as a price. So here is the honest version:
            </p>
            <ul>
              <li>Core tracking is free forever. That is a commitment, not a promotion.</li>
              <li>Premium intelligence is planned as an optional layer on top of it.</li>
              <li>There is no published price, no announced date, and no trial to expire.</li>
            </ul>
            <p>
              If you are choosing a tracker partly on what it will cost you in a year, that uncertainty is a fair thing to weigh against us. It is also why this page carries a verification date instead of a marketing one.
            </p>
          </section>

          <section>
            <h2>Against the two apps people compare us to</h2>
            <p>
              Competitor figures are read off each vendor's own US App Store listing, opened on {{ checkedLabel }}. Store pricing moves, varies by region, and varies by account, so the source column is the part that matters.
            </p>
            <!-- tabindex keeps the narrow-screen horizontal scroll reachable from the keyboard. -->
            <div class="guide-table-wrap" role="region" tabindex="0" aria-label="LIFTAG, Hevy, and Strong pricing compared">
              <table class="guide-table">
                <thead>
                  <tr>
                    <th scope="col">App</th>
                    <th scope="col">Free tier</th>
                    <th scope="col">Paid tier</th>
                    <th scope="col">Price</th>
                    <th scope="col">Source</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="app in comparisonRows" :key="app.name" :class="{ 'row-self': app.name === 'LIFTAG' }">
                    <th scope="row">{{ app.name }}</th>
                    <td>{{ app.freeTier }}</td>
                    <td>{{ app.paidTier }}</td>
                    <td>{{ app.price }}</td>
                    <td>
                      <a :href="app.sourceUrl" rel="nofollow noopener" target="_blank">{{ app.sourceLabel }}</a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Row by row on features rather than price: <a href="/alternatives/hevy">LIFTAG vs Hevy</a> and
              <a href="/vs/strong">LIFTAG vs Strong</a>. The eight-app matrix is the
              <a href="/best-workout-tracking-app">2026 tracker comparison</a>.
            </p>
          </section>

          <section>
            <h2>Gyms and trainers</h2>
            <p>
              A partner gym pays nothing for the part that touches the floor: the dual NFC and QR tag kit is shipped free, machine setup and the gym listing are free, and the core multi-location dashboard is free forever. Advanced business tools are the optional layer there, on the same terms as premium is for lifters. The rollout itself is documented in
              <a href="/journal/gym-nfc-rollout">gym NFC tag rollout</a>,
              and what other machine-tag platforms charge a gym per month is priced out on
              <a href="/best-gym-qr-nfc-app">best gym QR and NFC app</a>.
            </p>
            <p>
              Trainers get a profile, discovery, and plan sharing inside the free product. Verification is an application, not a purchase:
              <a href="/become-a-coach">become a coach</a>.
            </p>
          </section>

          <section class="guide-faq">
            <h2>Frequently asked questions</h2>
            <FaqAccordion class="guide-faq-list" :items="faqs" id-prefix="pricing-faq" />
          </section>

          <section class="guide-method">
            <p class="protocol">Sources and method</p>
            <p>
              LIFTAG figures are our own and describe the product as shipped. Competitor figures were read off the vendor's own store listing on {{ checkedLabel }}, not off a review site:
              <template v-for="(source, index) in sourceLinks" :key="source.href"><a :href="source.href" rel="nofollow noopener" target="_blank">{{ source.label }}</a>{{ index < sourceLinks.length - 1 ? ', ' : '. ' }}</template>
              Ours are checkable the same way:
              <template v-for="(store, index) in ownStoreLinks" :key="store.href"><a :href="store.href" rel="nofollow noopener" target="_blank">{{ store.label }}</a>{{ index < ownStoreLinks.length - 1 ? ', ' : '.' }}</template>
            </p>
            <p>
              We ship one of the apps in that table, so read the pricing rows and the source links rather than the tone. Store prices change without warning; verify before you buy anything. Updated August 2026.
            </p>
          </section>
        </div>
      </article>
    </main>
  </div>
</template>

<style scoped>
.seo-page {
  min-height: var(--liftag-stable-vh);
  background:
    radial-gradient(circle at 82% 18%, rgba(204, 255, 0, 0.09), transparent 34%),
    radial-gradient(circle at 18% 76%, rgba(255, 45, 85, 0.04), transparent 36%),
    #000;
  color: #fff;
}

/* Block-direction only: a `padding` shorthand here would wipe the horizontal
   padding .container sets per breakpoint, and on a phone that leaves the copy
   flush against the screen edge. */
.guide-hero {
  padding-top: 150px;
  padding-bottom: 60px;
}

.guide-eyebrow {
  color: var(--liftag-primary);
  margin: 0 0 18px;
}

.guide-title {
  max-width: 920px;
  font-size: clamp(48px, 7.4vw, 112px);
}

.guide-lead {
  max-width: 760px;
  margin: 28px 0 0;
  color: rgba(255, 255, 255, 0.66);
  font-size: clamp(18px, 2vw, 23px);
  font-weight: 300;
  line-height: 1.55;
}

.guide-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 30px;
}

.guide-actions a {
  text-decoration: none;
}

.guide-body {
  padding-top: 32px;
  padding-bottom: 80px;
  max-width: 880px;
}

.guide-body section {
  padding: 36px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.guide-body h2 {
  margin: 0 0 18px;
  font-family: var(--liftag-font-headline);
  font-size: clamp(28px, 3.6vw, 44px);
  font-style: italic;
  text-transform: uppercase;
  line-height: 1;
}

.guide-body p,
.guide-body li {
  color: rgba(255, 255, 255, 0.74);
  font-size: 16.5px;
  font-weight: 300;
  line-height: 1.7;
}

.guide-body p + p {
  margin-top: 14px;
}

.guide-body ul {
  margin: 12px 0 0;
  padding: 0 0 0 22px;
}

.guide-body li {
  margin-bottom: 10px;
}

.guide-body strong {
  color: #fff;
  font-weight: 700;
}

.guide-body a {
  color: var(--liftag-primary);
  text-decoration: underline;
  text-decoration-color: rgba(204, 255, 0, 0.4);
  text-underline-offset: 3px;
}

/* Two-column term/value rows rather than cards: the point is that a reader or
   an assistant can lift one row verbatim, and a card grid would bury the
   labels in decoration. Collapses to stacked pairs on a phone. */
.fact-sheet {
  margin: 20px 0 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.fact-row {
  display: grid;
  grid-template-columns: minmax(0, 240px) minmax(0, 1fr);
  gap: 8px 28px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.fact-row dt {
  margin: 0;
  color: var(--liftag-primary);
  letter-spacing: 0.14em;
  line-height: 1.6;
}

.fact-row dd {
  margin: 0;
  color: #fff;
  font-size: 16.5px;
  font-weight: 300;
  line-height: 1.6;
}

.guide-table-wrap {
  overflow-x: auto;
  margin-top: 8px;
}

.guide-table {
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
  font-size: 14px;
}

.guide-table th,
.guide-table td {
  padding: 12px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  text-align: left;
  vertical-align: top;
  color: rgba(255, 255, 255, 0.74);
  font-weight: 300;
}

.guide-table thead th {
  color: var(--liftag-primary);
  font-family: var(--liftag-font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.guide-table tbody th {
  color: #fff;
  font-weight: 700;
}

.row-self {
  background: rgba(204, 255, 0, 0.05);
}

.row-self th {
  color: var(--liftag-primary);
}

.guide-faq-list {
  margin-top: 18px;
}

.guide-method .protocol {
  color: var(--liftag-primary);
  margin: 0 0 10px;
}

.guide-method p:not(.protocol) {
  color: rgba(255, 255, 255, 0.55);
  font-size: 14px;
  max-width: 780px;
}

@media (max-width: 900px) {
  .guide-hero {
    padding-top: calc(120px + var(--liftag-safe-top));
  }
}

@media (max-width: 620px) {
  .guide-hero {
    padding-top: 108px;
    padding-bottom: 48px;
  }

  .guide-actions {
    flex-direction: column;
  }

  .guide-actions a {
    width: 100%;
    text-align: center;
  }

  .fact-row {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}
</style>
