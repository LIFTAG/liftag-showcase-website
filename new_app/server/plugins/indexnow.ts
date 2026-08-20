import { getCatalogSnapshot } from '../utils/catalogData'
import { isIndexNowRuntimeEnabled, scheduleIndexNowSubmit } from '../utils/indexNowSubmit'

/**
 * Warm the catalog on boot so IndexNow can fire without waiting on a visitor.
 * Do not await: sitemap.xml must stay catalog-free, and IndexNow must never
 * fail a user-facing or sitemap response.
 */
export default defineNitroPlugin(() => {
  if (!isIndexNowRuntimeEnabled()) return
  // Always schedule after warm: a durable catalog cache hit skips the
  // snapshot factory, which is the other ping trigger.
  void getCatalogSnapshot()
    .then(snapshot => scheduleIndexNowSubmit(snapshot))
    .catch((error) => {
      console.error('[indexnow] catalog warm failed', error)
      scheduleIndexNowSubmit(null)
    })
})
