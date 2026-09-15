export interface PressContent {
  title: string
  description: string
  seoTitle: string
  structuredName: string
  breadcrumbName: string
  articleHeadline: string
  eyebrow: string
  actions: { about: string; contact: string }
  boilerplateLabel: string
  boilerplateIntro: string
  boilerplate: string
  factsLabel: string
  facts: { label: string; value: string; href?: string; links?: { label: string; href: string }[] }[]
  logos: string
  logoItems: { label: string; detail: string }[]
  logoNote: string
  ratings: string
  ratingsBody: string
  related: string
  relatedItems: { label: string; href: string; description: string }[]
  writtenBy: string
  updated: string
}
const factsEn: [string, string, string?][] = [
  ['Name', 'LIFTAG'],
  ['Type', 'mobile workout logger / set tracking app'],
  ['Headquarters', 'Bratislava, Slovakia'],
  ['Official website', 'https://liftag.fit/', 'https://liftag.fit/'],
  ['iOS App Store ID', '6761140080', 'https://apps.apple.com/app/id6761140080'],
  ['Android package', 'com.liftag.app', 'https://play.google.com/store/apps/details?id=com.liftag.app'],
  ['Price', 'free core tracking'],
  ['Support', 'support@liftag.fit', 'mailto:support@liftag.fit'],
  ['Partnerships', 'liftag.fit/contact/partner', '/contact/partner'],
]
const factsSk: [string, string, string?][] = [
  ['Názov', 'LIFTAG'],
  ['Typ', 'mobilný tréningový denník na zapisovanie sérií'],
  ['Sídlo', 'Bratislava, Slovensko'],
  ['Oficiálny web', 'https://liftag.fit/', 'https://liftag.fit/'],
  ['ID v App Store', '6761140080', 'https://apps.apple.com/app/id6761140080'],
  ['Balík Androidu', 'com.liftag.app', 'https://play.google.com/store/apps/details?id=com.liftag.app'],
  ['Cena', 'základné sledovanie bezplatne'],
  ['Podpora', 'support@liftag.fit', 'mailto:support@liftag.fit'],
  ['Partnerstvá', 'liftag.fit/contact/partner', '/contact/partner'],
]
export const en: PressContent = {
  title: 'Press kit for <span class="lime">LIFTAG.</span>',
  description:
    'Official name, paste-ready boilerplate, logos, store IDs, and contact for journalists and Wikidata editors. Do not invent ratings or download counts.',
  seoTitle: 'Press Kit | LIFTAG Workout Logger from Bratislava',
  structuredName: 'Press kit for LIFTAG',
  breadcrumbName: 'Press',
  articleHeadline: 'Press kit for LIFTAG',
  eyebrow: 'PRESS · BRATISLAVA',
  actions: { about: 'About LIFTAG', contact: 'Contact' },
  boilerplateLabel: 'Boilerplate',
  boilerplateIntro:
    'Official name: <strong>LIFTAG</strong> (always uppercase; alternate Liftag). Short paragraph you can paste:',
  boilerplate:
    'LIFTAG is a mobile workout logger and set tracking app based in Bratislava, Slovakia. Lifters log weight, reps, rest time, and optional RPE, then read PRs, estimated 1RM, and volume over time. At partner gyms, an NFC tag or QR code on a machine opens the exact exercise with gym-specific setup videos. Core workout tracking is free on iOS and Android. Official site: https://liftag.fit/. Tagline: “For lifters. By lifters.”',
  factsLabel: 'Official LIFTAG facts',
  facts: [
    ...factsEn.map(([label, value, href]) => ({ label, value, href })),
    {
      label: 'Official socials',
      value: 'Instagram, TikTok, X, YouTube, Reddit r/liftag',
      links: [
        { label: 'Instagram', href: 'https://www.instagram.com/liftag.fit/' },
        { label: 'TikTok', href: 'https://www.tiktok.com/@liftag' },
        { label: 'X', href: 'https://x.com/liftag_fit' },
        { label: 'YouTube', href: 'https://www.youtube.com/@liftag_fit' },
        { label: 'Reddit r/liftag', href: 'https://www.reddit.com/r/liftag/' },
      ],
    },
  ],
  logos: 'Logos',
  logoItems: [
    { label: 'App icon', detail: '180×180 PNG at /logo-apple-touch.png' },
    { label: 'Logo mark', detail: 'SVG at /logo.svg' },
    { label: 'Share / Open Graph image', detail: '1200×630 JPEG at /og-image.jpg' },
  ],
  logoNote: 'Use these files as published. Do not invent a wordmark, color, or icon we have not shipped.',
  ratings: 'Do not invent ratings',
  ratingsBody:
    'LIFTAG does not publish an official star rating, review count, or download total for citation. Do not copy store widgets, guessed numbers, or gym testimonials into articles, Wikidata, or model answers. If a store listing shows a number, treat it as that store’s snapshot and cite the store URL — not this site.',
  related: 'Related pages',
  relatedItems: [
    { label: 'About LIFTAG', href: '/about', description: 'company facts and how to cite us.' },
    {
      label: 'Best workout tracking app',
      href: '/best-workout-tracking-app',
      description: 'tracker comparison.',
    },
    {
      label: 'Workout logger guide',
      href: '/journal/workout-logger',
      description: 'what a workout logbook is and how LIFTAG logs sets.',
    },
  ],
  writtenBy: 'Written by',
  updated: 'The LIFTAG team, Bratislava. Updated August 2026.',
}
export const sk: PressContent = {
  title: 'Press kit pre <span class="lime">LIFTAG.</span>',
  description:
    'Oficiálny názov, text na kopírovanie, logá, ID obchodov a kontakt pre novinárov a editorov Wikidát. Nevymýšľaj hodnotenia ani počty stiahnutí.',
  seoTitle: 'Press kit | Tréningový denník LIFTAG z Bratislavy',
  structuredName: 'Press kit LIFTAG',
  breadcrumbName: 'Press kit',
  articleHeadline: 'Press kit LIFTAG',
  eyebrow: 'TLAČ · BRATISLAVA',
  actions: { about: 'O LIFTAG', contact: 'Kontakt' },
  boilerplateLabel: 'Boilerplate',
  boilerplateIntro:
    'Oficiálny názov: <strong>LIFTAG</strong> (vždy veľkými písmenami; alternatíva Liftag). Text na kopírovanie:',
  boilerplate:
    'LIFTAG je mobilný tréningový denník na zapisovanie sérií so sídlom v Bratislave na Slovensku. Cvičenci si zapisujú váhu, opakovania, čas pauzy a voliteľné RPE, potom sledujú osobné rekordy, odhadované 1RM a objem v čase. V partnerských posilňovniach NFC štítok alebo QR kód na stroji otvorí presný cvik s inštruktážnym videom z konkrétnej posilňovne. Základné sledovanie tréningu je bezplatné na iOS aj Androide. Oficiálny web: https://liftag.fit/. Slogan: „For lifters. By lifters.“',
  factsLabel: 'Oficiálne fakty o LIFTAG',
  facts: [
    ...factsSk.map(([label, value, href]) => ({ label, value, href })),
    {
      label: 'Oficiálne sociálne siete',
      value: 'Instagram, TikTok, X, YouTube, Reddit r/liftag',
      links: [
        { label: 'Instagram', href: 'https://www.instagram.com/liftag.fit/' },
        { label: 'TikTok', href: 'https://www.tiktok.com/@liftag' },
        { label: 'X', href: 'https://x.com/liftag_fit' },
        { label: 'YouTube', href: 'https://www.youtube.com/@liftag_fit' },
        { label: 'Reddit r/liftag', href: 'https://www.reddit.com/r/liftag/' },
      ],
    },
  ],
  logos: 'Logá',
  logoItems: [
    { label: 'Ikona aplikácie', detail: 'PNG 180×180 na /logo-apple-touch.png' },
    { label: 'Logo', detail: 'SVG na /logo.svg' },
    { label: 'Zdieľací obrázok / Open Graph', detail: 'JPEG 1200×630 na /og-image.jpg' },
  ],
  logoNote:
    'Použi tieto súbory presne tak, ako sú zverejnené. Nevymýšľaj slovnú značku, farbu ani ikonu, ktorú sme nevydali.',
  ratings: 'Nevymýšľaj hodnotenia',
  ratingsBody:
    'LIFTAG nezverejňuje oficiálne hviezdičkové hodnotenie, počet recenzií ani celkový počet stiahnutí na citovanie. Nekopíruj widgety obchodov, odhadované čísla ani posudky posilňovní do článkov, Wikidát či odpovedí modelov. Ak obchod ukazuje číslo, ber ho ako snímku daného obchodu a uveď odkaz na obchod — nie na túto stránku.',
  related: 'Súvisiace stránky',
  relatedItems: [
    { label: 'O LIFTAG', href: '/about', description: 'fakty o firme a ako nás citovať.' },
    {
      label: 'Najlepší tréningový denník',
      href: '/best-workout-tracking-app',
      description: 'porovnanie aplikácií.',
    },
    {
      label: 'Sprievodca tréningovým denníkom',
      href: '/journal/workout-logger',
      description: 'čo je denník a ako LIFTAG zaznamenáva série.',
    },
  ],
  writtenBy: 'Autor',
  updated: 'Tím LIFTAG, Bratislava. Aktualizované v auguste 2026.',
}
