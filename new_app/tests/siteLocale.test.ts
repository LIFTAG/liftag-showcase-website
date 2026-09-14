import { siteCanonicalPath, siteLocaleAlternates } from '../utils/siteLocale.ts'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { siteLocaleLocation, siteLocalePath, sitePathLocale, siteBasePath } from '../utils/siteLocale.ts'
import { localizedRouteRules } from '../utils/localizedRouteRules.ts'
import { slovakPluralRule } from '../utils/i18n.ts'

test('public content gets stable English and Slovak twins without changing identities', () => {
  for (const path of ['/', '/pricing', '/journal/progressive-overload', '/tools/1rm-calculator', '/exercises/lat-pulldown', '/machines/leg-curl', '/explore', '/gyms/id']) {
    const sk = path === '/' ? '/sk' : `/sk${path}`
    assert.equal(siteLocalePath(path, 'sk'), sk)
    assert.equal(siteLocalePath(sk, 'en'), path)
    assert.equal(siteBasePath(sk), path)
    assert.equal(sitePathLocale(sk), 'sk')
    assert.equal(sitePathLocale(path), 'en')
  }
  assert.equal(siteLocalePath('/cs/privacy-policy', 'sk'), '/sk/privacy-policy')
  assert.equal(siteLocalePath('/pricing?campaign=fall#plans', 'sk'), '/sk/pricing?campaign=fall#plans')
})
test('external contracts and resources are never language-prefixed', () => {
  for (const path of ['/get', '/qr/id', '/routines/id', '/plans/id', '/trainer-invites/id', '/auth/callback', '/api/catalog/search-index', '/assets/logo.svg', '/exercises-extra'])
    assert.equal(siteLocalePath(path, 'sk'), path)
})
test('switching retains browsing state, contextual identities and anchors', () => {
  const query = { lang: 'en', search: 'Fitness', manufacturers: ['one', 'two'], selected: 'gym', lat: '49', gym: 'gym-id', machine: 'machine-id', exercise: 'exercise-id' }
  assert.deepEqual(siteLocaleLocation({path:'/explore',query,hash:'#results'}, 'sk'), {path:'/sk/explore',query:{...query,lang:'sk'},hash:'#results'})
  assert.equal(query.lang, 'en')
  assert.deepEqual(siteLocaleLocation({path:'/pricing',query:{},hash:''}, 'sk'), {path:'/sk/pricing',query:{},hash:''})
})
test('localized routes inherit caching without prerendering dynamic details', () => {
  const rules = localizedRouteRules({ '/': {prerender:true}, '/pricing':{prerender:true}, '/exercises':{isr:3600}, '/exercises/**':{headers:{'cache-control':'no-store'}}, '/api/catalog/**':{isr:3600}, '/gym-scan':{redirect:{to:'/demo',statusCode:308}} })
  assert.deepEqual(Reflect.get(rules, '/sk'), rules['/'])
  assert.deepEqual(Reflect.get(rules, '/sk/exercises/**'), rules['/exercises/**'])
  assert.equal(Reflect.get(rules, '/sk/api/catalog/**'), undefined)
  assert.deepEqual(Reflect.get(rules, '/sk/gym-scan'), {redirect:{to:'/sk/demo',statusCode:308}})
})
test('Slovak count forms distinguish one, few, fractions and other', () => {
  assert.deepEqual([1,2,4,1.5,0,5,21].map(n=>slovakPluralRule(n,4)), [0,1,1,2,3,3,3])
})


test('canonical alternates keep gym context but discard redundant language queries and anchors', () => {
  const path = '/sk/machines/custom?gym=identity&lang=sk#instructions'
  assert.equal(siteCanonicalPath(path, 'en'), '/machines/custom?gym=identity')
  assert.deepEqual(siteLocaleAlternates(path).map(item => item.path), [
    '/machines/custom?gym=identity', '/sk/machines/custom?gym=identity', '/machines/custom?gym=identity',
  ])
})

test('discovery counts use Slovak plural categories and locale-aware numbers', async () => {
  const { discoveryCount, discoveryWeekdays } = await import('../utils/discoveryCopy.ts')
  assert.equal(discoveryCount(1, 'exercises', 'sk'), '1 cvik')
  assert.equal(discoveryCount(2, 'exercises', 'sk'), '2 cviky')
  assert.equal(discoveryCount(5, 'exercises', 'sk'), '5 cvikov')
  assert.equal(discoveryCount(1.5, 'exercises', 'sk'), '1,5 cviku')
  assert.equal(discoveryCount(1000, 'exercises', 'sk'), `${(1000).toLocaleString('sk')} cvikov`)
  assert.equal(discoveryCount(1, 'experience', 'sk'), '1 rok praxe')
  assert.equal(discoveryCount(4, 'rounds', 'sk'), '4 kolá')
  assert.equal(discoveryCount(1, 'exercises', 'en'), '1 exercise')
  assert.equal(discoveryWeekdays('sk')[0], 'Pondelok')
})
