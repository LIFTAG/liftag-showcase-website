import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { createPhoneModel, PHONE_SCREEN_Z } from "../phoneModel";
import { drawDiscoveryAppScreen } from "./discoveryAppScreen";
import { createDiscoverySeams } from "./discoverySeams";
import { createDiscoveryIsland } from "./discoveryIsland";
import { createDiscoveryTitle } from "./discoveryTitle";
import { discoveryEquipment } from "./discoveryEquipment";
import {
  GYM_ENV_SIZE,
  createGymEnvironment,
  createFloorMaps,
  createContactShadowTexture,
} from "./environment";
import { discoveryPixelRatio } from "./journey";
import { createDiscoveryGlobe, GLOBE_RADIUS, latLngToGlobe } from "./discoveryGlobe";
import {
  discoveryMapLocations,
  discoveryCountryLabels,
  discoveryHubLocationIndex,
} from "./discoveryMapLocations";
import {
  DISCOVERY_APP_CANVAS,
  DISCOVERY_CAM_FOV,
  DISCOVERY_GLOBE_BADGE,
  DISCOVERY_LABEL_FLOOR_OFFSET,
  DISCOVERY_LABEL_FONT,
  DISCOVERY_MORPH_START,
  DISCOVERY_PHONE_SCALE,
  DISCOVERY_PHONE_ROT_X,
  discoveryAppNumberWorld,
  discoveryAt,
  discoveryCameraPose,
  discoveryCornerRadius,
  discoveryLabelAt,
  discoveryLabelsLanded,
  discoveryMachinePoseAt,
  discoveryMachineSpawnAt,
  discoveryMorphBeats,
  discoveryMorphRect,
  discoveryPhoneBodyRect,
  discoveryScreenWorldY,
  discoverySpawnDone,
  discoveryTitleLanded,
  equipmentOrderAt,
  globeBadgeAt,
  globeBadgeScale,
  globeBadgeWorld,
  globeBadgeWorldScale,
  globeJourneyAt,
  globePullbackAltitude,
  GLOBE_SURFACE_ALTITUDE,
  GLOBE_SURFACE_ALTITUDE_MOBILE,
} from "./discoveryTimeline";
import {
  HERO_PHONE_KEY_LIGHT,
  HERO_PHONE_TILT_LERP,
  overheadPointerTilt,
  pointerTowardBox,
} from "./handoff";
import { disposeTree } from "./dispose";
import { createRoundedPlate } from "./roundedPlate";
import { clamp01, damp, lerp, smoothstep } from "./timeline";

const PHONE_BOX_CORNERS = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
] as const;

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
  const camera = new THREE.PerspectiveCamera(DISCOVERY_CAM_FOV, 1, 0.02, 80);
  const environment = createGymEnvironment(renderer, GYM_ENV_SIZE);
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
  const title = createDiscoveryTitle();
  tilt.add(title.root);
  const appImage = document.createElement("canvas");
  appImage.width = DISCOVERY_APP_CANVAS.w;
  appImage.height = DISCOVERY_APP_CANVAS.h;
  const appCtx = appImage.getContext("2d")!;
  drawDiscoveryAppScreen(appCtx, appImage.width, appImage.height, {
    dividers: false,
    numbers: false,
    title: false,
  });
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
  const reveals = discoveryEquipment.map(() => ({ value: 0 }));
  let spawnSeconds = 0;
  let floorHeld = false;
  const models: THREE.Group[] = [];
  const modelCenters: THREE.Vector3[] = [];
  const decoder = new DRACOLoader().setDecoderPath("/draco/");
  const loader = new GLTFLoader().setDRACOLoader(decoder);
  let disposed = false,
    width = 1,
    height = 1,
    initialized = false;
  let tiltX = 0,
    tiltZ = 0;
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
            shader.uniforms.uReveal = reveals[index];
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
          m.customProgramCacheKey = () => `discovery-floor-spawn-${index}`;
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
  let paintedNumbers = false;
  let paintedTitle = false;
  const ready = Promise.all([
    landReady,
    equipmentReady,
    document.fonts.load("600 32px Inter"),
    document.fonts.load("650 57px Inter"),
    document.fonts.load('600 18px "JetBrains Mono"'),
  ]).then(() => {
    if (disposed) return;
    title.paintClean();
    drawDiscoveryAppScreen(appCtx, appImage.width, appImage.height, {
      dividers: false,
      numbers: paintedNumbers,
      title: paintedTitle,
    });
    appTexture.needsUpdate = true;
  });
  const cameraTarget = new THREE.Vector3(),
    lookTarget = new THREE.Vector3(),
    look = new THREE.Vector3();
  const projected = new THREE.Vector3();
  const thumbCenter = new THREE.Vector3();
  const numberTop = new THREE.Vector3();
  const points = discoveryEquipment.map(() => ({
    x: 0,
    y: 0,
    alpha: 0,
    mix: 0,
    scale: 1,
  }));
  const mapAnchors = [...discoveryMapLocations, ...discoveryCountryLabels].map(location =>
    latLngToGlobe(location.latitude, location.longitude, GLOBE_RADIUS + 0.018),
  );
  const mapPoints = mapAnchors.map(() => ({ x: 0, y: 0, alpha: 0 }));
  const result = {
    equipment: points,
    locations: mapPoints,
    focus: 0,
    reveal: 0,
    listing: 0,
    floor: 0,
    spawning: false,
  };
  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    renderer.setPixelRatio(discoveryPixelRatio(devicePixelRatio || 1, width, height));
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(1, height);
    camera.updateProjectionMatrix();
  }
  resize();
  function draw(
    progress: number,
    assemblySeconds: number,
    dt: number,
    input: {
      mx: number;
      my: number;
      hasPointer: boolean;
      clientX?: number;
      clientY?: number;
    } = {
      mx: 0,
      my: 0,
      hasPointer: false,
    },
  ) {
    const frame = discoveryAt(progress),
      compact = width < 760,
      ease = 1 - Math.exp(-dt * 10);
    const beats = discoveryMorphBeats(frame.morph);
    const journey = globeJourneyAt(assemblySeconds, progress);
    const focus = journey.focus * (1 - frame.floor);
    const badge = globeBadgeAt(frame.floor);
    const listingFade = 1 - frame.listing * 0.18;
    globe.update(
      assemblySeconds,
      listingFade * (1 - badge.handoff),
      journey.focus,
      listingFade * badge.detail,
    );
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
    title.update(progress);
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
    const onFloor = frame.floor >= 1 && frame.morph < 0.12;
    if (onFloor && !floorHeld) spawnSeconds = 0;
    floorHeld = onFloor;
    if (onFloor) spawnSeconds += dt;
    else if (frame.morph > 0.12) spawnSeconds = 8;
    else spawnSeconds = 0;
    const spawning = onFloor && !discoverySpawnDone(spawnSeconds);
    const pose = discoveryCameraPose(progress, compact, width, height);
    const surfaceAltitude = compact
      ? GLOBE_SURFACE_ALTITUDE_MOBILE
      : GLOBE_SURFACE_ALTITUDE;
    const worldAltitude = Math.max(0.2, pose.z - GLOBE_RADIUS);
    pose.z =
      GLOBE_RADIUS +
      globePullbackAltitude(journey.reveal, worldAltitude, surfaceAltitude);
    pose.y = lerp(surfaceAltitude * 0.35, pose.y, journey.reveal);
    // Interpolate altitude logarithmically: equal time covers equal changes of scale.
    const closeAltitude = compact ? Math.max(0.65, height / width * 0.36) : Math.max(0.37, 0.37 * 1264 / width);
    if (focus > 0)
      pose.z = GLOBE_RADIUS + Math.exp(lerp(Math.log(pose.z - GLOBE_RADIUS), Math.log(closeAltitude), focus));
    pose.y = lerp(pose.y, 0, focus);
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
      compact ? -lerp(height * (height <= 700 ? 0.045 : 0.075), 45, frame.morph) : 0,
      width,
      height,
    );
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    const listingScale = lerp(1, 0.94, frame.listing);
    const listingY = -frame.listing * 0.06;
    const rest = globeBadgeWorld();
    const badgeScale = globeBadgeWorldScale(
      Math.hypot(
        camera.position.x - rest.x,
        camera.position.y - rest.y,
        camera.position.z - rest.z,
      ),
      height,
      DISCOVERY_CAM_FOV,
      GLOBE_RADIUS,
    );
    const globeScale = globeBadgeScale(badge.travel, listingScale, badgeScale);
    globe.root.scale.setScalar(globeScale);
    globe.root.position.set(
      lerp(0, rest.x, badge.travel),
      lerp(listingY, GLOBE_RADIUS * globeScale, badge.travel),
      lerp(0, rest.z, badge.travel),
    );
    globe.root.visible = badge.handoff < 0.97;
    globe.root.updateMatrixWorld();
    const tiltMix = compact ? 0 : bodyFade;
    let aimX = 0,
      aimY = 0;
    if (input.hasPointer && tiltMix > 0) {
      if (input.clientX != null && input.clientY != null) {
        const rect = canvas.getBoundingClientRect();
        const body = discoveryPhoneBodyRect();
        const lift = discoveryScreenWorldY();
        const hw = body.w / 2;
        const hd = body.d / 2;
        let minX = Infinity,
          minY = Infinity,
          maxX = -Infinity,
          maxY = -Infinity;
        for (const [u, v] of PHONE_BOX_CORNERS) {
          projected.set(u * hw, lift, v * hd).project(camera);
          const sx = (projected.x * 0.5 + 0.5) * width;
          const sy = (-projected.y * 0.5 + 0.5) * height;
          minX = Math.min(minX, sx);
          maxX = Math.max(maxX, sx);
          minY = Math.min(minY, sy);
          maxY = Math.max(maxY, sy);
        }
        const toward = pointerTowardBox(
          input.clientX,
          input.clientY,
          rect.left,
          rect.top,
          { x: minX, y: minY, w: maxX - minX, h: maxY - minY },
        );
        aimX = toward.mx;
        aimY = toward.my;
      } else {
        aimX = input.mx;
        aimY = input.my;
      }
    }
    const pointer = overheadPointerTilt(aimX, aimY);
    tiltX = damp(tiltX, pointer.rotX * tiltMix, HERO_PHONE_TILT_LERP, dt);
    tiltZ = damp(tiltZ, pointer.rotZ * tiltMix, HERO_PHONE_TILT_LERP, dt);
    tilt.rotation.set(tiltX, 0, tiltZ);
    tilt.updateMatrixWorld();
    phoneKey.position.set(
      HERO_PHONE_KEY_LIGHT.x + aimX * HERO_PHONE_KEY_LIGHT.xGain * tiltMix,
      HERO_PHONE_KEY_LIGHT.y - aimY * tiltMix,
      HERO_PHONE_KEY_LIGHT.z,
    );
    projected.copy(globe.root.position).project(camera);
    const globeX = (projected.x * 0.5 + 0.5) * width;
    const globeY = (-projected.y * 0.5 + 0.5) * height;
    const landed = discoveryLabelsLanded(progress);
    const landedTitle = discoveryTitleLanded(progress);
    if (landed !== paintedNumbers || landedTitle !== paintedTitle) {
      paintedNumbers = landed;
      paintedTitle = landedTitle;
      drawDiscoveryAppScreen(appCtx, appImage.width, appImage.height, {
        dividers: false,
        numbers: landed,
        title: landedTitle,
      });
      appTexture.needsUpdate = true;
    }
    for (let i = 0; i < discoveryEquipment.length; i++) {
      const rig = models[i];
      if (!rig) continue;
      const placed = discoveryMachinePoseAt(progress, i);
      const ordered = equipmentOrderAt(progress, i);
      const label = discoveryLabelAt(progress, i);
      const spawn = discoveryMachineSpawnAt(spawnSeconds, i);
      const grow = spawn.amount;
      reveals[i]!.value = spawn.height;
      rig.visible = grow > 0.02;
      rig.position.set(
        placed.x,
        placed.y - (1 - grow) * 0.45 * (1 - ordered),
        placed.z,
      );
      rig.scale.setScalar(placed.scale * Math.max(0.001, grow));
      rig.rotation.set(placed.rotX, placed.rotation, 0);
      // Floor exports stand on their feet. Center their silhouette in the app wells.
      thumbCenter.copy(modelCenters[i]!).applyEuler(rig.rotation).multiplyScalar(placed.scale * ordered);
      rig.position.x -= thumbCenter.x;
      rig.position.z -= thumbCenter.z;
      const contact = rig.getObjectByName("contact") as THREE.Mesh | undefined;
      if (contact) {
        contact.visible = ordered < 0.85 && spawn.amount > 0.08;
        const mat = contact.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.65 * (1 - ordered) * spawn.amount;
      }
      rig.updateMatrixWorld();
      projected.set(0, 0, 0).applyMatrix4(rig.matrixWorld).project(camera);
      const machineX = (projected.x * 0.5 + 0.5) * width;
      const machineY = (-projected.y * 0.5 + 0.5) * height;
      const slot = discoveryAppNumberWorld(i);
      projected.set(slot.x, slot.y, slot.z).applyMatrix4(tilt.matrixWorld).project(camera);
      const slotX = (projected.x * 0.5 + 0.5) * width;
      const slotY = (-projected.y * 0.5 + 0.5) * height;
      numberTop.set(slot.x, slot.y, slot.z - slot.h / 2).applyMatrix4(tilt.matrixWorld).project(camera);
      const slotH = Math.hypot(
        (projected.x - numberTop.x) * 0.5 * width,
        (projected.y - numberTop.y) * 0.5 * height,
      ) * 2;
      const t = label.travel;
      const point = points[i]!;
      const fromX =
        i === DISCOVERY_GLOBE_BADGE
          ? globeX
          : machineX + DISCOVERY_LABEL_FLOOR_OFFSET.x;
      const fromY =
        i === DISCOVERY_GLOBE_BADGE
          ? globeY
          : machineY + DISCOVERY_LABEL_FLOOR_OFFSET.y;
      point.x = lerp(fromX, slotX, t);
      point.y = lerp(fromY, slotY, t);
      point.mix = label.mix;
      point.scale = lerp(1, Math.max(0.35, slotH / DISCOVERY_LABEL_FONT), t);
      point.alpha = label.alpha;
    }
    renderer.toneMappingExposure = lerp(1.05, 1.65, frame.floor);
    renderer.render(scene, camera);
    const assemble = smoothstep((assemblySeconds - 1.6) / 0.7);
    const locationCount = discoveryMapLocations.length;
    for (let i = 0; i < mapAnchors.length; i++) {
      projected.copy(mapAnchors[i]!).applyMatrix4(globe.root.matrixWorld).project(camera);
      const point = mapPoints[i]!;
      point.x = (projected.x * 0.5 + 0.5) * width;
      point.y = (-projected.y * 0.5 + 0.5) * height;
      const isHub = i === discoveryHubLocationIndex;
      const hold = assemble * journey.focus * (1 - frame.floor);
      const others = hold * (1 - clamp01(frame.listing * 1.85));
      if (i < locationCount) {
        point.alpha = isHub ? Math.max(journey.labels * assemble, hold) : others;
      } else {
        point.alpha = journey.labels * assemble * (1 - frame.listing);
      }
    }
    result.focus = focus;
    result.reveal = journey.reveal;
    result.spawning = spawning;
    result.listing = frame.listing;
    result.floor = frame.floor;
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
      title.dispose();
      disposeTree(scene);
      renderer.dispose();
    },
  };
}

export { DISCOVERY_MORPH_START };
