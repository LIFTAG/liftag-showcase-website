import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  APP_ID,
  liftagHowTo,
  liftagSoftwareApplication,
  liftagWebPage,
  liftagWebSite,
} from '../utils/seoSchema.ts'

test('advertises the app as both SoftwareApplication and MobileApplication', () => {
  assert.deepEqual(liftagSoftwareApplication['@type'], ['SoftwareApplication', 'MobileApplication'])
  assert.equal(liftagSoftwareApplication['@id'], APP_ID)
  assert.equal(liftagSoftwareApplication.offers.price, '0')
})

test('exposes a WebSite search action on the exercise library', () => {
  const action = liftagWebSite.potentialAction
  assert.equal(action['@type'], 'SearchAction')
  assert.equal(
    action.target.urlTemplate,
    'https://liftag.fit/exercises?q={search_term_string}',
  )
})

test('marks the company page as an AboutPage', () => {
  const page = liftagWebPage({
    path: '/about',
    name: 'About LIFTAG',
    description: 'Company facts.',
    type: 'AboutPage',
  })
  assert.equal(page['@type'], 'AboutPage')
})

test('emits HowTo steps that match visible copy', () => {
  const howTo = liftagHowTo({
    name: 'How to do Barbell Bench Press',
    description: 'Setup and press.',
    steps: ['Lie on the bench.', 'Lower to the chest.', 'Press to lockout.'],
    path: '/exercises/barbell-bench-press',
  })
  assert.equal(howTo['@type'], 'HowTo')
  assert.equal(howTo.step.length, 3)
  assert.equal(howTo.step[1]?.text, 'Lower to the chest.')
})
