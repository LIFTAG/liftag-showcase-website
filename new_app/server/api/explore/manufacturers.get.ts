import { readDiscoveryApi } from '../../utils/discoveryApi'
import { discoveryRecord } from '../../../utils/discoveryData'
export default defineEventHandler(async (event) => {
  const response = discoveryRecord(await readDiscoveryApi(event, '/v1/catalog/machine-manufacturers'))
  if (!Array.isArray(response.data))
    throw createError({ statusCode: 502, statusMessage: 'Invalid manufacturers response' })
  return response.data.map(discoveryRecord).map((r) => ({ id: String(r.id), name: String(r.name) }))
})
