import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  assembleAt,
  assembleDuration,
  assembleWindows,
  pieceAt,
  plateAt,
  plateDropHeight,
  plateLocalDuration,
  plateReleaseAt,
  plateStagger,
  recipeFor,
  rainEnd,
  ASSEMBLE_DESKTOP,
  ASSEMBLE_PHONE,
  PLATE_FLOOR_Y,
} from '../utils/gymscan/assemble.ts'
import { DROP_DURATION, DROP_HEIGHT, DROP_IMPACT, dropAt, dropAtHeight, dropDurationFor } from '../utils/gymscan/drop.ts'
import { createIronPlateGeometry } from '../utils/gymscan/parts.ts'
import { Box3, Vector3 } from 'three'

test('drop duration is after first impact and is planted', () => {
  assert.ok(DROP_DURATION > DROP_IMPACT)
  assert.equal(dropAt(DROP_DURATION).done, true)
  assert.equal(dropAt(DROP_DURATION).y, 0)
  assert.equal(dropAt(Math.max(0, DROP_DURATION - 0.05)).done, false)
})

test('dropAtHeight scales the hang and the hop, not the gravity', () => {
  const short = dropAtHeight(0, 2)
  assert.ok(Math.abs(short.y - 2) < 1e-6)
  const mid = dropAtHeight(0.2, 2)
  assert.ok(mid.y < 2 && mid.y > 0)
  assert.equal(dropAtHeight(8, 2).done, true)
})

test('recipe lookup survives glTF name sanitizing (dots stripped)', () => {
  const a = recipeFor('frame.baseL', false)
  const b = recipeFor('framebaseL', false)
  const c = recipeFor('frame_baseL', false)
  assert.equal(a.delay, b.delay)
  assert.equal(a.delay, c.delay)
  assert.equal(a.kind, 'drop')
})

test('the first falling shard is the feet, not the wide beam', () => {
  const early = 0.05
  const base = pieceAt(early, recipeFor('frame.baseL', false), false)
  const beam = pieceAt(early, recipeFor('frame.beam', false), false)
  const railL = pieceAt(early, recipeFor('frame.railL', false), false)
  assert.equal(base.visible, true)
  assert.ok(base.y > 1, `feet still airborne, got ${base.y}`)
  assert.equal(beam.visible, false)
  assert.equal(railL.visible, false)
})

test('rails come from opposite sides with spin, beam lands later', () => {
  const t = recipeFor('frame.railL', false).delay + 0.05
  const left = pieceAt(t, recipeFor('frame.railL', false), false)
  const right = pieceAt(t, recipeFor('frame.railR', false), false)
  const beam = pieceAt(t, recipeFor('frame.beam', false), false)
  assert.equal(left.visible, true)
  assert.ok(left.scatterX < -0.2)
  assert.ok(Math.abs(left.spinY) > 0.1)
  assert.equal(right.visible, false)
  assert.equal(beam.visible, false)
})

test('desktop assemble: rain, plates, swap', () => {
  const hang = assembleAt(0, { phone: false })
  assert.ok(hang.frameY > 1)
  assert.equal(hang.plates, 0)
  assert.equal(hang.swap, false)
  assert.equal(hang.phone, false)

  const { padsEnd, platesEnd, swapAt, doneAt } = assembleWindows(false)
  assert.ok(padsEnd > DROP_DURATION * 0.5)
  const sliding = assembleAt((plateReleaseAt(false) + platesEnd) / 2, { phone: false })
  assert.ok(sliding.plates > 0.3 && sliding.plates < 0.95, `plates mid-slide, got ${sliding.plates}`)
  assert.equal(sliding.swap, false)

  const swapped = assembleAt(swapAt, { phone: false })
  assert.equal(swapped.swap, true)
  assert.equal(swapped.plates, 1)
  assert.equal(swapped.frameY, 0)

  const done = assembleAt(doneAt, { phone: false })
  assert.equal(done.done, true)
  assert.ok(assembleDuration(false) >= doneAt)
  assert.equal(ASSEMBLE_DESKTOP, 4)
})

test('plates drop near the horns, bounce-roll in, then clink', () => {
  const { padsEnd } = assembleWindows(false)
  const release = plateReleaseAt(false)
  assert.ok(release < padsEnd, 'plates start during the rain, not after it')
  const bounceDur = dropDurationFor(plateDropHeight(false))
  const dur = plateLocalDuration(false)
  const leftEarly = plateAt(release + 0.02, 0, false)
  const rightEarly = plateAt(release + 0.02, 1, false)
  assert.equal(leftEarly.visible, true)
  assert.equal(rightEarly.visible, false)
  assert.ok(leftEarly.offsetX < -0.2 && leftEarly.offsetX > -0.5, `left plate falls next to its horn, x=${leftEarly.offsetX}`)
  assert.ok(leftEarly.offsetY > 1.0, `left plate starts high, y=${leftEarly.offsetY}`)
  assert.ok(leftEarly.offsetZ > 0.2 && leftEarly.offsetZ < 0.5, `left plate falls just in front, z=${leftEarly.offsetZ}`)
  assert.ok(Math.abs(leftEarly.yaw) > 0.2, `standing on the rim along the path, yaw=${leftEarly.yaw}`)

  const falling = plateAt(release + bounceDur * 0.2, 0, false)
  assert.ok(falling.offsetY < leftEarly.offsetY, 'falling toward the floor')
  assert.ok(Math.abs(falling.offsetX - leftEarly.offsetX) < 0.02, 'first fall is vertical, roll starts after impact')

  const rolling = plateAt(release + bounceDur * 0.7, 0, false)
  assert.ok(Math.abs(rolling.offsetX) < Math.abs(leftEarly.offsetX), 'rolling in toward the horn')
  assert.ok(rolling.offsetZ < leftEarly.offsetZ, 'rolling in toward the horn')
  assert.ok(Math.abs(rolling.roll) > Math.abs(leftEarly.roll), 'rim roll increases along the path')

  const onFloor = plateAt(release + bounceDur, 0, false)
  assert.ok(Math.abs(onFloor.offsetY - PLATE_FLOOR_Y) < 0.02, `planted on the floor, y=${onFloor.offsetY}`)
  assert.ok(Math.abs(onFloor.offsetX) < 0.15, `arrived next to the sleeve, x=${onFloor.offsetX}`)
  assert.ok(Math.abs(onFloor.roll) > 1, `rolled on the way in, roll=${onFloor.roll}`)

  const over = plateAt(release + bounceDur + (dur - bounceDur) * 0.78, 0, false)
  assert.ok(over.offsetX > 0, `overshoots past rest toward the frame, x=${over.offsetX}`)
  assert.ok(Math.abs(over.yaw) < 0.05, `yawed onto the horn axis, yaw=${over.yaw}`)

  const planted = plateAt(release + dur + plateStagger(false), 0, false)
  assert.ok(Math.abs(planted.offsetX) < 1e-4)
  assert.ok(Math.abs(planted.offsetY) < 1e-4)
  assert.ok(Math.abs(planted.offsetZ) < 1e-4)
  assert.ok(Math.abs(planted.yaw) < 1e-4)
  assert.equal(planted.progress, 1)

  const right = plateAt(release + plateStagger(false) + 0.02, 1, false)
  assert.equal(right.visible, true)
  assert.ok(right.offsetX > 0.2, `right plate mirrors from +X, x=${right.offsetX}`)
  assert.ok(right.yaw * leftEarly.yaw < 0 || Math.abs(right.yaw - leftEarly.yaw) > 0.1, 'opposite headings')
})

test('phone assemble compresses delays, not gravity', () => {
  const desk = assembleWindows(false)
  const phone = assembleWindows(true)
  assert.ok(phone.padsEnd < desk.padsEnd)
  assert.ok(phone.platesEnd < desk.platesEnd)
  assert.ok(phone.doneAt <= ASSEMBLE_PHONE + 1e-6)
  assert.ok(rainEnd(true) < rainEnd(false))

  const skip = assembleAt(1e6, { phone: true })
  assert.equal(skip.swap, true)
  assert.equal(skip.done, true)
  assert.equal(skip.frameY, 0)
  assert.equal(skip.plates, 1)
})

test('iron plate is a donut: hole on the horn axis, rim in YZ', () => {
  const geom = createIronPlateGeometry()
  geom.computeBoundingBox()
  const box = geom.boundingBox ?? new Box3()
  const size = box.getSize(new Vector3())
  assert.ok(size.x < 0.07, `thickness along the horn should be a plate, got ${size.x}`)
  assert.ok(size.y > 0.40 && size.y < 0.50, `diameter Y ${size.y}`)
  assert.ok(size.z > 0.40 && size.z < 0.50, `diameter Z ${size.z}`)
  const pos = geom.getAttribute('position')
  let minR = Infinity
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const r = Math.hypot(y, z)
    if (r < minR) minR = r
  }
  assert.ok(minR > 0.045, `olympic-ish donut hole, inner radius ${minR}`)
  geom.dispose()
})
