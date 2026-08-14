import {
  BufferAttribute,
  Shape,
  ShapeGeometry,
} from 'three'

/**
 * Hairline black-glass inset, tighter than a 14" MacBook Pro bezel so the
 * display reads as borderless while still clearing the lid's rounded corners.
 */
export const MACBOOK_SCREEN_INSET = 0.018
export const MACBOOK_BEZEL_INSET = 0.008

/** 14" MacBook Pro (2021+) notch as a fraction of the active display. */
export const MACBOOK_NOTCH_WIDTH_RATIO = 0.0646
export const MACBOOK_NOTCH_HEIGHT_RATIO = 0.0584

export type MacbookScreenLayout = {
  width: number
  height: number
  radius: number
  bezelWidth: number
  bezelHeight: number
  bezelRadius: number
  notchWidth: number
  notchHeight: number
  notchRadius: number
  earRadius: number
  notchCenterY: number
  lensRadius: number
}

export function layoutMacbookScreen(
  lidWidth: number,
  lidHeight: number,
  lidRadius: number,
): MacbookScreenLayout {
  const width = lidWidth - MACBOOK_SCREEN_INSET * 2
  const height = lidHeight - MACBOOK_SCREEN_INSET * 2
  const radius = Math.max(0.02, lidRadius - MACBOOK_SCREEN_INSET)

  const bezelWidth = lidWidth - MACBOOK_BEZEL_INSET * 2
  const bezelHeight = lidHeight - MACBOOK_BEZEL_INSET * 2
  const bezelRadius = Math.max(0.02, lidRadius - MACBOOK_BEZEL_INSET)

  const notchWidth = width * MACBOOK_NOTCH_WIDTH_RATIO
  const notchHeight = height * MACBOOK_NOTCH_HEIGHT_RATIO
  const earRadius = Math.min(notchHeight * 0.2, notchWidth * 0.1)
  const notchRadius = Math.min(notchHeight * 0.42, notchWidth / 2 - 0.001)
  const notchCenterY = height / 2 - notchHeight / 2
  const lensRadius = notchHeight * 0.15

  return {
    width,
    height,
    radius,
    bezelWidth,
    bezelHeight,
    bezelRadius,
    notchWidth,
    notchHeight,
    notchRadius,
    earRadius,
    notchCenterY,
    lensRadius,
  }
}

export function roundedRectShape(width: number, height: number, radius: number): Shape {
  const shape = new Shape()
  const hw = width / 2
  const hh = height / 2
  const rr = Math.min(radius, hw, hh)

  shape.moveTo(-hw + rr, -hh)
  shape.lineTo(hw - rr, -hh)
  shape.quadraticCurveTo(hw, -hh, hw, -hh + rr)
  shape.lineTo(hw, hh - rr)
  shape.quadraticCurveTo(hw, hh, hw - rr, hh)
  shape.lineTo(-hw + rr, hh)
  shape.quadraticCurveTo(-hw, hh, -hw, hh - rr)
  shape.lineTo(-hw, -hh + rr)
  shape.quadraticCurveTo(-hw, -hh, -hw + rr, -hh)

  return shape
}

/**
 * Active display path with a MacBook-style camera notch bitten out of the top
 * edge, including the concave "ears" where the housing meets the bezel.
 */
export function createNotchedScreenShape(layout: MacbookScreenLayout): Shape {
  const shape = new Shape()
  const hw = layout.width / 2
  const hh = layout.height / 2
  const rr = Math.min(layout.radius, hw, hh)
  const nw = layout.notchWidth / 2
  const nh = layout.notchHeight
  const nr = layout.notchRadius
  const ear = layout.earRadius

  shape.moveTo(-hw + rr, -hh)
  shape.lineTo(hw - rr, -hh)
  shape.quadraticCurveTo(hw, -hh, hw, -hh + rr)
  shape.lineTo(hw, hh - rr)
  shape.quadraticCurveTo(hw, hh, hw - rr, hh)
  shape.lineTo(nw + ear, hh)
  shape.quadraticCurveTo(nw, hh, nw, hh - ear)
  shape.lineTo(nw, hh - nh + nr)
  shape.quadraticCurveTo(nw, hh - nh, nw - nr, hh - nh)
  shape.lineTo(-nw + nr, hh - nh)
  shape.quadraticCurveTo(-nw, hh - nh, -nw, hh - nh + nr)
  shape.lineTo(-nw, hh - ear)
  shape.quadraticCurveTo(-nw, hh, -nw - ear, hh)
  shape.lineTo(-hw + rr, hh)
  shape.quadraticCurveTo(-hw, hh, -hw, hh - rr)
  shape.lineTo(-hw, -hh + rr)
  shape.quadraticCurveTo(-hw, -hh, -hw + rr, -hh)

  return shape
}

export function applyRectUVs(
  geometry: ShapeGeometry,
  width: number,
  height: number,
): ShapeGeometry {
  const pos = geometry.attributes.position
  const uvs = new Float32Array(pos.count * 2)

  for (let i = 0; i < pos.count; i += 1) {
    uvs[i * 2] = (pos.getX(i) + width / 2) / width
    uvs[i * 2 + 1] = (pos.getY(i) + height / 2) / height
  }

  geometry.setAttribute('uv', new BufferAttribute(uvs, 2))
  return geometry
}

export function createRoundedRectGeometry(
  width: number,
  height: number,
  radius: number,
  curveSegments = 8,
): ShapeGeometry {
  return new ShapeGeometry(roundedRectShape(width, height, radius), curveSegments)
}

export function createNotchedScreenGeometry(
  layout: MacbookScreenLayout,
  curveSegments = 8,
): ShapeGeometry {
  return applyRectUVs(
    new ShapeGeometry(createNotchedScreenShape(layout), curveSegments),
    layout.width,
    layout.height,
  )
}

export function isInsideNotchCavity(
  x: number,
  y: number,
  layout: MacbookScreenLayout,
): boolean {
  const hw = layout.notchWidth / 2
  const top = layout.height / 2
  const bottom = top - layout.notchHeight
  const r = layout.notchRadius

  if (x <= -hw || x >= hw || y <= bottom || y >= top) return false

  if (y >= bottom + r) return true

  const cx = x > 0 ? hw - r : -hw + r
  const cy = bottom + r
  const dx = x - cx
  const dy = y - cy
  if (x > 0 && x < cx) return true
  if (x < 0 && x > cx) return true
  return dx * dx + dy * dy < r * r
}
