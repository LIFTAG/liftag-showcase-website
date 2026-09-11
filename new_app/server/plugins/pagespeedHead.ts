import { deferRenderBlockingStylesheets } from '~/utils/deferStylesheets'
import {
  GYM_ARRIVAL_BOOTSTRAP_MARK,
  GYM_ARRIVAL_BOOTSTRAP_SCRIPT,
  GYM_ARRIVAL_BOOTSTRAP_STYLE,
  GYM_ARRIVAL_OVERLAY_ID,
} from '~/utils/gymscan/arrivalBootstrap'
import { VIEWPORT_BOOTSTRAP_MARK, VIEWPORT_BOOTSTRAP_SCRIPT } from '~/utils/viewportBootstrap'

/**
 * Two first-paint jobs the framework will not do on its own:
 *
 * 1. Publish the stable viewport CSS vars before any stylesheet runs, so the
 *    hero does not paint at 100vh and then jump when the client plugin starts.
 * 2. Stop inlined-but-still-linked CSS from blocking FCP. `inlineStyles`
 *    copies the rules into <style> tags; the four `/_nuxt/*.css` links are
 *    duplicates that cost ~300ms on a 4G PageSpeed run.
 * 3. On the gym demo, park the boot cover at the top of <head> so nav and
 *    headlines cannot paint before the arrival overlay hydrates.
 */
const VIEWPORT_SCRIPT = `<script>${VIEWPORT_BOOTSTRAP_SCRIPT}</script>`
const ARRIVAL_HEAD = `<script>${GYM_ARRIVAL_BOOTSTRAP_SCRIPT}</script><style>${GYM_ARRIVAL_BOOTSTRAP_STYLE}</style>`

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html) => {
    if (import.meta.dev) return
    const rewrite = (tag: string) => deferRenderBlockingStylesheets(tag)
    html.head = html.head.map(rewrite)
    if (html.bodyPrepend) html.bodyPrepend = html.bodyPrepend.map(rewrite)
    if (html.body) html.body = html.body.map(rewrite)
    if (html.bodyAppend) html.bodyAppend = html.bodyAppend.map(rewrite)
  })

  // Final HTML, after Unhead serializes. Catches any stylesheet that landed
  // after render:html and parks the viewport script at the top of <head>.
  nitroApp.hooks.hook('render:response', (response) => {
    if (typeof response.body !== 'string') return
    let body = response.body
    if (!import.meta.dev) body = deferRenderBlockingStylesheets(body)
    let headPrefix = ''
    if (!body.includes(VIEWPORT_BOOTSTRAP_MARK)) headPrefix += VIEWPORT_SCRIPT
    if (
      body.includes(`id="${GYM_ARRIVAL_OVERLAY_ID}"`) &&
      !body.includes(GYM_ARRIVAL_BOOTSTRAP_MARK)
    ) {
      headPrefix += ARRIVAL_HEAD
    }
    if (headPrefix) body = body.replace('<head>', `<head>${headPrefix}`)
    response.body = body
  })
})
