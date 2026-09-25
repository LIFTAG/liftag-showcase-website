import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { createPhoneModel, PHONE_SCREEN_Z } from "../phoneModel";
import { drawFloorAppScreen, drawFloorExerciseScreen, type FloorAppCopy } from "./floorAppScreen";
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
  FLOOR_CAM_FOV,
  FLOOR_PHONE_ROT_X,
  FLOOR_PHONE_SCALE,
  floorAppNumberWorld,
  floorAt,
  floorCameraAt,
  floorCornerRadius,
  floorFrames,
  floorExercisesAt,
  floorLabelAt,
  floorLabelsLanded,
  floorMachinePoseAt,
  floorMorphBeats,
  floorMorphRect,
  floorOrderAt,
  floorSpawnAt,
  floorSpawnDone,
  floorTitleLanded,
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
/** Tags float this far above the top of their machine, CSS pixels. */
const TAG_LIFT = 30;
/** Rubber under the ceiling strips → the app's own background. */
const RUBBER = new THREE.Color(0x8d959b);
const APP_INK = new THREE.Color(0x0e1210);

export type FloorPointer = {
  hasPointer: boolean;
  clientX: number;
  clientY: number;
};

export type FloorTagPoint = {
  x: number;
  y: number;
  scale: number;
  alpha: number;
  name: number;
  mix: number;
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
  let paintedNumbers = false;
  let paintedTitle = false;
  const paintApp = () =>
    drawFloorAppScreen(appCtx, appImage.width, appImage.height, {
      numbers: paintedNumbers,
      title: paintedTitle,
      copy,
    });
  paintApp();
  const appTexture = new THREE.CanvasTexture(appImage);
  appTexture.colorSpace = THREE.SRGBColorSpace;
  appTexture.generateMipmaps = false;
  appTexture.minFilter = THREE.LinearFilter;
  appTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
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

  // A second screen shares the glass silhouette and pointer tilt. Draw it
  // after the landed models, so their thumbnails dissolve with the list.
  const exerciseImage = document.createElement("canvas");
  exerciseImage.width = FLOOR_APP_CANVAS.w;
  exerciseImage.height = FLOOR_APP_CANVAS.h;
  const exerciseCtx = exerciseImage.getContext("2d")!;
  let machinePoster: HTMLImageElement | null = null;
  const paintExercises = () => drawFloorExerciseScreen(
    exerciseCtx, exerciseImage.width, exerciseImage.height, copy, machinePoster,
  );
  paintExercises();
  const exerciseTexture = new THREE.CanvasTexture(exerciseImage);
  exerciseTexture.colorSpace = THREE.SRGBColorSpace;
  exerciseTexture.generateMipmaps = false;
  exerciseTexture.minFilter = THREE.LinearFilter;
  exerciseTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const exerciseMaterial = new THREE.MeshBasicMaterial({
    map: exerciseTexture,
    toneMapped: false,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    opacity: 0,
  });
  const exerciseScreen = new THREE.Mesh(phone.screen.geometry.clone(), exerciseMaterial);
  exerciseScreen.position.copy(phone.screen.position);
  exerciseScreen.renderOrder = 2; // The Dynamic Island remains above both screens.
  exerciseScreen.visible = false;
  device.add(exerciseScreen);

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
    const visibility = [surface.mesh, phone.group, title.root, island.root, exerciseScreen, ...models].map((object) => ({
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

  const ready = Promise.all([
    equipmentReady,
    posterReady,
    document.fonts.load("600 32px Inter"),
    document.fonts.load("650 57px Inter"),
    document.fonts.load('600 18px "JetBrains Mono"'),
  ]).then(async () => {
    if (disposed) return;
    title.paint(copy.title);
    paintExercises();
    exerciseTexture.needsUpdate = true;
    paintApp();
    appTexture.needsUpdate = true;
    prewarmTask = prewarm();
    await prewarmTask;
  });

  const projected = new THREE.Vector3();
  const lifted = new THREE.Vector3();
  const thumbCenter = new THREE.Vector3();
  const tags: FloorTagPoint[] = floorEquipment.map(() => ({ x: 0, y: 0, scale: 1, alpha: 0, name: 1, mix: 0 }));
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
   * Render one frame. `active` is whether the floor is on screen enough for
   * the scan to run; `dt` drives the scan and the pointer lean only.
   */
  function draw(progress: number, entry: number, active: boolean, dt: number, pointer: FloorPointer) {
    const { morph } = floorAt(progress);
    const beats = floorMorphBeats(morph);
    const frames = floorFrames(width, height);
    const exercises = floorExercisesAt(progress);
    exerciseScreen.visible = exercises > 0;
    exerciseMaterial.opacity = exercises;

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
    title.update(progress);

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

    const cam = floorCameraAt(progress, entry, width, height);
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

    const landed = floorLabelsLanded(progress);
    const landedTitle = floorTitleLanded(progress);
    if (landed !== paintedNumbers || landedTitle !== paintedTitle) {
      paintedNumbers = landed;
      paintedTitle = landedTitle;
      paintApp();
      appTexture.needsUpdate = true;
    }

    for (let i = 0; i < floorEquipment.length; i++) {
      const rig = models[i];
      if (!rig) continue;
      const placed = floorMachinePoseAt(progress, i);
      const ordered = floorOrderAt(progress, i);
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
      const label = floorLabelAt(progress, i, grow);
      const t = label.travel;
      const tag = tags[i]!;
      tag.x = lerp(from.x, to.x, t);
      tag.y = lerp(from.y - TAG_LIFT, to.y, t);
      tag.scale = lerp(1, Math.max(0.35, slotH / FLOOR_TAG_FONT), t);
      tag.alpha = label.alpha;
      tag.name = label.name;
      tag.mix = t;
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
    title.dispose();
    disposeTree(scene);
    renderer.dispose();
  }

  return {
    ready,
    resize,
    draw,
    /** Play the scan again the next time the floor comes into view. */
    rescan() {
      spawnSeconds = 0;
    },
    setCopy(next: FloorAppCopy) {
      copy = next;
      title.paint(copy.title);
      paintExercises();
      exerciseTexture.needsUpdate = true;
      paintApp();
      appTexture.needsUpdate = true;
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
