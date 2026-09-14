import { readDiscoveryApi } from '../../utils/discoveryApi'
import { discoveryRecord } from '../../../utils/discoveryData'
export default defineEventHandler(async (event) => {
  const response = discoveryRecord(
    await readDiscoveryApi(event, '/v1/catalog/exercise-categories', { limit: 100 }),
  )
  if (!Array.isArray(response.data))
    throw createError({ statusCode: 502, statusMessage: 'Invalid categories response' })
  return response.data
    .map(discoveryRecord)
    .map((r) => ({ id: String(r.id), name: String(r.name), slug: String(r.slug) }))
})
