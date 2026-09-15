import type { HlsConfig } from 'hls.js'

// Managed by ops/aws/catalog-media-cdn.json. Each origin is restricted to
// /catalog/exercise-templates and always receives an Origin header from CloudFront.
const catalogMediaOrigins = new Map([
  ['https://liftag-media-997916278530-eu-central-1-an.s3.eu-central-1.amazonaws.com', 'https://d3tf9y94un7tuc.cloudfront.net'],
  ['https://liftag-media-prod-997916278530-eu-central-1.s3.eu-central-1.amazonaws.com', 'https://dg7n4oxpac1h9.cloudfront.net'],
])
const catalogPrefix = '/catalog/exercise-templates'

/** Use the media CDN for public catalog videos, preserving the source environment. */
export function exerciseHlsRequestUrl(source: string): string {
  try {
    const url = new URL(source)
    const cdnOrigin = catalogMediaOrigins.get(url.origin)
    if (!cdnOrigin || !/^\/catalog\/exercise-templates\/[^/]+\/videos\//.test(url.pathname)) return source
    // Preserve signed URLs and any externally supplied query semantics.
    for (const key of url.searchParams.keys()) {
      if (key !== 'liftag_hls') return source
    }
    return `${cdnOrigin}${url.pathname.slice(catalogPrefix.length)}${url.hash}`
  } catch {
    return source
  }
}

// Also handles absolute S3 URLs inside manifests. Relative children resolve on
// the CDN from the manifest response URL. Native players use the same mapping.
export const exerciseHlsConfig: Pick<HlsConfig, 'xhrSetup'> = {
  xhrSetup(xhr, source) {
    const url = exerciseHlsRequestUrl(source)
    if (url !== source) xhr.open('GET', url, true)
  },
}
