import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  CATALOG_VIDEOS_ENABLED,
  catalogHasVideo,
  catalogMediaAspectRatio,
  preferredCatalogVideoUrl,
} from '../utils/catalogVideo.ts'

test('catalog videos are on for rows that actually have a URL', () => {
  assert.equal(CATALOG_VIDEOS_ENABLED, true)
  const videos = [
    { locale: 'en', url: 'https://cdn.example/master.m3u8', displayOrder: 0, uploadedByUserId: null },
  ]
  assert.equal(catalogHasVideo(videos), true)
  assert.equal(preferredCatalogVideoUrl(videos), videos[0].url)
  assert.equal(catalogHasVideo([]), false)
  assert.equal(preferredCatalogVideoUrl([]), null)
})

test('catalog stills expose their own aspect ratio, not a shared frame', () => {
  assert.equal(catalogMediaAspectRatio(1672, 941), 1672 / 941)
  assert.equal(catalogMediaAspectRatio(1448, 1086), 1448 / 1086)
  assert.equal(catalogMediaAspectRatio(0, 1080), null)
  assert.equal(catalogMediaAspectRatio(1080, 0), null)
  assert.equal(catalogMediaAspectRatio(Number.NaN, 1080), null)
})

test('video language selection prefers the requested locale, then English, then available media', () => {
  const videos = [
    {locale:'en',url:'en',displayOrder:0,uploadedByUserId:null},
    {locale:'sk',url:'sk-later',displayOrder:4,uploadedByUserId:null},
    {locale:'sk',url:'sk-first',displayOrder:1,uploadedByUserId:null},
  ]
  assert.equal(preferredCatalogVideoUrl(videos,'sk'),'sk-first')
  assert.equal(preferredCatalogVideoUrl(videos,'en'),'en')
  assert.equal(preferredCatalogVideoUrl(videos.slice(0,1),'sk'),'en')
  assert.equal(videos[1].url,'sk-later')
})
