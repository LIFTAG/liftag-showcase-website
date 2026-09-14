export interface QrTagsContent {
  title: string
  description: string
  seoTitle: string
  structuredName: string
  breadcrumbName: string
  articleHeadline: string
  eyebrow: string
  cta: string
  metrics: { value: string; label: string }[]
  sections: { title: string; body: string }[]
  compareEyebrow: string
  compareTitle: string
  compareLead: string
  compareMore: string
  faqs: { question: string; answer: string }[]
}
export const en: QrTagsContent = {
  title: 'NFC and QR gym tags that open the <span class="lime">right exercise.</span>',
  description:
    'LIFTAG combines NFC tags and QR codes for gym machines so lifters can tap or scan equipment to open setup videos, exercise details, and workout tracking.',
  seoTitle: 'NFC and QR Gym Tags for Exercise Machines | LIFTAG',
  structuredName: 'NFC and QR gym tags for exercise machines',
  breadcrumbName: 'NFC and QR gym tags',
  articleHeadline: 'NFC and QR gym tags that open the right exercise',
  eyebrow: 'MACHINE SYNC',
  cta: 'See scan flow',
  metrics: [
    { value: 'TAP', label: 'nfc tag' },
    { value: 'SCAN', label: 'qr code' },
    { value: 'LOG', label: 'set tracking' },
  ],
  sections: [
    {
      title: 'NFC for the fastest interaction',
      body: 'NFC tags let lifters tap the machine and immediately open the relevant Liftag flow. It feels native, fast, and clear for repeat gym use.',
    },
    {
      title: 'QR codes as a universal fallback',
      body: 'QR stickers keep the same machine-sync experience available across devices, lighting conditions, and member habits. Gyms can use both on the same machine.',
    },
    {
      title: 'Content and tracking in one destination',
      body: 'The tag does more than open a web page. It connects the machine to exercise instructions, trainer videos, logging, rest timing, and long-term workout history.',
    },
  ],
  compareEyebrow: 'NFC + QR',
  compareTitle: 'Most competitors stop at a printed QR.',
  compareLead:
    'LIFTAG treats NFC for tap-to-open speed and QR as the universal fallback, on the same machine. Gyms create both from the dashboard and buy the physical tags themselves.',
  compareMore: 'Full QR + NFC comparison',
  faqs: [
    {
      question: 'What should a gym put on each machine?',
      answer:
        'A combined NFC tag and QR sticker is the strongest setup: NFC for tap-to-open speed, QR for universal scan access, and both pointing to the same machine-specific Liftag flow.',
    },
    {
      question: 'Do NFC and QR tags help with member onboarding?',
      answer:
        'Yes. Tags reduce uncertainty at the machine by opening the correct exercise setup, variations, and gym-filmed instruction video directly from the equipment.',
    },
    {
      question: 'Do other gym QR platforms support NFC tags?',
      answer:
        'LIFTAG treats NFC and QR as the default: gyms create both from the dashboard and buy the physical tags themselves. Liftd supports NFC if the gym supplies tags. ScanLiftLog and RepTag are QR only.',
    },
    {
      question: 'Are NFC tags and QR codes free?',
      answer:
        'Creating and managing NFC tags and QR codes is free. Gym owners get the dashboard to set them up, and members get the full LIFTAG app. LIFTAG does not buy or ship the physical NFC tags or QR stickers. Gyms purchase those themselves.',
    },
  ],
}
export const sk: QrTagsContent = {
  title: 'NFC a QR štítky v posilňovni, ktoré otvoria <span class="lime">správny cvik.</span>',
  description:
    'LIFTAG spája NFC štítky a QR kódy na strojoch, takže cvičenci priložia telefón alebo naskenujú zariadenie a otvoria si videá nastavenia, detaily cviku aj zapisovanie tréningu.',
  seoTitle: 'NFC a QR štítky na stroje v posilňovni | LIFTAG',
  structuredName: 'NFC a QR štítky na stroje v posilňovni',
  breadcrumbName: 'NFC a QR štítky',
  articleHeadline: 'NFC a QR štítky, ktoré otvoria správny cvik',
  eyebrow: 'PREPOJENIE SO STROJOM',
  cta: 'Pozrieť skenovanie',
  metrics: [
    { value: 'DOTYK', label: 'NFC štítok' },
    { value: 'SKEN', label: 'QR kód' },
    { value: 'ZÁPIS', label: 'sledovanie sérií' },
  ],
  sections: [
    {
      title: 'NFC pre najrýchlejšiu interakciu',
      body: 'NFC štítok stačí priložiť k telefónu a okamžite otvorí príslušný postup v LIFTAG. Pri opakovanom používaní v posilňovni pôsobí prirodzene, rýchlo a zrozumiteľne.',
    },
    {
      title: 'QR kód ako univerzálna záloha',
      body: 'QR nálepka zachová rovnaké prepojenie so strojom na rôznych zariadeniach, pri rôznom svetle aj podľa zvyklostí členov. Posilňovňa môže mať obe možnosti na jednom stroji.',
    },
    {
      title: 'Obsah a zapisovanie na jednom mieste',
      body: 'Štítok neotvára iba webovú stránku. Prepojí stroj s návodom na cvik, videami trénerov, zapisovaním, časovačom pauzy a dlhodobou históriou tréningu.',
    },
  ],
  compareEyebrow: 'NFC + QR',
  compareTitle: 'Väčšina konkurencie končí pri vytlačenom QR kóde.',
  compareLead:
    'LIFTAG používa NFC pre rýchly dotyk a QR ako univerzálnu zálohu na tom istom stroji. Posilňovňa vytvorí obe možnosti v prehľade a fyzické štítky si kúpi sama.',
  compareMore: 'Kompletné porovnanie QR + NFC',
  faqs: [
    {
      question: 'Čo má byť na každom stroji v posilňovni?',
      answer:
        'Najlepšie funguje kombinácia NFC štítku a QR nálepky: NFC otvorí obsah dotykom, QR umožní skenovanie každým telefónom a oba odkazy vedú na rovnaký postup pre konkrétny stroj.',
    },
    {
      question: 'Pomáhajú NFC a QR štítky pri zaučení členov?',
      answer:
        'Áno. Štítok zníži neistotu pri stroji, pretože priamo otvorí správne nastavenie cviku, jeho varianty a video od trénera z danej posilňovne.',
    },
    {
      question: 'Podporujú NFC aj iné platformy pre QR v posilňovniach?',
      answer:
        'LIFTAG považuje NFC a QR za základ: posilňovňa vytvorí oba kódy v prehľade a fyzické štítky si kúpi sama. Liftd podporuje NFC, ak štítky dodá posilňovňa. ScanLiftLog a RepTag používajú iba QR.',
    },
    {
      question: 'Sú NFC štítky a QR kódy bezplatné?',
      answer:
        'Tvorba a správa NFC štítkov a QR kódov je bezplatná. Majitelia posilňovní dostanú prehľad na ich nastavenie a členovia plnú aplikáciu LIFTAG. LIFTAG fyzické NFC štítky ani QR nálepky nekupuje a neposiela. Posilňovne si ich kupujú samy.',
    },
  ],
}
