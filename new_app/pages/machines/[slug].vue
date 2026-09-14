<script setup lang="ts">
import GymMachineView from '~/components/discovery/GymMachineView.vue'
import { gymCatalogContext } from '~/utils/gymCatalog'
const route = useRoute()
definePageMeta({ key: (route) => `${route.params.slug}:${route.query.gym ?? ''}` })
const context = (() => {
  try {
    return gymCatalogContext(route.query, String(route.params.slug))
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid gym equipment context', fatal: true })
  }
})()
</script>
<template>
  <GymMachineView
    v-if="context"
    :key="`${context.gymId}:${context.machineId}`"
    :gym-id="context.gymId"
    :machine-id="context.machineId"
  />
  <CatalogMachineDetail v-else :key="String(route.params.slug)" :param="String(route.params.slug)" />
</template>
