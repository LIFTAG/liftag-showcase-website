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
  lastUpdated: 'September 2026',
  sections: [
    {
      title: 'Introduction',
      body: 'Liftag is a fitness tracking application. Its operator and the controller of your personal data is Adam Prisenžňák, a sole trader registered in the Czech Republic, identification number (IČO) 23848944, with registered office at Kurkova 1212/2, 182 00 Praha 8 – Kobylisy, Czech Republic. Registered in the Czech Trade Licensing Register; competent trade licensing authority: Úřad městské části Praha 8. Phone: +420 725 825 340. Email: support@liftag.fit.\n\nThis Privacy Policy explains what personal data we collect, how we use it, and how you can exercise your rights.',
    },
    {
      title: 'Data We Collect',
      body: 'We may collect account data such as name, email, sign-in provider, date of birth, sex, preferred units, profile settings, and support messages; body metrics such as height and weight, including weight measurements and workout heart-rate summaries you choose to import from Apple Health or Health Connect; workout data such as sessions, exercises, sets, reps, weights, duration, routines, plans, goals, progress, and trainer-sharing choices; workout history you import from files exported by other apps, including the workout details, notes, and original labels in those files; uploads such as custom exercise media; the goals, preferences, and free-text limitations, instructions, or refinement requests you enter when you ask for an AI-generated routine or plan, and any feedback you leave on the result; approximate or precise location when you enable gym detection or map features; device, app, diagnostics, crash, session replay, app event, ad attribution, and advertising identifier data when permitted by your device settings.',
    },
    {
      title: 'How We Use Your Data and Legal Bases',
      body: 'We use your data to create and secure your account, provide workout tracking and QR/gym features, sync data across devices, show history and progress, import workout history you bring from other apps, support trainer and sharing features, generate AI-assisted routine and plan suggestions when you request them, process support requests, prevent abuse, troubleshoot crashes, measure app installs and registrations from our ads, improve app quality, and comply with legal obligations.\n\nFor ordinary account and workout data needed to provide the features you request, including imports and sharing, our legal basis is performance of our contract with you (GDPR Article 6(1)(b)). We rely on our legitimate interests in securing the service, preventing abuse, recognizing duplicate imports, and preventing deleted workouts from being restored by offline devices for the necessary technical records (Article 6(1)(f)). You can object to processing based on those interests. Where a legal obligation requires us to process or retain data, Article 6(1)(c) applies. These Article 6 bases do not by themselves authorize processing of special-category data such as health information.',
    },
    {
      title: 'Data Storage & Security',
      body: 'Data is stored with service providers including Supabase and S3/AWS-style media storage. We use technical and organizational safeguards such as authenticated API access and encryption in transit, but no service can guarantee absolute security.',
    },
    {
      title: 'Third-Party Services',
      body: 'We use third-party services including Supabase for authentication, database, and storage; Google and Apple for sign-in; Meta/Facebook SDK and TikTok Business SDK for app ads attribution and campaign measurement; Sentry, including session replay, for diagnostics; Resend for email; Cloudflare Turnstile for abuse prevention; OpenAI, Anthropic, and Google Generative AI for AI-assisted routine and plan generation and its quality evaluation; Apple Health (HealthKit) and Android Health Connect if you enable health sync; Strava if you connect it; YouTube/WebView for video content; maps/location providers for gym discovery; and S3/AWS-style storage for uploaded media.',
    },
    {
      title: 'Apple Health & Health Connect',
      body: 'Health sync is optional and off by default. If you turn it on, Liftag writes your completed workouts logged in Liftag (including active calories estimated from your exercises, workout duration, and your profile details) and your body weight entries to Apple Health or Health Connect, and can read body weight measurements and, after each workout, the heart rate recorded during that workout from these platforms if you grant those permissions. Workouts imported from files are not written to Apple Health or Health Connect. Imported body weight and workout heart-rate summaries are stored with your Liftag account so we can show them in your history and progress and refine your workout calorie estimates. We handle this data according to Apple and Google platform rules. We never use data obtained from Apple Health or Health Connect for advertising or marketing, and we never share it with third parties. You can turn health sync off in the app or revoke permissions in your device\'s health settings at any time.',
    },
    {
      title: 'Importing From Other Apps',
      body: 'Importing workout history is optional and runs only when you start it. The export file you choose is uploaded to private storage and analyzed on our server to prepare a draft for you to review. Import analysis and exercise matching do not send the file to AI providers. The file can contain workout titles, dates, exercises, sets, weights, reps, durations, distances, RPE, and notes. Notes, titles, and exercise names can reveal health information, such as an injury, so check the file before uploading it.\n\nImported workouts become part of your Liftag history. A trainer you connect can see them, including notes and original details, while coaching is active. People you add under Share Workout Data can see the same details. These sharing rules concern file imports; the separate rules for data obtained from Apple Health or Health Connect are described above. We do not use imported workouts or notes for advertising. We do not write imported workouts to Apple Health or Health Connect or send them to Strava.\n\nWe delete the uploaded file after successful analysis. Imports still awaiting upload or whose analysis failed become eligible for expiry 24 hours after they started, once the upload link and an additional 30 minutes for an upload already in progress have expired. Expiry cleanup deletes their uploaded files. Unfinished drafts and imports expire 7 days after the import started, including a confirmed import that has not finished saving. Workouts already saved remain in your history. Deletion runs in background cleanup, and failed deletions are retried, so the expiry time is not a guarantee that every copy disappears at that instant.\n\nDraft workout data is removed when the import completes, is cancelled, or expires. Saved workouts, including their original details, remain until you delete them or your account. Original exercise notes can remain in those details even after you edit the visible note, and can appear in history exports and shared workout views. Routines you create from an import can also contain copies of exercise notes. Deleting a workout does not delete those routines or private exercises; edit or delete them separately, or contact us about erasure.\n\nUndo removes imported workouts you have not edited. It keeps edited workouts, routines you chose to create, private exercises, and confirmed exercise matches. The Data Retention section explains the technical import records that remain. Account deletion also covers imported workouts, including those you edited, and the associated import records.',
    },
    {
      title: 'AI-Assisted Features',
      body: 'Generating a routine or plan with AI is optional and runs only when you start it. When you use it, we send the inputs for that request to third-party AI providers acting as our processors: your selected goals, target muscle groups, difficulty, session length, days per week and plan length, equipment preference, the gym you selected together with the exercises and equipment available there, and any free-text limitations, instructions, or refinement requests you write. The request may also include related account context used to tailor the result, such as profile details and recent workout data. We may send the generated draft, together with any rating or comment you leave on it, for automated quality evaluation. The AI providers we currently use are OpenAI, Anthropic, and Google. They process this data on our behalf and may do so outside your country, including in the United States. Free-text fields can contain health information, for example an injury or condition you describe, so please include only what you want processed this way. Generated routines and plans are suggestions, not medical or professional fitness advice. You review each draft and decide whether to save or discard it, and these features make no decision that produces a legal or similarly significant effect on you. Drafts are stored with your Liftag account until you accept or discard them.',
    },
    {
      title: 'Your Rights',
      body: 'Under the GDPR, you have rights, subject to its conditions, to access, correct, erase, receive a portable copy of, and restrict processing of your personal data. You can object to processing based on legitimate interests. Where processing is based on consent, you can withdraw it at any time without affecting the lawfulness of processing before withdrawal. Contact support@liftag.fit to exercise these rights, including to request removal of specific notes, original import details, or copies in routines; you do not have to request deletion of your entire account to make such a request. Account deletion is also available in the app and covers imported workouts, including ones you edited afterwards.\n\nYou can lodge a complaint with the Czech Office for Personal Data Protection (Úřad pro ochranu osobních údajů, https://uoou.gov.cz), or with a supervisory authority in the EU member state of your habitual residence, place of work, or the alleged infringement. Other rights may apply under the law where you live.',
    },
    {
      title: 'Data Retention',
      body: 'We keep personal data for as long as necessary for the purposes described in this policy. Account and saved workout data normally remain while your account exists, unless you delete them earlier. We may retain limited data where necessary to meet a legal obligation or establish, exercise, or defend legal claims. When you delete your account, we delete or anonymize account data except where a justified legal retention requirement applies.\n\nFor imports, we keep a technical fingerprint while the imported workout exists to recognize duplicates. When you delete that workout, we remove its import payload and fingerprint and keep a minimal deletion record containing its session identifier to prevent an offline device from restoring it. That record has no workout contents but remains linked to your account until account deletion. We also retain import history records, such as source app, counts, dates, and records of routines created, and the exercise matches you confirmed, including original exercise names. These records normally remain with your account and are not all removed by undo or workout deletion. They are personal data, and you can contact us to exercise your rights concerning them.',
    },
    {
      title: 'Children\'s Privacy',
      body: 'Liftag is not intended for anyone under 16. We do not knowingly allow users under 16 to create accounts or use product features. If you are under 16, do not use Liftag.',
    },
    {
      title: 'Changes to This Policy',
      body: 'We may update this Privacy Policy. We will bring material changes to your attention through an in-app notice or email, with advance notice where required. Updating this policy or accepting the Terms does not itself provide consent for processing that requires a separate consent.',
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
  lastUpdated: 'september 2026',
  sections: [
    {
      title: 'Úvod',
      body: 'Liftag je aplikácia na sledovanie tréningov. Jej prevádzkovateľom a prevádzkovateľom vašich osobných údajov je Adam Prisenžňák, živnostník registrovaný v Českej republike, IČO 23848944, so sídlom Kurkova 1212/2, 182 00 Praha 8 – Kobylisy, Česká republika. Zapísaný v českom živnostenskom registri; príslušný živnostenský úrad: Úřad městské části Praha 8. Telefón: +420 725 825 340. Email: support@liftag.fit.\n\nTieto zásady vysvetľujú, aké osobné údaje zhromažďujeme, ako ich používame a ako môžete uplatniť svoje práva.',
    },
    {
      title: 'Údaje, ktoré zhromažďujeme',
      body: 'Môžeme zhromažďovať údaje o účte, ako meno, email, poskytovateľ prihlásenia, dátum narodenia, pohlavie, preferované jednotky, nastavenia profilu a správy podpore; telesné údaje, ako výška a hmotnosť, vrátane meraní hmotnosti a súhrnov srdcovej frekvencie z tréningov, ktoré sa rozhodnete importovať z Apple Health alebo Health Connect; tréningové údaje, ako relácie, cviky, série, opakovania, váhy, trvanie, rutiny, plány, ciele, pokrok a nastavenia zdieľania s trénerom; históriu tréningov, ktorú importujete zo súborov exportovaných z iných aplikácií, vrátane podrobností o tréningoch, poznámok a pôvodných označení v týchto súboroch; nahraný obsah, napríklad médiá vlastných cvikov; ciele, preferencie a voľne písané obmedzenia, pokyny alebo požiadavky na úpravu, ktoré zadáte pri žiadosti o rutinu alebo plán vygenerovaný umelou inteligenciou, a spätnú väzbu, ktorú k výsledku pridáte; približnú alebo presnú polohu, ak povolíte detekciu posilňovne alebo mapové funkcie; a údaje o zariadení, aplikácii, diagnostike, pádoch, session replay, udalostiach aplikácie, atribúcii reklám a reklamnom identifikátore, ak to povolia nastavenia vášho zariadenia.',
    },
    {
      title: 'Ako používame vaše údaje a právne základy',
      body: 'Vaše údaje používame na vytvorenie a zabezpečenie účtu, poskytovanie sledovania tréningov a QR/gym funkcií, synchronizáciu medzi zariadeniami, zobrazovanie histórie a pokroku, import histórie tréningov z iných aplikácií, podporu trénerov a zdieľania, generovanie návrhov rutín a plánov pomocou umelej inteligencie, keď o ne požiadate, vybavenie podpory, prevenciu zneužitia, riešenie pádov, meranie inštalácií aplikácie a registrácií z našich reklám, zlepšovanie kvality aplikácie a splnenie právnych povinností.\n\nPri bežných údajoch o účte a tréningoch potrebných na poskytovanie funkcií, o ktoré požiadate, vrátane importov a zdieľania, je právnym základom plnenie našej zmluvy s vami (článok 6 ods. 1 písm. b) GDPR). Pri nevyhnutných technických záznamoch sa opierame o naše oprávnené záujmy na zabezpečení služby, prevencii zneužitia, rozpoznávaní duplicitných importov a zabránení obnoveniu vymazaných tréningov z offline zariadení (článok 6 ods. 1 písm. f)). Proti spracúvaniu na základe týchto záujmov môžete namietať. Ak nám právna povinnosť ukladá spracúvať alebo uchovávať údaje, uplatňuje sa článok 6 ods. 1 písm. c). Tieto právne základy podľa článku 6 samy osebe neoprávňujú na spracúvanie osobitných kategórií údajov, napríklad údajov o zdraví.',
    },
    {
      title: 'Ukladanie a bezpečnosť údajov',
      body: 'Údaje sú uložené u poskytovateľov služieb vrátane Supabase a S3/AWS úložiska médií. Používame technické a organizačné opatrenia, napríklad autentifikovaný prístup k API a šifrovanie pri prenose, no žiadna služba nevie zaručiť absolútnu bezpečnosť.',
    },
    {
      title: 'Služby tretích strán',
      body: 'Používame služby tretích strán vrátane Supabase na autentifikáciu, databázu a úložisko; Google a Apple na prihlásenie; Meta/Facebook SDK a TikTok Business SDK na atribúciu reklám aplikácie a meranie kampaní; Sentry vrátane session replay na diagnostiku; Resend na email; Cloudflare Turnstile na prevenciu zneužitia; OpenAI, Anthropic a Google Generative AI na generovanie rutín a plánov pomocou umelej inteligencie a na vyhodnotenie ich kvality; Apple Health (HealthKit) a Android Health Connect, ak zapnete synchronizáciu zdravia; Strava, ak ju pripojíte; YouTube/WebView na video obsah; mapové a lokalizačné služby na vyhľadávanie posilňovní; a S3/AWS úložisko na nahrané médiá.',
    },
    {
      title: 'Apple Health a Health Connect',
      body: 'Synchronizácia zdravia je voliteľná a predvolene vypnutá. Ak ju zapnete, Liftag zapisuje vaše dokončené tréningy zaznamenané v Liftag (vrátane aktívnych kalórií odhadnutých z vašich cvikov, trvania tréningu a údajov vo vašom profile) a záznamy telesnej hmotnosti do Apple Health alebo Health Connect a môže z týchto platforiem čítať merania hmotnosti a po každom tréningu aj srdcovú frekvenciu zaznamenanú počas daného tréningu, ak tieto povolenia udelíte. Tréningy importované zo súborov nezapisujeme do Apple Health ani Health Connect. Importovanú telesnú hmotnosť a súhrny srdcovej frekvencie z tréningov ukladáme k vášmu účtu Liftag, aby sme vám ich mohli zobraziť v histórii a pokroku a spresniť odhady kalórií vašich tréningov. S týmito údajmi zaobchádzame podľa pravidiel platforiem Apple a Google. Údaje získané z Apple Health alebo Health Connect nikdy nepoužívame na reklamu ani marketing a nikdy ich nezdieľame s tretími stranami. Synchronizáciu zdravia môžete kedykoľvek vypnúť v aplikácii alebo odvolať povolenia v nastaveniach zdravia vášho zariadenia.',
    },
    {
      title: 'Import z iných aplikácií',
      body: 'Import histórie tréningov je voliteľný a spustí sa iba vtedy, keď ho sami začnete. Exportovaný súbor, ktorý vyberiete, nahráme do súkromného úložiska a analyzujeme na našom serveri, aby sme vám pripravili návrh na kontrolu. Pri analýze importu a priraďovaní cvikov súbor neposielame poskytovateľom umelej inteligencie. Súbor môže obsahovať názvy tréningov, dátumy, cviky, série, váhy, opakovania, trvanie, vzdialenosti, RPE a poznámky. Poznámky, názvy tréningov a názvy cvikov môžu odhaľovať údaje o zdraví, napríklad zranenie, preto si súbor pred nahraním skontrolujte.\n\nImportované tréningy sa stanú súčasťou vašej histórie v Liftag. Tréner, s ktorým sa spojíte, ich vidí vrátane poznámok a pôvodných podrobností počas aktívnej spolupráce. Rovnaké podrobnosti vidia osoby, ktoré pridáte v časti Zdieľať tréningové dáta. Tieto pravidlá zdieľania sa týkajú importov zo súborov; osobitné pravidlá pre údaje získané z Apple Health alebo Health Connect sú uvedené vyššie. Importované tréningy ani poznámky nepoužívame na reklamu. Importované tréningy nezapisujeme do Apple Health ani Health Connect a neposielame ich do Strava.\n\nNahraný súbor vymažeme po úspešnej analýze. Importy, ktoré stále čakajú na nahranie súboru alebo ktorých analýza zlyhala, môžu vypršať 24 hodín po ich začatí, keď už vypršal odkaz na nahrávanie aj dodatočná 30-minútová lehota na dokončenie prebiehajúceho nahrávania. Pri odstraňovaní vypršaných importov vymažeme ich nahrané súbory. Nedokončené návrhy a importy vypršia 7 dní po začatí importu, vrátane potvrdeného importu, ktorého ukladanie sa ešte neskončilo. Už uložené tréningy zostanú vo vašej histórii. Odstraňovanie prebieha na pozadí a neúspešné vymazanie opakujeme, preto čas vypršania nie je zárukou, že v danom okamihu zmizne každá kópia.\n\nÚdaje návrhu tréningov odstránime po dokončení, zrušení alebo vypršaní importu. Uložené tréningy vrátane pôvodných podrobností zostávajú, kým ich nevymažete alebo kým nevymažete účet. Pôvodné poznámky k cvikom môžu zostať v týchto podrobnostiach aj po úprave viditeľnej poznámky a môžu sa objaviť v exportoch histórie a zdieľaných zobrazeniach tréningu. Rutiny, ktoré vytvoríte z importu, môžu tiež obsahovať kópie poznámok k cvikom. Vymazanie tréningu nevymaže tieto rutiny ani súkromné cviky; upravte alebo vymažte ich samostatne, prípadne nás kontaktujte so žiadosťou o vymazanie údajov.\n\nVrátenie importu odstráni importované tréningy, ktoré ste neupravili. Ponechá upravené tréningy, rutiny, ktoré ste sa rozhodli vytvoriť, súkromné cviky a potvrdené priradenia cvikov. Časť Uchovávanie údajov vysvetľuje, ktoré technické záznamy o importe zostávajú. Vymazanie účtu sa vzťahuje aj na importované tréningy vrátane tých, ktoré ste upravili, a na súvisiace záznamy o importe.',
    },
    {
      title: 'Funkcie s umelou inteligenciou',
      body: 'Generovanie tréningovej rutiny alebo plánu pomocou umelej inteligencie je voliteľné a spustí sa iba vtedy, keď ho sami vyvoláte. Keď ho použijete, odosielame vstupy danej požiadavky poskytovateľom umelej inteligencie, ktorí pre nás vystupujú ako sprostredkovatelia: vybrané ciele, cieľové svalové partie, náročnosť, dĺžku tréningu, počet dní v týždni a dĺžku plánu, preferenciu vybavenia, vybranú posilňovňu spolu s cvikmi a vybavením, ktoré sú v nej dostupné, a akékoľvek voľne písané obmedzenia, pokyny alebo požiadavky na úpravu, ktoré napíšete. Požiadavka môže obsahovať aj súvisiaci kontext účtu použitý na prispôsobenie výsledku, napríklad údaje profilu a nedávne tréningové údaje. Vygenerovaný návrh spolu s hodnotením alebo komentárom, ktorý k nemu pridáte, môžeme odoslať na automatické vyhodnotenie kvality. Poskytovatelia umelej inteligencie, ktorých aktuálne používame, sú OpenAI, Anthropic a Google. Títo poskytovatelia spracúvajú tieto údaje v našom mene a môžu ich spracúvať aj mimo vašej krajiny, vrátane Spojených štátov. Voľne písané polia môžu obsahovať údaje o zdraví, napríklad opis zranenia alebo zdravotného stavu, preto uvádzajte len to, čo chcete takto spracovať. Vygenerované rutiny a plány sú návrhy, nie lekárska ani odborná tréningová rada. Každý návrh si skontrolujete a rozhodnete sa, či ho uložíte alebo zahodíte, a tieto funkcie nerobia žiadne rozhodnutie s právnym alebo podobne významným účinkom na vás. Návrhy sú uložené k vášmu účtu Liftag, kým ich neprijmete alebo nezahodíte.',
    },
    {
      title: 'Vaše práva',
      body: 'Podľa GDPR máte za podmienok, ktoré stanovuje, právo na prístup k svojim osobným údajom, ich opravu, vymazanie, získanie prenosnej kópie a obmedzenie spracúvania. Môžete namietať proti spracúvaniu na základe oprávnených záujmov. Ak je spracúvanie založené na súhlase, môžete ho kedykoľvek odvolať bez vplyvu na zákonnosť spracúvania pred odvolaním. Tieto práva môžete uplatniť na support@liftag.fit vrátane žiadosti o odstránenie konkrétnych poznámok, pôvodných podrobností importu alebo kópií v rutinách; kvôli takejto žiadosti nemusíte žiadať o vymazanie celého účtu. O vymazanie účtu môžete požiadať aj v aplikácii a vzťahuje sa aj na importované tréningy vrátane tých, ktoré ste neskôr upravili.\n\nSťažnosť môžete podať na český Úřad pro ochranu osobních údajů (https://uoou.gov.cz) alebo na dozorný orgán v členskom štáte EÚ, v ktorom máte obvyklý pobyt, pracujete alebo v ktorom došlo k údajnému porušeniu. Ďalšie práva vám môžu vyplývať z právnych predpisov platných tam, kde žijete.',
    },
    {
      title: 'Uchovávanie údajov',
      body: 'Osobné údaje uchovávame tak dlho, ako je potrebné na účely opísané v týchto zásadách. Údaje o účte a uložených tréningoch spravidla zostávajú, kým existuje váš účet, pokiaľ ich nevymažete skôr. Obmedzený rozsah údajov môžeme uchovať, ak je to potrebné na splnenie právnej povinnosti alebo na preukazovanie, uplatňovanie či obhajovanie právnych nárokov. Po vymazaní účtu údaje vymažeme alebo anonymizujeme, okrem prípadov, keď sa uplatňuje odôvodnená zákonná požiadavka na ich uchovanie.\n\nPri importoch uchovávame technický odtlačok, kým importovaný tréning existuje, aby sme rozpoznali duplicity. Keď tréning vymažete, odstránime jeho údaje z importu aj odtlačok a ponecháme minimálny záznam o vymazaní s identifikátorom tréningu, aby ho offline zariadenie znova neobnovilo. Tento záznam neobsahuje obsah tréningu, ale zostáva prepojený s vaším účtom až do vymazania účtu. Uchovávame aj záznamy o histórii importov, napríklad zdrojovú aplikáciu, počty, dátumy a záznamy o vytvorených rutinách, a vami potvrdené priradenia cvikov vrátane pôvodných názvov cvikov. Tieto záznamy spravidla zostávajú pri vašom účte a vrátenie importu ani vymazanie tréningu ich neodstráni všetky. Ide o osobné údaje a môžete nás kontaktovať, aby ste si k nim uplatnili svoje práva.',
    },
    {
      title: 'Ochrana súkromia detí',
      body: 'Liftag nie je určený pre osoby mladšie ako 16 rokov. Vedome neumožňujeme používateľom mladším ako 16 rokov vytvoriť účet alebo používať produktové funkcie. Ak máte menej ako 16 rokov, Liftag nepoužívajte.',
    },
    {
      title: 'Zmeny týchto zásad',
      body: 'Tieto zásady môžeme aktualizovať. Na podstatné zmeny vás upozorníme v aplikácii alebo emailom, a ak sa to vyžaduje, vopred. Samotná aktualizácia týchto zásad ani prijatie obchodných podmienok nepredstavuje súhlas so spracúvaním, ktoré vyžaduje osobitný súhlas.',
    },
    {
      title: 'Kontaktujte nás',
      body: 'Ak máte otázky ohľadom týchto zásad ochrany osobných údajov alebo vašich osobných údajov, kontaktujte nás na:',
    },
  ],
  contactEmail: 'support@liftag.fit',
} satisfies LegalContent
