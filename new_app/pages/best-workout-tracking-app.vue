<script setup lang="ts">
import { en, sk } from '~/content/comparisons/pageBody'
import { localizeContentLinks } from '~/utils/localizeContentLinks'
const { t } = useI18n({ useScope: 'local', messages: { en, sk } })
import { rows, cards } from '~/content/comparisons/workoutTrackingData'
import { en as uiEn, sk as uiSk } from '~/content/comparisons/workoutTracking'
import { skRows, skCards } from '~/content/comparisons/workoutTrackingCopy'
const { locale, href } = useSiteLocale()
const ui = computed(() => locale.value === 'sk' ? uiSk : uiEn)
const title = computed(() => ui.value.title)
const description = computed(() => ui.value.description)

const path = '/best-workout-tracking-app'
const lastUpdated = '2026-05-25'
const checkedDate = computed(() => new Intl.DateTimeFormat(locale.value, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${lastUpdated}T00:00:00Z`)))

useLiftagSeo(() => ({
  title: ui.value.seoTitle,
  description: description.value,
  path,
}))

const localizedFaqs = computed(() => ui.value.faq)

useLiftagStructuredData(() => [
  liftagOrganization,
  liftagSoftwareApplication,
  liftagWebPage({
    path: href(path),
    name: t('workoutName'),
    description: description.value,
  }),
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: href('/') },
    { name: t('workoutCrumb'), path: href(path) },
  ]),
  liftagArticle({
    headline: t('workoutHeadline'),
    description: description.value,
    path: href(path),
    datePublished: lastUpdated,
  }),
  liftagFAQPage(localizedFaqs.value),
])

const localizedRows = computed(() => locale.value === 'sk' ? rows.map(row => ({ ...row, ...(skRows[row.name] ?? {}) })) : rows)
const localizedCards = computed(() => locale.value === 'sk' ? cards.map(card => ({ ...card, ...(skCards[card.name] ?? {}) })) : cards)
</script>

<template>
  <div class="seo-page">
    <main>
      <section class="bwt-hero">
        <div class="container">
          <p class="protocol bwt-eyebrow">{{ ui.eyebrow }}</p>
          <h1 class="display bwt-title" v-html="title"></h1>
          <p class="bwt-lead">{{ description }}</p>
          <div class="bwt-actions">
            <a :href="href('/')" class="btn-primary">{{ ui.see }}</a>
            <a href="#table" class="btn-ghost"><HoloPill />{{ ui.jump }}</a>
            <a :href="href('/best-gym-qr-nfc-app')" class="btn-ghost"><HoloPill />{{ ui.gymPlatforms }}</a>
          </div>

          <div class="bwt-tldr">
            <p class="protocol">{{ ui.tldr }}</p>
            <p v-html="ui.tldrBody"></p>
          </div>
        </div>
      </section>

      <section id="table" class="bwt-table-section">
        <div class="container">
          <h2 class="bwt-section-title">{{ ui.intro }}</h2>
          <p class="bwt-section-lead" v-html="localizeContentLinks(t('workoutTable', { date: checkedDate }), href)"></p>

          <div class="bwt-table-wrap" role="region" :aria-label="ui.table.label">
            <table class="bwt-table">
              <thead>
                <tr>
                  <th scope="col">{{ ui.table.app }}</th>
                  <th scope="col">{{ ui.table.platforms }}</th>
                  <th scope="col">{{ ui.table.pricing }}</th>
                  <th scope="col">{{ ui.table.bestFor }}</th>
                  <th scope="col">{{ ui.table.weakSpot }}</th>
                  <th scope="col">{{ ui.table.unique }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in localizedRows" :key="row.name" :class="{ 'bwt-row-self': row.name === 'LIFTAG' }">
                  <th scope="row">{{ row.name }}</th>
                  <td>{{ row.platforms }}</td>
                  <td>{{ row.free }}</td>
                  <td>{{ row.bestFor }}</td>
                  <td>{{ row.weakSpot }}</td>
                  <td>{{ row.unique }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section class="bwt-cards-section">
        <div class="container">
          <h2 class="bwt-section-title">{{ ui.breakdown }}</h2>
          <p class="bwt-section-lead" v-html="localizeContentLinks(t('workoutCards', { date: checkedDate }), href)"></p>

          <div class="bwt-cards">
            <article
              v-for="card in localizedCards"
              :key="card.name"
              class="bwt-card"
              :class="{ 'bwt-card-self': card.name === 'LIFTAG' }"
            >
              <header class="bwt-card-head">
                <h3>{{ card.name }}</h3>
                <p class="bwt-card-oneliner">{{ card.oneLine }}</p>
              </header>

              <div class="bwt-card-cols">
                <div>
                  <p class="protocol bwt-card-h">{{ ui.goodAt }}</p>
                  <ul>
                    <li v-for="item in card.goodAt" :key="item">{{ item }}</li>
                  </ul>
                </div>
                <div>
                  <p class="protocol bwt-card-h">{{ ui.notGoodAt }}</p>
                  <ul>
                    <li v-for="item in card.notGoodAt" :key="item">{{ item }}</li>
                  </ul>
                </div>
              </div>

              <p class="bwt-card-pick">
                <span class="protocol">{{ ui.pickWhen }}</span> {{ card.pickWhen }}
              </p>
            </article>
          </div>
        </div>
      </section>

      <section class="bwt-when">
        <div class="container">
          <h2 class="bwt-section-title">{{ ui.right }}</h2>
          <ul class="bwt-when-list">
            <li v-for="item in ui.rightList" :key="item" v-html="localizeContentLinks(item, href)"></li>
          </ul>

          <h2 class="bwt-section-title bwt-when-title">{{ ui.elsewhere }}</h2>
          <ul class="bwt-when-list">
            <li v-for="item in ui.elsewhereList" :key="item" v-html="localizeContentLinks(item, href)"></li>
          </ul>
        </div>
      </section>

      <section class="bwt-library">
        <div class="container">
          <p class="protocol bwt-eyebrow">{{ ui.library }}</p>
          <h2 class="bwt-section-title">{{ ui.lifts }}</h2>
          <p class="bwt-section-lead" v-html="localizeContentLinks(t('workoutLibrary', { date: checkedDate }), href)"></p>
          <ul class="bwt-library-list">
            <li v-for="item in ui.libraryLinks" :key="item.path"><a :href="href(item.path)">{{ item.label }}</a></li>
          </ul>
          <p class="bwt-section-lead" v-html="localizeContentLinks(t('workoutAlso', { date: checkedDate }), href)"></p>
          <p class="bwt-section-lead" v-html="localizeContentLinks(t('workoutPairs', { date: checkedDate }), href)"></p>
        </div>
      </section>

      <section class="bwt-faq">
        <div class="container">
          <p class="protocol bwt-eyebrow">{{ ui.questions }}</p>
          <h2 class="bwt-section-title">{{ ui.questions }}</h2>
          <FaqAccordion
            class="bwt-faq-list"
            :items="localizedFaqs"
            id-prefix="bwt-faq"
          />
        </div>
      </section>

      <section class="bwt-method">
        <div class="container">
          <p class="protocol bwt-eyebrow">{{ ui.methodology }}</p>
          <p class="bwt-method-body" v-html="localizeContentLinks(t('workoutMethod', { date: checkedDate }), href)"></p>
          <p class="bwt-method-body" v-html="localizeContentLinks(t('workoutConflict', { date: checkedDate }), href)"></p>
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

.bwt-hero {
  padding: 150px 0 72px;
}

.bwt-eyebrow {
  color: var(--liftag-primary);
  margin: 0 0 18px;
}

.bwt-title {
  max-width: 940px;
  font-size: clamp(48px, 7.5vw, 116px);
}

.bwt-lead {
  max-width: 760px;
  margin: 28px 0 0;
  color: rgba(255, 255, 255, 0.66);
  font-size: clamp(18px, 2vw, 23px);
  font-weight: 300;
  line-height: 1.55;
}

.bwt-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 34px;
}

.bwt-actions a {
  text-decoration: none;
}

.bwt-tldr {
  margin: 52px 0 0;
  padding: 28px;
  border: 1px solid rgba(204, 255, 0, 0.22);
  border-radius: 10px;
  background: rgba(11, 18, 21, 0.7);
  max-width: 880px;
}

.bwt-tldr p:first-child {
  margin: 0 0 12px;
  color: var(--liftag-primary);
}

.bwt-tldr p:last-child {
  margin: 0;
  font-size: 17px;
  font-weight: 300;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.85);
}

.bwt-tldr strong {
  color: #fff;
  font-weight: 700;
}

.bwt-tldr .lime {
  color: var(--liftag-primary);
}

.bwt-table-section,
.bwt-cards-section,
.bwt-when,
.bwt-library,
.bwt-faq,
.bwt-method {
  padding: 64px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.bwt-library-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  margin: 22px 0 0;
  padding: 0;
  list-style: none;
}

.bwt-library-list a {
  color: var(--liftag-primary);
  text-decoration: none;
}

.bwt-library-list a:hover {
  text-decoration: underline;
}

.bwt-library .bwt-section-lead a {
  color: var(--liftag-primary);
}

.bwt-section-title {
  margin: 0;
  font-family: var(--liftag-font-headline);
  font-size: clamp(32px, 4.4vw, 56px);
  font-style: italic;
  text-transform: uppercase;
  line-height: 0.98;
}

.bwt-section-lead {
  max-width: 760px;
  margin: 16px 0 36px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 17px;
  font-weight: 300;
  line-height: 1.65;
}

.bwt-table-wrap {
  overflow-x: auto;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
}

.bwt-table {
  width: 100%;
  min-width: 880px;
  border-collapse: collapse;
  background: rgba(5, 8, 9, 0.96);
  font-size: 14px;
}

.bwt-table th,
.bwt-table td {
  padding: 16px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  text-align: left;
  vertical-align: top;
  color: rgba(255, 255, 255, 0.78);
  font-weight: 300;
  line-height: 1.5;
}

.bwt-table thead th {
  background: rgba(255, 255, 255, 0.03);
  color: var(--liftag-primary);
  font-family: var(--liftag-font-mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 700;
}

.bwt-table tbody th {
  color: #fff;
  font-family: var(--liftag-font-headline);
  font-style: italic;
  font-size: 18px;
  font-weight: 700;
  text-transform: uppercase;
}

.bwt-row-self {
  background: rgba(204, 255, 0, 0.05);
}

.bwt-row-self th {
  color: var(--liftag-primary);
}

.bwt-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.bwt-card {
  padding: 28px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  background: rgba(11, 18, 21, 0.7);
}

.bwt-card-self {
  border-color: rgba(204, 255, 0, 0.28);
  box-shadow: 0 0 0 1px rgba(204, 255, 0, 0.08) inset;
}

.bwt-card-head h3 {
  margin: 0;
  font-family: var(--liftag-font-headline);
  font-size: 28px;
  font-style: italic;
  text-transform: uppercase;
  letter-spacing: -0.01em;
}

.bwt-card-self h3 {
  color: var(--liftag-primary);
}

.bwt-card-oneliner {
  margin: 8px 0 22px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-weight: 300;
  line-height: 1.55;
}

.bwt-card-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 20px;
}

.bwt-card-h {
  margin: 0 0 10px;
  color: var(--liftag-primary);
  font-size: 10px;
}

.bwt-card ul {
  margin: 0;
  padding: 0 0 0 18px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13.5px;
  font-weight: 300;
  line-height: 1.55;
}

.bwt-card li {
  margin-bottom: 6px;
}

.bwt-card-pick {
  margin: 0;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.78);
  font-size: 14px;
  font-weight: 300;
  line-height: 1.6;
}

.bwt-card-pick .protocol {
  display: inline-block;
  margin-right: 8px;
  color: var(--liftag-primary);
}

.bwt-when-list {
  margin: 0;
  padding: 0 0 0 20px;
  max-width: 820px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 16px;
  font-weight: 300;
  line-height: 1.7;
}

.bwt-when-list li {
  margin-bottom: 10px;
}

.bwt-when-title {
  margin-top: 48px;
}

.bwt-faq-list {
  margin-top: 24px;
}

.bwt-method-body {
  max-width: 820px;
  color: rgba(255, 255, 255, 0.55);
  font-size: 14px;
  font-weight: 300;
  line-height: 1.7;
}

.bwt-method-body + .bwt-method-body {
  margin-top: 14px;
}

@media (max-width: 900px) {
  .bwt-hero {
    padding-top: calc(120px + var(--liftag-safe-top));
  }

  .bwt-cards {
    grid-template-columns: 1fr;
  }

  .bwt-card-cols {
    grid-template-columns: 1fr;
    gap: 14px;
  }
}

@media (max-width: 620px) {
  .bwt-hero {
    padding: 108px 0 54px;
  }

  .bwt-actions {
    flex-direction: column;
  }

  .bwt-actions a {
    width: 100%;
    text-align: center;
  }
}
</style>
