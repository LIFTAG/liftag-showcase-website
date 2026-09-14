import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'seated-dumbbell-shoulder-press',
  metaDescription:
    'Tlak s jednoručkami v sede: sklon lavičky, dostať jednoručky k ramenám a zapisovať tlak nad hlavou ako samostatný cvik v LIFTAGu.',
  steps: [
    'Nastav lavičku o jeden otvor pred úplne zvislou polohou. Zafixovaný operák v 90° spolu s výrazným mostíkom je len standing press vykonaný posediačky.',
    'Sadni si s jednoručkami na stehnách a vykopni ich k ramenám — pri veľkej váhe si ich nechaj podať. Začni s koncami pri ušiach a kĺbmi smerujúcimi k stropu.',
    'Lakte drž mierne pred trupom, nie vytočené do strán do tvaru T. Tlač jednoručky nad temeno, blízko pri sebe, ale bez nárazu.',
    'Spúšťaj ich približne do výšky uší. Hlbšie natiahnutie je v poriadku, ak to rameno dovolí; zhadzovať jednoručky na deltové svaly pri každom opakovaní nie je.',
  ],
  mistakes: [
    {
      title: 'Narážanie jednoručiek hore',
      body: 'Toto tlesknutie je metronóm, nie lockout. Dokonči pohyb nad hlavou s malou tichou medzerou. Ak sa stretnú iba preto, že si pokrčil ramená, váha je priveľká.',
    },
    {
      title: 'Nechanie jednoručiek odplávať do predpaženia',
      body: 'Posledné opakovania sa rady posúvajú dopredu. Dráhu drž blízko pri ušiach. Ak to nedokážeš, zníž váhu skôr, než z cviku vytvoríš iný pohyb.',
    },
    {
      title: 'Zapisovanie ako standing barbell overhead press',
      body: 'Iné náradie znamená iný rekord. Použi tento cvik. Poznač si otvor lavičky, ak „zvislá“ lavička v tvojej posilňovni v skutočnosti zvislá nie je.',
    },
    {
      title: 'Vykopávanie 40-kilových jednoručiek so zalomeným zápästím',
      body: 'Nechaj si ich podať alebo začni prvé opakovanie z kľaku. Zlomené zápästie pri vykopnutí je spoľahlivý spôsob, ako sériu ukončiť predčasne.',
    },
  ],
  variations: [
    {
      slug: 'seated-arnold-press',
      name: 'Seated Arnold press',
      note: 'Pridáva rotáciu a dlhší rozsah. Rovnaké sedadlo, iný záznam.',
    },
    {
      slug: 'standing-barbell-overhead-press',
      name: 'Standing barbell overhead press',
      note: 'Väčšia záťaž, viac práce trupu, jedna tyč.',
    },
    {
      slug: 'machine-shoulder-press',
      name: 'Machine shoulder press',
      note: 'Keď chceš rovnaký vzor bez odhadzovania jednoručky na podlahu.',
    },
    {
      slug: 'landmine-press',
      name: 'Landmine press',
      note: 'Jednoručne, v dráhe približne 45°, pre mnohé ramená príjemnejšia koncová poloha.',
    },
  ],
  progressions: [
    'Ľahké jednoručky, ktoré dostaneš k ramenám bez švihu alebo pomoci spottera.',
    'Pauzované opakovania pri ušiach, kým obe ruky nedokončia pohyb naraz.',
    'Vybuduj 6–10 čistých opakovaní, až potom skúšaj ťažké trojky s jednoručkami, ktoré nedokážeš vykopnúť.',
    'Arnold press alebo landmine press, ak jedna poloha dráždi rameno, no stále chceš tlak nad hlavou.',
  ],
  programming:
    'Tlak s jednoručkami nad hlavou je zvyčajne hypertrofický cvik, nie test 1RM. Rob 3–4 série po 6–10 opakovaní. Zapisuj skutočnú hmotnosť jednej jednoručky, nie súčet páru, a používaj ju konzistentne, aby graf niečo znamenal. Odpočívaj tak dlho, aby druhá ruka nezaostala o tri opakovania — na to slúži časovač.',
  equipmentAlternatives: [
    {
      slug: 'machine-shoulder-press',
      name: 'Machine shoulder press',
      note: 'Použi ho, keď sú jednoručky príliš ťažké na vykopnutie alebo trénuješ sám.',
    },
    {
      slug: 'standing-barbell-overhead-press',
      name: 'Standing barbell overhead press',
      note: 'Vymeň cvik, keď chceš jednu záťaž a prísnejšie porovnanie rekordu.',
    },
  ],
  faqs: [
    {
      question: 'Má byť lavička úplne zvislá?',
      answer:
        'Zvyčajne nie. Mierny záklon udrží kríže na operáku a zabráni jednoručkám utekať dopredu. Ak je lavička tak sklopená, že už robíš incline dumbbell press, posuň ju o otvor vyššie alebo zapíš tento cvik ako samostatný záznam.',
    },
  ],
  relatedSlugs: [
    'seated-arnold-press',
    'standing-barbell-overhead-press',
    'machine-shoulder-press',
    'cable-lateral-raise',
    'incline-dumbbell-press',
  ],
} satisfies ExerciseOverlay
