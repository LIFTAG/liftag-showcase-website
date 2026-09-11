<template>
  <div class="orm-glass" aria-hidden="true">
    <div class="glass-current" />
  </div>
</template>

<style scoped>
.orm-glass {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: clip;
  border-radius: inherit;
  pointer-events: none;
  background:
    radial-gradient(ellipse 78% 62% at 0% 0%, oklch(92% .03 120 / .07), transparent 54%),
    linear-gradient(125deg, oklch(24% .008 115 / .7), oklch(14% .006 115 / .3) 48%, oklch(21% .012 115 / .5));
}

/* Preserve the original blurred light fields at rest. Moving them behind the
   glass inputs forces continuous backdrop compositing, even without interaction. */
.glass-current { position: absolute; inset: 0; }
.glass-current::before,
.glass-current::after {
  content: '';
  position: absolute;
  inset: -26%;
  filter: blur(40px);
}
.glass-current::before {
  background:
    radial-gradient(ellipse 46% 33% at 82% 13%, oklch(85% .19 120 / .24), transparent 86%),
    radial-gradient(ellipse 34% 40% at 12% 79%, oklch(72% .12 145 / .12), transparent 90%);
  transform: translate3d(-7%, 3%, 0) rotate(-8deg);
}
.glass-current::after {
  background:
    radial-gradient(ellipse 41% 34% at 8% 48%, oklch(66% .2 15 / .16), transparent 86%),
    radial-gradient(ellipse 42% 27% at 90% 88%, oklch(85% .16 115 / .13), transparent 86%);
  transform: translate3d(-7%, 3%, 0) rotate(-8deg);
}
@media (max-width: 700px) {
  /* Size both radii in vw so the stacked card cannot stretch the blobs.
     Opacity is only a step below the desktop wash. */
  .orm-glass {
    background:
      radial-gradient(ellipse 96vw 70vw at 0% 0%, oklch(92% .03 120 / .06), transparent 54%),
      linear-gradient(125deg, oklch(24% .008 115 / .7), oklch(14% .006 115 / .3) 48%, oklch(21% .012 115 / .5));
  }
  .glass-current::before,
  .glass-current::after {
    inset: -26vw;
    filter: blur(32px);
  }
  .glass-current::before {
    background:
      radial-gradient(ellipse 96vw 70vw at 82% 13%, oklch(85% .19 120 / .21), transparent 86%),
      radial-gradient(ellipse 70vw 77vw at 12% 79%, oklch(72% .12 145 / .10), transparent 90%);
    transform: rotate(-8deg);
  }
  .glass-current::after {
    background:
      radial-gradient(ellipse 86vw 70vw at 8% 48%, oklch(66% .2 15 / .14), transparent 86%),
      radial-gradient(ellipse 89vw 58vw at 90% 88%, oklch(85% .16 115 / .11), transparent 86%);
    transform: rotate(-8deg);
  }
}
@media (prefers-reduced-transparency: reduce), (forced-colors: active) {
  .orm-glass { display: none; }
}
</style>
