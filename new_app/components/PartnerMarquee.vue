<script setup lang="ts">
const features = [
  'NFC + QR · MACHINE SYNC', 'AUTO · 1RM', '250+ · EXERCISES',
  '11 · MUSCLE GROUPS', 'COACH · DIRECTORY', 'GYM · MAP',
  'ROUTINES · SUPERSETS', 'WORKOUT · HISTORY', 'PRs · AUTO-DETECTED',
  'EN · SK', 'FREE · FOREVER',
]
const items = [...features, ...features]
</script>

<template>
  <section
    :style="{
      background: '#000',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      padding: '36px 0',
      position: 'relative',
      overflow: 'hidden',
    }"
  >
    <!-- Left fade -->
    <div
      :style="{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: '200px',
        background: 'linear-gradient(90deg, #000, transparent)',
        zIndex: 2, pointerEvents: 'none',
      }"
    />
    <!-- Right fade -->
    <div
      :style="{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: '200px',
        background: 'linear-gradient(-90deg, #000, transparent)',
        zIndex: 2, pointerEvents: 'none',
      }"
    />

    <div class="marquee-track">
      <div
        v-for="(item, i) in items"
        :key="i"
        :style="{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          fontFamily: '\'Space Grotesk\', sans-serif',
          fontWeight: 700,
          fontStyle: 'italic',
          fontSize: '22px',
          letterSpacing: '-0.03em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.45)',
          whiteSpace: 'nowrap',
        }"
      >
        <span>{{ item }}</span>
        <span
          :style="{
            width: '6px',
            height: '6px',
            background: '#CCFF00',
            borderRadius: '50%',
            boxShadow: '0 0 8px #CCFF00',
          }"
        />
      </div>
    </div>
  </section>
</template>
