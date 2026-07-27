import { Buffer } from 'node:buffer'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import sharp from 'sharp'

/**
 * Renders the 1200x630 share-preview card used as og:image for routine and
 * plan share links. Satori consumes plain react-like element objects (no JSX)
 * and a limited flexbox CSS subset; every multi-child div must declare
 * display:flex. Output SVG is rasterized by resvg.
 */

const CARD_WIDTH = 1200
const CARD_HEIGHT = 630
const MAX_TILES = 4

const COLORS = {
  bg: '#0E0E0E',
  surface: '#1A1A1A',
  surfaceRaised: '#232323',
  primary: '#CCFF00',
  text: '#FFFFFF',
  textSecondary: '#A1A1A1',
}

export interface OgCardTile {
  label: string
  imageUrl: string | null
}

export interface OgCardModel {
  caption: string
  name: string
  chips: string[]
  tiles: OgCardTile[]
}

interface VNode {
  type: string
  props: {
    style?: Record<string, string | number>
    children?: VNode | VNode[] | string
    src?: string
  }
}

const el = (type: string, style: Record<string, string | number>, children?: VNode | VNode[] | string, extra?: Record<string, string>): VNode => ({
  type,
  props: { style, ...(children !== undefined ? { children } : {}), ...(extra ?? {}) },
})

let fontsPromise: Promise<{ name: string, data: ArrayBuffer, weight: 400 | 500 | 600 | 700, style: 'normal' }[]> | null = null

async function loadFonts() {
  if (!fontsPromise) {
    fontsPromise = (async () => {
      const storage = useStorage('assets:server')
      const load = async (file: string): Promise<ArrayBuffer> => {
        const raw = await storage.getItemRaw<Buffer>(`fonts/${file}`)
        if (!raw) throw new Error(`OG card font asset missing: ${file}`)
        const buf = Buffer.from(raw as unknown as Uint8Array)
        return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
      }
      return [
        { name: 'Space Grotesk', data: await load('space-grotesk-700.ttf'), weight: 700 as const, style: 'normal' as const },
        { name: 'Space Grotesk', data: await load('space-grotesk-500.ttf'), weight: 500 as const, style: 'normal' as const },
        { name: 'Inter', data: await load('inter-600.ttf'), weight: 600 as const, style: 'normal' as const },
        { name: 'Inter', data: await load('inter-400.ttf'), weight: 400 as const, style: 'normal' as const },
      ]
    })()
    // A failed load must not poison every later render with a rejected cache.
    fontsPromise.catch(() => { fontsPromise = null })
  }
  return fontsPromise
}

/**
 * Fetch a remote image and normalize it to a JPEG data URI sized for a card
 * tile. Catalog exercise images are webp, which neither satori nor resvg can
 * decode, so sharp re-encodes everything. Returns null on any failure; the
 * tile then falls back to an initial on a dark surface.
 */
export async function fetchTileImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return null
    const input = Buffer.from(await res.arrayBuffer())
    const jpeg = await sharp(input)
      .resize(360, 300, { fit: 'cover', position: 'attention' })
      .jpeg({ quality: 78 })
      .toBuffer()
    return `data:image/jpeg;base64,${jpeg.toString('base64')}`
  }
  catch {
    return null
  }
}

const BLANK_SVG_URI = `data:image/svg+xml;base64,${Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"/>').toString('base64')}`
const emojiCache = new Map<string, string>()

/**
 * Satori has no emoji font; unresolved glyphs render as tofu boxes. Resolve
 * emoji segments to Twemoji SVGs (jdecked/twemoji is the maintained fork).
 * Twemoji file names drop the FE0F variation selector, so try both spellings.
 * Failures resolve to a blank glyph, which beats a tofu box in a share card.
 */
async function loadEmoji(segment: string): Promise<string> {
  const cached = emojiCache.get(segment)
  if (cached) return cached
  const codes = [...segment].map(c => c.codePointAt(0)!.toString(16))
  const candidates = [...new Set([codes.join('-'), codes.filter(c => c !== 'fe0f').join('-')])]
  for (const candidate of candidates) {
    try {
      const res = await fetch(
        `https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/${candidate}.svg`,
        { signal: AbortSignal.timeout(4000) },
      )
      if (res.ok) {
        const uri = `data:image/svg+xml;base64,${Buffer.from(await res.text()).toString('base64')}`
        emojiCache.set(segment, uri)
        return uri
      }
    }
    catch {
      // Try the next spelling, then fall through to the blank glyph.
    }
  }
  emojiCache.set(segment, BLANK_SVG_URI)
  return BLANK_SVG_URI
}

function chip(text: string): VNode {
  return el('div', {
    display: 'flex',
    backgroundColor: COLORS.surface,
    color: COLORS.textSecondary,
    fontFamily: 'Inter',
    fontWeight: 400,
    fontSize: 21,
    padding: '10px 22px',
    borderRadius: 999,
  }, text)
}

function tileLabel(label: string): VNode {
  return el('div', {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    padding: '34px 16px 13px 16px',
    background: 'linear-gradient(to bottom, rgba(14,14,14,0), rgba(14,14,14,0.88))',
  }, el('div', {
    color: COLORS.text,
    fontFamily: 'Inter',
    fontWeight: 600,
    fontSize: 18,
    lineClamp: 1,
  }, label))
}

function tile(t: { label?: string, imageDataUri?: string | null, plus?: number }, width: number): VNode {
  const base: Record<string, string | number> = {
    position: 'relative',
    display: 'flex',
    width,
    height: '100%',
    borderRadius: 28,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  }
  if (t.plus !== undefined) {
    return el('div', { ...base, alignItems: 'center', justifyContent: 'center' },
      el('div', {
        color: COLORS.primary,
        fontFamily: 'Space Grotesk',
        fontWeight: 700,
        fontSize: 52,
      }, `+${t.plus}`))
  }
  const children: VNode[] = []
  if (t.imageDataUri) {
    children.push(el('img', { width: '100%', height: '100%', objectFit: 'cover' }, undefined, { src: t.imageDataUri }))
  }
  else {
    children.push(el('div', {
      display: 'flex',
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.surfaceRaised,
    }, el('div', {
      color: COLORS.primary,
      fontFamily: 'Space Grotesk',
      fontWeight: 700,
      fontSize: 56,
      opacity: 0.85,
    }, (t.label ?? '?').trim().charAt(0).toUpperCase() || '?')))
  }
  if (t.label) children.push(tileLabel(t.label))
  return el('div', base, children)
}

export async function renderOgCard(model: OgCardModel): Promise<Buffer> {
  const fonts = await loadFonts()

  const overflow = model.tiles.length > MAX_TILES
  const shown = overflow ? model.tiles.slice(0, MAX_TILES - 1) : model.tiles.slice(0, MAX_TILES)
  const tileCount = shown.length + (overflow ? 1 : 0)
  const tileGap = 22
  const tileWidth = tileCount > 0
    ? Math.floor((CARD_WIDTH - 2 * 56 - (tileCount - 1) * tileGap) / tileCount)
    : 0

  const tileImages = await Promise.all(
    shown.map(t => (t.imageUrl ? fetchTileImage(t.imageUrl) : Promise.resolve(null))),
  )

  const tilesRow = tileCount > 0
    ? el('div', { display: 'flex', flexGrow: 1, gap: tileGap, marginTop: 30 }, [
        ...shown.map((t, i) => tile({ label: t.label, imageDataUri: tileImages[i] }, tileWidth)),
        ...(overflow ? [tile({ plus: model.tiles.length - shown.length }, tileWidth)] : []),
      ])
    : el('div', { display: 'flex', flexGrow: 1 })

  const root = el('div', {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.bg,
    backgroundImage: `radial-gradient(circle at 88% -18%, rgba(204,255,0,0.16), rgba(204,255,0,0) 52%)`,
    padding: '52px 56px 48px 56px',
  }, [
    el('div', { display: 'flex', alignItems: 'center' }, [
      el('div', {
        color: COLORS.text,
        fontFamily: 'Space Grotesk',
        fontWeight: 700,
        fontSize: 36,
        letterSpacing: 1,
      }, 'LIFTAG'),
      el('div', {
        display: 'flex',
        width: 12,
        height: 12,
        marginLeft: 10,
        marginTop: 14,
        backgroundColor: COLORS.primary,
      }),
      el('div', {
        display: 'flex',
        marginLeft: 'auto',
        color: COLORS.textSecondary,
        fontFamily: 'Inter',
        fontWeight: 400,
        fontSize: 22,
      }, 'liftag.fit'),
    ]),
    el('div', {
      display: 'flex',
      marginTop: 34,
      color: COLORS.primary,
      fontFamily: 'Inter',
      fontWeight: 600,
      fontSize: 20,
      letterSpacing: 5,
    }, model.caption.toUpperCase()),
    el('div', {
      display: 'flex',
      marginTop: 10,
      color: COLORS.text,
      fontFamily: 'Space Grotesk',
      fontWeight: 700,
      fontSize: model.name.length > 32 ? 46 : 58,
      lineHeight: 1.1,
      lineClamp: 2,
    }, model.name),
    ...(model.chips.length > 0
      ? [el('div', { display: 'flex', gap: 14, marginTop: 24, flexWrap: 'wrap' }, model.chips.map(chip))]
      : []),
    tilesRow,
  ])

  const svg = await satori(root as never, {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    fonts,
    loadAdditionalAsset: async (code: string, segment: string) =>
      code === 'emoji' ? loadEmoji(segment) : segment,
  })

  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: CARD_WIDTH },
    font: { loadSystemFonts: false },
  }).render().asPng()

  return Buffer.from(png)
}
