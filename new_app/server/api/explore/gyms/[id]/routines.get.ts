import { discoveryListHandler, discoveryParam } from '../../../../utils/discoveryApi'
import { normalizeRoutine } from '../../../../../utils/discoveryData'
export default discoveryListHandler(
  (event) => `/v1/gyms/${discoveryParam(event)}/routines`,
  normalizeRoutine,
)
