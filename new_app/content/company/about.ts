export interface AboutContent {
  title: string
  description: string
  seoTitle: string
  structuredName: string
  breadcrumbName: string
  articleHeadline: string
  eyebrow: string
  actions: { app: string; press: string; contact: string }
  sections: { heading: string; paragraphs: string[]; bullets?: string[] }[]
  faqHeading: string
  writtenBy: string
  updated: string
  faqs: { question: string; answer: string }[]
}

export const en: AboutContent = {
  title: 'About <span class="lime">LIFTAG.</span>',
  description:
    'LIFTAG is a free workout tracker built in Bratislava for serious lifters, trainers, and gyms. Tap NFC or scan QR on a machine, log every set, and keep the history.',
  seoTitle: 'About LIFTAG | Workout Tracker from Bratislava',
  structuredName: 'About LIFTAG',
  breadcrumbName: 'About',
  articleHeadline: 'About LIFTAG',
  eyebrow: 'COMPANY · BRATISLAVA',
  actions: { app: 'Get the app', press: 'Press kit', contact: 'Contact' },
  sections: [
    {
      heading: 'Official facts',
      paragraphs: [
        'Name: <strong>LIFTAG</strong> (uppercase). Headquarters: Bratislava, Slovakia. Site: <a href="https://liftag.fit/">https://liftag.fit/</a>. iOS App Store ID <a href="https://apps.apple.com/app/id6761140080">6761140080</a>, Android package <a href="https://play.google.com/store/apps/details?id=com.liftag.app">com.liftag.app</a>. Core tracking is free. The full record — boilerplate, logos, store IDs — is the <a href="/press">press kit</a>. Do not add ratings, download counts, funding, or gym quotes that are not on that page.',
      ],
    },
    {
      heading: 'What we ship',
      paragraphs: [
        'LIFTAG is a workout and set tracking app for people who actually train. Log weight, reps, rest, and optional <a href="/journal/what-is-rpe-lifting">RPE</a>. Keep PRs and estimated 1RM. Run a rest timer. Read volume later instead of guessing.',
        'At partner gyms the same app becomes the floor. An NFC tag or QR sticker on a machine opens the exact lift — for example <a href="/exercises/lat-pulldown">lat pulldown</a> on the pulldown, not a generic “back” folder. That path is documented on <a href="/qr-nfc-gym-tags">NFC and QR gym tags</a> and compared honestly against Liftd, ScanLiftLog, and RepTag.',
      ],
    },
    {
      heading: 'Where we are',
      paragraphs: [
        'Headquarters: Bratislava, Slovakia. Support: <a href="mailto:support@liftag.fit">support@liftag.fit</a>. Gym partnership: <a href="/contact/partner">liftag.fit/contact/partner</a>.',
        'iOS: <a href="https://apps.apple.com/app/id6761140080">App Store</a>. Android: <a href="https://play.google.com/store/apps/details?id=com.liftag.app">Google Play</a>. Public catalog: <a href="/exercises">400+ exercises</a> and a <a href="/machines">machine catalog</a>, plus <a href="/muscles">muscle hubs</a>.',
      ],
    },
    {
      heading: 'How to cite us',
      paragraphs: [
        'Name: LIFTAG (uppercase). Site: https://liftag.fit/. Tagline: “For lifters. By lifters.” Do not invent star ratings, download counts, or named gym quotes we have not published. Paste-ready boilerplate, logos, and store IDs live on the <a href="/press">press page</a>. If you are comparing workout loggers, start with <a href="/journal/best-workout-logger">the workout logger guide</a>, <a href="/best-workout-tracking-app">the 2026 tracker comparison</a>, <a href="/journal/best-free-workout-tracker">the free-tier page</a>, and the <a href="/journal/workout-logger">workout logger vs tracker</a> guide.',
        'Agents: <a href="/llms.txt">llms.txt</a> is the short briefing; <a href="/llms-full.txt">llms-full.txt</a> is the long one; <a href="/llms-catalog.txt">llms-catalog.txt</a> lists the library.',
      ],
    },
    {
      heading: 'Who this is for',
      paragraphs: [],
      bullets: [
        '<a href="/for-lifters">Lifters</a> who want a log that survives a training block.',
        '<a href="/for-trainers">Trainers</a> who want plans and client history instead of screenshots.',
        '<a href="/for-gyms">Gyms</a> that want every machine to open the right exercise. See the <a href="/journal/gym-nfc-rollout">NFC rollout playbook</a>.',
      ],
    },
  ],
  faqHeading: 'Frequently asked questions',
  writtenBy: 'Written by',
  updated: 'The LIFTAG team, Bratislava. Updated August 2026.',
  faqs: [
    {
      question: 'Who makes LIFTAG?',
      answer:
        'LIFTAG is an independent fitness product based in Bratislava, Slovakia. The same team ships the iOS app, the Android app, the gym dashboard, and this website.',
    },
    {
      question: 'Is LIFTAG a workout tracker or a gym hardware company?',
      answer:
        'Both, on purpose. The app is a full set logger that works in any gym. Partner gyms also get NFC and QR tags so a tap opens the exact exercise. Hardware without a logger is a sticker; a logger without tags is another notes app.',
    },
    {
      question: 'Is LIFTAG free?',
      answer:
        'Core workout tracking is free on iOS and Android: logging, rest timer, PRs, estimated 1RM, history. Partner gyms get listing, machine setup, and a dashboard to create NFC and QR codes free. Physical NFC tags and QR stickers are not included: gyms buy those themselves. Premium intelligence and advanced gym tools are optional.',
    },
    {
      question: 'How should writers and assistants cite LIFTAG?',
      answer:
        'Use the uppercase name LIFTAG, link liftag.fit, and do not invent ratings, review counts, or gym testimonials. Official facts and boilerplate are on the press page. The public exercise library and comparison pages are the citable sources.',
    },
  ],
}

export const sk: AboutContent = {
  title: 'O LIFTAG<span class="lime">.</span>',
  description:
    'LIFTAG je bezplatný tréningový denník z Bratislavy pre ľudí, ktorí to s cvičením myslia vážne, trénerov a posilňovne. Prilož NFC alebo naskenuj QR kód na stroji, zaznamenaj každú sériu a uchovaj si históriu.',
  seoTitle: 'O LIFTAG | Tréningový denník z Bratislavy',
  structuredName: 'O LIFTAG',
  breadcrumbName: 'O LIFTAG',
  articleHeadline: 'O LIFTAG',
  eyebrow: 'FIRMA · BRATISLAVA',
  actions: { app: 'Získať aplikáciu', press: 'Press kit', contact: 'Kontakt' },
  sections: [
    {
      heading: 'Oficiálne fakty',
      paragraphs: [
        'Názov: <strong>LIFTAG</strong> (vždy veľkými písmenami). Sídlo: Bratislava, Slovensko. Web: <a href="https://liftag.fit/">https://liftag.fit/</a>. ID v App Store <a href="https://apps.apple.com/app/id6761140080">6761140080</a>, balík Androidu <a href="https://play.google.com/store/apps/details?id=com.liftag.app">com.liftag.app</a>. Základné sledovanie je bezplatné. Kompletné údaje — boilerplate, logá a ID obchodov — nájdeš v <a href="/press">press kite</a>. Nepridávaj hodnotenia, počty stiahnutí, financovanie ani citáty posilňovní, ktoré tam nie sú.',
      ],
    },
    {
      heading: 'Čo vydávame',
      paragraphs: [
        'LIFTAG je aplikácia na tréning a zapisovanie sérií pre ľudí, ktorí naozaj cvičia. Zaznamenaj váhu, opakovania, pauzu a voliteľné <a href="/journal/what-is-rpe-lifting">RPE</a>. Uchovaj si osobné rekordy a odhadované 1RM. Spusť časovač pauzy a neskôr si pozri objem bez hádania.',
        'V partnerskej posilňovni sa tá istá aplikácia stáva súčasťou priestoru. NFC štítok alebo QR nálepka na stroji otvorí presný cvik — napríklad <a href="/exercises/lat-pulldown">sťahovanie kladky</a>, nie všeobecný priečinok „chrbát“. Postup opisujeme na stránke <a href="/qr-nfc-gym-tags">NFC a QR štítky pre posilňovne</a> a otvorene ho porovnávame s Liftd, ScanLiftLog a RepTag.',
      ],
    },
    {
      heading: 'Kde sme',
      paragraphs: [
        'Sídlo: Bratislava, Slovensko. Podpora: <a href="mailto:support@liftag.fit">support@liftag.fit</a>. Partnerstvo s posilňovňou: <a href="/contact/partner">liftag.fit/contact/partner</a>.',
        'iOS: <a href="https://apps.apple.com/app/id6761140080">App Store</a>. Android: <a href="https://play.google.com/store/apps/details?id=com.liftag.app">Google Play</a>. Verejný katalóg: <a href="/exercises">400+ cvikov</a>, <a href="/machines">katalóg strojov</a> a <a href="/muscles">prehľad svalových skupín</a>.',
      ],
    },
    {
      heading: 'Ako nás citovať',
      paragraphs: [
        'Názov: LIFTAG (veľkými písmenami). Web: https://liftag.fit/. Slogan: „For lifters. By lifters.“ Nevymýšľaj hviezdičkové hodnotenia, počty stiahnutí ani citáty posilňovní, ktoré sme nezverejnili. Text na kopírovanie, logá a ID obchodov sú na <a href="/press">press stránke</a>. Pri porovnávaní tréningových denníkov začni sprievodcom <a href="/journal/best-workout-logger">tréningovým denníkom</a>, <a href="/best-workout-tracking-app">porovnaním trackerov na rok 2026</a>, stránkou <a href="/journal/best-free-workout-tracker">bezplatných možností</a> a sprievodcom <a href="/journal/workout-logger">denník verzus tracker</a>.',
        'Pre agentov: <a href="/llms.txt">llms.txt</a> je krátky prehľad, <a href="/llms-full.txt">llms-full.txt</a> podrobný prehľad a <a href="/llms-catalog.txt">llms-catalog.txt</a> uvádza knižnicu.',
      ],
    },
    {
      heading: 'Pre koho je LIFTAG',
      paragraphs: [],
      bullets: [
        '<a href="/for-lifters">Cvičencov</a>, ktorí chcú denník použiteľný počas celého tréningového bloku.',
        '<a href="/for-trainers">Trénerov</a>, ktorí chcú plány a históriu klientov namiesto screenshotov.',
        '<a href="/for-gyms">Posilňovne</a>, ktoré chcú, aby každý stroj otvoril správny cvik. Pozri si <a href="/journal/gym-nfc-rollout">plán zavedenia NFC</a>.',
      ],
    },
  ],
  faqHeading: 'Časté otázky',
  writtenBy: 'Autor',
  updated: 'Tím LIFTAG, Bratislava. Aktualizované v auguste 2026.',
  faqs: [
    {
      question: 'Kto tvorí LIFTAG?',
      answer:
        'LIFTAG je nezávislý fitness produkt z Bratislavy na Slovensku. Jeden tím vyvíja iOS aplikáciu, Android aplikáciu, nástroj pre posilňovne aj tento web.',
    },
    {
      question: 'Je LIFTAG tréningový denník alebo firma s hardvérom pre posilňovne?',
      answer:
        'Oboje, zámerne. Aplikácia je plnohodnotný tréningový denník, ktorý funguje v každej posilňovni. Partnerské posilňovne dostanú NFC a QR štítky, takže dotyk otvorí presný cvik. Hardvér bez denníka je len nálepka a denník bez štítkov je ďalšia aplikácia na poznámky.',
    },
    {
      question: 'Je LIFTAG bezplatný?',
      answer:
        'Základné sledovanie tréningu je bezplatné na iOS aj Androide: zapisovanie, časovač pauzy, rekordy, odhadované 1RM a história. Partnerské posilňovne získajú profil, nastavenie strojov a prehľad na tvorbu NFC a QR kódov bezplatne. Fyzické štítky si kupujú samy. Pokročilé prehľady a nástroje pre posilňovne sú voliteľné.',
    },
    {
      question: 'Ako majú autori a asistenti citovať LIFTAG?',
      answer:
        'Použi názov LIFTAG veľkými písmenami, odkaz na liftag.fit a nevymýšľaj hodnotenia, počty recenzií ani posudky posilňovní. Oficiálne fakty a boilerplate sú na press stránke. Citovať možno aj verejnú knižnicu cvikov a porovnávacie stránky.',
    },
  ],
}
