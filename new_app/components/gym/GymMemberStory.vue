<script setup lang="ts">
import { en, sk } from '~/i18n/messages/gymDemo';
import { legPressInstruction } from '~/utils/gymscan/equipment';
import { HERO_PHONE_TILT_LERP, heroPointerTilt, pointerTowardBox, type PhoneBox } from '~/utils/gymscan/handoff';
import {
  MEMBER_PHONE_REST,
  memberPhonePerspective,
  memberPhoneSlot,
} from '~/utils/gymscan/memberPhone';
import {
  MEMBER_BEATS,
  memberBeatAt,
  memberBeatFill,
  memberBeatTarget,
  memberProgress,
  type MemberBeat,
} from '~/utils/gymscan/memberStory';
import { damp } from '~/utils/gymscan/timeline';
import { onMouseEvent, useSharedMouse } from '~/composables/useSharedMouse';
import { useStableViewportHeight } from '~/composables/useStableViewportHeight';

const props = defineProps<{ reduced: boolean; enhanced: boolean }>();
const { t } = useI18n({ useScope: 'local', messages: { en, sk } });
const { locale } = useSiteLocale();
const { docked, settled } = useGymPhoneDock();
const mouse = useSharedMouse();
const root = useTemplateRef<HTMLElement>('root');
const pane = useTemplateRef<HTMLElement>('pane');
const phone = useTemplateRef<HTMLElement>('phone');
const video = useTemplateRef<HTMLVideoElement>('video');
const beat = shallowRef<MemberBeat>(0);
const inView = shallowRef(false);
const playing = shallowRef(false);
const sound = shallowRef(false);
const guideActive = computed(() => inView.value && !props.reduced);
const { exercise, failed } = useGymInstructionPreview(
  video,
  () => guideActive.value,
  () => props.reduced,
  false,
  locale,
  legPressInstruction.slug,
);
/** The DOM phone owns the pixels whenever there is no 3D phone to hand over. */
const phoneShown = computed(() => props.reduced || !props.enhanced || docked.value);
const beats = computed(() =>
  Array.from({ length: MEMBER_BEATS }, (_, i) => ({
    name: t(`watch.beats.${i}.name`),
    line: t(`watch.beats.${i}.line`),
    title: t(`watch.beats.${i}.title`),
    copy: t(`watch.beats.${i}.copy`),
  })),
);
const guideName = computed(() => exercise.value?.name || t('watch.guide'));
const numbers = computed(() => new Intl.NumberFormat(locale.value === 'sk' ? 'sk-SK' : 'en-US'));
const sets = [
  { weight: 70, reps: 8 },
  { weight: 75, reps: 7 },
] as const;
const volume = computed(() => numbers.value.format(sets.reduce((sum, set) => sum + set.weight * set.reps, 0)));

let slot: PhoneBox = { x: 0, y: 0, w: 0, h: 0 };
let raf = 0;
let lean = 0;
let leanLast = 0;
let rotX: number = MEMBER_PHONE_REST.x;
let rotY: number = MEMBER_PHONE_REST.y;
let snapLean = true;
let resize: ResizeObserver | null = null;
let view: IntersectionObserver | null = null;
let stopMouse: (() => void) | null = null;

function layout() {
  const el = pane.value;
  if (!el) return;
  const width = el.clientWidth;
  const height = el.clientHeight;
  slot = memberPhoneSlot(width, height);
  const style = el.style;
  style.setProperty('--gm-x', `${slot.x.toFixed(2)}px`);
  style.setProperty('--gm-y', `${slot.y.toFixed(2)}px`);
  style.setProperty('--gm-w', `${slot.w.toFixed(2)}px`);
  style.setProperty('--gm-h', `${slot.h.toFixed(2)}px`);
  style.setProperty('--gm-persp', `${memberPhonePerspective(height).toFixed(1)}px`);
}

function update() {
  raf = 0;
  const el = root.value;
  const box = pane.value;
  if (!el || !box) return;
  const rect = el.getBoundingClientRect();
  const progress = props.reduced ? 0 : memberProgress(rect.top, el.offsetHeight, box.offsetHeight);
  el.style.setProperty('--gm-progress', progress.toFixed(4));
  for (let i = 0; i < MEMBER_BEATS; i++) {
    el.style.setProperty(`--gm-fill-${i}`, memberBeatFill(progress, i).toFixed(4));
  }
  const next = props.reduced ? 0 : memberBeatAt(progress);
  if (next !== beat.value) beat.value = next;
  // The cinema parks its phone when the section top crosses the header line;
  // the DOM phone only matches it pixel for pixel once the pane is pinned and
  // the scan capture on the parked glass has reached the logger it shows.
  // Once docked, the pane keeps the device until it unpins upward; a stage
  // that finishes loading mid-chapter must not take the phone back.
  const dock =
    !props.reduced &&
    rect.top <= 0.5 &&
    (docked.value || settled.value || !props.enhanced || next > 0);
  if (docked.value !== dock) docked.value = dock;
}

function schedule() {
  if (!raf) raf = requestAnimationFrame(update);
}

function onResize() {
  layout();
  schedule();
  kickLean();
}

/** Scroll a beat into place. The pinned pane does the rest. */
function go(index: number) {
  const el = root.value;
  const box = pane.value;
  if (!el || !box || props.reduced) return;
  const start = el.getBoundingClientRect().top + scrollY;
  const viewport = Math.max(box.offsetHeight, useStableViewportHeight() || innerHeight);
  window.scrollTo({
    top: start + (el.offsetHeight - viewport) * memberBeatTarget(index),
    behavior: 'smooth',
  });
}

function leanTarget() {
  let x: number = MEMBER_PHONE_REST.x;
  let y: number = MEMBER_PHONE_REST.y;
  const pointer = mouse.latest;
  const box = pane.value;
  if (pointer.hasPointer && !props.reduced && box) {
    const rect = box.getBoundingClientRect();
    const toward = pointerTowardBox(pointer.clientX, pointer.clientY, rect.left, rect.top, slot);
    const tilt = heroPointerTilt(toward.mx, toward.my);
    x += tilt.rotX;
    y += tilt.rotY;
  }
  return { x, y };
}

function writeLean() {
  const el = phone.value;
  if (!el) return;
  el.style.setProperty('--gm-rx', `${(-rotX).toFixed(4)}rad`);
  el.style.setProperty('--gm-ry', `${rotY.toFixed(4)}rad`);
}

/** The parked 3D phone nods at the cursor. Its DOM successor has to as well. */
function leanFrame(now: number) {
  lean = 0;
  const dt = leanLast ? Math.min(0.05, (now - leanLast) / 1000) : 1 / 60;
  leanLast = now;
  const target = leanTarget();
  if (snapLean) {
    rotX = target.x;
    rotY = target.y;
    snapLean = false;
  } else {
    rotX = damp(rotX, target.x, HERO_PHONE_TILT_LERP, dt);
    rotY = damp(rotY, target.y, HERO_PHONE_TILT_LERP, dt);
  }
  writeLean();
  const still = Math.abs(rotX - target.x) < 1e-4 && Math.abs(rotY - target.y) < 1e-4;
  if (!still && inView.value) lean = requestAnimationFrame(leanFrame);
  else leanLast = 0;
}

function kickLean() {
  if (lean || !inView.value || props.reduced) return;
  lean = requestAnimationFrame(leanFrame);
}

function toggleSound() {
  const el = video.value;
  if (!el) return;
  el.muted = !el.muted;
  sound.value = !el.muted;
  if (!el.muted) el.play().catch(() => {});
}

function onTime() {
  const el = video.value;
  if (!el || !el.duration) return;
  root.value?.style.setProperty('--gm-guide', (el.currentTime / el.duration).toFixed(3));
}

watch(beat, (next, previous) => {
  const el = video.value;
  if (!el) return;
  // Each visit to the guide starts it from the first frame of the setup.
  if (next === 1 && previous !== 1 && !props.reduced) {
    el.currentTime = 0;
    el.play().catch(() => {});
  }
  if (next !== 1 && !el.muted) {
    el.muted = true;
    sound.value = false;
  }
});
watch(settled, schedule);
watch(docked, (value) => {
  if (value) {
    snapLean = true;
    kickLean();
  }
});
watch(inView, (value) => {
  if (value) kickLean();
  else if (video.value && !video.value.muted) {
    video.value.muted = true;
    sound.value = false;
  }
});
watch(
  () => props.reduced,
  () => nextTick(() => {
    rotX = MEMBER_PHONE_REST.x;
    rotY = MEMBER_PHONE_REST.y;
    writeLean();
    layout();
    schedule();
  }),
);

onMounted(() => {
  layout();
  update();
  writeLean();
  window.addEventListener('scroll', schedule, { passive: true });
  resize = new ResizeObserver(onResize);
  if (pane.value) resize.observe(pane.value);
  if (root.value) resize.observe(root.value);
  view = new IntersectionObserver(([entry]) => {
    inView.value = entry?.isIntersecting ?? false;
  }, { rootMargin: '200px 0px' });
  if (root.value) view.observe(root.value);
  stopMouse = onMouseEvent(kickLean);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
  cancelAnimationFrame(lean);
  resize?.disconnect();
  view?.disconnect();
  stopMouse?.();
  window.removeEventListener('scroll', schedule);
  docked.value = false;
});
</script>

<template>
  <section
    id="lifters"
    ref="root"
    class="gm"
    :class="[
      `is-beat-${beat}`,
      {
        'is-pinned': !reduced,
        'is-shown': phoneShown,
        'is-in': inView,
        'is-playing': playing && !failed,
        'is-sound': sound,
      },
    ]"
    aria-labelledby="gm-title"
    tabindex="-1"
  >
    <span id="progress" class="gx-anchor" />
    <div ref="pane" class="gm-pane">
      <div class="gm-copy">
        <p class="gx-protocol gm-eyebrow"><span>03</span>{{ t('watch.eyebrow') }}</p>
        <h2 id="gm-title">{{ t('watch.titleA') }}<br /><em>{{ t('watch.titleB') }}</em></h2>
        <p class="gm-lede">{{ t('watch.lede') }}</p>
        <ol class="gm-rail" :aria-label="t('watch.beatsLabel')">
          <li v-for="(item, i) in beats" :key="i" :class="{ 'is-on': beat === i }">
            <button type="button" :aria-current="!reduced && beat === i ? 'step' : undefined" :disabled="reduced" @click="go(i)">
              <span class="gm-rail__idx gx-protocol">0{{ i + 1 }}</span>
              <span class="gm-rail__text">
                <span class="gm-rail__name">{{ item.name }}</span>
                <span class="gm-rail__line">{{ item.line }}</span>
              </span>
              <span class="gm-rail__bar" aria-hidden="true"><i /></span>
            </button>
            <p class="gm-rail__more">{{ item.copy }}</p>
          </li>
        </ol>
        <p class="gm-now"><span class="gx-protocol">0{{ beat + 1 }} / 03</span>{{ beats[beat]!.title }}</p>
      </div>

      <div class="gm-stage">
        <figure ref="phone" class="gm-phone">
          <div class="gm-phone__screen">
            <div class="gm-phone__ui">
              <img
                class="gm-phone__shot"
                src="/assets/gym3d/log-set.webp"
                width="620"
                height="1344"
                :alt="t('watch.phoneAlt')"
              />
              <div class="gm-phone__guide" aria-hidden="true">
                <video
                  ref="video"
                  poster="/assets/gym3d/leg-press-guide.webp"
                  muted
                  playsinline
                  loop
                  preload="none"
                  tabindex="-1"
                  @playing="playing = true"
                  @pause="playing = false"
                  @emptied="playing = false"
                  @timeupdate="onTime"
                />
                <span class="gm-phone__guide-shade" />
                <span class="gm-phone__guide-tag">{{ t('watch.guideLabel') }}</span>
                <span class="gm-phone__guide-name">{{ guideName }}</span>
                <span class="gm-phone__guide-bar"><i /></span>
              </div>
              <span class="gm-phone__spot" aria-hidden="true" />
              <span class="gm-phone__marker gx-protocol" aria-hidden="true">0{{ beat + 1 }}</span>
              <span class="gm-phone__press" aria-hidden="true" />
              <span class="gm-phone__row" aria-hidden="true" />
            </div>
          </div>
          <span class="gm-phone__island" aria-hidden="true" />
        </figure>
      </div>

      <div class="gm-readouts">
        <article class="gm-readout" :class="{ 'is-on': reduced || beat === 0 }" :inert="!reduced && beat !== 0">
          <p class="gm-readout__head gx-protocol"><span>01 / 03</span><i />{{ beats[0]!.name }}</p>
          <h3>{{ beats[0]!.title }}</h3>
          <p>{{ beats[0]!.copy }}</p>
          <div class="gm-readout__tag">
            <img src="/assets/gym3d/qr-sticker.webp" width="827" height="874" alt="" loading="lazy" />
            <dl class="gm-specs">
              <div><dt>{{ t('watch.specMachine') }}</dt><dd>{{ t('watch.machine') }}</dd></div>
              <div><dt>{{ t('watch.specMuscles') }}</dt><dd>{{ t('watch.muscles') }}</dd></div>
              <div><dt>{{ t('watch.specTarget') }}</dt><dd>{{ t('watch.target') }}</dd></div>
            </dl>
          </div>
        </article>
        <article class="gm-readout" :class="{ 'is-on': reduced || beat === 1 }" :inert="!reduced && beat !== 1">
          <p class="gm-readout__head gx-protocol"><span>02 / 03</span><i />{{ beats[1]!.name }}</p>
          <h3>{{ beats[1]!.title }}</h3>
          <p>{{ beats[1]!.copy }}</p>
          <dl class="gm-specs">
            <div><dt>{{ t('watch.specGuide') }}</dt><dd>{{ guideName }}</dd></div>
            <div><dt>{{ t('watch.specAudio') }}</dt><dd>{{ t('watch.audio') }}</dd></div>
            <div><dt>{{ t('watch.specSource') }}</dt><dd>{{ t('watch.source') }}</dd></div>
          </dl>
          <button
            v-if="!reduced && !failed"
            type="button"
            class="gm-sound"
            :aria-pressed="sound"
            @click="toggleSound"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
              <path v-if="sound" class="gm-sound__wave" d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a7.8 7.8 0 0 1 0 11" />
              <path v-else class="gm-sound__wave" d="M16 9.5l5 5M21 9.5l-5 5" />
            </svg>
            {{ sound ? t('watch.soundOff') : t('watch.soundOn') }}
          </button>
        </article>
        <article class="gm-readout" :class="{ 'is-on': reduced || beat === 2 }" :inert="!reduced && beat !== 2">
          <p class="gm-readout__head gx-protocol"><span>03 / 03</span><i />{{ beats[2]!.name }}</p>
          <h3>{{ beats[2]!.title }}</h3>
          <p>{{ beats[2]!.copy }}</p>
          <div class="gm-receipt">
            <p class="gx-protocol">{{ t('watch.receiptTitle') }}</p>
            <ol>
              <li v-for="(set, i) in sets" :key="i">
                <span class="gx-protocol">#{{ i + 1 }}</span>{{ set.weight }} kg × {{ set.reps }}
                <b aria-hidden="true">✓</b>
              </li>
            </ol>
            <p class="gm-receipt__total"><span class="gx-protocol">{{ t('watch.volume') }}</span>{{ volume }} kg</p>
            <p class="gm-receipt__saved"><span class="gx-dot" />{{ t('watch.saved') }}</p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style src="~/assets/css/gym-member.css"></style>
