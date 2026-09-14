<script setup lang="ts">
import type { GymMachineDetail } from '~/types/discovery'
import { gymMachineHref } from '~/utils/gymCatalog'
import '~/assets/css/discovery.css'
const props = defineProps<{ gymId: string; machineId: string }>()
/** The gym's timezone only arrives with the response, so the locale resolves after it. */
const { preference } = useSiteLocale()
const { data, error, status, refresh } = await useDiscoveryResource<GymMachineDetail>(
  () => `/api/explore/gyms/${props.gymId}/machines/${props.machineId}`,
  preference,
)
const { locale, copy, href } = useDiscoveryLocale(() => data.value?.gym.timezone)
useDiscoverySeo({
  name: () => data.value?.name ?? copy.value.gymMachine,
  description: () => data.value?.description ?? data.value?.gym.name ?? '',
  locale,
  photo: () => data.value?.media.find((m) => m.type === 'image')?.url,
  canonicalPath: () => gymMachineHref(props.gymId, props.machineId, locale.value),
})
</script>
<template>
  <div v-if="!data || error" class="discovery-root discovery-shell">
    <DiscoveryState
      :locale="locale"
      :loading="status === 'pending'"
      :error="Boolean(error)"
      :unavailable="error?.statusCode === 404"
      @retry="refresh()"
    />
  </div>
  <CatalogMachinePresentation v-else :gym-machine="data" :locale="locale">
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
