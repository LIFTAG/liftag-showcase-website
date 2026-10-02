import assert from 'node:assert/strict'
import { test } from 'node:test'
import { compareMetric, compareTraffic, parseSearchConsoleCsv } from '../scripts/search-traffic-compare.ts'

test('parses a quoted Search Console daily CSV', () => {
  const rows = parseSearchConsoleCsv('Date,Clicks,Impressions,CTR\n2026-01-01,2,20,"10%"\n2026-01-02,4,40,"10%"\n')
  assert.deepEqual(rows, [
    { date: '2026-01-01', clicks: 2, impressions: 20 },
    { date: '2026-01-02', clicks: 4, impressions: 40 },
  ])
})

test('rejects duplicate dates rather than silently double counting them', () => {
  assert.throws(() => parseSearchConsoleCsv('Date,Clicks,Impressions\n2026-01-01,2,20\n2026-01-01,3,30\n'), /duplicate date/)
})

test('requires consecutive equal non-overlapping windows', () => {
  const baseline = parseSearchConsoleCsv('Date,Clicks,Impressions\n2026-01-01,1,10\n2026-01-02,1,10\n')
  const followup = parseSearchConsoleCsv('Date,Clicks,Impressions\n2026-02-01,2,20\n2026-02-02,2,20\n')
  const result = compareTraffic(baseline, followup)
  assert.equal(result.bothAtLeastDouble, true)
  assert.equal(result.outcomes.clicks.ratio, 2)
  assert.equal(result.outcomes.impressions.ratio, 2)
  assert.throws(() => compareTraffic(baseline, followup.slice(0, 1)), /equal complete windows/)
  assert.throws(() => compareTraffic(baseline, [followup[0]!, { ...followup[1]!, date: '2026-02-03' }]), /incomplete/)
})

test('reports zero baselines without invented ratios', () => {
  assert.deepEqual(compareMetric(0, 0), {
    baseline: 0,
    followup: 0,
    ratio: null,
    percentChange: null,
    atLeastDouble: false,
    explanation: 'Both periods are zero, so growth and a 2× result cannot be demonstrated.',
  })
  const positive = compareMetric(0, 1)
  assert.equal(positive.ratio, null)
  assert.equal(positive.percentChange, null)
  assert.equal(positive.atLeastDouble, false)
})

test('rejects missing metrics and invalid values', () => {
  assert.throws(() => parseSearchConsoleCsv('Date,Clicks\n2026-01-01,1\n'), /Impressions/)
  assert.throws(() => parseSearchConsoleCsv('Date,Clicks,Impressions\n2026-01-01,-1,4\n'), /non-negative/)
  assert.throws(() => parseSearchConsoleCsv('Date,Clicks,Impressions\n2026-02-30,1,4\n'), /invalid ISO date/)
  assert.throws(() => parseSearchConsoleCsv('Date,Clicks,Impressions\n2026-01-01,1.5,4\n'), /integer/)
})
