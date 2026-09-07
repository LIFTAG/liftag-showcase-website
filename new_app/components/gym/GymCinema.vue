<script setup lang="ts">
import { probeTemporaryWebGL2 } from "~/utils/gymscan/device";
import {
  experienceDevice,
  type GymJourney,
  type GymProductView,
} from "~/utils/gymscan/journey";
import type { GymScanStage, FrameInfo } from "~/utils/gymscan/stage";
import type { CoachingState } from '~/utils/gymscan/coachingStage';
const props = defineProps<{
  journey: GymJourney;
  paused: boolean;
  reduced: boolean;
  productView: GymProductView;
  coaching: CoachingState;
}>();
const emit = defineEmits<{ ready: [value: boolean]; fallback: []; customError: []; mediaFailed: [value: boolean]; swept: [] }>();
const host = useTemplateRef<HTMLElement>("host");
const canvas = useTemplateRef<HTMLCanvasElement>("canvas");
const sticker = useTemplateRef<HTMLCanvasElement>("sticker");
const video = useTemplateRef<HTMLVideoElement>('video');
const customVideo = useTemplateRef<HTMLVideoElement>('customVideo');
const mediaActive = shallowRef(false);
const mediaFailed = shallowRef(false);
const recordingSrc = shallowRef('');
const filmVisible = computed(() => ['experience', 'the-tag', 'lifters', 'gyms'].includes(props.journey.chapter));
watch(mediaFailed, value => emit('mediaFailed', value));
const ready = shallowRef(false);
const fallback = shallowRef(false);
const key = shallowRef(0);
const showPoster = computed(
  () =>
    props.journey.chapter === "experience" &&
    (!ready.value || props.reduced || fallback.value),
);
const mouse = useSharedMouse();
let stage: GymScanStage | null = null;
let generation = 0,
  visible = true;
let bootFrame = 0;
let viewObserver: IntersectionObserver | null = null;
let resizeObserver: ResizeObserver | null = null;
let booting = false;
let swept = false;

function sync() {
  stage?.setAssemblyProgress(props.journey.assembly);
  stage?.setProgress(props.journey.film);
}
function resize() {
  if (!stage || !canvas.value) return;
  stage.resize();
  const width = canvas.value.clientWidth,
    height = canvas.value.clientHeight;
  const h = Math.min(height * (width < 761 ? 0.4 : 0.73), 640);
  const w = h * 0.475;
  stage.setHeroSlot({
    x: width < 761 ? (width - w) / 2 : width * 0.7 - w / 2,
    y: width < 761 ? Math.min(350, height * .48) : (height - h) / 2,
    w,
    h,
  });
  sync();
  activity();
}
function frame(info: FrameInfo) {
  if (!swept && info.act0.swept) {
    swept = true;
    emit("swept");
  }
}
function activity() {
  const active = ready.value && visible && !document.hidden && !props.paused && filmVisible.value;
  mediaActive.value = active && props.journey.film > .9 && !props.coaching.paused;
  if (active && props.journey.film > .72 && !recordingSrc.value && !mediaFailed.value) {
    recordingSrc.value = video.value?.canPlayType('video/webm; codecs="vp9"')
      ? '/assets/gym3d/recording/pivot-leg-press-demo.webm'
      : '/assets/gym3d/recording/pivot-leg-press-demo.mp4';
  }
  if (active) stage?.start();
  else stage?.stop();
  if (mediaActive.value && video.value?.paused) video.value.play().catch(() => {});
  else if (!mediaActive.value) video.value?.pause();
  if (mediaActive.value && props.coaching.frame.isOwner && props.coaching.customSrc) {
    if (customVideo.value?.paused) customVideo.value.play().catch(() => {});
  } else customVideo.value?.pause();
}
function mediaError() {
  if (!recordingSrc.value) return;
  if (recordingSrc.value.endsWith('.webm')) {
    recordingSrc.value = '/assets/gym3d/recording/pivot-leg-press-demo.mp4';
  } else mediaFailed.value = true;
}
function teardown() {
  cancelAnimationFrame(bootFrame);
  booting = false;
  video.value?.pause();
  customVideo.value?.pause();
  mediaActive.value = false;
  stage?.dispose();
  stage = null;
  ready.value = false;
  swept = false;
  emit("ready", false);
}
function failed(event?: Event) {
  event?.preventDefault();
  generation++;
  teardown();
  fallback.value = true;
  emit("fallback");
}
async function start() {
  if (booting || stage || props.reduced || !canvas.value || !filmVisible.value) return;
  const attempt = ++generation;
  booting = true;
  const saveData =
    (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection?.saveData ?? false;
  const device = experienceDevice(
    probeTemporaryWebGL2(),
    saveData,
    canvas.value.clientWidth <= 760,
  );
  if (!device.startStage) {
    booting = false;
    fallback.value = true;
    emit("fallback");
    return;
  }
  try {
    const { createGymScanStage } = await import("~/utils/gymscan/stage");
    if (generation !== attempt || !canvas.value) return;
    stage = createGymScanStage({
      canvas: canvas.value,
      overlayCanvas: sticker.value ?? undefined,
      device,
      reducedMotion: false,
      adaptiveQuality: true,
      onReady: () => {},
      onFrame: frame,
      readPointer: () => mouse.latest,
      readCoaching: () => ({ frame: props.coaching.frame, video: video.value, customVideo: customVideo.value, replay: props.coaching.replay, paused: props.coaching.paused }),
    });
    resize();
    await stage.load();
    if (attempt !== generation || !stage) return;
    resize();
    stage.setProductView(props.productView);
    if (props.journey.assembly > .05) stage.skipAct0();
    booting = false;
    ready.value = true;
    emit("ready", true);
    activity();
  } catch {
    if (attempt === generation) failed();
  }
}
async function scheduleStart() {
  const scheduled = generation;
  // Give the real fonts and semantic hero a painted frame before importing
  // Three.js. Shader setup must not become part of the text's critical path.
  await document.fonts.ready;
  if (scheduled !== generation || props.reduced || !canvas.value || !filmVisible.value) return;
  bootFrame = requestAnimationFrame(() => {
    bootFrame = requestAnimationFrame(() => {
      bootFrame = 0;
      if (scheduled === generation) start();
    });
  });
}
watch(() => props.journey, () => { sync(); activity(); });
watch(() => [props.coaching.paused, props.coaching.customSrc, props.coaching.frame.isOwner], () => nextTick(activity));
watch(() => [props.paused, props.journey.chapter], activity);
watch(filmVisible, async (active) => {
  if (!active) {
    generation++;
    teardown();
    recordingSrc.value = '';
    key.value++;
  } else if (!fallback.value) {
    await nextTick();
    scheduleStart();
  }
});
watch(
  () => props.productView,
  (value) => stage?.setProductView(value),
);
watch(
  () => props.reduced,
  async () => {
    generation++;
    teardown();
    fallback.value = false;
    key.value++;
    await nextTick();
    scheduleStart();
  },
);
onMounted(() => {
  resizeObserver = new ResizeObserver(resize);
  if (host.value) resizeObserver.observe(host.value);
  viewObserver = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false;
    activity();
  });
  if (host.value) viewObserver.observe(host.value);
  document.addEventListener("visibilitychange", activity);
  scheduleStart();
});
onBeforeUnmount(() => {
  generation++;
  teardown();
  resizeObserver?.disconnect();
  viewObserver?.disconnect();
  document.removeEventListener("visibilitychange", activity);
});
</script>
<template>
  <div
    ref="host"
    class="gx-cinema"
    :class="{ 'is-ready': ready, 'is-discovery': journey.chapter === 'discover' || journey.chapter === 'kit' }"
    aria-hidden="true"
  >
    <img
      v-if="showPoster"
      class="gx-cinema__poster"
      src="/assets/gym3d/leg-press-poster.webp"
      width="900"
      height="900"
      alt=""
    />
    <canvas :key="key" ref="canvas" @webglcontextlost="failed" />
    <video ref="video" class="gc-video-source" width="2" height="2" crossorigin="anonymous" muted playsinline loop :src="recordingSrc || undefined" preload="none" tabindex="-1" @loadeddata="activity" @error="mediaError" />
    <video v-if="coaching.customSrc && !coaching.frame.reduced" ref="customVideo" class="gc-video-source" width="2" height="2" :src="coaching.customSrc" muted playsinline loop preload="metadata" tabindex="-1" @loadeddata="activity" @error="emit('customError')" />
  </div>
  <canvas
    :key="`sticker-${key}`"
    ref="sticker"
    class="gx-sticker"
    aria-hidden="true"
  />
</template>
