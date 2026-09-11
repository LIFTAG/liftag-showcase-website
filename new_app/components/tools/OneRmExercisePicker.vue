<script setup lang="ts">
import {
  FEATURED_EXERCISES,
  exerciseFor,
  searchExercises,
} from '~/utils/oneRepMaxExercises'
import { STRENGTH_COMPARISON_COUNT } from '~/utils/strengthStandards'
import type { LiftId } from '~/utils/oneRepMax'

const lift = defineModel<LiftId>({ required: true })
const draft = shallowRef('')
const open = shallowRef(false)
const activeIndex = shallowRef(0)
const root = useTemplateRef<HTMLElement>('picker-root')
const input = useTemplateRef<HTMLInputElement>('exercise-search')

const selected = computed(() => exerciseFor(lift.value))
const selectedLabel = computed(() => lift.value === 'other' ? '' : selected.value.label)
const browsing = computed(() => !draft.value.trim())
const searching = computed(() => open.value && !browsing.value)
const results = computed(() => searching.value ? searchExercises(draft.value) : [])
const displayValue = computed(() => open.value ? draft.value : selectedLabel.value)
const activeId = computed(() => results.value[activeIndex.value]?.id ?? null)
const showQuickLifts = computed(() => lift.value === 'other' && browsing.value)
const statusText = computed(() => {
  if (!searching.value) return ''
  if (!results.value.length) return `No exercises match ${draft.value.trim()}.`
  return `${results.value.length} match${results.value.length === 1 ? '' : 'es'}.`
})

watch(results, () => { activeIndex.value = 0 })

function openPicker() {
  open.value = true
  draft.value = ''
  activeIndex.value = 0
}

function closePicker() {
  open.value = false
  draft.value = ''
}

function choose(id: LiftId) {
  lift.value = id
  closePicker()
  input.value?.blur()
}

function clearSelection() {
  lift.value = 'other'
  draft.value = ''
  open.value = true
  nextTick(() => input.value?.focus())
}

function onInput(event: Event) {
  open.value = true
  draft.value = (event.target as HTMLInputElement).value
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    closePicker()
    return
  }
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    if (!open.value) openPicker()
    const count = results.value.length
    if (!count) return
    const step = event.key === 'ArrowDown' ? 1 : -1
    activeIndex.value = (activeIndex.value + step + count) % count
    document.getElementById(`orm-ex-opt-${results.value[activeIndex.value].id}`)?.scrollIntoView({ block: 'nearest' })
    return
  }
  if (event.key === 'Enter' && searching.value) {
    const current = results.value[activeIndex.value]
    if (!current) return
    event.preventDefault()
    choose(current.id)
  }
}

function onFocusOut() {
  requestAnimationFrame(() => {
    if (root.value?.contains(document.activeElement)) return
    closePicker()
  })
}

function onDocPointer(event: PointerEvent) {
  const target = event.target as Node | null
  if (target && root.value?.contains(target)) return
  closePicker()
}

onMounted(() => document.addEventListener('pointerdown', onDocPointer))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocPointer))
</script>

<template>
  <div ref="picker-root" class="exercise-picker" @focusout="onFocusOut">
    <label for="orm-exercise">Exercise <span>{{ STRENGTH_COMPARISON_COUNT }} lifts</span></label>
    <div class="picker-field" :class="{ open }">
      <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.4-3.4" />
      </svg>
      <input
        id="orm-exercise"
        ref="exercise-search"
        :value="displayValue"
        type="search"
        role="combobox"
        enterkeyhint="search"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="none"
        spellcheck="false"
        placeholder="Search bench, RDL, pulldown…"
        aria-autocomplete="list"
        :aria-expanded="searching"
        aria-controls="orm-exercise-list"
        :aria-activedescendant="searching && activeId ? `orm-ex-opt-${activeId}` : undefined"
        aria-describedby="orm-exercise-status"
        @focus="openPicker"
        @input="onInput"
        @keydown="onKeydown"
      >
      <button
        v-if="displayValue || lift !== 'other'"
        type="button"
        class="clear"
        aria-label="Clear exercise"
        @click="clearSelection"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
    <div v-if="showQuickLifts" class="quick-lifts" role="group" aria-label="Popular lifts">
      <button v-for="item in FEATURED_EXERCISES" :key="item.id" type="button" @click="choose(item.id)"><HoloPill /><span>{{ item.short }}</span></button>
    </div>
    <ul
      v-if="searching"
      id="orm-exercise-list"
      class="picker-list"
      role="listbox"
      aria-label="Matching exercises"
      @mousedown.prevent
    >
      <li
        v-for="(exercise, index) in results"
        :id="`orm-ex-opt-${exercise.id}`"
        :key="exercise.id"
        role="option"
        :aria-selected="exercise.id === activeId"
        :class="{ active: exercise.id === activeId, current: exercise.id === lift }"
        @click="choose(exercise.id)"
        @mousemove="activeIndex = index"
      >
        <strong>{{ exercise.label }}</strong>
        <span>{{ exercise.group.replace(' · estimate only', '') }}</span>
      </li>
      <li v-if="!results.length" class="empty" role="presentation">No match. Try bench, RDL, or pulldown.</li>
    </ul>
    <p v-if="lift !== 'other' && !open" class="picker-hint">{{ selected.group }}{{ selected.basis === 'dumbbell' ? ' · enter one dumbbell above' : selected.basis === 'bodyweight' ? ' · include bodyweight in the load above' : selected.basis === 'machine' ? ' · machine load as shown' : '' }}</p>
    <p id="orm-exercise-status" class="sr-only" role="status">{{ statusText }}</p>
  </div>
</template>

<style scoped>
.exercise-picker { margin-bottom: 16px; }
.exercise-picker > label { display: flex; justify-content: space-between; gap: 5px; margin-bottom: 8px; font-size: 12px; color: var(--orm-muted); }
.exercise-picker > label span { color: var(--orm-muted); font-weight: 400; }
.picker-field { display: flex; align-items: center; position: relative; border: 1px solid var(--orm-glass-line); border-radius: 9px; background: var(--orm-field-glass); -webkit-backdrop-filter: var(--orm-glass-filter); backdrop-filter: var(--orm-glass-filter); box-shadow: var(--orm-glass-shadow); }
.picker-field.open, .picker-field:focus-within { border-color: var(--orm-accent); }
.search-icon { position: absolute; left: 12px; color: var(--orm-muted); pointer-events: none; }
.picker-field:focus-within .search-icon { color: var(--orm-accent); }
.picker-field input { width: 100%; min-width: 0; height: 46px; padding: 0 40px 0 36px; border: 0; background: transparent; color: var(--orm-ink); font: inherit; font-size: 14px; color-scheme: dark; }
.picker-field input::placeholder { color: var(--orm-muted); }
.picker-field input::-webkit-search-cancel-button { appearance: none; }
.picker-field input:focus { outline: 0; }
.clear { position: absolute; right: 2px; display: grid; place-items: center; width: 44px; height: 44px; padding: 0; border: 0; border-radius: 999px; background: transparent; color: var(--orm-muted); cursor: pointer; }
.clear:hover { color: var(--orm-ink); }
.quick-lifts { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 8px; }
.quick-lifts button { position: relative; isolation: isolate; overflow: hidden; display: flex; align-items: center; justify-content: center; min-height: 40px; padding: 0 12px; border: 1px solid var(--orm-line); border-radius: 8px; background: linear-gradient(155deg, oklch(96% .007 115 / .055), oklch(96% .007 115 / .008) 60%); box-shadow: inset 0 1px 0 oklch(96% .007 115 / .05); color: var(--orm-ink); font: inherit; font-size: 12px; cursor: pointer; transition: color .18s ease-out, border-color .18s ease-out, background .18s ease-out, box-shadow .18s ease-out; }
.quick-lifts button > span { position: relative; z-index: 1; }
@media (hover: hover) and (pointer: fine) {
  .quick-lifts button:hover,
  .quick-lifts button:focus-visible,
  .quick-lifts button:has(> .holo-pill-canvas.is-holo) {
    color: var(--orm-accent);
    border-color: oklch(92% .23 120 / .32);
    box-shadow: inset 0 1px 0 oklch(96% .007 115 / .05), 0 0 12px oklch(80% .12 240 / .1), 0 0 16px oklch(92% .23 120 / .09);
  }
}
.picker-list { max-height: 228px; overflow: auto; margin: 8px 0 0; padding: 6px; border: 1px solid var(--orm-line); border-radius: 10px; background: var(--orm-input); list-style: none; overscroll-behavior: contain; }
.picker-list > li { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; width: 100%; min-height: 44px; padding: 8px 10px; border-radius: 8px; cursor: pointer; }
.picker-list > li.active, .picker-list > li[aria-selected="true"] { background: var(--orm-accent-soft); }
.picker-list > li.current strong { color: var(--orm-accent); }
.picker-list strong { font-size: 13px; font-weight: 500; }
.picker-list span { flex-shrink: 0; font-size: 10px; color: var(--orm-muted); }
.picker-list .empty { cursor: default; color: var(--orm-muted); font-size: 12px; }
.picker-hint { margin: 8px 0 0; font-size: 11px; color: var(--orm-muted); line-height: 1.5; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
.clear:focus-visible, .quick-lifts button:focus-visible { outline: 2px solid var(--orm-accent); outline-offset: 3px; }
@media (max-width: 700px) {
  .picker-field input { font-size: 16px; height: 48px; }
  .quick-lifts button { min-height: 40px; }
}
@media (prefers-reduced-motion: reduce) { .picker-field, .search-icon, .clear, .quick-lifts button { transition: none; } }
</style>
