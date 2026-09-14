import type { Coordinate } from '~/types/discovery'
export function useDiscoveryLocation() {
  const location = useState<Coordinate | null>('discovery-location', () => null)
  const locating = shallowRef(false),
    denied = shallowRef(false)
  let disposed = false
  onScopeDispose(() => {
    disposed = true
  })
  function locate(): Promise<Coordinate | null> {
    if (!import.meta.client || !navigator.geolocation) {
      denied.value = true
      return Promise.resolve(null)
    }
    locating.value = true
    denied.value = false
    return new Promise((resolve) =>
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const point = { lat: position.coords.latitude, lng: position.coords.longitude }
          if (!disposed) {
            location.value = point
            locating.value = false
          }
          resolve(point)
        },
        () => {
          if (!disposed) {
            locating.value = false
            denied.value = true
          }
          resolve(null)
        },
        { timeout: 10000, maximumAge: 60000 },
      ),
    )
  }
  return { location, locating, denied, locate }
}
