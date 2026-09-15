import type { JournalArticle } from './types'

export const en = {
  slug: 'nfc-tags-for-gym-equipment',
  path: '/journal/nfc-tags-for-gym-equipment',
  titleHtml: 'NFC tags for <span class="lime">gym equipment.</span>',
  titleText: 'NFC tags for gym equipment.',
  description:
    'What to put on each gym machine in 2026: NFC vs QR, tag placement, NTAG types, and how a tap opens the right exercise in a workout tracker.',
  seoTitle: 'NFC Tags for Gym Equipment (2026) | LIFTAG',
  datePublished: '2026-08-19',
  category: 'GYM TECH',
  dateUpdated: '2026-08',
  body: '<section>\n            <h2>The job of a tag</h2>\n            <p>\n              A tag on a machine is not decoration. It is the shortest path from “I am standing at this frame” to “the set is in the log.” If the tap opens a generic homepage, you wasted the sticker. If it opens\n              <a href="/exercises/machine-chest-press">machine chest press</a>\n              on that exact chest press, the floor starts to teach itself.\n            </p>\n            <p>\n              LIFTAG is built around that path. The <a href="/qr-nfc-gym-tags">NFC and QR gym tags</a> page is the product view. This guide is the physical one: chips, placement, and why you ship both radios.\n            </p>\n          </section>\n\n          <section>\n            <h2>NFC vs QR on gym equipment</h2>\n            <ul>\n              <li><strong>NFC</strong> — tap, no camera, works in glare. Needs an NFC phone and a chip the gym does not peel off in month two.</li>\n              <li><strong>QR</strong> — every smartphone, including the ones with NFC turned off. Needs a camera and a sticker that still scans after a year of chalk.</li>\n              <li><strong>Both on one plate</strong> — the only setup that does not create a support ticket per phone brand.</li>\n            </ul>\n            <p>\n              In the small machine-tag category, LIFTAG treats NFC + QR as the default: gyms create both from the dashboard and buy the physical tags. Liftd can do NFC if the gym supplies tags. ScanLiftLog and RepTag are QR-first. Details live in the\n              <a href="/best-gym-qr-nfc-app">gym QR comparison</a>.\n            </p>\n          </section>\n\n          <section>\n            <h2>How to tag a machine</h2>\n            <ol>\n              <li>Decide the exercise. One primary lift per tag. A lat pulldown is <a href="/exercises/lat-pulldown">lat pulldown</a>, not “back machine.”</li>\n              <li>Encode NFC and QR to the same destination so a tap and a scan never disagree.</li>\n              <li>Clean a flat, hand-height surface. Avoid the greasiest plate and the deepest metal pocket you can.</li>\n              <li>Stick the dual tag. Press it on. If it lifts in week one, the floor will finish the job.</li>\n              <li>Tap it. Confirm the right lift, the gym’s video if you filmed one, and the logger.</li>\n              <li>Use the same height and side of the frame across the club. Habits do not survive a scavenger hunt.</li>\n            </ol>\n          </section>\n\n          <section>\n            <h2>Chip notes without the folklore</h2>\n            <p>\n              NTAG213 is enough for a URL. Step up only if you have a reason. Do not buy mystery eBay chips and hope they survive a squat rack. Durability is the sticker laminate and the adhesive, not the NFC forum type number on a spreadsheet.\n            </p>\n            <p>\n              LIFTAG does not buy or ship those chips. Partner gyms purchase NFC tags and QR stickers, then encode both from the dashboard so they open the same catalog exercise. The floor walk is\n              <a href="/journal/gym-nfc-rollout">how gyms roll out NFC tags</a>.\n              <a href="/contact/partner">Become a partner gym</a>.\n            </p>\n          </section>',
  howTo: {
    name: 'How to tag a gym machine with NFC and QR',
    description: 'Place a dual NFC + QR tag so a tap or scan opens the correct exercise.',
    steps: [
      'Pick the exercise that machine actually hosts in the catalog.',
      'Encode the NFC chip and print the QR to the same destination.',
      'Clean a flat, hand-height surface and stick the dual tag.',
      'Tap with a phone. Confirm the right lift, video, and logger open.',
      'Repeat the same placement language across the floor.',
    ],
  },
  faqs: [
    {
      question: 'Are NFC tags and QR codes free?',
      answer:
        'Creating and managing NFC tags and QR codes is free. Gym owners get the dashboard to set them up, and members get the full LIFTAG app. LIFTAG does not buy or ship the physical NFC tags or QR stickers. Gyms purchase those themselves.',
    },
    {
      question: 'What NFC tag should a gym put on machines?',
      answer:
        'NTAG213 is enough for a URL. NTAG215/216 give more memory if you later store extra records. Gyms buy the chips and stickers themselves, then encode NFC and QR from the LIFTAG dashboard so both open the same exercise.',
    },
    {
      question: 'Where should the tag go on the machine?',
      answer:
        'On a flat, clean surface at hand height, away from the weight stack’s deepest metal well if you can. The lifter should tap without crouching into the footplate. Same spot on every machine in the club so the habit transfers.',
    },
    {
      question: 'Do iPhones read gym NFC tags?',
      answer:
        'iPhone XS and later read NFC tags from the lock screen and from an open app. Older iPhones and any phone with NFC disabled can still scan the QR on the same sticker.',
    },
    {
      question: 'Why not QR only?',
      answer:
        'QR works everywhere and fails in glare, busy cameras, and with gym members who will not open a camera app between sets. NFC is one tap. Using both is how you cover every phone without arguing about it at the front desk.',
    },
  ],
  ctaPath: '/',
  ctaLabel: 'Get LIFTAG free',
  secondaryPath: '/best-workout-tracking-app',
  secondaryLabel: 'Full tracker comparison',
} satisfies JournalArticle

export const sk = {
  slug: 'nfc-tags-for-gym-equipment',
  path: '/journal/nfc-tags-for-gym-equipment',
  titleHtml: 'NFC štítky pre <span class="lime">vybavenie fitka.</span>',
  titleText: 'NFC štítky pre vybavenie fitka.',
  description:
    'Čo dať na každý stroj v roku 2026: NFC verzus QR, umiestnenie štítku, typy NTAG a otvorenie správneho cviku v tréningovom denníku.',
  seoTitle: 'NFC štítky pre vybavenie fitka (2026) | LIFTAG',
  datePublished: '2026-08-19',
  category: 'TECHNOLÓGIA VO FITKU',
  dateUpdated: '2026-08',
  body: '<section><h2>Na čo slúži štítok</h2><p>Štítok na stroji nie je dekorácia. Je to najkratšia cesta od „stojím pri tomto stroji“ k „séria je zapísaná“. Ak priloženie telefónu otvorí všeobecnú úvodnú stránku, nálepka nesplnila účel. Ak na konkrétnom stroji otvorí <a href="/exercises/machine-chest-press">tlaky na hrudník na stroji</a>, vybavenie začne členom samo ukazovať, čo na ňom cvičiť.</p><p>Na tomto postupe stojí LIFTAG. Stránka <a href="/qr-nfc-gym-tags">NFC a QR štítky pre fitká</a> ho predstavuje ako funkciu produktu. Tento návod rieši fyzické prevedenie: čipy, umiestnenie a dôvod, prečo ponúknuť obe možnosti načítania.</p></section>\n<section><h2>NFC alebo QR na strojoch</h2><ul><li><strong>NFC</strong> — priložíš telefón, nepotrebuješ fotoaparát a neprekážajú odlesky. Potrebuješ telefón s NFC a čip, ktorý sa po dvoch mesiacoch neodlepí.</li><li><strong>QR</strong> — funguje na každom smartfóne, aj keď má vypnuté NFC. Potrebuješ fotoaparát a nálepku, ktorá sa dá načítať aj po roku používania magnézia.</li><li><strong>Oboje na jednom štítku</strong> — riešenie, pri ktorom nemusíš zvlášť riešiť podporu pre každú značku telefónu.</li></ul><p>V kategórii štítkov na stroje berie LIFTAG NFC + QR ako štandard: fitko vytvorí oba kódy v dashboarde a kúpi si fyzické štítky. Liftd podporuje NFC, ak štítky dodá fitko. ScanLiftLog a RepTag sa zameriavajú na QR. Podrobnosti nájdeš v <a href="/best-gym-qr-nfc-app">porovnaní QR platforiem pre fitká</a>.</p></section>\n<section><h2>Ako označiť stroj</h2><ol><li>Vyber cvik. Jeden hlavný cvik na jeden štítok. Horná kladka je <a href="/exercises/lat-pulldown">sťahovanie hornej kladky</a>, nie „stroj na chrbát“.</li><li>Nastav NFC aj QR na rovnaký cieľ, aby priloženie telefónu a sken vždy otvorili ten istý obsah.</li><li>Očisti rovný povrch vo výške ruky. Vyhni sa mastným plochám aj hlbokým kovovým výklenkom.</li><li>Nalep kombinovaný štítok a dôkladne ho pritlač. Ak sa začne odliepať už prvý týždeň, ďalšiu prevádzku nevydrží.</li><li>Prilož telefón. Over, že sa otvorí správny cvik, video vášho fitka, ak ste ho natočili, a zápis tréningu.</li><li>V celom fitku používaj rovnakú výšku a stranu rámu. Návyky sa budujú ťažko, keď musí člen štítok zakaždým hľadať.</li></ol></section>\n<section><h2>Čo treba vedieť o čipoch</h2><p>Na uloženie URL stačí NTAG213. Vyšší model má zmysel len vtedy, keď naň máš dôvod. Nekupuj neznáme čipy z eBay s nádejou, že vydržia prevádzku pri stojane na drepy. O odolnosti rozhoduje laminácia nálepky a lepidlo, nie číslo typu NFC v tabuľke.</p><p>LIFTAG tieto čipy nekupuje ani neposiela. Partnerské fitká si kúpia NFC štítky a QR nálepky a v dashboarde ich nastavia tak, aby otvárali rovnaký cvik z katalógu. Celý postup po fitku opisuje návod <a href="/journal/gym-nfc-rollout">ako zaviesť NFC štítky vo fitku</a>. <a href="/contact/partner">Staň sa partnerským fitkom</a>.</p></section>',
  howTo: {
    name: 'Ako označiť stroj NFC a QR štítkom',
    description: 'Umiestni dvojitý NFC + QR štítok tak, aby ťuknutie alebo sken otvorili správny cvik.',
    steps: [
      'Vyber cvik, ktorý stroj v katalógu skutočne predstavuje.',
      'Zapíš NFC čip a vytlač QR na rovnakú cieľovú adresu.',
      'Očisti rovný povrch vo výške ruky a nalep dvojitý štítok.',
      'Ťukni telefónom a over cvik, video aj denník.',
      'Rovnaké umiestnenie používaj v celom tréningovom priestore.',
    ],
  },
  faqs: [
    {
      question: 'Sú NFC štítky a QR kódy bezplatné?',
      answer:
        'Vytváranie a správa NFC štítkov a QR kódov sú bezplatné. Majitelia fitiek dostanú dashboard na ich nastavenie a členovia plnú aplikáciu LIFTAG. LIFTAG fyzické NFC štítky ani QR nálepky nekupuje a neposiela; fitká si ich zabezpečujú samy.',
    },
    {
      question: 'Aký NFC štítok má fitko umiestniť na stroje?',
      answer:
        'Na URL stačí NTAG213; NTAG215 alebo NTAG216 ponúknu viac pamäte, ak neskôr uložíš ďalšie záznamy. Fitko si čipy a nálepky kupuje samo, potom v dashboarde LIFTAG zakóduje NFC aj QR tak, aby oba otvorili rovnaký cvik.',
    },
    {
      question: 'Kam štítok nalepiť na stroji?',
      answer:
        'Na čistý rovný povrch vo výške ruky, podľa možnosti mimo najhlbšej kovovej časti zásobníka závaží. Cvičenec má ťuknúť bez krčenia pri platforme. Na všetkých strojoch v prevádzke používaj rovnaké miesto, aby sa návyk prenášal.',
    },
    {
      question: 'Čítajú iPhony NFC štítky vo fitku?',
      answer:
        'iPhone XS a novší číta NFC štítky zo zamknutej obrazovky aj z otvorenej aplikácie. Staršie iPhony a každý telefón s vypnutým NFC môžu naskenovať QR kód na tej istej nálepke.',
    },
    {
      question: 'Prečo nepoužiť iba QR?',
      answer:
        'QR funguje takmer všade, no zlyháva pri odleskoch, zaneprázdnenom fotoaparáte a pri členoch, ktorí medzi sériami nechcú otvárať aplikáciu fotoaparátu. NFC je jedno ťuknutie. Obe možnosti pokryjú každý telefón bez dohadovania na recepcii.',
    },
  ],
  ctaPath: '/',
  ctaLabel: 'Stiahnuť LIFTAG zadarmo',
  secondaryPath: '/best-workout-tracking-app',
  secondaryLabel: 'Porovnať trackery',
} satisfies typeof en
