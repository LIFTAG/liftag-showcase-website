<script setup lang="ts">
definePageMeta({ key: route => route.fullPath.split('#')[0] })
const { locale } = useSiteLocale()
</script>
<template><CatalogExerciseIndex :key="locale" :locale="locale" /></template>
