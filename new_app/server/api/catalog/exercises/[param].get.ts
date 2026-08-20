import { parseCatalogLocale } from '../../../../utils/catalogLocale'
import { resolveExerciseFromCatalog } from '../../../utils/catalogResolve'

export default defineEventHandler(async (event) => {
  const param = decodeURIComponent(getRouterParam(event, 'param') ?? '')
  if (!param) {
    throw createError({ statusCode: 400, statusMessage: 'Missing exercise' })
  }

  const locale = parseCatalogLocale(getQuery(event).locale)
  const exercise = await resolveExerciseFromCatalog(param, locale)
  if (!exercise) {
    throw createError({ statusCode: 404, statusMessage: 'Exercise not found' })
  }

  return exercise
})
