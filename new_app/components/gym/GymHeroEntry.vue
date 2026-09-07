<script setup lang="ts">
// Project the actual glyph contours, preserving native font shaping and wraps.
// The shared arm waits for the machine's opening sequence and runs once.
const props = withDefaults(defineProps<{ delay?: number; row?: boolean; button?: boolean }>(), {
  delay: 0,
  row: false,
  button: false,
})
const entry = useTemplateRef<HTMLElement>('entry')
const armed = useGymEntryArm(entry)
const mesh = useTemplateRef<HTMLCanvasElement>('mesh')
const { ready: meshReady, playing: meshPlaying, done: meshDone } = useGymGlyphMesh(entry, mesh, () => props.delay)
</script>

<template>
  <span
    ref="entry"
    class="gx-hero-entry"
    :class="{ 'gx-hero-entry--row': row, 'gx-hero-entry--button': button, 'is-in': armed, 'is-mesh-done': meshDone, 'is-mesh-ready': meshReady, 'is-mesh-playing': meshPlaying }"
    :style="{ '--projection-delay': `${delay}ms` }"
  >
    <span class="gx-hero-entry__content"><slot /></span>
    <canvas ref="mesh" class="gx-hero-entry__mesh" aria-hidden="true" />
  </span>
</template>

<style scoped>
.gx-hero-entry {
  --projection-ease: cubic-bezier(.16, 1, .3, 1);
  position: relative;
  display: block;
}
.gx-hero-entry--row,
.gx-hero-entry--button { display: inline-block; vertical-align: top; }
.gx-hero-entry__content { display: block; }

/* SSR stays readable; the projection is an enhancement after hydration. */
.gx:not(.is-static) .gx-hero-entry:not(.is-in) .gx-hero-entry__content {
  opacity: 0;
}
.gx-hero-entry.is-in .gx-hero-entry__content {
  animation: glyph-reveal 1100ms var(--projection-ease) var(--projection-delay) backwards;
}
.gx-hero-entry:not(.gx-hero-entry--button).is-in .gx-hero-entry__content,
.gx-hero-entry:not(.gx-hero-entry--button).is-in :deep(em) {
  animation: glyph-reveal 1100ms var(--projection-ease) var(--projection-delay) backwards,
    glyph-fill 1100ms linear var(--projection-delay) backwards;
}

/* Stroke follows the real font contours, including counters and punctuation.
   No duplicate text, canvas approximations, or rectangular decorative mesh. */
@keyframes glyph-reveal {
  0% { opacity: 0; clip-path: inset(-.15em 100% -.15em 0); }
  16% { opacity: 1; }
  48%, 100% { opacity: 1; clip-path: inset(-.15em -.15em -.15em -.15em); }
}
@keyframes glyph-fill {
  0%, 35% {
    -webkit-text-fill-color: transparent;
    -webkit-text-stroke: .65px currentColor;
    text-shadow: none;
  }
  62% {
    -webkit-text-fill-color: transparent;
    -webkit-text-stroke: .45px currentColor;
    text-shadow: 0 0 5px currentColor;
  }
  100% {
    -webkit-text-fill-color: currentColor;
    -webkit-text-stroke: 0px currentColor;
    text-shadow: 0 0 0 transparent;
  }
}

/* The CTA's own rounded border is its outline; fill returns after its label.
   Backwards-only fill releases every property for the existing hover effects. */
.gx-hero-entry--button.is-in :deep(a) {
  animation: pill-fill 1100ms linear var(--projection-delay) backwards;
}
@keyframes pill-fill {
  0%, 42% {
    background-color: transparent;
    border-color: currentColor;
    color: var(--gx-lime);
    box-shadow: inset 0 0 0 1px currentColor;
    -webkit-text-fill-color: transparent;
    -webkit-text-stroke: .5px currentColor;
  }
  68% {
    background-color: transparent;
    color: var(--gx-lime);
    box-shadow: inset 0 0 0 1px currentColor;
    -webkit-text-fill-color: currentColor;
    -webkit-text-stroke: 0px currentColor;
  }
}

.gx-hero-entry__mesh {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.gx-hero-entry.is-in.is-mesh-ready .gx-hero-entry__content,
.gx-hero-entry.is-in.is-mesh-ready :deep(em),
.gx-hero-entry.is-in.is-mesh-ready :deep(a),
.gx-hero-entry.is-in.is-mesh-done .gx-hero-entry__content,
.gx-hero-entry.is-in.is-mesh-done :deep(em),
.gx-hero-entry.is-in.is-mesh-done :deep(a) {
  animation: none;
}
.gx-hero-entry.is-in.is-mesh-ready .gx-hero-entry__content { opacity: 0; }
.gx-hero-entry.is-in.is-mesh-playing .gx-hero-entry__content {
  animation: mesh-solidify 1600ms linear var(--projection-delay) both;
}
@keyframes mesh-solidify {
  0%, 48% { opacity: 0; }
  70% { opacity: .3; }
  90%, 100% { opacity: 1; }
}
.gx.is-reduced .gx-hero-entry__mesh { display: none; }
@media (prefers-reduced-motion: reduce), print {
  .gx-hero-entry__mesh { display: none; }
}

/* Focus exposes the link and its focus ring immediately. */
.gx-hero-entry:focus-within .gx-hero-entry__content,
.gx-hero-entry:focus-within :deep(a),
.gx.is-reduced .gx-hero-entry .gx-hero-entry__content,
.gx.is-reduced .gx-hero-entry :deep(em),
.gx.is-reduced .gx-hero-entry :deep(a) {
  animation: none !important;
  opacity: 1 !important;
}
@media (prefers-reduced-motion: reduce), print {
  .gx-hero-entry .gx-hero-entry__content,
  .gx-hero-entry :deep(em),
  .gx-hero-entry :deep(a) { animation: none !important; opacity: 1 !important; }
}
</style>
