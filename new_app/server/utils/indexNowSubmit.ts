import type { IndexNowCatalogInput } from '../../utils/indexNow'
import {
  buildIndexNowPayload,
  collectIndexNowEntries,
  INDEXNOW_ENDPOINT,
  selectIndexNowUrls,
  shouldSkipIndexNowPing,
} from '../../utils/indexNow'

let lastSuccessAt: number | null = null
let inFlight = false

export function isIndexNowRuntimeEnabled(): boolean {
  if (import.meta.prerender) return false
  if (process.env.NODE_ENV !== 'production') return false
  // Preview deploys must not ping production liftag.fit URLs.
  const vercelEnv = process.env.VERCEL_ENV
  if (vercelEnv && vercelEnv !== 'production') return false
  return true
}

export function scheduleIndexNowSubmit(snapshot: IndexNowCatalogInput | null): void {
  try {
    if (!isIndexNowRuntimeEnabled()) return
    void submitIndexNow(snapshot)
  }
  catch (error) {
    console.error('[indexnow] schedule failed', error)
  }
}

async function submitIndexNow(snapshot: IndexNowCatalogInput | null): Promise<void> {
  if (inFlight) return
  const now = Date.now()
  if (shouldSkipIndexNowPing(lastSuccessAt, now)) return
  inFlight = true
  try {
    const urlList = selectIndexNowUrls(collectIndexNowEntries(snapshot), lastSuccessAt)
    if (urlList.length === 0) return
    const payload = buildIndexNowPayload(urlList)
    if (payload.urlList.length === 0) return
    const res = await $fetch.raw(INDEXNOW_ENDPOINT, {
      method: 'POST',
      body: payload,
      timeout: 5000,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    })
    lastSuccessAt = Date.now()
    console.info(`[indexnow] ${res.status} submitted ${payload.urlList.length} urls`)
  }
  catch (error) {
    console.error('[indexnow] submit failed', error)
  }
  finally {
    inFlight = false
  }
}
