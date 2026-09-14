import assert from 'node:assert/strict'
import { test } from 'node:test'
import { siteLocaleLocation, siteLocalePath, sitePathLocale } from '../utils/siteLocale.ts'

test('the navbar switches only existing translated route families', () => {
  for (const path of ['/exercises', '/exercises/lying-leg-curl', '/privacy-policy', '/terms-and-conditions']) {
    assert.equal(siteLocalePath(path, 'sk'), `/sk${path}`)
    assert.equal(siteLocalePath(`/sk${path}`, 'en'), path)
    assert.equal(sitePathLocale(path), 'en')
    assert.equal(sitePathLocale(`/sk${path}`), 'sk')
  }
  assert.equal(siteLocalePath('/cs/privacy-policy', 'sk'), '/sk/privacy-policy')
  assert.equal(siteLocalePath('/cs/terms-and-conditions', 'en'), '/terms-and-conditions')
  assert.equal(siteLocalePath('/sk/exercises/', 'en'), '/exercises/')
})

test('language preparation does not create untranslated marketing or shared-link routes', () => {
  for (const path of ['/', '/pricing', '/explore', '/gyms/gym-id', '/machines/leg-curl', '/get', '/routines/id', '/plans/id']) {
    assert.equal(siteLocalePath(path, 'sk'), path)
    assert.equal(sitePathLocale(path), undefined)
  }
  assert.equal(siteLocalePath('/exercises-extra', 'sk'), '/exercises-extra')
})

test('switching language retains map position, search, multi-brand filters, selection and hash', () => {
  const query = {
    lang: 'en', lat: '49.25', lng: '17.2', zoom: '7', north: '51.1', south: '47.5',
    east: '22.6', west: '12', search: 'Fitness', manufacturers: ['matrix', 'booty-builder'],
    selected: 'gym-id', open: '1', rating: '4', distance: '5',
  }
  const next = siteLocaleLocation({ path: '/explore', query, hash: '#results' }, 'sk')
  assert.deepEqual(next, { path: '/explore', query: { ...query, lang: 'sk' }, hash: '#results' })
  assert.equal(query.lang, 'en')
})

test('localized exercise navigation retains gym-specific identities and media anchors', () => {
  const query = { lang: 'sk', gym: 'gym-id', machine: 'gym-machine-id', exercise: 'resolved-exercise-id' }
  assert.deepEqual(siteLocaleLocation({ path: '/sk/exercises/custom-id', query, hash: '#instructions' }, 'en'), {
    path: '/exercises/custom-id', query: { ...query, lang: 'en' }, hash: '#instructions',
  })
})
