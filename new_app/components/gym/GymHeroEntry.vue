<script setup lang="ts">
withDefaults(defineProps<{ delay?: number; row?: boolean; button?: boolean }>(), {
  delay: 0, row: false, button: false,
})
</script>
<template>
  <GymEntry :row="row || button" :delay="delay"><slot /></GymEntry>
</template>
