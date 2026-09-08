import { Buffer } from 'node:buffer'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'

const CARD_WIDTH = 1200
const CARD_HEIGHT = 630

const COLORS = {
  bg: '#0E0E0E',
  primary: '#CCFF00',
  text: '#FFFFFF',
  muted: '#A1A1A1',
}

interface VNode {
  type: string
  props: {
    style?: Record<string, string | number>
    children?: VNode | VNode[] | string
  }
}

const el = (type: string, style: Record<string, string | number>, children?: VNode | VNode[] | string): VNode => ({
  type,
  props: { style, ...(children !== undefined ? { children } : {}) },
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
        { name: 'Inter', data: await load('inter-400.ttf'), weight: 400 as const, style: 'normal' as const },
        { name: 'Inter', data: await load('inter-600.ttf'), weight: 600 as const, style: 'normal' as const },
      ]
    })()
    fontsPromise.catch(() => { fontsPromise = null })
  }
  return fontsPromise
}

export async function renderOneRmOgCard(): Promise<Buffer> {
  const fonts = await loadFonts()
  const root = el('div', {
    display: 'flex',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '72px 80px',
    backgroundColor: COLORS.bg,
  }, [
    el('div', {
      display: 'flex',
      color: COLORS.primary,
      fontFamily: 'Inter',
      fontWeight: 600,
      fontSize: 20,
      letterSpacing: 6,
    }, 'LIFTAG  ·  1RM  ·  EPLEY'),
    el('div', {
      display: 'flex',
      marginTop: 22,
      color: COLORS.text,
      fontFamily: 'Space Grotesk',
      fontWeight: 700,
      fontSize: 72,
      lineHeight: 1.05,
    }, 'One-rep max calculator'),
    el('div', {
      display: 'flex',
      marginTop: 28,
      color: COLORS.muted,
      fontFamily: 'Inter',
      fontWeight: 400,
      fontSize: 28,
      lineHeight: 1.35,
    }, '100 kg × 5  →  116.7 kg'),
    el('div', {
      display: 'flex',
      marginTop: 18,
      color: COLORS.primary,
      fontFamily: 'Inter',
      fontWeight: 600,
      fontSize: 22,
      letterSpacing: 2,
    }, 'Same formula the app stores per exercise'),
  ])

  const svg = await satori(root as never, { width: CARD_WIDTH, height: CARD_HEIGHT, fonts })
  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: CARD_WIDTH },
    font: { loadSystemFonts: false },
  }).render().asPng()
  return Buffer.from(png)
}
