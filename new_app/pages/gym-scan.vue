<script setup lang="ts">
import { GYM_DEMO_PATH } from "~/utils/gymscan/navigation";

const route = useRoute();
await navigateTo(
  { path: GYM_DEMO_PATH, query: route.query, hash: route.hash },
  { redirectCode: 308, replace: true },
);
</script>
<template><div /></template>
