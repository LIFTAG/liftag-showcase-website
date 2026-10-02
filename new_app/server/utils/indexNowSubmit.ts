import type { IndexNowCatalogInput } from '../../utils/indexNow'
import {
  buildIndexNowPayload,
  collectIndexNowEntries,
  INDEXNOW_ENDPOINT,
  isIndexNowDeploymentEnabled,
  selectIndexNowUrls,
  shouldSkipIndexNowPing,
} from '../../utils/indexNow'

let lastSuccessAt: number | null = null
let inFlight = false

export function isIndexNowRuntimeEnabled(): boolean {
  // A Vercel marker is authoritative: previews and development deployments
  // must never submit canonical production URLs, even with a stray opt-in.
  // Other hosts (including local `nuxt preview`) require an explicit opt-in.
  return isIndexNowDeploymentEnabled(process.env, Boolean(import.meta.prerender))
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
