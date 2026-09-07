<script setup lang="ts">
import type { createDiscoveryStage } from "~/utils/gymscan/discoveryStage";
import { discoveryEquipment } from "~/utils/gymscan/discoveryEquipment";
import { useSharedMouse } from "~/composables/useSharedMouse";
import { DISCOVERY_MORPH_START } from "~/utils/gymscan/discoveryTimeline";
const mouse = useSharedMouse();
const props = defineProps<{
  progress: number;
  reduced: boolean;
  replay: number;
}>();
const emit = defineEmits<{ open: []; unavailable: [] }>();
const host = useTemplateRef<HTMLElement>("host");
const canvas = useTemplateRef<HTMLCanvasElement>("canvas");
const pin = useTemplateRef<HTMLElement>("pin");
const ready = shallowRef(false);
const labels = useTemplateRef<HTMLElement>("labels");
let labelNodes: HTMLElement[] = [];
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
  progress += (props.progress - progress) * (1 - Math.exp(-dt * 10));
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
    if (pin.value) {
      pin.value.style.transform = `translate(${point.x}px,${point.y}px)`;
      pin.value.style.visibility = point.visible ? "visible" : "hidden";
    }
  } catch {
    lost();
    return;
  }
  if (liveGlobe || assemblySeconds < 3 || morphing || time - movedAt < 1800)
    raf = requestAnimationFrame(draw);
}
watch(
  () => props.progress,
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
    progress = props.progress;
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
    if (visible) boot();
    activity();
  },
);
onMounted(() => {
  labelNodes = Array.from(
    labels.value?.querySelectorAll<HTMLElement>("span") ?? [],
  );
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
    <button
      v-show="ready && !reduced && progress < 0.27"
      ref="pin"
      class="gd-pin"
      aria-label="Eight gyms connected from Bratislava. Open the example gym listing"
      @click="emit('open')"
    >
      <span>8 gyms connected <small>Bratislava</small></span
      ><i aria-hidden="true">↗</i>
    </button>
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
