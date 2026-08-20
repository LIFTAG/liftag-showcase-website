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
  /** High-contrast equipment-plate treatment for primary hero placement. */
  hero?: boolean
}>(), { label: 'Download LIFTAG', compact: false, hero: false })
</script>

<template>
  <NuxtLink
    to="/get"
    class="get-app-btn"
    :class="{
      'get-app-btn--compact': compact,
      'get-app-btn--hero': hero,
    }"
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
      <span v-if="!compact" class="get-app-btn__kicker">
        {{ hero ? 'Free on iOS + Android' : 'iOS and Android' }}
      </span>
      <span class="get-app-btn__name">{{ label }}</span>
    </span>

    <span v-if="hero" class="get-app-btn__download" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 4v11m0 0 4-4m-4 4-4-4M5 20h14" />
      </svg>
    </span>
  </NuxtLink>
</template>

<style scoped>
/* Deliberately mirrors AppStoreBtn's shell so the two read as one family. */
.get-app-btn {
  --get-app-idle-rgb: 204, 255, 0;
  --get-app-idle-light-rgb: 255, 247, 145;
  --get-app-idle-duration: 3.25s;
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
    radial-gradient(circle at 22% 12%, rgba(var(--get-app-idle-light-rgb), 0.26), transparent 48%),
    radial-gradient(circle at 86% 88%, rgba(var(--get-app-idle-rgb), 0.12), transparent 44%);
  opacity: 0;
  transition: opacity 280ms ease;
}

.get-app-btn__shine {
  position: absolute;
  inset: -42% auto -42% -34%;
  width: 42%;
  pointer-events: none;
  background: linear-gradient(90deg, transparent, rgba(var(--get-app-idle-light-rgb), 0.3), transparent);
  opacity: 1;
  transform: skewX(-18deg) translateX(-120%);
  transition: transform 560ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* :focus-visible stays ungated so keyboard users keep the affordance on
   touch-capable devices; only the :hover half is pointer-gated, because touch
   browsers hold :hover after a tap and would strand the button mid-lift. */
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

.get-app-btn:focus-visible::before {
  opacity: 1;
}

.get-app-btn:focus-visible .get-app-btn__shine {
  transform: skewX(-18deg) translateX(420%);
}

@media (hover: hover) and (pointer: fine) {
  .get-app-btn:hover {
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

  .get-app-btn:hover::before {
    opacity: 1;
  }

  .get-app-btn:hover .get-app-btn__shine {
    transform: skewX(-18deg) translateX(420%);
  }
}

.get-app-btn:focus-visible {
  outline: 2px solid rgba(204, 255, 0, 0.78);
  outline-offset: 3px;
}

/* Every merged store button gets the same four-part idle beacon as the
   individual /get badges, recolored to LIFTAG yellow. The hero is a separate
   equipment-plate treatment and keeps its own motion below. */
.get-app-btn:not(.get-app-btn--hero)::after {
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
      rgba(var(--get-app-idle-light-rgb), 0.92) 256deg,
      rgba(var(--get-app-idle-rgb), 0.76) 292deg,
      rgba(var(--get-app-idle-rgb), 0.36) 328deg,
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

@media (prefers-reduced-motion: no-preference) {
  .get-app-btn:not(.get-app-btn--hero) {
    animation: getAppPhoneBeacon var(--get-app-idle-duration) cubic-bezier(0.16, 1, 0.3, 1) infinite;
    transform-origin: center;
    will-change: border-color, box-shadow, transform;
  }

  .get-app-btn:not(.get-app-btn--hero)::before {
    animation: getAppPhoneAura var(--get-app-idle-duration) cubic-bezier(0.16, 1, 0.3, 1) infinite;
  }

  .get-app-btn:not(.get-app-btn--hero)::after {
    animation: getAppPhoneRim var(--get-app-idle-duration) cubic-bezier(0.16, 1, 0.3, 1) infinite;
    will-change: opacity, transform;
  }

  .get-app-btn:not(.get-app-btn--hero) .get-app-btn__shine {
    animation: getAppPhoneGlint var(--get-app-idle-duration) cubic-bezier(0.16, 1, 0.3, 1) infinite;
    will-change: opacity, transform;
  }
}

/* Intentional hover/focus feedback takes over cleanly from the ambient cycle. */
@media (hover: hover) and (pointer: fine) {
  .get-app-btn:not(.get-app-btn--hero):is(:hover, :focus-visible),
  .get-app-btn:not(.get-app-btn--hero):is(:hover, :focus-visible)::before,
  .get-app-btn:not(.get-app-btn--hero):is(:hover, :focus-visible)::after,
  .get-app-btn:not(.get-app-btn--hero):is(:hover, :focus-visible) .get-app-btn__shine {
    animation: none;
  }
}

@keyframes getAppPhoneBeacon {
  0%,
  62%,
  100% {
    border-color: rgba(204, 255, 0, 0.28);
    background:
      linear-gradient(135deg, rgba(204, 255, 0, 0.13), transparent 40%),
      rgba(7, 10, 8, 0.82);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      0 14px 34px rgba(0, 0, 0, 0.34),
      0 0 0 rgba(var(--get-app-idle-rgb), 0);
    transform: translate3d(0, 0, 0) scale(1);
  }

  7% {
    border-color: rgba(var(--get-app-idle-rgb), 0.76);
    background:
      linear-gradient(135deg, rgba(var(--get-app-idle-rgb), 0.22), transparent 44%),
      rgba(13, 14, 8, 0.9);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.14),
      0 17px 38px rgba(0, 0, 0, 0.4),
      0 0 22px rgba(var(--get-app-idle-rgb), 0.32),
      0 0 46px rgba(var(--get-app-idle-rgb), 0.2);
    transform: translate3d(0, 0, 0) scale(1.018);
  }

  16% {
    border-color: rgba(var(--get-app-idle-rgb), 0.42);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.11),
      0 15px 35px rgba(0, 0, 0, 0.36),
      0 0 18px rgba(var(--get-app-idle-rgb), 0.18);
    transform: translate3d(0, 0, 0) scale(1.006);
  }

  28% {
    transform: translate3d(0, 0, 0) scale(1);
  }
}

@keyframes getAppPhoneAura {
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

@keyframes getAppPhoneRim {
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

@keyframes getAppPhoneGlint {
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

/* Hero: an acid-lime equipment plate rather than another dark app-store badge. */
.get-app-btn--hero {
  width: min(100%, 360px);
  min-height: 60px;
  gap: 12px;
  padding: 8px 9px 8px 10px;
  border-color: rgba(12, 18, 7, 0.22);
  border-radius: 0;
  background: var(--liftag-primary);
  color: oklch(0.16 0.018 125);
  box-shadow:
    inset 0 1px 0 rgba(246, 255, 212, 0.5),
    inset 0 -1px 0 rgba(7, 13, 4, 0.22),
    0 14px 34px rgba(0, 0, 0, 0.38),
    0 0 26px rgba(204, 255, 0, 0.2);
  clip-path: polygon(
    0 0,
    calc(100% - 13px) 0,
    100% 13px,
    100% 100%,
    13px 100%,
    0 calc(100% - 13px)
  );
}

.get-app-btn--hero::before {
  background:
    linear-gradient(110deg, rgba(248, 255, 214, 0.34), transparent 38%),
    repeating-linear-gradient(90deg, transparent 0 22px, rgba(7, 13, 4, 0.035) 22px 23px);
  opacity: 1;
}

.get-app-btn--hero::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 2;
  padding: 1px;
  pointer-events: none;
  background: conic-gradient(
    from 14deg,
    transparent 0deg,
    transparent 210deg,
    oklch(0.56 0.14 78 / 0.88) 254deg,
    oklch(0.78 0.16 91 / 0.96) 282deg,
    oklch(0.62 0.16 80 / 0.82) 316deg,
    transparent 350deg
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

.get-app-btn--hero .get-app-btn__shine {
  inset: -42% auto -42% -24%;
  width: 22%;
  background: linear-gradient(
    90deg,
    transparent 0 37%,
    oklch(0.57 0.15 78 / 0.86) 40% 43%,
    transparent 46% 59%,
    oklch(0.76 0.16 91 / 0.8) 61% 63%,
    transparent 66% 100%
  );
  mix-blend-mode: multiply;
  opacity: 0;
  transform: skewX(-18deg) translateX(-150%);
}

.get-app-btn--hero .get-app-btn__icons {
  height: 42px;
  gap: 7px;
  padding: 0 9px;
  border-radius: 6px;
  background: oklch(0.16 0.018 125);
  box-shadow:
    inset 0 0 0 1px rgba(238, 255, 170, 0.08),
    0 2px 0 rgba(7, 13, 4, 0.2);
}

.get-app-btn--hero .get-app-btn__divider {
  background: rgba(238, 255, 193, 0.2);
}

.get-app-btn--hero .get-app-btn__copy {
  flex: 1 1 auto;
  gap: 3px;
}

.get-app-btn--hero .get-app-btn__kicker {
  color: rgba(10, 16, 6, 0.58);
  font-size: 7px;
  letter-spacing: 0.16em;
}

.get-app-btn--hero .get-app-btn__name {
  color: oklch(0.16 0.018 125);
  font-family: var(--liftag-font-headline);
  font-size: 18px;
  font-style: italic;
  font-weight: 800;
  letter-spacing: -0.015em;
  line-height: 0.95;
  text-transform: uppercase;
}

.get-app-btn__download {
  display: grid;
  flex: 0 0 auto;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 6px;
  background: oklch(0.16 0.018 125);
  box-shadow:
    inset 0 0 0 1px rgba(238, 255, 170, 0.08),
    0 2px 0 rgba(7, 13, 4, 0.2);
}

.get-app-btn__download svg {
  width: 20px;
  height: 20px;
  stroke: var(--liftag-primary);
  stroke-width: 1.8;
  stroke-linecap: square;
  stroke-linejoin: miter;
}

.get-app-btn--hero:focus-visible {
  border-color: rgba(12, 18, 7, 0.36);
  background: oklch(0.92 0.24 121);
  box-shadow:
    inset 0 1px 0 rgba(246, 255, 212, 0.62),
    inset 0 -1px 0 rgba(7, 13, 4, 0.22),
    0 18px 42px rgba(0, 0, 0, 0.44),
    0 0 32px rgba(204, 255, 0, 0.28);
}

@media (hover: hover) and (pointer: fine) {
  .get-app-btn--hero:hover {
    border-color: rgba(12, 18, 7, 0.36);
    background: oklch(0.92 0.24 121);
    box-shadow:
      inset 0 1px 0 rgba(246, 255, 212, 0.62),
      inset 0 -1px 0 rgba(7, 13, 4, 0.22),
      0 18px 42px rgba(0, 0, 0, 0.44),
      0 0 32px rgba(204, 255, 0, 0.28);
  }
}

.get-app-btn--hero:active {
  transform: translate3d(0, 0, 0) scale(0.985);
  transition-duration: 90ms;
}

@media (prefers-reduced-motion: no-preference) {
  .get-app-btn--hero::after {
    animation: getAppHeroRim 3.25s cubic-bezier(0.16, 1, 0.3, 1) infinite;
    will-change: opacity, transform;
  }

}

@keyframes getAppHeroRim {
  0%,
  58%,
  100% {
    opacity: 0;
    transform: translate3d(0, 0, 0) rotate(0deg);
  }

  6% {
    opacity: 0.9;
  }

  22% {
    opacity: 0;
    transform: translate3d(0, 0, 0) rotate(252deg);
  }
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

  .get-app-btn--hero:not(.get-app-btn--compact) {
    justify-content: flex-start;
    gap: 10px;
    padding: 8px 9px 8px 10px;
  }

  .get-app-btn--hero:not(.get-app-btn--compact) .get-app-btn__icons {
    height: 42px;
    gap: 7px;
    padding: 0 9px;
  }

  .get-app-btn--hero:not(.get-app-btn--compact) .get-app-btn__name {
    font-size: 17px;
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

  .get-app-btn--hero:not(.get-app-btn--compact) {
    gap: 8px;
    padding-inline: 8px;
  }

  .get-app-btn--hero:not(.get-app-btn--compact) .get-app-btn__icons {
    padding-inline: 7px;
  }

  .get-app-btn--hero .get-app-btn__download {
    width: 40px;
    height: 40px;
  }
}

/* The rail bottoms out at 132px (clamp min) on a 320px viewport, where the
   compact button measured 134px — 2px of clipping. Trim the last few pixels
   there rather than everywhere. */
@media (max-width: 380px) {
  .get-app-btn--compact {
    gap: 6px;
    padding: 7px 7px;
  }

  .get-app-btn--compact .get-app-btn__icons {
    gap: 4px;
    padding: 0 6px;
  }

  .get-app-btn--compact .get-app-btn__apple {
    width: 12px;
  }

  .get-app-btn--compact .get-app-btn__play {
    width: 13px;
  }

  .get-app-btn--compact .get-app-btn__name {
    font-size: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .get-app-btn,
  .get-app-btn::before,
  .get-app-btn::after,
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
