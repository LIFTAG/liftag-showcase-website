<script setup lang="ts">
const { locale } = useSiteLocale()
</script>
<template><CatalogExerciseIndex :key="locale" :locale="locale" /></template>
