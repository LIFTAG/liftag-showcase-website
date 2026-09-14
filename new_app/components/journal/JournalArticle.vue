<script setup lang="ts">
import { localizeContentLinks } from '~/utils/localizeContentLinks'
import type { JournalArticle } from '~/content/journal/types'
import { en, sk } from '~/i18n/messages/journal'

const props = defineProps<{ article: JournalArticle }>()
const { t } = useI18n({ useScope: 'local', messages: { en, sk } })
const { href, locale } = useSiteLocale()
const updated = computed(() =>
  new Intl.DateTimeFormat(locale.value, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${props.article.dateUpdated}-01T00:00:00Z`)),
)

const localizedBody = computed(() => localizeContentLinks(props.article.body, href))
</script>

<template>
  <div class="seo-page">
    <main>
      <article class="guide">
        <header class="guide-hero container">
          <p class="protocol guide-eyebrow">
            <a :href="href('/journal')">{{ t('journal.label') }}</a>
            · {{ article.category }} · {{ t('journal.updated', { date: updated }) }}
          </p>
          <h1 class="display guide-title" v-html="article.titleHtml" />
          <p class="guide-lead">{{ article.description }}</p>
          <div class="guide-actions">
            <a :href="href(article.ctaPath)" class="btn-primary">{{ article.ctaLabel }}</a>
            <a :href="href(article.secondaryPath)" class="btn-ghost"
              ><HoloPill />{{ article.secondaryLabel }}</a
            >
          </div>
        </header>

        <div class="container guide-body" v-html="localizedBody" />

        <div v-if="article.picks?.length" class="container guide-body">
          <section>
            <h2>{{ t('journal.picksHeading') }}</h2>
            <div class="guide-picks">
              <article
                v-for="pick in article.picks"
                :key="pick.name"
                class="guide-pick"
                :class="{ 'guide-pick-self': pick.name === 'LIFTAG' }"
              >
                <h3>{{ pick.name }}</h3>
                <p class="guide-pick-blurb">{{ pick.blurb }}</p>
                <p class="protocol guide-pick-h">{{ t('journal.pickStrengths') }}</p>
                <ul>
                  <li v-for="item in pick.strengths" :key="item">{{ item }}</li>
                </ul>
                <p class="protocol guide-pick-h">{{ t('journal.pickCaveats') }}</p>
                <ul>
                  <li v-for="item in pick.caveats" :key="item">{{ item }}</li>
                </ul>
              </article>
            </div>
          </section>
        </div>

        <div class="container guide-body guide-extra">
          <section class="guide-faq">
            <h2>{{ t('journal.questions') }}</h2>
            <FaqAccordion class="guide-faq-list" :items="article.faqs" :id-prefix="`${article.slug}-faq`" />
          </section>
          <section class="guide-method">
            <p class="protocol">{{ t('journal.writtenBy') }}</p>
            <p>{{ t('journal.authorNote') }}</p>
          </section>
          <p class="guide-back">
            <a :href="href('/journal')">{{ t('journal.backToJournal') }}</a>
          </p>
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
    radial-gradient(circle at 18% 76%, rgba(255, 45, 85, 0.04), transparent 36%), #000;
  color: #fff;
}
.guide-hero {
  padding: 150px 0 60px;
}
.guide-eyebrow {
  color: var(--liftag-primary);
  margin: 0 0 18px;
}
.guide-eyebrow a {
  color: inherit;
  text-decoration: none;
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
  padding: 32px 0 80px;
  max-width: 880px;
}
.guide-body :deep(section) {
  padding: 36px 0;
  border-top: 1px solid rgba(255, 255, 0, 0.06);
}
.guide-body :deep(h2) {
  margin: 0 0 18px;
  font-family: var(--liftag-font-headline);
  font-size: clamp(28px, 3.6vw, 44px);
  font-style: italic;
  text-transform: uppercase;
  line-height: 1;
}
.guide-body :deep(p),
.guide-body :deep(li) {
  color: rgba(255, 255, 255, 0.74);
  font-size: 16.5px;
  font-weight: 300;
  line-height: 1.7;
}
.guide-body :deep(p + p) {
  margin-top: 14px;
}
.guide-body :deep(ul),
.guide-body :deep(ol) {
  margin: 12px 0 0;
  padding: 0 0 0 22px;
}
.guide-body :deep(li) {
  margin-bottom: 10px;
}
.guide-body :deep(strong) {
  color: #fff;
  font-weight: 700;
}
.guide-body :deep(a) {
  color: var(--liftag-primary);
  text-decoration: underline;
  text-decoration-color: rgba(204, 255, 0, 0.4);
  text-underline-offset: 3px;
}
.guide-body :deep(.guide-table-wrap) {
  overflow-x: auto;
  margin-top: 8px;
}
.guide-body :deep(.guide-table) {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.guide-body :deep(.guide-table th),
.guide-body :deep(.guide-table td) {
  padding: 12px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  text-align: left;
  vertical-align: top;
  color: rgba(255, 255, 255, 0.74);
  font-weight: 300;
}
.guide-body :deep(.guide-table thead th) {
  color: var(--liftag-primary);
  font-family: var(--liftag-font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.guide-body :deep(.guide-table tbody th) {
  color: #fff;
  font-weight: 700;
}
.guide-picks {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 12px;
}
.guide-pick {
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  background: rgba(11, 18, 21, 0.7);
}
.guide-pick-self {
  border-color: rgba(204, 255, 0, 0.28);
}
.guide-pick h3 {
  margin: 0;
  font-family: var(--liftag-font-headline);
  font-size: 24px;
  font-style: italic;
  text-transform: uppercase;
}
.guide-pick-self h3 {
  color: var(--liftag-primary);
}
.guide-pick-blurb {
  margin: 6px 0 16px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px !important;
}
.guide-pick-h {
  margin: 14px 0 8px !important;
  color: var(--liftag-primary) !important;
  font-size: 10px !important;
}
.guide-pick ul {
  margin: 0 0 6px;
  padding-left: 18px;
}
.guide-faq-list {
  margin-top: 18px;
}
.guide-method .protocol {
  color: var(--liftag-primary);
  margin: 0 0 10px;
}
.guide-method p:last-child {
  color: rgba(255, 255, 255, 0.55);
  font-size: 14px;
  max-width: 780px;
}
.guide-back {
  margin: 0;
  padding-top: 16px;
}
@media (max-width: 900px) {
  .guide-hero {
    padding-top: calc(120px + var(--liftag-safe-top));
  }
}
@media (max-width: 900px) {
  .guide-picks {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 620px) {
  .guide-hero {
    padding: 108px 0 48px;
  }
  .guide-actions {
    flex-direction: column;
  }
  .guide-actions a {
    width: 100%;
    text-align: center;
  }
}
</style>
