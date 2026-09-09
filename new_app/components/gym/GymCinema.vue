<script setup lang="ts">
import { probeTemporaryWebGL2 } from "~/utils/gymscan/device";
import { cinemaPhoneSlot, compactLoggerOwnsCopy } from "~/utils/gymscan/handoff";
import {
  experienceDevice,
  type GymProductView,
} from "~/utils/gymscan/journey";
import type { GymScanStage, FrameInfo } from "~/utils/gymscan/stage";
import { gymJourneyKey } from "~/composables/useGymJourney";
import { gymCoachingKey } from "~/composables/useCoachingScroll";
const props = defineProps<{
  paused: boolean;
  reduced: boolean;
  productView: GymProductView;
}>();
function requireFilm<T>(value: T | undefined): T {
  if (!value) throw new Error("GymCinema must render inside GymExperience");
  return value;
}
const journey = requireFilm(inject(gymJourneyKey));
const coaching = requireFilm(inject(gymCoachingKey));
const emit = defineEmits<{ ready: [value: boolean]; fallback: []; customError: []; mediaFailed: [value: boolean]; swept: [] }>();
const host = useTemplateRef<HTMLElement>("host");
const canvas = useTemplateRef<HTMLCanvasElement>("canvas");
const sticker = useTemplateRef<HTMLCanvasElement>("sticker");
const video = useTemplateRef<HTMLVideoElement>('video');
const customVideo = useTemplateRef<HTMLVideoElement>('customVideo');
const mediaActive = shallowRef(false);
const { failed: mediaFailed } = useGymInstructionPreview(video, () => mediaActive.value, () => props.reduced, true);
watch(mediaFailed, value => emit('mediaFailed', value));
const ready = shallowRef(false);
const fallback = shallowRef(false);
const key = shallowRef(0);
const showPoster = computed(
  () =>
    journey.value.chapter === "experience" &&
    (props.reduced || fallback.value),
);
const discoveryFilm = computed(() => {
  const chapter = journey.value.chapter;
  return chapter === "discover" || chapter === "kit";
});
const customSrc = computed(() => coaching.value.customSrc);
const mouse = useSharedMouse();
let stage: GymScanStage | null = null;
let generation = 0,
  visible = true;
let bootFrame = 0;
let viewObserver: IntersectionObserver | null = null;
let resizeObserver: ResizeObserver | null = null;
let copyFlying = false;
let copyBlur = false;
let copyLogger = false;
let copyDof = -1;
let swept = false;
let earthPoll = 0;

function sync() {
  stage?.setAssemblyProgress(journey.value.assembly);
  stage?.setProgress(journey.value.film);
}
function resize() {
  if (!stage || !canvas.value) return;
  stage.resize();
  const width = canvas.value.clientWidth,
    height = canvas.value.clientHeight;
  stage.setHeroSlot(cinemaPhoneSlot(width, height));
  sync();
  activity();
}
function copyRoot() {
  return host.value?.parentElement ?? null;
}
function syncCopy(info: FrameInfo) {
  const journey = copyRoot();
  if (!journey) return;
  const flying = info.act0.shot === "fly";
  const blur = info.dof > 0.001;
  const logger = compactLoggerOwnsCopy(
    (canvas.value?.clientWidth ?? 0) < 761,
    info.fold,
    info.heroMorph,
  );
  if (flying !== copyFlying) {
    copyFlying = flying;
    journey.classList.toggle("is-stick-front", flying);
  }
  if (blur !== copyBlur) {
    copyBlur = blur;
    journey.classList.toggle("is-copy-blur", blur);
    if (!blur) journey.style.removeProperty("--gx-dof");
  }
  if (logger !== copyLogger) {
    copyLogger = logger;
    journey.classList.toggle("is-logger-front", logger);
  }
  if (blur && Math.abs(info.dof - copyDof) >= 0.004) {
    copyDof = info.dof;
    journey.style.setProperty("--gx-dof", info.dof.toFixed(3));
  }
}
function clearCopy() {
  const journey = copyRoot();
  copyFlying = false;
  copyBlur = false;
  copyLogger = false;
  copyDof = -1;
  if (!journey) return;
  journey.classList.remove("is-stick-front", "is-copy-blur", "is-logger-front");
  journey.style.removeProperty("--gx-dof");
}
function frame(info: FrameInfo) {
  syncCopy(info);
  if (!swept && info.act0.swept) {
    swept = true;
    emit("swept");
  }
}
function activity() {
  const chapter = journey.value.chapter;
  const earthOut = import.meta.client
    ? Number.parseFloat(
        getComputedStyle(host.value?.closest(".gx") ?? document.documentElement)
          .getPropertyValue("--gx-earth-out") || "0",
      )
    : 1;
  const pullingBack =
    (chapter === "discover" || chapter === "kit") && earthOut < 0.97;
  const filmVisible =
    ["experience", "the-tag", "lifters", "gyms"].includes(chapter) || pullingBack;
  const active = ready.value && visible && !document.hidden && !props.paused && filmVisible;
  if (pullingBack && !earthPoll) {
    earthPoll = requestAnimationFrame(() => {
      earthPoll = 0;
      activity();
    });
  }
  const nextMedia = active && journey.value.film > .9 && !coaching.value.paused;
  if (mediaActive.value !== nextMedia) mediaActive.value = nextMedia;
  if (active) stage?.start();
  else stage?.stop();
  if (nextMedia && coaching.value.frame.isOwner && coaching.value.customSrc) customVideo.value?.play().catch(() => {});
  else customVideo.value?.pause();
}
function teardown() {
  cancelAnimationFrame(bootFrame);
  cancelAnimationFrame(earthPoll);
  earthPoll = 0;
  stage?.dispose();
  stage = null;
  ready.value = false;
  swept = false;
  emit("ready", false);
  clearCopy();
}
function failed(event?: Event) {
  event?.preventDefault();
  generation++;
  teardown();
  fallback.value = true;
  emit("fallback");
}
async function start() {
  const attempt = ++generation;
  if (props.reduced || !canvas.value) return;
  const saveData =
    (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection?.saveData ?? false;
  const device = experienceDevice(
    probeTemporaryWebGL2(),
    saveData,
    canvas.value.clientWidth <= 760,
    canvas.value.clientWidth,
    canvas.value.clientHeight,
  );
  if (!device.startStage) {
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
      readCoaching: () => ({ frame: coaching.value.frame, video: video.value, customVideo: customVideo.value, replay: coaching.value.replay }),
    });
    resize();
    await stage.load();
    if (attempt !== generation || !stage) return;
    resize();
    stage.setProductView(props.productView);
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
  if (scheduled !== generation || props.reduced || !canvas.value) return;
  bootFrame = requestAnimationFrame(() => {
    bootFrame = requestAnimationFrame(() => {
      bootFrame = 0;
      if (scheduled === generation) start();
    });
  });
}
watch(journey, () => { sync(); activity(); });
watch(() => [coaching.value.paused, coaching.value.customSrc, coaching.value.frame.isOwner], () => nextTick(activity));
watch(() => [props.paused, journey.value.chapter], activity);
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
    :class="{ 'is-ready': ready, 'is-discovery': discoveryFilm }"
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
    <video ref="video" class="gc-video-source" crossorigin="anonymous" muted playsinline loop preload="none" tabindex="-1" @error="mediaFailed = true" />
    <video v-if="customSrc" ref="customVideo" class="gc-video-source" :src="customSrc" muted playsinline loop preload="metadata" tabindex="-1" @loadeddata="activity" @error="emit('customError')" />
  </div>
  <canvas
    :key="`sticker-${key}`"
    ref="sticker"
    class="gx-sticker"
    aria-hidden="true"
  />
</template>
