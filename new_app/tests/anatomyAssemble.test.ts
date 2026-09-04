import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  ANATOMY_ASSEMBLE,
  ANATOMY_HIT_GAP,
  ANATOMY_WAVE_COUNT,
  anatomyAssemblePose,
  anatomyHeatFromFill,
  anatomyHoverOrigin,
  anatomyMuscleWave,
  anatomyWavesCoverHighlighter,
  nearestAnatomySlug,
  parsePolygonPoints,
  pointInPolygon,
  pointsBBox,
  polygonCentroid,
} from '../utils/anatomyAssemble.ts'
import { PRIMARY_COLOR, SECONDARY_COLOR } from '../utils/exerciseAnatomy.ts'

test('every highlighter muscle has an assemble wave', () => {
  assert.deepEqual(anatomyWavesCoverHighlighter(), [])
  assert.equal(anatomyMuscleWave('head'), 0)
  assert.equal(anatomyMuscleWave('calves'), ANATOMY_WAVE_COUNT - 1)
  assert.ok(anatomyMuscleWave('head') < anatomyMuscleWave('chest'))
  assert.ok(anatomyMuscleWave('chest') < anatomyMuscleWave('biceps'))
  assert.ok(anatomyMuscleWave('biceps') < anatomyMuscleWave('quadriceps'))
  assert.ok(anatomyMuscleWave('quadriceps') < anatomyMuscleWave('calves'))
})

test('polygonCentroid averages vertices and rejects junk', () => {
  assert.deepEqual(polygonCentroid('0 0 10 0 10 10 0 10'), { x: 5, y: 5 })
  assert.deepEqual(polygonCentroid('0,0 10,0 10,10'), { x: 20 / 3, y: 10 / 3 })
  assert.equal(polygonCentroid(''), null)
  assert.equal(polygonCentroid('1 2 3 4'), null)
  assert.equal(polygonCentroid('1 2 3'), null)
})

test('heat fill maps lime and olive, including rgb', () => {
  assert.equal(anatomyHeatFromFill(PRIMARY_COLOR), 'primary')
  assert.equal(anatomyHeatFromFill(SECONDARY_COLOR), 'secondary')
  assert.equal(anatomyHeatFromFill('rgb(204, 255, 0)'), 'primary')
  assert.equal(anatomyHeatFromFill('rgb(94, 120, 20)'), 'secondary')
  assert.equal(anatomyHeatFromFill('#3f3f3f'), null)
})

function pose(partial: Partial<Parameters<typeof anatomyAssemblePose>[0]> = {}) {
  return anatomyAssemblePose({
    muscle: 'chest',
    cx: 62,
    cy: 50,
    partIndex: 0,
    view: 'anterior',
    heat: null,
    svgWidth: 100,
    svgHeight: 200,
    ...partial,
  })
}

test('parts explode outward from the torso and seat later down the body', () => {
  const head = pose({ muscle: 'head', cx: 50, cy: 12 })
  const chest = pose({ muscle: 'chest', cx: 62, cy: 50 })
  const leftArm = pose({ muscle: 'biceps', cx: 22, cy: 60 })
  const rightArm = pose({ muscle: 'biceps', cx: 78, cy: 60 })
  const forearm = pose({ muscle: 'forearm', cx: 10, cy: 88 })
  const calf = pose({ muscle: 'calves', cx: 42, cy: 170 })

  assert.ok(head.y < -8, 'head starts above rest')
  assert.ok(chest.x > 0, 'right pec starts to the right')
  assert.ok(leftArm.x < 0 && rightArm.x > 0, 'arms come from their own sides')
  assert.ok(calf.y > 8, 'calves start below rest')
  assert.ok(head.delayMs < chest.delayMs)
  assert.ok(chest.delayMs < leftArm.delayMs)
  assert.ok(leftArm.delayMs < calf.delayMs)
  assert.ok(forearm.scale < chest.scale, `extremities start smaller (${forearm.scale} vs ${chest.scale})`)
  assert.ok(calf.scale < chest.scale, 'calves start smaller than the torso')
  assert.ok(leftArm.rotate < 0 && rightArm.rotate > 0)
})

test('posterior, right side, extra parts, and heat all add delay, never subtract', () => {
  const base = pose()
  const back = pose({ view: 'posterior' })
  const right = pose({ partIndex: 2 })
  const secondary = pose({ heat: 'secondary' })
  const primary = pose({ heat: 'primary' })

  assert.equal(back.delayMs - base.delayMs, ANATOMY_ASSEMBLE.viewLagMs)
  assert.equal(right.delayMs - base.delayMs, 2 * ANATOMY_ASSEMBLE.partLagMs)
  assert.equal(secondary.delayMs - base.delayMs, ANATOMY_ASSEMBLE.secondaryLagMs)
  assert.equal(primary.delayMs - base.delayMs, ANATOMY_ASSEMBLE.primaryLagMs)
  assert.ok(primary.delayMs > secondary.delayMs)
  assert.equal(
    primary.igniteDelayMs,
    primary.delayMs + Math.round(ANATOMY_ASSEMBLE.durationMs * ANATOMY_ASSEMBLE.igniteAt),
  )
})

test('assemble sequence stays near one second for the last gray calf', () => {
  const last = pose({
    muscle: 'calves',
    cx: 58,
    cy: 170,
    partIndex: 3,
    view: 'posterior',
    heat: null,
  })
  const seated = last.delayMs + ANATOMY_ASSEMBLE.durationMs
  assert.ok(seated > 800, String(seated))
  assert.ok(seated < 1200, String(seated))
  assert.equal(ANATOMY_ASSEMBLE.igniteAt, 1)
})

test('a point in the unpainted split between two halves still hits that muscle', () => {
  const left = parsePolygonPoints('0 0 10 0 10 20 0 20')
  const right = parsePolygonPoints('16 0 26 0 26 20 16 20')
  const chest = parsePolygonPoints('8 40 18 40 18 50 8 50')
  assert.ok(left && right && chest)
  assert.equal(pointInPolygon(5, 10, left), true)
  const hits = [
    { slug: 'back', points: left },
    { slug: 'back', points: right },
    { slug: 'chest', points: chest },
  ]
  assert.equal(nearestAnatomySlug(hits, 5, 10), 'back')
  assert.equal(nearestAnatomySlug(hits, 13, 10), 'back')
  assert.equal(nearestAnatomySlug(hits, 13, 45), 'chest')
  assert.equal(nearestAnatomySlug(hits, 80, 80), null)
  assert.ok(ANATOMY_HIT_GAP >= 5)
})

test('pointsBBox is the axis-aligned extents', () => {
  const verts = parsePolygonPoints('2 8 10 0 18 8 10 16')
  assert.ok(verts)
  assert.deepEqual(pointsBBox(verts), { minX: 2, minY: 0, maxX: 18, maxY: 16 })
  assert.equal(pointsBBox([]), null)
})

test('hover origin is the combined bbox so lat and lower-back keep their split', () => {
  const lat = parsePolygonPoints('30 40 48 40 48 70 30 70')
  const lower = parsePolygonPoints('34 74 48 74 48 102 34 102')
  assert.ok(lat && lower)
  const latBox = pointsBBox(lat)
  const lowerBox = pointsBBox(lower)
  assert.ok(latBox && lowerBox)

  const viewH = 200
  const scale = ANATOMY_ASSEMBLE.hoverScale
  const ownLat = anatomyHoverOrigin([lat], 100, viewH)
  const ownLower = anatomyHoverOrigin([lower], 100, viewH)
  const group = anatomyHoverOrigin([lat, lower], 100, viewH)
  assert.ok(ownLat && ownLower && group)
  assert.ok(group.y < ownLower.y, 'group origin sits above lower-back center')
  assert.deepEqual(group, { x: 39, y: 35.5 })

  const toViewY = (pct: number) => pct / 100 * viewH
  const scaleY = (y: number, originPct: number) => {
    const origin = toViewY(originPct)
    return origin + (y - origin) * scale
  }
  const restGap = lowerBox.minY - latBox.maxY
  const ownGap = scaleY(lowerBox.minY, ownLower.y) - scaleY(latBox.maxY, ownLat.y)
  const groupGap = scaleY(lowerBox.minY, group.y) - scaleY(latBox.maxY, group.y)
  assert.equal(restGap, 4)
  assert.ok(ownGap < restGap, `per-part scale closes the split (${ownGap} vs ${restGap})`)
  assert.ok(groupGap >= restGap - 1e-9, `group scale must not close the split (${groupGap} vs ${restGap})`)
})
