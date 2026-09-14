<script setup lang="ts">
const model = defineModel<string>({ required: true })
defineProps<{ placeholder: string; clearLabel: string; label?: string }>()
const input = useTemplateRef<HTMLInputElement>('input')
function clear() {
  model.value = ''
  input.value?.focus()
}
defineExpose({ focus: () => input.value?.focus() })
</script>
<template>
  <div class="d-search">
    <DiscoveryIcon name="search" />
    <input
      ref="input"
      v-model="model"
      type="search"
      :aria-label="label ?? placeholder"
      :placeholder="placeholder"
      maxlength="200"
      autocomplete="off"
    />
    <button v-if="model" class="d-icon-button" :aria-label="clearLabel" @click="clear">
      <DiscoveryIcon name="close" :size="18" />
    </button>
    <slot />
  </div>
</template>
<style scoped>
.d-search {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 52px;
  padding: 4px 8px 4px 16px;
  border: 1px solid var(--d-border);
  border-radius: 14px;
  background: var(--d-panel);
}
.d-search > svg {
  color: var(--d-muted);
  flex-shrink: 0;
}
.d-search input {
  color: var(--d-text);
  border: 0;
  background: transparent;
  min-width: 0;
  width: 100%;
  height: 44px;
  outline: none;
  font-size: 1rem;
}
.d-search input::placeholder {
  color: var(--d-muted);
}
.d-search:focus-within {
  border-color: #879655;
}
.d-search input::-webkit-search-cancel-button {
  display: none;
}
</style>
