import type { CatalogExercise } from '~/types/catalog'
import type { GymMachineDetail, DiscoveryLocale } from '~/types/discovery'
import { gymExercisePresentation, type gymCatalogContext } from '~/utils/gymCatalog'

/** Resolve contextual data once per exercise page, with ownership and catalog identity checks. */
export function useCatalogExerciseResource(
  param: string,
  locale: DiscoveryLocale,
  context: ReturnType<typeof gymCatalogContext>,
) {
  const requestFetch = useRequestFetch()
  return useAsyncData(
    `catalog-exercise:${locale}:${param}:${context ? JSON.stringify(context) : 'catalog'}`,
    async (_app, { signal }) => {
      if (!context)
        return { exercise: await resolveCatalogExercise(param, locale), machine: null, gymExercise: null }
      const machine = await requestFetch<GymMachineDetail>(
        `/api/explore/gyms/${context.gymId}/machines/${context.machineId}`,
        { query: { lang: locale }, signal, retry: 0 },
      )
      const gymExercise = machine.exercises.find((item) => item.id === context.exerciseId)
      if (!gymExercise)
        throw createError({ statusCode: 404, statusMessage: 'Exercise not found on this machine' })
      const catalog = gymExercise.templateId
        ? await requestFetch<CatalogExercise>(`/api/catalog/exercises/${gymExercise.templateId}`, {
            query: { locale },
            signal,
            retry: 0,
          }).catch(() => null)
        : null
      if (param !== (gymExercise.templateId ?? gymExercise.id) && param !== catalog?.slug)
        throw createError({ statusCode: 404, statusMessage: 'Exercise not found on this machine' })
      return { exercise: gymExercisePresentation(gymExercise, locale, catalog), machine, gymExercise }
    },
  )
}
