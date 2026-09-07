<script setup lang="ts">
const chars = Array.from("LIFTAG");
</script>

<template>
  <span class="gx-logo__word" aria-hidden="true"
    ><span
      v-for="(ch, i) in chars"
      :key="ch"
      class="gx-logo__ch"
      :style="{ '--i': i }"
      >{{ ch }}</span
    ></span
  >
</template>
