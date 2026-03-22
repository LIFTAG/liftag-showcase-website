# Liftio — liftio.fit

Landing page for Liftio, a QR-code-based gym workout tracking app.

## Stack

- **Next.js 16** (static export, `output: 'export'` in next.config.ts)
- **React 19**, **TypeScript**
- **Tailwind CSS v4** (via `@tailwindcss/postcss`)
- **Three.js** (3D phone mockup in hero)
- Hosted on **Vercel** (auto-deploys on push to `main`)
- Domain: **liftio.fit** (DNS via Namecheap, pointed to Vercel)
- Repo: **github.com/DerTicek/liftio** (private)

## Architecture

The entire page is rendered by `components/LiftioApp.tsx` — a single large component that uses vanilla JS DOM manipulation inside `useEffect`. It does NOT import the other React components in `components/` (Navbar.tsx, HowItWorks.tsx, Features.tsx, etc.). Those components exist but are currently unused.

- **`components/LiftioApp.tsx`** — Main page renderer (vanilla JS + JSX). All sections: intro reveal, scrollytelling hero, How It Works, Features, Gym Owners, Roadmap, CTA, Footer.
- **`app/globals.css`** — All styling for LiftioApp (not Tailwind — raw CSS with CSS variables).
- **`components/Phone3D.tsx`** — Three.js 3D phone mockup, mounted into LiftioApp via `createRoot`.
- **`public/frames/`** — 387 webp frames for scroll-driven video effect.

## Key things to know

- When modifying the live site, edit `LiftioApp.tsx` and `globals.css` — not the unused React components.
- The site is a static export. `npm run build` outputs to `out/`.
- Deploy workflow: `git push` to `main` → Vercel auto-builds and deploys.
- Brand colors: neon green `#c8ff00`, red neon `#ff2d55`, black background `#000`.
- Fonts: Inter (body), JetBrains Mono (accents/code).

## Commands

- `npm run dev` — local dev server with hot reload
- `npm run build` — production build (static export to `out/`)
- `git push` — triggers Vercel deployment

@AGENTS.md
