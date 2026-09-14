import { discoveryParam, readDiscoveryApi, requestedDiscoveryLocale } from '../../../utils/discoveryApi'
import { discoveryRecord, normalizeTrainer } from '../../../../utils/discoveryData'
export default defineEventHandler(async (event) => {
  const response = discoveryRecord(
    await readDiscoveryApi(
      event,
      `/v1/trainers/${discoveryParam(event)}`,
      {},
      requestedDiscoveryLocale(event),
    ),
  )
  return normalizeTrainer(response.data)
})
