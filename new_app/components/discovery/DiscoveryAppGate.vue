<script setup lang="ts">
import type { DiscoveryLocale } from '~/types/discovery'
import { discoveryCopy } from '~/utils/discoveryCopy'
const props = defineProps<{ locale: DiscoveryLocale; kind: 'generate' | 'review' | 'routine' | 'plan' }>()
const { href } = useSiteLocale()
defineEmits<{ close: [] }>()
const copy = computed(() => discoveryCopy(props.locale))
const message = computed(
  () =>
    ({
      generate: copy.value.appGenerate,
      review: copy.value.appReview,
      routine: copy.value.appRoutine,
      plan: copy.value.appPlan,
    })[props.kind],
)
</script>
<template>
  <DiscoveryDialog :title="copy.appTitle" :locale="locale" wide @close="$emit('close')">
    <div class="d-install">
      <div class="d-install-aura" aria-hidden="true" />
      <div class="d-install-copy">
        <p class="protocol d-install-eyebrow">
          LIFTAG · {{ copy.appEyebrow }}
        </p>
        <h3 class="display d-install-title">
          {{ copy.appHeadlineLead }}
          <br />
          <span>{{ copy.appHeadlineTail }}</span>
        </h3>
        <p class="d-install-message">{{ message }}</p>
        <div class="d-install-stores">
          <AppStoreBtn store="apple" :href="APP_STORE_URL" :locale="locale" />
          <AppStoreBtn store="google" :href="PLAY_STORE_URL" :locale="locale" />
        </div>
        <NuxtLink :to="href('/get')" class="d-install-link">
          {{ copy.appDownload }}
          <DiscoveryIcon name="arrow" :size="16" />
        </NuxtLink>
      </div>
      <div class="d-install-qr">
        <InstallQrCode size="220px" padding="16px" radius="22px" />
        <p>{{ copy.appScan }}</p>
        <span class="protocol">LIFTAG.FIT/GET</span>
      </div>
    </div>
  </DiscoveryDialog>
</template>
<style scoped>
.d-install {
  position: relative;
  isolation: isolate;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 244px;
  gap: 32px;
  align-items: center;
  padding: 12px 8px 20px;
}
.d-install-aura {
  position: absolute;
  z-index: -1;
  inset: -24px;
  pointer-events: none;
  background: radial-gradient(ellipse at 80% 40%, #ccff0017, transparent 65%);
}
.d-install-eyebrow {
  color: #a8a8a8;
  font-size: 10px;
  margin: 0 0 20px;
  letter-spacing: 0.12em;
}
.d-install-title {
  font-size: clamp(36px, 5vw, 56px);
  line-height: 0.98;
  margin: 0;
}
.d-install-title span {
  color: #ccff00;
}
.d-install-message {
  color: #b7b9b0;
  font-size: 15px;
  line-height: 1.65;
  margin: 24px 0;
  max-width: 36ch;
}
.d-install-stores {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.d-install-stores :deep(.app-store-btn) {
  min-width: 0;
  flex: 1 1 145px;
  padding-inline: 10px;
}
.d-install-stores :deep(.app-store-btn__name) {
  font-size: 16px;
}
.d-install-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  margin-top: 12px;
  font-size: 13px;
}
.d-install-link:hover {
  text-decoration: underline;
}
.d-install-qr {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
}
.d-install-qr p {
  color: #b7b9b0;
  font-size: 13px;
  line-height: 1.5;
  max-width: 22ch;
  margin: 8px 0 0;
}
.d-install-qr > span {
  font-size: 10px;
  color: #a8a8a8;
  letter-spacing: 0.1em;
}
@media (max-width: 640px) {
  .d-install {
    grid-template-columns: minmax(0, 1fr);
    padding: 8px 4px;
    gap: 24px;
  }
  .d-install-title {
    font-size: 48px;
  }
  .d-install-qr {
    display: none;
  }
  .d-install-message {
    max-width: none;
  }
}
</style>
