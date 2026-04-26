<script setup lang="ts">
withDefaults(defineProps<{
  color?: string
}>(), {
  color: '#CCFF00',
})
</script>

<template>
  <div
    class="protocol reveal"
    :style="{ color, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }"
  >
    <span
      :style="{
        display: 'inline-block',
        width: '24px',
        height: '1px',
        background: color,
        boxShadow: `0 0 8px ${color}`,
      }"
    />
    <slot />
  </div>
</template>
