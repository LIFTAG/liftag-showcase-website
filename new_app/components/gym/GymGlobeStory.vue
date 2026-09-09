<script setup lang="ts">
import { discoveryLocation } from "~/utils/gymscan/discoveryEquipment";
const props = defineProps<{ reduced: boolean }>();
const root = useTemplateRef<HTMLElement>("root");
const unavailable = shallowRef(false);
const simple = computed(() => props.reduced || unavailable.value);
const { film, phase, replay, go } = useDiscoveryScroll(
  root,
  () => simple.value,
);
const beats = [
  {
    protocol: "08 GYMS · ONE NETWORK",
    title: "Every gym.\nOne place.",
    caption: "Find your next place to train. Eight gyms across Slovakia.",
    step: "The network",
  },
  {
    protocol: "YOUR PLACE ON THE MAP",
    title: "Let your members\nspeak for you.",
    caption: "Your place. Your community. Their reviews.",
    step: "Member reviews",
  },
  {
    protocol: "YOUR GYM, MACHINE BY MACHINE",
    title: "Your floor.\nMade discoverable.",
    caption: "A clear view of what your gym has to offer.",
    step: "The gym floor",
  },
  {
    protocol: "YOUR GYM, IN THE APP",
    title: "Your floor.\nOn their phone.",
    caption:
      "The same machines, listed in LIFTAG, ready for a lifter to train.",
    step: "In the app",
  },
] as const;
const beat = computed(() => beats[simple.value ? 3 : phase.value] ?? beats[0]);
const headline = computed(() =>
  simple.value ? "Every gym.\nOne place." : beat.value.title,
);
const caption = computed(() =>
  simple.value
    ? "Eight gyms in Slovakia. Member reviews and every machine, in one place."
    : beat.value.caption,
);
</script>
<template>
  <section
    id="discover"
    tabindex="-1"
    ref="root"
    class="gd-story"
    :class="{ 'is-simple': simple }"
    aria-labelledby="gd-title"
  >
    <div class="gd-sticky" :data-phase="phase">
      <GymDiscoveryStage
        :film="film"
        :reduced="simple"
        :replay="replay"
        @open="go(1)"
        @unavailable="unavailable = true"
      />
      <div class="gd-copy">
        <h2 id="gd-title" class="sr-only">{{ headline }}</h2>
        <div class="gd-copy-stage">
          <div v-if="simple" class="gd-copy-swap is-on">
            <p class="gx-protocol">05 / {{ beat.protocol }}</p>
            <div class="gd-copy-title" aria-hidden="true">{{ headline }}</div>
            <p class="gd-caption">{{ caption }}</p>
          </div>
          <template v-else>
            <div
              v-for="(item, index) in beats"
              :key="item.step"
              class="gd-copy-swap"
              :class="{ 'is-on': phase === index }"
              :inert="phase !== index"
              :aria-hidden="phase !== index"
            >
              <p class="gx-protocol">05 / {{ item.protocol }}</p>
              <div class="gd-copy-title" aria-hidden="true">{{ item.title }}</div>
              <p class="gd-caption">{{ item.caption }}</p>
            </div>
          </template>
        </div>
        <div v-if="!simple" class="gd-steps" aria-label="Explore gym discovery">
          <button
            v-for="(item, index) in beats"
            :key="item.step"
            :aria-pressed="phase === index"
            @click="go(index)"
          >
            <span class="gd-step-dot" aria-hidden="true" />{{ item.step }}
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
        :class="{ 'is-shown': phase < 2 || simple }"
        :inert="phase !== 1 && !simple"
      >
        <span v-if="!simple" class="gd-profile-island" aria-hidden="true" />
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
        @click="go(0)"
      >
        ↻ Replay the journey
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
