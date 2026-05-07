<script setup lang="ts">
const route = useRoute()
const id = String(route.params.id ?? '')

const APP_STORE_APP_ID = '6761140080'
const APP_STORE = `https://apps.apple.com/app/id${APP_STORE_APP_ID}`
const PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.liftag.app'

useHead({
  title: 'Open LIFTAG invite',
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width,initial-scale=1' },
    {
      name: 'apple-itunes-app',
      content: `app-id=${APP_STORE_APP_ID}, app-argument=https://liftag.fit/trainer-invites/${id}`,
    },
  ],
})

onMounted(() => {
  const ua = navigator.userAgent || ''
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream
  const isAndroid = /Android/.test(ua)

  if (isIOS) {
    window.location.replace(APP_STORE)
  } else if (isAndroid) {
    const intentUrl =
      `intent://liftag.fit/trainer-invites/${id}` +
      `#Intent;scheme=https;package=com.liftag.app;` +
      `S.browser_fallback_url=${encodeURIComponent(PLAY_STORE)};end`
    window.location.replace(intentUrl)
  } else {
    window.location.replace('/')
  }
})
</script>

<template>
  <main class="invite-redirect">
    <p>Opening LIFTAG invite...</p>
  </main>
</template>

<style scoped>
.invite-redirect {
  min-height: 100dvh;
  display: grid;
  place-items: center;
  margin: 0;
  font-family: var(--liftag-font-body, system-ui, sans-serif);
  color: rgba(255, 255, 255, 0.6);
  background: var(--liftag-bg, #000);
}
</style>
