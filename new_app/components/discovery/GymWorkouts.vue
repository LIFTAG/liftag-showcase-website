<script setup lang="ts">
import type { DiscoveryLocale, PublicRoutine } from '~/types/discovery'
import { discoveryCopy } from '~/utils/discoveryCopy'
const props = defineProps<{ gymId: string; locale: DiscoveryLocale }>()
const copy = computed(() => discoveryCopy(props.locale))
const routines = await useDiscoveryPage<PublicRoutine>(
  () => `/api/explore/gyms/${props.gymId}/routines`,
  () => ({ lang: props.locale }),
  3,
)
</script>
<template>
  <section v-if="routines.loading.value || routines.error.value || routines.items.value.length" class="d-section">
    <h2 class="d-subtitle">{{ copy.routines }}</h2>
    <DiscoveryList :state="routines" :locale="locale">
      <template #default="{ items }">
        <DiscoveryRoutineCard
          v-for="routine in items"
          :key="routine.id"
          :routine="routine"
          :locale="locale"
        />
      </template>
    </DiscoveryList>
  </section>
</template>
