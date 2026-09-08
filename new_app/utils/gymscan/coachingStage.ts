import * as THREE from 'three';
import { PHONE_H, PHONE_SCREEN_Z } from '../phoneModel';
import { disposeTree } from './dispose';
import { coachingPose, type CoachingFrame } from './coachingTimeline';
export type { CoachingFrame } from './coachingTimeline';

export interface CoachingState {
  frame: CoachingFrame;
  paused: boolean;
  customSrc: string;
  replay: number;
}

const PICTURE_W = .852;
const PICTURE_H = .474;

/** Screen content attached to the original scan phone, with no second renderer. */
export function createCoachingContent() {
  const group = new THREE.Group();
  group.visible = false;
  function surface(width: number, height: number) {
    const image = document.createElement('canvas');
    image.width = width; image.height = height;
    const ctx = image.getContext('2d')!;
    const texture = new THREE.CanvasTexture(image);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    return { image, ctx, texture };
  }
  const logger = surface(768, 1536);
  const caption = surface(768, 84);
  const placement = surface(768, 474);
  const posterTexture = new THREE.Texture();
  posterTexture.colorSpace = THREE.SRGBColorSpace;
  posterTexture.generateMipmaps = false;
  posterTexture.minFilter = THREE.LinearFilter;
  const poster = new Image();
  let posterReady = false, lastBrand = false, lastCaption = false, lastHasCustom = false, lastReplay = 0, disposed = false;
  poster.onload = () => {
    if (disposed) return;
    posterReady = true;
    posterTexture.image = poster;
    posterTexture.needsUpdate = true;
    drawLogger(lastBrand);
    drawPlacement();
  };
  poster.src = '/assets/gym3d/bench-instruction.webp';
  function text(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, size: number, color = '#edf1ed', weight = 500, align: CanvasTextAlign = 'left') {
    ctx.font = `${weight} ${size}px Inter, sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(value, x, y);
    ctx.textAlign = 'left';
  }
  function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, radius = 0) {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.roundRect(x, y, w, h, radius); ctx.fill();
  }
  function drawLogger(branded: boolean) {
    const { ctx, texture } = logger;
    rect(ctx, 0, 0, 768, 1536, '#101510');
    text(ctx, '9:41', 43, 54, 24, '#edf1ed', 600);
    text(ctx, '•••  ▰', 637, 54, 23);
    text(ctx, '‹', 40, 143, 53);
    text(ctx, 'WORKOUT LOGGER', 176, 132, 23, '#a4afa4');
    text(ctx, '•••', 657, 132, 26);
    text(ctx, 'EZ-Bar Skullcrusher', 42, 227, 41, '#edf1ed', 600);
    text(ctx, 'Flat bench · EZ bar', 43, 272, 24, '#a4afa4');
    rect(ctx, 22, 309, 724, 479, '#1d271b', 12);
    if (posterReady) {
      ctx.globalAlpha = .35;
      ctx.drawImage(poster, 22, 350, 724, 404);
      ctx.globalAlpha = 1;
      text(ctx, '▷', 354, 586, 72, '#ccff00');
    }
    text(ctx, branded ? 'YOUR GYM’S VIDEO' : 'VIDEO GUIDE · INCLUDED', 43, 840, 22, '#ccff00');
    text(ctx, 'SET', 43, 926, 22, '#a4afa4');
    text(ctx, 'PREVIOUS', 167, 926, 22, '#a4afa4');
    text(ctx, 'KG', 441, 926, 22, '#a4afa4');
    text(ctx, 'REPS', 588, 926, 22, '#a4afa4');
    for (let i = 0; i < 3; i++) {
      const y = 953 + i * 96;
      rect(ctx, 24, y, 720, 80, i === 0 ? '#26341a' : '#1b221b', 10);
      text(ctx, String(i + 1), 50, y + 52, 29, i === 0 ? '#ccff00' : '#edf1ed');
      text(ctx, '20 kg × 12', 167, y + 51, 27, '#a4afa4');
      text(ctx, '20', 440, y + 51, 31);
      text(ctx, '12', 590, y + 51, 31);
      if (i === 0) text(ctx, '✓', 684, y + 51, 28, '#ccff00');
    }
    text(ctx, '+ Add set', 300, 1278, 28, '#ccff00');
    rect(ctx, 27, 1333, 714, 91, '#ccff00', 15);
    text(ctx, 'Log set', 310, 1391, 31, '#101510', 600);
    rect(ctx, 260, 1508, 248, 8, '#edf1ed', 4);
    texture.needsUpdate = true;
  }
  function drawPlacement() {
    const { ctx, texture } = placement;
    rect(ctx, 0, 0, 768, 474, '#172019');
    if (posterReady) {
      ctx.globalAlpha = .42;
      ctx.drawImage(poster, 0, 23, 768, 429);
      ctx.globalAlpha = 1;
    }
    const shade = ctx.createLinearGradient(0, 130, 0, 474);
    shade.addColorStop(0, 'rgba(9,16,10,0)');
    shade.addColorStop(1, 'rgba(9,16,10,.97)');
    ctx.fillStyle = shade; ctx.fillRect(0, 0, 768, 474);
    ctx.strokeStyle = '#d6ded4'; ctx.lineWidth = 2;
    for (const [x, y, sx, sy] of [[32, 32, 1, 1], [736, 32, -1, 1], [32, 442, 1, -1], [736, 442, -1, -1]]) {
      ctx.beginPath(); ctx.moveTo(x! + sx! * 30, y!); ctx.lineTo(x!, y!); ctx.lineTo(x!, y! + sy! * 30); ctx.stroke();
    }
    text(ctx, 'YOUR VIDEO HERE', 55, 68, 20, '#d6ded4', 600);
    text(ctx, 'Your trainer. This machine.', 55, 351, 37, '#edf1ed', 600);
    text(ctx, 'Film a guide. Make it part of every scan.', 55, 397, 23, '#b7c5b6');
    texture.needsUpdate = true;
  }
  function drawCaption(branded: boolean, hasCustom: boolean) {
    const { ctx, texture } = caption;
    rect(ctx, 0, 0, 768, 84, branded ? '#ccff00' : '#1c241b');
    const label = branded ? (hasCustom ? 'YOUR GYM’S VIDEO' : 'YOUR GYM’S VIDEO · PREVIEW') : 'LIFTAG · INCLUDED VIDEO GUIDE';
    text(ctx, label, 24, 52, 23, branded ? '#17200d' : '#d6ded4', 600);
    text(ctx, '↗', 714, 53, 28, branded ? '#17200d' : '#ccff00');
    texture.needsUpdate = true;
  }

  const root = new THREE.Group();
  group.add(root);
  const backing = new THREE.Mesh(new THREE.PlaneGeometry(.87, .612), new THREE.MeshBasicMaterial({ color: 0x101510, toneMapped: false, transparent: true }));
  const pictureMat = new THREE.MeshBasicMaterial({ map: posterTexture, toneMapped: false, transparent: true });
  const picture = new THREE.Mesh(new THREE.PlaneGeometry(PICTURE_W, PICTURE_H), pictureMat);
  picture.position.set(0, .056, .002);
  const captionMesh = new THREE.Mesh(new THREE.PlaneGeometry(.852, .094), new THREE.MeshBasicMaterial({ map: caption.texture, toneMapped: false, transparent: true }));
  captionMesh.position.set(0, -.233, .003);
  root.add(backing, picture, captionMesh);
  const corners = [new THREE.Vector3(-.435, .306, .004), new THREE.Vector3(.435, .306, .004), new THREE.Vector3(.435, -.306, .004), new THREE.Vector3(-.435, -.306, .004)];
  const edgeMat = new THREE.LineBasicMaterial({ color: 0xaab6a6, transparent: true, opacity: .65, toneMapped: false });
  root.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(corners), edgeMat));
  // Four fine projection rails make the video's origin legible in space.
  const railGeo = new THREE.BufferGeometry();
  const railPositions = new THREE.BufferAttribute(new Float32Array(24), 3);
  railPositions.setUsage(THREE.DynamicDrawUsage);
  railGeo.setAttribute('position', railPositions);
  const railMat = new THREE.LineBasicMaterial({ color: 0xa2b895, transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  const rails = new THREE.LineSegments(railGeo, railMat);
  rails.frustumCulled = false;
  group.add(rails);
  const textures = new Map<HTMLVideoElement, THREE.VideoTexture>();
  function videoMap(video: HTMLVideoElement | null) {
    if (!video || video.readyState < 2 || !video.videoWidth) return null;
    let texture = textures.get(video);
    if (!texture) {
      texture = new THREE.VideoTexture(video);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = false;
      textures.set(video, texture);
    }
    return texture;
  }
  const displayed: CoachingFrame = { member: 0, owner: 0, isOwner: false, reduced: false };
  const dock = new THREE.Vector3(0, .273, PHONE_SCREEN_Z + .008);
  const floating = new THREE.Vector3();
  const point = new THREE.Vector3();
  let initialized = false;
  let replaying = false;
  function update(frame: CoachingFrame, width: number, phoneHeight: number, dt: number, mix: number, video: HTMLVideoElement | null, own: HTMLVideoElement | null, replay: number) {
    group.visible = mix > .001;
    if (!group.visible) return;
    if (!initialized) { Object.assign(displayed, frame); initialized = true; }
    if (replay !== lastReplay) { lastReplay = replay; displayed.owner = 0; replaying = true; }
    const follow = frame.reduced ? 1 : 1 - Math.exp(-(replaying ? 1.4 : 8) * dt);
    displayed.member += (frame.member - displayed.member) * follow;
    displayed.owner += (frame.owner - displayed.owner) * follow;
    displayed.isOwner = frame.isOwner;
    displayed.reduced = frame.reduced;
    if (Math.abs(frame.owner - displayed.owner) < .004) replaying = false;
    const pose = coachingPose(displayed);
    const hasCustom = !!(own && own.readyState >= 2 && own.videoWidth);
    if (pose.branded !== lastBrand) { lastBrand = pose.branded; drawLogger(lastBrand); }
    if (pose.branded !== lastCaption || hasCustom !== lastHasCustom) {
      lastCaption = pose.branded; lastHasCustom = hasCustom;
      drawCaption(pose.branded, hasCustom);
    }
    for (const [element, texture] of textures) {
      if (element !== video && element !== own) { texture.dispose(); textures.delete(element); }
    }
    const source = pose.branded ? own : video;
    const map = videoMap(source) ?? (pose.branded ? placement.texture : posterTexture);
    if (pictureMat.map !== map) { pictureMat.map = map; pictureMat.needsUpdate = true; }
    // Contain portrait and landscape uploads without stretching or cutting off a rep.
    const aspect = source && source.readyState >= 2 && source.videoWidth ? source.videoWidth / source.videoHeight : (pose.branded ? 768 / 474 : 1080 / 603);
    const planeAspect = PICTURE_W / PICTURE_H;
    picture.scale.set(Math.min(1, aspect / planeAspect), Math.min(1, planeAspect / aspect), 1);
    const compact = width <= 760;
    const units = Math.max(phoneHeight, 1) / PHONE_H;
    const expandedWidth = Math.min(width * (compact ? .72 : .34), phoneHeight * (compact ? 1.1 : 1.05));
    const expandedScale = expandedWidth / (units * PICTURE_W);
    floating.set(-width * (compact ? .22 : .24) / units, compact ? -.08 : -.02, PHONE_SCREEN_Z + .14);
    const lift = pose.reveal;
    root.position.copy(dock).lerp(floating, lift);
    root.scale.setScalar(1 + (expandedScale - 1) * lift);
    // Change faces only at the edge-on instant. The reverse scroll is identical.
    const turn = pose.rewrite < .5 ? Math.PI * pose.rewrite : -Math.PI * (1 - pose.rewrite);
    root.rotation.set(0, frame.reduced ? 0 : turn + lift * .055, 0);
    root.updateMatrix();
    for (let i = 0; i < corners.length; i++) {
      point.copy(corners[i]!).add(dock);
      railPositions.setXYZ(i * 2, point.x, point.y, point.z - .006);
      point.copy(corners[i]!).applyMatrix4(root.matrix);
      railPositions.setXYZ(i * 2 + 1, point.x, point.y, point.z - .006);
    }
    railPositions.needsUpdate = true;
    rails.visible = lift > .04 && !frame.reduced;
    railMat.opacity = mix * lift * (compact ? .1 : .18);
    edgeMat.color.setHex(pose.branded ? 0xccff00 : 0xaab6a6);
    edgeMat.opacity = mix * (.22 + lift * .38);
    backing.material.opacity = pictureMat.opacity = captionMesh.material.opacity = mix;
  }
  drawLogger(false);
  drawCaption(false, false);
  drawPlacement();
  return {
    group, texture: logger.texture, update,
    dispose() {
      disposed = true;
      poster.onload = null;
      pictureMat.map = null;
      group.removeFromParent();
      disposeTree(group);
      // disposeTree handles Mesh resources; these line resources have their own owner.
      root.children.forEach(child => { if (child instanceof THREE.LineLoop) child.geometry.dispose(); });
      edgeMat.dispose(); railGeo.dispose(); railMat.dispose();
      textures.forEach(texture => texture.dispose()); textures.clear();
      posterTexture.dispose(); logger.texture.dispose(); placement.texture.dispose();
    },
  };
}
