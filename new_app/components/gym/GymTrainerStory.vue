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
useGymInstructionPreview(guide, () => near.value && !props.reduced, () => props.reduced, false, locale, legPressInstruction.slug);

/** Percent of the stage, from the left, where the trainer's side begins. */
const split = shallowRef(50);
const dragging = shallowRef(false);
let touched = false;
let sweep = 0;

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
    :class="{ 'is-in': seen || reduced, 'is-dragging': dragging }"
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
          <img
            class="gt-trainer"
            src="/assets/gym3d/trainer-instruction-preview.webp"
            width="1672"
            height="941"
            :alt="t('trainer.previewAlt')"
            loading="lazy"
          />
          <span class="gt-shade" />
          <div class="gt-you" :class="{ 'is-hidden': split > 54 }">
            <span class="gx-protocol">{{ t('trainer.previewLabel') }}</span>
            <h3>{{ t('trainer.videoTitle') }}</h3>
            <p>{{ t('trainer.videoByline') }}</p>
            <div class="gt-playback" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="m8 5 11 7-11 7z" /></svg>
              <span class="gt-playback__track"><i /></span>
              <span class="gx-protocol">00:12 / 01:24</span>
            </div>
          </div>
        </div>
        <p class="gt-label gt-label--guide" :class="{ 'is-hidden': split < 18 }">
          <span class="gx-protocol">{{ t('trainer.guideLabel') }}</span>
          <span class="gt-label__detail">{{ t('trainer.guideSub') }}</span>
        </p>
        <p class="gt-label gt-label--you" :class="{ 'is-hidden': split > 82 }">
          <span class="gx-protocol">{{ t('trainer.yourLabel') }}</span>
          <span class="gt-label__detail">{{ t('trainer.yourSub') }}</span>
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
      <p class="gt-caption">{{ t('trainer.caption') }}</p>
    </div>
  </section>
</template>

<style src="~/assets/css/gym-trainer.css"></style>
