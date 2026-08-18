import type { CatalogVideo } from '~/types/catalog'

/**
 * Public catalog instruction videos. Flip on when the library is ready to
 * show play CTAs, tile badges, hover previews, and VideoObject markup.
 */
export const CATALOG_VIDEOS_ENABLED = false

/** Pick the same deterministic instruction video everywhere the catalog appears. */
export function preferredCatalogVideoUrl(videos: readonly CatalogVideo[]): string | null {
  if (!CATALOG_VIDEOS_ENABLED) return null

  const ordered = videos
    .filter(video => Boolean(video.url))
    .sort((a, b) => a.displayOrder - b.displayOrder)

  return (ordered.find(video => video.locale === 'en') ?? ordered[0])?.url ?? null
}

export function catalogHasVideo(videos: readonly CatalogVideo[]): boolean {
  return CATALOG_VIDEOS_ENABLED && videos.some(video => Boolean(video.url))
}
