<script setup lang="ts">
import { en, sk } from '~/i18n/messages/discovery'
const { t } = useI18n({ useScope: 'local', messages: { en, sk } })
</script>
<template>
  <a class="discovery-skip" href="#discovery-content">{{ t('skip') }}</a>
  <SiteNav />
  <div class="discovery-root discovery-shell"><slot /></div>
</template>
<!--
  The shared discovery sheet rides as an SFC style block, not a script import:
  Nuxt inlines SFC styles into the SSR HTML (features.inlineStyles), but a CSS
  file imported from script only arrives with the layout's JS chunk. Until
  then .discovery-shell had no header padding and /explore's map had no
  height, and the whole page jumped at hydration (CLS 0.34 desktop, 0.7 phone).
-->
<style src="~/assets/css/discovery.css"></style>
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
