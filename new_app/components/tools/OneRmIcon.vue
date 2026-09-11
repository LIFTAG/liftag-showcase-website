<script setup lang="ts">
const props = withDefaults(defineProps<{
  kind: 'weight' | 'reps' | 'trophy'
  value: number | null
  active?: boolean
}>(), { active: false })

const revision = shallowRef(0)
const direction = shallowRef(1)
const valid = computed(() => props.value != null && Number.isFinite(props.value) && props.value > 0)
// A bounded silhouette change, independent of the displayed kg/lb unit.
const load = computed(() => valid.value ? props.value! / (props.value! + 100) : 0)
const pose = computed(() => ({
  '--load-tilt': `${-30 - load.value * 18}deg`,
  '--plate-scale': 0.78 + load.value * 0.5,
  '--rep-turn': `${(valid.value ? props.value! - 1 : 0) * 18}deg`,
  '--nudge': `${direction.value * -2}px`,
  '--lean': `${direction.value * -7}deg`,
}))

watch(() => props.value, (value, previous) => {
  if (!valid.value || previous == null || value == null || Math.abs(value - previous) < 0.001) return
  direction.value = value > previous ? 1 : -1
  revision.value++
})
</script>

<template>
  <svg
    class="orm-icon"
    :class="[`is-${kind}`, { 'is-valid': valid, 'is-active': active }]"
    :style="pose"
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <g v-if="kind === 'weight'" class="weight-pose">
      <g :key="revision" :class="{ 'load-response': revision > 0 }">
        <path d="M11 16h10M3 14v4m26-4v4" />
        <g class="weight-plates">
          <rect class="icon-tint" x="6" y="8" width="5" height="16" rx="1.8" />
          <rect class="icon-tint" x="21" y="8" width="5" height="16" rx="1.8" />
          <path d="M6 11H4v10h2m20-10h2v10h-2" />
        </g>
      </g>
    </g>
    <g v-else-if="kind === 'reps'" class="rep-pose">
      <path d="M25 12a9.5 9.5 0 0 0-16-3L6 12m0-6v6h6M7 20a9.5 9.5 0 0 0 16 3l3-3m0 6v-6h-6" />
      <circle class="icon-tint" cx="16" cy="16" r="2.25" />
    </g>
    <g v-else>
      <path class="trophy-base" d="M16 21v5m-5 2h10m-8-2h6" />
      <g :key="revision" :class="{ 'trophy-response': revision > 0 && valid }">
        <path d="M9 9H5v3c0 3 2 5 5 5m13-8h4v3c0 3-2 5-5 5" />
        <path class="icon-tint trophy-cup" d="M9 6h14v8a7 7 0 0 1-14 0Z" />
        <path class="trophy-star" d="m16 9 1.1 2.3 2.6.4-1.9 1.8.5 2.6-2.3-1.2-2.3 1.2.5-2.6-1.9-1.8 2.6-.4Z" />
      </g>
      <g :key="`glint-${revision}`" class="trophy-glint" :class="{ 'is-flashing': revision > 0 && valid && direction > 0 }">
        <path d="M26 2v4m-2-2h4M5 21v3m-1.5-1.5h3" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.orm-icon {
  display: inline-block;
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
  overflow: visible;
  color: var(--orm-muted);
  pointer-events: none;
  transition: color 200ms cubic-bezier(.22, 1, .36, 1);
}
.is-trophy.is-valid, .is-active.is-valid { color: var(--orm-accent); }
.icon-tint { fill: currentColor; fill-opacity: .065; transition: fill-opacity 220ms cubic-bezier(.22, 1, .36, 1); }
.is-active .icon-tint { fill-opacity: .18; }
.weight-pose, .weight-plates, .rep-pose, .load-response, .trophy-response, .trophy-glint {
  transform-box: view-box;
  transform-origin: 16px 16px;
}
.weight-pose { transform: rotate(var(--load-tilt)); transition: transform 240ms cubic-bezier(.22, 1, .36, 1); }
.weight-plates { transform: scaleY(var(--plate-scale)); transition: transform 240ms cubic-bezier(.22, 1, .36, 1); }
.rep-pose { transform: rotate(var(--rep-turn)); transition: transform 240ms cubic-bezier(.22, 1, .36, 1); }
.trophy-star { stroke-width: 1.1; opacity: .7; }
.trophy-base { opacity: .65; }
.trophy-glint { opacity: 0; }
.load-response { animation: load-response 280ms cubic-bezier(.22, 1, .36, 1); }
.trophy-response { transform-origin: 16px 23px; animation: trophy-response 380ms cubic-bezier(.22, 1, .36, 1); }
.trophy-glint.is-flashing { animation: trophy-glint 420ms cubic-bezier(.22, 1, .36, 1); }
@keyframes load-response {
  from { transform: translateY(var(--nudge)); }
  to { transform: translateY(0); }
}
@keyframes trophy-response {
  from { transform: translateY(var(--nudge)) rotate(var(--lean)); }
  to { transform: translateY(0) rotate(0); }
}
@keyframes trophy-glint {
  0% { opacity: 0; transform: scale(.8); }
  25% { opacity: .85; }
  100% { opacity: 0; transform: scale(1.08); }
}
@media (prefers-reduced-motion: reduce) {
  .orm-icon, .orm-icon * { transition: none !important; animation: none !important; }
}
</style>
