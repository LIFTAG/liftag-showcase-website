<script setup lang="ts">
// Gym wall scoreboard for the progress hero.
// Solari split-flap tiles for 1RM / volume / streak. Complements the forged
// plate: that object is poured metal, this one is the board that flips kg
// and PRs. Flip motion is CSS 3D only. Vue writes character state when a
// tile starts or settles, never per tick, so ProgressSection does not
// re-render with the board.

type BoardTile = {
  shown: string
  next: string
  flipping: boolean
}

type BoardRow = {
  id: string
  label: string
  values: string[]
  index: number
  tiles: BoardTile[]
}

const ROW_SPECS = [
  { id: 'bench', label: 'BENCH 1RM', values: ['102.5 KG', '105.0 KG', '107.5 KG'] },
  { id: 'volume', label: 'VOLUME', values: ['18400 KG', '19250 KG', '20150 KG'] },
  { id: 'streak', label: 'STREAK', values: ['14 DAYS', '21 DAYS', '28 DAYS'] },
] as const

const CYCLE_MS = 2400
const FLAP_MS = 560
const FLAP_TAIL_MS = 24
const STAGGER_MS = 52
const FIRST_HOLD_MS = 780
const ROW_OFFSET_MS = [0, 360, 720] as const

const boardRef = ref<HTMLElement | null>(null)
const rows = reactive<BoardRow[]>(
  ROW_SPECS.map((spec) => ({
    id: spec.id,
    label: spec.label,
    values: [...spec.values],
    index: 0,
    tiles: spec.values[0].split('').map((ch) => ({
      shown: ch,
      next: ch,
      flipping: false,
    })),
  })),
)

let active = false
let inView = false
let documentVisible = true
let reduceMotion = false
let disposed = false
let io: IntersectionObserver | null = null
let motionMql: MediaQueryList | null = null
const timers = new Set<ReturnType<typeof setTimeout>>()

function glyphClass(ch: string) {
  if (ch === ' ') return 'is-blank'
  if (/[0-9.]/.test(ch)) return 'is-digit'
  return 'is-unit'
}

function canRun() {
  return active && inView && documentVisible && !reduceMotion && !disposed
}

function later(fn: () => void, ms: number) {
  const id = setTimeout(() => {
    timers.delete(id)
    if (disposed) return
    fn()
  }, ms)
  timers.add(id)
}

function clearTimers() {
  timers.forEach(clearTimeout)
  timers.clear()
}

function snapRows() {
  for (const row of rows) {
    const chars = row.values[row.index]
    row.tiles.forEach((tile, i) => {
      const ch = chars[i] ?? ' '
      tile.shown = ch
      tile.next = ch
      tile.flipping = false
    })
  }
}

function flipRow(row: BoardRow, value: string) {
  let delay = 0
  for (let i = 0; i < row.tiles.length; i += 1) {
    const ch = value[i] ?? ' '
    const tile = row.tiles[i]
    if (tile.shown === ch && !tile.flipping) continue
    const startAt = delay
    later(() => {
      if (!canRun()) return
      tile.next = ch
      tile.flipping = true
      later(() => {
        tile.shown = ch
        tile.next = ch
        tile.flipping = false
      }, FLAP_MS + FLAP_TAIL_MS)
    }, startAt)
    delay += STAGGER_MS
  }
}

function tickRow(row: BoardRow) {
  if (!canRun()) return
  row.index = (row.index + 1) % row.values.length
  flipRow(row, row.values[row.index])
  later(() => tickRow(row), CYCLE_MS)
}

function startBoard() {
  if (active || reduceMotion || disposed) return
  active = true
  rows.forEach((row, i) => {
    later(() => tickRow(row), FIRST_HOLD_MS + (ROW_OFFSET_MS[i] ?? 0))
  })
}

function stopBoard() {
  active = false
  clearTimers()
  snapRows()
}

function syncBoard() {
  if (inView && documentVisible && !reduceMotion) startBoard()
  else stopBoard()
}

function onVisibilityChange() {
  documentVisible = !document.hidden
  syncBoard()
}

function onMotionChange(event: MediaQueryListEvent) {
  reduceMotion = event.matches
  if (reduceMotion) stopBoard()
  else syncBoard()
}

onMounted(() => {
  motionMql = window.matchMedia('(prefers-reduced-motion: reduce)')
  reduceMotion = motionMql.matches
  motionMql.addEventListener('change', onMotionChange)

  documentVisible = !document.hidden
  document.addEventListener('visibilitychange', onVisibilityChange)

  if (!boardRef.value) return
  io = new IntersectionObserver(
    ([entry]) => {
      inView = entry?.isIntersecting ?? false
      syncBoard()
    },
    { threshold: 0.35 },
  )
  io.observe(boardRef.value)
})

onBeforeUnmount(() => {
  disposed = true
  stopBoard()
  io?.disconnect()
  io = null
  motionMql?.removeEventListener('change', onMotionChange)
  motionMql = null
  document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<template>
  <div
    ref="boardRef"
    class="gym-scoreboard"
    role="group"
    aria-label="Gym scoreboard with bench 1RM, training volume, and streak."
  >
    <p class="sr-only">
      Sample gym scoreboard. Bench 1RM 102.5 kilograms. Volume 18400 kilograms. Streak 14 days.
    </p>

    <div class="gym-scoreboard-head" aria-hidden="true">
      <span class="gym-scoreboard-kicker">SESSION</span>
      <span class="gym-scoreboard-live">
        <span class="gym-scoreboard-pip" />
        LIVE
      </span>
    </div>

    <div class="gym-scoreboard-rows" aria-hidden="true">
      <div
        v-for="row in rows"
        :key="row.id"
        class="gym-scoreboard-row"
      >
        <span class="gym-scoreboard-label">{{ row.label }}</span>
        <div class="gym-scoreboard-tiles">
          <div
            v-for="(tile, i) in row.tiles"
            :key="i"
            class="gym-scoreboard-tile"
            :class="{ 'is-flipping': tile.flipping }"
          >
            <div class="gym-scoreboard-half is-top">
              <span
                class="gym-scoreboard-glyph"
                :class="glyphClass(tile.flipping ? tile.next : tile.shown)"
              >{{ tile.flipping ? tile.next : tile.shown }}</span>
            </div>
            <div class="gym-scoreboard-half is-bot">
              <span
                class="gym-scoreboard-glyph"
                :class="glyphClass(tile.shown)"
              >{{ tile.shown }}</span>
            </div>
            <template v-if="tile.flipping">
              <div class="gym-scoreboard-flap is-top">
                <span class="gym-scoreboard-flap-face">
                  <span
                    class="gym-scoreboard-glyph"
                    :class="glyphClass(tile.shown)"
                  >{{ tile.shown }}</span>
                </span>
              </div>
              <div class="gym-scoreboard-flap is-bot">
                <span class="gym-scoreboard-flap-face">
                  <span
                    class="gym-scoreboard-glyph"
                    :class="glyphClass(tile.next)"
                  >{{ tile.next }}</span>
                </span>
              </div>
            </template>
            <span class="gym-scoreboard-crease" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gym-scoreboard {
  --flap-half: 280ms;
  --flap-ease: cubic-bezier(0.16, 1, 0.3, 1);
  --tile-w: clamp(18px, 6.2vw, 26px);
  --tile-h: clamp(28px, 9vw, 38px);
  --tile-font: clamp(13px, 4.4vw, 17px);
  width: 100%;
  max-width: 420px;
  padding: 12px 12px 11px;
  background: var(--liftag-neutral);
  border: 1px solid var(--liftag-border-soft);
  border-radius: var(--liftag-r-sm);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 10px 28px rgba(0, 0, 0, 0.28);
  contain: layout;
}

.gym-scoreboard-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  padding: 0 2px 8px;
  border-bottom: 1px solid var(--liftag-border-faint);
}

.gym-scoreboard-kicker,
.gym-scoreboard-live,
.gym-scoreboard-label {
  font-family: var(--liftag-font-mono);
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  line-height: 1;
}

.gym-scoreboard-kicker {
  font-size: 9px;
  color: var(--liftag-fg-tertiary);
}

.gym-scoreboard-live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 9px;
  color: var(--liftag-primary);
}

.gym-scoreboard-pip {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--liftag-primary);
  box-shadow: 0 0 8px var(--liftag-primary-glow);
}

.gym-scoreboard-rows {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.gym-scoreboard-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 0;
  white-space: nowrap;
}

.gym-scoreboard-label {
  flex: 0 1 auto;
  min-width: 9.6ch;
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--liftag-fg-muted);
  white-space: nowrap;
}

.gym-scoreboard-tiles {
  display: flex;
  gap: 2px;
  padding: 2px;
  background: #000;
  border-radius: 3px;
}

.gym-scoreboard-tile {
  position: relative;
  flex: 0 0 auto;
  width: var(--tile-w);
  height: var(--tile-h);
  border-radius: 2px;
  background: #000;
  perspective: 280px;
  -webkit-perspective: 280px;
  transform-style: preserve-3d;
}

.gym-scoreboard-half,
.gym-scoreboard-flap {
  position: absolute;
  left: 0;
  right: 0;
  height: 50%;
}

.gym-scoreboard-half {
  z-index: 1;
  overflow: hidden;
}

.gym-scoreboard-half.is-top,
.gym-scoreboard-flap.is-top {
  top: 0;
  background: var(--liftag-surface-dark);
  border-radius: 2px 2px 0 0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.gym-scoreboard-half.is-bot,
.gym-scoreboard-flap.is-bot {
  bottom: 0;
  background: var(--liftag-neutral);
  border-radius: 0 0 2px 2px;
}

.gym-scoreboard-flap {
  z-index: 3;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  will-change: transform;
}

.gym-scoreboard-flap-face {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.gym-scoreboard-tile.is-flipping {
  z-index: 2;
}

.gym-scoreboard-flap.is-top {
  z-index: 4;
  transform-origin: 50% 100%;
  animation: gymBoardDrop var(--flap-half) var(--flap-ease) both;
}

.gym-scoreboard-flap.is-bot {
  z-index: 3;
  transform-origin: 50% 0%;
  animation: gymBoardRise var(--flap-half) var(--flap-ease) var(--flap-half) both;
}

.gym-scoreboard-glyph {
  position: absolute;
  left: 0;
  width: 100%;
  height: 200%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--liftag-font-mono);
  font-size: var(--tile-font);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  letter-spacing: 0;
  white-space: pre;
  user-select: none;
}

.gym-scoreboard-half.is-top .gym-scoreboard-glyph,
.gym-scoreboard-flap.is-top .gym-scoreboard-glyph {
  top: 0;
}

.gym-scoreboard-half.is-bot .gym-scoreboard-glyph,
.gym-scoreboard-flap.is-bot .gym-scoreboard-glyph {
  top: -100%;
}

.gym-scoreboard-glyph.is-digit {
  color: var(--liftag-primary);
}

.gym-scoreboard-glyph.is-unit {
  color: rgba(204, 255, 0, 0.58);
}

.gym-scoreboard-glyph.is-blank {
  visibility: hidden;
}

.gym-scoreboard-crease {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  z-index: 6;
  height: 1px;
  margin-top: -0.5px;
  background: rgba(0, 0, 0, 0.88);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.04);
  pointer-events: none;
}

@keyframes gymBoardDrop {
  from { transform: translateZ(1px) rotateX(0deg); }
  to { transform: translateZ(1px) rotateX(-90deg); }
}

@keyframes gymBoardRise {
  from { transform: translateZ(1px) rotateX(90deg); }
  to { transform: translateZ(1px) rotateX(0deg); }
}

@keyframes gymBoardPip {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.34; }
}

@media (prefers-reduced-motion: no-preference) {
  .gym-scoreboard-pip {
    animation: gymBoardPip 2.4s var(--flap-ease) infinite;
  }
}

@media (prefers-reduced-motion: reduce) {
  .gym-scoreboard-flap {
    animation: none;
    visibility: hidden;
  }

  .gym-scoreboard-pip {
    animation: none;
  }
}

@media (max-width: 768px) {
  .gym-scoreboard {
    max-width: 100%;
  }
}
</style>
