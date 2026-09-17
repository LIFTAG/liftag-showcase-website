<script setup lang="ts">
/**
 * An unclaimed map pin: the explore marker's silhouette drawn as a dashed
 * outline. It rests still; a parent adds `is-live` to lift it over sonar rings.
 */
defineProps<{ live?: boolean }>()
</script>
<template>
  <svg class="d-ghost" :class="{ 'is-live': live }" viewBox="0 0 60 66" fill="none" aria-hidden="true">
    <ellipse class="d-ghost-ring" cx="30" cy="58" rx="16" ry="4.5" />
    <ellipse class="d-ghost-ring is-late" cx="30" cy="58" rx="16" ry="4.5" />
    <ellipse class="d-ghost-shadow" cx="30" cy="58" rx="7" ry="2" />
    <g class="d-ghost-float">
      <circle cx="30" cy="26" r="15" class="d-ghost-fill" />
      <circle cx="30" cy="26" r="18.5" class="d-ghost-outline" />
      <path d="M25.5 44.2 30 50l4.5-5.8" class="d-ghost-pointer" />
      <path d="M30 19.5v13M23.5 26h13" class="d-ghost-plus" />
    </g>
  </svg>
</template>
<style scoped>
.d-ghost {
  overflow: visible;
  color: #ccff00;
}
.d-ghost-fill {
  fill: rgb(204 255 0 / 0.06);
  transition: fill 240ms;
}
.d-ghost-outline {
  stroke: currentColor;
  stroke-width: 2;
  stroke-dasharray: 4.6 3.4;
  stroke-linecap: round;
  transform-origin: 30px 26px;
  transition: filter 240ms;
}
.d-ghost-pointer,
.d-ghost-plus {
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.d-ghost-plus {
  stroke-width: 2.4;
  transform-origin: 30px 26px;
  transition: transform 420ms cubic-bezier(0.3, 1.5, 0.5, 1);
}
.d-ghost-float {
  transition: transform 360ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
.d-ghost-shadow {
  fill: rgb(204 255 0 / 0.3);
  transform-origin: 30px 58px;
  transition:
    transform 360ms cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 360ms;
}
.d-ghost-ring {
  stroke: rgb(204 255 0 / 0.7);
  stroke-width: 1;
  transform-origin: 30px 58px;
  opacity: 0;
}
.is-live .d-ghost-fill {
  fill: rgb(204 255 0 / 0.14);
}
.is-live .d-ghost-outline {
  filter: drop-shadow(0 0 4px rgb(204 255 0 / 0.6));
  animation: d-ghost-orbit 9s linear infinite;
}
.is-live .d-ghost-plus {
  transform: rotate(90deg);
}
.is-live .d-ghost-float {
  transform: translateY(-5px);
}
.is-live .d-ghost-shadow {
  transform: scale(0.65);
  opacity: 0.6;
}
.is-live .d-ghost-ring {
  animation: d-ghost-sonar 2.2s cubic-bezier(0.2, 0.6, 0.3, 1) infinite;
}
.is-live .d-ghost-ring.is-late {
  animation-delay: 1.1s;
}
@keyframes d-ghost-orbit {
  to {
    transform: rotate(360deg);
  }
}
@keyframes d-ghost-sonar {
  from {
    opacity: 0.9;
    transform: scale(0.25);
  }
  to {
    opacity: 0;
    transform: scale(1.35);
  }
}
@media (prefers-reduced-motion: reduce) {
  .d-ghost-plus,
  .d-ghost-float,
  .d-ghost-shadow {
    transition: none;
  }
  .is-live .d-ghost-outline,
  .is-live .d-ghost-ring {
    animation: none;
  }
  .is-live .d-ghost-float,
  .is-live .d-ghost-plus,
  .is-live .d-ghost-shadow {
    transform: none;
  }
}
</style>
