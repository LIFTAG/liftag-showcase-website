import { onBeforeUnmount } from 'vue'
import {
  finishHeroLaserWall,
  publishHeroLaserWall,
  releaseHeroLaserWall,
  resetHeroParticleField,
  revealedWordBox,
} from './useHeroParticleField'

export const HERO_WORDS = ['FOR', 'LIFTERS.', 'BY', 'LIFTERS.'] as const
export const HERO_MOBILE_TITLE_LINES: [string, string][] = [
  [HERO_WORDS[0], HERO_WORDS[1]],
  [HERO_WORDS[2], HERO_WORDS[3]],
]

export function isHeroLimeWord(word: string) {
  return word === 'LIFTERS.'
}

const HERO_LASER_SEQUENCE = [0, 1, 2, 3]
const HERO_LASER_CHARGE_MS = 140
const HERO_LASER_SWEEP_MS = 390
const HERO_LASER_GAP_MS = 55
const HERO_LASER_START_MS = 280

type HeroLaserWallTrack = { leadX: number; now: number }

export function heroLaserClass(word: string, index: number) {
  return {
    'hero-laser-reveal': true,
    'hero-laser-green': isHeroLimeWord(word),
    'hero-laser-red': !isHeroLimeWord(word),
    'from-right': index % 2 === 1,
  }
}

export function useHeroLaser(options?: { emitSparks?: boolean }) {
  const emitSparks = options?.emitSparks ?? true
  const titleEls: HTMLElement[] = []
  let heroLaserStarted = false
  let heroLaserCancelled = false
  const heroLaserTimers: ReturnType<typeof setTimeout>[] = []
  const heroLaserRafs: number[] = []
  const heroLaserNodes = new Set<HTMLElement>()
  let startTimer: ReturnType<typeof setTimeout> | null = null

  function setTitleEl(el: Element | null, index: number) {
    if (el instanceof HTMLElement) titleEls[index] = el
  }

  function markTitleElsDone() {
    titleEls.forEach((el) => el?.classList.add('reveal-done'))
  }

  function queueHeroLaserTimer(fn: () => void, delay: number) {
    const timer = setTimeout(() => {
      if (!heroLaserCancelled) fn()
    }, delay)
    heroLaserTimers.push(timer)
  }

  function queueHeroLaserRaf(fn: (now: number) => void) {
    const raf = requestAnimationFrame((now) => {
      if (!heroLaserCancelled) fn(now)
    })
    heroLaserRafs.push(raf)
  }

  function publishHeroLaserWallFromBox(
    rect: { left: number; top: number; width: number; height: number },
    fromRight: boolean,
    progress: number,
    strength: number,
    now: number,
    track: HeroLaserWallTrack | null,
  ): HeroLaserWallTrack {
    const box = revealedWordBox(rect, fromRight, progress)
    const vx = track && now > track.now
      ? (box.leadingX - track.leadX) / ((now - track.now) / 1000)
      : 0
    publishHeroLaserWall(box, vx, strength, fromRight ? -1 : 1)
    return { leadX: box.leadingX, now }
  }

  function emitHeroLaserSparks(x: number, y: number, isGreen: boolean) {
    const count = 1 + Math.floor(Math.random() * 2)

    for (let i = 0; i < count; i++) {
      const spark = document.createElement('div')
      const angle = (Math.random() - 0.5) * Math.PI * 0.9
      const dist = 12 + Math.random() * 28

      spark.className = 'hero-laser-spark'
      spark.style.translate = `${x}px ${y}px`
      spark.style.background = isGreen ? 'var(--liftag-primary)' : 'var(--liftag-red-neon)'
      spark.style.boxShadow = isGreen
        ? '0 0 4px var(--liftag-primary), 0 0 8px var(--liftag-primary-glow)'
        : '0 0 4px var(--liftag-red-neon), 0 0 8px var(--liftag-red-neon-glow)'
      spark.style.setProperty('--sx', `${Math.cos(angle) * dist * 0.4}px`)
      spark.style.setProperty('--sy', `${Math.sin(angle) * dist}px`)
      document.body.appendChild(spark)
      heroLaserNodes.add(spark)

      queueHeroLaserTimer(() => {
        spark.remove()
        heroLaserNodes.delete(spark)
      }, 450)
    }
  }

  function runHeroLaserReveal(
    el: HTMLElement | undefined,
    fromRight: boolean,
    duration: number,
    onDone?: () => void,
    persistWake = true,
  ) {
    if (!el || el.classList.contains('reveal-done')) {
      onDone?.()
      return
    }

    const isGreen = el.classList.contains('hero-laser-green')
    const rect = el.getBoundingClientRect()
    const fontSize = Number.parseFloat(window.getComputedStyle(el).fontSize) || rect.height
    // Italic Space Grotesk hangs past the layout box (R, Y). On desktop each
    // word is `display: block` so the line width hides it; on phones the words
    // are shrink-wrapped, so a 0% right inset clips FOR / BY. Keep a hang pad
    // on every word, and a slightly larger one on the lime from-right sweeps.
    const italicHang = fontSize * 0.18
    const rightClipPad = isGreen && fromRight ? Math.max(fontSize * 0.14, italicHang) : italicHang
    const wordRect = { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
    const beamTravelWidth = wordRect.width + (fromRight ? rightClipPad : 0)
    const beam = document.createElement('div')

    const syncBeam = (beamPercent: number) => {
      const x = wordRect.left + (beamPercent / 100) * beamTravelWidth
      el.style.setProperty('--laser-x', `${(beamPercent / 100) * wordRect.width}px`)
      beam.style.setProperty('--beam-x', `${x}px`)
      beam.style.setProperty('--beam-y', `${wordRect.top - wordRect.height * 0.2}px`)
      return x
    }

    beam.className = `hero-laser-charge-beam ${isGreen ? 'green' : 'red'}`
    beam.style.setProperty('--beam-h', `${wordRect.height * 1.4}px`)
    syncBeam(fromRight ? 100 : 0)
    document.body.appendChild(beam)
    heroLaserNodes.add(beam)

    const chargeStart = performance.now()
    let charging = true
    let wallTrack: HeroLaserWallTrack | null = null

    const charge = (now: number) => {
      if (!charging) return
      const t = Math.min((now - chargeStart) / HERO_LASER_CHARGE_MS, 1)
      wallTrack = publishHeroLaserWallFromBox(wordRect, fromRight, 0, t, now, wallTrack)
      if (t < 1) queueHeroLaserRaf(charge)
    }
    queueHeroLaserRaf(charge)

    queueHeroLaserTimer(() => {
      charging = false
      el.classList.add('sweeping')
      const start = performance.now()
      let lastSparkTime = 0

      const animate = (now: number) => {
        const t = Math.min((now - start) / duration, 1)
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
        const pos = eased * 100
        const beamPercent = fromRight ? 100 - pos : pos
        const beamX = syncBeam(beamPercent)
        wallTrack = publishHeroLaserWallFromBox(wordRect, fromRight, eased, 1, now, wallTrack)

        if (now - lastSparkTime > 70 && t > 0.04 && t < 0.92) {
          lastSparkTime = now
          // Body-appended spark nodes force layout; skip them on the phone
          // laser so the clip-path sweep and particle walls stay the cost.
          if (emitSparks) {
            emitHeroLaserSparks(beamX, wordRect.top + wordRect.height / 2, isGreen)
          }
        }

        if (t < 1) {
          queueHeroLaserRaf(animate)
          return
        }

        if (persistWake) finishHeroLaserWall()
        else releaseHeroLaserWall()
        el.classList.remove('sweeping')
        el.classList.add('reveal-done')
        beam.style.animation = 'heroLaserChargeShrink 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards'
        queueHeroLaserTimer(() => {
          beam.remove()
          heroLaserNodes.delete(beam)
        }, 300)
        onDone?.()
      }

      queueHeroLaserRaf(animate)
    }, HERO_LASER_CHARGE_MS)
  }

  function runAllHeroLaserReveals() {
    if (heroLaserStarted) return
    heroLaserStarted = true

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      resetHeroParticleField()
      markTitleElsDone()
      return
    }

    const revealNext = (sequenceIndex: number) => {
      const index = HERO_LASER_SEQUENCE[sequenceIndex]

      if (index === undefined) {
        return
      }

      runHeroLaserReveal(
        titleEls[index],
        index % 2 === 1,
        HERO_LASER_SWEEP_MS,
        () => {
          queueHeroLaserTimer(() => revealNext(sequenceIndex + 1), HERO_LASER_GAP_MS)
        },
        // The last word fades in place. Finishing it into the wake would
        // teleport the still-active previous wall onto this line.
        sequenceIndex < HERO_LASER_SEQUENCE.length - 1,
      )
    }

    revealNext(0)
  }

  function cleanupHeroLasers() {
    heroLaserCancelled = true
    if (startTimer) {
      clearTimeout(startTimer)
      startTimer = null
    }
    heroLaserTimers.forEach(clearTimeout)
    heroLaserTimers.length = 0
    heroLaserRafs.forEach(cancelAnimationFrame)
    heroLaserRafs.length = 0
    heroLaserNodes.forEach((node) => node.remove())
    heroLaserNodes.clear()
    resetHeroParticleField()
  }

  function startHeroLaser() {
    heroLaserStarted = false
    heroLaserCancelled = false
    startTimer = setTimeout(() => {
      startTimer = null
      runAllHeroLaserReveals()
    }, HERO_LASER_START_MS)
  }

  onBeforeUnmount(cleanupHeroLasers)

  return {
    setTitleEl,
    markTitleElsDone,
    startHeroLaser,
    cleanupHeroLasers,
  }
}
