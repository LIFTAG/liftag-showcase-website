// Procedural environment map and surface maps for the dark-gym hero.
//
// Shipping an HDRI just to light a near-black room is a poor trade - the file
// would outweigh both GLBs combined. Instead a handful of emissive quads stand
// in for a gym ceiling and PMREM turns that into the roughness-mipped cube map
// the standard material samples. It costs one render at startup and gives the
// exposed steel something structured to reflect, which is most of what sells
// "expensive metal in a dark room".
import * as THREE from 'three'

/**
 * The room's only real fixtures: two long strip lights running front-to-back.
 *
 * Exported because `stage.ts` hangs a `RectAreaLight` on each one. What the
 * chrome reflects and what actually lights it then come from the same two
 * rectangles, and a reflected highlight lands where the surface is bright.
 * When those disagree - a point light lighting a surface that mirrors a strip
 * somewhere else entirely - the eye reads the result as CG immediately.
 */
export const CEILING_STRIPS = [
  { x: -3.05, y: 6.10, z: -1.2, w: 0.95, l: 13.5 },
  { x: 3.05, y: 6.10, z: -1.2, w: 0.95, l: 13.5 },
] as const

export const STRIP_COLOR = 0xdfe8ff
/**
 * cd/m^2 for the RectAreaLights.
 *
 * Deliberately far below a real gym's. Area lights have no distance cutoff, so
 * at a plausible fixture brightness these two rectangles light the entire room
 * and the "extremely dark gym" brief is gone in one step. What is wanted from
 * them is the *shape* of the highlight, not the exposure - the spots still do
 * the local work.
 */
export const STRIP_NITS = 3.1

function emissiveQuad(
  w: number, h: number, color: number, intensity: number,
  pos: [number, number, number], rot: [number, number, number],
): THREE.Mesh {
  const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity) })
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat)
  mesh.position.set(...pos)
  mesh.rotation.set(...rot)
  return mesh
}

export interface GymEnvironment {
  texture: THREE.Texture
  dispose: () => void
}

export function createGymEnvironment(renderer: THREE.WebGLRenderer): GymEnvironment {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  const HALF_PI = Math.PI / 2
  const parts: THREE.Mesh[] = []

  for (const s of CEILING_STRIPS) {
    parts.push(emissiveQuad(s.w, s.l, STRIP_COLOR, 2.4, [s.x, s.y, s.z], [HALF_PI, 0, 0]))
    // A dim halo around each fixture. Bare quads give the metal a hard-edged
    // reflection with nothing around it; real diffusers spill onto the ceiling
    // and that spill is what a wide roughness lobe actually picks up.
    parts.push(emissiveQuad(s.w * 5.5, s.l * 1.06, 0x9fb0d4, 0.13, [s.x, s.y + 0.05, s.z], [HALF_PI, 0, 0]))
  }

  parts.push(
    // A cold, very dim far wall so grazing angles do not read as pure void.
    emissiveQuad(30, 9, 0x2b3442, 0.12, [0, 3.4, -13], [0, 0, 0]),
    emissiveQuad(30, 9, 0x1d232c, 0.07, [0, 3.4, 13], [0, Math.PI, 0]),
    // Floor bounce - keeps the underside of the frame from going fully flat.
    emissiveQuad(34, 34, 0x0e1116, 0.06, [0, -0.02, 0], [-HALF_PI, 0, 0]),
    // One warm practical low on the side wall. Everything else in this room is
    // the same blue-white, and a scene lit by a single colour temperature reads
    // as a render; a second, warmer source gives the frame tubes a cool side
    // and a warm side, which is what makes them look round.
    //
    // It exists only here, in the environment, and has no matching light in the
    // scene. As a real light it laid a hard orange pool across the floor that
    // announced itself as a coloured lamp; as environment it does exactly the
    // job it is wanted for - a warm bias on everything facing that way - with
    // no falloff to give it away and nothing to pay for it per fragment.
    emissiveQuad(3.4, 1.8, 0xff9a52, 0.42, [-9.5, 2.2, -4.0], [0, HALF_PI, 0]),
  )
  parts.forEach(p => scene.add(p))

  const pmrem = new THREE.PMREMGenerator(renderer)
  const target = pmrem.fromScene(scene, 0.02)
  pmrem.dispose()

  parts.forEach((p) => {
    p.geometry.dispose()
    ;(p.material as THREE.Material).dispose()
  })

  return {
    texture: target.texture,
    dispose: () => target.dispose(),
  }
}

/** Soft radial blob laid under the hero, filling in what the shadow map's
 * penumbra is too soft to state: the hard, dark line right where the feet meet
 * the floor. Without it the machine reads as hovering a centimetre up.
 */
export function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(0,0,0,0.85)')
  g.addColorStop(0.45, 'rgba(0,0,0,0.35)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export interface FloorMaps {
  map: THREE.CanvasTexture
  roughnessMap: THREE.CanvasTexture
  normalMap: THREE.CanvasTexture
  dispose: () => void
}

/**
 * Rubber gym matting, generated at startup: albedo, roughness and normal.
 *
 * The floor was a flat analytic material, and a perfectly uniform ground plane
 * is one of the loudest CG tells there is - the reflection of the ceiling
 * strips arrives as a clean unbroken smear, which no real floor produces. What
 * breaks it up here is the tile grid and a fine moulded grain; the scale above
 * that comes from world-space noise in the surface shader, where no amount of
 * repeat can produce a lattice.
 *
 * What is deliberately *not* here any more is recycled-rubber flecks. They are
 * correct for the material and they were unusable in this room: a fleck is a
 * few millimetres across, so at any camera station in this sequence it is a
 * sub-pixel patch of different roughness, which is the exact recipe for a
 * specular that flickers on and off with the pixel grid. Under the near
 * lighting they came out as a field of bright dots with red and blue fringes
 * from the composite's aberration - water beaded on the floor, not rubber.
 *
 * The maps are drawn to canvas rather than downloaded, so this costs bytes in
 * neither GLB nor a texture request.
 */
export function createFloorMaps(anisotropy: number): FloorMaps {
  const S = 512
  const TILE = S / 2            // two tiles across the 2 m repeat

  const albedo = document.createElement('canvas')
  const rough = document.createElement('canvas')
  const height = document.createElement('canvas')
  for (const c of [albedo, rough, height]) { c.width = c.height = S }
  const ac = albedo.getContext('2d')!
  const rc = rough.getContext('2d')!
  const hc = height.getContext('2d')!

  ac.fillStyle = '#070809'; ac.fillRect(0, 0, S, S)
  rc.fillStyle = '#d4d4d4'; rc.fillRect(0, 0, S, S)

  // Deterministic so repeated runs produce byte-identical maps.
  let seed = 0x9e3779b9
  const rnd = () => {
    seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5
    return ((seed >>> 0) % 100000) / 100000
  }

  // Nothing at any scale lives in these maps except the grain and the seams.
  //
  // Broad polished patches - what a real mat has, where people walk - were the
  // obvious way to vary the roughness, and they were wrong: this map tiles
  // forty-five times across the plane, so a feature at tile scale becomes a
  // visible checkerboard across the whole floor. All variation above grain
  // scale comes from world-space noise in the surface shader, which does not
  // repeat at all.

  // Height is a fine, low-amplitude grain plus the tile seams: the moulded
  // pebble texture of the mat surface, at a scale that stays sub-pixel until
  // the camera is right down on the floor.
  const hImg = hc.createImageData(S, S)
  const grain = new Float32Array(S * S)
  for (let i = 0; i < grain.length; i++) grain[i] = rnd()
  const at = (x: number, y: number) => grain[((y + S) % S) * S + ((x + S) % S)]!
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      // 3x3 box blur, twice over, keeps the grain a couple of texels wide.
      let sum = 0
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) sum += at(x + dx, y + dy)
      const v = 118 + (sum / 9 - 0.5) * 34
      const o = (y * S + x) * 4
      hImg.data[o] = hImg.data[o + 1] = hImg.data[o + 2] = Math.round(v)
      hImg.data[o + 3] = 255
    }
  }
  hc.putImageData(hImg, 0, 0)

  // Tile seams. These *are* relief - a real mat has a chamfered joint - so they
  // go into all three maps.
  for (const c of [[ac, 'rgba(0,0,0,0.62)'], [rc, 'rgba(255,0,0,0.55)'], [hc, 'rgba(104,104,104,0.6)']] as const) {
    const ctx = c[0]
    ctx.strokeStyle = c[1]
    ctx.lineWidth = 1.6
    ctx.beginPath()
    for (let i = 0; i <= 1; i++) {
      ctx.moveTo(i * TILE + 0.5, 0); ctx.lineTo(i * TILE + 0.5, S)
      ctx.moveTo(0, i * TILE + 0.5); ctx.lineTo(S, i * TILE + 0.5)
    }
    ctx.stroke()
  }

  // Sobel the height field into a tangent-space normal map. Wrapping the
  // sample indices keeps the tiling seamless.
  const hData = hc.getImageData(0, 0, S, S).data
  const nImg = hc.createImageData(S, S)
  const h = (x: number, y: number) => hData[(((y + S) % S) * S + ((x + S) % S)) * 4]! / 255
  const strength = 1.1
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const dx = (h(x + 1, y) - h(x - 1, y)) * strength
      const dy = (h(x, y + 1) - h(x, y - 1)) * strength
      const len = Math.hypot(dx, dy, 1)
      const o = (y * S + x) * 4
      nImg.data[o] = Math.round((-dx / len * 0.5 + 0.5) * 255)
      nImg.data[o + 1] = Math.round((-dy / len * 0.5 + 0.5) * 255)
      nImg.data[o + 2] = Math.round((1 / len * 0.5 + 0.5) * 255)
      nImg.data[o + 3] = 255
    }
  }
  const normal = document.createElement('canvas')
  normal.width = normal.height = S
  normal.getContext('2d')!.putImageData(nImg, 0, 0)

  const mk = (c: HTMLCanvasElement, srgb: boolean) => {
    const t = new THREE.CanvasTexture(c)
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(45, 45)          // 2 m tiles across the 90 m plane
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace
    t.anisotropy = anisotropy
    return t
  }
  const map = mk(albedo, true)
  const roughnessMap = mk(rough, false)
  const normalMap = mk(normal, false)

  return {
    map,
    roughnessMap,
    normalMap,
    dispose: () => { map.dispose(); roughnessMap.dispose(); normalMap.dispose() },
  }
}


