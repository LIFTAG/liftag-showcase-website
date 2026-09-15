import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'barbell-push-press',
  metaDescription:
    'Push press s veľkou činkou: krátky ponor, silný odraz a oddelenie týchto čísel od grafu striktného tlaku nad hlavou v LIFTAGu.',
  steps: [
    'Priprav sa ako na tlak nad hlavou v stoji: činka leží na predných deltách, úchop je tesne za ramenami, zadok zatni a rebrá stiahni.',
    'Ponori sa o 2–4 palce. Kolená idú dopredu, trup zostáva zvislý. Ak boky vystrelia dozadu, robíš dobré ráno s činkou na ramenách.',
    'Zatlač nohami do podlahy, aby sa činka odlepila od ramien, a potom rukami dokonči vystretie. Netlač, kým ešte klesáš.',
    'Dokonči s hlavou medzi pažami a činkou nad stredom chodidiel. Spusť ju na delty alebo zachyť ponorom a pred ďalším opakovaním obnov dych.',
    'Chodidlá zostávajú pevne na mieste. Nie je to jerk, split ani drep: nohy začnú pohyb a paže ho dokončia.',
  ],
  mistakes: [
    {
      title: 'Tlak počas ponoru',
      body: 'Ponor zaťaží nohy. Ak už rukami tlačíš, odoberieš nohám odraz a činka sa zastaví pri čele. Ponor, odraz, potom tlak.',
    },
    {
      title: 'Zapisovanie push pressu ako striktného tlaku',
      body: 'Do týždňa si vytvoríš falošný striktný rekord. Použi tento cvik v katalógu a slovo „striktný“ uveď iba vtedy, keď si cvik skutočne zmenil.',
    },
    {
      title: 'Ponor do hĺbky drepu',
      body: 'Dlhý ponor nakloní trup dopredu a premrhá pružný odraz. Ponor má byť krátky a zvislý, skôr štvrtina drepu než front squat.',
    },
    {
      title: 'Skrátené vystretie, lebo nohy už odviedli prácu',
      body: 'Cieľom je stále vystretie nad hlavou. Hore sa postav vzpriamene; polovičný tlak s odrazom je iba pokrčenie ramien v ponore.',
    },
  ],
  variations: [
    {
      slug: 'standing-barbell-overhead-press',
      name: 'Tlaky s veľkou činkou nad hlavou v stoji',
      note: 'Bez ponoru; striktná verzia, ktorú týmto cvikom preťažuješ.',
    },
    {
      slug: 'landmine-press',
      name: 'Landmine tlak',
      note: 'Pohon jednou rukou, keď vystretie osi nad hlavou nie je cieľ.',
    },
    {
      slug: 'seated-dumbbell-shoulder-press',
      name: 'Tlaky s jednoručkami nad hlavou v sede',
      note: 'Nohy vynechaj, keď chceš striktnú prácu ramien.',
    },
    {
      slug: 'machine-shoulder-press',
      name: 'Tlak na ramená na stroji',
      note: 'Objem bez ponoru a bez odhodenia osi.',
    },
  ],
  progressions: [
    'Najprv zvládni striktný tlak v stoji s rovnakým úchopom a nastavením.',
    'Ľahký push press s dôrazom na zvislý ponor a plávajúcu činku, nie na váhu.',
    'Buduj trojky a päťky, ktoré sa stále uzamknú nad stredom chodidiel.',
    'Použi ho na preťaženie striktného tlaku, nie ako jeho trvalú náhradu.',
  ],
  programming:
    'Push press je silový a zároveň výbušný cvik na preťaženie tlaku nad hlavou. Rob 3–5 sérií po 2–5 opakovaní s úplným odpočinkom; tri minúty sú bežné a časovač LIFTAGu ti pomôže nepremeniť poslednú sériu na trápenie. Tieto čísla nepoužívaj na odhad striktného 1RM. Ak ho zaradíš ako kondičný cvik, zapíš skutočnú pauzu, aby ťa ďalší týždeň neprekvapila.',
  equipmentAlternatives: [
    {
      slug: 'standing-barbell-overhead-press',
      name: 'Tlaky s veľkou činkou nad hlavou v stoji',
      note: 'Keď je cieľom striktná sila, nie pohon nohami.',
    },
    {
      slug: 'landmine-press',
      name: 'Landmine tlak',
      note: 'Pohon po jednej ruke, ak os dráždi rameno.',
    },
  ],
  faqs: [
    {
      question: 'Môžem podľa PR v push presse zvoliť pokus v striktnom tlaku nad hlavou?',
      answer:
        'Nie. Nohy výrazne pomáhajú. Odhadované 1RM z push pressu v LIFTAGu by striktný pokus nadhodnotilo. Na striktné váhy používaj samostatný cvik pre striktný tlak a tento si nechaj na prácu s ponorom a odrazom.',
    },
  ],
  relatedSlugs: [
    'standing-barbell-overhead-press',
    'landmine-press',
    'seated-dumbbell-shoulder-press',
    'machine-shoulder-press',
    'barbell-power-clean',
  ],
} satisfies ExerciseOverlay
