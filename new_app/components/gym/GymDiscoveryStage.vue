<script setup lang="ts">
import type { createDiscoveryStage } from "~/utils/gymscan/discoveryStage";
import { discoveryEquipment } from "~/utils/gymscan/discoveryEquipment";
import { onMouseEvent, useSharedMouse } from "~/composables/useSharedMouse";
import {
  DISCOVERY_MORPH_START,
  GLOBE_FOCUS_PROGRESS,
  discoveryAt,
  discoveryListingBox,
  globePriorScale,
} from "~/utils/gymscan/discoveryTimeline";
import { cinemaPhoneSlot } from "~/utils/gymscan/handoff";
import {
  discoveryMapLocations,
  discoveryCountryLabels,
} from "~/utils/gymscan/discoveryMapLocations";
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
  resize: ResizeObserver | null = null,
  stopMouse: (() => void) | null = null;
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
  const liveGlobe = progress < GLOBE_FOCUS_PROGRESS + 0.01;
  const liveListing = progress >= GLOBE_FOCUS_PROGRESS && progress < 0.48;
  const liveFloor = progress >= 0.43 && progress < DISCOVERY_MORPH_START;
  if (time - last < (morphing || liveGlobe || liveListing || liveFloor ? 1000 / 60 : 1000 / 30)) {
    raf = requestAnimationFrame(draw);
    return;
  }
  const dt = Math.min(0.05, (time - last) / 1000);
  last = time;
  progress += (props.film.progress - progress) * (1 - Math.exp(-dt * 10));
  const showMap = !props.reduced && discoveryAt(progress).floor < 0.12;
  if (mapVisible.value !== showMap) mapVisible.value = showMap;
  let reveal = 1;
  let spawning = false;
  try {
    assemblySeconds += dt;
    const point = stage.draw(progress, assemblySeconds, dt, {
      mx: mouse.latest.mx,
      my: mouse.latest.my,
      hasPointer: mouse.latest.hasPointer,
      clientX: mouse.latest.clientX,
      clientY: mouse.latest.clientY,
    });
    point.equipment.forEach((p, i) => {
      const label = labelNodes[i];
      if (label) {
        label.style.transform = `translate(${Math.round(p.x)}px,${Math.round(p.y)}px) scale(${p.scale})`;
        label.style.opacity = String(p.alpha);
        label.style.visibility = p.alpha > 0.01 ? "visible" : "hidden";
        label.style.setProperty("--gd-label-mix", p.mix.toFixed(3));
      }
    });
    point.locations.forEach((p, i) => {
      const label = mapNodes[i];
      if (!label) return;
      label.style.transform = `translate(${Math.round(p.x)}px,${Math.round(p.y)}px)`;
      label.style.opacity = String(p.alpha);
      label.style.visibility = p.alpha > 0.01 ? "visible" : "hidden";
    });
    const nextPhase = point.focus < 0.05 ? 0 : point.focus < 0.97 ? 1 : 2;
    if (locationPhase.value !== nextPhase) locationPhase.value = nextPhase;
    reveal = point.reveal;
    spawning = point.spawning;
    publishEarthOut(reveal);
    publishListing(point.listing, point.floor, discoveryAt(progress).lift);
  } catch {
    lost();
    return;
  }
  if (
    liveGlobe ||
    liveListing ||
    reveal < 0.999 ||
    assemblySeconds < 4 ||
    morphing ||
    spawning ||
    time - movedAt < 1800
  )
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
function rootPage() {
  return host.value?.closest(".gx") as HTMLElement | null;
}
function publishEarthOut(reveal: number) {
  const sticky = host.value?.parentElement;
  sticky?.style.setProperty("--gd-reveal", reveal.toFixed(4));
  const page = rootPage();
  if (!page) return;
  page.style.setProperty("--gx-earth-out", reveal.toFixed(4));
  page.style.setProperty("--gx-earth-scale", globePriorScale(reveal).toFixed(5));
}
function clearEarthOut() {
  host.value?.parentElement?.style.removeProperty("--gd-reveal");
  const page = rootPage();
  page?.style.removeProperty("--gx-earth-out");
  page?.style.removeProperty("--gx-earth-scale");
  clearListing();
}
const listingBoxKeys = [
  "--gd-box-left",
  "--gd-box-top",
  "--gd-box-width",
  "--gd-box-height",
  "--gd-box-radius",
  "--gd-photo-h",
] as const;
const listingKeys = [
  "--gd-listing",
  "--gd-floor",
  "--gd-lift",
  ...listingBoxKeys,
] as const;
let listingRest: {
  left: number;
  top: number;
  width: number;
  height: number;
} | null = null;
function clearListing() {
  const sticky = host.value?.parentElement;
  listingRest = null;
  if (!sticky) return;
  for (const key of listingKeys) sticky.style.removeProperty(key);
}
function publishListing(listing: number, floor: number, lift: number) {
  const sticky = host.value?.parentElement;
  if (!sticky) return;
  sticky.style.setProperty("--gd-listing", listing.toFixed(4));
  sticky.style.setProperty("--gd-floor", floor.toFixed(4));
  sticky.style.setProperty("--gd-lift", lift.toFixed(4));
  const profile = sticky.querySelector(".gd-profile") as HTMLElement | null;
  if (!profile) return;
  if (!listingRest) {
    for (const key of listingBoxKeys) sticky.style.removeProperty(key);
    if (profile.offsetWidth < 8) return;
    listingRest = {
      left: profile.offsetLeft,
      top: profile.offsetTop,
      width: profile.offsetWidth,
      height: profile.offsetHeight,
    };
  }
  const box = discoveryListingBox(
    cinemaPhoneSlot(sticky.clientWidth, sticky.clientHeight),
    listingRest,
    listing,
  );
  sticky.style.setProperty("--gd-box-left", `${box.left.toFixed(1)}px`);
  sticky.style.setProperty("--gd-box-top", `${box.top.toFixed(1)}px`);
  sticky.style.setProperty("--gd-box-width", `${box.width.toFixed(1)}px`);
  sticky.style.setProperty("--gd-box-height", `${box.height.toFixed(1)}px`);
  sticky.style.setProperty("--gd-box-radius", `${box.radius.toFixed(1)}px`);
  sticky.style.setProperty("--gd-photo-h", `${box.photoH.toFixed(1)}px`);
}
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
    mapVisible.value = discoveryAt(progress).floor < 0.12;
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
    if (props.reduced) {
      mapVisible.value = false;
      clearListing();
    }
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
    else clearEarthOut();
    activity();
  });
  if (host.value) observer.observe(host.value);
  resize = new ResizeObserver(() => {
    listingRest = null;
    stage?.resize();
    activity();
  });
  if (host.value) resize.observe(host.value);
  document.addEventListener("visibilitychange", activity);
  stopMouse = onMouseEvent(() => {
    movedAt = performance.now();
    if (!raf) activity();
  });
});
onBeforeUnmount(() => {
  disposed = true;
  stop();
  observer?.disconnect();
  resize?.disconnect();
  stopMouse?.();
  document.removeEventListener("visibilitychange", activity);
  clearEarthOut();
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
      <p class="gd-map-status" role="status">{{ ['One connected gym network', 'A closer look at Slovakia', '8 gyms in Slovakia.'][locationPhase] }}</p>
      <button v-if="locationPhase === 2" class="gd-map-open" @click="emit('open')">Explore a gym listing <span aria-hidden="true">↗</span></button>
    </div>
    <div ref="labels" class="gd-machine-labels" aria-hidden="true">
      <span v-for="item in discoveryEquipment" :key="item.id">{{ item.number }}</span>
    </div>
    <div
      v-if="reduced"
      class="gd-earth-fallback"
      aria-hidden="true"
    />
  </div>
</template>
