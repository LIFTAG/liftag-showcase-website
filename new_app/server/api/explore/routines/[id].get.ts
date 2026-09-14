import { discoveryParam, readDiscoveryApi } from '../../../utils/discoveryApi'
import { discoveryRecord, normalizeRoutine } from '../../../../utils/discoveryData'
export default defineEventHandler(async (event) => {
  const response = discoveryRecord(
    await readDiscoveryApi(event, `/v1/routines/${discoveryParam(event)}`),
  )
  const routine = discoveryRecord(response.data)
  if (routine.visibility !== 'public')
    throw createError({ statusCode: 404, statusMessage: 'Routine not found' })
  return normalizeRoutine(routine)
})
