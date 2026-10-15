import type { CatalogIndexExercise } from '../types/catalog'

export function compareCatalogPopularity(
  a: Pick<CatalogIndexExercise, 'popularity' | 'name'>,
  b: Pick<CatalogIndexExercise, 'popularity' | 'name'>,
  locale?: string,
): number {
  const byPopularity = (b.popularity ?? 0) - (a.popularity ?? 0)
  if (byPopularity !== 0) return byPopularity
  return locale ? a.name.localeCompare(b.name, locale) : a.name.localeCompare(b.name)
}

export function sortCatalogByPopularity<T extends Pick<CatalogIndexExercise, 'popularity' | 'name'>>(
  rows: readonly T[],
  locale?: string,
): T[] {
  return [...rows].sort((a, b) => compareCatalogPopularity(a, b, locale))
}

/** Primary-muscle matches first, then exercises that only list the muscle as secondary. */
export function partitionExercisesByMuscle(
  exercises: readonly CatalogIndexExercise[],
  muscle: string,
  locale?: string,
): { primary: CatalogIndexExercise[], secondary: CatalogIndexExercise[] } {
  const primary: CatalogIndexExercise[] = []
  const secondary: CatalogIndexExercise[] = []

  for (const exercise of exercises) {
    if (exercise.primaryCategory === muscle) primary.push(exercise)
    else if (exercise.categories.includes(muscle)) secondary.push(exercise)
  }

  return {
    primary: sortCatalogByPopularity(primary, locale),
    secondary: sortCatalogByPopularity(secondary, locale),
  }
}

/** Exercises per muscle slug, counting an exercise once even if it lists the muscle twice. */
export function catalogCategoryCounts(
  exercises: readonly Pick<CatalogIndexExercise, 'primaryCategory' | 'categories'>[],
): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const exercise of exercises) {
    for (const slug of new Set([exercise.primaryCategory, ...exercise.categories])) {
      if (!slug) continue
      counts[slug] = (counts[slug] ?? 0) + 1
    }
  }
  return counts
}

/**
 * Related lifts for an exercise page: the guide's own order first, then rows
 * sharing the primary muscle in index order, capped at `limit`. Never the
 * exercise itself, never a row twice.
 */
export function pickRelatedExercises<T extends Pick<CatalogIndexExercise, 'id' | 'slug' | 'primaryCategory'>>(
  rows: readonly T[],
  current: { id?: string | null, primaryCategory?: string | null, relatedSlugs?: readonly string[] | null },
  limit = 8,
): T[] {
  const bySlug = new Map(rows.map(row => [row.slug, row]))
  const picked: T[] = []
  const seen = new Set<string>()

  for (const slug of current.relatedSlugs ?? []) {
    const row = bySlug.get(slug)
    if (!row || row.id === current.id || seen.has(row.id)) continue
    picked.push(row)
    seen.add(row.id)
  }

  const primary = current.primaryCategory
  if (primary) {
    for (const row of rows) {
      if (picked.length >= limit) break
      if (row.id === current.id || seen.has(row.id)) continue
      if (row.primaryCategory !== primary) continue
      picked.push(row)
      seen.add(row.id)
    }
  }

  return picked.slice(0, limit)
}

export function sliceMuscleGroups<T>(
  primary: readonly T[],
  secondary: readonly T[],
  visibleCount: number,
): { visiblePrimary: T[], visibleSecondary: T[], showSplit: boolean } {
  const limit = Math.max(0, visibleCount)
  const visiblePrimary = primary.slice(0, limit)
  const leftover = limit - visiblePrimary.length
  const visibleSecondary = leftover > 0 ? secondary.slice(0, leftover) : []

  return {
    visiblePrimary,
    visibleSecondary,
    showSplit: secondary.length > 0 && visiblePrimary.length === primary.length,
  }
}
