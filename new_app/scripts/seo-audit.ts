#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { LEGAL_HREFLANG_PAGES, STATIC_PAGES } from '../utils/staticPages.ts'

const SITE_ORIGIN = 'https://liftag.fit'
const CATALOG_FAMILIES = ['exercises', 'machines', 'muscles'] as const
const UUID_PATH = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
const DISCOVERY_FAMILIES = [
  new RegExp(`^/(?:sk/)?gyms/${UUID_PATH}$`, 'i'),
  new RegExp(`^/(?:sk/)?gyms/${UUID_PATH}/equipment$`, 'i'),
  null,
  new RegExp(`^/(?:sk/)?explore/trainers/${UUID_PATH}$`, 'i'),
  new RegExp(`^/(?:sk/)?explore/routines/${UUID_PATH}$`, 'i'),
] as const

function discoveryFamilyIndex(target: string): number {
  const url = new URL(target, SITE_ORIGIN)
  const machine = new RegExp(`^/(?:sk/)?machines/${UUID_PATH}$`, 'i').test(url.pathname)
    && new RegExp(`^${UUID_PATH}$`, 'i').test(url.searchParams.get('gym') ?? '')
    && url.searchParams.size === 1
  if (machine) return 2
  if (url.search) return -1
  return DISCOVERY_FAMILIES.findIndex(pattern => pattern?.test(url.pathname))
}
const AI_CRAWLERS = ['OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User']

export type Severity = 'error' | 'warning'

export interface Finding {
  severity: Severity
  code: string
  target: string
  message: string
}

export interface PageResult {
  path: string
  source: string
  findings: Finding[]
  facts: {
    title: string | null
    description: string | null
    canonical: string | null
    lang: string | null
    h1Count: number
    jsonLdCount: number
    visibleWords: number
  }
}

export interface AuditReport {
  generatedAt: string
  mode: 'local' | 'remote'
  source: string
  pages: PageResult[]
  globalFindings: Finding[]
  summary: {
    pagesAudited: number
    errors: number
    warnings: number
    passed: boolean
  }
}

function decodeEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (entity, hex: string) => {
      const codePoint = Number.parseInt(hex, 16)
      return codePoint <= 0x10FFFF ? String.fromCodePoint(codePoint) : entity
    })
    .replace(/&#([0-9]+);/g, (entity, decimal: string) => {
      const codePoint = Number.parseInt(decimal, 10)
      return codePoint <= 0x10FFFF ? String.fromCodePoint(codePoint) : entity
    })
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
}

function stripMarkup(html: string): string {
  return decodeEntities(html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim())
}

function attr(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'))
  return match ? decodeEntities(match[1] ?? match[2] ?? '') : null
}

function metaContent(html: string, key: string, value: string): string[] {
  return [...html.matchAll(/<meta\b[^>]*>/gi)]
    .filter(match => attr(match[0], key)?.toLowerCase() === value.toLowerCase())
    .map(match => attr(match[0], 'content'))
    .filter((content): content is string => content !== null)
}

function linkHrefs(html: string, rel: string): Array<{ href: string, hreflang: string | null }> {
  return [...html.matchAll(/<link\b[^>]*>/gi)]
    .filter(match => (attr(match[0], 'rel') ?? '').toLowerCase().split(/\s+/).includes(rel))
    .map(match => ({ href: attr(match[0], 'href') ?? '', hreflang: attr(match[0], 'hreflang') }))
}

function expectedLang(path: string): 'en' | 'sk' | 'cs' {
  if (path === '/sk' || path.startsWith('/sk/')) return 'sk'
  if (path.startsWith('/cs/')) return 'cs'
  return 'en'
}

function expectedAlternates(path: string): Array<{ lang: string, href: string }> {
  const url = new URL(path, SITE_ORIGIN)
  const unlocalizedPath = url.pathname.replace(/^\/(?:sk|cs)(?=\/|$)/, '') || '/'
  const suffix = `${unlocalizedPath}${url.search}`
  const en = `${SITE_ORIGIN}${suffix}`
  const sk = `${SITE_ORIGIN}/sk${unlocalizedPath === '/' ? '' : unlocalizedPath}${url.search}`
  const alternates = [{ lang: 'en', href: en }, { lang: 'sk', href: sk }, { lang: 'x-default', href: en }]
  if ((LEGAL_HREFLANG_PAGES as readonly string[]).includes(unlocalizedPath)) alternates.push({ lang: 'cs', href: `${SITE_ORIGIN}/cs${unlocalizedPath}${url.search}` })
  return alternates
}

export function auditHtml(
  path: string,
  html: string,
  source = path,
  policy: { canonicalPath?: string, expectNoindex?: boolean } = {},
): PageResult {
  const findings: Finding[] = []
  const add = (severity: Severity, code: string, message: string) => findings.push({ severity, code, target: path, message })
  const titleMatches = [...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)].map(match => stripMarkup(match[1] ?? ''))
  const descriptions = metaContent(html, 'name', 'description')
  const canonicals = linkHrefs(html, 'canonical').map(item => item.href)
  const htmlTag = html.match(/<html\b[^>]*>/i)?.[0] ?? ''
  const lang = attr(htmlTag, 'lang')
  const h1Count = [...html.matchAll(/<h1\b/gi)].length
  const robots = metaContent(html, 'name', 'robots').join(',').toLowerCase()
  const jsonLdBodies = [...html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map(match => match[1]?.trim() ?? '')
  const parsedJsonLd: unknown[] = []
  const visibleWords = stripMarkup(html).split(/\s+/).filter(Boolean).length

  if (titleMatches.length !== 1 || !titleMatches[0]) add('error', 'title.invalid_count', `Expected one non-empty <title>; found ${titleMatches.length}.`)
  else if (titleMatches[0].length > 65) add('warning', 'title.long', `Title is ${titleMatches[0].length} characters; review likely SERP truncation.`)
  if (descriptions.length !== 1 || !descriptions[0]?.trim()) add('error', 'description.invalid_count', `Expected one non-empty meta description; found ${descriptions.length}.`)
  else if (descriptions[0].length < 50 || descriptions[0].length > 170) add('warning', 'description.length', `Meta description is ${descriptions[0].length} characters; target roughly 50–170.`)

  const canonicalPath = policy.canonicalPath ?? path
  const expectedCanonical = `${SITE_ORIGIN}${canonicalPath === '/' ? '/' : canonicalPath}`
  if (canonicals.length !== 1) add('error', 'canonical.invalid_count', `Expected one canonical; found ${canonicals.length}.`)
  else if (canonicals[0] !== expectedCanonical) add('error', 'canonical.mismatch', `Canonical is ${canonicals[0]}; expected ${expectedCanonical}.`)
  if (lang?.toLowerCase() !== expectedLang(path)) add('error', 'html.lang', `html[lang] is ${lang ?? 'missing'}; expected ${expectedLang(path)}.`)
  if (h1Count !== 1) add('error', 'h1.invalid_count', `Expected one H1; found ${h1Count}.`)
  const hasNoindex = /\b(?:noindex|none)\b/.test(robots)
  if (policy.expectNoindex && !hasNoindex) add('error', 'robots.indexed_search', 'Filtered/search result must declare noindex to avoid index bloat.')
  if (!policy.expectNoindex && hasNoindex) add('error', 'robots.noindex', `Indexable audit target declares robots=${robots}.`)
  if (policy.expectNoindex && !/\bfollow\b/.test(robots)) add('error', 'robots.search_nofollow', `Filtered/search result should preserve link discovery with robots=noindex,follow; got ${robots || 'missing'}.`)

  const alternates = linkHrefs(html, 'alternate').filter(item => item.hreflang)
  for (const expected of expectedAlternates(canonicalPath)) {
    const actual = alternates.find(item => item.hreflang?.toLowerCase() === expected.lang)
    if (!actual) add('error', 'hreflang.missing', `Missing hreflang=${expected.lang} alternate.`)
    else if (actual.href !== expected.href) add('error', 'hreflang.mismatch', `hreflang=${expected.lang} points to ${actual.href}; expected ${expected.href}.`)
  }
  if (!metaContent(html, 'property', 'og:title')[0]) add('warning', 'open_graph.title', 'Missing og:title.')
  if (!metaContent(html, 'property', 'og:description')[0]) add('warning', 'open_graph.description', 'Missing og:description.')
  if (!metaContent(html, 'property', 'og:image')[0]) add('warning', 'open_graph.image', 'Missing og:image.')
  const ogUrl = metaContent(html, 'property', 'og:url')[0]
  if (!ogUrl) add('warning', 'open_graph.url', 'Missing og:url.')
  else if (ogUrl !== expectedCanonical) add('error', 'open_graph.url_mismatch', `og:url is ${ogUrl}; expected ${expectedCanonical}.`)
  if (!metaContent(html, 'name', 'twitter:card')[0]) add('warning', 'twitter.card', 'Missing twitter:card.')
  if (!policy.expectNoindex && !/max-image-preview\s*:\s*large/i.test(robots)) add('warning', 'robots.image_preview', 'Add max-image-preview:large to permit large image treatments in search and discovery surfaces.')
  if (jsonLdBodies.length === 0) add('warning', 'jsonld.missing', 'No JSON-LD found; entity-rich pages should expose machine-readable facts.')
  for (const body of jsonLdBodies) {
    try { parsedJsonLd.push(JSON.parse(body)) }
    catch { add('error', 'jsonld.invalid', 'A JSON-LD block is not valid JSON.') }
  }
  const discoveryFamily = discoveryFamilyIndex(canonicalPath)
  const discoveryType = discoveryFamily === 0
    ? 'ExerciseGym'
    : discoveryFamily === 3
      ? 'ProfilePage'
      : discoveryFamily >= 0
        ? 'WebPage'
        : null
  const containsType = (value: unknown, expected: string): boolean => {
    if (Array.isArray(value)) return value.some(item => containsType(item, expected))
    if (!value || typeof value !== 'object') return false
    const record = value as Record<string, unknown>
    if (record['@type'] === expected || (Array.isArray(record['@type']) && record['@type'].includes(expected))) return true
    return Object.values(record).some(item => containsType(item, expected))
  }
  if (discoveryType && !parsedJsonLd.some(value => containsType(value, discoveryType))) add('error', 'jsonld.discovery_type', `Discovery page must include schema.org @type=${discoveryType}.`)
  if (visibleWords < 80) add('warning', 'content.thin', `Only ${visibleWords} server-rendered visible words found; verify the page answers its search intent without client JavaScript.`)

  return {
    path,
    source,
    findings,
    facts: {
      title: titleMatches[0] ?? null,
      description: descriptions[0] ?? null,
      canonical: canonicals[0] ?? null,
      lang,
      h1Count,
      jsonLdCount: jsonLdBodies.length,
      visibleWords,
    },
  }
}

export function expectedStaticPaths(): string[] {
  const legal = new Set<string>(LEGAL_HREFLANG_PAGES)
  return STATIC_PAGES.flatMap(({ path }) => {
    const en = path
    const sk = path === '/' ? '/sk' : `/sk${path}`
    return legal.has(path) ? [en, sk, `/cs${path}`] : [en, sk]
  })
}

function locs(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => decodeEntities(match[1] ?? ''))
}

function catalogSamples(xml: string): string[] {
  const paths = locs(xml).flatMap((value) => {
    try { return [new URL(value).pathname] }
    catch { return [] }
  })
  const samples = CATALOG_FAMILIES.map((family) => paths.find(path => new RegExp(`^/${family}/[^/]+$`).test(path)))
    .filter((path): path is string => Boolean(path))
  return samples.flatMap(path => [path, `/sk${path}`])
}

export function discoveryInventoryPaths(xml: string, all = false): string[] {
  const paths = validateDiscoveryInventory(xml).paths
  if (all) return paths
  return DISCOVERY_FAMILIES.flatMap((_pattern, family) => [
    paths.find(path => !path.startsWith('/sk/') && discoveryFamilyIndex(path) === family),
    paths.find(path => path.startsWith('/sk/') && discoveryFamilyIndex(path) === family),
  ]).filter((path): path is string => Boolean(path))
}

export function validateDiscoveryInventory(xml: string): { paths: string[], findings: Finding[] } {
  const findings: Finding[] = []
  const parsed: string[] = []
  for (const value of locs(xml)) {
    try {
      const url = new URL(value)
      const target = `${url.pathname}${url.search}`
      if (url.origin !== SITE_ORIGIN || discoveryFamilyIndex(target) < 0) findings.push({ severity: 'error', code: 'sitemap.discovery_unsupported_loc', target: '/sitemap-discovery.xml', message: `Unsupported or foreign discovery URL: ${value}` })
      else parsed.push(target)
    }
    catch { findings.push({ severity: 'error', code: 'sitemap.discovery_invalid_loc', target: '/sitemap-discovery.xml', message: `Invalid discovery URL: ${value}` }) }
  }
  const paths = [...new Set(parsed)].sort()
  if (!paths.length) findings.push({ severity: 'error', code: 'sitemap.discovery_empty', target: '/sitemap-discovery.xml', message: 'Discovery sitemap contains no recognized public detail URLs.' })
  const pathSet = new Set(paths)
  for (const path of paths) {
    const url = new URL(path, SITE_ORIGIN)
    const counterpart = url.pathname.startsWith('/sk/')
      ? `${url.pathname.slice(3)}${url.search}`
      : `/sk${url.pathname}${url.search}`
    if (!pathSet.has(counterpart)) findings.push({ severity: 'error', code: 'sitemap.discovery_reciprocal_missing', target: '/sitemap-discovery.xml', message: `${path} is missing locale counterpart ${counterpart}.` })
  }
  const gymIds = new Set<string>()
  for (const path of paths) {
    const url = new URL(path, SITE_ORIGIN)
    const routeGym = url.pathname.match(new RegExp(`^/(?:sk/)?gyms/(${UUID_PATH})(?:/equipment)?$`, 'i'))?.[1]
    const contextualGym = url.searchParams.get('gym')
    if (routeGym) gymIds.add(routeGym)
    if (contextualGym) gymIds.add(contextualGym)
  }
  for (const gymId of gymIds) {
    for (const required of [`/gyms/${gymId}`, `/sk/gyms/${gymId}`, `/gyms/${gymId}/equipment`, `/sk/gyms/${gymId}/equipment`]) {
      if (!pathSet.has(required)) findings.push({ severity: 'error', code: 'sitemap.discovery_gym_roots_missing', target: '/sitemap-discovery.xml', message: `Gym ${gymId} inventory is incomplete: missing ${required}.` })
    }
  }
  return { paths, findings }
}

export function routeFile(root: string, target: string): string {
  const pathname = new URL(target, SITE_ORIGIN).pathname
  if (pathname === '/') return join(root, 'index.html')
  const relative = pathname.slice(1)
  return /\.[^/]+$/.test(pathname) ? join(root, relative) : join(root, relative, 'index.html')
}

async function readLocal(root: string, path: string): Promise<string> {
  return readFile(routeFile(root, path), 'utf8')
}

async function readRemote(base: string, path: string): Promise<string> {
  const response = await fetch(new URL(path, `${base}/`), { redirect: 'manual', signal: AbortSignal.timeout(20_000), headers: { 'user-agent': 'LIFTAG-SEO-Audit/1.0' } })
  if (response.status >= 300 && response.status < 400) throw new Error(`Unexpected HTTP ${response.status} redirect to ${response.headers.get('location') ?? '(missing Location)'}`)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.text()
}

function paginationLinks(html: string, routePath: string): string[] {
  return [...html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/gi)].flatMap((match) => {
    try {
      const url = new URL(decodeEntities(match[1] ?? ''), SITE_ORIGIN)
      const page = Number(url.searchParams.get('page'))
      if (url.origin !== SITE_ORIGIN || url.pathname !== routePath || url.searchParams.size !== 1 || !Number.isInteger(page) || page < 2) return []
      return [`${url.pathname}?page=${page}`]
    }
    catch { return [] }
  })
}

function auditRobots(text: string): Finding[] {
  const findings: Finding[] = []
  if (!/^Sitemap:\s*https:\/\/liftag\.fit\/sitemap\.xml\s*$/mi.test(text)) findings.push({ severity: 'error', code: 'robots.sitemap', target: '/robots.txt', message: 'Missing canonical sitemap declaration.' })
  const groups: Array<{ agents: string[], directives: Array<{ name: string, value: string }> }> = []
  let agents: string[] = []
  let directives: Array<{ name: string, value: string }> = []
  const flush = () => {
    if (agents.length) groups.push({ agents, directives })
    agents = []
    directives = []
  }
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, '').trim()
    if (!line) continue
    const separator = line.indexOf(':')
    if (separator < 0) continue
    const name = line.slice(0, separator).trim().toLowerCase()
    const value = line.slice(separator + 1).trim()
    if (name === 'user-agent') {
      if (directives.length) flush()
      agents.push(value.toLowerCase())
    }
    else if (agents.length) directives.push({ name, value })
  }
  flush()
  for (const crawler of AI_CRAWLERS) {
    const group = groups.find(item => item.agents.includes(crawler.toLowerCase()))
    if (!group?.directives.some(item => item.name === 'allow' && item.value === '/')) findings.push({ severity: 'warning', code: 'robots.ai_crawler', target: '/robots.txt', message: `${crawler} is not explicitly allowed at /; verify agentic-search policy.` })
  }
  return findings
}

export function discoverySitemapAvailability(
  indexXml: string | null,
  discoveryXml: string | null,
  readError?: unknown,
): Finding[] {
  const declared = indexXml !== null && locs(indexXml).includes(`${SITE_ORIGIN}/sitemap-discovery.xml`)
  if (readError) return [{
    severity: declared ? 'error' : 'warning',
    code: declared ? 'sitemap.discovery_unreadable' : 'sitemap.discovery_unavailable',
    target: '/sitemap-discovery.xml',
    message: declared
      ? `The sitemap index declares discovery inventory, but it could not be read: ${String(readError)}`
      : `Public discovery details are outside this audit: ${String(readError)}`,
  }]
  if (discoveryXml !== null && indexXml !== null && !declared) return [{
    severity: 'error',
    code: 'sitemap.discovery_unindexed',
    target: '/sitemap.xml',
    message: 'Discovery sitemap exists but is absent from the sitemap index.',
  }]
  return []
}

async function mapConcurrent<T, R>(items: T[], concurrency: number, work: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length)
  let next = 0
  async function worker() {
    while (next < items.length) {
      const index = next
      next += 1
      results[index] = await work(items[index]!)
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()))
  return results
}

export async function runAudit(options: { root?: string, base?: string, allCatalog?: boolean }): Promise<AuditReport> {
  const remote = Boolean(options.base)
  const source = remote ? options.base!.replace(/\/$/, '') : resolve(options.root ?? '.output/public')
  const cache = new Map<string, string>()
  const read = async (path: string) => {
    if (!cache.has(path)) cache.set(path, await (remote ? readRemote(source, path) : readLocal(source, path)))
    return cache.get(path)!
  }
  const globalFindings: Finding[] = []
  const addGlobal = (severity: Severity, code: string, target: string, message: string) => globalFindings.push({ severity, code, target, message })

  let catalogXml = ''
  try { catalogXml = await read('/sitemap-catalog.xml') }
  catch (error) { addGlobal('error', 'sitemap.catalog_unreadable', '/sitemap-catalog.xml', `Cannot audit catalog samples: ${String(error)}`) }
  let indexXml: string | null = null
  try { indexXml = await read('/sitemap.xml') }
  catch (error) { addGlobal('error', 'sitemap.index_unreadable', '/sitemap.xml', String(error)) }
  let discoveryXml: string | null = null
  let discoveryError: unknown
  try { discoveryXml = await read('/sitemap-discovery.xml') }
  catch (error) { discoveryError = error }
  globalFindings.push(...discoverySitemapAvailability(indexXml, discoveryXml, discoveryError))
  if (discoveryXml !== null) globalFindings.push(...validateDiscoveryInventory(discoveryXml).findings)

  const staticPaths = expectedStaticPaths()
  try {
    const pagesXml = await read('/sitemap-pages.xml')
    const sitemapPaths = new Set(locs(pagesXml).map(value => new URL(value).pathname))
    for (const path of staticPaths) if (!sitemapPaths.has(path)) addGlobal('error', 'sitemap.static_missing', '/sitemap-pages.xml', `Static route ${path} is absent.`)
  }
  catch (error) { addGlobal('error', 'sitemap.pages_unreadable', '/sitemap-pages.xml', String(error)) }

  try { globalFindings.push(...auditRobots(await read('/robots.txt'))) }
  catch (error) { addGlobal('error', 'robots.unreadable', '/robots.txt', String(error)) }
  for (const briefing of ['/llms.txt', '/llms-full.txt']) {
    try {
      const text = await read(briefing)
      if (text.trim().length < 100) addGlobal('warning', 'llms.thin', briefing, `${briefing} has fewer than 100 characters.`)
    }
    catch (error) { addGlobal('warning', 'llms.unreadable', briefing, String(error)) }
  }

  const catalogIndexPaths = CATALOG_FAMILIES.flatMap(family => [`/${family}`, `/sk/${family}`])
  const detailSamples = catalogXml ? catalogSamples(catalogXml) : []
  const discoverySamples = discoveryXml ? discoveryInventoryPaths(discoveryXml) : []
  const discoveryPaths = discoveryXml
    ? (options.allCatalog ? discoveryInventoryPaths(discoveryXml, true) : discoverySamples)
    : []
  const allCatalogPaths = options.allCatalog && catalogXml
    ? [...new Set(locs(catalogXml).flatMap((value) => {
        try {
          const url = new URL(value)
          return url.origin === SITE_ORIGIN && /^\/(?:sk\/)?(?:exercises|machines|muscles)(?:\/|$)/.test(url.pathname)
            ? [url.pathname]
            : []
        }
        catch { return [] }
      }))].sort()
    : []
  for (const family of CATALOG_FAMILIES) {
    if (!detailSamples.some(path => path.startsWith(`/${family}/`))) addGlobal('error', 'catalog.sample_missing', '/sitemap-catalog.xml', `No English ${family} detail URL available to sample.`)
  }
  const paginationPaths: string[] = []
  if (remote) {
    const paginationRoots = [...new Set([
      ...catalogIndexPaths,
      ...allCatalogPaths.filter(path => /^\/(?:sk\/)?muscles\/[^/]+$/.test(path)),
    ])]
    for (const rootPath of paginationRoots) {
      const pending = [rootPath]
      const seen = new Set<string>()
      while (pending.length && seen.size < 100) {
        const target = pending.shift()!
        if (seen.has(target)) continue
        seen.add(target)
        try {
          for (const next of paginationLinks(await read(target), rootPath)) if (!seen.has(next)) pending.push(next)
        }
        catch { break }
      }
      paginationPaths.push(...[...seen].filter(path => path !== rootPath))
      if (seen.size >= 100) addGlobal('error', 'pagination.bound_exceeded', rootPath, 'Stopped after 100 catalog pages; audit cannot prove the full pagination chain.')
    }
  }
  const paths = [...new Set([...staticPaths, ...catalogIndexPaths, ...detailSamples, ...allCatalogPaths, ...paginationPaths, ...discoveryPaths])]
  const pages = await mapConcurrent(paths, 4, async (path): Promise<PageResult> => {
    try { return auditHtml(path, await read(path), remote ? new URL(path, `${source}/`).href : routeFile(source, path)) }
    catch (error) {
      return { path, source, findings: [{ severity: 'error', code: 'page.unreadable', target: path, message: String(error) }], facts: { title: null, description: null, canonical: null, lang: null, h1Count: 0, jsonLdCount: 0, visibleWords: 0 } }
    }
  })
  const muscleSample = detailSamples.find(path => /^\/muscles\/[^/]+$/.test(path))
  const equipmentSamples = discoverySamples.filter(path => new RegExp(`^/(?:sk/)?gyms/${UUID_PATH}/equipment$`, 'i').test(path))
  const searchRoots = [
    ...catalogIndexPaths.filter(path => /\/(?:exercises|machines)$/.test(path)),
    ...(muscleSample ? [muscleSample, `/sk${muscleSample}`] : []),
    ...equipmentSamples,
  ]
  for (const rootPath of searchRoots) {
    const target = `${rootPath}?q=bench`
    try { pages.push(auditHtml(target, await read(target), remote ? new URL(target, `${source}/`).href : routeFile(source, rootPath), { canonicalPath: rootPath, expectNoindex: true })) }
    catch (error) {
      pages.push({ path: target, source, findings: [{ severity: 'error', code: 'page.unreadable', target, message: String(error) }], facts: { title: null, description: null, canonical: null, lang: null, h1Count: 0, jsonLdCount: 0, visibleWords: 0 } })
    }
  }
  const allFindings = [...globalFindings, ...pages.flatMap(page => page.findings)]
  const errors = allFindings.filter(item => item.severity === 'error').length
  const warnings = allFindings.filter(item => item.severity === 'warning').length
  return { generatedAt: new Date().toISOString(), mode: remote ? 'remote' : 'local', source, pages, globalFindings, summary: { pagesAudited: pages.length, errors, warnings, passed: errors === 0 } }
}

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(name)
  return index >= 0 ? process.argv[index + 1] : undefined
}

async function main() {
  if (process.argv.includes('--help')) {
    console.log('Usage: node --experimental-strip-types scripts/seo-audit.ts [--root .output/public | --base https://liftag.fit] [--all-catalog] [--output report.json]')
    return
  }
  const report = await runAudit({ root: arg('--root'), base: arg('--base'), allCatalog: process.argv.includes('--all-catalog') })
  const json = `${JSON.stringify(report, null, 2)}\n`
  const output = arg('--output')
  if (output) {
    await mkdir(dirname(resolve(output)), { recursive: true })
    await writeFile(resolve(output), json, 'utf8')
  }
  console.log(`SEO audit: ${report.summary.pagesAudited} pages, ${report.summary.errors} errors, ${report.summary.warnings} warnings${output ? `; JSON: ${resolve(output)}` : ''}`)
  for (const finding of [...report.globalFindings, ...report.pages.flatMap(page => page.findings)].filter(item => item.severity === 'error')) console.error(`ERROR ${finding.code} ${finding.target}: ${finding.message}`)
  if (!output) process.stdout.write(json)
  if (!report.summary.passed) process.exitCode = 1
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) await main()
