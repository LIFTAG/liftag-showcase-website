import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  CATALOG_VIDEOS_ENABLED,
  catalogHasVideo,
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
