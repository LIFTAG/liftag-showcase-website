<script setup lang="ts">
import { en, sk } from '~/i18n/messages/discovery'
import '~/assets/css/discovery.css'
const { t } = useI18n({ useScope: 'local', messages: { en, sk } })
</script>
<template>
  <a class="discovery-skip" href="#discovery-content">{{ t('skip') }}</a>
  <SiteNav />
  <div class="discovery-root discovery-shell"><slot /></div>
</template>
<style scoped>
.discovery-skip {
  position: fixed;
  top: 8px;
  left: 16px;
  z-index: 101;
  padding: 12px 16px;
  background: var(--liftag-primary);
  color: #101405;
  border-radius: 8px;
  transform: translateY(-200%);
}
.discovery-skip:focus {
  transform: none;
}
</style>
