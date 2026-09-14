import {
  discoveryParam,
  discoveryListQuery,
  readDiscoveryApi,
  requestedDiscoveryLocale,
} from '../../../../utils/discoveryApi'
import { normalizeDiscoveryPage, normalizeRoutine } from '../../../../../utils/discoveryData'
export default defineEventHandler(async (event) =>
  normalizeDiscoveryPage(
    await readDiscoveryApi(
      event,
      `/v1/gyms/${discoveryParam(event)}/routines`,
      discoveryListQuery(event),
      requestedDiscoveryLocale(event),
    ),
    normalizeRoutine,
  ),
)
