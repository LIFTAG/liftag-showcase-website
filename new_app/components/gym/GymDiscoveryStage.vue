<script setup lang="ts">
import type { createDiscoveryStage } from "~/utils/gymscan/discoveryStage";
import { discoveryEquipment } from "~/utils/gymscan/discoveryEquipment";
import { useSharedMouse } from "~/composables/useSharedMouse";
import { DISCOVERY_MORPH_START } from "~/utils/gymscan/discoveryTimeline";
import { discoveryMapLocations, discoveryCountryLabels } from "~/utils/gymscan/discoveryMapLocations";
const mouse = useSharedMouse();
const props = defineProps<{
  film: { progress: number };
  reduced: boolean;
  replay: number;
}>();
const emit = defineEmits<{ open: []; unavailable: [] }>();
const host = useTemplateRef<HTMLElement>("host");
const canvas = useTemplateRef<HTMLCanvasElement>("canvas");
const map = useTemplateRef<HTMLElement>("map");
const locationPhase = shallowRef(0);
const mapVisible = shallowRef(false);
const ready = shallowRef(false);
const labels = useTemplateRef<HTMLElement>("labels");
let labelNodes: HTMLElement[] = [];
let mapNodes: HTMLElement[] = [];
let assemblySeconds = 0;
let stage: ReturnType<typeof createDiscoveryStage> | null = null;
let observer: IntersectionObserver | null = null,
  resize: ResizeObserver | null = null;
let movedAt = 0;
let visible = false,
  booting = false,
  failed = false,
  disposed = false,
  raf = 0,
  last = 0,
  progress = 0;
function stop() {
  cancelAnimationFrame(raf);
  raf = 0;
}
function lost(event?: Event) {
  event?.preventDefault();
  failed = true;
  stop();
  ready.value = false;
  stage?.dispose();
  stage = null;
  emit("unavailable");
}
function draw(time: number) {
  raf = 0;
  if (!stage || !visible || document.hidden || props.reduced) return;
  const morphing = progress >= DISCOVERY_MORPH_START;
  const liveGlobe = progress < 0.28;
  if (time - last < (morphing || liveGlobe ? 1000 / 60 : 1000 / 30)) {
    raf = requestAnimationFrame(draw);
    return;
  }
  const dt = Math.min(0.05, (time - last) / 1000);
  last = time;
  progress += (props.film.progress - progress) * (1 - Math.exp(-dt * 10));
  const showMap = !props.reduced && progress < 0.27;
  if (mapVisible.value !== showMap) mapVisible.value = showMap;
  try {
    assemblySeconds += dt;
    const point = stage.draw(progress, assemblySeconds, dt, {
      mx: mouse.latest.mx,
      my: mouse.latest.my,
      hasPointer: mouse.latest.hasPointer,
    });
    point.equipment.forEach((p, i) => {
      const label = labelNodes[i];
      if (label) {
        label.style.transform = `translate(${p.x}px,${p.y}px)`;
        label.style.opacity = String(p.alpha);
      }
    });
    point.locations.forEach((p, i) => {
      const label = mapNodes[i];
      if (!label) return;
      label.style.transform = `translate(${p.x}px,${p.y}px)`;
      label.style.opacity = String(p.alpha);
      label.style.visibility = p.alpha > 0.01 ? "visible" : "hidden";
    });
    const nextPhase = point.focus < 0.05 ? 0 : point.focus < 0.97 ? 1 : 2;
    if (locationPhase.value !== nextPhase) locationPhase.value = nextPhase;
  } catch {
    lost();
    return;
  }
  if (liveGlobe || assemblySeconds < 3 || morphing || time - movedAt < 1800)
    raf = requestAnimationFrame(draw);
}
watch(
  () => props.film.progress,
  () => {
    movedAt = performance.now();
    if (!raf) activity();
  },
);
watch(
  () => props.replay,
  () => {
    assemblySeconds = 0;
    activity();
  },
);
function activity() {
  stop();
  if (stage && visible && !document.hidden && !props.reduced) {
    last = performance.now();
    movedAt = last;
    raf = requestAnimationFrame(draw);
  }
}
async function boot() {
  if (stage || booting || failed || disposed || props.reduced || !canvas.value)
    return;
  booting = true;
  try {
    const module = await import("~/utils/gymscan/discoveryStage");
    if (disposed || !canvas.value) return;
    stage = module.createDiscoveryStage(canvas.value);
    await stage.ready;
    if (disposed || failed) return;
    ready.value = true;
    progress = props.film.progress;
    mapVisible.value = progress < 0.27;
    activity();
  } catch {
    if (!disposed) lost();
  } finally {
    booting = false;
  }
}
watch(
  () => props.reduced,
  () => {
    if (props.reduced) mapVisible.value = false;
    if (visible) boot();
    activity();
  },
);
onMounted(() => {
  labelNodes = Array.from(
    labels.value?.querySelectorAll<HTMLElement>("span") ?? [],
  );
  mapNodes = Array.from(map.value?.querySelectorAll<HTMLElement>("[data-map-label]") ?? []);
  if (
    (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection?.saveData
  ) {
    lost();
    return;
  }
  observer = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false;
    if (visible) boot();
    activity();
  });
  if (host.value) observer.observe(host.value);
  resize = new ResizeObserver(() => {
    stage?.resize();
    activity();
  });
  if (host.value) resize.observe(host.value);
  document.addEventListener("visibilitychange", activity);
});
onBeforeUnmount(() => {
  disposed = true;
  stop();
  observer?.disconnect();
  resize?.disconnect();
  document.removeEventListener("visibilitychange", activity);
  stage?.dispose();
});
</script>
<template>
  <div ref="host" class="gd-stage" :class="{ 'is-ready': ready && !reduced }">
    <canvas ref="canvas" aria-hidden="true" @webglcontextlost="lost" />
    <div ref="map" class="gd-map-labels" v-show="mapVisible">
      <div
        v-for="location in discoveryMapLocations"
        :key="location.id"
        data-map-label
        class="gd-map-location"
        :class="[`gd-location-${location.id}`, { 'is-slovak': location.country === 'Slovakia' }]"
      >
        <span class="gd-map-dot" aria-hidden="true" />
        <span class="gd-map-name">{{ location.city }}<small>{{ location.count }} {{ location.count === 1 ? 'gym' : 'gyms' }}</small></span>
      </div>
      <span
        v-for="country in discoveryCountryLabels"
        :key="country.city"
        data-map-label
        class="gd-map-country"
        :class="{ 'is-primary': country.primary }"
        aria-hidden="true"
      >{{ country.city }}</span>
    </div>
    <div v-if="mapVisible" class="gd-map-context">
      <p class="gd-map-route" aria-label="From the world to gyms in Slovakia">
        <span :class="{ 'is-current': locationPhase === 0 }">The world</span><i aria-hidden="true">/</i>
        <span :class="{ 'is-current': locationPhase > 0 }">Slovakia</span>
      </p>
      <p class="gd-map-status" role="status">{{ ['One connected gym network', 'A closer look at Slovakia', '2 gyms in Slovakia. 6 nearby.'][locationPhase] }}</p>
      <button v-if="locationPhase === 2" class="gd-map-open" @click="emit('open')">Explore a gym listing <span aria-hidden="true">↗</span></button>
    </div>
    <div ref="labels" class="gd-machine-labels" aria-hidden="true">
      <span v-for="item in discoveryEquipment" :key="item.id">{{ item.number }}</span>
    </div>
    <div
      v-if="!ready || reduced"
      class="gd-earth-fallback"
      aria-hidden="true"
    />
  </div>
</template>
