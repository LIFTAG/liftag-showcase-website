export type CatalogLocale = 'en' | 'sk'

/** Accept-Language / query values we actually fetch. `cs` is rejected: the API still returns English. */
export function parseCatalogLocale(value: unknown): CatalogLocale {
  const raw = Array.isArray(value) ? value[0] : value
  return raw === 'sk' ? 'sk' : 'en'
}

export function exerciseIndexPath(locale: CatalogLocale = 'en'): string {
  return locale === 'sk' ? '/sk/exercises' : '/exercises'
}

export function exercisePath(slug: string, locale: CatalogLocale = 'en'): string {
  return `${exerciseIndexPath(locale)}/${slug}`
}

/**
 * hreflang set for the exercise library. No `cs`: Czech Accept-Language still
 * returns English catalog copy, so there are no `/cs/exercises` routes.
 */
export function exerciseHreflangAlternates(slug?: string): Array<{ hreflang: string, path: string }> {
  const en = slug ? `/exercises/${slug}` : '/exercises'
  const sk = slug ? `/sk/exercises/${slug}` : '/sk/exercises'
  return [
    { hreflang: 'en', path: en },
    { hreflang: 'sk', path: sk },
    { hreflang: 'x-default', path: en },
  ]
}

/** API category `name` stays English; SK chips use this map. */
export const SK_MUSCLE_NAMES: Record<string, string> = {
  chest: 'Hrudník',
  back: 'Chrbát',
  shoulders: 'Ramena',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Predlaktia',
  quadriceps: 'Kvadriceps',
  hamstrings: 'Hamstringy',
  calves: 'Lýtka',
  glutes: 'Gluteus',
  abs: 'Brucho',
  cardio: 'Kardio',
}

export function muscleDisplayName(
  slug: string,
  fallback: string,
  locale: CatalogLocale = 'en',
): string {
  if (locale === 'sk') return SK_MUSCLE_NAMES[slug] ?? fallback
  return fallback
}

/** SK has no muscle-hub routes; chips stay on the SK library with a filter. */
export function muscleChipPath(slug: string, locale: CatalogLocale = 'en'): string {
  if (locale === 'sk') return `${exerciseIndexPath('sk')}?muscle=${slug}`
  return `/muscles/${slug}`
}
