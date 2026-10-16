let configured = false

/** Called only by the client map. SDK configuration is shared across route visits. */
export async function loadDiscoveryMaps(key: string) {
  const { setOptions, importLibrary } = await import('@googlemaps/js-api-loader')
  if (!configured) {
    setOptions({ key, v: 'quarterly' })
    configured = true
  }
  return Promise.all([importLibrary('maps'), importLibrary('marker')])
}
