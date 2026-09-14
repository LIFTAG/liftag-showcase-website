import type { SiteLocale } from '../../../../types/locale'
import { en, sk } from '../../../../i18n/messages/seoMedia'
import { createMessageTranslator } from '../../../../utils/messageTranslator'
import type { OgCardModel } from '../../../utils/ogCard'
import { serveOgCard, tileImageCandidates } from '../../../utils/ogShare'

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

async function fetchRoutineModel(apiBaseUrl: string, id: string, femaleVariant: boolean, locale: SiteLocale): Promise<OgCardModel> {
  const { t } = createMessageTranslator(locale, { en, sk })
  const res = await $fetch<RoutineDetailResponse>(`/v1/routines/${id}`, {
    baseURL: apiBaseUrl,
    timeout: 6000,
    query: { lang: locale },
    headers: { 'Accept-Language': locale },
  })
  const routine = res.data
  const chips: string[] = [t('exerciseCount', routine.items.length)]
  if (routine.estimatedDurationMin) chips.push(`${routine.estimatedDurationMin} min`)
  if (routine.difficulty) chips.push(['beginner', 'intermediate', 'advanced'].includes(routine.difficulty) ? t(routine.difficulty) : routine.difficulty)
  if (routine.creator?.fullName) chips.push(t('byAuthor', { name: routine.creator.fullName }))
  return {
    caption: t('routine'),
    name: routine.name,
    chips,
    backdropImageUrl: routine.thumbnailUrl,
    tiles: routine.items.map(item => ({
      label: item.exerciseName ?? t('exercise'),
      imageUrls: tileImageCandidates(item.exerciseImageUrl, femaleVariant),
    })),
  }
}

export default defineEventHandler(event => serveOgCard(event, fetchRoutineModel))
