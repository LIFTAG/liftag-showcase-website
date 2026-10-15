import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  CATALOG_IMAGE_WIDTHS,
  catalogImagePreconnect,
  catalogImageSrcset,
  catalogImageUpstream,
  catalogImageUrl,
  isCatalogImageWidth,
} from '../utils/catalogImage.ts'

const ORIGIN = 'https://liftag-media-prod-997916278530-eu-central-1.s3.eu-central-1.amazonaws.com'
const EXERCISE = `${ORIGIN}/catalog/exercise-templates/lat-pulldown/images/lat-pulldown_1.webp`
const GYM = `${ORIGIN}/gyms/4925c073-e673-4850-920a-642f4607b87a/photos/3b9b6fa0-d82d-4bc5-9798-c746eee6ff50.png`

test('catalog and gym photos resolve to a same-origin resized variant', () => {
  assert.equal(
    catalogImageUrl(EXERCISE, 360),
    '/api/catalog-image/360/catalog/exercise-templates/lat-pulldown/images/lat-pulldown_1.webp',
  )
  assert.equal(
    catalogImageUrl(GYM, 160),
    '/api/catalog-image/160/gyms/4925c073-e673-4850-920a-642f4607b87a/photos/3b9b6fa0-d82d-4bc5-9798-c746eee6ff50.png',
  )
  assert.equal(
    catalogImageSrcset(EXERCISE, [240, 480]),
    '/api/catalog-image/240/catalog/exercise-templates/lat-pulldown/images/lat-pulldown_1.webp 240w, '
    + '/api/catalog-image/480/catalog/exercise-templates/lat-pulldown/images/lat-pulldown_1.webp 480w',
  )
})

test('the route maps every generated key back to the same upstream object', () => {
  for (const source of [EXERCISE, GYM]) {
    const variant = catalogImageUrl(source, 640)
    const key = variant.replace('/api/catalog-image/640/', '')
    assert.equal(catalogImageUpstream(key), source)
  }
})

test('anything the route cannot serve is passed through untouched', () => {
  for (const source of [
    'https://example.com/catalog/exercise-templates/a/images/a_1.webp',
    `${EXERCISE}?X-Amz-Signature=abc`,
    `${EXERCISE}#frag`,
    `${ORIGIN}/users/1/avatar.png`,
    `${ORIGIN}/catalog/exercise-templates/a/videos/master.m3u8`,
    `${ORIGIN}/catalog/exercise-templates/a%20b/images/a_1.webp`,
    '/assets/logo.svg',
    'not a url',
  ]) {
    assert.equal(catalogImageUrl(source, 360), source, source)
    assert.equal(catalogImageSrcset(source, [360]), undefined, source)
  }
  assert.equal(catalogImageUrl(null, 360), null)
  assert.equal(catalogImageUrl('', 360), null)
  assert.equal(catalogImageSrcset(undefined, [360]), undefined)
})

test('the route rejects traversal, foreign prefixes and non-image keys', () => {
  for (const key of [
    '',
    '../catalog/a.webp',
    'catalog/../gyms/a.webp',
    'catalog/./a.webp',
    'catalog/.hidden.webp',
    '/catalog/a.webp',
    'catalog//a.webp',
    'catalog/a.webp?x=1',
    'catalog/a%2e%2e/a.webp',
    'catalog\\a.webp',
    'catalog/a.svg',
    'catalog/a.gif',
    'catalog',
    'users/1/avatar.png',
    'https://example.com/catalog/a.webp',
  ]) {
    assert.equal(catalogImageUpstream(key), null, key)
  }
  assert.equal(catalogImageUpstream('catalog/machine-templates/x/images/X_1.JPG'), `${ORIGIN}/catalog/machine-templates/x/images/X_1.JPG`)
  const brandPhoto = 'portal/brands/b01f86a9/machine-configs/21e8fb75/photos/b100e2b4.png'
  assert.equal(catalogImageUpstream(brandPhoto), `${ORIGIN}/${brandPhoto}`)
  assert.equal(catalogImageUpstream('portal/users/1/a.png'), null)
})

test('preconnect only targets photos that still load cross-origin', () => {
  assert.equal(catalogImagePreconnect(EXERCISE), null)
  assert.equal(catalogImagePreconnect(GYM), null)
  assert.equal(catalogImagePreconnect('https://cdn.example/a/b.webp'), 'https://cdn.example')
  assert.equal(catalogImagePreconnect(`${EXERCISE}?X-Amz-Signature=abc`), ORIGIN)
  assert.equal(catalogImagePreconnect('/assets/logo.svg'), null)
  assert.equal(catalogImagePreconnect(null), null)
})

test('only the closed width set is servable', () => {
  for (const width of CATALOG_IMAGE_WIDTHS) assert.equal(isCatalogImageWidth(width), true)
  for (const width of [0, 1, 359, 361, 2000, 360.5, Number.NaN, '360']) {
    assert.equal(isCatalogImageWidth(width), false, String(width))
  }
})
