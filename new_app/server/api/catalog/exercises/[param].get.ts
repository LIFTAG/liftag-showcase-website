import { resolveExerciseFromCatalog } from '../../../utils/catalogResolve'

export default defineEventHandler(async (event) => {
  const param = decodeURIComponent(getRouterParam(event, 'param') ?? '')
  if (!param) {
    throw createError({ statusCode: 400, statusMessage: 'Missing exercise' })
  }

  const exercise = await resolveExerciseFromCatalog(param)
  if (!exercise) {
    throw createError({ statusCode: 404, statusMessage: 'Exercise not found' })
  }

  return exercise
})
