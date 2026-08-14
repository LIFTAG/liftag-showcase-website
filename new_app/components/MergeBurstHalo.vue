<template>
  <div class="merge-burst-halo" aria-hidden="true">
    <span></span>
    <span></span>
    <span></span>
  </div>
</template>

<style scoped>
/* CSS-only shockwave from --finale-p. Transform/opacity only — no blur,
   filter, or extra canvas; a full-page fluid shockwave is too expensive here. */
.merge-burst-halo {
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

.merge-burst-halo span {
  --rise: max(0, min(1, calc((var(--finale-p, 0) - var(--bang)) / var(--rise-span))));
  --fall: max(0, min(1, calc(1 - (var(--finale-p, 0) - var(--bang) - var(--rise-span)) / var(--fade-span))));
  position: absolute;
  top: var(--ray-oy, 50%);
  left: var(--ray-ox, 50%);
  aspect-ratio: 1;
  border-radius: 50%;
  border: 1px solid oklch(0.93 0.2 122 / 0.82);
  pointer-events: none;
  mix-blend-mode: screen;
  opacity: calc(var(--rise) * var(--fall) * var(--peak));
  transform: translate(-50%, -50%) scale(calc(var(--s0) + var(--burst-ease) * var(--s1)));
}

.merge-burst-halo span:nth-child(1) {
  --bang: 0.08;
  --rise-span: 0.07;
  --fade-span: 0.5;
  --peak: 0.86;
  --s0: 0.3;
  --s1: 1.28;
  width: 30vmin;
}

.merge-burst-halo span:nth-child(2) {
  --bang: 0.105;
  --rise-span: 0.08;
  --fade-span: 0.56;
  --peak: 0.58;
  --s0: 0.26;
  --s1: 1.82;
  width: 46vmin;
  border-color: oklch(0.93 0.2 122 / 0.62);
}

.merge-burst-halo span:nth-child(3) {
  --bang: 0.12;
  --rise-span: 0.1;
  --fade-span: 0.72;
  --peak: 0.38;
  --s0: 0.1;
  --s1: 2.48;
  width: 72vmax;
  border-color: oklch(0.93 0.2 122 / 0.42);
}

@media (max-width: 768px) {
  .merge-burst-halo span:nth-child(1) {
    width: 28vmin;
  }

  .merge-burst-halo span:nth-child(2) {
    width: 40vmin;
  }

  .merge-burst-halo span:nth-child(3) {
    --s0: 0.12;
    --s1: 2.2;
    width: 100vmin;
  }
}

@media (prefers-reduced-motion: reduce) {
  .merge-burst-halo {
    display: none;
  }
}
</style>
