<script setup lang="ts">
import { en, sk } from '~/i18n/messages/support'
const { t } = useI18n({ useScope: 'local', messages: { en, sk } })
</script>
<template>
  <ContactPage
    :eyebrow="t('support.eyebrow')" :title="t('support.title')" :lead="t('support.lead')"
    :locked-subject="t('support.subject')" :success-headline="t('support.success')"
    :seo-title="t('support.seoTitle')" :seo-description="t('support.description')"
    seo-path="/contact/support" :breadcrumb-name="t('support.breadcrumb')"
  />
</template>
