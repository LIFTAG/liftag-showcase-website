import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  discoveryGymArcs,
  discoveryGyms,
  discoveryHub,
  discoveryRegionFocus,
} from "./discoveryGyms.ts";
import { globeAssemblyAt, globeNetworkAt } from "./discoveryTimeline.ts";
import { clamp01 } from "./timeline.ts";
import { createDiscoveryRegion } from "./discoveryRegion.ts";

/**
 * GitHub-globe construction, lime-shifted for LIFTAG.
 *
 * Dotted continents from a land mask (GitHub's 2020 homepage globe, also
 * jessehhydee/threejs-globe). 3D bezier tubes between gyms
 * (janarosmonaliev/github-globe / three-globe arcs). Shockwave is ours:
 * Bratislava blinks, then a ring of those same land dots lights up.
 */
export const GLOBE_RADIUS = 2;
const DOT_RADIUS = GLOBE_RADIUS + 0.018;
const ARC_RADIUS = GLOBE_RADIUS + 0.03;
/** Degrees between land samples. Tight enough to read coastlines, sparse enough that dots do not fill in as a surface. */
export const LAND_LAT_STEP = 1.1;
export const LAND_LAT_STEP_MOBILE = 1.65;
export const LAND_DOT_SCALE = 0.0058;

export function latLngToGlobe(lat: number, lng: number, radius = GLOBE_RADIUS) {
  const phi = THREE.MathUtils.degToRad(lat);
  const theta = THREE.MathUtils.degToRad(lng);
  return new THREE.Vector3(
    Math.cos(phi) * Math.cos(theta),
    Math.sin(phi),
    -Math.cos(phi) * Math.sin(theta),
  ).multiplyScalar(radius);
}

/** NASA Blue Marble: keep land and ice, drop ocean and cool cloud. */
export function isLandPixel(r: number, g: number, b: number) {
  const sum = r + g + b;
  if (sum < 55) return false;
  if (b > r && b > g && b - Math.min(r, g) > 12) return false;
  if (b / (sum + 1) > 0.38) return false;
  return r + g > b * 1.2;
}

export function sampleLandDots(
  image: CanvasImageSource & { width: number; height: number },
  latStep: number,
) {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];
  ctx.drawImage(image, 0, 0, width, height);
  const pixels = ctx.getImageData(0, 0, width, height).data;
  const dots: THREE.Vector3[] = [];
  const read = (lat: number, lng: number) => {
    const x = Math.min(
      width - 1,
      Math.max(0, Math.floor(((lng + 180) / 360) * width)),
    );
    const y = Math.min(
      height - 1,
      Math.max(0, Math.floor(((90 - lat) / 180) * height)),
    );
    const i = (y * width + x) * 4;
    return isLandPixel(pixels[i]!, pixels[i + 1]!, pixels[i + 2]!);
  };
  for (let lat = -90; lat <= 90; lat += latStep) {
    const count = Math.max(
      1,
      Math.round((360 / latStep) * Math.cos(THREE.MathUtils.degToRad(lat))),
    );
    for (let i = 0; i < count; i++) {
      const lng = -180 + (i * 360) / count;
      if (!read(lat, lng)) continue;
      dots.push(latLngToGlobe(lat, lng, DOT_RADIUS));
    }
  }
  return dots;
}

function dotMaterial(uniforms: {
  uAssembly: { value: number };
  uSweep: { value: number };
  uHologram: { value: number };
  uOrigin: { value: THREE.Vector3 };
  uWave: { value: number };
  uBlink: { value: number };
  uFade: { value: number };
  uTime: { value: number };
  uFocus: { value: number };
}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.FrontSide,
    toneMapped: false,
    uniforms,
    vertexShader: `
      attribute float aDelay;
      attribute float aGym;
      uniform float uAssembly;
      uniform float uFocus;
      varying vec3 vDir;
      varying float vFacing;
      varying float vGym;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vGym = aGym;
        vDir = normalize(instanceMatrix[3].xyz);
        float u = clamp((uAssembly - aDelay) / 0.55, 0., 1.);
        u = 1. - pow(1. - u, 3.);
        float scale = mix(1., mix(0.18, 0.12, aGym), uFocus);
        vec4 mv = modelViewMatrix * instanceMatrix * vec4(position * u * scale, 1.);
        vFacing = max(0., dot(normalize(normalMatrix * vDir), normalize(-mv.xyz)));
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 uOrigin;
      uniform float uWave;
      uniform float uBlink;
      uniform float uHologram;
      uniform float uSweep;
      uniform float uFade;
      uniform float uTime;
      uniform float uFocus;
      varying vec3 vDir;
      varying float vFacing;
      varying float vGym;
      varying vec2 vUv;
      void main() {
        float disc = 1. - smoothstep(0.78, 1., length(vUv - 0.5) * 2.);
        float ang = acos(clamp(dot(normalize(vDir), uOrigin), -1., 1.));
        float ring = exp(-pow((ang - uWave) * 13., 2.));
        float wash = (1. - smoothstep(uWave, uWave + 0.55, ang)) * 0.1 * step(0.02, uWave);
        float scan = (1. - smoothstep(0.02, 0.09, abs(vDir.y * 2. - uSweep))) * uHologram;
        float twinkle = 0.9 + 0.1 * sin(uTime * 1.6 + vDir.x * 42. + vDir.z * 28.);
        float gym = vGym * (0.55 + 0.9 * uBlink);
        float lit = 0.6 + (ring * 0.65 + wash + scan * 0.5) * (1. - uFocus) + gym;
        float depth = mix(0.25, 1., smoothstep(0., 0.8, vFacing));
        vec3 color = mix(vec3(0.52, 0.7, 0.64), vec3(0.8, 1., 0.18), clamp(ring * 0.7 + vGym + scan, 0., 1.));
        float detailFade = mix(1. - uFocus * 0.88, 1., vGym);
        gl_FragColor = vec4(color, disc * lit * depth * twinkle * uFade * detailFade);
      }`,
  });
}

function arcMaterial(uniforms: {
  uArcs: { value: number };
  uTime: { value: number };
  uFade: { value: number };
  uFocus: { value: number };
}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    toneMapped: false,
    uniforms,
    vertexShader: `
      attribute float aDelay;
      attribute vec3 aCenter;
      uniform float uFocus;
      varying float vAlong;
      varying float vDelay;
      void main() {
        vAlong = uv.x;
        vDelay = aDelay;
        vec3 p = aCenter + (position - aCenter) * mix(1., 0.075, uFocus);
        p = normalize(p) * mix(length(p), 2.015 + max(0., length(p) - 2.03) * 0.18, uFocus);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
      }`,
    fragmentShader: `
      uniform float uArcs;
      uniform float uTime;
      uniform float uFade;
      varying float vAlong;
      varying float vDelay;
      void main() {
        float local = clamp((uArcs - vDelay * 0.42) / 0.58, 0., 1.);
        float body = 1. - smoothstep(local - 0.04, local + 0.01, vAlong);
        float head = exp(-pow((fract(uTime * 0.18 + vDelay) - vAlong) * 16., 2.)) * body;
        vec3 color = mix(vec3(0.65, 0.85, 0.22), vec3(0.92, 1., 0.65), head);
        gl_FragColor = vec4(color, (body * 0.3 + head * 0.85) * uFade);
      }`,
  });
}

/**
 * CircleGeometry faces +Z. Object3D.lookAt aims +Z at the target, so aim
 * outward: lookAt(0,0,0) points the disc inward and FrontSide culls it.
 */
export function placeGlobeDot(
  dummy: THREE.Object3D,
  position: THREE.Vector3,
  scale: number,
) {
  dummy.position.copy(position);
  dummy.lookAt(position.x * 2, position.y * 2, position.z * 2);
  dummy.scale.setScalar(scale);
  dummy.updateMatrix();
}

export function createDiscoveryGlobe() {
  const root = new THREE.Group();
  root.name = "discovery-globe";
  const hub = latLngToGlobe(
    discoveryHub.latitude,
    discoveryHub.longitude,
    DOT_RADIUS,
  );
  const origin = hub.clone().normalize();
  const dotsMat = dotMaterial({
    uAssembly: { value: 0 },
    uSweep: { value: 3 },
    uHologram: { value: 0 },
    uOrigin: { value: origin },
    uWave: { value: 0 },
    uBlink: { value: 0 },
    uFade: { value: 1 },
    uTime: { value: 0 },
    uFocus: { value: 0 },
  });
  const tubesMat = arcMaterial({
    uArcs: { value: 0 },
    uTime: { value: 0 },
    uFade: { value: 1 },
    uFocus: { value: 0 },
  });
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0x050705,
    toneMapped: false,
  });
  const innerUniforms = { uDetail: { value: 1 } };
  // Studio key/rim while it is Earth. As detail dies the same sphere becomes
  // the unlit 04 badge fill, with a thin lime edge standing in for the CSS ring.
  innerMat.onBeforeCompile = (shader) => {
    shader.uniforms.uDetail = innerUniforms.uDetail;
    shader.vertexShader = "varying vec3 vGlobeNormal; varying vec3 vGlobeView;\n" + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <project_vertex>",
      "#include <project_vertex>\nvGlobeNormal = normalize(normalMatrix * normal); vGlobeView = -mvPosition.xyz;",
    );
    shader.fragmentShader =
      "varying vec3 vGlobeNormal; varying vec3 vGlobeView; uniform float uDetail;\n" +
      shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <color_fragment>",
      `#include <color_fragment>
       vec3 n = normalize(vGlobeNormal);
       float key = max(0., dot(n, normalize(vec3(-0.6, 0.8, 1.))));
       float rim = pow(1. - max(0., dot(n, normalize(vGlobeView))), 3.);
       vec3 lit = vec3(0.002, 0.004, 0.003)
         + vec3(0.012, 0.022, 0.018) * key
         + vec3(0.03, 0.055, 0.025) * rim;
       vec3 badge = vec3(0.047, 0.055, 0.05)
         + vec3(0.55, 0.65, 0.22) * pow(rim, 8.) * 0.7;
       diffuseColor.rgb = mix(badge, lit, uDetail);`,
    );
  };
  innerMat.customProgramCacheKey = () => "discovery-globe-studio-v2";
  const inner = new THREE.Mesh(
    new THREE.SphereGeometry(GLOBE_RADIUS, 48, 32),
    innerMat,
  );
  inner.renderOrder = 0;
  inner.visible = false;
  root.add(inner);

  const atmosphereMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    uniforms: { opacity: { value: 0.28 } },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vec4 p = modelViewMatrix * vec4(position, 1.);
        vNormal = normalize(normalMatrix * normal);
        vView = -p.xyz;
        gl_Position = projectionMatrix * p;
      }`,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vView;
      uniform float opacity;
      void main() {
        float facing = abs(dot(normalize(vNormal), normalize(vView)));
        float halo = pow(1. - facing, 3.) * smoothstep(0., 0.18, facing);
        gl_FragColor = vec4(0.48, 0.68, 0.3, halo * opacity);
      }`,
  });
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(GLOBE_RADIUS * 1.045, 64, 48),
    atmosphereMat,
  );
  atmosphere.renderOrder = 4;
  root.add(atmosphere);
  const region = createDiscoveryRegion(latLngToGlobe, GLOBE_RADIUS);
  root.add(region.root);

  const dummy = new THREE.Object3D();
  const gyms = new THREE.InstancedMesh(
    new THREE.CircleGeometry(1, 8),
    dotsMat,
    discoveryGyms.length,
  );
  const gymDelay = new Float32Array(discoveryGyms.length);
  const gymFlag = new Float32Array(discoveryGyms.length);
  discoveryGyms.forEach((gym, i) => {
    placeGlobeDot(
      dummy,
      latLngToGlobe(gym.latitude, gym.longitude, DOT_RADIUS),
      gym.hub ? 0.028 : 0.016,
    );
    gyms.setMatrixAt(i, dummy.matrix);
    gymDelay[i] = gym.hub ? 0 : 0.12 + i * 0.03;
    gymFlag[i] = 1;
  });
  gyms.instanceMatrix.needsUpdate = true;
  gyms.geometry.setAttribute(
    "aDelay",
    new THREE.InstancedBufferAttribute(gymDelay, 1),
  );
  gyms.geometry.setAttribute(
    "aGym",
    new THREE.InstancedBufferAttribute(gymFlag, 1),
  );
  gyms.frustumCulled = false;
  gyms.renderOrder = 2;
  root.add(gyms);

  const arcGeoms: THREE.BufferGeometry[] = [];
  const links = discoveryGymArcs();
  links.forEach((link, index) => {
    const start = latLngToGlobe(
      link.from.latitude,
      link.from.longitude,
      ARC_RADIUS,
    );
    const end = latLngToGlobe(link.to.latitude, link.to.longitude, ARC_RADIUS);
    const angle = start.angleTo(end);
    const lift = GLOBE_RADIUS + 0.08 + angle * 0.42 + (index % 3) * 0.025;
    const curve = new THREE.CubicBezierCurve3(
      start,
      start.clone().lerp(end, 0.28).normalize().multiplyScalar(lift),
      start.clone().lerp(end, 0.72).normalize().multiplyScalar(lift),
      end,
    );
    const tube = new THREE.TubeGeometry(curve, 64, 0.006, 6, false);
    const centers = new Float32Array(tube.attributes.position!.count * 3);
    for (let i = 0; i < tube.attributes.position!.count; i++) {
      curve.getPointAt(tube.attributes.uv!.getX(i)).toArray(centers, i * 3);
    }
    tube.setAttribute("aCenter", new THREE.BufferAttribute(centers, 3));
    const delay = new Float32Array(tube.attributes.position!.count).fill(
      index / Math.max(1, links.length - 1),
    );
    tube.setAttribute("aDelay", new THREE.BufferAttribute(delay, 1));
    arcGeoms.push(tube);
  });
  const arcsMerged = mergeGeometries(arcGeoms)!;
  arcGeoms.forEach((geom) => geom.dispose());
  const arcs = new THREE.Mesh(arcsMerged, tubesMat);
  arcs.visible = false;
  arcs.renderOrder = 3;
  root.add(arcs);

  let land: THREE.InstancedMesh | null = null;

  function applyLand(
    image: CanvasImageSource & { width: number; height: number },
  ) {
    if (land) return;
    const mobile =
      (typeof navigator !== "undefined" &&
        navigator.hardwareConcurrency <= 4) ||
      (typeof matchMedia === "function" &&
        matchMedia("(max-width: 760px)").matches);
    const points = sampleLandDots(
      image,
      mobile ? LAND_LAT_STEP_MOBILE : LAND_LAT_STEP,
    );
    if (!points.length) return;
    land = new THREE.InstancedMesh(
      new THREE.CircleGeometry(1, 8),
      dotsMat,
      points.length,
    );
    const delays = new Float32Array(points.length);
    const flags = new Float32Array(points.length);
    points.forEach((point, i) => {
      placeGlobeDot(dummy, point, LAND_DOT_SCALE);
      land!.setMatrixAt(i, dummy.matrix);
      delays[i] = (((i * 17) % 23) / 23) * 0.32;
    });
    land.instanceMatrix.needsUpdate = true;
    land.geometry.setAttribute(
      "aDelay",
      new THREE.InstancedBufferAttribute(delays, 1),
    );
    land.geometry.setAttribute(
      "aGym",
      new THREE.InstancedBufferAttribute(flags, 1),
    );
    land.frustumCulled = false;
    land.renderOrder = 1;
    land.computeBoundingSphere();
    root.add(land);
  }

  function update(seconds: number, amount: number, focus = 0, detail = 1) {
    const frame = globeAssemblyAt(seconds);
    const network = globeNetworkAt(seconds);
    const surface = clamp01(detail);
    dotsMat.uniforms.uAssembly!.value = frame.assembly;
    dotsMat.uniforms.uSweep!.value = frame.sweepY;
    dotsMat.uniforms.uHologram!.value = frame.hologram;
    dotsMat.uniforms.uWave!.value = network.wave;
    dotsMat.uniforms.uBlink!.value = network.blink;
    dotsMat.uniforms.uFade!.value = amount * surface;
    dotsMat.uniforms.uTime!.value = seconds;
    dotsMat.uniforms.uFocus!.value = focus;
    tubesMat.uniforms.uArcs!.value = network.arcs;
    tubesMat.uniforms.uTime!.value = seconds;
    tubesMat.uniforms.uFade!.value = amount * surface;
    tubesMat.uniforms.uFocus!.value = focus;
    innerUniforms.uDetail.value = surface;
    inner.visible = !!land && frame.assembly > 0.18 && amount > 0.05;
    atmosphere.visible = frame.assembly > 0.55 && surface > 0.04;
    atmosphereMat.uniforms.opacity!.value =
      0.3 * amount * surface * frame.assembly * (1 - focus);
    gyms.visible = amount > 0.05 && surface > 0.04;
    arcs.visible = network.arcs > 0.01 && amount > 0.05 && surface > 0.04;
    if (land) land.visible = amount > 0.04 && surface > 0.04;
    root.rotation.set(
      THREE.MathUtils.lerp(0.48, THREE.MathUtils.degToRad(discoveryRegionFocus.latitude), focus),
      -Math.PI / 2 -
        THREE.MathUtils.degToRad(
          THREE.MathUtils.lerp(discoveryHub.longitude, discoveryRegionFocus.longitude, focus),
        ) -
        (1 - frame.assembly) * 0.55 * (1 - focus),
      0,
    );
    region.update(focus, amount * surface);
  }

  return { root, applyLand, update };
}
