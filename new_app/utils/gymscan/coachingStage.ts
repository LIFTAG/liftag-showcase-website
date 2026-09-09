import * as THREE from "three";
import { coverFitScreenUVs } from "../macbookScreen";
import {
  PHONE_ISLAND,
  PHONE_SCR_H,
  PHONE_SCR_W,
  PHONE_SCREEN_Z,
  phoneScreenHeaderGeometry,
} from "../phoneModel";
import { disposeTree } from "./dispose";
import { coachingPose, coachingUiAt, type CoachingFrame } from "./coachingTimeline";
import {
  COACHING_WIPE_EDGE,
  COACHING_WIPE_FRAG,
  COACHING_WIPE_VERT,
  coachingOverlayIsGym,
  coachingWipeTravel,
} from "./coachingWipe";
export type { CoachingFrame } from "./coachingTimeline";

export interface CoachingState {
  frame: CoachingFrame;
  paused: boolean;
  customSrc: string;
  replay: number;
}

const CANVAS_W = 768;
const CANVAS_H = 1536;
const HEADER_RATIO = 0.4;
const PICTURE_W = PHONE_SCR_W;
const PICTURE_H = PHONE_SCR_H * HEADER_RATIO;

function surface(width: number, height: number) {
  const image = document.createElement("canvas");
  image.width = width;
  image.height = height;
  const ctx = image.getContext("2d")!;
  const texture = new THREE.CanvasTexture(image);
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  return { image, ctx, texture };
}

function text(
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  size: number,
  color = "#edf1ed",
  weight = 500,
  align: CanvasTextAlign = "left",
) {
  ctx.font = `${weight} ${size}px Inter, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(value, x, y);
  ctx.textAlign = "left";
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  radius = 0,
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fill();
}

function coverDraw(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  x: number,
  y: number,
  w: number,
  h: number,
  srcW: number,
  srcH: number,
) {
  const uv = coverFitScreenUVs({
    sourceWidth: srcW,
    sourceHeight: srcH,
    screenWidth: w,
    screenHeight: h,
  });
  ctx.drawImage(
    image,
    uv.offsetX * srcW,
    (1 - uv.offsetY - uv.repeatY) * srcH,
    uv.repeatX * srcW,
    uv.repeatY * srcH,
    x,
    y,
    w,
    h,
  );
}

function applyCover(
  texture: THREE.Texture,
  srcW: number,
  srcH: number,
) {
  const uv = coverFitScreenUVs({
    sourceWidth: srcW,
    sourceHeight: srcH,
    screenWidth: PICTURE_W,
    screenHeight: PICTURE_H,
  });
  texture.offset.set(uv.offsetX, uv.offsetY);
  texture.repeat.set(uv.repeatX, uv.repeatY);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
}

function resetCover(texture: THREE.Texture) {
  texture.offset.set(0, 0);
  texture.repeat.set(1, 1);
}

/** Screen content attached to the scan phone. The video stays on the glass. */
export function createCoachingContent() {
  const group = new THREE.Group();
  group.visible = false;
  const logger = surface(CANVAS_W, CANVAS_H);
  const overlay = surface(CANVAS_W, Math.round(CANVAS_H * HEADER_RATIO));
  const placement = surface(CANVAS_W, Math.round(CANVAS_H * HEADER_RATIO));
  const posterTexture = new THREE.Texture();
  posterTexture.colorSpace = THREE.SRGBColorSpace;
  posterTexture.generateMipmaps = false;
  posterTexture.minFilter = THREE.LinearFilter;
  const poster = new Image();
  let posterReady = false;
  let lastBrand = false;
  let lastHasCustom = false;
  let lastReplay = 0;
  let disposed = false;
  poster.onload = () => {
    if (disposed) return;
    posterReady = true;
    posterTexture.image = poster;
    posterTexture.needsUpdate = true;
    drawLogger(lastBrand);
    drawOverlay(lastBrand, lastHasCustom);
    drawPlacement();
  };
  poster.src = "/assets/gym3d/bench-instruction.webp";

  function drawLogger(branded: boolean) {
    const { ctx, texture } = logger;
    roundRect(ctx, 0, 0, CANVAS_W, CANVAS_H, "#101510");
    const header = CANVAS_H * HEADER_RATIO;
    roundRect(ctx, 0, 0, CANVAS_W, header, "#161c16");
    text(ctx, "LOG SET", 40, header + 72, 20, "#9da79e");
    text(ctx, "1 / 3 sets", 728, header + 72, 20, "#ccff00", 500, "right");
    text(ctx, "WEIGHT", 40, header + 128, 18, "#9da79e");
    text(ctx, "REPS", 400, header + 128, 18, "#9da79e");
    text(ctx, "20", 40, header + 214, 64, "#edf1ed", 600);
    text(ctx, "kg", 148, header + 214, 24, "#9da79e");
    text(ctx, "12", 400, header + 214, 64, "#edf1ed", 600);
    text(ctx, "reps", 508, header + 214, 24, "#9da79e");
    roundRect(ctx, 40, header + 268, 688, 96, "#ccff00", 48);
    text(ctx, "Log set", 384, header + 330, 32, "#101510", 600, "center");
    roundRect(ctx, 40, header + 396, 688, 84, branded ? "#26341a" : "#1b221b", 16);
    text(ctx, "#1", 64, header + 448, 26, "#9da79e");
    text(ctx, "20 kg × 12", 140, header + 448, 26);
    text(ctx, "✓", 684, header + 448, 26, "#ccff00");
    roundRect(ctx, 260, 1508, 248, 8, "#edf1ed", 4);
    texture.needsUpdate = true;
  }

  function drawOverlay(branded: boolean, hasCustom: boolean) {
    const { ctx, image, texture } = overlay;
    ctx.clearRect(0, 0, image.width, image.height);
    const h = image.height;
    const shade = ctx.createLinearGradient(0, h * 0.45, 0, h);
    shade.addColorStop(0, "rgba(16,21,16,0)");
    shade.addColorStop(1, "rgba(16,21,16,0.92)");
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, image.width, h);
    text(ctx, "9:41", 40, 48, 22, "#edf1ed", 600);
    text(ctx, "•••  ▰", 700, 48, 22, "#edf1ed", 500, "right");
    const label = branded
      ? hasCustom
        ? "YOUR GYM’S VIDEO"
        : "YOUR GYM · PREVIEW"
      : "LIFTAG GUIDE";
    const pillW = branded ? (hasCustom ? 232 : 220) : 168;
    roundRect(ctx, 36, h - 118, pillW, 40, branded ? "#ccff00" : "#1d271b", 20);
    text(
      ctx,
      label,
      36 + pillW / 2,
      h - 91,
      16,
      branded ? "#101510" : "#ccff00",
      600,
      "center",
    );
    text(
      ctx,
      branded && !hasCustom ? "Your trainer on this machine." : "EZ-Bar Skullcrusher",
      40,
      h - 36,
      branded && !hasCustom ? 26 : 32,
      "#edf1ed",
      600,
    );
    texture.needsUpdate = true;
  }

  function drawPlacement() {
    const { ctx, image, texture } = placement;
    roundRect(ctx, 0, 0, image.width, image.height, "#121812");
    if (posterReady) {
      ctx.globalAlpha = 0.28;
      coverDraw(
        ctx,
        poster,
        0,
        0,
        image.width,
        image.height,
        poster.naturalWidth || 1080,
        poster.naturalHeight || 603,
      );
      ctx.globalAlpha = 1;
    }
    const shade = ctx.createLinearGradient(0, image.height * 0.2, 0, image.height);
    shade.addColorStop(0, "rgba(10,14,10,0.35)");
    shade.addColorStop(1, "rgba(10,14,10,0.82)");
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, image.width, image.height);
    texture.needsUpdate = true;
  }

  const wipeMat = new THREE.ShaderMaterial({
    vertexShader: COACHING_WIPE_VERT,
    fragmentShader: COACHING_WIPE_FRAG,
    uniforms: {
      tLibrary: { value: posterTexture },
      tGym: { value: placement.texture },
      uLibraryUv: { value: new THREE.Matrix3() },
      uGymUv: { value: new THREE.Matrix3() },
      uWipe: { value: 0 },
      uOpacity: { value: 1 },
      uEdge: { value: new THREE.Vector3(...COACHING_WIPE_EDGE) },
    },
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
  const overlayMat = new THREE.MeshBasicMaterial({
    map: overlay.texture,
    toneMapped: false,
    transparent: true,
    depthWrite: false,
  });
  const headerGeo = phoneScreenHeaderGeometry(PICTURE_H);
  const picture = new THREE.Mesh(headerGeo, wipeMat);
  const overlayMesh = new THREE.Mesh(headerGeo, overlayMat);
  // Sit on the glass, behind the island, so the pill reads as hardware.
  const videoZ = (PHONE_SCREEN_Z + PHONE_ISLAND.z) / 2;
  picture.position.set(0, 0, videoZ);
  overlayMesh.position.set(0, 0, videoZ + 0.0004);
  picture.renderOrder = 1;
  overlayMesh.renderOrder = 2;
  group.add(picture, overlayMesh);

  const textures = new Map<HTMLVideoElement, THREE.VideoTexture>();
  function videoMap(video: HTMLVideoElement | null) {
    if (!video || video.readyState < 2 || !video.videoWidth) return null;
    let mapped = textures.get(video);
    if (!mapped) {
      mapped = new THREE.VideoTexture(video);
      mapped.colorSpace = THREE.SRGBColorSpace;
      mapped.generateMipmaps = false;
      mapped.minFilter = THREE.LinearFilter;
      textures.set(video, mapped);
    }
    return mapped;
  }

  const displayed: CoachingFrame = {
    member: 0,
    owner: 0,
    isOwner: false,
    reduced: false,
  };
  let initialized = false;
  let wipe = 0;

  function bindMap(
    map: { value: THREE.Texture | null },
    uv: { value: THREE.Matrix3 },
    texture: THREE.Texture,
  ) {
    map.value = texture;
    texture.updateMatrix();
    uv.value.copy(texture.matrix);
  }

  function update(
    frame: CoachingFrame,
    _width: number,
    _phoneHeight: number,
    dt: number,
    mix: number,
    video: HTMLVideoElement | null,
    own: HTMLVideoElement | null,
    replay: number,
  ) {
    group.visible = mix > 0.001;
    if (!group.visible) return 0;
    if (!initialized) {
      Object.assign(displayed, frame);
      initialized = true;
    }
    if (replay !== lastReplay) {
      lastReplay = replay;
      wipe = coachingUiAt(frame).isGymVideo ? 0 : 1;
    }
    const follow = frame.reduced ? 1 : 1 - Math.exp(-8 * dt);
    displayed.member += (frame.member - displayed.member) * follow;
    displayed.owner += (frame.owner - displayed.owner) * follow;
    displayed.isOwner = frame.isOwner;
    displayed.reduced = frame.reduced;
    const pose = coachingPose(displayed);
    const wantGym = coachingUiAt(frame).isGymVideo;
    const wipeFollow = frame.reduced ? 1 : 1 - Math.exp(-2.55 * dt);
    wipe += ((wantGym ? 1 : 0) - wipe) * wipeFollow;
    const hasCustom = !!(own && own.readyState >= 2 && own.videoWidth);
    if (hasCustom && !lastHasCustom && wipe > 0.5) wipe = 0.38;
    const overlayGym = coachingOverlayIsGym(wipe);
    if (overlayGym !== lastBrand || hasCustom !== lastHasCustom) {
      const brandChanged = overlayGym !== lastBrand;
      lastBrand = overlayGym;
      lastHasCustom = hasCustom;
      if (brandChanged) drawLogger(overlayGym);
      drawOverlay(overlayGym, hasCustom);
    }
    for (const [element, mapped] of textures) {
      if (element !== video && element !== own) {
        mapped.dispose();
        textures.delete(element);
      }
    }
    const libraryLive = videoMap(video);
    if (libraryLive && video) applyCover(libraryLive, video.videoWidth, video.videoHeight);
    else applyCover(posterTexture, poster.naturalWidth || 1080, poster.naturalHeight || 603);
    bindMap(
      wipeMat.uniforms.tLibrary!,
      wipeMat.uniforms.uLibraryUv!,
      libraryLive ?? posterTexture,
    );
    const gymLive = videoMap(own);
    if (gymLive && own) applyCover(gymLive, own.videoWidth, own.videoHeight);
    else resetCover(placement.texture);
    bindMap(
      wipeMat.uniforms.tGym!,
      wipeMat.uniforms.uGymUv!,
      gymLive ?? placement.texture,
    );
    wipeMat.uniforms.uWipe!.value = coachingWipeTravel(wipe);
    wipeMat.uniforms.uOpacity!.value = mix;
    overlayMat.opacity = mix;
    return pose.reveal * mix;
  }

  drawLogger(false);
  drawOverlay(false, false);
  drawPlacement();
  return {
    group,
    texture: logger.texture,
    update,
    dispose() {
      disposed = true;
      poster.onload = null;
      wipeMat.uniforms.tLibrary!.value = null;
      wipeMat.uniforms.tGym!.value = null;
      overlayMat.map = null;
      group.removeFromParent();
      disposeTree(group);
      textures.forEach((mapped) => mapped.dispose());
      textures.clear();
      posterTexture.dispose();
      logger.texture.dispose();
      overlay.texture.dispose();
      placement.texture.dispose();
    },
  };
}
