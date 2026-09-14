# Public Explore

The public discovery experience lives in `new_app`, alongside the existing catalog. The React Native components in `Liftio-app/app/gym`, `src/components/explore`, `src/components/gym`, and the public trainer/routine screens are the design and API references.

## Routes

| Route | Purpose |
| --- | --- |
| `/explore` | Google map, gym search, filters, and results |
| `/gyms/:id` | Public gym details and equipment preview |
| `/gyms/:id/equipment` | Paginated equipment, manufacturer and muscle filters |
| `/machines/:gymMachineId?gym=:gymId` | Resolved gym machine in the shared catalog presentation |
| `/exercises/:templateIdOrCustomId?gym=:gymId&machine=:gymMachineId&exercise=:resolvedExerciseId` | Full exercise page with gym overrides (also `/sk/exercises/...`) |
| `/gyms/:id/machines/:machineId` | Permanent redirect to the shared machine route |
| `/explore/trainers/:id` | Public trainer, contacts, gyms, workouts, and plan previews |
| `/explore/routines/:id` | Public workout, supersets, and per-set prescriptions |

Existing `/machines/:slug`, `/exercises/:slug`, `/sk/exercises/:slug`, `/routines/:id`, `/plans/:id`, and `/get` keep their existing responsibilities. The catalog machine page and gym machine page share `CatalogMachinePresentation.vue`. Gym-machine IDs, QR IDs, and catalog-template IDs are separate fields. Exercise links use a real template ID when available and retain the resolved gym-exercise ID separately. Template-free exercises also open full pages, with explicit gym/machine context; no catalog or QR identity is invented. Both machine and exercise detail routes render per request to prevent ISR payloads from dropping gym/language query context; the underlying catalog data and index remain cached.

## Configuration and launch dependencies

Configure both public runtime variables:

For local development, copy `new_app/.env.example` to `new_app/.env`, fill in the Maps values, and restart the development server. Set the same variables in the deployment environment for production.

For local testing before creating a production map ID, set `NUXT_PUBLIC_GOOGLE_MAPS_MAP_ID=DEMO_MAP_ID`. This is Google's documented testing ID and the fallback used by the dashboard's interactive location picker. It still requires your API key. A build made with `NITRO_PRESET=node-server` can load the local file with `VERCEL_ENV=preview node --env-file=.env .output/server/index.mjs` from `new_app`; the default Vercel build has a different output layout.

```dotenv
NUXT_PUBLIC_GOOGLE_MAPS_API_KEY=<website-restricted Maps JavaScript API key>
NUXT_PUBLIC_GOOGLE_MAPS_MAP_ID=<production Google map ID>
```

Enable the Maps JavaScript API and restrict the key to the website's allowed referrers. Google advanced markers require a map ID. See [Google's advanced-marker setup](https://developers.google.com/maps/documentation/javascript/advanced-markers/add-marker). The SDK loads only on Explore. Missing configuration or a failed SDK leaves gym search and detail navigation available with a retry state.

**Do not launch until [API PR #397](https://github.com/LIFTAG/liftag-api/pull/397), merge commit `993e6fb9`, is deployed to production and verified.** It merged into `develop` on September 13, 2026. Anonymous checks on September 14 found production map and nearby results unchanged when filtering by the nonexistent manufacturer `00000000-0000-4000-8000-000000000001`; staging returned zero, as expected. Staging also passed positive-brand and multiple-brand OR checks without duplicate gyms. Verify both endpoint families, including filtered pagination/truncation metadata, after deployment.

The apparent app/website discrepancy came from the checked environments: the local app `.env` and development/preview/staging profiles point at `api-staging.liftag.fit`; the website uses `api.liftag.fit`. Both clients send repeated `machineManufacturerIds[]` parameters and rely on backend manufacturer matching. This does not establish which build is installed on a particular phone. No backend or app files were changed, and the website does not hide this production issue behind local brand filtering.

Before launch, also verify advanced photo markers, keyboard marker selection, viewport refresh, zoom-limit notices, and location centering with the production Maps configuration. Fully custom machines have synthetic fixture coverage; verify one real template-free machine in staging as well. WebKit and physical iOS/Android keyboard checks remain required; the available interactive browser verification used Chromium.

### Requested backend follow-up: gym brand counts and ordering

The existing `GET /v1/gyms/:id?equipment=summary` response currently lists `equipment.manufacturers` alphabetically without per-brand machine counts. The desired additive contract is `{ id, name, equipmentCount }`, where `equipmentCount` sums physical machine quantities for that brand in that gym, including assigned custom/stickerless equipment. Sort descending by that count, then alphabetically by name and finally ID for stable ties. Avoid inflated counts from exercise/media joins; unbranded machines still belong in the overall equipment total.

For example, Matrix with 100 units should precede Booty Builder with 3. No new endpoint is needed. Both gym-page chips and equipment-directory filters preserve the API order, so the corrected order will flow through automatically. This backend change and displaying per-brand counts are **not implemented** here; displaying the new field later also requires retaining it in the website's types/normalization and rendering it.

## Implementation boundaries

- Thin page components select the discovery layout and a focused view component. The discovery layout reuses `SiteNav`; navigation labels are Gyms (discovery) and For gym owners (marketing). A single language selector lives in the shared navbar on desktop and mobile; search, breadcrumbs, and detail pages have no separate switches. A compact globe/code button opens a styled list with native language names and a selected checkmark. The native Popover API keeps it above the navbar and handles outside-click/Escape dismissal; arrow keys, Home/End, and type-ahead navigate the options. The options come from `SITE_LANGUAGES` in `utils/siteLocale.ts`, currently English and Slovenčina, so more languages can be added without changing the navbar layout.
- `useSiteLocale` owns the shared language preference (`liftag-language`, one year, site-wide), browser fallback, and language navigation. `useDiscoveryLocale` adds discovery copy, links, and gym-timezone defaults, publishing the resolved page language to the navbar without saving automatic defaults. Explicit `lang` still overrides the saved preference. The existing exercise and legal translations use their real localized paths; marketing pages keep their current routes and English copy. New translated route families can be registered in `utils/siteLocale.ts` as the rest of the site is translated. The navbar control renders on the client, with a reserved-size fallback, so cached/prerendered pages never embed a visitor's selection. Existing page metadata continues to describe the actual content language.
- `useExplore` owns the three query modes, request cancellation, debounce, viewport bounds, selection, URL synchronization, pagination, and in-session restoration. Returning from details restores results and list position; cached results older than one minute refresh. Longitude wrapping splits a viewport into valid requests. Like the app, map refreshes retain the previous results while fetching; query bounds round to five decimals and marker instances update in place. Cards and pins share the same activation handler: the first click selects and centers the gym; activating the selected gym opens its detail. Result cards support Enter and Space, with a localized action label and an icon that changes from a map pin to a detail arrow when selected.
- `useDiscoveryLocale` applies URL language, saved manual preference, gym timezone, and browser-language defaults in that order. Gym contexts in Prague/Bratislava use Slovak; unknown gym locations use English. Contextual navigation carries the resolved language.
- `useDiscoveryResource` renders detail data through SSR. `useDiscoveryPage` handles SSR first pages and cancellable pagination with keys containing resource, language, filters, and page size.
- `server/api/explore` contains explicit GET handlers. `discoveryApi.ts` validates route/query inputs and provides fixed-path, unauthenticated upstream requests with a 12-second deadline. It also resolves the request language, so a handler cannot silently omit it, and `discoveryListHandler` supplies the shared shape of the paginated lists: a route file declares only its upstream path and row normalizer. It forwards no visitor credentials. Private/missing resources return 404; temporary upstream failures return 502. Discovery pages and API responses use `no-store`.
- `discoveryData.ts` validates unknown wire data and builds typed display models from `types/discovery.ts`. Missing ratings, quantities, hours, identities, and prescriptions remain missing. Resolved gym descriptions, media, and exercise overrides are retained.
- `DiscoveryAppGate` handles AI, reviews, workout actions, and plan previews. It opens a native modal with dismissal, Escape, focus containment/restoration, the existing `InstallQrCode` artwork, localized store buttons, and the `/get` flow. Public trainer contact links remain ordinary links.
- `DiscoveryDialog`, `DiscoveryGallery`, and `DiscoveryVideo` provide keyboard-accessible media and exercise panels, including native video, HLS, and supported YouTube embeds. The expanded gallery uses a dedicated fullscreen dialog variant with uncropped media, safe-area spacing, previous/next controls, and left/right keyboard navigation that preserves native video controls. Filters and app gates retain their regular dialog sizes. Reduced motion is respected throughout discovery.
- Gym equipment previews and the directory use square image tiles with full-card links. Manufacturer names sit in readable badges at the bottom left of the image; quantities sit at the top right. The gym's overall physical equipment count is prominent beside the Equipment heading and remains distinct from the directory's equipment-type count.

Global name/address search intentionally ignores discovery filters. Their selections stay in state and resume when search clears. Rating, open status, and LIFTAG support refine returned results; distance queries and manufacturer matching use the backend. Users can paginate even when the current page has no matching visible results.

## Repeatable verification

From `new_app`:

```sh
pnpm verify
```

The suite includes `tests/discovery.test.ts` for language precedence, query modes, filter behavior, bounds wrapping, state restoration parsing, URL write/read round-trips, strict pagination, gym closures, custom/stickerless machines, overrides, supersets, and missing targets. Gym ownership of a contextual machine is an endpoint concern, so `tests/discovery.integration.mjs` asserts the 404 rather than the normalizer. `tests/exploreRequests.test.ts` exercises retained pins, rounded queries, obsolete-response rejection, and pending search/filter/selection preservation when language changes. `tests/siteLocale.test.ts` covers existing translated routes and preserving query context during language navigation.

For controlled acceptance data, first stop the development server and build a Node preview:

```sh
VERCEL_ENV=preview NITRO_PRESET=node-server pnpm build
```

Then run these in separate terminals:

```sh
node --experimental-strip-types tests/fixtures/discovery-server.mjs
```

```sh
VERCEL_ENV=preview NUXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4015 PORT=3002 HOST=127.0.0.1 node .output/server/index.mjs
```

```sh
node --experimental-strip-types tests/discovery.integration.mjs
```

`VERCEL_ENV=preview` disables the website's existing production IndexNow submission during local acceptance runs. The fixture is an external local server, never a production Nuxt endpoint. `DISCOVERY_TEST_ORIGIN` can override the test origin; `DISCOVERY_FIXTURE_PORT` and `DISCOVERY_FIXTURE_SITE` can override fixture ports/media URLs.

Use clean generated output when switching between the Node and Vercel presets. A previous `.output/public` directory can otherwise be picked up during prerendering and leave stale marketing HTML in a later build. Do not run development and production builds against the same `.nuxt` directory concurrently.

Useful fixture routes:

- `/gyms/11111111-1111-4111-8111-111111111111`: supported, temporarily closed gym, missing hours, image/video gallery, custom machine, trainer, and paginated workouts.
- `/gyms/22222222-2222-4222-8222-222222222222`: unsupported gym with a separate reviews failure.
- `/gyms/11111111-1111-4111-8111-111111111111/machines/33333333-3333-4333-8333-333333333333`: no QR sticker or catalog template, custom exercise instructions.
- `/explore/trainers/55555555-5555-4555-8555-555555555555`: contacts, gym affiliation, 25 routines, and 25 plan previews.
- `/explore/routines/44444444-4444-4444-8444-444444444444`: ordered superset, varying reps/weights/rest/RPE, timed set, calories, notes, and explicit null overrides.
- `/explore/routines/99999999-9999-4999-8999-999999999999`: unavailable/private resource.
- Explore search `fail` returns a temporary error; `slow` delays the search response for cancellation checks. A map latitude span over 20 degrees returns a zoom-in notice.

The integration script checks normalized public endpoints, manufacturer OR matching, pagination, custom IDs, ownership rejection, error statuses, SSR content, metadata, and URL/cookie/gym language precedence. It uses no production accounts or writes.

### Machine video and contextual error regressions

`tests/catalogVideoPlayer.test.ts` executes the actual player setup with Vue reactivity and controlled media objects. It covers source changes, HLS attachment cleanup, pending playback cancellation, hover preview cleanup, and preserving playback when only the poster or title changes. `tests/catalogExerciseResource.test.ts` checks temporary catalog errors versus confirmed 404s, UUID fallback, custom exercises, cancellation, gym overrides, and ordinary catalog routes.

For browser checks, the fixture machine has a photo followed by two video URLs (the same local clip with distinct query strings):

1. Open `/machines/33333333-3333-4333-8333-333333333333?gym=11111111-1111-4111-8111-111111111111&lang=en` at a phone width, such as 390px.
2. Select Video 2 and play it. Native pause/seek controls must receive pointer input; the close button must sit below the fixed navbar. Muscle chips must remain clickable.
3. While playing, select Video 3. The previous player must stop and show the Watch instructions button. Playing again must load the URL ending in `clip=b`.
4. Close the video, select Photo 1, and verify the image returns. Repeat source switching at desktop width; also check phone landscape cinema mode on a touch device.

## Verification coverage

- The unit suite, TypeScript, and production build are included in `pnpm verify`.
- Fixture integration covers both shared detail routes, template-free machines/exercises, English/Slovak SSR, contextual canonicals, legacy redirects (301), malformed contexts (400), ownership rejection (404), public-content pagination, and section-specific failures.
- Chromium checks during implementation covered mobile widths of 320–430px, tablet, and 1440px desktop. The desktop Explore sidebar measures 400px. Search/filter transitions, stale requests, first/second card and pin activation, Back restoration, denied location, and equipment/trainer pagination were exercised.
- The supplied Maps key and `DEMO_MAP_ID` rendered the dark basemap and live photo markers locally; marker selection updated the card, camera, and URL. This is local configuration validation, not production launch approval.
- The fullscreen gallery was checked at 360×800, 844×390, 1440×1000, and 2555×1315, including uncropped images, wrapping navigation, Escape, and restored focus. Regular app/filter dialogs retain their own sizing.
- App-modal checks covered gym reviews, AI generation, routine actions, and trainer plans. Existing catalog machine/exercise navigation, shared routine/plan links, and the `/get` desktop QR handoff were also checked.
- The navbar language selector was checked for desktop/mobile bounds, selection, outside-click dismissal, Escape/focus restoration, arrows, Home/End, type-ahead, Tab, and interaction with the mobile drawer. Switching after typing preserves the pending search and filters. The shared locale foundation does not translate the remaining English marketing content.
- WebKit, physical-device keyboard checks, production Maps configuration, production manufacturer filtering, and a real template-free machine in staging remain launch checks, as described above.
