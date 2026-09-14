<script setup lang="ts">
const route = useRoute()
const contextLocale = computed(() => route.query.lang === 'en' || route.query.lang === 'sk' ? route.query.lang : 'sk')
</script>

<template>
  <CatalogExerciseDetail
    :key="`${route.params.slug}:${route.query.gym ?? ''}:${route.query.machine ?? ''}:${route.query.exercise ?? ''}:${contextLocale}`"
    :locale="contextLocale"
    :param="String(route.params.slug)"
  />
</template>
