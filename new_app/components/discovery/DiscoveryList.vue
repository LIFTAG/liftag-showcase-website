<script setup lang="ts" generic="T">
import type { DiscoveryPageState } from '~/composables/useDiscoveryPage'
import type { DiscoveryLocale } from '~/types/discovery'
import { discoveryCopy } from '~/utils/discoveryCopy'
/**
 * The error / loading / empty / show-more shell every paginated discovery list
 * shares. Call sites supply only the rows and the empty message.
 */
const props = defineProps<{
  state: DiscoveryPageState<T>
  locale: DiscoveryLocale
  empty?: string
}>()
defineSlots<{ default: (props: { items: T[] }) => unknown; empty?: () => unknown }>()
const copy = computed(() => discoveryCopy(props.locale))
</script>
<template>
  <DiscoveryState v-if="state.error.value" :locale="locale" error @retry="state.retry" />
  <DiscoveryState v-else-if="state.loading.value && !state.items.value.length" :locale="locale" loading />
  <slot v-else-if="!state.items.value.length" name="empty">
    <p v-if="empty" class="d-muted d-small">{{ empty }}</p>
  </slot>
  <slot v-else :items="state.items.value" />
  <button
    v-if="state.hasMore.value"
    class="d-button"
    :disabled="state.loading.value"
    @click="state.loadMore"
  >
    {{ state.loading.value ? copy.loading : copy.more }}
  </button>
</template>
