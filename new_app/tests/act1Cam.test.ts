import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  APPROACH_PATH,
  APPROACH_TARGET_PATH,
  plateFramingAt,
} from '../utils/gymscan/act1Cam.ts'

/** Machine bounds from `public/assets/gym3d/hero-parts.json`. */
const MACHINE_MAX_Z = 0.933
/** Plate centre, from `stick.ts`'s PLACARD_REST. */
const PLATE_Y = 1.255

test('the approach starts on the establishing station', () => {
  // `station.ts` owns ESTABLISH and Act 0 hands the dolly over from exactly
  // there. Starting anywhere else is a cut on the first pixel of scroll.
  assert.deepEqual(APPROACH_PATH[0], [0.00, [3.98, 2.22, 4.96]])
  assert.deepEqual(APPROACH_TARGET_PATH[0], [0.00, [0.05, 0.88, -0.04]])
})

test('the approach ends in the seat, level with the plate', () => {
  // The point of the last shot is that the code is found from the training
  // position. A standing variant was tried and rejected: it put the eye above
  // the plate and read it at a downward slant. Level with the plate, inside
  // the machine's own length, is the shot.
  const eye = APPROACH_PATH[APPROACH_PATH.length - 1]![1]
  const [x, y, z] = eye
  assert.ok(Math.abs(y - PLATE_Y) < 0.05, `eye should sit level with the plate, got ${y}`)
  assert.ok(
    z > 0 && z < MACHINE_MAX_Z,
    `the eye ends inside the machine's length (0 < z < ${MACHINE_MAX_Z}), got ${z}`,
  )
  assert.ok(Math.abs(x) < 0.2, `stay on the machine's centre line, got ${x}`)
})

test('the move ends aimed at the plate itself, not under it', () => {
  const aim = APPROACH_TARGET_PATH[APPROACH_TARGET_PATH.length - 1]![1]
  assert.deepEqual(aim, [0.00, 1.255, -0.372])
})

test('the plate arrives centred and square on, at reading size', () => {
  const f = plateFramingAt(1)
  assert.ok(f.distance > 0.78 && f.distance < 0.95, `reading distance, got ${f.distance}`)
  assert.ok(
    f.heightFraction > 0.22 && f.heightFraction < 0.32,
    `plate should fill a quarter of the frame, not eat it, got ${f.heightFraction}`,
  )
  // Dead centre: this frame is the one the glass folds around, so the code has
  // to already be where the phone's viewfinder will put it.
  assert.ok(Math.abs(f.ndcY) < 0.05, `plate should land on the centre line, got ${f.ndcY}`)
  assert.ok(Math.abs(f.ndcX) < 0.05, `plate should land on the centre line, got ${f.ndcX}`)
  // A QR code stops scanning long before this, but the shot has to look like
  // something a phone could read or the whole beat is a lie.
  assert.ok(f.incidenceDeg < 10, `plate should face the eye square on, got ${f.incidenceDeg}`)
  assert.ok(f.ndcY + f.heightFraction < 1, 'plate must not crop on the top edge')
})

test('the plate squares up as the camera closes, never turning away', () => {
  // Incidence falls the whole way in. A rise would mean the dolly is arcing
  // off the plate's normal at the moment it is meant to be reading it.
  let previous = Infinity
  for (let i = 0; i <= 100; i++) {
    const f = plateFramingAt(i / 100)
    assert.ok(
      f.incidenceDeg < previous + 1e-6,
      `incidence must fall, rose at u=${i / 100} (${f.incidenceDeg})`,
    )
    previous = f.incidenceDeg
  }
})

test('the whole approach is one move in: never backs off, never overshoots', () => {
  let previous = Infinity
  for (let i = 0; i <= 100; i++) {
    const f = plateFramingAt(i / 100)
    assert.ok(
      f.distance < previous,
      `distance must fall monotonically, rose at u=${i / 100}`,
    )
    previous = f.distance
    assert.ok(f.distance > 0.78, `never closer than a reading distance, got ${f.distance}`)
  }
})

test('the plate is on screen for the whole second half of the approach', () => {
  // The lock cannot happen on something the visitor has not been looking at.
  for (let i = 50; i <= 100; i++) {
    const f = plateFramingAt(i / 100)
    assert.ok(
      Math.abs(f.ndcY) < 1 && Math.abs(f.ndcX) < 1,
      `plate left the frame at u=${i / 100} (${f.ndcX}, ${f.ndcY})`,
    )
  }
})
