<script setup lang="ts">
defineProps<{ inside?: boolean }>();
</script>
<template>
  <div class="gx-discovery" :class="{ 'is-inside': inside }">
    <figure class="gx-map-object">
      <img src="/assets/screens/explore-map-640.webp" width="640" height="1385" alt="The real LIFTAG map with a selected gym listing" loading="lazy" />
      <figcaption class="gx-protocol">FIND A GYM</figcaption>
    </figure>
    <span class="gx-discovery-thread" aria-hidden="true">↗</span>
    <figure class="gx-listing-object">
      <img src="/assets/screens/gym-detail-560.webp" width="560" height="1212" alt="LIFTAG gym page with gym photography, opening hours and its actual zero-review state" loading="lazy" />
      <figcaption class="gx-protocol">OPEN ITS DOORS</figcaption>
    </figure>
    <div v-if="inside" class="gx-trainer-object">
      <img src="/assets/screens/coach-profile-560.webp" width="560" height="1212" alt="Real LIFTAG trainer profile capture, including the trainer’s gyms" loading="lazy" />
      <span class="gx-protocol">MEET THE TRAINERS</span>
    </div>
    <small class="gx-discovery-note">Real LIFTAG screens · demonstration gym and profile</small>
  </div>
</template>
