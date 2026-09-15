<script setup lang="ts">
import { en, sk } from '~/i18n/messages/marketingPages'
const { t, tm, rt } = useI18n({ useScope: 'local', messages: { en, sk } })
const pageCopy = computed(() => {
  const copy = tm('lifters') as typeof en.lifters
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
  path: '/for-lifters',
}))

useLiftagStructuredData(() => [
  liftagOrganization,
  liftagMobileApplication,
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: href('/') },
    { name: t('liftersBreadcrumb'), path: href('/for-lifters') },
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
    :cta-href="href('/#lifters')"
  >
    <div class="container lifters-library">
      <i18n-t keypath="liftersLibrary.lead" tag="p">
        <template #pullUp
          ><a :href="href('/exercises/pull-up')">{{ t('liftersLibrary.pullUp') }}</a></template
        >
        <template #overheadPress
          ><a :href="href('/exercises/standing-barbell-overhead-press')">{{
            t('liftersLibrary.overheadPress')
          }}</a></template
        >
        <template #hipThrust
          ><a :href="href('/exercises/barbell-hip-thrust')">{{ t('liftersLibrary.hipThrust') }}</a></template
        >
      </i18n-t>
    </div>
  </SeoLandingPage>
</template>

<style scoped>
.lifters-library p {
  max-width: 760px;
  margin: 0;
  color: rgba(255, 255, 255, 0.62);
  font-size: 17px;
  font-weight: 300;
  line-height: 1.65;
}

.lifters-library a {
  color: var(--liftag-primary);
  text-decoration: underline;
  text-decoration-color: rgba(204, 255, 0, 0.4);
  text-underline-offset: 3px;
}
</style>
