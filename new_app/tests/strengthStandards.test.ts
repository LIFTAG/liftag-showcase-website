import { ONE_RM_EXERCISES, loadQualifier } from '../utils/oneRepMaxExercises.ts'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { compareStrength, densityAt, densityFromRatios, densityMarkerRatio, massLeftOf, percentileLabel, sampleSmoothedDensity, smoothedDensityAt, strengthDensity, STRENGTH_STANDARDS, STRENGTH_COMPARISON_COUNT, STRENGTH_LEVELS, strengthSource, standardsFor } from '../utils/strengthStandards.ts'
import { estimateOne, kgToLb, lbToKg, isLiftId, buildShareQuery } from '../utils/oneRepMax.ts'
import { WORLD_RECORDS } from '../utils/worldRecords.ts'

test('bench comparison hits sourced male and female intermediate anchors', () => {
  assert.equal(compareStrength(100, 80, 'bench', 'male')?.percentile, 50)
  assert.equal(compareStrength(60, 80, 'bench', 'female')?.percentile, 50)
  assert.equal(compareStrength(100, 80, 'bench', 'male')?.next?.kg, 120)
})

test('exercise-specific benchmarks produce different comparisons for the same set', () => {
  assert.equal(compareStrength(100, 80, 'squat', 'male')?.percentile, 20)
  assert.equal(compareStrength(100, 80, 'deadlift', 'male')?.percentile, 12.5)
  assert.ok((compareStrength(100, 80, 'ohp', 'male')?.percentile ?? 0) > 80)
})

test('interpolation and tails never imply unsupported exact percentiles', () => {
  const midpoint = compareStrength(110, 80, 'bench', 'male')!
  assert.equal(midpoint.percentile, 65)
  assert.equal(percentileLabel(midpoint), 'You are stronger than 65% of lifters')
  assert.equal(percentileLabel(compareStrength(10, 80, 'bench', 'male')!), 'You are stronger than fewer than 5% of lifters')
  assert.equal(percentileLabel(compareStrength(160, 80, 'bench', 'male')!), 'You are stronger than 95% of lifters')
  assert.equal(compareStrength(160, 80, 'bench', 'male')?.next?.label, 'World record')
  assert.equal(percentileLabel({ ...midpoint, percentile: 79.99 }), 'You are stronger than 79% of lifters')
})

function eliteLabel(percentile: number, boundary: 'above' | 'below' | null = null) {
  return percentileLabel({ ratio: 2.4, percentile, boundary, level: 'Elite', next: null })
}

test('lifts without a world record still rank the modeled tail to 99.9999', () => {
  const justPast = compareStrength(85, 80, 'barbell-curl', 'male')!
  assert.equal(justPast.boundary, null)
  assert.equal(percentileLabel(justPast), 'You are stronger than more than 95% of lifters')
  const at96 = compareStrength(88, 80, 'barbell-curl', 'male')!
  assert.equal(at96.percentile, 96)
  assert.equal(percentileLabel(at96), 'You are stronger than 96% of lifters')
  assert.equal(eliteLabel(99.9), 'You are stronger than 99.9% of lifters')
  assert.equal(eliteLabel(99.94), 'You are stronger than 99.94% of lifters')
  assert.equal(eliteLabel(99.99), 'You are stronger than 99.99% of lifters')
  assert.equal(eliteLabel(99.991), 'You are stronger than 99.991% of lifters')
  assert.equal(eliteLabel(99.999), 'You are stronger than 99.999% of lifters')
  assert.equal(eliteLabel(99.9999), 'You are stronger than 99.9999% of lifters')
  assert.equal(eliteLabel(99.99991), 'You are stronger than more than 99.9999% of lifters')
  const pastTail = compareStrength(104, 80, 'barbell-curl', 'male')!
  assert.equal(pastTail.boundary, 'above')
  assert.equal(percentileLabel(pastTail), 'You are stronger than more than 99.9999% of lifters')
})

test('every sourced world-record ratio sits above the published elite anchor', () => {
  for (const lift of Object.keys(WORLD_RECORDS) as Array<keyof typeof WORLD_RECORDS>) {
    const standard = standardsFor(lift)!
    for (const sex of ['male', 'female'] as const) {
      assert.ok(WORLD_RECORDS[lift][sex].ratio > standard[sex][4]!)
    }
  }
})

test('world-record ratio is 100% and the tail between elite and the record is sourced', () => {
  const elite = compareStrength(160, 80, 'bench', 'male')!
  assert.equal(elite.percentile, 95)
  assert.equal(elite.next?.label, 'World record')
  const midTail = compareStrength(221.2, 80, 'bench', 'male')!
  assert.ok(Math.abs(midTail.percentile - 97.5) < 0.05)
  assert.equal(midTail.level, 'Elite')
  const record = compareStrength(3.53 * 80, 80, 'bench', 'male')!
  assert.equal(record.level, 'World record')
  assert.equal(record.percentile, 100)
  assert.equal(record.boundary, null)
  assert.equal(percentileLabel(record), 'You are at the world record')
  const past = compareStrength(300, 80, 'bench', 'male')!
  assert.equal(past.level, 'World record')
  assert.equal(past.boundary, 'above')
  assert.equal(percentileLabel(past), 'You are past the world record')
  const density = strengthDensity('bench', 'male')!
  assert.equal(density.anchors.at(-1)?.label, 'World record')
  assert.equal(density.anchors.at(-1)?.ratio, 3.53)
  assert.equal(massLeftOf(density, 3.53), 100)
  assert.equal(densityMarkerRatio(record, density), 3.53)
  assert.equal(densityMarkerRatio(past, density), density.end)
})

test('all curves are monotonic and kg/lb comparisons agree', () => {
  for (const lift of Object.keys(STRENGTH_STANDARDS) as Array<keyof typeof STRENGTH_STANDARDS>) {
    for (const sex of ['male', 'female'] as const) {
      let previous = 0
      for (let kg = 1; kg <= 350; kg++) {
        const current = compareStrength(kg, 80, lift, sex)!
        assert.ok(current.percentile >= previous)
        previous = current.percentile
      }
      const kg = compareStrength(110, 80, lift, sex)!
      const lb = compareStrength(lbToKg(kgToLb(110)), lbToKg(kgToLb(80)), lift, sex)!
      assert.ok(Math.abs(kg.percentile - lb.percentile) < 1e-8)
    }
  }
})

test('invalid or unsupported inputs do not receive a ranking', () => {
  assert.equal(compareStrength(100, 80, 'other', 'male'), null)
  assert.equal(compareStrength(100, 80, 'bench', ''), null)
  for (const bw of [null, 0, -1, 29, 301, Infinity, NaN]) assert.equal(compareStrength(100, bw, 'bench', 'male'), null)
  for (const load of [null, 0, -1, Infinity, NaN]) assert.equal(compareStrength(load, 80, 'bench', 'male'), null)
})

test('dumbbell benchmarks use one dumbbell and machine standards stay exercise-specific', () => {
  assert.equal(compareStrength(40, 80, 'dumbbell-bench-press', 'male')?.percentile, 50)
  assert.equal(compareStrength(24, 80, 'dumbbell-bench-press', 'female')?.percentile, 50)
  assert.equal(compareStrength(80, 80, 'lat-pulldown', 'male')?.percentile, 50)
  assert.equal(compareStrength(80, 80, 'seated-leg-curl', 'male')?.percentile, 50)
  assert.equal(compareStrength(220, 80, 'sled-leg-press', 'male')?.percentile, 50)
})

test('bodyweight exercises do not inherit loaded-lift percentiles', () => {
  for (const lift of ['pull-ups', 'chin-ups', 'dips'] as const) {
    assert.equal(compareStrength(100, 80, lift, 'male'), null)
    assert.equal(strengthSource(lift), null)
    assert.equal(loadQualifier(lift), 'total load, including bodyweight')
  }
  assert.equal(loadQualifier('dumbbell-bench-press'), 'per dumbbell')
  assert.equal(loadQualifier('goblet-squat'), '')
  assert.equal(loadQualifier('dumbbell-pullover'), '')
})

test('every exercise survives sharing and every benchmark has five increasing anchors', () => {
  assert.equal(STRENGTH_COMPARISON_COUNT, 107)
  assert.equal(Object.keys(STRENGTH_STANDARDS).length, STRENGTH_COMPARISON_COUNT)
  assert.equal(new Set(ONE_RM_EXERCISES.map(item => item.id)).size, ONE_RM_EXERCISES.length)
  for (const exercise of ONE_RM_EXERCISES) {
    assert.ok(isLiftId(exercise.id))
    const query = buildShareQuery({ weightText: '40', repsText: '5', unit: 'kg', lift: exercise.id, formulaId: 'epley' })
    assert.equal(query.lift ?? 'other', exercise.id)
    const standard = standardsFor(exercise.id)
    if (!standard) continue
    assert.ok(strengthSource(exercise.id)?.startsWith('https://strengthlevel.com/strength-standards/'))
    for (const sex of ['male', 'female'] as const) {
      assert.equal(standard[sex].length, 5)
      standard[sex].forEach((ratio, index) => {
        assert.ok(ratio >= (standard[sex][index - 1] ?? 0))
        assert.ok(ratio > 0)
        const lastWithRatio = standard[sex].lastIndexOf(ratio)
        if (index !== lastWithRatio) return
        assert.ok(Math.abs(compareStrength(ratio * 80, 80, exercise.id, sex)!.percentile - STRENGTH_LEVELS[index]!.percentile) < 1e-8)
      })
    }
  }
})

test('high-rep estimated 1RM still ranks against published standards', () => {
  const oneRm = estimateOne(100, 15, 'epley')
  assert.ok(oneRm != null)
  const comparison = compareStrength(oneRm, 80, 'bench', 'male')
  assert.ok(comparison)
  assert.equal(percentileLabel(comparison).startsWith('You are stronger than'), true)
  assert.match(percentileLabel(comparison), /of lifters$/)
})

test('added gym-common lifts use their own published ratios', () => {
  assert.equal(compareStrength(80, 80, 'power-clean', 'male')?.percentile, 50)
  assert.equal(compareStrength(160, 80, 'hack-squat', 'male')?.percentile, 50)
  assert.equal(compareStrength(48, 80, 'face-pull', 'male')?.percentile, 50)
})

test('male bench density is the piecewise PDF of the published CDF', () => {
  const density = strengthDensity('bench', 'male')!
  assert.equal(density.bins.reduce((sum, bin) => sum + bin.mass, 0), 100)
  assert.equal(massLeftOf(density, 0.5), 5)
  assert.equal(massLeftOf(density, 1.0), 20)
  assert.equal(massLeftOf(density, 1.25), 50)
  assert.equal(massLeftOf(density, 1.5), 80)
  assert.equal(massLeftOf(density, 2.0), 95)
  assert.equal(massLeftOf(density, density.end), 100)
  const middle = density.bins.find(bin => bin.start === 1.25 && bin.end === 1.5)!
  assert.equal(middle.density, 30 / 0.25)
  assert.equal(middle.kind, 'known')
  assert.ok(density.bins[0]!.kind === 'tail' && density.bins[0]!.start === 0)
  assert.equal(densityAt(density, 1.25), 30 / 0.25)
  assert.equal(densityAt(density, 2.0), 5 / (3.53 - 2.0))
})

test('density mass to the left matches interpolated percentiles', () => {
  for (const lift of Object.keys(STRENGTH_STANDARDS) as Array<keyof typeof STRENGTH_STANDARDS>) {
    for (const sex of ['male', 'female'] as const) {
      const density = strengthDensity(lift, sex)!
      assert.ok(Math.abs(density.bins.reduce((sum, bin) => sum + bin.mass, 0) - 100) < 1e-10)
      for (const [index, anchor] of density.anchors.entries()) {
        const lastWithRatio = density.anchors.findLastIndex(item => item.ratio === anchor.ratio)
        if (index !== lastWithRatio) continue
        assert.ok(Math.abs(massLeftOf(density, anchor.ratio) - anchor.percentile) < 1e-8)
      }
      for (let kg = 1; kg <= 350; kg++) {
        const comparison = compareStrength(kg, 80, lift, sex)!
        if (comparison.boundary) {
          const marker = densityMarkerRatio(comparison, density)
          assert.equal(marker, comparison.boundary === 'below' ? density.anchors[0]!.ratio : density.end)
          continue
        }
        assert.ok(Math.abs(massLeftOf(density, comparison.ratio) - comparison.percentile) < 1e-8)
      }
    }
  }
})

function halfMaxSpan(samples: { ratio: number, density: number }[]) {
  const peak = Math.max(...samples.map(sample => sample.density))
  const inside = samples.filter(sample => sample.density >= peak / 2)
  const domain = samples[samples.length - 1]!.ratio - samples[0]!.ratio
  return (inside[inside.length - 1]!.ratio - inside[0]!.ratio) / domain
}

test('smoothed density is a unimodal curve whose width follows the published bins', () => {
  const bench = strengthDensity('bench', 'male')!
  const squat = strengthDensity('squat', 'male')!
  const benchSamples = sampleSmoothedDensity(bench)
  const squatSamples = sampleSmoothedDensity(squat)
  const peakIndex = benchSamples.reduce((best, sample, index) => sample.density > benchSamples[best]!.density ? index : best, 0)
  assert.ok(Math.abs(benchSamples[peakIndex]!.ratio - 1.25) < 0.2)
  for (let index = 1; index <= peakIndex; index++) assert.ok(benchSamples[index]!.density + 1e-9 >= benchSamples[index - 1]!.density)
  for (let index = peakIndex + 1; index < benchSamples.length; index++) assert.ok(benchSamples[index]!.density <= benchSamples[index - 1]!.density + 1e-9)
  assert.ok(halfMaxSpan(benchSamples) < halfMaxSpan(squatSamples) * 0.9)
  assert.ok(smoothedDensityAt(bench, 1.25) / smoothedDensityAt(bench, 0.75) > smoothedDensityAt(squat, 1.75) / smoothedDensityAt(squat, 1.25))
})

test('zero-width published steps become a point mass, not a crash', () => {
  const density = densityFromRatios([0.5, 0.5, 1.0, 1.25, 1.5])
  const dirac = density.bins.find(bin => bin.dirac && bin.kind === 'known')
  assert.equal(dirac?.mass, 15)
  assert.equal(massLeftOf(density, 0.5), 20)
  assert.equal(compareStrength(40, 80, 'seated-shoulder-press', 'male')?.percentile, 20)
  assert.equal(strengthDensity('bench', ''), null)
  assert.equal(strengthDensity('pull-ups', 'male'), null)
})
