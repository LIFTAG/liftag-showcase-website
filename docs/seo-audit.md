# SEO and agentic-search audit

The audit is a reproducible release check for crawlability and server-rendered search signals. It does not assign a made-up SEO score or predict traffic. It exits nonzero when a required audit check fails and writes a machine-readable JSON report. An audit error is not proof that Google cannot index the page; checks such as heading structure are editorial requirements.

Run it against a deployed preview or production URL after deployment:

```bash
cd new_app
node --experimental-strip-types scripts/seo-audit.ts \
  --base https://liftag.fit \
  --all-catalog \
  --output ../docs/seo-production-audit.json
```

For a compiled local-server audit, start the built server and point the crawler at its loopback URL. This exercises runtime sitemap and catalog behavior:

```bash
cd new_app
PORT=3027 node .output/server/index.mjs
# In another terminal:
node --experimental-strip-types scripts/seo-audit.ts \
  --base http://127.0.0.1:3027 \
  --all-catalog \
  --output ../docs/seo-local-audit.json
```

`--root .output/public` remains available for static-artifact diagnostics. Dynamic catalog endpoints may be absent from a generated directory; the resulting unreadable sitemap or page errors are truthful limitations of that artifact and do not verify runtime behavior.

The deployed audit is authoritative because catalog sitemap routes depend on live catalog data. The audit covers:

- every route in `utils/staticPages.ts` in English and Slovak;
- Czech legal routes;
- the English and Slovak exercise, machine, and muscle indexes;
- one English and Slovak detail URL from each catalog family, selected from the live catalog sitemap;
- every catalog pagination URL reachable through the server-rendered `?page=N` links, with a 100-page safety bound per localized index;
- representative exercise, machine, muscle, and localized gym-equipment search URLs, which must emit `noindex,follow` and canonicalize to their unfiltered route;
- representative localized gym, gym equipment, gym machine, affiliated trainer, and gym-attached public routine URLs when `sitemap-discovery.xml` is available;
- titles, descriptions, canonical URLs, language, H1 count, indexability, hreflang, social metadata, valid JSON-LD, and server-rendered text;
- `robots.txt`, the static and catalog sitemaps, `llms.txt`, `llms-full.txt`, and explicit access for major answer/search agents.

`--all-catalog` audits the deduplicated union of every same-origin English and Slovak exercise, machine, and muscle URL in `sitemap-catalog.xml`. Requests run with at most four concurrent fetches and results retain deterministic inventory order. Without that flag, the command samples one detail page per catalog family; this is useful for a fast smoke check but is not a full catalog crawl.

For backward compatibility, `--all-catalog` also audits every supported URL supplied by `sitemap-discovery.xml`. That discovery inventory is intentionally gym-rooted: it can include gyms, their equipment, canonical machine URLs with a gym context, affiliated trainers, and gym-attached public routines. The supported API has no global public trainer or routine directory, so the report must not claim coverage of trainers or routines that are not connected to an enumerated gym. An older sitemap index that does not declare discovery inventory produces a coverage warning when the child is unavailable. Once the root index declares `sitemap-discovery.xml`, an unreadable or 503 child is a hard error; a declared inventory must never silently disappear from a passing audit.

A readable discovery sitemap must contain at least one recognized URL, contain no malformed, foreign, or unsupported locations, and provide reciprocal English and Slovak entries. Every referenced gym ID must include both localized gym-detail and equipment roots. Empty or partial inventories fail even when the upstream public API legitimately has no rows, because that result cannot demonstrate discovery-page coverage.

The checked-in `seo-production-baseline-2026-10-02.json` is the fast 84-page smoke baseline created before the implementation changes. It covers all static pages, catalog indexes, one detail per family and search-policy variants. It is deliberately not represented as a full catalog crawl. Use `--all-catalog` against the compiled local server and the deployed release for exhaustive post-change evidence.

Errors are release blockers: missing/unreadable pages, sitemap omissions, bad canonicals, noindex on public targets, missing hreflang, or invalid JSON-LD. Warnings identify optimization opportunities, such as thin server-rendered copy, missing structured data, or likely snippet truncation. A clean report verifies only the checked technical signals. It cannot prove that a search or answer engine will crawl, index, cite, rank, or send traffic to a page; use the measurement workflow below for observed impressions and clicks.
