import type { MuscleHubCopy } from '../types/muscleHub.ts'
import { MUSCLE_HUBS } from '../content/muscles.ts'
import { MUSCLE_HUBS_SK } from '../content/muscles.sk.ts'
export { MUSCLE_HUBS, MUSCLE_HUBS_SK }
export type { MuscleHubCopy } from '../types/muscleHub.ts'

const HUB_BY_SLUG = new Map(MUSCLE_HUBS.map(hub => [hub.slug, hub]))

export function musclePath(slug: string): string {
  return `/muscles/${slug}`
}

export function muscleHub(slug: string | null | undefined): MuscleHubCopy | null {
  if (!slug) return null
  return HUB_BY_SLUG.get(slug) ?? null
}

export function muscleHubForLocale(slug: string | null | undefined, locale: 'en' | 'sk' = 'en'): MuscleHubCopy | null {
  if (locale !== 'sk') return muscleHub(slug)
  if (!slug) return null
  return MUSCLE_HUBS_SK.find(hub => hub.slug === slug) ?? null
}

export function muscleHubsForLocale(locale: 'en' | 'sk' = 'en'): MuscleHubCopy[] {
  return locale === 'sk' ? MUSCLE_HUBS_SK : MUSCLE_HUBS
}

export function isMuscleSlug(slug: string): boolean {
  return HUB_BY_SLUG.has(slug)
}
