<script setup lang="ts">
import type { GymMachineDetail } from '~/types/discovery'
import { gymMachineHref } from '~/utils/gymCatalog'
import '~/assets/css/discovery.css'
const props = defineProps<{ gymId: string; machineId: string }>()
const timezone = shallowRef<string | null | undefined>(undefined)
const { locale, preference, copy, href } = useDiscoveryLocale(timezone)
const { data, error, status, refresh } = await useDiscoveryResource<GymMachineDetail>(
  () => `/api/explore/gyms/${props.gymId}/machines/${props.machineId}`,
  preference,
)
watchEffect(() => {
  timezone.value = data.value?.gym.timezone
})
const presentation = computed(() =>
  data.value
    ? {
        id: data.value.id,
        name: data.value.name,
        description: data.value.description,
        photoUrl: null,
        categories: [],
      }
    : null,
)
useDiscoverySeo(
  () => data.value?.name ?? copy.value.gymMachine,
  () => data.value?.description ?? data.value?.gym.name ?? '',
  locale,
  () => data.value?.media.find((m) => m.type === 'image')?.url,
  'page',
  undefined,
  () => gymMachineHref(props.gymId, props.machineId, locale.value),
)
</script>
<template>
  <div v-if="!data || !presentation || error" class="discovery-root discovery-shell">
    <DiscoveryState
      :locale="locale"
      :loading="status === 'pending'"
      :error="Boolean(error)"
      :unavailable="error?.statusCode === 404"
      @retry="refresh()"
    />
  </div>
  <CatalogMachinePresentation v-else :machine="presentation" :gym-machine="data" :locale="locale">
    <template #info>
      <div class="ma-gym-context">
        <span v-if="data.manufacturer" class="protocol">{{ data.manufacturer.name }}</span>
        <NuxtLink :to="href(`/gyms/${gymId}`)">
          <DiscoveryIcon name="pin" :size="16" />
          {{ data.gym.name }}
        </NuxtLink>
      </div>
    </template>
  </CatalogMachinePresentation>
</template>
<style scoped>
.ma-gym-context {
  display: grid;
  gap: 12px;
  margin-top: 24px;
}
.ma-gym-context > span {
  font-size: 11px;
  color: var(--liftag-fg-tertiary);
}
.ma-gym-context a {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--liftag-primary);
  text-decoration: none;
  font-size: 13px;
  min-height: 44px;
}
.ma-gym-context a:hover {
  text-decoration: underline;
}
</style>
