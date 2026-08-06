/**
 * User-agent classification shared by every route that sends a visitor to a
 * store. Auto-imported by Nuxt.
 */

export type Platform = 'ios' | 'android' | 'desktop'

export const APP_STORE_APP_ID = '6761140080'
export const APP_STORE_URL = `https://apps.apple.com/app/id${APP_STORE_APP_ID}`
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.liftag.app'

/**
 * The custom-scheme form of the App Store listing.
 *
 * Why it exists: with an iPhone user-agent, https://apps.apple.com/... answers
 * `301 -> itms-appss://apps.apple.com/...`. Safari hands that scheme to the App
 * Store, but an embedded WKWebView has nothing to hand it to, so the tab hangs
 * on a blank page. Addressing the scheme directly skips Apple's HTTP redirect
 * and gives the host app a scheme it can forward to the OS on a real tap.
 */
export const APP_STORE_SCHEME_URL = `itms-apps://apps.apple.com/app/id${APP_STORE_APP_ID}`

export function detectPlatform(ua: string): Platform {
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios'
  if (/Android/i.test(ua)) return 'android'
  return 'desktop'
}

/**
 * Embedded browsers that social and messaging apps open links in. They are all
 * WKWebView (iOS) or a WebView/Custom Tab (Android) owned by the host app, and
 * none of them reliably complete a hand-off to a non-http scheme.
 *
 * Matched against the raw UA, which every one of these appends to.
 */
const IN_APP_BROWSER_RE = new RegExp([
  'Instagram',
  'FBAN', 'FBAV', 'FB_IAB', 'FBIOS', // Facebook and Messenger
  'Barcelona', // Threads
  'TikTok', 'musical_ly', 'BytedanceWebview',
  'Snapchat',
  'LinkedInApp',
  'Pinterest',
  'Twitter',
  'WhatsApp',
  'Line/',
  'MicroMessenger', // WeChat
  'KAKAOTALK',
].join('|'), 'i')

export function isInAppBrowser(ua: string): boolean {
  return IN_APP_BROWSER_RE.test(ua)
}

/**
 * Which host app's webview we are in, when it is one we can give precise
 * instructions for. Only Instagram is singled out: its "open in external
 * browser" sits behind a ••• in the top right on iOS and has stayed there
 * across redesigns, so pointing at it is safe. Every other embedded browser
 * puts that control somewhere else, so they get generic wording instead of a
 * confidently wrong arrow.
 */
export function inAppBrowserHost(ua: string): 'instagram' | 'other' | null {
  if (!isInAppBrowser(ua)) return null
  return /Instagram/i.test(ua) ? 'instagram' : 'other'
}

/**
 * True when an automatic redirect to the App Store would strand the visitor on
 * a blank page: iOS, inside someone else's webview. Everywhere else the normal
 * redirect still works and is faster.
 */
export function needsStoreEscape(ua: string): boolean {
  return detectPlatform(ua) === 'ios' && isInAppBrowser(ua)
}
