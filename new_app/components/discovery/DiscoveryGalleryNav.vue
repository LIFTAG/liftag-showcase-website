<script setup lang="ts">
import type { DiscoveryLocale } from '~/types/discovery'
import { discoveryCopy } from '~/utils/discoveryCopy'
/** Previous / counter / next, shared by the gallery stage and its fullscreen viewer. */
const props = defineProps<{ index: number; total: number; locale: DiscoveryLocale; live?: boolean }>()
defineEmits<{ step: [delta: number] }>()
const copy = computed(() => discoveryCopy(props.locale))
</script>
<template>
  <div>
    <button class="d-icon-button" :aria-label="copy.previous" @click="$emit('step', -1)">
      <DiscoveryIcon name="back" />
    </button>
    <span :aria-live="live ? 'polite' : undefined" :aria-atomic="live ? 'true' : undefined">
      {{ index + 1 }} / {{ total }}
    </span>
    <button class="d-icon-button" :aria-label="copy.next" @click="$emit('step', 1)">
      <DiscoveryIcon name="arrow" />
    </button>
  </div>
</template>
