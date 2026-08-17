<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  placeholder: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const inputRef = ref<HTMLInputElement | null>(null)

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}

function clear() {
  emit('update:modelValue', '')
  inputRef.value?.focus()
}

// "/" jumps to search from anywhere on the page, like the app's picker.
function onKeydown(event: KeyboardEvent) {
  if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
  const target = event.target as HTMLElement | null
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return
  event.preventDefault()
  inputRef.value?.focus()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="cat-search" :class="{ 'has-value': props.modelValue.length > 0 }">
    <svg class="cat-search__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.4-3.4" />
    </svg>
    <input
      ref="inputRef"
      :value="props.modelValue"
      type="search"
      class="cat-search__input"
      :placeholder="props.placeholder"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="none"
      spellcheck="false"
      aria-label="Search exercises"
      @input="onInput"
    >
    <button
      v-if="props.modelValue.length > 0"
      type="button"
      class="cat-search__clear"
      aria-label="Clear search"
      @click="clear"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>
    <kbd v-else class="cat-search__kbd" aria-hidden="true">/</kbd>
  </div>
</template>

<style scoped>
.cat-search {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 560px;
  border: 1px solid var(--liftag-border);
  border-radius: var(--liftag-r-pill);
  background: rgba(14, 14, 14, 0.86);
  transition: border-color 200ms ease, box-shadow 200ms ease;
}

.cat-search:focus-within {
  border-color: rgba(204, 255, 0, 0.55);
  box-shadow: 0 0 0 1px rgba(204, 255, 0, 0.2), 0 0 28px rgba(204, 255, 0, 0.08);
}

.cat-search__icon {
  flex: 0 0 auto;
  margin-left: 18px;
  color: var(--liftag-fg-tertiary);
}

.cat-search:focus-within .cat-search__icon {
  color: var(--liftag-primary);
}

.cat-search__input {
  flex: 1 1 auto;
  min-width: 0;
  padding: 15px 14px;
  border: none;
  background: transparent;
  color: #fff;
  font-family: var(--liftag-font-body);
  font-size: 16px;
  caret-color: var(--liftag-primary);
}

.cat-search__input:focus {
  outline: none;
}

.cat-search__input::placeholder {
  color: var(--liftag-fg-dim);
}

.cat-search__input::-webkit-search-cancel-button {
  display: none;
}

.cat-search__kbd {
  flex: 0 0 auto;
  margin-right: 16px;
  padding: 3px 9px;
  border: 1px solid var(--liftag-border);
  border-radius: 6px;
  color: var(--liftag-fg-dim);
  font-family: var(--liftag-font-mono);
  font-size: 11px;
}

.cat-search__clear {
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  margin-right: 12px;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: var(--liftag-surface-card);
  color: var(--liftag-fg-mid);
  cursor: pointer;
}

.cat-search__clear:hover {
  color: #fff;
}

@media (max-width: 720px) {
  .cat-search__kbd {
    display: none;
  }
}
</style>
