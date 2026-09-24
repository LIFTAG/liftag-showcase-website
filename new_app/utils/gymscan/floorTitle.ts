import * as THREE from "three";
import { FLOOR_APP_TITLE, floorTitlePoseAt } from "./floorTimeline";

const TEX_W = 1024;
const TEX_H = 240;

function drawCaption(ctx: CanvasRenderingContext2D, title: string) {
  ctx.clearRect(0, 0, TEX_W, TEX_H);
  const { x, baseline, size, weight, boxX, boxY, boxW, boxH } = FLOOR_APP_TITLE;
  ctx.fillStyle = "#eff2ed";
  ctx.font = `${weight} ${(size / boxH) * TEX_H}px Inter, sans-serif`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(title, ((x - boxX) / boxW) * TEX_W, ((baseline - boxY) / boxH) * TEX_H);
}

/** "Your gym" painted on the tiles, travelling into the in-app title. */
export function createFloorTitle(title: string) {
  const image = document.createElement("canvas");
  image.width = TEX_W;
  image.height = TEX_H;
  const ctx = image.getContext("2d")!;
  drawCaption(ctx, title);
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
  mesh.name = "floor-title";
  const root = new THREE.Group();
  root.add(mesh);
  return {
    root,
    paint(next: string) {
      drawCaption(ctx, next);
      texture.needsUpdate = true;
    },
    update(progress: number) {
      const pose = floorTitlePoseAt(progress);
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
