// Shared, non-reactive buffer from the hero laser rAF into the particle rAF.
// Written as plain fields so a 60fps sweep never re-renders Hero.

export type HeroFieldWall = {
  cx: number
  cy: number
  hw: number
  hh: number
  vx: number
  strength: number
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
  return { cx: 0, cy: 0, hw: 0, hh: 0, vx: 0, strength: 0 }
}

function writeWall(target: HeroFieldWall, source: HeroFieldWall) {
  target.cx = source.cx
  target.cy = source.cy
  target.hw = source.hw
  target.hh = source.hh
  target.vx = source.vx
  target.strength = source.strength
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

export function publishHeroLaserWall(box: HeroFieldBox, vx: number, strength: number) {
  writeWall(field.walls[0], {
    cx: box.cx,
    cy: box.cy,
    hw: box.hw,
    hh: box.hh,
    vx,
    strength,
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
  }
}
