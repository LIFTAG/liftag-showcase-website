<script setup lang="ts">
import { en, sk } from '~/content/legal/privacy'
const { locale } = useSiteLocale()
const content = computed(() => locale.value === 'sk' ? sk : en)
</script>

<template><LegalArticle kind="privacy" :content="content" /></template>
