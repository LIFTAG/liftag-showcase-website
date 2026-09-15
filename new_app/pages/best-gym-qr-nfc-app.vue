<script setup lang="ts">
import { en, sk } from '~/content/comparisons/pageBody'
import { localizeContentLinks } from '~/utils/localizeContentLinks'
const { t } = useI18n({ useScope: 'local', messages: { en, sk } })
import { en as uiEn, sk as uiSk } from '~/content/comparisons/gymQrPage'
import { sk as skCards } from '~/content/comparisons/gymQrCards'
import {
  GYM_QR_COMPARISON_PATH,
  GYM_QR_COMPARISON_UPDATED,
  gymQrCards,
  gymQrSources,
} from '~/utils/gymQrComparison'

const { locale, href } = useSiteLocale()
const ui = computed(() => locale.value === 'sk' ? uiSk : uiEn)
const title = computed(() => ui.value.title)
const description = computed(() => ui.value.description)

const path = GYM_QR_COMPARISON_PATH
const lastUpdated = GYM_QR_COMPARISON_UPDATED
const checkedDate = computed(() => new Intl.DateTimeFormat(locale.value, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${lastUpdated}T00:00:00Z`)))

useLiftagSeo(() => ({
  title: ui.value.seoTitle,
  description: description.value,
  path,
}))

const localizedFaqs = computed(() => ui.value.faqs)
const localizedCards = computed(() => locale.value === 'sk' ? gymQrCards.map(card => ({ ...card, ...(skCards[card.name] ?? {}) })) : gymQrCards)
const localizedExclusives = computed(() => ui.value.exclusiveItems)
const localizedBests = computed(() => ui.value.bestItems)

useLiftagStructuredData(() => [
  liftagOrganization,
  liftagMobileApplication,
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: href('/') },
    { name: t('gymCrumb'), path: href(path) },
  ]),
  liftagArticle({
    headline: t('gymHeadline'),
    description: description.value,
    path: href(path),
    datePublished: lastUpdated,
  }),
  liftagFAQPage(localizedFaqs.value),
])
</script>

<template>
  <div class="seo-page">
    <main>
      <section class="gqc-hero">
        <div class="container">
          <p class="protocol gqc-eyebrow">{{ ui.eyebrow }}</p>
          <h1 class="display gqc-title" v-html="title"></h1>
          <p class="gqc-lead">{{ description }}</p>
          <div class="gqc-actions">
            <a :href="href('/for-gyms')" class="btn-primary">{{ ui.owner }}</a>
            <a href="#table" class="btn-ghost"><HoloPill />{{ ui.jump }}</a>
          </div>

          <div class="gqc-tldr">
            <p class="protocol">{{ ui.tldr }}</p>
            <p v-html="ui.tldrBody"></p>
          </div>
        </div>
      </section>

      <section id="table" class="gqc-section">
        <div class="container">
          <h2 class="gqc-section-title">{{ ui.glance }}</h2>
          <p class="gqc-section-lead" v-html="localizeContentLinks(t('gymTable', { date: checkedDate }), href)"></p>
          <GymQrComparisonTable kind="glance" :label="ui.tableLabel" />
        </div>
      </section>

      <section class="gqc-section">
        <div class="container">
          <h2 class="gqc-section-title">{{ ui.exclusive }}</h2>
          <p class="gqc-section-lead">{{ ui.exclusiveLead }}</p>
          <ol class="gqc-exclusive">
            <li v-for="item in localizedExclusives" :key="item.title">
              <p class="protocol gqc-exclusive-tag">{{ item.tag }}</p>
              <h3>{{ item.title }}</h3>
              <p>{{ item.body }}</p>
            </li>
          </ol>

          <h2 class="gqc-section-title gqc-section-title--follow">{{ ui.best }}</h2>
          <p class="gqc-section-lead">{{ ui.bestLead }}</p>
          <ol class="gqc-exclusive gqc-exclusive--best" start="3">
            <li v-for="item in localizedBests" :key="item.title">
              <p class="protocol gqc-exclusive-tag">{{ item.tag }}</p>
              <h3>{{ item.title }}</h3>
              <p>{{ item.body }}</p>
            </li>
          </ol>
        </div>
      </section>

      <section class="gqc-section">
        <div class="container">
          <h2 class="gqc-section-title">{{ ui.feature }}</h2>
          <p class="gqc-section-lead" v-html="localizeContentLinks(t('gymMatrix', { date: checkedDate }), href)"></p>
          <GymQrComparisonTable kind="matrix" variant="full" :label="t('gymMatrixLabel')" />
        </div>
      </section>

      <section class="gqc-section">
        <div class="container">
          <h2 class="gqc-section-title">{{ ui.breakdown }}</h2>
          <p class="gqc-section-lead" v-html="localizeContentLinks(t('gymCards', { date: checkedDate }), href)"></p>

          <div class="gqc-cards">
            <article
              v-for="card in localizedCards"
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
                  <p class="protocol gqc-card-h">{{ ui.good }}</p>
                  <ul>
                    <li v-for="item in card.goodAt" :key="item">{{ item }}</li>
                  </ul>
                </div>
                <div>
                  <p class="protocol gqc-card-h">{{ ui.bad }}</p>
                  <ul>
                    <li v-for="item in card.notGoodAt" :key="item">{{ item }}</li>
                  </ul>
                </div>
              </div>

              <p class="gqc-card-pick">
                <span class="protocol">{{ ui.pick }}</span> {{ card.pickWhen }}
              </p>
            </article>
          </div>
        </div>
      </section>

      <section class="gqc-section">
        <div class="container">
          <h2 class="gqc-section-title">{{ ui.right }}</h2>
          <ul class="gqc-when-list">
            <li v-for="item in ui.rightList" :key="item" v-html="localizeContentLinks(item, href)"></li>
          </ul>

          <h2 class="gqc-section-title gqc-section-title--follow">{{ ui.elsewhere }}</h2>
          <ul class="gqc-when-list">
            <li v-for="item in ui.elsewhereList" :key="item" v-html="localizeContentLinks(item, href)"></li>
          </ul>
        </div>
      </section>

      <section class="gqc-section">
        <div class="container">
          <p class="protocol gqc-eyebrow">{{ ui.questions }}</p>
          <h2 class="gqc-section-title">{{ ui.questions }}</h2>
          <FaqAccordion
            class="gqc-faq-list"
            :items="localizedFaqs"
            id-prefix="gqc-faq"
          />
        </div>
      </section>

      <section class="gqc-section gqc-method">
        <div class="container">
          <p class="protocol gqc-eyebrow">{{ ui.methodology }}</p>
          <p class="gqc-method-body">
            {{ t('gymMethod', { date: checkedDate }) }}
            <template v-for="(source, index) in gymQrSources" :key="source.href">
              <a :href="source.href" target="_blank" rel="noopener noreferrer">{{ source.label }}</a><template v-if="index &lt; gymQrSources.length - 1">, </template>
            </template>. {{ t('gymMethodTail') }}
          </p>
          <p class="gqc-method-body" v-html="localizeContentLinks(t('gymConflict', { date: checkedDate }), href)"></p>
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
