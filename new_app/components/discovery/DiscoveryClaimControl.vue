<script setup lang="ts">
import type { DiscoveryLocale } from '~/types/discovery'
import { discoveryCopy } from '~/utils/discoveryCopy'
/**
 * Phone counterpart of the pinned gym-owner bar: a map control stacked above
 * Locate me, like a maps app's "add a missing place". Its label slides out
 * once per session, then it rests as an icon.
 */
const props = defineProps<{ locale: DiscoveryLocale }>()
const copy = computed(() => discoveryCopy(props.locale))
const { href } = useSiteLocale()
const HINT_KEY = 'liftag-explore-owner-hint'
const expanded = shallowRef(false)
const live = shallowRef(false)
let timers: ReturnType<typeof setTimeout>[] = []
onMounted(() => {
  if (!window.matchMedia('(max-width: 1023px)').matches) return
  try {
    if (sessionStorage.getItem(HINT_KEY)) return
    sessionStorage.setItem(HINT_KEY, '1')
  } catch {}
  timers = [
    setTimeout(() => {
      expanded.value = true
      live.value = true
    }, 1400),
    setTimeout(() => {
      expanded.value = false
      live.value = false
    }, 6200),
  ]
})
onBeforeUnmount(() => timers.forEach(clearTimeout))
</script>
<template>
  <NuxtLink
    :to="href('/contact/partner')"
    class="d-claim-control"
    :class="{ 'is-expanded': expanded }"
    :aria-label="copy.claimLabel"
  >
    <span class="d-claim-control-label" aria-hidden="true">
      <span class="d-claim-control-title">{{ copy.claimTitle }}</span>
      <span class="d-claim-control-cta">{{ copy.claimCta }}</span>
    </span>
    <span class="d-claim-control-icon">
      <DiscoveryGhostPin class="d-claim-control-pin" :live="live" />
    </span>
  </NuxtLink>
</template>
<style scoped>
.d-claim-control {
  position: absolute;
  right: 16px;
  z-index: 1;
  display: flex;
  align-items: center;
  height: 52px;
  padding: 0;
  border-radius: 26px;
  color: var(--d-text) !important;
  border: 1px solid transparent;
  background:
    linear-gradient(var(--d-panel), var(--d-panel)) padding-box,
    linear-gradient(135deg, rgb(204 255 0 / 0.55), rgb(204 255 0 / 0.1) 60%, var(--d-border)) border-box;
  box-shadow: 0 4px 16px #0004;
  transition: box-shadow 240ms;
}
.d-claim-control:active {
  box-shadow:
    0 4px 16px #0004,
    0 0 0 4px rgb(204 255 0 / 0.14);
}
.d-claim-control-icon {
  display: grid;
  place-items: center;
  width: 50px;
  height: 50px;
  flex-shrink: 0;
}
.d-claim-control-pin {
  width: 28px;
  height: 31px;
  margin-top: 4px;
}
/* The label unrolls leftwards from the icon; the control stays anchored right. */
.d-claim-control-label {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 0;
  overflow: hidden;
  white-space: nowrap;
  opacity: 0;
  transition:
    max-width 520ms cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 280ms ease,
    padding 520ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.is-expanded .d-claim-control-label {
  max-width: 260px;
  padding-left: 18px;
  opacity: 1;
  transition:
    max-width 620ms cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 380ms ease 120ms,
    padding 620ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.d-claim-control-title {
  font: 600 0.875rem/1 var(--liftag-font-headline);
}
.d-claim-control-cta {
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--d-accent);
  color: #131600;
  font-size: 0.75rem;
  font-weight: 700;
}
@media (min-width: 1024px) {
  .d-claim-control {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .d-claim-control-label,
  .is-expanded .d-claim-control-label {
    transition: opacity 160ms ease;
  }
}
</style>
