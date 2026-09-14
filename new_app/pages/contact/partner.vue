<script setup lang="ts">
import { en, sk } from '~/i18n/messages/gymDemo'
import { en as pageEn, sk as pageSk } from '~/i18n/messages/partnerPage'
const { t } = useI18n({ useScope: 'local', messages: { en: { ...en, partner: pageEn }, sk: { ...sk, partner: pageSk } } })
const { href } = useSiteLocale()
definePageMeta({ layout: false });
useLiftagSeo(() => ({
  title: t('partner.title'),
  description: t('partner.description'),
  path: "/contact/partner",
}));
</script>
<template>
  <div class="gx gx-partner">
    <header class="gx-nav">
      <NuxtLink class="gx-logo" :to="href('/')" :aria-label="t('nav.home')"
        ><img src="/assets/logo.svg" width="29" height="29" alt="" /><span
          >LIFTAG</span
        ></NuxtLink
      ><NuxtLink class="btn-ghost" :to="href('/demo')"
        ><HoloPill />{{ t('nav.experience') }}</NuxtLink
      >
    </header>
    <main><GymKit source="partner" /></main>
    <footer class="gx-footer">
      <NuxtLink :to="href('/privacy-policy')">{{ t('nav.privacy') }}</NuxtLink
      ><NuxtLink :to="href('/contact/support')">{{ t('nav.support') }}</NuxtLink>
    </footer>
  </div>
</template>
<style src="~/assets/css/gym-experience.css"></style>
