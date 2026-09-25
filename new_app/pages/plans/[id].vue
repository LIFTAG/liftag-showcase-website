<script setup lang="ts">
import { en, sk } from '~/i18n/messages/handoff'
import { siteLocale, withSiteLocaleQuery } from '~/utils/siteLocale'
const { t } = useI18n({ useScope: 'local', messages: { en, sk } })
definePageMeta({ i18n: false, layout: false })

const route = useRoute()
const { locale, href } = useSiteLocale()
const htmlLang = computed(() => siteLocale(route.query.lang) ?? locale.value)
useHead(() => ({ htmlAttrs: { lang: htmlLang.value } }))
const id = String(route.params.id ?? '')

const APP_STORE_APP_ID = '6761140080'
const PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.liftag.app'
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
// Share links from female users carry ?v=f; the card then prefers the female
// exercise-image variants. Forwarded verbatim to the image route.
const variantQuery = computed(() => route.query.v === 'f' ? '?v=f' : '')

// Server-side fetch so link previews carry the real plan name. Private or
// missing plans resolve to null and the generic copy is used instead.
const { data: plan } = await useAsyncData(`plan-share-${id}`, async () => {
  if (!UUID_RE.test(id)) return null
  try {
    const { apiBaseUrl } = useRuntimeConfig().public
    const res = await $fetch<{ data: { name: string } }>(`/v1/plans/${id}`, {
      baseURL: String(apiBaseUrl),
      timeout: 6000,
    })
    return { name: res.data.name }
  }
  catch {
    return null
  }
})

// Share links are sent URL-only on iOS, so messaging apps build their preview
// card from these OG tags. The image endpoint renders the plan's routine grid
// and falls back to the default og-image for non-public plans.
useLiftagSeo(() => ({
  title: plan.value ? t('handoff.sharedTitle', { name: plan.value.name }) : t('handoff.planHeading'),
  description: t('handoff.body'),
  path: `/plans/${id}`,
  image: absoluteUrl(withSiteLocaleQuery(`/api/og/plans/${id}${variantQuery.value}`, locale.value)),
  noindex: true,
}))

useHead(() => ({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width,initial-scale=1' },
    {
      name: 'apple-itunes-app',
      content: `app-id=${APP_STORE_APP_ID}, app-argument=https://liftag.fit/plans/${id}`,
    },
  ],
}))

// A browser visit does not mean LIFTAG is absent. Keep the shared destination
// available on iOS, including after Instagram hands this page to Safari.
const showEscape = ref(detectPlatform(useRequestHeaders(['user-agent'])['user-agent'] ?? '') === 'ios')

onMounted(() => {
  const ua = navigator.userAgent || ''
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream
  const isAndroid = /Android/.test(ua)

  if (isIOS) {
    showEscape.value = true
  } else if (isAndroid) {
    const intentUrl =
      `intent://liftag.fit/plans/${id}` +
      `#Intent;scheme=https;package=com.liftag.app;` +
      `S.browser_fallback_url=${encodeURIComponent(PLAY_STORE)};end`
    window.location.replace(intentUrl)
  } else {
    window.location.replace('/')
  }
})
</script>

<template>
  <StoreEscape
    v-if="showEscape"
    :app-url="`liftag://plans/${encodeURIComponent(id)}`"
    :share-url="absoluteUrl(href(`/plans/${id}${variantQuery}`))"
    :heading="t('handoff.planHeading')"
    :body="t('handoff.contentBody')"
  />

  <main v-else class="plan-redirect">
    <p>{{ t('handoff.openingPlan') }}</p>
  </main>
</template>

<style scoped>
.plan-redirect {
  min-height: var(--liftag-stable-vh);
  display: grid;
  place-items: center;
  margin: 0;
  font-family: var(--liftag-font-body, system-ui, sans-serif);
  color: rgba(255, 255, 255, 0.6);
  background: var(--liftag-bg, #000);
}
</style>
