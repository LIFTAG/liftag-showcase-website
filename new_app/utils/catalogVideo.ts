import type { CatalogVideo } from '~/types/catalog'

/**
 * Public catalog instruction videos. Players, badges, VideoObject, and the
 * video sitemap only render for exercises that actually have a URL — this
 * flag is the global kill switch, not a per-row gate.
 */
export const CATALOG_VIDEOS_ENABLED = true

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

/**
 * CSS `aspect-ratio` from a decoded catalog still. Returns null until both
 * edges are usable so the player can keep its 16:9 fallback instead of 0.
 */
export function catalogMediaAspectRatio(width: number, height: number): number | null {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null
  }
  return width / height
}
