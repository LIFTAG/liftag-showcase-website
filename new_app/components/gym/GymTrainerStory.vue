<script setup lang="ts">
import { en, sk } from '~/i18n/messages/gymDemo';
import { legPressInstruction } from '~/utils/gymscan/equipment';

const props = defineProps<{ reduced: boolean }>();
const { t } = useI18n({ useScope: 'local', messages: { en, sk } });
const { locale } = useSiteLocale();
const root = useTemplateRef<HTMLElement>('root');
const stage = useTemplateRef<HTMLElement>('stage');
const guide = useTemplateRef<HTMLVideoElement>('guide');
const seen = useSeenOnce(root);
const near = useNearViewport(root, '200px 0px');
const fileId = useId();
const { customSrc, customName, fileError, selectVideo, clearVideo, videoError } = useCoachingVideo();
useGymInstructionPreview(guide, () => near.value && !props.reduced, () => props.reduced, false, locale, legPressInstruction.slug);

/** Percent of the stage, from the left, where the trainer's side begins. */
const split = shallowRef(50);
const dragging = shallowRef(false);
let touched = false;
let sweep = 0;

const facts = computed(() =>
  [0, 1, 2].map((i) => ({ key: t(`trainer.facts.${i}.key`), value: t(`trainer.facts.${i}.value`) })),
);
const errorText = computed(() =>
  fileError.value === 'type' ? t('trainer.fileError') : fileError.value === 'play' ? t('trainer.playError') : '',
);

function setFromPointer(clientX: number) {
  const el = stage.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  split.value = Math.min(96, Math.max(4, ((clientX - rect.left) / Math.max(1, rect.width)) * 100));
}
function grab(event: PointerEvent) {
  if (event.button !== 0) return;
  touched = true;
  cancelAnimationFrame(sweep);
  dragging.value = true;
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  setFromPointer(event.clientX);
}
function drag(event: PointerEvent) {
  if (dragging.value) setFromPointer(event.clientX);
}
function release() {
  dragging.value = false;
}
function onRange(event: Event) {
  touched = true;
  cancelAnimationFrame(sweep);
  split.value = Number((event.target as HTMLInputElement).value);
}
function preview(event: Event) {
  if (!selectVideo(event)) return;
  touched = true;
  cancelAnimationFrame(sweep);
  // Open the stage toward the visitor's own clip.
  split.value = Math.min(split.value, 28);
}

/** One slow wipe on arrival shows that the stage is a control, not a poster. */
function playSweep() {
  if (touched || props.reduced) return;
  const from = 86;
  const to = 50;
  const start = performance.now() + 350;
  const duration = 1500;
  const step = (now: number) => {
    const k = Math.min(1, Math.max(0, (now - start) / duration));
    const eased = 1 - Math.pow(1 - k, 4);
    split.value = from + (to - from) * eased;
    if (k < 1 && !touched) sweep = requestAnimationFrame(step);
  };
  split.value = from;
  sweep = requestAnimationFrame(step);
}
watch(seen, (value) => { if (value) playSweep(); });
onBeforeUnmount(() => cancelAnimationFrame(sweep));
</script>

<template>
  <section
    id="gyms"
    ref="root"
    class="gt"
    :class="{ 'is-in': seen || reduced, 'is-custom': !!customSrc, 'is-dragging': dragging }"
    aria-labelledby="gt-title"
    tabindex="-1"
  >
    <span id="trainers" class="gx-anchor" />
    <header class="gt-head">
      <div>
        <p class="gx-protocol gt-eyebrow gx-rise"><span>04</span>{{ t('trainer.eyebrow') }}</p>
        <h2 id="gt-title" class="gx-rise" style="--d: 1">{{ t('trainer.titleA') }}<br /><em>{{ t('trainer.titleB') }}</em></h2>
      </div>
      <p class="gt-lede gx-rise" style="--d: 2">{{ t('trainer.lede') }}</p>
    </header>

    <div class="gt-frame gx-rise" style="--d: 3">
      <div
        ref="stage"
        class="gt-stage"
        :style="{ '--gt-split': `${split.toFixed(2)}%` }"
        @pointerdown="grab"
        @pointermove="drag"
        @pointerup="release"
        @pointercancel="release"
      >
        <div class="gt-side gt-side--guide" aria-hidden="true">
          <video ref="guide" poster="/assets/gym3d/leg-press-guide.webp" muted playsinline loop preload="none" tabindex="-1" />
          <span class="gt-shade" />
        </div>
        <div class="gt-side gt-side--you">
          <video
            v-if="customSrc"
            class="gt-custom"
            :src="customSrc"
            muted
            playsinline
            loop
            autoplay
            @error="videoError"
          />
          <template v-else>
            <img class="gt-floor" src="/assets/gym3d/leg-press-poster.webp" width="900" height="900" alt="" loading="lazy" />
            <div class="gt-finder" aria-hidden="true">
              <i class="gt-finder__c gt-finder__c--tl" /><i class="gt-finder__c gt-finder__c--tr" />
              <i class="gt-finder__c gt-finder__c--bl" /><i class="gt-finder__c gt-finder__c--br" />
              <span class="gt-finder__grid" />
              <span class="gt-finder__rec gx-protocol"><b />{{ t('trainer.rec') }} <span>00:00:00</span></span>
            </div>
            <div class="gt-you">
              <h3>{{ t('trainer.placeholderTitle') }}</h3>
              <p>{{ t('trainer.placeholderBody') }}</p>
            </div>
          </template>
        </div>
        <p class="gt-label gt-label--guide" :class="{ 'is-hidden': split < 18 }">
          <span class="gx-protocol">{{ t('trainer.guideLabel') }}</span>{{ t('trainer.guideSub') }}
        </p>
        <p class="gt-label gt-label--you" :class="{ 'is-hidden': split > 82 }">
          <span class="gx-protocol">{{ t('trainer.yourLabel') }}</span>{{ t('trainer.yourSub') }}
        </p>
        <div class="gt-divider" aria-hidden="true">
          <span class="gt-handle">
            <svg viewBox="0 0 24 24"><path d="M9 7l-5 5 5 5M15 7l5 5-5 5" /></svg>
          </span>
        </div>
        <input
          class="gt-range"
          type="range"
          min="4"
          max="96"
          step="1"
          :value="Math.round(split)"
          :aria-label="t('trainer.compare')"
          @input="onRange"
          @pointerdown.stop
        />
      </div>
      <div class="gt-try">
        <label class="btn-ghost gt-file" :for="fileId">
          <HoloPill />
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m0 0L7 9m5-5 5 5M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" /></svg>
          {{ customSrc ? t('trainer.replaceClip') : t('trainer.tryClip') }}
          <input :id="fileId" type="file" accept="video/*" @change="preview" />
        </label>
        <button v-if="customSrc" type="button" class="gt-remove" @click="clearVideo">{{ t('trainer.removeClip') }}</button>
        <p class="gt-note" :class="{ 'is-alert': !!errorText }" role="status">
          {{ errorText || (customName ? `${customName} · ${t('trainer.local')}` : t('trainer.local')) }}
        </p>
      </div>
    </div>

    <dl class="gt-facts">
      <div v-for="(fact, i) in facts" :key="fact.key" class="gx-rise" :style="{ '--d': 4 + i }">
        <dt class="gx-protocol">{{ fact.key }}</dt>
        <dd>{{ fact.value }}</dd>
      </div>
    </dl>
  </section>
</template>

<style src="~/assets/css/gym-trainer.css"></style>
