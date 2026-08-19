# LIFTAG website refresh reel

Standalone Remotion project. Isolated from the Nuxt app in `new_app/`.

Primary composition `WebsiteRefreshSK`: 1080x1920, 30fps, 360 frames (12.0s), Slovak.
English twin: `WebsiteRefresh`. Square: `WebsiteRefreshSquareSK` / `WebsiteRefreshSquare`.

## Studio

From the repo root:

```bash
pnpm reel
```

Or from this folder:

```bash
pnpm studio
```

## Render

Slovak Reel (the one to post):

```bash
pnpm render:sk
```

English Reel:

```bash
pnpm render
```

Square feed posts:

```bash
pnpm render:sk:square
pnpm render:square
```

Stills (QA a single frame):

```bash
pnpm still out/stills/f0016.png --frame=16
```

Useful check frames: 16 (charge), 55 (laser), 110 (statement), 190 (hero site), 240 (library), 320 (end card).

Outputs land in `out/`. That folder is gitignored.

Caption and cover-frame notes live in `CAPTION.md`.

## Instagram export notes

- H.264, `yuv420p`, 1080x1920, 30fps
- This piece is 12 seconds. Reels allow up to 90 seconds.
- Mute-safe: last 24 frames hold still on `liftag.fit`
- Keep must-read type inside x=80-960, y=280-1480 (IG chrome + like column)

Render config in `remotion.config.ts` already sets H.264 / yuv420p / CRF 18.

## Why its own package

`import from "remotion"` must resolve to the npm package, not this folder.
Keep this project out of any pnpm workspace that would hoist `remotion`, and
do not add a tsconfig `paths` alias named `remotion`.
