<script setup lang="ts">
const { t } = useI18n({ useScope: 'global' })
withDefaults(defineProps<{
  size?: string
  padding?: string
  radius?: string
}>(), {
  size: '260px',
  padding: '18px',
  radius: 'var(--liftag-r-xl)',
})
</script>

<template>
  <QrPrismFrame :size="size" :padding="padding" :radius="radius">
    <img
      src="/assets/qr/get.svg"
      width="260"
      height="260"
      :alt="t('common.installQr')"
      class="install-qr__code"
    >
  </QrPrismFrame>
</template>

<style scoped>
.install-qr__code {
  display: block;
  width: 100%;
  height: auto;
}
</style>
