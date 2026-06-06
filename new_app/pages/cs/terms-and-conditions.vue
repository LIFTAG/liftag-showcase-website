<script setup lang="ts">
const path = '/cs/terms-and-conditions'
const lastUpdated = 'květen 2026'

useLiftagSeo({
  title: 'Obchodní podmínky | LIFTAG',
  description:
    'Podmínky, kterými se řídí vaše používání tréninkové aplikace LIFTAG — způsobilost, odpovědnost za účet, obsah a přijatelné používání.',
  path,
})

useLiftagStructuredData([
  liftagOrganization,
  liftagBreadcrumbs([
    { name: 'LIFTAG', path: '/' },
    { name: 'Obchodní podmínky', path },
  ]),
])

const sections = [
  {
    title: 'Způsobilost',
    body: 'K používání Liftag vám musí být alespoň 16 let. Vytvořením nebo používáním účtu potvrzujete, že tento požadavek splňujete a že údaje, které poskytujete, jsou pravdivé.',
  },
  {
    title: 'Odpovědnost za účet',
    body: 'Odpovídáte za svůj účet, přihlašovací údaje, profilové informace, tréninky, nahraný obsah a aktivitu v Liftag. Své přihlašovací údaje chraňte a oznamte nám, pokud máte podezření na neoprávněný přístup.',
  },
  {
    title: 'Žádné lékařské poradenství',
    body: 'Liftag poskytuje pouze sledování tréninků, instruktážní a informační obsah. Nejedná se o lékařské poradenství, diagnózu, léčbu ani náhradu odborné lékařské péče. Před zahájením nebo změnou cvičebního programu se poraďte s kvalifikovaným odborníkem.',
  },
  {
    title: 'Riziko cvičení a vybavení',
    body: 'Cvičení a vybavení posilovny jsou spojeny s rizikem zranění. Řiďte se vlastním úsudkem, pravidly posilovny a pokyny k vybavení, přestaňte, pokud něco působí nebezpečně, a v případě potřeby vyhledejte pomoc kvalifikovaného personálu nebo lékaře.',
  },
  {
    title: 'Cviky a video obsah',
    body: 'Popisy cviků, videa, QR rozlišení, rutiny, statistiky a doporučení mají informační charakter a nemusí vyhovovat vašemu tělu, vybavení nebo okolnostem. Vy nadále nesete odpovědnost za rozhodnutí, zda a jak budete jakoukoli aktivitu provádět.',
  },
  {
    title: 'Nahrávky a uživatelský obsah',
    body: 'Pokud nahráváte fotografie, videa, vlastní cviky, zprávy nebo jiný obsah, musíte mít právo jej sdílet a musí být zákonný, respektující a bezpečný. Obsah, který porušuje tyto Podmínky nebo škodí službě, můžeme odstranit.',
  },
  {
    title: 'Přijatelné používání',
    body: 'Nezneužívejte Liftag, nenarušujte službu, nepokoušejte se o neoprávněný přístup, nenahrávejte škodlivý obsah, nevydávejte se za jiné, neobtěžujte uživatele a nepoužívejte aplikaci k nezákonné činnosti.',
  },
  {
    title: 'Služby třetích stran',
    body: 'Liftag se může spoléhat na služby třetích stran, jako jsou Supabase, Google, Apple, Sentry, Resend, Cloudflare Turnstile, Strava, YouTube/WebView, mapové a lokalizační služby a úložiště médií S3/AWS. Mohou se vztahovat i jejich vlastní podmínky a zásady.',
  },
  {
    title: 'Pozastavení a ukončení',
    body: 'Přístup můžeme pozastavit nebo ukončit, pokud porušíte tyto Podmínky, vytvoříte riziko pro ostatní uživatele nebo službu, nebo pokud to vyžaduje zákon. Používání Liftag můžete ukončit nebo požádat o vymazání účtu v aplikaci.',
  },
  {
    title: 'Změny',
    body: 'Tyto Podmínky můžeme aktualizovat. V případě podstatných změn vás můžeme požádat o přijetí aktualizované verze před dalším používáním funkcí produktu.',
  },
  {
    title: 'Subjekt a rozhodné právo',
    body: 'Tyto Podmínky se řídí příslušnými právními předpisy, včetně závazné ochrany spotřebitele, která se na vás vztahuje. Případné spory budou řešit soudy nebo orgány, které mají podle těchto předpisů pravomoc.',
  },
  {
    title: 'Kontakt',
    body: 'Dotazy k těmto Podmínkám můžete posílat na:',
  },
]

const contactEmail = 'support@liftag.fit'
</script>

<template>
  <div class="legal-page">
    <SiteNav />

    <main>
      <article class="legal">
        <header class="legal-hero container">
          <p class="protocol legal-eyebrow">▸ OBCHODNÍ PODMÍNKY</p>
          <h1 class="display legal-title">Obchodní <span class="lime">podmínky.</span></h1>
          <p class="legal-updated">Poslední aktualizace: {{ lastUpdated }}</p>
        </header>

        <div class="container legal-body">
          <section
            v-for="section in sections"
            :key="section.title"
            class="legal-section"
          >
            <h2>{{ section.title }}</h2>
            <p>{{ section.body }}</p>
          </section>

          <p class="legal-contact-email">
            <a :href="`mailto:${contactEmail}`">{{ contactEmail }}</a>
          </p>
        </div>
      </article>
    </main>

    <SiteFooter />
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
    padding-top: 120px;
  }
}

@media (max-width: 620px) {
  .legal-hero {
    padding: 108px 0 32px;
  }
}
</style>
