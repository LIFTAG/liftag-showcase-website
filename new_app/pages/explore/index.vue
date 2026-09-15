<script setup lang="ts">
import ExploreView from '~/components/discovery/ExploreView.vue'
// Keep pending search, map movement and selection when only the locale prefix changes.
definePageMeta({ layout: 'discovery', key: 'explore' })
</script>
<template><ExploreView /></template>
