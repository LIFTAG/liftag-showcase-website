<template>
  <div class="film-grain" aria-hidden="true" />
</template>

<style scoped>
/* Full-page animated film grain. Sits above everything (pointer-events: none)
   at ~5% opacity: it masks gradient banding in the neon glows on pure black
   and gives the page a physical texture. The element is oversized by the max
   translate offset so the steps() jitter never exposes an edge, and because
   only transform animates, the layer stays on the compositor. */
.film-grain {
  position: fixed;
  inset: -300px;
  z-index: 99998;
  pointer-events: none;
  opacity: 0.05;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncA type='linear' slope='0.55'/></feComponentTransfer></filter><rect width='220' height='220' filter='url(%23n)'/></svg>");
  background-repeat: repeat;
  background-size: 220px 220px;
  animation: filmGrainShift 1.6s steps(1) infinite;
  will-change: transform;
}

@keyframes filmGrainShift {
  0% { transform: translate3d(0, 0, 0); }
  12.5% { transform: translate3d(-88px, 44px, 0); }
  25% { transform: translate3d(132px, -66px, 0); }
  37.5% { transform: translate3d(-44px, -132px, 0); }
  50% { transform: translate3d(176px, 88px, 0); }
  62.5% { transform: translate3d(-176px, 154px, 0); }
  75% { transform: translate3d(66px, -44px, 0); }
  87.5% { transform: translate3d(-132px, -88px, 0); }
  100% { transform: translate3d(0, 0, 0); }
}

@media (prefers-reduced-motion: reduce) {
  .film-grain {
    animation: none;
    will-change: auto;
  }
}

@media print {
  .film-grain {
    display: none;
  }
}
</style>
