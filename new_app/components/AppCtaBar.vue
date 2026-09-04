<script setup lang="ts">
/**
 * Persistent, dismissible "get the app" surface for catalog pages. On phones
 * it is a bottom pill deep-linking to /get; on desktop it becomes a corner
 * card with the /get QR code, because a store link is a dead end on a
 * computer but a QR is one camera-lift away. Appears only after the visitor
 * has scrolled into the content, and stays dismissed for the session.
 */
const props = withDefaults(defineProps<{ message?: string }>(), {
  message: 'Log sets, PRs and progress',
})

const SCROLL_THRESHOLD = 480
const STORAGE_KEY = 'liftag-app-cta-dismissed'

const visible = ref(false)
const dismissed = ref(false)
let onScroll: (() => void) | null = null

onMounted(() => {
  try {
    dismissed.value = sessionStorage.getItem(STORAGE_KEY) === '1'
  }
  catch { /* storage blocked: show the bar, dismissal just won't persist */ }
  if (dismissed.value) return
  onScroll = () => {
    visible.value = window.scrollY > SCROLL_THRESHOLD
  }
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  if (onScroll) window.removeEventListener('scroll', onScroll)
})

function dismiss() {
  dismissed.value = true
  try {
    sessionStorage.setItem(STORAGE_KEY, '1')
  }
  catch { /* session-only dismissal */ }
}
</script>

<template>
  <Transition name="app-cta">
    <aside
      v-if="visible && !dismissed"
      class="app-cta"
      aria-label="Get the LIFTAG app"
    >
      <!-- Phone pill -->
      <div class="app-cta__pill">
        <img src="/assets/qr/app-icon.png" width="34" height="34" alt="LIFTAG" class="app-cta__icon">
        <span class="app-cta__copy">
          <span class="app-cta__title">Log it in the app</span>
          <span class="app-cta__sub">Free on iOS &amp; Android</span>
        </span>
        <NuxtLink to="/get" class="app-cta__btn">Get</NuxtLink>
        <button type="button" class="app-cta__close" aria-label="Dismiss" @click="dismiss">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <!-- Desktop corner card -->
      <div class="app-cta__card">
        <button type="button" class="app-cta__close app-cta__close--card" aria-label="Dismiss" @click="dismiss">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <InstallQrCode
          class="app-cta__qr"
          size="112px"
          padding="6px"
          radius="10px"
        />
        <div class="app-cta__card-copy">
          <p class="app-cta__title">{{ props.message }} in the app</p>
          <p class="app-cta__sub">Point your phone camera at the code</p>
          <p class="protocol app-cta__url">liftag.fit/get</p>
        </div>
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.app-cta {
  position: fixed;
  z-index: 90;
  right: max(20px, var(--liftag-safe-right));
  bottom: calc(16px + var(--liftag-safe-bottom));
  left: max(20px, var(--liftag-safe-left));
  display: flex;
  justify-content: center;
  pointer-events: none;
}

.app-cta__pill,
.app-cta__card {
  pointer-events: auto;
}

.app-cta__pill {
  display: flex;
  align-items: center;
  gap: 10px;
  width: min(560px, 100%);
  padding: 8px 8px 8px 10px;
  border: 1px solid rgba(204, 255, 0, 0.32);
  border-radius: 999px;
  background: rgba(10, 10, 10, 0.86);
  backdrop-filter: blur(14px) saturate(140%);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), 0 0 26px rgba(204, 255, 0, 0.08);
}

.app-cta__icon {
  flex: 0 0 auto;
  border-radius: 9px;
}

.app-cta__copy {
  display: grid;
  flex: 1 1 auto;
  gap: 1px;
  min-width: 0;
}

.app-cta__title {
  overflow: hidden;
  color: #fff;
  font-family: var(--liftag-font-headline);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-cta__sub {
  overflow: hidden;
  color: var(--liftag-fg-tertiary);
  font-size: 11px;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-cta__btn {
  flex: 0 0 auto;
  min-width: 92px;
  padding: 10px 28px;
  border-radius: 999px;
  background: var(--liftag-primary);
  color: var(--liftag-fg-on-primary);
  font-family: var(--liftag-font-body);
  font-size: 13px;
  font-weight: 700;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
}

.app-cta__close {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--liftag-fg-dim);
  cursor: pointer;
}

.app-cta__close:hover {
  color: #fff;
}

/* Desktop card */
.app-cta__card {
  position: relative;
  display: none;
  gap: 16px;
  align-items: center;
  padding: 16px 18px;
  border: 1px solid var(--liftag-border);
  border-radius: var(--liftag-r-lg);
  background: rgba(10, 10, 10, 0.9);
  backdrop-filter: blur(14px) saturate(140%);
  box-shadow: var(--liftag-shadow-pop);
}

.app-cta__qr {
  flex: 0 0 auto;
}

.app-cta__card-copy {
  display: grid;
  gap: 4px;
  max-width: 200px;
}

.app-cta__card-copy p {
  margin: 0;
}

.app-cta__card .app-cta__title {
  white-space: normal;
}

.app-cta__url {
  margin-top: 4px !important;
  color: var(--liftag-primary);
  font-size: 10px;
}

.app-cta__close--card {
  position: absolute;
  top: 6px;
  right: 6px;
}

@media (min-width: 901px) {
  .app-cta {
    left: auto;
    justify-content: flex-end;
  }

  .app-cta__pill {
    display: none;
  }

  .app-cta__card {
    display: flex;
  }
}

.app-cta-enter-active,
.app-cta-leave-active {
  transition: opacity 320ms cubic-bezier(0.16, 1, 0.3, 1), transform 320ms cubic-bezier(0.16, 1, 0.3, 1);
}

.app-cta-enter-from,
.app-cta-leave-to {
  opacity: 0;
  transform: translateY(16px);
}

@media (prefers-reduced-motion: reduce) {
  .app-cta-enter-active,
  .app-cta-leave-active {
    transition: none;
  }
}

@media (max-width: 380px) {
  .app-cta {
    right: max(12px, var(--liftag-safe-right));
    left: max(12px, var(--liftag-safe-left));
  }

  .app-cta__icon {
    display: none;
  }
}

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .app-cta__pill,
  .app-cta__card {
    background: rgba(6, 6, 6, 0.97);
  }
}
</style>
