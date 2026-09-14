<script setup lang="ts">
const route = useRoute()
const { locale: contextLocale } = useSiteLocale()
</script>

<template>
  <CatalogExerciseDetail
    :key="`${route.params.slug}:${route.query.gym ?? ''}:${route.query.machine ?? ''}:${route.query.exercise ?? ''}:${contextLocale}`"
    :locale="contextLocale"
    :param="String(route.params.slug)"
  />
</template>
