import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  MACBOOK_BEZEL_INSET,
  MACBOOK_DASHBOARD_TOP_CROP,
  MACBOOK_SCREEN_INSET,
  applyRectUVs,
  coverFitScreenUVs,
  createNotchedScreenGeometry,
  createNotchedScreenShape,
  isInsideNotchCavity,
  layoutMacbookScreen,
} from '../utils/macbookScreen.ts'

const LID_W = 2.8
const LID_H = 1.83
const LID_R = 0.09

test('layoutMacbookScreen insets a hairline black-glass margin inside the lid', () => {
  const layout = layoutMacbookScreen(LID_W, LID_H, LID_R)

  assert.equal(layout.width, LID_W - MACBOOK_SCREEN_INSET * 2)
  assert.equal(layout.height, LID_H - MACBOOK_SCREEN_INSET * 2)
  assert.equal(layout.radius, LID_R - MACBOOK_SCREEN_INSET)
  assert.ok(layout.width > LID_W * 0.96)
  assert.ok(layout.height > LID_H * 0.96)
  assert.ok(layout.bezelWidth > layout.width)
  assert.ok(layout.bezelHeight > layout.height)
  assert.equal(layout.bezelWidth, LID_W - MACBOOK_BEZEL_INSET * 2)
})

test('layoutMacbookScreen sizes a wide, short camera housing', () => {
  const layout = layoutMacbookScreen(LID_W, LID_H, LID_R)

  assert.ok(layout.notchWidth < layout.width * 0.07)
  assert.ok(layout.notchWidth > layout.width * 0.045)
  assert.ok(layout.notchHeight < layout.height * 0.035)
  assert.ok(layout.notchHeight > layout.height * 0.015)
  assert.ok(layout.notchHeight < layout.notchWidth * 0.55)
  assert.ok(layout.notchRadius < layout.notchHeight)
  assert.ok(layout.earRadius > 0)
  assert.ok(layout.earRadius + layout.notchRadius <= layout.notchHeight)
  assert.equal(layout.notchCenterY, layout.height / 2 - layout.notchHeight / 2)
  assert.ok(layout.lensRadius < layout.notchHeight / 2)
})

test('notched outline keeps the top corners and bites the camera housing out of the top edge', () => {
  const layout = layoutMacbookScreen(LID_W, LID_H, LID_R)
  const points = createNotchedScreenShape(layout).getPoints(72)
  const top = layout.height / 2
  const notchBottom = top - layout.notchHeight
  const halfNotch = layout.notchWidth / 2 - layout.notchRadius

  const maxYAtCenter = Math.max(
    ...points.filter((point) => Math.abs(point.x) <= halfNotch).map((point) => point.y),
  )
  const maxYAtSides = Math.max(
    ...points.filter((point) => Math.abs(point.x) > layout.notchWidth / 2 + layout.earRadius).map((point) => point.y),
  )

  assert.ok(maxYAtCenter <= notchBottom + 0.002, `center top should be the notch floor, got ${maxYAtCenter}`)
  assert.ok(maxYAtSides >= top - 0.002, `side top should stay at the display edge, got ${maxYAtSides}`)
  assert.ok(
    !points.some((point) => isInsideNotchCavity(point.x, point.y, layout)
      && point.y > notchBottom + 0.001
      && Math.abs(point.x) < halfNotch),
  )
})

test('notched screen geometry has no triangles inside the notch and UVs stay in 0..1', () => {
  const layout = layoutMacbookScreen(LID_W, LID_H, LID_R)
  const geometry = createNotchedScreenGeometry(layout)
  const pos = geometry.attributes.position
  const uv = geometry.attributes.uv
  const index = geometry.index

  assert.ok(pos)
  assert.ok(uv)
  assert.equal(uv.itemSize, 2)

  for (let i = 0; i < uv.count; i += 1) {
    const u = uv.getX(i)
    const v = uv.getY(i)
    assert.ok(u >= -0.001 && u <= 1.001, `u out of range: ${u}`)
    assert.ok(v >= -0.001 && v <= 1.001, `v out of range: ${v}`)
  }

  const triangleCount = index ? index.count / 3 : pos.count / 3
  assert.ok(triangleCount > 8)

  for (let i = 0; i < triangleCount; i += 1) {
    const a = index ? index.getX(i * 3) : i * 3
    const b = index ? index.getX(i * 3 + 1) : i * 3 + 1
    const c = index ? index.getX(i * 3 + 2) : i * 3 + 2
    const cx = (pos.getX(a) + pos.getX(b) + pos.getX(c)) / 3
    const cy = (pos.getY(a) + pos.getY(b) + pos.getY(c)) / 3
    assert.equal(
      isInsideNotchCavity(cx, cy, layout),
      false,
      `triangle centroid ${cx.toFixed(4)},${cy.toFixed(4)} fell inside the notch`,
    )
  }

  geometry.dispose()
})

test('applyRectUVs maps the display bounds to the full screenshot', () => {
  const layout = layoutMacbookScreen(LID_W, LID_H, LID_R)
  const geometry = applyRectUVs(createNotchedScreenGeometry(layout), layout.width, layout.height)
  const pos = geometry.attributes.position
  const uv = geometry.attributes.uv

  let minU = Infinity
  let maxU = -Infinity
  let minV = Infinity
  let maxV = -Infinity
  let topEdgeV = 0
  let bottomEdgeV = 1

  for (let i = 0; i < pos.count; i += 1) {
    const y = pos.getY(i)
    const u = uv.getX(i)
    const v = uv.getY(i)
    minU = Math.min(minU, u)
    maxU = Math.max(maxU, u)
    minV = Math.min(minV, v)
    maxV = Math.max(maxV, v)
    if (Math.abs(y - layout.height / 2) < 0.01) topEdgeV = v
    if (Math.abs(y + layout.height / 2) < 0.01) bottomEdgeV = v
  }

  assert.ok(minU < 0.02)
  assert.ok(maxU > 0.98)
  assert.ok(minV < 0.02)
  assert.ok(maxV > 0.98)
  assert.ok(topEdgeV > 0.95)
  assert.ok(bottomEdgeV < 0.05)

  geometry.dispose()
})

test('coverFitScreenUVs is identity when the source already matches the screen', () => {
  const uv = coverFitScreenUVs({
    sourceWidth: 1540,
    sourceHeight: 1000,
    screenWidth: 1.54,
    screenHeight: 1,
  })

  assert.equal(uv.offsetX, 0)
  assert.equal(uv.offsetY, 0)
  assert.equal(uv.repeatX, 1)
  assert.equal(uv.repeatY, 1)
})

test('coverFitScreenUVs drops the dashboard menu-bar letterbox and cover-fits without stretching', () => {
  const layout = layoutMacbookScreen(LID_W, LID_H, LID_R)
  const uv = coverFitScreenUVs({
    sourceWidth: 1440,
    sourceHeight: 936,
    screenWidth: layout.width,
    screenHeight: layout.height,
    topCrop: MACBOOK_DASHBOARD_TOP_CROP,
  })

  const mappedW = 1440 * uv.repeatX
  const mappedH = 936 * uv.repeatY
  assert.ok(Math.abs(mappedW / mappedH - layout.width / layout.height) < 1e-6)
  assert.ok(Math.abs(uv.offsetY + uv.repeatY - (1 - MACBOOK_DASHBOARD_TOP_CROP)) < 1e-6)
  assert.ok(uv.offsetX > 0)
  assert.ok(uv.repeatX < 1)
  assert.ok(uv.repeatX > 0.95)
  assert.equal(MACBOOK_DASHBOARD_TOP_CROP, 31 / 936)
})

test('coverFitScreenUVs keeps the top and crops the bottom when the source is taller', () => {
  const uv = coverFitScreenUVs({
    sourceWidth: 1000,
    sourceHeight: 2000,
    screenWidth: 16,
    screenHeight: 10,
  })

  assert.equal(uv.repeatX, 1)
  assert.ok(uv.repeatY < 1)
  assert.ok(Math.abs(uv.offsetY + uv.repeatY - 1) < 1e-9)

  const mappedW = 1000 * uv.repeatX
  const mappedH = 2000 * uv.repeatY
  assert.ok(Math.abs(mappedW / mappedH - 16 / 10) < 1e-6)
})
