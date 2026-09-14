export interface LegalContent {
  seoTitle: string
  seoDescription: string
  breadcrumbName: string
  eyebrow: string
  titleHtml: string
  updatedLabel: string
  lastUpdated: string
  sections: { title: string; body: string }[]
  contactEmail: string
}

export const en: LegalContent = {
  seoTitle: 'Privacy Policy | LIFTAG',
  seoDescription:
    'How LIFTAG collects, uses, stores, and protects your personal data when you use the LIFTAG workout tracking app.',
  breadcrumbName: 'Privacy Policy',
  eyebrow: '▸ PRIVACY POLICY',
  titleHtml: 'Privacy <span class="lime">Policy.</span>',
  updatedLabel: 'Last updated:',
  lastUpdated: 'August 2026',
  sections: [
    {
      title: 'Introduction',
      body: 'Liftag is a fitness tracking application operated by LIFTAG. This Privacy Policy explains what personal data we collect, how we use it, and how you can exercise your rights.',
    },
    {
      title: 'Data We Collect',
      body: 'We may collect account data such as name, email, sign-in provider, date of birth, gender, preferred units, profile settings, and support messages; body metrics such as height and weight; workout data such as sessions, exercises, sets, reps, weights, duration, routines, plans, goals, progress, and trainer-sharing choices; uploads such as custom exercise media; approximate or precise location when you enable gym detection or map features; device, app, diagnostics, crash, and session replay data.',
    },
    {
      title: 'How We Use Your Data',
      body: 'We use your data to create and secure your account, provide workout tracking and QR/gym features, sync data across devices, show history and progress, support trainer and sharing features, process support requests, prevent abuse, troubleshoot crashes, improve app quality, and comply with legal obligations.',
    },
    {
      title: 'Data Storage & Security',
      body: 'Data is stored with service providers including Supabase and S3/AWS-style media storage. We use technical and organizational safeguards such as authenticated API access and encryption in transit, but no service can guarantee absolute security.',
    },
    {
      title: 'Third-Party Services',
      body: 'We use third-party services including Supabase for authentication, database, and storage; Google and Apple for sign-in; Meta/Facebook SDK for app ads attribution and campaign measurement; Sentry, including session replay, for diagnostics; Resend for email; Cloudflare Turnstile for abuse prevention; Strava if you connect it; YouTube/WebView for video content; maps/location providers for gym discovery; and S3/AWS-style storage for uploaded media.',
    },
    {
      title: 'AI-Assisted Features',
      body: 'Liftag offers optional AI-assisted features that generate workout routines and training plans. When you use them, the details you provide for a request, such as selected goals, target muscle groups, available equipment, difficulty, session length, and any free-text limitations or instructions you enter, are sent to AI providers acting as our sub-processors, currently OpenAI and Google Generative AI, which process them on our behalf to return a draft routine or plan. Free-text limitations may describe injuries or other health context, so please enter only what you are comfortable sharing. Generation requests and the drafts they produce are stored with your account for a limited period and then deleted. These features are optional and you can use Liftag without them.',
    },
    {
      title: 'Your Rights',
      body: 'Depending on where you live, you may have rights to access, correct, delete, export, restrict, or object to processing of your personal data, and to withdraw consent where processing is based on consent. You can request account deletion in the app or contact us.',
    },
    {
      title: 'Data Retention',
      body: 'We keep personal data for as long as needed to provide Liftag, maintain security, resolve disputes, comply with law, and preserve legitimate business records. When you delete your account, we delete or anonymize account data unless retention is required or permitted by law.',
    },
    {
      title: "Children's Privacy",
      body: 'Liftag is not intended for anyone under 16. We do not knowingly allow users under 16 to create accounts or use product features. If you are under 16, do not use Liftag.',
    },
    {
      title: 'Changes to This Policy',
      body: 'We may update this Privacy Policy from time to time. When changes are material, we may notify you in the app or ask you to accept the updated version before continuing to use product features.',
    },
    {
      title: 'Contact Us',
      body: 'If you have questions about this Privacy Policy or your personal data, please contact us at:',
    },
  ],
  contactEmail: 'support@liftag.fit',
}

export const sk = {
  seoTitle: 'Zásady ochrany osobných údajov | LIFTAG',
  seoDescription:
    'Ako LIFTAG zhromažďuje, používa, ukladá a chráni vaše osobné údaje pri používaní tréningovej aplikácie LIFTAG.',
  breadcrumbName: 'Ochrana osobných údajov',
  eyebrow: '▸ OCHRANA OSOBNÝCH ÚDAJOV',
  titleHtml: 'Ochrana osobných <span class="lime">údajov.</span>',
  updatedLabel: 'Posledná aktualizácia:',
  lastUpdated: 'august 2026',
  sections: [
    {
      title: 'Úvod',
      body: 'Liftag je aplikácia na sledovanie tréningov prevádzkovaná spoločnosťou LIFTAG. Tieto zásady vysvetľujú, aké osobné údaje zhromažďujeme, ako ich používame a ako môžete uplatniť svoje práva.',
    },
    {
      title: 'Údaje, ktoré zhromažďujeme',
      body: 'Môžeme zhromažďovať údaje o účte, ako meno, email, poskytovateľ prihlásenia, dátum narodenia, pohlavie, preferované jednotky, nastavenia profilu a správy podpore; telesné údaje, ako výška a hmotnosť; tréningové údaje, ako relácie, cviky, série, opakovania, váhy, trvanie, rutiny, plány, ciele, pokrok a nastavenia zdieľania s trénerom; nahraný obsah, napríklad médiá vlastných cvikov; približnú alebo presnú polohu, ak povolíte detekciu posilňovne alebo mapové funkcie; a údaje o zariadení, aplikácii, diagnostike, pádoch a session replay.',
    },
    {
      title: 'Ako používame vaše údaje',
      body: 'Vaše údaje používame na vytvorenie a zabezpečenie účtu, poskytovanie sledovania tréningov a QR/gym funkcií, synchronizáciu medzi zariadeniami, zobrazovanie histórie a pokroku, podporu trénerov a zdieľania, vybavenie podpory, prevenciu zneužitia, riešenie pádov, zlepšovanie kvality aplikácie a splnenie právnych povinností.',
    },
    {
      title: 'Ukladanie a bezpečnosť údajov',
      body: 'Údaje sú uložené u poskytovateľov služieb vrátane Supabase a S3/AWS úložiska médií. Používame technické a organizačné opatrenia, napríklad autentifikovaný prístup k API a šifrovanie pri prenose, no žiadna služba nevie zaručiť absolútnu bezpečnosť.',
    },
    {
      title: 'Služby tretích strán',
      body: 'Používame služby tretích strán vrátane Supabase na autentifikáciu, databázu a úložisko; Google a Apple na prihlásenie; Meta/Facebook SDK na atribúciu reklám v aplikácii a meranie kampaní; Sentry vrátane session replay na diagnostiku; Resend na email; Cloudflare Turnstile na prevenciu zneužitia; Strava, ak ju pripojíte; YouTube/WebView na video obsah; mapové a lokalizačné služby na vyhľadávanie posilňovní; a S3/AWS úložisko na nahrané médiá.',
    },
    {
      title: 'Funkcie s umelou inteligenciou',
      body: 'Liftag ponúka voliteľné funkcie s umelou inteligenciou, ktoré generujú tréningové rutiny a plány. Keď ich použijete, údaje, ktoré pre požiadavku zadáte, napríklad vybrané ciele, cieľové svalové partie, dostupné vybavenie, náročnosť, dĺžku tréningu a voľný text s obmedzeniami alebo pokynmi, odosielame poskytovateľom umelej inteligencie, ktorí pre nás vystupujú ako sprostredkovatelia, aktuálne OpenAI a Google Generative AI. Tí ich spracúvajú v našom mene a vrátia návrh rutiny alebo plánu. Voľný text s obmedzeniami môže opisovať zranenia alebo iný zdravotný kontext, preto uvádzajte len to, čo ste ochotní odoslať. Požiadavky na generovanie a návrhy, ktoré z nich vzniknú, uchovávame pri vašom účte obmedzený čas a potom ich vymažeme. Tieto funkcie sú voliteľné a Liftag môžete používať aj bez nich.',
    },
    {
      title: 'Vaše práva',
      body: 'Podľa miesta, kde žijete, môžete mať právo na prístup, opravu, vymazanie, export, obmedzenie alebo namietanie voči spracúvaniu osobných údajov a právo odvolať súhlas, ak je spracúvanie založené na súhlase. O vymazanie účtu môžete požiadať v aplikácii alebo nás kontaktovať.',
    },
    {
      title: 'Uchovávanie údajov',
      body: 'Osobné údaje uchovávame tak dlho, ako je potrebné na poskytovanie Liftag, bezpečnosť, riešenie sporov, splnenie zákona a uchovanie oprávnených obchodných záznamov. Po vymazaní účtu údaje vymažeme alebo anonymizujeme, ak ich uchovanie nevyžaduje alebo nepovoľuje zákon.',
    },
    {
      title: 'Ochrana súkromia detí',
      body: 'Liftag nie je určený pre osoby mladšie ako 16 rokov. Vedome neumožňujeme používateľom mladším ako 16 rokov vytvoriť účet alebo používať produktové funkcie. Ak máte menej ako 16 rokov, Liftag nepoužívajte.',
    },
    {
      title: 'Zmeny týchto zásad',
      body: 'Tieto zásady môžeme z času na čas aktualizovať. Pri podstatných zmenách vás môžeme informovať v aplikácii alebo požiadať o prijatie aktualizovanej verzie pred ďalším používaním produktových funkcií.',
    },
    {
      title: 'Kontaktujte nás',
      body: 'Ak máte otázky ohľadom týchto zásad ochrany osobných údajov alebo vašich osobných údajov, kontaktujte nás na:',
    },
  ],
  contactEmail: 'support@liftag.fit',
} satisfies LegalContent
