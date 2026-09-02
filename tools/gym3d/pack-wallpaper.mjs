#!/usr/bin/env node
// Pack the gym-scan far-wall matte.
//
// Inputs are a LIFTAG gym photograph (albedo) and a matching geometric height
// map in wallpaper-src/. Outputs two WebPs the runtime shader samples:
//   wallpaper.webp       sRGB albedo + rack-impostor alpha, hot fixtures crushed
//   wallpaper-nxh.webp   RGB, tangent-space normal in RG + height in B
//
// The source is 1280×720. An earlier pack upsampled that to 1536, crushed it
// in sRGB, then wrote WebP q78 (~19 kB). The upsample cannot invent detail,
// the crush threw the remaining structure into a handful of levels, and q78
// smeared what was left — which is why the wall looked mushy at no extra
// GPU cost. This pack stays at native resolution, crushes in linear (so the
// darks keep their bits), and encodes much less lossy. Runtime sample count
// is unchanged.
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(join(dirname(fileURLToPath(import.meta.url)), '../../new_app/package.json'))
const sharp = require('sharp')

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..')
const SRC = join(dirname(fileURLToPath(import.meta.url)), 'wallpaper-src')
const OUT = join(ROOT, 'new_app', 'public', 'assets', 'gym3d')

function srgbToLin(c) {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}
function linToSrgb(c) {
  const x = c < 0 ? 0 : c > 1 ? 1 : c
  return x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055
}

function at(buf, w, h, x, y) {
  x = x < 0 ? 0 : x > w - 1 ? w - 1 : x
  y = y < 0 ? 0 : y > h - 1 ? h - 1 : y
  return buf[y * w + x] / 255
}

function blur3(src, w, h) {
  const out = new Float32Array(w * h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let s = 0
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) s += at(src, w, h, x + dx, y + dy)
      }
      out[y * w + x] = s / 9
    }
  }
  return out
}

function blur3f(src, w, h) {
  const out = new Float32Array(w * h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let s = 0
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) s += atFloat(src, w, h, x + dx, y + dy)
      }
      out[y * w + x] = s / 9
    }
  }
  return out
}

function atFloat(buf, w, h, x, y) {
  x = x < 0 ? 0 : x > w - 1 ? w - 1 : x
  y = y < 0 ? 0 : y > h - 1 ? h - 1 : y
  return buf[y * w + x]
}

/** Separable min/max so a 16 px close does not walk a circular neighbourhood. */
function morph1d(src, w, h, radius, horizontal, mode) {
  const out = new Float32Array(w * h)
  const pick = mode === 'max' ? Math.max : Math.min
  const start = mode === 'max' ? 0 : 1
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let acc = start
      if (horizontal) {
        for (let k = -radius; k <= radius; k++) acc = pick(acc, atFloat(src, w, h, x + k, y))
      } else {
        for (let k = -radius; k <= radius; k++) acc = pick(acc, atFloat(src, w, h, x, y + k))
      }
      out[y * w + x] = acc
    }
  }
  return out
}

function morph(src, w, h, radius, mode) {
  return morph1d(morph1d(src, w, h, radius, true, mode), w, h, radius, false, mode)
}

async function main() {
  const albedoImg = sharp(join(SRC, 'albedo.jpg')).removeAlpha()
  const albedoMeta = await albedoImg.metadata()
  const ALBEDO_W = albedoMeta.width
  const ALBEDO_H = albedoMeta.height
  if (!ALBEDO_W || !ALBEDO_H) throw new Error('albedo has no size')
  const albedoRaw = await albedoImg.raw().toBuffer()

  // Crush baked house lights in linear so the 3D fixtures can relight, but
  // keep the photograph's own structure. sRGB * 0.50 flattened every rack
  // tube into the same three levels before WebP even ran.
  const crushed = Buffer.alloc(ALBEDO_W * ALBEDO_H * 3)
  for (let i = 0; i < albedoRaw.length; i += 3) {
    let r = srgbToLin(albedoRaw[i] / 255)
    let g = srgbToLin(albedoRaw[i + 1] / 255)
    let b = srgbToLin(albedoRaw[i + 2] / 255)
    const y = 0.2126 * r + 0.7152 * g + 0.0722 * b
    const lime = g > 0.04 && g > r * 1.12 && g > b * 1.25
    if (lime) {
      const t = Math.min(y, 0.18) * 0.82
      const s = y > 1e-6 ? t / y : 0
      r *= s
      g *= s
      b *= s
    } else {
      if (y > 0.12) {
        const t = 0.12 + (y - 0.12) * 0.18
        const s = t / y
        r *= s
        g *= s
        b *= s
      }
      r *= 0.50
      g *= 0.52
      b *= 0.56
    }
    crushed[i] = Math.round(linToSrgb(r) * 255)
    crushed[i + 1] = Math.round(linToSrgb(g) * 255)
    crushed[i + 2] = Math.round(linToSrgb(b) * 255)
  }

  const heightImg = sharp(join(SRC, 'height.jpg')).greyscale()
  const heightMeta = await heightImg.metadata()
  const NXH_W = heightMeta.width
  const NXH_H = heightMeta.height
  if (!NXH_W || !NXH_H) throw new Error('height has no size')
  const heightRaw = await heightImg.raw().toBuffer()

  const height = blur3(heightRaw, NXH_W, NXH_H)

  // The LIFTAG mark is a raised circular plaque. Lit as relief it sparkles
  // on the L's three corners (the open top-left has no vertex). Sink the
  // disc around the lime centroid into the ribbed wall to its right.
  const srcH = height.slice()
  let sx = 0, sy = 0, nLime = 0, rMax = 0
  for (let i = 0; i < NXH_W * NXH_H; i++) {
    const x = i % NXH_W
    const y = (i - x) / NXH_W
    if (x > NXH_W * 0.28 || y < NXH_H * 0.22 || y > NXH_H * 0.58) continue
    const r = albedoRaw[i * 3] / 255
    const g = albedoRaw[i * 3 + 1] / 255
    const b = albedoRaw[i * 3 + 2] / 255
    if (g > 0.16 && g > r * 1.10 && g > b * 1.18) {
      sx += x
      sy += y
      nLime++
    }
  }
  const cx = nLime ? sx / nLime : NXH_W * 0.13
  const cy = nLime ? sy / nLime : NXH_H * 0.36
  for (let i = 0; i < NXH_W * NXH_H; i++) {
    const x = i % NXH_W
    const y = (i - x) / NXH_W
    if (x > NXH_W * 0.28 || y < NXH_H * 0.22 || y > NXH_H * 0.58) continue
    const r = albedoRaw[i * 3] / 255
    const g = albedoRaw[i * 3 + 1] / 255
    const b = albedoRaw[i * 3 + 2] / 255
    if (g > 0.16 && g > r * 1.10 && g > b * 1.18) {
      const d = Math.hypot(x - cx, y - cy)
      if (d < 90) rMax = Math.max(rMax, d)
    }
  }
  const r0 = rMax + 8
  const r1 = rMax + 28
  const xSample = Math.min(NXH_W - 1, Math.round(cx + r1 + 16))
  console.log('plaque', nLime, 'at', cx.toFixed(1), cy.toFixed(1), 'r', rMax.toFixed(1))
  for (let y = 0; y < NXH_H; y++) {
    const wallH = srcH[y * NXH_W + xSample]
    for (let x = 0; x < NXH_W; x++) {
      const d = Math.hypot(x - cx, y - cy)
      let w = 0
      if (d <= r0) w = 1
      else if (d < r1) {
        const t = (d - r0) / (r1 - r0)
        w = 1 - t * t * (3 - 2 * t)
      }
      if (w > 0) {
        const i = y * NXH_W + x
        height[i] = srcH[i] * (1 - w) + wallH * w
      }
    }
  }

  // Near-field impostor: the right-hand squat rack is the only object in a
  // clearly different depth band from the back wall. Gate in image space so
  // the ceiling ducts (also bright in the height plate) do not come with it.
  // Close the cage into a silhouette - a tube mask would punch black holes
  // through to the faded back plate.
  const seed = new Float32Array(NXH_W * NXH_H)
  for (let y = 0; y < NXH_H; y++) {
    const yn = y / (NXH_H - 1)
    for (let x = 0; x < NXH_W; x++) {
      const xn = x / (NXH_W - 1)
      const hv = height[y * NXH_W + x]
      const i = (y * NXH_W + x) * 3
      const ar = albedoRaw[i] / 255
      const ag = albedoRaw[i + 1] / 255
      const ab = albedoRaw[i + 2] / 255
      // The lime cove sits on the near wall above the rack. It is the
      // brightest thing in the plate and reads as a floating bar if it
      // rides the card; leave it on the back wall.
      const lime = ag > 0.16 && ag > ar * 1.10 && ag > ab * 1.18
      seed[y * NXH_W + x] = (xn > 0.72 && yn > 0.16 && yn < 0.64 && hv > 0.50 && !lime) ? 1 : 0
    }
  }
  // Close just enough to join tubes; leave the cage holes so the photo's
  // own wall shows through rather than a cardboard slab.
  const closed = morph(morph(seed, NXH_W, NXH_H, 10, 'max'), NXH_W, NXH_H, 4, 'min')
  // Closing grows into the cove above the rack. Kill lime after the morph
  // so a 10 px dilate cannot put the cove on the card.
  for (let i = 0; i < closed.length; i++) {
    const ar = albedoRaw[i * 3] / 255
    const ag = albedoRaw[i * 3 + 1] / 255
    const ab = albedoRaw[i * 3 + 2] / 255
    if (ag > 0.16 && ag > ar * 1.10 && ag > ab * 1.18) closed[i] = 0
  }
  const mask = blur3f(closed, NXH_W, NXH_H)

  const rgba = Buffer.alloc(ALBEDO_W * ALBEDO_H * 4)
  for (let i = 0; i < ALBEDO_W * ALBEDO_H; i++) {
    rgba[i * 4] = crushed[i * 3]
    rgba[i * 4 + 1] = crushed[i * 3 + 1]
    rgba[i * 4 + 2] = crushed[i * 3 + 2]
    rgba[i * 4 + 3] = Math.round(mask[i] * 255)
  }
  const albedoOut = join(OUT, 'wallpaper.webp')
  await sharp(rgba, { raw: { width: ALBEDO_W, height: ALBEDO_H, channels: 4 } })
    .webp({ quality: 94, effort: 6, alphaQuality: 90 })
    .toFile(albedoOut)

  const packed = Buffer.alloc(NXH_W * NXH_H * 3)
  const strength = 1.55
  for (let y = 0; y < NXH_H; y++) {
    for (let x = 0; x < NXH_W; x++) {
      const dx = (atFloat(height, NXH_W, NXH_H, x + 1, y) - atFloat(height, NXH_W, NXH_H, x - 1, y)) * strength
      const dy = (atFloat(height, NXH_W, NXH_H, x, y - 1) - atFloat(height, NXH_W, NXH_H, x, y + 1)) * strength
      const len = Math.hypot(dx, dy, 1)
      const o = (y * NXH_W + x) * 3
      packed[o] = Math.round((-dx / len * 0.5 + 0.5) * 255)
      packed[o + 1] = Math.round((-dy / len * 0.5 + 0.5) * 255)
      packed[o + 2] = Math.round(height[y * NXH_W + x] * 255)
    }
  }

  // q95 rather than lossless: lossless was ~500 kB for a map the GPU will
  // bilinear-filter anyway. q95 keeps the relief edges that q90 at 1024 smeared.
  const nxhOut = join(OUT, 'wallpaper-nxh.webp')
  await sharp(packed, { raw: { width: NXH_W, height: NXH_H, channels: 3 } })
    .webp({ quality: 95, effort: 6 })
    .toFile(nxhOut)

  const aStat = await sharp(albedoOut).metadata()
  const nStat = await sharp(nxhOut).metadata()
  const { statSync } = await import('node:fs')
  let maskSum = 0
  for (let i = 0; i < mask.length; i++) maskSum += mask[i]
  console.log('albedo', aStat.width, aStat.height, aStat.hasAlpha, (statSync(albedoOut).size / 1024).toFixed(1) + ' kB')
  console.log('nxh   ', nStat.width, nStat.height, (statSync(nxhOut).size / 1024).toFixed(1) + ' kB')
  console.log('rack mask', (maskSum / mask.length * 100).toFixed(1) + '% of plate')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
