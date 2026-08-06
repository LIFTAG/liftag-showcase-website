<script setup lang="ts">
/**
 * Shown when an automatic App Store redirect would strand the visitor: iOS,
 * inside a social app's embedded browser.
 *
 * Apple's https listing answers `301 -> itms-appss://` for iPhone user-agents.
 * Safari forwards that scheme to the App Store; an embedded WKWebView cannot,
 * so the redirect ends on a blank page that never resolves. No redirect fixes
 * that — every variant lands in the same webview and hits the same wall.
 *
 * Tapping `itms-apps://` directly was tried and confirmed NOT to work from
 * Instagram: the scheme is swallowed like the rest. `x-safari-https://` is
 * blocked too, and non-gesture redirects are ignored outright. There is no
 * reliable automatic escape, and offering one as the primary action is worse
 * than offering none — a button that silently does nothing reads as a broken
 * site and costs the install.
 *
 * So this page leads with the two things that actually work:
 *   1. The host app's own "open in external browser" action, spelled out as
 *      the main instruction. Confirmed working, needs nobody's cooperation.
 *   2. Copying the link to paste into Safari, for when that menu is hard to
 *      find or worded differently.
 *
 * The plain https App Store link is kept at the bottom as a last resort: it is
 * correct everywhere else, and costs nothing if this page is ever reached from
 * a webview that does handle the hand-off.
 */
const props = withDefaults(defineProps<{
  /** Where the visitor should end up once they escape the webview. */
  shareUrl: string
  heading?: string
  body?: string
}>(), {
  heading: 'ONE MORE STEP.',
  body: 'Instagram’s browser can’t open the App Store. Two seconds to get around it:',
})

/**
 * Instagram on iOS keeps "Open in external browser" behind a ••• in the top
 * right, and has across redesigns — so for Instagram specifically the page
 * points at it. Other embedded browsers put that control elsewhere, so they
 * get wording without a direction.
 */
const host = ref(inAppBrowserHost(useRequestHeaders(['user-agent'])['user-agent'] ?? ''))
const isInstagram = computed(() => host.value === 'instagram')

onMounted(() => {
  host.value = inAppBrowserHost(navigator.userAgent || '')
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
         Instagram's own chrome just above the page. -->
    <div v-if="isInstagram" class="escape__pointer" aria-hidden="true">
      <svg viewBox="0 0 64 72" fill="none">
        <!-- Leaves the label at bottom left, travels right, then sweeps up
             into the top-right corner where the ••• sits. -->
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
      <span class="escape__pointer-label">the ••• is up here</span>
    </div>

    <div class="escape__inner">
      <img src="/assets/qr/app-icon.png" width="72" height="72" alt="" class="escape__icon">

      <h1 class="display escape__title">{{ heading }}</h1>
      <p class="escape__body">{{ body }}</p>

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

      <button type="button" class="escape__primary" @click="copyLink">
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
  top: 6px;
  right: 26px;
  z-index: 2;
  display: flex;
  /* The arrow's tail is at its bottom left, so the label sits level with the
     tail rather than beside the head. */
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

/* Clear the pointer so it never sits on top of the icon. */
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

.escape__last {
  margin-top: 22px;
  color: var(--liftag-fg-dim, rgba(255, 255, 255, 0.45));
  font-size: 13px;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.escape__primary {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 54px;
  margin-top: 10px;
  padding: 0 22px;
  border: none;
  cursor: pointer;
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

.escape__url {
  margin-top: 10px;
  color: var(--liftag-fg-dim, rgba(255, 255, 255, 0.5));
  word-break: break-all;
}
</style>
