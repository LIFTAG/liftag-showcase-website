<script setup lang="ts">
/**
 * Shown when an automatic App Store redirect would strand the visitor: iOS,
 * inside a social app's embedded browser.
 *
 * Apple's https listing answers `301 -> itms-appss://` for iPhone user-agents.
 * Safari forwards that scheme to the App Store; an embedded WKWebView cannot,
 * so the redirect ends on a blank page that never resolves. No server-side
 * redirect can fix that — the hop lands in the same webview and hits the same
 * wall — so the page has to render and offer a way out instead.
 *
 * Two routes out, both shown at once rather than one behind the other's
 * failure, because neither can be relied on:
 *   1. Tapping the itms-apps:// scheme directly. Skips Apple's HTTP redirect
 *      and gives the host app something it can forward to the OS. Works in
 *      most embedded browsers, on a real tap.
 *   2. The host app's own "open in browser" action, which lands the visitor in
 *      Safari where the normal link works. Always available, needs no
 *      cooperation from anyone, so it is spelled out rather than hidden.
 *
 * Deliberately does not auto-navigate on mount. Redirects not tied to a user
 * gesture are ignored by these webviews, and attempting one only risks
 * re-creating the blank frame this page exists to replace.
 */
const props = withDefaults(defineProps<{
  /** Where the visitor should end up once they escape the webview. */
  shareUrl: string
  heading?: string
  body?: string
}>(), {
  heading: 'ONE MORE TAP.',
  body: 'Instagram’s browser can’t open the App Store. Either button below gets you there.',
})

const copied = ref(false)
let copyTimer: ReturnType<typeof setTimeout> | null = null

async function copyLink() {
  try {
    await navigator.clipboard.writeText(props.shareUrl)
  }
  catch {
    return // Clipboard blocked; the link is printed below regardless.
  }
  copied.value = true
  if (copyTimer) clearTimeout(copyTimer)
  copyTimer = setTimeout(() => {
    copied.value = false
    copyTimer = null
  }, 2200)
}

onBeforeUnmount(() => {
  if (copyTimer) clearTimeout(copyTimer)
})
</script>

<template>
  <main class="escape">
    <div class="escape__aura" aria-hidden="true" />

    <div class="escape__inner">
      <img src="/assets/qr/app-icon.png" width="72" height="72" alt="" class="escape__icon">

      <h1 class="display escape__title">{{ heading }}</h1>
      <p class="escape__body">{{ body }}</p>

      <a :href="APP_STORE_SCHEME_URL" class="escape__primary">Open the App Store</a>

      <div class="escape__hint">
        <p class="protocol escape__hint-label">If that does nothing</p>
        <p class="escape__hint-body">
          Tap <strong>•••</strong> at the top right of this browser, then
          <strong>Open in external browser</strong>. The App Store opens normally from there.
        </p>
      </div>

      <button type="button" class="escape__copy" @click="copyLink">
        {{ copied ? 'Link copied' : 'Copy link instead' }}
      </button>
      <p class="protocol escape__url">{{ shareUrl.replace(/^https:\/\//, '') }}</p>
    </div>
  </main>
</template>

<style scoped>
.escape {
  position: relative;
  min-height: var(--liftag-stable-vh);
  display: grid;
  place-items: center;
  overflow: hidden;
  padding: 40px 0;
  background: var(--liftag-bg, #000);
}

.escape__aura {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse 70% 45% at 50% 34%, rgba(204, 255, 0, 0.16), transparent 64%);
}

.escape__inner {
  position: relative;
  width: min(440px, calc(100% - 44px));
  display: grid;
  justify-items: center;
  text-align: center;
}

.escape__icon {
  width: 72px;
  height: 72px;
  border-radius: 22%;
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.5), 0 0 32px rgba(204, 255, 0, 0.16);
}

.escape__title {
  margin-top: 26px;
  font-size: clamp(34px, 10vw, 46px);
  line-height: 0.98;
  color: var(--liftag-fg, #fff);
}

.escape__body {
  max-width: 34ch;
  margin-top: 14px;
  color: var(--liftag-fg-soft, rgba(255, 255, 255, 0.6));
  font-size: 15px;
  font-weight: 300;
  line-height: 1.55;
}

.escape__primary {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 54px;
  margin-top: 28px;
  padding: 0 22px;
  border-radius: 14px;
  background: var(--liftag-primary, #ccff00);
  color: #0e0e0e;
  font-family: var(--liftag-font-body, system-ui, sans-serif);
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.01em;
  text-decoration: none;
  box-shadow: 0 0 34px rgba(204, 255, 0, 0.4);
}

.escape__hint {
  width: 100%;
  margin-top: 18px;
  padding: 16px 18px;
  border: 1px solid var(--liftag-border-strong, rgba(255, 255, 255, 0.08));
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
}

.escape__hint-label {
  color: var(--liftag-primary, #ccff00);
}

.escape__hint-body {
  margin-top: 8px;
  color: var(--liftag-fg-soft, rgba(255, 255, 255, 0.62));
  font-size: 14px;
  font-weight: 300;
  line-height: 1.5;
}

.escape__hint-body strong {
  color: var(--liftag-fg, #fff);
  font-weight: 700;
}

.escape__copy {
  margin-top: 18px;
  padding: 10px 16px;
  border: 1px solid var(--liftag-border-strong, rgba(255, 255, 255, 0.1));
  border-radius: 999px;
  background: transparent;
  color: var(--liftag-fg-mid, rgba(255, 255, 255, 0.7));
  font-family: var(--liftag-font-body, system-ui, sans-serif);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.escape__url {
  margin-top: 10px;
  color: var(--liftag-fg-dim, rgba(255, 255, 255, 0.5));
  word-break: break-all;
}
</style>
