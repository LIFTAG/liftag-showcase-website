<script setup lang="ts">
withDefaults(defineProps<{
  /** Eyebrow text. Slot `eyebrow` overrides this. */
  eyebrow?: string
  /** Eyebrow color (passed to <Eyebrow>). */
  eyebrowColor?: string
  /** Grid template for desktop. Mobile collapses to 1col via .section-header-2col. */
  cols?: string
  /** Max-width on the title (passed to <SectionTitle>). */
  titleMax?: number
  /** Max-width on the right-side paragraph. */
  copyMax?: number
  /** Bottom margin below the header block. */
  gap?: number
}>(), {
  eyebrowColor: '#CCFF00',
  cols: '1fr 1fr',
  titleMax: 900,
  copyMax: 440,
  gap: 80,
})
</script>

<template>
  <div
    class="section-header-2col"
    :style="{
      display: 'grid',
      gridTemplateColumns: cols,
      gap: '60px',
      alignItems: 'end',
      marginBottom: `${gap}px`,
    }"
  >
    <div>
      <Eyebrow :color="eyebrowColor">
        <slot name="eyebrow">{{ eyebrow }}</slot>
      </Eyebrow>
      <SectionTitle :max="titleMax">
        <slot name="title" />
      </SectionTitle>
    </div>
    <p class="reveal copy-soft" :style="{ maxWidth: `${copyMax}px` }">
      <slot />
    </p>
  </div>
</template>
