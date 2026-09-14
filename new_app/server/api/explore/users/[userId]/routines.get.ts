import { discoveryListHandler, discoveryUserId } from '../../../../utils/discoveryApi'
import { normalizeRoutine } from '../../../../../utils/discoveryData'
export default discoveryListHandler(
  (event) => `/v1/users/${discoveryUserId(event)}/routines`,
  normalizeRoutine,
)
