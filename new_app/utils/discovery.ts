import { siteLocalePath } from './siteLocale.ts'
import type {
  Coordinate,
  DiscoveryFilters,
  DiscoveryLocale,
  ExploreGym,
  MapViewport,
} from '../types/discovery.ts'

export {
  siteLocale as discoveryLocale,
  defaultSiteLocale as defaultDiscoveryLocale,
  resolveSiteLocale as resolveDiscoveryLocale,
} from './siteLocale.ts'

export const DISCOVERY_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const DISCOVERY_DEFAULT_VIEW: MapViewport = {
  lat: 49.25,
  lng: 17.2,
  zoom: 7,
  north: 51.1,
  south: 47.5,
  west: 12,
  east: 22.6,
}
export const DISTANCE_OPTIONS = [1, 3, 5, 10, 25]
export function emptyDiscoveryFilters(): DiscoveryFilters {
  return { distance: null, rating: null, open: false, supported: false, manufacturers: [] }
}
export function discoveryHref(
  path: string,
  locale: DiscoveryLocale,
  query: Record<string, string | number | undefined> = {},
): string {
  const params = new URLSearchParams({ lang: locale })
  for (const [key, value] of Object.entries(query)) if (value !== undefined) params.set(key, String(value))
  return `${siteLocalePath(path, locale)}?${params}`
}
export function distanceKm(a: Coordinate, b: Coordinate): number {
  const rad = Math.PI / 180
  const s =
    Math.sin(((b.lat - a.lat) * rad) / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(((b.lng - a.lng) * rad) / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, s)))
}
export function discoveryMode(
  search: string,
  filters: DiscoveryFilters,
  location: Coordinate | null,
): 'search' | 'nearby' | 'map' {
  return search.trim() ? 'search' : filters.distance !== null && location ? 'nearby' : 'map'
}
export const MAP_VIEWPORT_KEYS = ['lat', 'lng', 'zoom', 'north', 'south', 'west', 'east'] as const
/** Compared on every map idle event, so it reads the seven fields rather than serialising. */
export function sameViewport(a: MapViewport, b: MapViewport): boolean {
  return MAP_VIEWPORT_KEYS.every((key) => a[key] === b[key])
}
/** Match the app's five-decimal cache precision; camera center jitter is not a new area. */
export function discoveryMapKey(view: MapViewport): number[] {
  return [view.north, view.south, view.west, view.east, view.zoom].map((value) =>
    Math.round(value * 100000) / 100000,
  )
}
export function filterDiscoveryGyms(
  gyms: ExploreGym[],
  filters: DiscoveryFilters,
  search: string,
  location: Coordinate | null,
): ExploreGym[] {
  if (search.trim()) return gyms
  return gyms.filter(
    (gym) =>
      (filters.rating === null || (gym.rating !== null && gym.rating >= filters.rating)) &&
      (!filters.open || gym.isOpen === true) &&
      (!filters.supported || gym.supported) &&
      (filters.distance === null || !location || distanceKm(location, gym) <= filters.distance),
  )
}
export function activeDiscoveryFilters(f: DiscoveryFilters): number {
  return (
    Number(f.distance !== null) +
    Number(f.rating !== null) +
    Number(f.open) +
    Number(f.supported) +
    Number(f.manufacturers.length > 0)
  )
}
/** Filter chips add and remove ids from the same sorted, deduped lists. */
export function toggleDiscoveryId(values: string[], id: string): string[] {
  return values.includes(id) ? values.filter((value) => value !== id) : [...values, id].sort()
}
export function normalizedIds(value: unknown, cap = 200): string[] {
  const parts = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : []
  return [...new Set(parts.filter((id): id is string => typeof id === 'string' && DISCOVERY_UUID.test(id)))]
    .sort()
    .slice(0, cap)
}
/** Google can return bounds crossing ±180°. Each API request must have west < east. */
export function splitMapBounds(
  view: MapViewport,
): Pick<MapViewport, 'north' | 'south' | 'west' | 'east' | 'zoom'>[] {
  const { north, south, west, east } = view
  if (![north, south, west, east, view.zoom].every(Number.isFinite) || north <= south) return []
  const base = {
    north: Math.min(90, north),
    south: Math.max(-90, south),
    zoom: Math.max(0, Math.min(22, Math.round(view.zoom))),
  }
  if (east - west >= 360) return [{ ...base, west: -180, east: 180 }]
  const wrap = (n: number) => ((((n + 180) % 360) + 360) % 360) - 180
  const w = wrap(west),
    e = east === 180 ? 180 : wrap(east)
  if (w === e) return []
  return w < e
    ? [{ ...base, west: w, east: e }]
    : [
        { ...base, west: w, east: 180 },
        { ...base, west: -180, east: e },
      ].filter((b) => b.west < b.east)
}
export function safeDiscoveryUrl(value: unknown, contact = false): string | null {
  if (typeof value !== 'string' || !value.trim()) return null
  try {
    const url = new URL(value)
    return (contact ? ['https:', 'http:', 'tel:', 'mailto:'] : ['https:', 'http:']).includes(url.protocol)
      ? url.href
      : null
  } catch {
    return null
  }
}
export function googleDirections(gym: Coordinate): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${gym.lat},${gym.lng}`
}
/** Provisional bounds until Google's first idle event supplies the actual viewport. */
export function discoveryViewport(point: Coordinate, zoom: number): MapViewport {
  const span = (360 / 2 ** zoom) * 2
  return {
    ...point,
    zoom,
    north: Math.min(85, point.lat + span / 2),
    south: Math.max(-85, point.lat - span / 2),
    west: point.lng - span,
    east: point.lng + span,
  }
}
/** The inverse of readDiscoveryQuery; the pair must round-trip. */
export function writeDiscoveryQuery(state: {
  filters: DiscoveryFilters
  search: string
  selectedId: string | null
  viewport: MapViewport
}): Record<string, string> {
  const f = state.filters,
    v = state.viewport
  return {
    ...(state.search ? { q: state.search } : {}),
    lat: String(v.lat),
    lng: String(v.lng),
    zoom: String(v.zoom),
    north: String(v.north),
    south: String(v.south),
    west: String(v.west),
    east: String(v.east),
    ...(state.selectedId ? { gym: state.selectedId } : {}),
    ...(f.distance !== null ? { distance: String(f.distance) } : {}),
    ...(f.rating !== null ? { rating: String(f.rating) } : {}),
    ...(f.open ? { open: '1' } : {}),
    ...(f.supported ? { supported: '1' } : {}),
    ...(f.manufacturers.length ? { manufacturers: f.manufacturers.join(',') } : {}),
  }
}
export function readDiscoveryQuery(query: Record<string, unknown>): {
  filters: DiscoveryFilters
  search: string
  selectedId: string | null
  viewport: MapViewport
} {
  const filters = emptyDiscoveryFilters()
  const d = Number(query.distance),
    r = Number(query.rating)
  filters.distance = DISTANCE_OPTIONS.includes(d) ? d : null
  filters.rating = [1, 2, 3, 4, 5].includes(r) ? r : null
  filters.open = query.open === '1'
  filters.supported = query.supported === '1'
  filters.manufacturers = normalizedIds(query.manufacturers)
  const lat = Number(query.lat),
    lng = Number(query.lng),
    zoom = Number(query.zoom)
  const viewport =
    query.lat !== undefined &&
    query.lng !== undefined &&
    Number.isFinite(lat) &&
    Math.abs(lat) <= 85 &&
    Number.isFinite(lng) &&
    Math.abs(lng) <= 180 &&
    Number.isFinite(zoom) &&
    zoom >= 0 &&
    zoom <= 22
      ? discoveryViewport({ lat, lng }, zoom)
      : { ...DISCOVERY_DEFAULT_VIEW }
  const bounds = {
    north: Number(query.north),
    south: Number(query.south),
    west: Number(query.west),
    east: Number(query.east),
  }
  if (
    Object.values(bounds).every(Number.isFinite) &&
    bounds.north <= 90 &&
    bounds.south >= -90 &&
    bounds.north > bounds.south &&
    Math.abs(bounds.west) <= 540 &&
    Math.abs(bounds.east) <= 540
  )
    Object.assign(viewport, bounds)
  return {
    filters,
    search: typeof query.q === 'string' ? query.q.slice(0, 200) : '',
    selectedId: typeof query.gym === 'string' && DISCOVERY_UUID.test(query.gym) ? query.gym : null,
    viewport,
  }
}
