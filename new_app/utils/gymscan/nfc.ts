// The back of the QR card: the NFC inlay.
//
// Act 0C turns the card through a full revolution, and for a fraction of a
// second the camera is looking at its back. A plain dark plane there says the
// card is a decal with no other side; an etched antenna says the tag is a real
// piece of hardware and that tapping it does the same job as scanning it -
// which is the one product claim this whole shot exists to make.
//
// Drawn rather than shipped: it is a spiral, a chip and some substrate mottle,
// which is a couple of dozen lines of path code against a texture nobody sees
// for more than a beat. Both maps come off the same path walk so the copper is
// glossy and metallic in exactly the pixels where it is copper-coloured.
import * as THREE from 'three'
import { patchPeelVertex, type PeelUniforms } from './peel.ts'

const TEX_W = 512
const TEX_H = 541          // 827 x 874 artwork aspect, so front and back register
const CORNER = 0.072       // fraction of width; matches the print's die-cut
const TURNS = 5.5
const INSET = 0.100        // fraction of width from the die to the outermost trace
const PITCH = 0.026        // fraction of width between turns
const TRACE = 0.0125       // fraction of width

/**
 * Walk the antenna as one continuous Archimedean spiral: radius shrinking a
 * constant `PITCH` per turn about the centre of the card.
 *
 * Round rather than rounded-square, and round is also the cheap one - two
 * trig calls a step against a six-branch perimeter walk, and forty lines of
 * geometry gone. A square coil buys a little more enclosed area per turn,
 * which matters to an antenna engineer and to nobody looking at this for a
 * second and a half; what the eye actually reads at this size is that the
 * trace is one unbroken line spiralling into a chip.
 *
 * Concentric closed rings would be shorted turns, not a coil. Sampling a
 * single spiral this way gives the unbroken trace a real inlay has, and the
 * jog between turns falls out of the parametrisation instead of being drawn.
 */
function coilPoints(w: number, h: number): [number, number][] {
  const pts: [number, number][] = []
  const steps = Math.round(TURNS * 220)
  const cx = w / 2
  const cy = h / 2
  const outer = Math.min(w, h) / 2 - INSET * w
  for (let i = 0; i <= steps; i++) {
    const u = (i / steps) * TURNS
    const r = outer - u * PITCH * w
    const a = u * Math.PI * 2 - Math.PI / 2
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)])
  }
  return pts
}

function strokePolyline(
  ctx: CanvasRenderingContext2D, pts: [number, number][], width: number, style: string,
): void {
  ctx.beginPath()
  ctx.moveTo(pts[0]![0], pts[0]![1])
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i]![0], pts[i]![1])
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.lineWidth = width
  ctx.strokeStyle = style
  ctx.stroke()
}

function roundRectPath(
  ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number,
): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

interface InlayStyle {
  substrate: string | null
  trace: string
  traceCore: string | null
  chip: string
  pad: string
  mottle: number
  text: string | null
}

function drawInlay(ctx: CanvasRenderingContext2D, w: number, h: number, s: InlayStyle): void {
  ctx.clearRect(0, 0, w, h)
  // Everything is clipped to the die-cut so the back carries the same rounded
  // silhouette as the print. Without it the corners of the card change shape
  // halfway through the turn.
  ctx.save()
  roundRectPath(ctx, 0, 0, w, h, CORNER * w)
  ctx.clip()

  if (s.substrate) {
    ctx.fillStyle = s.substrate
    ctx.fillRect(0, 0, w, h)
  }
  if (s.mottle > 0) {
    // Adhesive is never laid down evenly. A little large-scale blotching is
    // what keeps the back from reading as a flat swatch under the key light.
    for (let i = 0; i < 90; i++) {
      const x = Math.random() * w
      const y = Math.random() * h
      const r = 12 + Math.random() * 70
      const g = ctx.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, `rgba(255,255,255,${s.mottle})`)
      g.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = g
      ctx.fillRect(x - r, y - r, r * 2, r * 2)
    }
  }

  const pts = coilPoints(w, h)
  strokePolyline(ctx, pts, TRACE * w, s.trace)
  if (s.traceCore) strokePolyline(ctx, pts, TRACE * w * 0.34, s.traceCore)

  // Chip module, bridged across the coil to the inner end of the antenna.
  const cw = w * 0.14
  const chH = cw * 0.62
  const cx = w * 0.5 - cw / 2
  const cy = h * 0.5 - chH / 2
  const inner = pts[pts.length - 1]!
  ctx.save()
  ctx.lineCap = 'butt'
  ctx.beginPath()
  ctx.moveTo(inner[0], inner[1])
  ctx.lineTo(cx + cw * 0.5, cy + chH * 0.5)
  ctx.lineWidth = TRACE * w * 1.15
  ctx.strokeStyle = s.trace
  ctx.stroke()
  ctx.restore()
  roundRectPath(ctx, cx, cy, cw, chH, cw * 0.14)
  ctx.fillStyle = s.chip
  ctx.fill()
  ctx.fillStyle = s.pad
  ctx.fillRect(cx + cw * 0.10, cy + chH * 0.20, cw * 0.20, chH * 0.60)
  ctx.fillRect(cx + cw * 0.70, cy + chH * 0.20, cw * 0.20, chH * 0.60)

  if (s.text) {
    ctx.fillStyle = s.text
    ctx.font = `500 ${Math.round(w * 0.030)}px "JetBrains Mono", monospace`
    ctx.textAlign = 'center'
    ctx.fillText('NFC 13.56 MHz', w * 0.5, h * 0.925)
    ctx.fillText('LIFTAG TAG-01', w * 0.5, h * 0.078)
  }
  ctx.restore()
}

function canvas(w: number, h: number): CanvasRenderingContext2D {
  const el = document.createElement('canvas')
  el.width = w
  el.height = h
  return el.getContext('2d')!
}

export interface NfcMaps {
  map: THREE.CanvasTexture
  /** ORM: R unused, G roughness, B metalness - copper is glossy, PET is not. */
  orm: THREE.CanvasTexture
}

export function createNfcMaps(anisotropy: number): NfcMaps {
  const colorCtx = canvas(TEX_W, TEX_H)
  drawInlay(colorCtx, TEX_W, TEX_H, {
    // Neutral, not warm. A brown substrate under a copper coil reads as one
    // corroded object rather than as a bronze antenna on a plastic carrier -
    // the back of the card looked rusty. The trace keeps its bronze; the
    // substrate is the near-black grey a PET adhesive backing actually is,
    // and the silkscreen with it.
    substrate: '#1b1d20',
    trace: '#a8702e',
    traceCore: '#e2b276',
    chip: '#0a0a0c',
    pad: '#9aa2ab',
    mottle: 0.02,
    text: 'rgba(168,176,186,0.28)',
  })
  const ormCtx = canvas(TEX_W, TEX_H)
  drawInlay(ormCtx, TEX_W, TEX_H, {
    // Adhesive backing, not a laminate: near-fully rough. At 0.77 the 0C key
    // laid a tight raking streak across it, and a streak that hard on a flat
    // plane reads as a shading artefact rather than as light. The traces keep
    // their gloss, so the coil still catches that key - which is the one
    // specular event this face is supposed to have.
    substrate: 'rgb(255,238,0)',
    trace: 'rgb(255,74,255)',
    traceCore: 'rgb(255,58,255)',
    chip: 'rgb(255,150,60)',
    pad: 'rgb(255,64,255)',
    mottle: 0,
    text: null,
  })

  const map = new THREE.CanvasTexture(colorCtx.canvas)
  map.colorSpace = THREE.SRGBColorSpace
  map.anisotropy = anisotropy
  const orm = new THREE.CanvasTexture(ormCtx.canvas)
  orm.colorSpace = THREE.NoColorSpace
  orm.anisotropy = anisotropy
  return { map, orm }
}

/**
 * Back-face material. `BackSide` rather than a second plane rotated 180: it
 * shares the front's geometry and peel uniforms, so the two layers cannot
 * drift apart on the roll no matter what the fold line is doing.
 *
 * It does not share the *liner's* peel, though - that one rolls off this face
 * while the inlay stays put, which is the whole beat.
 */
export function createNfcMaterial(maps: NfcMaps, peel: PeelUniforms): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    map: maps.map,
    roughnessMap: maps.orm,
    metalnessMap: maps.orm,
    roughness: 1,
    metalness: 1,
    envMapIntensity: 0.55,
    side: THREE.BackSide,
    transparent: true,
    alphaTest: 0.02,
  })
  material.onBeforeCompile = (shader) => {
    patchPeelVertex(shader, peel)
  }
  material.customProgramCacheKey = () => 'liftag-nfc-inlay-v2'
  return material
}
