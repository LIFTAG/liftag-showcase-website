import type { ExerciseOverlay } from '~/types/exerciseOverlay'

export default {
  slug: 'seated-cable-row',
  metaDescription:
    'Príťahy v sede na kladke: uhol trupu, ťah k hrudnej kosti a zaznamenávanie horizontálneho ťahu oddelene od príťahov na stroji v LIFTAG.',
  steps: [
    'Sadni si vzpriamene na podložku, chodidlá polož na platformu a kolená nechaj mierne pokrčené. Začni s vystretými pažami a ramenami dosiahnutými smerom ku kladke — toto natiahnutie je začiatok, nie predklon.',
    'Ťahaj držadlo k dolnej časti hrudníka alebo hornej časti brucha. Lakte veď dozadu, hrudník drž hore a lopatky priťahuj k sebe. V závere nedvíhaj ramená k ušiam.',
    'Na okamih zotrvaj v polohe pri trupe. Potom nechaj ramená pri návrate opäť mierne dosiahnuť dopredu, kým sa latissimy natiahnu. Malý predklon v natiahnutí je v poriadku; hojdanie o 45° nie.',
    'Nástavec prispôsob zámeru: úzky V-úchop smeruje k hrudnej kosti, širšia tyč o niečo vyššie. Pri výmene si nástavec poznač.',
  ],
  mistakes: [
    {
      title: 'Vesluješ krížami',
      body: 'Ak je každé opakovanie predklon, ktorým trhneš kolíkom, záťaž je príliš veľká. Trup sa môže v natiahnutí trochu nakloniť. Prácu však robí ťah, nie príťah v sede ako good morning.',
    },
    {
      title: 'Posledné centimetre dokončuješ pokrčením ramien',
      body: 'Lakte dozadu, ramená nadol. Pokrčený záver je trapézový cvik, ktorý si nezapísal. Ak sa držadlo hýbe iba vďaka zdvihnutým ramenám, uber kolík.',
    },
    {
      title: 'Zapisuješ príťahy v sede na stroji',
      body: 'Stroj s oporou hrudníka je samostatný cvik s vlastným rekordom. Naskenuj štítok. Tento cvik je príťah na voľne sediacej kladke.',
    },
    {
      title: 'V natiahnutí sa nikdy nedostaneš dopredu',
      body: 'Ak každé opakovanie začínaš zo stiahnutého chrbta, robíš polovičné opakovanie. Nechaj ramená dosiahnuť dopredu a potom ťahaj. Pracujú latissimy, nie nekontrolované zaokrúhlenie.',
    },
  ],
  variations: [
    {
      slug: 'machine-seated-row',
      name: 'Príťahy v sede na stroji',
      note: 'Oporu tvorí hrudník, takže kríže dostanú menšiu záťaž. Použi ich, keď je chrbát unavený.',
    },
    {
      slug: 'barbell-bent-over-row',
      name: 'Príťahy veľkej činky v predklone',
      note: 'Väčšia záťaž, väčší predklon v bedrách a príbuzný cvik s voľnou váhou.',
    },
    {
      slug: 'single-arm-dumbbell-row',
      name: 'Príťahy jednoručky jednou rukou',
      note: 'Strany pracujú nezávisle a druhú časť tela podopiera lavička.',
    },
    {
      slug: 'chest-supported-t-bar-row',
      name: 'Príťahy T-činky s oporou hrudníka',
      note: 'Horizontálny ťah s trupom pevne opretým.',
    },
  ],
  progressions: [
    'Ľahká záťaž, pauza pri trupe, úplné dosiahnutie pri návrate a žiadne hojdanie.',
    'Pridaj záťaž až vtedy, keď posledné opakovania stále končia v rovnakom bode na tričku.',
    'Ak kríže vždy povolia ako prvé, použi príťahy s oporou hrudníka alebo stroj.',
    'Keď chceš ťažší horizontálny ťah, prejdi na príťahy s veľkou činkou alebo T-činkou.',
  ],
  programming:
    'Pre väčšinu posilňovní ide o pravidelný objem horizontálneho ťahu. Vykonaj 3–4 série po 8–12 opakovaní po mŕtvom ťahu alebo ako hlavné príťahy v tréningu hornej časti tela. Ak striedaš V-úchop a širokú tyč, zapíš si nástavec do poznámky. Odpočívaj tak dlho, aby si sa nemusel hádzať dozadu — časovač LIFTAG odlíši príťah od súťaže v predklone.',
  equipmentAlternatives: [
    {
      slug: 'machine-seated-row',
      name: 'Príťahy v sede na stroji',
      note: 'Predvolená náhrada, keď chceš mať hrudník opretý.',
    },
    {
      slug: 'inverted-row',
      name: 'Obrátené príťahy',
      note: 'Nemáš kladku? Použi tyč v stojane. Zapíš ich ako obrátené príťahy, nie ako tento cvik.',
    },
    {
      slug: 't-bar-row',
      name: 'Príťahy T-činky',
      note: 'Landmine alebo T-činka s oporou hrudníka, keď chceš väčšiu záťaž.',
    },
  ],
  faqs: [
    {
      question: 'Aké veľké hojdanie trupu je dovolené?',
      answer:
        'V natiahnutí môžeš použiť malý predklon a potom sa vytiahni do vzpriameného záveru. Ak na dokončenie potrebuješ veľký švih, kolík je príliš ťažký. Príťahy s oporou hrudníka alebo na stroji sú určené na dni, keď kríže nemajú pomáhať.',
    },
  ],
  relatedSlugs: [
    'barbell-bent-over-row',
    'machine-seated-row',
    'pendlay-row',
    't-bar-row',
    'single-arm-dumbbell-row',
  ],
} satisfies ExerciseOverlay
