import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'barbell-bent-over-row',
  metaDescription:
    'Príťah veľkej činky v predklone: predklon, uhol trupu a spôsob, ako udržať Pendlay a Yates príťahy mimo PR v LIFTAGu.',
  steps: [
    'Predkloň sa tak, aby bol trup 15–45° nad vodorovnou rovinou. Kolená nechaj mierne pokrčené a činku drž nad stredom chodidiel. Pred prvým príťahom spevni stred tela — predklon je súčasť cviku.',
    'Uchop činku nadhmatom rovnomerne, tesne vedľa nôh. Ťahaj ju k spodným rebrám alebo hornej časti brucha pohybom lakťov dozadu, nie vystieraním trupu.',
    'Spúšťaj činku, kým sú paže dlhé a latissimy natiahnuté. Uhol trupu sa nemení; ak sa pri každom opakovaní dvíhaš, záťaž je priveľká.',
    'Medzi opakovaniami znovu spevni stred tela. Trhať môžeš s popruhmi, keď úchop zlyhá skôr než chrbát — do poznámky série napíš „popruhy“.',
    'Vyber si jeden úchop a uhol trupu a drž sa ich. Vzpriamenejší príťah typu „Yates“ má inú páku; uveď ho v poznámke, nie ako nejasný PR.',
  ],
  mistakes: [
    {
      title: 'Dvíhanie trupu počas príťahu',
      body: 'Ak sa trup dvíha, z príťahu sa stal švihový predklon so zdvihom ramien. Zníž záťaž, kým zostane chrbát úplne nehybný.',
    },
    {
      title: 'Trhanie z uvoľnenej polohy',
      body: 'Kotúče narazia a záťaž preberie driek. Nastav ramená, odstráň vôľu z činky a až potom ťahaj.',
    },
    {
      title: 'Zapisovanie Pendlay príťahov sem',
      body: 'Príťahy zo zeme s úplným zastavením patria pod pendlay-row. Ich miešanie nafúkne tento graf o iný cvik.',
    },
    {
      title: 'Zaoblenie drieku pri dosahovaní na zem',
      body: 'Činka sa nemusí dotknúť kotúčov. Rozsah zvoľ tak, aby si udržal dlhú, pevnú chrbticu.',
    },
  ],
  variations: [
    {
      slug: 'pendlay-row',
      name: 'Pendlay príťah',
      note: 'Každé opakovanie začína zo zeme. Viac sily zo štartu a menej času pod napätím.',
    },
    {
      slug: 't-bar-row',
      name: 'T-bar príťah',
      note: 'Landmine alebo T-bar stanica, užší úchop a oblúková dráha.',
    },
    {
      slug: 'single-arm-dumbbell-row',
      name: 'Príťah jednoručky jednou rukou',
      note: 'S oporou a po jednej strane; menej zaťažuje driek.',
    },
    {
      slug: 'seated-cable-row',
      name: 'Veslovanie na kladke v sede',
      note: 'Stále napätie, keď je limitom predklon.',
    },
  ],
  progressions: [
    'Príťahy s oporou hrudníka alebo obrátené príťahy, kým je pohyb skutočne príťahom a nie švihom.',
    'Ľahké príťahy v predklone s trojsekundovým spúšťaním a nehybným trupom.',
    'Pracovné série po 6–10 opakovaní pri opakovateľnom uhle trupu. Záťaž pridaj, keď posledná séria vyzerá ako prvá.',
    'Ak je slabinou štart, zaraď Pendlay príťahy alebo pauzu vo visu.',
  ],
  programming:
    'Hlavný horizontálny ťah: 3–5 sérií po 5–10 opakovaní po hlavnom cviku s predklonom alebo drepe. Záťaž bude výrazne pod mŕtvym ťahom — presne o to ide. Zapisuj pauzy; dve až tri minúty sú bežné. Ak LIFTAG ukáže skok v týždni, keď si pri každom opakovaní vstával, pridaj poznámku alebo zníž záťaž.',
  faqs: [
    {
      question: 'Nadhmatom alebo podhmatom?',
      answer:
        'Pri tomto cviku je predvolený nadhmat. Podhmat typu Yates zvyčajne dovolí väčšiu záťaž a viac zapojí bicepsy. Vyber jednu verziu na zapisovanie a druhú uveď v poznámke série, inak bude odhadované 1RM miešať dva cviky.',
    },
  ],
  relatedSlugs: [
    'pendlay-row',
    't-bar-row',
    'single-arm-dumbbell-row',
    'seated-cable-row',
    'chest-supported-t-bar-row',
  ],
} satisfies ExerciseOverlay
