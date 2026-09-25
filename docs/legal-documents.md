# Public legal documents

The public Terms and Privacy Policy are website content, maintained separately
from the mobile app. The dashboard links to these pages; its version header does
not update their text.

## Source files

- English and Slovak Terms: `new_app/content/legal/terms.ts`
- English and Slovak Privacy Policy: `new_app/content/legal/privacy.ts`
- Czech Terms: `new_app/pages/cs/terms-and-conditions.vue`
- Czech Privacy Policy: `new_app/pages/cs/privacy-policy.vue`
- Shared English/Slovak rendering: `new_app/components/legal/LegalArticle.vue`

English uses `/terms-and-conditions` and `/privacy-policy`; Slovak uses the same
paths under `/sk`, and Czech under `/cs`. Keep paragraph breaks in section bodies
as `\n\n`; the legal page templates render each paragraph separately.

## September 2026 synchronization

The English and Slovak text matches every displayed section in merged
[app PR #620](https://github.com/LIFTAG/liftag-app/pull/620), commit
`e9e6afcdb18d70c6b4a2ba3fd74e2d6feae7fc93`. Its source is `src/i18n/en.json`
and `src/i18n/sk.json` (`terms`, `privacy` and `legal`), with section ordering
defined by `app/profile/terms-and-conditions.tsx` and
`app/profile/privacy-policy.tsx`. The document version is `2026-09-24`;
the app displays September 2026. Czech is a website translation of that text.

## Updating and publishing

1. Confirm the intended app document revision and its approval status. A merged
   source PR alone does not establish approval of the legal text or translations.
2. Copy all displayed English and Slovak sections and update the corresponding
   Czech text. Keep the displayed dates aligned with the document version.
3. Run `pnpm verify` and check all six public document routes, including paragraph
   breaks, contact details, and language links.
4. Review and publish through the website's release process. The repository has
   Vercel configuration under `new_app`; verify the production deployment in the
   hosting project rather than treating a local edit or merge as publication.
5. Verify the live pages before releasing dashboard PR #77. Confirm API PR #483
   is deployed to the target environment, run the dashboard's labelled CI gate,
   and confirm the rollout decision that May/June acceptances remain valid.

If the version identifier changes, coordinate it with the app constants, API
legal policy, and dashboard opt-in header. Updating website text alone does not
change stored user acceptance records or obtain a new acceptance.
