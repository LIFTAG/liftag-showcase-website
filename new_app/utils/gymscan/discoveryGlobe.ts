import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { discoveryGymArcs, discoveryGyms, discoveryHub } from "./discoveryGyms.ts";
import { globeNetworkAt } from "./discoveryTimeline.ts";

export const GLOBE_RADIUS = 2;
const MARKER_RADIUS = GLOBE_RADIUS + 0.018;
const ARC_RADIUS = GLOBE_RADIUS + 0.028;
// Retained for compatibility with geometry-budget tests; land is now a texture.
export const LAND_LAT_STEP = 2.55;
export const LAND_LAT_STEP_MOBILE = 3.2;
export const LAND_DOT_SCALE = 0.0092;

export function latLngToGlobe(lat: number, lng: number, radius = GLOBE_RADIUS) {
  const phi = THREE.MathUtils.degToRad(lat);
  const theta = THREE.MathUtils.degToRad(lng);
  return new THREE.Vector3(Math.cos(phi) * Math.cos(theta), Math.sin(phi), -Math.cos(phi) * Math.sin(theta)).multiplyScalar(radius);
}

export function isLandPixel(r: number, g: number, b: number) {
  const sum = r + g + b;
  if (sum < 55 || (b > r && b > g && b - Math.min(r, g) > 12)) return false;
  return b / (sum + 1) <= 0.38 && r + g > b * 1.2;
}

/** Kept as a pure sampling helper for tests and tooling; it is not rendered. */
export function sampleLandDots(image: CanvasImageSource & { width: number; height: number }, latStep: number) {
  const width = 1024, height = 512;
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];
  ctx.drawImage(image, 0, 0, width, height);
  const pixels = ctx.getImageData(0, 0, width, height).data;
  const dots: THREE.Vector3[] = [];
  for (let lat = -90; lat <= 90; lat += latStep) {
    const count = Math.max(1, Math.round((360 / latStep) * Math.cos(THREE.MathUtils.degToRad(lat))));
    for (let i = 0; i < count; i++) {
      const lng = -180 + i * 360 / count;
      const x = Math.min(width - 1, Math.max(0, Math.floor((lng + 180) / 360 * width)));
      const y = Math.min(height - 1, Math.max(0, Math.floor((90 - lat) / 180 * height)));
      const p = (y * width + x) * 4;
      if (isLandPixel(pixels[p]!, pixels[p + 1]!, pixels[p + 2]!)) dots.push(latLngToGlobe(lat, lng, MARKER_RADIUS));
    }
  }
  return dots;
}

export function placeGlobeDot(dummy: THREE.Object3D, position: THREE.Vector3, scale: number) {
  dummy.position.copy(position);
  dummy.lookAt(position.x * 2, position.y * 2, position.z * 2);
  dummy.scale.setScalar(scale);
  dummy.updateMatrix();
}

function arcMaterial(uniforms: { uArcs: { value: number }; uTime: { value: number }; uFade: { value: number } }) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, uniforms,
    vertexShader: "attribute float aDelay;varying float vAlong;varying float vDelay;void main(){vAlong=uv.x;vDelay=aDelay;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "uniform float uArcs;uniform float uTime;uniform float uFade;varying float vAlong;varying float vDelay;void main(){float local=clamp((uArcs-vDelay*.42)/.58,0.,1.);float body=1.-smoothstep(local-.04,local+.01,vAlong);float head=exp(-pow((fract(uTime*.18+vDelay)-vAlong)*16.,2.))*body;gl_FragColor=vec4(.8,1.,0.,(body*.38+head*.7)*uFade);}",
  });
}

export function createDiscoveryGlobe() {
  const root = new THREE.Group();
  root.name = "discovery-globe";
  const earthMaterial = new THREE.MeshStandardMaterial({ color: 0x91a39d, roughness: 0.82, metalness: 0.02, emissive: 0x06100c, emissiveIntensity: 0.28 });
  earthMaterial.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace("#include <dithering_fragment>", "#include <dithering_fragment>\nfloat gray=dot(gl_FragColor.rgb,vec3(.299,.587,.114));gl_FragColor.rgb=mix(vec3(gray),gl_FragColor.rgb,.48)*vec3(.78,.94,.88);");
  };
  earthMaterial.customProgramCacheKey = () => "discovery-earth-graphite-v1";
  const earth = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_RADIUS, 64, 40), earthMaterial);
  root.add(earth);
  const earthKey = new THREE.DirectionalLight(0xc2d9cf, 1.15);
  earthKey.position.set(4, 2.5, 5);
  root.add(earthKey);

  const atmosphereMaterial = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    uniforms: { opacity: { value: 0 } },
    vertexShader: "varying float vRim;void main(){vec4 p=modelViewMatrix*vec4(position,1.);vec3 n=normalize(normalMatrix*normal);vRim=pow(1.-max(0.,dot(n,normalize(-p.xyz))),6.);gl_Position=projectionMatrix*p;}",
    fragmentShader: "varying float vRim;uniform float opacity;void main(){gl_FragColor=vec4(.48,.72,.62,vRim*opacity);}",
  });
  const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_RADIUS * 1.018, 48, 32), atmosphereMaterial);
  atmosphere.renderOrder = 3;
  root.add(atmosphere);

  const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xccff00, transparent: true, opacity: 0.9, toneMapped: false });
  const dummy = new THREE.Object3D();
  const markers = new THREE.InstancedMesh(new THREE.CircleGeometry(1, 12), markerMaterial, discoveryGyms.length);
  discoveryGyms.forEach((gym, i) => { placeGlobeDot(dummy, latLngToGlobe(gym.latitude, gym.longitude, MARKER_RADIUS), gym.hub ? 0.032 : 0.018); markers.setMatrixAt(i, dummy.matrix); });
  markers.instanceMatrix.needsUpdate = true;
  markers.frustumCulled = false;
  markers.renderOrder = 2;
  root.add(markers);

  const pin = new THREE.Object3D();
  pin.position.copy(latLngToGlobe(discoveryHub.latitude, discoveryHub.longitude, MARKER_RADIUS));
  root.add(pin);

  const tubesMaterial = arcMaterial({ uArcs: { value: 0 }, uTime: { value: 0 }, uFade: { value: 1 } });
  const arcGeometries = discoveryGymArcs().map((link, index) => {
    const start = latLngToGlobe(link.from.latitude, link.from.longitude, ARC_RADIUS);
    const end = latLngToGlobe(link.to.latitude, link.to.longitude, ARC_RADIUS);
    const lift = GLOBE_RADIUS + 0.08 + start.angleTo(end) * 0.42 + index % 3 * 0.025;
    const curve = new THREE.CubicBezierCurve3(start, start.clone().lerp(end, .28).normalize().multiplyScalar(lift), start.clone().lerp(end, .72).normalize().multiplyScalar(lift), end);
    const geometry = new THREE.TubeGeometry(curve, 36, 0.009, 5, false);
    geometry.setAttribute("aDelay", new THREE.BufferAttribute(new Float32Array(geometry.attributes.position!.count).fill(index / Math.max(1, discoveryGyms.length - 2)), 1));
    return geometry;
  });
  const arcs = new THREE.Mesh(mergeGeometries(arcGeometries)!, tubesMaterial);
  arcGeometries.forEach((geometry) => geometry.dispose());
  root.add(arcs);

  function applyLand(image: CanvasImageSource & { width: number; height: number }) {
    if (earthMaterial.map) return;
    const texture = new THREE.Texture(image);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.needsUpdate = true;
    earthMaterial.map = texture;
    earthMaterial.needsUpdate = true;
  }

  function update(seconds: number, amount: number) {
    const network = globeNetworkAt(seconds);
    root.visible = amount > 0.002;
    earthMaterial.opacity = amount;
    earthMaterial.transparent = amount < 0.999;
    earthMaterial.depthWrite = amount > 0.95;
    markerMaterial.opacity = 0.82 * amount;
    atmosphereMaterial.uniforms.opacity!.value = 0.11 * amount;
    tubesMaterial.uniforms.uArcs!.value = network.arcs;
    tubesMaterial.uniforms.uTime!.value = seconds;
    tubesMaterial.uniforms.uFade!.value = amount;
    root.rotation.set(0.27, -Math.PI / 2 - THREE.MathUtils.degToRad(discoveryHub.longitude), 0);
  }

  return { root, pin, applyLand, update };
}
