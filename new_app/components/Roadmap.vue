<script setup lang="ts">
// All Vue APIs are auto-imported in Nuxt 3 - no import needed.

// ── Types ────────────────────────────────────────────────────────────────────

interface RmBranch {
  label: string
  i: number
  angle: string
  len: string
}

interface RmItem {
  version: string
  title: string
  isLive?: boolean
  isFuture?: boolean
  branches: RmBranch[]
}

// ── Data ─────────────────────────────────────────────────────────────────────

const rmData: RmItem[] = [
  {
    version: 'V1 · NOW',
    title: 'The Core Foundation',
    isLive: true,
    branches: [
      { label: 'NFC / QR Track',     i: 0, angle: '-12deg', len: '38px' },
      { label: '2-Tap Set Logger',   i: 1, angle: '4deg',   len: '50px' },
      { label: 'Routines + Plans',   i: 2, angle: '-8deg',  len: '44px' },
      { label: 'Exercise Library',   i: 3, angle: '10deg',  len: '36px' },
      { label: 'Trainer Directory',  i: 4, angle: '-5deg',  len: '52px' },
      { label: 'Dashboard',          i: 5, angle: '7deg',   len: '42px' },
    ],
  },
  {
    version: 'V2 · DISCOVERY',
    title: 'Gym Discovery & Analytics',
    isFuture: true,
    branches: [
      { label: 'Interactive Gym Map', i: 0, angle: '8deg',   len: '46px' },
      { label: 'Usage Analytics',     i: 1, angle: '-6deg',  len: '40px' },
      { label: 'Equipment Trends',    i: 2, angle: '14deg',  len: '34px' },
    ],
  },
  {
    version: 'V3 · AI',
    title: 'Smart Insights',
    isFuture: true,
    branches: [
      { label: 'Plateau Detection',   i: 0, angle: '12deg',  len: '44px' },
      { label: 'Rest Optimization',   i: 1, angle: '-8deg',  len: '52px' },
      { label: 'AI Coach Chatbot',    i: 2, angle: '5deg',   len: '40px' },
    ],
  },
  {
    version: 'V4 · COMMUNITY',
    title: 'Social Ecosystem',
    isFuture: true,
    branches: [
      { label: 'Gym Reviews',         i: 0, angle: '-14deg', len: '36px' },
      { label: 'User Content',        i: 1, angle: '8deg',   len: '46px' },
      { label: 'Trainer Marketplace', i: 2, angle: '-4deg',  len: '42px' },
    ],
  },
]

// ── Refs ─────────────────────────────────────────────────────────────────────

const sectionRef    = ref<HTMLElement | null>(null)
const timelineRef   = ref<HTMLElement | null>(null)
const canvasRef     = ref<HTMLCanvasElement | null>(null)
const lineActiveRef = ref<HTMLElement | null>(null)

// ── Animation state (plain arrays - NOT reactive) ─────────────────────────────

let rmRootProgress: number[] = []
let rmPoweredAt: number[]    = []

let rafId    = 0
let isVisible = false
let ctx: CanvasRenderingContext2D | null = null

// ── Canvas sizing ─────────────────────────────────────────────────────────────

function sizeRmCanvas() {
  const canvas   = canvasRef.value
  const timeline = timelineRef.value
  if (!canvas || !ctx || !timeline) return
  const dpr  = Math.min(window.devicePixelRatio || 1, 2)
  const rect = timeline.getBoundingClientRect()
  canvas.width  = rect.width  * dpr
  canvas.height = rect.height * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

// ── Cubic bezier helper ───────────────────────────────────────────────────────

function bezierPt(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const mt = 1 - t
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3
}

// ── drawRoots ─────────────────────────────────────────────────────────────────

function drawRoots(rmItems: NodeListOf<Element>, providedTimelineRect?: DOMRect) {
  const canvas   = canvasRef.value
  const timeline = timelineRef.value
  if (!ctx || !canvas || !timeline) return

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w   = canvas.width  / dpr
  const h   = canvas.height / dpr
  ctx.clearRect(0, 0, w, h)

  const timelineRect = providedTimelineRect ?? timeline.getBoundingClientRect()
  const now          = performance.now()

  // Ambient breathing radial glow on powered nodes
  rmItems.forEach((item, idx) => {
    if (!item.classList.contains('powered')) return
    const nd = item.querySelector('.rm-node') as HTMLElement | null
    if (!nd) return
    const nr      = nd.getBoundingClientRect()
    const nx      = nr.left + nr.width  / 2 - timelineRect.left
    const ny      = nr.top  + nr.height / 2 - timelineRect.top
    const breathe = 0.5 + Math.sin(now * 0.002 + idx * 1.5) * 0.25
    const ag      = ctx!.createRadialGradient(nx, ny, 0, nx, ny, 70)
    ag.addColorStop(0, `rgba(204, 255, 0, ${breathe * 0.05})`)
    ag.addColorStop(1, 'rgba(204, 255, 0, 0)')
    ctx!.fillStyle = ag
    ctx!.beginPath()
    ctx!.arc(nx, ny, 70, 0, Math.PI * 2)
    ctx!.fill()
  })

  rmItems.forEach((item, i) => {
    if (!item.classList.contains('powered')) {
      rmRootProgress[i] = 0
      rmPoweredAt[i]    = 0
      return
    }
    if (rmPoweredAt[i] === 0) rmPoweredAt[i] = now
    const elapsed     = now - rmPoweredAt[i]
    rmRootProgress[i] = Math.min(1, elapsed / 1200) // 1.2 s to fully grow

    const node     = item.querySelector('.rm-node') as HTMLElement | null
    const branches = item.querySelectorAll('.rm-branch span')
    if (!node || branches.length === 0) return

    const nodeRect = node.getBoundingClientRect()
    const nodeX    = nodeRect.left + nodeRect.width  / 2 - timelineRect.left
    const nodeY    = nodeRect.top  + nodeRect.height / 2 - timelineRect.top

    branches.forEach((label, bi) => {
      const labelRect = (label as HTMLElement).getBoundingClientRect()
      // Target: edge of label closest to node
      const isLeft = labelRect.left < nodeRect.left
      const endX   = isLeft
        ? labelRect.right - timelineRect.left + 4
        : labelRect.left  - timelineRect.left - 4
      const endY = labelRect.top + labelRect.height / 2 - timelineRect.top

      // Staggered progress per branch
      const branchDelay = bi * 0.15
      const branchP     = Math.max(0, Math.min(1,
        (rmRootProgress[i] - branchDelay) / (1 - branchDelay),
      ))
      if (branchP <= 0) return

      // Ease-out cubic for organic growth
      const eased = 1 - Math.pow(1 - branchP, 3)

      // Organic cubic bezier control points
      const dx = endX - nodeX
      const dy = endY - nodeY

      // cp1: goes mostly horizontal from node
      const cp1x = nodeX + dx * 0.2
      const cp1y = nodeY + dy * 0.05 + (bi % 2 === 0 ? -8 : 8)
      // cp2: curves toward the end
      const cp2x = nodeX + dx * 0.7
      const cp2y = endY  + (bi % 2 === 0 ? 6 : -6)

      // Draw partial path based on progress
      const steps     = 40
      const drawSteps = Math.floor(eased * steps)
      if (drawSteps < 2) return

      // Taper: thicker near node, thinner at tip
      for (let s = 0; s < drawSteps - 1; s++) {
        const t0 = s       / steps
        const t1 = (s + 1) / steps

        const x0 = bezierPt(nodeX, cp1x, cp2x, endX, t0)
        const y0 = bezierPt(nodeY, cp1y, cp2y, endY, t0)
        const x1 = bezierPt(nodeX, cp1x, cp2x, endX, t1)
        const y1 = bezierPt(nodeY, cp1y, cp2y, endY, t1)

        // Taper width: 2px at node → 0.5px at tip
        const segWidth = 2 - (t0 * 1.5)
        // Alpha: brighter near node, dimmer at tip
        const segAlpha = 0.5 - t0 * 0.3

        ctx!.beginPath()
        ctx!.moveTo(x0, y0)
        ctx!.lineTo(x1, y1)
        ctx!.strokeStyle = `rgba(204, 255, 0, ${segAlpha})`
        ctx!.lineWidth   = Math.max(0.5, segWidth)
        ctx!.lineCap     = 'round'
        ctx!.stroke()
      }

      // Glow pass (wider, dimmer)
      ctx!.beginPath()
      for (let s = 0; s <= drawSteps; s++) {
        const t = s / steps
        const x = bezierPt(nodeX, cp1x, cp2x, endX, t)
        const y = bezierPt(nodeY, cp1y, cp2y, endY, t)
        if (s === 0) ctx!.moveTo(x, y)
        else         ctx!.lineTo(x, y)
      }
      ctx!.strokeStyle = 'rgba(204, 255, 0, 0.08)'
      ctx!.lineWidth   = 8
      ctx!.lineCap     = 'round'
      ctx!.stroke()

      // Tip glow dot - stays at growth front, fades out as text appears
      {
        const tipT = eased
        const tipX = bezierPt(nodeX, cp1x, cp2x, endX, tipT)
        const tipY = bezierPt(nodeY, cp1y, cp2y, endY, tipT)
        // Fade out once root reaches endpoint; text appears ~0.6 s + delay after powered
        const textDelay = branchDelay * 1200 + 600 // ms after powered when label starts appearing
        const fadeStart = textDelay
        const fadeDur   = 800
        const tipFade   = branchP >= 1
          ? Math.max(0, 1 - Math.max(0, elapsed - fadeStart) / fadeDur)
          : 1
        if (tipFade > 0) {
          const tipAlpha = 0.5 * tipFade
          const tipGrad  = ctx!.createRadialGradient(tipX, tipY, 0, tipX, tipY, 10)
          tipGrad.addColorStop(0, `rgba(204, 255, 0, ${tipAlpha})`)
          tipGrad.addColorStop(1, 'rgba(204, 255, 0, 0)')
          ctx!.fillStyle = tipGrad
          ctx!.beginPath()
          ctx!.arc(tipX, tipY, 10, 0, Math.PI * 2)
          ctx!.fill()
        }
      }
    })
  })
}

// ── updateRoadmap (called every frame) ───────────────────────────────────────

function updateRoadmap(rmItems: NodeListOf<Element>) {
  const timeline   = timelineRef.value
  const lineActive = lineActiveRef.value
  if (!timeline || !lineActive) return

  const rect    = timeline.getBoundingClientRect()
  const viewH   = window.innerHeight
  const progress = Math.max(0, Math.min(1, (viewH - rect.top) / (rect.height + viewH * 0.5)))
  lineActive.style.height = (progress * 100) + '%'

  rmItems.forEach((item, i) => {
    const itemRect = item.getBoundingClientRect()
    const itemMid  = itemRect.top + itemRect.height / 2
    if (itemMid < viewH * 0.75) {
      item.classList.add('visible')
      if (progress > (i + 0.5) / rmItems.length) {
        item.classList.add('powered')
      }
    }
  })

  // Pass timeline rect to drawRoots so it doesn't re-read it within the same tick.
  drawRoots(rmItems, rect)
}

// ── rAF loop ──────────────────────────────────────────────────────────────────

function startLoop(rmItems: NodeListOf<Element>) {
  function tick() {
    if (!isVisible) return
    updateRoadmap(rmItems)
    rafId = requestAnimationFrame(tick)
  }
  rafId = requestAnimationFrame(tick)
}

function stopLoop() {
  cancelAnimationFrame(rafId)
  rafId = 0
}

// ── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(async () => {
  await nextTick()

  const canvas = canvasRef.value
  if (!canvas) return
  ctx = canvas.getContext('2d')

  const rmItems = timelineRef.value!.querySelectorAll('[data-rm]')
  rmRootProgress = new Array(rmItems.length).fill(0)
  rmPoweredAt    = new Array(rmItems.length).fill(0)

  sizeRmCanvas()
  window.addEventListener('resize', sizeRmCanvas, { passive: true })

  // IntersectionObserver gates rAF so we don't burn CPU off-screen
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting
        if (isVisible) {
          startLoop(rmItems)
        } else {
          stopLoop()
        }
      })
    },
    { threshold: 0 },
  )
  if (sectionRef.value) io.observe(sectionRef.value)

  // Store so we can disconnect on unmount
  ;(sectionRef.value as any).__rmIO = io
})

onBeforeUnmount(() => {
  stopLoop()
  window.removeEventListener('resize', sizeRmCanvas)
  const io = (sectionRef.value as any)?.__rmIO as IntersectionObserver | undefined
  io?.disconnect()
  ctx = null
})
</script>

<template>
  <section ref="sectionRef" class="section" id="roadmap">
    <div class="section-inner">
      <div class="section-label reveal" style="text-align: center">Roadmap</div>
      <h2 class="display reveal" style="text-align: center; margin: 0 auto 20px; font-size: clamp(2.4rem, 6vw, 4.5rem)">
        We're<br />just getting started.
      </h2>
      <p class="rm-subtitle reveal" style="text-align: center; margin: 0 auto 80px">
        Built in public. Shipping fast. Here's what's coming next.
      </p>

      <!-- Timeline container - canvas/ghost/active are children 1/2/3,
           so rm-item:nth-child(odd) starts at child 4 (even index) = right side -->
      <div ref="timelineRef" class="roadmap-timeline">
        <canvas ref="canvasRef" class="rm-roots-canvas"></canvas>
        <div class="roadmap-line-ghost"></div>
        <div ref="lineActiveRef" class="roadmap-line-active"></div>

        <div
          v-for="(item, idx) in rmData"
          :key="item.version"
          class="rm-item"
          :class="{ future: item.isFuture }"
          data-rm
        >
          <div class="rm-node"></div>
          <div>
            <div v-if="item.isLive" class="rm-live-badge">
              <div class="rm-live-dot"></div>
              LIVE
            </div>
            <div class="rm-version">{{ item.version }}</div>
            <h3 class="rm-title">{{ item.title }}</h3>
            <div class="rm-roots">
              <div class="rm-trunk"></div>
              <div
                v-for="branch in item.branches"
                :key="branch.label"
                class="rm-branch"
                :style="{ '--i': branch.i, '--angle': branch.angle, '--len': branch.len } as any"
              >
                <span>{{ branch.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ─── Section wrapper ─────────────────────────────────────────────────────── */
.section {
  position: relative;
  background: #000;
}

.section-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 120px 40px;
}

.section-label {
  font-family: var(--liftag-font-mono);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--liftag-primary);
  margin-bottom: 20px;
}

.rm-subtitle {
  font-size: 1.1rem;
  font-weight: 300;
  color: var(--liftag-fg-mid);
  max-width: 520px;
  line-height: 1.6;
}

/* ─── Timeline container ──────────────────────────────────────────────────── */
.roadmap-timeline {
  position: relative;
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 0;
}

/* Ghost line */
.roadmap-line-ghost {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(255, 255, 255, 0.04);
  transform: translateX(-50%);
}

/* Active (drawn) line */
.roadmap-line-active {
  position: absolute;
  left: 50%;
  top: 0;
  width: 2px;
  height: 0%;
  background: linear-gradient(to bottom, var(--liftag-primary), var(--liftag-red-neon));
  box-shadow: 0 0 12px var(--liftag-primary-glow);
  transform: translateX(-50%);
  transition: height 0.1s linear;
}

/* Glow trail at the bottom of the active line */
.roadmap-line-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 30px;
  background: linear-gradient(to top, var(--liftag-primary), transparent);
  border-radius: 3px;
  filter: blur(4px);
  animation: rmTrailPulse 1.5s ease-in-out infinite;
}

@keyframes rmTrailPulse {
  0%, 100% { opacity: 0.8; height: 30px; }
  50%       { opacity: 1;   height: 50px; }
}

/* ─── Items ──────────────────────────────────────────────────────────────── */
.rm-item {
  display: flex;
  align-items: flex-start;
  position: relative;
  margin-bottom: 80px;
  opacity: 0;
  transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

/* canvas(1) + ghost(2) + active(3) are siblings before items;
   V1 is 4th child ⇒ :nth-child(even) ⇒ row-reverse (RIGHT side)
   V2 is 5th child ⇒ :nth-child(odd)  ⇒ row (LEFT side)           */
.rm-item:nth-child(odd) {
  flex-direction: row;
  padding-right: calc(50% + 40px);
  text-align: right;
  transform: translateX(-40px);
}

.rm-item:nth-child(even) {
  flex-direction: row-reverse;
  padding-left: calc(50% + 40px);
  transform: translateX(40px);
}

.rm-item.visible {
  opacity: 1;
  transform: translateX(0);
}

/* Staggered child entrance */
.rm-item .rm-version {
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s,
              transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s;
}

.rm-item .rm-title {
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.35s,
              transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.35s;
}

.rm-item .rm-live-badge {
  opacity: 0;
  transform: scale(0.8);
  transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.15s,
              transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.15s;
}

.rm-item .rm-roots {
  opacity: 0;
  transition: opacity 0.6s ease 0.5s;
}

.rm-item.visible .rm-version,
.rm-item.visible .rm-title {
  opacity: 1;
  transform: translateY(0);
}

.rm-item.visible .rm-live-badge {
  opacity: 1;
  transform: scale(1);
}

.rm-item.visible .rm-roots {
  opacity: 1;
}

/* ─── Node ───────────────────────────────────────────────────────────────── */
.rm-node {
  position: absolute;
  left: 50%;
  top: 4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.1);
  background: #000;
  transform: translateX(-50%) scale(0);
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 3;
  overflow: visible;
}

.rm-item.visible .rm-node {
  transform: translateX(-50%) scale(1);
}

.rm-item.powered .rm-node {
  background: var(--liftag-primary);
  border-color: var(--liftag-primary);
  box-shadow: 0 0 14px var(--liftag-primary-glow);
}

/* Pulse ring on powered nodes */
.rm-item.powered .rm-node::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid var(--liftag-primary);
  animation: rmPulseRing 2s ease-out infinite;
}

/* Second ring (staggered) */
.rm-item.powered .rm-node::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 1px solid var(--liftag-primary);
  animation: rmPulseRing 2s ease-out 1s infinite;
}

@keyframes rmPulseRing {
  0%   { transform: scale(1);   opacity: 0.6; }
  100% { transform: scale(2.8); opacity: 0;   }
}

/* ─── Typography ─────────────────────────────────────────────────────────── */
.rm-version {
  font-family: var(--liftag-font-mono);
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--liftag-primary);
  letter-spacing: 0.15em;
  margin-bottom: 6px;
}

.rm-item.future .rm-version {
  color: var(--liftag-fg-dim);
}

.rm-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--liftag-fg);
}

/* ─── Live badge ─────────────────────────────────────────────────────────── */
.rm-live-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  background: var(--liftag-primary-dim);
  border-radius: 100px;
  font-family: var(--liftag-font-mono);
  font-size: 0.55rem;
  font-weight: 700;
  color: var(--liftag-primary);
  letter-spacing: 0.1em;
  margin-bottom: 10px;
}

.rm-live-dot {
  width: 5px;
  height: 5px;
  background: var(--liftag-primary);
  border-radius: 50%;
  animation: dotPulse 2s ease-in-out infinite;
}

@keyframes dotPulse {
  0%, 100% { opacity: 1;   transform: scale(1);   }
  50%       { opacity: 0.4; transform: scale(0.75); }
}

/* ─── Root system ────────────────────────────────────────────────────────── */
.rm-roots-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.rm-roots {
  position: relative;
  padding-top: 4px;
  z-index: 2;
}

/* Content div sits above canvas */
.rm-item > div:last-child {
  position: relative;
  z-index: 2;
}

.rm-trunk {
  display: none;
}

.rm-branch {
  padding: 6px 0;
}

.rm-branch span {
  font-family: var(--liftag-font-mono);
  font-size: 0.65rem;
  font-weight: 500;
  color: var(--liftag-fg-dim);
  letter-spacing: 0.05em;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.4s ease, color 0.4s ease;
  transition-delay: calc(var(--i, 0) * 0.18s + 0.6s);
}

.rm-item.powered .rm-branch span {
  opacity: 1;
}

/* First branch of powered item gets accent colour */
.rm-item.powered .rm-branch:first-of-type span {
  color: var(--liftag-primary);
}

/* ─── Responsive (mobile: left-rail timeline) ────────────────────────────── */
@media (max-width: 600px) {
  .section-inner {
    padding: 88px 16px 96px;
  }

  .roadmap-timeline {
    --rm-rail-x: clamp(12px, 3.5vw, 18px);
    --rm-content-offset: clamp(88px, 25vw, 112px);
    max-width: 100%;
    padding: 48px 0 24px;
  }

  .roadmap-line-ghost,
  .roadmap-line-active {
    left: var(--rm-rail-x);
    transform: none;
  }

  .rm-item:nth-child(odd),
  .rm-item:nth-child(even) {
    padding-left: var(--rm-content-offset);
    padding-right: 0;
    flex-direction: row;
    text-align: left;
    transform: translate3d(0, 28px, 0);
  }

  .rm-item.visible {
    transform: translate3d(0, 0, 0);
  }

  .rm-node {
    left: var(--rm-rail-x);
    transform: translateX(-50%);
  }

  .rm-item.visible .rm-node {
    transform: translateX(-50%) scale(1);
  }

  .rm-item {
    margin-bottom: 68px;
  }

  .rm-item > div:last-child {
    width: 100%;
    max-width: 320px;
  }

  .rm-title {
    font-size: 1.08rem;
    line-height: 1.22;
    text-wrap: balance;
  }

  .rm-roots {
    margin-top: 12px;
    padding-top: 8px;
  }

  .rm-branch {
    padding: 8px 0;
  }

  .rm-branch span {
    display: inline-block;
    max-width: 100%;
    line-height: 1.35;
  }
}
</style>
