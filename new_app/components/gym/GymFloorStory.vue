<script setup lang="ts">
import { en, sk } from '~/i18n/messages/gymDemo';
import type { FloorStage } from '~/utils/gymscan/floorStage';
import type { FloorAppCopy, FloorAppNameLayout } from '~/utils/gymscan/floorAppScreen';
import { floorEquipment } from '~/utils/gymscan/floorEquipment';
import {
  FLOOR_BEATS,
  floorBeatAt,
  floorBeatFill,
  floorBeatTarget,
  type FloorBeat,
} from '~/utils/gymscan/floorTimeline';
import { storyProgress } from '~/utils/gymscan/storyBeats';
import { clamp01 } from '~/utils/gymscan/timeline';
import { onMouseEvent, useSharedMouse } from '~/composables/useSharedMouse';
import { useStableViewportHeight } from '~/composables/useStableViewportHeight';

const props = defineProps<{ reduced: boolean }>();
const { t } = useI18n({ useScope: 'local', messages: { en, sk } });
const { locale } = useSiteLocale();
const mouse = useSharedMouse();
const root = useTemplateRef<HTMLElement>('root');
const pane = useTemplateRef<HTMLElement>('pane');
const canvas = useTemplateRef<HTMLCanvasElement>('canvas');
const tagLayer = useTemplateRef<HTMLElement>('tagLayer');
const beat = shallowRef<FloorBeat>(0);
/** How the app sets each name, once the stage has measured it. */
const nameLayout = shallowRef<FloorAppNameLayout[] | null>(null);
const ready = shallowRef(false);
const unavailable = shallowRef(false);
/** No pinned film: reduced motion, no WebGL, or the stage failed. */
const still = computed(() => props.reduced || unavailable.value);
const beats = computed(() =>
  Array.from({ length: FLOOR_BEATS }, (_, i) => ({
    name: t(`floor.beats.${i}.name`),
    line: t(`floor.beats.${i}.line`),
    title: t(`floor.beats.${i}.title`),
    copy: t(`floor.beats.${i}.copy`),
  })),
);
const machines = computed(() =>
  floorEquipment.map((item) => ({
    ...item,
    name: t(`floor.names.${item.id}`),
    area: t(`floor.areas.${item.area}`),
  })),
);
// Each floor name is set in the lines its app row uses, so it lands on them.
const labels = computed(() =>
  machines.value.map((item, i) => {
    const layout = nameLayout.value?.[i];
    return {
      id: item.id,
      lines: layout?.lines ?? [item.name],
      style: { '--gf-wrap': layout?.wrap ?? 0, '--gf-leading': layout?.leading ?? 0 },
    };
  }),
);
function appCopy(): FloorAppCopy {
  return {
    overview: t('floor.overview'),
    title: t('floor.appTitle'),
    city: t('floor.city'),
    find: t('floor.find'),
    equipment: t('floor.equipment'),
    machines: t('floor.machines'),
    view: t('floor.view'),
    names: Object.fromEntries(floorEquipment.map((item) => [item.id, t(`floor.names.${item.id}`)])) as FloorAppCopy['names'],
    areas: {
      strength: t('floor.areas.strength'),
      freeWeights: t('floor.areas.freeWeights'),
      cardio: t('floor.areas.cardio'),
    },
  };
}

let stage: FloorStage | null = null;
let stageModule: Promise<typeof import('~/utils/gymscan/floorStage')> | null = null;
let generation = 0;
let booting = false;
let disposed = false;
let nearby = false;
let visible = false;
let raf = 0;
let scrollRaf = 0;
let last = 0;
let pointerAt = 0;
let target = 0;
let shown = 0;
let entryTarget = 0;
let entryShown = 0;
let snap = true;
let tagNodes: HTMLElement[] = [];
let labelNodes: HTMLElement[] = [];
let warm: IntersectionObserver | null = null;
let view: IntersectionObserver | null = null;
let resize: ResizeObserver | null = null;
let stopMouse: (() => void) | null = null;

function measure() {
  scrollRaf = 0;
  const el = root.value;
  const box = pane.value;
  if (!el || !box) return;
  const rect = el.getBoundingClientRect();
  const paneH = box.offsetHeight;
  target = still.value ? 0 : storyProgress(rect.top, el.offsetHeight, paneH);
  // How far the pane has risen into the viewport before it pins.
  const viewport = Math.max(paneH, useStableViewportHeight() || innerHeight);
  entryTarget = clamp01(1 - rect.top / viewport);
  for (let i = 0; i < FLOOR_BEATS; i++) {
    el.style.setProperty(`--gf-fill-${i}`, floorBeatFill(target, i).toFixed(4));
  }
  const next = still.value ? 0 : floorBeatAt(target);
  if (next !== beat.value) beat.value = next;
  kick();
}

function schedule() {
  if (!scrollRaf) scrollRaf = requestAnimationFrame(measure);
}

function kick() {
  if (raf || !stage || !ready.value || !visible || still.value || document.hidden) return;
  raf = requestAnimationFrame(frame);
}

function collectTags() {
  const layer = tagLayer.value;
  tagNodes = layer ? Array.from(layer.querySelectorAll<HTMLElement>('.gf-tag')) : [];
  labelNodes = layer ? Array.from(layer.querySelectorAll<HTMLElement>('.gf-label')) : [];
}

function writeTags(tags: ReturnType<FloorStage['draw']>['tags']) {
  tags.forEach((tag, i) => {
    const node = tagNodes[i];
    const label = labelNodes[i];
    if (!node || !label) return;
    const alpha = tag.alpha.toFixed(3);
    const visibility = tag.alpha > 0.01 ? 'visible' : 'hidden';
    const mix = tag.mix.toFixed(3);
    node.style.transform = `translate3d(${tag.x.toFixed(1)}px,${tag.y.toFixed(1)}px,0) scale(${tag.scale.toFixed(3)})`;
    node.style.opacity = alpha;
    node.style.visibility = visibility;
    node.style.setProperty('--gf-leader', tag.leader.toFixed(3));
    node.style.setProperty('--gf-mix', mix);
    label.style.transform = `translate3d(${tag.nameX.toFixed(1)}px,${tag.nameY.toFixed(1)}px,0) scale(${tag.nameScale.toFixed(3)})`;
    label.style.opacity = alpha;
    label.style.visibility = visibility;
    label.style.setProperty('--gf-mix', mix);
    label.style.setProperty('--gf-pill', tag.pill.toFixed(3));
  });
}

function frame(now: number) {
  raf = 0;
  if (!stage || !ready.value || !visible || still.value || document.hidden) {
    last = 0;
    return;
  }
  const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
  last = now;
  if (snap) {
    shown = target;
    entryShown = entryTarget;
    snap = false;
  } else {
    // One smoothing stage for camera, machines and tags alike.
    const k = 1 - Math.exp(-dt * 9);
    shown += (target - shown) * k;
    entryShown += (entryTarget - entryShown) * k;
    if (Math.abs(target - shown) < 2e-4) shown = target;
    if (Math.abs(entryTarget - entryShown) < 2e-4) entryShown = entryTarget;
  }
  let out: ReturnType<FloorStage['draw']>;
  try {
    out = stage.draw(shown, entryShown, entryShown > 0.55, dt, mouse.latest);
  } catch {
    lost();
    return;
  }
  writeTags(out.tags);
  const moving =
    shown !== target ||
    entryShown !== entryTarget ||
    out.spawning ||
    out.tilting ||
    now - pointerAt < 200;
  if (moving) raf = requestAnimationFrame(frame);
  else last = 0;
}

function lost(event?: Event) {
  event?.preventDefault();
  generation++;
  booting = false;
  cancelAnimationFrame(raf);
  raf = 0;
  ready.value = false;
  stage?.dispose();
  stage = null;
  unavailable.value = true;
}

function loadModule() {
  return (stageModule ??= import('~/utils/gymscan/floorStage'));
}

async function boot() {
  if (stage || booting || disposed || still.value || !canvas.value) return;
  booting = true;
  const attempt = ++generation;
  try {
    const module = await loadModule();
    if (attempt !== generation || disposed || still.value || !canvas.value) return;
    stage = module.createFloorStage(canvas.value, { copy: appCopy() });
    await stage.ready;
    if (attempt !== generation || disposed || still.value) return;
    nameLayout.value = stage.nameLayout();
    snap = true;
    ready.value = true;
    measure();
  } catch {
    if (!disposed && attempt === generation) lost();
  } finally {
    if (attempt === generation) booting = false;
  }
}

/** Go to a beat by scrolling; the pinned pane does the rest. */
function go(index: number) {
  const el = root.value;
  const box = pane.value;
  if (!el || !box || still.value) return;
  const start = el.getBoundingClientRect().top + scrollY;
  const viewport = Math.max(box.offsetHeight, useStableViewportHeight() || innerHeight);
  window.scrollTo({
    top: start + (el.offsetHeight - viewport) * floorBeatTarget(index),
    behavior: 'smooth',
  });
}

function onVisibility() {
  if (!document.hidden) kick();
}

watch(locale, () => {
  if (!stage) return;
  stage.setCopy(appCopy());
  nameLayout.value = stage.nameLayout();
});
watch(still, (value) => {
  if (value) {
    generation++;
    cancelAnimationFrame(raf);
    raf = 0;
    stage?.dispose();
    stage = null;
    ready.value = false;
  } else if (nearby) {
    void nextTick(boot);
  }
  void nextTick(() => {
    collectTags();
    measure();
  });
});

onMounted(() => {
  collectTags();
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  if (saveData) unavailable.value = true;
  measure();
  window.addEventListener('scroll', schedule, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  resize = new ResizeObserver(() => {
    stage?.resize();
    snap = true;
    measure();
  });
  if (pane.value) resize.observe(pane.value);
  if (root.value) resize.observe(root.value);
  // Fetch and build the stage a couple of screens early, so the floor is
  // ready to scan in by the time the pane arrives.
  warm = new IntersectionObserver(([entry]) => {
    nearby = entry?.isIntersecting ?? false;
    if (nearby) {
      void loadModule().catch(() => { stageModule = null; });
      void boot();
    }
  }, { rootMargin: '200% 0px' });
  view = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false;
    if (visible) {
      snap = true;
      kick();
    } else if (target === 0) {
      // Scrolled back above the chapter: the next arrival scans again.
      stage?.rescan();
    }
  });
  if (root.value) {
    warm.observe(root.value);
    view.observe(root.value);
  }
  stopMouse = onMouseEvent(() => {
    if (!visible) return;
    pointerAt = performance.now();
    kick();
  });
});

onBeforeUnmount(() => {
  disposed = true;
  generation++;
  cancelAnimationFrame(raf);
  cancelAnimationFrame(scrollRaf);
  warm?.disconnect();
  view?.disconnect();
  resize?.disconnect();
  stopMouse?.();
  window.removeEventListener('scroll', schedule);
  document.removeEventListener('visibilitychange', onVisibility);
  stage?.dispose();
  stage = null;
});
</script>

<template>
  <section
    id="floor"
    ref="root"
    class="gf"
    :class="[
      `is-beat-${beat}`,
      { 'is-pinned': !still, 'is-still': still, 'is-ready': ready && !still },
    ]"
    aria-labelledby="gf-title"
    tabindex="-1"
  >
    <div ref="pane" class="gf-pane">
      <canvas
        v-if="!still"
        ref="canvas"
        class="gf-canvas"
        aria-hidden="true"
        @webglcontextlost="lost"
      />
      <!-- Holds the floor's place while the machines load. -->
      <div v-if="!still" class="gf-standby" aria-hidden="true"><i /></div>
      <div v-if="!still" ref="tagLayer" class="gf-tags" aria-hidden="true">
        <!-- Names first, so every number badge sits above every name pill. -->
        <span v-for="item in labels" :key="`name-${item.id}`" class="gf-label" :style="item.style">
          <span class="gf-label__text"
            >{{ item.lines[0] }}<span v-if="item.lines[1]" class="gf-label__wrap">{{ item.lines[1] }}</span></span
          >
        </span>
        <span v-for="item in machines" :key="item.id" class="gf-tag">
          <b class="gf-tag__num">{{ item.number }}</b>
        </span>
      </div>

      <div class="gf-copy">
        <p class="gx-protocol gf-eyebrow"><span>06</span>{{ t('floor.eyebrow') }}</p>
        <h2 id="gf-title">{{ t('floor.titleA') }}<br /><em>{{ t('floor.titleB') }}</em></h2>
        <p class="gf-lede">{{ t('floor.lede') }}</p>
        <ol class="gf-rail" :aria-label="t('floor.beatsLabel')">
          <li v-for="(item, i) in beats" :key="i" :class="{ 'is-on': still || beat === i }">
            <button
              type="button"
              :aria-current="!still && beat === i ? 'step' : undefined"
              :disabled="still"
              @click="go(i)"
            >
              <span class="gf-rail__idx gx-protocol">0{{ i + 1 }}</span>
              <span class="gf-rail__text">
                <span class="gf-rail__name">{{ item.name }}</span>
                <span class="gf-rail__line">{{ item.line }}</span>
              </span>
              <span class="gf-rail__bar" aria-hidden="true"><i /></span>
            </button>
            <p class="gf-rail__more">{{ item.copy }}</p>
          </li>
        </ol>
      </div>

      <!-- The finished screen as real markup: what screen readers get while
           the film plays, and what everyone sees without it. -->
      <figure class="gf-app" :aria-label="t('floor.screenAlt')">
        <div class="gf-app__screen">
          <p class="gf-app__status" aria-hidden="true">9:41</p>
          <p class="gf-app__back gx-protocol"><span aria-hidden="true">‹</span>{{ t('floor.overview') }}</p>
          <p class="gf-app__title">{{ t('floor.appTitle') }}</p>
          <p class="gf-app__city">{{ t('floor.city') }}</p>
          <p class="gf-app__search" aria-hidden="true">{{ t('floor.find') }}</p>
          <p class="gf-app__head">
            <span>{{ t('floor.equipment') }}</span><span>{{ machines.length }} {{ t('floor.machines') }}</span>
          </p>
          <ol :aria-label="t('floor.listLabel')">
            <li v-for="item in machines" :key="item.id">
              <img :src="item.poster" width="500" height="500" alt="" loading="lazy" />
              <span class="gf-app__meta"><b>{{ item.number }}</b>{{ item.area }}</span>
              <strong>{{ item.name }}</strong>
              <span class="gf-app__view">{{ t('floor.view') }}</span>
            </li>
          </ol>
        </div>
        <span class="gf-app__island" aria-hidden="true" />
      </figure>

      <p class="gf-note gx-protocol">{{ t('floor.note') }}</p>
    </div>
  </section>
</template>

<style src="~/assets/css/gym-floor.css"></style>
