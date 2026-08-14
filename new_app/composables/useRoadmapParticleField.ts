// Shared, non-reactive buffer from the roadmap rAF into the particle rAF.
// Written as plain fields so a 60fps timeline never re-renders Roadmap.
//
// World mapping matches clientToParticleWorld in the hero/merge fields
// (kept local so Node tests and Nuxt typecheck agree).

type ClientRect = {
  left: number
  top: number
  width: number
  height: number
}

function clientToParticleWorld(
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

export const ROADMAP_NODE_COUNT = 4
export const ROADMAP_SPARK_COUNT = 4

export type RoadmapFieldNode = {
  cx: number
  cy: number
  radius: number
  strength: number
}

export type RoadmapFieldSpine = {
  cx: number
  cy: number
  vy: number
  strength: number
}

export type RoadmapFieldSpark = {
  cx: number
  cy: number
  strength: number
}

function emptyNode(): RoadmapFieldNode {
  return { cx: 0, cy: 0, radius: 0, strength: 0 }
}

function emptySpine(): RoadmapFieldSpine {
  return { cx: 0, cy: 0, vy: 0, strength: 0 }
}

function emptySpark(): RoadmapFieldSpark {
  return { cx: 0, cy: 0, strength: 0 }
}

function writeNode(target: RoadmapFieldNode, source: RoadmapFieldNode) {
  target.cx = source.cx
  target.cy = source.cy
  target.radius = source.radius
  target.strength = source.strength
}

function writeSpine(target: RoadmapFieldSpine, source: RoadmapFieldSpine) {
  target.cx = source.cx
  target.cy = source.cy
  target.vy = source.vy
  target.strength = source.strength
}

function writeSpark(target: RoadmapFieldSpark, source: RoadmapFieldSpark) {
  target.cx = source.cx
  target.cy = source.cy
  target.strength = source.strength
}

const field = {
  nodes: Array.from({ length: ROADMAP_NODE_COUNT }, emptyNode),
  spine: emptySpine(),
  sparks: Array.from({ length: ROADMAP_SPARK_COUNT }, emptySpark),
  armed: false,
}

export function useRoadmapParticleField() {
  return field
}

export function resetRoadmapParticleField() {
  for (const node of field.nodes) writeNode(node, emptyNode())
  writeSpine(field.spine, emptySpine())
  for (const spark of field.sparks) writeSpark(spark, emptySpark())
  field.armed = false
}

export function publishRoadmapNode(index: number, node: RoadmapFieldNode) {
  if (index < 0 || index >= ROADMAP_NODE_COUNT) return
  const slot = field.nodes[index]
  if (!slot) return
  writeNode(slot, node)
}

export function publishRoadmapSpine(spine: RoadmapFieldSpine) {
  writeSpine(field.spine, spine)
}

export function publishRoadmapSpark(index: number, spark: RoadmapFieldSpark) {
  if (index < 0 || index >= ROADMAP_SPARK_COUNT) return
  const slot = field.sparks[index]
  if (!slot) return
  writeSpark(slot, spark)
}

export function publishRoadmapArmed(armed: boolean) {
  field.armed = armed
}

export function nodeToParticleWorld(
  node: RoadmapFieldNode,
  canvas: ClientRect,
  halfW: number,
  halfH: number,
) {
  const center = clientToParticleWorld(node.cx, node.cy, canvas, halfW, halfH)
  return {
    cx: center.x,
    cy: center.y,
    radius: (node.radius / Math.max(canvas.width, 1)) * 2 * halfW,
    strength: node.strength,
  }
}

export function spineToParticleWorld(
  spine: RoadmapFieldSpine,
  canvas: ClientRect,
  halfW: number,
  halfH: number,
) {
  const center = clientToParticleWorld(spine.cx, spine.cy, canvas, halfW, halfH)
  return {
    cx: center.x,
    cy: center.y,
    vy: -(spine.vy / Math.max(canvas.height, 1)) * 2 * halfH,
    strength: spine.strength,
  }
}

export function sparkToParticleWorld(
  spark: RoadmapFieldSpark,
  canvas: ClientRect,
  halfW: number,
  halfH: number,
) {
  const center = clientToParticleWorld(spark.cx, spark.cy, canvas, halfW, halfH)
  return {
    cx: center.x,
    cy: center.y,
    strength: spark.strength,
  }
}
