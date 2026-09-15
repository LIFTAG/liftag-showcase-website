/** Apply the site's link policy to trusted, route-owned editorial HTML. */
export function localizeContentLinks(html: string, href: (path: string) => string): string {
  return html.replace(/href="(\/(?!\/)[^"]*)"/g, (_, path: string) => `href="${href(path)}"`)
}
