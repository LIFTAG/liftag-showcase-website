// The dark-gym hero stage: scene graph, lighting, scan choreography, render loop.
//
// Owns everything WebGL. The Vue component owns layout and the DOM overlays and
// feeds this one number - normalised scroll progress - plus pointer state. Per
// frame the stage hands back only the phone measurement the DOM needs. Scanner
// chrome stays inside this renderer so it cannot lag behind the 3D projection.
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'

import {
  CEILING_STRIPS, STRIP_COLOR, STRIP_NITS,
  createGymEnvironment, createContactShadowTexture, createFloorMaps,
} from './environment'
import {
  applyScanShader, applySurfaceShader, createScanUniforms, createSurfaceUniforms, type SurfaceKind,
} from './machineMaterial'
import { WIRE_RGB } from './hologramColor'
import { CompositeShader } from './composite'
import { createHologramShell, type HologramShell } from './hologram'
import { createPlacardMaterial, createPlacardUniforms } from './placard'
import { createFoilMaterial, createFoilUniforms } from './foil'
import { createNfcMaps, createNfcMaterial } from './nfc'
import { createPeelUniforms, writePeel, type PeelUniforms } from './peel'
import { act0At, act0Windows, type Act0Shot, type Act0State } from './act0'
import { act1At, act1Windows, phoneFillAmp, PHONE_FILL_INTENSITY, type Act1Shot, type Act1State } from './act1'
import { APPROACH_PATH, APPROACH_TARGET_PATH } from './act1Cam'
import { act0CamAt } from './act0Cam'
import { floorConstructAt, PBR_TAIL_R } from './floorConstruct'
import {
  emptyTilePose, floorTilePoseAt, FLOOR_TILES,
  TILE_FIELD_HALF, TILE_SIZE, TILE_THICK, TILE_T0,
} from './floorTiles'
import {
  PLACARD_H, PLACARD_REST, PLACARD_W, SHOWCASE_KEY_INTENSITY,
  stickAt, stickHidden, type StickPose,
} from './stick'
import { createPhoneOverlay, phoneShrink, type PhoneOverlay } from './phoneOverlay'
import { createScanAppScreen } from './scanApp.ts'
import { PHONE_H, PHONE_W } from '../phoneModel'
import {
  createReticleTracker,
  RETICLE_MORPH_END,
  RETICLE_MORPH_START,
  RETICLE_OUT_END,
  type ScreenRect,
} from './reticle'
import { createReticleOverlay } from './reticleOverlay'
import {
  fallbackHeroSlot,
  GYM_SCROLL_DAMP_RATE,
  heroMorphAt,
  sceneProgress,
  travelPhoneBox,
  type PhoneBox,
} from './handoff'
import { dropAt, dropPlanted, firstSweepTime, PLANTED_DROP } from './drop'
import { assembleAt, type AssembleState } from './assemble'
import { loadPartsRig, type PartsRig } from './parts'
import type { GymScanDevice } from './device'
import {
  clamp01, damp, ease, lerp, scalarAt, smoothstep, span, vec3HermiteAt,
  type ScalarStop, type Vec3Stop,
} from './timeline'

// --- choreography ----------------------------------------------------------
// One table for the whole sequence. Reading down a column tells you what the
// scan, the lights and the fold are each doing at any point in the scroll.
//
// The camera move is one shot, so it is written as one shot: a path through
// space (`act1Cam.ts`), and - separately, here - a schedule saying how fast
// the camera travels along it. It used to be a single nine-stop table read
// with `vec3At`, which eases in *and* out of every stop; velocity therefore
// hit zero eight times on the way down, and what was meant to be a dolly
// arrived as eight consecutive zooms with a pause between each. Splitting
// shape from timing fixes that at the root: `vec3HermiteAt` carries speed
// across every control point, and `cameraU` accelerates exactly once and
// decelerates exactly once.
//
// Nothing drives the machine any more. The scan plane, the contour slices, the
// identified outline and the interference burst all used to have tables here;
// the machine now carries no analysis layer, so the whole scan reads on the QR
// placard and in the HUD instead. What is left below is the code plate and the
// fold.
// All three retire to nothing by the time the app UI is up. They used to fade
// only part-way, which was survivable while the camera pulled back out at the
// end and left the plate small and far away; the move is monotonic now and the
// shot holds on the plate, so any residual glow on it prints straight through
// the app screen the fold maps over it.
const PLACARD_REVEAL: readonly ScalarStop[] = [
  [0.00, 0], [0.16, 0], [0.48, 1], [1.00, 1],
]
const PLACARD_RESOLVE: readonly ScalarStop[] = [
  [0.00, 0], [0.24, 0], [0.72, 1], [1.00, 1],
]
const PLACARD_LOCK: readonly ScalarStop[] = [
  [0.00, 0], [0.58, 0], [0.86, 1], [1.00, 1],
]
// The hologram exoskeleton's window. Live from the very top of the page: the
// sweep is an idle, and an idle that only starts once you scroll is not one.
// It used to hold off until 16% to leave the opening beat as a bare silhouette
// in a dark room, which is a defensible shot and the wrong trade - the first
// screen is also the only screen a lot of visitors see, and a machine being
// scanned while nothing else moves says more about the product than a machine
// sitting still does.
//
// It still retires well before the fold: once the placard starts resolving the
// analysis has found what it was looking for, and the story is on the code.
const HOLO: readonly ScalarStop[] = [
  [0.00, 1], [0.40, 1], [0.56, 0],
]
// Key, rims and the two ceiling strips ride the dolly. Size (cone, strip
// length) contracts while the floor is still in frame; level stays up so
// the pool shrinks instead of just dimming in place, then dies in the
// seat. Area lights have no distance cutoff, so the strips have to get
// physically shorter or they keep washing the mat.
const KEY_INTENSITY0 = 10
const KEY_DISTANCE0 = 11
const KEY_ANGLE0 = 0.50
const KEY_PENUMBRA0 = 0.70
const KEY_DISTANCE_END = 1.8
const KEY_ANGLE_END = 0.09
const KEY_PENUMBRA_END = 0.32
const RIM_L0 = 7.5
const RIM_R0 = 5.5
const STRIP_W0 = 0.95
const STRIP_L0 = 13.5
const STRIP_W_END = 0.38
const STRIP_L_END = 2.4
const STRIP_SPOT_I0 = 38
const STRIP_SPOT_D0 = 18
const STRIP_SPOT_A0 = 1.15
// Size pulls in across the whole dolly so the pool tightens onto the machine
// instead of washing the whole mat from a metre away.
//
// Both tables retire to nothing by the end of the dolly. The shot ends inside
// the machine at the seated eye point, with the plate in the middle of the
// frame: a key still burning there has nothing left to light and prints
// straight through the code. The phone fill that replaces it is already on
// from the last of the approach, so the close-up does not gain a lamp.
const KEY_SIZE: readonly ScalarStop[] = [
  [0.00, 1],
  [0.28, 0.82],
  [0.50, 0.55],
  [0.70, 0.26],
  [0.86, 0.06],
  [0.96, 0],
]
const KEY_LEVEL: readonly ScalarStop[] = [
  [0.00, 1],
  [0.52, 1],
  [0.70, 0.9],
  [0.86, 0.72],
  [0.96, 0],
]
/**
 * The cover fold, on both cuts. The room curls onto the phone's glass with the
 * scanned plate pinned in place, so the square you were just looking at *is*
 * the screen - a match cut on a shape rather than a dissolve between two
 * pictures.
 *
 * It no longer opens back onto the room. It used to, because the film stayed
 * in the gym afterwards; now the glass is the thing that travels into the
 * landing hero, so the fold forms and holds.
 */
/**
 * Local fold progress at which the glass has fully formed.
 *
 * Derived so the bezel can start during the zoom without the app cut moving
 * with it: `foldU` reaches this value at `lockEnd`, same as when the fold
 * used to start after the lock. Ratios match on both cuts.
 */
const FOLD_FORM_WINDOWS = act1Windows(false)
const FOLD_FORM_U = (FOLD_FORM_WINDOWS.lockEnd - FOLD_FORM_WINDOWS.foldStart)
  / (1 - FOLD_FORM_WINDOWS.foldStart)
function foldSentence(u: number): number {
  if (u <= 0) return 0
  if (u >= FOLD_FORM_U) return 1
  return smoothstep(u / FOLD_FORM_U)
}
/**
 * The brackets' own clock, mapped out of the three Act 1 shots.
 *
 * They hunt the cursor through the Act 0 hold - the tag is planted by then and
 * the room is waiting. Hovering the plate acquires it early; otherwise they
 * lock on in the first fifth of the dolly. They hold until the glass starts
 * forming on the last of the zoom, then fade out exactly as it finishes,
 * which is the frame the app screen cuts in.
 *
 * Two earlier versions were wrong in opposite directions. Resolving them
 * during the lock shot meant the corners were still hunting a cursor through
 * a two-second push onto a tag they were obviously about to find; retiring
 * them at the end of that shot meant the code lost its brackets before the
 * fold had anything to hand over. Fading them on `foldU` rather than on the
 * exclusive fold shot keeps that second fix now that the glass overlaps the
 * dolly.
 */
const RETICLE_ACQUIRE_U = 0.18
function reticleProgress(act1: Act1State, live: boolean): number {
  const formed = clamp01(act1.foldU / FOLD_FORM_U)
  if (formed > 0) {
    return RETICLE_MORPH_END + formed * (RETICLE_OUT_END - RETICLE_MORPH_END)
  }
  if (!live || act1.shot === 'approach') {
    const dolly = live ? act1.dollyU : 0
    return RETICLE_MORPH_START
      + clamp01(dolly / RETICLE_ACQUIRE_U) * (RETICLE_MORPH_END - RETICLE_MORPH_START)
  }
  return RETICLE_MORPH_END
}

// Keep the live composite on screen until the 3D phone is actually leaving
// full-bleed. Switching earlier replaced the frame with a 1:1-ish screen
// that was still a few percent off, which read as a zoom snap before any
// bezel existed.

export interface FrameInfo {
  progress: number
  /** 0–1 over the scroll-owned act. */
  scene: number
  /** True once the fold has finished and the glass is free to travel. */
  complete: boolean
  /** 0–1 over the tail that flies the folded phone into the hero's slot. */
  heroMorph: number
  act1: {
    shot: Act1Shot
    lock: number
  }
  /** Projected 3D phone screen in CSS px. */
  phone: {
    x: number
    y: number
    w: number
    h: number
    radius: number
    rotX: number
    rotY: number
    perspective: number
  }
  fold: number
  act0: {
    shot: Act0Shot
    skipVisible: boolean
    doorsVisible: boolean
    done: boolean
  }
}

export interface StageOptions {
  canvas: HTMLCanvasElement
  onFrame: (info: FrameInfo) => void
  onReady: () => void
  reducedMotion: boolean
  device: GymScanDevice
  onDeviceClassChange?: (deviceClass: GymScanDevice['deviceClass']) => void
}

// Bracketed under the front crossbeam, on the machine's centre line, facing
// back down the axis at the seat. From the seated eye point (0, 1.23, 0.55)
// that is 0.93 m away and 2 degrees above the sight line, with the footplate
// topping out at y = 0.83 so nothing occludes it - a plate you can actually
// scan while sitting in the machine, not one mounted over your own head.
// Mount pose and card size both live in `stick.ts`, which is the module that
// has to land the flying card on them. Two copies of these numbers is two
// chances for the plant to miss by a millimetre.
const PLACARD_POS = new THREE.Vector3(PLACARD_REST.x, PLACARD_REST.y, PLACARD_REST.z)
const PLACARD_TILT = PLACARD_REST.tiltX     // radians, nosed down toward the seat
/** Height of the crossbeam underside the placard brackets hang from. */
const PLACARD_BEAM_Y = 1.352

/**
 * Per-material overrides applied to the hero GLB at load.
 *
 * `dim` multiplies the exported albedo. The pack materials were already dark;
 * these take them darker still so the machine reads as a shape the room's
 * highlights are travelling across rather than an object being displayed.
 */
const HERO_MATERIALS: Record<string, {
  kind: SurfaceKind, rough: number | null, env: number, dim: number
}> = {
  // Powder-coated tube. The body of the machine and the darkest thing in frame.
  LIFTAG_Frame: { kind: 'frame', rough: 0.68, env: 0.42, dim: 0.62 },
  // End caps, collars, feet - matte mouldings, darker again.
  LIFTAG_Detail: { kind: 'detail', rough: 0.84, env: 0.34, dim: 0.55 },
  // The weight horns ship at roughness 0.20, which collapsed to blown white
  // streaks once bloom was applied. Real loading pins are worn, not mirrors -
  // but they are still the one place the room is allowed to show up sharply,
  // so this is the only material that keeps its full env response.
  LIFTAG_Steel: { kind: 'steel', rough: 0.38, env: 0.85, dim: 0.70 },
  // Measured against the frame, the seat and backrest were reading at three
  // times its luminance: they are the machine's only large smooth surfaces, so
  // they hold a specular where the tubes only catch a strip of one. Gym vinyl
  // is matte and dead - make it behave that way or the seat, not the frame,
  // becomes the silhouette.
  LIFTAG_Pad: { kind: 'pad', rough: 0.94, env: 0.14, dim: 0.70 },
  // The footplate is the only large flat panel on the machine and it faces the
  // key light square on. Left at its export roughness it was the brightest
  // thing in frame, which is backwards for a machine meant to read as a
  // silhouette.
  LIFTAG_Plate: { kind: 'plate', rough: 0.62, env: 0.26, dim: 0.66 },
  // Black bumper plates. Albedo zero and no env so the key light cannot
  // lift them to gray; the silhouette is the scan-shader rim.
  LIFTAG_Iron: { kind: 'detail', rough: 1, env: 0, dim: 1 },
}

export function createGymScanStage(opts: StageOptions) {
  const { canvas, device, onDeviceClassChange, onFrame, onReady, reducedMotion } = opts

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: true,
    powerPreference: 'high-performance',
  })
  // Cut selection is an input contract, not a viewport guess. A narrow laptop
  // keeps FROM THE FLOOR; a coarse tablet gets FROM THE SEAT crop.
  const isCoarse = device.cut === 'seat'
  // Every cost in this scene is per-fragment: the floor plane covers most of
  // the screen, and each of its fragments runs eight lights, an env sample, a
  // shadow lookup and the procedural surface block. Measured across the DPR
  // range the frame time is almost exactly linear in pixel count, so this cap
  // is the single largest lever there is - at 2 a 1440-wide viewport renders
  // 5.2 Mpx and the frame lands around 33 ms.
  //
  // 1.5 rather than 1 because MSAA, not resolution, is what keeps the edges
  // clean here: the machine is thin tube against black, and comparing the two
  // axes side by side, dropping samples stair-steps the rails immediately
  // while dropping resolution only softens them.
  //
  // This is the one change in the optimisation pass that is actually visible.
  // Everything else came out pixel-identical; raise it back to 2 if a target
  // machine has the headroom.
  const dprCap = device.dprCap
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, dprCap))
  // Composer passes each call renderer.render(), which would otherwise reset
  // the counter to the last fullscreen blit. 0B diagnostics need the gym
  // submit count at explode vs planted.
  if (import.meta.dev) renderer.info.autoReset = false
  // AgX keeps the near-black end neutral and rolls the scan line's highlight off
  // gracefully; ACES was tinting the dark powder-coat olive and clipping lime.
  renderer.toneMapping = THREE.AgXToneMapping
  // Pulled down from 1.35. The rig below puts more energy into speculars and
  // less into flat fill, so the machine can sit further into the toe of the
  // curve and still read - which is what a dark room actually looks like.
  renderer.toneMappingExposure = isCoarse ? 1.10 : 0.82
  renderer.shadowMap.enabled = device.shadows
  renderer.shadowMap.type = THREE.PCFShadowMap

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)
  // Eased back with the establishing station: the wider shot puts the machine
  // half again as far from the lens, and at the old density that distance
  // alone was taking a third of its light before any of the grading did.
  scene.fog = new THREE.FogExp2(0x000000, 0.080)

  const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 90)
  camera.position.set(3.98, 2.22, 4.96)

  const env = createGymEnvironment(renderer)
  scene.environment = env.texture

  const uniforms = createScanUniforms()

  // --- lighting ------------------------------------------------------------
  // A near-black room is unforgiving: with so little light in frame, the
  // *shape* of each highlight is most of what the eye has to judge realism by.
  // Point and spot lights put a round hotspot on a cylinder, which is the wrong
  // shape for a room lit by 13 m strip fixtures - those draw a highlight that
  // runs the length of the tube. So the strips are real area lights, matched to
  // the quads the environment map is built from.
  // Area lights are the expensive kind: their LTC integration runs per fragment
  // per light, and the floor plane alone covers most of the screen. Measured
  // with a timer query, four of them were about half the frame. Only these two
  // are kept, because only these two are ones whose *shape* is doing work -
  // everything else in the rig is a soft pool where a spot is indistinguishable
  // and an order of magnitude cheaper.
  const strips: THREE.RectAreaLight[] = []
  const stripSpots: THREE.SpotLight[] = []
  if (!isCoarse) {
    RectAreaLightUniformsLib.init()
    for (const s of CEILING_STRIPS) {
      const strip = new THREE.RectAreaLight(STRIP_COLOR, STRIP_NITS, s.w, s.l)
      strip.position.set(s.x, s.y, s.z)
      strip.rotation.x = -Math.PI / 2
      scene.add(strip)
      strips.push(strip)
    }
  } else {
    // Mobile GPUs are fill-rate bound long before they are anything else, so
    // the strips degrade to plain overheads there. The environment map still
    // carries their reflection; what is lost is the elongated direct highlight.
    // They are aimed in at the machine rather than straight down: a strip 13 m
    // long reaches the tubes from the side, and a spot pointed at the floor
    // does not, which left the hero measurably darker than on desktop while the
    // floor matched.
    for (const s of CEILING_STRIPS) {
      const sub = new THREE.SpotLight(STRIP_COLOR, STRIP_SPOT_I0, STRIP_SPOT_D0, STRIP_SPOT_A0, 1, 2)
      sub.position.set(s.x, s.y, s.z)
      sub.target.position.set(s.x * 0.3, 0.9, s.z * 0.3)
      scene.add(sub, sub.target)
      stripSpots.push(sub)
    }
  }


  // Ambient is now a floor under the env map rather than a fill: a constant
  // added term is direction-free by definition, and any amount of it flattens
  // the very shading the area lights are there to produce.
  const ambient = new THREE.AmbientLight(0x0a1018, 0.055)
  scene.add(ambient)

  // Area lights cannot cast shadows in three, so one spot stays on for the
  // shadow and a little directional punch. It is much dimmer than it was - it
  // is no longer carrying the exposure, only the contact. Distance and cone
  // start tight to the machine; KEY_SIZE / KEY_LEVEL then pull them in with the dolly.
  const key = new THREE.SpotLight(0xdfe8ff, KEY_INTENSITY0, KEY_DISTANCE0, KEY_ANGLE0, KEY_PENUMBRA0, 2)
  key.position.set(1.7, 4.9, 2.5)
  key.target.position.set(0, 0.82, -0.10)
  key.castShadow = renderer.shadowMap.enabled
  key.shadow.mapSize.set(2048, 2048)
  key.shadow.bias = -0.0009
  key.shadow.normalBias = 0.016
  // Tightening the near plane onto the actual subject is what buys the depth
  // precision back after softening the penumbra.
  key.shadow.camera.near = 1.5
  key.shadow.camera.far = 10
  key.shadow.radius = 3
  scene.add(key, key.target)

  const rimL = new THREE.SpotLight(0x7d94c6, RIM_L0, 9.5, 0.50, 1, 2)
  rimL.position.set(-2.9, 2.9, -2.4)
  rimL.target.position.set(0, 1.00, -0.10)
  scene.add(rimL, rimL.target)

  const rimR = new THREE.SpotLight(0x6f86bb, RIM_R0, 9.5, 0.50, 1, 2)
  rimR.position.set(3.1, 2.7, -2.6)
  rimR.target.position.set(0, 1.00, -0.10)
  scene.add(rimR, rimR.target)

  // Two dim overheads deep in the room. They are the floor's only far
  // structure - two pools receding into the fog.
  const far1 = new THREE.SpotLight(0x93a8cc, 16, 17, 0.92, 1, 2)
  far1.position.set(-2.0, 5.4, -5.5)
  far1.target.position.set(-2.0, 0, -5.5)
  scene.add(far1, far1.target)
  const far2 = new THREE.SpotLight(0x8296b8, 12, 17, 0.92, 1, 2)
  far2.position.set(3.4, 5.4, -8.0)
  far2.target.position.set(3.4, 0, -8.0)
  scene.add(far2, far2.target)

  // The light the athlete is holding.
  //
  // At the seated station the camera is *inside* the frame, looking at surfaces
  // the ceiling strips cannot reach - physically correct, and photographically
  // dead: the payoff shot came back almost entirely black. Rather than cheat a
  // light in from nowhere, this is the phone's own screen. Someone scanning a
  // plate holds a lit rectangle up to it at arm's length, so the pool of cool
  // light on the placard and the fast falloff around it are what that shot
  // genuinely looks like.
  const phoneFill = new THREE.SpotLight(0xd6e4ff, 0, 2.8, 0.50, 0.85, 2)
  phoneFill.visible = false
  scene.add(phoneFill, phoneFill.target)

  // There used to be a real point light following the cursor here, so that
  // speculars would react as well as the shader probe. It was set to layer 1
  // to keep it off the floor, where its falloff was laying a pale blue disc on
  // the ground. That did stop the disc, but not the way the comment claimed:
  // three tests a light's layers against the *camera*, not against each object,
  // so a light on a layer the camera does not have is dropped from the light
  // list entirely. It was contributing nothing, anywhere, and had not been for
  // some time - the look that was signed off is the look without it. Removed
  // rather than revived: the cursor effect is the shader probe below, and this
  // keeps a light out of every material's inner loop.

  // --- floor ---------------------------------------------------------------
  // Rubber matting, not polished metal. The old floor was metalness 0.62, which
  // gave a clean mirror smear of the ceiling strips - a showroom look, and the
  // single biggest CG tell in the frame. A rough dielectric still returns that
  // reflection at grazing angles through Fresnel alone, but the fleck and seam
  // maps chop it into something with a scale, so the floor reads as a surface
  // the machine is standing on rather than a plane it is floating over.
  const floorMaps = createFloorMaps(renderer.capabilities.getMaxAnisotropy())
  // One recipe, two meshes: the 90 m plane and the slabs that build its middle
  // during 0A. They must be indistinguishable at rest, so nothing here may
  // diverge between them - only the shader patches below do.
  const floorMaterial = () => new THREE.MeshStandardMaterial({
    color: 0x0e0f12,
    map: floorMaps.map,
    roughnessMap: floorMaps.roughnessMap,
    normalMap: floorMaps.normalMap,
    normalScale: new THREE.Vector2(0.09, 0.09),
    roughness: 0.86,
    metalness: 0.0,
    envMapIntensity: 0.62,
  })
  const floorPbrMaterial = floorMaterial()
  const floorLiteMaterial = isCoarse
    ? new THREE.MeshLambertMaterial({ color: 0x0e0f12, map: floorMaps.map })
    : null
  const floor = new THREE.Mesh<THREE.PlaneGeometry, THREE.Material>(
    new THREE.PlaneGeometry(90, 90),
    floorPbrMaterial,
  )
  // The tiled maps supply everything at fleck scale; this supplies everything
  // above it - traffic patches, patchy soiling - in world space, where no
  // amount of repeat can produce a grid.
  applySurfaceShader(floorPbrMaterial, createSurfaceUniforms('floor'))
  // 0A writes the mat behind the hologram front. uBirthR clips the 90 m plane
  // to that radius until it reaches PBR_TAIL_R, past which the whole block
  // below drops out of the frame's cost on a uniform branch. uTileHalf
  // punches the slab field's square back out of it, so the plane and the
  // slabs are never both drawn over the same ground.
  //
  // The clip is not a circle with a hard edge. uBirthR is the mat's one front
  // — the slab field's radial spread, carried on past the field corner — and
  // uBirthBand is the depth of ground still coming up behind it. Inside that
  // band the plane is diced on the same 1 m grid as the slabs, and each cell
  // gets its own scattered arrival radius and its own fade length, so the far
  // mat comes up as squares breaking out ahead of and lagging behind their
  // neighbours, carrying the same write-in light. The same gesture as the
  // slabs, on ground too far out to put geometry on.
  const floorBirthR = { value: 0 }
  const floorBirthBand = { value: 0 }
  const floorTileHalf = { value: 0 }
  {
    const floorMat = floorPbrMaterial
    const prior = floorMat.onBeforeCompile
    floorMat.onBeforeCompile = (shader, renderer) => {
      prior.call(floorMat, shader, renderer)
      shader.uniforms.uBirthR = floorBirthR
      shader.uniforms.uBirthBand = floorBirthBand
      shader.uniforms.uTileHalf = floorTileHalf
      // Same cool white the slabs are written with, and the same reason: out
      // past the lamps a cell's own lit value barely changes as it arrives,
      // so this is the only thing that makes the arrival legible at all.
      shader.uniforms.uBirthGlow = { value: new THREE.Color(...WIRE_RGB).multiplyScalar(0.055) }
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>
          uniform float uBirthR;
          uniform float uBirthBand;
          uniform float uTileHalf;
          uniform vec3  uBirthGlow;
          // Scatter on a cell's arrival radius, metres: how far ahead of its
          // turn a cell may break out, and how far behind it may lag. Same
          // asymmetry the slabs carry — a short early half, a longer late one
          // — and, like theirs, comparable to the span a cell takes to come
          // up, which is what makes the front a scatter rather than a ring.
          const float LG_BIRTH_EARLY = ${TILE_SIZE.toFixed(1)};
          const float LG_BIRTH_LATE = ${(TILE_SIZE * 2).toFixed(1)};
          const float LG_TILE_FIELD = ${TILE_FIELD_HALF.toFixed(1)};`,
        )
        .replace(
          '#include <clipping_planes_fragment>',
          `#include <clipping_planes_fragment>
          float lgBirth = 1.0;
          if (uBirthR < ${PBR_TAIL_R.toFixed(1)}) {
            // Cell centres land on the same half-integer grid as the slabs, so
            // the wash is cut along the seams already moulded into the mat.
            vec2 lgCell = floor(vLgWorldPos.xz) + 0.5;
            // lgHash, not a sin-based one: the plane is 90 m across, and
            // sin(dot(cell, big)) needs the mantissa of a highp float to stay
            // random out at the rim. This is the hash the rest of the surface
            // already runs on.
            float lgJr = lgHash(vec3(lgCell, 3.7));
            float lgJb = lgHash(vec3(lgCell, 8.1));
            float lgCellR = length(lgCell)
              + lgJr * (LG_BIRTH_EARLY + LG_BIRTH_LATE) - LG_BIRTH_EARLY;
            float lgBand = max(uBirthBand * (0.7 + 0.6 * lgJb), 0.001);
            lgBirth = clamp((uBirthR - lgCellR) / lgBand, 0.0, 1.0);
            // Ground the slab field owns is never washed in by the plane: it
            // is punched out while the slabs are up and inherited already
            // written the moment they go, which is what keeps that handoff
            // invisible. Without this the plane would fade in underneath them.
            if (max(abs(vLgWorldPos.x), abs(vLgWorldPos.z)) < LG_TILE_FIELD) lgBirth = 1.0;
            if (lgBirth <= 0.0) discard;
          }
          if (uTileHalf > 0.0) {
            if (max(abs(vLgWorldPos.x), abs(vLgWorldPos.z)) < uTileHalf) discard;
          }`,
        )
        .replace(
          '#include <opaque_fragment>',
          `#include <opaque_fragment>
          if (uBirthR < ${PBR_TAIL_R.toFixed(1)}) {
            // Linear, before tonemapping — the same place the slabs' emissive
            // lands. The cell comes up as light first and resolves into lit
            // rubber behind it; both ends are zero, so nothing pops on and
            // nothing is left glowing once the front has gone by.
            gl_FragColor.rgb *= lgBirth * lgBirth * (3.0 - 2.0 * lgBirth);
            gl_FragColor.rgb += uBirthGlow * 4.0 * lgBirth * (1.0 - lgBirth);
          }`,
        )
    }
    floorMat.customProgramCacheKey = () => 'liftag-surface-birth'
    floorMat.needsUpdate = true
  }
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = renderer.shadowMap.enabled
  scene.add(floor)

  // --- 0A slab field ---------------------------------------------------------
  // The mat does not get wiped in. Inside TILE_FIELD_HALF it arrives as 1 m
  // slabs rising out of the void and seating, rooted at the machine's feet and
  // spreading outward with the front. One InstancedMesh, no shadows: nothing
  // casts onto the floor until 0B, by which point this is gone.
  const floorTiles = FLOOR_TILES
  const tileMat = floorMaterial()
  applySurfaceShader(tileMat, createSurfaceUniforms('floor'))
  // A slab in flight carries the light it is being written with - the same
  // cool white as the hologram's reconstructed mesh - and sheds it as it
  // seats. Emissive rather than a lamp, because the lamps are over the
  // machine and the back of the field has none: this is the only thing that
  // makes a slab out there readable while it moves.
  const tileGlow = { value: new THREE.Color(...WIRE_RGB).multiplyScalar(0.040) }
  {
    const prior = tileMat.onBeforeCompile
    tileMat.onBeforeCompile = (shader, renderer) => {
      prior.call(tileMat, shader, renderer)
      shader.uniforms.uTileGlow = tileGlow
      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          `#include <common>
        attribute float aGlow;
        varying float vLgGlow;
        varying float vLgSide;`,
        )
        // applySurfaceShader's world position predates instancing; per-instance
        // transforms live in instanceMatrix and would otherwise be dropped,
        // parking every slab's procedural weathering on the same patch.
        .replace(
          'vLgWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;',
          'vLgWorldPos = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;',
        )
        .replace(
          'vLgWorldNormal = normalize(mat3(modelMatrix) * objectNormal);',
          'vLgWorldNormal = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * objectNormal);',
        )
        // The mat maps are laid out across the 90 m plane's UV, 45 repeats over
        // 90 m. Sample them in that same world frame rather than across each
        // slab's own 0..1 box UV, so a seated slab is texel-identical to the
        // plane that replaces it and the handoff at the end of 0A is invisible.
        .replace(
          '#include <uv_vertex>',
          `#include <uv_vertex>
        {
          vec3 lgTileW = (modelMatrix * instanceMatrix * vec4(position, 1.0)).xyz;
          vec2 lgTileUv = vec2(lgTileW.x * 0.5 + 22.5, 22.5 - lgTileW.z * 0.5);
          vMapUv = lgTileUv;
          vNormalMapUv = lgTileUv;
          vRoughnessMapUv = lgTileUv;
          vLgGlow = aGlow;
          // The rim is what says "raised" at a grazing angle, so it carries
          // more of the write-in than the face does.
          vLgSide = 1.0 - abs(normal.y);
        }`,
        )
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          '#include <common>\nuniform vec3 uTileGlow;\nvarying float vLgGlow;\nvarying float vLgSide;',
        )
        .replace(
          '#include <emissivemap_fragment>',
          `#include <emissivemap_fragment>
          totalEmissiveRadiance += uTileGlow * vLgGlow * (1.0 + 1.6 * vLgSide);`,
        )
    }
    tileMat.customProgramCacheKey = () => 'liftag-surface-tile'
    tileMat.needsUpdate = true
  }
  const tileGeo = new THREE.BoxGeometry(TILE_SIZE, TILE_THICK, TILE_SIZE)
  const tileGlowAttr = new THREE.InstancedBufferAttribute(
    new Float32Array(floorTiles.length),
    1,
  )
  tileGlowAttr.setUsage(THREE.DynamicDrawUsage)
  tileGeo.setAttribute('aGlow', tileGlowAttr)
  const tileMesh = new THREE.InstancedMesh(tileGeo, tileMat, floorTiles.length)
  tileMesh.name = 'LiftagFloorSlabs'
  // Instances span the whole field; the box geometry's bounds say otherwise.
  tileMesh.frustumCulled = false
  tileMesh.castShadow = false
  tileMesh.receiveShadow = false
  tileMesh.visible = false
  tileMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  scene.add(tileMesh)

  const tilePose = emptyTilePose()
  const tileMatrix = new THREE.Matrix4()
  const tileQuat = new THREE.Quaternion()
  const tileEuler = new THREE.Euler()
  const tilePos = new THREE.Vector3()
  const tileScale = new THREE.Vector3()
  const TILE_UNCALLED = new THREE.Matrix4().makeScale(0, 0, 0)

  function applyFloorTiles(sweepT: number, live: boolean) {
    const on = live && sweepT >= TILE_T0
    tileMesh.visible = on
    if (!on) return
    for (let i = 0; i < floorTiles.length; i++) {
      const tile = floorTiles[i]!
      const pose = floorTilePoseAt(tile, sweepT, tilePose)
      tileGlowAttr.array[i] = pose.glow
      if (!pose.live) {
        tileMesh.setMatrixAt(i, TILE_UNCALLED)
        continue
      }
      tileEuler.set(pose.tiltX, pose.yaw, pose.tiltZ)
      tileQuat.setFromEuler(tileEuler)
      // `lift` is the top face; the box is centred, and seated means flush.
      tilePos.set(tile.x, pose.lift - TILE_THICK / 2, tile.z)
      tileScale.set(pose.grow, 1, pose.grow)
      tileMesh.setMatrixAt(i, tileMatrix.compose(tilePos, tileQuat, tileScale))
    }
    tileMesh.instanceMatrix.needsUpdate = true
    tileGlowAttr.needsUpdate = true
  }

  const shadowTex = createContactShadowTexture()
  const contactMat = new THREE.MeshBasicMaterial({
    map: shadowTex, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.NormalBlending,
  })
  const contact = new THREE.Mesh(
    new THREE.PlaneGeometry(2.5, 2.9),
    contactMat,
  )
  contact.rotation.x = -Math.PI / 2
  contact.position.y = 0.004
  contact.visible = false
  scene.add(contact)

  // Machine, QR plate and struts share one transform so the entry drop is a
  // single Y write. The hologram cage follows via setAltitude; its floor
  // wave stays on the mat.
  const machineRig = new THREE.Group()
  machineRig.name = 'LiftagMachineRig'
  machineRig.visible = false
  scene.add(machineRig)

  // --- QR sticker ----------------------------------------------------------
  // Anisotropy matters more here than anywhere else in the scene: the tag is
  // nosed down and viewed from below through most of the approach, so its
  // modules are compressed along one axis, and that is precisely the case
  // trilinear filtering handles by blurring.
  const placardUniforms = createPlacardUniforms()
  const stickerTex = new THREE.TextureLoader().load('/assets/gym3d/qr-sticker.webp')
  stickerTex.colorSpace = THREE.SRGBColorSpace
  stickerTex.anisotropy = renderer.capabilities.getMaxAnisotropy()
  stickerTex.minFilter = THREE.LinearMipmapLinearFilter
  stickerTex.magFilter = THREE.LinearFilter

  // Three layers on one geometry, and that sharing is the point.
  //
  // The card is bent during the physical press by a vertex-shader roll around
  // a moving fold line (see peel.ts). Print, inlay and film therefore have to
  // agree on that line to the vertex, or the laminate comes apart on the
  // curl. Handing all three the same subdivided plane and the same uniform
  // objects makes that agreement structural instead of something three
  // separate meshes have to be kept in step by hand.
  //
  // The pitch is set by the *fold line*, not by the roll. The line runs on the
  // card's diagonal, so each row of vertices crosses it one step later than
  // the last, and where it crosses is where the surface leaves the plane -
  // which makes the boundary a staircase at exactly the vertex pitch. At 48 it
  // was a visible sawtooth along the brightest edge in the shot. The roll
  // itself was never the problem; it stopped faceting long before this.
  const cardSeg = isCoarse ? 64 : 128
  const cardGeo = new THREE.PlaneGeometry(PLACARD_W, PLACARD_H, cardSeg, cardSeg)
  // Only the thickness and the face differ per layer - the fold line, radius
  // and wrap limit are shared value objects, so writing the card's peel writes
  // all of its layers at once.
  //
  // The liner is the exception, and deliberately: it gets its own peel because
  // it comes off while the card stays flat, and `side: -1` because it is on
  // the back. 1.2 mm out along the back's own normal puts it clear behind the
  // inlay at 0.7 mm, so the stack reads print / inlay / liner from the front
  // and the liner is the first thing the lens meets once the card is turned.
  const cardPeel = createPeelUniforms(0)
  const backPeel: PeelUniforms = { ...cardPeel, uPeelThickness: { value: -0.0007 } }
  const foilPeel = createPeelUniforms(0.0012, -1)

  const placardMat = createPlacardMaterial(stickerTex, placardUniforms, cardPeel)
  const placard = new THREE.Mesh(cardGeo, placardMat)
  placard.renderOrder = 1

  // The NFC inlay, 0.7 mm behind the print. It shares the card surface so its
  // layered edge reads during 0C's grazing quarter-turn.
  const nfcMaps = createNfcMaps(renderer.capabilities.getMaxAnisotropy())
  const nfc = new THREE.Mesh(cardGeo, createNfcMaterial(nfcMaps, backPeel))
  nfc.renderOrder = 0

  // The release liner, drawn last because it is transparent. It lies over the
  // inlay on the back, which is where a sticker's protective film is and where
  // 0C's whole middle beat takes place. 7.2% of the width, which is the
  // artwork's own die-cut - the same number the inlay canvas rounds by.
  const foilUniforms = createFoilUniforms(PLACARD_W / 2, PLACARD_H / 2, PLACARD_W * 0.072)
  const foil = new THREE.Mesh(cardGeo, createFoilMaterial(foilUniforms, foilPeel))
  foil.renderOrder = 2

  const stickerRig = new THREE.Group()
  stickerRig.name = 'LiftagSticker'
  stickerRig.add(nfc)
  stickerRig.add(placard)
  stickerRig.add(foil)
  stickerRig.visible = false
  scene.add(stickerRig)

  // The 0C key. One spot, held close, with a distance short enough that it
  // cannot reach the machine seven metres behind the card - so the close-up
  // gets a product light without the establishing shot quietly gaining one.
  //
  // It also has to be the *only* extra spot in the scene, and it is on only
  // while `phoneFill` is off: NUM_SPOT_LIGHTS is baked into every program in
  // the frame, so a second simultaneous light would be a third variant to
  // warm at load. The two are mutually exclusive by construction - this one
  // lives in Act 0, phoneFill ramps in on scroll, and Act 0 is over before
  // scroll owns the camera.
  const cardKey = new THREE.SpotLight(0xf2f6ff, 0, 1.45, 0.72, 0.92, 2)
  cardKey.visible = false
  scene.add(cardKey, cardKey.target)

  // The blank the sticker is applied to. It is a hair larger than the artwork
  // and sits a millimetre behind it, which is what shows through the sticker's
  // rounded corners - without something behind them the corners are cut out of
  // the frame and the tag reads as a floating decal rather than vinyl on a
  // surface.
  const mountMat = new THREE.MeshStandardMaterial({ color: 0x0d0e0d, roughness: 0.5, metalness: 0.4 })
  const placardBack = new THREE.Mesh(
    new THREE.BoxGeometry(PLACARD_W + 0.012, PLACARD_H + 0.012, 0.007),
    mountMat,
  )
  placardBack.position.copy(PLACARD_POS)
  placardBack.rotation.x = PLACARD_TILT
  placardBack.translateZ(-0.0045)
  placardBack.castShadow = renderer.shadowMap.enabled
  machineRig.add(placardBack)

  // Two stand-offs up to the crossbeam. Without them the plate floats in the
  // gap above the footplate and reads as an overlay rather than hardware.
  const mountKit: THREE.Object3D[] = [placardBack]
  const strutH = PLACARD_BEAM_Y - (PLACARD_POS.y + PLACARD_H / 2) + 0.02
  for (const sx of [-1, 1]) {
    const strut = new THREE.Mesh(new THREE.BoxGeometry(0.012, strutH, 0.010), mountMat)
    strut.position.set(
      PLACARD_POS.x + sx * PLACARD_W * 0.36,
      PLACARD_POS.y + PLACARD_H / 2 + strutH / 2 - 0.01,
      PLACARD_POS.z - 0.012,
    )
    machineRig.add(strut)
    mountKit.push(strut)
  }

  // --- composer ------------------------------------------------------------
  // Multisampled, which the default composer target is not. The machine is
  // almost entirely thin tube against black, so every silhouette in the frame
  // is a high-contrast edge - and a stair-stepped edge is the loudest CG tell
  // there is, louder than any material error. Dropped on coarse pointers,
  // where the resolve bandwidth is not worth it.
  const composerTarget = new THREE.WebGLRenderTarget(1, 1, {
    type: THREE.HalfFloatType,
    samples: device.msaa ? 4 : 0,
  })
  const composer = new EffectComposer(renderer, composerTarget)
  // EffectComposer clones the target it is given, so both ends of its
  // ping-pong end up multisampled. Only one of them ever receives geometry -
  // it starts as `readBuffer`, which is what RenderPass draws into. The other
  // starts as `writeBuffer` and only ever takes a full-screen quad's output
  // from the bloom pass, and a full-screen quad has no edges to antialias.
  // Multisampling it meant writing four samples per pixel of a half-float
  // target and resolving them, every frame, for no coverage information at all.
  const relayTarget = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType })
  relayTarget.texture.name = 'LiftagComposerRelay'
  // Mip chain on the relay only. The phone overlay samples this buffer with an
  // explicit lod to fake a camera focused on the plate; the MSAA geometry
  // target never needs one. generateMipmaps has to be on *before* the first
  // allocate or texStorage2D would bake a single level and lod would be a no-op.
  relayTarget.texture.minFilter = THREE.LinearMipmapLinearFilter
  relayTarget.texture.generateMipmaps = true
  composer.renderTarget1.dispose()
  composer.renderTarget1 = relayTarget
  composer.writeBuffer = relayTarget
  composer.addPass(new RenderPass(scene, camera))
  // Threshold sits at 1.0 so only genuinely hot pixels - the scan line and the
  // resolved code - bloom. Lower thresholds let ordinary speculars on the frame
  // tubes blow into white streaks across the machine.
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.34, 0.70, 1.0)
  if (device.bloom) composer.addPass(bloom)
  // No OutputPass: the composite ends with AgX and the sRGB encode itself, so
  // it is the last pass and can write either to the screen or to the overlay's
  // screen texture. toneMapped must stay off: three only injects TONE_MAPPING
  // when the current target is the drawing buffer, and the overlay samples an
  // RT — see composite.ts.
  const composite = new ShaderPass(CompositeShader as never)
  composite.material.toneMapped = false
  Object.assign(composite.material.extensions, { shaderTextureLOD: true })
  // Half the disc on a phone. A GLSL loop bound has to be a constant, so this
  // is the last moment it can be set - before the pass is ever compiled.
  ;(composite.material.defines as Record<string, unknown>).LG_BOKEH_TAPS = isCoarse ? 8 : 16
  composer.addPass(composite)

  /**
   * EffectComposer leaves its buffers swapped after a pass with needsSwap.
   * This scene gives those buffers different jobs: renderTarget2 is the MSAA
   * geometry target and renderTarget1 is the mipmapped relay sampled by the
   * phone. Restore that order before every frame or the phone alternates
   * between a valid blurred mip chain and a non-mipmapped texture.
   */
  function renderGymFrame() {
    composer.readBuffer = composer.renderTarget2
    composer.writeBuffer = composer.renderTarget1
    composer.render()
  }

  const phoneOverlay: PhoneOverlay = createPhoneOverlay({ shadows: renderer.shadowMap.enabled })
  const appScreen = createScanAppScreen({ reducedMotion })
  const reticleOverlay = createReticleOverlay()

  // --- state ---------------------------------------------------------------
  let targetProgress = 0
  let progress = 0
  let width = 1
  let heightPx = 1
  let running = false
  let raf = 0
  let disposed = false
  let lastT = performance.now()
  let elapsed = 0
  let heroRoot: THREE.Object3D | null = null
  let heroMats: THREE.MeshStandardMaterial[] = []
  let holo: HologramShell | null = null
  // Entry drop. Clock is -1 until load plants the rig; after that it is
  // seconds since release. Aborted (reduced motion, or the user already
  // scrolled into the story) writes the rest pose once and stops.
  let dropT = -1
  let dropLive = false
  let assembleT = -1
  let assembleLive = false
  let act0T = 0
  let act0Armed = false
  let act0Frozen = false
  let lastAct0: Act0State | null = null
  let stickerPlanted = false
  let stickerHunting = false
  let partsRig: PartsRig | null = null
  let lastAssemble: AssembleState | null = null
  let lastAct1: Act1State = act1At(0, isCoarse)
  let heroSlot: PhoneBox | null = null
  let runtimeDeviceClass = device.deviceClass
  let classBLite = runtimeDeviceClass === 'B'
  let performanceArmed = false
  let performanceSamples: number[] = []
  let performanceGateDone = !isCoarse
  let loggedExplode = false
  let loggedPlanted = false
  let holoT = 0
  let holoLive = false
  /** Damped cage envelope, so it fades out for 0C/0D and back in after. */
  let holoMix = 0

  const pointer = { x: 0, y: 0, active: false }
  const tilt = { x: 0, y: 0, active: false }
  const probeTarget = new THREE.Vector3(0, 0.9, 1.4)
  const probeCurrent = new THREE.Vector3(0, 0.9, 1.4)
  const probeNdcTarget = new THREE.Vector2()
  const probeNdc = new THREE.Vector2()
  const probeViewport = new THREE.Vector2(1, 1)
  const camPos = { x: 3.98, y: 2.22, z: 4.96 }
  const camTgt = { x: 0.05, y: 0.88, z: -0.04 }
  const lookAt = new THREE.Vector3()

  const projected = new THREE.Vector3()
  const hw = PLACARD_W / 2, hh = PLACARD_H / 2
  const corners = [
    new THREE.Vector3(-hw, -hh, 0),
    new THREE.Vector3(hw, -hh, 0),
    new THREE.Vector3(hw, hh, 0),
    new THREE.Vector3(-hw, hh, 0),
  ]
  const machineSamples: THREE.Vector3[] = Array.from({ length: 27 }, () => new THREE.Vector3())
  let machineLive = false
  const reticleTracker = createReticleTracker()
  let lastQrRect: ScreenRect | null = null
  function dressMaterial(std: THREE.MeshStandardMaterial) {
    const spec = HERO_MATERIALS[std.name] ?? { kind: 'frame' as SurfaceKind, rough: null, env: 0.55, dim: 1 }
    std.color.multiplyScalar(spec.dim)
    std.envMapIntensity = spec.env
    if (spec.rough !== null) std.roughness = spec.rough
    applyScanShader(std, uniforms, createSurfaceUniforms(spec.kind))
  }

  function applyContact(y: number) {
    const planted = dropPlanted(y)
    contactMat.opacity = lerp(0.10, 0.90, planted * planted)
    const s = lerp(0.36, 1, planted)
    contact.scale.set(s, s, 1)
  }

  function applyDrop(y: number) {
    machineRig.position.y = y
    holo?.setAltitude(y)
    applyContact(y)
  }

  function setMountVisible(on: boolean) {
    for (const o of mountKit) o.visible = on
  }

  function plantSticker() {
    if (stickerPlanted && stickerRig.parent === machineRig) return
    machineRig.add(stickerRig)
    stickerRig.position.copy(PLACARD_POS)
    stickerRig.rotation.set(PLACARD_TILT, 0, 0)
    stickerPlanted = true
  }

  function applyStick(pose: StickPose) {
    stickerRig.visible = pose.visible
    nfc.visible = pose.nfcVisible
    foil.visible = pose.foilVisible
    stickerHunting = pose.hunting
    if (!pose.visible) {
      stickerPlanted = false
      stickerHunting = false
      composite.uniforms.uDof!.value = 0
      placardUniforms.uShow.value = 0
      placardUniforms.uSqueegee.value = 0
      writePeel(cardPeel, pose.bend)
      writePeel(foilPeel, pose.foil)
      foilUniforms.uFoilOpacity.value = 0
      cardKey.visible = false
      setMountVisible(false)
      return
    }
    if (pose.planted) {
      plantSticker()
    }
    else {
      if (stickerRig.parent !== scene) scene.add(stickerRig)
      stickerRig.position.set(pose.x, pose.y, pose.z)
      stickerRig.rotation.set(pose.rotX, pose.rotY, pose.rotZ)
      stickerPlanted = false
    }
    // FROM THE SEAT is optically clean by contract, even if a future pose
    // accidentally asks for the desktop rack.
    // The phone runs the same rack at eight taps rather than none: a background
    // that stays sharp behind a card held 50 cm from the lens was the loudest
    // CG tell in the shot, and it is loudest on the small screen.
    composite.uniforms.uDof!.value = pose.dof
    placardUniforms.uShow.value = pose.showLight
    placardUniforms.uSqueegee.value = pose.squeegee
    // One write per layer group: the print and the inlay share `cardPeel`, so
    // the inlay follows the bend without being told about it.
    writePeel(cardPeel, pose.bend)
    writePeel(foilPeel, pose.foil)
    foilUniforms.uFoilOpacity.value = pose.foilOpacity
    // The rolled-up film leaves in the card's own frame, so it flies off along
    // the diagonal it was pulled down rather than in some world direction that
    // happens to look right from this one camera.
    foil.position.set(pose.foilDrift.x, pose.foilDrift.y, pose.foilDrift.z)
    foil.rotation.z = pose.foilDrift.spin
    // Off before it can reach anything but the card. Toggling visibility
    // rather than intensity keeps it out of the light list entirely.
    const keyOn = pose.showLight > 0.002 && pose.keyPos !== null
    if (cardKey.visible !== keyOn) cardKey.visible = keyOn
    if (keyOn && pose.keyPos) {
      const kp = pose.keyPos
      cardKey.position.set(kp.x, kp.y, kp.z)
      cardKey.intensity = SHOWCASE_KEY_INTENSITY * pose.showLight
      cardKey.target.position.set(
        pose.planted ? PLACARD_POS.x : pose.x,
        pose.planted ? PLACARD_POS.y : pose.y,
        pose.planted ? PLACARD_POS.z : pose.z,
      )
      cardKey.target.updateMatrixWorld()
    }
    setMountVisible(pose.mountVisible)
  }

  function phoneCut(): boolean {
    return isCoarse
  }

  function snapAssemble(state: AssembleState) {
    partsRig?.apply(state)
    lastAssemble = state
    applyContact(0)
    holo?.setAltitude(0)
    setMountVisible(true)
    assembleLive = false
    holoLive = true
  }

  function foldPhoneTarget(): PhoneBox {
    // Where the fold parks the glass: centred, large, and the same on both
    // cuts. It is a held frame for a beat, not a surface anything is typed on.
    const h = Math.min(heightPx * 0.72, 680)
    const w = h * (PHONE_W / PHONE_H)
    const cx = width * 0.5
    const cy = heightPx * 0.5
    return { x: cx - w / 2, y: cy - h / 2, w, h }
  }

  /**
   * The phone's box for this frame: the parked fold until the morph tail
   * starts, then a travel onto the landing hero's own front-phone slot.
   *
   * The slot is measured from the real hero DOM once it has laid out. Until
   * then `fallbackHeroSlot` stands in with a desktop-shaped guess, so the
   * travel can start on the frame the tail does rather than waiting a frame
   * for a measurement and snapping to catch up.
   */
  function phoneTarget(p: number): PhoneBox {
    const park = foldPhoneTarget()
    const morph = heroMorphAt(p)
    if (morph <= 0) return park
    const slot = heroSlot ?? fallbackHeroSlot(width, heightPx)
    return travelPhoneBox(park, slot, morph, reducedMotion)
  }

  function resize() {
    const rect = canvas.getBoundingClientRect()
    width = Math.max(1, rect.width)
    heightPx = Math.max(1, rect.height)
    camera.aspect = width / heightPx
    camera.updateProjectionMatrix()
    renderer.setSize(width, heightPx, false)
    composer.setSize(width, heightPx)
    bloom.setSize(width, heightPx)
    composite.uniforms.uAspect!.value = width / heightPx
  }

  function applyClassBQuality() {
    if (!isCoarse) return
    runtimeDeviceClass = 'B'
    classBLite = true
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1))
    if (lastAct0?.done && floorLiteMaterial) floor.material = floorLiteMaterial
    resize()
  }

  function samplePerformance(rawFrameMs: number) {
    if (!performanceArmed || performanceGateDone || runtimeDeviceClass === 'C') return
    performanceSamples.push(rawFrameMs)
    if (performanceSamples.length < 30) return

    const sorted = [...performanceSamples].sort((a, b) => a - b)
    const p99 = sorted[Math.ceil(sorted.length * 0.99) - 1] ?? 0
    performanceSamples = []
    if (p99 <= 33) {
      performanceGateDone = true
      return
    }
    if (runtimeDeviceClass === 'A') {
      applyClassBQuality()
      onDeviceClassChange?.('B')
      return
    }

    runtimeDeviceClass = 'C'
    performanceGateDone = true
    onDeviceClassChange?.('C')
  }

  /**
   * Act 1 is a function of scroll and nothing else.
   *
   * There used to be a confirm gate here: desktop could accelerate the lock
   * with a key, and the phone cut refused to resolve the plate until a thumb
   * tapped it. Both existed to make the scan an action rather than a picture,
   * and both cost more than they bought - the phone one could park the film
   * indefinitely on a status label, and neither is something a visitor is told
   * about without a line of copy on screen, which is the thing this cut is
   * built to do without.
   */
  function sampleAct1(sp: number, phone: boolean): {
    state: Act1State
    complete: boolean
  } {
    const state = act1At(sp, phone)
    return { state, complete: sp >= 0.999 && state.foldU >= 0.999 }
  }

  function frame() {
    if (disposed) return
    raf = requestAnimationFrame(frame)
    const now = performance.now()
    const rawFrameMs = now - lastT
    const dt = Math.min(rawFrameMs / 1000, 0.05)
    lastT = now
    samplePerformance(rawFrameMs)
    elapsed += dt

    // Keep a short ease so wheel input does not shake the camera, but stay
    // close enough to the scroll position that the QR lock feels attached.
    progress = reducedMotion
      ? targetProgress
      : damp(progress, targetProgress, GYM_SCROLL_DAMP_RATE, dt)
    const p = progress
    const sp = sceneProgress(p)
    const morph = heroMorphAt(p)

    uniforms.uTime.value = elapsed
    foilUniforms.uFoilTime.value = elapsed
    if (import.meta.dev) renderer.info.reset()

    // --- Act 0 clock -------------------------------------------------------
    // Time-based. Scroll does not scrub it. Past the establishing beat, or
    // reduced motion, snaps to the 0D hold so a dolly never shares the frame
    // with a falling machine.
    const isPhone = phoneCut()
    const skipBirth = reducedMotion || sp > 0.16
    const windows = act0Windows(isPhone)
    if (act0Armed) {
      if (skipBirth && act0T < windows.stickEnd) act0T = windows.stickEnd
      else if (!skipBirth && !act0Frozen) act0T += dt
    }
    const a0 = act0At(act0T, isPhone)
    lastAct0 = a0
    const act1Frame = sampleAct1(sp, isPhone)
    const act1 = act1Frame.state
    lastAct1 = act1

    // Its own clock, not the shot's: 0B starts on top of the tail of 0A, so
    // the mat keeps writing behind a machine that is already falling.
    const birth = floorConstructAt(
      a0.floorT,
      {
        phone: isPhone,
        stemR: holo?.stemR,
        maxR: holo?.maxR,
        kill: a0.shot === 'fly' || a0.shot === 'stick' || a0.shot === 'hold',
      },
    )
    floorBirthR.value = birth.pbrR
    floorBirthBand.value = birth.pbrBand
    floorTileHalf.value = birth.tiles ? TILE_FIELD_HALF : 0
    floor.visible = birth.pbrR > 0.04
    if (floorLiteMaterial) {
      const wantedFloorMaterial = classBLite && a0.done ? floorLiteMaterial : floorPbrMaterial
      if (floor.material !== wantedFloorMaterial) floor.material = wantedFloorMaterial
    }
    applyFloorTiles(birth.sweepT, birth.tiles)
    contact.visible = a0.shot !== 'floor'

    if (partsRig) {
      if (a0.shot === 'floor') {
        partsRig.root.visible = false
        assembleLive = false
        applyContact(0)
      }
      else {
        partsRig.root.visible = true
        const state = assembleAt(a0.assembleT < 0 ? 0 : a0.assembleT, { phone: isPhone })
        partsRig.apply(state)
        lastAssemble = state
        assembleT = a0.assembleT
        applyContact(state.frameY)
        assembleLive = a0.shot === 'assemble' && !state.done
        if (state.swap && holo && !holoLive) {
          holoT = 0
          holoLive = true
        }
      }
    }
    else if (a0.shot === 'floor') {
      machineRig.visible = false
      dropLive = false
    }
    else {
      machineRig.visible = true
      if (skipBirth) {
        dropLive = false
        holoLive = true
        applyDrop(PLANTED_DROP.y)
      }
      else if (a0.shot === 'assemble') {
        dropT = Math.max(0, a0.assembleT)
        const pose = dropAt(dropT)
        applyDrop(pose.y)
        dropLive = !pose.done
        if (holo) {
          holoT = firstSweepTime(dropT, holo.peelTime)
          holoLive = true
        }
      }
      else {
        dropLive = false
        holoLive = true
        applyDrop(PLANTED_DROP.y)
      }
    }

    if (a0.shot === 'fly') applyStick(stickAt(a0.flyT, 'fly', isPhone))
    else if (a0.shot === 'stick') applyStick(stickAt(a0.stickT, 'stick', isPhone))
    else if (a0.shot === 'hold') applyStick(stickAt(0, 'hold', isPhone))
    else applyStick(stickHidden())

    if (holoLive || reducedMotion) holoT += dt

    const act1Live = a0.done || skipBirth

    // --- placard ------------------------------------------------------------
    // 0C, 0D and the approach keep every analysis channel hard-zero. Only the
    // local lock clock may resolve the printed modules and lock the plate.
    if (!act1Live || act1.shot === 'approach') {
      placardUniforms.uReveal.value = 0
      placardUniforms.uResolve.value = 0
      placardUniforms.uLock.value = 0
    }
    else {
      placardUniforms.uReveal.value = scalarAt(PLACARD_REVEAL, act1.lockU)
      placardUniforms.uResolve.value = scalarAt(PLACARD_RESOLVE, act1.lockU)
      placardUniforms.uLock.value = scalarAt(PLACARD_LOCK, act1.lockU)
    }

    // --- camera -------------------------------------------------------------
    // Act 0 is one locked-off shot on the establishing station: the machine
    // assembles into it, the sticker flies into this POV, and the press plays
    // where it lands. The lens does not chase any of it. Scroll owns the dolly
    // from the hand-off, and it starts from this same station.
    const camSp = act1Live ? sp : 0
    const camU = act1Live ? act1.dollyU : 0
    vec3HermiteAt(APPROACH_PATH, camU, camPos)
    vec3HermiteAt(APPROACH_TARGET_PATH, camU, camTgt)
    const birthCam = !a0.done && !skipBirth
    if (birthCam) {
      const a0Cam = act0CamAt(a0)
      camera.position.set(a0Cam.x, a0Cam.y, a0Cam.z)
      lookAt.set(a0Cam.tx, a0Cam.ty, a0Cam.tz)
      camera.lookAt(lookAt)
    }
    else {
      // A small pointer-led parallax, deliberately tiny: the machine should feel
      // observed, not handled. Falls away as the camera closes on the placard.
      const parallax = (1 - ease(camU, 0.55, 0.75)) * (reducedMotion ? 0 : 1)
      const driftX = pointer.x * 0.16 * parallax
      const driftY = -pointer.y * 0.10 * parallax
      const breathe = reducedMotion ? 0 : Math.sin(elapsed * 0.32) * 0.012 * (1 - ease(camU, 0.6, 0.8))
      // A portrait viewport keeps the vertical field and loses horizontal, which
      // crops the machine's 1.9 m length out of the establishing shot. Back the
      // camera off rather than widening the lens, and taper that away by the time
      // it is meant to be sitting in the seat - extra distance there would break
      // the point of the shot. Much smaller than it was, because the establishing
      // station itself now sits a long way further back.
      const pull = isPhone ? 1 + 0.22 * (1 - ease(camU, 0.40, 0.72)) : 1
      camera.position.set(
        camTgt.x + (camPos.x - camTgt.x) * pull + driftX,
        camTgt.y + (camPos.y - camTgt.y) * pull + driftY + breathe,
        camTgt.z + (camPos.z - camTgt.z) * pull,
      )
      lookAt.set(camTgt.x, camTgt.y, camTgt.z)
      camera.lookAt(lookAt)
    }

    const keySize = scalarAt(KEY_SIZE, camU)
    const keyLevel = scalarAt(KEY_LEVEL, camU)
    key.intensity = KEY_INTENSITY0 * keyLevel
    key.distance = lerp(KEY_DISTANCE_END, KEY_DISTANCE0, keySize)
    key.angle = lerp(KEY_ANGLE_END, KEY_ANGLE0, keySize)
    key.penumbra = lerp(KEY_PENUMBRA_END, KEY_PENUMBRA0, keySize)
    rimL.intensity = RIM_L0 * keyLevel
    rimR.intensity = RIM_R0 * keyLevel
    for (const strip of strips) {
      strip.intensity = STRIP_NITS * lerp(0.18, 1, keyLevel)
      strip.width = lerp(STRIP_W_END, STRIP_W0, keySize)
      strip.height = lerp(STRIP_L_END, STRIP_L0, keySize)
    }
    for (const sub of stripSpots) {
      sub.intensity = STRIP_SPOT_I0 * lerp(0.18, 1, keyLevel)
      sub.distance = lerp(5.5, STRIP_SPOT_D0, keySize)
      sub.angle = lerp(0.48, STRIP_SPOT_A0, keySize)
    }
    // Held just below the eye line, as a phone is. Comes on with the
    // viewfinder zoom so the plate is already lit as the room key's cone
    // leaves it, then dies as the glass covers the gym — not with a ramp
    // that waited until after `foldU` had already killed it.
    const fillAmp = !act1Live ? 0 : phoneFillAmp(act1.dollyU, act1.foldU)
    phoneFill.intensity = fillAmp * PHONE_FILL_INTENSITY
    // Hidden rather than merely dark for the two thirds of the scroll where it
    // contributes nothing. A spot light at zero intensity still costs a full
    // evaluation on every fragment of the floor, which is most of the screen;
    // an invisible one is not gathered into the light list at all. That does
    // change NUM_SPOT_LIGHTS and so the program, which is why load() compiles
    // both variants up front - without that the switch would drop a frame at
    // p=0.5 and again at p=0.9.
    const fillOn = fillAmp > 0.001
    if (phoneFill.visible !== fillOn) phoneFill.visible = fillOn
    if (fillAmp > 0.001) {
      // World −Z used to be baked into the offset, which crept the light
      // toward the plate as the dolly squared on and changed the inverse
      // square every frame. Stay under the lens; the target is the plate.
      phoneFill.position.set(
        camera.position.x,
        camera.position.y - 0.14,
        camera.position.z,
      )
      phoneFill.target.position.set(PLACARD_POS.x, PLACARD_POS.y - 0.02, PLACARD_POS.z)
      phoneFill.target.updateMatrixWorld()
    }

    // --- cursor probe --------------------------------------------------------
    // The pointer is projected onto a vertical plane through the machine, so the
    // field tracks across the real surface instead of orbiting in screen space.
    // Live for the Act 0 hold as well as the approach. The cursor reveal is
    // the only thing on the first screen that answers the pointer, and a first
    // screen that does not answer the pointer is a picture of a website.
    const reach = !act1Live
      ? (machineLive && !dropLive && !assembleLive ? 1 : 0)
      : act1.shot === 'approach' ? 1 - ease(camU, 0.6, 0.8) : 0
    // With no pointer yet, x and y are both zero, which on this machine parks
    // the probe dead centre *inside* the frame and floods it: measured, the
    // idle probe alone was lifting every surface three to four times above its
    // lit value. At rest it sits in front of the machine instead, so the idle
    // state is a grazing lift on the near edges rather than a fill light.
    const probeZ = pointer.active ? 0.24 : 1.62
    probeTarget.set(pointer.x * 1.15, 0.86 + pointer.y * -0.68, probeZ)
    probeCurrent.lerp(probeTarget, reducedMotion ? 1 : 1 - Math.pow(0.001, dt))
    uniforms.uProbe.value.copy(probeCurrent)
    const probeAmp = (pointer.active ? 1 : 0.16) * reach * (reducedMotion ? 0.4 : 1)
    uniforms.uProbeAmp.value = damp(uniforms.uProbeAmp.value, probeAmp, 0.10, dt)
    uniforms.uProbeRadius.value = 0.92
    uniforms.uProbeLive.value = damp(uniforms.uProbeLive.value, pointer.active ? 1 : 0, 0.12, dt)

    // Cage probe is the pointer on screen, not the world point mapped onto
    // the machine. Lerp so it does not teleport; radius lives in the shader.
    probeNdcTarget.set(pointer.x, pointer.y)
    probeNdc.lerp(probeNdcTarget, reducedMotion ? 1 : 1 - Math.pow(0.001, dt))
    renderer.getDrawingBufferSize(probeViewport)

    // --- hologram exoskeleton -----------------------------------------------
    // 0A plays one idle pass (cage line + floor shockwave) on the birth
    // clock, then dies. After the fused swap the same `update` idles on
    // holoT. Probe stays off during the birth pass so a parked cursor
    // cannot hold the cage.
    if (holo && birth.draw && !skipBirth && !(classBLite && a0.shot !== 'floor')) {
      holo.update(birth.sweepT, birth.envelope, false)
      // Hand the envelope over at its live value, not at zero: the branch
      // below picks it up from here, and a discontinuity at the handover is
      // the sweep being cancelled mid-pass.
      holoMix = birth.envelope
    }
    else {
      // One damped envelope for the whole rest of the film, rather than a
      // branch per shot.
      //
      // The cage is an idle. It steps aside for 0C/0D, because the card owns
      // those frames, and it comes back for the approach - which is where the
      // sweeps and the cursor reveal used to live and where a hard `act1Live`
      // gate had been killing both outright. It retires for good once the
      // placard starts resolving: by then the analysis has found what it was
      // looking for and the story is on the code.
      //
      // Damped rather than cut on either edge. The sweep that ran under 0B is
      // mid-pass when 0C starts, and dropping its envelope to zero there reads
      // as the hologram being switched off partway through its run; coming
      // back the same way, it reads as a pass beginning rather than one being
      // switched on.
      const cardBeat = !skipBirth && (a0.shot === 'fly' || a0.shot === 'stick')
      const want = cardBeat || !holoLive ? 0 : scalarAt(HOLO, camSp)
      // ~0.8 s either way at 60fps, which is about the length of one pass.
      holoMix = reducedMotion ? want : damp(holoMix, want, 0.06, dt)
      holo?.update(
        reducedMotion ? elapsed : holoT,
        holoMix,
        reducedMotion,
        {
          ndc: probeNdc,
          viewport: probeViewport,
          amp: uniforms.uProbeAmp.value,
          live: uniforms.uProbeLive.value,
          time: uniforms.uTime.value,
        },
      )
    }

    // --- fold + composite ----------------------------------------------------
    // Both cuts fold. The folded glass is the object that travels into the
    // landing hero, so a cut that skipped the fold would have nothing to hand
    // over - it would have to change the page instead of cutting to it.
    const fold = foldSentence(act1.foldU)
    const target = phoneTarget(p)
    phoneOverlay.setHeroMix(morph)
    // The app screen is a QR-on-QR cut, and a cut needs something to cut from:
    // it arms the frame the glass finishes forming, so the last thing on the
    // screen is the room with the scanned plate pinned to it. Armed early it
    // replaced the room part-way through the curl, which is a dissolve wearing
    // a cut's clothes. `sync` blends on its own wall clock from here.
    const appScene = fold >= 1 ? 1 : 0
    const appMix = appScreen.ready ? appScreen.sync(appScene, dt) : 0
    phoneOverlay.setAppMix(appMix)
    phoneOverlay.bindAppTexture(
      appScreen.texture,
      appScreen.uvs.repeatX,
      appScreen.uvs.repeatY,
      appScreen.uvs.offsetX,
      appScreen.uvs.offsetY,
    )
    // The 2D rounded-rect crop is retired: the 3D phone is the window. Keep
    // the composite as a full-frame grade so the capture mapped onto the
    // screen is the room, not a rect drawn of the room.
    composite.uniforms.uRect!.value = [0.5, 0.5, 0.5, 0.5]
    composite.uniforms.uRadius!.value = 0
    composite.uniforms.uFold!.value = 0
    composite.uniforms.uVignette!.value = 0.95 - fold * 0.45
    composite.uniforms.uAberration!.value = 1 - fold * 0.6
    // Hold the gym grade. The handoff is a QR-to-QR cut into scan-flow, not a
    // fade of the room; darkening here made the plate dissolve before the morph.
    composite.uniforms.uSceneFade!.value = 1

    // Always grade into the composer RT, then present through the overlay
    // screen shader — either as a fullscreen blit or on the 3D phone. The
    // previous path switch (composite-to-canvas vs RT-to-phone) was a grade
    // snap: the room went a hair lighter the frame the bezel appeared.
    const shrink = phoneShrink(fold)
    const overlayOn = shrink > 0.02
    if (machineRig.matrixWorldNeedsUpdate || dropLive || assembleLive) machineRig.updateMatrixWorld(true)
    if (stickerRig.matrixWorldNeedsUpdate || !stickerPlanted) stickerRig.updateMatrixWorld(true)
    const qrLive = projectPoints(corners, placard.matrixWorld, true)
    if (composite.uniforms.uDof!.value > 0.001 && qrLive) {
      // Snug to the card, with a floor under the width.
      //
      // The projected width narrows at the grazing quarter-turn. Keep a small
      // floor under it so the complete card remains sharp during the blink.
      //
      // Compared in units of screen height, because that is the space the
      // shader measures its falloff in.
      const aspect = Math.max(width, 1) / Math.max(heightPx, 1)
      const halfY = (qrLive.h * 0.5) / Math.max(heightPx, 1)
      const halfX = Math.max((qrLive.w * 0.5) / Math.max(width, 1) * aspect, halfY * 0.30)
      // The liner rolls toward the lens, so it leaves this rect the moment
      // it actually peels. Out there the 0C bokeh is luminance-weighted, and
      // a bright fold becomes a fan of ghosts - the "many layers of shine".
      // Pad hard while the film is on; the gym behind the card is already a
      // void, so the extra sharp area does not bring the room back.
      const pad = foil.visible && foilPeel.uPeelFront.value < 0.09 ? 2.4 : 1.06
      composite.uniforms.uFocusRect!.value = [
        (qrLive.x + qrLive.w * 0.5) / Math.max(width, 1),
        1 - (qrLive.y + qrLive.h * 0.5) / Math.max(heightPx, 1),
        halfX * pad / aspect,
        halfY * pad,
      ]
    }

    // Resolve the lock before presentation. It is drawn into the gym texture,
    // so it stays attached to the projected QR as that texture folds into the
    // 3D phone instead of disappearing at the first pixel of shrink.
    // The brackets are composited into the gym texture, so they stay stuck to
    // the projected QR while that texture curls onto the glass. They are only
    // withdrawn once they have faded out on their own clock.
    const reticleP = reticleProgress(act1, act1Live)
    const folded = reticleP >= RETICLE_OUT_END
    lastQrRect = folded ? null : qrLive
    const machineRect = machineLive ? projectPoints(machineSamples, null, false) : null
    // The brackets are a lock-on, so they need a tag. The compile prewarm
    // plants the sticker to warm its programs, then hides it - that used to
    // leave `stickerPlanted` true, so the L's flashed on an empty beam, died
    // during the fly, and came back after the press. Hide must unplant, and
    // `landed` follows the live pose's hunt gate (last stretch of the press,
    // not the plant frame) so the corners can fade in instead of popping.
    const landed = machineLive && !dropLive && !assembleLive && stickerHunting
      && (a0.shot === 'hold' || a0.shot === 'stick')
    const reticle = reticleTracker.update({
      dt,
      elapsed,
      progress: reticleP,
      pointer,
      width,
      height: heightPx,
      qr: lastQrRect,
      machine: machineRect,
      reducedMotion,
      lockToMachine: isCoarse,
      folded,
      landed,
    })

    composer.renderToScreen = false
    // Once the cover is opaque and the app screen has taken it over there is
    // nothing of the room left on screen, so stop paying for it - the glass
    // keeps rendering from the last graded frame all the way into the slot.
    if (appMix < 0.97 || fold < 0.995) renderGymFrame()
    if (import.meta.dev && partsRig && lastAssemble) {
      if (!loggedExplode && lastAssemble.t > 0.15 && !lastAssemble.swap) {
        loggedExplode = true
        console.info('[gymscan] 0B calls explode', renderer.info.render.calls)
      }
      if (!loggedPlanted && lastAssemble.swap) {
        loggedPlanted = true
        console.info('[gymscan] 0B calls planted', renderer.info.render.calls)
      }
    }
    const gymTex = composer.readBuffer.texture
    reticleOverlay.render(
      renderer,
      reticle,
      width,
      heightPx,
      act1.shot === 'lock' && act1.lockU >= 0.72,
      composer.readBuffer,
    )

    let phone: FrameInfo['phone'] = {
      x: target.x,
      y: target.y,
      w: target.w,
      h: target.h,
      radius: target.w * 0.125,
      rotX: 0,
      rotY: 0,
      perspective: 0,
    }
    if (overlayOn) {
      phone = phoneOverlay.pose(fold, target, width, heightPx, {
        mx: tilt.x,
        my: tilt.y,
        hasPointer: tilt.active,
        dt,
        reducedMotion,
        qr: qrLive,
      })
      phoneOverlay.renderFromTexture(renderer, gymTex, shrink)
    } else {
      phoneOverlay.blitToScreen(renderer, gymTex)
    }
    onFrame({
      progress: p,
      scene: sp,
      complete: act1Frame.complete,
      heroMorph: morph,
      act1: {
        shot: act1.shot,
        lock: act1.lockU,
      },
      phone,
      fold,
      act0: {
        shot: a0.shot,
        skipVisible: a0.skipVisible,
        doorsVisible: a0.doorsVisible,
        done: a0.done,
      },
    })
  }

  /** Project a list of points to a CSS-pixel AABB. `matrix` is applied first
   *  when the points are in local space (the QR plate). `anyBehindFails` matches
   *  the old placard gate: one corner behind the camera drops the whole box. */
  function projectPoints(
    pts: THREE.Vector3[],
    matrix: THREE.Matrix4 | null,
    anyBehindFails: boolean,
  ): ScreenRect | null {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    let behind = 0
    for (const c of pts) {
      if (matrix) projected.copy(c).applyMatrix4(matrix)
      else projected.copy(c).setY(c.y + machineRig.position.y)
      projected.project(camera)
      if (projected.z > 1) behind++
      const sx = (projected.x * 0.5 + 0.5) * width
      const sy = (-projected.y * 0.5 + 0.5) * heightPx
      minX = Math.min(minX, sx)
      maxX = Math.max(maxX, sx)
      minY = Math.min(minY, sy)
      maxY = Math.max(maxY, sy)
    }
    if (anyBehindFails ? behind > 0 : behind === pts.length) return null
    if (!(maxX > minX) || !(maxY > minY)) return null
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY }
  }

  async function load() {
    const draco = new DRACOLoader()
    draco.setDecoderPath('/draco/')
    const loader = new GLTFLoader()
    loader.setDRACOLoader(draco)

    // Only the hero is loaded. A corridor of background equipment used to
    // stand behind it; it is gone deliberately, and the props GLB with it -
    // silhouettes at the back of a near-black room read as clutter far more
    // readily than as depth, and the empty floor running out into the fog says
    // "big dark room" more convincingly than a row of machines nobody is
    // meant to look at.
    const shadows = renderer.shadowMap.enabled
    partsRig = await loadPartsRig(loader, {
      dress: dressMaterial,
      shadows,
      heroMats,
    })

    if (partsRig) {
      machineRig.add(partsRig.root)
      heroRoot = partsRig.root
    }
    else {
      const hero = await loader.loadAsync('/assets/gym3d/hero-machine.glb')
      heroRoot = hero.scene
      machineRig.add(heroRoot)
      heroRoot.traverse((o) => {
        const mesh = o as THREE.Mesh
        if (!mesh.isMesh) return
        mesh.castShadow = shadows
        mesh.receiveShadow = shadows
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        for (const m of mats) {
          const std = m as THREE.MeshStandardMaterial
          dressMaterial(std)
          heroMats.push(std)
        }
      })
    }

    // 3x3x3 samples through the planted machine's world AABB. Eight corners
    // alone miss the near base (a face centre), which is the lowest point on
    // screen in the establishing shot; the extra samples pull the viewfinder
    // down onto the silhouette. Taken at rest; the drop offsets them in
    // projectPoints so the viewfinder still tracks the falling mesh.
    const aabb = new THREE.Box3().setFromObject(heroRoot)
    const { min, max } = aabb
    let si = 0
    for (const tx of [0, 0.5, 1]) {
      for (const ty of [0, 0.5, 1]) {
        for (const tz of [0, 0.5, 1]) {
          machineSamples[si++]!.set(
            min.x + (max.x - min.x) * tx,
            min.y + (max.y - min.y) * ty,
            min.z + (max.z - min.z) * tz,
          )
        }
      }
    }
    machineLive = true

    // Built from the finished hero so it inherits the exact geometry, and
    // added after it so it sorts into the transparent pass behind nothing.
    const holoSource = partsRig ? partsRig.silhouette() : heroRoot
    holo = createHologramShell(holoSource, { cheap: isCoarse })
    scene.add(holo.object)

    machineRig.visible = true
    contact.visible = false
    if (partsRig) {
      machineRig.position.y = 0
      if (reducedMotion) {
        act0T = act0Windows(phoneCut()).stickEnd
        snapAssemble(assembleAt(1e6, { phone: phoneCut() }))
        applyStick(stickAt(0, 'hold', phoneCut()))
      }
      else {
        act0T = 0
        assembleT = 0
        assembleLive = false
        holoLive = false
        partsRig.root.visible = false
        const state = assembleAt(0, { phone: phoneCut() })
        partsRig.apply(state)
        lastAssemble = state
        applyContact(0)
        applyStick(stickHidden())
        setMountVisible(false)
      }
    }
    else if (reducedMotion) {
      act0T = act0Windows(phoneCut()).stickEnd
      applyDrop(0)
      holoLive = true
      applyStick(stickAt(0, 'hold', phoneCut()))
    }
    else {
      act0T = 0
      dropT = 0
      dropLive = false
      holoLive = false
      applyDrop(dropAt(0).y)
      applyStick(stickHidden())
    }

    draco.dispose()
    // Warm both light-count variants into the program cache before the first
    // frame, so the phoneFill toggle above is a cache hit rather than a
    // mid-scroll shader compile.
    // compile() walks traverseVisible, so anything parked invisible is skipped
    // - the shell has to be shown for the prewarm or its first sweep would
    // compile mid-scroll. Parts path: compile the swapped rest (the long-lived
    // lighting identity) then restore the hang pose.
    if (partsRig && !reducedMotion) {
      partsRig.root.visible = true
      partsRig.apply(assembleAt(1e6, { phone: phoneCut() }))
      applyStick(stickAt(0, 'hold', phoneCut()))
    }
    // The card's three layers each have their own program, and two of them -
    // the inlay and the film - are only ever on screen during 0C. compile()
    // walks traverseVisible, so unless they are shown here they are compiled
    // the frame the peel starts, which is the frame that must not drop.
    const stickerWas = [stickerRig.visible, nfc.visible, foil.visible] as const
    stickerRig.visible = true
    nfc.visible = true
    foil.visible = true
    phoneFill.visible = true
    holo.object.visible = true
    renderer.compile(scene, camera)
    phoneFill.visible = false
    holo.object.visible = false
    renderer.compile(scene, camera)
    stickerRig.visible = stickerWas[0]
    nfc.visible = stickerWas[1]
    foil.visible = stickerWas[2]
    if (partsRig && !reducedMotion) {
      partsRig.root.visible = false
      const state = assembleAt(0, { phone: phoneCut() })
      partsRig.apply(state)
      lastAssemble = state
      applyContact(0)
      applyStick(stickHidden())
      setMountVisible(false)
      holoLive = false
      act0T = 0
    }
    phoneOverlay.prewarm(renderer)
    reticleOverlay.prewarm(renderer)
    act0Armed = true
    if (!reducedMotion) act0T = 0
    lastT = performance.now()
    performanceArmed = isCoarse
    onReady()
  }

  // --- public API ------------------------------------------------------------
  function setProgress(p: number) {
    targetProgress = clamp01(p)
  }
  function setPointer(nx: number, ny: number, active: boolean) {
    pointer.x = nx
    pointer.y = ny
    pointer.active = active
  }
  function setTilt(nx: number, ny: number, active: boolean) {
    tilt.x = nx
    tilt.y = ny
    tilt.active = active
  }
  function skipAct0() {
    act0T = act0Windows(phoneCut()).stickEnd
  }
  /**
   * The landing hero's own front-phone box, in canvas pixels. Fed by the
   * component once that hero has laid out; null until then.
   */
  function setHeroSlot(slot: PhoneBox | null) {
    heroSlot = slot
  }
  function snapshot(): string | null {
    try {
      return canvas.toDataURL('image/jpeg', 0.9)
    }
    catch {
      return null
    }
  }
  function start() {
    if (running || disposed) return
    running = true
    lastT = performance.now()
    raf = requestAnimationFrame(frame)
  }
  function stop() {
    running = false
    cancelAnimationFrame(raf)
  }
  function dispose() {
    disposed = true
    stop()
    partsRig?.dispose()
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.geometry?.dispose()
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      mats.forEach(m => m?.dispose())
    })
    stickerTex.dispose(); shadowTex.dispose()
    nfcMaps.map.dispose(); nfcMaps.orm.dispose(); cardGeo.dispose()
    floorMaps.dispose()
    floorPbrMaterial.dispose()
    floorLiteMaterial?.dispose()
    env.dispose()
    appScreen.dispose()
    phoneOverlay.dispose()
    reticleOverlay.dispose()
    composerTarget.dispose()
    composer.dispose()
    renderer.dispose()
    heroMats = []
  }

  const api = {
    load,
    resize,
    setProgress,
    setHeroSlot,
    setPointer,
    setTilt,
    skipAct0,
    snapshot,
    start,
    stop,
    dispose,
    get progress() { return progress },
  }
  // Dev-only handle so the scene can be probed from a headless browser while
  // tuning the look. Stripped from production builds by the import.meta.dev guard.
  if (import.meta.dev) {
    ;(window as unknown as Record<string, unknown>).__gymscan = {
      api, scene, camera, uniforms, renderer, composer,
      renderOnce: renderGymFrame,
      get heroMats() { return heroMats },
      key, rimL, rimR, far1, far2, strips, phoneFill, floor,
      phoneOverlay,
      get hero() { return heroRoot },
      get holo() { return holo },
      get machineRig() { return machineRig },
      get stickerRig() { return stickerRig },
      get dropT() { return dropT },
      get assembleT() { return assembleT },
      get assemble() { return lastAssemble },
      get act0T() { return act0T },
      get act0() { return lastAct0 },
      get act1() { return lastAct1 },
      skipAct0,
      seekAct0(t: number) { act0Armed = true; act0Frozen = true; act0T = Math.max(0, t) },
      playAct0() { act0Frozen = false },
      capturePhoneScreen(width = 620, height = 1344) {
        return phoneOverlay.exportScreen(renderer, width, height)
      },
      get parts() { return partsRig },
      get qrRect() { return lastQrRect },
      drawCalls: () => renderer.info.render.calls,
    }
  }
  return api
}

export type GymScanStage = ReturnType<typeof createGymScanStage>
