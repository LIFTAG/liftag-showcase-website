<script setup lang="ts">
/**
 * Marketing chrome. Handoff routes (/get, QR / plan / routine / invite deep
 * links, auth callback) set `layout: false` so they stay a straight path
 * into the app.
 */
</script>

<template>
  <SiteNav />
  <slot />
  <LazySiteFooter :hydrate-on-visible="{ rootMargin: '800px' }" />
</template>
