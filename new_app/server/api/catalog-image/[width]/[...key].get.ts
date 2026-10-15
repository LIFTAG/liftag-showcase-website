import { Buffer } from 'node:buffer'
import type { H3Event } from 'h3'
import sharp from 'sharp'
import { catalogImageUpstream, isCatalogImageWidth } from '~/utils/catalogImage'

/**
 * One allowlisted catalog/gym photo, re-encoded as WebP at one allowlisted
 * width (see utils/catalogImage.ts). Never a general-purpose proxy: the key
 * pattern pins the upstream to the public media bucket's photo prefixes.
 *
 * Variants are cached by the CDN (s-maxage) and by browsers for a week, which
 * is roughly what the S3 originals get today from heuristic freshness. Keys
 * like `<slug>_1.webp` can be overwritten in place, so this stays well short
 * of `immutable`.
 *
 * Lives outside /api/catalog/** on purpose: that route rule's short JSON
 * cache-control must not be applied on top of these headers.
 */
const VARIANT_CACHE = 'public, max-age=604800, s-maxage=2592000, stale-while-revalidate=86400'
const SHORT_CACHE = 'public, max-age=300'
const MAX_SOURCE_BYTES = 20 * 1024 * 1024
const MAX_SOURCE_PIXELS = 50_000_000

function notFound(event: H3Event) {
  setResponseStatus(event, 404)
  setHeader(event, 'cache-control', SHORT_CACHE)
  return ''
}

export default defineEventHandler(async (event) => {
  const rawWidth = getRouterParam(event, 'width') ?? ''
  const width = Number(rawWidth)
  const upstream = catalogImageUpstream(getRouterParam(event, 'key') ?? '')
  // String round-trip rejects "0320"/"320.0" so each variant has one URL.
  if (!isCatalogImageWidth(width) || String(width) !== rawWidth || !upstream) return notFound(event)

  let response: Response
  try {
    response = await fetch(upstream, { redirect: 'error', signal: AbortSignal.timeout(10000) })
  } catch {
    setResponseStatus(event, 502)
    setHeader(event, 'cache-control', 'no-store')
    return ''
  }
  // S3 answers 403 rather than 404 for a missing key on a non-listable bucket.
  if (!response.ok) return notFound(event)

  const declared = Number(response.headers.get('content-length'))
  if (declared > MAX_SOURCE_BYTES) {
    setHeader(event, 'cache-control', SHORT_CACHE)
    return sendRedirect(event, upstream, 302)
  }

  const input = Buffer.from(await response.arrayBuffer())
  try {
    if (input.byteLength > MAX_SOURCE_BYTES) throw new Error('source too large')
    const output = await sharp(input, { limitInputPixels: MAX_SOURCE_PIXELS })
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 76, effort: 4 })
      .toBuffer()
    setHeaders(event, {
      'content-type': 'image/webp',
      'cache-control': VARIANT_CACHE,
      'x-content-type-options': 'nosniff',
    })
    return output
  } catch (error) {
    // Undecodable or oversized source: hand the browser the original rather
    // than a broken image. The redirect target is the allowlisted upstream.
    console.error('[catalog-image]', upstream, error)
    setHeader(event, 'cache-control', SHORT_CACHE)
    return sendRedirect(event, upstream, 302)
  }
})
