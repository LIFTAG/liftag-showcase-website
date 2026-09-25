<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue';
import { en, sk } from '~/i18n/messages/gymDemo';
import { discoveryHub } from '~/utils/gymscan/discoveryGyms';
import { mapListings } from '~/utils/gymscan/mapListings';
import {
  ORBIT_MASK,
  orbitArc,
  orbitCamera,
  orbitCities,
  orbitExtras,
  orbitGym,
  orbitRoutes,
  orbitShot,
  type OrbitCamera,
} from '~/utils/gymscan/orbitMap';
import type { OrbitDots } from '~/utils/gymscan/orbitPaint';

const props = defineProps<{ reduced: boolean }>();
const { t } = useI18n({ useScope: 'local', messages: { en, sk } });
const { href } = useSiteLocale();
const root = useTemplateRef<HTMLElement>('root');
const stage = useTemplateRef<HTMLElement>('stage');
const canvas = useTemplateRef<HTMLCanvasElement>('canvas');
const cardRef = useTemplateRef<ComponentPublicInstance>('card');
const leaderRef = useTemplateRef<SVGPathElement>('leader');
const seen = useSeenOnce(root, 0.25);
const selected = shallowRef(discoveryHub.id);
const size = shallowRef({ width: 0, height: 0 });
const ready = shallowRef(false);
/** The crane has (nearly) settled: pins, routes and the card may land. */
const landed = shallowRef(false);
const inView = shallowRef(false);
const compact = computed(() => size.value.width > 0 && size.value.width <= 760);

const cities = orbitCities;
const extras = orbitExtras;
const routes = orbitRoutes;
const pinNodes: (HTMLElement | null)[] = [];
const stemNodes: (SVGLineElement | null)[] = [];
const extraNodes: (SVGCircleElement | null)[] = [];
const arcNodes: (SVGPathElement | null)[] = [];

const facts = computed(() =>
  [0, 1, 2].map((i) => ({ key: t(`map.facts.${i}.key`), value: t(`map.facts.${i}.value`) })),
);
const activeIndex = computed(() => Math.max(0, cities.findIndex((gym) => gym.id === selected.value)));
const active = computed(() => cities[activeIndex.value] ?? discoveryHub);
const listing = computed(() => mapListings[active.value.id] ?? mapListings[discoveryHub.id]!);

/** The crane settles from a high approach while the land lights up. */
const ENTRY_MS = 3200;
let paint: typeof import('~/utils/gymscan/orbitPaint') | null = null;
let dots: OrbitDots | null = null;
let mask: Uint8Array | null = null;
let loading: Promise<void> | null = null;
let failed = false;
let cam: OrbitCamera | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let entry = 0;
let entryStart = 0;
let drift = 0;
let driftTarget = 0;
let raf = 0;
let last = 0;
let touched = false;
/** Pointer or focus is on the card: the tour waits while it is being read. */
let held = false;
let cycle: ReturnType<typeof setInterval> | null = null;
let resize: ResizeObserver | null = null;
let warm: IntersectionObserver | null = null;
let view: IntersectionObserver | null = null;
let cardBox: { x: number; y: number; w: number } | null = null;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = (v: number) => 1 - Math.pow(1 - v, 3);

/** Mask image and painter, fetched when the chapter is near rather than with the page. */
function load() {
  loading ??= Promise.all([
    import('~/utils/gymscan/orbitPaint'),
    new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = ORBIT_MASK.src;
    }),
  ]).then(([module, image]) => {
    paint = module;
    mask = module.readOrbitMask(image);
    layout();
  });
  return loading;
}

function spacing() {
  return compact.value ? 5 : 6.5;
}

function layout() {
  const el = stage.value;
  const c = canvas.value;
  if (!el || !c) return;
  const width = el.clientWidth;
  const height = el.clientHeight;
  if (!width || !height) return;
  const changed = width !== size.value.width || height !== size.value.height;
  size.value = { width, height };
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  c.width = Math.round(width * dpr);
  c.height = Math.round(height * dpr);
  ctx = c.getContext('2d');
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (paint && mask && (changed || !dots)) build(width, height);
  nextTick(() => {
    measureCard();
    draw();
  });
}

/**
 * Rebuild the dot field for this stage size in ~8 ms slices, keeping the old
 * field on screen meanwhile. Every camera the chapter can show is sampled, so
 * the kept dots cover the whole flight.
 */
let building = 0;
function build(width: number, height: number) {
  if (!paint || !mask) return;
  const shots = props.reduced
    ? [orbitShot(1)]
    : [orbitShot(1), orbitShot(1, -1), orbitShot(1, 1), ...[0.75, 0.5, 0.25, 0].map((t) => orbitShot(t))];
  const job = paint.orbitDotsJob(mask, shots.map((shot) => orbitCamera(width, height, shot)), spacing());
  const token = ++building;
  const step = () => {
    if (token !== building) return;
    const end = performance.now() + 8;
    let next = job.next();
    while (!next.done && performance.now() < end) next = job.next();
    if (!next.done) {
      setTimeout(step, 0);
      return;
    }
    dots = next.value;
    draw();
    start();
  };
  step();
}

function measureCard() {
  const el = cardRef.value?.$el as HTMLElement | undefined;
  const host = stage.value;
  if (!el || !host) return;
  const a = el.getBoundingClientRect();
  const b = host.getBoundingClientRect();
  cardBox = { x: a.left - b.left, y: a.top - b.top, w: a.width };
}

function draw() {
  const { width, height } = size.value;
  if (!width) return;
  const settle = props.reduced ? 1 : easeOut(entry);
  cam = orbitCamera(width, height, orbitShot(settle, props.reduced ? 0 : drift));
  if (ctx && paint && dots) {
    const wave = props.reduced ? 1 : clamp01(entry / 0.55);
    paint.paintOrbit(ctx, cam, dots, {
      reveal: wave >= 1 ? Infinity : easeOut(wave) * 0.8,
      sky: props.reduced ? 1 : clamp01(entry / 0.25),
      spacing: spacing(),
    });
    ready.value = true;
  }
  if (entry >= 0.5) landed.value = true;
  place(cam);
}

/** Pins, stems, routes and the card leader follow the camera without Vue. */
function place(camera: OrbitCamera) {
  cities.forEach((gym, i) => {
    const { base, head } = orbitGym(camera, gym);
    const pin = pinNodes[i];
    const stem = stemNodes[i];
    if (!base || !head) return;
    if (pin) {
      pin.style.transform = `translate3d(${head.x.toFixed(1)}px,${head.y.toFixed(1)}px,0)`;
      pin.classList.toggle('is-flip', head.x > camera.width - 150);
    }
    if (stem) {
      stem.setAttribute('x1', base.x.toFixed(1));
      stem.setAttribute('y1', base.y.toFixed(1));
      stem.setAttribute('x2', head.x.toFixed(1));
      stem.setAttribute('y2', head.y.toFixed(1));
    }
  });
  extras.forEach((gym, i) => {
    const { base } = orbitGym(camera, gym);
    if (!base) return;
    extraNodes[i]?.setAttribute('cx', base.x.toFixed(1));
    extraNodes[i]?.setAttribute('cy', base.y.toFixed(1));
  });
  routes.forEach((gym, i) => arcNodes[i]?.setAttribute('d', orbitArc(camera, discoveryHub, gym)));
  const leader = leaderRef.value;
  if (!leader) return;
  const head = orbitGym(camera, active.value).head;
  if (!head || !cardBox) {
    leader.setAttribute('d', '');
    return;
  }
  const endX = Math.min(Math.max(head.x, cardBox.x + 36), cardBox.x + cardBox.w - 36);
  const endY = cardBox.y - 10;
  const midY = head.y + (endY - head.y) * 0.55;
  leader.setAttribute(
    'd',
    `M${head.x.toFixed(1)} ${(head.y + 12).toFixed(1)}C${head.x.toFixed(1)} ${midY.toFixed(1)} ${endX.toFixed(1)} ${midY.toFixed(1)} ${endX.toFixed(1)} ${endY.toFixed(1)}`,
  );
}

function frame(now: number) {
  raf = 0;
  const dt = Math.min(0.05, (now - (last || now)) / 1000);
  last = now;
  if (entryStart) entry = clamp01((now - entryStart) / ENTRY_MS);
  drift += (driftTarget - drift) * (1 - Math.exp(-dt * 5));
  if (Math.abs(driftTarget - drift) < 0.0005) drift = driftTarget;
  draw();
  // Render on demand: only while the crane is settling or the drift catching up.
  if ((entryStart && entry < 1) || drift !== driftTarget) raf = requestAnimationFrame(frame);
}

/** Start the loop from rest; the first frame measures no elapsed time. */
function kick() {
  if (raf) return;
  last = 0;
  raf = requestAnimationFrame(frame);
}

/** −1 as the chapter rises into view, 1 as it leaves. */
function onScroll() {
  const el = root.value;
  if (!el || props.reduced) return;
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  driftTarget = Math.max(-1, Math.min(1, (vh / 2 - (rect.top + rect.height / 2)) / (vh / 2 + rect.height / 2)));
  kick();
}

function start() {
  if (entryStart || !seen.value || (!dots && !failed)) return;
  if (props.reduced || failed) {
    entry = 1;
    draw();
    return;
  }
  onScroll();
  drift = driftTarget;
  entryStart = performance.now();
  kick();
}

function choose(id: string) {
  touched = true;
  selected.value = id;
}

function step(direction: -1 | 1) {
  choose(cities[(activeIndex.value + direction + cities.length) % cities.length]!.id);
}

function engage() {
  touched = true;
}

function hold(value: boolean) {
  held = value;
}

function syncCycle() {
  const run = inView.value && !touched && !props.reduced;
  if (run && !cycle) {
    cycle = setInterval(() => {
      if (touched || held || document.hidden) return;
      selected.value = cities[(activeIndex.value + 1) % cities.length]!.id;
    }, 4200);
  } else if (!run && cycle) {
    clearInterval(cycle);
    cycle = null;
  }
}

watch(seen, start);
watch(selected, () => nextTick(() => cam && place(cam)));
watch(() => props.reduced, () => {
  dots = null;
  entry = props.reduced ? 1 : entry;
  syncCycle();
  layout();
});
watch(inView, (value) => {
  syncCycle();
  if (value) {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    // Re-entering at the edge: take up the drift there rather than sweep to it.
    drift = driftTarget;
  } else {
    window.removeEventListener('scroll', onScroll);
    cancelAnimationFrame(raf);
    raf = 0;
  }
});

onMounted(() => {
  layout();
  resize = new ResizeObserver(() => layout());
  if (stage.value) resize.observe(stage.value);
  warm = new IntersectionObserver(([hit]) => {
    if (!hit?.isIntersecting) return;
    warm?.disconnect();
    load().catch(() => {
      // No map, but the pins, routes and card still work over the plain backdrop.
      failed = true;
      start();
    });
  }, { rootMargin: '150% 0px' });
  view = new IntersectionObserver(([hit]) => { inView.value = hit?.isIntersecting ?? false; });
  if (root.value) {
    warm.observe(root.value);
    view.observe(root.value);
  }
});
onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
  window.removeEventListener('scroll', onScroll);
  resize?.disconnect();
  warm?.disconnect();
  view?.disconnect();
  if (cycle) clearInterval(cycle);
});
</script>

<template>
  <section
    id="discover"
    ref="root"
    class="gmap"
    :class="{ 'is-in': seen || reduced, 'is-ready': ready, 'is-landed': landed, 'is-hub': active.hub }"
    aria-labelledby="gmap-title"
    tabindex="-1"
  >
    <div ref="stage" class="gmap-stage">
      <canvas ref="canvas" class="gmap-canvas" aria-hidden="true" />
      <svg
        class="gmap-lines"
        :viewBox="size.width ? `0 0 ${size.width} ${size.height}` : undefined"
        aria-hidden="true"
      >
        <path
          v-for="(route, i) in routes"
          :key="route.id"
          :ref="(el) => { arcNodes[i] = el as SVGPathElement | null }"
          class="gmap-arc"
          :class="{ 'is-on': route.city === active.city }"
          :style="{ '--i': i }"
          pathLength="1"
        />
        <line
          v-for="(gym, i) in cities"
          :key="gym.id"
          :ref="(el) => { stemNodes[i] = el as SVGLineElement | null }"
          class="gmap-stem"
          :class="{ 'is-on': gym.id === selected }"
          :style="{ '--i': i }"
        />
        <circle
          v-for="(gym, i) in extras"
          :key="gym.id"
          :ref="(el) => { extraNodes[i] = el as SVGCircleElement | null }"
          class="gmap-extra"
          r="2.5"
        />
        <path v-if="!compact" :key="selected" ref="leader" class="gmap-leader" pathLength="1" />
      </svg>
      <ul class="gmap-pins" :aria-label="t('map.mapLabel')">
        <li
          v-for="(pin, i) in cities"
          :key="pin.id"
          :ref="(el) => { pinNodes[i] = el as HTMLElement | null }"
          :style="{ '--i': i }"
          :class="{ 'is-hub': pin.hub, 'is-on': pin.id === selected }"
        >
          <button
            type="button"
            :aria-pressed="pin.id === selected"
            :aria-label="t('map.selectGym', { city: pin.city })"
            @click="choose(pin.id)"
          >
            <span class="gmap-pin" aria-hidden="true" />
          </button>
          <span class="gmap-city gx-protocol" aria-hidden="true">{{ pin.city }}</span>
        </li>
      </ul>
      <GymMapCard
        ref="card"
        :gym-id="active.id"
        :city="active.city"
        :listing="listing"
        :index="activeIndex"
        :total="cities.length"
        :compact="compact"
        @step="step"
        @engage="engage"
        @hold="hold"
      />
      <p class="gmap-note gx-protocol">{{ t('map.note') }}</p>
    </div>

    <div class="gmap-copy">
      <p class="gx-protocol gmap-eyebrow gx-rise"><span>05</span>{{ t('map.eyebrow') }}</p>
      <h2 id="gmap-title" class="gx-rise" style="--d: 1">{{ t('map.titleA') }}<br /><em>{{ t('map.titleB') }}</em></h2>
      <p class="gmap-lede gx-rise" style="--d: 2">{{ t('map.lede') }}</p>
      <dl class="gmap-facts">
        <div v-for="(fact, i) in facts" :key="fact.key" class="gx-rise" :style="{ '--d': 3 + i }">
          <dt class="gx-protocol">{{ fact.key }}</dt>
          <dd>{{ fact.value }}</dd>
        </div>
      </dl>
      <NuxtLink class="btn-ghost gmap-link gx-rise" style="--d: 6" :to="href('/explore')"><HoloPill />{{ t('discovery.explore') }} ↗</NuxtLink>
    </div>
  </section>
</template>

<style src="~/assets/css/gym-map.css"></style>
