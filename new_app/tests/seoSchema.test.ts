import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  APP_ID,
  liftagHowTo,
  liftagOrganization,
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
  assert.equal(page.inLanguage, 'en')
})

test('WebPage inLanguage can be Slovak', () => {
  const page = liftagWebPage({
    path: '/sk/exercises',
    name: 'Knižnica cvikov LIFTAG',
    description: 'Cviky.',
    type: 'CollectionPage',
    inLanguage: 'sk',
  })
  assert.equal(page.inLanguage, 'sk')
})

test('sameAs contains only https URLs', () => {
  assert.ok(liftagOrganization.sameAs.length > 0)
  for (const url of liftagOrganization.sameAs) {
    assert.match(url, /^https:\/\//)
  }
})

test('sameAs lists only live profiles, not directory placeholders', () => {
  const joined = liftagOrganization.sameAs.join('\n')
  assert.doesNotMatch(joined, /wikidata\.org/i)
  assert.doesNotMatch(joined, /producthunt\.com/i)
  assert.doesNotMatch(joined, /alternativeto\.net/i)
  assert.doesNotMatch(joined, /crunchbase\.com/i)
  assert.ok(liftagOrganization.sameAs.includes('https://apps.apple.com/app/id6761140080'))
  assert.ok(liftagOrganization.sameAs.includes('https://play.google.com/store/apps/details?id=com.liftag.app'))
})

test('names the product as a workout logger', () => {
  assert.ok(liftagOrganization.alternateName.includes('LIFTAG Workout Logger'))
  assert.ok(liftagSoftwareApplication.alternateName.includes('LIFTAG Workout Logger'))
  assert.ok(liftagOrganization.knowsAbout.includes('workout logger'))
  assert.ok(liftagOrganization.knowsAbout.includes('workout logbook'))
})

test('emits HowTo steps that match visible copy', () => {
  const howTo = liftagHowTo({
    name: 'How to do Barbell Bench Press',
    description: 'Setup and press.',
    steps: ['Lie on the bench.', 'Lower to the chest.', 'Press to lockout.'],
    path: '/exercises/barbell-bench-press',
  })
  assert.equal(howTo['@type'], 'HowTo')
  assert.equal(howTo.inLanguage, 'en')
  assert.equal(howTo.step.length, 3)
  assert.equal(howTo.step[1]?.text, 'Lower to the chest.')
  assert.equal(howTo.step[0]?.name, 'Step 1')
})

test('HowTo step names can be localized', () => {
  const howTo = liftagHowTo({
    name: 'Ako cvičiť tlaky',
    description: 'Sadni a tlač.',
    steps: ['Sadni.', 'Tlač.'],
    path: '/sk/exercises/barbell-bench-press',
    stepName: index => `Krok ${index + 1}`,
    inLanguage: 'sk',
  })
  assert.equal(howTo.inLanguage, 'sk')
  assert.equal(howTo.step[0]?.name, 'Krok 1')
  assert.equal(howTo.step[1]?.text, 'Tlač.')
})
