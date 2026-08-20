<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <CatalogExerciseDetail locale="sk" :param="String(route.params.slug)" />
</template>
