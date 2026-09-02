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

/** Highlighter polygon id → catalog muscle-hub slug. Unmapped parts are not links. */
export const MUSCLE_TO_SLUG: Record<string, string> = {
  chest: 'chest',
  obliques: 'abs',
  abs: 'abs',
  biceps: 'biceps',
  triceps: 'triceps',
  'front-deltoids': 'shoulders',
  'back-deltoids': 'shoulders',
  trapezius: 'back',
  'upper-back': 'back',
  'lower-back': 'back',
  forearm: 'forearms',
  quadriceps: 'quadriceps',
  hamstring: 'hamstrings',
  gluteal: 'glutes',
  calves: 'calves',
  'left-soleus': 'calves',
  'right-soleus': 'calves',
}

/**
 * body-highlighter 3.0.2 paint order. Used to stamp `data-slug` on polygons
 * after render (the library does not put muscle ids on the DOM).
 */
export const HIGHLIGHTER_VIEW_POLYGONS: Record<'anterior' | 'posterior', { muscle: string, count: number }[]> = {
  anterior: [
    { muscle: 'chest', count: 2 },
    { muscle: 'obliques', count: 2 },
    { muscle: 'abs', count: 2 },
    { muscle: 'biceps', count: 2 },
    { muscle: 'triceps', count: 2 },
    { muscle: 'neck', count: 2 },
    { muscle: 'front-deltoids', count: 2 },
    { muscle: 'head', count: 1 },
    { muscle: 'abductors', count: 2 },
    { muscle: 'quadriceps', count: 6 },
    { muscle: 'knees', count: 2 },
    { muscle: 'calves', count: 4 },
    { muscle: 'forearm', count: 4 },
  ],
  posterior: [
    { muscle: 'head', count: 1 },
    { muscle: 'trapezius', count: 2 },
    { muscle: 'back-deltoids', count: 2 },
    { muscle: 'upper-back', count: 2 },
    { muscle: 'triceps', count: 4 },
    { muscle: 'lower-back', count: 2 },
    { muscle: 'forearm', count: 4 },
    { muscle: 'gluteal', count: 2 },
    { muscle: 'adductor', count: 2 },
    { muscle: 'hamstring', count: 4 },
    { muscle: 'knees', count: 2 },
    { muscle: 'calves', count: 4 },
    { muscle: 'left-soleus', count: 1 },
    { muscle: 'right-soleus', count: 1 },
  ],
}

export function highlighterMuscleToSlug(muscle: string | null | undefined): string | null {
  if (!muscle) return null
  return MUSCLE_TO_SLUG[muscle] ?? null
}

export function stampHighlighterPolygons(
  root: HTMLElement,
  view: 'anterior' | 'posterior',
): void {
  const polys = root.querySelectorAll('polygon')
  const layout = HIGHLIGHTER_VIEW_POLYGONS[view]
  let expected = 0
  for (const row of layout) expected += row.count
  if (polys.length !== expected) return

  let i = 0
  for (const row of layout) {
    const slug = highlighterMuscleToSlug(row.muscle)
    for (let n = 0; n < row.count; n++, i++) {
      const poly = polys[i]
      if (!poly) return
      poly.setAttribute('data-muscle', row.muscle)
      if (slug) poly.setAttribute('data-slug', slug)
      else poly.removeAttribute('data-slug')
    }
  }
}

/** Resting silhouette. Light enough to read on #000 / #0e0e0e so the figure is not a hole. */
export const BODY_COLOR = '#3f3f3f'

/** Olive secondary vs brand-lime primary — two stops, not a five-step heat ramp. */
export const SECONDARY_COLOR = '#5e7814'
export const PRIMARY_COLOR = '#ccff00'

/** `body-highlighter` indexes `frequency - 1`. */
export const HEAT_COLORS = [SECONDARY_COLOR, PRIMARY_COLOR]
export const SECONDARY_FREQUENCY = 1
export const PRIMARY_FREQUENCY = 2

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
