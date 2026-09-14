<script setup lang="ts">
import GymDetailView from '~/components/discovery/GymDetailView.vue'
definePageMeta({ layout: 'discovery' })
const route = useRoute()
</script>
<template><GymDetailView :key="String(route.params.id)" :id="String(route.params.id)" /></template>
