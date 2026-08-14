// Shared, non-reactive buffer from the hero laser rAF into the particle rAF.
// Written as plain fields so a 60fps sweep never re-renders Hero.

export type HeroFieldWall = {
  cx: number
  cy: number
  hw: number
  hh: number
  vx: number
  strength: number
  facing: number
}

export type DisplayedWall = {
  cx: number
  cy: number
  hw: number
  hh: number
  vx: number
  facing: number
  k: number
}

export type HeroFieldBox = {
  cx: number
  cy: number
  hw: number
  hh: number
  leadingX: number
}

export type ClientRect = {
  left: number
  top: number
  width: number
  height: number
}

const MIN_HALF_WIDTH = 2

function emptyWall(): HeroFieldWall {
  return { cx: 0, cy: 0, hw: 0, hh: 0, vx: 0, strength: 0, facing: 0 }
}

function writeWall(target: HeroFieldWall, source: HeroFieldWall) {
  target.cx = source.cx
  target.cy = source.cy
  target.hw = source.hw
  target.hh = source.hh
  target.vx = source.vx
  target.strength = source.strength
  target.facing = source.facing
}

const field = {
  walls: [emptyWall(), emptyWall()] as [HeroFieldWall, HeroFieldWall],
}

export function useHeroParticleField() {
  return field
}

export function resetHeroParticleField() {
  writeWall(field.walls[0], emptyWall())
  writeWall(field.walls[1], emptyWall())
}

export function revealedWordBox(
  rect: ClientRect,
  fromRight: boolean,
  progress: number,
): HeroFieldBox {
  const p = Math.min(1, Math.max(0, progress))
  const width = Math.max(MIN_HALF_WIDTH * 2, rect.width * p)
  const hw = width / 2
  const hh = rect.height / 2
  const cy = rect.top + hh
  const left = fromRight ? rect.left + rect.width - width : rect.left
  return {
    cx: left + hw,
    cy,
    hw,
    hh,
    leadingX: fromRight ? left : left + width,
  }
}

export function publishHeroLaserWall(
  box: HeroFieldBox,
  vx: number,
  strength: number,
  facing = vx < 0 ? -1 : 1,
) {
  writeWall(field.walls[0], {
    cx: box.cx,
    cy: box.cy,
    hw: box.hw,
    hh: box.hh,
    vx,
    strength,
    facing,
  })
}

export function finishHeroLaserWall() {
  writeWall(field.walls[1], field.walls[0])
  writeWall(field.walls[0], emptyWall())
}

export function decayHeroParticleWake(dtMs: number, decayMs = 500) {
  const wake = field.walls[1]
  if (wake.strength <= 0 || decayMs <= 0) return
  wake.strength = Math.max(0, wake.strength - dtMs / decayMs)
}

export function clientToParticleWorld(
  clientX: number,
  clientY: number,
  canvas: ClientRect,
  halfW: number,
  halfH: number,
) {
  const nx = ((clientX - canvas.left) / Math.max(canvas.width, 1)) * 2 - 1
  const ny = ((clientY - canvas.top) / Math.max(canvas.height, 1)) * 2 - 1
  return { x: nx * halfW || 0, y: -ny * halfH || 0 }
}

export function wallToParticleWorld(
  wall: HeroFieldWall,
  canvas: ClientRect,
  halfW: number,
  halfH: number,
) {
  const center = clientToParticleWorld(wall.cx, wall.cy, canvas, halfW, halfH)
  return {
    cx: center.x,
    cy: center.y,
    hw: (wall.hw / Math.max(canvas.width, 1)) * 2 * halfW,
    hh: (wall.hh / Math.max(canvas.height, 1)) * 2 * halfH,
    vx: (wall.vx / Math.max(canvas.width, 1)) * 2 * halfW,
    strength: wall.strength,
    facing: wall.facing,
  }
}

export function emptyDisplayedWall(): DisplayedWall {
  return { cx: 0, cy: 0, hw: 0, hh: 0, vx: 0, facing: 0, k: 0 }
}

export function shouldTransferLiveWall(
  previousLiveStrength: number,
  liveStrength: number,
  wakeStrength: number,
) {
  return previousLiveStrength > 0.001 && liveStrength <= 0.001 && wakeStrength > 0.001
}

export function transferDisplayedWall(live: DisplayedWall) {
  return {
    live: { ...live, k: 0 },
    wake: { ...live },
  }
}

export function stepDisplayedWall(
  displayed: DisplayedWall,
  target: DisplayedWall,
  lerp: number,
): DisplayedWall {
  const t = Math.min(1, Math.max(0, lerp))
  const mix = (from: number, to: number) => from + (to - from) * t

  if (target.k <= 0.001) {
    return {
      ...displayed,
      vx: mix(displayed.vx, 0),
      k: mix(displayed.k, 0),
    }
  }

  if (displayed.k <= 0.001) {
    return {
      ...target,
      k: mix(displayed.k, target.k),
    }
  }

  return {
    cx: mix(displayed.cx, target.cx),
    cy: mix(displayed.cy, target.cy),
    hw: mix(displayed.hw, target.hw),
    hh: mix(displayed.hh, target.hh),
    vx: mix(displayed.vx, target.vx),
    facing: target.facing,
    k: mix(displayed.k, target.k),
  }
}
