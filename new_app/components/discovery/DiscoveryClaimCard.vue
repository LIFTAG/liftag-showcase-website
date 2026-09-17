<script setup lang="ts">
import type { DiscoveryLocale } from '~/types/discovery'
import { discoveryCopy } from '~/utils/discoveryCopy'
/**
 * Gym-owner door: a compact bar pinned under the gym list on wide screens,
 * and the last card of the swipe row on phones. One link; the button is visual.
 */
const props = defineProps<{ locale: DiscoveryLocale }>()
const copy = computed(() => discoveryCopy(props.locale))
const { href } = useSiteLocale()
const live = shallowRef(false)
</script>
<template>
  <NuxtLink
    :to="href('/contact/partner')"
    class="d-claim-card"
    :aria-label="copy.claimLabel"
    @pointerenter="live = true"
    @pointerleave="live = false"
    @focus="live = true"
    @blur="live = false"
  >
    <span class="d-claim-slot">
      <DiscoveryGhostPin class="d-claim-pin" :live="live" />
    </span>
    <span class="d-claim-info">
      <span class="d-claim-title">{{ copy.claimTitle }}</span>
      <span class="d-claim-hint">{{ copy.claimHint }}</span>
    </span>
    <span class="d-claim-cta" aria-hidden="true">
      {{ copy.claimCta }}
      <DiscoveryIcon name="arrow" :size="14" />
    </span>
  </NuxtLink>
</template>
<style scoped>
.d-claim-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  width: 100%;
  min-width: 0;
  padding: 10px;
  color: var(--d-text) !important;
  border-radius: 16px;
  /* Opaque: on phones the bar floats over the map. The border fades from lime into neutral. */
  border: 1px solid transparent;
  background:
    radial-gradient(60% 140% at 0% 50%, rgb(204 255 0 / 0.09), transparent 70%) padding-box,
    linear-gradient(#151515, #151515) padding-box,
    linear-gradient(105deg, rgb(204 255 0 / 0.6), rgb(204 255 0 / 0.12) 38%, rgb(255 255 255 / 0.08) 70%)
      border-box;
  box-shadow: 0 10px 30px -14px rgb(0 0 0 / 0.8);
  overflow: hidden;
  isolation: isolate;
  transition: box-shadow 260ms;
}
/* A single light sweep on hover: the sheen of a pin being placed. */
.d-claim-card::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(100deg, transparent 30%, rgb(204 255 0 / 0.1) 50%, transparent 70%);
  transform: translateX(-100%);
  pointer-events: none;
}
.d-claim-slot {
  position: relative;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  background-color: rgb(204 255 0 / 0.06);
  background-image:
    linear-gradient(rgb(204 255 0 / 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgb(204 255 0 / 0.08) 1px, transparent 1px);
  background-size: 9px 9px;
  background-position: -1px -1px;
  box-shadow: inset 0 0 0 1px rgb(204 255 0 / 0.16);
}
.d-claim-pin {
  width: 32px;
  height: 35px;
  margin-top: 4px;
}
.d-claim-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}
.d-claim-title {
  font: 600 0.875rem/1.25 var(--liftag-font-headline);
  letter-spacing: -0.01em;
}
.d-claim-hint {
  font-size: 0.75rem;
  line-height: 1.35;
  color: var(--d-muted);
  text-wrap: balance;
}
.d-claim-cta {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  height: 36px;
  padding: 0 12px 0 14px;
  border-radius: 10px;
  background: var(--d-accent);
  color: #131600;
  font-size: 0.8125rem;
  font-weight: 700;
  white-space: nowrap;
  transition:
    background 180ms,
    box-shadow 240ms;
}
.d-claim-cta svg {
  stroke-width: 2.4;
  transition: transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.d-claim-card:hover,
.d-claim-card:focus-visible {
  box-shadow:
    0 10px 30px -14px rgb(0 0 0 / 0.8),
    0 0 0 1px rgb(204 255 0 / 0.25);
}
.d-claim-card:hover::after,
.d-claim-card:focus-visible::after {
  transform: translateX(100%);
  transition: transform 900ms cubic-bezier(0.3, 0.6, 0.2, 1);
}
.d-claim-card:hover .d-claim-cta,
.d-claim-card:focus-visible .d-claim-cta {
  background: #ddff55;
  box-shadow: 0 0 18px -2px rgb(204 255 0 / 0.55);
}
.d-claim-card:hover .d-claim-cta svg,
.d-claim-card:focus-visible .d-claim-cta svg {
  transform: translateX(3px);
}
@media (prefers-reduced-motion: reduce) {
  .d-claim-card::after {
    display: none;
  }
  .d-claim-cta svg {
    transition: none;
  }
  .d-claim-card:hover .d-claim-cta svg {
    transform: none;
  }
}
</style>
