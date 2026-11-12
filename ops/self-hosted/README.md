# Website hosting

`liftag.fit` and `motionwisp.com` run on the existing ARM64 host behind Cloudflare
and Nginx. The production API, PostgreSQL and Redis containers are independent;
these scripts must never restart them, join their Docker network, or mount their
volumes. Builds run in GitHub Actions, outside the database host.

## Releases

Each repository's `Self-hosted production` workflow verifies and builds its own
Node 24 ARM64 image on pushes to `main`. A per-repository SSH key can invoke only
`receive-deploy.py <site>` with a 40-character commit SHA. It cannot open a shell
or forward ports. The host key is pinned in `WEBSITE_DEPLOY_KNOWN_HOSTS`.

Required repository settings:

- Secret `WEBSITE_DEPLOY_KEY`; variables `WEBSITE_DEPLOY_HOST` and
  `WEBSITE_DEPLOY_KNOWN_HOSTS`.
- LIFTAG public build variables: `NUXT_PUBLIC_GOOGLE_MAPS_API_KEY`,
  `NUXT_PUBLIC_GOOGLE_MAPS_MAP_ID`, `NUXT_PUBLIC_GOOGLE_SITE_VERIFICATION`,
  `NUXT_PUBLIC_ANALYTICS_WEBSITE_ID`.
- Motionwisp public build variables: `NEXT_PUBLIC_META_PIXEL_ID`,
  `NEXT_PUBLIC_CALENDLY_URL`, `NEXT_PUBLIC_ANALYTICS_WEBSITE_ID`.

Private application settings stay in `/opt/liftag-web/private/<site>.env`, mode
600, as raw `NAME=value` lines. Never commit them or include them in build args.
Sensitive Vercel environment exports contain placeholders: validate credentials
against their provider before switching traffic. The deployment script rejects
short Motionwisp inbox, cron and email credentials.

Install the Python scripts in `/opt/liftag-web/`. The receiver loads the image;
`deploy.py` starts the inactive website slot with memory/CPU limits, waits for a
200 response, stages static files, tests and reloads Nginx, then stops the previous
website container. Current and previous release metadata are `<site>.json` and
`<site>.previous.json`. Old hashed assets are carried forward for already-open tabs.
Do not run website containers through Compose: `compose.yml` owns only analytics.

To roll back application code, use an existing image from the previous metadata:

```sh
python3 /opt/liftag-web/deploy.py liftag liftag-web-liftag:<previous-commit-sha>
```

Settings and database changes need their own rollback. A failed release health
gate leaves the existing site active. Check `docker ps`, `nginx -t`, the current
release JSON, and both public domains after every release. Review unused website
images and old static release directories periodically; never prune shared Docker
resources indiscriminately.

## Nginx and TLS

Install `nginx-http.conf` under `/etc/nginx/conf.d/liftag-web-settings.conf`;
the proxy, real-IP and analytics snippets under `/etc/nginx/snippets/` with
`liftag-web-` names; and the two vhosts under `sites-available/` and
`sites-enabled/`. `deploy.py` owns `conf.d/liftag-web-<site>.conf` upstreams.
Keep the existing API vhost unchanged.

Cloudflare's proxied apex records point to the host, with `www` pointing to each
apex. Preserve email, verification, API, auth and staging records. The TLS
certificates cover each apex and `www`, plus `stats.motionwisp.com`. Certbot uses
webroot HTTP-01 at `/var/www/letsencrypt` and reloads Nginx after renewal; its
staging renewal was verified for both certificates after the DNS cutover.

Nginx preserves forwarding headers, redirects, app-link JSON, privacy headers,
byte-range media delivery and static cache lifetimes. HTML uses `no-transform`
to prevent CDN rewrites of SSR markup and public email links. Access logs omit
query strings. Refresh `realip.conf` from Cloudflare's official IP list when its
ranges change.

## Analytics and operations

Umami runs in its own resource-limited Compose stack and PostgreSQL 16 database.
Public sites expose only `/_analytics/script.js` and `/_analytics/api/send`;
the authenticated dashboard is `https://stats.motionwisp.com`. Its login is stored
in `/opt/liftag-web/private/analytics-admin.json`, readable only by root.
Historical Vercel analytics remain in Vercel; they are not imported into Umami.

Motionwisp keeps its existing Meta Pixel, consent controls, attribution, funnel
events, private lead inbox and provider stores. Umami pageviews require analytics
consent. LIFTAG excludes private app handoff routes. Both trackers strip query
strings/fragments and full referrer paths; respect Do Not Track, and LIFTAG also
respects Global Privacy Control. Do not include contact fields in pageview data.

`motionwisp-health.timer` replaces the Vercel cron at 07:00 UTC daily. Its service
resolves the active website container before running the existing authenticated
provider check and owner-alert logic. Install both units under `/etc/systemd/system`
and enable the timer after valid runtime credentials are installed.

`liftag-web-backup.timer` runs daily at 03:20 UTC. `backup-web.py` prunes website
analytics older than 90 days, dumps only the isolated analytics database, bundles
private website settings and release metadata, and encrypts to the existing
owner-held age recovery key before uploading with the existing write-only S3
backup profile. `.web-backup.age` archives cannot be mistaken for production
database `.dump.age` backups. The existing production backup job is unchanged.
Run `backup-web.py --verify-restore` with the backup service's EnvironmentFile to
verify a dump in a disposable analytics database. Recovery requires the owner's
off-server private age key; no decrypting key is stored on this host.

For recovery, decrypt the website archive offline, restore `analytics.pgdump`
into the isolated analytics database, restore private settings with mode 600,
and deploy the recorded website images. Validate providers and public SEO before
switching traffic. Check backup success in
`/var/lib/liftag-web-backup/last-success.json` and the service journal.

Vercel Git deployments are disabled in repository configuration. Keep the old
projects and their historical settings available; unpause and verify a working
Vercel deployment before using Vercel DNS values for any rollback.
