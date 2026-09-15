export interface ComparisonRow {
  need: string
  competitor: string
  liftag: string
}
export interface ComparisonFaq {
  question: string
  answer: string
}
export interface ComparisonContent {
  title: string
  description: string
  seoTitle: string
  eyebrow: string
  cta: string
  other: string
  short: string
  pricing: string
  features: string
  wins: string
  switch: string
  comparisons: string
  faq: string
  sources: string
  needHeader: string
  liftagWinsHeading: string
  shortBody: string[]
  pricingBody: string[]
  rows: ComparisonRow[]
  competitorWins: string[]
  liftagWins: string[]
  winsNote: string
  switchingBody: string[]
  comparisonsBody: string[]
  faqs: ComparisonFaq[]
  sourceBody: string[]
}
type Vars = {
  price: string
  caveat: string
  date: string
  source: string
  sourceUrl: string
  liftagSource: string
  liftagSourceUrl: string
}
const link = (path: string, label: string) => `<a href="${path}">${label}</a>`
const shared = (v: Vars) => ({
  price: v.price,
  date: v.date,
  source: `<a href="${v.sourceUrl}" rel="nofollow noopener" target="_blank">${v.source}</a>`,
  liftagSource: `<a href="${v.liftagSourceUrl}" rel="nofollow noopener" target="_blank">${v.liftagSource}</a>`,
})
export function hevyContent(locale: 'en' | 'sk', v: Vars): ComparisonContent {
  const x = shared(v)
  if (locale === 'sk')
    return {
      title: 'Alternatíva k Hevy, ktorá pozná <span class="lime">stroj.</span>',
      description: `Porovnanie funkcií a cien Hevy a LIFTAGu v roku 2026. Hevy Pro stojí ${v.price}. Hevy vyniká komunitou; LIFTAG nemá platenú verziu a cvik v ňom otvoríš priložením telefónu k NFC štítku alebo naskenovaním QR kódu na stroji.`,
      seoTitle: 'Alternatíva k Hevy 2026: LIFTAG verzus Hevy, funkcie a ceny',
      eyebrow: 'ALTERNATÍVY · HEVY',
      cta: 'Stiahnuť LIFTAG zadarmo',
      other: 'LIFTAG verzus Strong',
      short: 'Krátka verzia',
      pricing: 'Uvedené ceny',
      features: 'Porovnanie funkciu po funkcii',
      wins: 'V čom vyhráva konkurencia',
      switch: 'Prechod bez straty histórie',
      comparisons: 'Ďalšie porovnania',
      faq: 'Časté otázky',
      sources: 'Zdroje a postup',
      needHeader: 'Potreba',
      liftagWinsHeading: 'V čom vyhráva LIFTAG',
      shortBody: [
        'Hevy je najlepší bezplatný univerzálny denník s komunitou. Je obľúbený z dobrého dôvodu; ak aplikáciu otváraš najmä kvôli kanálu, prestaň čítať a zostaň pri Hevy.',
        'LIFTAG rieši rovnakú úlohu inak: denník pozná posilňovňu. V partnerskom fitku priložíš telefón k NFC štítku alebo naskenuješ QR kód na stroji a cvik pred tebou sa otvorí s videom natočeným na konkrétnom vybavení. Cviky ako ' +
          link('/exercises/barbell-bench-press', 'bench press') +
          ', ' +
          link('/exercises/barbell-back-squat', 'back squat') +
          ' a ' +
          link('/exercises/lat-pulldown', 'lat pulldown') +
          ' fungujú rovnako. Mimo štítkov zapisuje ako Hevy, bez bezplatných limitov.',
        'Toto porovnanie tvorí tím LIFTAG, preto tón ber ako zaujatý a čísla si over. Každý údaj o Hevy nižšie pochádza z ' +
          x.source +
          ', skontrolovaného ' +
          v.date +
          '.',
      ],
      pricingBody: [
        `Hevy sa dá stiahnuť zadarmo a zadarmo doň zapisovať. <strong>Hevy Pro stojí ${v.price}</strong> v americkom App Store. Podľa vlastného zoznamu Hevy Pro odomkne neobmedzené zostavy, históriu grafov a vlastné cviky a pridá pokročilé merania; tieto tri položky ukazujú hranice bezplatnej verzie.`,
        `${v.caveat} Čísla bezplatnej verzie neopakujeme, pretože Hevy ich na tejto stránke neuvádza a nebudeme ich hádať.`,
        `Na strane LIFTAG je odpoveď krátka: App Store ani Google Play k ${v.date} neuvádza nákup v aplikácii. Úplný rozpis vrátane toho, čo o budúcej prémiovej verzii netvrdíme, nájdeš na ${link('/pricing', 'cenách LIFTAG')}.`,
      ],
      rows: [
        [
          'Rýchly zápis série',
          'Veľmi dobrý denník s desaťročným vývojom a veľkou používateľskou základňou.',
          'Veľmi dobrý a v označenej posilňovni najrýchlejší: stroj otvorí cvik.',
        ],
        [
          'Uložené tréningové zostavy zadarmo',
          'Obmedzené. Hevy Pro odomkne neobmedzené zostavy.',
          'Neobmedzené v bezplatnej verzii.',
        ],
        [
          'História grafov zadarmo',
          'Obmedzená. Hevy Pro odomkne celú históriu.',
          'Kompletná história bezplatne.',
        ],
        [
          'Vlastné cviky zadarmo',
          'Obmedzené. Hevy Pro odomkne neobmedzené vlastné cviky.',
          'Neobmedzené, s vlastnými fotkami alebo videom.',
        ],
        [
          'Platená verzia',
          `Hevy Pro za ${v.price}.`,
          'Dnes bez nákupov v oboch obchodoch. Prémiové inteligentné funkcie sú plánované bez určenej ceny.',
        ],
        [
          'Štítky na strojoch',
          'Nemá.',
          'NFC dotyk a QR sken v partnerských posilňovniach. Posilňovňa vytvorí kódy v prehľade a kúpi nálepky.',
        ],
        [
          'Sociálny kanál',
          'Dôvod, prečo mnohí zostávajú: sleduj priateľov a kopíruj ich tréningy.',
          'Verejné profily a zdieľané zostavy, bez kanála na prezeranie.',
        ],
        [
          'Tréneri a posilňovne',
          'Hevy Trainer je súčasťou Pro.',
          'Overené profily trénerov a mapa partnerských posilňovní v bezplatnej aplikácii.',
        ],
        [
          'Smart hodinky',
          'Aplikácia pre Apple Watch a Wear OS.',
          'Zatiaľ bez aplikácie pre hodinky. Tep získava z AirPods alebo Bluetooth monitora.',
        ],
        [
          'História produktu',
          'Roky používania vo veľkom meradle a dlhá verejná história recenzií.',
          'Je nový, preto App Store ešte nemá dosť hodnotení na zobrazenie skóre.',
        ],
      ].map(([need, competitor, liftag]: string[]) => ({ need, competitor, liftag })),
      competitorWins: [
        'Kanál. Sledovanie ľudí, kopírovanie ich tréningov a porovnávanie je samotný produkt; LIFTAG ho nenahrádza.',
        'Rozsah. Hevy vo vlastnom zozname App Store začína textom „Join +10 million users“ a jeho stránka tvrdí ešte viac. Tvoj tréningový partner tam pravdepodobne už je a pred inštaláciou si môžeš prečítať roky recenzií.',
        'Hodinky. Hevy funguje na Apple Watch aj Wear OS. LIFTAG aplikáciu pre hodinky nemá.',
        'Známy strop. Ak narazíš na bezplatné limity, Hevy Pro je lacný a jeho cena je zverejnená. LIFTAG taký sľub zatiaľ dať nemôže, pretože nemá platenú verziu.',
      ],
      liftagWins: [
        'Žiadny strop. Zostavy, vlastné cviky a história grafov sú v bezplatnej verzii neobmedzené; práve tam sú tri bezplatné limity Hevy.',
        'Posilňovňa. V partnerskom fitku priložíš telefón k NFC štítku alebo naskenuješ QR kód na stroji a cvik sa otvorí s videom natočeným na konkrétnom vybavení.',
        'Objavovanie skutočných miest. Overené profily trénerov a mapa partnerských fitiek s vybavením, otváracími hodinami a recenziami v bezplatnej aplikácii.',
        'Nič nekupuješ. Ani jeden obchod dnes pri LIFTAG neuvádza nákup v aplikácii, takže nečaká žiadna platená úroveň.',
      ],
      winsNote: `Časť o štítkoch je vysvetlená na ${link('/qr-nfc-gym-tags', 'NFC a QR štítkoch v posilňovniach')} a v ${link('/journal/nfc-tags-for-gym-equipment', 'sprievodcovi štítkami na vybavení')}.`,
      switchingBody: [
        'Importér z Hevy neexistuje a predstierať opak by ti pokazilo večer. Funguje toto: nainštaluj LIFTAG, začni od najbližšieho tréningu a Hevy nechaj v telefóne, kým ho prestaneš otvárať. Dva denníky na dva týždne nič nestoja, pretože ani jeden ti za to neúčtuje poplatok.',
        'Počas tých dvoch týždňov sleduj dotyky medzi sériami, nie zoznam funkcií. Ak má fitko štítky, všimneš si to hneď. Ak ich nemá, výhoda LIFTAG oproti Hevy sa zúži na bezplatné limity a vrstvu trénerov a fitiek. Požiadaj fitko, aby sa ' +
          link('/contact/partner', 'stalo partnerom') +
          ', alebo si prečítaj, ako sa podlaha označuje v ' +
          link('/journal/gym-nfc-rollout', 'sprievodcovi zavedením NFC v posilňovni') +
          '.',
      ],
      comparisonsBody: [
        `Strong namiesto Hevy, priamo proti LIFTAG: ${link('/vs/strong', 'LIFTAG verzus Strong')}. Všetky tri naraz vrátane bezplatných verzií a sociálnych funkcií: ${link('/journal/strong-vs-hevy-vs-liftag', 'Strong verzus Hevy verzus LIFTAG')}. Maticu ôsmich aplikácií s FitNotes, JEFIT, Boostcamp, MacroFactor a Fitbod nájdeš v ${link('/best-workout-tracking-app', 'porovnaní najlepších aplikácií na sledovanie tréningu 2026')}. Iba bezplatné verzie sú v ${link('/journal/best-free-workout-tracker', 'prehľade najlepších bezplatných denníkov')}.`,
      ],
      faqs: [
        [
          'Koľko stojí Hevy v roku 2026?',
          `Hevy je na stiahnutie zadarmo a Hevy Pro stojí ${v.price} v americkom App Store podľa kontroly ${v.date}. ${v.caveat}`,
        ],
        [
          'Čo Hevy Pro odomkne?',
          'Podľa vlastného zoznamu Hevy neobmedzené tréningové zostavy, históriu grafov, vlastné cviky a pokročilé telesné merania.',
        ],
        [
          'Existuje bezplatná alternatíva k Hevy bez limitu zostáv?',
          'LIFTAG. Zostavy, tréningové plány, vlastné cviky, história, rekordy, odhadované 1RM a grafy pokroku sú v bezplatnej verzii. Chýba sociálny kanál a aplikácia pre hodinky.',
        ],
        [
          'Mám prejsť z Hevy na LIFTAG?',
          'Prejdi, ak v posilňovni hľadáš správny cvik medzi sériami alebo narážaš na bezplatné limity Hevy. Zostaň pri Hevy, ak je pre teba dôležitý sociálny kanál alebo zapisuješ z hodiniek.',
        ],
        [
          'Môžem preniesť históriu z Hevy do LIFTAG?',
          'Import z Hevy zatiaľ nie je k dispozícii. Nainštaluj LIFTAG a začni zapisovať od najbližšieho tréningu; starú históriu môžeš ponechať v Hevy.',
        ],
        [
          'Potrebuje LIFTAG na užitočnosť štítky v posilňovni?',
          'Nie. Štítky urýchľujú začiatok v partnerskej posilňovni, no bez nich vyberieš cvik z knižnice a zapíšeš váhu a opakovania ako v Hevy.',
        ],
        [
          'Prečo veriť porovnaniu Hevy od LIFTAG?',
          'Skontroluj riadky. Ceny a limity Hevy citujeme z jeho App Store stránky s dátumom kontroly a otvorene uvádzame, kde je Hevy lepší.',
        ],
      ].map(([question, answer]) => ({ question, answer })),
      sourceBody: [
        `Ceny Hevy, obsah platenej verzie a podpora platforiem pochádzajú z ${x.source}, skontrolovaného ${v.date}. Bezplatný stav LIFTAG si môžeš overiť na ${x.liftagSource}. Hodnotenia, počty stiahnutí ani ceny na tejto stránke neodhadujeme.`,
        `Text pripravil tím LIFTAG, čo je zo svojej podstaty konflikt záujmov. Hevy nás neplatí a my neplatíme Hevy. Ceny a funkcie sa môžu zmeniť bez upozornenia; pred predplatným si over aktuálnu ponuku. Aktualizované v auguste 2026.`,
      ],
    }
  return {
    title: 'The Hevy alternative that knows the <span class="lime">machine.</span>',
    description:
      'Hevy features and pricing in 2026, next to LIFTAG. Hevy Pro costs $2.99 a month and wins on community; LIFTAG has no paid tier and opens the exercise from an NFC tap or QR scan on the machine.',
    seoTitle: 'Hevy Alternative 2026: LIFTAG vs Hevy, Features and Pricing',
    eyebrow: 'ALTERNATIVES · HEVY',
    cta: 'Get LIFTAG free',
    other: 'LIFTAG vs Strong',
    short: 'The short version',
    pricing: 'Pricing, quoted',
    features: 'Feature by feature',
    wins: 'Where the competitor wins',
    switch: 'Switching without burning anything',
    comparisons: 'Other comparisons',
    faq: 'Frequently asked questions',
    sources: 'Sources and method',
    needHeader: 'Need',
    liftagWinsHeading: 'Where LIFTAG wins',
    shortBody: [
      `Hevy is the best free general-purpose logger with a community attached. It is popular for a good reason, and if the feed is why you open the app, stop reading and keep Hevy.`,
      `LIFTAG is a different shape of the same job: the log is gym-aware. At a partner gym you tap the NFC tag or scan the QR on the machine, and the exercise in front of you is already open, with a setup video filmed on that exact equipment. The ${link('/exercises/barbell-bench-press', 'bench press')} and the ${link('/exercises/barbell-back-squat', 'back squat')} behave the same way as a ${link('/exercises/lat-pulldown', 'lat pulldown')} on the cable stack. Away from tags it logs like Hevy, without the free caps.`,
      `We build LIFTAG, so treat the tone as biased and the numbers as checkable. Every Hevy figure below is quoted from ${x.source}, read on ${v.date}.`,
    ],
    pricingBody: [
      `Hevy is free to download and free to log in. <strong>Hevy Pro is ${v.price}</strong> on the US App Store. Per Hevy's own listing text, Pro is what makes routines, graph history, and custom exercises unlimited, and it adds advanced measurements, so those three lines are also the map of the free tier's edges.`,
      `${v.caveat} We do not restate Hevy's free-tier numbers, because Hevy does not publish them on that listing and we are not going to guess them for you.`,
      `LIFTAG's side of the same question is short: neither the App Store nor Google Play lists an in-app purchase for it as of ${v.date}. The full breakdown is on ${link('/pricing', 'LIFTAG pricing')}.`,
    ],
    rows: [
      [
        'Log a set fast',
        'Very good. A decade-refined logger with a huge installed base.',
        'Very good, and fastest at a tagged gym: the machine opens the lift.',
      ],
      [
        'Free saved routines',
        'Capped. Hevy Pro is what makes routines unlimited.',
        'Unlimited on the free tier.',
      ],
      [
        'Free graph history',
        'Capped. Hevy Pro is what makes graph history unlimited.',
        'Full history, free.',
      ],
      [
        'Free custom exercises',
        'Capped. Hevy Pro is what makes custom exercises unlimited.',
        'Unlimited, with your own photos or video.',
      ],
      [
        'Paid tier',
        `Hevy Pro at ${v.price}.`,
        'None on either store today. Premium intelligence is planned and unpriced.',
      ],
      [
        'Gym machine tags',
        'None.',
        'NFC tap and QR scan at partner gyms. Gyms create the codes in the dashboard and buy the stickers.',
      ],
      [
        'Social feed',
        'The reason a lot of people stay. Follow friends, copy their workouts.',
        'Public profiles and shared routines, but no feed to scroll.',
      ],
      [
        'Coaching and gyms',
        'Hevy Trainer sits in Pro.',
        'Verified trainer profiles and a partner-gym map inside the free app.',
      ],
      [
        'Smartwatch',
        'Apple Watch and Wear OS apps.',
        'No watch app yet. Live heart rate comes from AirPods or a Bluetooth monitor.',
      ],
      [
        'Track record',
        `Years of scale and a long public review history.`,
        'New enough that the App Store has not collected enough ratings to show a score.',
      ],
    ].map(([need, competitor, liftag]: string[]) => ({ need, competitor, liftag })),
    competitorWins: [
      `The feed. Following people, copying their sessions, and comparing yourself is the product, not a bolt-on, and nothing in LIFTAG replaces it.`,
      `Scale. Hevy's own App Store listing opens with "Join +10 million users", and its site claims more. Your training partner is probably already there, and there are years of reviews to read before you install.`,
      `The watch. Hevy runs on Apple Watch and Wear OS. LIFTAG does not have a watch app.`,
      `A known ceiling. If you outgrow the free caps, Hevy Pro is cheap and the price is published. LIFTAG cannot make you the same promise yet, because it has no paid tier to publish.`,
    ],
    liftagWins: [
      `No caps to outgrow. Routines, custom exercises, and graph history are unlimited on the free tier, which is where three of Hevy's free limits sit.`,
      `The gym floor. At a partner gym you tap an NFC tag or scan the QR on the machine and the exercise is already open, with a video filmed on that exact equipment.`,
      `Discovery that points at real places. Verified trainer profiles and a partner-gym map with equipment, hours, and reviews, in the free app.`,
      `Nothing to buy. Neither store lists an in-app purchase for LIFTAG today, so there is no tier waiting to bill you.`,
    ],
    winsNote: `The tag half of that list is documented on ${link('/qr-nfc-gym-tags', 'NFC and QR gym tags')} and in the ${link('/journal/nfc-tags-for-gym-equipment', 'NFC tags for gym equipment')} guide.`,
    switchingBody: [
      `There is no Hevy importer, and pretending otherwise would waste your evening. What works: install LIFTAG, run it forward from your next session, and leave Hevy on the phone until you stop opening it. Two loggers for a fortnight costs nothing, because neither one is charging you.`,
      `The thing to watch during that fortnight is not features, it is taps between sets. If your gym has tags, you will notice immediately. If it does not, LIFTAG's advantage over Hevy narrows to the free caps and the trainer and gym layer. You can ask your gym to ${link('/contact/partner', 'become a partner')}, or read how a floor actually gets tagged in ${link('/journal/gym-nfc-rollout', 'gym NFC tag rollout')}.`,
    ],
    comparisonsBody: [
      `Strong instead of Hevy, head to head with LIFTAG: ${link('/vs/strong', 'LIFTAG vs Strong')}. All three at once, including free tiers and social features: ${link('/journal/strong-vs-hevy-vs-liftag', 'Strong vs Hevy vs LIFTAG')}. The eight-app matrix with FitNotes, JEFIT, Boostcamp, MacroFactor, and Fitbod: ${link('/best-workout-tracking-app', 'best workout tracking app 2026')}. Only the free tiers: ${link('/journal/best-free-workout-tracker', 'best free workout tracker')}.`,
    ],
    faqs: [
      [
        'How much does Hevy cost in 2026?',
        `Hevy is free to download, and Hevy Pro is listed at ${v.price} on Hevy's US App Store page, read on ${v.date}. The same page carries a second $3.99 monthly SKU, and store pricing varies by region and account, so check the listing before you subscribe.`,
      ],
      [
        'What does Hevy Pro actually unlock?',
        `Per Hevy's own listing: unlimited routines, unlimited graph history, unlimited custom exercises, and advanced body measurements. Those four lines are also the shape of the free tier, because they describe the caps Pro removes.`,
      ],
      [
        'Is there a free Hevy alternative with no routine limit?',
        'LIFTAG. Routines, weekly plans, custom exercises, full history, PRs, estimated 1RM, and progress charts are on the free tier, and neither store lists an in-app purchase for it today. The trade is that LIFTAG has no social feed and no watch app.',
      ],
      [
        'Should I switch from Hevy to LIFTAG?',
        "Switch if you train in a gym and the friction you actually feel is finding the right exercise between sets, or if you keep bumping into Hevy's free caps and would rather not subscribe. Stay on Hevy if the feed is part of why you open the app, or if you log from a watch. Those are different jobs and Hevy is genuinely better at the first one.",
      ],
      [
        'Can I move my Hevy history into LIFTAG?',
        'There is no Hevy import today. In practice people run LIFTAG forward from the day they install it and leave the old history where it is; the log that matters for your next session is the last few weeks, not the last few years. You do not have to delete anything to try both.',
      ],
      [
        'Does LIFTAG need gym tags to be useful?',
        'No. Tags are an accelerator at partner gyms, not a requirement. Without them you pick the lift from the library and log weight and reps exactly as you would in Hevy.',
      ],
      [
        'Why trust a Hevy comparison written by LIFTAG?',
        `Do not trust the tone, check the rows. Hevy's prices and feature caps here are quoted from its own App Store listing with the date we read it, and the page says out loud where Hevy is the better app. We benefit if you install LIFTAG, which is exactly why the losing rows are on the same page.`,
      ],
    ].map(([question, answer]) => ({ question, answer })),
    sourceBody: [
      `Hevy prices, paid-tier contents, and platform support are quoted from ${x.source}, read on ${v.date}. LIFTAG's own free status is checkable at ${x.liftagSource}. No ratings, download counts, or prices on this page are estimated: where a figure was not published, the row stays qualitative instead.`,
      `Written by the LIFTAG team, which is a conflict of interest by definition. Hevy does not pay us and we do not pay Hevy. Store pricing and feature gating change without notice; verify on the listing before you subscribe to anything. Updated August 2026.`,
    ],
  }
}
export function strongContent(locale: 'en' | 'sk', v: Vars): ComparisonContent {
  const sk = locale === 'sk'
  const x = shared(v)
  const L = sk
    ? {
        title: 'LIFTAG verzus <span class="lime">Strong.</span>',
        description: `LIFTAG proti Strong v roku 2026. Strong obmedzuje bezplatnú verziu na 3 tréningové zostavy a PRO stojí ${v.price}. LIFTAG počet zostáv neobmedzuje, nemá platenú verziu a cvik v ňom otvoríš priložením telefónu k NFC štítku alebo naskenovaním QR kódu na stroji.`,
        seoTitle: 'LIFTAG verzus Strong 2026 | Bezplatná verzia, funkcie a cena PRO',
        eyebrow: 'POROVNANIE · LIFTAG VERZUS STRONG',
        cta: 'Stiahnuť LIFTAG zadarmo',
        other: 'LIFTAG verzus Hevy',
        short: 'Krátka verzia',
        pricing: 'Uvedené ceny',
        features: 'Porovnanie funkciu po funkcii',
        wins: 'V čom vyhráva konkurencia',
        switch: 'Prechod bez straty histórie',
        comparisons: 'Ďalšie porovnania',
        faq: 'Časté otázky',
        sources: 'Zdroje a postup',
        needHeader: 'Potreba',
        liftagWinsHeading: 'V čom vyhráva LIFTAG',
      }
    : {
        title: 'LIFTAG vs <span class="lime">Strong.</span>',
        description: `LIFTAG against Strong in 2026. Strong caps free routines at 3 and sells PRO at ${v.price}; LIFTAG has no cap and no paid tier, and opens the lift from an NFC tap or QR scan on the machine.`,
        seoTitle: 'LIFTAG vs Strong 2026 | Free Tier, Features, PRO Pricing',
        eyebrow: 'COMPARISON · LIFTAG VS STRONG',
        cta: 'Get LIFTAG free',
        other: 'LIFTAG vs Hevy',
        short: 'The short version',
        pricing: 'Pricing, quoted',
        features: 'Feature by feature',
        wins: 'Where the competitor wins',
        switch: 'Switching without burning anything',
        comparisons: 'Other comparisons',
        faq: 'Frequently asked questions',
        sources: 'Sources and method',
        needHeader: 'Need',
        liftagWinsHeading: 'Where LIFTAG wins',
      }
  const rows: any = sk
    ? [
        [
          'Rýchly zápis série',
          'Referenčný denník. Na obrazovke nič navyše, iba séria.',
          'Veľmi dobrý a v označenej posilňovni najrýchlejší: stroj otvorí cvik.',
        ],
        ['Uložené zostavy zadarmo', 'Tri. To je zdokumentovaný limit.', 'Neobmedzené, plus týždenné plány.'],
        ['Zaznamenané tréningy zadarmo', 'Neobmedzené.', 'Neobmedzené.'],
        [
          'Platená verzia',
          `Strong PRO za ${v.price}, s doživotnou možnosťou.`,
          'Dnes bez nákupov v oboch obchodoch. Prémiové inteligentné funkcie sú plánované bez určenej ceny.',
        ],
        ['Štítky na strojoch', 'Nemá.', 'NFC dotyk a QR sken v partnerských posilňovniach.'],
        [
          'Rekordy, 1RM, časovač odpočinku',
          'Áno, navyše kalkulačka rozcvičky a kotúčov.',
          'Áno, vrátane rekordov podľa trvania a delenia podľa svalov.',
        ],
        [
          'Smart hodinky',
          'Plná aplikácia pre Apple Watch, funguje aj bez telefónu.',
          'Zatiaľ bez aplikácie pre hodinky. Tep získava z AirPods alebo Bluetooth monitora.',
        ],
        [
          'Pomoc s programom',
          'Program si prinesieš. Strong ho uloží.',
          'Rovnako, plus AI generátor zostavy alebo viac-týždňového plánu.',
        ],
        [
          'Tréneri a posilňovne',
          'Nie sú súčasťou produktu.',
          'Overené profily trénerov a mapa partnerských posilňovní.',
        ],
        [
          'Sociálne funkcie',
          'Žiadne, zámerne. Iba zdieľanie.',
          'Verejné profily a zdieľané zostavy, bez kanála na prezeranie.',
        ],
        ['Export dát', 'Export CSV do Poznámok alebo e-mailu.', 'Zatiaľ bez exportu pre používateľa.'],
        [
          'História produktu',
          'Viac než desať rokov v App Store a dlhá verejná história recenzií.',
          'Je nový, preto App Store ešte nemá dosť hodnotení na zobrazenie skóre.',
        ],
      ]
    : [
        [
          'Log a set fast',
          'The benchmark. Nothing on screen but the set.',
          'Very good, and fastest at a tagged gym: the machine opens the lift.',
        ],
        ['Free saved routines', 'Three. That is the documented cap.', 'Unlimited, plus weekly plans.'],
        ['Free workouts logged', 'Unlimited.', 'Unlimited.'],
        [
          'Paid tier',
          `Strong PRO at ${v.price}, with a lifetime option.`,
          'None on either store today. Premium intelligence is planned and unpriced.',
        ],
        [
          'Gym machine tags',
          'None.',
          'NFC tap and QR scan at partner gyms. Gyms create the codes in the dashboard and buy the stickers.',
        ],
        [
          'PRs, estimated 1RM, rest timer',
          'Yes, with warm-up and plate calculators on top.',
          'Yes, including duration PRs and body-part split.',
        ],
        [
          'Smartwatch',
          'Full Apple Watch app that logs with or without the phone.',
          'No watch app yet. Live heart rate comes from AirPods or a Bluetooth monitor.',
        ],
        [
          'Programming help',
          'You bring the program. Strong holds it.',
          'Same, plus an AI generator that drafts a routine or a multi-week plan.',
        ],
        [
          'Trainers and gyms',
          'Not part of the product.',
          'Verified trainer profiles and a partner-gym map inside the free app.',
        ],
        [
          'Social',
          'None, deliberately. Share sheet only.',
          'Public profiles and shared routines, but no feed to scroll.',
        ],
        ['Data export', 'CSV export to Notes or email.', 'No self-serve export yet.'],
        [
          'Track record',
          'Over a decade in the App Store and a long public review history.',
          'New enough that the App Store has not collected enough ratings to show a score.',
        ],
      ].map(([need, competitor, liftag]: string[]) => ({ need, competitor, liftag }))
  const rowsObj =
    Array.isArray(rows) && typeof rows[0] === 'object' && 'need' in rows[0]
      ? (rows as ComparisonRow[])
      : (rows.map(([need, competitor, liftag]: string[]) => ({
          need,
          competitor,
          liftag,
        })) as ComparisonRow[])
  const generic = (topic: string) =>
    sk
      ? `Strong ${topic} je minimalistický a overený rokmi. LIFTAG ponúka rovnaké zapisovanie s vrstvou posilňovne a bezplatnými zostavami bez limitu.`
      : `Strong ${topic} is restrained and proven over years. LIFTAG keeps the same logging core with a gym layer and unlimited free routines.`
  const result = {
    ...L,
    shortBody: sk
      ? [
          'Strong je aplikácia, podľa ktorej sa merajú ostatné denníky, a zaslúžila si to. Viac než desať rokov vývoja, aplikácia pre Apple Watch fungujúca aj s telefónom v skrinke a obrazovka, na ktorej je iba séria.',
          'LIFTAG rieši rovnakú základnú úlohu s posilňovňou vo vnútri. Prilož NFC štítok alebo naskenuj QR kód na stroji a cvik sa otvorí s videom natočeným na konkrétnom vybavení. Mimo štítkov zapisuje ako Strong, bez limitu troch zostáv.',
          'Rozhodujú dve veci: ak zapisuješ z hodiniek, vyhráva Strong. Ak potrebuješ viac než tri zostavy a nechceš platiť, vyhráva LIFTAG.',
        ]
      : [
          `Strong is the app every other logger gets measured against, and it earned that. Ten-plus years of sanding, an Apple Watch app that works with the phone in a locker, and a screen that holds nothing but the set you are doing.`,
          `LIFTAG is the same core job with the gym in it. Tap the NFC tag or scan the QR on the machine, and the exercise in front of you is already open, with a video filmed on that specific equipment. The bench press, back squat, and leg press all behave the same way. Away from tags it logs like Strong, without the three-routine ceiling.`,
          `Two rows decide most of this. If you log from a watch, Strong wins outright. If your split needs more than three routines and you would rather not subscribe, LIFTAG does.`,
        ],
    pricingBody: sk
      ? [
          'Vlastný zoznam Strong uvádza, že bezplatná verzia uloží neobmedzené tréningy, ale ponúka iba 3 vlastné tréningové zostavy. Strong PRO stojí ' +
            v.price +
            ' a tento limit odstraňuje. Overenie prebehlo ' +
            v.date +
            '.',
          v.caveat,
          'Tri zostavy stačia na full-body alebo jednoduchý upper/lower program. Nestačia na push/pull/legs s deload šablónou ani na samostatný tréning v hotelovej posilňovni. Práve vtedy sa Strong stáva platenou aplikáciou.',
          'Na strane LIFTAG nie je limit zostáv a ani jeden obchod k ' +
            v.date +
            ' neuvádza nákup v aplikácii. ' +
            link('/pricing', 'Podrobnosti o cenách LIFTAG') +
            '.',
        ]
      : [
          "Strong's own App Store listing says the free version <strong>saves unlimited workouts but is limited to 3 custom routines</strong>, and markets <strong>Strong PRO at ${v.price}</strong> to remove that cap. Read on ${v.date}.",
          v.caveat,
          'Three routines is enough for a full-body program or a simple upper/lower. It is not enough for push/pull/legs plus a deload template, or a separate session for the hotel gym. That is the moment Strong becomes a paid app, and it usually arrives in week one of setup rather than month six.',
          `LIFTAG's side: no routine cap, and neither store lists an in-app purchase for it as of ${v.date}. What we will and will not claim about a future premium tier is spelled out on ${link('/pricing', 'LIFTAG pricing')}.`,
        ],
    rows: rowsObj,
    competitorWins: sk
      ? [
          'Hodinky. Apple Watch aplikácia Strong zaznamená celý tréning aj s telefónom v skrinke. LIFTAG aplikáciu pre hodinky nemá.',
          'Roky dolaďovania. Kalkulačka rozcvičky, kotúčov, export CSV a miešanie imperiálnych a metrických jednotiek v jednom denníku.',
          'Minimalizmus. Žiadny kanál, vrstva fitiek ani návrhy. Ak chceš, aby aplikácia medzi sériami zmizla, Strong je stále najlepší.',
          'Známy účet. PRO má zverejnenú cenu aj doživotnú možnosť. LIFTAG to zatiaľ sľúbiť nemôže, pretože nemá platenú verziu.',
        ]
      : [
          'The watch. Strong’s Apple Watch app logs a full session with the phone in a locker. LIFTAG has no watch app.',
          'A decade of sanding. Warm-up calculator, plate calculator, CSV export, imperial and metric mixed in one log.',
          'Restraint. No feed, no gym layer, no suggestions. If you want the app to disappear between sets, Strong is still the best at it.',
          'A knowable bill. PRO is published at a price with a lifetime option; LIFTAG cannot promise that yet.',
        ],
    liftagWins: sk
      ? [
          'Limit troch zostáv neexistuje. LIFTAG ponúka neobmedzené zostavy a týždenné plány bez platby.',
          'Na podlahe fitka otvorí NFC alebo QR štítok správny cvik s videom natočeným na konkrétnom stroji.',
          'V aplikácii sú overení tréneri, zdieľané plány a mapa fitiek s vybavením, hodinami a recenziami.',
          'Nič nekupuješ. Ani jeden obchod dnes pri LIFTAG neuvádza nákup v aplikácii.',
        ]
      : [
          'The three-routine cap does not exist. LIFTAG’s routines and weekly plans are unlimited without paying.',
          'The gym floor. Tap the NFC tag or scan the QR on the machine and the exercise is open with a video filmed on that equipment.',
          'Trainers and gyms are in the app: verified coach profiles, shared plans, and a gym map.',
          'Nothing to buy. Neither store lists an in-app purchase for LIFTAG today.',
        ],
    winsNote: `${sk ? 'Časť o štítkoch je v ' : 'The tag details are in '}${link('/qr-nfc-gym-tags', sk ? 'NFC a QR štítkoch v posilňovniach' : 'NFC and QR gym tags')} ${sk ? 'a v ' : 'and '}${link('/journal/nfc-tags-for-gym-equipment', sk ? 'sprievodcovi štítkami' : 'the equipment-tag guide')}.`,
    switchingBody: [
      sk
        ? 'Strong exportuje CSV, LIFTAG ho zatiaľ nevie importovať. Namiesto migrácie prekry tréningy: nainštaluj LIFTAG, zapisuj najbližší týždeň v oboch aplikáciách a sleduj, po ktorej siahneš pri tretej sérii.'
        : 'Strong exports CSV; LIFTAG has no importer. Install LIFTAG, log the next week in both, and see which one you reach for on the third set.',
      sk
        ? `Ak fitko nemá štítky, rozdiel sa zúži na limit zostáv a vrstvu trénerov a fitiek. Požiadaj fitko, aby sa ${link('/contact/partner', 'stalo partnerom')}, alebo si prečítaj ${link('/journal/gym-nfc-rollout', 'zavedenie NFC v posilňovni')}.`
        : `If your gym has no tags, the difference narrows to the routine cap and trainer and gym layer. Ask your gym to ${link('/contact/partner', 'become a partner')} or read about ${link('/journal/gym-nfc-rollout', 'gym NFC rollout')}.`,
    ],
    comparisonsBody: [
      `${link('/alternatives/hevy', sk ? 'LIFTAG verzus Hevy' : 'LIFTAG vs Hevy')}. ${link('/journal/strong-vs-hevy-vs-liftag', sk ? 'Strong verzus Hevy verzus LIFTAG' : 'Strong vs Hevy vs LIFTAG')}. ${link('/best-workout-tracking-app', sk ? 'Najlepšia aplikácia na sledovanie tréningu 2026' : 'best workout tracking app 2026')}.`,
    ],
    faqs: (sk
      ? [
          [
            'Koľko stojí Strong v roku 2026?',
            `Strong je zadarmo a PRO stojí ${v.price} podľa amerického App Store skontrolovaného ${v.date}.`,
          ],
          [
            'Aké obmedzenie má bezplatný Strong?',
            'Bezplatná verzia uloží neobmedzené tréningy, ale iba tri vlastné zostavy. PRO tento limit odstráni.',
          ],
          [
            'Je LIFTAG alternatívou k Strong PRO?',
            'Pri limite zostáv áno. LIFTAG má neobmedzené zostavy a plány bez platenej verzie, no nemá aplikáciu pre Apple Watch.',
          ],
          [
            'Mám prejsť zo Strong na LIFTAG?',
            'Prejdi, ak chceš viac než tri zostavy alebo vrstvu posilňovne. Zostaň pri Strong, ak je rozhodujúca aplikácia pre Apple Watch.',
          ],
          [
            'Môžem preniesť históriu zo Strong?',
            'Strong vie exportovať CSV, ale LIFTAG ho dnes nevie importovať. CSV si nechaj ako archív a zapisuj nové tréningy v LIFTAG.',
          ],
          ['Potrebuje LIFTAG štítky?', 'Nie. Štítky iba urýchlia otvorenie cviku v partnerskej posilňovni.'],
          [
            'Prečo veriť porovnaniu od LIFTAG?',
            'Cenu a limit Strong citujeme z jeho App Store stránky a uvádzame aj oblasti, v ktorých Strong vyhráva.',
          ],
        ]
      : [
          [
            'How much does Strong cost in 2026?',
            `Strong is free to download and PRO is ${v.price} on its US App Store listing, read on ${v.date}.`,
          ],
          [
            'What is Strong’s free tier limited to?',
            'Unlimited logged workouts but 3 custom routines, per Strong’s listing. PRO removes the cap.',
          ],
          [
            'Is LIFTAG a free alternative to Strong PRO?',
            'For the routine cap, yes. LIFTAG has unlimited routines and plans, but no Apple Watch app.',
          ],
          [
            'LIFTAG vs Strong: which logs faster?',
            'Strong wins on a blank screen; LIFTAG wins at a tagged partner gym because the exercise is already selected.',
          ],
          [
            'Can I move my Strong history into LIFTAG?',
            'Strong exports CSV, but LIFTAG has no importer today. Keep the CSV as an archive and log forward.',
          ],
          [
            'Does LIFTAG work without tags?',
            'Yes. Choose the lift from the library and log weight and reps at no cost.',
          ],
          [
            'Why trust a Strong comparison written by LIFTAG?',
            'The price and cap come from Strong’s own listing, and this page states where Strong wins.',
          ],
        ]
    ).map(([question, answer]) => ({ question, answer })),
    sourceBody: [
      `${sk ? 'Cenu, limit bezplatnej verzie a podporu Apple Watch citujeme z ' : 'Strong’s price, free-tier cap, and Apple Watch support are quoted from '}${v.sourceUrl ? `<a href="${v.sourceUrl}">${v.source}</a>` : v.source}, ${sk ? 'skontrolované' : 'read'} ${v.date}. LIFTAG ${sk ? 'bezplatný stav si overíš na' : 'free status is checkable at'} ${x.liftagSource}.`,
      `Written by the LIFTAG team, a conflict of interest by definition. ${sk ? 'Strong nás neplatí a ceny sa môžu zmeniť bez upozornenia.' : 'Strong does not pay us; store pricing and feature gating can change without notice.'}`,
    ],
  }
  result.shortBody = sk
    ? [
        'Strong je aplikácia, podľa ktorej sa merajú ostatné denníky, a zaslúžila si to. Viac než desať rokov vývoja, aplikácia pre Apple Watch fungujúca aj s telefónom v skrinke a obrazovka, na ktorej je iba séria.',
        'LIFTAG rieši rovnakú základnú úlohu s posilňovňou vo vnútri. Prilož NFC štítok alebo naskenuj QR kód na stroji a cvik sa otvorí s videom natočeným na konkrétnom vybavení. Bench press, drep s činkou na chrbte aj leg press fungujú rovnako. Mimo štítkov zapisuje ako Strong, bez limitu troch zostáv.',
        'O výsledku rozhodujú najmä dve veci. Ak zapisuješ z hodiniek, Strong vyhráva jednoznačne. Ak tvoj split potrebuje viac než tri zostavy a nechceš platiť predplatné, vyhráva LIFTAG.',
      ]
    : [
        'Strong is the app every other logger gets measured against, and it earned that. Ten-plus years of sanding, an Apple Watch app that works with the phone in a locker, and a screen that holds nothing but the set you are doing.',
        'LIFTAG is the same core job with the gym in it. Tap the NFC tag or scan the QR on the machine, and the exercise in front of you is already open, with a video filmed on that specific equipment. The ' +
          link('/exercises/barbell-bench-press', 'bench press') +
          ', the ' +
          link('/exercises/barbell-back-squat', 'back squat') +
          ', and the ' +
          link('/exercises/standard-leg-press', 'leg press') +
          ' all behave the same way. Away from tags it logs like Strong, without the three-routine ceiling.',
        'Two rows decide most of this. If you log from a watch, Strong wins outright. If your split needs more than three routines and you would rather not subscribe, LIFTAG does.',
      ]
  result.pricingBody = sk
    ? [
        'Vlastný zoznam Strong uvádza, že bezplatná verzia <strong>uloží neobmedzené tréningy, ale ponúka iba 3 vlastné tréningové zostavy</strong> a Strong PRO za <strong>' +
          v.price +
          '</strong> tento limit odstraňuje. Overenie prebehlo ' +
          v.date +
          '.',
        v.caveat,
        'Tri zostavy stačia na full-body alebo jednoduchý upper/lower program. Nestačia na push/pull/legs s deload šablónou ani na samostatný tréning v hotelovej posilňovni. Vtedy sa Strong stáva platenou aplikáciou, často už v prvom týždni nastavovania, nie až po šiestich mesiacoch.',
        'Na strane LIFTAG nie je limit zostáv a ani jeden obchod k ' +
          v.date +
          ' neuvádza nákup v aplikácii. Čo o budúcej prémiovej verzii tvrdíme a čo nie, vysvetľujeme na ' +
          link('/pricing', 'cenách LIFTAG') +
          '.',
      ]
    : [
        "Strong's own App Store listing says the free version <strong>saves unlimited workouts but is limited to 3 custom routines</strong>, and markets <strong>Strong PRO at " +
          v.price +
          '</strong> to remove that cap. Read on ' +
          v.date +
          '.',
        v.caveat,
        'Three routines is enough for a full-body program or a simple upper/lower. It is not enough for push/pull/legs plus a deload template, or a separate session for the hotel gym. That is the moment Strong becomes a paid app, and it usually arrives in week one of setup rather than month six.',
        `LIFTAG's side: no routine cap, and neither store lists an in-app purchase for it as of ${v.date}. What we will and will not claim about a future premium tier is spelled out on ${link('/pricing', 'LIFTAG pricing')}.`,
      ]
  result.competitorWins = sk
    ? [
        'Hodinky. Apple Watch aplikácia Strong zaznamená celý tréning aj s telefónom v skrinke. LIFTAG aplikáciu pre hodinky nemá a ak takto trénuješ, porovnanie sa tu končí.',
        'Roky dolaďovania. Kalkulačka rozcvičky, kotúčov, export CSV a miešanie imperiálnych a metrických jednotiek v jednom denníku sú drobnosti, na ktorých mal Strong roky pracovať.',
        'Minimalizmus. Žiadny kanál, vrstva fitiek ani návrhy. Ak chceš, aby aplikácia medzi sériami zmizla, Strong je stále najlepší.',
        'Známy účet. PRO má zverejnenú cenu aj doživotnú možnosť, takže sa môžeš rozhodnúť raz. LIFTAG to zatiaľ sľúbiť nemôže, pretože nemá platenú verziu.',
      ]
    : [
        "The watch. Strong's Apple Watch app logs a full session with the phone in a locker. LIFTAG has no watch app, and if that is how you train, this comparison ends here.",
        'A decade of sanding. Warm-up calculator, plate calculator, CSV export, imperial and metric mixed in one log. Small things, and Strong has had years to get them right.',
        'Restraint. No feed, no gym layer, no suggestions. If you want the app to disappear between sets, that is a feature and Strong is still the best at it.',
        'A knowable bill. PRO is published at a price with a lifetime option, so you can decide once. LIFTAG cannot promise you that yet, because it has no paid tier to publish.',
      ]
  result.liftagWins = sk
    ? [
        'Limit troch zostáv neexistuje. Push/pull/legs s cestovnou zostavou už prekročí bezplatný Strong; LIFTAG ponúka neobmedzené zostavy a týždenné plány bez platby.',
        'Na podlahe fitka priložíš telefón k NFC štítku alebo naskenuješ QR kód na stroji a cvik sa otvorí s videom natočeným na konkrétnom vybavení, nie s generickou ukážkou.',
        'Tréneri a fitká sú priamo v aplikácii: overené profily koučov, zdieľané plány a mapa s vybavením, hodinami a recenziami.',
        'Nič nekupuješ. Ani jeden obchod dnes pri LIFTAG neuvádza nákup v aplikácii, takže bezplatná verzia nie je odpočítavaním do platby.',
      ]
    : [
        "The three-routine cap does not exist. A push/pull/legs split plus a travel day already breaks Strong's free tier; LIFTAG's routines and weekly plans are unlimited without paying.",
        'The gym floor. Tap the NFC tag or scan the QR on the machine and the exercise is open, with a setup video filmed on that exact equipment rather than a generic demo.',
        'Trainers and gyms are in the app. Verified coach profiles, shared plans, and a gym map with equipment, hours, and reviews.',
        'Nothing to buy. Neither store lists an in-app purchase for LIFTAG today, so the free tier is not a countdown.',
      ]
  result.switchingBody = sk
    ? [
        'Strong exportuje CSV, LIFTAG ho zatiaľ nevie importovať. Namiesto migrácie prekry tréningy: nainštaluj LIFTAG, zapisuj najbližší týždeň v oboch aplikáciách a sleduj, po ktorej siahneš pri tretej sérii. Ani jedna aplikácia ti za tento týždeň neúčtuje poplatok.',
        'Ak fitko nemá štítky, rozdiel sa zúži na limit zostáv a vrstvu trénerov a fitiek. Požiadaj fitko, aby sa ' +
          link('/contact/partner', 'stalo partnerom') +
          ', alebo si prečítaj, ako sa podlaha označuje v ' +
          link('/journal/gym-nfc-rollout', 'sprievodcovi zavedením NFC v posilňovni') +
          '.',
      ]
    : [
        'Strong exports CSV; LIFTAG has no importer for it. So do not migrate, overlap. Install LIFTAG, log the next session in both for a week, and see which one you reach for on the third set of the day. Neither app is charging you during that week.',
        'If your gym has no tags, the difference narrows to the routine cap and the trainer and gym layer, and you should know that before you decide. You can ask your gym to ' +
          link('/contact/partner', 'become a partner') +
          ', or read what tagging a floor actually involves in ' +
          link('/journal/gym-nfc-rollout', 'gym NFC tag rollout') +
          '.',
      ]
  result.comparisonsBody = sk
    ? [
        `${link('/alternatives/hevy', 'LIFTAG verzus Hevy')}. ${link('/journal/strong-vs-hevy-vs-liftag', 'Strong verzus Hevy verzus LIFTAG')}. ${link('/best-workout-tracking-app', 'najlepšia aplikácia na sledovanie tréningu 2026')}. ${link('/journal/best-workout-app-for-powerlifting', 'najlepšia aplikácia na powerlifting')}.`,
      ]
    : [
        `Hevy instead of Strong: ${link('/alternatives/hevy', 'LIFTAG vs Hevy')}. All three at once: ${link('/journal/strong-vs-hevy-vs-liftag', 'Strong vs Hevy vs LIFTAG')}. The eight-app matrix: ${link('/best-workout-tracking-app', 'best workout tracking app 2026')}. Powerlifting specifically: ${link('/journal/best-workout-app-for-powerlifting', 'best workout app for powerlifting')}.`,
      ]
  result.faqs = sk
    ? [
        {
          question: 'Koľko stojí Strong v roku 2026?',
          answer: `Strong je na stiahnutie zadarmo. Jeho americký App Store uvádza Strong PRO za ${v.price}; údaje sme skontrolovali ${v.date}. Zoznam nákupov v aplikácii na rovnakej stránke uvádza aj doživotný Strong PRO za 99,99 USD a ďalšie ceny. Strong upozorňuje, že ceny platia pre zákazníkov v USA a líšia sa podľa účtu, preto si predplatné over priamo v obchode.`,
        },
        {
          question: 'Aké obmedzenie má bezplatný Strong?',
          answer:
            'Podľa vlastného zoznamu Strong bezplatná verzia uloží neobmedzený počet tréningov, ale ponúka iba 3 vlastné tréningové zostavy. PRO tento limit odstráni a pridá ďalšie funkcie. Väčšina cvičiacich s čímkoľvek zložitejším než dvojdňovým splitom na limit narazí už pri nastavovaní.',
        },
        {
          question: 'Je LIFTAG bezplatnou alternatívou k Strong PRO?',
          answer:
            'Pri limite zostáv áno: zostavy, týždenné plány, vlastné cviky, celá história, rekordy a odhadované 1RM sú v bezplatnej verzii LIFTAG a ani jeden obchod dnes neuvádza nákup v aplikácii. Nejde o úplne rovnakú náhradu, pretože Strong má aplikáciu pre Apple Watch a LIFTAG nie.',
        },
        {
          question: 'LIFTAG verzus Strong: ktorá aplikácia zapíše sériu rýchlejšie?',
          answer:
            'Na prázdnej obrazovke vo fitku bez štítkov vyhráva Strong, hoci len tesne, pretože tento detail dolaďuje viac než desať rokov. V partnerskom fitku so štítkami výrazne vyhráva LIFTAG, pretože cvik je vybraný ešte pred otvorením zoznamu.',
        },
        {
          question: 'Môžem preniesť históriu zo Strong do LIFTAG?',
          answer:
            'Nie automaticky. Strong vie exportovať dáta ako CSV, ale LIFTAG ho dnes nevie importovať. Väčšina ľudí začne v LIFTAG od najbližšieho tréningu a CSV si nechá ako archív. Strong nemusíš mazať, aby si LIFTAG vyskúšal.',
        },
        {
          question: 'Funguje LIFTAG vo fitku bez NFC alebo QR štítkov?',
          answer:
            'Áno. Štítky iba urýchľujú začiatok v partnerskej posilňovni; nie sú podmienkou. Bez nich vyberieš cvik z knižnice a bezplatne zapíšeš váhu a opakovania tak, ako v Strong.',
        },
        {
          question: 'Prečo veriť porovnaniu Strong od LIFTAG?',
          answer:
            'Pretože na rovnakej stránke uvádzame aj riadky, v ktorých prehrávame. Cenu a limit bezplatnej verzie Strong citujeme z jeho App Store zoznamu s dátumom kontroly a pri hodinkách otvorene píšeme, že Strong vyhráva a LIFTAG tam nemá čo ponúknuť. Čítaj tabuľku, nie titulok.',
        },
      ]
    : [
        {
          question: 'How much does Strong cost in 2026?',
          answer: `Strong is free to download. Its US App Store description markets Strong PRO at ${v.price}, read on ${v.date}. The in-app purchase list on the same page also shows a $99.99 "Strong PRO Forever" and several other price points, and Strong notes those prices are for US customers and vary by account, so check the listing rather than this page.`,
        },
        {
          question: "What is Strong's free tier limited to?",
          answer:
            "Per Strong's own App Store listing, the free version saves unlimited workouts but is limited to 3 custom routines. PRO removes the cap and adds further PRO features. Most lifters running anything more structured than a two-day split hit that limit during setup.",
        },
        {
          question: 'Is LIFTAG a free alternative to Strong PRO?',
          answer:
            "For the routine cap specifically, yes: routines, weekly plans, custom exercises, full history, PRs, and estimated 1RM are on LIFTAG's free tier, and neither store lists an in-app purchase for it today. It is not a like-for-like replacement, because Strong has an Apple Watch app and LIFTAG does not.",
        },
        {
          question: 'LIFTAG vs Strong: which logs a set faster?',
          answer:
            'On a blank screen at a gym with no tags, Strong, by a small margin it has earned over a decade. At a partner gym with tags on the machines, LIFTAG, by a large one, because the exercise is already selected before you have opened a list.',
        },
        {
          question: 'Can I move my Strong history into LIFTAG?',
          answer:
            'Not automatically. Strong can export your data as CSV, but LIFTAG has no importer for it today. Most people run LIFTAG forward from the next session and keep the CSV as an archive. You do not have to delete Strong to try it.',
        },
        {
          question: 'Does LIFTAG work at a gym with no NFC or QR tags?',
          answer:
            'Yes. Tags are an accelerator at partner gyms, not a requirement. Without them you pick the lift from the library and log weight and reps the way you would in Strong, at no cost.',
        },
        {
          question: 'Why trust a Strong comparison written by LIFTAG?',
          answer:
            "Because the losing rows are on the same page. Strong's price and free-tier cap are quoted from its own App Store listing with the date we read it, and the watch row says plainly that Strong wins and LIFTAG has nothing to offer there. Read the table, not the headline.",
        },
      ]
  result.sourceBody = sk
    ? [
        `Cenu, limit bezplatnej verzie, podporu Apple Watch a zoznam funkcií Strong citujeme z <a href="${v.sourceUrl}" rel="nofollow noopener" target="_blank">${v.source}</a>, skontrolovaného ${v.date}. Bezplatný stav LIFTAG si môžeš overiť na ${x.liftagSource}. Hodnotenia, počty stiahnutí ani ceny tu neodhadujeme: ak údaj nebol zverejnený, riadok zostáva kvalitatívny.`,
        `Text pripravil tím LIFTAG, čo je zo svojej podstaty konflikt záujmov. Strong nás neplatí a my neplatíme Strong. Ceny a funkcie v obchodoch sa môžu zmeniť bez upozornenia; pred predplatným si over aktuálnu ponuku. Aktualizované v auguste 2026.`,
      ]
    : [
        `Strong's price, free-tier cap, Apple Watch support, and feature list are quoted from <a href="${v.sourceUrl}" rel="nofollow noopener" target="_blank">${v.source}</a>, read on ${v.date}. LIFTAG's own free status is checkable at ${x.liftagSource}. No ratings, download counts, or prices here are estimated: where a figure was not published, the row stays qualitative instead.`,
        `Written by the LIFTAG team, which is a conflict of interest by definition. Strong does not pay us and we do not pay Strong. Store pricing and feature gating change without notice; verify on the listing before you subscribe to anything. Updated August 2026.`,
      ]
  return result
}
