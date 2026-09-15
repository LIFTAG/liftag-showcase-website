<script setup lang="ts">
import ComparisonGuide from '~/components/comparisons/ComparisonGuide.vue'
import { hevyContent } from '~/content/comparisons/hevy'
import { en, sk } from '~/i18n/messages/appPricing'
const { t } = useI18n({ useScope: 'local', messages: { en, sk } })
const { locale, href } = useSiteLocale()
const path = '/alternatives/hevy'
const datePublished = PRICING_CHECKED_ON
const checkedLabel = computed(() =>
  new Intl.DateTimeFormat(locale.value === 'sk' ? 'sk-SK' : 'en-GB', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${PRICING_CHECKED_ON}T00:00:00Z`)),
)
const content = computed(() => {
  const app = localizedAppPricing(hevyPricing, locale.value)
  const liftag = localizedAppPricing(liftagPricing, locale.value)
  return hevyContent(locale.value, {
    price: app.paidPrice ?? '',
    caveat: app.caveat,
    date: checkedLabel.value,
    source: app.sourceLabel,
    sourceUrl: app.sourceUrl,
    liftagSource: liftag.sourceLabel,
    liftagSourceUrl: liftag.sourceUrl,
  })
})
useLiftagSeo(() => ({ title: content.value.seoTitle, description: content.value.description, path }))
useLiftagStructuredData(() => [
  liftagOrganization,
  liftagSoftwareApplication,
  liftagWebPage({ path: href(path), name: t('hevyName'), description: content.value.description }),
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: href('/') },
    { name: t('alternatives'), path: href('/best-workout-tracking-app') },
    { name: 'Hevy', path: href(path) },
  ]),
  liftagArticle({
    headline: content.value.seoTitle,
    description: content.value.description,
    path: href(path),
    datePublished,
  }),
  liftagFAQPage(content.value.faqs),
])
</script>
<template>
  <ComparisonGuide :content="content" :href="href" competitor="Hevy" id-prefix="hevy-faq" />
</template>
