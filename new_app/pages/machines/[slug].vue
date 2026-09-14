<script setup lang="ts">
import { gymCatalogContext } from '~/utils/gymCatalog'
// Only a gym-context URL needs the discovery stack (and its stylesheet); a plain
// catalog machine page must not ship it.
const GymMachineView = defineAsyncComponent(
  () => import('~/components/discovery/GymMachineView.vue'),
)
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
