import * as THREE from "three";
import {
  DISCOVERY_APP_TITLE,
  discoveryTitlePoseAt,
} from "./discoveryTimeline";

const TEX_W = 1024;
const TEX_H = 240;

function drawCaption(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.clearRect(0, 0, w, h);
  const { text, x, baseline, size, weight, boxX, boxY, boxW, boxH } = DISCOVERY_APP_TITLE;
  ctx.fillStyle = "#eff2ed";
  ctx.font = `${weight} ${(size / boxH) * h}px Inter, sans-serif`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(text, ((x - boxX) / boxW) * w, ((baseline - boxY) / boxH) * h);
}

/** Floor "Your gym" caption that travels into the in-app title. */
export function createDiscoveryTitle() {
  const image = document.createElement("canvas");
  image.width = TEX_W;
  image.height = TEX_H;
  drawCaption(image.getContext("2d")!, TEX_W, TEX_H);
  const texture = new THREE.CanvasTexture(image);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
    opacity: 0,
    polygonOffset: true,
    polygonOffsetFactor: -2,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.renderOrder = 3;
  mesh.name = "floor-title-your-gym";
  const root = new THREE.Group();
  root.name = "discovery-title";
  root.add(mesh);
  return {
    root,
    paintClean() {
      drawCaption(image.getContext("2d")!, TEX_W, TEX_H);
      texture.needsUpdate = true;
    },
    update(progress: number) {
      const pose = discoveryTitlePoseAt(progress);
      root.visible = pose.opacity > 0.001;
      if (!root.visible) return;
      root.position.set(pose.x, pose.y, pose.z);
      root.scale.set(pose.w, 1, pose.d);
      material.opacity = pose.opacity;
    },
    dispose() {
      texture.dispose();
      material.dispose();
      mesh.geometry.dispose();
    },
  };
}
