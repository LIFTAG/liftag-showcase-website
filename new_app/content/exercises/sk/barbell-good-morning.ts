import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'barbell-good-morning',
  metaDescription:
    'Good morning s veľkou činkou: poloha činky, hĺbka predklonu a samostatné zaznamenávanie oproti RDL a drepom v LIFTAG.',
  steps: [
    'Ulož ľahkú os na hornú časť trapézov ako pri high-bar drepe. Vykroč, spevni stred tela a mierne pokrč kolená.',
    'Tlač boky dozadu. Uhol predkolení sa takmer nemení a os zostáva nad stredom chodidiel.',
    'Zastav, keď hamstringy alebo poloha chrbta už nedovolia ďalší rozsah — často približne v rovnobežke, pri zaokrúhľovaní krížov skôr.',
    'Vytlač boky dopredu a postav sa. Pred ďalším opakovaním sa znova spevni. Odlož os ako pri drepe a používaj nastavené dorazy.',
  ],
  mistakes: [
    {
      title: 'Nakladáš ho ako drep',
      body: 'Činka je od bokov ďalej než pri RDL. Mnohým cvičiacim stačí 30–50 % drepovej váhy. Ak s osou drepuješ, je príliš ťažká.',
    },
    {
      title: 'Kolená cestujú dopredu',
      body: 'Vzniká drep s hroznou polohou činky. Kolená raz odomkni a potom vykonaj predklon v bokoch.',
    },
    {
      title: 'Zaokrúhľuješ kríže kvôli hĺbke',
      body: 'Rozsah určuje posledná poctivá poloha chrbta, nie cieľový uhol trupu. Skráť pohyb a zachovaj spevnenie.',
    },
    {
      title: 'Zapisuješ good morning ako RDL',
      body: 'Činka na chrbte vytvára inú páku. Zachovaj tento cvik, aby graf RDL ostal cvikom s činkou v rukách.',
    },
  ],
  variations: [
    {
      slug: 'barbell-romanian-deadlift-rdl',
      name: 'Rumunský mŕtvy ťah s veľkou činkou',
      note: 'Ruky na činke, jednoduché dávkovanie a pre väčšinu cvičiacich základný predklonový cvik.',
    },
    {
      slug: 'belt-squat-good-morning',
      name: 'Good morning na belt-squat stroji',
      note: 'Rovnaký predklon so záťažou na bokoch, keď je chrbtica unavená.',
    },
    {
      slug: 'dumbbell-romanian-deadlift',
      name: 'Rumunský mŕtvy ťah s jednoručkami',
      note: 'Nácvik predklonu a praktická náhrada na cestách.',
    },
    {
      slug: 'nordic-hamstring-curl',
      name: 'Nordic hamstring curl',
      note: 'Pokrčenie kolena, ak slabým miestom nie je predklon.',
    },
  ],
  progressions: [
    'Good morning s palicou, kým sa predklon nestane automatickým.',
    'Prázdna os v stojane s dorazmi tesne pod plánovaným uhlom trupu.',
    'Pracovné série výrazne ľahšie než pri drepe. Pridaj kilogramy, keď sa poloha chrbta nemení.',
    'Pauza v spodnej pozícii, až keď prestaneš hĺbku naháňať.',
  ],
  programming:
    'Doplnkový predklon: tri až štyri série po päť až desať opakovaní po drepoch alebo v druhý deň zadného reťazca. Cvič v stojane. Ak minulý týždeň poznámka v LIFTAG hovorí, že sa chrbát v rovnobežke zaokrúhlil, toto je tvoj rozsah — nie dôvod pridať 10 kg.',
  equipmentAlternatives: [
    {
      slug: 'barbell-romanian-deadlift-rdl',
      name: 'Rumunský mŕtvy ťah s veľkou činkou',
      note: 'Základná výmena, keď nechceš mať os na chrbte.',
    },
    {
      slug: 'belt-squat-good-morning',
      name: 'Good morning na belt-squat stroji',
      note: 'Zachovaj vzor pohybu, keď je problémom tlak pozdĺž chrbtice.',
    },
  ],
  faqs: [
    {
      question: 'Sú good mornings nebezpečné?',
      answer:
        'Neodpúšťajú ego. Použi ľahkú os, pevný stred tela, dorazy v stojane a rozsah, ktorý ovládaš. S váhou ako pri drepe sú zlý nápad; ako predklon sú užitočným doplnkovým cvikom.',
    },
  ],
  relatedSlugs: [
    'barbell-romanian-deadlift-rdl',
    'belt-squat-good-morning',
    'barbell-back-squat',
    'nordic-hamstring-curl',
    'back-extension-hyperextension',
  ],
} satisfies ExerciseOverlay
