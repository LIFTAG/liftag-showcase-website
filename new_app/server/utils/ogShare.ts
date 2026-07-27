import type { Buffer } from 'node:buffer'
import type { H3Event } from 'h3'
import type { OgCardModel } from './ogCard'
import { renderOgCard } from './ogCard'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Shared handler body for the /api/og/* image routes. Fetches the entity
 * anonymously from the LIFTAG API (non-public entities 403/404 there), renders
 * the card, and falls back to the static og-image on any failure so crawlers
 * always receive a usable image.
 */
export async function serveOgCard(
  event: H3Event,
  fetchModel: (apiBaseUrl: string, id: string, femaleVariant: boolean) => Promise<OgCardModel>,
): Promise<Buffer | undefined> {
  const id = String(event.context.params?.id ?? '')
  if (UUID_RE.test(id)) {
    try {
      const { apiBaseUrl } = useRuntimeConfig(event).public
      const model = await fetchModel(String(apiBaseUrl), id, isFemaleVariantRequest(event))
      const png = await renderOgCard(model)
      setHeader(event, 'Content-Type', 'image/png')
      // Long CDN cache: card content only changes when the routine/plan is
      // edited, and messaging apps snapshot previews anyway.
      setHeader(event, 'Cache-Control', 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800')
      return png
    }
    catch {
      // Fall through to the static image.
    }
  }
  // Short cache: a private entity can become public (or the API can recover)
  // and the preview should start upgrading soon after.
  setHeader(event, 'Cache-Control', 'public, max-age=60, s-maxage=300')
  await sendRedirect(event, '/og-image.jpg', 302)
  return undefined
}

const CATALOG_EXERCISE_IMAGE_RES: readonly RegExp[] = [
  /^(.*\/catalog\/exercise-templates\/([^/?#]+)\/images\/)\2_(\d+)\.(webp|png)([?#].*)?$/i,
  /^(.*\/catalog\/exercise-categories\/([^/?#]+)\/images\/)\2_(\d+)\.(webp|png)([?#].*)?$/i,
]

/**
 * Same URL rewrite as the app's exerciseImageVariants: catalog images have a
 * female variant at `<slug>_f<n>.<ext>`. Returns null for non-catalog URLs
 * (user-uploaded overrides have no variant).
 */
export function getFemaleExerciseImageUrl(imageUrl: string): string | null {
  for (const imageRegex of CATALOG_EXERCISE_IMAGE_RES) {
    const match = imageRegex.exec(imageUrl)
    if (!match) continue
    const [, prefix, slug, index, extension, suffix = ''] = match
    return `${prefix}${slug}_f${index}.${extension}${suffix}`
  }
  return null
}

/**
 * Share links carry `?v=f` when the sharer's profile is female; the card then
 * prefers female exercise-image variants, falling back to the base image when
 * a template has none. Ordered candidate list for fetchTileImage.
 */
export function tileImageCandidates(imageUrl: string | null, femaleVariant: boolean): string[] {
  if (!imageUrl) return []
  if (!femaleVariant) return [imageUrl]
  const femaleUrl = getFemaleExerciseImageUrl(imageUrl)
  return femaleUrl && femaleUrl !== imageUrl ? [femaleUrl, imageUrl] : [imageUrl]
}

export function isFemaleVariantRequest(event: H3Event): boolean {
  return getQuery(event).v === 'f'
}

export function formatCount(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`
}

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
