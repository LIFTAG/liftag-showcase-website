<script setup lang="ts">
import { en, sk } from '~/i18n/messages/handoff'
import { en as shellEn, sk as shellSk } from '~/i18n/messages/shell'
import { siteLocale } from '~/utils/siteLocale'
const { t } = useI18n({ useScope: 'local', messages: { en: { ...en, ...shellEn }, sk: { ...sk, ...shellSk } } })
definePageMeta({ i18n: false, layout: false })
const route = useRoute()
const { locale } = useSiteLocale()
const htmlLang = computed(() => siteLocale(route.query.lang) ?? locale.value)
useHead(() => ({ htmlAttrs: { lang: htmlLang.value } }))

const APP_STORE_APP_ID = '6761140080'
const APP_STORE = `https://apps.apple.com/app/id${APP_STORE_APP_ID}`
const PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.liftag.app'

useHead(() => ({
  title: t('handoff.openStore'),
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width,initial-scale=1' },
    { name: 'description', content: t('handoff.openHint') },
    { name: 'robots', content: 'noindex,nofollow' },
    { name: 'apple-itunes-app', content: `app-id=${APP_STORE_APP_ID}` },
  ],
}))

// iOS inside a social app's webview cannot complete Apple's
// `301 -> itms-appss://` hand-off, so redirecting there hangs on a blank page.
// See utils/userAgent.ts.
// Seeded from the request header so the escape page is what SSR renders —
// deciding only in onMounted would flash the redirect shell first.
const showEscape = ref(needsStoreEscape(useRequestHeaders(['user-agent'])['user-agent'] ?? ''))

onMounted(() => {
  const ua = navigator.userAgent || ''
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream
  const isAndroid = /Android/.test(ua)

  if (needsStoreEscape(ua)) {
    showEscape.value = true
    return
  }

  if (isIOS) {
    window.location.replace(APP_STORE)
  } else if (isAndroid) {
    window.location.replace(PLAY_STORE)
  }
})
</script>

<template>
  <StoreEscape
    v-if="showEscape"
    share-url="https://liftag.fit/auth/callback"
    :heading="t('handoff.openStore')"
    :body="t('handoff.openHint')"
  />

  <main v-else class="qr-fallback">
    <p>{{ t('handoff.openStore') }}…</p>
    <p>
      <a :href="APP_STORE">{{ t('shell.app.appStore') }}</a>
      ·
      <a :href="PLAY_STORE">{{ t('shell.app.googlePlay') }}</a>
    </p>
  </main>
</template>

<style scoped>
.qr-fallback {
  padding: 24px;
  font-family: var(--liftag-font-body, system-ui, sans-serif);
  color: #fff;
}
.qr-fallback a {
  color: var(--liftag-primary, #ccff00);
}
</style>
