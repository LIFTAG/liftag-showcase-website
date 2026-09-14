import {
  discoveryUserId,
  discoveryListQuery,
  readDiscoveryApi,
  requestedDiscoveryLocale,
} from '../../../../utils/discoveryApi'
import { normalizeDiscoveryPage, normalizePlan } from '../../../../../utils/discoveryData'
export default defineEventHandler(async (event) =>
  normalizeDiscoveryPage(
    await readDiscoveryApi(
      event,
      `/v1/users/${discoveryUserId(event)}/plans`,
      discoveryListQuery(event),
      requestedDiscoveryLocale(event),
    ),
    normalizePlan,
  ),
)
