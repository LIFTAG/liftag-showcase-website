# Catalog media CDN

Account: `997916278530`. CloudFormation stack: `liftag-catalog-media-cdn`, region `eu-central-1`.

| Environment | Distribution | Domain | S3 bucket |
| --- | --- | --- | --- |
| Production | `E1MTOY8OYCVOAU` | `dg7n4oxpac1h9.cloudfront.net` | `liftag-media-prod-997916278530-eu-central-1` |
| Staging | `E9WJMPCHGRHHD` | `d3tf9y94un7tuc.cloudfront.net` | `liftag-media-997916278530-eu-central-1-an` |

## Why this exists

Native browser video requests can cache an S3 response without CORS headers for a year. A later HLS.js request to the same URL then fails with a CORS network error. Changing bucket CORS does not repair existing browser responses.

Each distribution uses the corresponding bucket's `/catalog/exercise-templates` origin path. For example, `/incline-dumbbell-press/videos/20260828T124537Z/master.m3u8` on the CDN maps to `/catalog/exercise-templates/incline-dumbbell-press/videos/20260828T124537Z/master.m3u8` on S3.

- CloudFront always sends `Origin: https://liftag.fit` to S3, even for native-video requests that lack Origin. S3 therefore always returns its existing wildcard CORS headers.
- The response headers policy uses `OriginOverride: false` to preserve S3's wildcard CORS headers, including on requests without Origin. This setting matters: `true` was tested and removed the CORS header for those requests. The policy supplies CORS defaults when S3 supplies none; S3's existing expose-header list takes precedence on successful responses.
- The cache respects S3 cache durations, including `no-cache`/`no-store` with a zero minimum TTL. It does not vary on viewer Origin, cookies, or query strings. Only public, unsigned catalog media belongs on these endpoints.
- Byte ranges, HTTPS, HTTP/2 and HTTP/3 are supported. Error caching is set to zero; S3-origin errors have CloudFront's one-second minimum.
- Existing bucket permissions, object contents, upload endpoints and database URLs are unchanged.
- CloudFront uses normal usage-based billing. No custom domain or DNS changes are required.

## Website integration and rollout

`new_app/utils/exerciseHls.ts` maps public S3 catalog video URLs to the matching CDN. Both native playback and HLS.js use this mapping. HLS.js also maps absolute S3 URLs inside manifests; relative child playlists and segments resolve against the CDN response URL. URLs with signatures or other custom query parameters are preserved. The old `liftag_hls` query parameter is removed when mapping to the CDN.

The AWS stack can be deployed independently. **The website must be deployed with this mapping before live website traffic uses these endpoints.** Already-open pages continue using their loaded player until refreshed or revisited. The API and released mobile apps retain their existing URLs.

Production currently returns staging video URLs because `liftag-api/database/data/default_catalog.json` contains literal staging URLs and `database/seeders/2.catalog.ts` stores `ex.video` verbatim. This CDN rollout preserves source environments. Migrating those records to production media requires a separate inventory comparison and backend rollout. Do not set `S3_PUBLIC_URL_BASE` to these domains: their origin path is limited to exercise templates, while that setting affects other media namespaces too.

## Verify and maintain

Verify the AWS identity before an infrastructure change:

```sh
aws sts get-caller-identity --profile liftag-admin
aws cloudformation validate-template --template-body file://ops/aws/catalog-media-cdn.json --profile liftag-admin --region eu-central-1
aws cloudformation deploy --stack-name liftag-catalog-media-cdn --template-file ops/aws/catalog-media-cdn.json --profile liftag-admin --region eu-central-1
python3 ops/aws/verify-catalog-media-cdn.py
```

The smoke test verifies the master manifest with and without Origin, a CDN cache hit, three child playlists, all twelve media segments, and a 206 byte-range response in each environment.

AWS documents the fixed Origin header approach in [Add custom headers to origin requests](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/add-origin-custom-headers.html) and origin-header preservation in [Understand response headers policies](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/understanding-response-headers-policies.html).

Changing the stack does not evict files already stored in browsers. Publish changed media under a new versioned directory. For urgent removal, remove the S3 object and invalidate the corresponding CDN path in its environment; a CDN invalidation cannot revoke downloaded browser copies.

Rollback application routing first, then disable/delete the stack only after clients stop using its domains. Recreating a distribution gives it a different domain, which requires updating the website mapping and this smoke test. The source S3 objects are not managed or deleted by this stack.
