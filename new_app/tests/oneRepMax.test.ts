import assert from 'node:assert/strict'
import { test } from 'node:test'
import { STATIC_PAGES } from '../utils/staticPages.ts'
import {
  FORMULAS,
  WORKED_EXAMPLE,
  buildShareQuery,
  clusterStats,
  confidenceForReps,
  estimateAll,
  estimateOne,
  formatLoad,
  kgToLb,
  lbToKg,
  nrmTable,
  parseRepsInput,
  parseWeightInput,
  queryToSearchParams,
  roundToIncrement,
  trainingMaxKg,
  trainingPercentTable,
} from '../utils/oneRepMax.ts'
import {
  ONE_RM_DESCRIPTION,
  ONE_RM_PATH,
  ONE_RM_TITLE,
  workedEpleyKg,
} from '../utils/oneRepMaxPage.ts'

test('Epley 100 kg × 5 is 116.7', () => {
  const kg = estimateOne(100, 5, 'epley')
  assert.ok(kg != null)
  assert.equal(Math.round(kg * 10) / 10, 116.7)
  assert.equal(formatLoad(kg, 'kg'), '116.7')
})

test('Epley 225 lb × 5 is 262.5 lb', () => {
  const kg = estimateOne(lbToKg(225), 5, 'epley')
  assert.ok(kg != null)
  assert.equal(Math.round(kgToLb(kg) * 10) / 10, 262.5)
})

test('worked example helper matches Epley 100 × 5', () => {
  assert.equal(workedEpleyKg(), '116.7')
  assert.equal(WORKED_EXAMPLE.weightKg, 100)
  assert.equal(WORKED_EXAMPLE.reps, 5)
})

test('a single is the weight lifted, not an estimate', () => {
  for (const formula of FORMULAS) {
    assert.equal(formula.estimate(180, 1), 180, formula.id)
  }
})

test('Epley and Brzycki match at 10 reps', () => {
  const epley = estimateOne(100, 10, 'epley')
  const brzycki = estimateOne(100, 10, 'brzycki')
  assert.ok(epley != null && brzycki != null)
  assert.ok(Math.abs(epley - brzycki) < 1e-9)
  assert.ok(Math.abs(epley - 400 / 3) < 1e-9)
})

test('Brzycki is undefined at 37 reps', () => {
  assert.equal(estimateOne(100, 37, 'brzycki'), null)
})

test('Mayhew exponent is -0.055r, not -0.55r', () => {
  const kg = estimateOne(100, 5, 'mayhew')
  assert.ok(kg != null)
  assert.equal(Math.round(kg), 119)
})

test('100 kg × 5 cluster matches published check values', () => {
  const rows = estimateAll(100, 5)
  const byId = Object.fromEntries(rows.map(row => [row.id, row.kg]))
  assert.equal(Math.round((byId.epley ?? 0) * 10) / 10, 116.7)
  assert.equal(byId.brzycki, 112.5)
  assert.equal(Math.round((byId.lombardi ?? 0) * 10) / 10, 117.5)
  assert.equal(byId.oconnor, 112.5)
  assert.equal(Math.round((byId.mayhew ?? 0) * 10) / 10, 119)
  assert.equal(Math.round((byId.wathen ?? 0) * 10) / 10, 116.6)
  assert.equal(Math.round((byId.lander ?? 0) * 10) / 10, 113.7)
  const cluster = clusterStats(rows)
  assert.ok(cluster)
  assert.ok(cluster.spreadPct > 5 && cluster.spreadPct < 7)
})

test('90% training max from Epley 100 × 5 is 105 kg', () => {
  const oneRm = estimateOne(100, 5, 'epley')
  assert.ok(oneRm != null)
  assert.equal(roundToIncrement(trainingMaxKg(oneRm), 2.5), 105)
})

test('nRM invert of Epley returns the input set on the 5-rep row', () => {
  const oneRm = estimateOne(100, 5, 'epley')
  assert.ok(oneRm != null)
  const five = nrmTable(oneRm, 'epley', 5).find(row => row.reps === 5)
  assert.ok(five)
  assert.ok(Math.abs(five.kg - 100) < 1e-9)
  assert.equal(five.isInput, true)
})

test('training percent table has 50–100 in 5% steps', () => {
  const oneRm = estimateOne(100, 5, 'epley')
  assert.ok(oneRm != null)
  const table = trainingPercentTable(oneRm)
  assert.equal(table[0]?.percent, 100)
  assert.equal(table.at(-1)?.percent, 50)
  assert.equal(table.length, 11)
})

test('parses comma decimals and unit tokens', () => {
  assert.equal(parseWeightInput('100,5').value, 100.5)
  assert.equal(parseWeightInput('100kg').detectedUnit, 'kg')
  assert.equal(parseWeightInput('225 lb').detectedUnit, 'lb')
  assert.equal(parseWeightInput('1e3').error != null, true)
  assert.equal(parseRepsInput('5').value, 5)
  assert.equal(parseRepsInput('5.5').value, null)
  assert.equal(parseRepsInput('0').value, null)
  assert.equal(parseRepsInput('31').value, null)
})

test('confidence bands follow the rep range', () => {
  assert.equal(confidenceForReps(1), 'measured')
  assert.equal(confidenceForReps(5), 'high')
  assert.equal(confidenceForReps(8), 'good')
  assert.equal(confidenceForReps(10), 'usable')
  assert.equal(confidenceForReps(12), 'rough')
  assert.equal(confidenceForReps(20), 'endurance')
})

test('kg/lb conversion does not drift', () => {
  const kg = 100
  assert.ok(Math.abs(lbToKg(kgToLb(kg)) - kg) < 1e-12)
})

test('share query omits default formula and Any lift', () => {
  const query = buildShareQuery({
    weightText: '100',
    repsText: '5',
    unit: 'kg',
    lift: 'other',
    formulaId: 'epley',
  })
  assert.equal(queryToSearchParams(query), '?w=100&r=5&u=kg')
})

test('title and description stay inside SERP budgets', () => {
  assert.ok(ONE_RM_TITLE.length <= 62)
  assert.ok(ONE_RM_DESCRIPTION.length <= 160)
  assert.match(ONE_RM_TITLE, /1RM Calculator/)
  assert.match(ONE_RM_DESCRIPTION, /Epley/)
})

test('calculator URL is a static sitemap page', () => {
  assert.ok(STATIC_PAGES.some(page => page.path === ONE_RM_PATH))
})
