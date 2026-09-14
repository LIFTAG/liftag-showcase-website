<script setup lang="ts">
import TrainerDetailView from '~/components/discovery/TrainerDetailView.vue'
definePageMeta({ layout: 'discovery' })
const route = useRoute()
</script>
<template><TrainerDetailView :key="String(route.params.id)" :id="String(route.params.id)" /></template>
