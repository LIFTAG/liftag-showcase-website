import * as THREE from "three";
import { discoveryIslandAt } from "./discoveryTimeline";

/** Fade and gently expand the real notch in place, independently of the floor. */
export function createDiscoveryIsland(island: THREE.Mesh) {
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
      const { opacity, scale } = discoveryIslandAt(morph);
      root.visible = opacity > 0;
      material.opacity = opacity;
      island.scale.copy(baseScale).multiplyScalar(scale);
    },
  };
}
