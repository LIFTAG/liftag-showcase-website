<script setup lang="ts">
// Scan-step machine lock-on. A protocol line decrypts into the gym's
// Cable Lat Pulldown, then lime HUD corners close on the resolved word.
// Glyph ticks write the DOM directly so the phone does not re-render.
// The parent cycle (step / inView / videoCycleKey / scanCycleMs) arms
// and holds this; there is no second interval.

const props = withDefaults(defineProps<{
  active: boolean
  cycleMs?: number
  cycleKey?: number
}>(), {
  cycleMs: 3200,
  cycleKey: 0,
})

const MACHINE = 'CABLE LAT PULLDOWN'
const MACHINE_SR = 'Cable Lat Pulldown'
const CHARSET = '0123456789ABCDEF#:_'
const STATUS_SEEK = 'SEEK'
const STATUS_LOCK = 'LOCK'
const SCRAMBLE_RATIO = 0.4
const SCRAMBLE_MIN_MS = 720
const SCRAMBLE_MAX_MS = 1480

const wordEl = ref<HTMLElement | null>(null)
const statusEl = ref<HTMLElement | null>(null)
const reduceMotion = ref(false)
const locked = ref(false)

let glyphEls: HTMLSpanElement[] = []
let rafId = 0
let running = false
let startedAt = 0
let motionMql: MediaQueryList | null = null

function scrambleMs() {
  return Math.min(SCRAMBLE_MAX_MS, Math.max(SCRAMBLE_MIN_MS, props.cycleMs * SCRAMBLE_RATIO))
}

function noise(actual: string) {
  const i = Math.floor(Math.random() * CHARSET.length)
  const ch = CHARSET[i]
  if (ch !== actual) return ch
  return CHARSET[(i + 7) % CHARSET.length]
}

function writeStatus(text: string) {
  if (statusEl.value) statusEl.value.textContent = text
}

function paint(lockedCount: number, scrambleRest: boolean) {
  for (let i = 0; i < glyphEls.length; i++) {
    const actual = MACHINE[i]
    const span = glyphEls[i]
    if (actual === ' ') {
      span.textContent = '\u00A0'
      span.classList.add('is-space', 'is-resolved')
      continue
    }
    if (i < lockedCount) {
      span.textContent = actual
      span.classList.add('is-resolved')
    } else if (scrambleRest) {
      span.textContent = noise(actual)
      span.classList.remove('is-resolved')
    }
  }
}

function paintResolved() {
  paint(MACHINE.length, false)
}

function setLocked(on: boolean) {
  locked.value = on
}

function stopLoop() {
  running = false
  if (rafId) cancelAnimationFrame(rafId)
  rafId = 0
}

function tick(now: number) {
  if (!running) {
    rafId = 0
    return
  }
  rafId = requestAnimationFrame(tick)

  const windowMs = scrambleMs()
  const linear = Math.min(1, (now - startedAt) / windowMs)
  const eased = 1 - (1 - linear) ** 4
  const lockedCount = Math.round(eased * MACHINE.length)
  paint(lockedCount, true)

  if (linear >= 1) {
    stopLoop()
    paintResolved()
    setLocked(true)
    writeStatus(STATUS_LOCK)
  }
}

function arm() {
  if (!glyphEls.length) return
  stopLoop()
  if (reduceMotion.value) {
    paintResolved()
    setLocked(true)
    writeStatus(STATUS_LOCK)
    return
  }
  setLocked(false)
  writeStatus(STATUS_SEEK)
  paint(0, true)
  startedAt = performance.now()
  running = true
  rafId = requestAnimationFrame(tick)
}

function disarm() {
  stopLoop()
  setLocked(false)
}

function mountGlyphs() {
  const word = wordEl.value
  if (!word) return
  word.textContent = ''
  glyphEls = []
  for (let i = 0; i < MACHINE.length; i++) {
    const ch = MACHINE[i]
    const span = document.createElement('span')
    span.className = ch === ' ' ? 'scan-lock-glyph is-space' : 'scan-lock-glyph'
    span.textContent = ch === ' ' ? '\u00A0' : CHARSET[i % CHARSET.length]
    word.appendChild(span)
    glyphEls.push(span)
  }
}

function onMotionChange(event: MediaQueryListEvent) {
  reduceMotion.value = event.matches
  if (!props.active) return
  if (event.matches) {
    stopLoop()
    paintResolved()
    setLocked(true)
    writeStatus(STATUS_LOCK)
  }
}

watch(
  () => [props.active, props.cycleKey] as const,
  ([active]) => {
    if (active) arm()
    else disarm()
  },
)

onMounted(() => {
  motionMql = window.matchMedia('(prefers-reduced-motion: reduce)')
  reduceMotion.value = motionMql.matches
  motionMql.addEventListener('change', onMotionChange)
  mountGlyphs()
  writeStatus(STATUS_SEEK)
  if (props.active) arm()
})

onBeforeUnmount(() => {
  stopLoop()
  motionMql?.removeEventListener('change', onMotionChange)
  motionMql = null
  glyphEls = []
})
</script>

<template>
  <div
    class="scan-lock-on"
    :class="{ 'is-live': active, 'is-static': reduceMotion, 'is-locked': locked }"
  >
    <span class="sr-only">{{ MACHINE_SR }}</span>
    <div class="scan-lock-plate" aria-hidden="true">
      <div class="scan-lock-meta">
        <span class="scan-lock-pip" />
        <span ref="statusEl" class="scan-lock-status" v-once />
        <span class="scan-lock-id">NFC · #042</span>
      </div>
      <div class="scan-lock-word-box">
        <span ref="wordEl" class="scan-lock-word" v-once />
        <span class="scan-lock-corners">
          <span />
          <span />
          <span />
          <span />
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scan-lock-on {
  width: max-content;
  max-width: 100%;
  pointer-events: none;
  user-select: none;
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 320ms var(--ease-out-expo),
    visibility 0s 320ms;
}

.scan-lock-on.is-live {
  opacity: 1;
  visibility: visible;
  transition:
    opacity 420ms var(--ease-out-expo),
    visibility 0s;
}

.scan-lock-plate {
  position: relative;
  padding: 8px 12px 9px;
  background: rgba(0, 0, 0, 0.72);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
}

.scan-lock-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.scan-lock-pip {
  width: 5px;
  height: 5px;
  flex-shrink: 0;
  background: rgba(204, 255, 0, 0.22);
  box-shadow: none;
  transition:
    background 280ms var(--ease-out-quart),
    box-shadow 280ms var(--ease-out-quart);
}

.scan-lock-on.is-locked .scan-lock-pip {
  background: var(--liftag-primary);
  box-shadow: 0 0 8px var(--liftag-primary-glow);
}

.scan-lock-status,
.scan-lock-id {
  font-family: var(--liftag-font-mono);
  font-weight: 700;
  font-size: 8px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  line-height: 1;
}

.scan-lock-status {
  color: rgba(204, 255, 0, 0.42);
  transition: color 280ms var(--ease-out-quart);
}

.scan-lock-on.is-locked .scan-lock-status {
  color: var(--liftag-primary);
}

.scan-lock-id {
  margin-left: auto;
  color: rgba(255, 255, 255, 0.38);
}

.scan-lock-word-box {
  position: relative;
  padding: 3px 2px 2px;
}

.scan-lock-word {
  display: flex;
  align-items: baseline;
  gap: 0.05em;
  font-family: var(--liftag-font-mono);
  font-weight: 700;
  font-size: 10px;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
  white-space: pre;
}

/* Glyphs are created in JS, so they do not get the scoped data attr. */
.scan-lock-word :deep(.scan-lock-glyph) {
  display: inline-block;
  width: 1ch;
  text-align: center;
  color: rgba(204, 255, 0, 0.28);
  transition:
    color 140ms var(--ease-out-quart),
    text-shadow 140ms var(--ease-out-quart);
}

.scan-lock-word :deep(.scan-lock-glyph.is-space) {
  width: 0.5ch;
}

.scan-lock-word :deep(.scan-lock-glyph.is-resolved) {
  color: var(--liftag-primary);
  text-shadow: 0 0 10px var(--liftag-primary-glow);
}

.scan-lock-corners {
  position: absolute;
  inset: -4px -5px;
  pointer-events: none;
}

.scan-lock-corners span {
  position: absolute;
  width: 9px;
  height: 9px;
  border-color: var(--liftag-primary);
  border-style: solid;
  border-width: 0;
  opacity: 0;
  transition:
    opacity 420ms var(--ease-out-expo),
    transform 620ms var(--ease-out-expo),
    filter 420ms var(--ease-out-expo);
}

.scan-lock-corners span:nth-child(1) {
  top: 0;
  left: 0;
  border-top-width: 2px;
  border-left-width: 2px;
  border-radius: 2px 0 0 0;
  transform: translate(-9px, -9px) scale(0.72);
}

.scan-lock-corners span:nth-child(2) {
  top: 0;
  right: 0;
  border-top-width: 2px;
  border-right-width: 2px;
  border-radius: 0 2px 0 0;
  transform: translate(9px, -9px) scale(0.72);
}

.scan-lock-corners span:nth-child(3) {
  bottom: 0;
  left: 0;
  border-bottom-width: 2px;
  border-left-width: 2px;
  border-radius: 0 0 0 2px;
  transform: translate(-9px, 9px) scale(0.72);
}

.scan-lock-corners span:nth-child(4) {
  bottom: 0;
  right: 0;
  border-bottom-width: 2px;
  border-right-width: 2px;
  border-radius: 0 0 2px 0;
  transform: translate(9px, 9px) scale(0.72);
}

.scan-lock-on.is-locked .scan-lock-corners span {
  opacity: 1;
  transform: translate(0, 0) scale(1);
  filter: drop-shadow(0 0 6px var(--liftag-primary-glow));
}

.scan-lock-on.is-locked .scan-lock-corners span:nth-child(1) {
  transition-delay: 0ms;
}

.scan-lock-on.is-locked .scan-lock-corners span:nth-child(2) {
  transition-delay: 50ms;
}

.scan-lock-on.is-locked .scan-lock-corners span:nth-child(3) {
  transition-delay: 90ms;
}

.scan-lock-on.is-locked .scan-lock-corners span:nth-child(4) {
  transition-delay: 130ms;
}

@media (prefers-reduced-motion: reduce) {
  .scan-lock-on,
  .scan-lock-on.is-live,
  .scan-lock-pip,
  .scan-lock-status,
  .scan-lock-word :deep(.scan-lock-glyph),
  .scan-lock-corners span {
    transition: none;
  }

  .scan-lock-on.is-live .scan-lock-corners span,
  .scan-lock-on.is-static.is-live .scan-lock-corners span {
    opacity: 1;
    transform: none;
    filter: drop-shadow(0 0 6px var(--liftag-primary-glow));
  }
}

@media (max-width: 768px) {
  .scan-lock-plate {
    padding: 7px 10px 8px;
  }

  .scan-lock-word {
    font-size: 9px;
  }
}
</style>
