<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <CatalogExerciseDetail
    :key="String(route.params.slug)"
    locale="sk"
    :param="String(route.params.slug)"
  />
</template>
