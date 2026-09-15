<script setup lang="ts">
import { en, sk } from '~/i18n/messages/marketingPages'
const { t, tm, rt } = useI18n({ useScope: 'local', messages: { en, sk } })
const pageCopy = computed(() => {
  const copy = tm('gyms') as typeof en.gyms
  return {
    ...copy,
    metrics: copy.metrics.map((item) => ({ value: rt(item.value), label: rt(item.label) })),
    sections: copy.sections.map((item) => ({ title: rt(item.title), body: rt(item.body) })),
    faqs: copy.faqs.map((item) => ({ question: rt(item.question), answer: rt(item.answer) })),
  }
})
const { locale, href } = useSiteLocale()

useLiftagSeo(() => ({
  title: `${rt(pageCopy.value.title).replace(/<[^>]+>/g, '')} | LIFTAG`,
  description: rt(pageCopy.value.description),
  path: '/for-gyms',
}))

useLiftagStructuredData(() => [
  liftagOrganization,
  liftagMobileApplication,
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: href('/') },
    { name: t('gymsBreadcrumb'), path: href('/for-gyms') },
  ]),
  liftagFAQPage(pageCopy.value.faqs),
])
</script>

<template>
  <SeoLandingPage
    :eyebrow="rt(pageCopy.eyebrow)"
    :title="rt(pageCopy.title)"
    :lead="rt(pageCopy.description)"
    :metrics="pageCopy.metrics"
    :sections="pageCopy.sections"
    :faqs="pageCopy.faqs"
    :cta-label="rt(pageCopy.cta)"
    :cta-href="href('/#gyms')"
  >
    <div class="container gym-compare">
      <p class="protocol gym-compare-eyebrow">{{ rt(pageCopy.compare.eyebrow) }}</p>
      <h2 class="gym-compare-title">{{ rt(pageCopy.compare.title) }}</h2>
      <p class="gym-compare-lead">{{ rt(pageCopy.compare.lead) }}</p>
      <GymQrComparisonTable kind="matrix" variant="gym" :label="rt(pageCopy.compare.label)" />
      <a :href="href('/best-gym-qr-nfc-app')" class="gym-compare-more">{{ rt(pageCopy.compare.link) }}</a>
    </div>
  </SeoLandingPage>
</template>

<style scoped>
.gym-compare-eyebrow {
  color: var(--liftag-primary);
  margin: 0 0 18px;
}

.gym-compare-title {
  margin: 0;
  font-family: var(--liftag-font-headline);
  font-size: clamp(32px, 4.4vw, 56px);
  font-style: italic;
  text-transform: uppercase;
  line-height: 0.98;
}

.gym-compare-lead {
  max-width: 760px;
  margin: 16px 0 36px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 17px;
  font-weight: 300;
  line-height: 1.65;
}

.gym-compare-more {
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

.gym-compare-more:hover {
  color: #fff;
}
</style>
