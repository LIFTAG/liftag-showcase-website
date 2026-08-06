<script setup lang="ts">
const route = useRoute()
const id = String(route.params.id ?? '')

const APP_STORE_APP_ID = '6761140080'
const APP_STORE = `https://apps.apple.com/app/id${APP_STORE_APP_ID}`
const PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.liftag.app'
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
// Share links from female users carry ?v=f; the card then prefers the female
// exercise-image variants. Forwarded verbatim to the image route.
const variantQuery = route.query.v === 'f' ? '?v=f' : ''

// Server-side fetch so link previews carry the real routine name. Private or
// missing routines resolve to null and the generic copy is used instead.
const { data: routine } = await useAsyncData(`routine-share-${id}`, async () => {
  if (!UUID_RE.test(id)) return null
  try {
    const { apiBaseUrl } = useRuntimeConfig().public
    const res = await $fetch<{ data: { name: string } }>(`/v1/routines/${id}`, {
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
// card from these OG tags. The image endpoint renders the routine's exercise
// grid and falls back to the default og-image for non-public routines.
useLiftagSeo({
  title: routine.value ? `${routine.value.name} on LIFTAG` : 'Check out this routine on LIFTAG',
  description: 'Someone shared a workout routine with you. Open the link on your phone to view it in the LIFTAG app.',
  path: `/routines/${id}`,
  image: `https://liftag.fit/api/og/routines/${id}${variantQuery}`,
  noindex: true,
})

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width,initial-scale=1' },
    {
      name: 'apple-itunes-app',
      content: `app-id=${APP_STORE_APP_ID}, app-argument=https://liftag.fit/routines/${id}`,
    },
  ],
})

// iOS inside a social app's webview cannot complete Apple's
// `301 -> itms-appss://` hand-off, so redirecting there hangs on a blank page.
// Render the escape interstitial instead of redirecting. See utils/userAgent.ts.
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
    const intentUrl =
      `intent://liftag.fit/routines/${id}` +
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
    :share-url="`https://liftag.fit/routines/${id}`"
    heading="OPEN THIS ROUTINE."
    body="Instagram’s browser can’t hand off to the App Store or the LIFTAG app. Either option below works."
  />

  <main v-else class="routine-redirect">
    <p>Opening LIFTAG routine...</p>
  </main>
</template>

<style scoped>
.routine-redirect {
  min-height: var(--liftag-stable-vh);
  display: grid;
  place-items: center;
  margin: 0;
  font-family: var(--liftag-font-body, system-ui, sans-serif);
  color: rgba(255, 255, 255, 0.6);
  background: var(--liftag-bg, #000);
}
</style>
