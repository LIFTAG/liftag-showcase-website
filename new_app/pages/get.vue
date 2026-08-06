<script setup lang="ts">
/**
 * Single install endpoint — the URL that goes in an Instagram bio, a printed
 * flyer, or a DM. One link, three outcomes, decided from the User-Agent:
 *
 *   iOS      302 straight to the App Store listing
 *   Android  302 straight to the Play Store listing
 *   desktop  a QR that points back here, so the phone re-enters this same
 *            route and takes one of the store branches
 *
 * The redirect is done during SSR rather than in onMounted because the traffic
 * this page exists for arrives inside social in-app browsers, where a
 * client-side hop costs a visible blank frame.
 *
 * Android deliberately uses the plain https Play URL, not `intent://`. In-app
 * WebViews commonly fail the intent scheme outright with ERR_UNKNOWN_URL_SCHEME,
 * whereas the https listing is claimed by the Play Store app via App Links and
 * resolves from inside a WebView.
 */
const APP_STORE = 'https://apps.apple.com/app/id6761140080'
const PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.liftag.app'

type Target = 'ios' | 'android' | 'desktop'

function detect(ua: string): Target {
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios'
  if (/Android/i.test(ua)) return 'android'
  return 'desktop'
}

const storeUrl: Record<Exclude<Target, 'desktop'>, string> = {
  ios: APP_STORE,
  android: PLAY_STORE,
}

const target = ref<Target>(detect(useRequestHeaders(['user-agent'])['user-agent'] ?? ''))

if (import.meta.server && target.value !== 'desktop') {
  await navigateTo(storeUrl[target.value], { external: true, redirectCode: 302 })
}

useLiftagSeo({
  title: 'Get LIFTAG',
  description: 'Install LIFTAG — scan gym machines, load the right exercise, and track every set.',
  path: '/get',
  noindex: true,
})

onMounted(() => {
  // Two cases SSR cannot resolve: an iPad in desktop-mode Safari (reports as
  // Macintosh, betrayed only by touch points) and a client-side route change,
  // where there are no request headers at all.
  const ua = navigator.userAgent || ''
  const isDesktopModeIPad = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1
  const detected = isDesktopModeIPad ? 'ios' : detect(ua)

  if (detected !== 'desktop') {
    window.location.replace(storeUrl[detected])
    return
  }
  target.value = detected
})
</script>

<template>
  <main class="get">
    <div class="get__aura" aria-hidden="true" />
    <div class="get__grid" aria-hidden="true" />

    <!--
      Only the desktop state ever renders: phones are redirected to their store
      during SSR, before this markup is reached.
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
          <AppStoreBtn store="apple" :href="APP_STORE" />
          <AppStoreBtn store="google" :href="PLAY_STORE" />
        </div>
      </div>

      <div class="get__qr">
        <div class="get__panel">
          <img
            src="/assets/qr/get.svg"
            width="260"
            height="260"
            alt="QR code that opens the LIFTAG install page"
            class="get__code"
          >
          <span class="get__mark" aria-hidden="true">
            <img src="/assets/logo.svg" width="40" height="40" alt="">
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

.get__code {
  display: block;
  width: clamp(200px, 24vw, 260px);
  height: auto;
}

/* Safe over the modules: the code is error-correction level H and was verified
   to decode with a hole up to 24% of its width. This mark sits at ~19%. */
.get__mark {
  position: absolute;
  display: grid;
  place-items: center;
  width: 19%;
  aspect-ratio: 1;
  border-radius: 12px;
  background: #fbfdf5;
}

.get__mark img {
  width: 76%;
  height: auto;
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
