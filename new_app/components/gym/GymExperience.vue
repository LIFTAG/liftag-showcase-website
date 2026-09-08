<script setup lang="ts">
import { gymAnchor } from "~/utils/gymscan/navigation";
import type { CoachingState } from '~/utils/gymscan/coachingStage';
import { gymJourneyKey } from '~/composables/useGymJourney';
import { gymCoachingKey } from '~/composables/useCoachingScroll';
const coaching = shallowRef<CoachingState>({ frame: { member: 0, owner: 0, isOwner: false, reduced: false }, paused: false, customSrc: '', replay: 0 });
const customError = shallowRef(0);
const mediaFailed = shallowRef(false);
const root = useTemplateRef<HTMLElement>("journey");
const { current, chapter, reducedMotion, track } = useGymJourney(root);
provide(gymJourneyKey, current);
provide(gymCoachingKey, coaching);
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
      chapter.value === "experience" &&
      !swept.value),
);
provideGymCopyReveal(copyHold, reducedMotion);
const chapters = [
  { id: "experience", label: "The machine", compact: "Machine" },
  { id: "the-tag", label: "The tag", compact: "The tag" },
  { id: "lifters", label: "Watch & lift", compact: "Watch & lift" },
  { id: "gyms", label: "Your instructions", compact: "Your gym" },
  { id: "discover", label: "On the map", compact: "On the map" },
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
  target.focus({ preventScroll: true });
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
        <section id="experience" class="gx-opening" aria-labelledby="gx-title" tabindex="-1">
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
        <section id="the-tag" class="gx-install" aria-labelledby="gx-tag-title" tabindex="-1">
          <div class="gx-install__copy">
            <p class="gx-protocol"><GymHeroEntry row>A STICKER FOR EACH MACHINE</GymHeroEntry></p>
            <h2 id="gx-tag-title">
              <GymHeroEntry :delay="70">Stick it on. Scan or tap.</GymHeroEntry>
            </h2>
            <span class="gx-install__types"
              ><span class="gx-install__chip"><GymHeroEntry row :delay="160">QR <i>Scan</i></GymHeroEntry></span
              ><span class="gx-install__chip"><GymHeroEntry row :delay="220">NFC <i>Tap</i></GymHeroEntry></span></span
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
    <nav v-show="chapter !== 'kit'" class="gx-chapters" aria-label="Experience chapters">
      <a
        v-for="(item, i) in chapters"
        :key="item.id"
        :href="`#${item.id}`"
        :aria-label="item.label"
        :aria-current="chapter === item.id ? 'step' : undefined"
        ><span class="gx-protocol" aria-hidden="true">0{{ i + 1 }}</span
        ><span class="gx-chapters__label" aria-hidden="true">{{ item.label }}</span
        ><span class="gx-chapters__compact" aria-hidden="true">{{ item.compact }}</span></a
      ><a
        href="#kit"
        @click="kit"
        :aria-current="chapter === 'kit' ? 'step' : undefined"
        aria-label="Request your free kit"
        >↗</a
      >
    </nav>
  </div>
</template>
<style src="~/assets/css/gym-experience.css"></style>
