<script setup lang="ts">
import RoutineDetailView from '~/components/discovery/RoutineDetailView.vue'
definePageMeta({ layout: 'discovery' })
const route = useRoute()
</script>
<template><RoutineDetailView :key="String(route.params.id)" :id="String(route.params.id)" /></template>
