import {
  discoveryListQuery,
  discoveryNumber,
  readDiscoveryApi,
  requestedDiscoveryLocale,
} from '../../utils/discoveryApi'
import { discoveryRecord, normalizeExploreGym } from '../../../utils/discoveryData'

export default defineEventHandler(async (event) => {
  const north = discoveryNumber(event, 'north', -90, 90),
    south = discoveryNumber(event, 'south', -90, 90)
  const east = discoveryNumber(event, 'east', -180, 180),
    west = discoveryNumber(event, 'west', -180, 180)
  if (north <= south || east <= west)
    throw createError({ statusCode: 422, statusMessage: 'Invalid map bounds' })
  const filters = discoveryListQuery(event)
  const response = discoveryRecord(
    await readDiscoveryApi(
      event,
      '/v1/gyms/map',
      {
        north,
        south,
        east,
        west,
        zoom: Math.round(discoveryNumber(event, 'zoom', 0, 22)),
        ...(filters['machineManufacturerIds[]']
          ? { 'machineManufacturerIds[]': filters['machineManufacturerIds[]'] }
          : {}),
      },
      requestedDiscoveryLocale(event),
    ),
  )
  const meta = discoveryRecord(response.metadata)
  if (!Array.isArray(response.data))
    throw createError({ statusCode: 502, statusMessage: 'Invalid map response' })
  return {
    items: response.data.map(normalizeExploreGym),
    meta: {
      limit: Number(meta.limit),
      count: Number(meta.count),
      truncated: meta.truncated === true,
      tooLarge: meta.tooLarge === true,
    },
  }
})
