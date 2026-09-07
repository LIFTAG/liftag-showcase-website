import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { createPhoneModel, PHONE_SCREEN_Z } from "../phoneModel";
import { drawDiscoveryAppScreen } from "./discoveryAppScreen";
import { createDiscoverySeams } from "./discoverySeams";
import { createDiscoveryIsland } from "./discoveryIsland";
import { discoveryEquipment } from "./discoveryEquipment";
import {
  createGymEnvironment,
  createFloorMaps,
  createContactShadowTexture,
} from "./environment";
import { createDiscoveryGlobe } from "./discoveryGlobe";
import {
  DISCOVERY_CAM_FOV,
  DISCOVERY_MORPH_START,
  DISCOVERY_PHONE_SCALE,
  DISCOVERY_PHONE_ROT_X,
  discoveryAt,
  discoveryCameraPose,
  discoveryCornerRadius,
  discoveryMachinePoseAt,
  discoveryMorphBeats,
  discoveryMorphRect,
  equipmentOrderAt,
} from "./discoveryTimeline";
import {
  HERO_PHONE_KEY_LIGHT,
  HERO_PHONE_TILT_LERP,
  heroPointerTilt,
} from "./handoff";
import { disposeTree } from "./dispose";
import { damp, lerp, smoothstep } from "./timeline";

function fadeMaterial(
  material: THREE.Material,
  base: number,
  amount: number,
) {
  const opacity = base * amount;
  material.opacity = opacity;
  material.transparent = opacity < 0.999 || base < 0.999;
  material.depthWrite = opacity > 0.95 && base > 0.95;
}

function createRoundedPlate(span: number, key: string) {
  const half = { value: new THREE.Vector2(span / 2, span / 2) };
  const radius = { value: 0 };
  const geometry = new THREE.PlaneGeometry(span, span);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x080b09,
    metalness: 0,
    roughness: 0.95,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uHalf = half;
    shader.uniforms.uRadius = radius;
    shader.vertexShader = "varying vec2 vClip;\n" + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      "#include <begin_vertex>\nvClip=position.xy;",
    );
    shader.fragmentShader =
      "varying vec2 vClip;uniform vec2 uHalf;uniform float uRadius;\n" +
      shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <dithering_fragment>",
      `#include <dithering_fragment>
       vec2 q=abs(vClip)-uHalf+vec2(uRadius);
       float dist=length(max(q,0.))+min(max(q.x,q.y),0.)-uRadius;
       float aa=max(fwidth(dist),8e-4);
       if(dist>aa)discard;
       gl_FragColor.a*=1.-smoothstep(0.,aa,dist);`,
    );
  };
  material.customProgramCacheKey = () => key;
  const mesh = new THREE.Mesh(geometry, material);
  mesh.visible = false;
  return { mesh, material, half, radius };
}

/** Globe → gym floor → overhead inventory, all rendered by one lazy canvas. */
export function createDiscoveryStage(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(DISCOVERY_CAM_FOV, 1, 0.1, 50);
  const environment = createGymEnvironment(renderer, 64);
  scene.environment = environment.texture;
  const light = new THREE.DirectionalLight(0xe5efe8, 4.5);
  light.position.set(-3, 5, 6);
  const rim = new THREE.DirectionalLight(0xc8d9ed, 2.5);
  rim.position.set(3, 4, -3);
  const down = new THREE.DirectionalLight(0xf2fff0, 0);
  down.position.set(0, 8, 0);
  const phoneKey = new THREE.DirectionalLight(0xffffff, 0);
  phoneKey.position.set(
    HERO_PHONE_KEY_LIGHT.x,
    HERO_PHONE_KEY_LIGHT.y,
    HERO_PHONE_KEY_LIGHT.z,
  );
  scene.add(
    light,
    rim,
    down,
    phoneKey,
    new THREE.HemisphereLight(0xcadace, 0x18251b, 2.4),
  );
  const globe = createDiscoveryGlobe();
  scene.add(globe.root);
  const room = new THREE.Group();
  scene.add(room);
  const tilt = new THREE.Group();
  room.add(tilt);
  const device = new THREE.Group();
  device.scale.setScalar(DISCOVERY_PHONE_SCALE);
  device.rotation.x = DISCOVERY_PHONE_ROT_X;
  tilt.add(device);
  // One continuous surface, using the hero's rubber floor and ceiling reflections.
  const standIn = createRoundedPlate(8, "discovery-floor-screen-v3");
  const floorMaps = createFloorMaps(renderer.capabilities.getMaxAnisotropy(), 256, { seams: false });
  for (const texture of [floorMaps.map, floorMaps.roughnessMap, floorMaps.normalMap])
    texture.repeat.set(8 * DISCOVERY_PHONE_SCALE / 2, 8 * DISCOVERY_PHONE_SCALE / 2);
  standIn.material.color.set(0xb0b6bd);
  standIn.material.map = floorMaps.map;
  standIn.material.roughnessMap = floorMaps.roughnessMap;
  standIn.material.normalMap = floorMaps.normalMap;
  standIn.material.normalScale.set(0.12, 0.12);
  device.add(standIn.mesh);
  const seams = createDiscoverySeams();
  device.add(seams.mesh);
  const appImage = document.createElement("canvas");
  appImage.width = 720;
  appImage.height = 1520;
  const appCtx = appImage.getContext("2d")!;
  drawDiscoveryAppScreen(appCtx, appImage.width, appImage.height, { dividers: false });
  const appTexture = new THREE.CanvasTexture(appImage);
  appTexture.colorSpace = THREE.SRGBColorSpace;
  appTexture.generateMipmaps = false;
  appTexture.minFilter = THREE.LinearFilter;
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
    if (node === phone.screen || node === phone.glass || node === phoneBody || node === phoneIsland)
      return;
    phoneChrome.push(node);
  });
  const partMaterials = (nodes: THREE.Object3D[]) => {
    const entries: { material: THREE.Material; opacity: number }[] = [];
    for (const node of nodes) {
      if (!(node instanceof THREE.Mesh)) continue;
      for (const material of Array.isArray(node.material)
        ? node.material
        : [node.material])
        if (!entries.some((entry) => entry.material === material))
          entries.push({ material, opacity: material.opacity });
    }
    return entries;
  };
  const bodyMaterials = partMaterials([phoneBody]);
  const chromeMaterials = partMaterials(phoneChrome);
  const island = createDiscoveryIsland(phoneIsland);
  device.add(island.root);
  const glassBase = (phone.glass.material as THREE.Material).opacity;
  const shadow = createContactShadowTexture();
  const scan = { value: -1 };
  const models: THREE.Group[] = [];
  const modelCenters: THREE.Vector3[] = [];
  const decoder = new DRACOLoader().setDecoderPath("/draco/");
  const loader = new GLTFLoader().setDRACOLoader(decoder);
  let disposed = false,
    width = 1,
    height = 1,
    initialized = false;
  let tiltX = 0,
    tiltY = 0;
  const landReady = new THREE.ImageLoader()
    .loadAsync("/assets/gym3d/earth.webp")
    .then((image) => {
      if (disposed) return;
      globe.applyLand(image);
    });
  const equipmentReady = Promise.all([
    ...discoveryEquipment.map(async (item, index) => {
      const { scene: object } = await loader.loadAsync(item.model);
      if (disposed) {
        disposeTree(object);
        return;
      }
      const bounds = new THREE.Box3().setFromObject(object),
        center = bounds.getCenter(new THREE.Vector3()),
        size = bounds.getSize(new THREE.Vector3());
      const scale = item.span / Math.max(size.x, size.y, size.z);
      object.scale.setScalar(scale);
      object.position.set(
        -center.x * scale,
        -bounds.min.y * scale,
        -center.z * scale,
      );
      object.traverse((node) => {
        if (!(node instanceof THREE.Mesh)) return;
        for (const material of Array.isArray(node.material)
          ? node.material
          : [node.material]) {
          const m = material as THREE.MeshStandardMaterial;
          m.envMapIntensity = 1.1;
          m.roughness = Math.max(0.42, m.roughness);
          m.metalness = Math.min(0.45, m.metalness);
          m.onBeforeCompile = (shader) => {
            shader.uniforms.uReveal = scan;
            shader.vertexShader =
              "varying float vHeight;\n" + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
              "#include <project_vertex>",
              "#include <project_vertex>\nvHeight=(modelMatrix*vec4(transformed,1.)).y;",
            );
            shader.fragmentShader =
              "varying float vHeight;uniform float uReveal;\n" +
              shader.fragmentShader;
            shader.fragmentShader = shader.fragmentShader.replace(
              "#include <dithering_fragment>",
              "#include <dithering_fragment>\nif(vHeight>uReveal)discard;float band=1.-smoothstep(.01,.05,abs(vHeight-uReveal));gl_FragColor.rgb+=vec3(.65,.78,.9)*band;",
            );
          };
          m.customProgramCacheKey = () => "discovery-floor-v2";
        }
      });
      modelCenters[index] = new THREE.Box3().setFromObject(object).getCenter(new THREE.Vector3());
      const rig = new THREE.Group();
      rig.add(object);
      rig.position.set(item.x, 0, item.z);
      rig.rotation.y = item.rotation;
      const contact = new THREE.Mesh(
        new THREE.PlaneGeometry(2.7, 2.7),
        new THREE.MeshBasicMaterial({
          map: shadow,
          transparent: true,
          opacity: 0.65,
          depthWrite: false,
        }),
      );
      contact.rotation.x = -Math.PI / 2;
      contact.position.y = 0.002;
      contact.name = "contact";
      rig.add(contact);
      models[index] = rig;
      tilt.add(rig);
    }),
  ]).finally(() => decoder.dispose());
  const ready = Promise.all([
    landReady,
    equipmentReady,
    document.fonts.load('600 32px Inter'),
  ]).then(() => {
    if (disposed) return;
    drawDiscoveryAppScreen(appCtx, appImage.width, appImage.height, { dividers: false });
    appTexture.needsUpdate = true;
  });
  const cameraTarget = new THREE.Vector3(),
    lookTarget = new THREE.Vector3(),
    look = new THREE.Vector3();
  const projected = new THREE.Vector3();
  const thumbCenter = new THREE.Vector3();
  const points = discoveryEquipment.map(() => ({
    x: 0,
    y: 0,
    alpha: 0,
  }));
  const result = { x: 0, y: 0, visible: false, equipment: points };
  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(1, height);
    camera.updateProjectionMatrix();
  }
  resize();
  function draw(
    progress: number,
    assemblySeconds: number,
    dt: number,
    input: { mx: number; my: number; hasPointer: boolean } = {
      mx: 0,
      my: 0,
      hasPointer: false,
    },
  ) {
    const frame = discoveryAt(progress),
      compact = width < 760,
      ease = 1 - Math.exp(-dt * 10);
    const beats = discoveryMorphBeats(frame.morph);
    globe.root.visible = frame.floor < 0.995;
    globe.update(assemblySeconds, 1 - frame.listing * 0.6);
    globe.root.scale.setScalar(
      lerp(1, 0.62, frame.listing) * (1 - frame.floor * 0.99),
    );
    globe.root.position.set(0, -frame.listing * 0.5, 0);
    room.visible = frame.floor > 0.001;
    const dest = discoveryMorphRect(frame.morph);
    const corner = discoveryCornerRadius(frame.morph);
    standIn.half.value.set(
      dest.w / 2 / DISCOVERY_PHONE_SCALE,
      dest.d / 2 / DISCOVERY_PHONE_SCALE,
    );
    standIn.radius.value = corner / DISCOVERY_PHONE_SCALE;
    standIn.mesh.position.z = lerp(0, PHONE_SCREEN_Z + 0.001, beats.shape);
    standIn.material.opacity = frame.floor * (1 - beats.screen);
    standIn.mesh.visible = frame.floor > 0.001 && beats.screen < 0.999;
    seams.update(frame.morph, frame.floor);
    seams.mesh.position.z = standIn.mesh.position.z + 0.002;
    island.update(frame.morph);
    const screenFade = beats.screen;
    const bodyFade = beats.device;
    const chromeFade = bodyFade;
    phone.group.visible = screenFade > 0.001 || bodyFade > 0.001;
    fadeMaterial(screenMaterial, 1, screenFade);
    fadeMaterial(phone.glass.material as THREE.Material, glassBase, screenFade);
    for (const entry of bodyMaterials)
      fadeMaterial(entry.material, entry.opacity, bodyFade);
    for (const entry of chromeMaterials)
      fadeMaterial(entry.material, entry.opacity, chromeFade);
    down.intensity = lerp(0, 0.7, beats.shape) + 0.9 * beats.device;
    phoneKey.intensity = 1.5 * bodyFade;
    const pointer = input.hasPointer ? heroPointerTilt(input.mx, input.my) : { rotX: 0, rotY: 0 };
    const tiltMix = compact ? 0 : beats.layout * 0.35;
    tiltX = damp(tiltX, pointer.rotX * tiltMix, HERO_PHONE_TILT_LERP, dt);
    tiltY = damp(tiltY, pointer.rotY * tiltMix, HERO_PHONE_TILT_LERP, dt);
    tilt.rotation.set(tiltX, tiltY, 0);
    phoneKey.position.set(
      HERO_PHONE_KEY_LIGHT.x + (input.hasPointer ? input.mx * HERO_PHONE_KEY_LIGHT.xGain * tiltMix : 0),
      HERO_PHONE_KEY_LIGHT.y - (input.hasPointer ? input.my * tiltMix : 0),
      HERO_PHONE_KEY_LIGHT.z,
    );
    scan.value = frame.floor * 3.4;
    const pose = discoveryCameraPose(progress, compact, width, height);
    cameraTarget.set(pose.x, pose.y, pose.z);
    lookTarget.set(pose.lookX, pose.lookY, pose.lookZ);
    if (!initialized) {
      camera.position.copy(cameraTarget);
      look.copy(lookTarget);
      initialized = true;
    }
    camera.position.lerp(cameraTarget, ease);
    look.lerp(lookTarget, ease);
    // Screen-local +Y maps to world -Z: preserve an upright, readable app.
    camera.up.set(0, 1 - frame.overhead, -frame.overhead).normalize();
    camera.lookAt(look);
    const shift = compact ? 0 : lerp(-0.18, -0.1, frame.morph);
    camera.setViewOffset(
      width,
      height,
      width * shift,
      compact ? -lerp(height * 0.075, 45, frame.morph) : 0,
      width,
      height,
    );
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    for (let i = 0; i < discoveryEquipment.length; i++) {
      const rig = models[i];
      if (!rig) continue;
      const placed = discoveryMachinePoseAt(progress, i);
      const ordered = equipmentOrderAt(progress, i);
      rig.position.set(placed.x, placed.y, placed.z);
      rig.scale.setScalar(placed.scale);
      rig.rotation.set(placed.rotX, placed.rotation, 0);
      // Floor exports stand on their feet. Center their silhouette in the app wells.
      thumbCenter.copy(modelCenters[i]!).applyEuler(rig.rotation).multiplyScalar(placed.scale * ordered);
      rig.position.x -= thumbCenter.x;
      rig.position.z -= thumbCenter.z;
      const contact = rig.getObjectByName("contact") as THREE.Mesh | undefined;
      if (contact) {
        contact.visible = ordered < 0.85;
        const mat = contact.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.65 * (1 - ordered);
      }
      rig.updateMatrixWorld();
      projected.set(0, 0, 0).applyMatrix4(rig.matrixWorld).project(camera);
      const point = points[i]!;
      point.x = (projected.x * 0.5 + 0.5) * width - 32;
      point.y = (-projected.y * 0.5 + 0.5) * height - 22;
      point.alpha =
        smoothstep((progress - 0.59 - i * 0.014) / 0.065) *
        (1 - smoothstep(frame.morph / 0.24));
    }
    renderer.toneMappingExposure = lerp(1.05, 1.65, frame.floor);
    renderer.render(scene, camera);
    globe.pin.getWorldPosition(projected);
    projected.project(camera);
    result.x = (projected.x * 0.5 + 0.5) * width;
    result.y = (-projected.y * 0.5 + 0.5) * height;
    result.visible = assemblySeconds >= 2.8 && progress < 0.27;
    return result;
  }
  return {
    ready,
    resize,
    draw,
    dispose() {
      disposed = true;
      decoder.dispose();
      environment.dispose();
      shadow.dispose();
      floorMaps.dispose();
      appTexture.dispose();
      disposeTree(scene);
      renderer.dispose();
    },
  };
}

export { DISCOVERY_MORPH_START };
