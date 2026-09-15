<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

defineOptions({ inheritAttrs: false })
defineProps<{ to?: RouteLocationRaw; active?: boolean; plain?: boolean }>()
</script>

<template>
  <NuxtLink v-if="to" v-bind="$attrs" :to="to" class="pill-chip" :class="{ 'is-active': active }">
    <slot />
  </NuxtLink>
  <span v-else-if="plain" v-bind="$attrs" class="pill-chip pill-chip--plain" :class="{ 'is-active': active }">
    <slot />
  </span>
  <button
    v-else
    v-bind="$attrs"
    type="button"
    class="pill-chip"
    :class="{ 'is-active': active }"
    :aria-pressed="active"
  >
    <slot />
  </button>
</template>

<style scoped>
.pill-chip {
  display: inline-flex;
  flex: 0 0 auto;
  gap: 6px;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 9px 16px;
  border: 1px solid var(--liftag-border);
  border-radius: 999px;
  background: transparent;
  color: var(--liftag-fg-muted);
  font-family: var(--liftag-font-mono);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-decoration: none;
  text-transform: uppercase;
  white-space: nowrap;
  cursor: pointer;
  transition: border-color 200ms ease, color 200ms ease, background-color 200ms ease;
}

.pill-chip--plain {
  cursor: default;
}

/* Touch browsers hold :hover after a tap, which would strand the highlight.
   Active, plain and disabled pills keep their own look under the pointer. */
@media (hover: hover) {
  .pill-chip:not(.is-active, .pill-chip--plain, :disabled):hover {
    border-color: rgba(255, 255, 255, 0.32);
    color: #fff;
  }
}

.pill-chip.is-active {
  border-color: rgba(204, 255, 0, 0.55);
  background: var(--liftag-primary-dim);
  color: var(--liftag-primary);
}

button.pill-chip {
  min-height: 44px;
}

@media (max-width: 768px) {
  .pill-chip {
    min-height: 32px;
    padding: 7px 12px;
    font-size: 10px;
    letter-spacing: 0.04em;
  }
}
</style>
