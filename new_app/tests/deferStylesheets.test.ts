import assert from 'node:assert/strict'
import { test } from 'node:test'
import { deferRenderBlockingStylesheets } from '../utils/deferStylesheets.ts'
import { VIEWPORT_BOOTSTRAP_MARK, VIEWPORT_BOOTSTRAP_SCRIPT } from '../utils/viewportBootstrap.ts'

test('preloads stylesheets without a leftover blocking link', () => {
  const html = '<link rel="stylesheet" href="/_nuxt/entry.css" crossorigin>'
  const next = deferRenderBlockingStylesheets(html)

  assert.match(next, /^<link rel="preload" as="style"/)
  assert.match(next, /onload="this.onload=null;this.rel='stylesheet'"/)
  assert.equal(next.includes('rel="stylesheet"'), false)
})

test('leaves already-deferred links alone', () => {
  const html = '<link rel="stylesheet" href="/x.css" onload="this.media=\'all\'">'
  assert.equal(deferRenderBlockingStylesheets(html), html)
})

test('ignores non-stylesheet links', () => {
  const html = '<link rel="preload" as="font" href="/f.woff2">'
  assert.equal(deferRenderBlockingStylesheets(html), html)
})

test('viewport bootstrap publishes the same short-viewport cutoff as the plugin', () => {
  assert.match(VIEWPORT_BOOTSTRAP_SCRIPT, /h<=740/)
  assert.match(VIEWPORT_BOOTSTRAP_SCRIPT, /iw<=768/)
  assert.match(VIEWPORT_BOOTSTRAP_SCRIPT, new RegExp(VIEWPORT_BOOTSTRAP_MARK))
})
