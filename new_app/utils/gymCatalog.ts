import type { CatalogExercise } from '../types/catalog'
import type { DiscoveryExercise, DiscoveryLocale, GymMachineDetail } from '../types/discovery'
import { DISCOVERY_UUID, discoveryHref } from './discovery.ts'
import { exercisePath } from './catalogLocale.ts'
import { discoveryMuscleName } from './discoveryMuscles.ts'

export function gymMachineHref(gymId: string, machineId: string, locale: DiscoveryLocale): string {
  // The gym query explicitly identifies this as a gym-machine ID, never a QR/catalog ID.
  return discoveryHref(`/machines/${machineId}`, locale, { gym: gymId })
}

export function gymExerciseHref(
  machine: GymMachineDetail,
  exercise: DiscoveryExercise,
  locale: DiscoveryLocale,
  catalogSlug?: string | null,
): string {
  return discoveryHref(exercisePath(catalogSlug ?? exercise.templateId ?? exercise.id, locale), locale, {
    gym: machine.gym.id,
    machine: machine.id,
    exercise: exercise.id,
  })
}

export function gymCatalogContext(query: Record<string, unknown>, machineId?: string) {
  if (query.gym === undefined && query.machine === undefined && query.exercise === undefined) return null
  const gym = query.gym,
    machine = machineId ?? query.machine,
    exercise = query.exercise
  if (
    typeof gym !== 'string' ||
    !DISCOVERY_UUID.test(gym) ||
    typeof machine !== 'string' ||
    !DISCOVERY_UUID.test(machine) ||
    (!machineId && (typeof exercise !== 'string' || !DISCOVERY_UUID.test(exercise)))
  ) {
    throw new Error('Invalid gym equipment context')
  }
  return { gymId: gym, machineId: machine, exerciseId: typeof exercise === 'string' ? exercise : undefined }
}

/** A display model deliberately allows unknown dates and categories without catalog identities. */
export type GymExercisePresentation = Omit<
  CatalogExercise,
  'createdAt' | 'categories' | 'primaryCategory'
> & {
  createdAt: string | null
  categories: { slug: string; name: string }[]
  primaryCategory: { slug: string; name: string } | null
}

export function gymExercisePresentation(
  exercise: DiscoveryExercise,
  locale: DiscoveryLocale,
  catalog: CatalogExercise | null,
): GymExercisePresentation {
  return {
    id: exercise.templateId ?? exercise.id,
    slug: catalog?.slug ?? null,
    name: exercise.name,
    description: exercise.description,
    imageUrl: exercise.image,
    videos: exercise.videos.map((url, displayOrder) => ({
      url,
      locale,
      displayOrder,
      uploadedByUserId: null,
    })),
    aliases: catalog?.aliases ?? null,
    localeName: null,
    isCompound: catalog?.isCompound ?? null,
    loggingTypes: catalog?.loggingTypes ?? [],
    primaryCategory:
      catalog?.primaryCategory && exercise.muscles.includes(catalog.primaryCategory.slug)
        ? catalog.primaryCategory
        : null,
    categories: exercise.muscles.map((slug) => ({ slug, name: discoveryMuscleName(slug, locale) })),
    machines: catalog?.machines ?? [],
    createdAt: catalog?.createdAt ?? null,
    updatedAt: catalog?.updatedAt ?? null,
  }
}
