## Design Context

### Users
Gym owners and managers evaluating Liftio as a professional solution for their facilities, and lifters who want the only fitness app they'll ever need. The site must communicate that Liftio is the all-in-one standard for gym-goers — not just a QR scanner, but a complete fitness platform (tracking, analytics, coaching, community, gym discovery). QR scanning is the hook and differentiator; the vision is much bigger. Primary conversion target is B2B (gym owners), but the narrative should make every lifter feel "this is THE app."

### Brand Personality
**Premium. Technical. Confident.**

Liftio positions itself like a high-end SaaS product that happens to serve the fitness industry — think Stripe or Linear's level of craft, applied to gym tech. The tone is assured and forward-looking, never hype-driven or aggressive. Every interaction should feel intentional and engineered, not decorative.

### Emotional Goals
- **Trust**: Gym owners should feel "these people know what they're doing"
- **Desire**: The site itself should be so satisfying to interact with that visitors want to keep scrolling, clicking, and coming back
- **Premium**: Every pixel should reinforce that Liftio is a cut above

### Aesthetic Direction
- **Theme**: Dark mode only — black backgrounds with neon green (#c8ff00) and red neon (#ff2d55) accents
- **Typography**: Inter (body, 300–900 weights) for clean readability, JetBrains Mono for technical/label accents. Heavy headings (900 weight), tight letter-spacing
- **Visual language**: Neon glows, glassmorphism, scroll-driven storytelling, 3D elements (Three.js phone mockup), laser reveal effects. The site is animation-rich by design — 387-frame scroll video, reveal animations, floating elements, parallax
- **Spacing**: Generous — 140px section padding, 1200px max-width, 16px border-radius
- **References**: Stripe.com, Linear.app — the level of polish, not the aesthetic. The actual vibe is darker, more neon, more kinetic
- **Anti-references**: Generic SaaS landing page templates (Framer/Webflow clones), cheap fitness sites with stock gym photos and aggressive CTAs, over-minimalist designs that lack visual richness

### Design Principles

1. **Every interaction earns its place** — Animations and transitions must feel purposeful and engineered, never gratuitous. Each one should make the user feel something or understand something better.

2. **The site is the product demo** — Quality of the landing page directly represents quality of the app. No shortcuts, no "good enough." If a gym owner wouldn't trust their business to a company with this website, it's not done.

3. **Dark luxury, not dark mode** — The black/neon palette should feel like a premium experience (think high-end car configurator), not just "we toggled dark mode on." Light, glow, and depth are tools for creating atmosphere.

4. **Custom-built, never templated** — Every section should feel like it was designed specifically for Liftio. No generic card grids, no stock patterns. If you've seen it on 100 other landing pages, find a better way.

5. **Technical confidence** — Use monospace type, precise numbers, clean data visualization, and engineering-quality code to signal that the team behind Liftio is technically excellent.

### Design Tokens (from codebase)
```css
--accent: #c8ff00;
--accent-dim: rgba(200, 255, 0, 0.15);
--accent-glow: rgba(200, 255, 0, 0.4);
--bg: #000;
--bg-card: rgba(255, 255, 255, 0.03);
--bg-card-hover: rgba(255, 255, 255, 0.06);
--text: #fff;
--text-dim: rgba(255, 255, 255, 0.5);
--text-mid: rgba(255, 255, 255, 0.7);
--border: rgba(255, 255, 255, 0.08);
--radius: 16px;
--red-neon: #ff2d55;
--red-neon-dim: rgba(255, 45, 85, 0.15);
--red-neon-glow: rgba(255, 45, 85, 0.4);
```

### Fonts
- **Body**: `'Inter', system-ui, -apple-system, sans-serif`
- **Accents/Labels**: `'JetBrains Mono', monospace`
