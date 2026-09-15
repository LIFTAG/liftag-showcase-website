import type { ExerciseOverlay } from '~/types/exerciseOverlay'
import type { SiteLocale } from '~/types/locale'
export type { ExerciseOverlay, ExerciseOverlayLink, ExerciseOverlayMistake } from '~/types/exerciseOverlay'
const modules = import.meta.glob<{ default: ExerciseOverlay }>(['../content/exercises/*.ts', '../content/exercises/sk/*.ts'])
export async function exerciseOverlay(slug: string | null | undefined, locale: SiteLocale = 'en'): Promise<ExerciseOverlay | null> {
  if (!slug) return null
  const load = modules[`../content/exercises/${locale === 'sk' ? 'sk/' : ''}${slug}.ts`]
  return load ? (await load()).default : null
}
export function overlayCount(): number {
  return Object.keys(modules).filter(path => !path.includes('/sk/')).length
}
