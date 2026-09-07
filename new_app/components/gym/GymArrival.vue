<script setup lang="ts">
import {
  LOGO_ASSEMBLY_MS,
  LOGO_FLIGHT_MS,
  LOGO_NAME_MS,
  LOGO_OPEN_MS,
} from "~/utils/brand/logoEntry";

const props = defineProps<{ ready: boolean; reduced: boolean; fallback: boolean }>();
const emit = defineEmits<{ active: [value: boolean] }>();
const seen = useState("gym-arrival-seen", () => false);
const visible = shallowRef(false);
const opening = shallowRef(false);
const named = shallowRef(false);
const mark = useTemplateRef<HTMLElement>("mark");
let assembled = false;
let disposed = false;
let drawTimer: ReturnType<typeof setTimeout> | undefined;
let nameTimer: ReturnType<typeof setTimeout> | undefined;
let limitTimer: ReturnType<typeof setTimeout> | undefined;
let finishTimer: ReturnType<typeof setTimeout> | undefined;
let flight: Animation | undefined;
function finish() {
  visible.value = false;
  emit("active", false);
}
function flyToNav() {
  const destination = document
    .querySelector(".gx-nav .gx-logo")
    ?.getBoundingClientRect();
  const source = mark.value?.getBoundingClientRect();
  if (!destination || !source || !mark.value || source.width < 1) return;
  flight = mark.value.animate(
    [
      { transform: "translate(0, 0) scale(1, 1)" },
      {
        transform: `translate(${destination.left - source.left}px, ${destination.top - source.top}px) scale(${destination.width / source.width}, ${destination.height / source.height})`,
      },
    ],
    {
      duration: LOGO_FLIGHT_MS,
      easing: "cubic-bezier(.16, 1, .3, 1)",
      fill: "forwards",
    },
  );
}
function open(immediate = false) {
  if (!visible.value || opening.value) return;
  opening.value = true;
  clearTimeout(drawTimer);
  clearTimeout(nameTimer);
  clearTimeout(limitTimer);
  if (immediate || props.reduced) {
    finish();
    return;
  }
  named.value = true;
  flyToNav();
  finishTimer = setTimeout(() => {
    if (!disposed) finish();
  }, LOGO_OPEN_MS);
}
function skip() {
  open(true);
}
function keydown(event: KeyboardEvent) {
  if (event.key === "Tab" || event.key === "Escape") skip();
}
watch(
  () => [props.ready, props.fallback, props.reduced],
  () => {
    if (props.reduced) skip();
    else if (assembled && (props.ready || props.fallback)) open();
  },
);
onMounted(() => {
  const saveData = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection?.saveData;
  if (
    seen.value ||
    location.hash ||
    scrollY > 40 ||
    props.reduced ||
    matchMedia("(prefers-reduced-motion: reduce)").matches ||
    saveData
  )
    return;
  seen.value = true;
  visible.value = true;
  emit("active", true);
  nameTimer = setTimeout(() => {
    if (!disposed) named.value = true;
  }, LOGO_NAME_MS);
  drawTimer = setTimeout(() => {
    assembled = true;
    if (props.ready || props.fallback) open();
  }, LOGO_ASSEMBLY_MS);
  // A slow asset never holds the visitor on the logo. The gym stays empty
  // until the 3D scene is ready rather than flashing a 2D machine still.
  limitTimer = setTimeout(() => open(), 2800);
  window.addEventListener("scroll", skip, { passive: true });
  window.addEventListener("pagehide", skip);
  window.addEventListener("keydown", keydown);
});
onBeforeUnmount(() => {
  disposed = true;
  clearTimeout(drawTimer);
  clearTimeout(nameTimer);
  clearTimeout(limitTimer);
  clearTimeout(finishTimer);
  flight?.cancel();
  window.removeEventListener("scroll", skip);
  window.removeEventListener("pagehide", skip);
  window.removeEventListener("keydown", keydown);
});
</script>
<template>
  <div v-if="visible" class="gx-arrival" :class="{ 'is-opening': opening }">
    <div class="gx-arrival__door gx-arrival__door--left" /><div class="gx-arrival__door gx-arrival__door--right" />
    <div class="gx-arrival__stage">
      <div
        ref="mark"
        class="gx-arrival__brand"
        :class="{ 'is-pending': !named, 'is-signed': named }"
      >
        <span class="gx-arrival__svg" aria-hidden="true"><GymLogoEntry /></span>
        <GymLockupWord />
      </div>
    </div>
    <p class="gx-arrival__caption gx-protocol">Your machines. Connected.</p>
    <div class="gx-arrival__skip">
      <button type="button" class="btn-ghost" @click="skip"><HoloPill />Enter the gym</button>
    </div>
  </div>
</template>
<style scoped>
.gx-arrival {
  --gx-mark: clamp(72px, 18vw, 148px);
  position: fixed;
  inset: 0;
  z-index: 50;
  pointer-events: none;
}
.gx-arrival__door {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50.1%;
  background: #040605;
  transition: transform 0.85s cubic-bezier(0.16, 1, 0.3, 1);
}
.gx-arrival__door--left {
  left: 0;
  border-right: 1px solid #ccff0020;
}
.gx-arrival__door--right {
  right: 0;
}
.is-opening .gx-arrival__door--left {
  transform: translateX(-100%);
}
.is-opening .gx-arrival__door--right {
  transform: translateX(100%);
}
.gx-arrival__stage {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: grid;
  place-items: center;
}
.gx-arrival__brand {
  display: flex;
  align-items: center;
  gap: calc(var(--gx-mark) * 0.36);
  font-family: var(--liftag-font-headline);
  font-size: calc(var(--gx-mark) * 0.691);
  font-weight: 700;
  letter-spacing: -0.06em;
  line-height: 1;
  color: var(--gx-fg);
  white-space: nowrap;
  transform-origin: top left;
  /* Offset so the mark sits on the viewport centre while the word is held. */
  transform: translateX(calc((100% - var(--gx-mark)) / 2));
  transition: transform 760ms cubic-bezier(0.16, 1, 0.3, 1);
}
.gx-arrival__brand.is-signed {
  transform: translateX(0);
}
.is-opening .gx-arrival__brand {
  transition: none;
  will-change: transform;
}
.gx-arrival__svg {
  display: grid;
  width: var(--gx-mark);
  height: var(--gx-mark);
  flex-shrink: 0;
  color: var(--gx-lime);
}
.gx-arrival__svg :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
.gx-arrival__caption {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(50% + (var(--gx-mark) / 2) + 28px);
  text-align: center;
}
.gx-arrival__skip {
  position: absolute;
  bottom: 30px;
  left: 50%;
  z-index: 2;
  transform: translateX(-50%);
  pointer-events: auto;
}
.is-opening .gx-arrival__caption,
.is-opening .gx-arrival__skip {
  visibility: hidden;
}
</style>
