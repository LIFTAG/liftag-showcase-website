import assert from 'node:assert/strict'
import { test } from 'node:test'

// Run the real @googlemaps/js-api-loader bootstrap against a minimal DOM and
// compare the script it injects with the URL ExploreView preloads. A preload
// that does not match byte for byte is a second, wasted SDK download.
test('the preloaded SDK URL is exactly the one the loader injects', async () => {
  const appended: Array<{ src?: string }> = []
  const scope = globalThis as Record<string, unknown>
  scope.window = globalThis
  scope.document = {
    createElement: () => ({}),
    querySelector: () => null,
    head: { append: (element: { src?: string }) => appended.push(element) },
  }

  const { discoveryMapsScriptUrl, loadDiscoveryMaps } = await import('../lib/discoveryMaps.ts')
  // Never resolves here: there is no SDK behind the callback.
  void loadDiscoveryMaps('test-key').catch(() => {})
  await new Promise(resolve => setTimeout(resolve, 0))

  assert.equal(appended.length, 1)
  assert.equal(appended[0]!.src, discoveryMapsScriptUrl('test-key'))
  assert.equal(
    discoveryMapsScriptUrl('test-key'),
    'https://maps.googleapis.com/maps/api/js?libraries=maps%2Cmarker&key=test-key&v=quarterly&callback=google.maps.__ib__',
  )

  // A second caller (the map component after ExploreView started the load)
  // shares the bootstrap instead of injecting another script.
  void loadDiscoveryMaps('test-key').catch(() => {})
  await new Promise(resolve => setTimeout(resolve, 0))
  assert.equal(appended.length, 1)
})
