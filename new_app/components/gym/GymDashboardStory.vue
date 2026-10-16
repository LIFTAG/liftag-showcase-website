<script setup lang="ts">
import { en, sk } from '~/i18n/messages/gymDemo';
import {
  DASHBOARD_TOUR_CHAPTERS,
  DASHBOARD_TOUR_EDGES,
  dashboardChapterAt,
  dashboardChapterFill,
  dashboardTourWrap,
} from '~/utils/gymscan/dashboardTour';

const props = defineProps<{ reduced: boolean }>();
const emit = defineEmits<{ kit: [] }>();
const { t } = useI18n({ useScope: 'local', messages: { en, sk } });
const root = useTemplateRef<HTMLElement>('root');
const frame = useTemplateRef<HTMLElement>('frame');
const video = useTemplateRef<HTMLVideoElement>('video');
const seen = useSeenOnce(root);
const near = useNearViewport(frame, '400px 0px');
const chapter = shallowRef(0);
const playing = shallowRef(false);
/** A visitor's pause wins over the in-view autoplay until they press play. */
const held = shallowRef(false);
const visible = shallowRef(false);
let io: IntersectionObserver | null = null;
let raf = 0;

const chapters = computed(() =>
  Array.from({ length: DASHBOARD_TOUR_CHAPTERS }, (_, i) => ({
    name: t(`dash.chapters.${i}.name`),
    line: t(`dash.chapters.${i}.line`),
  })),
);

function paintProgress(time: number) {
  const el = root.value;
  if (!el) return;
  for (let i = 0; i < DASHBOARD_TOUR_CHAPTERS; i++) {
    el.style.setProperty(`--gdb-fill-${i}`, dashboardChapterFill(time, i).toFixed(3));
  }
}

function onTime() {
  const el = video.value;
  if (!el) return;
  const wrap = dashboardTourWrap(el.currentTime);
  if (wrap !== null) {
    el.currentTime = wrap;
    return;
  }
  const next = dashboardChapterAt(el.currentTime);
  if (next !== chapter.value) chapter.value = next;
  paintProgress(el.currentTime);
}

function sync() {
  const el = video.value;
  if (!el) return;
  const run = visible.value && !held.value && !props.reduced && !document.hidden;
  if (run) {
    if (el.currentTime < DASHBOARD_TOUR_EDGES[0]) el.currentTime = DASHBOARD_TOUR_EDGES[0];
    el.play().catch(() => {});
  } else el.pause();
}

function toggle() {
  const el = video.value;
  if (!el) return;
  if (el.paused) {
    held.value = false;
    if (el.currentTime < DASHBOARD_TOUR_EDGES[0]) el.currentTime = DASHBOARD_TOUR_EDGES[0];
    el.play().catch(() => {});
  } else {
    held.value = true;
    el.pause();
  }
}

/** Phones show the whole desk small; full screen is where it can be read. */
function expand() {
  const el = video.value as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
  if (!el) return;
  held.value = false;
  if (el.currentTime < DASHBOARD_TOUR_EDGES[0]) el.currentTime = DASHBOARD_TOUR_EDGES[0];
  el.play().catch(() => {});
  // iPhone Safari only takes a video full screen through its own call.
  if (el.requestFullscreen) el.requestFullscreen().catch(() => el.webkitEnterFullscreen?.());
  else el.webkitEnterFullscreen?.();
}

function go(index: number) {
  const el = video.value;
  if (!el) return;
  el.currentTime = DASHBOARD_TOUR_EDGES[index]! + 0.05;
  chapter.value = index;
  paintProgress(el.currentTime);
  held.value = false;
  el.play().catch(() => {});
}

/** The window rises out of a slight lean as it scrolls up into place. */
function tilt() {
  raf = 0;
  const el = frame.value;
  if (!el || props.reduced) return;
  const rect = el.getBoundingClientRect();
  const k = Math.min(1, Math.max(0, (innerHeight - rect.top) / (innerHeight * 0.75)));
  el.style.setProperty('--gdb-rise', (1 - k).toFixed(4));
}
function scheduleTilt() {
  if (!raf) raf = requestAnimationFrame(tilt);
}

watch([visible, held, () => props.reduced], sync);
watch(near, (value) => {
  const el = video.value;
  if (value && el && el.preload !== 'auto') {
    el.preload = 'auto';
    el.load();
  }
});
watch(() => props.reduced, (value) => {
  if (value) frame.value?.style.setProperty('--gdb-rise', '0');
  else tilt();
});

onMounted(() => {
  paintProgress(0);
  tilt();
  window.addEventListener('scroll', scheduleTilt, { passive: true });
  document.addEventListener('visibilitychange', sync);
  io = new IntersectionObserver(([entry]) => { visible.value = entry?.isIntersecting ?? false; }, { threshold: 0.35 });
  if (frame.value) io.observe(frame.value);
});
onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
  window.removeEventListener('scroll', scheduleTilt);
  document.removeEventListener('visibilitychange', sync);
  io?.disconnect();
  video.value?.pause();
});
</script>

<template>
  <section
    id="dashboard"
    ref="root"
    class="gdb"
    :class="{ 'is-in': seen || reduced, 'is-playing': playing }"
    aria-labelledby="gdb-title"
    tabindex="-1"
  >
    <header class="gdb-head">
      <p class="gx-protocol gdb-eyebrow gx-rise"><span>07</span>{{ t('dash.eyebrow') }}</p>
      <h2 id="gdb-title" class="gx-rise" style="--d: 1">{{ t('dash.titleA') }} <em>{{ t('dash.titleB') }}</em></h2>
      <p class="gdb-lede gx-rise" style="--d: 2">{{ t('dash.lede') }}</p>
    </header>

    <div class="gdb-stage">
      <ol class="gdb-chapters" :aria-label="t('dash.chaptersLabel')">
        <li v-for="(item, i) in chapters" :key="i" :class="{ 'is-on': chapter === i }" class="gx-rise" :style="{ '--d': 3 + i }">
          <button type="button" :aria-current="chapter === i ? 'step' : undefined" @click="go(i)">
            <span class="gdb-chapters__bar" aria-hidden="true"><i /></span>
            <span class="gx-protocol gdb-chapters__idx">0{{ i + 1 }}</span>
            <span class="gdb-chapters__name">{{ item.name }}</span>
            <span class="gdb-chapters__line">{{ item.line }}</span>
          </button>
        </li>
      </ol>
      <figure ref="frame" class="gdb-window">
        <div class="gdb-screen">
          <video
            ref="video"
            muted
            playsinline
            preload="none"
            poster="/assets/screens/dashboard-tour.webp"
            :aria-label="t('dash.videoLabel')"
            @timeupdate="onTime"
            @seeked="onTime"
            @playing="playing = true"
            @pause="playing = false"
            @ended="go(0)"
          >
            <source src="/assets/videos/macbook-dashboard.av1.mp4" type='video/mp4; codecs="av01.0.08M.08"' />
            <source src="/assets/videos/macbook-dashboard.mp4" type='video/mp4; codecs="avc1.640028"' />
          </video>
          <button type="button" class="gdb-expand" :aria-label="t('dash.expand')" @click="expand">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" /></svg>
          </button>
          <button type="button" class="gdb-play" :aria-label="playing ? t('dash.pause') : t('dash.play')" @click="toggle">
            <svg v-if="playing" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5h3v14H8zM13 5h3v14h-3z" /></svg>
            <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" /></svg>
          </button>
        </div>
      </figure>

      <a class="btn-primary gdb-cta gx-rise" style="--d: 7" href="#kit" @click="emit('kit')">{{ t('dash.cta') }}</a>
    </div>
  </section>
</template>

<style src="~/assets/css/gym-dashboard.css"></style>
