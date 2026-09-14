import {
  discoveryParam,
  discoveryListQuery,
  readDiscoveryApi,
  requestedDiscoveryLocale,
} from '../../../../utils/discoveryApi'
import { normalizeDiscoveryPage, normalizeReview } from '../../../../../utils/discoveryData'
export default defineEventHandler(async (event) =>
  normalizeDiscoveryPage(
    await readDiscoveryApi(
      event,
      `/v1/gyms/${discoveryParam(event)}/reviews`,
      discoveryListQuery(event),
      requestedDiscoveryLocale(event),
    ),
    normalizeReview,
  ),
)
