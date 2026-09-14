<script setup lang="ts">
import GymEquipmentView from '~/components/discovery/GymEquipmentView.vue'
definePageMeta({ layout: 'discovery' })
const route = useRoute()
</script>
<template><GymEquipmentView :key="String(route.params.id)" :id="String(route.params.id)" /></template>
