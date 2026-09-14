import { discoveryListHandler, discoveryUserId } from '../../../../utils/discoveryApi'
import { normalizePlan } from '../../../../../utils/discoveryData'
export default discoveryListHandler(
  (event) => `/v1/users/${discoveryUserId(event)}/plans`,
  normalizePlan,
)
