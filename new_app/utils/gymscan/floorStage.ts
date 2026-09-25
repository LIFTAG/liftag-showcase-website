import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { createPhoneModel, PHONE_SCREEN_Z } from "../phoneModel";
import {
  drawFloorAppScreen,
  drawFloorExerciseScreen,
  floorAppNameLayout,
  floorViewButton,
  type FloorAppCopy,
  type FloorAppNameLayout,
} from "./floorAppScreen";
import {
  drawFloorCoachScreen,
  drawFloorOffer,
  drawFloorPlanScreen,
  floorOfferButton,
  type FloorPublishState,
} from "./floorPlanScreen";
import { createFloorSeams } from "./floorSeams";
import { createFloorIsland } from "./floorIsland";
import { createFloorTitle } from "./floorTitle";
import { floorEquipment } from "./floorEquipment";
import {
  GYM_ENV_SIZE,
  createGymEnvironment,
  createFloorMaps,
  createContactShadowTexture,
} from "./environment";
import { experienceDprCap } from "./journey";
import {
  FLOOR_APP_CANVAS,
  FLOOR_APP_CHROME,
  FLOOR_CAM_FOV,
  FLOOR_PHONE_ROT_X,
  FLOOR_PHONE_SCALE,
  floorAppNameWorld,
  floorAppNumberWorld,
  floorAt,
  floorCameraAt,
  floorFilm,
  floorCornerRadius,
  floorFrames,
  floorLabelAt,
  floorLabelLanded,
  floorMachinePoseAt,
  floorMorphBeats,
  floorMorphRect,
  floorOfferFrame,
  floorOpenAt,
  floorOpenFrame,
  floorOrderAt,
  floorPlanAt,
  floorPlanLanded,
  floorSpawnAt,
  floorSpawnDone,
  floorTitleLanded,
  type FloorOpenFrame,
} from "./floorTimeline";
import {
  HERO_PHONE_KEY_LIGHT,
  HERO_PHONE_TILT_LERP,
  overheadPointerTilt,
  pointerTowardBox,
} from "./handoff";
import { disposeTree } from "./dispose";
import { createRoundedPlate } from "./roundedPlate";
import { damp, lerp } from "./timeline";

/** CSS font size of a floor tag's number; the in-app index is matched to it. */
export const FLOOR_TAG_FONT = 11;
/** CSS font size of a floor tag's name; the in-app row title is matched to it. */
export const FLOOR_NAME_FONT = 12;
/** Phones set the floor names a size down, as 11px pills. */
const FLOOR_NAME_COMPACT = 11 / FLOOR_NAME_FONT;
/** Tags float this far above the top of their machine, CSS pixels. */
const TAG_LIFT = 30;
/** Rubber under the ceiling strips → the app's own background. */
const RUBBER = new THREE.Color(0x8d959b);
const APP_INK = new THREE.Color(0x0e1210);
const APP_LIME = new THREE.Color(0xccff00);
/** The app's raised surface: its search field and exercise cards. */
const APP_CARD = new THREE.Color(0x1a201c);

/**
 * A card opening out of a button: clips a screen to the card, and fits the
 * screen into it by width. While button-sized the card wears the button's
 * own face, if it has one. Around the card the list dims under a soft
 * shadow. Canvas pixels throughout, y down.
 */
const OPEN_FRAGMENT = /* glsl */ `
vec2 openPx = vec2(vMapUv.x, 1. - vMapUv.y) * uOpenCanvas;
vec2 openQ = abs(openPx - uOpenBox.xy) - uOpenBox.zw + uOpenRadius;
float openD = length(max(openQ, 0.)) + min(max(openQ.x, openQ.y), 0.) - uOpenRadius;
float openAa = max(fwidth(openD), 1e-3);
float openIn = 1. - smoothstep(-openAa, openAa, openD);
// The button's face, under the tint of the press.
vec2 openFaceUv = ((openPx - uOpenBox.xy) / (2. * uOpenBox.zw) + .5) * uOpenFaceUv;
vec4 openFace = texture2D(uOpenSprite, vec2(openFaceUv.x, 1. - openFaceUv.y));
openFace.a *= uOpenFace;
float openFaceA = uOpenState.x + openFace.a * (1. - uOpenState.x);
vec3 openFaceRgb = (uOpenTint * uOpenState.x + openFace.rgb * openFace.a * (1. - uOpenState.x)) / max(openFaceA, 1e-4);
// The screen inside the card, without its own chrome: the card is not a phone.
vec2 openLocal = (openPx - uOpenMap.xy) / uOpenMap.z;
float openApp = step(uOpenChrome.x, openLocal.y) * step(openLocal.y, uOpenCanvas.y - uOpenChrome.y);
vec2 openUv = vec2(openLocal.x / uOpenCanvas.x, 1. - openLocal.y / uOpenCanvas.y);
vec3 openScreen = mix(texture2D(map, openUv).rgb, texture2D(uOpenNext, openUv).rgb, uOpenSwap);
openScreen = mix(uOpenInk, openScreen, openApp);
vec3 openSurface = mix(openFaceRgb, uOpenCard, uOpenState.y);
vec3 openCard = mix(openSurface, openScreen, uOpenState.z);
float openCardA = mix(mix(openFaceA, 1., uOpenState.y), 1., uOpenState.z);
float openShade = max(uOpenState.w, uOpenShadow * (1. - smoothstep(0., 56., openD)));
vec4 openColor = mix(vec4(0., 0., 0., openShade), vec4(openCard, openCardA), openIn);
// Every screen paints the same status bar and home indicator; leave them be.
openColor.a *= step(uOpenChrome.x, openPx.y) * step(openPx.y, uOpenCanvas.y - uOpenChrome.y);
diffuseColor = vec4(openColor.rgb, openColor.a * opacity);
`;
const OPEN_UNIFORMS =
  "uniform vec2 uOpenCanvas;uniform vec2 uOpenChrome;uniform vec4 uOpenBox;uniform float uOpenRadius;" +
  "uniform vec3 uOpenMap;uniform vec4 uOpenState;uniform float uOpenShadow;uniform float uOpenFace;" +
  "uniform float uOpenSwap;uniform sampler2D uOpenNext;uniform sampler2D uOpenSprite;uniform vec2 uOpenFaceUv;" +
  "uniform vec3 uOpenTint;uniform vec3 uOpenCard;uniform vec3 uOpenInk;\n";

function createAppTexture(image: HTMLCanvasElement, anisotropy: number) {
  const texture = new THREE.CanvasTexture(image);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.anisotropy = anisotropy;
  return texture;
}

/**
 * A screen that opens out of a button over the list, on the glass's own
 * geometry. `sprite` is the button's face; `next` a second screen the card
 * can cross to.
 */
function createOpenCard(
  screen: THREE.Mesh,
  opts: { map: THREE.Texture; next?: THREE.Texture; sprite: THREE.Texture; tint: THREE.Color; overModels: boolean },
) {
  const material = new THREE.MeshBasicMaterial({
    map: opts.map,
    toneMapped: false,
    transparent: true,
    // Over the models, the card hides the thumbnails; under them, they ride on it.
    depthTest: !opts.overModels,
    depthWrite: false,
  });
  const uniforms = {
    uOpenCanvas: { value: new THREE.Vector2(FLOOR_APP_CANVAS.w, FLOOR_APP_CANVAS.h) },
    uOpenChrome: { value: new THREE.Vector2(FLOOR_APP_CHROME.top, FLOOR_APP_CHROME.bottom) },
    uOpenBox: { value: new THREE.Vector4() },
    uOpenRadius: { value: 0 },
    uOpenMap: { value: new THREE.Vector3(0, 0, 1) },
    /** Tint alpha, fill, content, scrim. */
    uOpenState: { value: new THREE.Vector4() },
    uOpenShadow: { value: 0 },
    uOpenFace: { value: 0 },
    uOpenSwap: { value: 0 },
    uOpenNext: { value: opts.next ?? opts.map },
    uOpenSprite: { value: opts.sprite },
    /** Share of the sprite, from its top left, that the face takes up. */
    uOpenFaceUv: { value: new THREE.Vector2(1, 1) },
    uOpenTint: { value: opts.tint },
    uOpenCard: { value: APP_CARD },
    uOpenInk: { value: APP_INK },
  };
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.fragmentShader = OPEN_UNIFORMS + shader.fragmentShader.replace("#include <map_fragment>", OPEN_FRAGMENT);
  };
  material.customProgramCacheKey = () => "floor-open-v2";
  const mesh = new THREE.Mesh(screen.geometry.clone(), material);
  mesh.position.copy(screen.position);
  mesh.renderOrder = 2; // Over the list's rules; the Dynamic Island stays above.
  mesh.visible = false;
  return {
    mesh,
    uniforms,
    set(card: FloorOpenFrame) {
      uniforms.uOpenBox.value.set(card.cx, card.cy, card.hw, card.hh);
      uniforms.uOpenRadius.value = card.radius;
      uniforms.uOpenMap.value.set(card.left, card.top, card.scale);
      uniforms.uOpenState.value.set(card.tint, card.fill, card.content, card.scrim);
      uniforms.uOpenShadow.value = card.shadow;
      uniforms.uOpenFace.value = card.face;
    },
  };
}

export type FloorPointer = {
  hasPointer: boolean;
  clientX: number;
  clientY: number;
};

export type FloorTagPoint = {
  /** The number badge, CSS pixels from the canvas corner. */
  x: number;
  y: number;
  scale: number;
  alpha: number;
  leader: number;
  mix: number;
  /** The name: the badge on the floor, the row's first baseline in the app. */
  nameX: number;
  nameY: number;
  nameScale: number;
  pill: number;
};

function fadeMaterial(material: THREE.Material, base: number, amount: number) {
  const opacity = base * amount;
  const transparent = opacity < 0.999 || base < 0.999;
  material.opacity = opacity;
  if (material.transparent !== transparent) {
    material.transparent = transparent;
    // `transparent` switches Three's OPAQUE define; the version bump lets the
    // renderer pick the matching prewarmed program at the fade boundary.
    material.needsUpdate = true;
  }
  material.depthWrite = opacity > 0.95 && base > 0.95;
}

/** Every string the app paints, for loading the font subsets it needs. */
function sampleText(copy: FloorAppCopy) {
  const exercises = [...copy.plan.exercises, ...copy.coach.exercises].map((item) => item.name + item.sets);
  return [
    ...Object.values(copy.names),
    copy.plan.offer,
    copy.plan.title,
    copy.plan.building,
    copy.coach.title,
    copy.coach.publish,
    copy.coach.live,
    ...exercises,
  ].join("");
}

/** Floor → phone, rendered by one lazily created canvas. */
export function createFloorStage(
  canvas: HTMLCanvasElement,
  opts: { copy: FloorAppCopy },
) {
  let copy = opts.copy;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FLOOR_CAM_FOV, 1, 0.05, 90);
  const environment = createGymEnvironment(renderer, GYM_ENV_SIZE);
  scene.environment = environment.texture;
  const key = new THREE.DirectionalLight(0xe8f0ea, 4.2);
  key.position.set(-3, 6, 5);
  const rim = new THREE.DirectionalLight(0xc8d9ed, 2.2);
  rim.position.set(4, 4, -4);
  const down = new THREE.DirectionalLight(0xf2fff0, 0);
  down.position.set(0, 8, 0);
  const phoneKey = new THREE.DirectionalLight(0xffffff, 0);
  phoneKey.position.set(HERO_PHONE_KEY_LIGHT.x, HERO_PHONE_KEY_LIGHT.y, HERO_PHONE_KEY_LIGHT.z);
  scene.add(key, rim, down, phoneKey, new THREE.HemisphereLight(0xcadace, 0x18251b, 2.2));

  const tilt = new THREE.Group();
  scene.add(tilt);
  const device = new THREE.Group();
  device.scale.setScalar(FLOOR_PHONE_SCALE);
  device.rotation.x = FLOOR_PHONE_ROT_X;
  tilt.add(device);

  // One continuous surface: rubber tiles that contract into the glass.
  const surface = createRoundedPlate(8, "floor-surface-v1");
  const floorMaps = createFloorMaps(renderer.capabilities.getMaxAnisotropy(), 256, { seams: false });
  for (const texture of [floorMaps.map, floorMaps.roughnessMap, floorMaps.normalMap])
    texture.repeat.set((8 * FLOOR_PHONE_SCALE) / 2, (8 * FLOOR_PHONE_SCALE) / 2);
  surface.material.color.copy(RUBBER);
  surface.material.map = floorMaps.map;
  surface.material.roughnessMap = floorMaps.roughnessMap;
  surface.material.normalMap = floorMaps.normalMap;
  surface.material.normalScale.set(0.12, 0.12);
  device.add(surface.mesh);
  const seams = createFloorSeams();
  device.add(seams.mesh);
  const title = createFloorTitle(copy.title);
  tilt.add(title.root);

  const appImage = document.createElement("canvas");
  appImage.width = FLOOR_APP_CANVAS.w;
  appImage.height = FLOOR_APP_CANVAS.h;
  const appCtx = appImage.getContext("2d")!;
  const paintedLabels = floorEquipment.map(() => false);
  let paintedTitle = false;
  const paintApp = () =>
    drawFloorAppScreen(appCtx, appImage.width, appImage.height, {
      landed: paintedLabels,
      title: paintedTitle,
      copy,
    });
  const layoutNames = (): FloorAppNameLayout[] =>
    floorEquipment.map((item, i) =>
      floorAppNameLayout(appCtx, appImage.width, appImage.height, i, copy.names[item.id]),
    );
  let names = layoutNames();
  paintApp();
  const anisotropy = renderer.capabilities.getMaxAnisotropy();
  const appTexture = createAppTexture(appImage, anisotropy);
  const screenMaterial = new THREE.MeshBasicMaterial({
    map: appTexture,
    toneMapped: false,
    transparent: true,
    opacity: 0,
  });
  const phone = createPhoneModel({ screenMaterial });
  phone.group.visible = false;
  device.add(phone.group);
  // createPhoneModel add order: body, screen, glass, island, buttons, cameras.
  const phoneBody = phone.group.children[0] as THREE.Mesh;
  const phoneIsland = phone.group.children[3] as THREE.Mesh;
  const phoneChrome: THREE.Mesh[] = [];
  phone.group.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    if (node === phone.screen || node === phone.glass || node === phoneBody || node === phoneIsland) return;
    phoneChrome.push(node);
  });
  const partMaterials = (nodes: THREE.Object3D[]) => {
    const entries: { material: THREE.Material; opacity: number }[] = [];
    for (const node of nodes) {
      if (!(node instanceof THREE.Mesh)) continue;
      for (const material of Array.isArray(node.material) ? node.material : [node.material])
        if (!entries.some((entry) => entry.material === material))
          entries.push({ material, opacity: material.opacity });
    }
    return entries;
  };
  const bodyMaterials = partMaterials([phoneBody]);
  const chromeMaterials = partMaterials(phoneChrome);
  const island = createFloorIsland(phoneIsland);
  device.add(island.root);
  const glassBase = (phone.glass.material as THREE.Material).opacity;

  const canvasImage = (w = FLOOR_APP_CANVAS.w, h = FLOOR_APP_CANVAS.h) => {
    const image = document.createElement("canvas");
    image.width = w;
    image.height = h;
    return { image, ctx: image.getContext("2d")! };
  };

  // More screens share the glass silhouette and pointer tilt, each opening
  // out of a button. The machine's screen draws over the landed models, so
  // its card covers their thumbnails and the scrim dims them with the list.
  const exercise = canvasImage();
  let machinePoster: HTMLImageElement | null = null;
  const paintExercises = () => drawFloorExerciseScreen(
    exercise.ctx, exercise.image.width, exercise.image.height, copy, machinePoster,
  );
  paintExercises();
  const exerciseTexture = createAppTexture(exercise.image, anisotropy);
  // The machine link paints no face of its own: the list's label shows through.
  const noFace = createAppTexture(canvasImage(1, 1).image, 1);
  const exerciseCard = createOpenCard(phone.screen, {
    map: exerciseTexture,
    sprite: noFace,
    tint: APP_LIME,
    overModels: true,
  });
  device.add(exerciseCard.mesh);
  let viewButton = floorViewButton(appCtx, appImage.width, appImage.height, 0, copy.view);

  // The AI workout, then the coach's routine on the same card. Its machines
  // are the floor's own models, so this card draws under them.
  const plan = canvasImage();
  const coach = canvasImage();
  const planLanded = floorEquipment.map(() => false);
  const coachLanded = floorEquipment.map(() => false);
  let publishState: FloorPublishState = "idle";
  const paintPlan = () => drawFloorPlanScreen(plan.ctx, plan.image.width, plan.image.height, copy, planLanded);
  const paintCoach = () =>
    drawFloorCoachScreen(coach.ctx, coach.image.width, coach.image.height, copy, coachLanded, publishState);
  paintPlan();
  paintCoach();
  const planTexture = createAppTexture(plan.image, anisotropy);
  const coachTexture = createAppTexture(coach.image, anisotropy);
  let offerButton = floorOfferButton(appCtx, appImage.width, copy.plan.offer);
  // As wide as the screen, so a longer label in another locale still fits.
  const offer = canvasImage(FLOOR_APP_CANVAS.w, offerButton.h);
  const offerTexture = createAppTexture(offer.image, anisotropy);
  // Pressing darkens the lime pill instead of lighting it.
  const planCard = createOpenCard(phone.screen, {
    map: planTexture,
    next: coachTexture,
    sprite: offerTexture,
    tint: APP_INK,
    overModels: false,
  });
  device.add(planCard.mesh);
  const paintOffer = () => {
    offerButton = floorOfferButton(appCtx, appImage.width, copy.plan.offer);
    drawFloorOffer(offer.ctx, offerButton, copy.plan.offer);
    planCard.uniforms.uOpenFaceUv.value.set(offerButton.w / offer.image.width, 1);
    offerTexture.needsUpdate = true;
  };
  paintOffer();

  const shadow = createContactShadowTexture();
  const reveals = floorEquipment.map(() => ({ value: 0 }));
  const models: THREE.Group[] = [];
  const modelCenters: THREE.Vector3[] = [];
  const modelTops: number[] = [];
  const modelContacts: THREE.Mesh[] = [];
  const decoder = new DRACOLoader().setDecoderPath("/draco/");
  const loader = new GLTFLoader().setDRACOLoader(decoder);
  let disposed = false;
  let width = 1;
  let height = 1;
  let spawnSeconds = 0;
  let tiltX = 0;
  let tiltZ = 0;

  const posterReady = new Promise<void>((resolve) => {
    const image = new Image();
    image.onload = () => {
      if (!disposed) machinePoster = image;
      resolve();
    };
    image.onerror = () => resolve();
    image.src = floorEquipment[0]!.poster;
  });

  const equipmentReady = Promise.all(
    floorEquipment.map(async (item, index) => {
      const { scene: object } = await loader.loadAsync(item.model);
      if (disposed) {
        disposeTree(object);
        return;
      }
      const bounds = new THREE.Box3().setFromObject(object);
      const center = bounds.getCenter(new THREE.Vector3());
      const size = bounds.getSize(new THREE.Vector3());
      const scale = item.span / Math.max(size.x, size.y, size.z);
      object.scale.setScalar(scale);
      object.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);
      object.traverse((node) => {
        if (!(node instanceof THREE.Mesh)) return;
        for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
          const m = material as THREE.MeshStandardMaterial;
          m.envMapIntensity = 1.15;
          m.roughness = Math.max(0.42, m.roughness);
          m.metalness = Math.min(0.45, m.metalness);
          m.onBeforeCompile = (shader) => {
            shader.uniforms.uReveal = reveals[index];
            shader.vertexShader = "varying float vHeight;\n" + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
              "#include <project_vertex>",
              "#include <project_vertex>\nvHeight=(modelMatrix*vec4(transformed,1.)).y;",
            );
            shader.fragmentShader = "varying float vHeight;uniform float uReveal;\n" + shader.fragmentShader;
            // A lime scan line climbs the machine; nothing above it exists yet.
            shader.fragmentShader = shader.fragmentShader.replace(
              "#include <dithering_fragment>",
              "#include <dithering_fragment>\nif(vHeight>uReveal)discard;float band=1.-smoothstep(.0,.06,uReveal-vHeight);gl_FragColor.rgb=mix(gl_FragColor.rgb,vec3(.8,1.,0.),band*.85);",
            );
          };
          // uReveal differs per machine, but the injected GLSL does not.
          m.customProgramCacheKey = () => "floor-spawn-v2";
        }
      });
      const placed = new THREE.Box3().setFromObject(object);
      modelCenters[index] = placed.getCenter(new THREE.Vector3());
      modelTops[index] = placed.max.y;
      const rig = new THREE.Group();
      rig.add(object);
      const contact = new THREE.Mesh(
        new THREE.PlaneGeometry(2.7, 2.7),
        new THREE.MeshBasicMaterial({ map: shadow, transparent: true, opacity: 0.7, depthWrite: false }),
      );
      contact.rotation.x = -Math.PI / 2;
      contact.position.y = 0.002;
      rig.add(contact);
      models[index] = rig;
      modelContacts[index] = contact;
      tilt.add(rig);
    }),
  ).finally(() => decoder.dispose());

  let prewarmTask: Promise<void> | null = null;
  async function prewarm() {
    if (disposed) return;
    const warmTarget = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: true, stencilBuffer: false });
    const previousTarget = renderer.getRenderTarget();
    const visibility = [
      surface.mesh,
      phone.group,
      title.root,
      island.root,
      exerciseCard.mesh,
      planCard.mesh,
      ...models,
    ].map((object) => ({
      object,
      visible: object.visible,
    }));
    const fading = [
      { material: screenMaterial, opacity: 1 },
      { material: phone.glass.material as THREE.Material, opacity: glassBase },
      ...bodyMaterials,
      ...chromeMaterials,
    ].map(({ material, opacity: base }) => ({
      material,
      base,
      opacity: material.opacity,
      transparent: material.transparent,
      depthWrite: material.depthWrite,
    }));
    const culling: { mesh: THREE.Mesh; frustumCulled: boolean }[] = [];
    scene.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;
      culling.push({ mesh: node, frustumCulled: node.frustumCulled });
      // The camera has not entered the choreography yet; upload everything.
      node.frustumCulled = false;
    });
    const compileAndUpload = async () => {
      // Give input and paint a task boundary between material states.
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
      if (disposed) return false;
      // The canvas target first: offscreen programs skip tone mapping.
      renderer.setRenderTarget(null);
      await renderer.compileAsync(scene, camera);
      if (disposed) return false;
      renderer.setRenderTarget(warmTarget);
      await renderer.compileAsync(scene, camera);
      if (disposed) return false;
      renderer.render(scene, camera);
      return true;
    };
    try {
      for (const { object } of visibility) object.visible = true;
      if (!(await compileAndUpload())) return;
      // Every phone material passes through a partial fade during the morph.
      for (const entry of fading) fadeMaterial(entry.material, entry.base, 0.5);
      if (!(await compileAndUpload())) return;
      for (const entry of fading) fadeMaterial(entry.material, entry.base, 1);
      if (!(await compileAndUpload())) return;
    } finally {
      for (const entry of fading) {
        entry.material.opacity = entry.opacity;
        if (entry.material.transparent !== entry.transparent) {
          entry.material.transparent = entry.transparent;
          entry.material.needsUpdate = true;
        }
        entry.material.depthWrite = entry.depthWrite;
      }
      for (const { object, visible } of visibility) object.visible = visible;
      for (const { mesh, frustumCulled } of culling) mesh.frustumCulled = frustumCulled;
      if (!disposed) renderer.setRenderTarget(previousTarget);
      warmTarget.dispose();
    }
    if (!disposed) {
      // Rebind each material to the program of its restored initial state.
      renderer.setRenderTarget(null);
      await renderer.compileAsync(scene, camera);
      if (!disposed) renderer.setRenderTarget(previousTarget);
    }
  }

  /** Every painted screen and measured button, after fonts or copy change. */
  function repaintAll() {
    title.paint(copy.title);
    names = layoutNames();
    viewButton = floorViewButton(appCtx, appImage.width, appImage.height, 0, copy.view);
    paintExercises();
    exerciseTexture.needsUpdate = true;
    paintApp();
    appTexture.needsUpdate = true;
    paintPlan();
    planTexture.needsUpdate = true;
    paintCoach();
    coachTexture.needsUpdate = true;
    paintOffer();
  }

  const ready = Promise.all([
    equipmentReady,
    posterReady,
    // With the copy as sample text, so a caron's subset is in before layout.
    document.fonts.load("600 32px Inter", sampleText(copy)),
    document.fonts.load("650 57px Inter"),
    document.fonts.load('600 18px "JetBrains Mono"'),
  ]).then(async () => {
    if (disposed) return;
    repaintAll();
    prewarmTask = prewarm();
    await prewarmTask;
  });

  const projected = new THREE.Vector3();
  const lifted = new THREE.Vector3();
  const thumbCenter = new THREE.Vector3();
  const tags: FloorTagPoint[] = floorEquipment.map(() => ({
    x: 0,
    y: 0,
    scale: 1,
    alpha: 0,
    leader: 1,
    mix: 0,
    nameX: 0,
    nameY: 0,
    nameScale: 1,
    pill: 1,
  }));
  const result = { tags, spawning: false, tilting: false };

  function toScreen(v: THREE.Vector3) {
    v.project(camera);
    return { x: (v.x * 0.5 + 0.5) * width, y: (-v.y * 0.5 + 0.5) * height };
  }

  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    const native = devicePixelRatio > 0 ? devicePixelRatio : 1;
    const cap = width <= 760 ? experienceDprCap(true, width, height) : 1.5;
    renderer.setPixelRatio(Math.min(native, cap));
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(1, height);
    camera.updateProjectionMatrix();
  }
  resize();

  /**
   * Render one frame at section `progress`. `active` is whether the floor is
   * on screen enough for the scan to run; `dt` drives the scan and the
   * pointer lean only.
   */
  function draw(progress: number, entry: number, active: boolean, dt: number, pointer: FloorPointer) {
    // Everything below runs on film time.
    const film = floorFilm(progress);
    const { morph } = floorAt(film);
    const beats = floorMorphBeats(morph);
    const frames = floorFrames(width, height);
    const opening = floorOpenAt(film);
    exerciseCard.mesh.visible = opening.press > 0;
    if (exerciseCard.mesh.visible)
      exerciseCard.set(floorOpenFrame(viewButton, opening.press, opening.expand));
    const planning = floorPlanAt(film);
    planCard.mesh.visible = planning.offer > 0;
    if (planCard.mesh.visible) {
      planCard.set(floorOfferFrame(offerButton, planning.offer, planning.press, planning.expand));
      planCard.uniforms.uOpenSwap.value = planning.swap;
    }
    const settled = floorPlanLanded(film);
    const publish: FloorPublishState = planning.published ? "live" : planning.publishing ? "pressed" : "idle";
    if (settled.plan.some((value, i) => value !== planLanded[i])) {
      settled.plan.forEach((value, i) => (planLanded[i] = value));
      paintPlan();
      planTexture.needsUpdate = true;
    }
    if (publish !== publishState || settled.coach.some((value, i) => value !== coachLanded[i])) {
      settled.coach.forEach((value, i) => (coachLanded[i] = value));
      publishState = publish;
      paintCoach();
      coachTexture.needsUpdate = true;
    }

    // Surface: rubber tiles → dark glass, contracting into the phone outline.
    const rect = floorMorphRect(morph);
    surface.half.value.set(rect.w / 2 / FLOOR_PHONE_SCALE, rect.d / 2 / FLOOR_PHONE_SCALE);
    surface.radius.value = floorCornerRadius(morph) / FLOOR_PHONE_SCALE;
    surface.mesh.position.z = lerp(0, PHONE_SCREEN_Z + 0.001, beats.shape);
    surface.material.color.copy(RUBBER).lerp(APP_INK, beats.ink);
    // Specular from the lights and ceiling would keep a grey sheen on it.
    surface.material.envMapIntensity = lerp(1, 0, beats.ink);
    surface.material.specularIntensity = lerp(1, 0, beats.ink);
    surface.material.opacity = 1 - beats.screen;
    surface.mesh.visible = beats.screen < 0.999;
    seams.update(morph, 1);
    seams.mesh.position.z = surface.mesh.position.z + 0.002;
    island.update(morph);
    title.update(film);

    phone.group.visible = beats.screen > 0.001 || beats.device > 0.001;
    fadeMaterial(screenMaterial, 1, beats.screen);
    fadeMaterial(phone.glass.material as THREE.Material, glassBase, beats.screen);
    for (const entry of bodyMaterials) fadeMaterial(entry.material, entry.opacity, beats.device);
    for (const entry of chromeMaterials) fadeMaterial(entry.material, entry.opacity, beats.device);
    down.intensity = lerp(0, 0.9, beats.shape) + 1.6 * beats.device;
    phoneKey.intensity = 1.5 * beats.device;

    // The scan runs on time once the floor is in view; past the morph's
    // start there is nothing left to watch, so it is simply complete.
    if (morph > 0.12) spawnSeconds = 8;
    else if (active) spawnSeconds += dt;
    result.spawning = active && !floorSpawnDone(spawnSeconds);

    const cam = floorCameraAt(film, entry, width, height);
    camera.position.set(cam.x, cam.y, cam.z);
    // Screen-local +Y maps to world -Z: keep the app upright overhead.
    camera.up.set(0, 1 - cam.overhead, -cam.overhead).normalize();
    camera.lookAt(0, cam.targetY, 0);
    camera.setViewOffset(width, height, cam.offsetX, cam.offsetY, width, height);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();

    // The finished phone leans toward the pointer, like every pinned device.
    const tiltMix = frames.compact ? 0 : beats.device;
    let aimX = 0;
    let aimY = 0;
    if (pointer.hasPointer && tiltMix > 0) {
      const box = canvas.getBoundingClientRect();
      const toward = pointerTowardBox(pointer.clientX, pointer.clientY, box.left, box.top, frames.phone);
      aimX = toward.mx;
      aimY = toward.my;
    }
    const lean = overheadPointerTilt(aimX, aimY);
    const nextX = damp(tiltX, lean.rotX * tiltMix, HERO_PHONE_TILT_LERP, dt);
    const nextZ = damp(tiltZ, lean.rotZ * tiltMix, HERO_PHONE_TILT_LERP, dt);
    result.tilting = Math.abs(nextX - lean.rotX * tiltMix) > 1e-4 || Math.abs(nextZ - lean.rotZ * tiltMix) > 1e-4;
    tiltX = nextX;
    tiltZ = nextZ;
    tilt.rotation.set(tiltX, 0, tiltZ);
    tilt.updateMatrixWorld();
    phoneKey.position.set(
      HERO_PHONE_KEY_LIGHT.x + aimX * HERO_PHONE_KEY_LIGHT.xGain * tiltMix,
      HERO_PHONE_KEY_LIGHT.y - aimY * tiltMix,
      HERO_PHONE_KEY_LIGHT.z,
    );

    let repaint = false;
    for (let i = 0; i < floorEquipment.length; i++) {
      const landed = floorLabelLanded(film, i);
      if (landed !== paintedLabels[i]) {
        paintedLabels[i] = landed;
        repaint = true;
      }
    }
    const landedTitle = floorTitleLanded(film);
    if (repaint || landedTitle !== paintedTitle) {
      paintedTitle = landedTitle;
      paintApp();
      appTexture.needsUpdate = true;
    }

    for (let i = 0; i < floorEquipment.length; i++) {
      const rig = models[i];
      if (!rig) continue;
      const placed = floorMachinePoseAt(film, i);
      const ordered = floorOrderAt(film, i);
      const spawn = floorSpawnAt(spawnSeconds, i);
      const grow = spawn.amount;
      reveals[i]!.value = spawn.height;
      rig.visible = grow > 0.02;
      rig.position.set(placed.x, placed.y - (1 - grow) * 0.45 * (1 - ordered), placed.z);
      rig.scale.setScalar(placed.scale * Math.max(0.001, grow));
      rig.rotation.set(placed.rotX, placed.rotation, 0);
      // Floor exports stand on their feet; centre their silhouettes in the wells.
      thumbCenter.copy(modelCenters[i]!).applyEuler(rig.rotation).multiplyScalar(placed.scale * ordered);
      rig.position.x -= thumbCenter.x;
      rig.position.z -= thumbCenter.z;
      const contact = modelContacts[i]!;
      contact.visible = ordered < 0.85 && grow > 0.08;
      (contact.material as THREE.MeshBasicMaterial).opacity = 0.7 * (1 - ordered) * grow;
      rig.updateMatrixWorld();

      // The tag floats over the machine's top, then flies to its index slot.
      lifted.set(0, modelTops[i]!, 0).applyMatrix4(rig.matrixWorld);
      const from = toScreen(lifted);
      const slot = floorAppNumberWorld(i);
      projected.set(slot.x, slot.y, slot.z).applyMatrix4(tilt.matrixWorld);
      const to = toScreen(projected);
      lifted.set(slot.x, slot.y, slot.z - slot.h / 2).applyMatrix4(tilt.matrixWorld);
      const top = toScreen(lifted);
      const slotH = Math.hypot(to.x - top.x, to.y - top.y) * 2;
      // The name rides from beside the badge onto its row's first baseline.
      const name = floorAppNameWorld(i, names[i]!.lines.length);
      projected.set(name.x, name.y, name.z).applyMatrix4(tilt.matrixWorld);
      const nameTo = toScreen(projected);
      lifted.set(name.x, name.y, name.z - name.size).applyMatrix4(tilt.matrixWorld);
      const nameTop = toScreen(lifted);
      const nameH = Math.hypot(nameTo.x - nameTop.x, nameTo.y - nameTop.y);
      const label = floorLabelAt(film, i, grow);
      const t = label.travel;
      const tag = tags[i]!;
      tag.x = lerp(from.x, to.x, t);
      tag.y = lerp(from.y - TAG_LIFT, to.y, t);
      tag.scale = lerp(1, Math.max(0.35, slotH / FLOOR_TAG_FONT), t);
      tag.alpha = label.alpha;
      tag.leader = label.leader;
      tag.mix = t;
      tag.nameX = lerp(from.x, nameTo.x, t);
      tag.nameY = lerp(from.y - TAG_LIFT, nameTo.y, t);
      tag.nameScale = lerp(
        frames.compact ? FLOOR_NAME_COMPACT : 1,
        Math.max(0.35, nameH / FLOOR_NAME_FONT),
        t,
      );
      tag.pill = label.pill;
    }

    renderer.render(scene, camera);
    return result;
  }

  function releaseResources() {
    decoder.dispose();
    environment.dispose();
    shadow.dispose();
    floorMaps.dispose();
    appTexture.dispose();
    exerciseTexture.dispose();
    noFace.dispose();
    planTexture.dispose();
    coachTexture.dispose();
    offerTexture.dispose();
    title.dispose();
    disposeTree(scene);
    renderer.dispose();
  }

  return {
    ready,
    resize,
    draw,
    /** How the app sets each machine's name; the floor tags follow it. */
    nameLayout() {
      return names;
    },
    /** Play the scan again the next time the floor comes into view. */
    rescan() {
      spawnSeconds = 0;
    },
    setCopy(next: FloorAppCopy) {
      copy = next;
      repaintAll();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      // compileAsync polls programs; deleting them mid-poll throws outside the
      // promise. Release after an in-flight warmup instead.
      if (prewarmTask) void prewarmTask.then(releaseResources, releaseResources);
      else releaseResources();
    },
  };
}

export type FloorStage = ReturnType<typeof createFloorStage>;
