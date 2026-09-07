<script setup lang="ts">
definePageMeta({ layout: false });
useLiftagSeo({
  title: "Request your free gym kit | LIFTAG",
  description:
    "Connect your gym equipment with free LIFTAG QR and NFC tags. Request your kit, equipment setup, gym listing, and core dashboard.",
  path: "/contact/partner",
});
</script>
<template>
  <div class="gx gx-partner">
    <header class="gx-nav">
      <NuxtLink class="gx-logo" to="/" aria-label="LIFTAG home"
        ><img src="/assets/logo.svg" width="29" height="29" alt="" /><span
          >LIFTAG</span
        ></NuxtLink
      ><NuxtLink class="btn-ghost" to="/demo"
        ><HoloPill />Explore the experience</NuxtLink
      >
    </header>
    <main><GymKit source="partner" /></main>
    <footer class="gx-footer">
      <NuxtLink to="/privacy-policy">Privacy</NuxtLink
      ><NuxtLink to="/contact/support">Support</NuxtLink>
    </footer>
  </div>
</template>
<style src="~/assets/css/gym-experience.css"></style>
