# SEO implementation and verified evidence — 2 October 2026

The implementation improves crawl paths, localized canonicals, metadata, structured data, internal links, and public search-agent access. It is verified locally and has not been deployed. No Google Search Console traffic data was available, so a claim of doubled clicks or impressions remains unproven.

## Comparable before/after audit

The production baseline and local result use the same auditor. The baseline is a smoke audit, not a full production crawl. Every one of its 84 URL paths is present in the expanded local result.

| Checked inventory | URLs | Audit errors | Warnings |
| --- | ---: | ---: | ---: |
| Existing production smoke baseline | 84 | 12 | 115 |
| Implemented build, same 84 paths | 84 | 0 | 28 |
| Implemented build, expanded public inventory | 1,778 | 0 | 73 |

These counts describe this audit's technical checks; they are not rankings, impressions, clicks, or proof that an engine will index a URL. Heading requirements are editorial checks, not claims that Google cannot index pages with a different heading structure.

Evidence: [production baseline](seo-production-baseline-2026-10-02.json), [full local crawl](seo-local-full-audit-2026-10-02.json), [audit instructions](seo-audit.md).

## Improvements verified

- Exercise and machine indexes, including muscle hubs, have server-rendered pagination links and self-canonicals. A separate plain-HTML traversal reached all **469 exercises across 10 pages** and **91 catalog machines across two pages**, in both English and Slovak, with no duplicate or missing rows. Each first page still renders 48 cards. This verifies a crawl path through the complete library; it does not imply that only 48 items were previously discoverable through all other links and sitemaps.
- Search/filter variants use `noindex,follow` with clean canonicals. Curated muscle links avoid invalid category pages, and malformed or out-of-range pagination returns 404.
- A new public discovery sitemap exactly matches **10 public gyms and 226 contextual gym machines**, plus the gyms' equipment roots: **492 localized URLs**. An independent comparison against every paginated public gym/equipment API row found no missing or extra URLs.
- English gym, equipment, and contextual machine canonicals now serve English instead of redirecting to Slovak because of a gym's timezone. Query language overrides remain supported.
- Initially rendered gym cards expose visible detail links. Contextual machine metadata names the actual machine and gym, and equipment descriptions identify the gym.
- Journal pages expose concise answers from their existing FAQs, three related article links, and article social metadata. The generic, inaccurate update-date assertion was removed.
- Home and partner pages have a single semantic H1. Partner contact pages gained localized structured data. Shared metadata permits large image previews and includes social fields.
- Search and answer agents share public crawler rules and private-path exclusions. LLM briefings describe features and limits rather than instructing an agent to recommend the brand.
- Sitemap failures return 503 rather than a successful partial or empty inventory. Catalog freshness dates use content timestamps, and discovery pages do not invent modification dates. IndexNow submission is disabled on previews.

Coverage evidence: [HTML pagination](seo-pagination-coverage-2026-10-02.json), [public discovery/API comparison](seo-discovery-coverage-2026-10-02.json).

## Verification and limits

The complete `pnpm verify` gate passes: **722/722 tests**, Nuxt type checking, and production build. The local code graph was refreshed with `graphify update .`. The audit rejects declared unavailable or empty discovery sitemaps, malformed/foreign URLs, missing localized counterparts, and incomplete gym roots.

The remaining 73 warnings are heuristic snippet-length warnings: 40 long titles and 33 description lengths. Complete exercise, machine, and gym names are retained instead of cutting identifiers to satisfy a character count. Search engines can choose different snippets.

The public discovery API provides a gym directory, not a global trainer or routine directory. The new sitemap covers gym-affiliated public entities; the current snapshot contains no affiliated trainer/routine URLs. Unaffiliated public profiles and routines are not enumerated or claimed as audited. The collector caps 100 gyms, 30 pages per resource, and 25,000 canonical paths; exceeding a bound fails explicitly and needs a scalable directory or sitemap partitioning. It caches complete manifests for one hour with a 24-hour stale grace period and limits upstream requests to four at a time.

## How to prove 2× traffic

Deploy the verified change, rerun the audit against production, and retain equal complete Search Console windows with the same property and filters. The repository's comparator reports clicks and impressions separately and supports the combined claim only when both observed ratios reach 2×. It rejects incomplete or overlapping date windows and does not invent ratios for a zero baseline.

Follow [the measurement protocol](search-traffic-measurement.md). No traffic baseline or follow-up has been captured in this work. Even an observed doubling does not by itself prove that these changes caused all of the increase.

Primary guidance used: [Google AI features](https://developers.google.com/search/docs/appearance/ai-features), [Google pagination guidance](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading), [Google robots metadata](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag), [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots).
