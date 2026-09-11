<script setup lang="ts">
const props = defineProps<{ value: string }>()
const direction = shallowRef(1)

watch(() => props.value, (next, previous) => {
  direction.value = Number(next.replaceAll(',', '')) >= Number(previous.replaceAll(',', '')) ? 1 : -1
})

// Anchor columns to the decimal point so carries keep existing digits in place.
// Memoize unchanged columns; only changing digits need to update their glyphs.
const columns = computed(() => {
  const decimal = props.value.includes('.') ? props.value.indexOf('.') : props.value.length
  return Array.from(props.value, (character, index) => ({
    character,
    place: index - decimal,
    digit: /\d/.test(character),
    delay: `${Math.min(props.value.length - index - 1, 3) * 12}ms`,
  }))
})
</script>

<template>
  <span class="number-dial" :style="{ '--roll-direction': direction }">
    <span
      v-for="column in columns"
      :key="column.place"
      v-memo="[column.character, column.delay]"
      class="dial-column"
      :class="{ 'dial-separator': !column.digit }"
      :style="{ '--roll-delay': column.delay }"
    >
      <Transition name="dial-roll" :duration="{ enter: 480, leave: 420 }">
        <span :key="column.character" class="dial-face" :class="{ 'dial-digit': column.digit }">
          <span class="dial-glyph">{{ column.character }}</span>
        </span>
      </Transition>
    </span>
  </span>
</template>

<style scoped>
.number-dial {
  display: inline-flex;
  vertical-align: baseline;
  white-space: nowrap;
  /* Only the rims fade; the resting numerals stay fully opaque. */
  mask-image: linear-gradient(to bottom, transparent, black 16%, black 84%, transparent);
}
.dial-column {
  position: relative;
  display: inline-grid;
  width: 1ch;
  margin-right: -.075em;
  isolation: isolate;
}
.dial-column:last-child { margin-right: 0; }
.dial-separator { width: .42ch; }
.dial-face {
  position: relative;
  display: block;
  grid-area: 1 / 1;
  letter-spacing: 0;
}
.dial-glyph { display: block; padding-block: .12em; line-height: 1; }
.dial-roll-enter-active,
.dial-roll-leave-active {
  /* Keep the original fade and blur on the wrapper, independent of the swipe. */
  transition: opacity 320ms ease-out, filter 400ms cubic-bezier(.22, 1, .36, 1);
  transition-delay: var(--roll-delay);
}
.dial-roll-enter-active.dial-digit .dial-glyph,
.dial-roll-leave-active.dial-digit .dial-glyph {
  transition: transform 440ms cubic-bezier(.2, .65, .25, 1);
  transition-delay: var(--roll-delay);
}
.dial-roll-leave-active {
  position: absolute;
  inset: 0;
  /* Hold clarity through the start of the turn, then dissolve near the rim. */
  transition-duration: 340ms, 360ms;
  transition-timing-function: cubic-bezier(.4, 0, 1, 1), cubic-bezier(.4, 0, 1, 1);
}
.dial-roll-leave-active.dial-digit .dial-glyph { transition-duration: 380ms; }
/* Match the old cylinder’s vertical travel: 1.05em × sin(62°) ≈ .93em. */
.dial-roll-enter-from.dial-digit .dial-glyph { transform: translateY(calc(var(--roll-direction) * .93em)); }
.dial-roll-leave-to.dial-digit .dial-glyph { transform: translateY(calc(var(--roll-direction) * -.93em)); }
.dial-roll-enter-from {
  opacity: 0;
  filter: blur(.055em);
}
.dial-roll-leave-to {
  opacity: 0;
  filter: blur(.055em);
}
@media (prefers-reduced-motion: reduce) {
  .dial-roll-enter-active.dial-digit .dial-glyph,
  .dial-roll-leave-active.dial-digit .dial-glyph { transition: none; transform: none; }
  .dial-roll-enter-active,
  .dial-roll-leave-active { transition: none; }
  .dial-roll-enter-from { transform: none; opacity: 1; filter: none; }
  .dial-roll-leave-active { display: none; }
}
</style>
