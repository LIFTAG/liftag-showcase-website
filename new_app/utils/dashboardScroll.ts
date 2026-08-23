import type { ScreenVideoSegment } from './screenVideo'

export type DashboardScrollState = {
  open: number
  zoom: number
  chrome: number
  blend: number
  chapter: number
  chapterProgress: number
  spine: number
  coach: number
  exit: number
}

export type DashboardAct = 'gym' | 'coach'

export type DashboardChapter = {
  act: DashboardAct
  index: number
  n: string
  tag: string
  title: string
  layer: DashboardAct
  footage: ScreenVideoSegment
}

/**
 * One pinned section, two acts, six chapters.
 *
 * Act 1 is the gym dashboard: the lid opens, the page chrome clears, and the
 * camera punches into the screen. The locked window is then a protocol of
 * named beats - three gym chapters, then three coach chapters - each owning a
 * slice of scroll and a slice of the matching recording. Act 2 un-zooms into
 * the coach rest pose once the last chapter has been passed.
 *
 * There is deliberately one MacBook and one WebGL context across both acts.
 * Every boundary below is a scroll fraction of the same sticky section, so the
 * handoff is a continuous shot rather than a cut between two components.
 */
export const DASHBOARD_JOURNEY = {
  closedEnd: 0.040,
  openEnd: 0.175,
  chromeEnd: 0.220,
  zoomEnd: 0.285,
  chaptersEnd: 0.705,
  unzoomEnd: 0.845,
  // Halfway through the un-zoom, deliberately: the coach copy materialises
  // while the laptop is still travelling back out, so the reveal is one
  // movement rather than a camera move followed by a separate fade-in.
  coachStart: 0.775,
  coachChromeEnd: 0.890,
  exitStart: 0.930,
} as const

export const DASHBOARD_CHAPTER_COUNT = 6
export const DASHBOARD_COACH_CHAPTER = 3

export const DASHBOARD_CHAPTER_SPAN
  = (DASHBOARD_JOURNEY.chaptersEnd - DASHBOARD_JOURNEY.zoomEnd) / DASHBOARD_CHAPTER_COUNT

export function dashboardChapterStart(index: number) {
  const i = Math.max(0, Math.min(DASHBOARD_CHAPTER_COUNT - 1, index))
  return DASHBOARD_JOURNEY.zoomEnd + i * DASHBOARD_CHAPTER_SPAN
}

/** In-page hash for the first coach chapter, not TrainersSection's top. */
export const TRAINERS_HASH = '#trainers'

export const DASHBOARD_TRAINERS_AT = dashboardChapterStart(DASHBOARD_COACH_CHAPTER)

/**
 * Footage cuts, keyed to I-frames where the decoder has to seek (gym 0 / 6.6 /
 * 41.6, coach 0 / 8.33 / 14.6). Ends are allowed off-keyframe: the segment
 * controller parks there rather than seeking to them.
 */
export const DASHBOARD_CHAPTERS: DashboardChapter[] = [
  {
    act: 'gym',
    index: 0,
    n: '01',
    tag: 'LOCATIONS',
    title: 'Every gym, one place.',
    layer: 'gym',
    footage: { start: 0, end: 4.5 },
  },
  {
    act: 'gym',
    index: 1,
    n: '02',
    tag: 'MACHINES',
    title: 'The floor, the hours, the tags.',
    layer: 'gym',
    footage: { start: 6.6, end: 14.5 },
  },
  {
    act: 'gym',
    index: 2,
    n: '03',
    tag: 'CATALOG',
    title: 'Build once, deploy everywhere.',
    layer: 'gym',
    footage: { start: 41.6, end: 48.9 },
  },
  {
    act: 'coach',
    index: 3,
    n: '04',
    tag: 'SESSIONS',
    title: 'A month of training at a glance.',
    layer: 'coach',
    footage: { start: 0, end: 5.5 },
  },
  {
    act: 'coach',
    index: 4,
    n: '05',
    tag: 'BODY WEIGHT',
    title: 'The trend, not the last session.',
    layer: 'coach',
    footage: { start: 8.333, end: 14.2 },
  },
  {
    act: 'coach',
    index: 5,
    n: '06',
    tag: 'PLANS',
    title: 'Share a plan. They run it.',
    layer: 'coach',
    footage: { start: 14.6, end: 21 },
  },
]

export function dashboardChapterAt(p: number) {
  const t = clamp01(p)
  const { zoomEnd, chaptersEnd } = DASHBOARD_JOURNEY
  if (t <= zoomEnd) return { chapter: 0, chapterProgress: 0 }
  if (t >= chaptersEnd) {
    return { chapter: DASHBOARD_CHAPTER_COUNT - 1, chapterProgress: 1 }
  }

  // A 1e-9 nudge keeps exact chapter starts (which are n * span of an
  // inexact 0.42/6) from flooring to the previous beat.
  const scaled = ((t - zoomEnd) / (chaptersEnd - zoomEnd)) * DASHBOARD_CHAPTER_COUNT
  const chapter = Math.min(DASHBOARD_CHAPTER_COUNT - 1, Math.floor(scaled + 1e-9))
  return { chapter, chapterProgress: clamp01(scaled - chapter) }
}

export function isTrainersHash(hash: string | undefined | null): boolean {
  return hash === TRAINERS_HASH
}

/**
 * Document Y of the first coach chapter: the camera is locked and the footage
 * has just switched, which is `DASHBOARD_TRAINERS_AT` of the pinned runway.
 *
 * Viewport height must match DashboardSection's progress math (the published
 * `--liftag-stable-vh-px` when it is set) or the hash lands a beat early/late.
 */
export function trainerHandoffOffset(sectionHeight: number, viewportHeight: number): number {
  return DASHBOARD_TRAINERS_AT * Math.max(1, sectionHeight - viewportHeight)
}

function dashboardViewportHeight(): number {
  const cssHeight = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--liftag-stable-vh-px'),
  )
  if (Number.isFinite(cssHeight) && cssHeight > 0) return cssHeight
  return window.innerHeight
}

function dashboardRunwayReady(section: HTMLElement): boolean {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return Boolean(section.querySelector('.coach-copy-head'))
  }
  return section.getBoundingClientRect().height > dashboardViewportHeight() * 2
}

/** Scroll the window to the coach handoff. Returns false if the target is not in the DOM. */
export function scrollToTrainerHandoff(): boolean {
  const target = trainerHandoffScrollTarget()
  if (target) {
    if ('el' in target) {
      document.querySelector<HTMLElement>(target.el)?.scrollIntoView({ block: 'start' })
      return true
    }
    window.scrollTo({ top: target.top, left: target.left, behavior: target.behavior })
    return true
  }

  // Lazy sections may exist before the pinned runway has its 560vh height.
  // The `#trainers` sentinel is already placed at the first coach chapter, so
  // this is the same beat, just without the stable-vh correction.
  const sentinel = document.getElementById('trainers')
  if (!sentinel) return false
  sentinel.scrollIntoView({ block: 'start' })
  return true
}

/**
 * Vue Router / window.scrollTo payload for `#trainers`. Null while the
 * dashboard section is missing or has not taken on its pinned height yet.
 */
export function trainerHandoffScrollTarget():
  | { top: number, left: number, behavior: 'auto' }
  | { el: string, top: number, behavior: 'auto' }
  | null {
  if (typeof window === 'undefined') return null
  const section = document.getElementById('dashboard')
  if (!section || !dashboardRunwayReady(section)) return null

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Reduced motion releases the pin and stacks both acts as plain document
    // flow - the chapter spine never renders there, so land on act 2's heading.
    return {
      el: section.querySelector('.coach-copy-head') ? '.coach-copy-head' : '#dashboard',
      top: 0,
      behavior: 'auto',
    }
  }

  const rect = section.getBoundingClientRect()
  return {
    top: window.scrollY + rect.top + trainerHandoffOffset(rect.height, dashboardViewportHeight()),
    left: 0,
    behavior: 'auto',
  }
}

export function clamp01(v: number) {
  return Math.max(0, Math.min(1, v))
}

export function smoothstep(v: number) {
  const t = clamp01(v)
  return t * t * (3 - 2 * t)
}

export function smootherstep(v: number) {
  const t = clamp01(v)
  return t * t * t * (t * (t * 6 - 15) + 10)
}

function span(p: number, start: number, end: number) {
  return clamp01((p - start) / (end - start))
}

export function mapDashboardJourney(
  p: number,
  reduceMotion = false,
): DashboardScrollState {
  // Reduced motion drops the whole camera performance and shows both acts at
  // once as static blocks: lid open, no punch-in, coach footage already on the
  // screen so act 2's copy is not describing something the reader cannot see.
  if (reduceMotion) {
    return {
      open: 1,
      zoom: 0,
      chrome: 1,
      blend: 1,
      chapter: DASHBOARD_CHAPTER_COUNT - 1,
      chapterProgress: 1,
      spine: 0,
      coach: 1,
      exit: 0,
    }
  }

  const t = clamp01(p)
  const {
    closedEnd,
    openEnd,
    chromeEnd,
    zoomEnd,
    chaptersEnd,
    unzoomEnd,
    coachStart,
    coachChromeEnd,
    exitStart,
  } = DASHBOARD_JOURNEY

  const open = smoothstep(span(t, closedEnd, openEnd))

  // The only non-monotonic channel: in over openEnd..zoomEnd, locked at 1
  // through every chapter, then back out over chaptersEnd..unzoomEnd.
  const zoomIn = smootherstep(span(t, openEnd, zoomEnd))
  const zoomOut = 1 - smootherstep(span(t, chaptersEnd, unzoomEnd))
  const zoom = zoomIn * zoomOut

  const chrome = 1 - smootherstep(span(t, openEnd, chromeEnd))

  const { chapter, chapterProgress } = dashboardChapterAt(t)

  // Footage swap is a short dissolve at the start of the first coach chapter,
  // not a card covering the pixels that are changing.
  const swapStart = dashboardChapterStart(DASHBOARD_COACH_CHAPTER)
  const swapEnd = swapStart + DASHBOARD_CHAPTER_SPAN * 0.35
  const blend = smootherstep(span(t, swapStart, swapEnd))

  const spine = zoom

  const coach = smoothstep(span(t, coachStart, coachChromeEnd))

  const exit = smoothstep(span(t, exitStart, 1))

  return { open, zoom, chrome, blend, chapter, chapterProgress, spine, coach, exit }
}
