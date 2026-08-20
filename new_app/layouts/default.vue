<script setup lang="ts">
/**
 * Marketing chrome. Handoff routes (/get, QR / plan / routine / invite deep
 * links, auth callback) set `layout: false` so they stay a straight path
 * into the app.
 */
</script>

<template>
  <SiteNav />
  <main>
    <slot />
  </main>
  <LazySiteFooter class="below-fold" :hydrate-on-visible="{ rootMargin: '200px' }" />
</template>
