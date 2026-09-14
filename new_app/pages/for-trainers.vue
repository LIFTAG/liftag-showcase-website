<script setup lang="ts">
import { en, sk } from '~/i18n/messages/marketingPages'
const { t, tm, rt } = useI18n({ useScope: 'local', messages: { en, sk } })
const pageCopy = computed(() => {
  const copy = tm('trainers') as typeof en.trainers
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
  path: '/for-trainers',
}))

useLiftagStructuredData(() => [
  liftagOrganization,
  liftagMobileApplication,
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: href('/') },
    { name: t('trainersBreadcrumb'), path: href('/for-trainers') },
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
    :cta-href="href('/#trainers')"
  />
</template>
