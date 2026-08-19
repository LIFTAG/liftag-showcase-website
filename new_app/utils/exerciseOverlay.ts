import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export type { ExerciseOverlay, ExerciseOverlayLink, ExerciseOverlayMistake } from '~/types/exerciseOverlay'

const overlayModules = import.meta.glob<{ default: ExerciseOverlay }>(
  '../content/exercises/*.ts',
  { eager: true },
)

const overlaysBySlug = new Map<string, ExerciseOverlay>()
for (const mod of Object.values(overlayModules)) {
  const overlay = mod.default
  if (overlay?.slug) overlaysBySlug.set(overlay.slug, overlay)
}

export function exerciseOverlay(slug: string | null | undefined): ExerciseOverlay | null {
  if (!slug) return null
  return overlaysBySlug.get(slug) ?? null
}

export function overlayCount(): number {
  return overlaysBySlug.size
}
