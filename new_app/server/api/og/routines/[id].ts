import type { OgCardModel } from '../../../utils/ogCard'
import { serveOgCard, formatCount, capitalize, tileImageCandidates } from '../../../utils/ogShare'

interface RoutineDetailResponse {
  data: {
    name: string
    thumbnailUrl: string | null
    estimatedDurationMin: number | null
    difficulty: string | null
    creator: { fullName: string | null } | null
    items: Array<{
      exerciseName: string | null
      exerciseImageUrl: string | null
    }>
  }
}

async function fetchRoutineModel(apiBaseUrl: string, id: string, femaleVariant: boolean): Promise<OgCardModel> {
  const res = await $fetch<RoutineDetailResponse>(`/v1/routines/${id}`, {
    baseURL: apiBaseUrl,
    timeout: 6000,
  })
  const routine = res.data
  const chips: string[] = [formatCount(routine.items.length, 'exercise', 'exercises')]
  if (routine.estimatedDurationMin) chips.push(`${routine.estimatedDurationMin} min`)
  if (routine.difficulty) chips.push(capitalize(routine.difficulty))
  if (routine.creator?.fullName) chips.push(`by ${routine.creator.fullName}`)
  return {
    caption: 'Workout routine',
    name: routine.name,
    chips,
    backdropImageUrl: routine.thumbnailUrl,
    tiles: routine.items.map(item => ({
      label: item.exerciseName ?? 'Exercise',
      imageUrls: tileImageCandidates(item.exerciseImageUrl, femaleVariant),
    })),
  }
}

export default defineEventHandler(event => serveOgCard(event, fetchRoutineModel))
