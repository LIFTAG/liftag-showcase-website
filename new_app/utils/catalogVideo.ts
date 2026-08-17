import type { CatalogVideo } from '~/types/catalog'

/** Pick the same deterministic instruction video everywhere the catalog appears. */
export function preferredCatalogVideoUrl(videos: readonly CatalogVideo[]): string | null {
  const ordered = videos
    .filter(video => Boolean(video.url))
    .sort((a, b) => a.displayOrder - b.displayOrder)

  return (ordered.find(video => video.locale === 'en') ?? ordered[0])?.url ?? null
}
