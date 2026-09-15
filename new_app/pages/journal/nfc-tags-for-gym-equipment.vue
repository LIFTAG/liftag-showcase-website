<script setup lang="ts">
import JournalArticle from '~/components/journal/JournalArticle.vue'
import type { JournalArticle as JournalArticleContent } from '~/content/journal/types'
import { en as journalEn, sk as journalSk } from '~/i18n/messages/journal'
import { en, sk } from '~/content/journal/nfc-tags-for-gym-equipment'

const { locale, href } = useSiteLocale()
const { t } = useI18n({ useScope: 'local', messages: { en: journalEn, sk: journalSk } })
const article = computed<JournalArticleContent>(() => locale.value === 'sk' ? sk : en)

useLiftagSeo(() => ({
  title: article.value.seoTitle,
  description: article.value.description,
  path: article.value.path,
}))

useLiftagStructuredData(() => {
  const current = article.value
  return [
    liftagOrganization,
    liftagSoftwareApplication,
    liftagWebPage({ path: href(current.path), name: current.titleText, description: current.description }),
    liftagBreadcrumbs([
      { name: 'LIFTAG', path: href('/') },
      { name: t('journal.breadcrumb'), path: href('/journal') },
      { name: current.titleText, path: href(current.path) },
    ]),
    liftagArticle({
      headline: current.titleText,
      description: current.description,
      path: href(current.path),
      datePublished: current.datePublished,
    }),
    ...(current.howTo ? [liftagHowTo({ ...current.howTo, path: href(current.path) })] : []),
    liftagFAQPage(current.faqs),
  ]
})
</script>

<template>
  <JournalArticle :article="article" />
</template>
