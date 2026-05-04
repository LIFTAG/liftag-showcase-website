<script setup lang="ts">
const screens = [
  '/assets/screens/chest-progression.png',
  '/assets/screens/bench-progress.png',
  '/assets/screens/history.png',
  '/assets/screens/progression.png',
]

const screen = ref(0)
const screenPulse = ref(0)
const activeVolumeBar = ref<number | null>(null)
const lineProgress = ref(1)
const lineChartRef = ref<SVGSVGElement | null>(null)
const reduceMotion = ref(false)
const paneMotionDisabled = ref(false)
const progressScreenCycleMs = 2800
let volumeResetTimer: ReturnType<typeof setTimeout> | null = null
let lineTargetProgress = 1
let lineProgressRaf = 0
let motionMql: MediaQueryList | null = null
let paneMotionMql: MediaQueryList | null = null

const rawMouse = useSharedMouse().latest
const paneMouse = useLerp(rawMouse, 0.075)

const progressPanePaths = [
  { outward: 1.28, cross: 0.44, vertical: 0.72, lane: -0.96 },
  { outward: 0.86, cross: -0.72, vertical: 1.04, lane: -0.28 },
  { outward: 1.08, cross: 0.86, vertical: 0.58, lane: 0.46 },
  { outward: 0.74, cross: -0.38, vertical: 1.18, lane: 0.88 },
  { outward: 1.38, cross: 0.28, vertical: 0.84, lane: 1.14 },
]

function setScreen(next: number) {
  screen.value = next
  screenPulse.value += 1
}

onMounted(() => {
  motionMql = window.matchMedia('(prefers-reduced-motion: reduce)')
  reduceMotion.value = motionMql.matches
  motionMql.addEventListener('change', onMotionChange)

  paneMotionMql = window.matchMedia('(max-width: 768px), (hover: none), (pointer: coarse)')
  paneMotionDisabled.value = paneMotionMql.matches
  paneMotionMql.addEventListener('change', onPaneMotionChange)

  const t = setInterval(() => {
    setScreen((screen.value + 1) % screens.length)
  }, progressScreenCycleMs)
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
const litVolumeBar = computed(() => activeVolumeBar.value ?? barVals.length - 1)

const linePts = [
  [0, 32], [10, 28], [20, 24], [30, 26], [40, 20], [50, 18],
  [60, 14], [70, 12], [80, 8], [90, 6], [100, 2],
]
const polyline = linePts.map(([x, y]) => `${x},${y}`).join(' ')
const lineClipWidth = computed(() => Math.max(0, lineProgress.value * 100))
const lineDot = computed(() => linePointAtProgress(lineProgress.value))

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

function chipGlint(accent: string) {
  if (accent === '#CCFF00') return 'rgba(204,255,0,0.18)'
  if (accent === '#22C55E') return 'rgba(34,197,94,0.16)'
  return 'rgba(255,255,255,0.1)'
}

function linePointAtProgress(progress: number) {
  const x = Math.max(0, Math.min(100, progress * 100))

  for (let i = 0; i < linePts.length - 1; i += 1) {
    const [x0, y0] = linePts[i]
    const [x1, y1] = linePts[i + 1]
    if (x < x0 || x > x1) continue

    const t = (x - x0) / Math.max(1, x1 - x0)
    return {
      x,
      y: y0 + (y1 - y0) * t,
    }
  }

  const last = linePts[linePts.length - 1]
  return { x: last[0], y: last[1] }
}

function animateLineProgress() {
  lineProgressRaf = 0
  lineProgress.value += (lineTargetProgress - lineProgress.value) * 0.14

  if (Math.abs(lineTargetProgress - lineProgress.value) < 0.001) {
    lineProgress.value = lineTargetProgress
    return
  }

  lineProgressRaf = requestAnimationFrame(animateLineProgress)
}

function setLineTargetProgress(progress: number) {
  lineTargetProgress = Math.max(0.02, Math.min(1, progress))
  if (!lineProgressRaf) lineProgressRaf = requestAnimationFrame(animateLineProgress)
}

function handleLineChartMove(event: PointerEvent) {
  const rect = lineChartRef.value?.getBoundingClientRect()
    ?? (event.currentTarget as HTMLElement).getBoundingClientRect()
  setLineTargetProgress((event.clientX - rect.left) / Math.max(1, rect.width))
}

function resetLineChart() {
  setLineTargetProgress(1)
}

function clearVolumeResetTimer() {
  if (!volumeResetTimer) return
  clearTimeout(volumeResetTimer)
  volumeResetTimer = null
}

function activateVolumeBar(index: number, event?: PointerEvent) {
  clearVolumeResetTimer()
  activeVolumeBar.value = index

  if (event && event.pointerType !== 'mouse') {
    volumeResetTimer = setTimeout(() => {
      activeVolumeBar.value = null
      volumeResetTimer = null
    }, 1400)
  }
}

function clearVolumeBar(event?: PointerEvent | FocusEvent) {
  if (event instanceof PointerEvent && event.pointerType !== 'mouse') return

  clearVolumeResetTimer()
  activeVolumeBar.value = null
}

function onMotionChange(e: MediaQueryListEvent) {
  reduceMotion.value = e.matches
}

function onPaneMotionChange(e: MediaQueryListEvent) {
  paneMotionDisabled.value = e.matches
}

function progressPaneTransform(side: 'left' | 'right', index: number, kind: 'chip' | 'chart' = 'chip') {
  if (reduceMotion.value || paneMotionDisabled.value) return 'translate3d(0, 0, 0)'

  const sideSign = side === 'left' ? -1 : 1
  const path = progressPanePaths[kind === 'chart' ? 4 : index] ?? progressPanePaths[0]
  const x = sideSign * (
    paneMouse.value.x * 11 * path.outward
    + paneMouse.value.y * 5 * path.cross
  )
  const y = paneMouse.value.y * 7.4 * path.vertical
    + paneMouse.value.x * sideSign * 4.2 * path.lane

  return `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`
}

onBeforeUnmount(() => {
  clearVolumeResetTimer()
  cancelAnimationFrame(lineProgressRaf)
  motionMql?.removeEventListener('change', onMotionChange)
  motionMql = null
  paneMotionMql?.removeEventListener('change', onPaneMotionChange)
  paneMotionMql = null
})
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
      class="section-glow is-green is-centered"
      style="--glow-top: 50%; --glow-left: 50%; --glow-right: auto; --glow-size: 800px; --glow-blur: 80px; --glow-falloff: 65%;"
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
          Volume, PRs, 1RM estimates, streaks, body-part splits, workout history, rest trends. Every
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
            class="progress-chip progress-motion-pane"
            :style="{
              background: '#0a0a0a',
              border: chipBorder(chip.accent),
              borderRadius: '14px',
              padding: '12px 16px',
              maxWidth: '220px',
              position: 'relative',
              overflow: 'hidden',
              '--chip-glint': chipGlint(chip.accent),
              '--chip-delay': `${i * 120}ms`,
              transform: progressPaneTransform('left', i),
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
            class="weekly-volume-card progress-motion-pane"
            :style="{
              background: '#0a0a0a',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px',
              padding: '14px 18px',
              width: '200px',
              transform: progressPaneTransform('left', leftChips.length, 'chart'),
            }"
          >
            <div class="protocol" :style="{ color: '#666', fontSize: '9px', marginBottom: '10px' }">
              WEEKLY VOLUME
            </div>
            <div
              class="weekly-volume-bars"
              :style="{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '36px' }"
              @pointerleave="clearVolumeBar($event)"
            >
              <button
                v-for="(v, i) in barVals"
                :key="i"
                type="button"
                class="weekly-volume-bar"
                :class="{ 'is-lit': i === litVolumeBar }"
                :aria-label="`Week ${i + 1} volume ${v}`"
                @pointerenter="activateVolumeBar(i, $event)"
                @pointerdown="activateVolumeBar(i, $event)"
                @focus="activateVolumeBar(i)"
                @blur="clearVolumeBar"
                :style="{
                  flex: 1,
                }"
              >
                <span
                  :style="{
                    height: `${(v / barMax) * 100}%`,
                    background: i === litVolumeBar
                      ? 'linear-gradient(180deg, #F0FF99 0%, #CCFF00 58%, #8CB000 100%)'
                      : 'rgba(204,255,0,0.22)',
                    boxShadow: i === litVolumeBar
                      ? '0 0 12px rgba(204,255,0,0.86), 0 0 30px rgba(204,255,0,0.22)'
                      : '0 0 0 rgba(204,255,0,0)',
                    opacity: i === litVolumeBar ? 1 : 0.64,
                  }"
                />
              </button>
            </div>
            <div class="weekly-volume-readout">
              WEEK {{ litVolumeBar + 1 }} · {{ barVals[litVolumeBar] }} VOL
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
              inset: '6px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(204,255,0,0.18), transparent 65%)',
              filter: 'blur(18px)',
              animation: 'pulse-glow 4s ease-in-out infinite',
            }"
          />
          <div :key="screenPulse" class="progress-phone-pulse" aria-hidden="true" />
          <Phone
            :src="screens[screen]"
            :scale="1.05"
            :style="{ position: 'relative', zIndex: '2' }"
          />

          <div
            class="progress-cycle-indicator"
            :style="{ '--cycle-ms': `${progressScreenCycleMs}ms` }"
            aria-hidden="true"
          >
            <span :key="`progress-cycle-${screenPulse}`" />
          </div>

          <!-- Dot indicators -->
          <div
            class="progress-screen-dots"
          >
            <div
              v-for="(_, i) in screens"
              :key="i"
              class="progress-screen-dot"
              :class="{ 'is-active': screen === i }"
              @click="setScreen(i)"
              :style="{
                width: screen === i ? '20px' : '6px',
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
            class="progress-chip progress-motion-pane"
            :style="{
              background: '#0a0a0a',
              border: chipBorder(chip.accent),
              borderRadius: '14px',
              padding: '12px 16px',
              maxWidth: '220px',
              position: 'relative',
              overflow: 'hidden',
              '--chip-glint': chipGlint(chip.accent),
              '--chip-delay': `${(i + leftChips.length) * 120}ms`,
              transform: progressPaneTransform('right', i),
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
            class="progress-line-card progress-motion-pane"
            @pointermove="handleLineChartMove"
            @pointerleave="resetLineChart"
            @pointercancel="resetLineChart"
            @blur="resetLineChart"
            :style="{
              background: '#0a0a0a',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px',
              padding: '14px 18px',
              width: '200px',
              transform: progressPaneTransform('right', rightChips.length, 'chart'),
            }"
          >
            <div class="protocol" :style="{ color: '#666', fontSize: '9px', marginBottom: '10px' }">
              1RM PROGRESSION
            </div>
            <svg
              ref="lineChartRef"
              class="progress-line-chart"
              viewBox="0 0 100 36"
              :style="{ width: '100%', height: '36px' }"
            >
              <defs>
                <clipPath id="progress-line-clip">
                  <rect x="0" y="-4" :width="lineClipWidth" height="44" />
                </clipPath>
              </defs>
              <polyline
                points="0,32 100,32"
                fill="none"
                stroke="rgba(204,255,0,0.12)"
                stroke-width="1"
                stroke-linecap="round"
              />
              <polyline
                class="progress-line-path"
                :points="polyline"
                fill="none"
                stroke="#CCFF00"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                clip-path="url(#progress-line-clip)"
                opacity="0.7"
              />
              <circle
                class="progress-line-dot"
                :cx="lineDot.x"
                :cy="lineDot.y"
                r="2.5"
                fill="#CCFF00"
              />
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
          class="reveal progress-stat-card"
          :style="{
            padding: '28px 24px',
            background: '#0a0a0a',
            borderRight: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            position: 'relative',
            overflow: 'hidden',
            '--stat-delay': `${i * 170}ms`,
          }"
        >
          <div
            class="stat-num"
            style="--stat-num-size: clamp(24px, 2.8vw, 40px);"
          >
            {{ s.n }}
          </div>
          <div class="stat-label" style="color: var(--liftag-fg);">{{ s.l }}</div>
          <div :style="{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '4px' }">
            {{ s.sub }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.progress-chip::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(110deg, transparent 18%, var(--chip-glint), transparent 46%);
  transform: translateX(-130%);
  opacity: 0.72;
  animation: progressChipGlint 6.4s cubic-bezier(0.16, 1, 0.3, 1) infinite;
  animation-delay: var(--chip-delay, 0ms);
}

.progress-motion-pane {
  will-change: transform;
  backface-visibility: hidden;
}

.weekly-volume-card {
  position: relative;
  overflow: hidden;
}

.weekly-volume-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  pointer-events: none;
  background: radial-gradient(120px 64px at 18% 32%, rgba(204, 255, 0, 0.08), transparent 70%);
  opacity: 0.8;
}

.weekly-volume-bars {
  position: relative;
  z-index: 1;
}

.weekly-volume-bar {
  appearance: none;
  height: 100%;
  min-width: 0;
  padding: 0;
  border: 0;
  border-radius: 5px;
  background: transparent;
  display: flex;
  align-items: flex-end;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.weekly-volume-bar span {
  display: block;
  width: 100%;
  border-radius: 3px 3px 2px 2px;
  transform-origin: 50% 100%;
  transition:
    transform 520ms cubic-bezier(0.16, 1, 0.3, 1),
    background 420ms cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 480ms cubic-bezier(0.16, 1, 0.3, 1),
    opacity 320ms ease;
}

.weekly-volume-bar.is-lit span {
  transform: translateY(-2px) scaleY(1.06);
}

.weekly-volume-bar:focus-visible {
  outline: 1px solid rgba(204, 255, 0, 0.72);
  outline-offset: 3px;
}

.weekly-volume-readout {
  position: relative;
  z-index: 1;
  margin-top: 9px;
  font-family: var(--liftag-font-mono);
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.13em;
  color: rgba(204, 255, 0, 0.78);
  text-transform: uppercase;
  transition: color 260ms ease;
}

.progress-phone-pulse {
  position: absolute;
  inset: -22px;
  z-index: 1;
  pointer-events: none;
  border-radius: 999px;
  border: 1px solid rgba(204, 255, 0, 0.24);
  box-shadow:
    0 0 28px rgba(204, 255, 0, 0.12),
    inset 0 0 34px rgba(204, 255, 0, 0.07);
  animation: progressPhonePulse 900ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.progress-cycle-indicator {
  position: absolute;
  left: 50%;
  bottom: -48px;
  width: 92px;
  height: 3px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(-50%);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
}

.progress-cycle-indicator span {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(204, 255, 0, 0.5), #ccff00);
  box-shadow: 0 0 12px rgba(204, 255, 0, 0.48);
  transform: scaleX(0);
  transform-origin: left center;
  animation: phoneCycleFill var(--cycle-ms, 2800ms) linear forwards;
}

.progress-screen-dots {
  position: absolute;
  bottom: -28px;
  left: 50%;
  display: flex;
  gap: 6px;
  transform: translateX(-50%);
}

.progress-screen-dot {
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition:
    width 400ms cubic-bezier(0.16, 1, 0.3, 1),
    background 400ms cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 400ms cubic-bezier(0.16, 1, 0.3, 1);
}

.progress-screen-dot.is-active {
  background: #ccff00;
  box-shadow: 0 0 8px #ccff00;
}

.progress-line-chart {
  cursor: crosshair;
  overflow: visible;
  touch-action: pan-y;
}

.progress-line-card {
  cursor: crosshair;
  touch-action: manipulation;
}

.progress-line-path {
  filter: drop-shadow(0 0 7px rgba(204, 255, 0, 0.38));
  animation: progressLineBreathe 3600ms ease-in-out 500ms infinite;
}

.progress-line-dot {
  filter: drop-shadow(0 0 8px rgba(204, 255, 0, 0.8));
  animation: progressDotPulse 2600ms cubic-bezier(0.16, 1, 0.3, 1) infinite;
  transform-box: fill-box;
  transform-origin: center;
}

.progress-stat-card::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(120deg, transparent 20%, rgba(204, 255, 0, 0.08), transparent 52%);
  transform: translateX(-140%);
  animation: progressStatSweep 7.2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
  animation-delay: var(--stat-delay, 0ms);
}

@keyframes progressChipGlint {
  0%, 62% {
    transform: translateX(-130%);
  }
  78%, 100% {
    transform: translateX(130%);
  }
}

@keyframes progressPhonePulse {
  from {
    opacity: 0.72;
    transform: scale(0.92);
  }
  to {
    opacity: 0;
    transform: scale(1.12);
  }
}

@keyframes phoneCycleFill {
  to {
    transform: scaleX(1);
  }
}

@keyframes progressLineBreathe {
  0%, 100% {
    opacity: 0.62;
  }
  50% {
    opacity: 1;
  }
}

@keyframes progressDotPulse {
  0%, 100% {
    opacity: 0.86;
    filter: drop-shadow(0 0 7px rgba(204, 255, 0, 0.72));
  }
  45% {
    opacity: 1;
    filter: drop-shadow(0 0 14px rgba(204, 255, 0, 0.92));
  }
}

@keyframes progressStatSweep {
  0%, 68% {
    transform: translateX(-140%);
  }
  84%, 100% {
    transform: translateX(140%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .progress-chip::after,
  .progress-phone-pulse,
  .progress-cycle-indicator span,
  .progress-line-path,
  .progress-line-dot,
  .progress-stat-card::after {
    animation: none;
  }

  .weekly-volume-bar span {
    transition: none;
  }

  .progress-motion-pane {
    transform: none !important;
    will-change: auto;
  }
}

@media (max-width: 768px) {
  .progress-motion-pane {
    transform: none !important;
    will-change: auto;
  }

  .progress-cycle-indicator {
    background: rgba(255, 255, 255, 0.075);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);
  }

  .progress-cycle-indicator span {
    background: linear-gradient(90deg, rgba(204, 255, 0, 0.32), rgba(204, 255, 0, 0.72));
    box-shadow: 0 0 10px rgba(204, 255, 0, 0.28);
  }

  .progress-screen-dot {
    background: rgba(255, 255, 255, 0.14);
  }

  .progress-screen-dot.is-active {
    background: rgba(204, 255, 0, 0.72);
    box-shadow: 0 0 10px rgba(204, 255, 0, 0.34);
  }
}
</style>
