/**
 * Same-origin, resized catalog and gym photos.
 *
 * The API hands out full-size S3 originals (exercise stills are ~1410px and
 * 60-85KB, gym photos ~145KB PNGs) that the site displays as 76-660px boxes,
 * over a second HTTP/1.1 origin. `/api/catalog-image/<width>/<key>` re-encodes
 * one allowlisted object as WebP at one allowlisted width, on the site's own
 * connection, and the CDN caches every variant (server/api/catalog-image).
 *
 * Anything this module does not recognise - another host, a query string, an
 * unexpected key - is returned unchanged, so a new media origin degrades to
 * the original photo rather than to a broken image.
 */

const MEDIA_ORIGIN = 'https://liftag-media-prod-997916278530-eu-central-1.s3.eu-central-1.amazonaws.com'
export const CATALOG_IMAGE_ROUTE = '/api/catalog-image/'

/** Every width the route renders. A closed set keeps the CDN cache bounded. */
export const CATALOG_IMAGE_WIDTHS = [96, 160, 240, 360, 480, 640, 828, 1080, 1440] as const
export type CatalogImageWidth = (typeof CATALOG_IMAGE_WIDTHS)[number]

// Public photo prefixes only: catalog stills, gym uploads, and brand-portal
// machine photos (gym equipment). Each segment starts with a word character,
// so "." and ".." can never form a path segment.
const KEY = /^(?:catalog|gyms|portal\/brands)(?:\/[A-Za-z0-9_-][A-Za-z0-9_.-]*)+$/
const IMAGE_EXTENSION = /\.(?:webp|png|jpe?g)$/i

export function isCatalogImageWidth(value: unknown): value is CatalogImageWidth {
  return (CATALOG_IMAGE_WIDTHS as readonly unknown[]).includes(value)
}

/** Object key -> upstream URL, or null for anything outside the public photo prefixes. */
export function catalogImageUpstream(key: string): string | null {
  if (!KEY.test(key) || !IMAGE_EXTENSION.test(key)) return null
  return `${MEDIA_ORIGIN}/${key}`
}

function catalogImageKey(source: string): string | null {
  try {
    const url = new URL(source)
    if (url.origin !== MEDIA_ORIGIN || url.search || url.hash) return null
    const key = url.pathname.slice(1)
    return catalogImageUpstream(key) ? key : null
  } catch {
    return null
  }
}

/** Resized same-origin URL for a catalog/gym photo; any other source is returned as-is. */
export function catalogImageUrl(source: string, width: CatalogImageWidth): string
export function catalogImageUrl(source: string | null | undefined, width: CatalogImageWidth): string | null
export function catalogImageUrl(source: string | null | undefined, width: CatalogImageWidth): string | null {
  if (!source) return null
  const key = catalogImageKey(source)
  return key ? `${CATALOG_IMAGE_ROUTE}${width}/${key}` : source
}

/**
 * Origin worth a `preconnect` for this photo: null when it is served through
 * the same-origin resize route (or is unusable), the foreign origin otherwise.
 */
export function catalogImagePreconnect(source: string | null | undefined): string | null {
  if (!source || catalogImageKey(source)) return null
  try {
    const { origin } = new URL(source)
    return origin.startsWith('http') ? origin : null
  } catch {
    return null
  }
}

/**
 * `srcset` across the given widths, or undefined when the source cannot be
 * resized (the plain `src` then carries the original on its own).
 */
export function catalogImageSrcset(
  source: string | null | undefined,
  widths: readonly CatalogImageWidth[],
): string | undefined {
  if (!source) return undefined
  const key = catalogImageKey(source)
  if (!key) return undefined
  return widths.map(width => `${CATALOG_IMAGE_ROUTE}${width}/${key} ${width}w`).join(', ')
}
