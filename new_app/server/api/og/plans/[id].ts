import type { OgCardModel } from '../../../utils/ogCard'
import { serveOgCard, formatCount, tileImageCandidates } from '../../../utils/ogShare'

interface PlanDetailResponse {
  data: {
    name: string
    thumbnailUrl: string | null
    creator: { fullName: string | null } | null
    createdByUserName?: string | null
    items: Array<{
      routine: {
        id: string
        name: string
        thumbnailUrl: string | null
      } | null
    }>
  }
}

interface RoutineDetailResponse {
  data: {
    items: Array<{ exerciseImageUrl: string | null }>
  }
}

/**
 * Plans rarely have per-routine thumbnails, so a tile without one borrows the
 * first exercise image from its routine's public detail. At most MAX_ENRICHED
 * small fetches, and the whole card is CDN-cached, so the fan-out is bounded.
 * Non-public routines inside the plan just keep the letter-tile fallback.
 */
const MAX_ENRICHED = 4

async function firstExerciseImage(apiBaseUrl: string, routineId: string): Promise<string | null> {
  try {
    const res = await $fetch<RoutineDetailResponse>(`/v1/routines/${routineId}`, {
      baseURL: apiBaseUrl,
      timeout: 6000,
    })
    return res.data.items.find(item => item.exerciseImageUrl)?.exerciseImageUrl ?? null
  }
  catch {
    return null
  }
}

async function fetchPlanModel(apiBaseUrl: string, id: string, femaleVariant: boolean): Promise<OgCardModel> {
  const res = await $fetch<PlanDetailResponse>(`/v1/plans/${id}`, {
    baseURL: apiBaseUrl,
    timeout: 6000,
  })
  const plan = res.data
  const routines = plan.items
    .map(item => item.routine)
    .filter((routine): routine is NonNullable<typeof routine> => routine !== null)
  const author = plan.createdByUserName ?? plan.creator?.fullName ?? null
  const chips: string[] = [formatCount(routines.length, 'routine', 'routines')]
  if (author) chips.push(`by ${author}`)
  const tiles = await Promise.all(routines.map(async (routine, index) => {
    // Routine thumbnails are user uploads with no gender variant; only the
    // borrowed catalog exercise images participate in the female variant.
    if (routine.thumbnailUrl) return { label: routine.name, imageUrls: [routine.thumbnailUrl] }
    const exerciseImage = index < MAX_ENRICHED
      ? await firstExerciseImage(apiBaseUrl, routine.id)
      : null
    return { label: routine.name, imageUrls: tileImageCandidates(exerciseImage, femaleVariant) }
  }))
  return {
    caption: 'Training plan',
    name: plan.name,
    chips,
    backdropImageUrl: plan.thumbnailUrl,
    tiles,
  }
}

export default defineEventHandler(event => serveOgCard(event, fetchPlanModel))
