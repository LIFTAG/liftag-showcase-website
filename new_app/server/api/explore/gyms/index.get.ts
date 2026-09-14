import { discoveryListQuery, readDiscoveryApi, requestedDiscoveryLocale } from '../../../utils/discoveryApi'
import { normalizeDiscoveryPage, normalizeExploreGym } from '../../../../utils/discoveryData'
export default defineEventHandler(async (event) => {
  const { search, page, limit } = discoveryListQuery(event)
  return normalizeDiscoveryPage(
    await readDiscoveryApi(
      event,
      '/v1/gyms',
      { ...(search ? { search } : {}), page, limit },
      requestedDiscoveryLocale(event),
    ),
    normalizeExploreGym,
  )
})
