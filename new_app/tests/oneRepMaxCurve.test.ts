import test from 'node:test'
import assert from 'node:assert/strict'
import { buildRepCurves } from '../utils/oneRepMaxCurve.ts'
import { estimateOne } from '../utils/oneRepMax.ts'

test('every curve passes through the completed set and its own 1RM', () => {
  for (const reps of [1, 2, 5, 10, 15, 30]) {
    const curves = buildRepCurves(82.5, reps)
    assert.equal(curves.length, 7)
    for (const curve of curves) {
      assert.ok(Math.abs(curve.points[reps - 1]!.kg - 82.5) < 1e-8, `${curve.id}, ${reps} reps`)
      assert.equal(curve.points[0]!.kg, estimateOne(82.5, reps, curve.id))
      assert.equal(curve.points.length, Math.max(15, reps))
      assert.ok(curve.points.every(point => Number.isFinite(point.kg) && point.kg > 0))
    }
  }
})

test('exploration predicts another rep max without treating it as a new completed set', () => {
  const epley = buildRepCurves(100, 5).find(curve => curve.id === 'epley')!
  assert.ok(Math.abs(epley.points[7]!.kg - 92.10526315789474) < 1e-8)
  assert.equal(epley.points[4]!.kg, 100)
})

test('invalid input cannot produce drawable curves', () => {
  for (const [weight, reps] of [[0, 5], [-1, 5], [Infinity, 5], [NaN, 5], [100, 0], [100, 31], [100, 2.5]]) {
    assert.deepEqual(buildRepCurves(weight!, reps!), [])
  }
})
