import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'close-grip-lat-pulldown',
  metaDescription:
    'Sťahovanie hornej kladky úzkym úchopom: dráha V-adaptéra, lakte pri tele a samostatné zaznamenávanie oproti širokému úchopu či príťahom na kladke v LIFTAGu.',
  steps: [
    'Pripoj V-adaptér alebo úzky neutrálny úchop. Použi rovnakú opierku na stehná ako pri každom sťahovaní kladky; potrebuješ ju, aj keď adaptér vyzerá ako na príťahy.',
    'Začni s vystretými rukami a ramenami vytiahnutými nahor. Dlane smerujú k sebe, zápästia drž rovno a neohýbaj ich smerom k adaptéru.',
    'Stiahni adaptér k hornej časti brucha alebo spodnej časti hrudnej kosti. Lakte sa jemne dotknú trupu a smerujú k zadným vreckám, nie do strán ako pri širokom úchope.',
    'Hore sa znovu úplne natiahni. Ak držíš lakte celý čas v 90° a nechceš ich vystierať, zmenil si cvik na výdrž bicepsov.',
  ],
  mistakes: [
    {
      title: 'Bicepsový zdvih s V-adaptérom',
      body: 'Ak sa uhol ramien nemení a lakte zostávajú na mieste, celú sériu odpracovali bicepsy. Mysli na lakte dole a dovnútra a na hrudník hore.',
    },
    {
      title: 'Zaznamenávanie ako príťah v sede na kladke',
      body: 'Adaptér môže byť rovnaký, smer pohybu je opačný. Toto je stále zvislý ťah. Príťahy patria pod príťah v sede na kladke.',
    },
    {
      title: 'Miešanie úzkeho a širokého úchopu pod jedným identifikátorom',
      body: 'Záťaž aj rozsah sa líšia. LIFTAG má oba varianty. Použi ich, inak bude graf v šiestom týždni klamať.',
    },
    {
      title: 'Prílišný predklon, až adaptér narazí do opasku',
      body: 'Mierny náklon patrí k sťahovaniu kladky. Hojdanie v uhle 45°, pri ktorom adaptér trafí pracku, je príťah s nadbytočnými krokmi. Sadni si vzpriamene a zníž záťaž.',
    },
  ],
  variations: [
    {
      slug: 'lat-pulldown',
      name: 'Sťahovanie hornej kladky',
      note: 'Štandardná tyč a základný objem zvislých ťahov.',
    },
    {
      slug: 'wide-grip-lat-pulldown',
      name: 'Sťahovanie hornej kladky širokým úchopom',
      note: 'Druhý variant úchopu s kratším rozsahom a väčším vytiahnutím lakťov.',
    },
    { slug: 'chin-up', name: 'Zhyb podhmatom', note: 'Variant zvislého ťahu s podhmatom na hrazde.' },
    {
      slug: 'straight-arm-pulldown',
      name: 'Sťahovanie kladky s vystretými rukami',
      note: 'Lakte zostanú mimo pohybu, keď sa ti pri každom ťahu vzdávajú ako prvé.',
    },
  ],
  progressions: [
    'Ľahký V-adaptér, úplné natiahnutie, pritiahnutie k hrudnej kosti bez hojdania.',
    'Vybuduj 8–12 opakovaní, až potom nakladaj ako pri príťahu.',
    'Zhyby podhmatom alebo zhyby úzkym úchopom, keď je tento cvik ľahký a limitom už nie sú bicepsy.',
  ],
  programming:
    'Sťahovanie úzkym úchopom je vhodný hlavný zvislý ťah, keď sú dlhodobým cieľom zhyby, alebo odľahčovacia práca po nich. Tri až štyri série po 8–12 opakovaní. Pri zmene adaptéra si poznač V-adaptér alebo úzky nadhmat. Oddychuj ako pri ťahu, nie ako pri bicepsovom zdvihu; časovač LIFTAGu stále patrí k tomuto cviku.',
  equipmentAlternatives: [
    {
      slug: 'chin-up',
      name: 'Zhyb podhmatom',
      note: 'Keď môžeš, prejdi na hrazdu. Pri opasku zaznamenaj pridanú záťaž.',
    },
    {
      slug: 'lat-pulldown',
      name: 'Sťahovanie hornej kladky',
      note: 'Rovná tyč, keď chýba V-adaptér alebo chceš väčšie vytiahnutie lakťov.',
    },
    {
      slug: 'seated-cable-row',
      name: 'Príťah v sede na kladke',
      note: 'Ak si v skutočnosti chcel vodorovný ťah s tým istým adaptérom.',
    },
  ],
  relatedSlugs: ['lat-pulldown', 'wide-grip-lat-pulldown', 'chin-up', 'pull-up', 'straight-arm-pulldown'],
} satisfies ExerciseOverlay
