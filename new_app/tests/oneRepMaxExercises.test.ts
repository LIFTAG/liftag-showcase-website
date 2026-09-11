import assert from 'node:assert/strict'
import { test } from 'node:test'
import { FEATURED_EXERCISES, searchExercises } from '../utils/oneRepMaxExercises.ts'

function ids(query: string) {
  return searchExercises(query).map(exercise => exercise.id)
}

test('empty search is idle so the picker can show featured lifts', () => {
  assert.deepEqual(searchExercises(''), [])
  assert.deepEqual(searchExercises('   '), [])
  assert.equal(FEATURED_EXERCISES.length, 4)
})

test('nicknames and short queries land on the expected lift first', () => {
  assert.equal(ids('rdl')[0], 'romanian-deadlift')
  assert.equal(ids('rd')[0], 'romanian-deadlift')
  assert.equal(ids('rdls')[0], 'romanian-deadlift')
  assert.ok(ids('rd').includes('dumbbell-romanian-deadlift'))
  assert.ok(!ids('rd').includes('hex-bar-deadlift'))
  assert.equal(ids('db rd')[0], 'dumbbell-romanian-deadlift')
  assert.ok(ids('presses').includes('bench'))
  assert.equal(ids('ohp')[0], 'ohp')
  assert.equal(ids('bp')[0], 'bench')
  assert.equal(ids('hack')[0], 'hack-squat')
  assert.equal(ids('trap')[0], 'hex-bar-deadlift')
  assert.equal(ids('db bench')[0], 'dumbbell-bench-press')
  assert.equal(ids('lat')[0], 'lat-pulldown')
  assert.equal(ids('hack squat')[0], 'hack-squat')
  assert.equal(ids('pullups')[0], 'pull-ups')
  assert.ok(ids('rows').includes('bent-over-row'))
  assert.ok(ids('sl').includes('stiff-leg-deadlift'))
})

test('bench prefers the barbell competition lift over variants', () => {
  const bench = ids('bench')
  assert.equal(bench[0], 'bench')
  assert.ok(bench.includes('incline-bench-press'))
  assert.ok(bench.includes('dumbbell-bench-press'))
})

test('unknown queries return no rows', () => {
  assert.deepEqual(ids('xyzzy'), [])
})
