import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import assert from 'node:assert/strict'

type Gltf = {
  nodes: { name?: string; mesh?: number; skin?: number }[]
  meshes: { primitives: { attributes: Record<string, number>; indices?: number; mode?: number }[] }[]
  skins: { joints: number[] }[]
  accessors: { bufferView: number; byteOffset?: number; componentType: number; count: number; type: string; max?: number[] }[]
  bufferViews: { byteOffset?: number; byteStride?: number }[]
  animations: { name?: string; channels: { sampler: number; target: { node: number; path: string } }[]; samplers: { input: number; output: number }[] }[]
}

function readGlb() {
  const bytes = readFileSync(new URL('../public/assets/gym3d/recording/pivot-leg-press-mannequin.glb', import.meta.url))
  let offset = 12, json: Gltf | null = null, binary: Buffer | null = null
  while (offset < bytes.length) {
    const length = bytes.readUInt32LE(offset), type = bytes.readUInt32LE(offset + 4)
    const chunk = bytes.subarray(offset + 8, offset + 8 + length)
    if (type === 0x4e4f534a) json = JSON.parse(chunk.toString().replace(/\0/g, '')) as Gltf
    if (type === 0x004e4942) binary = chunk
    offset += 8 + length
  }
  assert.ok(json && binary, 'GLB must contain JSON and binary chunks')
  return { json, binary, bytes }
}

const componentCount: Record<string, number> = { SCALAR: 1, VEC3: 3, VEC4: 4 }
function accessor(gltf: Gltf, binary: Buffer, index: number) {
  const source = gltf.accessors[index]!, view = gltf.bufferViews[source.bufferView]!
  assert.equal(source.componentType, 5126, 'animation contract uses float accessors')
  const components = componentCount[source.type]!
  const start = (view.byteOffset ?? 0) + (source.byteOffset ?? 0)
  const stride = view.byteStride ?? components * 4
  return Array.from({ length: source.count }, (_, row) => Array.from({ length: components }, (_, column) => binary.readFloatLE(start + row * stride + column * 4)))
}

function translationAt(gltf: Gltf, binary: Buffer, nodeName: string, at: number) {
  const animation = gltf.animations.find(item => item.name === 'PivotLegPressCycle')!
  const channel = animation.channels.find(item => gltf.nodes[item.target.node]?.name === nodeName && item.target.path === 'translation')!
  assert.ok(channel, `${nodeName} needs an animated translation channel`)
  const sampler = animation.samplers[channel.sampler]!
  const times = accessor(gltf, binary, sampler.input).map(row => row[0]!)
  const values = accessor(gltf, binary, sampler.output)
  let next = times.findIndex(time => time >= at)
  if (next < 1) next = 1
  const previous = next - 1, span = Math.max(1e-6, times[next]! - times[previous]!)
  const mix = (at - times[previous]!) / span
  return values[previous]!.map((value, axis) => value + (values[next]![axis]! - value) * mix)
}

const distance = (a: number[], b: number[]) => Math.hypot(...a.map((value, index) => value - b[index]!))

test('shipped mannequin is a skinned, 4.8-second articulated asset', () => {
  const { json, binary } = readGlb()
  const mannequin = json.nodes.find(node => node.name === 'Mannequin')!
  assert.ok(mannequin)
  assert.equal(typeof mannequin.skin, 'number')
  assert.ok(json.skins[mannequin.skin!]?.joints.length >= 10)
  assert.ok(json.meshes[mannequin.mesh!]?.primitives.every(primitive => 'JOINTS_0' in primitive.attributes && 'WEIGHTS_0' in primitive.attributes))
  const animation = json.animations.find(item => item.name === 'PivotLegPressCycle')!
  assert.ok(animation)
  const duration = Math.max(...animation.samplers.flatMap(sampler => accessor(json, binary, sampler.input).map(row => row[0]!)))
  assert.ok(Math.abs(duration - 4.8) < 1e-4)
  assert.ok(distance(translationAt(json, binary, 'shinL', 0), translationAt(json, binary, 'shinL', 2.4)) > .08)
  assert.ok(distance(translationAt(json, binary, 'footL', 0), translationAt(json, binary, 'footL', 2.4)) > .1)
})

test('both planted feet follow the real carriage vector', () => {
  const { json, binary } = readGlb()
  const metadata = JSON.parse(readFileSync(new URL('../public/assets/gym3d/recording/pivot-leg-press-motion.json', import.meta.url), 'utf8')) as {
    durationSeconds: number; carriage: { axis: number[]; displacementMeters: number }
  }
  assert.equal(metadata.durationSeconds, 4.8)
  const expected = metadata.carriage.axis.map(value => value * metadata.carriage.displacementMeters)
  for (const foot of ['footL', 'footR']) {
    const bent = translationAt(json, binary, foot, 0)
    const extended = translationAt(json, binary, foot, 2.4)
    const actual = extended.map((value, axis) => value - bent[axis]!)
    assert.ok(distance(actual, expected) < .006, `${foot} must remain planted on the moving plate`)
  }
})

test('shipped recording assets remain inside production budgets', () => {
  const { json, bytes } = readGlb()
  const triangles = json.meshes.reduce((meshTotal, mesh) => meshTotal + mesh.primitives.reduce((primitiveTotal, primitive) => {
    assert.equal(primitive.mode ?? 4, 4, 'recording asset primitives must use triangle topology')
    const vertexOrIndexCount = primitive.indices === undefined
      ? json.accessors[primitive.attributes.POSITION!]!.count
      : json.accessors[primitive.indices]!.count
    return primitiveTotal + vertexOrIndexCount / 3
  }, 0), 0)

  const assetBytes = (name: string) => readFileSync(new URL(`../public/assets/gym3d/recording/${name}`, import.meta.url)).byteLength
  assert.ok(triangles <= 20_000, `mannequin has ${triangles} triangles; budget is 20,000`)
  assert.ok(bytes.byteLength <= 500_000, `mannequin GLB is ${bytes.byteLength} bytes; budget is 500,000`)
  assert.ok(assetBytes('pivot-leg-press-demo.mp4') <= 750_000, 'MP4 exceeds 750KB budget')
  assert.ok(assetBytes('pivot-leg-press-demo.webm') <= 750_000, 'WebM exceeds 750KB budget')
  assert.ok(assetBytes('pivot-leg-press-poster.webp') <= 80_000, 'poster exceeds 80KB budget')
})
