<script setup lang="ts">
/**
 * The single install CTA. Carries both store marks so availability stays
 * legible at a glance, but resolves to one link: /get, which detects the
 * device server-side and either redirects to the right store or, on desktop,
 * hands over a QR. That is why this is an internal link rather than a store
 * URL — the app only exists on a phone, and a desktop visitor needs a way to
 * cross devices, not a store web page they cannot install from.
 *
 * Where both individual badges are still the better affordance (on /get itself,
 * beside the QR, where naming the two stores IS the information), use
 * AppStoreBtn directly.
 */
withDefaults(defineProps<{
  label?: string
  /**
   * For narrow containers — notably the mobile hero rail, which is
   * `clamp(132px, 39vw, 156px)` wide beside the phone. Drops the kicker and
   * tightens everything; the two store marks already carry the availability
   * signal the kicker spells out.
   */
  compact?: boolean
}>(), { label: 'Download LIFTAG', compact: false })
</script>

<template>
  <NuxtLink
    to="/get"
    class="get-app-btn"
    :class="{ 'get-app-btn--compact': compact }"
    :aria-label="`${label} — available on the App Store and Google Play`"
  >
    <span class="get-app-btn__shine" aria-hidden="true" />

    <span class="get-app-btn__icons" aria-hidden="true">
      <img
        src="/assets/badges/appstore-icon.svg"
        alt=""
        class="get-app-btn__apple"
        width="31"
        height="38"
      >
      <span class="get-app-btn__divider" />
      <svg class="get-app-btn__play" viewBox="0 0 36 40" fill="none">
        <path d="M3.5 2.9c-.7.5-1.1 1.4-1.1 2.7v28.8c0 1.2.4 2.1 1.1 2.7L20.1 20 3.5 2.9Z" fill="#5FE1A8" />
        <path d="m24.5 15.5-4.4 4.5 4.4 4.5 6.2-3.5c1.8-1 1.8-2.9 0-3.9l-6.2-3.6Z" fill="#CCFF00" />
        <path d="M3.5 2.9 20.1 20l4.4-4.5L6.6 1.5c-1.2-.9-2.3-.9-3.1 1.4Z" fill="#7AA7FF" />
        <path d="M3.5 37.1c.8 2.3 1.9 2.3 3.1 1.4l17.9-14-4.4-4.5L3.5 37.1Z" fill="#FF596F" />
      </svg>
    </span>

    <span class="get-app-btn__copy">
      <span v-if="!compact" class="get-app-btn__kicker">iOS and Android</span>
      <span class="get-app-btn__name">{{ label }}</span>
    </span>
  </NuxtLink>
</template>

<style scoped>
/* Deliberately mirrors AppStoreBtn's shell so the two read as one family. */
.get-app-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 14px;
  min-height: 56px;
  max-width: 100%;
  padding: 9px 20px 9px 14px;
  overflow: hidden;
  isolation: isolate;
  border: 1px solid rgba(204, 255, 0, 0.28);
  border-radius: 14px;
  background:
    linear-gradient(135deg, rgba(204, 255, 0, 0.13), transparent 40%),
    rgba(7, 10, 8, 0.82);
  color: #fff;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 14px 34px rgba(0, 0, 0, 0.34);
  text-decoration: none;
  transform: translate3d(0, 0, 0);
  transition:
    border-color 280ms cubic-bezier(0.16, 1, 0.3, 1),
    background 280ms cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 280ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 280ms cubic-bezier(0.16, 1, 0.3, 1);
}

.get-app-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(circle at 20% 10%, rgba(255, 232, 72, 0.22), transparent 50%),
    radial-gradient(circle at 88% 90%, rgba(204, 255, 0, 0.12), transparent 46%);
  opacity: 0;
  transition: opacity 280ms ease;
}

.get-app-btn__shine {
  position: absolute;
  inset: -42% auto -42% -34%;
  width: 42%;
  pointer-events: none;
  background: linear-gradient(90deg, transparent, rgba(255, 248, 176, 0.26), transparent);
  transform: skewX(-18deg) translateX(-120%);
  transition: transform 560ms cubic-bezier(0.16, 1, 0.3, 1);
}

.get-app-btn:hover,
.get-app-btn:focus-visible {
  border-color: rgba(204, 255, 0, 0.55);
  background:
    linear-gradient(135deg, rgba(204, 255, 0, 0.19), transparent 44%),
    rgba(12, 16, 10, 0.92);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    0 18px 46px rgba(0, 0, 0, 0.42),
    0 0 30px rgba(204, 255, 0, 0.2);
  transform: translate3d(0, -2px, 0);
}

.get-app-btn:hover::before,
.get-app-btn:focus-visible::before {
  opacity: 1;
}

.get-app-btn:hover .get-app-btn__shine,
.get-app-btn:focus-visible .get-app-btn__shine {
  transform: skewX(-18deg) translateX(420%);
}

.get-app-btn:focus-visible {
  outline: 2px solid rgba(204, 255, 0, 0.78);
  outline-offset: 3px;
}

.get-app-btn__icons {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  flex: 0 0 auto;
  height: 36px;
  padding: 0 11px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.07);
}

.get-app-btn__divider {
  width: 1px;
  height: 16px;
  background: rgba(255, 255, 255, 0.16);
}

.get-app-btn__apple {
  width: 16px;
  height: auto;
  display: block;
  filter: brightness(0) invert(1);
}

.get-app-btn__play {
  width: 18px;
  height: auto;
  display: block;
}

.get-app-btn__copy {
  display: grid;
  gap: 2px;
  min-width: 0;
  line-height: 1;
}

.get-app-btn__kicker {
  color: rgba(255, 255, 255, 0.55);
  font-family: var(--liftag-font-mono);
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  white-space: nowrap;
}

.get-app-btn__name {
  color: rgba(255, 255, 255, 0.96);
  font-family: var(--liftag-font-body);
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

/* Compact: fits the narrow mobile hero rail. Measured against a 132px rail,
   the tightest the clamp goes. */
.get-app-btn--compact {
  width: 100%;
  justify-content: center;
  gap: 8px;
  min-height: 46px;
  padding: 7px 10px;
}

.get-app-btn--compact .get-app-btn__icons {
  height: 28px;
  gap: 5px;
  padding: 0 7px;
  border-radius: 8px;
}

.get-app-btn--compact .get-app-btn__apple {
  width: 13px;
}

.get-app-btn--compact .get-app-btn__play {
  width: 14px;
}

.get-app-btn--compact .get-app-btn__divider {
  height: 13px;
}

.get-app-btn--compact .get-app-btn__name {
  font-size: 13px;
}

/* Phones: the CTA is wider than the single badge it replaced, and the copy is
   nowrap inside an overflow-hidden shell — so at narrow widths it clipped.
   Going full-width and centred also gives it a proper thumb target. */
@media (max-width: 768px) {
  .get-app-btn:not(.get-app-btn--compact) {
    width: 100%;
    justify-content: center;
    gap: 11px;
    padding: 8px 16px;
  }

  .get-app-btn:not(.get-app-btn--compact) .get-app-btn__icons {
    height: 32px;
    gap: 8px;
    padding: 0 9px;
  }

  .get-app-btn:not(.get-app-btn--compact) .get-app-btn__name {
    font-size: 16px;
  }
}

/* Small phones: drop to the essentials so the label never truncates. */
@media (max-width: 380px) {
  .get-app-btn:not(.get-app-btn--compact) {
    gap: 9px;
    padding: 8px 12px;
  }

  .get-app-btn:not(.get-app-btn--compact) .get-app-btn__icons {
    padding: 0 7px;
    gap: 6px;
  }

  .get-app-btn:not(.get-app-btn--compact) .get-app-btn__name {
    font-size: 15px;
  }

  .get-app-btn__kicker {
    font-size: 7px;
    letter-spacing: 0.09em;
  }
}

@media (prefers-reduced-motion: reduce) {
  .get-app-btn,
  .get-app-btn::before,
  .get-app-btn__shine {
    animation: none;
    transition: none;
  }

  .get-app-btn:hover,
  .get-app-btn:focus-visible {
    transform: none;
  }
}
</style>
