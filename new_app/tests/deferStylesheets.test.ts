import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { deferRenderBlockingStylesheets } from '../utils/deferStylesheets.ts'
import {
  GYM_ARRIVAL_BOOTSTRAP_MARK,
  GYM_ARRIVAL_BOOTSTRAP_SCRIPT,
  GYM_ARRIVAL_BOOTSTRAP_STYLE,
  GYM_ARRIVAL_OVERLAY_ID,
} from '../utils/gymscan/arrivalBootstrap.ts'
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

test('gym arrival bootstrap covers the demo before nav and headlines paint', () => {
  assert.match(GYM_ARRIVAL_BOOTSTRAP_SCRIPT, new RegExp(GYM_ARRIVAL_BOOTSTRAP_MARK))
  assert.match(GYM_ARRIVAL_BOOTSTRAP_SCRIPT, /location\.hash/)
  assert.match(GYM_ARRIVAL_BOOTSTRAP_SCRIPT, /prefers-reduced-motion: reduce/)
  assert.match(GYM_ARRIVAL_BOOTSTRAP_STYLE, /\.gx-arrival\{[^}]*z-index:80/)
  assert.match(GYM_ARRIVAL_BOOTSTRAP_STYLE, /html\[data-gym-arrival=play\] \.gx>:not\(\.gx-arrival\)/)
  assert.match(GYM_ARRIVAL_BOOTSTRAP_STYLE, /html\[data-gym-arrival=open\] \.gx-opening/)
  assert.equal(GYM_ARRIVAL_OVERLAY_ID, 'gx-arrival')
  const plugin = readFileSync(new URL('../server/plugins/pagespeedHead.ts', import.meta.url), 'utf8')
  assert.match(plugin, /GYM_ARRIVAL_OVERLAY_ID/)
  assert.match(plugin, /ARRIVAL_HEAD/)
})
