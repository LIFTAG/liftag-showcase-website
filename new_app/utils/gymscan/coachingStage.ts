import * as THREE from 'three';
import { PHONE_SCREEN_Z } from '../phoneModel';
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
  const chips = surface(768, 474);
  const caption = surface(768, 84);
  const placement = surface(768, 474);
  const posterTexture = new THREE.Texture();
  posterTexture.colorSpace = THREE.SRGBColorSpace;
  posterTexture.generateMipmaps = false;
  posterTexture.minFilter = THREE.LinearFilter;
  const poster = new Image();
  let posterReady = false, lastBrand = false, lastCaption = false, lastHasCustom = false, lastChip = '', lastReplay = 0, disposed = false;
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
    text(ctx, branded ? 'YOUR GYM’S INSTRUCTIONS' : 'VIDEO INSTRUCTIONS', 43, 840, 22, '#ccff00');
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
    const { ctx, image, texture } = placement;
    const w = image.width, h = image.height;
    rect(ctx, 0, 0, w, h, '#101510');
    if (posterReady) {
      const scale = Math.max(w / poster.width, h / poster.height);
      const dw = poster.width * scale, dh = poster.height * scale;
      ctx.filter = 'grayscale(1)';
      ctx.globalAlpha = .16;
      ctx.drawImage(poster, (w - dw) / 2, (h - dh) / 2, dw, dh);
      ctx.filter = 'none';
      ctx.globalAlpha = 1;
    }
    rect(ctx, 0, 0, w, h, 'rgba(8,12,8,0.55)');
    ctx.strokeStyle = '#ccff00';
    ctx.lineWidth = 4;
    ctx.setLineDash([18, 12]);
    ctx.beginPath(); ctx.roundRect(26, 22, w - 52, h - 44, 16); ctx.stroke();
    ctx.setLineDash([]);
    const cx = w / 2, cy = h / 2 - 28;
    ctx.beginPath();
    ctx.arc(cx, cy - 8, 34, 0, Math.PI * 2);
    ctx.fillStyle = '#ccff00';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy - 24);
    ctx.lineTo(cx - 10, cy + 8);
    ctx.lineTo(cx + 18, cy - 8);
    ctx.closePath();
    ctx.fillStyle = '#17200d';
    ctx.fill();
    text(ctx, 'YOUR TRAINER’S VIDEO', cx, cy + 56, 30, '#edf1ed', 600, 'center');
    text(ctx, 'Preview a clip from this device', cx, cy + 90, 20, '#a4afa4', 500, 'center');
    texture.needsUpdate = true;
  }
  function chip(ctx: CanvasRenderingContext2D, x: number, y: number, label: string, fill: string, color: string, alpha: number, right = false) {
    if (alpha < .04) return;
    ctx.globalAlpha = Math.min(1, alpha + .15);
    ctx.font = '700 22px Inter, sans-serif';
    const pad = 16, height = 42, width = ctx.measureText(label).width + pad * 2;
    const left = right ? x - width : x;
    ctx.fillStyle = fill;
    ctx.beginPath(); ctx.roundRect(left, y, width, height, 7); ctx.fill();
    ctx.fillStyle = color;
    ctx.fillText(label, left + pad, y + 28);
    ctx.globalAlpha = 1;
  }
  function drawChips(rewrite: number, hasCustom: boolean) {
    const { ctx, image, texture } = chips;
    ctx.clearRect(0, 0, image.width, image.height);
    const gymLabel = hasCustom ? 'YOUR CLIP' : 'YOUR GYM';
    chip(ctx, 18, 16, 'LIFTAG SAMPLE', '#1c241b', '#ccff00', 1 - rewrite);
    chip(ctx, image.width - 18, 16, gymLabel, '#ccff00', '#17200d', rewrite, true);
    texture.needsUpdate = true;
  }
  function drawCaption(branded: boolean, hasCustom: boolean) {
    const { ctx, texture } = caption;
    rect(ctx, 0, 0, 768, 84, branded ? '#ccff00' : '#1c241b');
    const label = branded
      ? (hasCustom ? 'YOUR GYM · YOUR CLIP' : 'YOUR GYM · TRAINER SLOT')
      : 'LIFTAG · EXERCISE INSTRUCTIONS';
    text(ctx, label, 22, 51, 22, branded ? '#17200d' : '#ccff00', 600);
    texture.needsUpdate = true;
  }

  const backing = new THREE.Mesh(new THREE.PlaneGeometry(.856, .596), new THREE.MeshBasicMaterial({ color: 0x101510, toneMapped: false, transparent: true }));
  const catalogMat = new THREE.MeshBasicMaterial({ map: posterTexture, toneMapped: false, transparent: true });
  const gymMat = new THREE.MeshBasicMaterial({ map: placement.texture, toneMapped: false, transparent: true, depthWrite: false });
  const scanMat = new THREE.MeshBasicMaterial({ color: 0xccff00, toneMapped: false, transparent: true, depthWrite: false });
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xccff00, toneMapped: false, transparent: true, depthWrite: false, opacity: .28 });
  const catalog = new THREE.Mesh(new THREE.PlaneGeometry(PICTURE_W, PICTURE_H), catalogMat);
  const gym = new THREE.Mesh(new THREE.PlaneGeometry(PICTURE_W, PICTURE_H), gymMat);
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(PICTURE_W, .008), scanMat);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(PICTURE_W, .028), glowMat);
  catalog.position.set(0, .056, .002);
  gym.position.set(0, .056, .003);
  scan.position.set(0, .056, .0035);
  glow.position.set(0, .056, .0034);
  const chipMesh = new THREE.Mesh(new THREE.PlaneGeometry(PICTURE_W, PICTURE_H), new THREE.MeshBasicMaterial({ map: chips.texture, toneMapped: false, transparent: true, depthWrite: false }));
  chipMesh.position.set(0, .056, .004);
  const captionMesh = new THREE.Mesh(new THREE.PlaneGeometry(.852, .094), new THREE.MeshBasicMaterial({ map: caption.texture, toneMapped: false, transparent: true }));
  captionMesh.position.set(0, -.233, .003);
  const root = new THREE.Group();
  root.add(backing, catalog, gym, glow, scan, chipMesh, captionMesh);
  group.add(root);
  const overlayMats = [backing.material, catalogMat, gymMat, captionMesh.material, chipMesh.material] as THREE.MeshBasicMaterial[];
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
  const displayed = { member: 0, owner: 0 };
  const dock = new THREE.Vector3(0, .273, PHONE_SCREEN_Z + .008);
  const floating = new THREE.Vector3();
  function update(frame: CoachingFrame, width: number, phoneHeight: number, dt: number, mix: number, video: HTMLVideoElement | null, own: HTMLVideoElement | null, replay: number) {
    group.visible = mix > .001;
    if (!group.visible) return;
    if (replay !== lastReplay) {
      lastReplay = replay;
      displayed.owner = 0;
    }
    const memberFollow = frame.reduced ? 1 : 1 - Math.exp(-18 * dt);
    const ownerGap = Math.abs(frame.owner - displayed.owner);
    const ownerFollow = frame.reduced ? 1 : 1 - Math.exp(-(ownerGap > .4 ? 1.7 : 18) * dt);
    displayed.member += (frame.member - displayed.member) * memberFollow;
    displayed.owner += (frame.owner - displayed.owner) * ownerFollow;
    const pose = coachingPose({ ...frame, ...displayed });
    const hasCustom = !!(own && own.readyState >= 2 && own.videoWidth);
    if (pose.branded !== lastBrand) {
      lastBrand = pose.branded;
      drawLogger(pose.branded);
    }
    const captionSlot = pose.rewrite > .45;
    if (captionSlot !== lastCaption || hasCustom !== lastHasCustom) {
      lastCaption = captionSlot;
      lastHasCustom = hasCustom;
      drawCaption(captionSlot, hasCustom);
    }
    const chipKey = `${pose.rewrite.toFixed(2)}:${hasCustom ? 1 : 0}`;
    if (chipKey !== lastChip) {
      lastChip = chipKey;
      drawChips(pose.rewrite, hasCustom);
    }
    for (const [element, texture] of textures) {
      if (element !== video && element !== own) { texture.dispose(); textures.delete(element); }
    }
    const catalogMap = videoMap(video) ?? posterTexture;
    const gymMap = videoMap(own) ?? placement.texture;
    if (catalogMat.map !== catalogMap) { catalogMat.map = catalogMap; catalogMat.needsUpdate = true; }
    if (gymMat.map !== gymMap) {
      if (gymMat.map) { gymMat.map.repeat.set(1, 1); gymMat.map.offset.set(0, 0); }
      gymMat.map = gymMap; gymMat.needsUpdate = true;
    }
    catalog.visible = pose.rewrite < .98;
    gym.visible = pose.rewrite > .001;
    const scanning = pose.rewrite > .02 && pose.rewrite < .98;
    scan.visible = glow.visible = scanning;
    scanMat.opacity = mix;
    glowMat.opacity = mix * .28;
    const live = video && video.readyState >= 2 && video.videoWidth ? video : null;
    const aspect = live ? live.videoWidth / live.videoHeight : 1080 / 603;
    const plane = PICTURE_W / PICTURE_H;
    const scaleX = Math.min(1, aspect / plane), scaleY = Math.min(1, plane / aspect);
    const compact = width <= 760;
    catalog.scale.set(scaleX, scaleY, 1);
    chipMesh.scale.copy(catalog.scale);
    chipMesh.visible = !compact && pose.reveal > .15;
    const rewrite = Math.max(pose.rewrite, 0.001);
    gym.scale.set(scaleX, scaleY * rewrite, 1);
    gym.position.y = catalog.position.y + PICTURE_H * scaleY * .5 * (1 - pose.rewrite);
    gymMap.wrapS = THREE.ClampToEdgeWrapping;
    gymMap.wrapT = THREE.ClampToEdgeWrapping;
    if (pose.rewrite <= .001) {
      gymMap.repeat.set(1, 1);
      gymMap.offset.set(0, 0);
    } else {
      gymMap.repeat.set(1, rewrite);
      gymMap.offset.set(0, 1 - pose.rewrite);
    }
    const pictureTop = catalog.position.y + PICTURE_H * scaleY * .5;
    const scanY = pictureTop - pose.rewrite * PICTURE_H * scaleY;
    scan.position.y = glow.position.y = scanY;
    scan.scale.set(scaleX, 1, 1);
    glow.scale.set(scaleX, 1, 1);
    const separation = compact ? .04 : Math.min(1.8, width / Math.max(phoneHeight, 1) * .52);
    floating.set(-separation, compact ? .3 : .45, PHONE_SCREEN_Z + .16);
    const lift = compact ? pose.reveal * .18 : pose.reveal;
    root.position.copy(dock).lerp(floating, lift);
    root.scale.setScalar(1 + lift * (compact ? .12 : .55));
    root.rotation.set(0, lift * .08, 0);
    overlayMats.forEach(material => { material.opacity = mix; });
  }
  drawLogger(false);
  drawCaption(false, false);
  drawPlacement();
  drawChips(0, false);
  return {
    group, texture: logger.texture, update,
    dispose() {
      disposed = true;
      poster.onload = null;
      catalogMat.map = null;
      gymMat.map = null;
      group.removeFromParent();
      disposeTree(group);
      textures.forEach(texture => texture.dispose());
      textures.clear();
      posterTexture.dispose();
      logger.texture.dispose();
      placement.texture.dispose();
    },
  };
}
