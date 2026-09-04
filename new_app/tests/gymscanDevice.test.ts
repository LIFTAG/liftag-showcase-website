import assert from 'node:assert/strict'
import { test } from 'node:test'
import { classifyGymScanDevice, detectGymScanDevice } from '../utils/gymscan/device.ts'

const capable = {
  seatCut: true,
  webgl2: true,
  maxTextureSize: 4096,
  saveData: false,
  probeFailed: false,
} as const

test('only the coarse, no-hover media query selects FROM THE SEAT', () => {
  const floor = detectGymScanDevice({
    matchMedia: () => ({ matches: false }),
    saveData: () => true,
    probe: () => ({ webgl2: false, maxTextureSize: 0, probeFailed: true }),
  })
  assert.deepEqual(floor, {
    cut: 'floor',
    deviceClass: 'floor',
    dprCap: 1.5,
    bloom: true,
    shadows: true,
    msaa: true,
    startStage: true,
    blitAfterLock: false,
  })
})

test('a capable seat device is Class A', () => {
  assert.deepEqual(classifyGymScanDevice(capable), {
    cut: 'seat',
    deviceClass: 'A',
    dprCap: 1.25,
    bloom: false,
    shadows: false,
    msaa: false,
    startStage: true,
    blitAfterLock: true,
  })
})

test('WebGL2 below the texture threshold is Class B', () => {
  const result = classifyGymScanDevice({ ...capable, maxTextureSize: 2048 })
  assert.equal(result.deviceClass, 'B')
  assert.equal(result.dprCap, 1)
  assert.equal(result.startStage, true)
})

test('missing WebGL2, Save-Data, and probe failures each force Class C', () => {
  const cases = [
    { ...capable, webgl2: false },
    { ...capable, saveData: true },
    { ...capable, probeFailed: true },
  ]

  for (const signals of cases) {
    const result = classifyGymScanDevice(signals)
    assert.equal(result.deviceClass, 'C')
    assert.equal(result.startStage, false)
    assert.equal(result.blitAfterLock, false)
    assert.equal(result.dprCap, 1)
  }
})

test('the browser detector combines injected media, network, and GL probes', () => {
  let query = ''
  const result = detectGymScanDevice({
    matchMedia: (value) => {
      query = value
      return { matches: true }
    },
    saveData: () => false,
    probe: () => ({ webgl2: true, maxTextureSize: 8192, probeFailed: false }),
  })

  assert.equal(query, '(pointer: coarse) and (hover: none)')
  assert.equal(result.cut, 'seat')
  assert.equal(result.deviceClass, 'A')
})
