import { discoveryListHandler, discoveryParam } from '../../../../utils/discoveryApi'
import { normalizeReview } from '../../../../../utils/discoveryData'
export default discoveryListHandler((event) => `/v1/gyms/${discoveryParam(event)}/reviews`, normalizeReview)
