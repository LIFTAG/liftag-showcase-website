import type { H3Event } from 'h3'
import type { DiscoveryLocale } from '../../types/discovery'
import { DISCOVERY_UUID, defaultDiscoveryLocale, discoveryLocale, normalizedIds } from '../../utils/discovery'
import { discoveryRecord } from '../../utils/discoveryData'

export function discoveryParam(event: H3Event, key = 'id'): string {
  const id = getRouterParam(event, key) ?? ''
  if (!DISCOVERY_UUID.test(id)) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  return id
}
export function discoveryUserId(event: H3Event): string {
  const id = getRouterParam(event, 'userId') ?? ''
  if (!/^[1-9]\d{0,14}$/.test(id)) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  return id
}
export function requestedDiscoveryLocale(event: H3Event): DiscoveryLocale | undefined {
  return discoveryLocale(getQuery(event).lang)
}
export function discoveryListQuery(
  event: H3Event,
  equipment = false,
): Record<string, string | number | string[]> {
  const q = getQuery(event),
    result: Record<string, string | number | string[]> = {}
  for (const [key, fallback, max] of [
    ['page', 1, 10000],
    ['limit', 24, 100],
  ] as const) {
    const value = q[key] === undefined ? fallback : Number(q[key])
    if (!Number.isInteger(value) || value < 1 || value > max)
      throw createError({ statusCode: 422, statusMessage: 'Invalid pagination' })
    result[key] = value
  }
  if (typeof q.search === 'string' && q.search.trim()) result.search = q.search.trim().slice(0, 200)
  for (const [queryKey, wireKey, cap] of [
    ['manufacturers', 'machineManufacturerIds[]', equipment ? 100 : 200],
    ...(equipment ? [['categories', 'categoryIds[]', 32] as const] : []),
  ] as const) {
    const ids = normalizedIds(q[queryKey], cap)
    if (ids.length) result[wireKey] = ids
  }
  return result
}
export function discoveryNumber(event: H3Event, key: string, min: number, max: number): number {
  const q = getQuery(event),
    value = Number(q[key])
  if (q[key] === undefined || !Number.isFinite(value) || value < min || value > max)
    throw createError({ statusCode: 422, statusMessage: `Invalid ${key}` })
  return value
}
/** Only callers with fixed upstream paths can use this helper. No session forwarding. */
export async function readDiscoveryApi(
  event: H3Event,
  path: string,
  query: Record<string, string | number | string[]> = {},
  locale: DiscoveryLocale = 'en',
): Promise<unknown> {
  setHeader(event, 'Cache-Control', 'no-store')
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query))
    for (const item of Array.isArray(value) ? value : [value]) params.append(key, String(item))
  params.set('lang', locale)
  try {
    return await $fetch(`${path}?${params}`, {
      baseURL: String(useRuntimeConfig().public.apiBaseUrl),
      headers: { 'Accept-Language': locale },
      timeout: 12000,
      retry: 0,
    })
  } catch (error) {
    const r = discoveryRecord(error),
      response = discoveryRecord(r.response)
    const status = Number(r.statusCode ?? response.status)
    if ([401, 403, 404, 410].includes(status))
      throw createError({ statusCode: 404, statusMessage: 'Not found' })
    if (status === 422) throw createError({ statusCode: 422, statusMessage: 'Invalid discovery query' })
    throw createError({ statusCode: 502, statusMessage: 'LIFTAG is temporarily unavailable' })
  }
}
/** First response supplies the gym's timezone when there is no explicit language. */
export async function readLocalizedGym(
  event: H3Event,
  path: string,
  query: Record<string, string | number> = {},
) {
  const preferred = requestedDiscoveryLocale(event)
  let locale: DiscoveryLocale = preferred ?? 'en'
  let response = discoveryRecord(await readDiscoveryApi(event, path, query, locale))
  const timezone = discoveryRecord(discoveryRecord(response.data).gym).timezone
  const desired = preferred ?? defaultDiscoveryLocale(typeof timezone === 'string' ? timezone : null)
  if (desired !== locale) {
    locale = desired
    response = discoveryRecord(await readDiscoveryApi(event, path, query, locale))
  }
  return { data: response.data, locale }
}
