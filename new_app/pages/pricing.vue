<script setup lang="ts">
import { en, sk } from '~/i18n/messages/pricing'
import { en as pricingEn, sk as pricingSk } from '~/content/pricing'
import { en as pricingMetaEn, sk as pricingMetaSk } from '~/i18n/messages/appPricing'
const { t } = useI18n({ useScope: 'local', messages: { en: { ...en, appPricing: pricingMetaEn }, sk: { ...sk, appPricing: pricingMetaSk } } })
const { locale, href } = useSiteLocale()
const pricingCopy = computed(() => locale.value === 'sk' ? pricingSk : pricingEn)
const checkedLabel = computed(() => new Intl.DateTimeFormat(locale.value === 'sk' ? 'sk-SK' : 'en-GB', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${PRICING_CHECKED_ON}T00:00:00Z`)))
const withChecked = (copy: string) => copy.replaceAll('{checked}', checkedLabel.value)
const title = computed(() => t('pricing.title'))
const description = computed(() => t('pricing.description'))

const path = '/pricing'
const datePublished = PRICING_CHECKED_ON

useLiftagSeo(() => ({
  title: t('pricing.seoTitle'),
  description: description.value,
  path,
}))

// Auto-imported utils are resolved against the script scope, so anything the
// template renders is aliased here rather than referenced directly.
const updatedEyebrow = computed(() => t('appPricing.updated', { date: checkedLabel.value }))

const comparisonRows = computed(() => [liftagPricing, hevyPricing, strongPricing].map(app => ({
  name: app.name,
  freeTier: pricingCopy.value.comparison[app.name as keyof typeof pricingCopy.value.comparison]?.freeTier ?? app.freeTier,
  paidTier: pricingCopy.value.comparison[app.name as keyof typeof pricingCopy.value.comparison]?.paidTier ?? app.paidTier,
  price: priceCell(app, locale.value),
  sourceLabel: localizedAppPricing(app, locale.value).sourceLabel,
  sourceUrl: app.sourceUrl,
})))

const sourceLinks = computed(() => [hevyPricing, strongPricing].map(app => ({
  label: localizedAppPricing(app, locale.value).sourceLabel, href: app.sourceUrl,
})))

const ownStoreLinks = [
  { label: 'App Store', href: LIFTAG_APP_STORE_URL },
  { label: 'Google Play', href: LIFTAG_PLAY_STORE_URL },
]

const facts = computed(() => pricingCopy.value.facts.map(fact => ({ term: fact.term, value: withChecked(fact.value) })))
const included = computed(() => pricingCopy.value.included)
const faqs = computed(() => pricingCopy.value.faqs.map(faq => ({ question: faq.question, answer: withChecked(faq.answer) })))

useLiftagStructuredData(() => [
  liftagOrganization,
  liftagSoftwareApplication,
  liftagWebPage({
    path: href(path),
    name: t('appPricing.pricingName'),
    description: description.value,
    aboutId: APP_ID,
  }),
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: href('/') },
    { name: t('appPricing.pricingCrumb'), path: href(path) },
  ]),
  liftagArticle({
    headline: t('appPricing.pricingHeadline'),
    description: description.value,
    path: href(path),
    datePublished,
  }),
  liftagFAQPage(faqs.value),
])
</script>

<template>
  <div class="seo-page">
    <main>
      <article class="guide">
        <header class="guide-hero container">
          <p class="protocol guide-eyebrow">{{ t('pricing.eyebrow') }} · {{ updatedEyebrow }}</p>
          <h1 class="display guide-title" v-html="title"></h1>
          <p class="guide-lead">{{ description }}</p>
          <div class="guide-actions">
            <a :href="href('/get')" class="btn-primary">{{ t('pricing.get') }}</a>
            <a :href="href('/for-gyms')" class="btn-ghost"><HoloPill />{{ t('pricing.gyms') }}</a>
          </div>
        </header>

        <div class="container guide-body">
          <section>
            <h2>{{ t('pricing.facts') }}</h2>
            <p>{{ pricingCopy.factsLead }}</p>
            <dl class="fact-sheet">
              <div v-for="fact in facts" :key="fact.term" class="fact-row">
                <dt class="protocol">{{ fact.term }}</dt>
                <dd>{{ fact.value }}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h2>{{ t('pricing.freeIncludes') }}</h2>
            <p>{{ pricingCopy.includedLead }}</p>
            <ul>
              <li v-for="item in included" :key="item">{{ item }}</li>
            </ul>
            <p>{{ pricingCopy.includedTail }}</p>
            <p><a :href="href('/qr-nfc-gym-tags')">{{ t('pricing.tagsLink') }}</a> · <a :href="href('/exercises')">{{ t('pricing.exercisesLink') }}</a>.</p>
          </section>

          <section>
            <h2>{{ t('pricing.willNot') }}</h2>
            <p>{{ pricingCopy.willNotLead }}</p>
            <ul>
              <li v-for="item in pricingCopy.willNot" :key="item">{{ item }}</li>
            </ul>
            <p>{{ pricingCopy.willNotTail }}</p>
          </section>

          <section>
            <h2>{{ t('pricing.compare') }}</h2>
            <p>{{ withChecked(pricingCopy.compareLead) }}</p>
            <!-- tabindex keeps the narrow-screen horizontal scroll reachable from the keyboard. -->
            <div class="guide-table-wrap" role="region" tabindex="0" :aria-label="pricingCopy.tableLabel">
              <table class="guide-table">
                <thead>
                  <tr>
                    <th scope="col">{{ pricingCopy.columns.app }}</th>
                    <th scope="col">{{ pricingCopy.columns.free }}</th>
                    <th scope="col">{{ pricingCopy.columns.paid }}</th>
                    <th scope="col">{{ pricingCopy.columns.price }}</th>
                    <th scope="col">{{ pricingCopy.columns.source }}</th>
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
            <p>{{ pricingCopy.compareTail }}</p>
            <p><a :href="href('/alternatives/hevy')">{{ t('pricing.hevyLink') }}</a> · <a :href="href('/vs/strong')">{{ t('pricing.strongLink') }}</a> · <a :href="href('/best-workout-tracking-app')">{{ t('pricing.matrixLink') }}</a>.</p>
          </section>

          <section>
            <h2>{{ pricingCopy.gymsHeading }}</h2>
            <p>{{ pricingCopy.gymsBody }} <a :href="href('/journal/gym-nfc-rollout')">{{ t('pricing.rolloutLink') }}</a> · <a :href="href('/best-gym-qr-nfc-app')">{{ t('pricing.gymAppLink') }}</a>.</p>
            <p>{{ pricingCopy.trainersBody }} <a :href="href('/become-a-coach')">{{ t('pricing.becomeCoach') }}</a>.</p>
          </section>

          <section class="guide-faq">
            <h2>{{ t('pricing.faq') }}</h2>
            <FaqAccordion class="guide-faq-list" :items="faqs" id-prefix="pricing-faq" />
          </section>

          <section class="guide-method">
            <p class="protocol">{{ t('pricing.sources') }}</p>
            <p>
              {{ withChecked(pricingCopy.sourcesLead) }}
              <template v-for="(source, index) in sourceLinks" :key="source.href"><a :href="source.href" rel="nofollow noopener" target="_blank">{{ source.label }}</a>{{ index < sourceLinks.length - 1 ? ', ' : '. ' }}</template>
              {{ t('pricing.ourSources') }}
              <template v-for="(store, index) in ownStoreLinks" :key="store.href"><a :href="store.href" rel="nofollow noopener" target="_blank">{{ store.label }}</a>{{ index < ownStoreLinks.length - 1 ? ', ' : '.' }}</template>
            </p>
            <p>{{ pricingCopy.sourcesTail }}</p>
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
