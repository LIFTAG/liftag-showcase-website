<script setup lang="ts">
/**
 * Decorative backdrop: the stock exercise shots as a tilted contact sheet. It
 * never shows the shared routine's own exercises (those stay private), so the
 * tiles carry no names or order, and the host darkens them under its copy.
 * Static by design: the prism rim on the QR code is the only moving thing.
 */
const EXERCISES = ['bench-press', 'deadlift', 'lat-pulldown', 'squat', 'lunge', 'triceps']
const COLUMNS = 10
const ROWS = 8

// Shifting each column by two keeps a shot from sitting next to itself.
const columns = Array.from({ length: COLUMNS }, (_, column) =>
  Array.from({ length: ROWS }, (_, row) =>
    `/assets/img/${EXERCISES[(column * 2 + row) % EXERCISES.length]}.webp`))
</script>

<template>
  <div class="exercise-wall" aria-hidden="true">
    <div class="exercise-wall__plane">
      <div v-for="(column, c) in columns" :key="c" class="exercise-wall__column">
        <img
          v-for="(src, r) in column"
          :key="r"
          :src="src"
          alt=""
          width="600"
          height="335"
          decoding="async"
          class="exercise-wall__tile"
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
.exercise-wall {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.exercise-wall__plane {
  /* Sized off the viewport so the tilted plane still overfills an ultrawide. */
  --tile: max(190px, 13.5vw);
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  gap: 14px;
  transform: translate(-50%, -50%) perspective(1800px) rotateX(16deg) rotateZ(-11deg);
}

.exercise-wall__column {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.exercise-wall__column:nth-child(even) {
  translate: 0 calc(var(--tile) * -0.42);
}

.exercise-wall__tile {
  display: block;
  width: var(--tile);
  height: auto;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 14px;
  background: #0b0c09;
  outline: 1px solid rgba(255, 255, 255, 0.06);
  outline-offset: -1px;
}
</style>
