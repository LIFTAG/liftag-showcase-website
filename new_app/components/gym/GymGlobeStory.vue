<script setup lang="ts">
import { discoveryLocation } from "~/utils/gymscan/discoveryEquipment";
const props = defineProps<{ reduced: boolean }>();
const root = useTemplateRef<HTMLElement>("root");
const unavailable = shallowRef(false);
const simple = computed(() => props.reduced || unavailable.value);
const { progress, phase, replay, go } = useDiscoveryScroll(
  root,
  () => simple.value,
);
const titles = [
  "Every gym.\nOne place.",
  "Let your members\nspeak for you.",
  "Your floor.\nMade discoverable.",
  "Your floor.\nOn their phone.",
];
const captions = [
  "Eight partner gyms already on LIFTAG, connected from Bratislava.",
  "Your place. Your community. Their reviews.",
  "A clear view of what your gym has to offer.",
  "The same machines, listed in LIFTAG, ready for a lifter to train.",
];
</script>
<template>
  <section
    id="discover"
    ref="root"
    class="gd-story"
    :class="{ 'is-simple': simple }"
    aria-labelledby="gd-title"
  >
    <div class="gd-sticky" :data-phase="phase">
      <GymDiscoveryStage
        :progress="progress"
        :reduced="simple"
        :replay="replay"
        @open="go(1)"
        @unavailable="unavailable = true"
      />
      <div class="gd-copy">
        <p class="gx-protocol">
          <GymEntry :key="`p-${phase}`" mode="holo" row>
            05 /
            {{
              phase === 0
                ? "08 GYMS · ONE NETWORK"
                : phase === 1
                  ? "YOUR PLACE ON THE MAP"
                  : phase < 3
                    ? "YOUR GYM, MACHINE BY MACHINE"
                    : "YOUR GYM, IN THE APP"
            }}
          </GymEntry>
        </p>
        <h2 id="gd-title">
          <GymEntry :key="`t-${phase}`" mode="holo" :delay="40">{{
            simple ? "Every gym.\nOne place." : titles[phase]
          }}</GymEntry>
        </h2>
        <p class="gd-caption">
          <GymEntry :key="`c-${phase}`" mode="holo" :delay="120">{{
            simple
              ? "Eight gyms connected. Member reviews. Every machine."
              : captions[phase]
          }}</GymEntry>
        </p>
        <div v-if="!simple" class="gd-steps" aria-label="Explore gym discovery">
          <button
            v-for="(label, index) in [
              'The network',
              'Member reviews',
              'The gym floor',
              'In the app',
            ]"
            :key="label"
            :aria-pressed="phase === index"
            @click="go(index)"
          >
            <span class="gd-step-dot" aria-hidden="true" />{{ label }}
          </button>
        </div>
        <NuxtLink
          v-if="phase === 3 || simple"
          class="btn-primary gd-link"
          to="/contact/partner"
          >Put your gym on LIFTAG</NuxtLink
        >
      </div>
      <div
        class="gd-profile"
        :class="{ 'is-shown': phase === 1 || simple }"
        :inert="phase !== 1 && !simple"
      >
        <div class="gd-profile-photo">
          <img
            src="/assets/screens/gym-detail-560.webp"
            width="560"
            height="1212"
            alt="Example gym with free weights and strength machines"
            loading="lazy"
          />
        </div>
        <div class="gd-profile-info">
          <p class="gx-protocol">YOUR PLACE ON THE MAP</p>
          <h3>Your gym</h3>
          <p>
            {{ discoveryLocation.city }}, {{ discoveryLocation.country }}
            <span aria-hidden="true">↗</span>
          </p>
        </div>
        <div class="gd-review">
          <span class="gd-stars" aria-hidden="true">☆ ☆ ☆ ☆ ☆</span
          ><strong>Member reviews</strong>
          <p>No reviews yet. Yours could be the first.</p>
        </div>
        <button v-if="!simple" class="btn-ghost gd-profile-machines" @click="go(2)">
          <HoloPill />Explore the gym floor
        </button>
        <small>Example gym listing</small>
      </div>
      <GymEquipmentInventory v-if="simple" />
      <button
        v-if="!simple && phase === 0"
        class="gd-replay gx-protocol"
        @click="replay++"
      >
        ↻ Replay assembly
      </button>
      <button
        v-if="!simple && phase === 2"
        class="gd-floor-next gx-protocol"
        @click="go(3)"
      >
        FROM FLOOR TO THE APP <span aria-hidden="true">↓</span>
      </button>
    </div>
  </section>
</template>
<style src="~/assets/css/gym-discovery.css"></style>
