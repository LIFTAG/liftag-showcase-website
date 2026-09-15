<script setup lang="ts">
import { en, sk } from '~/i18n/messages/gymDemo';
const { t } = useI18n({ useScope: 'local', messages: { en, sk } });
const { href } = useSiteLocale();
/**
 * Gym-owner door on the 0D hold. Get LIFTAG is foil (the vinyl). This is the
 * hologram: the same triangle read as the floor splash and the machine cage,
 * driven by the pointer.
 */
</script>

<template>
  <NuxtLink
    class="gs__btn gs__btn--ghost gs__btn--partner"
    :to="href('/contact/partner')"
  >
    <HoloPill />
    <span class="gs__partner-label">{{ t('nav.partner') }}</span>
  </NuxtLink>
</template>

<style scoped>
.gs__partner-label {
  position: relative;
  z-index: 1;
}
</style>
