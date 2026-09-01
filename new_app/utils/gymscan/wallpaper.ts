// Gym wallpaper: two 2D plates and one near-field rack card that read as the rest of the room.
//
// The establishing camera sits at +X, so a single back wall is edge-on on the
// left of the frame and the gym vanished there. A second plate sits beside
// the machine on that side and samples the branded wall through the first
// column bay of the same photograph: the LIFTAG mark, the dumbbells, then
// gym receding toward the hero.
//
// Games sell a 3D room with a 2D plate by putting a height-mapped photograph
// on a wall and lighting it with the same fixtures as the rest of the scene.
// Parallax occlusion mapping (a handful of height samples along the view ray)
// shifts the UVs so racks and columns slide against each other as the camera
// dollies, and a tangent-space normal makes the ceiling strips draw a highlight
// that follows the relief. Lighting and fog are evaluated at a height-offset
// world position, the strips self-shadow the relief, and as the camera closes
// a mip bias softens the plate. The squat rack is a third quad a few metres
// in front of the back wall, cut from the same photograph.
//
// This is deliberately *not* a MeshStandardMaterial. The floor already spends
// most of the frame in three's 8-light PBR loop, and a wall that covers the
// back of the screen would double that. The wallpaper evaluates two line
// lights (the strips) and two spots (the far overheads) as a tight Lambert
// plus a tiny Blinn, so the same fixtures that light the machine pick racks
// out of the black rather than filling the plate.
import * as THREE from 'three'
import { CEILING_STRIPS, STRIP_COLOR } from './environment'

const ALBEDO_URL = '/assets/gym3d/wallpaper.webp'
const NXH_URL = '/assets/gym3d/wallpaper-nxh.webp'

/** Back wall: wide enough to fill the establishing FOV from the three-quarter
 * station, tall enough that the photograph's floor sits below y = 0 and is
 * clipped by the real mat. */
const BACK = { z: -9.4, w: 24.0, h: 10.2, y: 1.35 }
/** Left wall: the establishing camera sits at +X. A plate on the back wall's
 * left corner is 12 m out and reads as a postage stamp in the upper-left;
 * this one sits beside the machine so the left half of the frame actually
 * has gym in it. z stays behind the seated camera. */
const LEFT = { x: -5.8, zNear: -0.6, zFar: -7.2 }
/** Photo UV of the squat-rack card (v = 0 at the bottom, matching three's
 * flipped texture). Must stay in lockstep with the packer's seed box. */
const RACK_UV = { u0: 0.72, u1: 1.0, v0: 0.36, v1: 0.84 }
/** Between the hero and the back plate. */
const CARD_Z = -6.2
/** Establishing station — `CAM_PATH[0]` in stage.ts. The card is scaled so
 * it covers the same screen area as the rack print at that camera. */
const EST_CAM = { x: 3.98, y: 2.22, z: 4.96 }

const STRIP_ENDS = CEILING_STRIPS.map((s) => {
  const half = s.l * 0.5
  return {
    a: new THREE.Vector3(s.x, s.y, s.z - half),
    b: new THREE.Vector3(s.x, s.y, s.z + half),
  }
})

const VERTEX = /* glsl */`
varying vec3 vWorldPos;
varying vec3 vNormal;
varying vec3 vTangent;
varying vec3 vBitangent;
varying vec2 vUv;

void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  vUv = uv;

  vec3 N = normalize(normalMatrix * normal);
  vec3 T = normalize(cross(vec3(0.0, 1.0, 0.0), N));
  vec3 B = cross(N, T);
  vNormal = N;
  vTangent = T;
  vBitangent = B;

  gl_Position = projectionMatrix * viewMatrix * wp;
}
`

const LIGHTING = /* glsl */`
uniform vec3 uStripA0;
uniform vec3 uStripA1;
uniform vec3 uStripB0;
uniform vec3 uStripB1;
uniform vec3 uStripColor;
uniform float uStripGain;
uniform vec3 uFarPos0;
uniform vec3 uFarPos1;
uniform vec3 uFarColor;
uniform float uFarGain0;
uniform float uFarGain1;

vec3 closestOnSeg(vec3 p, vec3 a, vec3 b) {
  vec3 ab = b - a;
  float t = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-4), 0.0, 1.0);
  return a + ab * t;
}

vec3 lightWallpaper(vec3 pos, vec3 N, vec3 V, float sh0, float sh1) {
  // Almost no fill. Dramatic here means the fixtures pick things out of
  // black, not that the wall is a dimly-lit grey slab.
  vec3 lighting = vec3(0.028, 0.032, 0.040);

  vec3 s0 = closestOnSeg(pos, uStripA0, uStripA1);
  vec3 L0 = s0 - pos;
  float d0 = length(L0);
  L0 /= max(d0, 1e-3);
  // A little harder than Lambert so only faces that actually see a strip
  // lift - the height map's rack tops, not the whole plate.
  float ndl0 = pow(max(dot(N, L0), 0.0), 1.08);
  float att0 = uStripGain / (1.0 + d0 * d0 * 0.016);
  lighting += uStripColor * ndl0 * att0 * sh0;

  vec3 s1 = closestOnSeg(pos, uStripB0, uStripB1);
  vec3 L1 = s1 - pos;
  float d1 = length(L1);
  L1 /= max(d1, 1e-3);
  float ndl1 = pow(max(dot(N, L1), 0.0), 1.08);
  float att1 = uStripGain / (1.0 + d1 * d1 * 0.016);
  lighting += uStripColor * ndl1 * att1 * sh1;

  vec3 to0 = pos - uFarPos0;
  float df0 = length(to0);
  vec3 dir0 = to0 / max(df0, 1e-3);
  float cone0 = pow(max(-dir0.y, 0.0), 1.55);
  lighting += uFarColor * max(dot(N, -dir0), 0.0) * cone0 * uFarGain0 / (1.0 + df0 * df0 * 0.024);

  vec3 to1 = pos - uFarPos1;
  float df1 = length(to1);
  vec3 dir1 = to1 / max(df1, 1e-3);
  float cone1 = pow(max(-dir1.y, 0.0), 1.55);
  lighting += uFarColor * max(dot(N, -dir1), 0.0) * cone1 * uFarGain1 / (1.0 + df1 * df1 * 0.024);

  vec3 H = normalize(L0 + V);
  float spec = pow(max(dot(N, H), 0.0), 40.0) * 0.08;
  lighting += uStripColor * spec * att0 * sh0;

  return lighting;
}
`

const FRAGMENT_BACK = /* glsl */`
uniform sampler2D uAlbedo;
uniform sampler2D uNxh;
uniform float uHeightScale;
uniform float uFogDensity;
uniform float uPomSteps;
uniform float uBase;
uniform float uAmp;
uniform float uHotFade;
uniform float uLod;
uniform float uRelief;
uniform float uCard;
uniform float uFloorV;
uniform float uCeilV;
uniform vec2 uUvMul;
uniform vec2 uUvAdd;

varying vec3 vWorldPos;
varying vec3 vNormal;
varying vec3 vTangent;
varying vec3 vBitangent;
varying vec2 vUv;

${LIGHTING}

vec2 pom(vec2 uv, vec3 viewTS) {
  float steps = max(uPomSteps, 1.0);
  vec2 delta = viewTS.xy * (uHeightScale / max(viewTS.z, 0.28)) / steps;
  vec2 p = uv;
  float layer = 1.0;
  float stepH = 1.0 / steps;
  for (int i = 0; i < 8; i++) {
    if (float(i) >= uPomSteps) break;
    float h = texture2D(uNxh, p).b;
    if (h >= layer) break;
    p -= delta;
    layer -= stepH;
  }
  return p;
}

float pomShadow(vec2 uv, float h0, vec3 lightTS) {
  if (uPomSteps < 0.5 || lightTS.z <= 0.02) return 1.0;
  float steps = min(uPomSteps, 3.0);
  vec2 delta = lightTS.xy * (uHeightScale / max(lightTS.z, 0.28)) / steps;
  vec2 p = uv;
  float rayH = h0;
  float stepH = 1.0 / steps;
  float occ = 1.0;
  for (int i = 0; i < 8; i++) {
    if (float(i) >= steps) break;
    p += delta;
    rayH += stepH;
    if (rayH >= 1.0) break;
    float h = texture2D(uNxh, p).b;
    if (h > rayH) {
      float pen = clamp((h - rayH) * 6.0, 0.0, 1.0);
      occ = min(occ, mix(1.0, 0.15, pen));
    }
  }
  return occ;
}

void main() {
  vec3 T = normalize(vTangent);
  vec3 B = normalize(vBitangent);
  vec3 Ngeom = normalize(vNormal);
  vec3 Vplate = normalize(cameraPosition - vWorldPos);
  vec3 viewTS = vec3(dot(Vplate, T), dot(Vplate, B), dot(Vplate, Ngeom));

  vec2 baseUv = vUv * uUvMul + uUvAdd;
  // The card quad is mostly empty. Discard on the un-parallaxed alpha
  // before POM so those fragments do not march the height field.
  if (uCard > 0.5 && texture2D(uAlbedo, baseUv).a < 0.08) discard;
  // Grazing POM walks the height field into horizontal bands — the
  // photograph's floor, cove and benches stacked as stripes. Only
  // offset UVs when the wall actually faces the camera.
  vec2 uv = (uPomSteps > 0.5 && viewTS.z > 0.28) ? pom(baseUv, viewTS) : baseUv;

  vec4 tex = texture2D(uAlbedo, uv, uLod);
  float rack = tex.a;
  if (uCard > 0.5 && rack < 0.08) discard;

  vec3 albedo = tex.rgb;
  // Ghost removal: the card owns the squat rack, so the back plate fades
  // the same texels rather than drawing a second copy on the wall.
  if (uCard < 0.5) albedo *= 1.0 - rack * 0.62;

  // The packer already crushed the house lights. A second hard ceiling at
  // 0.055 then flattened every rack highlight into the same grey, and the
  // wall became a void. Keep the floor black; let the photo's own structure
  // (racks, columns, the lime cove) through a soft knee.
  float lime = smoothstep(0.03, 0.10, albedo.g - max(albedo.r, albedo.b));
  float lum = max(albedo.r, max(albedo.g, albedo.b));
  // Dark columns and machine silhouettes live around 0.02–0.06. Starting the
  // keep any higher leaves only the lime cove and the brightest rack.
  float keep = mix(smoothstep(0.004, 0.040, lum), 1.0, lime);
  albedo *= mix(0.78, 1.0, keep);
  // Structure has to survive AgX in this grade. Lime stays well under
  // so the eaves cove cannot out-shout a rack when exposure comes up.
  albedo = min(albedo, mix(vec3(0.34), vec3(0.025), lime));
  if (uCard < 0.5) albedo *= 1.0 - uHotFade * smoothstep(0.55, 0.92, vUv.x);
  vec3 nxh = texture2D(uNxh, uv, uLod * 0.5).rgb;
  vec3 Nt = nxh * 2.0 - 1.0;
  Nt.z = sqrt(max(1.0 - dot(Nt.xy, Nt.xy), 0.0));
  vec3 N = normalize(T * Nt.x + B * Nt.y + Ngeom * Nt.z);

  // Packed height lives in ~0.08–0.54 (floor crushed, near rack peak).
  // Remap so uRelief is metres at the near surface and the mat stays put.
  // Lime is a painted cove on the wall, not a near object — pulling it
  // forward dropped the fog and it read as a floating bar.
  float facing = smoothstep(0.12, 0.34, max(dot(Ngeom, Vplate), 0.0));
  float hUnit = clamp((nxh.b - 0.078) / 0.46, 0.0, 1.0) * (1.0 - lime) * facing;
  vec3 pos = vWorldPos + Ngeom * (hUnit * uRelief);
  vec3 V = normalize(cameraPosition - pos);

  vec3 L0w = closestOnSeg(pos, uStripA0, uStripA1) - pos;
  vec3 L1w = closestOnSeg(pos, uStripB0, uStripB1) - pos;
  vec3 L0n = L0w / max(length(L0w), 1e-3);
  vec3 L1n = L1w / max(length(L1w), 1e-3);
  vec3 LT0 = vec3(dot(L0n, T), dot(L0n, B), dot(L0n, Ngeom));
  vec3 LT1 = vec3(dot(L1n, T), dot(L1n, B), dot(L1n, Ngeom));
  float sh0 = uCard > 0.5 ? 1.0 : pomShadow(uv, nxh.b, LT0);
  float sh1 = uCard > 0.5 ? 1.0 : pomShadow(uv, nxh.b, LT1);

  // Unlit matte is now a whisper of the photograph; the strips and far
  // pools do the picking-out. Height in the packed map stands in for metal
  // so a rail catches more than a vinyl pad.
  float metal = nxh.b * (1.0 - lime) * facing;
  vec3 lighting = lightWallpaper(pos, N, V, sh0, sh1);
  lighting += lighting * metal * 0.22;
  vec3 col = albedo * (uBase + lighting) * uAmp;
  // Amp that makes racks readable also turns the cove into a lamp.
  // Dim it after lighting so the rest of the gym can stay up.
  col *= mix(1.0, 0.16, lime);

  // Equipment lives between the mat and the eaves. The photograph's floor
  // is the 3D rubber's job; its ceiling is already black. Without this
  // band the plate reads as a lit rectangle rather than a room.
  float heightBand = smoothstep(0.0, 0.35, vWorldPos.y)
                   * (1.0 - smoothstep(4.2, 6.0, vWorldPos.y));
  col *= mix(0.62, 1.0, heightBand);

  float eaves = smoothstep(6.5, 5.4, vWorldPos.y);
  // The photograph has a huge floor and a cove LED. On a vertical plate
  // those become horizontal stripes. Keep the equipment belt; the 3D mat
  // owns the floor and the eaves own the ceiling.
  col *= smoothstep(uFloorV, uFloorV + 0.10, uv.y);
  col *= 1.0 - smoothstep(uCeilV, uCeilV + 0.12, uv.y);
  // A perspective photo viewed along the wall shears into bands. Fade
  // grazing fragments instead of showing the shear.
  float graze = 1.0 - smoothstep(0.10, 0.32, max(dot(Ngeom, Vplate), 0.0));
  if (uCard < 0.5) col *= 1.0 - graze * 0.88;
  float sides = uCard > 0.5
    ? smoothstep(1.0, 0.82, vUv.y)
    : smoothstep(0.0, 0.05, vUv.x) * smoothstep(1.0, 0.95, vUv.x);
  // Only the leftover that would sit in the camera's lap. The left plate's
  // near edge is around z = 0, which the old 0.5 cutoff was painting out.
  float near = smoothstep(3.2, 1.2, vWorldPos.z);
  col *= eaves * sides * near;

  float dist = length(pos - cameraPosition);
  float fog = 1.0 - exp(-uFogDensity * uFogDensity * dist * dist);
  col = mix(col, vec3(0.0), fog);

  gl_FragColor = vec4(col, 1.0);
}
`

function sharedLightUniforms() {
  return {
    uStripA0: { value: STRIP_ENDS[0]!.a.clone() },
    uStripA1: { value: STRIP_ENDS[0]!.b.clone() },
    uStripB0: { value: STRIP_ENDS[1]!.a.clone() },
    uStripB1: { value: STRIP_ENDS[1]!.b.clone() },
    uStripColor: { value: new THREE.Color(STRIP_COLOR) },
    uStripGain: { value: 3.6 },
    uFarPos0: { value: new THREE.Vector3(-2.0, 5.4, -5.5) },
    uFarPos1: { value: new THREE.Vector3(3.4, 5.4, -8.0) },
    uFarColor: { value: new THREE.Color(0x93a8cc) },
    uFarGain0: { value: 5.4 },
    uFarGain1: { value: 3.2 },
    uAmp: { value: 1.0 },
    uFogDensity: { value: 0.032 },
  }
}

function loadTexture(url: string): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(url, resolve, undefined, reject)
  })
}

export interface GymWallpaper {
  group: THREE.Group
  uniforms: {
    uAmp: { value: number }
    uHeightScale: { value: number }
    uPomSteps: { value: number }
    uStripGain: { value: number }
    uBase: { value: number }
    uFogDensity: { value: number }
    uLod: { value: number }
    uRelief: { value: number }
  }
  load: () => Promise<void>
  dispose: () => void
}

export function createGymWallpaper(opts: {
  anisotropy: number
  pomSteps: number
}): GymWallpaper {
  const group = new THREE.Group()
  group.name = 'gymWallpaper'

  const shared = {
    uLod: { value: 0 },
    uRelief: { value: 2.0 },
    uHeightScale: { value: 0.045 },
    uPomSteps: { value: opts.pomSteps },
  }

  function makeUniforms(over: {
    amp: number
    base: number
    strip: number
    fog: number
    hot: number
    card?: number
    floorV?: number
    ceilV?: number
    uvMul?: [number, number]
    uvAdd?: [number, number]
  }) {
    const u = {
      ...sharedLightUniforms(),
      uAlbedo: { value: null as THREE.Texture | null },
      uNxh: { value: null as THREE.Texture | null },
      uHeightScale: shared.uHeightScale,
      uPomSteps: shared.uPomSteps,
      uLod: shared.uLod,
      uRelief: shared.uRelief,
      uCard: { value: over.card ?? 0 },
      uFloorV: { value: over.floorV ?? 0.36 },
      uCeilV: { value: over.ceilV ?? 0.78 },
      uBase: { value: over.base },
      uHotFade: { value: over.hot },
      uUvMul: { value: new THREE.Vector2(...(over.uvMul ?? [1, 1])) },
      uUvAdd: { value: new THREE.Vector2(...(over.uvAdd ?? [0, 0])) },
    }
    u.uAmp.value = over.amp
    u.uStripGain.value = over.strip
    u.uFogDensity.value = over.fog
    return u
  }

  function makeMat(uniforms: ReturnType<typeof makeUniforms>) {
    return new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT_BACK,
      toneMapped: false,
      depthWrite: true,
      fog: false,
    })
  }

  const backUniforms = makeUniforms({
    // Low unlit matte: the photograph's contrast is the gym, the fixtures
    // pick it out. A base near 1 with the old 0.055 ceiling was a grey void.
    amp: 4.8, base: 0.78, strip: 7.2, fog: 0.007, hot: 0.28,
    floorV: 0.42, ceilV: 0.56,
    // Skip the branded end wall; that lives on the left plate.
    uvMul: [0.64, 1], uvAdd: [0.36, 0],
  })
  const leftUniforms = makeUniforms({
    // Strip still sits below the back plate: this wall faces the left fixture
    // more than the back one does. UV runs from the LIFTAG wall (logo +
    // dumbbells) into the first column bay, so the left of the shot has the
    // mark and gym rather than a blank end wall or a rack with no brand.
    amp: 4.4, base: 0.74, strip: 5.6, fog: 0.005, hot: 0.0,
    floorV: 0.38, ceilV: 0.76,
    uvMul: [0.48, 1.0], uvAdd: [0.02, -0.03],
  })
  leftUniforms.uFarGain0.value = 9.5
  backUniforms.uFarGain0.value = 9.5
  backUniforms.uFarGain1.value = 6.8

  const backMat = makeMat(backUniforms)
  const leftMat = makeMat(leftUniforms)

  const back = new THREE.Mesh(new THREE.PlaneGeometry(BACK.w, BACK.h), backMat)
  back.position.set(0, BACK.y, BACK.z)
  back.name = 'wallpaper-back'
  group.add(back)

  const leftDepth = LEFT.zNear - LEFT.zFar
  const left = new THREE.Mesh(new THREE.PlaneGeometry(leftDepth, BACK.h), leftMat)
  const leftZ = (LEFT.zNear + LEFT.zFar) * 0.5
  left.position.set(LEFT.x, BACK.y, leftZ)
  // Face the establishing camera, not the room's +X. A wall square to the
  // room is edge-on to that lens, so the bay shears and reads as rotated
  // even though V is still world-up.
  left.rotation.y = Math.atan2(3.98 - LEFT.x, 4.96 - leftZ)
  left.name = 'wallpaper-left'
  group.add(left)

  const backU0 = 0.36
  const backUSpan = 0.64
  const wallX0 = ((RACK_UV.u0 - backU0) / backUSpan - 0.5) * BACK.w
  const wallX1 = ((RACK_UV.u1 - backU0) / backUSpan - 0.5) * BACK.w
  const wallY0 = BACK.y + (RACK_UV.v0 - 0.5) * BACK.h
  const wallY1 = BACK.y + (RACK_UV.v1 - 0.5) * BACK.h
  const wall = {
    x: (wallX0 + wallX1) * 0.5,
    y: (wallY0 + wallY1) * 0.5,
    z: BACK.z,
    w: wallX1 - wallX0,
    h: wallY1 - wallY0,
  }
  const cardT = (CARD_Z - EST_CAM.z) / (wall.z - EST_CAM.z)
  const cardScale = (EST_CAM.z - CARD_Z) / (EST_CAM.z - BACK.z)
  const cardUniforms = makeUniforms({
    amp: 5.2, base: 0.82, strip: 7.4, fog: 0.004, hot: 0.0, card: 1,
    floorV: 0.22, ceilV: 0.80,
    uvMul: [RACK_UV.u1 - RACK_UV.u0, RACK_UV.v1 - RACK_UV.v0],
    uvAdd: [RACK_UV.u0, RACK_UV.v0],
  })
  cardUniforms.uFarGain1.value = 4.4
  const cardMat = makeMat(cardUniforms)
  const card = new THREE.Mesh(
    new THREE.PlaneGeometry(wall.w * cardScale, wall.h * cardScale),
    cardMat,
  )
  card.position.set(
    EST_CAM.x + cardT * (wall.x - EST_CAM.x),
    EST_CAM.y + cardT * (wall.y - EST_CAM.y),
    CARD_Z,
  )
  card.name = 'wallpaper-rack'
  group.add(card)

  group.visible = false

  const geos = [back.geometry, left.geometry, card.geometry]
  const mats = [backMat, leftMat, cardMat]
  let albedoTex: THREE.Texture | null = null
  let nxhTex: THREE.Texture | null = null

  async function load() {
    try {
      const [albedo, nxh] = await Promise.all([loadTexture(ALBEDO_URL), loadTexture(NXH_URL)])
      albedo.colorSpace = THREE.SRGBColorSpace
      albedo.anisotropy = opts.anisotropy
      albedo.minFilter = THREE.LinearMipmapLinearFilter
      albedo.magFilter = THREE.LinearFilter
      albedo.generateMipmaps = true
      albedo.wrapS = albedo.wrapT = THREE.ClampToEdgeWrapping
      albedo.premultiplyAlpha = false
      albedo.needsUpdate = true

      nxh.colorSpace = THREE.NoColorSpace
      nxh.anisotropy = opts.anisotropy
      nxh.minFilter = THREE.LinearMipmapLinearFilter
      nxh.magFilter = THREE.LinearFilter
      nxh.generateMipmaps = true
      nxh.wrapS = nxh.wrapT = THREE.ClampToEdgeWrapping
      nxh.needsUpdate = true

      albedoTex = albedo
      nxhTex = nxh
      backUniforms.uAlbedo.value = albedo
      backUniforms.uNxh.value = nxh
      leftUniforms.uAlbedo.value = albedo
      leftUniforms.uNxh.value = nxh
      cardUniforms.uAlbedo.value = albedo
      cardUniforms.uNxh.value = nxh
      group.visible = true
    } catch {
      group.visible = false
    }
  }

  function dispose() {
    geos.forEach(g => g.dispose())
    mats.forEach(m => m.dispose())
    albedoTex?.dispose()
    nxhTex?.dispose()
  }

  return {
    group,
    uniforms: {
      uAmp: backUniforms.uAmp,
      uHeightScale: backUniforms.uHeightScale,
      uPomSteps: backUniforms.uPomSteps,
      uStripGain: backUniforms.uStripGain,
      uBase: backUniforms.uBase,
      uFogDensity: backUniforms.uFogDensity,
      uLod: shared.uLod,
      uRelief: shared.uRelief,
    },
    load,
    dispose,
  }
}
