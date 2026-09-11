<script setup lang="ts">
definePageMeta({ layout: false });
useLiftagSeo({
  title: "Become a LIFTAG partner gym | LIFTAG",
  description:
    "Connect your gym equipment with LIFTAG. The dashboard to create NFC tags and QR codes is free, along with listing, setup, and the member app. Gyms buy the physical tags themselves.",
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
