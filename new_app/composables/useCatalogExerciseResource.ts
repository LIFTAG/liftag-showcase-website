import type { CatalogExercise } from '~/types/catalog'
import type { GymMachineDetail, DiscoveryLocale } from '~/types/discovery'
import { gymExercisePresentation, type gymCatalogContext } from '../utils/gymCatalog.ts'

/** Resolve contextual data once per exercise page, with ownership and catalog identity checks. */
export function useCatalogExerciseResource(
  param: string,
  locale: DiscoveryLocale,
  context: ReturnType<typeof gymCatalogContext>,
) {
  const requestFetch = useRequestFetch()
  const { preference } = useSiteLocale()
  const requestedLocale = context ? preference.value : locale
  return useAsyncData(
    `catalog-exercise:${requestedLocale ?? 'auto'}:${param}:${context ? JSON.stringify(context) : 'catalog'}`,
    async (_app, { signal }) => {
      if (!context)
        return { exercise: await resolveCatalogExercise(param, locale, signal), machine: null, gymExercise: null }
      const machine = await requestFetch<GymMachineDetail>(
        `/api/explore/gyms/${context.gymId}/machines/${context.machineId}`,
        { query: { lang: requestedLocale }, signal, retry: 0 },
      )
      const gymExercise = machine.exercises.find((item) => item.id === context.exerciseId)
      if (!gymExercise)
        throw createError({ statusCode: 404, statusMessage: 'Exercise not found on this machine' })
      const matchesResolvedId = param === (gymExercise.templateId ?? gymExercise.id)
      const catalog = gymExercise.templateId
        ? await requestFetch<CatalogExercise>(`/api/catalog/exercises/${gymExercise.templateId}`, {
            query: { locale: machine.locale },
            signal,
            retry: 0,
          }).catch((error) => {
            if (signal.aborted) throw error
            // UUIDs can render from gym data alone; slugs need the catalog to verify identity.
            if (!matchesResolvedId && error?.statusCode !== 404)
              throw createError({
                statusCode: 502,
                statusMessage: 'Exercise temporarily unavailable',
                cause: error,
              })
            return null
          })
        : null
      if (!matchesResolvedId && param !== catalog?.slug)
        throw createError({ statusCode: 404, statusMessage: 'Exercise not found on this machine' })
      return { exercise: gymExercisePresentation(gymExercise, machine.locale, catalog), machine, gymExercise }
    },
  )
}
