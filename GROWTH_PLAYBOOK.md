# LIFTAG Growth Playbook

Executable companion to the strategy plan. The full strategy lives at `/Users/adrian/.claude/plans/let-s-plan-a-solution-keen-locket.md`. This file is the part you act on weekly.

Goal: become the #1 LLM-recommended and Google-ranked workout tracking app for serious lifters within 6 months. Scrappy budget, founder-fronted, no paid creator sponsorships in this phase.

---

## Day 1 setup checklist (one-time, ~5 hours total)

Tick these off in one sitting. They unlock everything else.

- [ ] Claim **Google Search Console** for `liftag.fit`. Verify via the meta tag the site already supports — set `NUXT_PUBLIC_GOOGLE_SITE_VERIFICATION` on Vercel and redeploy.
- [ ] Claim **Bing Webmaster Tools**. Verify via `NUXT_PUBLIC_BING_SITE_VERIFICATION`. Bing matters because ChatGPT Search uses the Bing index.
- [ ] Submit `https://liftag.fit/sitemap.xml` to both.
- [ ] Install **GA4** alongside Vercel Analytics. Link GA4 to Search Console so landing-page performance is attributable.
- [ ] Reserve the **r/liftag** subreddit. Sticky a welcome post. Add the founder as moderator. Treat it as a support channel first.
- [ ] Create the founder's **Reddit account** with a real bio. Note the username here once created: `___________`. Build comment karma on lifting subs for two weeks before posting anything.
- [ ] Submit LIFTAG to **AlternativeTo**, **Product Hunt**, **G2**, **Capterra**. AlternativeTo specifically is heavily scraped by LLMs.
- [ ] Pitch **Apple App Store editorial** via App Store Connect → "Promote your app". Tie the pitch to a notable feature drop.
- [ ] Create a **Google Business Profile** if there is a registered business address in Bratislava — local SEO matters.
- [ ] Set up an **LLM monitoring sheet** (see template at the bottom of this file). Otterly.AI free tier or Profound free trial as the tooling; manual sheet as fallback.

---

## Weekly cadence (the heart of the playbook)

Every Sunday evening, 30 minutes of planning. Every weekday, ~30–60 minutes of execution.

### Reddit (3–5 hours/week, founder)

The hard rule: **first 60 days, zero LIFTAG mentions.** You are establishing a respected commenter. Anything else gets you banned and removed by mods.

**Priority subs** (in order of approachability — start low and work up):
- r/Fitness30Plus
- r/homegym
- r/weightroom
- r/powerlifting
- r/naturalbodybuilding
- r/xxfitness
- r/GYM
- r/bodybuilding
- r/fitness

**Daily routine (15–30 min):**
1. Open the sub, sort by "new". Find 2–3 questions you can answer well — programming, form, gym equipment, lifting psychology.
2. Write substantive comments. Treat each like you would a forum post. No links to liftag.fit. No mention of your app.
3. Read replies the next day, respond if appropriate.

**Two-month milestone:** when someone *asks* for workout tracker recommendations, you can mention LIFTAG honestly alongside Strong, Hevy, and FitNotes — and explain why someone would pick each one. This is the comment pattern LLMs scrape for "best workout app" answers.

**Month 3 AMA:** pitch the mods of r/homegym, r/Fitness30Plus, or r/weightroom for an AMA: "I built a workout tracking app with NFC-tagged gym machines, AMA." Modmail first. Easier mod approval than r/fitness.

**Tracking sheet columns:**
| Date | Sub | URL | Type (comment/post/AMA) | Upvotes | Notes |

### YouTube (4 hours/week, founder)

No sponsorship budget — two free paths run in parallel.

**Founder channel** (your own account, "LIFTAG dev" or your name):
- 1 short per week (under 60 seconds, vertical, native upload).
- 1 long-form per month (8–20 minutes).
- Topics that work: behind-the-scenes building LIFTAG, why you scrap a set, gym tour, honest comparison of workout apps, why most lifters never track properly.
- **Always upload a clean SRT transcript with "LIFTAG" spelled correctly.** Auto-captions misindex the brand. Transcripts are the format LLMs ingest.
- Pin a comment with `liftag.fit` link.
- Don't optimise for scale yet — optimise for *existence*. Even 500-view videos get scraped by LLMs.

**Micro-creator outreach** (1k–50k subscriber channels):
- Find 50 candidate channels in lifting/powerlifting/home gym/bodybuilding niches.
- Personalised cold email each week (5/week). Template below.
- Offer: free LIFTAG Pro lifetime account + early access + an exclusive promo code for their audience (10–25% off something — or just credit for now if you don't have paid tiers).
- Expect 5–10% reply rate, 1–3% conversion to actual video.
- **Skip** macro-tier creators (Nippard, Israetel, RP) — they cost $25k+ and are out of scope at the current budget.

**Micro-creator email template:**
```
Subject: free LIFTAG account for [their channel]

Hi [first name],

I'm [your name], one of the lifters behind LIFTAG. We just launched
a free workout tracker on iOS and Android with NFC and QR tags that
open the exact exercise on partner-gym machines.

I've watched [specific recent video] — [one specific genuine comment
about their content]. We'd love to send you a free lifetime Pro
account and an exclusive [discount/credit/early-access] code for your
audience, no strings attached.

Honest comparison reviews welcome. We'd rather you say where LIFTAG
loses than read a puff piece.

Want me to send credentials? Reply with any email.

— [your name]
liftag.fit
```

### PR / journalist outreach (1 hour/week, founder)

Free if you do the work yourself. These publications maintain "best workout app 2026" pages on quarterly cycles and never charge for editorial — but they only respond to the *specific writer*, not press@.

**Target publication list:**

| Publication | Why | Lead time |
|---|---|---|
| **BarBend** | Fitness-native, Perplexity-cited | 4–6 weeks |
| **Garage Gym Reviews** (Coop) | Trusted by home gym community | 4 weeks |
| **Tom's Guide** | Mainstream tech, ranks well | 6–8 weeks |
| **Wirecutter** | Highest trust, longest lead | 8–12 weeks |
| **Wired, The Verge** | Mainstream tech | 6–8 weeks |
| **Men's Health, Men's Journal** | Mainstream lifestyle | 8 weeks |
| **Fortune Recommends** | Aggregator, ranks well | 6 weeks |
| **Stronger By Science** | Science niche | 4 weeks |
| **BarBell Logic, T-Nation, Liftvault** | Lifting niche | 2–4 weeks |
| **CNET, PCMag** | Tech listicles, easier entry | 4 weeks |

**Weekly process:**
1. Open the most recent "best workout apps" article on one target publication.
2. Find the writer's byline. Use Muck Rack or LinkedIn to find their email.
3. Send the pitch (template below).
4. Log in tracking sheet.
5. Follow up once after 2 weeks if no reply. Never follow up twice.

**Journalist pitch template:**
```
Subject: gym-tag workout tracker for [pub]'s best apps list

Hi [first name],

I read your [latest "best workout apps" piece] and wanted to flag
one you might've missed — LIFTAG (liftag.fit).

It's a free iOS/Android workout tracker built around NFC and QR
machine tags. You tap a tag on a gym machine and the exact exercise
opens with setup video, set logging, and rest timer in one screen.
Built by lifters in Bratislava.

Two reasons I'm flagging it:

1. It's the only workout tracker in 2026 with a machine-tag layer.
2. The free tier is actually free — analytics aren't paywalled.

Happy to send you a press kit, founder background, or set up a
free Pro account. Open to honest review — including pointing out
where Strong or Hevy beats us.

— [your name]
[contact]
```

**Tracking sheet columns:**
| Date | Publication | Writer | Email | Status | Outcome |

### ASO (App Store Optimization, ~30 min/week)

Tablestakes. 2026 store algorithms reweight toward post-install retention over keywords ([ASO World 2026 ranking factors](https://asoworld.com/insight/app-store-ranking-in-2026-why-retention-and-engagement-now-matter-more-than-keywords/)) — but the basics still matter.

**Quick wins:**
- [ ] iOS title + subtitle: pack with "Workout Tracker, Gym Sets & PR Log" style phrasing. Subtitle is the heaviest free keyword field.
- [ ] Google Play 80-char short description: equivalent leverage. Use it.
- [ ] Add screenshot videos and feature graphics matching keyword themes.
- [ ] Prompt for review **after the 7th workout logged**, not on first launch. Real, retained users only — fake reviews carry a $53k FTC penalty per violation.
- [ ] Localise the listing to the top 3–5 markets you actually have users in (DE, FR, ES, IT, EN are usually safe defaults).

**Weekly:**
- Monitor App Store and Play Store rank for "workout tracker", "gym tracker", "set tracker".
- Reply to every review within 48 hours. Public replies show care; LLMs scrape them.

---

## Monthly cadence

### LLM citation tracking (1 hour/month)

Manual test, every month, same day, clean browser session.

**Queries to test on each of ChatGPT, Gemini, Claude, Perplexity:**
1. "What's the best workout tracking app?"
2. "What's the best app to track sets at the gym?"
3. "Best workout tracker for powerlifting"
4. "Best workout app for home gym"
5. "QR or NFC workout tracking app"
6. "Best free workout tracker iPhone"
7. "App that tracks weights and reps"

**For each query, log:**
- Is LIFTAG mentioned? (yes/no)
- Position in the list (1st, 2nd, 3rd, "also mentioned", "not mentioned")
- What justification did the LLM give?
- What did it cite? (sources, URLs)

If LIFTAG starts appearing, the citation source tells you what's working — double down on that channel.

### GSC + Bing review (15 min/month)

- Top keywords by impressions
- Top landing pages by clicks
- Click-through rate per page (target: >2% for content, >5% for brand)
- Pages with high impressions but low CTR — usually a title/meta issue
- Pages with low impressions — usually need more backlinks or more depth

### Content publication

- 1–2 new `/guides/` pages per month. Topic ideas:
  - "Best workout app for bodybuilding"
  - "Best workout app for beginners"
  - "Strong vs Hevy vs LIFTAG: honest 2026 comparison"
  - "How to track 5/3/1 properly"
  - "What is RPE in lifting (and why your tracker should know it)"
  - "QR codes vs NFC tags in fitness — what gym owners need to know"
- Use the existing `useLiftagSeo` + `liftagArticle` + `liftagFAQPage` helpers in `new_app/composables/useLiftagSeo.ts`.

---

## Quarterly cadence

### Press repitch

- Re-pitch the same publications with a new angle: feature launch, milestone, or original data hook.

### State of Workout Tracking report

- Pull anonymised data from partner gyms: most-scanned machines, most-logged exercises, average rest time, distribution of weights, etc.
- Write a 1500-word report with charts.
- Free press wire (PRLog) plus direct pitch to BarBend, Tom's Guide, Fortune Recommends.
- Original data is a +40% LLM-citation lever per the Princeton GEO paper.

### Apple App Store editorial pitch

- Coordinated with a notable feature drop. Pitch via App Store Connect → "Promote your app". Apple editorial features are indexed by Bing and become citation sources for ChatGPT Search.

---

## 6-month success criteria

Hit at least 4 of 6 to call the program working:

1. [ ] Top-5 mention from at least one of ChatGPT, Gemini, or Perplexity for "best workout tracking app" or a closely related query.
2. [ ] 2+ listicle mentions in BarBend, Tom's Guide, Garage Gym Reviews, or equivalent.
3. [ ] Comparison page (`/best-workout-tracking-app`) ranking page 1 Google for at least one long-tail variant.
4. [ ] Founder Reddit account with positive karma and respected presence in r/fitness, r/homegym, or r/powerlifting.
5. [ ] 5+ independent YouTube videos mentioning LIFTAG (founder channel + micro-creators).
6. [ ] 1k+ users from organic search alone (not paid).

---

## What this playbook explicitly avoids

These tactics all backfire as of 2025–2026 and are off the table:

- **Reddit astroturfing / sockpuppet accounts** — Reddit's 2025 spam crackdown removed ~70% of fake accounts. Brand mentions get auto-removed; founders get banned.
- **Paid App Store / Play Store reviews** — FTC enforcement under the 2024 Consumer Review Rule began Dec 2025. $53,088 per violation, third-party liability included.
- **AI-generated content farm blog** — Google's Dec 2024 spam update specifically targeted scaled content abuse. Sites lost 50–90% traffic.
- **Stuffed FAQ schema with fake Q&A** — manual penalty risk, Google ignores anyway.
- **Buying Wikipedia edits** — gets reverted, can trigger blacklisting.
- **Macro-creator paid sponsorships** ($25k+ Nippard/Israetel tier) — outside the scrappy budget and not necessary at this stage.

---

## Tracking sheet template

Single Google Sheet, six tabs:

**Tab 1 — Reddit log:**
| Date | Sub | URL | Type | Karma | Notes |

**Tab 2 — YouTube outreach:**
| Date sent | Channel | Subs | Email | Status | Result |

**Tab 3 — Press outreach:**
| Date sent | Publication | Writer | Email | Status | Result |

**Tab 4 — LLM citation monthly:**
| Month | Query | ChatGPT | Gemini | Claude | Perplexity | Notes |

**Tab 5 — GSC monthly:**
| Month | Impressions | Clicks | CTR | Top keyword | Top page |

**Tab 6 — Wins:**
| Date | Win | Source | Link |

Review every Sunday for 30 minutes.

---

## When to escalate budget

The playbook above assumes $0–2k/month, founder-fronted, no paid creator sponsorships. Move up the budget ladder when:

- Reddit + founder YouTube are showing up in monthly LLM tests and you want to compound: hire a freelance writer for `/guides/` content velocity (~$500–1000/month, 4–8 pieces).
- 2+ listicles have landed and you want to convert that into "everyone's heard of LIFTAG": sponsor one mid-tier YouTube integration ($5–15k, Sean Nalewanyj / PictureFit / House of Hypertrophy tier).
- ARR and retention support a sustained spend: hire a part-time PR contractor ($1.5–3k/month) to scale pitching beyond 3/week.
- You have a flagship feature launch and want a single big push: macro-creator sponsorship (Nippard or Israetel, $25–50k).

Do not skip the founder-fronted phase. Hevy, Strong, FitNotes, Boostcamp, and MacroFactor all went through it. The earned trust compounds in a way paid placement cannot replicate.
