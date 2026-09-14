<script setup lang="ts">
import type { DiscoveryLocale } from '~/types/discovery'
import { discoveryCopy } from '~/utils/discoveryCopy'
const props = defineProps<{
  locale: DiscoveryLocale
  loading?: boolean
  error?: boolean
  unavailable?: boolean
  title?: string
  hint?: string
}>()
defineEmits<{ retry: [] }>()
const copy = computed(() => discoveryCopy(props.locale))
</script>
<template>
  <div v-if="loading" class="d-stack" role="status" :aria-label="copy.loading">
    <span class="d-sr-only">{{ copy.loading }}</span>
    <div v-for="i in 3" :key="i" class="d-skeleton" />
  </div>
  <div v-else class="d-empty" role="status">
    <DiscoveryIcon :name="unavailable ? 'pin' : error ? 'globe' : 'gym'" />
    <h2 class="d-subtitle">
      {{ title || (unavailable ? copy.unavailable : error ? copy.loadError : copy.noGyms) }}
    </h2>
    <p class="d-muted d-small">{{ hint || (unavailable ? copy.unavailableHint : '') }}</p>
    <button v-if="error && !unavailable" class="d-button" @click="$emit('retry')">{{ copy.retry }}</button>
  </div>
</template>
