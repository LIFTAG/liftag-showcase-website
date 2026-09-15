import { expect, test, type CDPSession, type Locator } from '@playwright/test'
import { discoveryIds } from '../fixtures/discovery'

// Uses the existing discovery fixture server (photo + playable video).
test.beforeEach(async ({ page }) => {
  await page.goto(`/sk/gyms/${discoveryIds.gym}?lang=sk`)
  await expect(page.getByRole('button', { name: 'Jazyk: Slovenčina', exact: true })).toBeVisible()
})

async function drag(cdp: CDPSession, from: { x: number; y: number }, to: { x: number; y: number }) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [from] })
  for (let i = 1; i <= 12; i++) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: from.x + (to.x - from.x) * i / 12, y: from.y + (to.y - from.y) * i / 12 }],
    })
    await new Promise(resolve => setTimeout(resolve, 16))
  }
}

async function swipe(cdp: CDPSession, carousel: Locator, direction = 1) {
  await carousel.scrollIntoViewIfNeeded()
  const box = (await carousel.boundingBox())!
  const start = await carousel.evaluate(el => el.scrollLeft)
  const from = { x: box.x + box.width * (direction > 0 ? 0.8 : 0.2), y: box.y + box.height * 0.4 }
  await drag(cdp, from, { x: from.x - direction * box.width * 0.6, y: from.y })
  // The content must move with the finger, before touchend.
  const during = await carousel.evaluate(el => el.scrollLeft)
  expect(Math.abs(during - start)).toBeGreaterThan(box.width * 0.3)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}

test('photos and videos share fullscreen navigation, keyboard controls, and reduced motion', async ({ page }) => {
  const gallery = page.locator('.d-gallery-stage')
  await gallery.getByRole('button', { name: 'Fotografie: Testovacie fitko', exact: true }).click()
  await page.getByRole('dialog').press('ArrowRight')
  await expect(page.getByRole('dialog').locator('video')).toBeVisible()
  await page.getByRole('dialog').press('Escape')
  await expect(page.getByRole('button', { name: 'Otvoriť galériu na celú obrazovku', exact: true })).toBeFocused()
  await gallery.getByRole('button', { name: 'Predchádzajúca', exact: true }).click()
  await gallery.getByRole('button', { name: 'Nasledujúca', exact: true }).click()
  await expect(gallery.locator('video')).toBeVisible()
  await page.getByRole('button', { name: 'Otvoriť galériu na celú obrazovku', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.locator('video')).toBeVisible()
  await expect(gallery.locator('video')).toHaveCount(0)
  await dialog.press('ArrowRight')
  await expect(dialog.locator('.d-expanded-controls')).toContainText('1 / 2')
  await expect(dialog.locator('.d-carousel-slide:not([inert]) img')).toBeVisible()
  await dialog.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(gallery.locator('.d-gallery-controls')).toContainText('1 / 2')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(gallery.locator('.d-carousel')).toHaveCSS('scroll-behavior', 'auto')
  await gallery.getByRole('button', { name: 'Predchádzajúca', exact: true }).click()
  await expect(gallery.locator('video')).toBeVisible()
  await page.setViewportSize({ width: 768, height: 900 })
  await expect.poll(() => gallery.locator('.d-carousel').evaluate(el => el.scrollLeft / el.clientWidth)).toBe(2)
})

test('native photo and video swipes animate, loop, and release playback in both views', async ({ page, browserName, isMobile }) => {
  test.skip(browserName !== 'chromium' || !isMobile, 'Native touch injection uses Chromium mobile emulation.')
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  const cdp = await page.context().newCDPSession(page)
  const carousel = page.locator('.d-gallery-stage .d-carousel')
  const counter = page.locator('.d-gallery-controls')
  await carousel.scrollIntoViewIfNeeded()
  const initialBox = (await carousel.boundingBox())!
  const initialScroll = await page.evaluate(() => scrollY)
  await drag(cdp, { x: initialBox.x + initialBox.width / 2, y: initialBox.y + initialBox.height * 0.7 },
    { x: initialBox.x + initialBox.width / 2, y: initialBox.y + initialBox.height * 0.2 })
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(initialScroll)
  await expect(counter).toContainText('1 / 2')
  await swipe(cdp, carousel)
  await expect(counter).toContainText('2 / 2')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  const player = page.locator('.d-gallery-stage video')
  const video = (await player.elementHandle())!
  await expect.poll(() => video.evaluate(el => (el as HTMLVideoElement).duration)).toBeGreaterThan(0)

  // Scrub the actual native timeline: it must seek without moving the carousel.
  const box = (await player.boundingBox())!
  const beforeSeek = await carousel.evaluate(el => el.scrollLeft)
  await drag(cdp, { x: box.x + box.width * 0.35, y: box.y + box.height - 22 },
    { x: box.x + box.width * 0.75, y: box.y + box.height - 22 })
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await expect.poll(() => video.evaluate(el => (el as HTMLVideoElement).currentTime)).toBeGreaterThan(1)
  expect(await carousel.evaluate(el => el.scrollLeft)).toBe(beforeSeek)
  await video.evaluate(el => (el as HTMLVideoElement).play())
  await swipe(cdp, carousel)
  await expect(counter).toContainText('1 / 2')
  expect(await video.evaluate(el => (el as HTMLVideoElement).paused)).toBe(true)
  expect(await video.getAttribute('src')).toBeNull()
  await expect.poll(() => carousel.evaluate(el => el.scrollLeft / el.clientWidth)).toBe(1)
  await swipe(cdp, carousel, -1)
  await expect(counter).toContainText('2 / 2')
  await page.getByRole('button', { name: 'Otvoriť galériu na celú obrazovku', exact: true }).click()
  const fullscreen = page.locator('dialog .d-carousel')
  await expect(page.locator('dialog video')).toBeVisible()
  await swipe(cdp, fullscreen)
  await expect(page.locator('.d-expanded-controls')).toContainText('1 / 2')
  await swipe(cdp, fullscreen, -1)
  await expect(page.locator('.d-expanded-controls')).toContainText('2 / 2')
  expect(errors).toEqual([])
})

test('zoomed photos pan without changing media and resume swiping after zooming out', async ({ page, browserName, isMobile }) => {
  test.skip(browserName !== 'chromium' || !isMobile, 'Viewport zoom testing uses Chromium mobile emulation.')
  const cdp = await page.context().newCDPSession(page)
  await page.getByRole('button', { name: 'Otvoriť galériu na celú obrazovku', exact: true }).click()
  const carousel = page.locator('dialog .d-carousel')
  await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 2 })
  await expect(carousel).toHaveCSS('overflow-x', 'hidden')
  const before = await carousel.evaluate(el => el.scrollLeft)
  await cdp.send('Input.synthesizeScrollGesture', { x: 100, y: 300, xDistance: -80, yDistance: 0, gestureSourceType: 'touch' })
  expect(await page.evaluate(() => window.visualViewport!.offsetLeft)).toBeGreaterThan(0)
  expect(await carousel.evaluate(el => el.scrollLeft)).toBe(before)
  await expect(page.locator('.d-expanded-controls')).toContainText('1 / 2')
  await cdp.send('Emulation.setPageScaleFactor', { pageScaleFactor: 1 })
  await expect(carousel).toHaveCSS('overflow-x', 'auto')
  await swipe(cdp, carousel)
  await expect(page.locator('.d-expanded-controls')).toContainText('2 / 2')
})
