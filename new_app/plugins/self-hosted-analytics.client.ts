type PageTracker = { track: (payload: Record<string, string>) => unknown }

export default defineNuxtPlugin((nuxtApp) => {
  const website = String(useRuntimeConfig().public.analyticsWebsiteId || '')
  if (!website) return
  const router = useRouter()
  const browser = navigator as Navigator & { globalPrivacyControl?: boolean }
  const track = () => {
    if (browser.doNotTrack === '1' || browser.globalPrivacyControl) return
    const url = new URL(location.href)
    // Auth and app handoffs can contain private identifiers or tokens.
    if (/^\/(?:sk\/)?(?:auth|qr|routines|plans|trainer-invites|get)(?:\/|$)/.test(url.pathname)) return
    const tracker = (window as Window & { umami?: PageTracker }).umami
    if (!tracker) return
    let referrer = ''
    try { if (document.referrer) referrer = new URL(document.referrer).origin } catch { /* invalid referrer */ }
    void tracker.track({ website, hostname: url.hostname, url: url.pathname,
      title: document.title, language: browser.language, referrer,
      screen: `${screen.width}x${screen.height}` })
  }
  nuxtApp.hook('app:mounted', () => {
    if (browser.doNotTrack === '1' || browser.globalPrivacyControl) return
    const script = document.createElement('script')
    script.src = '/_analytics/script.js'
    script.defer = true
    script.dataset.websiteId = website
    script.dataset.autoTrack = 'false'
    script.dataset.doNotTrack = 'true'
    script.onload = track
    document.head.appendChild(script)
    router.afterEach(() => nextTick(track))
  })
})
