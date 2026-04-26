<script setup lang="ts">
const screens = [
  '/assets/screens/chest-progression.png',
  '/assets/screens/bench-progress.png',
  '/assets/screens/history.png',
  '/assets/screens/progression.png',
]

const screen = ref(0)

onMounted(() => {
  const t = setInterval(() => {
    screen.value = (screen.value + 1) % screens.length
  }, 2800)
  onBeforeUnmount(() => clearInterval(t))
})

const leftChips = [
  { title: 'Volume Trends', sub: '4W · 12W · 26W · 52W', accent: '#CCFF00' },
  { title: 'Streak Tracking', sub: '12 weeks unbroken', accent: '#22C55E' },
  { title: 'Body-Part Split', sub: 'Push · Pull · Legs · Full', accent: '#CCFF00' },
  { title: 'Rest & Recovery', sub: 'Avg rest between sets', accent: 'rgba(255,255,255,0.5)' },
]

const rightChips = [
  { title: 'Personal Records', sub: 'Auto-detected · weight / reps / vol', accent: '#CCFF00' },
  { title: '1RM Estimates', sub: 'Epley formula, per set', accent: '#CCFF00' },
  { title: 'Workout History', sub: 'Every session, searchable', accent: 'rgba(255,255,255,0.5)' },
  { title: 'Exercise Insights', sub: 'Top set · best 1RM · total volume', accent: '#22C55E' },
]

const stats = [
  { n: '4W–52W', l: 'Time windows', sub: 'Zoom in or out' },
  { n: 'PRs', l: 'Auto-detected', sub: 'Weight, reps & volume' },
  { n: '1RM', l: 'Estimated per set', sub: 'Every exercise' },
  { n: '∞', l: 'History stored', sub: 'Every set, forever' },
]

const barVals = [40, 55, 48, 62, 58, 70, 75, 68, 80, 85, 78, 92]
const barMax = Math.max(...barVals)

const linePts = [
  [0, 32], [10, 28], [20, 24], [30, 26], [40, 20], [50, 18],
  [60, 14], [70, 12], [80, 8], [90, 6], [100, 2],
]
const polyline = linePts.map(([x, y]) => `${x},${y}`).join(' ')

function chipBorder(accent: string) {
  if (accent === '#CCFF00') return '1px solid rgba(204,255,0,0.12)'
  if (accent === '#22C55E') return '1px solid rgba(34,197,94,0.12)'
  return '1px solid rgba(255,255,255,0.12)'
}

function chipSubColor(accent: string) {
  if (accent === '#CCFF00') return '#CCFF00'
  if (accent === '#22C55E') return '#22C55E'
  return 'rgba(255,255,255,0.4)'
}
</script>

<template>
  <section
    id="progress"
    :style="{
      background: '#000',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '160px 0',
      position: 'relative',
      overflow: 'hidden',
    }"
  >
    <!-- Center glow -->
    <div
      :style="{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '800px',
        height: '800px',
        background: 'radial-gradient(circle, rgba(204,255,0,0.07), transparent 65%)',
        filter: 'blur(80px)',
        pointerEvents: 'none',
        transform: 'translate(-50%,-50%)',
      }"
    />

    <div class="container" style="position: relative;">
      <!-- Header -->
      <div :style="{ textAlign: 'center', marginBottom: '80px' }">
        <Eyebrow color="#CCFF00" :style="{ justifyContent: 'center' }">▸ PROGRESS &amp; INSIGHTS</Eyebrow>
        <SectionTitle :max="700" :style="{ textAlign: 'center', margin: '0 auto' }">
          Watch the numbers <span class="lime">compound.</span>
        </SectionTitle>
        <p
          class="reveal"
          :style="{
            color: 'rgba(255,255,255,0.55)',
            fontSize: '17px',
            fontWeight: 300,
            lineHeight: 1.6,
            maxWidth: '560px',
            margin: '24px auto 0',
          }"
        >
          Volume, PRs, 1RM estimates, streaks, body-part splits, workout history, rest trends — every
          dimension of your training in one place.
        </p>
      </div>

      <!-- 3-col layout -->
      <div
        class="progress-triCol"
        :style="{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: '40px',
          alignItems: 'center',
        }"
      >
        <!-- LEFT chips -->
        <div
          class="progress-chips-left reveal"
          :style="{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            alignItems: 'flex-end',
          }"
        >
          <div
            v-for="(chip, i) in leftChips"
            :key="i"
            :style="{
              background: '#0a0a0a',
              border: chipBorder(chip.accent),
              borderRadius: '14px',
              padding: '12px 16px',
              maxWidth: '220px',
            }"
          >
            <div
              :style="{
                fontFamily: '\'Space Grotesk\', sans-serif',
                fontWeight: 700,
                fontSize: '14px',
                color: '#fff',
                letterSpacing: '-0.01em',
              }"
            >
              {{ chip.title }}
            </div>
            <div
              :style="{
                fontFamily: '\'JetBrains Mono\', monospace',
                fontSize: '10px',
                letterSpacing: '0.1em',
                color: chipSubColor(chip.accent),
                marginTop: '4px',
              }"
            >
              {{ chip.sub }}
            </div>
          </div>

          <!-- Mini bar chart -->
          <div
            :style="{
              background: '#0a0a0a',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px',
              padding: '14px 18px',
              width: '200px',
            }"
          >
            <div class="protocol" :style="{ color: '#666', fontSize: '9px', marginBottom: '10px' }">
              WEEKLY VOLUME
            </div>
            <div :style="{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '36px' }">
              <div
                v-for="(v, i) in barVals"
                :key="i"
                :style="{
                  flex: 1,
                  borderRadius: '2px',
                  background: i === barVals.length - 1 ? '#CCFF00' : 'rgba(204,255,0,0.25)',
                  height: `${(v / barMax) * 100}%`,
                  boxShadow: i === barVals.length - 1 ? '0 0 8px rgba(204,255,0,0.6)' : 'none',
                }"
              />
            </div>
          </div>
        </div>

        <!-- CENTER phone -->
        <div
          :style="{
            position: 'relative',
            animation: 'float-y 6s ease-in-out infinite',
            flexShrink: 0,
          }"
        >
          <!-- Glow ring -->
          <div
            :style="{
              position: 'absolute',
              inset: '-30px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(204,255,0,0.18), transparent 65%)',
              filter: 'blur(20px)',
              animation: 'pulse-glow 4s ease-in-out infinite',
            }"
          />
          <Phone :scale="1.05">
            <img
              v-for="(src, i) in screens"
              :key="i"
              :src="src"
              alt=""
              :style="{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: screen === i ? 1 : 0,
                transition: 'opacity 800ms cubic-bezier(0.16,1,0.3,1)',
              }"
            />
          </Phone>

          <!-- Dot indicators -->
          <div
            :style="{
              position: 'absolute',
              bottom: '-28px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '6px',
            }"
          >
            <div
              v-for="(_, i) in screens"
              :key="i"
              @click="screen = i"
              :style="{
                width: screen === i ? '20px' : '6px',
                height: '6px',
                borderRadius: '3px',
                cursor: 'pointer',
                background: screen === i ? '#CCFF00' : 'rgba(255,255,255,0.2)',
                boxShadow: screen === i ? '0 0 8px #CCFF00' : 'none',
                transition: 'all 400ms cubic-bezier(0.16,1,0.3,1)',
              }"
            />
          </div>
        </div>

        <!-- RIGHT chips -->
        <div
          class="progress-chips-right reveal"
          :style="{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            alignItems: 'flex-start',
          }"
        >
          <div
            v-for="(chip, i) in rightChips"
            :key="i"
            :style="{
              background: '#0a0a0a',
              border: chipBorder(chip.accent),
              borderRadius: '14px',
              padding: '12px 16px',
              maxWidth: '220px',
            }"
          >
            <div
              :style="{
                fontFamily: '\'Space Grotesk\', sans-serif',
                fontWeight: 700,
                fontSize: '14px',
                color: '#fff',
                letterSpacing: '-0.01em',
              }"
            >
              {{ chip.title }}
            </div>
            <div
              :style="{
                fontFamily: '\'JetBrains Mono\', monospace',
                fontSize: '10px',
                letterSpacing: '0.1em',
                color: chipSubColor(chip.accent),
                marginTop: '4px',
              }"
            >
              {{ chip.sub }}
            </div>
          </div>

          <!-- Mini line chart -->
          <div
            :style="{
              background: '#0a0a0a',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px',
              padding: '14px 18px',
              width: '200px',
            }"
          >
            <div class="protocol" :style="{ color: '#666', fontSize: '9px', marginBottom: '10px' }">
              1RM PROGRESSION
            </div>
            <svg viewBox="0 0 100 36" :style="{ width: '100%', height: '36px' }">
              <polyline
                :points="polyline"
                fill="none"
                stroke="#CCFF00"
                stroke-width="1.5"
                stroke-linejoin="round"
                opacity="0.7"
              />
              <circle cx="100" cy="2" r="2.5" fill="#CCFF00" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Bottom stats strip -->
      <div
        class="reveal metrics-strip-4"
        :style="{
          marginTop: '80px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.06)',
        }"
      >
        <div
          v-for="(s, i) in stats"
          :key="i"
          class="reveal"
          :style="{
            padding: '28px 24px',
            background: '#0a0a0a',
            borderRight: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none',
          }"
        >
          <div
            :style="{
              fontFamily: '\'JetBrains Mono\', monospace',
              fontWeight: 800,
              fontSize: 'clamp(24px, 2.8vw, 40px)',
              color: '#CCFF00',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }"
          >
            {{ s.n }}
          </div>
          <div class="protocol" :style="{ color: '#fff', fontSize: '10px', marginTop: '10px' }">
            {{ s.l }}
          </div>
          <div :style="{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '4px' }">
            {{ s.sub }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
