<script setup lang="ts">
import {
  MERGE_BODY_COUNT,
  MERGE_LOGO_INDEX,
  mergeBodyVelocity,
  mergeCoreFromProgress,
  mergeCoreIconEnergy,
  mergeStormFromProgress,
  publishMergeArmed,
  publishMergeBody,
  publishMergeCore,
  publishMergeStorm,
  publishMergeWell,
  resetMergeParticleField,
  type MergeBodyPose,
  type MergeFieldCore,
} from '../composables/useMergeParticleField'
import { rayDissolvedLength, rayRectVisibleLength } from '../utils/mergeRayClip'

interface MockApp {
  key: string
  name: string
  replaces: string
  gradient: string
  accent: string
  glow: string
  /** Dominant hue, used as this app's light inside the prism core. */
  core: string
  x: number
  y: number
  rotate: number
  delay: number
  depth: number
}

const sectionRef = ref<HTMLElement | null>(null)
const stickyRef = ref<HTMLElement | null>(null)
const stageRef = ref<HTMLElement | null>(null)
const liftagRef = ref<HTMLElement | null>(null)
const isMobileParticles = ref(false)

const iconEls: HTMLElement[] = []
const captionEls: HTMLElement[] = []
const vectorEls: HTMLElement[] = []

let targetP = 0
let targetPointerX = 50
let targetPointerY = 50
let scrollP = 0
let pointerX = 50
let pointerY = 50
let stageScale = 1
let mobileMergeLayout = false
let rafId = 0
let observer: IntersectionObserver | null = null
let stageResizeObserver: ResizeObserver | null = null
let isVisible = false
let reduceMotion = false
let lastMergeCss = -1
let lastFinaleCss = -1
let lastExitVarsKey = ''

// Per-element last-applied style cache - avoids re-serializing identical
// transform/opacity strings to ~24 elements every rAF frame.
const lastIconTransform: string[] = []
const lastIconOpacity: string[] = []
const lastIconZ: string[] = []
const lastIconSpin: string[] = []
const lastCaptionTransform: string[] = []
const lastCaptionOpacity: string[] = []
const lastVectorTransform: string[] = []
const lastVectorOpacity: string[] = []
const lastVectorSparkX: string[] = []
const lastVectorSparkOpacity: string[] = []
const lastVectorLen: string[] = []
const lastRayDirX: number[] = []
const lastRayDirY: number[] = []
const VECTOR_HIDDEN_TRANSFORM = 'translate3d(0px, 0px, 0) rotate(0deg) scaleX(0)'
let rayOriginX = 0
let rayOriginY = 0
let clipW = 0
let clipH = 0
let lastRayOx = ''
let lastRayOy = ''
let lastLogoTransform = ''
let lastLogoOpacity = ''
let lastLogoSpin = ''

const lastBodyPose: MergeBodyPose[] = Array.from({ length: MERGE_BODY_COUNT }, () => ({
  x: 0,
  y: 0,
  spin: 0,
}))
let lastPublishAt = 0
let bodiesArmed = false
let mergeMobileMql: MediaQueryList | null = null
let onMergeMobileChange: ((event: MediaQueryListEvent) => void) | null = null

const mockApps: MockApp[] = [
  {
    key: 'set',
    name: 'Notes',
    replaces: 'Sets · RPE',
    gradient: 'linear-gradient(145deg, #1cff7a 0%, #0c9f61 48%, #052a1d 100%)',
    accent: '#d7ffe8',
    glow: 'rgba(28,255,122,0.35)',
    core: '#1cff7a',
    x: -242,
    y: -166,
    rotate: -10,
    delay: 0,
    depth: 1.05,
  },
  {
    key: 'timer',
    name: 'Timer',
    replaces: 'Rest intervals',
    gradient: 'linear-gradient(145deg, #fff27a 0%, #ffb32c 50%, #7a3000 100%)',
    accent: '#fff8d2',
    glow: 'rgba(255,179,44,0.34)',
    core: '#ffb32c',
    x: 12,
    y: -240,
    rotate: 5,
    delay: 1,
    depth: 0.92,
  },
  {
    key: 'stopwatch',
    name: 'Stopwatch',
    replaces: 'Timed sets',
    gradient: 'linear-gradient(145deg, #69d6ff 0%, #1763ff 52%, #081541 100%)',
    accent: '#d9f5ff',
    glow: 'rgba(76,151,255,0.34)',
    core: '#4c97ff',
    x: 242,
    y: -174,
    rotate: -6,
    delay: 2,
    depth: 1.08,
  },
  {
    key: 'guides',
    name: 'Exercise Guides',
    replaces: 'Form videos',
    gradient: 'linear-gradient(145deg, #ff75ad 0%, #ff2d55 50%, #4f0617 100%)',
    accent: '#ffe7ef',
    glow: 'rgba(255,45,85,0.34)',
    core: '#ff2d55',
    x: 336,
    y: 10,
    rotate: -7,
    delay: 3,
    depth: 0.96,
  },
  {
    key: 'planner',
    name: 'Workout Planner',
    replaces: 'Routines',
    gradient: 'linear-gradient(145deg, #d8ff7a 0%, #ccff00 48%, #415200 100%)',
    accent: '#0b0f02',
    glow: 'rgba(204,255,0,0.38)',
    core: '#ccff00',
    x: 232,
    y: 176,
    rotate: 8,
    delay: 4,
    depth: 1.1,
  },
  {
    key: 'progress',
    name: 'Progress Charts',
    replaces: 'Analytics',
    gradient: 'linear-gradient(145deg, #b77cff 0%, #7c3cff 48%, #190b3d 100%)',
    accent: '#f1e7ff',
    glow: 'rgba(124,60,255,0.34)',
    core: '#7c3cff',
    x: -16,
    y: 241,
    rotate: -5,
    delay: 5,
    depth: 0.94,
  },
  {
    key: 'calendar',
    name: 'Calendar',
    replaces: 'Reminders, notifications',
    gradient: 'linear-gradient(145deg, #ffcb6b 0%, #f59e0b 46%, #5b2200 100%)',
    accent: '#fff5d8',
    glow: 'rgba(245,158,11,0.34)',
    core: '#f59e0b',
    x: -230,
    y: 160,
    rotate: 9,
    delay: 6,
    depth: 1.02,
  },
  {
    key: 'body',
    name: 'Body Metrics',
    replaces: 'Check-ins',
    gradient: 'linear-gradient(145deg, #ff9b6b 0%, #ef4444 48%, #4b0808 100%)',
    accent: '#ffe5dc',
    glow: 'rgba(239,68,68,0.3)',
    core: '#ef4444',
    x: -335,
    y: -18,
    rotate: -8,
    delay: 7,
    depth: 0.9,
  },
]

// Each mock app becomes one light in the prism core's environment, aimed from
// where that icon sits in the orbit. Static, so it never triggers a re-render.
const prismIcons = mockApps.map((app) => {
  const len = Math.hypot(app.x, app.y) || 1
  const z = 0.35 + (app.depth - 0.9) * 1.2
  const scale = 1 / Math.hypot(app.x / len, app.y / len, z)
  return {
    // Screen y grows downward, the shader's world y grows upward.
    dir: [(app.x / len) * scale, (-app.y / len) * scale, z * scale],
    color: [
      parseInt(app.core.slice(1, 3), 16) / 255,
      parseInt(app.core.slice(3, 5), 16) / 255,
      parseInt(app.core.slice(5, 7), 16) / 255,
    ],
  }
})

// Reused every frame so a 60fps merge allocates nothing.
const coreState: MergeFieldCore = {
  charge: 0,
  ignite: 0,
  flash: 0,
  fade: 0,
  tiltX: 0,
  tiltY: 0,
  icons: mockApps.map(() => 0),
}

function setElementRef(collection: HTMLElement[], index: number, el: unknown) {
  if (typeof HTMLElement === 'undefined' || !(el instanceof HTMLElement)) return
  collection[index] = el
}

function setIconRef(el: unknown, index: number) {
  setElementRef(iconEls, index, el)
}

function setCaptionRef(el: unknown, index: number) {
  setElementRef(captionEls, index, el)
}

function setVectorRef(el: unknown, index: number) {
  setElementRef(vectorEls, index, el)
}

function clamp(v: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, v))
}

function smoothstep(v: number) {
  const t = clamp(v)
  return t * t * (3 - 2 * t)
}

function smootherstep(v: number) {
  const t = clamp(v)
  return t * t * t * (t * (t * 6 - 15) + 10)
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function logoIntroProgress(p: number) {
  return smootherstep((p - 0.68) / 0.18)
}

function logoSpinDegrees(intro: number) {
  if (intro <= 0) return 0
  if (intro >= 0.995) return 360

  const settle = smoothstep((intro - 0.72) / 0.28)
  const overshoot = Math.sin(settle * Math.PI * 2.4) * 8 * (1 - settle)
  return intro * 360 + overshoot
}

function getScrollProgress() {
  const section = sectionRef.value
  if (!section) return 0

  const rect = section.getBoundingClientRect()
  const viewportH = useStableViewportHeight() || window.innerHeight
  const available = Math.max(1, rect.height - viewportH)
  const stickyH = stickyRef.value?.offsetHeight ?? viewportH
  const pinned = rect.top <= 2 && rect.bottom >= stickyH - 2
  // Non-reactive: a Vue ref here re-renders the section and Vue's :style
  // bindings overwrite the rAF icon transforms for a frame (or permanently
  // when the style cache then skips the matching write).
  publishMergeArmed(pinned)
  return clamp(-rect.top / available)
}

function updateStageScale() {
  const stage = stageRef.value
  if (!stage) return

  const rect = stage.getBoundingClientRect()
  mobileMergeLayout = window.innerWidth <= 620

  if (mobileMergeLayout) {
    // Keep the complete orbit inside short, narrow phone viewports. The
    // desktop composition only needs a width constraint, while mobile also
    // needs to respect the stage height below the copy.
    stageScale = clamp(Math.min(rect.width / 620, rect.height / 520), 0.46, 0.62)
    return
  }

  stageScale = clamp(rect.width / 860, 0.58, 1)
}

function cacheRayLayout() {
  const sticky = stickyRef.value
  const stage = stageRef.value
  if (!sticky || !stage) return

  // The finale/exit transforms on .app-merge-layout and .merge-stage
  // (--merge-exit-y/-scale, --merge-stage-exit) only activate in the last
  // ~2% of scroll, but that's exactly where the IntersectionObserver below
  // re-fires "entering" when scrolling back UP into the section from below.
  // Measuring while those transforms are live bakes a shifted-up origin
  // into --ray-ox/--ray-oy that then stays wrong for the rest of the
  // upward scroll (the ray layer itself never carries that transform).
  // Neutralize them for this synchronous read only.
  const section = sectionRef.value
  const prevExitY = section?.style.getPropertyValue('--merge-exit-y') ?? ''
  const prevExitScale = section?.style.getPropertyValue('--merge-exit-scale') ?? ''
  const prevStageExit = section?.style.getPropertyValue('--merge-stage-exit') ?? ''
  if (section) {
    section.style.setProperty('--merge-exit-y', '0px')
    section.style.setProperty('--merge-exit-scale', '1')
    section.style.setProperty('--merge-stage-exit', '0')
  }

  const stickyRect = sticky.getBoundingClientRect()
  const stageRect = stage.getBoundingClientRect()

  if (section) {
    if (prevExitY) section.style.setProperty('--merge-exit-y', prevExitY)
    else section.style.removeProperty('--merge-exit-y')
    if (prevExitScale) section.style.setProperty('--merge-exit-scale', prevExitScale)
    else section.style.removeProperty('--merge-exit-scale')
    if (prevStageExit) section.style.setProperty('--merge-stage-exit', prevStageExit)
    else section.style.removeProperty('--merge-stage-exit')
  }

  rayOriginX = stageRect.left - stickyRect.left + stageRect.width * 0.5
  rayOriginY = stageRect.top - stickyRect.top + stageRect.height * 0.5
  clipW = stickyRect.width
  clipH = stickyRect.height

  const ox = `${rayOriginX}px`
  const oy = `${rayOriginY}px`
  if (lastRayOx !== ox) {
    sticky.style.setProperty('--ray-ox', ox)
    lastRayOx = ox
  }
  if (lastRayOy !== oy) {
    sticky.style.setProperty('--ray-oy', oy)
    lastRayOy = oy
  }
}

function hideMergeVector(index: number, vector: HTMLElement) {
  if (lastVectorOpacity[index] !== '0') {
    vector.style.opacity = '0'
    lastVectorOpacity[index] = '0'
  }
  if (lastVectorTransform[index] !== VECTOR_HIDDEN_TRANSFORM) {
    vector.style.transform = VECTOR_HIDDEN_TRANSFORM
    lastVectorTransform[index] = VECTOR_HIDDEN_TRANSFORM
  }
}

function mergeProgress(p: number) {
  return smoothstep((p - 0.22) / 0.58)
}

function appMergeProgress(app: MockApp, p: number) {
  return smoothstep((p - 0.24 - app.delay * 0.008) / 0.52)
}

function appMotion(app: MockApp, p: number, finale: number, now: number) {
  const merge = appMergeProgress(app, p)
  const unmerged = 1 - merge
  const orbitBreath = 1 + Math.sin(now * 0.0009 + app.delay * 0.74) * 0.012 * unmerged
  const pointerDriftX = (pointerX - 50) * app.depth * 0.28 * unmerged
  const pointerDriftY = (pointerY - 50) * app.depth * 0.22 * unmerged
  const floatX = Math.cos(now * 0.0011 + app.delay) * 3.5 * unmerged
  const floatY = Math.sin(now * 0.0014 + app.delay * 0.8) * 6 * unmerged
  const orbitXScale = mobileMergeLayout ? 0.68 : 1
  const orbitYScale = mobileMergeLayout ? 0.8 : 1
  const x = (app.x * stageScale * orbitXScale * orbitBreath + pointerDriftX + floatX) * unmerged
  const y = (app.y * stageScale * orbitYScale * orbitBreath + pointerDriftY + floatY) * unmerged
  const scale = 0.98 - merge * 0.46 + finale * 0.035
  const rotate = app.rotate * unmerged + (pointerX - 50) * 0.03 * app.depth * unmerged

  return { merge, x, y, scale, rotate }
}

function appVisual(app: MockApp, p: number, finale: number, now: number) {
  const motion = appMotion(app, p, finale, now)
  const fade = smoothstep((p - 0.67) / 0.22)
  const collapseFade = smoothstep((motion.merge - 0.58) / 0.3)
  const opacity = 0.98 * (1 - Math.max(fade * 0.94, collapseFade * 0.9))
  const iconSpinIntro = reduceMotion ? 0 : smootherstep((motion.merge - 0.42) / 0.42)
  return { ...motion, opacity, spinDeg: logoSpinDegrees(iconSpinIntro) }
}

function poseAt(index: number) {
  const pose = lastBodyPose[index]
  if (pose) return pose
  const created = { x: 0, y: 0, spin: 0 }
  lastBodyPose[index] = created
  return created
}

function publishMergePhysics(now: number) {
  if (!isVisible || reduceMotion) {
    if (bodiesArmed) {
      resetMergeParticleField()
      bodiesArmed = false
      lastPublishAt = 0
    }
    return
  }

  const stage = stageRef.value
  if (!stage) return

  const rect = stage.getBoundingClientRect()
  const originX = rect.left + rect.width / 2
  const originY = rect.top + rect.height / 2
  const dt = lastPublishAt === 0 ? 16 : Math.min(now - lastPublishAt, 48)
  lastPublishAt = now

  const iconSize = mobileMergeLayout ? 64 : 76
  const merge = mergeProgress(scrollP)
  const logoIntro = reduceMotion ? 1 : logoIntroProgress(scrollP)
  const logoExit = reduceMotion ? 0 : smoothstep((scrollP - 0.992) / 0.008)

  mockApps.forEach((app, index) => {
    const visual = appVisual(app, scrollP, 0, now)
    coreState.icons[index] = mergeCoreIconEnergy(visual.merge, logoIntro)
    const x = originX + visual.x
    const y = originY + visual.y
    const next = { x, y, spin: visual.spinDeg }
    const previous = poseAt(index)
    const vel = bodiesArmed ? mergeBodyVelocity(previous, next, dt) : { vx: 0, vy: 0, spin: 0 }
    previous.x = x
    previous.y = y
    previous.spin = visual.spinDeg
    publishMergeBody(index, {
      cx: x,
      cy: y,
      radius: (iconSize * visual.scale) / 2,
      vx: vel.vx,
      vy: vel.vy,
      spin: vel.spin,
      strength: visual.opacity,
    })
  })

  const logoSpin = logoSpinDegrees(logoIntro)
  const logoSize = mobileMergeLayout ? 126 : 156
  const logoScale = 0.62 + logoIntro * 0.44
  const logoNext = { x: originX, y: originY, spin: logoSpin }
  const logoPrevious = poseAt(MERGE_LOGO_INDEX)
  const logoVel = bodiesArmed
    ? mergeBodyVelocity(logoPrevious, logoNext, dt)
    : { vx: 0, vy: 0, spin: 0 }
  logoPrevious.x = originX
  logoPrevious.y = originY
  logoPrevious.spin = logoSpin
  publishMergeBody(MERGE_LOGO_INDEX, {
    cx: originX,
    cy: originY,
    radius: (logoSize * logoScale) / 2,
    vx: logoVel.vx,
    vy: logoVel.vy,
    spin: logoVel.spin,
    strength: logoIntro * (1 - logoExit),
  })

  const storm = mergeStormFromProgress(merge, logoIntro, logoExit)
  publishMergeStorm(storm)
  publishMergeWell({
    cx: originX,
    cy: originY,
    strength: Math.max(storm.tornado, storm.burst, storm.settle),
  })

  const stageExit = reduceMotion ? 0 : smoothstep((scrollP - 0.986) / 0.014)
  const phase = mergeCoreFromProgress(merge, logoIntro, 1 - (1 - logoExit) * (1 - stageExit * 0.92))
  coreState.charge = phase.charge
  coreState.ignite = phase.ignite
  coreState.flash = phase.flash
  coreState.fade = phase.fade
  coreState.tiltX = (pointerX - 50) / 50
  coreState.tiltY = (pointerY - 50) / 50
  publishMergeCore(coreState)

  bodiesArmed = true
}

function applyAppStyles(app: MockApp, index: number, p: number, finale: number, now: number) {
  const motion = appVisual(app, p, finale, now)
  const merge = motion.merge
  const opacity = motion.opacity
  const fade = smoothstep((p - 0.67) / 0.22)
  const icon = iconEls[index]

  if (icon) {
    const iconOpacityStr = String(opacity)
    const iconTransformStr = `translate3d(calc(-50% + ${motion.x}px), calc(-50% + ${motion.y}px), 0) rotate(${motion.rotate}deg) scale(${motion.scale})`
    const iconZStr = String(Math.round(20 + app.depth * 10 - merge * 5))
    const iconSpinStr = `${motion.spinDeg}deg`
    if (lastIconOpacity[index] !== iconOpacityStr) {
      icon.style.opacity = iconOpacityStr
      lastIconOpacity[index] = iconOpacityStr
    }
    if (lastIconTransform[index] !== iconTransformStr) {
      icon.style.transform = iconTransformStr
      lastIconTransform[index] = iconTransformStr
    }
    if (lastIconZ[index] !== iconZStr) {
      icon.style.zIndex = iconZStr
      lastIconZ[index] = iconZStr
    }
    if (lastIconSpin[index] !== iconSpinStr) {
      icon.style.setProperty('--app-spin', iconSpinStr)
      lastIconSpin[index] = iconSpinStr
    }
  }

  const caption = captionEls[index]
  if (caption) {
    const captionOpacity = clamp(1 - merge * 1.65) * (1 - fade * 0.88)
    const captionY = motion.y + 50 + merge * 12
    const captionScale = 0.98 - merge * 0.16

    const captionOpacityStr = String(captionOpacity)
    const captionTransformStr = `translate3d(calc(-50% + ${motion.x}px), ${captionY}px, 0) rotate(${motion.rotate}deg) scale(${captionScale})`
    if (lastCaptionOpacity[index] !== captionOpacityStr) {
      caption.style.opacity = captionOpacityStr
      lastCaptionOpacity[index] = captionOpacityStr
    }
    if (lastCaptionTransform[index] !== captionTransformStr) {
      caption.style.transform = captionTransformStr
      lastCaptionTransform[index] = captionTransformStr
    }
  }

  const vector = vectorEls[index]
  if (!vector) return

  const show = smoothstep((p - 0.015 - app.delay * 0.003) / 0.12)
  const dissolve = smootherstep((merge - 0.48) / 0.44)
  const finaleFade = smootherstep((p - 0.78) / 0.2)
  const rayFade = 1 - Math.max(dissolve, finaleFade)
  const alpha = show * rayFade * (0.5 + merge * 0.16)
  const len = Math.hypot(motion.x, motion.y)

  if (len > 0.5) {
    lastRayDirX[index] = motion.x / len
    lastRayDirY[index] = motion.y / len
  }

  const unitX = lastRayDirX[index] || 0
  const unitY = lastRayDirY[index] || 0

  if (show < 0.004 || rayFade < 0.004 || alpha < 0.004 || clipW < 1 || clipH < 1 || (unitX === 0 && unitY === 0)) {
    hideMergeVector(index, vector)
    return
  }

  const angle = Math.atan2(unitY, unitX) * 180 / Math.PI
  const startGap = 62 + merge * 22
  const startX = unitX * startGap
  const startY = unitY * startGap
  const lineLen = rayDissolvedLength(rayRectVisibleLength(
    rayOriginX + startX,
    rayOriginY + startY,
    unitX,
    unitY,
    0,
    0,
    clipW,
    clipH,
  ))
  const drawn = lineLen * show

  if (drawn < 0.5) {
    hideMergeVector(index, vector)
    return
  }

  // Spark stays on the logo→icon span. The beam continues toward the
  // faded site edge, so a 0–1 left on the scaled 1px line would fly off.
  const iconSpan = Math.max(0, len - startGap - 46 * motion.scale)
  const sparkTravel = clamp(0.15 + merge * 0.78 + Math.sin(now * 0.003 + app.delay) * 0.05)
  const sparkOpacity = show * rayFade * (0.42 + merge * 0.48)
  const sparkXStr = `${sparkTravel * iconSpan / lineLen}px`
  const sparkOpacityStr = String(sparkOpacity)
  const vectorAlphaStr = String(alpha)
  const rayLenStr = String(drawn)
  const vectorTransformStr = `translate3d(${startX}px, ${startY}px, 0) rotate(${angle}deg) scaleX(${drawn})`
  if (lastVectorLen[index] !== rayLenStr) {
    vector.style.setProperty('--ray-len', rayLenStr)
    lastVectorLen[index] = rayLenStr
  }
  if (lastVectorSparkX[index] !== sparkXStr) {
    vector.style.setProperty('--spark-x', sparkXStr)
    lastVectorSparkX[index] = sparkXStr
  }
  if (lastVectorSparkOpacity[index] !== sparkOpacityStr) {
    vector.style.setProperty('--spark-opacity', sparkOpacityStr)
    lastVectorSparkOpacity[index] = sparkOpacityStr
  }
  if (lastVectorOpacity[index] !== vectorAlphaStr) {
    vector.style.opacity = vectorAlphaStr
    lastVectorOpacity[index] = vectorAlphaStr
  }
  if (lastVectorTransform[index] !== vectorTransformStr) {
    vector.style.transform = vectorTransformStr
    lastVectorTransform[index] = vectorTransformStr
  }
}

function applyLiftagStyle(merge: number, logoIntro: number, exitLogo: number) {
  const liftag = liftagRef.value
  if (!liftag) return

  const spin = logoSpinDegrees(logoIntro)
  const tiltX = -(pointerY - 50) * 0.035 * (0.2 + merge)
  const tiltY = (pointerX - 50) * 0.04 * (0.2 + merge)
  const scale = 0.62 + logoIntro * 0.44

  const spinStr = `${spin}deg`
  const opacityStr = String(logoIntro * (1 - exitLogo))
  const transformStr = `translate3d(-50%, -50%, 0) perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scale})`
  if (lastLogoSpin !== spinStr) {
    liftag.style.setProperty('--logo-spin', spinStr)
    lastLogoSpin = spinStr
  }
  if (lastLogoOpacity !== opacityStr) {
    liftag.style.opacity = opacityStr
    lastLogoOpacity = opacityStr
  }
  if (lastLogoTransform !== transformStr) {
    liftag.style.transform = transformStr
    lastLogoTransform = transformStr
  }
}

function updateAnimatedStyles(now = performance.now()) {
  const merge = mergeProgress(scrollP)
  const logoIntro = reduceMotion ? 1 : logoIntroProgress(scrollP)
  const exit = reduceMotion ? 0 : smoothstep((scrollP - 0.975) / 0.025)
  const copyEyebrowExit = reduceMotion ? 0 : smoothstep((scrollP - 0.952) / 0.04)
  const copyTitleExit = reduceMotion ? 0 : smoothstep((scrollP - 0.958) / 0.036)
  const copyTextExit = reduceMotion ? 0 : smoothstep((scrollP - 0.964) / 0.03)
  const stageExit = reduceMotion ? 0 : smoothstep((scrollP - 0.986) / 0.014)
  const logoExit = reduceMotion ? 0 : smoothstep((scrollP - 0.992) / 0.008)
  const bgExit = reduceMotion ? 0 : smoothstep((scrollP - 0.966) / 0.034)
  const section = sectionRef.value

  if (section) {
    const mergeCss = Math.round(merge * 200) / 200
    const finaleCss = Math.round(logoIntro * 200) / 200
    const exitCss = Math.round(exit * 200) / 200
    const copyEyebrowExitCss = Math.round(copyEyebrowExit * 200) / 200
    const copyTitleExitCss = Math.round(copyTitleExit * 200) / 200
    const copyTextExitCss = Math.round(copyTextExit * 200) / 200
    const stageExitCss = Math.round(stageExit * 200) / 200
    const bgExitCss = Math.round(bgExit * 200) / 200

    if (mergeCss !== lastMergeCss) {
      section.style.setProperty('--merge-p', String(mergeCss))
      lastMergeCss = mergeCss
    }

    if (finaleCss !== lastFinaleCss) {
      section.style.setProperty('--finale-p', String(finaleCss))
      lastFinaleCss = finaleCss
    }

    const exitVarsKey = `${exitCss}|${copyEyebrowExitCss}|${copyTitleExitCss}|${copyTextExitCss}|${stageExitCss}|${bgExitCss}`
    if (exitVarsKey !== lastExitVarsKey) {
      section.style.setProperty('--merge-exit-p', String(exitCss))
      section.style.setProperty('--merge-exit-y', `${exitCss * -220}px`)
      section.style.setProperty('--merge-exit-scale', String(1 - exitCss * 0.02))
      section.style.setProperty('--merge-copy-eyebrow-exit', String(copyEyebrowExitCss))
      section.style.setProperty('--merge-copy-title-exit', String(copyTitleExitCss))
      section.style.setProperty('--merge-copy-text-exit', String(copyTextExitCss))
      section.style.setProperty('--merge-stage-exit', String(stageExitCss))
      section.style.setProperty('--merge-bg-exit', String(bgExitCss))
      lastExitVarsKey = exitVarsKey
    }
  }

  mockApps.forEach((app, index) => applyAppStyles(app, index, scrollP, 0, now))
  applyLiftagStyle(merge, logoIntro, logoExit)
  publishMergePhysics(now)
}

function tick(now: number) {
  if (!isVisible && Math.abs(targetP - scrollP) < 0.001) return

  targetP = reduceMotion ? (isVisible ? 1 : targetP) : getScrollProgress()
  const ease = reduceMotion ? 1 : 0.12
  scrollP = lerp(scrollP, targetP, ease)
  pointerX = lerp(pointerX, targetPointerX, 0.16)
  pointerY = lerp(pointerY, targetPointerY, 0.16)
  updateAnimatedStyles(now)

  rafId = requestAnimationFrame(tick)
}

// Vue :style must not own transform/opacity/z-index. Those are written
// every frame by rAF; a re-render that puts the unscaled orbit back on
// the icons is the merge-section flicker, and the last-applied cache
// then refuses to write the same string back.
function iconBaseStyle(app: MockApp) {
  return {
    '--icon-gradient': app.gradient,
    '--icon-accent': app.accent,
    '--icon-glow': app.glow,
  }
}

const captionBaseStyle = {
  left: '50%',
  top: '50%',
  zIndex: '43',
}

function vectorBaseStyle(app: MockApp) {
  return {
    '--line-glow': app.glow,
  }
}

function handlePointerMove(event: PointerEvent) {
  targetPointerX = clamp(event.clientX / Math.max(window.innerWidth, 1), 0, 1) * 100
  targetPointerY = clamp(event.clientY / Math.max(window.innerHeight, 1), 0, 1) * 100
}

function handlePointerLeave() {
  targetPointerX = 50
  targetPointerY = 50
}

onMounted(() => {
  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  mergeMobileMql = window.matchMedia('(max-width: 768px)')
  isMobileParticles.value = mergeMobileMql.matches
  onMergeMobileChange = (event) => {
    isMobileParticles.value = event.matches
  }
  mergeMobileMql.addEventListener('change', onMergeMobileChange)
  updateStageScale()
  cacheRayLayout()
  getScrollProgress()
  updateAnimatedStyles()

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      isVisible = entry.isIntersecting
      if (isVisible) {
        cacheRayLayout()
        cancelAnimationFrame(rafId)
        rafId = requestAnimationFrame(tick)
      } else {
        publishMergeArmed(false)
        resetMergeParticleField()
        bodiesArmed = false
        lastPublishAt = 0
      }
    })
  }, { threshold: 0 })

  if (sectionRef.value) observer.observe(sectionRef.value)

  if (typeof ResizeObserver !== 'undefined') {
    stageResizeObserver = new ResizeObserver(() => {
      updateStageScale()
      cacheRayLayout()
      updateAnimatedStyles()
    })
    if (stageRef.value) stageResizeObserver.observe(stageRef.value)
    if (stickyRef.value) stageResizeObserver.observe(stickyRef.value)
  }
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  observer?.disconnect()
  stageResizeObserver?.disconnect()
  if (mergeMobileMql && onMergeMobileChange) {
    mergeMobileMql.removeEventListener('change', onMergeMobileChange)
  }
  publishMergeArmed(false)
  resetMergeParticleField()
})
</script>

<template>
  <section
    id="all-in-one"
    ref="sectionRef"
    class="app-merge-section"
    @pointermove="handlePointerMove"
    @pointerleave="handlePointerLeave"
  >
    <div ref="stickyRef" class="app-merge-sticky">
      <div class="merge-background" aria-hidden="true">
        <div class="merge-background-grid"></div>
        <div class="merge-background-pulse pulse-one"></div>
        <div class="merge-background-pulse pulse-two"></div>
        <MergeParticles
          :key="isMobileParticles ? 'merge-particles-m' : 'merge-particles-d'"
          :count="isMobileParticles ? 140 : 320"
          :interactive="!isMobileParticles"
          :dpr-cap="isMobileParticles ? 1.15 : 1.25"
        />
      </div>

      <div class="merge-ray-layer" aria-hidden="true">
        <div
          v-for="(app, i) in mockApps"
          :key="`${app.key}-line`"
          :ref="(el) => setVectorRef(el, i)"
          class="merge-vector"
          :style="vectorBaseStyle(app)"
        ></div>
      </div>

      <MergeBurstHalo />
      <MergePrismaticBurst />

      <div class="container app-merge-layout">
        <div class="merge-copy">
          <Eyebrow class="merge-copy-eyebrow">▸ ONE APP INSTEAD OF EIGHT</Eyebrow>
          <SectionTitle class="merge-copy-title" :max="560">
            All the little gym apps, <span class="lime">folded into LIFTAG.</span>
          </SectionTitle>
          <p class="merge-copy-text reveal">
            Set logging, rest timing, PRs, body metrics, form guides, progress charts, and routines finally live in one place.
          </p>
        </div>

        <div ref="stageRef" class="merge-stage" aria-label="Mock fitness apps merging into LIFTAG">
          <div class="merge-rings" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <MergePrismCore :icons="prismIcons" />

          <div
            v-for="(app, i) in mockApps"
            :key="app.key"
            :ref="(el) => setIconRef(el, i)"
            class="mergeable-app"
            :style="iconBaseStyle(app)"
          >
            <div :class="['mock-icon', `mock-icon--${app.key}`]">
              <svg
                :class="['mock-icon-glyph', `mock-icon-glyph--${app.key}`]"
                viewBox="0 0 48 48"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <g v-if="app.key === 'set'">
                  <rect x="12" y="9" width="24" height="30" rx="7" stroke-width="3.8" />
                  <path d="M19 18h10M19 25h10" stroke-width="3.8" />
                  <path d="M20 33.5l3.1 3.1 6.4-7.2" stroke-width="3" />
                </g>
                <g v-else-if="app.key === 'timer'">
                  <circle cx="24" cy="26" r="14" stroke-width="4" />
                  <path d="M24 26l8-8" stroke-width="4.4" />
                  <path d="M18 8h12M24 8v5" stroke-width="4" />
                </g>
                <g v-else-if="app.key === 'stopwatch'">
                  <circle cx="24" cy="27" r="14" stroke-width="4" />
                  <path d="M24 27V16M24 27h9" stroke-width="4.2" />
                  <path d="M18 8h12M24 8v5" stroke-width="4" />
                </g>
                <g v-else-if="app.key === 'guides'">
                  <rect x="10" y="11" width="28" height="26" rx="8" stroke-width="4" />
                  <path d="M19.5 17.5l14.5 6.5-14.5 6.5v-13Z" stroke-width="3.5" />
                </g>
                <g v-else-if="app.key === 'planner'">
                  <rect x="10" y="12" width="28" height="26" rx="7" stroke-width="4" />
                  <path d="M16 9v7M32 9v7M12 21h24" stroke-width="3.6" />
                  <path d="M18 29h12M18 34h8" stroke-width="3.8" />
                </g>
                <g v-else-if="app.key === 'progress'">
                  <path d="M10 37h28" stroke-width="3.6" />
                  <path d="M12 31l8-9 7 5 10-14" stroke-width="4.5" />
                  <path d="M12 31h.01M37 13h.01" stroke-width="6" />
                </g>
                <g v-else-if="app.key === 'calendar'">
                  <rect x="10" y="12" width="28" height="26" rx="6" stroke-width="4" />
                  <path d="M17 8v8M31 8v8" stroke-width="3.8" />
                  <path d="M10 21.5h28" stroke-width="3.6" />
                  <path d="M18 27h.01M24 27h.01M30 27h.01M18 33h.01M24 33h.01M30 33h.01" stroke-width="5.4" />
                </g>
                <g v-else>
                  <rect x="10" y="14" width="28" height="22" rx="8" stroke-width="4" />
                  <path d="M16 26h5l3-8 4 15 3-8h5" stroke-width="4" />
                </g>
              </svg>
            </div>
          </div>

          <div
            v-for="(app, i) in mockApps"
            :key="`${app.key}-caption`"
            :ref="(el) => setCaptionRef(el, i)"
            class="mock-app-caption"
            :style="captionBaseStyle"
          >
            <span>{{ app.name }}</span>
            <small>{{ app.replaces }}</small>
          </div>

          <div ref="liftagRef" class="liftag-target" aria-label="LIFTAG app icon">
            <div class="prism-rim liftag-icon-rim" aria-hidden="true"></div>
            <div class="liftag-icon-shell">
              <img src="/logo.svg" alt="LIFTAG" />
              <div class="liftag-icon-sheen"></div>
            </div>
            <div class="liftag-target-label">
              <span>LIFTAG</span>
              <small>all-in-one gym OS</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.app-merge-section {
  --merge-p: 0;
  --finale-p: 0;
  --merge-exit-p: 0;
  --merge-exit-y: 0px;
  --merge-exit-scale: 1;
  --merge-copy-eyebrow-exit: 0;
  --merge-copy-title-exit: 0;
  --merge-copy-text-exit: 0;
  --merge-stage-exit: 0;
  --merge-bg-exit: 0;
  position: relative;
  min-height: 540vh;
  background: #000;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.app-merge-sticky {
  --ray-ox: 50%;
  --ray-oy: 50%;
  position: sticky;
  top: 0;
  height: 100vh;
  min-height: 760px;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.merge-ray-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;
  pointer-events: none;
  contain: paint;
}

.merge-background {
  position: absolute;
  inset: 0;
  pointer-events: none;
  isolation: isolate;
  opacity: calc(1 - var(--merge-bg-exit) * 0.7);
  background:
    radial-gradient(520px circle at 66% 48%, rgba(204, 255, 0, calc(0.04 + var(--merge-p) * 0.08)), transparent 64%),
    radial-gradient(720px circle at 72% 50%, rgba(204, 255, 0, calc(0.05 + var(--merge-p) * 0.12)), transparent 68%),
    radial-gradient(580px circle at 20% 65%, rgba(255, 45, 85, 0.045), transparent 70%);
  transform: translate3d(0, calc(var(--merge-exit-y) * 0.24), 0);
  will-change: opacity, transform;
}

.merge-background-grid {
  position: absolute;
  inset: -20%;
  opacity: calc(0.22 + var(--merge-p) * 0.16);
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: radial-gradient(circle at 65% 50%, #000 0%, transparent 68%);
  transform: perspective(900px) rotateX(62deg) translateY(calc(var(--merge-p) * -70px));
}

.merge-background-pulse {
  position: absolute;
  top: 50%;
  left: 66%;
  width: 520px;
  aspect-ratio: 1;
  border-radius: 50%;
  border: 1px solid rgba(204, 255, 0, 0.18);
  box-shadow:
    0 0 30px rgba(204, 255, 0, 0.08),
    inset 0 0 30px rgba(204, 255, 0, 0.04);
  transform: translate(-50%, -50%) scale(calc(0.85 + var(--merge-p) * 0.35));
  opacity: calc(0.24 + var(--merge-p) * 0.48);
}

.pulse-two {
  width: 760px;
  opacity: calc(0.12 + var(--merge-p) * 0.26);
  transform: translate(-50%, -50%) scale(calc(0.72 + var(--merge-p) * 0.45));
}

.app-merge-layout {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(300px, 0.82fr) minmax(540px, 1.18fr);
  gap: clamp(40px, 6vw, 92px);
  align-items: center;
  width: 100%;
  transform: translate3d(0, var(--merge-exit-y), 0) scale(var(--merge-exit-scale));
  transform-origin: center center;
  will-change: transform;
}

.merge-copy {
  max-width: 620px;
}

.app-merge-section .merge-copy-eyebrow,
.app-merge-section .merge-copy-title,
.app-merge-section .merge-copy-text,
.app-merge-section .merge-stage {
  will-change: opacity, transform;
}

.app-merge-section .merge-copy-eyebrow {
  opacity: calc(1 - var(--merge-copy-eyebrow-exit));
  transform: translate3d(0, calc(var(--merge-copy-eyebrow-exit) * -22px), 0);
}

.app-merge-section .merge-copy-title {
  opacity: calc(1 - var(--merge-copy-title-exit));
  transform: translate3d(0, calc(var(--merge-copy-title-exit) * -34px), 0);
}

.app-merge-section .merge-copy-text {
  max-width: 520px;
  margin: 28px 0 0;
  color: rgba(255, 255, 255, 0.62);
  font-size: 17px;
  font-weight: 300;
  line-height: 1.6;
  opacity: calc(1 - var(--merge-copy-text-exit));
  transform: translate3d(0, calc(var(--merge-copy-text-exit) * -26px), 0);
}

.app-merge-section .merge-stage {
  position: relative;
  height: 690px;
  min-height: 590px;
  isolation: isolate;
  transform-style: preserve-3d;
  contain: layout paint style;
  opacity: calc(1 - var(--merge-stage-exit) * 0.88);
  transform: translate3d(0, calc(var(--merge-stage-exit) * -56px), 0);
}

.merge-rings {
  position: absolute;
  inset: 0;
  pointer-events: none;
  transform: translateZ(0);
}

.merge-rings span {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 290px;
  aspect-ratio: 1;
  border-radius: 50%;
  border: 1px solid rgba(204, 255, 0, 0.12);
  box-shadow: inset 0 0 40px rgba(204, 255, 0, 0.035);
  transform: translate(-50%, -50%) scale(calc(0.724 + var(--merge-p) * 0.276));
  opacity: calc(0.22 + var(--merge-p) * 0.44);
}

.merge-rings span:nth-child(2) {
  width: 480px;
  border-color: rgba(255, 255, 255, 0.08);
  transform: translate(-50%, -50%) scale(calc(0.813 + var(--merge-p) * 0.187));
  opacity: calc(0.16 + var(--merge-p) * 0.3);
}

.merge-rings span:nth-child(3) {
  width: 650px;
  border-color: rgba(255, 45, 85, 0.12);
  transform: translate(-50%, -50%) scale(calc(0.862 + var(--merge-p) * 0.138));
  opacity: calc(0.1 + var(--merge-p) * 0.22);
}

.merge-vector {
  position: absolute;
  top: var(--ray-oy);
  left: var(--ray-ox);
  width: 1px;
  height: 3px;
  pointer-events: none;
  opacity: 0;
  transform-origin: 0 50%;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(204, 255, 0, 0.58) 8%,
    var(--line-glow) 34%,
    transparent 100%
  );
  mix-blend-mode: screen;
  will-change: transform, opacity;
}

.merge-vector::after {
  content: '';
  position: absolute;
  top: 50%;
  left: var(--spark-x, 0);
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--liftag-primary);
  box-shadow:
    0 0 12px rgba(204, 255, 0, 0.9),
    0 0 28px var(--line-glow);
  opacity: var(--spark-opacity, 0);
  transform:
    translate(-50%, -50%)
    scaleX(calc(1 / max(var(--ray-len, 1), 0.001)))
    scale(calc(0.72 + var(--merge-p) * 0.34));
}

.mergeable-app {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  pointer-events: none;
  opacity: 0;
  contain: layout style;
  overflow: visible;
  will-change: transform, opacity;
  transform-origin: center;
}

.mock-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 76px;
  height: 76px;
  border-radius: 20px;
  display: grid;
  place-items: center;
  color: rgba(255, 255, 255, 0.94);
  background: var(--icon-gradient);
  border: 1px solid rgba(255, 255, 255, 0.28);
  box-shadow:
    0 18px 42px rgba(0, 0, 0, 0.44),
    0 0 22px var(--icon-glow),
    inset 0 1px 1px rgba(255, 255, 255, 0.44),
    inset 0 -18px 30px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  transform: translate(-50%, -50%);
  transform-origin: center;
  backface-visibility: hidden;
  contain: paint;
}

.mock-icon-glyph {
  position: relative;
  z-index: 2;
  width: 54px;
  height: 54px;
  color: currentColor;
  stroke-width: 3.2px;
  opacity: 1;
  transform: rotate(var(--app-spin, 0deg));
  transform-box: fill-box;
  transform-origin: center;
  will-change: transform;
}

.mock-icon-glyph * {
  vector-effect: non-scaling-stroke;
}

.mock-app-caption {
  position: absolute;
  top: 50%;
  left: 50%;
  box-sizing: border-box;
  width: 118px;
  text-align: center;
  padding: 7px 8px;
  border-radius: 12px;
  background: rgba(6, 6, 6, 0.58);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.34);
  contain: layout paint style;
  will-change: transform, opacity;
  opacity: 0;
  transform: translate(
    calc(-50% + var(--label-x, 0px)),
    calc(-50% + var(--label-y, 72px) + var(--caption-y, 0px))
  );
  transition: none;
  transform-origin: 50% 0;
  white-space: normal;
}

.mock-app-caption span,
.liftag-target-label span {
  display: block;
  font-family: var(--liftag-font-headline);
  font-size: 12px;
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.01em;
  color: #fff;
}

.mock-app-caption small,
.liftag-target-label small {
  display: block;
  margin-top: 5px;
  font-family: var(--liftag-font-mono);
  font-size: 7.5px;
  font-weight: 700;
  letter-spacing: 0.12em;
  line-height: 1.1;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
}

.liftag-target {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  will-change: transform, opacity;
  contain: layout style;
  transform-style: preserve-3d;
  z-index: 44;
  pointer-events: none;
  opacity: 0;
}

/* Shared .prism-rim (assets/css/main.css) supplies the fringe and the spin.
   The rim cannot use the shared `inset` here: .liftag-target is a flex column
   taller than the shell, so the box is pinned to the shell explicitly. */
.liftag-icon-rim {
  inset: auto;
  top: -4.5px;
  left: 50%;
  width: 165px;
  height: 165px;
  margin-left: -82.5px;
  --prism-radius: 38.5px;
  /* Charges in with the logo, flares at the burst, then settles to a steady
     glow instead of running at full strength for the rest of the section.
     This ramp is specific to the merge beat, so it stays local. */
  --prism-strength: calc(
    clamp(0, var(--finale-p, 0) / 0.28, 1) *
    clamp(0.5, 1 - (var(--finale-p, 0) - 0.34) * 0.72, 1)
  );
}

.liftag-icon-shell {
  width: 156px;
  height: 156px;
  border-radius: 34px;
  position: relative;
  z-index: 1;
  overflow: hidden;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 30% 18%, rgba(255, 255, 255, 0.18), transparent 34%),
    linear-gradient(145deg, #171717 0%, #020202 48%, #090909 100%);
  border: 1px solid rgba(204, 255, 0, calc(0.16 + var(--merge-p) * 0.34));
  box-shadow:
    0 32px 90px rgba(0, 0, 0, 0.64),
    0 0 calc(22px + var(--merge-p) * 30px) rgba(204, 255, 0, calc(0.12 + var(--merge-p) * 0.2)),
    inset 0 1px 2px rgba(255, 255, 255, 0.28),
    inset 0 -28px 48px rgba(0, 0, 0, 0.5);
}

.liftag-icon-shell img {
  width: 73%;
  height: 73%;
  object-fit: contain;
  /* Per-frame drop-shadow on a rotating image was a major paint cost.
     The shell's outer box-shadow already provides the lime halo; a single
     small drop-shadow keeps the logo readable on top of bright shells. */
  filter: drop-shadow(0 0 10px rgba(204, 255, 0, 0.25));
  transform: rotate(var(--logo-spin, 0deg)) scale(calc(0.92 + var(--finale-p) * 0.05));
  transform-origin: center;
  will-change: transform;
}

.liftag-icon-sheen {
  position: absolute;
  inset: -40% -80% auto;
  height: 86%;
  background: linear-gradient(115deg, transparent 24%, rgba(255, 255, 255, 0.28), transparent 58%);
  transform: translateX(calc(-20% + var(--merge-p) * 105%)) rotate(8deg);
  opacity: calc(0.18 + var(--merge-p) * 0.5);
}

/* Out of flow on purpose. The rings, the burst halo and the prism core are all
   centred on the stage centre, and .liftag-target is centred by its own
   translate(-50%, -50%) - so while the label was an in-flow sibling it grew the
   column and pushed the icon above that shared centre. Absolute keeps the
   column the height of the shell alone, which is the thing that has to line up. */
.liftag-target-label {
  position: absolute;
  top: 100%;
  left: 50%;
  margin-top: 18px;
  transform: translateX(-50%);
  z-index: 2;
  text-align: center;
  padding: 0;
  border-radius: 0;
  background: transparent;
  border: 0;
  box-shadow: none;
  white-space: nowrap;
  opacity: calc(0.4 + var(--merge-p) * 0.6);
}

@media (max-width: 980px) {
  .app-merge-section {
    min-height: var(--liftag-stable-vh-470);
  }

  .app-merge-sticky {
    height: var(--liftag-stable-vh);
    min-height: 880px;
  }

  .app-merge-layout {
    grid-template-columns: 1fr;
    gap: 34px;
    align-content: center;
  }

  .merge-copy {
    max-width: 620px;
  }

  .app-merge-section .merge-copy-text {
    max-width: 560px;
    font-size: 16px;
  }

  .app-merge-section .merge-stage {
    height: 500px;
    min-height: 500px;
  }

  .merge-background-pulse {
    left: 50%;
  }
}

@media (max-width: 620px) {
  .app-merge-section {
    min-height: var(--liftag-stable-vh-380);
  }

  .app-merge-sticky {
    min-height: 0;
  }

  .app-merge-layout {
    gap: clamp(8px, 2vh, 18px);
  }

  .app-merge-section .merge-copy-text {
    margin-top: 14px;
    font-size: 14px;
    line-height: 1.45;
  }

  .app-merge-section .merge-stage {
    height: clamp(290px, var(--liftag-stable-vh-39), 360px);
    min-height: 290px;
  }

  .merge-rings span {
    width: 178px;
    height: 250px;
    aspect-ratio: auto;
    border-radius: 50%;
  }

  .merge-rings span:nth-child(2) {
    width: 246px;
    height: 340px;
  }

  .merge-rings span:nth-child(3) {
    width: 310px;
    height: 430px;
  }

  .mock-icon {
    width: 64px;
    height: 64px;
    border-radius: 17px;
  }

  .mock-icon-glyph {
    width: 38px;
    height: 38px;
  }

  .mock-app-caption {
    display: none;
  }

  .liftag-icon-shell {
    width: 126px;
    height: 126px;
    border-radius: 28px;
  }

  .liftag-icon-rim {
    top: -3.5px;
    width: 133px;
    height: 133px;
    margin-left: -66.5px;
    --prism-radius: 31.5px;
  }

  .liftag-target-label {
    padding: 9px 12px;
  }
}

@media (max-width: 620px) and (max-height: 700px) {
  .app-merge-layout {
    padding-top: 16px;
  }

  .app-merge-section .merge-copy-eyebrow {
    display: none !important;
  }
}

@media (max-width: 620px) and (max-height: 600px) {
  .app-merge-layout {
    gap: 0;
  }

  .app-merge-section .merge-copy-text {
    display: none !important;
  }

  .app-merge-section .merge-stage {
    height: 260px;
    min-height: 260px;
  }

  .mock-icon {
    width: 58px;
    height: 58px;
    border-radius: 15px;
  }

  .mock-icon-glyph {
    width: 35px;
    height: 35px;
  }
}

</style>
