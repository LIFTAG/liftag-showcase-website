import {
  discoveryParam,
  discoveryListQuery,
  readDiscoveryApi,
  requestedDiscoveryLocale,
} from '../../../../utils/discoveryApi'
import { normalizeDiscoveryPage, normalizeEquipment } from '../../../../../utils/discoveryData'
export default defineEventHandler(async (event) =>
  normalizeDiscoveryPage(
    await readDiscoveryApi(
      event,
      `/v1/gyms/${discoveryParam(event)}/machines`,
      discoveryListQuery(event, true),
      requestedDiscoveryLocale(event),
    ),
    normalizeEquipment,
  ),
)
