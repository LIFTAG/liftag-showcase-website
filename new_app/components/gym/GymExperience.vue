<script setup lang="ts">
import { gymAnchor } from "~/utils/gymscan/navigation";
import type { CoachingState } from '~/utils/gymscan/coachingStage';
const coaching = shallowRef<CoachingState>({ frame: { member: 0, owner: 0, isOwner: false, reduced: false }, paused: false, customSrc: '', replay: 0 });
const customError = shallowRef(0);
const mediaFailed = shallowRef(false);
const root = useTemplateRef<HTMLElement>("journey");
const { current, reducedMotion, track } = useGymJourney(root);
const enhanced = shallowRef(false);
const hydrated = shallowRef(false);
const arriving = shallowRef(false);
const fallback = shallowRef(false);
const swept = shallowRef(false);
const copyHold = computed(
  () =>
    arriving.value ||
    (!reducedMotion.value &&
      !fallback.value &&
      current.value.chapter === "experience" &&
      !swept.value),
);
provideGymCopyReveal(copyHold, reducedMotion);
const chapters = [
  { id: "experience", label: "The machine" },
  { id: "the-tag", label: "The tag" },
  { id: "lifters", label: "Watch & lift" },
  { id: "gyms", label: "Your instructions" },
  { id: "discover", label: "On the map" },
];
function kit() {
  track("gym_kit_cta");
}
// A repeated chapter click must return to its beginning even when the router
// considers the unchanged hash a duplicate navigation.
function revisitChapter(event: MouseEvent) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return;
  const link = (event.target as Element).closest<HTMLAnchorElement>(
    'a[href^="#"]',
  );
  if (!link || link.hash !== location.hash) return;
  const id = gymAnchor(link.hash);
  const target = id ? document.getElementById(id) : null;
  if (!target) return;
  event.preventDefault();
  target.scrollIntoView({
    block: "start",
    behavior: reducedMotion.value ? "instant" : "smooth",
  });
}
onMounted(() => {
  hydrated.value = true;
});
useHead(() => ({
  htmlAttrs: { "data-gym-motion": reducedMotion.value ? "reduce" : null },
}));
useHead({
  link: [
    {
      rel: "preload",
      as: "font",
      type: "font/woff2",
      crossorigin: "",
      href: "/assets/fonts/space-grotesk-latin.woff2",
    },
    {
      rel: "preload",
      as: "font",
      type: "font/woff2",
      crossorigin: "",
      href: "/assets/fonts/inter-latin.woff2",
    },
  ],
});
</script>
<template>
  <div
    class="gx"
    @click="revisitChapter"
    :class="{
      'is-enhanced': enhanced,
      'is-arriving': arriving,
      'is-copy-held': copyHold,
      'is-reduced': reducedMotion,
      'is-static': fallback || !hydrated,
    }"
  >
    <GymArrival :ready="enhanced" :fallback="fallback" :reduced="reducedMotion" @active="arriving = $event" />
    <GymNav
      :reduced="reducedMotion"
      @motion="reducedMotion = !reducedMotion"
      @kit="kit"
    />
    <main>
      <div ref="journey" class="gx-journey">
        <GymCinema
          :journey="current"
          :coaching="coaching"
          @custom-error="customError++"
          @media-failed="mediaFailed = $event"
          :paused="arriving"
          :reduced="reducedMotion"
          product-view="exercise"
          @ready="
            enhanced = $event;
            if ($event) fallback = false;
          "
          @fallback="fallback = true"
          @swept="swept = true"
        />
        <section id="experience" class="gx-opening" aria-labelledby="gx-title">
          <div class="gx-opening__copy">
            <p class="gx-protocol">
              <GymHeroEntry row><span class="gx-dot" /> BUILT AROUND YOUR GYM</GymHeroEntry>
            </p>
            <h1 id="gx-title">
              <GymHeroEntry row :delay="80">Your machines.</GymHeroEntry><br /><GymHeroEntry :delay="180"><em>Connected to their workout.</em></GymHeroEntry>
            </h1>
            <p><GymHeroEntry :delay="300">Put a tag on a machine. Members scan, watch and log.</GymHeroEntry></p>
            <div class="gx-actions">
              <GymHeroEntry button :delay="400"><a class="btn-primary" href="#kit" @click="kit">Request your free kit</a></GymHeroEntry>
              <GymHeroEntry button :delay="480"><NuxtLink class="btn-ghost" to="/get"><HoloPill />Get the app</NuxtLink></GymHeroEntry>
            </div>
          </div>
          <a class="gx-scroll gx-protocol" href="#the-tag"
            ><GymHeroEntry row :delay="560">SCROLL TO CONNECT</GymHeroEntry> <span>↓</span></a
          ><span class="gx-spec gx-protocol"
            ><GymHeroEntry :delay="600">01 / PIVOT LEG PRESS<br />TAG → SCAN → LOG</GymHeroEntry></span
          >
        </section>
        <section id="the-tag" class="gx-install" aria-labelledby="gx-tag-title">
          <div class="gx-install__copy">
            <p class="gx-protocol"><GymEntry mode="holo" row>A STICKER FOR EACH MACHINE</GymEntry></p>
            <h2 id="gx-tag-title">
              <GymEntry mode="holo" :delay="70">Stick it on. Scan or tap.</GymEntry>
            </h2>
            <span class="gx-install__types"
              ><GymEntry mode="holo" row class="gx-install__chip" :delay="160">QR <i>Scan</i></GymEntry
              ><GymEntry mode="holo" row class="gx-install__chip" :delay="220">NFC <i>Tap</i></GymEntry></span
            >
          </div>
          <img
            class="gx-fallback gx-tag-poster"
            src="/assets/gym3d/tag-poster.webp"
            width="1000"
            height="1000"
            alt="LIFTAG tag attached to the leg press"
            loading="lazy"
          />
        </section>
        <GymCoachingStory :reduced="reducedMotion" :enhanced="enhanced" :custom-error="customError" :media-failed="mediaFailed" @change="coaching = $event" @kit="kit" />
        <GymGlobeStory :reduced="reducedMotion" />
      </div>
      <GymKit />
    </main>
    <footer class="gx-footer">
      <NuxtLink class="gx-logo" to="/"
        ><img src="/assets/logo.svg" width="25" height="25" alt="" /><span
          >LIFTAG</span
        ></NuxtLink
      >
      <nav aria-label="Footer">
        <NuxtLink to="/for-gyms">For gyms</NuxtLink
        ><NuxtLink to="/for-lifters">For lifters</NuxtLink
        ><NuxtLink to="/for-trainers">For coaches</NuxtLink
        ><NuxtLink to="/get">Get the app</NuxtLink
        ><NuxtLink to="/privacy-policy">Privacy</NuxtLink
        ><NuxtLink to="/contact/support">Support</NuxtLink>
      </nav>
      <span class="gx-protocol">BUILT FOR REAL TRAINING.</span>
    </footer>
    <nav class="gx-chapters" aria-label="Experience chapters">
      <a
        v-for="(chapter, i) in chapters"
        :key="chapter.id"
        :href="`#${chapter.id}`"
        :aria-label="chapter.label"
        :aria-current="current.chapter === chapter.id ? 'step' : undefined"
        ><span class="gx-protocol">0{{ i + 1 }}</span
        ><span>{{ chapter.label }}</span></a
      ><a
        href="#kit"
        @click="kit"
        :aria-current="current.chapter === 'kit' ? 'step' : undefined"
        aria-label="Request your free kit"
        >↗</a
      >
    </nav>
  </div>
</template>
<style src="~/assets/css/gym-experience.css"></style>
