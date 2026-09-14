import type { DiscoveryLocale } from '../types/discovery'
import { muscleDisplayName } from './catalogLocale.ts'

/** Resolved equipment and routine responses supply category slugs. */
export function discoveryMuscleName(slug: string, locale: DiscoveryLocale): string {
  const name = slug.replaceAll('-', ' ')
  return muscleDisplayName(slug, name.charAt(0).toUpperCase() + name.slice(1), locale)
}
