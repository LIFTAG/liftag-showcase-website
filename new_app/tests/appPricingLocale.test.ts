import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  hevyPricing,
  strongPricing,
  liftagPricing,
  localizedAppPricing,
  priceCell,
} from '../utils/appPricing.ts'

test('localized prices retain the same dated dollar amounts and source URLs', () => {
  assert.equal(hevyPricing.paidPrice, '$2.99 / month, $23.99 / year, or $74.99 lifetime')
  assert.equal(strongPricing.paidPrice, '$4.99 / month or $29.99 / year')
  for (const app of [hevyPricing, strongPricing, liftagPricing]) {
    const localized = localizedAppPricing(app, 'sk')
    assert.equal(localized.sourceUrl, app.sourceUrl)
    assert.equal(localized.name, app.name)
    assert.notEqual(localized.caveat, app.caveat)
  }
  assert.match(priceCell(hevyPricing, 'sk'), /2,99.*USD mesačne.*23,99.*USD ročne.*74,99.*USD.*doživotie/)
  assert.equal(localizedAppPricing(liftagPricing, 'sk').paidPrice, null)
})
