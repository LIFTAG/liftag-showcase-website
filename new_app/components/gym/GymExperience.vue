<script setup lang="ts">
import { gymAnchor } from "~/utils/gymscan/navigation";
import type { CoachingState } from '~/utils/gymscan/coachingStage';
import { gymJourneyKey } from '~/composables/useGymJourney';
import { gymCoachingKey } from '~/composables/useCoachingScroll';
import { GYM_ARRIVAL_STATE_KEY } from '~/utils/gymscan/arrivalBootstrap';
import { en, sk } from '~/i18n/messages/gymDemo';
const coaching = shallowRef<CoachingState>({ frame: { member: 0, owner: 0, isOwner: false, reduced: false }, paused: false, customSrc: '', replay: 0 });
const customError = shallowRef(0);
const mediaFailed = shallowRef(false);
const root = useTemplateRef<HTMLElement>("journey");
const { current, chapter, reducedMotion, track } = useGymJourney(root);
const { t } = useI18n({ useScope: 'local', messages: { en, sk } });
const { href } = useSiteLocale();
provide(gymJourneyKey, current);
provide(gymCoachingKey, coaching);
provideGymDiscoveryHandoff();
const enhanced = shallowRef(false);
const hydrated = shallowRef(false);
const arrivalSeen = useState(GYM_ARRIVAL_STATE_KEY, () => false);
const arriving = shallowRef(!arrivalSeen.value);
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
const chapters = computed(() => [
  { id: 'experience', label: t('chapters.machine'), compact: t('chapters.machineCompact') },
  { id: 'the-tag', label: t('chapters.tag'), compact: t('chapters.tagCompact') },
  { id: 'lifters', label: t('chapters.members'), compact: t('chapters.membersCompact') },
  { id: 'gyms', label: t('chapters.instructions'), compact: t('chapters.instructionsCompact') },
  { id: 'discover', label: t('chapters.map'), compact: t('chapters.mapCompact') },
]);
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
      :inert="arriving ? true : undefined"
      @motion="reducedMotion = !reducedMotion"
      @kit="kit"
    />
    <main :inert="arriving ? true : undefined">
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
              <GymHeroEntry row><span class="gx-dot" /> {{ t('opening.eyebrow') }}</GymHeroEntry>
            </p>
            <h1 id="gx-title">
              <GymHeroEntry row :delay="80">{{ t('opening.titleA') }}</GymHeroEntry><br /><GymHeroEntry :delay="180"><em>{{ t('opening.titleB') }}</em></GymHeroEntry>
            </h1>
            <p><GymHeroEntry :delay="300">{{ t('opening.body') }}</GymHeroEntry></p>
            <div class="gx-actions">
              <GymHeroEntry button :delay="400"><a class="btn-primary" href="#kit" @click="kit">{{ t('opening.partner') }}</a></GymHeroEntry>
              <GymHeroEntry button :delay="480"><NuxtLink class="btn-ghost" :to="href('/get')"><HoloPill />{{ t('nav.app') }}</NuxtLink></GymHeroEntry>
            </div>
          </div>
          <a class="gx-scroll gx-protocol" href="#the-tag"
            ><GymHeroEntry row :delay="560">{{ t('opening.scroll') }}</GymHeroEntry> <span>↓</span></a
          ><span class="gx-spec gx-protocol"
            ><GymHeroEntry :delay="600">{{ t('opening.spec') }}<br />{{ t('opening.specSub') }}</GymHeroEntry></span
          >
        </section>
        <section id="the-tag" class="gx-install" aria-labelledby="gx-tag-title" tabindex="-1">
          <div class="gx-install__copy">
            <p class="gx-protocol"><GymHeroEntry row>{{ t('tag.eyebrow') }}</GymHeroEntry></p>
            <h2 id="gx-tag-title">
              <GymHeroEntry :delay="70">{{ t('tag.title') }}</GymHeroEntry>
            </h2>
            <span class="gx-install__types"
              ><span class="gx-install__chip"><GymHeroEntry row :delay="160">QR <i>{{ t('tag.scan') }}</i></GymHeroEntry></span
              ><span class="gx-install__chip"><GymHeroEntry row :delay="220">NFC <i>{{ t('tag.tap') }}</i></GymHeroEntry></span></span
            >
          </div>
          <img
            class="gx-fallback gx-tag-poster"
            src="/assets/gym3d/tag-poster.webp"
            width="1000"
            height="1000"
            :alt="t('tag.alt')"
            loading="lazy"
          />
        </section>
        <GymCoachingStory :reduced="reducedMotion" :enhanced="enhanced" :custom-error="customError" :media-failed="mediaFailed" @change="coaching = $event" @kit="kit" />
        <GymGlobeStory :reduced="reducedMotion" />
      </div>
      <GymKit />
    </main>
    <footer class="gx-footer" :inert="arriving ? true : undefined">
      <NuxtLink class="gx-logo" :to="href('/')"
        ><img src="/assets/logo.svg" width="25" height="25" alt="" /><span
          >LIFTAG</span
        ></NuxtLink
      >
      <nav :aria-label="t('nav.footer')">
        <NuxtLink :to="href('/for-gyms')">{{ t('nav.gyms') }}</NuxtLink
        ><NuxtLink :to="href('/for-lifters')">{{ t('nav.lifters') }}</NuxtLink
        ><NuxtLink :to="href('/for-trainers')">{{ t('nav.coaches') }}</NuxtLink
        ><NuxtLink :to="href('/get')">{{ t('nav.app') }}</NuxtLink
        ><NuxtLink :to="href('/privacy-policy')">{{ t('nav.privacy') }}</NuxtLink
        ><NuxtLink :to="href('/contact/support')">{{ t('nav.support') }}</NuxtLink>
      </nav>
      <span class="gx-protocol">{{ t('footer.tagline') }}</span>
    </footer>
    <nav v-show="chapter !== 'kit'" class="gx-chapters" :aria-label="t('nav.experienceChapters')" :inert="arriving ? true : undefined">
      <a
        v-for="(item, i) in chapters"
        :key="item.id"
        :href="`#${item.id}`"
        :aria-label="item.label"
        :aria-current="chapter === item.id ? 'step' : undefined"
        ><HoloPill /><span class="gx-protocol" aria-hidden="true">0{{ i + 1 }}</span
        ><span class="gx-chapters__label" aria-hidden="true">{{ item.label }}</span
        ><span class="gx-chapters__compact" aria-hidden="true">{{ item.compact }}</span></a
      ><a
        href="#kit"
        @click="kit"
        :aria-current="chapter === 'kit' ? 'step' : undefined"
        :aria-label="t('chapters.becomePartner')"
        >↗</a
      >
    </nav>
  </div>
</template>
<style src="~/assets/css/gym-experience.css"></style>
