## Design Context

### Users
LIFTAG serves three connected audiences:

- Lifters who want a serious training app instead of notes, spreadsheets, and disconnected trackers.
- Trainers and coaches who want a professional profile, client discovery, and a stronger presence inside the gym ecosystem.
- Gym owners and managers who want QR machine guidance, trainer-led setup videos, member value, and discovery through the LIFTAG map.

The page should communicate one ecosystem, not a single QR feature. QR scanning is the immediate hook: scan a machine, load the right exercise, watch the setup video, and track the set. The broader promise is an all-in-one training layer for progress, coaching, gym discovery, partner gyms, dashboards, and future platform features.

### Brand Personality
**Premium. Technical. Confident.**

LIFTAG positions itself like a high-end SaaS product built for real training. Think Stripe or Linear's level of craft applied to gym tech, with a darker, more kinetic fitness edge. The tone is assured and practical, never hype-driven or aggressive. Every interaction should feel intentional and engineered.

### Emotional Goals
- **Trust**: Gym owners should feel "these people know what they're doing"
- **Momentum**: Lifters should feel progress becoming visible, measurable, and easier to sustain
- **Desire**: The site itself should be satisfying enough that visitors want to keep scrolling, clicking, and trying the interactions
- **Premium**: Every pixel should reinforce that LIFTAG is a cut above casual fitness apps
- **Ecosystem**: Trainers and gyms should feel like LIFTAG gives them a credible place in the training loop

### Aesthetic Direction
- **Theme**: Dark only - black backgrounds with lime (#CCFF00) and red neon (#FF2D55) accents
- **Typography**: Space Grotesk for display headlines, Inter for body copy, JetBrains Mono for protocol labels and data
- **Visual language**: Neon glows, glass surfaces, scroll-driven storytelling, 3D devices, phone screenshots, QR visuals, chart/data motion, laser reveal effects
- **Spacing**: Generous, cinematic sections with dense interactive surfaces where the product story needs detail
- **References**: Stripe.com and Linear.app for polish and confidence, not their exact aesthetic. The LIFTAG vibe is darker, more physical, more neon, and more kinetic
- **Anti-references**: Generic SaaS landing page templates (Framer/Webflow clones), cheap fitness sites with stock gym photos and aggressive CTAs, over-minimalist designs that lack visual richness

### Page Narrative

1. **Hero** - "For lifters. By lifters." Scan machines, track sets, watch numbers compound.
2. **Partner marquee** - Establish ecosystem breadth and credibility.
3. **Scan** - Make the QR machine scan use case instantly understandable.
4. **How It Works** - Show the loop: scan, track sets, watch progress compound.
5. **Lifters** - Position LIFTAG as the serious training companion.
6. **Progress** - Make analytics and PR tracking feel tangible.
7. **App Merge** - Show LIFTAG replacing scattered gym apps and tools.
8. **Trainers** - Expand into coaching profiles and trainer discovery.
9. **Gyms** - Explain the free QR kit, verified gym presence, and member value.
10. **Dashboard** - Signal professional-grade analytics and operational visibility.
11. **Roadmap** - Show the platform vision beyond launch features.
12. **Final CTA** - Bring the promise back to action: track real progress, scan real machines, skip the spreadsheet.

### Design Principles

1. **Every interaction earns its place** - Animations and transitions must feel purposeful and engineered, never gratuitous. Each one should clarify the product, create momentum, or make progress feel tangible.

2. **The site is the product demo** - Quality of the landing page directly represents quality of the app. No shortcuts, no "good enough." If a gym owner would not trust their business to a company with this website, it is not done.

3. **Dark luxury, not dark mode** - The black/neon palette should feel like a premium experience, not just a dark UI. Light, glow, shadow, and depth are tools for creating atmosphere.

4. **Custom-built, never templated** - Every section should feel designed specifically for LIFTAG. Avoid generic card grids, stock fitness patterns, and boilerplate SaaS layouts.

5. **Technical confidence** - Use monospace type, precise numbers, clean data visualization, and robust motion to signal that the team behind LIFTAG is technically excellent.

6. **Show the product loop** - Prefer concrete flows over abstract promises: scan a machine, see the exercise, log the set, watch progress, discover the coach/gym, understand the platform.

### Design Tokens (from codebase)
```css
--liftag-primary: #CCFF00;
--liftag-primary-dark: #4A5E00;
--liftag-primary-glow: rgba(204, 255, 0, 0.4);
--liftag-primary-dim: rgba(204, 255, 0, 0.15);
--liftag-red-neon: #FF2D55;
--liftag-red-neon-glow: rgba(255, 45, 85, 0.4);
--liftag-bg: #000000;
--liftag-neutral: #0E0E0E;
--liftag-secondary: #1A1A1A;
--liftag-surface-card: #262626;
--liftag-surface-dark: #131313;
--liftag-border: #333333;
--liftag-fg: #FFFFFF;
--liftag-fg-on-primary: #0E0E0E;
--liftag-fg-muted: #ADAAAA;
--liftag-fg-tertiary: #A1A1A1;
--liftag-fg-dim: rgba(255, 255, 255, 0.5);
--liftag-fg-soft: rgba(255, 255, 255, 0.6);
--liftag-fg-mid: rgba(255, 255, 255, 0.7);
--liftag-border-faint: rgba(255, 255, 255, 0.04);
--liftag-border-soft: rgba(255, 255, 255, 0.06);
--liftag-border-strong: rgba(255, 255, 255, 0.08);
--liftag-success: #22C55E;
--liftag-warning: #F59E0B;
--liftag-error: #EF4444;
--liftag-info: #3B82F6;
--liftag-r-sm: 8px;
--liftag-r-md: 12px;
--liftag-r-lg: 14px;
--liftag-r-xl: 24px;
--liftag-r-2xl: 32px;
--liftag-r-pill: 9999px;
--liftag-shadow-card: 0 8px 24px rgba(0, 0, 0, 0.4);
--liftag-shadow-pop: 0 12px 40px rgba(0, 0, 0, 0.5);
--liftag-glow-primary: 0 0 24px var(--liftag-primary-glow);
--liftag-font-headline: 'Space Grotesk', system-ui, sans-serif;
--liftag-font-body: 'Inter', system-ui, -apple-system, sans-serif;
--liftag-font-mono: 'JetBrains Mono', 'SF Mono', ui-monospace, monospace;
```

### Fonts
- **Headlines**: `'Space Grotesk', system-ui, sans-serif`
- **Body**: `'Inter', system-ui, -apple-system, sans-serif`
- **Accents/Labels/Data**: `'JetBrains Mono', 'SF Mono', ui-monospace, monospace`
