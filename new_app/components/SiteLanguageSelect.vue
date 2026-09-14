<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { SiteLocale } from '~/types/locale'

import { SITE_LANGUAGES } from '~/utils/siteLocale'

const emit = defineEmits<{ select: [] }>()
const { locale, setLocale, switching } = useSiteLocale()
const route = useRoute()
const menuId = useId()
const trigger = useTemplateRef<HTMLButtonElement>('trigger')
const menu = useTemplateRef<HTMLDivElement>('menu')
const open = ref(false)
const focusedIndex = ref(0)
const placement = ref<CSSProperties>({})
const { t } = useI18n({ useScope: 'global' })
const label = computed(() => t('common.language'))
const currentLanguage = computed(() => SITE_LANGUAGES.find(language => language.locale === locale.value)!)

function positionMenu() {
  if (!trigger.value) return
  const anchor = trigger.value.getBoundingClientRect()
  const viewport = window.visualViewport
  const leftEdge = (viewport?.offsetLeft ?? 0) + 12
  const rightEdge = leftEdge + (viewport?.width ?? document.documentElement.clientWidth) - 24
  const width = Math.min(224, rightEdge - leftEdge)
  const top = anchor.bottom + 6
  placement.value = {
    width: `${width}px`,
    left: `${Math.max(leftEdge, Math.min(anchor.right - width, rightEdge - width))}px`,
    top: `${top}px`,
    maxHeight: `${Math.max(0, (viewport?.offsetTop ?? 0) + (viewport?.height ?? window.innerHeight) - top - 12)}px`,
  }
}

function focusOption(index: number) {
  focusedIndex.value = index
  menu.value?.querySelectorAll<HTMLButtonElement>('[role="option"]')[index]?.focus({ preventScroll: true })
}

function beforeToggle(event: ToggleEvent) {
  if (event.newState === 'open') {
    search = ''
    positionMenu()
  }
}

async function onToggle(event: ToggleEvent) {
  open.value = event.newState === 'open'
  if (open.value) {
    await nextTick()
    focusOption(SITE_LANGUAGES.findIndex(language => language.locale === locale.value))
  }
}

function closeMenu() {
  if (menu.value?.matches(':popover-open')) menu.value.hidePopover()
}

function openWithKeyboard(event: KeyboardEvent) {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
  event.preventDefault()
  if (!open.value) trigger.value?.click()
}

let search = ''
let lastKeyTime = 0
function navigateOptions(event: KeyboardEvent) {
  const last = SITE_LANGUAGES.length - 1
  let next: number | undefined
  if (event.key === 'ArrowDown') next = (focusedIndex.value + 1) % SITE_LANGUAGES.length
  else if (event.key === 'ArrowUp') next = (focusedIndex.value + last) % SITE_LANGUAGES.length
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = last
  else if (event.key === 'Tab') closeMenu()
  else if (event.key.length === 1 && event.key !== ' ' && !event.altKey && !event.ctrlKey && !event.metaKey) {
    const key = event.key.toLocaleLowerCase()
    search = Date.now() - lastKeyTime < 500 && search !== key ? search + key : key
    lastKeyTime = Date.now()
    for (let offset = 1; offset <= SITE_LANGUAGES.length; offset++) {
      const index = (focusedIndex.value + offset) % SITE_LANGUAGES.length
      if (SITE_LANGUAGES[index]!.label.toLocaleLowerCase().startsWith(search)) {
        next = index
        break
      }
    }
  }
  if (next !== undefined) {
    event.preventDefault()
    focusOption(next)
  }
}

async function selectLanguage(language: SiteLocale) {
  closeMenu()
  trigger.value?.focus({ preventScroll: true })
  emit('select')
  await setLocale(language)
}

watch(() => route.path, closeMenu)
watch(open, (visible, _, cleanup) => {
  if (!visible) return
  const viewport = window.visualViewport
  window.addEventListener('resize', positionMenu)
  viewport?.addEventListener('resize', positionMenu)
  viewport?.addEventListener('scroll', positionMenu)
  cleanup(() => {
    window.removeEventListener('resize', positionMenu)
    viewport?.removeEventListener('resize', positionMenu)
    viewport?.removeEventListener('scroll', positionMenu)
  })
})
</script>

<template>
  <div class="site-language">
    <button
      ref="trigger"
      type="button"
      class="site-language-trigger"
      :disabled="switching"
      :aria-label="`${label}: ${currentLanguage.label}`"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="menuId"
      :popovertarget="menuId"
      @keydown="openWithKeyboard"
    >
      <svg class="site-language-globe" viewBox="0 0 20 20" fill="none" width="16" height="16" aria-hidden="true">
        <circle cx="10" cy="10" r="7.5" />
        <ellipse cx="10" cy="10" rx="3.2" ry="7.5" />
        <path d="M2.5 10h15" />
      </svg>
      <span>{{ locale.toUpperCase() }}</span>
      <svg class="site-language-chevron" viewBox="0 0 16 16" fill="none" width="12" height="12" aria-hidden="true">
        <path d="m4 6 4 4 4-4" />
      </svg>
    </button>
    <Teleport to="body">
      <div
        :id="menuId"
        ref="menu"
        popover="auto"
        role="listbox"
        :aria-label="label"
        class="site-language-menu"
        :style="placement"
        @beforetoggle="beforeToggle"
        @toggle="onToggle"
        @keydown="navigateOptions"
      >
        <p class="site-language-heading" aria-hidden="true">{{ label }}</p>
        <div role="presentation">
          <button
            v-for="(language, index) in SITE_LANGUAGES"
            :key="language.locale"
            type="button"
            role="option"
            class="site-language-option"
            :lang="language.locale"
            :aria-label="language.label"
            :aria-selected="language.locale === locale"
            :tabindex="index === focusedIndex ? 0 : -1"
            @focus="focusedIndex = index"
            @click="selectLanguage(language.locale)"
          >
            <span class="site-language-code" aria-hidden="true">{{ language.locale.toUpperCase() }}</span>
            <span class="site-language-name">{{ language.label }}</span>
            <svg v-if="language.locale === locale" class="site-language-check" viewBox="0 0 16 16" fill="none" width="16" height="16" aria-hidden="true">
              <path d="m3 8 3 3 7-7" />
            </svg>
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.site-language {
  flex: 0 0 88px;
  width: 88px;
  height: 44px;
}
.site-language-trigger {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  height: 100%;
  padding: 0 10px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--liftag-fg);
  font-family: var(--liftag-font-body);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: .04em;
  cursor: pointer;
}
.site-language-trigger::before {
  content: '';
  position: absolute;
  inset: 4px 0;
  border: 1px solid var(--liftag-border);
  border-radius: inherit;
  transition: border-color 160ms ease-out, background-color 160ms ease-out;
  pointer-events: none;
}
.site-language-trigger > * {
  position: relative;
}
.site-language-globe,
.site-language-chevron {
  flex-shrink: 0;
  color: var(--liftag-fg-muted);
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.site-language-chevron {
  transition: transform 160ms ease-out;
}
.site-language-trigger[aria-expanded='true']::before {
  border-color: var(--liftag-fg-muted);
  background: var(--liftag-secondary);
}
.site-language-trigger[aria-expanded='true'] .site-language-chevron {
  transform: rotate(180deg);
}
.site-language-menu {
  position: fixed;
  inset: auto;
  box-sizing: border-box;
  margin: 0;
  padding: 8px;
  overflow: auto;
  overscroll-behavior: contain;
  border: 1px solid var(--liftag-border);
  border-radius: 16px;
  background: var(--liftag-surface-dark);
  color: var(--liftag-fg);
  box-shadow: 0 16px 48px rgb(0 0 0 / .35);
}
.site-language-menu:popover-open {
  animation: language-menu-in 160ms cubic-bezier(.16, 1, .3, 1);
}
.site-language-heading {
  margin: 0;
  padding: 8px 10px 10px;
  color: var(--liftag-fg-muted);
  font: 600 10px/1.4 var(--liftag-font-body);
  letter-spacing: .12em;
  text-transform: uppercase;
}
.site-language-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 52px;
  padding: 10px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--liftag-fg);
  font: 500 14px/1.4 var(--liftag-font-body);
  text-align: left;
  cursor: pointer;
}
.site-language-code {
  display: grid;
  flex: 0 0 32px;
  place-items: center;
  height: 32px;
  border-radius: 7px;
  background: var(--liftag-secondary);
  color: var(--liftag-fg-muted);
  font: 600 11px/1 var(--liftag-font-body);
  letter-spacing: .04em;
}
.site-language-name {
  flex: 1;
  min-width: 0;
}
.site-language-option[aria-selected='true'] {
  background: color-mix(in srgb, var(--liftag-primary) 7%, transparent);
}
.site-language-option[aria-selected='true'] .site-language-code {
  background: color-mix(in srgb, var(--liftag-primary) 10%, transparent);
  color: var(--liftag-primary);
}
.site-language-check {
  flex-shrink: 0;
  color: var(--liftag-primary);
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}
@media (hover: hover) {
  .site-language-trigger:hover::before {
    border-color: var(--liftag-fg-muted);
    background: var(--liftag-secondary);
  }
  .site-language-option:hover {
    background: var(--liftag-secondary);
  }
}
.site-language-trigger:focus-visible {
  outline: 2px solid var(--liftag-primary);
  outline-offset: 1px;
}
.site-language-option:focus-visible {
  outline: 1px solid var(--liftag-fg-muted);
  outline-offset: -1px;
}
@keyframes language-menu-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .site-language-trigger::before,
  .site-language-chevron { transition: none; }
  .site-language-menu:popover-open { animation: none; }
}
</style>
