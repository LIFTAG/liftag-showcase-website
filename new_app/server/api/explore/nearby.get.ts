import {
  discoveryListQuery,
  discoveryNumber,
  readDiscoveryApi,
  requestedDiscoveryLocale,
} from '../../utils/discoveryApi'
import { normalizeDiscoveryPage, normalizeExploreGym } from '../../../utils/discoveryData'
export default defineEventHandler(async (event) =>
  normalizeDiscoveryPage(
    await readDiscoveryApi(
      event,
      '/v1/gyms/nearby',
      {
        ...discoveryListQuery(event),
        lat: discoveryNumber(event, 'lat', -90, 90),
        lng: discoveryNumber(event, 'lng', -180, 180),
        radius: discoveryNumber(event, 'radius', 100, 50000),
      },
      requestedDiscoveryLocale(event),
    ),
    normalizeExploreGym,
  ),
)
