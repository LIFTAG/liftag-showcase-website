<script setup lang="ts">
const gyms = [
  'IRON · TEMPLE', 'APEX · ATHLETIC', 'STRENGTH · LAB',
  'BARBELL · CLUB', 'MONOLITH · GYM', 'GRIT · HOUSE',
  'PROTOCOL · 24', 'CHALK · & · STEEL', 'NORTH · BLOCK',
  'PR · UNIT', 'DELOAD · CO',
]
const items = [...gyms, ...gyms]
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
        v-for="(g, i) in items"
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
        <span>{{ g }}</span>
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
