/**
 * Catalog muscle-group slug → `body-highlighter` polygon ids, plus the
 * primary/secondary heatmap used on exercise detail. Cardio / full-body /
 * unknown slugs have no entry and are omitted from the figure.
 */

export const SLUG_TO_MUSCLES: Record<string, string[]> = {
  chest: ['chest'],
  shoulders: ['front-deltoids', 'back-deltoids'],
  back: ['trapezius', 'upper-back', 'lower-back'],
  biceps: ['biceps'],
  triceps: ['triceps'],
  forearms: ['forearm'],
  abs: ['abs'],
  quadriceps: ['quadriceps'],
  hamstrings: ['hamstring'],
  glutes: ['gluteal'],
  calves: ['calves'],
}

/** 5-step dim→bright lime; muscle `frequency` (1–5) indexes via `frequency - 1`. */
export const HEAT_COLORS = ['#3d4d12', '#5f7d10', '#8fbf0c', '#b3e805', '#ccff00']
export const BODY_COLOR = '#2b2b2b'

export const PRIMARY_FREQUENCY = 5
export const SECONDARY_FREQUENCY = 3

export const ANATOMY_SVG_HEIGHT_PX = 230

export interface ExerciseBodyDatum {
  name: string
  muscles: string[]
  frequency: number
}

export function mappedMuscleSlug(slug: string | null | undefined): string | null {
  if (!slug) return null
  return SLUG_TO_MUSCLES[slug] ? slug : null
}

export function hasExerciseAnatomy(
  primarySlug: string | null | undefined,
  secondarySlugs: readonly string[] = [],
): boolean {
  if (mappedMuscleSlug(primarySlug)) return true
  return secondarySlugs.some(slug => slug !== primarySlug && mappedMuscleSlug(slug))
}

/**
 * One highlighter row per mapped slug. Unknown slugs are dropped. A primary
 * slug is never also listed as secondary (frequencies would otherwise stack).
 */
export function buildExerciseBodyData(
  primarySlug: string | null | undefined,
  secondarySlugs: readonly string[] = [],
  names: Readonly<Record<string, string>> = {},
): ExerciseBodyDatum[] {
  const data: ExerciseBodyDatum[] = []
  const seen = new Set<string>()

  const add = (slug: string | null | undefined, frequency: number) => {
    const mapped = mappedMuscleSlug(slug)
    if (!mapped || seen.has(mapped)) return
    seen.add(mapped)
    data.push({
      name: names[mapped] || mapped,
      muscles: [...SLUG_TO_MUSCLES[mapped]!],
      frequency,
    })
  }

  add(primarySlug, PRIMARY_FREQUENCY)
  for (const slug of secondarySlugs) add(slug, SECONDARY_FREQUENCY)
  return data
}
