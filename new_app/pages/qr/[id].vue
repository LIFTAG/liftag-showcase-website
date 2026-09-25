<script setup lang="ts">
import { en, sk } from '~/i18n/messages/handoff'
import { siteLocale } from '~/utils/siteLocale'
const { t } = useI18n({ useScope: 'local', messages: { en, sk } })
definePageMeta({ i18n: false, layout: false })

const route = useRoute()
const { locale, href } = useSiteLocale()
const htmlLang = computed(() => siteLocale(route.query.lang) ?? locale.value)
useHead(() => ({ htmlAttrs: { lang: htmlLang.value } }))
const id = String(route.params.id ?? '')

const APP_STORE_APP_ID = '6761140080'
const PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.liftag.app'

useHead(() => ({
  title: t('handoff.qrTitle'),
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width,initial-scale=1' },
    { name: 'description', content: t('handoff.qrDescription') },
    { name: 'robots', content: 'noindex,nofollow' },
    {
      name: 'apple-itunes-app',
      content: `app-id=${APP_STORE_APP_ID}, app-argument=https://liftag.fit/qr/${id}`,
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
      `intent://liftag.fit/qr/${id}` +
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
    :app-url="`liftag://qr/${encodeURIComponent(id)}`"
    :share-url="absoluteUrl(href(`/qr/${id}`))"
    :heading="t('handoff.qrHeading')"
    :body="t('handoff.contentBody')"
  />

  <main v-else class="qr-redirect">
    <p>{{ t('handoff.opening') }}</p>
  </main>
</template>

<style scoped>
.qr-redirect {
  min-height: var(--liftag-stable-vh);
  display: grid;
  place-items: center;
  margin: 0;
  font-family: var(--liftag-font-body, system-ui, sans-serif);
  color: rgba(255, 255, 255, 0.6);
  background: var(--liftag-bg, #000);
}
</style>
