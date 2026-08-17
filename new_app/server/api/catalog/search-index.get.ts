import type { CatalogIndexPayload } from '../../../types/catalog'

/**
 * Lightweight search index for the /exercises and /machines pages: every
 * system exercise, machine, and muscle category in one payload the client
 * filters instantly. Cache headers come from the `/api/catalog/**` route
 * rule; the upstream aggregation is cached by getCatalogSnapshot.
 */
export default defineEventHandler(async (): Promise<CatalogIndexPayload> => {
  const snapshot = await getCatalogSnapshot()

  return {
    exercises: snapshot.exercises
      .filter(exercise => exercise.slug !== null && exercise.slug !== undefined)
      .map(exercise => ({
        id: exercise.id,
        slug: exercise.slug!,
        name: exercise.name,
        aliases: exercise.aliases,
        imageUrl: exercise.imageUrl,
        primaryCategory: exercise.primaryCategory?.slug ?? null,
        categories: exercise.categories.map(category => category.slug),
        isCompound: exercise.isCompound,
        hasVideo: exercise.videos.length > 0,
      })),
    machines: snapshot.machines.map(machine => ({
      id: machine.id,
      slug: machine.slug ?? null,
      name: machine.name,
      photoUrl: machine.photoUrl,
      categories: machine.categories.map(category => category.slug),
    })),
    categories: snapshot.categories
      .filter(category => category.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(category => ({
        slug: category.slug,
        name: category.name,
        sortOrder: category.sortOrder,
        imageUrl: category.imageUrl,
      })),
    fetchedAt: snapshot.fetchedAt,
  }
})
