<script setup lang="ts">
definePageMeta({ layout: false })
const route = useRoute()
await navigateTo(
  { path: `/machines/${route.params.machineId}`, query: { ...route.query, gym: String(route.params.id) } },
  { redirectCode: 301, replace: true },
)
</script>
<template><div /></template>
