<script setup lang="ts">
import { en, sk } from '~/content/comparisons/qrTags'
const { locale, href } = useSiteLocale()
const copy = computed(() => locale.value === 'sk' ? sk : en)
const title = computed(() => copy.value.title)
const description = computed(() => copy.value.description)

useLiftagSeo(() => ({
  title: copy.value.seoTitle,
  description: description.value,
  path: '/qr-nfc-gym-tags',
}))

useLiftagStructuredData(() => [
  liftagOrganization,
  liftagMobileApplication,
  liftagWebPage({
    path: href('/qr-nfc-gym-tags'),
    name: copy.value.structuredName,
    description: description.value,
    type: 'WebPage',
  }),
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: href('/') },
    { name: copy.value.breadcrumbName, path: href('/qr-nfc-gym-tags') },
  ]),
  liftagArticle({
    headline: copy.value.articleHeadline,
    description: description.value,
    path: href('/qr-nfc-gym-tags'),
    datePublished: '2026-08-20',
  }),
  liftagFAQPage(copy.value.faqs),
])

const metrics = computed(() => copy.value.metrics)
const sections = computed(() => copy.value.sections)
const faqs = computed(() => copy.value.faqs)
</script>

<template>
  <SeoLandingPage
    :eyebrow="copy.eyebrow"
    :title="title"
    :lead="description"
    :metrics="metrics"
    :sections="sections"
    :faqs="faqs"
    :cta-label="copy.cta"
    cta-href="/#scan"
  >
    <div class="container tag-compare">
      <p class="protocol tag-compare-eyebrow">{{ copy.compareEyebrow }}</p>
      <h2 class="tag-compare-title">{{ copy.compareTitle }}</h2>
      <p class="tag-compare-lead">{{ copy.compareLead }}</p>
      <GymQrComparisonTable
        kind="matrix"
        variant="tags"
        :label="copy.compareTitle"
      />
      <a :href="href('/best-gym-qr-nfc-app')" class="tag-compare-more">{{ copy.compareMore }}</a>
    </div>
  </SeoLandingPage>
</template>

<style scoped>
.tag-compare-eyebrow {
  color: var(--liftag-primary);
  margin: 0 0 18px;
}

.tag-compare-title {
  margin: 0;
  font-family: var(--liftag-font-headline);
  font-size: clamp(32px, 4.4vw, 56px);
  font-style: italic;
  text-transform: uppercase;
  line-height: 0.98;
}

.tag-compare-lead {
  max-width: 760px;
  margin: 16px 0 36px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 17px;
  font-weight: 300;
  line-height: 1.65;
}

.tag-compare-more {
  display: inline-block;
  margin-top: 22px;
  color: var(--liftag-primary);
  font-family: var(--liftag-font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-decoration: none;
  text-transform: uppercase;
}

.tag-compare-more:hover {
  color: #fff;
}
</style>
