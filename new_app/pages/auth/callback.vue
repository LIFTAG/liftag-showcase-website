<script setup lang="ts">
const APP_STORE_APP_ID = '6761140080'
const APP_STORE = `https://apps.apple.com/app/id${APP_STORE_APP_ID}`
const PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.liftag.app'

useHead({
  title: 'Open in Liftag',
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width,initial-scale=1' },
    { name: 'apple-itunes-app', content: `app-id=${APP_STORE_APP_ID}` },
  ],
})

onMounted(() => {
  const ua = navigator.userAgent || ''
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream
  const isAndroid = /Android/.test(ua)

  if (isIOS) {
    window.location.replace(APP_STORE)
  } else if (isAndroid) {
    window.location.replace(PLAY_STORE)
  }
})
</script>

<template>
  <main class="qr-fallback">
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
