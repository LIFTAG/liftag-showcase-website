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
useLiftagSeo(() => ({
  title: routine.value ? t('handoff.sharedTitle', { name: routine.value.name }) : t('handoff.routineHeading'),
  description: t('handoff.routineDescription'),
  path: `/routines/${id}`,
  image: absoluteUrl(withSiteLocaleQuery(`/api/og/routines/${id}${variantQuery.value}`, locale.value)),
  noindex: true,
}))

useHead(() => ({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width,initial-scale=1' },
    {
      name: 'apple-itunes-app',
      content: `app-id=${APP_STORE_APP_ID}, app-argument=https://liftag.fit/routines/${id}`,
    },
  ],
}))

const shareUrl = computed(() => absoluteUrl(href(`/routines/${id}${variantQuery.value}`)))

// A browser visit does not mean LIFTAG is absent. iOS keeps the shared
// destination available, including after Instagram hands this page to Safari;
// a desktop visitor gets it as a QR code for their phone. The server's guess
// travels in the payload so hydration renders the same branch: request headers
// do not exist in the browser, and a fresh guess there would flash the desktop
// page over the iOS one.
const view = useState<Platform>(`routine-handoff-${id}`, () =>
  detectPlatform(useRequestHeaders(['user-agent'])['user-agent'] ?? ''))

onMounted(() => {
  const ua = navigator.userAgent || ''
  // iPadOS Safari reports a Mac by default; only its touch points give it away.
  const isDesktopModeIPad = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1
  view.value = isDesktopModeIPad ? 'ios' : detectPlatform(ua)

  if (view.value === 'android') {
    const intentUrl =
      `intent://liftag.fit/routines/${id}` +
      `#Intent;scheme=https;package=com.liftag.app;` +
      `S.browser_fallback_url=${encodeURIComponent(PLAY_STORE)};end`
    window.location.replace(intentUrl)
  }
})
</script>

<template>
  <StoreEscape
    v-if="view === 'ios'"
    :app-url="`liftag://routines/${encodeURIComponent(id)}`"
    :share-url="shareUrl"
    :heading="t('handoff.routineHeading')"
    :body="t('handoff.contentBody')"
  />

  <DesktopHandoff
    v-else-if="view === 'desktop'"
    :share-url="shareUrl"
    :kicker="t('handoff.desktopRoutineKicker')"
    :heading="t('handoff.desktopRoutineHeading')"
    :body="t('handoff.desktopRoutineBody')"
  />

  <main v-else class="routine-redirect">
    <p>{{ t('handoff.openingRoutine') }}</p>
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
