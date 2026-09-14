import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'lat-pulldown',
  metaDescription:
    'Sťahovanie hornej kladky: opierka na stehná, tyč k hrudníku a samostatné zaznamenávanie oproti zhybom a variantom s inou šírkou úchopu v LIFTAG-u.',
  steps: [
    'Nastav opierku na stehná tak, aby si sa pri natiahnutí nezdvíhal zo sedadla. Uchop tyč o niečo širšie než na šírku ramien, zápästia drž v jednej línii a palce obtoč okolo tyče.',
    'Začni s vystretými rukami a ramenami vytiahnutými nahor. Najprv stiahni lopatky nadol, potom ťahaj. Náklon 10–20° je sťahovanie kladky; náklon 45° je príťah, pri ktorom iba sedíš.',
    'Stiahni tyč k hornej časti hrudníka alebo ku kľúčnej kosti. Lakte smerujú nadol a hrudník nahor. Bradu drž mimo dráhy bez vysúvania krku v snahe stretnúť tyč.',
    'Vráť sa do úplného natiahnutia, kým sa ramená znovu nevytiahnu. Posledný centimeter hore je začiatok ďalšieho opakovania, nie oddych s pokrčenými lakťami.',
  ],
  mistakes: [
    {
      title: 'Sťahovanie za krk ako základný variant',
      body: 'Väčšina ramien nie je bez rozcvičenia pripravená na takúto rotáciu. Ťahaj k hrudníku. Ak program vyžaduje ťah za krk, ponechaj tento identifikátor a uveď to v poznámke.',
    },
    {
      title: 'Premena každého opakovania na príťah v sede',
      body: 'Mierny náklon je v poriadku. Ak musíš trupom odhodiť záťažový blok, kolík je príliš ťažký alebo máš prejsť na príťah v sede na kladke.',
    },
    {
      title: 'Zaznamenávanie ako zhyb',
      body: 'Ide o iný cvik aj iný osobný rekord. Sťahovanie kladky je stroj, na ktorom môžeš pridávať malé kroky. Zhyby patria pod vlastný identifikátor, so záťažou alebo bez nej.',
    },
    {
      title: 'Vynechanie natiahnutia pre voľnú opierku',
      body: 'Dotiahni opierku na stehná. Ak sa vznášaš nad sedadlom, vyhral záťažový blok. Predĺžené široké chrbtové svaly sú práca, pre ktorú si prišiel.',
    },
  ],
  variations: [
    {
      slug: 'wide-grip-lat-pulldown',
      name: 'Sťahovanie hornej kladky širokým úchopom',
      note: 'Ruky smerujú k ohybom tyče. Kratší rozsah, samostatný identifikátor.',
    },
    {
      slug: 'close-grip-lat-pulldown',
      name: 'Sťahovanie hornej kladky úzkym úchopom',
      note: 'V-adaptér alebo úzky neutrálny úchop, viac práce rúk, stále zvislý ťah.',
    },
    {
      slug: 'pull-up',
      name: 'Zhyb nadhmatom',
      note: 'Variant s vlastnou hmotnosťou, ku ktorému tento cvik smeruje.',
    },
    {
      slug: 'assisted-pull-up',
      name: 'Asistovaný zhyb',
      note: 'Použi ho, keď je skutočným cieľom dostať sa na hrazdu, nie nakladať blok.',
    },
  ],
  progressions: [
    'Ľahký záťažový blok, úplné natiahnutie, tyč k hrudníku bez trhnutia.',
    'Vybuduj série po 8–12 opakovaní, až potom naháňaj rekord s polovičným opakovaním a náklonom.',
    'Asistované alebo striktné zhyby, keď sú série po 10 opakovaní čisté a nudne isté.',
    'Sťahovanie s vystretými rukami, ak sa ruky vždy vzdajú skôr než široké chrbtové svaly.',
  ],
  programming:
    'Základný objem zvislého ťahu, keď zhyby ešte nejdú, alebo odľahčovacia práca po nich. Tri až štyri série po 8–12 opakovaní. Nemiešaj čísla širokého a úzkeho úchopu do tohto identifikátora; LIFTAG má pre ne samostatné cviky. Pri zmene magnetického úchopu za rovnú tyč uveď pomôcku v poznámke, inak budú v grafe dva stroje predstierať jeden.',
  equipmentAlternatives: [
    {
      slug: 'pull-up',
      name: 'Zhyb nadhmatom',
      note: 'Keď môžeš, použi hrazdu. Pri opasku zaznamenaj pridanú záťaž.',
    },
    {
      slug: 'assisted-pull-up',
      name: 'Asistovaný zhyb',
      note: 'Bližšie k zhybu než ťažké sťahovanie s veľkým náklonom dozadu.',
    },
    {
      slug: 'straight-arm-pulldown',
      name: 'Sťahovanie kladky s vystretými rukami',
      note: 'Izolácia v rovnakej dráhe, keď lakte vždy preberú celú sériu.',
    },
  ],
  faqs: [
    {
      question: 'Mám sťahovať kladku za krk?',
      answer:
        'Nie ako základný variant. Sťahovanie k hrudníku je opakovateľný pohyb a zodpovedá zhybu. Ťah za krk vyžaduje väčšiu rotáciu, než väčšina ľudí prinesie na pondelkový tréning chrbta.',
    },
  ],
  relatedSlugs: [
    'pull-up',
    'chin-up',
    'wide-grip-lat-pulldown',
    'close-grip-lat-pulldown',
    'straight-arm-pulldown',
  ],
} satisfies ExerciseOverlay
