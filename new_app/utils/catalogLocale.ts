import { siteLocalePath, siteLocaleAlternates } from './siteLocale.ts'
import type { SiteLocale } from '../types/locale.ts'

export type CatalogLocale = SiteLocale

/** Accept-Language / query values we actually fetch. `cs` is rejected: the API still returns English. */
export function parseCatalogLocale(value: unknown): CatalogLocale {
  const raw = Array.isArray(value) ? value[0] : value
  return raw === 'sk' ? 'sk' : 'en'
}

export function exerciseIndexPath(locale: CatalogLocale = 'en'): string {
  return siteLocalePath('/exercises', locale)
}

export function exercisePath(slug: string, locale: CatalogLocale = 'en'): string {
  return `${exerciseIndexPath(locale)}/${slug}`
}

/**
 * hreflang set for the exercise library. No `cs`: Czech Accept-Language still
 * returns English catalog copy, so there are no `/cs/exercises` routes.
 */
export function exerciseHreflangAlternates(slug?: string): Array<{ hreflang: string, path: string }> {
  return siteLocaleAlternates(slug ? `/exercises/${slug}` : '/exercises')
}

/** API category `name` stays English; SK chips use this map. */
export const SK_MUSCLE_NAMES: Record<string, string> = {
  chest: 'Hrudník',
  back: 'Chrbát',
  shoulders: 'Ramená',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Predlaktia',
  quadriceps: 'Kvadriceps',
  hamstrings: 'Hamstringy',
  adductors: 'Adduktory',
  calves: 'Lýtka',
  glutes: 'Sedacie svaly',
  abs: 'Brucho',
  cardio: 'Kardio',
}

export function muscleDisplayName(
  slug: string,
  fallback: string,
  locale: CatalogLocale = 'en',
): string {
  // A translated API label stays authoritative. Only replace known English
  // fallback names from the legacy category contract.
  if (locale === 'sk' && fallback.trim().toLowerCase() === slug) return SK_MUSCLE_NAMES[slug] ?? fallback
  return fallback
}

/** Shared muscle hub slugs are identical in both languages. */
export function muscleChipPath(slug: string, locale: CatalogLocale = 'en'): string {
  return siteLocalePath(`/muscles/${slug}`, locale)
}
