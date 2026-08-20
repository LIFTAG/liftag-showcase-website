import { deferRenderBlockingStylesheets } from '~/utils/deferStylesheets'
import { VIEWPORT_BOOTSTRAP_MARK, VIEWPORT_BOOTSTRAP_SCRIPT } from '~/utils/viewportBootstrap'

/**
 * Two first-paint jobs the framework will not do on its own:
 *
 * 1. Publish the stable viewport CSS vars before any stylesheet runs, so the
 *    hero does not paint at 100vh and then jump when the client plugin starts.
 * 2. Stop inlined-but-still-linked CSS from blocking FCP. `inlineStyles`
 *    copies the rules into <style> tags; the four `/_nuxt/*.css` links are
 *    duplicates that cost ~300ms on a 4G PageSpeed run.
 */
const VIEWPORT_SCRIPT = `<script>${VIEWPORT_BOOTSTRAP_SCRIPT}</script>`

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
    if (!body.includes(VIEWPORT_BOOTSTRAP_MARK)) {
      body = body.replace('<head>', `<head>${VIEWPORT_SCRIPT}`)
    }
    response.body = body
  })
})
