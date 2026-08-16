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

/** Wide, short camera housing. Height is kept well under a real 14" ratio so it does not eat the display. */
export const MACBOOK_NOTCH_WIDTH_RATIO = 0.058
export const MACBOOK_NOTCH_HEIGHT_RATIO = 0.024

/**
 * Encoded size of the dashboard footage. The 3024x1964 capture's solid black
 * menu-bar letterbox (66px) is cropped by the encoder rather than in UV space,
 * so every decoded pixel lands on the display and nothing is paid for twice.
 */
export const MACBOOK_DASHBOARD_SOURCE_WIDTH = 1440
export const MACBOOK_DASHBOARD_SOURCE_HEIGHT = 904
export const MACBOOK_DASHBOARD_CONTENT_ASPECT = MACBOOK_DASHBOARD_SOURCE_WIDTH
  / MACBOOK_DASHBOARD_SOURCE_HEIGHT

// `ScreenVideoSource` used to live here too. It now lives beside the shared
// element builder in `utils/screenVideo.ts`, which every screen-footage caller
// already imports - two exported types with the same name were free to drift.

export type ScreenTextureUVs = {
  offsetX: number
  offsetY: number
  repeatX: number
  repeatY: number
}

/**
 * Cover-fit a recording onto the display. Uniform scale only: leftover aspect
 * is cropped from the sides or the bottom so the footage fills the screen
 * without stretching.
 */
export function coverFitScreenUVs(options: {
  sourceWidth: number
  sourceHeight: number
  screenWidth: number
  screenHeight: number
}): ScreenTextureUVs {
  const sourceWidth = Math.max(1, options.sourceWidth)
  const sourceHeight = Math.max(1, options.sourceHeight)
  const screenWidth = Math.max(1e-6, options.screenWidth)
  const screenHeight = Math.max(1e-6, options.screenHeight)

  const sourceAspect = sourceWidth / sourceHeight
  const screenAspect = screenWidth / screenHeight

  if (sourceAspect > screenAspect) {
    const repeatX = screenAspect / sourceAspect
    return {
      offsetX: (1 - repeatX) / 2,
      offsetY: 0,
      repeatX,
      repeatY: 1,
    }
  }

  const repeatY = sourceAspect / screenAspect
  return {
    offsetX: 0,
    offsetY: 1 - repeatY,
    repeatX: 1,
    repeatY,
  }
}

function verticalFovRad(fovDeg: number) {
  return (Math.max(fovDeg, 1e-6) * Math.PI) / 180
}

function horizontalFovRad(fovDeg: number, aspect: number) {
  return 2 * Math.atan(Math.tan(verticalFovRad(fovDeg) / 2) * Math.max(aspect, 1e-6))
}

/** World-space size of a perspective frustum at `distance` from the camera. */
export function frustumSizeAtDistance(options: {
  distance: number
  fovDeg: number
  aspect: number
}): { width: number, height: number } {
  const distance = Math.max(options.distance, 0)
  const vFov = verticalFovRad(options.fovDeg)
  const hFov = horizontalFovRad(options.fovDeg, options.aspect)
  return {
    width: 2 * distance * Math.tan(hFov / 2),
    height: 2 * distance * Math.tan(vFov / 2),
  }
}

/**
 * Face-on distance that keeps the entire display inside the frustum.
 * Uses the farther of the width and height fits so a wide recording is
 * not cropped when the canvas is squarer than the screen.
 *
 * `fill` > 1 pulls the camera back (less zoom). The punch-in uses a
 * slight overscan so the glass is not edge-to-edge.
 */
export const MACBOOK_ZOOM_FILL = 1.08

export function containScreenDistance(options: {
  worldWidth: number
  worldHeight: number
  fovDeg: number
  aspect: number
  fill?: number
}): number {
  const worldWidth = Math.max(options.worldWidth, 0)
  const worldHeight = Math.max(options.worldHeight, 0)
  const fill = Math.max(options.fill ?? 1, 1e-6)
  const vFov = verticalFovRad(options.fovDeg)
  const hFov = horizontalFovRad(options.fovDeg, options.aspect)
  const distV = (worldHeight * fill) / (2 * Math.tan(vFov / 2))
  const distH = (worldWidth * fill) / (2 * Math.tan(hFov / 2))
  return Math.max(distV, distH)
}

/**
 * Horizontal camera truck that puts world-origin on the center of `target`
 * inside `canvas`. Negative values move the camera left so a right-hand
 * stage reads as the subject.
 */
export function cameraTruckToAlign(options: {
  canvasLeft: number
  canvasWidth: number
  targetLeft: number
  targetWidth: number
  distance: number
  fovDeg: number
  aspect: number
}): number {
  const canvasWidth = Math.max(options.canvasWidth, 1e-6)
  const canvasCenter = options.canvasLeft + canvasWidth / 2
  const targetCenter = options.targetLeft + options.targetWidth / 2
  const ndcX = (targetCenter - canvasCenter) / (canvasWidth / 2)
  const view = frustumSizeAtDistance({
    distance: options.distance,
    fovDeg: options.fovDeg,
    aspect: options.aspect,
  })
  return -ndcX * (view.width / 2)
}

/** Limit a truck so `worldWidth` stays fully inside the frustum. */
export function clampTruckToKeepWidth(options: {
  truck: number
  worldWidth: number
  distance: number
  fovDeg: number
  aspect: number
  padding?: number
}): number {
  const view = frustumSizeAtDistance({
    distance: options.distance,
    fovDeg: options.fovDeg,
    aspect: options.aspect,
  })
  const padding = Math.max(options.padding ?? 0, 0)
  const max = Math.max(0, (view.width - options.worldWidth) / 2 - padding)
  return Math.max(-max, Math.min(max, options.truck))
}

/**
 * Keep the rest-pose laptop the same pixel height when the WebGL canvas
 * is taller than the original mount. Never dolly in closer than the base.
 */
export function startDistanceToMatchHeight(options: {
  baseDistance: number
  canvasHeight: number
  referenceHeight: number
}): number {
  const base = Math.max(options.baseDistance, 0)
  const scale = options.canvasHeight / Math.max(options.referenceHeight, 1e-6)
  return base * Math.max(scale, 1)
}

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
  const earRadius = Math.min(notchHeight * 0.22, notchWidth * 0.08)
  const notchRadius = Math.min(notchHeight * 0.48, notchWidth / 2 - 0.001)
  const notchCenterY = height / 2 - notchHeight / 2
  const lensRadius = Math.max(0.007, notchHeight * 0.28)

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
