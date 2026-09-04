// Timed Act 0B: a rain of CAD shards, then pads lock, then donut plates drop
// near the horns, bounce-roll toward the sleeves, and thread.
//
// Pure functions of seconds-from-release. Scroll does not scrub it — skip
// snaps to the swapped rest. Phone compresses delays and locks, not gravity.

import {
  DROP_G,
  DROP_HEIGHT,
  DROP_IMPACT,
  dropAtHeight,
  dropDurationFor,
  dropPlanted,
} from './drop.ts'
import { clamp01, lerp, smoothstep } from './timeline.ts'

export const PART_NAMES = [
  'frame.base',
  'frame.baseL',
  'frame.baseR',
  'frame.railL',
  'frame.railR',
  'frame.seat',
  'frame.core',
  'frame.beam',
  'pads',
  'footplate',
  'sled.L',
  'sled.R',
  'horns.L',
  'horns.R',
  'hardware.L',
  'hardware.R',
  'hardware.top',
] as const
export type PartName = (typeof PART_NAMES)[number]

export const ASSEMBLE_DESKTOP = 4
export const ASSEMBLE_PHONE = 2.6

export type AssembleOpts = {
  phone: boolean
}

export type PieceKind = 'drop' | 'lock'

export type PieceRecipe = {
  delay: number
  height: number
  scatterX: number
  scatterZ: number
  spinX: number
  spinY: number
  spinZ: number
  kind: PieceKind
}

export type PiecePose = {
  y: number
  scatterX: number
  scatterZ: number
  spinX: number
  spinY: number
  spinZ: number
  plant: number
  visible: boolean
  impacted: boolean
  done: boolean
}

export type AssembleState = {
  t: number
  phone: boolean
  /** Contact blob follows the feet, not the still-airborne beam. */
  frameY: number
  /** Sticker waits until the beam it hangs from has planted. */
  frameImpacted: boolean
  plates: number
  platesVisible: boolean
  swap: boolean
  done: boolean
}

export type PlateSide = 0 | 1

export type PlatePose = {
  offsetX: number
  offsetY: number
  offsetZ: number
  /** 1 = donut hole faces the establishing camera (+Z). 0 = threaded. */
  face: number
  /** In-plane spin while the hole is readable, radians. */
  spin: number
  /** Spin around the horn axis once aligned, radians. */
  axial: number
  /** Heading around Y so the plate stands on its rim along the roll path. */
  yaw: number
  /** Rim roll around the hole axis, radians. */
  roll: number
  visible: boolean
  progress: number
}

export const PLATE_DROP_DESKTOP = 1.45
export const PLATE_DROP_PHONE = 0.90
export const PLATE_LOAD_DESKTOP = 0.58
export const PLATE_LOAD_PHONE = 0.34
export const PLATE_STAGGER_DESKTOP = 0.16
export const PLATE_STAGGER_PHONE = 0.08
export const PLATE_RELEASE_DESKTOP = 0.48
export const PLATE_RELEASE_PHONE = 0.24
/** Rim sits on the floor: plate radius 0.225 minus typical horn Y 0.25. */
export const PLATE_FLOOR_Y = -0.025
export const PLATE_RADIUS = 0.225

const REST_PLATE: PlatePose = {
  offsetX: 0,
  offsetY: 0,
  offsetZ: 0,
  face: 0,
  spin: 0,
  axial: 0,
  yaw: 0,
  roll: 0,
  visible: true,
  progress: 1,
}

export function plateDropHeight(phone: boolean): number {
  return phone ? PLATE_DROP_PHONE : PLATE_DROP_DESKTOP
}

export function plateLoadDuration(phone: boolean): number {
  return phone ? PLATE_LOAD_PHONE : PLATE_LOAD_DESKTOP
}

export function plateLocalDuration(phone: boolean): number {
  return dropDurationFor(plateDropHeight(phone)) + plateLoadDuration(phone)
}

export function plateStagger(phone: boolean): number {
  return phone ? PLATE_STAGGER_PHONE : PLATE_STAGGER_DESKTOP
}

export function plateReleaseAt(phone: boolean): number {
  return phone ? PLATE_RELEASE_PHONE : PLATE_RELEASE_DESKTOP
}

/**
 * Per-shard recipe. Delays are desktop seconds; phone scales them.
 *
 * Order is the point: feet, then opposing rails, then seat, then the wide
 * beam last so the first falling object is never half a machine.
 */
export const PIECE_RECIPES: Record<string, PieceRecipe> = {
  'frame.base': { delay: 0.00, height: 2.45, scatterX: 0.05, scatterZ: 0.10, spinX: 0.10, spinY: 0.06, spinZ: -0.08, kind: 'drop' },
  'frame.baseL': { delay: 0.00, height: 2.40, scatterX: -0.22, scatterZ: 0.12, spinX: 0.12, spinY: -0.18, spinZ: -0.10, kind: 'drop' },
  'frame.baseR': { delay: 0.08, height: 2.55, scatterX: 0.24, scatterZ: 0.08, spinX: -0.10, spinY: 0.20, spinZ: 0.08, kind: 'drop' },
  'frame.railL': { delay: 0.11, height: 3.55, scatterX: -0.62, scatterZ: 0.16, spinX: 0.18, spinY: -0.55, spinZ: 0.14, kind: 'drop' },
  'frame.railR': { delay: 0.20, height: 3.65, scatterX: 0.64, scatterZ: 0.12, spinX: -0.14, spinY: 0.58, spinZ: -0.12, kind: 'drop' },
  'frame.core': { delay: 0.24, height: 3.15, scatterX: -0.14, scatterZ: 0.22, spinX: 0.12, spinY: 0.28, spinZ: 0.10, kind: 'drop' },
  'frame.seat': { delay: 0.30, height: 2.85, scatterX: 0.10, scatterZ: 0.58, spinX: 0.42, spinY: 0.10, spinZ: 0.16, kind: 'drop' },
  'sled.L': { delay: 0.38, height: 3.25, scatterX: -0.40, scatterZ: -0.48, spinX: -0.22, spinY: 0.32, spinZ: 0.16, kind: 'drop' },
  'sled.R': { delay: 0.46, height: 3.35, scatterX: 0.42, scatterZ: -0.46, spinX: 0.20, spinY: -0.34, spinZ: -0.14, kind: 'drop' },
  'hardware.L': { delay: 0.34, height: 2.75, scatterX: -0.48, scatterZ: 0.20, spinX: 0.55, spinY: 0.72, spinZ: 0.22, kind: 'drop' },
  'hardware.R': { delay: 0.41, height: 2.85, scatterX: 0.50, scatterZ: 0.18, spinX: -0.48, spinY: -0.68, spinZ: -0.20, kind: 'drop' },
  'hardware.top': { delay: 0.44, height: 3.70, scatterX: 0.12, scatterZ: -0.14, spinX: 0.25, spinY: 0.85, spinZ: 0.18, kind: 'drop' },
  'frame.beam': { delay: 0.52, height: 3.95, scatterX: 0.08, scatterZ: -0.22, spinX: 0.16, spinY: 0.62, spinZ: 0.12, kind: 'drop' },
  'footplate': { delay: 0.58, height: 2.35, scatterX: 0.06, scatterZ: -0.62, spinX: 0.72, spinY: 0.10, spinZ: 0.08, kind: 'drop' },
  'horns.L': { delay: 0.88, height: 0, scatterX: -0.78, scatterZ: 0.10, spinX: 0.25, spinY: 1.15, spinZ: 0.35, kind: 'lock' },
  'horns.R': { delay: 0.96, height: 0, scatterX: 0.78, scatterZ: 0.10, spinX: -0.25, spinY: -1.15, spinZ: -0.35, kind: 'lock' },
  'pads': { delay: 1.02, height: 0, scatterX: 0.05, scatterZ: 0.48, spinX: 0.22, spinY: 0.08, spinZ: 0.05, kind: 'lock' },
}

function delayScale(phone: boolean): number {
  return phone ? 0.48 : 1
}

function lockWindow(phone: boolean): number {
  return phone ? 0.26 : 0.52
}

function easeOutCubic(t: number): number {
  const x = clamp01(t)
  return 1 - Math.pow(1 - x, 3)
}

function hash01(name: string, salt: number): number {
  let h = salt * 374761393 + name.length * 668265263
  for (let i = 0; i < name.length; i++) h = (h ^ (name.charCodeAt(i) * 1274126177)) >>> 0
  return (h % 1000) / 1000
}

function recipeLookupKey(name: string): string {
  return name.replace(/[._]/g, '').toLowerCase()
}

const RECIPE_INDEX = new Map<string, PieceRecipe>()
for (const [key, recipe] of Object.entries(PIECE_RECIPES)) {
  RECIPE_INDEX.set(recipeLookupKey(key), recipe)
}

export function recipeFor(name: string, phone: boolean): PieceRecipe {
  const base = PIECE_RECIPES[name] ?? RECIPE_INDEX.get(recipeLookupKey(name))
  const scale = delayScale(phone)
  if (base) {
    return {
      ...base,
      delay: base.delay * scale,
      scatterX: base.scatterX * (phone ? 0.72 : 1),
      scatterZ: base.scatterZ * (phone ? 0.72 : 1),
    }
  }
  const side = hash01(name, 1) > 0.5 ? 1 : -1
  return {
    delay: (0.08 + hash01(name, 2) * 0.50) * scale,
    height: 2.4 + hash01(name, 3) * 1.2,
    scatterX: side * (0.28 + hash01(name, 4) * 0.40),
    scatterZ: (hash01(name, 5) - 0.5) * 0.70,
    spinX: (hash01(name, 6) - 0.5) * 0.8,
    spinY: (hash01(name, 7) - 0.5) * 1.2,
    spinZ: (hash01(name, 8) - 0.5) * 0.6,
    kind: 'drop',
  }
}

export function pieceAt(t: number, recipe: PieceRecipe, phone: boolean): PiecePose {
  const local = t - recipe.delay
  if (recipe.kind === 'lock') {
    const u = easeOutCubic(local / lockWindow(phone))
    const live = local >= 0
    return {
      y: recipe.height > 0 ? recipe.height * (1 - u) : 0.42 * (1 - u),
      scatterX: recipe.scatterX * (1 - u),
      scatterZ: recipe.scatterZ * (1 - u),
      spinX: recipe.spinX * (1 - u),
      spinY: recipe.spinY * (1 - u),
      spinZ: recipe.spinZ * (1 - u),
      plant: u,
      visible: live || t >= recipe.delay,
      impacted: u >= 1,
      done: u >= 1,
    }
  }

  const pose = local <= 0
    ? { y: recipe.height, impacted: false, done: false }
    : dropAtHeight(local, recipe.height)
  const settle = pose.done ? 1 : dropPlanted(pose.y)
  const pull = settle * settle
  return {
    y: pose.y,
    scatterX: recipe.scatterX * (1 - pull),
    scatterZ: recipe.scatterZ * (1 - pull),
    spinX: recipe.spinX * (1 - pull),
    spinY: recipe.spinY * (1 - pull),
    spinZ: recipe.spinZ * (1 - pull),
    plant: pull,
    visible: local >= -0.01,
    impacted: pose.impacted || pose.done,
    done: pose.done,
  }
}

export function rainEnd(phone: boolean): number {
  let max = 0
  for (const name of Object.keys(PIECE_RECIPES)) {
    const recipe = recipeFor(name, phone)
    const dur = recipe.kind === 'drop'
      ? dropDurationFor(recipe.height)
      : lockWindow(phone)
    max = Math.max(max, recipe.delay + dur)
  }
  return max
}

/**
 * Earliest moment anything in the rain touches the floor, seconds from
 * release. Act 0 releases the machine this far before the ground under its
 * feet is finished, so the first piece lands on mat that has just gone still
 * rather than on mat that has been waiting.
 */
export function firstImpactAt(phone: boolean): number {
  let first = Infinity
  for (const name of Object.keys(PIECE_RECIPES)) {
    const recipe = recipeFor(name, phone)
    if (recipe.kind !== 'drop') continue
    first = Math.min(first, recipe.delay + Math.sqrt((2 * recipe.height) / DROP_G))
  }
  return Number.isFinite(first) ? first : 0
}

export function assembleWindows(phone: boolean) {
  const frameEnd = rainEnd(phone)
  const padsEnd = frameEnd
  const platesEnd = plateReleaseAt(phone) + plateLocalDuration(phone) + plateStagger(phone)
  const swapAt = Math.max(platesEnd, padsEnd) + (phone ? 0.04 : 0.06)
  const doneAt = swapAt + (phone ? 0.08 : 0.18)
  return { frameEnd, padsEnd, platesEnd, swapAt, doneAt }
}

/**
 * One iron donut. `side` 0 is left (outboard −X), 1 is right. Local time is
 * seconds from that plate's release; the pose is independent of the horn's
 * world rest so the same curve can land on either sleeve.
 *
 * Falls next to the horn, then bounce-rolls on its rim toward the sleeve
 * (`dropAtHeight` hops + no-slip roll), yaws onto the horn axis, threads
 * with a few centimetres of overshoot, and clinks.
 */
export function plateAt(t: number, side: PlateSide, phone: boolean): PlatePose {
  const { swapAt } = assembleWindows(phone)
  if (t >= swapAt) return REST_PLATE
  const start = plateReleaseAt(phone) + side * plateStagger(phone)
  const local = t - start
  const height = plateDropHeight(phone)
  const bounceDur = dropDurationFor(height)
  if (local < 0) {
    return { ...plateBounce(0, side, phone, height), visible: false, progress: 0 }
  }
  if (local < bounceDur) {
    const u = clamp01(local / bounceDur)
    return { ...plateBounce(local, side, phone, height), visible: true, progress: 0.5 * u }
  }
  const u = clamp01((local - bounceDur) / plateLoadDuration(phone))
  return { ...plateLoad(u, side, phone), visible: true, progress: 0.5 + 0.5 * u }
}

function platePath(side: PlateSide, phone: boolean) {
  const sign = side === 0 ? -1 : 1
  const k = phone ? 0.68 : 1
  const startX = sign * 0.38 * k
  const startZ = 0.34 * k
  const endX = sign * 0.09 * k
  const endZ = 0.05 * k
  const dx = endX - startX
  const dz = endZ - startZ
  return {
    sign,
    k,
    dir: side === 0 ? 1 : -1,
    startX,
    startZ,
    endX,
    endZ,
    pathLen: Math.hypot(dx, dz),
    yaw: Math.atan2(-dx, dz),
  }
}

function plateBounce(
  local: number,
  side: PlateSide,
  phone: boolean,
  height: number,
): Omit<PlatePose, 'visible' | 'progress'> {
  const p = platePath(side, phone)
  const drop = local <= 0
    ? { y: height, impacted: false, done: false }
    : dropAtHeight(local, height)
  const impactAt = DROP_IMPACT * Math.sqrt(height / DROP_HEIGHT)
  const bounceDur = dropDurationFor(height)
  const travel = local <= impactAt
    ? 0
    : easeOutCubic(clamp01((local - impactAt) / Math.max(bounceDur - impactAt, 1e-4)))
  const offsetX = lerp(p.startX, p.endX, travel)
  const offsetZ = lerp(p.startZ, p.endZ, travel)
  const roll = p.dir * travel * p.pathLen / PLATE_RADIUS * 1.45
  return {
    offsetX,
    offsetY: drop.y + PLATE_FLOOR_Y,
    offsetZ,
    face: 0,
    spin: 0,
    axial: 0,
    yaw: p.yaw,
    roll,
  }
}

function plateLoad(u: number, side: PlateSide, phone: boolean): Omit<PlatePose, 'visible' | 'progress'> {
  const p = platePath(side, phone)
  const align = clamp01(u / 0.28)
  const thread = clamp01((u - 0.28) / 0.52)
  const clink = clamp01((u - 0.80) / 0.20)
  const sleeveX = p.sign * 0.22 * p.k
  const over = 0.034 * p.k
  const a = easeOutCubic(align)
  const endRoll = p.dir * p.pathLen / PLATE_RADIUS * 1.45

  let offsetX: number
  let offsetY: number
  let offsetZ: number
  if (u < 0.28) {
    offsetX = lerp(p.endX, sleeveX, a)
    offsetY = lerp(PLATE_FLOOR_Y, 0, a)
    offsetZ = lerp(p.endZ, 0, a)
  }
  else if (u < 0.80) {
    offsetX = lerp(sleeveX, -p.sign * over, easeOutCubic(thread))
    offsetY = 0
    offsetZ = 0
  }
  else {
    const c = easeOutCubic(clink)
    offsetX = lerp(-p.sign * over, 0, c)
    offsetY = 0.014 * p.k * Math.sin(c * Math.PI) * (1 - c)
    offsetZ = 0
  }

  const yaw = p.yaw * (1 - a)
  const roll = endRoll * (1 - a)
  const axial = (u >= 0.28 ? (1 - easeOutCubic(thread)) * Math.PI * 1.35 : 0) * p.dir
  return {
    offsetX,
    offsetY,
    offsetZ,
    face: 0,
    spin: 0,
    axial,
    yaw,
    roll,
  }
}

export function assembleDuration(phone: boolean): number {
  return phone ? ASSEMBLE_PHONE : ASSEMBLE_DESKTOP
}

export function assembleAt(t: number, opts: AssembleOpts): AssembleState {
  const { platesEnd, swapAt, doneAt } = assembleWindows(opts.phone)
  const swap = t >= swapAt
  let frameY = 0
  for (const name of Object.keys(PIECE_RECIPES)) {
    if (!name.startsWith('frame.base')) continue
    const pose = pieceAt(t, recipeFor(name, opts.phone), opts.phone)
    if (pose.visible && pose.y > frameY) frameY = pose.y
  }
  const beam = pieceAt(t, recipeFor('frame.beam', opts.phone), opts.phone)
  const release = plateReleaseAt(opts.phone)
  const plates = swap ? 1 : smoothstep(clamp01((t - release) / Math.max(platesEnd - release, 1e-4)))

  return {
    t,
    phone: opts.phone,
    frameY: swap ? 0 : frameY,
    frameImpacted: swap || beam.done,
    plates,
    platesVisible: t >= release || swap,
    swap,
    done: t >= doneAt,
  }
}
