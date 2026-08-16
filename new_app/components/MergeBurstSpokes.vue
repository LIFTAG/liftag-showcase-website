<script setup lang="ts">
defineProps<{
  spokes: {
    key: string
    deg: number
    core: string
    turn: number
    delay: number
  }[]
}>()
</script>

<template>
  <div class="merge-burst-spokes" aria-hidden="true">
    <span
      v-for="spoke in spokes"
      :key="spoke.key"
      :style="{
        '--spoke-deg': `${spoke.deg}deg`,
        '--spoke-core': spoke.core,
        '--spoke-turn': `${spoke.turn}deg`,
        '--spoke-delay': spoke.delay,
      }"
    />
  </div>
</template>

<style scoped>
/* Eight hairlines from the prism, one per app. Transform/opacity only —
   they ride --finale-p with the halo rings and never sample the page. */
.merge-burst-spokes {
  --burst-t: max(0, min(1, calc((var(--finale-p, 0) - 0.08) / 0.92)));
  --burst-inv: calc(1 - var(--burst-t));
  --burst-ease: calc(1 - var(--burst-inv) * var(--burst-inv) * var(--burst-inv));
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;
  pointer-events: none;
  contain: paint;
}

.merge-burst-spokes span {
  --bang: calc(0.08 + var(--spoke-delay, 0) * 0.008);
  --rise: max(0, min(1, calc((var(--finale-p, 0) - var(--bang)) / 0.07)));
  --fall: max(0, min(1, calc(1 - (var(--finale-p, 0) - var(--bang) - 0.07) / 0.46)));
  --twist: calc(var(--burst-ease) * var(--spoke-turn, 8deg));
  position: absolute;
  top: var(--ray-oy, 50%);
  left: var(--ray-ox, 50%);
  width: 78vmax;
  height: 1px;
  pointer-events: none;
  transform-origin: 0 50%;
  transform: rotate(calc(var(--spoke-deg) + var(--twist))) scaleX(calc(0.18 + var(--burst-ease) * 0.94));
  opacity: calc(var(--rise) * var(--fall) * 0.7);
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--spoke-core) 12%,
    var(--spoke-core) 28%,
    transparent 86%
  );
  mix-blend-mode: screen;
}

@media (max-width: 768px) {
  .merge-burst-spokes span {
    width: 108vmin;
    opacity: calc(var(--rise) * var(--fall) * 0.56);
  }
}

@media (prefers-reduced-motion: reduce) {
  .merge-burst-spokes {
    display: none;
  }
}
</style>
