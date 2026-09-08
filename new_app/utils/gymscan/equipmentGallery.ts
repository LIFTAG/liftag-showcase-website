import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import {
  GYM_ENV_SIZE,
  createGymEnvironment,
  createContactShadowTexture,
} from "./environment";
import { disposeTree } from "./dispose";
import { clamp01, lerp } from "./timeline";
import { gymEquipment, type GymEquipment } from "./equipment";
import type { PhoneBox } from "./handoff";

/** The phone opens onto a real equipment collection, using the film's one renderer. */
export function createEquipmentGallery(renderer: THREE.WebGLRenderer) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x040605);
  scene.fog = new THREE.Fog(0x040605, 14, 35);
  const camera = new THREE.PerspectiveCamera(34, 1, 0.05, 45);
  const environment = createGymEnvironment(renderer, GYM_ENV_SIZE);
  scene.environment = environment.texture;
  const key = new THREE.DirectionalLight(0xe4eeeb, 4.2);
  key.position.set(1, 6, 5);
  const rim = new THREE.DirectionalLight(0xdfff9a, 2.2);
  rim.position.set(-3, 3, -2);
  scene.add(key, rim, new THREE.HemisphereLight(0xbcccca, 0x141714, 1.4));
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshBasicMaterial({ color: 0x080c09 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.035;
  scene.add(floor);
  const grid = new THREE.GridHelper(30, 30, 0x0b100d, 0x090d0b);
  grid.position.y = -0.032;
  scene.add(grid);

  const models = new Map<GymEquipment, THREE.Group>();
  const centers = new Map<GymEquipment, number>();
  const markers = new Map<
    GymEquipment,
    THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>
  >();
  const shadowMap = createContactShadowTexture();
  const scan = { value: -1 };
  const decoder = new DRACOLoader().setDecoderPath("/draco/");
  const loader = new GLTFLoader().setDRACOLoader(decoder);
  let disposed = false;
  let selected: GymEquipment | null = null;
  let focus = 0;
  let scanTime = 1;
  let pointer = 0;
  let initialized = false;
  const targetPosition = new THREE.Vector3();
  const targetLook = new THREE.Vector3();
  const look = new THREE.Vector3();

  const ready = Promise.allSettled(
    gymEquipment.map(async (item) => {
      const gltf = await loader.loadAsync(item.model);
      if (disposed) {
        disposeTree(gltf.scene);
        return;
      }
      const object = gltf.scene;
      const bounds = new THREE.Box3().setFromObject(object);
      const center = bounds.getCenter(new THREE.Vector3());
      const size = bounds.getSize(new THREE.Vector3());
      const scale = item.span / Math.max(size.x, size.y, size.z);
      centers.set(item.id, size.y * scale * 0.5);
      object.scale.setScalar(scale);
      object.position.set(
        -center.x * scale,
        -bounds.min.y * scale,
        -center.z * scale,
      );
      const rig = new THREE.Group();
      rig.add(object);
      rig.position.set(item.x, 0, item.z);
      rig.rotation.y = item.rotation;
      object.traverse((node) => {
        if (!(node instanceof THREE.Mesh)) return;
        for (const material of Array.isArray(node.material)
          ? node.material
          : [node.material]) {
          const standard = material as THREE.MeshStandardMaterial;
          standard.envMapIntensity = 0.65;
          standard.roughness = Math.max(0.4, standard.roughness);
          standard.metalness = Math.min(0.65, standard.metalness);
          standard.onBeforeCompile = (shader) => {
            shader.uniforms.uGalleryScan = scan;
            shader.vertexShader =
              "varying float vGalleryY;\n" + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
              "#include <project_vertex>",
              "#include <project_vertex>\nvGalleryY=(modelMatrix*vec4(transformed,1.0)).y;",
            );
            shader.fragmentShader =
              "varying float vGalleryY; uniform float uGalleryScan;\n" +
              shader.fragmentShader;
            shader.fragmentShader = shader.fragmentShader.replace(
              "#include <dithering_fragment>",
              "#include <dithering_fragment>\nfloat band=1.0-smoothstep(0.005,0.035,abs(vGalleryY-uGalleryScan)); gl_FragColor.rgb+=vec3(0.45,0.8,0.02)*band;",
            );
          };
          standard.customProgramCacheKey = () => "gym-gallery-scan";
        }
      });
      const contact = new THREE.Mesh(
        new THREE.PlaneGeometry(3.4, 3.4),
        new THREE.MeshBasicMaterial({
          map: shadowMap,
          transparent: true,
          opacity: 0.8,
          depthWrite: false,
        }),
      );
      contact.rotation.x = -Math.PI / 2;
      contact.position.y = -0.025;
      rig.add(contact);
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(1.35, 1.358, 72),
        new THREE.MeshBasicMaterial({
          color: 0xccff00,
          transparent: true,
          opacity: 0.16,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = -0.015;
      rig.add(ring);
      markers.set(item.id, ring);
      models.set(item.id, rig);
      scene.add(rig);
    }),
  ).then(async (results) => {
    decoder.dispose();
    if (disposed) return;
    if (results.some((result) => result.status === "rejected"))
      throw new Error("Equipment preview unavailable");
    // Compile before the phone opens onto the collection, avoiding a selection hitch.
    await renderer.compileAsync(scene, camera);
  });

  function render(
    dt: number,
    width: number,
    height: number,
    reveal: number,
    origin: PhoneBox,
    equipment: GymEquipment | null,
    mouseX: number,
    showPlan = false,
  ) {
    if (disposed || reveal <= 0) return;
    dt = Math.min(dt, 0.05);
    const ease = 1 - Math.exp(-7 * dt);
    if (selected !== equipment) {
      selected = equipment;
      scanTime = 0;
    }
    scanTime += dt;
    scan.value = selected && scanTime < 0.8 ? (scanTime / 0.8) * 3 : -1;
    focus += ((selected ? 1 : 0) - focus) * ease;
    pointer += (mouseX * 0.16 - pointer) * ease;
    gymEquipment.forEach((item) => {
      const rig = models.get(item.id);
      if (!rig) return;
      const active = selected === item.id;
      const scale = active ? 1 : 1 - focus * 0.995;
      rig.scale.setScalar(lerp(rig.scale.x, scale, ease));
      rig.position.x += ((active ? 0 : item.x) - rig.position.x) * ease;
      rig.position.z += ((active ? 0 : item.z) - rig.position.z) * ease;
      rig.rotation.y +=
        (item.rotation + (active ? pointer : 0) - rig.rotation.y) * ease;
      markers.get(item.id)!.material.opacity = active ? 0.68 : showPlan ? 0.48 : 0.16;
    });
    camera.aspect = width / height;
    const compact = width <= 760;
    const subjectY = selected ? (centers.get(selected) ?? 0.95) : 0.5;
    if (compact) {
      const span = lerp(6.5, 2.8, focus);
      const distance = (showPlan ? 1.55 : 1) * Math.max(
        8.5,
        span / (2 * Math.tan((17 * Math.PI) / 180) * camera.aspect * 0.86),
      );
      targetPosition.set(
        distance * 0.5,
        lerp(0.5, subjectY, focus) + distance * lerp(0.55, 0.24, focus),
        distance * 0.8,
      );
      targetLook.set(0, lerp(0.5, subjectY, focus), 0);
      camera.setViewOffset(
        width,
        height,
        showPlan ? width * 0.28 : 0,
        height * lerp(0.01, 0.02, focus),
        width,
        height,
      );
    } else {
      camera.clearViewOffset();
      targetPosition.set(
        lerp(7, 3.6, focus),
        lerp(7.4, 2.5, focus),
        lerp(10, 5.2, focus),
      );
      targetLook.set(lerp(2.0, 1.2, focus), lerp(0, subjectY, focus), 0);
    }
    if (!initialized) {
      camera.position.copy(targetPosition);
      look.copy(targetLook);
      initialized = true;
    }
    camera.position.lerp(targetPosition, ease);
    look.lerp(targetLook, ease);
    // Portrait framing moves the camera back. Keep atmospheric falloff relative
    // to the subject, or phones lose the entire collection inside the fog.
    const distance = camera.position.distanceTo(look);
    const fog = scene.fog as THREE.Fog;
    fog.near = distance + 3;
    fog.far = distance + 17;
    camera.lookAt(look);
    camera.updateProjectionMatrix();
    const u = clamp01(reveal);
    const x = lerp(origin.x, 0, u),
      y = lerp(origin.y, 0, u);
    const w = lerp(origin.w, width, u),
      h = lerp(origin.h, height, u);
    renderer.setRenderTarget(null);
    renderer.setViewport(0, 0, width, height);
    renderer.setScissor(x, height - y - h, w, h);
    renderer.setScissorTest(true);
    renderer.clearDepth();
    const exposure = renderer.toneMappingExposure;
    renderer.toneMappingExposure = 1.3;
    renderer.render(scene, camera);
    renderer.toneMappingExposure = exposure;
    renderer.setScissorTest(false);
  }
  return {
    ready,
    render,
    dispose() {
      disposed = true;
      environment.dispose();
      decoder.dispose();
      grid.geometry.dispose();
      (grid.material as THREE.Material).dispose();
      shadowMap.dispose();
      disposeTree(scene);
    },
  };
}
