<script setup lang="ts">
import { gymFaqsForLocale } from "~/utils/gymscan/content";
import { en, sk } from '~/i18n/messages/gymDemo';
import { GYM_DEMO_PATH } from "~/utils/gymscan/navigation";

definePageMeta({ layout: false });

const { locale } = useSiteLocale();
const { t } = useI18n({ useScope: 'local', messages: { en, sk } });
const description = computed(() => t('opening.body'));
const localizedFaqs = computed(() => [...gymFaqsForLocale(locale.value)]);

useLiftagSeo(computed(() => ({
  title: `${t('nav.home')} | ${t('opening.titleA')}`,
  description: description.value,
  path: GYM_DEMO_PATH,
  noindex: true,
})));

useLiftagStructuredData(() => [
  liftagOrganization,
  liftagSoftwareApplication,
  liftagWebSite,
  liftagWebPage({
    path: GYM_DEMO_PATH,
    name: t('opening.titleA'),
    description: description.value,
    aboutId: APP_ID,
  }),
  liftagFAQPage(localizedFaqs.value),
]);
</script>

<template>
  <GymExperience />
</template>
