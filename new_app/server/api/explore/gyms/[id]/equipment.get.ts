import { discoveryListHandler, discoveryParam } from '../../../../utils/discoveryApi'
import { normalizeEquipment } from '../../../../../utils/discoveryData'
export default discoveryListHandler(
  (event) => `/v1/gyms/${discoveryParam(event)}/machines`,
  normalizeEquipment,
  { equipment: true },
)
