<script setup lang="ts">
const route = useRoute()
const id = String(route.params.id ?? '')

const APP_STORE_APP_ID = '6761140080'
const APP_STORE = `https://apps.apple.com/app/id${APP_STORE_APP_ID}`
const PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.liftag.app'
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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
useLiftagSeo({
  title: plan.value ? `${plan.value.name} on LIFTAG` : 'Check out this training plan on LIFTAG',
  description: 'Someone shared a training plan with you. Open the link on your phone to view it in the LIFTAG app.',
  path: `/plans/${id}`,
  image: `https://liftag.fit/api/og/plans/${id}`,
  noindex: true,
})

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width,initial-scale=1' },
    {
      name: 'apple-itunes-app',
      content: `app-id=${APP_STORE_APP_ID}, app-argument=https://liftag.fit/plans/${id}`,
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
  <main class="plan-redirect">
    <p>Opening LIFTAG training plan...</p>
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
