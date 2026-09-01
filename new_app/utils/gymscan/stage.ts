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
import { CompositeShader } from './composite'
import { createHologramShell, type HologramShell } from './hologram'
import { createPlacardMaterial, createPlacardUniforms } from './placard'
import { createPhoneOverlay, phoneShrink, type PhoneOverlay } from './phoneOverlay'
import { createScanAppScreen } from './scanApp.ts'
import { PHONE_H, PHONE_W } from '../phoneModel'
import { createReticleTracker, RETICLE_OUT_END, type ScreenRect } from './reticle'
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
import {
  clamp01, damp, ease, lerp, scalarAt, smoothstep, span, vec3HermiteAt,
  type ScalarStop, type Vec3Stop,
} from './timeline'

// --- choreography ----------------------------------------------------------
// One table for the whole sequence. Reading down a column tells you what the
// camera, the scan and the fold are each doing at any point in the scroll.
// The camera move is one shot, so it is written as one shot: a path through
// space, and - separately - a schedule saying how fast the camera travels
// along it.
//
// It used to be a single nine-stop table read with `vec3At`, which eases in
// *and* out of every stop. Velocity therefore hit zero eight times on the way
// down, so what was meant to be a dolly arrived as eight consecutive zooms
// with a pause between each. Splitting shape from timing fixes that at the
// root: `vec3HermiteAt` carries speed across every control point, and
// `cameraU` accelerates exactly once and decelerates exactly once.
//
// The path itself is also monotonic now. The old one pushed in to the seated
// station and then pulled back out again for the last quarter, and a reversal
// is a phase change however smoothly it is interpolated.
//
// `u` runs 0..1 from a wide three-quarter read of the whole machine to the
// seated eye point - where the athlete's head would be, so the placard is
// found from the training position rather than from a flattering angle no user
// will ever occupy.
const CAM_PATH: readonly Vec3Stop[] = [
  [0.00, [3.98, 2.22, 4.96]],
  [0.22, [3.20, 2.04, 4.14]],
  [0.46, [2.28, 1.82, 3.20]],
  [0.68, [1.34, 1.56, 2.14]],
  [0.86, [0.56, 1.34, 1.32]],
  [1.00, [0.02, 1.255, 0.86]],
]
const CAM_TARGET_PATH: readonly Vec3Stop[] = [
  [0.00, [0.05, 0.88, -0.04]],
  [0.46, [0.02, 0.94, -0.14]],
  [0.72, [0.00, 1.02, -0.24]],
  // Land on the plate itself so the folded phone has the QR in the
  // viewfinder, matching scan-flow.mp4's flattened code at 3.2s.
  [1.00, [0.00, 1.255, -0.372]],
]
/**
 * Scroll position -> position along the path.
 *
 * One smoothstep across the whole approach, which means the sequence contains
 * exactly two moments of zero camera velocity: the top of the page and the end
 * of the move. The approach lands at 0.90 rather than 1.0 so the last stretch -
 * by which point the frame has already folded into the 3D phone and is fading
 * out behind the DOM hero - is a held shot rather than a drift with nowhere
 * to go.
 */
const CAM_SPAN = 0.90
function cameraU(p: number): number {
  return smoothstep(p / CAM_SPAN)
}
// Nothing drives the machine any more. The scan plane, the contour slices, the
// identified outline and the interference burst all used to have tables here;
// the machine now carries no analysis layer, so the whole scan reads on the QR
// placard and in the HUD instead. What is left below is the code plate and the
// fold.
// All three retire to nothing by the time the app UI is up. They used to fade
// only part-way, which was survivable while the camera pulled back out at the
// end and left the plate small and far away; now that the move is monotonic
// and the shot holds at the seated station, the plate is still filling the
// middle of the frame at p = 1 and any residual glow on it prints straight
// through the set list.
const PLACARD_REVEAL: readonly ScalarStop[] = [
  [0.40, 0], [0.52, 0.35], [0.62, 1], [0.84, 1], [0.93, 0],
]
const PLACARD_RESOLVE: readonly ScalarStop[] = [
  [0.44, 0], [0.60, 0.6], [0.68, 1], [0.84, 1], [0.93, 0],
]
const PLACARD_LOCK: readonly ScalarStop[] = [
  [0.60, 0], [0.70, 1], [0.86, 1], [0.93, 0],
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
const FOLD: readonly ScalarStop[] = [
  [0.72, 0], [0.86, 1], [1.00, 1],
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
// Size pulls in across the whole dolly. Level holds until the camera is
// actually in the machine, then hands off to the phone — an early drop
// just looks like the room going dark.
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
// Phone slides from centre to the right half once the fold has completed.
const PHONE_X: readonly ScalarStop[] = [
  [0.86, 0.5], [1.00, 0.72],
]
// Keep the live composite on screen until the 3D phone is actually leaving
// full-bleed. Switching earlier replaced the frame with a 1:1-ish screen
// that was still a few percent off, which read as a zoom snap before any
// bezel existed.

export interface FrameInfo {
  progress: number
  /** 0–1 over the 3D act only (room → fold → park right). */
  scene: number
  /** 0–1 over the tail after the phone parks: travel into the landing hero. */
  heroMorph: number
  /** Projected 3D phone screen in CSS px, plus the rest pose for the DOM app. */
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
  status: StatusKey
}

export type StatusKey = 'standby' | 'scanning' | 'detected' | 'identified' | 'open'

export interface StageOptions {
  canvas: HTMLCanvasElement
  onFrame: (info: FrameInfo) => void
  onReady: () => void
  reducedMotion: boolean
}

// Bracketed under the front crossbeam, on the machine's centre line, facing
// back down the axis at the seat. From the seated eye point (0, 1.23, 0.55)
// that is 0.93 m away and 2 degrees above the sight line, with the footplate
// topping out at y = 0.83 so nothing occludes it - a plate you can actually
// scan while sitting in the machine, not one mounted over your own head.
const PLACARD_POS = new THREE.Vector3(0, 1.255, -0.372)
const PLACARD_TILT = -0.10          // radians, nosed down toward the seat
// The artwork is 827 x 874, so the sticker is very slightly taller than it is
// wide. 15.5 cm is a real gym tag: big enough to scan from the seat 0.9 m away,
// small enough that it is a sticker on a machine rather than signage.
const PLACARD_H = 0.155
const PLACARD_W = PLACARD_H * (827 / 874)
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
}

export function createGymScanStage(opts: StageOptions) {
  const { canvas, onFrame, onReady, reducedMotion } = opts

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: true,
    powerPreference: 'high-performance',
  })
  const isCoarse = window.matchMedia('(pointer: coarse)').matches
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
  const dprCap = 1.5
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, dprCap))
  // AgX keeps the near-black end neutral and rolls the scan line's highlight off
  // gracefully; ACES was tinting the dark powder-coat olive and clipping lime.
  renderer.toneMapping = THREE.AgXToneMapping
  // Pulled down from 1.35. The rig below puts more energy into speculars and
  // less into flat fill, so the machine can sit further into the toe of the
  // curve and still read - which is what a dark room actually looks like.
  renderer.toneMappingExposure = 0.82
  renderer.shadowMap.enabled = !isCoarse
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

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
  const phoneFill = new THREE.SpotLight(0xd6e4ff, 0, 3.0, 0.80, 1, 2)
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
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(90, 90),
    new THREE.MeshStandardMaterial({
      color: 0x0e0f12,
      map: floorMaps.map,
      roughnessMap: floorMaps.roughnessMap,
      normalMap: floorMaps.normalMap,
      normalScale: new THREE.Vector2(0.09, 0.09),
      roughness: 0.86,
      metalness: 0.0,
      envMapIntensity: 0.62,
    }),
  )
  // The tiled maps supply everything at fleck scale; this supplies everything
  // above it - traffic patches, patchy soiling - in world space, where no
  // amount of repeat can produce a grid.
  applySurfaceShader(floor.material as THREE.Material, createSurfaceUniforms('floor'))
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = renderer.shadowMap.enabled
  scene.add(floor)

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
  const placardMat = createPlacardMaterial(stickerTex, placardUniforms)
  const placard = new THREE.Mesh(new THREE.PlaneGeometry(PLACARD_W, PLACARD_H), placardMat)
  placard.position.copy(PLACARD_POS)
  placard.rotation.x = PLACARD_TILT
  placard.renderOrder = 1
  machineRig.add(placard)

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
  const strutH = PLACARD_BEAM_Y - (PLACARD_POS.y + PLACARD_H / 2) + 0.02
  for (const sx of [-1, 1]) {
    const strut = new THREE.Mesh(new THREE.BoxGeometry(0.012, strutH, 0.010), mountMat)
    strut.position.set(
      PLACARD_POS.x + sx * PLACARD_W * 0.36,
      PLACARD_POS.y + PLACARD_H / 2 + strutH / 2 - 0.01,
      PLACARD_POS.z - 0.012,
    )
    machineRig.add(strut)
  }

  // --- composer ------------------------------------------------------------
  // Multisampled, which the default composer target is not. The machine is
  // almost entirely thin tube against black, so every silhouette in the frame
  // is a high-contrast edge - and a stair-stepped edge is the loudest CG tell
  // there is, louder than any material error. Dropped on coarse pointers,
  // where the resolve bandwidth is not worth it.
  const composerTarget = new THREE.WebGLRenderTarget(1, 1, {
    type: THREE.HalfFloatType,
    samples: isCoarse ? 0 : 4,
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
  if (!isCoarse) composer.addPass(bloom)
  // No OutputPass: the composite ends with AgX and the sRGB encode itself, so
  // it is the last pass and can write either to the screen or to the overlay's
  // screen texture. toneMapped must stay off: three only injects TONE_MAPPING
  // when the current target is the drawing buffer, and the overlay samples an
  // RT — see composite.ts.
  const composite = new ShaderPass(CompositeShader as never)
  composite.material.toneMapped = false
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
  let holoT = 0
  let holoLive = false

  const pointer = { x: 0, y: 0, active: false }
  const tilt = { x: 0, y: 0, active: false }
  const probeTarget = new THREE.Vector3(0, 0.9, 1.4)
  const probeCurrent = new THREE.Vector3(0, 0.9, 1.4)
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
  let heroSlot: PhoneBox | null = null

  function statusFor(p: number): StatusKey {
    // 'sweep' used to fire off the idle X-ray pulse. That pulse existed only to
    // draw the scan plane across the resting machine, so it went with it.
    if (p < 0.26) return 'standby'
    if (p < 0.46) return 'scanning'
    if (p < 0.60) return 'detected'
    if (p < 0.84) return 'identified'
    return 'open'
  }

  function applyDrop(y: number) {
    machineRig.position.y = y
    holo?.setAltitude(y)
    const planted = dropPlanted(y)
    contactMat.opacity = lerp(0.10, 0.90, planted * planted)
    const s = lerp(0.36, 1, planted)
    contact.scale.set(s, s, 1)
  }

  function parkPhoneTarget(sp: number): PhoneBox {
    // Final body box in CSS px. Narrow viewports park a smaller phone high in
    // the frame: the copy stacks underneath rather than beside it, and a
    // two-thirds-height phone centred vertically would sit on the headline.
    const narrow = width < 900
    const h = narrow ? Math.min(heightPx * 0.38, 380) : Math.min(heightPx * 0.66, 620)
    const w = h * (PHONE_W / PHONE_H)
    const cx = (narrow ? 0.5 : scalarAt(PHONE_X, sp)) * width
    const cy = heightPx * (narrow ? 0.34 : 0.5)
    return { x: cx - w / 2, y: cy - h / 2, w, h }
  }

  function phoneTarget(p: number): PhoneBox {
    const park = parkPhoneTarget(sceneProgress(p))
    const morph = heroMorphAt(p)
    if (morph <= 0) return park
    const slot = heroSlot ?? (width >= 769 ? fallbackHeroSlot(width, heightPx) : null)
    if (!slot) return park
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

  function frame() {
    if (disposed) return
    raf = requestAnimationFrame(frame)
    const now = performance.now()
    const dt = Math.min((now - lastT) / 1000, 0.05)
    lastT = now
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

    // --- entry drop ---------------------------------------------------------
    // Analytic bounce on the rig. Scroll past the establishing beat skips
    // it: the camera is already moving in and an airborne machine under a
    // dolly is a different shot than the one the path was written for.
    const skipDrop = reducedMotion || sp > 0.16
    if (skipDrop && dropLive) {
      dropLive = false
      holoLive = true
      applyDrop(PLANTED_DROP.y)
    } else if (dropLive) {
      const pose = dropAt(dropT)
      applyDrop(pose.y)
      if (holo) {
        holoT = firstSweepTime(dropT, holo.peelTime)
        holoLive = true
      }
      dropT += dt
      if (pose.done) dropLive = false
    } else if (holoLive || reducedMotion) {
      holoT += dt
    }

    // --- placard ------------------------------------------------------------
    placardUniforms.uReveal.value = scalarAt(PLACARD_REVEAL, sp)
    placardUniforms.uResolve.value = scalarAt(PLACARD_RESOLVE, sp)
    placardUniforms.uLock.value = scalarAt(PLACARD_LOCK, sp)

    // --- camera -------------------------------------------------------------
    const camU = cameraU(sp)
    vec3HermiteAt(CAM_PATH, camU, camPos)
    vec3HermiteAt(CAM_TARGET_PATH, camU, camTgt)
    // A small pointer-led parallax, deliberately tiny: the machine should feel
    // observed, not handled. Falls away as the camera closes on the placard.
    const parallax = (1 - ease(sp, 0.55, 0.75)) * (reducedMotion ? 0 : 1)
    const driftX = pointer.x * 0.16 * parallax
    const driftY = -pointer.y * 0.10 * parallax
    const breathe = reducedMotion ? 0 : Math.sin(elapsed * 0.32) * 0.012 * (1 - ease(sp, 0.6, 0.8))
    // A portrait viewport keeps the vertical field and loses horizontal, which
    // crops the machine's 1.9 m length out of the establishing shot. Back the
    // camera off rather than widening the lens, and taper that away by the time
    // it is meant to be sitting in the seat - extra distance there would break
    // the point of the shot. Much smaller than it was, because the establishing
    // station itself now sits a long way further back.
    const pull = width < 900 ? 1 + 0.22 * (1 - ease(sp, 0.40, 0.72)) : 1
    camera.position.set(
      camTgt.x + (camPos.x - camTgt.x) * pull + driftX,
      camTgt.y + (camPos.y - camTgt.y) * pull + driftY + breathe,
      camTgt.z + (camPos.z - camTgt.z) * pull,
    )
    lookAt.set(camTgt.x, camTgt.y, camTgt.z)
    camera.lookAt(lookAt)

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
    // Held just below the eye line, as a phone is. It ramps in over the last
    // stretch of the approach and dies with the fold, so it only ever exists
    // while there is a plausible phone in the scene to be emitting it.
    const fillAmp = ease(sp, 0.50, 0.70) * (1 - ease(sp, 0.80, 0.90))
    phoneFill.intensity = fillAmp * 2.2
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
      phoneFill.position.set(
        camera.position.x,
        camera.position.y - 0.16,
        camera.position.z - 0.10,
      )
      phoneFill.target.position.set(PLACARD_POS.x, PLACARD_POS.y - 0.02, PLACARD_POS.z)
      phoneFill.target.updateMatrixWorld()
    }

    // --- cursor probe --------------------------------------------------------
    // The pointer is projected onto a vertical plane through the machine, so the
    // field tracks across the real surface instead of orbiting in screen space.
    const reach = 1 - ease(sp, 0.6, 0.8)
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

    // --- hologram exoskeleton -----------------------------------------------
    // After the probe lerp so the cage reads this frame's damped field,
    // not last frame's. Free-running after the entry: the sweep is the
    // machine idling under observation, and the scroll only decides
    // whether it is present. The first pass is warped so the floor peel
    // lands on first impact — see firstSweepTime. Under reduced motion
    // the sweep is a still shell.
    holo?.update(
      reducedMotion ? elapsed : holoT,
      (holoLive || reducedMotion) ? scalarAt(HOLO, sp) : 0,
      reducedMotion,
      {
        position: uniforms.uProbe.value,
        radius: uniforms.uProbeRadius.value,
        amp: uniforms.uProbeAmp.value,
        live: uniforms.uProbeLive.value,
        time: uniforms.uTime.value,
      },
    )

    // --- fold + composite ----------------------------------------------------
    const fold = scalarAt(FOLD, sp)
    const target = phoneTarget(p)
    // The overlay phone is the hero's front device. Settle its rig toward
    // Phone3D's lights as it parks in that slot. After the QR lock the screen
    // plays the real scan-to-log capture instead of a DOM mock.
    phoneOverlay.setHeroMix(morph)
    const appMix = appScreen.ready ? appScreen.sync(sp, dt) : 0
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
    if (machineRig.matrixWorldNeedsUpdate || dropLive) machineRig.updateMatrixWorld(true)
    const qrLive = projectPoints(corners, placard.matrixWorld, true)

    // Resolve the lock before presentation. It is drawn into the gym texture,
    // so it stays attached to the projected QR as that texture folds into the
    // 3D phone instead of disappearing at the first pixel of shrink.
    const folded = sp >= RETICLE_OUT_END
    lastQrRect = folded ? null : qrLive
    const machineRect = machineLive ? projectPoints(machineSamples, null, false) : null
    // dropLive is true only while the bounce is still writing the rig. Skip,
    // reduced-motion, and the settle frame all clear it, so this is the same
    // gate as "the machine is where the camera path was written for".
    const landed = machineLive && !dropLive
    const reticle = reticleTracker.update({
      dt,
      elapsed,
      progress: sp,
      pointer,
      width,
      height: heightPx,
      qr: lastQrRect,
      machine: machineRect,
      reducedMotion,
      lockToMachine: width < 900 || isCoarse,
      folded,
      landed,
    })

    composer.renderToScreen = false
    // Once the capture covers the screen the gym RT is not seen. Keep the last
    // frame rather than paying the room for the rest of the morph.
    if (sp < 0.93 && appMix < 0.97) renderGymFrame()
    const gymTex = composer.readBuffer.texture
    reticleOverlay.render(
      renderer,
      reticle,
      width,
      heightPx,
      sp >= 0.60,
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
      heroMorph: morph,
      phone,
      fold,
      status: statusFor(sp),
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
    const hero = await loader.loadAsync('/assets/gym3d/hero-machine.glb')

    heroRoot = hero.scene
    machineRig.add(heroRoot)
    heroRoot.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = renderer.shadowMap.enabled
      mesh.receiveShadow = renderer.shadowMap.enabled
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const m of mats) {
        const std = m as THREE.MeshStandardMaterial
        const spec = HERO_MATERIALS[std.name] ?? { kind: 'frame' as SurfaceKind, rough: null, env: 0.55, dim: 1 }
        // Darken the exported albedo rather than re-exporting the GLB: the
        // asset's colours are already near-black, and what is wanted here is a
        // machine that sits below the room rather than one lit to be looked at.
        std.color.multiplyScalar(spec.dim)
        std.envMapIntensity = spec.env
        if (spec.rough !== null) std.roughness = spec.rough
        applyScanShader(std, uniforms, createSurfaceUniforms(spec.kind))
        heroMats.push(std)
      }
    })

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
    holo = createHologramShell(heroRoot)
    scene.add(holo.object)

    machineRig.visible = true
    contact.visible = true
    if (reducedMotion) {
      applyDrop(0)
      holoLive = true
    } else {
      dropT = 0
      dropLive = true
      holoLive = true
      applyDrop(dropAt(0).y)
    }

    draco.dispose()
    // Warm both light-count variants into the program cache before the first
    // frame, so the phoneFill toggle above is a cache hit rather than a
    // mid-scroll shader compile.
    // compile() walks traverseVisible, so anything parked invisible is skipped
    // - the shell has to be shown for the prewarm or its first sweep would
    // compile mid-scroll.
    phoneFill.visible = true
    holo.object.visible = true
    renderer.compile(scene, camera)
    phoneFill.visible = false
    holo.object.visible = false
    renderer.compile(scene, camera)
    phoneOverlay.prewarm(renderer)
    reticleOverlay.prewarm(renderer)
    onReady()
  }

  // --- public API ------------------------------------------------------------
  function setProgress(p: number) {
    targetProgress = clamp01(p)
  }
  function setHeroSlot(slot: PhoneBox | null) {
    heroSlot = slot
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
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.geometry?.dispose()
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      mats.forEach(m => m?.dispose())
    })
    stickerTex.dispose(); shadowTex.dispose()
    floorMaps.dispose()
    env.dispose()
    appScreen.dispose()
    phoneOverlay.dispose()
    reticleOverlay.dispose()
    composerTarget.dispose()
    composer.dispose()
    renderer.dispose()
    heroMats = []
  }

  const api = { load, resize, setProgress, setHeroSlot, setPointer, setTilt, start, stop, dispose, get progress() { return progress } }
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
      get dropT() { return dropT },
      get qrRect() { return lastQrRect },
    }
  }
  return api
}

export type GymScanStage = ReturnType<typeof createGymScanStage>
