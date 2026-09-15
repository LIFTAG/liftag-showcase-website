import assert from 'node:assert/strict'
import { test } from 'node:test'
import { exerciseHlsConfig, exerciseHlsRequestUrl } from '../utils/exerciseHls.ts'

const origin = 'https://liftag-media-997916278530-eu-central-1-an.s3.eu-central-1.amazonaws.com'
const base = `${origin}/catalog/exercise-templates/incline-dumbbell-press/videos/20260828T124537Z/`

test('catalog playlists and segments use the CDN for their original environment', () => {
  for (const path of ['master.m3u8', 'video/playlist.m3u8', 'audio/en/playlist.m3u8', 'video/segment_000.ts', 'audio/sk/segment_000.ts']) {
    const source = new URL(path, base).href
    const versioned = exerciseHlsRequestUrl(source)
    assert.equal(versioned, `https://d3tf9y94un7tuc.cloudfront.net/incline-dumbbell-press/videos/20260828T124537Z/${path}`)
    assert.equal(exerciseHlsRequestUrl(versioned), versioned)
    const calls: unknown[][] = []
    exerciseHlsConfig.xhrSetup!({ open: (...args: unknown[]) => calls.push(args) } as XMLHttpRequest, source)
    assert.deepEqual(calls, [['GET', versioned, true]])
  }
  const prod = base.replace('liftag-media-997916278530-eu-central-1-an', 'liftag-media-prod-997916278530-eu-central-1')
  assert.equal(exerciseHlsRequestUrl(`${prod}master.m3u8`), 'https://dg7n4oxpac1h9.cloudfront.net/incline-dumbbell-press/videos/20260828T124537Z/master.m3u8')
})

test('relative video and audio resources stay on the CDN and legacy cache versions are removed', () => {
  const master = exerciseHlsRequestUrl(`${base}master.m3u8?liftag_hls=1`)
  assert.equal(master, exerciseHlsRequestUrl(`${base}master.m3u8`))
  const playlist = new URL('audio/sk/playlist.m3u8', master).href
  assert.equal(playlist, 'https://d3tf9y94un7tuc.cloudfront.net/incline-dumbbell-press/videos/20260828T124537Z/audio/sk/playlist.m3u8')
  assert.equal(exerciseHlsRequestUrl(playlist), playlist)
  assert.equal(new URL('segment_000.ts', playlist).href, 'https://d3tf9y94un7tuc.cloudfront.net/incline-dumbbell-press/videos/20260828T124537Z/audio/sk/segment_000.ts')
})

test('signed, external, same-origin and non-catalog URLs retain their original request semantics', () => {
  for (const source of [
    `${base}master.m3u8?X-Amz-Signature=example`,
    `${base}master.m3u8?token=example`,
    '/api/gym-coaching-media/20260707T143627Z/master.m3u8',
    'https://example.com/master.m3u8',
    `${origin}/private/master.m3u8`,
  ]) {
    assert.equal(exerciseHlsRequestUrl(source), source)
    exerciseHlsConfig.xhrSetup!({ open: () => assert.fail('Should use the default loader URL') } as unknown as XMLHttpRequest, source)
  }
})
