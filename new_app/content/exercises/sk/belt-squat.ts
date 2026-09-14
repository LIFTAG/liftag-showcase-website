import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'belt-squat',
  metaDescription:
    'Belt squat: nastavenie opasku, postoj a zaznamenávanie drepov so záťažou na bokoch, keď chrbát nezvláda veľkú činku.',
  steps: [
    'Utiahni opasok okolo bokov, nie pása. Pripoj ho ku kolíku alebo lanu a postav sa rovnomerne na plošinu.',
    'Rukoväte používaj iba na rovnováhu — neslúžia ako pri sťahovaní kladky na chrbát.',
    'Sadni medzi nohy do hĺbky, ktorú by si počítal pri drepe s činkou. Celé chodidlo zostáva na zemi.',
    'Vytlač sa bez priťahovania rukovätí. Záťaž zaves späť kontrolovane.',
  ],
  mistakes: [
    {
      title: 'Opasok sa posúva na brucho',
      body: 'Ak sedí na páse, každý rep tlačí do brucha a boky sa nezaťažia. Stiahni ho na bedrové kosti a dotiahni.',
    },
    {
      title: 'Meníš drep na pohyb s pomocou rúk',
      body: 'Ťahanie rukovätí odľahčuje nohy. Drž sa len končekmi prstov; ak to nejde, uber záťaž.',
    },
    {
      title: 'Skracuješ rozsah kvôli plošine',
      body: 'Rozšír postoj, prípadne sa postav na podložky, ak to stroj umožňuje, alebo zmeň polohu chodidiel. Nerob štvrtinové drepy s obrovským zásobníkom.',
    },
    {
      title: 'Zapisuješ belt squat ako drep s činkou',
      body: 'Nejde o axiálnu záťaž z činky, preto je rekord iný. Naskenuj stroj belt squat, aby sa otvoril tento cvik, nie hacken drep.',
    },
  ],
  variations: [
    {
      slug: 'barbell-back-squat',
      name: 'Drep s veľkou činkou na chrbte',
      note: 'Voľná váha, keď je chrbtica znovu pripravená.',
    },
    {
      slug: 'machine-hack-squat',
      name: 'Hacken drep na stroji',
      note: 'Drep na saniach s oporou chrbta, keď fitko nemá belt squat.',
    },
    {
      slug: 'pendulum-squat',
      name: 'Pendulum drep',
      note: 'Vedený vzpriamený drep; stále stroj, stále nie belt squat.',
    },
    {
      slug: 'belt-squat-good-morning',
      name: 'Good morning na belt-squat stroji',
      note: 'Rovnaký opasok, predklon namiesto drepu, keď chceš cieliť zadný reťazec.',
    },
  ],
  progressions: [
    'Drep s vlastnou váhou do hĺbky, ktorú by si uznal v stojane.',
    'Ľahký belt squat, kým je poloha opasku istá a ruky pokojné.',
    'Pracovné série po 6–12 opakovaní. Pridaj záťaž, keď sa hĺbka opakuje.',
    'Pauzy v spodnej pozícii alebo good morning na opasku, ak je slabým miestom dno.',
  ],
  programming:
    'Ako hlavný drep pri unavenom chrbte alebo ako druhý drep týždňa: tri až štyri série po 6–12. Často ich môžeš ísť tvrdšie než drep s činkou v rovnaký deň — o to ide — no stále potrebujú odpočinok. V LIFTAG nepripisuj túto váhu k drepu s činkou na chrbte.',
  equipmentAlternatives: [
    {
      slug: 'machine-hack-squat',
      name: 'Hacken drep na stroji',
      note: 'Najbližší strojový drep vo fitkách bez belt-squat stroja.',
    },
    {
      slug: 'standard-leg-press',
      name: 'Klasický leg press',
      note: 'Zachovaj objem kvadricepsov bez opasku a bez činky na chrbte.',
    },
    {
      slug: 'barbell-back-squat',
      name: 'Drep s veľkou činkou na chrbte',
      note: 'Vráť sa k nemu, keď je chrbtica pripravená na axiálnu záťaž.',
    },
  ],
  faqs: [
    {
      question: 'Belt squat alebo hacken drep?',
      answer:
        'Pri belt squate visí záťaž z bokov, takže chrbtica slúži najmä ako opora. Hacken drep stále zaťažuje ramená a opiera sa o chrbát. Belt squat zvoľ, keď je limitom chrbát, a zapisuj stroj, na ktorom skutočne cvičíš.',
    },
  ],
  relatedSlugs: ['barbell-back-squat', 'machine-hack-squat', 'pendulum-squat', 'belt-squat-good-morning'],
} satisfies ExerciseOverlay
