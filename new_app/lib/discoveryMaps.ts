import { importLibrary, setOptions } from '@googlemaps/js-api-loader'

let configured = false

const MAPS_OPTIONS = { v: 'quarterly' } as const
/** Requested together in loadDiscoveryMaps, in this order. */
const MAPS_LIBRARIES = ['maps', 'marker'] as const

/**
 * The exact bootstrap URL @googlemaps/js-api-loader injects for
 * loadDiscoveryMaps: libraries first, then the options in insertion order,
 * then the loader's callback. ExploreView preloads it from the SSR head, so
 * the SDK download starts with the HTML instead of after hydration, the client
 * map chunk and the loader. tests/discoveryMaps.test.ts runs the real loader
 * against this, so a loader upgrade that changes the URL fails the build
 * rather than silently double-downloading.
 */
export function discoveryMapsScriptUrl(key: string): string {
  const params = new URLSearchParams()
  params.set('libraries', MAPS_LIBRARIES.join(','))
  params.set('key', key)
  params.set('v', MAPS_OPTIONS.v)
  params.set('callback', 'google.maps.__ib__')
  return `https://maps.googleapis.com/maps/api/js?${params}`
}

/**
 * Called by the client map, and earlier by ExploreView while it hydrates.
 * Repeat calls share the SDK's single bootstrap, and a failed bootstrap
 * retries on the next call. SDK configuration is shared across route visits.
 */
export async function loadDiscoveryMaps(key: string) {
  if (!configured) {
    setOptions({ key, ...MAPS_OPTIONS })
    configured = true
  }
  const [maps, marker] = MAPS_LIBRARIES
  return Promise.all([importLibrary(maps), importLibrary(marker)])
}
