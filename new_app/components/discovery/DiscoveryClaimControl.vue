<script setup lang="ts">
import type { DiscoveryLocale } from '~/types/discovery'
import { discoveryCopy } from '~/utils/discoveryCopy'
/**
 * Phone counterpart of the pinned gym-owner bar: a map control stacked above
 * Locate me. A tap never navigates; it unrolls a panel out of the control that
 * explains the offer, and only the panel's button opens the partner form.
 * The collapsed label slides out once per session as a hint.
 */
const props = defineProps<{ locale: DiscoveryLocale }>()
const copy = computed(() => discoveryCopy(props.locale))
const { href } = useSiteLocale()
const panelId = useId()
const root = useTemplateRef<HTMLElement>('root')
const panel = useTemplateRef<HTMLElement>('panel')
const toggleButton = useTemplateRef<HTMLButtonElement>('toggleButton')
const open = shallowRef(false)
const hint = shallowRef(false)
const perks = computed(() => [
  { icon: 'pin', text: copy.value.claimPerkMap },
  { icon: 'gym', text: copy.value.claimPerkQr },
  { icon: 'check', text: copy.value.claimPerkFree },
])

const HINT_KEY = 'liftag-explore-owner-hint'
let timers: ReturnType<typeof setTimeout>[] = []
const clearTimers = () => {
  timers.forEach(clearTimeout)
  timers = []
}
onMounted(() => {
  if (!window.matchMedia('(max-width: 1023px)').matches) return
  try {
    if (sessionStorage.getItem(HINT_KEY)) return
    sessionStorage.setItem(HINT_KEY, '1')
  } catch {}
  timers = [
    setTimeout(() => (hint.value = true), 1400),
    setTimeout(() => (hint.value = false), 6200),
  ]
})

function onOutside(event: PointerEvent) {
  if (!root.value?.contains(event.target as Node)) setOpen(false)
}
function onKey(event: KeyboardEvent) {
  if (event.key !== 'Escape') return
  setOpen(false)
  toggleButton.value?.focus()
}
function setOpen(value: boolean) {
  if (open.value === value) return
  open.value = value
  clearTimers()
  hint.value = false
  if (value) {
    document.addEventListener('pointerdown', onOutside, true)
    document.addEventListener('keydown', onKey)
    void nextTick(() => panel.value?.focus({ preventScroll: true }))
  } else {
    document.removeEventListener('pointerdown', onOutside, true)
    document.removeEventListener('keydown', onKey)
  }
}
onBeforeUnmount(() => {
  clearTimers()
  setOpen(false)
})
</script>
<template>
  <div ref="root" class="d-claim-control" :class="{ 'is-open': open, 'is-hinting': hint }">
    <section
      :id="panelId"
      ref="panel"
      class="d-owner-panel"
      :aria-label="copy.claimEyebrow"
      :aria-hidden="!open"
      :inert="!open"
      tabindex="-1"
    >
      <div class="d-owner-body">
        <div class="d-owner-head d-owner-reveal">
          <span class="d-owner-slot"><DiscoveryGhostPin class="d-owner-pin" :live="open" /></span>
          <span>
            <span class="d-owner-eyebrow">{{ copy.claimEyebrow }}</span>
            <span class="d-owner-title">{{ copy.claimPanelTitle }}</span>
          </span>
        </div>
        <ul class="d-owner-perks">
          <li v-for="perk in perks" :key="perk.icon" class="d-owner-reveal">
            <span class="d-owner-perk-icon"><DiscoveryIcon :name="perk.icon" :size="15" /></span>
            {{ perk.text }}
          </li>
        </ul>
      </div>
      <div class="d-owner-footer">
        <NuxtLink :to="href('/contact/partner')" class="d-owner-cta d-owner-reveal">
          {{ copy.claimPanelCta }}
          <DiscoveryIcon name="arrow" :size="15" />
        </NuxtLink>
      </div>
    </section>
    <button
      ref="toggleButton"
      type="button"
      class="d-owner-toggle"
      :aria-label="open ? copy.close : copy.claimToggle"
      :aria-expanded="open"
      :aria-controls="panelId"
      @click="setOpen(!open)"
    >
      <span class="d-owner-hint" aria-hidden="true">
        <span class="d-owner-hint-title">{{ copy.claimTitle }}</span>
        <span class="d-owner-hint-more">{{ copy.claimCta }}</span>
      </span>
      <span class="d-owner-icon" aria-hidden="true">
        <DiscoveryGhostPin class="d-owner-toggle-pin" :live="hint" />
        <DiscoveryIcon class="d-owner-close" name="close" :size="20" />
      </span>
    </button>
  </div>
</template>
<style scoped>
.d-claim-control {
  --owner-size: 52px;
  --owner-ease: cubic-bezier(0.2, 0.8, 0.2, 1);
  position: absolute;
  right: 16px;
  z-index: 3;
  width: var(--owner-size);
  height: var(--owner-size);
}

/* Panel: grows out of the control as a circle centred on it, so the button
   visibly becomes the panel's corner. */
.d-owner-panel {
  --owner-origin: calc(100% - var(--owner-size) / 2) calc(100% - var(--owner-size) / 2);
  position: absolute;
  right: 0;
  bottom: 0;
  width: min(calc(100vw - 32px), 348px);
  border-radius: 26px;
  border: 1px solid transparent;
  background:
    radial-gradient(90% 60% at 100% 100%, rgb(204 255 0 / 0.1), transparent 70%) padding-box,
    linear-gradient(#161616, #161616) padding-box,
    linear-gradient(315deg, rgb(204 255 0 / 0.6), rgb(204 255 0 / 0.1) 45%, rgb(255 255 255 / 0.1)) border-box;
  box-shadow: 0 24px 60px -16px rgb(0 0 0 / 0.85);
  outline: none;
  clip-path: circle(calc(var(--owner-size) / 2) at var(--owner-origin));
  visibility: hidden;
  transition:
    clip-path 420ms cubic-bezier(0.4, 0, 0.2, 1),
    visibility 0s linear 420ms;
}
.is-open .d-owner-panel {
  clip-path: circle(150% at var(--owner-origin));
  visibility: visible;
  transition:
    clip-path 760ms cubic-bezier(0.55, 0, 0.2, 1),
    visibility 0s;
}
.d-owner-body {
  padding: 18px 18px 14px;
}
.d-owner-head {
  display: flex;
  align-items: center;
  gap: 12px;
}
.d-owner-slot {
  flex-shrink: 0;
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background-color: rgb(204 255 0 / 0.06);
  background-image:
    linear-gradient(rgb(204 255 0 / 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgb(204 255 0 / 0.08) 1px, transparent 1px);
  background-size: 9px 9px;
  background-position: -1px -1px;
  box-shadow: inset 0 0 0 1px rgb(204 255 0 / 0.16);
}
.d-owner-pin {
  width: 32px;
  height: 35px;
  margin-top: 4px;
}
.d-owner-eyebrow {
  display: block;
  margin-bottom: 5px;
  font: 500 0.625rem/1 var(--liftag-font-mono);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--d-accent);
}
.d-owner-title {
  display: block;
  font: 700 1.0625rem/1.2 var(--liftag-font-headline);
  letter-spacing: -0.02em;
}
.d-owner-perks {
  display: grid;
  gap: 10px;
  margin: 16px 0 0;
  padding: 14px 0 0;
  list-style: none;
  border-top: 1px solid rgb(255 255 255 / 0.07);
}
.d-owner-perks li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.8125rem;
  line-height: 1.4;
  color: #d4d4d0;
  text-wrap: pretty;
}
.d-owner-perk-icon {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  margin-top: -2px;
  border-radius: 7px;
  color: var(--d-accent);
  background: rgb(204 255 0 / 0.08);
}
/* The footer strip is the collapsed control stretched leftwards: the toggle
   keeps its corner and the call to action fills the rest. */
.d-owner-footer {
  display: flex;
  align-items: center;
  height: calc(var(--owner-size) - 2px);
  padding: 0 calc(var(--owner-size) - 2px) 0 5px;
}
.d-owner-cta {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 40px;
  border-radius: 20px;
  background: var(--d-accent);
  color: #131600 !important;
  font-size: 0.875rem;
  font-weight: 700;
}
.d-owner-cta:active {
  background: #ddff55;
}
.d-owner-cta svg {
  stroke-width: 2.4;
}
/* Content follows the unrolling edge: header first, then perks, then the button. */
.d-owner-reveal {
  opacity: 0;
  transform: translateY(8px);
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}
.is-open .d-owner-reveal {
  opacity: 1;
  transform: none;
  transition:
    opacity 360ms ease,
    transform 480ms var(--owner-ease);
}
.is-open .d-owner-head {
  transition-delay: 170ms;
}
.is-open .d-owner-perks li:nth-child(1) {
  transition-delay: 240ms;
}
.is-open .d-owner-perks li:nth-child(2) {
  transition-delay: 300ms;
}
.is-open .d-owner-perks li:nth-child(3) {
  transition-delay: 360ms;
}
.is-open .d-owner-cta {
  transition-delay: 420ms;
}

.d-owner-toggle {
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  height: var(--owner-size);
  padding: 0;
  color: var(--d-text);
  border-radius: calc(var(--owner-size) / 2);
  border: 1px solid transparent;
  background:
    linear-gradient(var(--d-panel), var(--d-panel)) padding-box,
    linear-gradient(135deg, rgb(204 255 0 / 0.55), rgb(204 255 0 / 0.1) 60%, var(--d-border)) border-box;
  box-shadow: 0 4px 16px #0004;
  transition:
    background 300ms,
    box-shadow 300ms;
}
.is-open .d-owner-toggle {
  background: transparent;
  box-shadow: none;
}
.d-owner-icon {
  position: relative;
  display: grid;
  place-items: center;
  width: calc(var(--owner-size) - 2px);
  height: calc(var(--owner-size) - 2px);
  flex-shrink: 0;
}
.d-owner-icon > * {
  grid-area: 1 / 1;
  transition:
    opacity 260ms ease,
    transform 420ms var(--owner-ease);
}
.d-owner-toggle-pin {
  width: 28px;
  height: 31px;
  margin-top: 4px;
}
.d-owner-close {
  opacity: 0;
  transform: rotate(-90deg) scale(0.6);
}
.is-open .d-owner-toggle-pin {
  opacity: 0;
  transform: rotate(90deg) scale(0.6);
}
.is-open .d-owner-close {
  opacity: 1;
  transform: none;
}
/* The once-per-session hint unrolls leftwards from the icon. */
.d-owner-hint {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 0;
  overflow: hidden;
  white-space: nowrap;
  opacity: 0;
  transition:
    max-width 520ms var(--owner-ease),
    opacity 280ms ease,
    padding 520ms var(--owner-ease);
}
.is-hinting .d-owner-hint {
  max-width: 260px;
  padding-left: 18px;
  opacity: 1;
  transition:
    max-width 620ms var(--owner-ease),
    opacity 380ms ease 120ms,
    padding 620ms var(--owner-ease);
}
.d-owner-hint-title {
  font: 600 0.875rem/1 var(--liftag-font-headline);
}
.d-owner-hint-more {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgb(204 255 0 / 0.12);
  color: var(--d-accent);
  font-size: 0.75rem;
  font-weight: 700;
}
@media (min-width: 1024px) {
  .d-claim-control {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .d-owner-panel,
  .is-open .d-owner-panel {
    clip-path: none;
    opacity: 0;
    transition:
      opacity 160ms ease,
      visibility 0s linear 160ms;
  }
  .is-open .d-owner-panel {
    opacity: 1;
    transition: opacity 160ms ease;
  }
  .d-owner-reveal,
  .is-open .d-owner-reveal {
    transform: none;
    transition: opacity 160ms ease;
    transition-delay: 0s !important;
  }
  .d-owner-icon > *,
  .d-owner-close,
  .is-open .d-owner-toggle-pin {
    transform: none;
  }
  .d-owner-hint,
  .is-hinting .d-owner-hint {
    transition: opacity 160ms ease;
  }
}
</style>
