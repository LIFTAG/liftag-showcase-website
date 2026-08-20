<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <CatalogExerciseDetail locale="en" :param="String(route.params.slug)" />
</template>
