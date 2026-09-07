import * as THREE from 'three'
import { PHONE_SCREEN_Z } from '../phoneModel'
import { disposeTree } from './dispose'
import { coachingPose, type CoachingFrame, type CoachingPose } from './coachingTimeline'
export type { CoachingFrame } from './coachingTimeline'

export interface CoachingState {
  frame: CoachingFrame
  paused: boolean
  customSrc: string
  replay: number
}

const SLOT_W = .852
const SLOT_H = .474

/** The logger stays attached to the original scan phone for the whole handoff. */
export function createCoachingContent() {
  const group = new THREE.Group()
  group.visible = false
  const canvas = document.createElement('canvas')
  canvas.width = 768; canvas.height = 1536
  const ctx = canvas.getContext('2d')!
  const loggerTexture = new THREE.CanvasTexture(canvas)
  loggerTexture.colorSpace = THREE.SRGBColorSpace
  loggerTexture.generateMipmaps = false
  loggerTexture.minFilter = THREE.LinearFilter
  const slotMaterial = new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true })
  const slot = new THREE.Mesh(new THREE.PlaneGeometry(SLOT_W, SLOT_H), slotMaterial)
  slot.position.set(0, .285, PHONE_SCREEN_Z + .01)
  group.add(slot)

  const posterTexture = new THREE.Texture()
  posterTexture.colorSpace = THREE.SRGBColorSpace
  posterTexture.generateMipmaps = false
  posterTexture.minFilter = THREE.LinearFilter
  const poster = new Image()
  let posterReady = false
  let disposed = false
  poster.onload = () => {
    if (disposed) return
    posterReady = true
    posterTexture.image = poster
    posterTexture.needsUpdate = true
    if (!slotMaterial.map) { slotMaterial.map = posterTexture; slotMaterial.needsUpdate = true }
    drawLogger(false)
  }
  poster.src = '/assets/gym3d/recording/pivot-leg-press-poster.webp'

  const videoTextures = new Map<HTMLVideoElement, THREE.VideoTexture>()
  function videoTexture(video: HTMLVideoElement | null) {
    if (!video || video.readyState < 2 || !video.videoWidth) return null
    let texture = videoTextures.get(video)
    if (!texture) {
      texture = new THREE.VideoTexture(video)
      texture.colorSpace = THREE.SRGBColorSpace
      texture.generateMipmaps = false
      texture.minFilter = THREE.LinearFilter
      videoTextures.set(video, texture)
    }
    return texture
  }

  function rect(x: number, y: number, w: number, h: number, color: string, radius = 0) {
    ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x, y, w, h, radius); ctx.fill()
  }
  function text(value: string, x: number, y: number, size: number, color = '#edf1ed', weight = 500, align: CanvasTextAlign = 'left') {
    ctx.font = `${weight} ${size}px Inter, sans-serif`; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(value, x, y); ctx.textAlign = 'left'
  }
  function drawLogger(docked: boolean) {
    rect(0, 0, 768, 1536, '#101510')
    text('9:41', 43, 54, 24, '#edf1ed', 600); text('•••  ▰', 637, 54, 23)
    text('‹', 40, 143, 53); text('WORKOUT LOGGER', 176, 132, 23, '#a4afa4'); text('•••', 657, 132, 26)
    text('Pivot Leg Press', 42, 227, 41, '#edf1ed', 600)
    text('Leg press · Machine', 43, 272, 24, '#a4afa4')
    rect(22, 309, 724, 424, '#172017', 12)
    if (!posterReady) { text('TRAINER INSTRUCTION', 384, 525, 22, '#a4afa4', 600, 'center') }
    text(docked ? 'YOUR GYM · TRAINER INSTRUCTION' : 'MOVEMENT GUIDE', 43, 790, 22, '#ccff00', 650)
    text('SET', 43, 876, 22, '#a4afa4'); text('PREVIOUS', 167, 876, 22, '#a4afa4'); text('KG', 441, 876, 22, '#a4afa4'); text('REPS', 588, 876, 22, '#a4afa4')
    for (let i = 0; i < 3; i++) {
      const y = 903 + i * 96; rect(24, y, 720, 80, i === 0 ? '#26341a' : '#1b221b', 10)
      text(String(i + 1), 50, y + 52, 29, i === 0 ? '#ccff00' : '#edf1ed'); text('80 kg × 10', 167, y + 51, 27, '#a4afa4'); text('80', 440, y + 51, 31); text('10', 590, y + 51, 31)
      if (i === 0) text('✓', 684, y + 51, 28, '#ccff00')
    }
    text('+ Add set', 300, 1238, 28, '#ccff00'); rect(27, 1310, 714, 91, '#ccff00', 15); text('Log set', 310, 1368, 31, '#101510', 600); rect(260, 1508, 248, 8, '#edf1ed', 4)
    loggerTexture.needsUpdate = true
  }

  let lastDocked = false
  function update(frame: CoachingFrame, mix: number, demo: HTMLVideoElement | null, custom: HTMLVideoElement | null): CoachingPose {
    const pose = coachingPose(frame)
    group.visible = mix > .001 && (pose.logger > .001 || pose.docked > .001)
    const opacity = mix * Math.max(pose.logger, pose.docked)
    slotMaterial.opacity = opacity
    if (pose.docked > .7 !== lastDocked) { lastDocked = pose.docked > .7; drawLogger(lastDocked) }
    const selected = pose.docked > .7 && custom && custom.readyState >= 2 ? custom : demo
    const map = videoTexture(selected) ?? posterTexture
    if (slotMaterial.map !== map) { slotMaterial.map = map; slotMaterial.needsUpdate = true }
    for (const [element, texture] of videoTextures) {
      if (element !== demo && element !== custom) { texture.dispose(); videoTextures.delete(element) }
    }
    return pose
  }

  drawLogger(false)
  return {
    group, texture: loggerTexture, update,
    dispose() {
      disposed = true; poster.onload = null; slotMaterial.map = null; group.removeFromParent(); disposeTree(group)
      videoTextures.forEach(texture => texture.dispose()); videoTextures.clear(); posterTexture.dispose(); loggerTexture.dispose()
    },
  }
}
