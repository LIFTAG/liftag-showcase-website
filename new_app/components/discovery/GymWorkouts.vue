<script setup lang="ts">
import type { DiscoveryLocale, PublicRoutine } from '~/types/discovery'
import { discoveryCopy } from '~/utils/discoveryCopy'
const props = defineProps<{ gymId: string; locale: DiscoveryLocale }>()
const copy = computed(() => discoveryCopy(props.locale))
const { items, loading, error, hasMore, retry, loadMore } = await useDiscoveryPage<PublicRoutine>(
  () => `/api/explore/gyms/${props.gymId}/routines`,
  () => ({ lang: props.locale }),
  3,
)
</script>
<template>
  <section v-if="loading || error || items.length" class="d-section">
    <h2 class="d-subtitle">{{ copy.routines }}</h2>
    <DiscoveryState v-if="error" :locale="locale" error @retry="retry" />
    <DiscoveryState v-else-if="loading && !items.length" :locale="locale" loading />
    <DiscoveryRoutineCard v-for="routine in items" :key="routine.id" :routine="routine" :locale="locale" />
    <button v-if="hasMore" class="d-button" :disabled="loading" @click="loadMore">{{ copy.more }}</button>
  </section>
</template>
