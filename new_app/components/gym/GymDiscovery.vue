<script setup lang="ts">
import { en, sk } from '~/i18n/messages/gymDemo';
const { t } = useI18n({ useScope: 'local', messages: { en, sk } });
defineProps<{ inside?: boolean }>();
</script>
<template>
  <div class="gx-discovery" :class="{ 'is-inside': inside }">
    <figure class="gx-map-object">
      <img src="/assets/screens/explore-map-640.webp" width="640" height="1385" :alt="t('discovery.mapAlt')" loading="lazy" />
      <figcaption class="gx-protocol">{{ t('discovery.find') }}</figcaption>
    </figure>
    <span class="gx-discovery-thread" aria-hidden="true">↗</span>
    <figure class="gx-listing-object">
      <img src="/assets/screens/gym-detail-560.webp" width="560" height="1212" :alt="t('discovery.listingAlt')" loading="lazy" />
      <figcaption class="gx-protocol">{{ t('discovery.open') }}</figcaption>
    </figure>
    <div v-if="inside" class="gx-trainer-object">
      <img src="/assets/screens/coach-profile-560.webp" width="560" height="1212" :alt="t('discovery.trainerAlt')" loading="lazy" />
      <span class="gx-protocol">{{ t('discovery.trainers') }}</span>
    </div>
    <small class="gx-discovery-note">{{ t('discovery.note') }}</small>
  </div>
</template>
