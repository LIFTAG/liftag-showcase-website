<script setup lang="ts">
definePageMeta({ layout: false })

const APP_STORE_APP_ID = '6761140080'
const APP_STORE = `https://apps.apple.com/app/id${APP_STORE_APP_ID}`
const PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.liftag.app'

useHead({
  title: 'Open in Liftag',
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width,initial-scale=1' },
    { name: 'description', content: 'Finish signing in to LIFTAG, or download the workout tracker on iOS and Android.' },
    { name: 'robots', content: 'noindex,nofollow' },
    { name: 'apple-itunes-app', content: `app-id=${APP_STORE_APP_ID}` },
  ],
})

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
    heading="OPEN IN LIFTAG."
    body="Instagram’s browser can’t open LIFTAG. Two seconds to get around it:"
  />

  <main v-else class="qr-fallback">
    <p>Opening Liftag…</p>
    <p>
      <a :href="APP_STORE">App Store</a>
      ·
      <a :href="PLAY_STORE">Google Play</a>
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
