<script setup lang="ts">
import ComparisonGuide from '~/components/comparisons/ComparisonGuide.vue'
import { strongContent } from '~/content/comparisons/strong'
import { en, sk } from '~/i18n/messages/appPricing'
const { t } = useI18n({ useScope: 'local', messages: { en, sk } })
const { locale, href } = useSiteLocale()
const path = '/vs/strong'
const datePublished = PRICING_CHECKED_ON
const checkedLabel = computed(() =>
  new Intl.DateTimeFormat(locale.value === 'sk' ? 'sk-SK' : 'en-GB', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${PRICING_CHECKED_ON}T00:00:00Z`)),
)
const content = computed(() => {
  const app = localizedAppPricing(strongPricing, locale.value)
  const liftag = localizedAppPricing(liftagPricing, locale.value)
  return strongContent(locale.value, {
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
  liftagWebPage({ path: href(path), name: t('strongName'), description: content.value.description }),
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: href('/') },
    { name: t('comparisons'), path: href('/best-workout-tracking-app') },
    { name: t('strongName'), path: href(path) },
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
  <ComparisonGuide :content="content" :href="href" competitor="Strong" id-prefix="strong-faq" />
</template>
