<script setup lang="ts">
defineProps<{
  label: string
  count: number
  leading?: boolean
}>()
</script>

<template>
  <div class="cat-split" :class="{ 'is-leading': leading }" role="presentation">
    <h2 class="protocol cat-split__label">{{ label }}</h2>
    <span class="cat-split__count">{{ count }}</span>
  </div>
</template>

<style scoped>
.cat-split {
  display: flex;
  grid-column: 1 / -1;
  gap: 16px;
  align-items: baseline;
  justify-content: space-between;
  margin: 8px 0 2px;
  padding: 18px 2px 6px;
  border-top: 1px solid rgba(204, 255, 0, 0.22);
}

.cat-split.is-leading {
  margin-top: 0;
  padding-top: 4px;
  border-top: 0;
}

.cat-split__label {
  margin: 0;
  color: var(--liftag-fg-tertiary);
  font-size: 10px;
  letter-spacing: 0.22em;
}

.cat-split__count {
  color: rgba(204, 255, 0, 0.58);
  font-family: var(--liftag-font-mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.14em;
}
</style>
