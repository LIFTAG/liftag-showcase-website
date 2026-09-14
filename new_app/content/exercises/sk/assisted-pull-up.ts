import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'assisted-pull-up',
  metaDescription:
    'Asistovaný zhyb: protizávažie, plný rozsah pohybu a zaznamenávanie asistencie tak, aby sa PR v LIFTAGu neobracali naruby.',
  steps: [
    'Nastav protizávažie a potom pomocou rukovätí stroja vystúp alebo si kľakni na podložku. Vyššia zvolená váha znamená väčšiu pomoc — dvíhaš menšiu časť vlastnej hmotnosti.',
    'Zaujmi úchop pre zhyb alebo podhmatový zhyb, ktorý budeš používať v celej sérii. Spevni stred tela a spusti sa do kontrolovaného visu, pričom podložka zostáva pod tebou.',
    'Priťahuj lakte nadol, až kým sa brada jasne nedostane nad rukoväte. Hrudník veď k tyči a nevysúvaj krk.',
    'Plynulo klesaj. Dole podložku neodrážaj. Kolík prestav až vtedy, keď z podložky zostúpiš.',
  ],
  mistakes: [
    {
      title: 'Zapisovanie asistovaných opakovaní ako zhybov',
      body: 'Prísny zhyb má vlastný identifikátor. Asistenciu zapisuj sem, kým nezvládneš série po 5 opakovaní bez pomoci.',
    },
    {
      title: 'Pridávanie váhy na kolíku a nazývanie toho progresom',
      body: 'Na väčšine strojov vyššie nastavený kolík znamená väčšiu pomoc. Progres je menšia asistencia alebo viac čistých opakovaní s rovnakým nastavením. Kolík zapisuj pri každom tréningu rovnako a do poznámky pridaj „asistencia“, aby graf zostal čitateľný.',
    },
    {
      title: 'Odrazenie od podložky naspodku',
      body: 'Ak musíš v spodnej polohe podložku odrážať, potrebuješ väčšiu asistenciu alebo kratšiu sériu. Pohyb má byť prísny; inak z neho vzniká švih.',
    },
    {
      title: 'Skracovanie visu kvôli záťažovému bloku',
      body: 'Vydrž v plnom vise. Zhyb s krátkym rozsahom sa neskôr automaticky nezmení na plný zhyb.',
    },
  ],
  variations: [
    {
      slug: 'pull-up',
      name: 'Zhyb',
      note: 'Cieľ bez asistencie. Prejdi naň, keď sú série po 5 opakovaní čisté.',
    },
    {
      slug: 'chin-up',
      name: 'Podhmatový zhyb',
      note: 'Asistovaný pohyb podhmatom, ak je podhmat tvojím cieľovým úchopom.',
    },
    {
      slug: 'lat-pulldown',
      name: 'Sťahovanie hornej kladky',
      note: 'Menšie skoky v záťaži, keď asistovaný stroj pridáva po 10 kg.',
    },
    {
      slug: 'inverted-row',
      name: 'Obrátený príťah',
      note: 'Vodorovný príťah, kým dobieha sila pre zvislý ťah.',
    },
  ],
  progressions: [
    'Vis a lopatkové príťahy na voľnej hrazde.',
    'Asistované série po 5–8 opakovaní s plným visom. Keď všetky série zostanú čisté, zníž asistenciu.',
    'Na začiatok série pridaj negatívne opakovania alebo jedno opakovanie bez asistencie.',
    'Prejdi na zhyb alebo podhmatový zhyb a tento identifikátor opusti. Bez asistencie už zapisuj priamo príslušný cvik.',
  ],
  programming:
    'Hlavný zvislý príťah, kým nezvládneš pohyb bez asistencie: 3–5 sérií. Ak potrebuješ viac objemu, spoj ho so sťahovaním hornej kladky. Nastavenie kolíka zapisuj konzistentne — PR, ktorý v skutočnosti znamená väčšiu asistenciu, je dôvodom, prečo sa ľudia celé mesiace neposúvajú.',
  faqs: [
    {
      question: 'Guma alebo stroj?',
      answer:
        'Obe možnosti patria sem, ak prácu vykonáva asistencia. Zapíš „guma“ aj jej farbu alebo veľkosť, pretože guma nie je závažový blok a LIFTAG to bez poznámky nerozozná. Keď gumu odstrániš, prejdi na zhyb.',
    },
  ],
  relatedSlugs: ['pull-up', 'chin-up', 'lat-pulldown', 'wide-grip-pull-up'],
} satisfies ExerciseOverlay
