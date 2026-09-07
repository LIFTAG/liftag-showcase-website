import * as THREE from "three";
import {
  DISCOVERY_APP_LAYOUT,
  DISCOVERY_FLOOR_COLS,
  DISCOVERY_PHONE_SCALE,
  discoveryCornerRadius,
  discoveryFloorSeamAt,
  discoveryMorphRect,
} from "./discoveryTimeline";
import { smoothstep } from "./timeline";

/** The floor joints and final list rules are the same persistent geometry. */
export function createDiscoverySeams() {
  const count = DISCOVERY_APP_LAYOUT.rows - 1;
  const uniforms = {
    uRows: { value: new Float32Array(count) },
    uHalf: { value: new THREE.Vector2() },
    uRadius: { value: 0 },
    uLineHalfWidth: { value: 0 },
    uThickness: { value: 0 },
    uColumns: { value: 1 },
    uOpacity: { value: 0 },
    uColor: { value: new THREE.Color() },
  };
  const floorColor = new THREE.Color("#121715");
  const dividerColor = new THREE.Color("#29312a");
  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
    vertexShader: `
      varying vec2 vLocal;
      void main() {
        vLocal = position.xy;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
      }`,
    fragmentShader: `
      varying vec2 vLocal;
      uniform float uRows[${count}];
      uniform vec2 uHalf;
      uniform float uRadius, uLineHalfWidth, uThickness, uColumns, uOpacity;
      uniform vec3 uColor;
      void main() {
        vec2 pixel = max(fwidth(vLocal), vec2(0.00001));
        vec2 q = abs(vLocal) - uHalf + vec2(uRadius);
        float edge = length(max(q, 0.)) + min(max(q.x, q.y), 0.) - uRadius;
        if (edge > 0.) discard;
        float rows = 0.;
        for (int i = 0; i < ${count}; i++) {
          float coverage = clamp((uThickness * .5 - abs(vLocal.y - uRows[i])) / pixel.y + .5, 0., 1.);
          rows = max(rows, coverage);
        }
        rows *= clamp((uLineHalfWidth - abs(vLocal.x)) / pixel.x + .5, 0., 1.);
        float columns = 0.;
        for (int i = 1; i < ${DISCOVERY_FLOOR_COLS}; i++) {
          float x = -uHalf.x + 2. * uHalf.x * float(i) / ${DISCOVERY_FLOOR_COLS}.;
          columns = max(columns, clamp((uThickness * .5 - abs(vLocal.x - x)) / pixel.x + .5, 0., 1.));
        }
        gl_FragColor = vec4(uColor, max(rows, columns * uColumns) * uOpacity);
        #include <colorspace_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), material);
  mesh.name = "floor-seams-to-list-dividers";
  // Render after both surfaces; depth testing still lets machines occlude seams.
  mesh.renderOrder = 2;
  return {
    mesh,
    update(morph: number, floor: number) {
      const rect = discoveryMorphRect(morph);
      uniforms.uHalf.value.set(rect.w / (2 * DISCOVERY_PHONE_SCALE), rect.d / (2 * DISCOVERY_PHONE_SCALE));
      uniforms.uRadius.value = discoveryCornerRadius(morph) / DISCOVERY_PHONE_SCALE;
      for (let i = 0; i < count; i++) {
        const seam = discoveryFloorSeamAt(morph, i);
        uniforms.uRows.value[i] = seam.y;
        uniforms.uLineHalfWidth.value = seam.halfWidth;
        uniforms.uThickness.value = seam.thickness;
      }
      const settle = smoothstep(morph / 0.52);
      uniforms.uColumns.value = 1 - settle;
      uniforms.uColor.value.copy(floorColor).lerp(dividerColor, settle);
      uniforms.uOpacity.value = floor;
      mesh.visible = floor > 0.001;
    },
  };
}
