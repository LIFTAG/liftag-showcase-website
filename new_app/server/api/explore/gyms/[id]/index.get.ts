import { discoveryParam, readLocalizedGym } from '../../../../utils/discoveryApi'
import { normalizeGymDetail } from '../../../../../utils/discoveryData'
export default defineEventHandler(async (event) => {
  const { data, locale } = await readLocalizedGym(
    event,
    `/v1/gyms/${discoveryParam(event)}`,
    getQuery(event).equipment === '0' ? {} : { equipment: 'summary' },
  )
  return normalizeGymDetail(data, locale)
})
