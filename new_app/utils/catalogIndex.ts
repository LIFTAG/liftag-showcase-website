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
