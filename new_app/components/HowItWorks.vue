<script setup lang="ts">
// ─── Refs: DOM elements ───────────────────────────────────────────────────
const sectionRef = ref<HTMLElement | null>(null)
const trackRef   = ref<HTMLElement | null>(null)
const curveCanvas = ref<HTMLCanvasElement | null>(null)
const weightEl  = ref<HTMLElement | null>(null)
const repsEl    = ref<HTMLElement | null>(null)
const chartClipRect = ref<SVGRectElement | null>(null)
const chartDot      = ref<SVGCircleElement | null>(null)
const chartSvg      = ref<SVGSVGElement | null>(null)
const statStrength  = ref<HTMLElement | null>(null)
const statSessions  = ref<HTMLElement | null>(null)
const statPRs       = ref<HTMLElement | null>(null)
const dotEls        = ref<HTMLElement[]>([])
const scanPane      = ref<HTMLElement | null>(null)
const scanArea      = ref<HTMLElement | null>(null)
const scanCorners   = ref<HTMLElement | null>(null)
const scanLine      = ref<HTMLElement | null>(null)
const qrIcon        = ref<SVGSVGElement | null>(null)
const scanTitle     = ref<HTMLElement | null>(null)
const scanDesc      = ref<HTMLElement | null>(null)
const scanHovered   = ref(false)
const prVisible     = ref(false)
const prBurstKey    = ref(0)
const hiwIntroEntered = ref(false)
const hiwLastExiting = ref(false)

const prBurstParticles = [
  { x: '-42px', y: '-34px', rotate: '-22deg', delay: '0ms', color: 'var(--liftag-primary)' },
  { x: '-28px', y: '28px', rotate: '26deg', delay: '45ms', color: 'var(--liftag-primary)' },
  { x: '0px', y: '-42px', rotate: '4deg', delay: '20ms', color: '#fff' },
  { x: '32px', y: '-28px', rotate: '30deg', delay: '70ms', color: 'var(--liftag-primary)' },
  { x: '46px', y: '24px', rotate: '-18deg', delay: '95ms', color: 'var(--liftag-red-neon)' },
  { x: '6px', y: '38px', rotate: '-4deg', delay: '120ms', color: 'var(--liftag-primary)' },
]

// ─── Canvas context + mutable state ──────────────────────────────────────
let ctx: CanvasRenderingContext2D | null = null
let rafId = 0
let isVisible = false
let resizeCleanup: (() => void) | null = null
let mobileQueryCleanup: (() => void) | null = null
let intersectionObs: IntersectionObserver | null = null
let mobileHIWLayout = false

// Marker flash timestamps (non-reactive, mutated in rAF)
const MARKER_COUNT = 10
const markerFlashTime: number[] = new Array(MARKER_COUNT).fill(0)

let hiwLerpedP = 0
let hiwQRLerpedP = 0
let scanTargetX = 0
let scanTargetY = 0
let scanCurrentX = 0
let scanCurrentY = 0
let chartHovered = false
let chartHoverTargetP = 1
let chartDisplayP = 0

// Cached rects for scan effect — invalidated on resize / scroll-induced layout shift.
// Reads in rAF previously thrashed layout each frame.
let cachedPaneRect: DOMRect | null = null
let cachedAreaRect: DOMRect | null = null
let cachedTitleRect: DOMRect | null = null
let cachedDescRect: DOMRect | null = null

// Cached canvas gradients — depend only on canvas size, not per-frame state.
let cachedAreaGrad: CanvasGradient | null = null
let cachedAreaGradKey = ''
let scanEffectResetForMobile = false

const HIW_LAST_EXIT_VIEWPORT_BOTTOM = 0.86

// ─── Curve data ───────────────────────────────────────────────────────────
const curvePoints: [number, number][] = [
  [0.00, 0.78], [0.05, 0.78], [0.10, 0.77], [0.15, 0.78],
  [0.20, 0.77], [0.25, 0.78], [0.30, 0.76],
  // climb begins
  [0.35, 0.73], [0.38, 0.74], [0.42, 0.69], [0.46, 0.66],
  [0.49, 0.68], [0.53, 0.62], [0.57, 0.58], [0.60, 0.60],
  [0.64, 0.54],
  // surge
  [0.68, 0.50], [0.72, 0.44], [0.76, 0.40], [0.80, 0.34],
  [0.84, 0.30], [0.88, 0.24], [0.92, 0.20], [0.96, 0.15],
  [1.00, 0.10],
]

const dataMarkers: { x: number; label: string; sub: string; above: boolean }[] = [
  { x: 0.30, label: '60kg × 8',  sub: 'W1',  above: true  },
  { x: 0.38, label: '62.5kg',    sub: 'W2',  above: false },
  { x: 0.46, label: '65kg × 8',  sub: 'W3',  above: true  },
  { x: 0.53, label: 'Bench',     sub: 'W5',  above: false },
  { x: 0.60, label: '70kg × 6',  sub: 'W6',  above: true  },
  { x: 0.68, label: '+5kg PR',   sub: 'W8',  above: false },
  { x: 0.76, label: '80kg × 5',  sub: 'W9',  above: true  },
  { x: 0.84, label: 'Squat 1RM', sub: 'W10', above: false },
  { x: 0.92, label: '90kg × 3',  sub: 'W11', above: true  },
  { x: 1.00, label: 'NEW PR!',   sub: 'W12', above: false },
]

const yAxisLabels = ['100kg', '80kg', '60kg', '40kg', '20kg']
const xAxisLabels = [
  { x: 0.0,  text: 'JAN' },
  { x: 0.33, text: 'FEB' },
  { x: 0.66, text: 'MAR' },
  { x: 1.0,  text: 'APR' },
]

// Chart SVG points
const chartPts: [number, number][] = [
  [0, 100], [40, 92], [80, 85], [120, 78],
  [160, 65], [200, 55], [240, 40], [280, 20],
]

// ─── Helpers ──────────────────────────────────────────────────────────────
function curveYAtX(xNorm: number): number {
  for (let i = 0; i < curvePoints.length - 1; i++) {
    const [x0, y0] = curvePoints[i]
    const [x1, y1] = curvePoints[i + 1]
    if (xNorm >= x0 && xNorm <= x1) {
      const t = (xNorm - x0) / (x1 - x0)
      const s = t * t * (3 - 2 * t) // smooth-step
      return y0 + (y1 - y0) * s
    }
  }
  return curvePoints[curvePoints.length - 1][1]
}

function sizeHIWCurveCanvas() {
  const canvas = curveCanvas.value
  if (!canvas || !ctx) return
  const parent = canvas.parentElement
  if (!parent) return
  const rect = parent.getBoundingClientRect()
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width  = rect.width  * dpr
  canvas.height = rect.height * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  cachedAreaGrad = null
  cachedAreaGradKey = ''
}

function refreshScanRects() {
  cachedPaneRect = scanPane.value?.getBoundingClientRect() ?? null
  cachedAreaRect = scanArea.value?.getBoundingClientRect() ?? null
  cachedTitleRect = scanTitle.value?.getBoundingClientRect() ?? null
  cachedDescRect = scanDesc.value?.getBoundingClientRect() ?? null
}

function drawHIWCurve(p: number) {
  const canvas = curveCanvas.value
  if (!ctx || !canvas) return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = canvas.width  / dpr
  const h = canvas.height / dpr
  ctx.clearRect(0, 0, w, h)

  const drawProgress = Math.min(1, p * 1.1)
  if (drawProgress <= 0.001) return

  const padX   = 40
  const padTop = h * 0.1
  const padBot = h * 0.15
  const graphW = w - padX * 2
  const graphH = h - padTop - padBot

  const toCanvasX = (xn: number) => padX + xn * graphW
  const toCanvasY = (yn: number) => padTop + yn * graphH

  // === Grid lines + Y-axis labels ===
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
  ctx.lineWidth = 1
  for (let gy = 0; gy <= 4; gy++) {
    const yy = padTop + (gy / 4) * graphH
    ctx.beginPath()
    ctx.moveTo(padX, yy)
    ctx.lineTo(padX + graphW * drawProgress, yy)
    ctx.stroke()

    if (drawProgress > 0.02 && yAxisLabels[gy]) {
      const labelAlpha = Math.min(0.12, drawProgress * 0.4)
      ctx.font = "500 10px 'JetBrains Mono', monospace"
      ctx.fillStyle = `rgba(255, 255, 255, ${labelAlpha})`
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillText(yAxisLabels[gy], padX - 10, yy)
    }
  }

  // === X-axis date labels ===
  xAxisLabels.forEach(({ x: xn, text }) => {
    if (xn > drawProgress) return
    const xx = toCanvasX(xn)
    const yy = toCanvasY(1) + 18
    const labelAge   = (drawProgress - xn) * 5
    const labelAlpha = Math.min(0.15, labelAge * 0.15)
    if (labelAlpha < 0.01) return
    ctx!.font = "600 9px 'JetBrains Mono', monospace"
    ctx!.fillStyle = `rgba(255, 255, 255, ${labelAlpha})`
    ctx!.textAlign = 'center'
    ctx!.textBaseline = 'top'
    ctx!.fillText(text, xx, yy)
  })

  // === Vertical grid lines at date marks ===
  xAxisLabels.forEach(({ x: xn }) => {
    if (xn > drawProgress || xn === 0) return
    const xx = toCanvasX(xn)
    ctx!.strokeStyle = 'rgba(255, 255, 255, 0.02)'
    ctx!.lineWidth = 1
    ctx!.beginPath()
    ctx!.moveTo(xx, padTop)
    ctx!.lineTo(xx, toCanvasY(1))
    ctx!.stroke()
  })

  // === Curve path ===
  const steps = Math.floor(drawProgress * 200)
  if (steps < 2) return

  // Gradient fill — cached per canvas size (only depends on padTop/graphH).
  const gradKey = `${padTop}|${graphH}`
  if (!cachedAreaGrad || cachedAreaGradKey !== gradKey) {
    const grad = ctx.createLinearGradient(0, padTop, 0, padTop + graphH)
    grad.addColorStop(0, 'rgba(200, 255, 0, 0.18)')
    grad.addColorStop(1, 'rgba(200, 255, 0, 0)')
    cachedAreaGrad = grad
    cachedAreaGradKey = gradKey
  }
  const grad = cachedAreaGrad

  ctx.beginPath()
  for (let i = 0; i <= steps; i++) {
    const xn = i / 200
    const cx = toCanvasX(xn)
    const cy = toCanvasY(curveYAtX(xn))
    if (i === 0) ctx.moveTo(cx, cy)
    else ctx.lineTo(cx, cy)
  }
  const lastXn = steps / 200
  const lastCx = toCanvasX(lastXn)
  ctx.lineTo(lastCx, toCanvasY(1))
  ctx.lineTo(toCanvasX(0), toCanvasY(1))
  ctx.closePath()
  ctx.fillStyle = grad
  ctx.fill()

  // Stroke path (reuse same path)
  ctx.beginPath()
  for (let i = 0; i <= steps; i++) {
    const xn = i / 200
    const cx = toCanvasX(xn)
    const cy = toCanvasY(curveYAtX(xn))
    if (i === 0) ctx.moveTo(cx, cy)
    else ctx.lineTo(cx, cy)
  }

  // Stacked-stroke glow under additive blending — approximates the original
  // shadowBlur(20) halo without the per-frame canvas convolve. `lighter`
  // composite makes overlapping strokes brighten toward the centre, giving a
  // smooth Gaussian-ish falloff instead of visible concentric outlines.
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = 'rgba(200, 255, 0, 0.025)'
  ctx.lineWidth   = 22
  ctx.stroke()
  ctx.strokeStyle = 'rgba(200, 255, 0, 0.04)'
  ctx.lineWidth   = 14
  ctx.stroke()
  ctx.strokeStyle = 'rgba(200, 255, 0, 0.07)'
  ctx.lineWidth   = 8
  ctx.stroke()
  ctx.strokeStyle = 'rgba(200, 255, 0, 0.13)'
  ctx.lineWidth   = 4
  ctx.stroke()
  ctx.strokeStyle = 'rgba(200, 255, 0, 0.22)'
  ctx.lineWidth   = 2
  ctx.stroke()
  ctx.restore()

  // Bright core stroke
  ctx.strokeStyle = 'rgba(230, 255, 200, 0.85)'
  ctx.lineWidth   = 1
  ctx.stroke()

  // === Leading glow dot ===
  const tipYn = curveYAtX(lastXn)
  const tipX  = toCanvasX(lastXn)
  const tipY  = toCanvasY(tipYn)

  const glowGrad = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, 70)
  glowGrad.addColorStop(0,   'rgba(200, 255, 0, 0.8)')
  glowGrad.addColorStop(0.3, 'rgba(200, 255, 0, 0.25)')
  glowGrad.addColorStop(0.6, 'rgba(200, 255, 0, 0.06)')
  glowGrad.addColorStop(1,   'rgba(200, 255, 0, 0)')
  ctx.fillStyle = glowGrad
  ctx.beginPath()
  ctx.arc(tipX, tipY, 70, 0, Math.PI * 2)
  ctx.fill()

  // Solid tip dot
  ctx.fillStyle = 'rgba(200, 255, 0, 0.9)'
  ctx.beginPath()
  ctx.arc(tipX, tipY, 4, 0, Math.PI * 2)
  ctx.fill()

  // === Data point markers ===
  const now = performance.now()
  dataMarkers.forEach((marker, mi) => {
    if (marker.x > drawProgress) {
      markerFlashTime[mi] = 0
      return
    }
    const mx = toCanvasX(marker.x)
    const my = toCanvasY(curveYAtX(marker.x))

    if (markerFlashTime[mi] === 0) markerFlashTime[mi] = now
    const age       = now - markerFlashTime[mi]
    const flashAlpha = age < 600 ? 0.8 * (1 - age / 600) : 0

    if (flashAlpha > 0) {
      const flashRadius = 4 + (age / 600) * 20
      ctx!.strokeStyle = `rgba(200, 255, 0, ${flashAlpha})`
      ctx!.lineWidth   = 1.5
      ctx!.beginPath()
      ctx!.arc(mx, my, flashRadius, 0, Math.PI * 2)
      ctx!.stroke()
    }

    // Solid dot
    ctx!.fillStyle = 'rgba(200, 255, 0, 0.8)'
    ctx!.beginPath()
    ctx!.arc(mx, my, 3, 0, Math.PI * 2)
    ctx!.fill()

    // Marker glow halo
    ctx!.fillStyle = 'rgba(200, 255, 0, 0.25)'
    ctx!.beginPath()
    ctx!.arc(mx, my, 14, 0, Math.PI * 2)
    ctx!.fill()

    // Data label
    const labelDelay  = 300
    const labelFadeDur = 500
    const labelAge    = Math.max(0, age - labelDelay)
    const labelAlpha  = Math.min(0.22, (labelAge / labelFadeDur) * 0.22)
    if (labelAlpha > 0.01) {
      const drift    = Math.min(6, (labelAge / 1000) * 6)
      const labelY   = marker.above ? my - 16 - drift : my + 18 + drift
      const isSpecial = marker.label.includes('PR')

      ctx!.font = `${isSpecial ? '700' : '500'} 10px 'JetBrains Mono', monospace`
      ctx!.textAlign    = 'center'
      ctx!.textBaseline = marker.above ? 'bottom' : 'top'
      ctx!.fillStyle    = isSpecial
        ? `rgba(255, 45, 85, ${labelAlpha * 1.5})`
        : `rgba(200, 255, 0, ${labelAlpha})`
      ctx!.fillText(marker.label, mx, labelY)

      ctx!.font      = "400 8px 'JetBrains Mono', monospace"
      ctx!.fillStyle = `rgba(255, 255, 255, ${labelAlpha * 0.6})`
      const subY     = marker.above ? labelY - 12 : labelY + 13
      ctx!.fillText(marker.sub, mx, subY)
    }
  })
}

// ─── Scroll progress → section update ────────────────────────────────────
function getScrollP(): number {
  const section = sectionRef.value
  if (!section) return 0
  const rect     = section.getBoundingClientRect()
  const sectionTop = -rect.top
  const sectionH   = rect.height - window.innerHeight
  if (sectionH <= 0) return 0
  return Math.max(0, Math.min(1, sectionTop / sectionH))
}

function getHIWProgress(): number {
  return getScrollP()
}

function updateHIW(p: number) {
  const track = trackRef.value
  if (!track) return

  if (sectionRef.value) {
    const rect = sectionRef.value.getBoundingClientRect()

    if (rect.top < window.innerHeight * 0.28 || p > 0.012) {
      hiwIntroEntered.value = true
    }

    hiwLastExiting.value = rect.bottom < window.innerHeight * HIW_LAST_EXIT_VIEWPORT_BOTTOM
  }

  if (mobileHIWLayout) {
    track.style.transform = `translateY(-${p * 66.667}%)`
  } else {
    track.style.transform = `translateX(-${p * 66.667}%)`
  }

  updateScanHoverEffect(p)

  // Draw the strength curve (always — flash timings use perf.now())
  drawHIWCurve(p)

  // Dots
  const activeIdx = Math.min(2, Math.floor(p * 3))
  dotEls.value.forEach((dot, i) => {
    const isActive = i === activeIdx
    dot.classList.toggle('active', isActive)
    dot.setAttribute('aria-selected', String(isActive))
  })

  // Panel 2 weight / reps counter: ramp 0.25 → 0.45
  const rampStart = 0.25
  const rampEnd   = 0.45
  if (p < rampStart) {
    if (weightEl.value) weightEl.value.textContent = '0'
    if (repsEl.value)   repsEl.value.textContent   = '0'
  } else if (p <= rampEnd) {
    const localP = (p - rampStart) / (rampEnd - rampStart)
    if (weightEl.value) weightEl.value.textContent = String(Math.round(localP * 85))
    if (repsEl.value)   repsEl.value.textContent   = String(Math.round(localP * 9))
  } else {
    if (weightEl.value) weightEl.value.textContent = '85'
    if (repsEl.value)   repsEl.value.textContent   = '9'
  }

  // Panel 3 chart: draw line via clipPath from p = 0.72 → 1.0
  const chartStart = 0.72
  const chartEnd   = 1.0
  let chartP = 0
  if (p <= chartStart) {
    chartP = 0
  } else if (p >= chartEnd) {
    chartP = 1
  } else {
    chartP = (p - chartStart) / (chartEnd - chartStart)
  }
  const baseEasedP = 1 - Math.pow(1 - chartP, 3) // ease-out cubic
  const targetChartP = chartHovered ? chartHoverTargetP : Math.max(0, Math.min(1, baseEasedP))
  chartDisplayP += (targetChartP - chartDisplayP) * 0.14
  if (Math.abs(targetChartP - chartDisplayP) < 0.001) chartDisplayP = targetChartP
  const easedP = Math.max(0, Math.min(1, chartDisplayP))

  const dot = chartDot.value
  const clipRect = chartClipRect.value
  if (dot && easedP > 0.001) {
    const totalLen = chartPts.length - 1
    const idx = Math.min(easedP * totalLen, totalLen)
    const i0  = Math.floor(idx)
    const i1  = Math.min(i0 + 1, totalLen)
    const t   = idx - i0
    const cx  = chartPts[i0][0] + (chartPts[i1][0] - chartPts[i0][0]) * t
    const cy  = chartPts[i0][1] + (chartPts[i1][1] - chartPts[i0][1]) * t
    dot.setAttribute('cx', String(cx))
    dot.setAttribute('cy', String(cy))
    dot.setAttribute('opacity', easedP > 0.02 ? '1' : '0')
    if (clipRect) clipRect.setAttribute('width', String(cx + 10))
  } else if (dot) {
    dot.setAttribute('opacity', '0')
    if (clipRect) clipRect.setAttribute('width', '0')
  }

  // Stats count up
  if (statStrength.value) statStrength.value.textContent = `+${Math.round(easedP * 32)}%`
  if (statSessions.value) statSessions.value.textContent = String(Math.round(easedP * 24))
  if (statPRs.value)      statPRs.value.textContent      = String(Math.round(easedP * 7))
}

function updateScanHoverEffect(p: number) {
  if (mobileHIWLayout) {
    resetMobileScanEffect()
    return
  }

  scanEffectResetForMobile = false
  hiwLerpedP += (p - hiwLerpedP) * 0.12
  hiwQRLerpedP += (p - hiwQRLerpedP) * 0.06

  const cornersOffset = (p - hiwLerpedP) * 600
  const qrOffset = (p - hiwQRLerpedP) * 900

  scanCurrentX += (scanTargetX - scanCurrentX) * 0.14
  scanCurrentY += (scanTargetY - scanCurrentY) * 0.14

  if (scanCorners.value) {
    scanCorners.value.style.transform = `translate(${cornersOffset + scanCurrentX}px, ${scanCurrentY}px)`
  }
  if (scanLine.value) {
    scanLine.value.style.transform = `translate(${cornersOffset + scanCurrentX}px, ${scanCurrentY}px)`
  }
  if (qrIcon.value) {
    const frameDist = Math.sqrt(scanCurrentX * scanCurrentX + scanCurrentY * scanCurrentY)
    const qrOnFrame = frameDist < 20
    qrIcon.value.style.transform = `translateX(${qrOffset}px)`
    qrIcon.value.style.stroke = qrOnFrame ? 'var(--accent)' : 'rgba(255,255,255,0.15)'
    qrIcon.value.style.opacity = qrOnFrame ? '0.4' : '0.2'
  }

  const title = scanTitle.value
  if (!title) return

  // Use cached rects — getBoundingClientRect inside rAF causes forced reflows.
  // Inner offsets (rect.left - paneRect.left) stay layout-stable through the
  // section's horizontal track translate, so a snapshot on resize/init is safe.
  if (!cachedPaneRect || !cachedAreaRect || !cachedTitleRect) refreshScanRects()
  const paneRect = cachedPaneRect
  const areaRect = cachedAreaRect
  const titleRect = cachedTitleRect
  if (!paneRect || !areaRect || !titleRect) return

  const frameCX = (areaRect.left + areaRect.width / 2 - paneRect.left) + scanCurrentX
  const frameCY = (areaRect.top + areaRect.height / 2 - paneRect.top) + scanCurrentY
  const scanPhase = (1 - Math.cos((performance.now() % 2000) / 2000 * Math.PI * 2)) / 2
  const scanLineY = 10 + scanPhase * (areaRect.height - 20)

  scanLine.value?.style.setProperty('--scan-line-y', `${scanLineY}px`)

  const setScannerWindow = (el: HTMLElement, rect: DOMRect) => {
    const localX = frameCX - (rect.left - paneRect.left)
    const localY = frameCY - (rect.top - paneRect.top)

    el.style.setProperty('--scan-w', `${areaRect.width}px`)
    el.style.setProperty('--scan-h', `${scanLineY}px`)
    el.style.setProperty('--scan-left', `${localX - areaRect.width / 2}px`)
    el.style.setProperty('--scan-top', `${localY - areaRect.height / 2}px`)
  }

  setScannerWindow(title, titleRect)
  if (scanDesc.value && cachedDescRect) setScannerWindow(scanDesc.value, cachedDescRect)
}

function resetMobileScanEffect() {
  if (scanEffectResetForMobile) return
  scanEffectResetForMobile = true
  scanHovered.value = false
  scanTargetX = 0
  scanTargetY = 0
  scanCurrentX = 0
  scanCurrentY = 0
  scanCorners.value?.style.removeProperty('transform')
  scanLine.value?.style.removeProperty('transform')
  scanLine.value?.style.removeProperty('--scan-line-y')
  qrIcon.value?.style.removeProperty('transform')
  qrIcon.value?.style.removeProperty('stroke')
  qrIcon.value?.style.removeProperty('opacity')
  scanTitle.value?.style.removeProperty('--scan-left')
  scanTitle.value?.style.removeProperty('--scan-top')
  scanTitle.value?.style.removeProperty('--scan-w')
  scanTitle.value?.style.removeProperty('--scan-h')
  scanDesc.value?.style.removeProperty('--scan-left')
  scanDesc.value?.style.removeProperty('--scan-top')
  scanDesc.value?.style.removeProperty('--scan-w')
  scanDesc.value?.style.removeProperty('--scan-h')
}

function updateGlassPaneCursor(event: MouseEvent) {
  const pane = event.currentTarget as HTMLElement
  const rect = pane.getBoundingClientRect()
  const x = (event.clientX - rect.left) / rect.width
  const y = (event.clientY - rect.top) / rect.height
  pane.style.setProperty('--mx', `${x * 100}%`)
  pane.style.setProperty('--my', `${y * 100}%`)
}

function handleGlassPaneEnter(event: MouseEvent) {
  const pane = event.currentTarget as HTMLElement
  pane.classList.add('glass-hovered')
  updateGlassPaneCursor(event)
}

function handleGlassPaneLeave(event: MouseEvent) {
  const pane = event.currentTarget as HTMLElement
  pane.classList.remove('glass-hovered')
  pane.style.setProperty('--mx', '50%')
  pane.style.setProperty('--my', '50%')
}

function handleScanPaneMove(event: MouseEvent) {
  if (mobileHIWLayout) return

  const pane = scanPane.value
  const area = scanArea.value
  if (!pane || !area) return

  updateGlassPaneCursor(event)

  const areaRect = area.getBoundingClientRect()
  const scanCenterX = areaRect.left + areaRect.width / 2
  const scanCenterY = areaRect.top + areaRect.height / 2
  scanTargetX = (event.clientX - scanCenterX) * 0.55
  scanTargetY = (event.clientY - scanCenterY) * 0.55
}

function handleScanPaneEnter(event: MouseEvent) {
  if (mobileHIWLayout) return

  scanHovered.value = true
  handleGlassPaneEnter(event)
  handleScanPaneMove(event)
}

function handleScanPaneLeave(event: MouseEvent) {
  if (mobileHIWLayout) {
    resetMobileScanEffect()
    return
  }

  scanHovered.value = false
  scanTargetX = 0
  scanTargetY = 0
  handleGlassPaneLeave(event)
}

function handleHIWChartMove(event: PointerEvent) {
  const rect = chartSvg.value?.getBoundingClientRect()
    ?? (event.currentTarget as HTMLElement).getBoundingClientRect()
  chartHovered = true
  chartHoverTargetP = Math.max(0.02, Math.min(1, (event.clientX - rect.left) / Math.max(1, rect.width)))
}

function resetHIWChartHover() {
  chartHovered = false
}

// ─── rAF loop ─────────────────────────────────────────────────────────────
function tick() {
  if (!isVisible) return
  const p = getHIWProgress()
  updateHIW(p)
  rafId = requestAnimationFrame(tick)
}

// ─── Dot click → smooth scroll to panel ──────────────────────────────────
function scrollToPanel(i: number) {
  const section = sectionRef.value
  if (!section) return
  const rect      = section.getBoundingClientRect()
  const sectionH  = rect.height - window.innerHeight
  const sectionTop = window.scrollY + rect.top
  const targetP   = i / 2
  window.scrollTo({ top: sectionTop + targetP * sectionH, behavior: 'smooth' })
}

// ─── LOG SET button ───────────────────────────────────────────────────────
function handleLogSet() {
  const w = weightEl.value
  const r = repsEl.value
  if (w?.textContent !== '85' || r?.textContent !== '9') return

  prVisible.value = true
  prBurstKey.value += 1
}

// ─── Lifecycle ───────────────────────────────────────────────────────────
onMounted(async () => {
  await nextTick()

  const canvas = curveCanvas.value
  if (canvas) {
    ctx = canvas.getContext('2d')
    sizeHIWCurveCanvas()
  }

  refreshScanRects()
  // Fonts can shift title/desc Y after first paint; refresh once they're ready.
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    document.fonts.ready.then(refreshScanRects).catch(() => {})
  }
  const onResize = () => {
    sizeHIWCurveCanvas()
    refreshScanRects()
    updateHIW(getHIWProgress())
  }
  window.addEventListener('resize', onResize, { passive: true })
  resizeCleanup = () => window.removeEventListener('resize', onResize)

  const media = window.matchMedia('(max-width: 768px)')
  const syncMobileLayout = () => {
    mobileHIWLayout = media.matches
    if (mobileHIWLayout) resetMobileScanEffect()
    else scanEffectResetForMobile = false
    requestAnimationFrame(() => updateHIW(getHIWProgress()))
  }
  syncMobileLayout()
  media.addEventListener('change', syncMobileLayout)
  mobileQueryCleanup = () => media.removeEventListener('change', syncMobileLayout)

  intersectionObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting
      if (isVisible) {
        cancelAnimationFrame(rafId)
        rafId = requestAnimationFrame(tick)
      }
    })
  }, { threshold: 0 })

  if (sectionRef.value) intersectionObs.observe(sectionRef.value)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  intersectionObs?.disconnect()
  resizeCleanup?.()
  mobileQueryCleanup?.()
})
</script>

<template>
  <section
    id="how"
    ref="sectionRef"
    class="hiw-section"
    :class="{ 'hiw-intro-in': hiwIntroEntered, 'hiw-last-exit': hiwLastExiting }"
  >
    <div class="hiw-sticky">
      <div class="hiw-bg-glow"></div>
      <canvas ref="curveCanvas" class="hiw-curve-canvas"></canvas>

      <div class="hiw-header">
        <div class="section-label">How It Works</div>
      </div>

      <div ref="trackRef" class="hiw-track">

        <!-- Panel 01: Scan -->
        <div class="hiw-panel">
          <div class="hiw-panel-number">01</div>
          <div
            ref="scanPane"
            class="hiw-glass-pane scan-interactive"
            :class="{ 'glass-hovered': scanHovered }"
            @mouseenter="handleScanPaneEnter"
            @mousemove="handleScanPaneMove"
            @mouseleave="handleScanPaneLeave"
          >
            <div class="hiw-panel-visual">
              <div class="hiw-phone-frame">
                <div ref="scanArea" class="hiw-scan-area">
                  <div ref="scanCorners" class="hiw-scan-corners">
                    <span></span><span></span><span></span><span></span>
                  </div>
                  <div ref="scanLine" class="hiw-scan-line"></div>
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none"
                    stroke="var(--liftag-primary)" stroke-width="1" opacity="0.4"
                    class="hiw-qr-icon" ref="qrIcon">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <rect x="14" y="14" width="4" height="4" />
                    <line x1="18" y1="14" x2="18" y2="18" />
                    <line x1="14" y1="18" x2="18" y2="18" />
                  </svg>
                </div>
              </div>
            </div>
            <h3 ref="scanTitle" class="hiw-panel-title">Scan the QR Code</h3>
            <p ref="scanDesc" class="hiw-panel-desc">Open LIFTAG, point your camera at the machine's QR code. The exercise loads instantly.</p>
            <div class="hiw-panel-line"></div>
          </div>
        </div>

        <!-- Panel 02: Track -->
        <div class="hiw-panel">
          <div class="hiw-panel-number">02</div>
          <div
            class="hiw-glass-pane"
            @mouseenter="handleGlassPaneEnter"
            @mousemove="updateGlassPaneCursor"
            @mouseleave="handleGlassPaneLeave"
          >
            <div class="hiw-panel-visual">
              <div class="hiw-log-card" :class="{ 'pr-unlocked': prVisible }">
                <div class="hiw-log-exercise">Bench Press</div>
                <div class="hiw-log-previous">Last session: 80kg × 10</div>
                <div class="hiw-log-inputs">
                  <div class="hiw-log-field">
                    <div class="hiw-log-label">WEIGHT</div>
                    <div class="hiw-log-value">
                      <span ref="weightEl">0</span><span class="hiw-log-unit">kg</span>
                    </div>
                  </div>
                  <div class="hiw-log-x">×</div>
                  <div class="hiw-log-field">
                    <div class="hiw-log-label">REPS</div>
                    <div class="hiw-log-value">
                      <span ref="repsEl">0</span>
                    </div>
                  </div>
                </div>
                <div
                  class="hiw-log-btn"
                  :class="{ 'is-confirmed': prVisible }"
                  role="button"
                  tabindex="0"
                  aria-label="Log set"
                  @click="handleLogSet"
                  @keydown.enter.prevent="handleLogSet"
                  @keydown.space.prevent="handleLogSet"
                >
                  LOG SET
                </div>
                <div class="hiw-log-pr-stage" :class="{ 'is-visible': prVisible }" aria-live="polite">
                  <div
                    v-if="prVisible"
                    :key="`burst-${prBurstKey}`"
                    class="hiw-log-pr-burst"
                    aria-hidden="true"
                  >
                    <span
                      v-for="(particle, particleIndex) in prBurstParticles"
                      :key="particleIndex"
                      class="hiw-log-pr-spark"
                      :style="{
                        '--spark-x': particle.x,
                        '--spark-y': particle.y,
                        '--spark-rotate': particle.rotate,
                        '--spark-delay': particle.delay,
                        '--spark-color': particle.color,
                      }"
                    ></span>
                  </div>
                  <div v-if="prVisible" :key="`pr-${prBurstKey}`" class="hiw-log-pb">
                    NEW PR! <span>+5kg</span>
                  </div>
                  <div v-else class="hiw-log-pb hiw-log-pb-placeholder" aria-hidden="true">
                    NEW PR! <span>+5kg</span>
                  </div>
                </div>
              </div>
            </div>
            <h3 class="hiw-panel-title">Track Your Sets</h3>
            <p class="hiw-panel-desc">Enter weight and reps. See your previous performance, personal bests, and projected targets.</p>
            <div class="hiw-panel-line"></div>
          </div>
        </div>

        <!-- Panel 03: Progress -->
        <div class="hiw-panel">
          <div class="hiw-panel-number">03</div>
          <div
            class="hiw-glass-pane"
            @mouseenter="handleGlassPaneEnter"
            @mousemove="updateGlassPaneCursor"
            @mouseleave="handleGlassPaneLeave"
          >
            <div class="hiw-panel-visual">
              <div
                class="hiw-chart-card"
                @pointermove="handleHIWChartMove"
                @pointerleave="resetHIWChartHover"
                @pointercancel="resetHIWChartHover"
              >
                <div class="hiw-chart-title">Bench Press · 12 weeks</div>
                <svg
                  ref="chartSvg"
                  class="hiw-chart-svg"
                  viewBox="-5 -15 310 150"
                  fill="none"
                >
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="var(--liftag-primary)" stop-opacity="0.3" />
                      <stop offset="100%" stop-color="var(--liftag-primary)" stop-opacity="0" />
                    </linearGradient>
                    <clipPath id="chartClip">
                      <rect :ref="(el) => { if (el) chartClipRect = el as SVGRectElement }"
                        x="-5" y="-15" width="0" height="150" />
                    </clipPath>
                  </defs>
                  <polyline class="hiw-chart-line"
                    points="0,100 40,92 80,85 120,78 160,65 200,55 240,40 280,20"
                    stroke="var(--liftag-primary)" stroke-width="2" fill="none"
                    stroke-linecap="round" stroke-linejoin="round"
                    clip-path="url(#chartClip)" />
                  <polygon class="hiw-chart-fill"
                    points="0,100 40,92 80,85 120,78 160,65 200,55 240,40 280,20 280,120 0,120"
                    fill="url(#chartGrad)"
                    clip-path="url(#chartClip)" />
                  <circle :ref="(el) => { if (el) chartDot = el as SVGCircleElement }"
                    cx="0" cy="100" r="4" fill="var(--liftag-primary)" opacity="0" />
                </svg>
                <div class="hiw-chart-stats">
                  <div class="hiw-chart-stat">
                    <span ref="statStrength" style="color: var(--liftag-primary); font-weight: 800;">+0%</span><br />
                    <span style="color: var(--liftag-fg-dim); font-size: 0.6rem;">STRENGTH</span>
                  </div>
                  <div class="hiw-chart-stat">
                    <span ref="statSessions" style="color: var(--liftag-red-neon); font-weight: 800;">0</span><br />
                    <span style="color: var(--liftag-fg-dim); font-size: 0.6rem;">SESSIONS</span>
                  </div>
                  <div class="hiw-chart-stat">
                    <span ref="statPRs" style="font-weight: 800;">0</span><br />
                    <span style="color: var(--liftag-fg-dim); font-size: 0.6rem;">NEW PRs</span>
                  </div>
                </div>
              </div>
            </div>
            <h3 class="hiw-panel-title">Watch Progress Compound</h3>
            <p class="hiw-panel-desc">Over weeks and months, LIFTAG builds your complete strength story. Every rep, every PR.</p>
            <div class="hiw-panel-line"></div>
          </div>
        </div>

      </div><!-- /.hiw-track -->

      <!-- Step dots -->
      <div class="hiw-dots" role="tablist" aria-label="How it works steps">
        <div
          v-for="(_, i) in 3"
          :key="i"
          :ref="(el) => { if (el) dotEls[i] = el as HTMLElement }"
          class="hiw-dot"
          :class="{ active: i === 0 }"
          role="tab"
          tabindex="0"
          :aria-label="`Step ${i + 1}`"
          :aria-selected="i === 0 ? 'true' : 'false'"
          @click="scrollToPanel(i)"
          @keydown.enter.prevent="scrollToPanel(i)"
          @keydown.space.prevent="scrollToPanel(i)"
        ></div>
      </div>

    </div><!-- /.hiw-sticky -->
  </section>
</template>

<style scoped>
/* ── Local token aliases (source compat) ───────────────── */
.hiw-section {
  --accent:       var(--liftag-primary);
  --accent-dim:   var(--liftag-primary-dim);
  --accent-glow:  var(--liftag-primary-glow);
  --text-dim:     var(--liftag-fg-dim);
  --text-mid:     var(--liftag-fg-mid);
  --red-neon:     var(--liftag-red-neon);
  --red-neon-glow: var(--liftag-red-neon-glow);
  --red-neon-dim:  rgba(255, 45, 85, 0.15);
  --bg:           #000;
  --surface:      var(--liftag-secondary);
  --surface-hover: var(--liftag-surface-card);
  --text:         var(--liftag-fg);
  --border:       rgba(255, 255, 255, 0.08);
}

/* ── Section shell ─────────────────────────────────────── */
.hiw-section {
  height: 300vh;
  position: relative;
  z-index: 30;
  background: var(--bg);
}

.hiw-sticky {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
}

/* Left/right edge fade-out to black */
.hiw-sticky::before,
.hiw-sticky::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 120px;
  z-index: 4;
  pointer-events: none;
}
.hiw-sticky::before {
  left: 0;
  background: linear-gradient(to right, var(--bg) 0%, transparent 100%);
}
.hiw-sticky::after {
  right: 0;
  background: linear-gradient(to left, var(--bg) 0%, transparent 100%);
}

/* ── Background canvas ─────────────────────────────────── */
.hiw-curve-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

/* ── Ambient glow ──────────────────────────────────────── */
.hiw-bg-glow {
  position: absolute;
  inset: -20%;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 60% 50% at 50% 60%, rgba(200, 255, 0, 0.06) 0%, transparent 70%),
    radial-gradient(ellipse 40% 40% at 30% 40%, rgba(200, 255, 0, 0.04) 0%, transparent 60%),
    radial-gradient(ellipse 30% 30% at 70% 50%, rgba(255, 45, 85, 0.03) 0%, transparent 60%);
  animation: hiwGlowDrift 20s ease-in-out infinite;
}
@keyframes hiwGlowDrift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25%       { transform: translate(5%, -3%) scale(1.05); }
  50%       { transform: translate(-4%, 4%) scale(0.97); }
  75%       { transform: translate(3%, 2%) scale(1.03); }
}

/* ── Header label ─────────────────────────────────────── */
.hiw-header {
  position: absolute;
  top: 60px;
  left: 40px;
  z-index: 5;
}

.section-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 16px;
}

/* ── Track ────────────────────────────────────────────── */
.hiw-track {
  display: flex;
  width: 300%;
  height: 100%;
  position: relative;
  will-change: transform;
}

/* ── Panel shell ──────────────────────────────────────── */
.hiw-panel {
  width: 100vw;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 60px;
  position: relative;
}

.hiw-panel-number {
  position: absolute;
  z-index: 3;
  font-family: 'JetBrains Mono', monospace;
  font-size: 34vw;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.035);
  line-height: 1;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  user-select: none;
  mix-blend-mode: screen;
}

.hiw-panel:first-child .hiw-panel-number {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.88);
  filter: blur(10px);
  transition:
    opacity 900ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 1100ms cubic-bezier(0.16, 1, 0.3, 1),
    filter 900ms cubic-bezier(0.16, 1, 0.3, 1);
}

.hiw-section.hiw-intro-in .hiw-panel:first-child .hiw-panel-number {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
  filter: blur(0);
}

.hiw-panel:last-child .hiw-panel-number {
  transition:
    opacity 620ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 720ms cubic-bezier(0.16, 1, 0.3, 1),
    filter 620ms cubic-bezier(0.16, 1, 0.3, 1);
}

.hiw-section.hiw-last-exit .hiw-panel:last-child .hiw-panel-number {
  opacity: 0;
  transform: translate(-50%, -56%) scale(0.94);
  filter: blur(8px);
}

/* ── Glass pane ───────────────────────────────────────── */
.hiw-glass-pane {
  --mx: 50%;
  --my: 50%;
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 40px 40px;
  border-radius: 28px;
  max-width: 440px;
  background: rgba(4, 5, 5, 0.66);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 8px 44px rgba(0, 0, 0, 0.46),
    0 2px 10px rgba(0, 0, 0, 0.26),
    inset 0 1px 0 rgba(255, 255, 255, 0.16),
    inset 0 0 64px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  will-change: transform;
  transition: box-shadow 0.4s ease, border-color 0.4s ease;
}

.hiw-panel:first-child .hiw-glass-pane {
  opacity: 0;
  transform: translate3d(0, 42px, 0) scale(0.955);
  filter: blur(8px);
  transition:
    opacity 760ms cubic-bezier(0.16, 1, 0.3, 1) 120ms,
    transform 900ms cubic-bezier(0.16, 1, 0.3, 1) 120ms,
    filter 760ms cubic-bezier(0.16, 1, 0.3, 1) 120ms,
    box-shadow 0.4s ease,
    border-color 0.4s ease;
}

.hiw-section.hiw-intro-in .hiw-panel:first-child .hiw-glass-pane {
  opacity: 1;
  transform: translate3d(0, 0, 0) scale(1);
  filter: blur(0);
}

.hiw-panel:last-child .hiw-glass-pane {
  transition:
    opacity 560ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 700ms cubic-bezier(0.16, 1, 0.3, 1),
    filter 560ms cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.4s ease,
    border-color 0.4s ease;
}

.hiw-section.hiw-last-exit .hiw-panel:last-child .hiw-glass-pane {
  opacity: 0;
  transform: translate3d(0, -34px, 0) scale(0.975);
  filter: blur(7px);
}

.hiw-glass-pane.glass-hovered {
  border-color: rgba(200, 255, 0, 0.22);
  box-shadow:
    0 18px 70px rgba(0, 0, 0, 0.62),
    0 0 38px rgba(200, 255, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    inset 0 0 72px rgba(200, 255, 0, 0.035);
}

.hiw-glass-pane::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 28px;
  background:
    linear-gradient(
      135deg,
      rgba(12, 14, 13, 0.38) 0%,
      rgba(2, 3, 4, 0.3) 42%,
      rgba(8, 10, 9, 0.42) 100%
    ),
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.12) 0%,
      rgba(255, 255, 255, 0.04) 32%,
      transparent 58%
    );
  pointer-events: none;
  z-index: 0;
}

.hiw-glass-pane > * {
  position: relative;
  z-index: 2;
}

/* Cursor inner glow */
.hiw-glass-pane::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 28px;
  background: radial-gradient(
    280px circle at var(--mx) var(--my),
    rgba(200, 255, 0, 0.09) 0%,
    rgba(200, 255, 0, 0.025) 42%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.35s ease;
  pointer-events: none;
  z-index: 1;
}

.hiw-glass-pane.glass-hovered::after {
  opacity: 1;
}

/* ── Panel typography ─────────────────────────────────── */
.hiw-panel-title {
  font-size: clamp(1.8rem, 3.5vw, 2.8rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 16px;
  text-align: center;
  font-family: var(--liftag-font-headline, 'Space Grotesk', sans-serif);
  font-style: italic;
}

.hiw-panel-desc {
  font-size: clamp(0.95rem, 1.3vw, 1.1rem);
  font-weight: 300;
  color: var(--text-mid);
  line-height: 1.7;
  max-width: 420px;
  text-align: center;
}

.scan-interactive .hiw-panel-title,
.scan-interactive .hiw-panel-desc {
  --scan-left: -999px;
  --scan-top: -999px;
  --scan-w: 120px;
  --scan-h: 120px;
  background-image:
    linear-gradient(var(--accent), var(--accent)),
    linear-gradient(#fff, #fff);
  background-size:
    var(--scan-w) var(--scan-h),
    100% 100%;
  background-position:
    var(--scan-left) var(--scan-top),
    0 0;
  background-repeat: no-repeat;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.scan-interactive .hiw-panel-desc {
  background-image:
    linear-gradient(var(--accent), var(--accent)),
    linear-gradient(var(--text-mid), var(--text-mid));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hiw-panel-line {
  width: 60px;
  height: 2px;
  background: var(--red-neon);
  box-shadow: 0 0 8px var(--red-neon-glow);
  margin: 24px auto 0;
  border-radius: 1px;
}

.hiw-panel:first-child .hiw-panel-visual,
.hiw-panel:first-child .hiw-panel-title,
.hiw-panel:first-child .hiw-panel-desc,
.hiw-panel:first-child .hiw-panel-line {
  opacity: 0;
  transform: translateY(18px);
  transition:
    opacity 720ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 760ms cubic-bezier(0.16, 1, 0.3, 1);
}

.hiw-section.hiw-intro-in .hiw-panel:first-child .hiw-panel-visual {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 300ms;
}

.hiw-section.hiw-intro-in .hiw-panel:first-child .hiw-panel-title {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 430ms;
}

.hiw-section.hiw-intro-in .hiw-panel:first-child .hiw-panel-desc {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 520ms;
}

.hiw-section.hiw-intro-in .hiw-panel:first-child .hiw-panel-line {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 620ms;
}

.hiw-panel:last-child .hiw-panel-visual,
.hiw-panel:last-child .hiw-panel-title,
.hiw-panel:last-child .hiw-panel-desc,
.hiw-panel:last-child .hiw-panel-line {
  transition:
    opacity 460ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 520ms cubic-bezier(0.16, 1, 0.3, 1);
}

.hiw-section.hiw-last-exit .hiw-panel:last-child .hiw-panel-visual,
.hiw-section.hiw-last-exit .hiw-panel:last-child .hiw-panel-title,
.hiw-section.hiw-last-exit .hiw-panel:last-child .hiw-panel-desc,
.hiw-section.hiw-last-exit .hiw-panel:last-child .hiw-panel-line {
  opacity: 0;
  transform: translateY(-18px);
}

.hiw-panel-visual {
  margin-bottom: 36px;
}

/* ── Panel 01: Scanner ────────────────────────────────── */
.hiw-phone-frame {
  width: 180px;
  height: 200px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.hiw-scan-area {
  width: 120px;
  height: 120px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hiw-scan-corners {
  position: absolute;
  inset: 0;
}
.hiw-scan-corners span {
  position: absolute;
  width: 20px;
  height: 20px;
  border-color: var(--accent);
  border-style: solid;
  border-width: 0;
}

.hiw-panel:first-child .hiw-scan-corners span {
  opacity: 0;
  transform: scale(0.62);
  transition:
    opacity 520ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 620ms cubic-bezier(0.16, 1, 0.3, 1);
}

.hiw-section.hiw-intro-in .hiw-panel:first-child .hiw-scan-corners span {
  opacity: 1;
  transform: scale(1);
}

.hiw-section.hiw-intro-in .hiw-panel:first-child .hiw-scan-corners span:nth-child(1) {
  transition-delay: 460ms;
}

.hiw-section.hiw-intro-in .hiw-panel:first-child .hiw-scan-corners span:nth-child(2) {
  transition-delay: 520ms;
}

.hiw-section.hiw-intro-in .hiw-panel:first-child .hiw-scan-corners span:nth-child(3) {
  transition-delay: 580ms;
}

.hiw-section.hiw-intro-in .hiw-panel:first-child .hiw-scan-corners span:nth-child(4) {
  transition-delay: 640ms;
}

.hiw-scan-corners span:nth-child(1) {
  top: 0; left: 0;
  border-top-width: 2px;
  border-left-width: 2px;
  border-radius: 4px 0 0 0;
}
.hiw-scan-corners span:nth-child(2) {
  top: 0; right: 0;
  border-top-width: 2px;
  border-right-width: 2px;
  border-radius: 0 4px 0 0;
}
.hiw-scan-corners span:nth-child(3) {
  bottom: 0; left: 0;
  border-bottom-width: 2px;
  border-left-width: 2px;
  border-radius: 0 0 0 4px;
}
.hiw-scan-corners span:nth-child(4) {
  bottom: 0; right: 0;
  border-bottom-width: 2px;
  border-right-width: 2px;
  border-radius: 0 0 4px 0;
}

.hiw-scan-line {
  position: absolute;
  top: var(--scan-line-y, 10px);
  left: 8px;
  right: 8px;
  height: 2px;
  background: var(--red-neon);
  box-shadow: 0 0 12px var(--red-neon);
}

.hiw-panel:first-child .hiw-scan-line {
  opacity: 0;
  clip-path: inset(0 100% 0 0);
  transition:
    opacity 420ms ease,
    clip-path 660ms cubic-bezier(0.16, 1, 0.3, 1);
}

.hiw-section.hiw-intro-in .hiw-panel:first-child .hiw-scan-line {
  opacity: 1;
  clip-path: inset(0 0 0 0);
  transition-delay: 720ms;
}

.hiw-qr-icon {
  transition: stroke 0.35s ease, opacity 0.35s ease;
}

@keyframes hiwMobileScanSweep {
  0%, 100% {
    transform: translate3d(0, 0, 0);
  }
  50% {
    transform: translate3d(0, 78px, 0);
  }
}

/* ── Panel 02: Logger ─────────────────────────────────── */
.hiw-log-card {
  width: 220px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  position: relative;
  overflow: hidden;
  transition: border-color 260ms ease, box-shadow 260ms ease, transform 260ms ease;
}

.hiw-log-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  pointer-events: none;
  background:
    radial-gradient(120px 80px at 50% 78%, rgba(204, 255, 0, 0.16), transparent 70%),
    linear-gradient(115deg, transparent 10%, rgba(255, 255, 255, 0.12), transparent 34%);
  opacity: 0;
  transform: translateX(-36%);
}

.hiw-log-card.pr-unlocked {
  border-color: rgba(204, 255, 0, 0.42);
  box-shadow:
    0 18px 46px rgba(0, 0, 0, 0.36),
    0 0 34px rgba(204, 255, 0, 0.1),
    inset 0 0 24px rgba(204, 255, 0, 0.035);
}

.hiw-log-card.pr-unlocked::before {
  animation: prCardSheen 920ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.hiw-log-exercise {
  font-weight: 700;
  font-size: 1rem;
  margin-bottom: 4px;
}

.hiw-log-previous {
  font-size: 0.7rem;
  color: var(--text-dim);
  margin-bottom: 20px;
}

.hiw-log-inputs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

.hiw-log-field {
  text-align: center;
}

.hiw-log-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.55rem;
  font-weight: 700;
  color: var(--text-dim);
  letter-spacing: 0.1em;
  margin-bottom: 4px;
}

.hiw-log-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 2rem;
  font-weight: 800;
  color: var(--accent);
}

.hiw-log-card.pr-unlocked .hiw-log-value {
  animation: prValuePop 620ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.hiw-log-unit {
  font-size: 0.9rem;
  font-weight: 400;
  color: var(--text-dim);
}

.hiw-log-x {
  font-size: 1.2rem;
  color: var(--text-dim);
  margin-top: 16px;
}

.hiw-log-btn {
  padding: 10px;
  background: var(--accent);
  color: #000;
  font-size: 0.75rem;
  font-weight: 800;
  border-radius: 10px;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
  cursor: pointer;
  user-select: none;
  position: relative;
  overflow: hidden;
  transition: transform 180ms ease, box-shadow 220ms ease, filter 180ms ease;
}
.hiw-log-btn:hover {
  filter: brightness(1.1);
}
.hiw-log-btn:active {
  transform: scale(0.96);
}
.hiw-log-btn.is-confirmed {
  box-shadow:
    0 0 18px rgba(204, 255, 0, 0.48),
    0 0 34px rgba(204, 255, 0, 0.16);
  animation: logSetButtonPop 560ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.hiw-log-pr-stage {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 20px;
  margin-top: 2px;
}

.hiw-log-pr-burst {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.hiw-log-pr-burst::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  width: 12px;
  height: 12px;
  border-radius: 999px;
  border: 1px solid rgba(204, 255, 0, 0.8);
  box-shadow:
    0 0 18px rgba(204, 255, 0, 0.5),
    inset 0 0 12px rgba(204, 255, 0, 0.18);
  transform: translate(-50%, -50%);
  animation: prRingOut 760ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.hiw-log-pr-spark {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 4px;
  height: 12px;
  border-radius: 999px;
  background: var(--spark-color);
  box-shadow: 0 0 10px var(--spark-color);
  opacity: 0;
  transform: translate(-50%, -50%) rotate(var(--spark-rotate)) scaleY(0.4);
  animation: prSparkOut 780ms cubic-bezier(0.16, 1, 0.3, 1) var(--spark-delay) both;
}

.hiw-log-pb {
  position: relative;
  z-index: 1;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.76rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text);
  text-shadow:
    0 0 10px rgba(255, 255, 255, 0.24),
    0 0 20px rgba(204, 255, 0, 0.16);
  animation:
    prTextPop 780ms cubic-bezier(0.16, 1, 0.3, 1) both,
    pbPulse 1.5s ease-in-out 780ms infinite;
}

.hiw-log-pb span {
  color: var(--liftag-primary);
  text-shadow: 0 0 12px rgba(204, 255, 0, 0.62);
}

.hiw-log-pb-placeholder {
  visibility: hidden;
  animation: none;
}

@keyframes prCardSheen {
  0% { opacity: 0; transform: translateX(-44%); }
  18% { opacity: 1; }
  100% { opacity: 0; transform: translateX(60%); }
}

@keyframes logSetButtonPop {
  0% { transform: scale(0.96); }
  42% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes prValuePop {
  0% { transform: translateY(0) scale(1); text-shadow: none; }
  34% { transform: translateY(-2px) scale(1.08); text-shadow: 0 0 16px rgba(204, 255, 0, 0.56); }
  100% { transform: translateY(0) scale(1); text-shadow: none; }
}

@keyframes prTextPop {
  0% { opacity: 0; transform: translateY(10px) scale(0.82); filter: blur(3px); }
  46% { opacity: 1; transform: translateY(-3px) scale(1.14); filter: blur(0); }
  100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
}

@keyframes prRingOut {
  0% { opacity: 0.85; transform: translate(-50%, -50%) scale(0.4); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(7.4); }
}

@keyframes prSparkOut {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(var(--spark-rotate)) scaleY(0.35);
  }
  18% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(calc(-50% + var(--spark-x)), calc(-50% + var(--spark-y))) rotate(var(--spark-rotate)) scaleY(0.12);
  }
}

@keyframes pbPulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

/* ── Panel 03: Chart ──────────────────────────────────── */
.hiw-chart-card {
  width: 300px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  cursor: crosshair;
  touch-action: pan-y;
}

.hiw-chart-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--text-dim);
  letter-spacing: 0.1em;
  margin-bottom: 16px;
}

.hiw-chart-svg {
  width: 100%;
  height: auto;
  margin-bottom: 16px;
  overflow: visible;
}

.hiw-chart-line {
  filter: drop-shadow(0 0 6px var(--accent));
}

.hiw-chart-fill {
  opacity: 1;
}

/* Chart dot glow */
circle[fill="var(--liftag-primary)"] {
  filter: drop-shadow(0 0 8px var(--accent)) drop-shadow(0 0 16px var(--accent));
  transition: opacity 0.3s ease;
}

.hiw-chart-stats {
  display: flex;
  justify-content: space-between;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  text-align: center;
}

/* ── Step dots ────────────────────────────────────────── */
.hiw-dots {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 10;
  pointer-events: auto;
}

.hiw-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  cursor: pointer;
  transition: width 0.4s ease, background-color 0.4s ease, box-shadow 0.4s ease, border-radius 0.4s ease, transform 0.4s ease;
}
.hiw-dot:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: scale(1.3);
}
.hiw-dot.active {
  background: var(--liftag-primary);
  box-shadow: 0 0 10px var(--liftag-primary-glow);
  width: 20px;
  border-radius: 4px;
}
.hiw-dot.active:hover {
  background: var(--liftag-primary);
  transform: scale(1.1);
}

/* ── Mobile ───────────────────────────────────────────── */
@media (max-width: 768px) {
  .hiw-section {
    height: 300svh !important;
    min-height: 300svh;
    padding: 0 !important;
    overflow-y: visible;
  }
  .hiw-sticky {
    position: sticky;
    top: 0;
    height: 100svh;
    overflow: hidden;
  }
  .hiw-sticky::before,
  .hiw-sticky::after {
    width: 28px;
  }
  .hiw-bg-glow {
    inset: -32%;
    opacity: 0.86;
  }
  .hiw-curve-canvas {
    opacity: 0.62;
  }
  .hiw-header {
    top: max(88px, calc(env(safe-area-inset-top) + 82px));
    left: 20px;
  }
  .hiw-track {
    flex-direction: column;
    width: 100% !important;
    height: 300%;
    overflow: visible;
    touch-action: pan-y;
    will-change: transform;
  }
  .hiw-panel {
    flex: 0 0 100svh;
    width: 100%;
    height: 100svh;
    min-height: 100svh;
    padding: 82px 18px 74px !important;
  }
  .hiw-panel-number {
    font-size: 44vw;
    top: 54%;
  }
  .hiw-glass-pane {
    width: min(88vw, 360px);
    max-width: min(88vw, 360px) !important;
    padding: 26px 18px 24px !important;
    border-radius: 24px;
  }
  .hiw-glass-pane::before,
  .hiw-glass-pane::after {
    border-radius: 24px;
  }
  .hiw-panel-visual {
    margin-bottom: 24px;
  }
  .hiw-panel-title {
    font-size: clamp(1.45rem, 8vw, 2.05rem);
    margin-bottom: 12px;
  }
  .hiw-panel-desc {
    font-size: 0.92rem;
    line-height: 1.55;
  }
  .scan-interactive .hiw-panel-title,
  .scan-interactive .hiw-panel-desc {
    background-image: none;
    background-clip: border-box;
    -webkit-background-clip: border-box;
    -webkit-text-fill-color: currentColor;
  }
  .hiw-scan-corners {
    transform: none !important;
  }
  .hiw-scan-line {
    animation: hiwMobileScanSweep 1.85s cubic-bezier(0.45, 0, 0.2, 1) infinite;
    will-change: transform;
  }
  .hiw-qr-icon {
    transform: none !important;
    stroke: var(--liftag-primary) !important;
    opacity: 0.4 !important;
  }
  .hiw-panel-line {
    margin-top: 18px;
  }
  .hiw-phone-frame {
    width: 150px;
    height: 168px;
  }
  .hiw-scan-area {
    width: 100px;
    height: 100px;
  }
  .hiw-log-card {
    width: 100%;
    max-width: 250px;
    padding: 20px;
  }
  .hiw-chart-card {
    width: 100%;
    max-width: 260px;
    padding: 20px;
    touch-action: pan-y;
  }
  .hiw-dots {
    bottom: max(18px, calc(env(safe-area-inset-bottom) + 12px));
  }
}
</style>
