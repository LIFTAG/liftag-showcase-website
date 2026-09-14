<script setup lang="ts">
import { en, sk } from '~/content/legal/terms'
const { locale } = useSiteLocale()
const content = computed(() => locale.value === 'sk' ? sk : en)
</script>

<template><LegalArticle kind="terms" :content="content" /></template>
