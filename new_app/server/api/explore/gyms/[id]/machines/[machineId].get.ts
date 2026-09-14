import { discoveryParam, readLocalizedGym } from '../../../../../utils/discoveryApi'
import { discoveryRecord, normalizeGymMachine } from '../../../../../../utils/discoveryData'
export default defineEventHandler(async (event) => {
  const id = discoveryParam(event),
    machineId = discoveryParam(event, 'machineId')
  const { data, locale } = await readLocalizedGym(event, `/v1/gyms/machines/${machineId}/resolve`)
  if (discoveryRecord(discoveryRecord(data).gym).id !== id)
    throw createError({ statusCode: 404, statusMessage: 'Machine not found' })
  return normalizeGymMachine(data, locale)
})
