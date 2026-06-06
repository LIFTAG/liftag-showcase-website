<script setup lang="ts">
const props = defineProps<{
  store: 'apple' | 'google'
  href?: string
  comingSoon?: boolean
}>()

const isApple = computed(() => props.store === 'apple')
const name = computed(() => isApple.value ? 'App Store' : 'Google Play')
const kicker = computed(() => {
  if (props.comingSoon) return 'Coming soon'
  return isApple.value ? 'Download on the' : 'Get it on'
})
const label = computed(() => props.comingSoon
  ? `${name.value} — coming soon`
  : (isApple.value ? 'Download on the App Store' : 'Get it on Google Play'))

const resolvedHref = computed(() => props.href ?? '#')
const isExternal = computed(() => /^https?:\/\//.test(resolvedHref.value))
</script>

<template>
  <component
    :is="comingSoon ? 'div' : 'a'"
    :href="comingSoon ? undefined : resolvedHref"
    :target="!comingSoon && isExternal ? '_blank' : undefined"
    :rel="!comingSoon && isExternal ? 'noopener' : undefined"
    class="app-store-btn"
    :class="{ 'app-store-btn--apple': isApple, 'app-store-btn--soon': comingSoon }"
    :aria-label="label"
    :aria-disabled="comingSoon ? 'true' : undefined"
  >
    <span class="app-store-btn__shine" aria-hidden="true" />
    <span class="app-store-btn__icon" aria-hidden="true">
      <img
        v-if="isApple"
        src="/assets/badges/appstore-icon.svg"
        alt=""
        class="app-store-btn__apple"
      />
      <svg
        v-else
        class="app-store-btn__play"
        viewBox="0 0 36 40"
        fill="none"
      >
        <path d="M3.5 2.9c-.7.5-1.1 1.4-1.1 2.7v28.8c0 1.2.4 2.1 1.1 2.7L20.1 20 3.5 2.9Z" fill="#5FE1A8" />
        <path d="m24.5 15.5-4.4 4.5 4.4 4.5 6.2-3.5c1.8-1 1.8-2.9 0-3.9l-6.2-3.6Z" fill="#CCFF00" />
        <path d="M3.5 2.9 20.1 20l4.4-4.5L6.6 1.5c-1.2-.9-2.3-.9-3.1 1.4Z" fill="#7AA7FF" />
        <path d="M3.5 37.1c.8 2.3 1.9 2.3 3.1 1.4l17.9-14-4.4-4.5L3.5 37.1Z" fill="#FF596F" />
      </svg>
    </span>
    <span class="app-store-btn__copy">
      <span class="app-store-btn__kicker">{{ kicker }}</span>
      <span class="app-store-btn__name">{{ name }}</span>
    </span>
  </component>
</template>

<style scoped>
.app-store-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-height: 52px;
  min-width: 164px;
  padding: 8px 15px 8px 12px;
  overflow: hidden;
  isolation: isolate;
  border: 1px solid rgba(204, 255, 0, 0.22);
  border-radius: 14px;
  background:
    linear-gradient(135deg, rgba(204, 255, 0, 0.1), transparent 38%),
    rgba(7, 10, 8, 0.78);
  color: #fff;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 14px 34px rgba(0, 0, 0, 0.34),
    0 0 0 rgba(204, 255, 0, 0);
  text-decoration: none;
  transform: translate3d(0, 0, 0);
  transition:
    border-color 280ms cubic-bezier(0.16, 1, 0.3, 1),
    background 280ms cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 280ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 280ms cubic-bezier(0.16, 1, 0.3, 1);
}

.app-store-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(circle at 22% 12%, rgba(255, 232, 72, 0.24), transparent 48%),
    radial-gradient(circle at 86% 88%, rgba(255, 210, 42, 0.1), transparent 44%);
  opacity: 0;
  transition: opacity 280ms ease;
}

.app-store-btn::after {
  content: '';
  position: absolute;
  inset: -1px;
  z-index: 1;
  padding: 1px;
  pointer-events: none;
  border-radius: inherit;
  background:
    conic-gradient(
      from 14deg,
      transparent 0deg,
      transparent 205deg,
      rgba(255, 247, 145, 0.92) 256deg,
      rgba(255, 222, 48, 0.72) 292deg,
      rgba(204, 255, 0, 0.38) 328deg,
      transparent 354deg
    );
  opacity: 0;
  transform: translate3d(0, 0, 0) rotate(0deg);
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  mask-composite: exclude;
}

.app-store-btn__shine {
  position: absolute;
  inset: -42% auto -42% -34%;
  width: 42%;
  pointer-events: none;
  background: linear-gradient(90deg, transparent, rgba(255, 248, 176, 0.28), transparent);
  opacity: 1;
  transform: skewX(-18deg) translateX(-120%);
  transition: transform 560ms cubic-bezier(0.16, 1, 0.3, 1);
}

.app-store-btn:hover,
.app-store-btn:focus-visible {
  border-color: rgba(204, 255, 0, 0.5);
  background:
    linear-gradient(135deg, rgba(204, 255, 0, 0.16), transparent 42%),
    rgba(12, 16, 10, 0.9);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    0 18px 46px rgba(0, 0, 0, 0.42),
    0 0 28px rgba(204, 255, 0, 0.18);
  transform: translate3d(0, -2px, 0);
}

.app-store-btn:hover::before,
.app-store-btn:focus-visible::before {
  opacity: 1;
}

.app-store-btn:hover .app-store-btn__shine,
.app-store-btn:focus-visible .app-store-btn__shine {
  transform: skewX(-18deg) translateX(420%);
}

.app-store-btn:focus-visible {
  outline: 2px solid rgba(204, 255, 0, 0.78);
  outline-offset: 3px;
}

/* Coming soon — disabled, non-interactive */
.app-store-btn--soon {
  cursor: default;
  opacity: 0.74;
  border-color: rgba(255, 255, 255, 0.14);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.04), transparent 38%),
    rgba(7, 10, 8, 0.7);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.app-store-btn--soon:hover,
.app-store-btn--soon:focus-visible {
  border-color: rgba(255, 255, 255, 0.14);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.04), transparent 38%),
    rgba(7, 10, 8, 0.7);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transform: none;
}

.app-store-btn--soon::before {
  opacity: 0 !important;
}

.app-store-btn--soon::after {
  display: none;
}

.app-store-btn--soon .app-store-btn__shine {
  display: none;
}

.app-store-btn--soon .app-store-btn__kicker {
  color: var(--liftag-primary);
}

.app-store-btn__icon {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.07);
}

.app-store-btn__apple {
  width: 17px;
  height: auto;
  display: block;
  filter: brightness(0) invert(1);
}

.app-store-btn__play {
  width: 19px;
  height: auto;
  display: block;
}

.app-store-btn__copy {
  display: grid;
  gap: 1px;
  min-width: 0;
  line-height: 1;
}

.app-store-btn__kicker {
  color: rgba(255, 255, 255, 0.55);
  font-family: var(--liftag-font-mono);
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  white-space: nowrap;
}

.app-store-btn__name {
  color: rgba(255, 255, 255, 0.94);
  font-family: var(--liftag-font-body);
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

@media (max-width: 768px) and (prefers-reduced-motion: no-preference) {
  .app-store-btn--apple:not(.app-store-btn--soon) {
    animation: appStorePhoneBeacon 3.25s cubic-bezier(0.16, 1, 0.3, 1) infinite;
    transform-origin: center;
    will-change: border-color, box-shadow, transform;
  }

  .app-store-btn--apple:not(.app-store-btn--soon)::before {
    animation: appStorePhoneAura 3.25s cubic-bezier(0.16, 1, 0.3, 1) infinite;
  }

  .app-store-btn--apple:not(.app-store-btn--soon)::after {
    animation: appStorePhoneRim 3.25s cubic-bezier(0.16, 1, 0.3, 1) infinite;
    will-change: opacity, transform;
  }

  .app-store-btn--apple:not(.app-store-btn--soon) .app-store-btn__shine {
    animation: appStorePhoneGlint 3.25s cubic-bezier(0.16, 1, 0.3, 1) infinite;
    will-change: opacity, transform;
  }
}

@keyframes appStorePhoneBeacon {
  0%,
  62%,
  100% {
    border-color: rgba(204, 255, 0, 0.22);
    background:
      linear-gradient(135deg, rgba(204, 255, 0, 0.1), transparent 38%),
      rgba(7, 10, 8, 0.78);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      0 14px 34px rgba(0, 0, 0, 0.34),
      0 0 0 rgba(204, 255, 0, 0);
    transform: translate3d(0, 0, 0) scale(1);
  }

  7% {
    border-color: rgba(255, 235, 72, 0.72);
    background:
      linear-gradient(135deg, rgba(255, 226, 56, 0.2), transparent 44%),
      rgba(13, 14, 8, 0.9);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.14),
      0 17px 38px rgba(0, 0, 0, 0.4),
      0 0 22px rgba(255, 229, 70, 0.3),
      0 0 46px rgba(255, 222, 48, 0.2);
    transform: translate3d(0, 0, 0) scale(1.018);
  }

  16% {
    border-color: rgba(255, 228, 72, 0.4);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.11),
      0 15px 35px rgba(0, 0, 0, 0.36),
      0 0 18px rgba(255, 222, 48, 0.16);
    transform: translate3d(0, 0, 0) scale(1.006);
  }

  28% {
    transform: translate3d(0, 0, 0) scale(1);
  }
}

@keyframes appStorePhoneAura {
  0%,
  58%,
  100% {
    opacity: 0;
  }

  8% {
    opacity: 1;
  }

  20% {
    opacity: 0.2;
  }
}

@keyframes appStorePhoneRim {
  0%,
  58%,
  100% {
    opacity: 0;
    transform: translate3d(0, 0, 0) rotate(0deg);
  }

  6% {
    opacity: 0.95;
  }

  22% {
    opacity: 0;
    transform: translate3d(0, 0, 0) rotate(252deg);
  }
}

@keyframes appStorePhoneGlint {
  0%,
  10%,
  58%,
  100% {
    opacity: 0;
    transform: skewX(-18deg) translateX(-120%);
  }

  12% {
    opacity: 1;
  }

  26% {
    opacity: 0;
    transform: skewX(-18deg) translateX(420%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-store-btn,
  .app-store-btn::before,
  .app-store-btn::after,
  .app-store-btn__shine {
    animation: none;
    transition: none;
  }

  .app-store-btn:hover,
  .app-store-btn:focus-visible {
    transform: none;
  }
}
</style>
