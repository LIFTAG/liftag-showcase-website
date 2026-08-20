import { defaultSitemapIndexXml, xmlHeaders } from '../../utils/sitemapXml'

/**
 * The index must not touch the catalog API. Search Console fetches this URL
 * first; a cold catalog timeout here is reported as "Couldn't fetch" on the
 * whole sitemap even when the child files are fine.
 */
export default defineEventHandler((event) => {
  const headers = xmlHeaders()
  setHeader(event, 'content-type', headers['content-type'])
  setHeader(event, 'cache-control', headers['cache-control'])
  return defaultSitemapIndexXml()
})
