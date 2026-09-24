import * as THREE from "three";
import { floorIslandAt } from "./floorTimeline";

/** Fade and gently expand the real notch in place, independently of the floor. */
export function createFloorIsland(island: THREE.Mesh) {
  const root = new THREE.Group();
  root.name = "dynamic-island-entrance";
  root.add(island);
  const baseScale = island.scale.clone();
  const material = island.material as THREE.MeshBasicMaterial;
  material.transparent = true;
  material.depthWrite = false;
  island.renderOrder = 3;
  return {
    root,
    update(morph: number) {
      const { opacity, scale } = floorIslandAt(morph);
      root.visible = opacity > 0;
      material.opacity = opacity;
      island.scale.copy(baseScale).multiplyScalar(scale);
    },
  };
}
