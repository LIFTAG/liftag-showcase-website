<script setup lang="ts">
/**
 * Single install endpoint — the URL that goes in an Instagram bio, a printed
 * flyer, or a DM. One link, four outcomes, decided from the User-Agent:
 *
 *   iOS                302 straight to the App Store listing
 *   iOS, in-app browser  the StoreEscape interstitial (see below)
 *   Android            302 straight to the Play Store listing
 *   desktop            a QR pointing back here, so the phone re-enters this
 *                      same route and takes one of the store branches
 *
 * Redirects happen during SSR rather than in onMounted because this traffic
 * arrives from social apps, where a client-side hop costs a visible blank frame.
 *
 * The iOS exception is the whole reason this route is not just a redirect.
 * With an iPhone user-agent Apple answers the https listing with
 * `301 -> itms-appss://`, which Safari forwards to the App Store but an
 * embedded WKWebView cannot forward anywhere — so redirecting an in-app browser
 * lands it on a blank page that never resolves. Rendering an escape page is the
 * only fix; another redirect, server-side or not, hits the same wall.
 *
 * Android deliberately uses the plain https Play URL, not `intent://`. In-app
 * WebViews commonly fail the intent scheme outright with ERR_UNKNOWN_URL_SCHEME,
 * whereas the https listing is claimed by the Play Store app via App Links and
 * resolves from inside a WebView.
 */
const SHARE_URL = 'https://liftag.fit/get'

type View = Platform | 'escape'

function classify(ua: string): View {
  return needsStoreEscape(ua) ? 'escape' : detectPlatform(ua)
}

const storeUrl: Record<'ios' | 'android', string> = {
  ios: APP_STORE_URL,
  android: PLAY_STORE_URL,
}

const view = ref<View>(classify(useRequestHeaders(['user-agent'])['user-agent'] ?? ''))

if (import.meta.server && (view.value === 'ios' || view.value === 'android')) {
  await navigateTo(storeUrl[view.value], { external: true, redirectCode: 302 })
}

useLiftagSeo({
  title: 'Get LIFTAG',
  description: 'Install LIFTAG. Scan gym machines, load the right exercise, and track every set.',
  path: '/get',
  noindex: true,
})

onMounted(() => {
  // Two cases SSR cannot resolve: an iPad in desktop-mode Safari (reports as
  // Macintosh, betrayed only by touch points) and a client-side route change,
  // where there are no request headers at all.
  const ua = navigator.userAgent || ''
  const isDesktopModeIPad = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1
  const detected: View = isDesktopModeIPad && !isInAppBrowser(ua) ? 'ios' : classify(ua)

  if (detected === 'ios' || detected === 'android') {
    window.location.replace(storeUrl[detected])
    return
  }
  view.value = detected
})
</script>

<template>
  <StoreEscape v-if="view === 'escape'" :share-url="SHARE_URL" />

  <main v-else class="get">
    <div class="get__aura" aria-hidden="true" />
    <div class="get__grid" aria-hidden="true" />

    <!--
      Only the desktop state renders here: phones are either redirected to their
      store during SSR or shown StoreEscape above.
    -->
    <div class="get__inner">
      <div class="get__copy">
        <p class="protocol get__kicker">Install · iOS and Android</p>
        <h1 class="display get__title">
          POINT YOUR<br /><span class="lime">PHONE</span> HERE.
        </h1>
        <p class="get__body">
          LIFTAG lives on the phone you train with. Scan the code and your store
          opens on your device.
        </p>
        <div class="get__stores">
          <AppStoreBtn store="apple" :href="APP_STORE_URL" />
          <AppStoreBtn store="google" :href="PLAY_STORE_URL" />
        </div>
      </div>

      <div class="get__qr">
        <div class="get__panel">
          <!--
            Sits behind the panel's opaque background, so it only ever shows as
            a rim outside the border box. It must stay outside: the code's
            decode margin is already spent on the centre mark below.
          -->
          <div class="prism-rim get__rim" aria-hidden="true"></div>
          <img
            src="/assets/qr/get.svg"
            width="260"
            height="260"
            alt="QR code that opens the LIFTAG install page"
            class="get__code"
          >
          <span class="get__mark" aria-hidden="true">
            <img src="/assets/qr/app-icon.png" width="60" height="60" alt="">
          </span>
        </div>
        <p class="protocol get__url">liftag.fit/get</p>
      </div>
    </div>
  </main>
</template>

<style scoped>
.get {
  position: relative;
  min-height: var(--liftag-stable-vh);
  display: grid;
  place-items: center;
  overflow: hidden;
  padding: clamp(48px, 9vh, 104px) 0;
  background: var(--liftag-bg);
}

.get__aura {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse 55% 45% at 62% 45%, rgba(204, 255, 0, 0.16), transparent 62%);
}

.get__grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 80px 80px;
  mask-image: radial-gradient(ellipse 75% 60% at 55% 50%, black 25%, transparent 78%);
  -webkit-mask-image: radial-gradient(ellipse 75% 60% at 55% 50%, black 25%, transparent 78%);
}

.get__inner {
  position: relative;
  width: min(1080px, calc(100% - 48px));
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: clamp(40px, 7vw, 96px);
}

.get__kicker {
  color: var(--liftag-primary);
  margin-bottom: 20px;
}

.get__title {
  font-size: clamp(46px, 6.4vw, 92px);
  line-height: 0.94;
  color: var(--liftag-fg);
}

.get__body {
  max-width: 44ch;
  margin-top: 24px;
  color: var(--liftag-fg-soft);
  font-size: 17px;
  font-weight: 300;
  line-height: 1.62;
}

.get__stores {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 40px;
}

.get__qr {
  display: grid;
  justify-items: center;
  gap: 18px;
  /* Traps the rim's negative z-index here. Without a stacking context of its
     own the rim falls all the way back past .get's opaque black and vanishes. */
  isolation: isolate;
}

.get__panel {
  position: relative;
  display: grid;
  place-items: center;
  padding: 18px;
  border-radius: var(--liftag-r-xl);
  background: #fbfdf5;
  box-shadow:
    0 0 0 1px rgba(204, 255, 0, 0.28),
    0 24px 70px rgba(0, 0, 0, 0.55),
    0 0 44px rgba(204, 255, 0, 0.14);
}

/* Neither .get__panel nor .get__inner creates a stacking context (no
   transform, filter or opacity), so a negative z-index child paints behind the
   panel's own background while staying above the page. That is what turns the
   shared .prism-rim into a ring here without a mask. */
.get__rim {
  z-index: -1;
  --prism-inset: 5px;
  --prism-radius: calc(var(--liftag-r-xl) + 5px);
  --prism-strength: 0.85;
}

.get__code {
  display: block;
  width: clamp(200px, 24vw, 260px);
  height: auto;
}

/* The app icon itself, on a light pad that separates its dark ground from the
   modules. Safe over the code: error correction is level H, and this was
   verified to still decode with the whole 23% square below treated as lost —
   a square is the worst case, covering more area than a disc of equal width. */
.get__mark {
  position: absolute;
  display: grid;
  place-items: center;
  width: 23%;
  aspect-ratio: 1;
  border-radius: 24%;
  background: #fbfdf5;
}

.get__mark img {
  width: 86%;
  height: auto;
  display: block;
  /* Matches the squircle the stores mask the icon with. */
  border-radius: 22%;
}

.get__url {
  color: var(--liftag-fg-dim);
}

@media (max-width: 860px) {
  .get__inner {
    grid-template-columns: minmax(0, 1fr);
    justify-items: center;
    text-align: center;
    gap: 44px;
  }

  .get__body {
    margin-inline: auto;
  }

  .get__stores {
    justify-content: center;
  }
}
</style>
