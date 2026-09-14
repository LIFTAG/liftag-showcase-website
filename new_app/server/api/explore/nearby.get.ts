import { discoveryListHandler, discoveryNumber } from '../../utils/discoveryApi'
import { normalizeExploreGym } from '../../../utils/discoveryData'
export default discoveryListHandler(() => '/v1/gyms/nearby', normalizeExploreGym, {
  query: (event) => ({
    lat: discoveryNumber(event, 'lat', -90, 90),
    lng: discoveryNumber(event, 'lng', -180, 180),
    radius: discoveryNumber(event, 'radius', 100, 50000),
  }),
})
