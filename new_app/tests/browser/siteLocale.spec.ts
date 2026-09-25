import { expect, test, type Page } from '@playwright/test'
import { discoveryIds as ids } from '../fixtures/discovery'

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
})

async function switchLanguage(page: Page, language: 'English' | 'Slovenčina') {
  await page.getByRole('button', { name: /^(?:Language|Jazyk):/ }).click()
  await page.getByRole('option', { name: language, exact: true }).click()
}

test('the logo returns to the Slovak homepage after switching language without a redirect loop', async ({
  page,
  context,
}) => {
  await page.goto('/contact/support', { waitUntil: 'domcontentloaded' })
  await switchLanguage(page, 'Slovenčina')
  await expect(page).toHaveURL(/\/sk\/contact\/support$/)
  await expect(page.locator('.nav-logo')).toHaveAttribute('href', '/sk')
  await page.locator('.nav-logo').click()
  await expect(page).toHaveURL(/\/sk$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'sk')
  await expect(page.getByRole('button', { name: 'Jazyk: Slovenčina', exact: true })).toBeVisible()
  expect((await context.cookies()).find((cookie) => cookie.name === 'liftag-language')?.value).toBe('sk')

  // Also accept the slash URL left by a previously cached directory redirect.
  const response = await page.goto('/sk/?source=logo#lifters', { waitUntil: 'domcontentloaded' })
  expect(response?.status()).toBe(200)
  await expect(page.locator('html')).toHaveAttribute('lang', 'sk')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://liftag.fit/sk')
  await expect(page).toHaveURL((url) => url.searchParams.get('source') === 'logo' && url.hash === '#lifters')
})

test('switching preserves query and anchor, and saves only a manual preference', async ({
  page,
  context,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => {
    // The real Turnstile key rejects localhost; this suite never submits a form.
    if (!/turnstile|cloudflare|challenges\.cloudflare/i.test(error.message)) errors.push(error.message)
  })
  await page.goto('/sk/contact/support?source=locale-test#contact-form', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('html')).toHaveAttribute('lang', 'sk')
  await expect(page).toHaveTitle('Podpora | LIFTAG')
  expect((await context.cookies()).find((cookie) => cookie.name === 'liftag-language')).toBeUndefined()
  await switchLanguage(page, 'English')
  await expect(page).toHaveURL(/\/contact\/support\?source=locale-test#contact-form$/)
  await expect.poll(() => new URL(page.url()).pathname).toBe('/contact/support')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page).toHaveTitle('Support | LIFTAG')
  const preference = (await context.cookies()).find((cookie) => cookie.name === 'liftag-language')
  expect(preference?.value).toBe('en')
  expect(preference!.expires - Date.now() / 1000).toBeGreaterThan(360 * 86400)
  await switchLanguage(page, 'Slovenčina')
  await expect(page).toHaveURL(/\/sk\/contact\/support\?source=locale-test#contact-form$/)
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'sk')
  expect(errors).toEqual([])
})

test('keyboard language selection and longer Slovak form labels fit the viewport', async ({
  page,
  isMobile,
}) => {
  await page.goto('/contact/support', { waitUntil: 'domcontentloaded' })
  const trigger = page.getByRole('button', { name: 'Language: English', exact: true })
  await trigger.focus()
  await trigger.press('ArrowDown')
  await expect(page.getByRole('option', { name: 'English', exact: true })).toBeFocused()
  await page.keyboard.press('End')
  await expect(page.getByRole('option', { name: 'Slovenčina', exact: true })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('html')).toHaveAttribute('lang', 'sk')
  await expect(page.getByRole('textbox', { name: 'Meno', exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true)
  if (isMobile) await page.screenshot({ path: 'test-results/slovak-form-mobile.png', fullPage: true })
})

test('gym equipment keeps a manual English switch on a Slovak gym', async ({ page }) => {
  await page.goto(`/sk/gyms/${ids.gym}/equipment?lang=sk`)
  await expect(page.locator('html')).toHaveAttribute('lang', 'sk')
  await switchLanguage(page, 'English')
  await expect.poll(() => new URL(page.url()).pathname).toBe(`/gyms/${ids.gym}/equipment`)
  await expect.poll(() => new URL(page.url()).searchParams.get('lang')).toBe('en')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByRole('button', { name: 'Language: English', exact: true })).toBeVisible()
})

test('discovery switching preserves pending input and selected gym identities', async ({ page }) => {
  await page.goto(`/explore?lang=en&gym=${ids.gym}&manufacturers=${ids.brand}`)
  // Wait for the client discovery request before typing into SSR markup.
  await expect(page.locator('[data-gym-id]').first()).toBeVisible()
  const search = page.getByRole('searchbox')
  await search.fill('slow')
  await switchLanguage(page, 'Slovenčina')
  await expect(page.locator('html')).toHaveAttribute('lang', 'sk')
  await expect(search).toHaveValue('slow')
  await expect.poll(() => new URL(page.url()).pathname).toBe('/sk/explore')
  await expect.poll(() => new URL(page.url()).searchParams.get('gym')).toBe(ids.gym)
  await expect.poll(() => new URL(page.url()).searchParams.get('manufacturers')).toBe(ids.brand)
})

test('localized catalog requests isolate names, previews and canonical context', async ({
  page,
  request,
}) => {
  for (const [locale, expectedName, video] of [
    ['en', 'Barbell Bench Press', 'https://example.com/fixture-en.m3u8'],
    ['sk', 'Tlaky s veľkou činkou na rovnej lavičke', 'https://example.com/fixture-sk.m3u8'],
  ] as const) {
    const response = await request.get(`/api/catalog/search-index?locale=${locale}`)
    expect(response.ok()).toBe(true)
    const index = await response.json()
    expect(index.exercises[0].name).toBe(expectedName)
    expect(index.exercises[0].previewVideoUrl).toBe(video)
  }
  await page.goto(`/exercises/${ids.exercise}?gym=${ids.gym}&machine=${ids.machine}&exercise=${ids.exercise}`)
  await expect(page.locator('html')).toHaveAttribute('lang', 'sk')
  await expect(page.getByRole('heading', { name: 'Vlastný cvik', exact: true })).toBeVisible()
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
  const url = new URL(canonical!)
  expect(url.pathname).toBe(`/sk/exercises/${ids.exercise}`)
  expect(url.searchParams.get('gym')).toBe(ids.gym)
  expect(url.searchParams.get('lang')).toBeNull()
})

test('legacy query links retain anchors and public paths override the saved preference', async ({
  page,
  context,
}) => {
  await context.addCookies([{ name: 'liftag-language', value: 'sk', domain: '127.0.0.1', path: '/' }])
  await page.goto('/contact/support?lang=sk&source=legacy#contact-form', { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/sk\/contact\/support\?lang=sk&source=legacy#contact-form$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'sk')
  await page.goto('/contact/support', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page).toHaveTitle('Support | LIFTAG')
})

test('desktop install navigation retains the stable path and selected language', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'Mobile install routes intentionally redirect to the external app stores.')
  await page.goto('/sk/contact/support', { waitUntil: 'domcontentloaded' })
  // An opened menu proves the page has hydrated before following its client-side link.
  await page.getByRole('button', { name: /^Jazyk:/ }).click()
  await expect(page.getByRole('option', { name: 'Slovenčina', exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await page.locator('a[href="/get?lang=sk"]:visible').first().click()
  await expect(page).toHaveURL(/\/get\?lang=sk$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'sk')
})

test('Slovak editorial pages and calculator render readable content without page overflow', async ({
  page,
}) => {
  test.setTimeout(120000)
  const hydrationWarnings: string[] = []
  page.on('console', (message) => {
    if (/hydration.*mismatch|Duplicate useI18n|not found.*(?:locale|message)/i.test(message.text()))
      hydrationWarnings.push(message.text())
  })
  for (const path of [
    '/sk/pricing',
    '/sk/journal/what-is-rpe-lifting',
    '/sk/tools/1rm-calculator',
    '/sk/exercises/barbell-bench-press',
  ]) {
    await page.goto(path, { waitUntil: 'domcontentloaded' })
    await expect(page.locator('html')).toHaveAttribute('lang', 'sk')
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), path).toBe(true)
  }
  await expect(page.getByText('ČASTÉ CHYBY', { exact: true })).toBeVisible()
  await page.goto('/sk/tools/1rm-calculator')
  await page.getByRole('button', { name: /^Jazyk:/ }).click()
  await expect(page.getByRole('option', { name: 'Slovenčina', exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  const weight = page.locator('#orm-weight')
  await weight.fill('0')
  await expect(page.locator('#orm-weight-error')).toHaveText('Záťaž musí byť väčšia ako 0.')
  await switchLanguage(page, 'English')
  await expect(page).toHaveURL(/\/tools\/1rm-calculator\?w=0(?:&|$)/)
  await expect(weight).toHaveValue('0')
  await expect(page.locator('#orm-weight-error')).toHaveText('Weight has to be greater than 0.')
  await switchLanguage(page, 'Slovenčina')
  await expect(page).toHaveURL(/\/sk\/tools\/1rm-calculator\?w=0(?:&|$)/)
  await expect(weight).toHaveValue('0')
  await expect(page.locator('#orm-weight-error')).toHaveText('Záťaž musí byť väčšia ako 0.')
  await weight.fill('62.5')
  await weight.blur()
  await expect(page.getByText('Opakovania', { exact: true }).first()).toBeVisible()
  expect(hydrationWarnings).toEqual([])
})

test('missing localized instruction video keeps its guide and retry action usable', async ({ page }) => {
  await page.route('https://example.com/**', (route) => route.abort())
  await page.goto('/sk/exercises/barbell-bench-press')
  await page.getByRole('button', { name: /^Jazyk:/ }).click()
  await expect(page.getByRole('option', { name: 'Slovenčina', exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: /^Pozrieť techniku cviku:/ }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Video sa nepodarilo načítať' })).toBeVisible({
    timeout: 20000,
  })
  await expect(page.getByRole('button', { name: 'Skúsiť video znova', exact: true })).toBeVisible()
  await expect(page.getByText('ČASTÉ CHYBY', { exact: true })).toBeVisible()
})

test('gym demo initializes in Slovak with normal motion enabled', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/sk/demo', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('html')).toHaveAttribute('lang', 'sk')
  await expect(page.getByText('Tvoje stroje.', { exact: true }).first()).toBeVisible({ timeout: 20000 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true)
  await page.evaluate(() => window.scrollBy(0, 700))
  await expect(page.locator('canvas').first()).toBeAttached()
})

test('localized marketing and comparison pages fit desktop and mobile', async ({
  page,
  isMobile,
}, testInfo) => {
  test.setTimeout(120000)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (/hydration.*mismatch|not found.*(?:locale|message)/i.test(message.text())) errors.push(message.text())
  })
  for (const path of [
    '/',
    '/sk',
    '/sk/for-gyms',
    '/sk/best-workout-tracking-app',
    '/sk/best-gym-qr-nfc-app',
    '/sk/alternatives/hevy',
    '/sk/vs/strong',
  ]) {
    await page.goto(path, { waitUntil: 'domcontentloaded' })
    const language = path === '/' ? 'en' : 'sk'
    await expect(page.locator('html')).toHaveAttribute('lang', language)
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
    await page.getByRole('button', { name: /^(?:Jazyk|Language):/ }).click()
    await expect(
      page.getByRole('option', { name: language === 'sk' ? 'Slovenčina' : 'English', exact: true }),
    ).toBeVisible()
    await page.keyboard.press('Escape')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), path).toBe(true)
    expect(await page.locator('body').innerText()).not.toMatch(/\[object Object\]|"type":\s*0/)
    if (path === '/' || path === '/sk') {
      const accentWords = page.locator('.hero-laser-green:visible')
      await expect(accentWords).toHaveCount(2)
      for (const word of await accentWords.all()) {
        await expect(word).toHaveCSS('color', 'rgb(204, 255, 0)')
        await expect(word).not.toHaveClass(/hero-laser-red/)
      }
      await expect(page.locator(isMobile ? '.hero-mobile-details' : '.hero-badges')).toHaveCSS('opacity', '1')
      await page.evaluate(() => document.fonts.ready)
      if (isMobile) {
        const wordBounds = await page
          .locator('.hero-mobile-title .hero-laser-reveal')
          .evaluateAll((words) =>
            words.map((word) => ({
              left: word.getBoundingClientRect().left,
              right: word.getBoundingClientRect().right,
              viewport: innerWidth,
            })),
          )
        expect(wordBounds.every((word) => word.left >= 0 && word.right <= word.viewport)).toBe(true)
      }
      await page.screenshot({ path: testInfo.outputPath(`home-${language}.png`) })
    } else if (path === '/sk/alternatives/hevy') {
      await page.screenshot({ path: testInfo.outputPath('comparison.png') })
    }
  }
  expect(errors).toEqual([])
})

test('Slovak navigation retains language on home sections and the catalog', async ({ page }) => {
  await page.goto('/sk/pricing')
  await expect(page.getByRole('button', { name: 'Jazyk: Slovenčina', exact: true })).toBeVisible()
  const menu = page.getByRole('button', { name: 'Otvoriť menu', exact: true })
  if (await menu.isVisible()) await menu.click()
  const nav = page.locator('.site-nav, #mobile-navigation')
  await expect(nav.locator('a[href="/sk/exercises"]').filter({ visible: true })).toBeVisible()
  // On desktop the audience sections sit behind the "Pre koho" menu.
  const audience = page.getByRole('button', { name: 'Pre koho', exact: true })
  if (await audience.isVisible()) await audience.click()
  await nav.locator('a[href="/sk#lifters"]').filter({ visible: true }).click()
  await expect(page).toHaveURL(/\/sk#lifters$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'sk')
})

test('Slovak result dial and curve keep numerical and accessible meanings', async ({ page }) => {
  await page.goto('/sk/tools/1rm-calculator')
  const reps = page.getByRole('textbox', { name: 'Opakovania', exact: true })
  const weight = page.getByRole('textbox', { name: 'Zdvihnutá hmotnosť kg', exact: true })
  await reps.fill('1')
  await weight.fill('62.5')
  await weight.blur()
  const dial = page.locator('.max-readout .number-dial')
  await expect(dial).toHaveText('62,5')
  await weight.fill('70')
  await weight.blur()
  await expect(dial).toHaveText('70')
  await expect(dial).toHaveCSS('--roll-direction', '1')
  await weight.fill('62.5')
  await weight.blur()
  await expect(dial).toHaveText('62,5')
  await expect(dial).toHaveCSS('--roll-direction', '-1')
  const slider = page.getByRole('slider', { name: 'Preskúmať cieľ opakovaní', exact: true })
  await expect(slider).toHaveAttribute('aria-valuetext', /Odhadované maximum pre daný počet opakovaní/)
  await expect(slider).not.toHaveAttribute('aria-valuetext', /1RM/)
})
