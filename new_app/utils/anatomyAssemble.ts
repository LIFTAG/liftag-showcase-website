/**
 * Assemble poses for the catalog body highlighter.
 *
 * Parts start exploded along the radial from the torso, then seat
 * core-first. Highlighted muscles lag so the mannequin exists before
 * the worked tissue locks and ignites.
 */

import { HIGHLIGHTER_VIEW_POLYGONS, PRIMARY_COLOR, SECONDARY_COLOR } from './exerciseAnatomy.ts'

export const ANATOMY_ASSEMBLE = {
  durationMs: 680,
  waveGapMs: 52,
  sideLagMs: 20,
  partLagMs: 12,
  viewLagMs: 80,
  primaryLagMs: 150,
  secondaryLagMs: 80,
  /** Pulse starts after the part has seated so transform is free for scale. */
  igniteAt: 1,
  hoverScale: 1.055,
  originX: 50,
  originY: 98,
  travelMin: 16,
  travelMax: 40,
  scaleCore: 0.88,
  scaleTip: 0.58,
  rotateMax: 14,
} as const

/** Head plants first, calves last. Unlisted muscles sit in the middle. */
export const ANATOMY_MUSCLE_WAVE: Record<string, number> = {
  head: 0,
  neck: 1,
  chest: 1,
  trapezius: 1,
  abs: 2,
  'upper-back': 2,
  'front-deltoids': 2,
  'back-deltoids': 2,
  obliques: 3,
  'lower-back': 3,
  biceps: 3,
  triceps: 3,
  gluteal: 3,
  abductors: 4,
  adductor: 4,
  forearm: 4,
  quadriceps: 4,
  hamstring: 4,
  knees: 5,
  calves: 5,
  'left-soleus': 5,
  'right-soleus': 5,
}

export const ANATOMY_WAVE_COUNT = 6

export type AnatomyHeat = 'primary' | 'secondary' | null

export type AnatomyAssemblePose = {
  delayMs: number
  igniteDelayMs: number
  x: number
  y: number
  rotate: number
  scale: number
}

function clamp01(value: number): number {
  if (value <= 0) return 0
  if (value >= 1) return 1
  return value
}

export function anatomyMuscleWave(muscle: string): number {
  return ANATOMY_MUSCLE_WAVE[muscle] ?? 3
}

export function anatomyHeatFromFill(fill: string): AnatomyHeat {
  const value = fill.replace(/\s/g, '').toLowerCase()
  if (value === PRIMARY_COLOR || value === 'rgb(204,255,0)') return 'primary'
  if (value === SECONDARY_COLOR || value === 'rgb(94,120,20)') return 'secondary'
  return null
}

export type AnatomyPoint = { x: number, y: number }

export type AnatomyHitPoly = {
  slug: string
  points: AnatomyPoint[]
}

/** How far, in viewBox units, a crevice can sit from a painted edge and still count. */
export const ANATOMY_HIT_GAP = 7

export function parsePolygonPoints(points: string): AnatomyPoint[] | null {
  const nums = points.trim().split(/[\s,]+/).map(Number).filter(Number.isFinite)
  if (nums.length < 6 || nums.length % 2 !== 0) return null
  const verts: AnatomyPoint[] = []
  for (let i = 0; i < nums.length; i += 2) {
    verts.push({ x: nums[i]!, y: nums[i + 1]! })
  }
  return verts
}

export function polygonCentroid(points: string): AnatomyPoint | null {
  const verts = parsePolygonPoints(points)
  if (!verts) return null
  let x = 0
  let y = 0
  for (const vert of verts) {
    x += vert.x
    y += vert.y
  }
  return { x: x / verts.length, y: y / verts.length }
}

export type AnatomyBBox = { minX: number, minY: number, maxX: number, maxY: number }

export function pointsBBox(verts: AnatomyPoint[]): AnatomyBBox | null {
  const first = verts[0]
  if (!first) return null
  let minX = first.x
  let minY = first.y
  let maxX = first.x
  let maxY = first.y
  for (let i = 1; i < verts.length; i++) {
    const p = verts[i]!
    if (p.x < minX) minX = p.x
    else if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    else if (p.y > maxY) maxY = p.y
  }
  return { minX, minY, maxX, maxY }
}

function unionBBox(boxes: AnatomyBBox[]): AnatomyBBox | null {
  const first = boxes[0]
  if (!first) return null
  let minX = first.minX
  let minY = first.minY
  let maxX = first.maxX
  let maxY = first.maxY
  for (let i = 1; i < boxes.length; i++) {
    const box = boxes[i]!
    if (box.minX < minX) minX = box.minX
    if (box.minY < minY) minY = box.minY
    if (box.maxX > maxX) maxX = box.maxX
    if (box.maxY > maxY) maxY = box.maxY
  }
  return { minX, minY, maxX, maxY }
}

/** Combined bbox center as a percent of the SVG viewBox. */
export function anatomyHoverOrigin(
  parts: AnatomyPoint[][],
  viewWidth: number,
  viewHeight: number,
): AnatomyPoint | null {
  if (viewWidth <= 0 || viewHeight <= 0) return null
  const boxes: AnatomyBBox[] = []
  for (const verts of parts) {
    const box = pointsBBox(verts)
    if (box) boxes.push(box)
  }
  const box = unionBBox(boxes)
  if (!box) return null
  return {
    x: ((box.minX + box.maxX) / 2 / viewWidth) * 100,
    y: ((box.minY + box.maxY) / 2 / viewHeight) * 100,
  }
}

function svgViewSize(svg: SVGSVGElement | null): { width: number, height: number } {
  const box = svg?.viewBox?.baseVal
  if (box && box.width > 0 && box.height > 0) return { width: box.width, height: box.height }
  return { width: 100, height: 200 }
}

export function pointInPolygon(x: number, y: number, verts: AnatomyPoint[]): boolean {
  let inside = false
  for (let i = 0, j = verts.length - 1; i < verts.length; j = i++) {
    const a = verts[i]!
    const b = verts[j]!
    const crosses = (a.y > y) !== (b.y > y)
      && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x
    if (crosses) inside = !inside
  }
  return inside
}

function distToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax
  const dy = by - ay
  const len2 = dx * dx + dy * dy
  if (len2 === 0) return Math.hypot(px - ax, py - ay)
  let t = ((px - ax) * dx + (py - ay) * dy) / len2
  if (t < 0) t = 0
  else if (t > 1) t = 1
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

export function distanceToPolygon(x: number, y: number, verts: AnatomyPoint[]): number {
  if (verts.length < 3) return Number.POSITIVE_INFINITY
  if (pointInPolygon(x, y, verts)) return 0
  let min = Number.POSITIVE_INFINITY
  for (let i = 0; i < verts.length; i++) {
    const a = verts[i]!
    const b = verts[(i + 1) % verts.length]!
    const dist = distToSegment(x, y, a.x, a.y, b.x, b.y)
    if (dist < min) min = dist
  }
  return min
}

/**
 * Pick the catalog slug under a pointer. Painted hits win. A point in the
 * unpainted split between two halves of the same muscle still belongs to it.
 */
export function nearestAnatomySlug(
  hits: AnatomyHitPoly[],
  x: number,
  y: number,
  maxGap: number = ANATOMY_HIT_GAP,
): string | null {
  const scored: { slug: string, dist: number }[] = []
  for (const hit of hits) {
    if (!hit.slug || hit.points.length < 3) continue
    scored.push({ slug: hit.slug, dist: distanceToPolygon(x, y, hit.points) })
  }
  const painted = scored.find(row => row.dist === 0)
  if (painted) return painted.slug

  const near = scored.filter(row => row.dist <= maxGap)
  if (!near.length) return null

  const bySlug = new Map<string, { min: number, count: number }>()
  for (const row of near) {
    const cur = bySlug.get(row.slug)
    if (!cur) bySlug.set(row.slug, { min: row.dist, count: 1 })
    else {
      if (row.dist < cur.min) cur.min = row.dist
      cur.count++
    }
  }

  let best: { slug: string, min: number, count: number } | null = null
  for (const [slug, info] of bySlug) {
    if (!best) {
      best = { slug, ...info }
      continue
    }
    const splitBias = info.count >= 2 && best.count < 2 && info.min <= best.min + 2.5
    const keepSplit = best.count >= 2 && info.count < 2 && best.min <= info.min + 2.5
    if (splitBias) best = { slug, ...info }
    else if (keepSplit) continue
    else if (info.min < best.min) best = { slug, ...info }
  }
  return best?.slug ?? null
}

function heatLag(heat: AnatomyHeat): number {
  if (heat === 'primary') return ANATOMY_ASSEMBLE.primaryLagMs
  if (heat === 'secondary') return ANATOMY_ASSEMBLE.secondaryLagMs
  return 0
}

export function anatomyAssemblePose(input: {
  muscle: string
  cx: number
  cy: number
  partIndex: number
  view: 'anterior' | 'posterior'
  heat: AnatomyHeat
  svgWidth: number
  svgHeight: number
}): AnatomyAssemblePose {
  const dx = input.cx - ANATOMY_ASSEMBLE.originX
  const dy = input.cy - ANATOMY_ASSEMBLE.originY
  const dist = Math.hypot(dx, dy)
  const distT = clamp01((dist - 16) / 84)
  const waveT = anatomyMuscleWave(input.muscle) / (ANATOMY_WAVE_COUNT - 1)
  const reach = clamp01(0.45 * distT + 0.55 * waveT)
  const travel = ANATOMY_ASSEMBLE.travelMin
    + distT * (ANATOMY_ASSEMBLE.travelMax - ANATOMY_ASSEMBLE.travelMin)
  const nx = dist > 0.001 ? dx / dist : 0
  const ny = dist > 0.001 ? dy / dist : -1
  const sx = input.svgWidth / 100
  const sy = input.svgHeight / 200
  const side = Math.abs(dx) < 2 ? 0 : input.cx >= ANATOMY_ASSEMBLE.originX ? 1 : -1
  const delayMs = anatomyMuscleWave(input.muscle) * ANATOMY_ASSEMBLE.waveGapMs
    + (input.view === 'posterior' ? ANATOMY_ASSEMBLE.viewLagMs : 0)
    + (side > 0 ? ANATOMY_ASSEMBLE.sideLagMs : 0)
    + Math.min(Math.max(input.partIndex, 0), 3) * ANATOMY_ASSEMBLE.partLagMs
    + heatLag(input.heat)

  return {
    delayMs,
    igniteDelayMs: delayMs + Math.round(ANATOMY_ASSEMBLE.durationMs * ANATOMY_ASSEMBLE.igniteAt),
    x: nx * travel * sx,
    y: ny * travel * sy,
    rotate: side * (3 + reach * (ANATOMY_ASSEMBLE.rotateMax - 3)),
    scale: ANATOMY_ASSEMBLE.scaleCore
      - reach * (ANATOMY_ASSEMBLE.scaleCore - ANATOMY_ASSEMBLE.scaleTip),
  }
}

export function stampAnatomyAssemble(
  root: HTMLElement,
  view: 'anterior' | 'posterior',
): void {
  const svg = root.querySelector('svg')
  const height = svg?.clientHeight || root.clientHeight || 230
  const width = svg?.clientWidth || root.clientWidth || height * 0.5
  const groups = new Map<string, SVGPolygonElement[]>()

  root.querySelectorAll('polygon').forEach((poly) => {
    const muscle = poly.getAttribute('data-muscle') ?? ''
    const list = groups.get(muscle)
    if (list) list.push(poly)
    else groups.set(muscle, [poly])
  })

  for (const [muscle, list] of groups) {
    const ranked = list
      .map((poly) => {
        const centroid = polygonCentroid(poly.getAttribute('points') ?? '') ?? {
          x: ANATOMY_ASSEMBLE.originX,
          y: ANATOMY_ASSEMBLE.originY,
        }
        return { poly, centroid }
      })
      .sort((a, b) => a.centroid.x - b.centroid.x || a.centroid.y - b.centroid.y)

    ranked.forEach((item, index) => {
      const onLeft = item.centroid.x < ANATOMY_ASSEMBLE.originX
      const partIndex = ranked.slice(0, index).filter(row =>
        (row.centroid.x < ANATOMY_ASSEMBLE.originX) === onLeft,
      ).length
      const heat = anatomyHeatFromFill(item.poly.style.fill)
      const pose = anatomyAssemblePose({
        muscle,
        cx: item.centroid.x,
        cy: item.centroid.y,
        partIndex,
        view,
        heat,
        svgWidth: width,
        svgHeight: height,
      })
      item.poly.style.setProperty('--assemble-x', `${pose.x.toFixed(2)}px`)
      item.poly.style.setProperty('--assemble-y', `${pose.y.toFixed(2)}px`)
      item.poly.style.setProperty('--assemble-rotate', `${pose.rotate.toFixed(2)}deg`)
      item.poly.style.setProperty('--assemble-scale', pose.scale.toFixed(3))
      item.poly.style.setProperty('--assemble-delay', String(pose.delayMs))
      item.poly.style.setProperty('--ignite-delay', String(pose.igniteDelayMs))
      if (heat) item.poly.setAttribute('data-heat', heat)
      else item.poly.removeAttribute('data-heat')
    })
  }
}

/**
 * Scale each slug as one silhouette. Per-polygon fill-box scale grows
 * lower-back into the lats and closes the painted splits.
 */
export function stampAnatomyHoverOrigins(root: HTMLElement): void {
  const svg = root.querySelector('svg')
  const view = svgViewSize(svg instanceof SVGSVGElement ? svg : null)
  const groups = new Map<string, { polys: SVGPolygonElement[], parts: AnatomyPoint[][] }>()

  root.querySelectorAll('polygon[data-slug]').forEach((node) => {
    if (!(node instanceof SVGPolygonElement)) return
    const slug = node.getAttribute('data-slug')
    const points = parsePolygonPoints(node.getAttribute('points') ?? '')
    if (!slug || !points) return
    const group = groups.get(slug)
    if (group) {
      group.polys.push(node)
      group.parts.push(points)
    }
    else groups.set(slug, { polys: [node], parts: [points] })
  })

  for (const group of groups.values()) {
    const origin = anatomyHoverOrigin(group.parts, view.width, view.height)
    if (!origin) continue
    const ox = `${origin.x.toFixed(2)}%`
    const oy = `${origin.y.toFixed(2)}%`
    for (const poly of group.polys) {
      poly.style.setProperty('--hover-ox', ox)
      poly.style.setProperty('--hover-oy', oy)
    }
  }
}

/** Every highlighter muscle has a wave so a new polygon cannot silently skip. */
export function anatomyWavesCoverHighlighter(): string[] {
  const missing: string[] = []
  for (const view of Object.values(HIGHLIGHTER_VIEW_POLYGONS)) {
    for (const row of view) {
      if (!(row.muscle in ANATOMY_MUSCLE_WAVE)) missing.push(row.muscle)
    }
  }
  return missing
}
