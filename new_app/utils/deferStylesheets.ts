const STYLESHEET_LINK = /<link\b([^>]*?)rel=(["'])stylesheet\2([^>]*)>/gi

function stylesheetAttrs(pre: string, post: string) {
  return `${pre}${post}`.replace(/\s+/g, ' ').trim()
}

/**
 * Turn render-blocking `<link rel="stylesheet">` tags into preload+onload
 * swaps. Homepage CSS is already inlined (`features.inlineStyles`), so these
 * files only need to land for client navigations — they should not hold FCP.
 */
export function deferRenderBlockingStylesheets(html: string): string {
  return html.replace(STYLESHEET_LINK, (full, pre: string, _quote: string, post: string) => {
    if (/\bonload=/.test(full)) return full
    if (/\bmedia=(["'])print\1/.test(full)) return full

    const attrs = stylesheetAttrs(pre, post)
    if (!/\bhref=/.test(attrs)) return full

    const preloadAttrs = attrs.replace(/\smedia=(["']).*?\1/g, '')
    // No <noscript> stylesheet: homepage CSS is already inlined, and a
    // leftover rel=stylesheet is what PageSpeed still treated as blocking.
    return `<link rel="preload" as="style" ${preloadAttrs} onload="this.onload=null;this.rel='stylesheet'">`
  })
}
