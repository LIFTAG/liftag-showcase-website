<script setup lang="ts">
interface FeatureCardProps {
  span: string
  tall?: boolean
  img?: string
  tag: string
  title: string
  body: string
  compact?: boolean
}

const cards: FeatureCardProps[] = [
  {
    span: 'span 7',
    tall: true,
    img: '/assets/screens/progression.png',
    tag: 'PROGRESS INSIGHTS',
    title: 'Progress, not vibes.',
    body: 'Per-session weight, 1RM, and total volume — auto-aggregated across every workout. Watch the line climb.',
  },
  {
    span: 'span 5',
    tall: true,
    img: '/assets/screens/log-set.png',
    tag: 'LOG SET',
    title: 'Two taps. Set logged.',
    body: 'Weight × reps. RPE optional. The timer auto-runs between sets so you don\'t have to think.',
  },
  {
    span: 'span 5',
    img: '/assets/screens/active-session.png',
    tag: 'ROUTINES + SUPERSETS',
    title: 'Plans that flex with you.',
    body: 'Build routines, share them, run supersets. Every session adapts to your real performance.',
  },
  {
    span: 'span 4',
    img: '/assets/screens/history.png',
    tag: 'HISTORY',
    title: 'Every session, dated.',
    body: 'Calendar + by-body-part. Find any session in two taps.',
  },
  {
    span: 'span 3',
    img: '/assets/screens/exercises.png',
    tag: 'LIBRARY',
    title: '500+ exercises. Form videos.',
    body: 'Vetted by coaches, not influencers.',
    compact: true,
  },
]

const numbers = [
  { n: '500+', l: 'Exercises in the library' },
  { n: '< 2s', l: 'Avg time to log a set' },
  { n: '9 wk', l: 'Median user PR cycle' },
  { n: '0', l: 'Spreadsheets required' },
]

// Per-card hover state
const hovered = ref<Record<number, boolean>>({})
</script>

<template>
  <section
    id="lifters"
    :style="{
      background: '#000',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '160px 0',
      position: 'relative',
      overflow: 'hidden',
    }"
  >
    <!-- Background glow -->
    <div
      :style="{
        position: 'absolute',
        top: '20%',
        right: '-10%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(204,255,0,0.08), transparent 60%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }"
    />

    <div class="container" style="position: relative;">
      <!-- Header -->
      <div
        class="section-header-2col"
        :style="{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '32px',
          marginBottom: '80px',
        }"
      >
        <div style="flex: 1 1 600px;">
          <Eyebrow>▸ FOR LIFTERS</Eyebrow>
          <SectionTitle>
            Train smarter.<br /><span class="lime">Lift heavier.</span> Compound everything.
          </SectionTitle>
        </div>
        <p
          class="reveal"
          :style="{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '17px',
            fontWeight: 300,
            lineHeight: 1.55,
            maxWidth: '380px',
            margin: 0,
          }"
        >
          Progressive overload, made obvious. Goals, PRs, history, and clean charts that show — at a
          glance — whether you're getting stronger or stalling.
        </p>
      </div>

      <!-- Bento grid -->
      <div
        class="bento-grid"
        :style="{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '18px',
        }"
      >
        <div
          v-for="(card, i) in cards"
          :key="i"
          class="reveal"
          @mouseenter="hovered[i] = true"
          @mouseleave="hovered[i] = false"
          :style="{
            gridColumn: card.span,
            gridRow: card.tall ? 'span 2' : 'auto',
            background: '#0a0a0a',
            border: hovered[i]
              ? '1px solid rgba(204,255,0,0.3)'
              : '1px solid rgba(255,255,255,0.06)',
            borderRadius: '28px',
            overflow: 'hidden',
            position: 'relative',
            minHeight: card.tall ? '600px' : '320px',
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
            transition: 'all 350ms cubic-bezier(0.16,1,0.3,1)',
            transform: hovered[i] ? 'translateY(-4px)' : 'translateY(0)',
            boxShadow: hovered[i]
              ? '0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(204,255,0,0.1)'
              : 'none',
          }"
        >
          <!-- Image area -->
          <div
            v-if="card.img"
            :style="{
              position: 'relative',
              height: card.compact ? '200px' : card.tall ? '60%' : '200px',
              overflow: 'hidden',
              background: '#000',
            }"
          >
            <img
              :src="card.img"
              alt=""
              :style="{
                position: 'absolute',
                top: '4%',
                left: '50%',
                transform: `translateX(-50%) scale(${hovered[i] ? 1.05 : 1})`,
                width: '78%',
                height: 'auto',
                transition: 'transform 700ms cubic-bezier(0.16,1,0.3,1)',
                borderRadius: '24px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.05)',
              }"
            />
            <div
              :style="{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, transparent 50%, #0a0a0a 95%)',
              }"
            />
          </div>

          <!-- Text content -->
          <div
            :style="{
              padding: card.compact ? '20px' : '32px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              position: 'relative',
              zIndex: 2,
            }"
          >
            <div class="protocol" :style="{ color: '#CCFF00', marginBottom: '12px', fontSize: '10px' }">
              {{ card.tag }}
            </div>
            <h3
              :style="{
                margin: 0,
                fontFamily: '\'Space Grotesk\', sans-serif',
                fontWeight: 700,
                fontStyle: 'italic',
                fontSize: card.compact ? '20px' : card.tall ? '32px' : '26px',
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                textTransform: 'uppercase',
                color: '#fff',
              }"
            >
              {{ card.title }}
            </h3>
            <p
              :style="{
                color: 'rgba(255,255,255,0.6)',
                fontWeight: 300,
                fontSize: card.compact ? '13px' : '14.5px',
                lineHeight: 1.55,
                marginTop: '12px',
                marginBottom: 0,
              }"
            >
              {{ card.body }}
            </p>
          </div>
        </div>
      </div>

      <!-- Numbers row -->
      <div
        class="metrics-strip-4"
        :style="{
          marginTop: '80px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px',
          paddingTop: '60px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }"
      >
        <div v-for="(pair, i) in numbers" :key="i" class="reveal">
          <div
            :style="{
              fontFamily: '\'JetBrains Mono\', monospace',
              fontWeight: 800,
              fontSize: 'clamp(32px, 3.6vw, 48px)',
              color: '#CCFF00',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }"
          >
            {{ pair.n }}
          </div>
          <div class="protocol" :style="{ color: '#666', marginTop: '10px', fontSize: '10px' }">
            {{ pair.l }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
