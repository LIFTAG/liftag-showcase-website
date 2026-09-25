<script setup lang="ts">
definePageMeta({ i18n: false })
const path = '/cs/privacy-policy'
const lastUpdated = 'září 2026'

useLiftagSeo(() => ({
  title: 'Zásady ochrany osobních údajů | LIFTAG',
  description:
    'Jak LIFTAG shromažďuje, používá, ukládá a chrání vaše osobní údaje při používání tréninkové aplikace LIFTAG.',
  path,
  lang: 'cs',
  locale: 'cs_CZ',
  alternates: liftagLegalAlternates('privacy'),
}))

useLiftagStructuredData(() => [
  liftagOrganization,
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: '/' },
    { name: 'Ochrana osobních údajů', path },
  ]),
], 'en')

const sections = [
  {
    title: 'Úvod',
    body: 'Liftag je aplikace pro sledování tréninků. Jejím provozovatelem a správcem vašich osobních údajů je Adam Prisenžňák, živnostník registrovaný v České republice, IČO 23848944, se sídlem Kurkova 1212/2, 182 00 Praha 8 – Kobylisy, Česká republika. Zapsaný v českém živnostenském rejstříku; příslušný živnostenský úřad: Úřad městské části Praha 8. Telefon: +420 725 825 340. E-mail: support@liftag.fit.\n\nTyto Zásady ochrany osobních údajů vysvětlují, jaké osobní údaje shromažďujeme, jak je používáme a jak můžete uplatnit svá práva.',
  },
  {
    title: 'Údaje, které shromažďujeme',
    body: 'Můžeme shromažďovat údaje o účtu, jako je jméno, e-mail, poskytovatel přihlášení, datum narození, pohlaví, preferované jednotky, nastavení profilu a zprávy podpoře; tělesné údaje, jako je výška a hmotnost, včetně měření hmotnosti a souhrnů srdeční frekvence z tréninků, které se rozhodnete importovat z Apple Health nebo Health Connect; tréninková data, jako jsou relace, cviky, série, opakování, váhy, doba trvání, rutiny, plány, cíle, pokrok a nastavení sdílení s trenérem; historii tréninků, kterou importujete ze souborů exportovaných z jiných aplikací, včetně podrobností o trénincích, poznámek a původních označení v těchto souborech; nahraný obsah, například média vlastních cviků; cíle, preference a volně psaná omezení, pokyny nebo požadavky na úpravu, které zadáte při žádosti o rutinu nebo plán vygenerovaný umělou inteligencí, a zpětnou vazbu, kterou k výsledku přidáte; přibližnou nebo přesnou polohu, pokud povolíte detekci posilovny nebo mapové funkce; a údaje o zařízení, aplikaci, diagnostice, pádech, session replay, událostech aplikace, atribuci reklam a reklamním identifikátoru, pokud to povolí nastavení vašeho zařízení.',
  },
  {
    title: 'Jak vaše údaje používáme a právní základy',
    body: 'Vaše údaje používáme k vytvoření a zabezpečení účtu, poskytování sledování tréninků a funkcí QR/posilovna, synchronizaci mezi zařízeními, zobrazování historie a pokroku, importu historie tréninků z jiných aplikací, podpoře trenérů a sdílení, generování návrhů rutin a plánů pomocí umělé inteligence, když o ně požádáte, vyřízení podpory, prevenci zneužití, řešení pádů, měření instalací aplikace a registrací z našich reklam, zlepšování kvality aplikace a plnění právních povinností.\n\nU běžných údajů o účtu a trénincích potřebných k poskytování funkcí, o které požádáte, včetně importů a sdílení, je právním základem plnění naší smlouvy s vámi (článek 6 odst. 1 písm. b) GDPR). U nezbytných technických záznamů se opíráme o naše oprávněné zájmy na zabezpečení služby, prevenci zneužití, rozpoznávání duplicitních importů a zabránění obnovení vymazaných tréninků z offline zařízení (článek 6 odst. 1 písm. f)). Proti zpracování na základě těchto zájmů můžete vznést námitku. Pokud nám právní povinnost ukládá zpracovávat nebo uchovávat údaje, uplatňuje se článek 6 odst. 1 písm. c). Tyto právní základy podle článku 6 samy o sobě neopravňují ke zpracování zvláštních kategorií údajů, například údajů o zdraví.',
  },
  {
    title: 'Ukládání a zabezpečení údajů',
    body: 'Data jsou ukládána u poskytovatelů služeb včetně Supabase a úložiště médií S3/AWS. Používáme technická a organizační opatření, jako je ověřený přístup k API a šifrování při přenosu, ale žádná služba nemůže zaručit absolutní bezpečnost.',
  },
  {
    title: 'Služby třetích stran',
    body: 'Používáme služby třetích stran včetně Supabase pro autentizaci, databázi a úložiště; Google a Apple pro přihlášení; Meta/Facebook SDK a TikTok Business SDK pro atribuci reklam aplikace a měření kampaní; Sentry včetně session replay pro diagnostiku; Resend pro e-mail; Cloudflare Turnstile pro prevenci zneužití; OpenAI, Anthropic a Google Generative AI pro generování rutin a plánů pomocí umělé inteligence a vyhodnocení jejich kvality; Apple Health (HealthKit) a Android Health Connect, pokud zapnete synchronizaci zdraví; Strava, pokud ji připojíte; YouTube/WebView pro video obsah; mapové a lokalizační služby pro vyhledávání posiloven; a úložiště S3/AWS pro nahrávaná média.',
  },
  {
    title: 'Apple Health a Health Connect',
    body: 'Synchronizace zdraví je volitelná a ve výchozím nastavení vypnutá. Pokud ji zapnete, Liftag zapisuje vaše dokončené tréninky zaznamenané v Liftag (včetně aktivních kalorií odhadnutých z vašich cviků, délky tréninku a údajů ve vašem profilu) a záznamy tělesné hmotnosti do Apple Health nebo Health Connect a může z těchto platforem číst měření hmotnosti a po každém tréninku i srdeční frekvenci zaznamenanou během daného tréninku, pokud tato oprávnění udělíte. Tréninky importované ze souborů nezapisujeme do Apple Health ani Health Connect. Importovanou tělesnou hmotnost a souhrny srdeční frekvence z tréninků ukládáme k vašemu účtu Liftag, abychom vám je mohli zobrazit v historii a pokroku a zpřesnit odhady kalorií vašich tréninků. S těmito údaji zacházíme podle pravidel platforem Apple a Google. Údaje získané z Apple Health nebo Health Connect nikdy nepoužíváme pro reklamu ani marketing a nikdy je nesdílíme s třetími stranami. Synchronizaci zdraví můžete kdykoli vypnout v aplikaci nebo odvolat oprávnění v nastavení zdraví vašeho zařízení.',
  },
  {
    title: 'Import z jiných aplikací',
    body: 'Import historie tréninků je volitelný a spustí se pouze tehdy, když jej sami zahájíte. Exportovaný soubor, který vyberete, nahrajeme do soukromého úložiště a analyzujeme na našem serveru, abychom vám připravili návrh ke kontrole. Při analýze importu a přiřazování cviků soubor neposíláme poskytovatelům umělé inteligence. Soubor může obsahovat názvy tréninků, data, cviky, série, váhy, opakování, trvání, vzdálenosti, RPE a poznámky. Poznámky, názvy tréninků a názvy cviků mohou odhalovat údaje o zdraví, například zranění, proto si soubor před nahráním zkontrolujte.\n\nImportované tréninky se stanou součástí vaší historie v Liftag. Trenér, se kterým se spojíte, je vidí včetně poznámek a původních podrobností během aktivní spolupráce. Stejné podrobnosti vidí osoby, které přidáte v části Sdílet tréninková data. Tato pravidla sdílení se týkají importů ze souborů; zvláštní pravidla pro údaje získané z Apple Health nebo Health Connect jsou uvedena výše. Importované tréninky ani poznámky nepoužíváme pro reklamu. Importované tréninky nezapisujeme do Apple Health ani Health Connect a neposíláme je do Strava.\n\nNahraný soubor vymažeme po úspěšné analýze. Importy, které stále čekají na nahrání souboru nebo jejichž analýza selhala, se stávají způsobilými k vypršení 24 hodin po zahájení, jakmile vyprší odkaz pro nahrávání i dodatečná 30minutová lhůta pro dokončení probíhajícího nahrávání. Při odstraňování vypršených importů vymažeme jejich nahrané soubory. Nedokončené návrhy a importy vyprší 7 dní po zahájení importu, včetně potvrzeného importu, jehož ukládání ještě neskončilo. Již uložené tréninky zůstanou ve vaší historii. Odstraňování probíhá na pozadí a neúspěšná vymazání opakujeme, proto čas vypršení není zárukou, že v daném okamžiku zmizí každá kopie.\n\nÚdaje návrhu tréninků odstraníme po dokončení, zrušení nebo vypršení importu. Uložené tréninky včetně původních podrobností zůstávají, dokud je nevymažete nebo dokud nevymažete účet. Původní poznámky ke cvikům mohou zůstat v těchto podrobnostech i po úpravě viditelné poznámky a mohou se objevit v exportech historie a sdílených zobrazeních tréninku. Rutiny, které vytvoříte z importu, mohou také obsahovat kopie poznámek ke cvikům. Vymazání tréninku nevymaže tyto rutiny ani soukromé cviky; upravte nebo vymažte je samostatně, případně nás kontaktujte se žádostí o výmaz údajů.\n\nVrácení importu odstraní importované tréninky, které jste neupravili. Ponechá upravené tréninky, rutiny, které jste se rozhodli vytvořit, soukromé cviky a potvrzená přiřazení cviků. Část Uchovávání údajů vysvětluje, které technické záznamy o importu zůstávají. Vymazání účtu se vztahuje i na importované tréninky včetně těch, které jste upravili, a na související záznamy o importu.',
  },
  {
    title: 'Funkce využívající umělou inteligenci',
    body: 'Generování tréninkové rutiny nebo plánu pomocí umělé inteligence je volitelné a spustí se pouze tehdy, když jej sami vyvoláte. Když jej použijete, odesíláme vstupy daného požadavku poskytovatelům umělé inteligence, kteří pro nás vystupují jako zpracovatelé: vybrané cíle, cílové svalové partie, obtížnost, délku tréninku, počet dní v týdnu a délku plánu, preferenci vybavení, vybranou posilovnu spolu s cviky a vybavením, které jsou v ní dostupné, a jakákoli volně psaná omezení, pokyny nebo požadavky na úpravu, které napíšete. Požadavek může obsahovat i související kontext účtu použitý k přizpůsobení výsledku, například údaje profilu a nedávná tréninková data. Vygenerovaný návrh spolu s hodnocením nebo komentářem, který k němu přidáte, můžeme odeslat k automatickému vyhodnocení kvality. Poskytovatelé umělé inteligence, které aktuálně používáme, jsou OpenAI, Anthropic a Google. Tito poskytovatelé zpracovávají tyto údaje naším jménem a mohou je zpracovávat i mimo vaši zemi, včetně Spojených států. Volně psaná pole mohou obsahovat údaje o zdraví, například popis zranění nebo zdravotního stavu, proto uvádějte pouze to, co chcete tímto způsobem zpracovat. Vygenerované rutiny a plány jsou návrhy, nikoli lékařská ani odborná tréninková rada. Každý návrh si zkontrolujete a rozhodnete se, zda jej uložíte nebo zahodíte, a tyto funkce nedělají žádné rozhodnutí s právním nebo podobně významným účinkem na vás. Návrhy jsou uloženy u vašeho účtu Liftag, dokud je nepřijmete nebo nezahodíte.',
  },
  {
    title: 'Vaše práva',
    body: 'Podle GDPR máte za podmínek, které stanoví, právo na přístup ke svým osobním údajům, jejich opravu, výmaz, získání přenosné kopie a omezení zpracování. Můžete vznést námitku proti zpracování na základě oprávněných zájmů. Pokud je zpracování založeno na souhlasu, můžete jej kdykoli odvolat bez vlivu na zákonnost zpracování před odvoláním. Tato práva můžete uplatnit na support@liftag.fit včetně žádosti o odstranění konkrétních poznámek, původních podrobností importu nebo kopií v rutinách; kvůli takové žádosti nemusíte žádat o vymazání celého účtu. O vymazání účtu můžete požádat i v aplikaci a vztahuje se i na importované tréninky včetně těch, které jste později upravili.\n\nStížnost můžete podat u českého Úřadu pro ochranu osobních údajů (https://uoou.gov.cz) nebo u dozorového úřadu v členském státě EU, ve kterém máte obvyklé bydliště, pracujete nebo ve kterém došlo k údajnému porušení. Další práva vám mohou vyplývat z právních předpisů platných tam, kde žijete.',
  },
  {
    title: 'Uchovávání údajů',
    body: 'Osobní údaje uchováváme po dobu nezbytnou pro účely popsané v těchto zásadách. Údaje o účtu a uložených trénincích zpravidla zůstávají, dokud existuje váš účet, pokud je nevymažete dříve. Omezený rozsah údajů můžeme uchovat, pokud je to nezbytné ke splnění právní povinnosti nebo k určení, výkonu či obhajobě právních nároků. Po vymazání účtu údaje vymažeme nebo anonymizujeme, kromě případů, kdy se uplatňuje odůvodněný zákonný požadavek na jejich uchování.\n\nU importů uchováváme technický otisk, dokud importovaný trénink existuje, abychom rozpoznali duplicity. Když trénink vymažete, odstraníme jeho údaje z importu i otisk a ponecháme minimální záznam o vymazání s identifikátorem tréninku, aby jej offline zařízení znovu neobnovilo. Tento záznam neobsahuje obsah tréninku, ale zůstává propojen s vaším účtem až do vymazání účtu. Uchováváme také záznamy o historii importů, například zdrojovou aplikaci, počty, data a záznamy o vytvořených rutinách, a vámi potvrzená přiřazení cviků včetně původních názvů cviků. Tyto záznamy zpravidla zůstávají u vašeho účtu a vrácení importu ani vymazání tréninku je neodstraní všechny. Jde o osobní údaje a můžete nás kontaktovat, abyste k nim uplatnili svá práva.',
  },
  {
    title: 'Ochrana soukromí dětí',
    body: 'Liftag není určen pro osoby mladší 16 let. Vědomě neumožňujeme uživatelům mladším 16 let vytvářet účty ani používat funkce produktu. Pokud je vám méně než 16 let, Liftag nepoužívejte.',
  },
  {
    title: 'Změny těchto zásad',
    body: 'Tyto Zásady ochrany osobních údajů můžeme aktualizovat. Na podstatné změny vás upozorníme v aplikaci nebo e-mailem, a pokud je to vyžadováno, předem. Samotná aktualizace těchto zásad ani přijetí obchodních podmínek nepředstavuje souhlas se zpracováním, které vyžaduje samostatný souhlas.',
  },
  {
    title: 'Kontaktujte nás',
    body: 'Pokud máte otázky týkající se těchto Zásad ochrany osobních údajů nebo vašich osobních údajů, kontaktujte nás na:',
  },
]

const contactEmail = 'support@liftag.fit'
</script>

<template>
  <div class="legal-page">
    <main>
      <article class="legal">
        <header class="legal-hero container">
          <p class="protocol legal-eyebrow">▸ OCHRANA OSOBNÍCH ÚDAJŮ</p>
          <h1 class="display legal-title">Ochrana osobních <span class="lime">údajů.</span></h1>
          <p class="legal-updated">Poslední aktualizace: {{ lastUpdated }}</p>
          <LegalLangLinks kind="privacy" />
        </header>

        <div class="container legal-body">
          <section
            v-for="section in sections"
            :key="section.title"
            class="legal-section"
          >
            <h2>{{ section.title }}</h2>
            <p v-for="(paragraph, index) in section.body.split('\n\n')" :key="index">{{ paragraph }}</p>
          </section>

          <p class="legal-contact-email">
            <a :href="`mailto:${contactEmail}`">{{ contactEmail }}</a>
          </p>
        </div>
      </article>
    </main>
  </div>
</template>

<style scoped>
.legal-page {
  min-height: var(--liftag-stable-vh);
  background:
    radial-gradient(circle at 82% 18%, rgba(204, 255, 0, 0.09), transparent 34%),
    radial-gradient(circle at 18% 76%, rgba(255, 45, 85, 0.04), transparent 36%),
    #000;
  color: #fff;
}

.legal-hero {
  padding: 150px 0 40px;
}

.legal-eyebrow {
  color: var(--liftag-primary);
  margin: 0 0 18px;
}

.legal-title {
  max-width: 920px;
  font-size: clamp(48px, 7.4vw, 112px);
}

.legal-updated {
  margin: 24px 0 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  font-weight: 300;
}

.legal-body {
  padding: 24px 0 80px;
  max-width: 820px;
}

.legal-section {
  padding: 28px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.legal-section h2 {
  margin: 0 0 14px;
  font-family: var(--liftag-font-headline);
  font-size: clamp(22px, 2.8vw, 32px);
  font-style: italic;
  text-transform: uppercase;
  line-height: 1.1;
}

.legal-section p {
  color: rgba(255, 255, 255, 0.74);
  font-size: 16px;
  font-weight: 300;
  line-height: 1.7;
  margin: 0;
}

.legal-section p + p {
  margin-top: 1em;
}

.legal-contact-email {
  margin: 18px 0 0;
  font-size: 16px;
}

.legal-contact-email a {
  color: var(--liftag-primary);
  text-decoration: underline;
  text-decoration-color: rgba(204, 255, 0, 0.4);
  text-underline-offset: 3px;
}

@media (max-width: 900px) {
  .legal-hero {
    padding-top: calc(120px + var(--liftag-safe-top));
  }
}

@media (max-width: 620px) {
  .legal-hero {
    padding: calc(108px + var(--liftag-safe-top)) 0 32px;
  }
}
</style>
