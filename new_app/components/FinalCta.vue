<script setup lang="ts">
interface QuoteItem {
  text: string
  who: string
}

const quotes: QuoteItem[] = [
  {
    text: "My PRs are climbing for the first time in 18 months.",
    who: '@marek_lifts · 2y user',
  },
  {
    text: "Best client management tool I've used as an online coach.",
    who: 'Lina R. · S&amp;C coach',
  },
  {
    text: "Members stopped asking how to use the cable stack.",
    who: 'Apex Athletic · partner gym',
  },
]
</script>

<template>
  <section
    :style="{
      background: '#000',
      padding: '160px 0 120px',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }"
  >
    <!-- Radial glow background -->
    <div
      :style="{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(204,255,0,0.18), transparent 60%)',
      }"
    />

    <!-- Grid mask -->
    <div
      :style="{
        position: 'absolute',
        inset: 0,
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
        maskImage: 'radial-gradient(ellipse 70% 50% at 50% 50%, black 30%, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 50% at 50% 50%, black 30%, transparent 80%)',
      }"
    />

    <div class="container" style="position: relative;">
      <!-- Logo -->
      <img
        src="/assets/logo.svg"
        width="100"
        height="100"
        :style="{
          filter: 'drop-shadow(0 0 40px rgba(204,255,0,0.7))',
          margin: '0 auto 40px',
          animation: 'float-y 4s ease-in-out infinite',
        }"
        alt="LIFTAG logo"
      />

      <!-- Main heading -->
      <h2
        class="display reveal"
        :style="{
          fontSize: 'clamp(56px, 9vw, 140px)',
          color: '#fff',
        }"
      >
        STOP <span class="lime">GUESSING</span>.<br />
        START <span class="lime">LIFTING</span>.
      </h2>

      <p
        class="reveal"
        :style="{
          color: 'rgba(255,255,255,0.6)',
          fontSize: '18px',
          fontWeight: 300,
          maxWidth: '540px',
          margin: '32px auto 0',
          lineHeight: 1.55,
        }"
      >
        Join 12,000+ lifters tracking real progress, scanning real machines, and skipping the
        spreadsheet.
      </p>

      <!-- Store buttons -->
      <div
        class="reveal"
        :style="{
          marginTop: '48px',
          display: 'flex',
          gap: '14px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }"
      >
        <AppStoreBtn store="apple" />
        <AppStoreBtn store="google" />
      </div>

      <!-- Quote columns -->
      <div
        class="cta-quotes reveal"
        :style="{
          marginTop: '80px',
          display: 'flex',
          gap: '48px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }"
      >
        <div
          v-for="(q, i) in quotes"
          :key="i"
          :style="{ maxWidth: '280px', textAlign: 'left' }"
        >
          <div
            :style="{
              color: '#CCFF00',
              fontSize: '22px',
              fontFamily: '\'Space Grotesk\', sans-serif',
              fontStyle: 'italic',
              fontWeight: 700,
              lineHeight: 1,
              marginBottom: '8px',
            }"
          >"</div>
          <p
            :style="{
              color: 'rgba(255,255,255,0.85)',
              fontSize: '14.5px',
              lineHeight: 1.55,
              margin: 0,
              fontWeight: 400,
            }"
          >
            {{ q.text }}
          </p>
          <p
            v-html="q.who"
            :style="{
              color: '#666',
              fontSize: '11px',
              fontFamily: '\'JetBrains Mono\', monospace',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              marginTop: '12px',
              fontWeight: 700,
            }"
          />
        </div>
      </div>
    </div>
  </section>
</template>
