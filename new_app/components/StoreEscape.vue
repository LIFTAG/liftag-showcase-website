<script setup lang="ts">
/**
 * Shown when an automatic App Store redirect would strand the visitor: iOS,
 * inside a social app's embedded browser.
 *
 * Apple's https listing does not reliably hand off from embedded WKWebViews,
 * which can leave visitors on a blank page. Instagram is a special case: its
 * own `instagram://extbrowser/?url=...` route can hand a URL to the external
 * browser. From there, the normal App Store https URL can be claimed by iOS and
 * opened in the App Store.
 *
 * We attempt that handoff automatically on mount for Instagram. Because host
 * apps may reject custom-scheme navigation without a user gesture, the working
 * button remains visible as the reliable fallback.
 *
 * For other in-app browsers, and as a fallback if Instagram changes this route,
 * the page still explains how to use the host app's external-browser menu and
 * lets the visitor copy the /get URL into Safari.
 */
const props = withDefaults(defineProps<{
  /** Where the visitor should end up once they escape the webview. */
  shareUrl: string
  heading?: string
  body?: string
}>(), {
  heading: 'ONE MORE STEP.',
  body: 'Instagram’s browser can’t open the App Store directly. Use the button below to open it outside Instagram.',
})

/**
 * Instagram is singled out because it exposes a working external-browser URL
 * scheme. Other embedded browsers keep the manual escape instructions.
 */
const host = ref(inAppBrowserHost(useRequestHeaders(['user-agent'])['user-agent'] ?? ''))
const isInstagram = computed(() => host.value === 'instagram')

function openInstagramExternalBrowser() {
  if (!import.meta.client) return
  window.location.href = `instagram://extbrowser/?url=${encodeURIComponent(APP_STORE_URL)}`
}

onMounted(() => {
  host.value = inAppBrowserHost(navigator.userAgent || '')

  // Best-effort zero-tap path. If Instagram blocks custom-scheme navigation
  // without a user gesture, this is simply ignored and the button below remains.
  if (host.value === 'instagram') {
    openInstagramExternalBrowser()
  }
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

    <!-- Points off the top-right of the viewport, at the ••• sitting in
         Instagram's own chrome just above the page. Kept as a fallback cue. -->
    <div v-if="isInstagram" class="escape__pointer" aria-hidden="true">
      <svg viewBox="0 0 64 72" fill="none">
        <path
          d="M7 64C34 70 52 54 52 20"
          stroke="var(--liftag-primary, #ccff00)"
          stroke-width="3.5"
          stroke-linecap="round"
          stroke-dasharray="0.1 9"
        />
        <path
          d="M44 27L52 14l8 13"
          stroke="var(--liftag-primary, #ccff00)"
          stroke-width="3.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <span class="escape__pointer-label">fallback: ••• is up here</span>
    </div>

    <div class="escape__inner">
      <img src="/assets/qr/app-icon.png" width="72" height="72" alt="" class="escape__icon">

      <h1 class="display escape__title">{{ heading }}</h1>
      <p class="escape__body">{{ body }}</p>

      <button
        v-if="isInstagram"
        type="button"
        class="escape__primary"
        @click="openInstagramExternalBrowser"
      >
        Open LIFTAG in App Store
      </button>

      <template v-if="isInstagram">
        <p class="escape__hint">Opens the App Store through your external browser.</p>
        <p class="escape__or">if that doesn’t work</p>
      </template>

      <ol class="escape__steps">
        <li>
          <span class="escape__step-no">1</span>
          <span v-if="isInstagram">Tap the <strong>•••</strong> at the top right.</span>
          <span v-else>Tap the <strong>•••</strong> in this browser.</span>
        </li>
        <li>
          <span class="escape__step-no">2</span>
          <span>Choose <strong>Open in external browser</strong>.</span>
        </li>
      </ol>

      <p class="escape__or">or</p>

      <button type="button" class="escape__secondary" @click="copyLink">
        {{ copied ? 'Copied. Paste it in Safari' : 'Copy link' }}
      </button>
      <p class="protocol escape__url">{{ shareUrl.replace(/^https:\/\//, '') }}</p>

      <a :href="APP_STORE_URL" class="escape__last">Try the App Store link anyway</a>
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

.escape__pointer {
  position: fixed;
  /* Aims at the in-app browser's menu button, so it has to track the cutout
     rather than sit under it. */
  top: calc(6px + var(--liftag-safe-top));
  right: calc(26px + var(--liftag-safe-right));
  z-index: 2;
  display: flex;
  align-items: flex-end;
  gap: 4px;
  pointer-events: none;
  animation: escapePointerNudge 1.9s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}

.escape__pointer svg {
  order: 2;
  width: 42px;
  height: 48px;
  flex: 0 0 auto;
}

.escape__pointer-label {
  order: 1;
  margin-bottom: 6px;
  color: var(--liftag-primary, #ccff00);
  font-family: var(--liftag-font-mono);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  white-space: nowrap;
}

@keyframes escapePointerNudge {
  0%, 100% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(3px, -5px, 0); }
}

@media (prefers-reduced-motion: reduce) {
  .escape__pointer {
    animation: none;
  }
}

.escape__inner {
  position: relative;
  width: min(440px, calc(100% - 44px));
  display: grid;
  grid-template-columns: minmax(0, 1fr);
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
  max-width: 100%;
  margin-top: 26px;
  font-size: clamp(28px, 8vw, 40px);
  line-height: 0.98;
  color: var(--liftag-fg, #fff);
}

.escape__body {
  max-width: min(34ch, 100%);
  margin-top: 14px;
  color: var(--liftag-fg-soft, rgba(255, 255, 255, 0.6));
  font-size: 15px;
  font-weight: 300;
  line-height: 1.55;
}

.escape__steps {
  width: 100%;
  margin-top: 24px;
  padding: 0;
  display: grid;
  gap: 12px;
  list-style: none;
  text-align: left;
}

.escape__steps li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--liftag-border-strong, rgba(255, 255, 255, 0.08));
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  color: var(--liftag-fg-soft, rgba(255, 255, 255, 0.66));
  font-size: 15px;
  font-weight: 300;
  line-height: 1.45;
}

.escape__steps strong {
  color: var(--liftag-fg, #fff);
  font-weight: 700;
}

.escape__step-no {
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: var(--liftag-primary, #ccff00);
  color: #0e0e0e;
  font-family: var(--liftag-font-mono);
  font-size: 11px;
  font-weight: 800;
}

.escape__or {
  margin-top: 20px;
  color: var(--liftag-fg-dim, rgba(255, 255, 255, 0.4));
  font-family: var(--liftag-font-mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.escape__hint {
  margin-top: 10px;
  color: var(--liftag-fg-dim, rgba(255, 255, 255, 0.5));
  font-size: 12px;
  line-height: 1.45;
}

.escape__last {
  margin-top: 22px;
  color: var(--liftag-fg-dim, rgba(255, 255, 255, 0.45));
  font-size: 13px;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.escape__primary,
.escape__secondary {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 54px;
  padding: 0 22px;
  border: none;
  cursor: pointer;
  border-radius: 14px;
  font-family: var(--liftag-font-body, system-ui, sans-serif);
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.01em;
  text-decoration: none;
}

.escape__primary {
  margin-top: 24px;
  background: var(--liftag-primary, #ccff00);
  color: #0e0e0e;
  box-shadow: 0 0 34px rgba(204, 255, 0, 0.4);
}

.escape__secondary {
  margin-top: 10px;
  border: 1px solid var(--liftag-border-strong, rgba(255, 255, 255, 0.08));
  background: rgba(255, 255, 255, 0.06);
  color: var(--liftag-fg, #fff);
}

.escape__url {
  margin-top: 10px;
  color: var(--liftag-fg-dim, rgba(255, 255, 255, 0.5));
  word-break: break-all;
}
</style>
