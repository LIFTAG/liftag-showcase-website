import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { TessellateModifier } from "three/examples/jsm/modifiers/TessellateModifier.js";
import { discoveryCountries } from "./discoveryCountries.ts";

/** Vector detail takes over from the world dots as the camera reaches Slovakia. */
export function createDiscoveryRegion(
  project: (lat: number, lng: number, radius: number) => THREE.Vector3,
  radius: number,
) {
  const root = new THREE.Group();
  root.name = "slovakia-region";
  const tessellate = new TessellateModifier(0.4, 8);
  const fill = new THREE.MeshBasicMaterial({
    color: 0x1b3028, transparent: true, opacity: 0, depthWrite: false,
    toneMapped: false, side: THREE.DoubleSide,
  });
  const slovakiaFill = fill.clone();
  slovakiaFill.color.set(0x394a23);
  const border = new THREE.LineBasicMaterial({
    color: 0x719082, transparent: true, opacity: 0, depthWrite: false,
    toneMapped: false,
  });
  const slovakiaBorder = border.clone();
  slovakiaBorder.color.set(0xccff57);
  const otherFills: THREE.BufferGeometry[] = [];
  const focusFills: THREE.BufferGeometry[] = [];
  const otherLines: THREE.Vector3[] = [];
  const focusLines: THREE.Vector3[] = [];
  for (const country of discoveryCountries) {
    const focus = country.name === "Slovakia";
    for (const ring of country.rings) {
      const shape = new THREE.Shape(ring.map(([lng, lat]) => new THREE.Vector2(lng, lat)));
      const flat = new THREE.ShapeGeometry(shape);
      const geometry = tessellate.modify(flat);
      flat.dispose();
      const positions = geometry.getAttribute("position");
      for (let i = 0; i < positions.count; i++) {
        const p = project(positions.getY(i), positions.getX(i), radius + 0.004);
        positions.setXYZ(i, p.x, p.y, p.z);
      }
      geometry.computeBoundingSphere();
      (focus ? focusFills : otherFills).push(geometry);
      const lines = focus ? focusLines : otherLines;
      for (let i = 1; i < ring.length; i++) {
        const a = ring[i - 1]!, b = ring[i]!;
        const steps = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.2));
        for (let step = 0; step < steps; step++) {
          for (const t of [step / steps, (step + 1) / steps])
            lines.push(project(THREE.MathUtils.lerp(a[1], b[1], t), THREE.MathUtils.lerp(a[0], b[0], t), radius + 0.007));
        }
      }
    }
  }
  for (const [geometries, material] of [[otherFills, fill], [focusFills, slovakiaFill]] as const) {
    const mesh = new THREE.Mesh(mergeGeometries([...geometries])!, material);
    geometries.forEach(geometry => geometry.dispose());
    mesh.renderOrder = 1;
    root.add(mesh);
  }
  for (const [points, material] of [[otherLines, border], [focusLines, slovakiaBorder]] as const) {
    const lines = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(points), material);
    lines.renderOrder = 2;
    root.add(lines);
  }
  return {
    root,
    update(focus: number, amount: number) {
      const reveal = THREE.MathUtils.smoothstep(focus, 0.3, 0.86) * amount;
      root.visible = reveal > 0.001;
      fill.opacity = reveal * 0.72;
      slovakiaFill.opacity = reveal * 0.9;
      border.opacity = reveal * 0.26;
      slovakiaBorder.opacity = reveal * 0.85;
    },
  };
}
