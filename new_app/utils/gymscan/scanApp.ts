// Pivot Leg Press scan-to-log footage for the gym-scan phone screen.
//
// After the QR lock, the 3D room on the phone yields to a procedural capture
// of the same machine: the scanner morph of the settled Pivot Leg Press
// sticker into the log-set cockpit. Wall-clock playback, not scroll-tied,
// so the morph stays snappy even if the user pauses on the phone. The gym
// composer is already off by the time this covers the screen. ScanSection
// keeps the real-gym bench footage.
import * as THREE from 'three'
import { coverFitScreenUVs, type ScreenTextureUVs } from '../macbookScreen.ts'
import { PHONE_SCR_H, PHONE_SCR_W } from '../phoneModel.ts'
import { GYM_SCAN_FLOW_SOURCES, SCAN_FLOW_LOG } from '../scanFlow.ts'
import {
  createScreenVideoElement,
  createSegmentPlayback,
  type ScreenVideoSegment,
} from '../screenVideo.ts'
import { APP_PLAY_AT, APP_STILL_SRC, appScreenMix } from './scanAppPass.ts'
export {
  APP_BLEND_SEC,
  APP_PLAY_AT,
  APP_STILL_SRC,
  STICKER_FOCUS_CORNER_FRAC,
  STICKER_FOCUS_FEATHER,
  STICKER_FOCUS_LOD,
  STICKER_FOCUS_PAD,
  STICKER_FOCUS_RADIUS_PX,
  VIDEO_QR_ANCHOR,
  appScreenMix,
  canvasUvFromCssBox,
  gymQrUvBox,
  gymScreenOffset,
  phoneFocusBlur,
  stickerFocusOutside,
} from './scanAppPass.ts'

const IDENTITY_UV: ScreenTextureUVs = {
  offsetX: 0,
  offsetY: 0,
  repeatX: 1,
  repeatY: 1,
}

function coverUVs(width: number, height: number): ScreenTextureUVs {
  return coverFitScreenUVs({
    sourceWidth: width,
    sourceHeight: height,
    screenWidth: PHONE_SCR_W,
    screenHeight: PHONE_SCR_H,
  })
}

function configureDisplayTexture(texture: THREE.Texture) {
  // The overlay shader writes display values as-is (the gym composite has
  // already run AgX + the sRGB encode). Sampling an sRGB-tagged texture
  // would GPU-decode to linear and the log UI would land too dark.
  texture.colorSpace = THREE.NoColorSpace
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true
}

export type ScanAppScreen = {
  texture: THREE.Texture
  uvs: ScreenTextureUVs
  ready: boolean
  sync: (scene: number, dt: number) => number
  dispose: () => void
}

export function createScanAppScreen(opts: {
  reducedMotion: boolean
  onReady?: () => void
}): ScanAppScreen {
  const placeholder = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1)
  configureDisplayTexture(placeholder)

  let texture: THREE.Texture = placeholder
  let uvs: ScreenTextureUVs = IDENTITY_UV
  let ready = false
  let disposed = false
  let lastActive = false
  let holdSec = 0
  let cycle = 0
  let video: HTMLVideoElement | null = null
  let playback: ReturnType<typeof createSegmentPlayback> | null = null
  let stillImage: HTMLImageElement | null = null
  let onVis: (() => void) | null = null
  let onMeta: (() => void) | null = null
  let onFrame: (() => void) | null = null

  const announce = () => {
    if (disposed || ready) return
    ready = true
    opts.onReady?.()
  }

  function bindTexture(next: THREE.Texture, nextUvs: ScreenTextureUVs) {
    const prev = texture
    texture = next
    uvs = nextUvs
    configureDisplayTexture(texture)
    if (prev !== next) prev.dispose()
  }

  function armSegment(): ScreenVideoSegment {
    cycle += 1
    return { ...SCAN_FLOW_LOG, key: cycle }
  }

  if (opts.reducedMotion) {
    const image = new Image()
    stillImage = image
    image.decoding = 'async'
    image.onload = () => {
      if (disposed) return
      const map = new THREE.Texture(image)
      bindTexture(map, coverUVs(image.naturalWidth || 393, image.naturalHeight || 852))
      announce()
    }
    image.onerror = () => announce()
    image.src = APP_STILL_SRC
  } else {
    video = createScreenVideoElement(GYM_SCAN_FLOW_SOURCES)
    const videoTexture = new THREE.VideoTexture(video)
    configureDisplayTexture(videoTexture)

    onMeta = () => {
      if (disposed || !video) return
      // Park on the LOG keyframe so the first painted frame is the flattened
      // code, not the TAP/SCAN viewfinder. createSegmentPlayback will see it
      // is already on the cut and play() without seeking — the path that
      // does not stall WebKit.
      if (Math.abs(video.currentTime - SCAN_FLOW_LOG.start) > 0.04) {
        video.currentTime = SCAN_FLOW_LOG.start
      }
    }
    onFrame = () => {
      if (disposed || !video) return
      if (video.videoWidth < 2 || video.videoHeight < 2) return
      bindTexture(videoTexture, coverUVs(video.videoWidth, video.videoHeight))
      announce()
    }
    video.addEventListener('loadedmetadata', onMeta)
    video.addEventListener('loadeddata', onFrame)
    video.addEventListener('canplay', onFrame)

    playback = createSegmentPlayback(video)
    video.load()

    onVis = () => {
      if (disposed) return
      if (document.hidden) playback?.setActive(false)
      else if (lastActive) playback?.setActive(true)
    }
    document.addEventListener('visibilitychange', onVis)
  }

  function setPlaying(playing: boolean) {
    if (opts.reducedMotion || disposed) return
    if (playing === lastActive) return
    lastActive = playing
    if (playing) {
      playback?.setSegment(armSegment())
      playback?.setActive(!document.hidden)
      return
    }
    playback?.setActive(false)
    if (video && Math.abs(video.currentTime - SCAN_FLOW_LOG.start) > 0.04) {
      video.currentTime = SCAN_FLOW_LOG.start
    }
  }

  /**
   * Drive the QR-to-QR blend, then start the morph once the gym is gone.
   * Playing during the blend is what used to composite the log UI over the plate.
   */
  function sync(scene: number, dt: number): number {
    if (disposed) return 0
    if (scene < APP_PLAY_AT) {
      holdSec = 0
      setPlaying(false)
      return 0
    }
    holdSec += Math.max(0, dt)
    const mix = appScreenMix(scene, opts.reducedMotion, holdSec)
    setPlaying(mix >= 0.98)
    return mix
  }

  function dispose() {
    disposed = true
    playback?.dispose()
    playback = null
    if (onVis) document.removeEventListener('visibilitychange', onVis)
    onVis = null
    if (video) {
      if (onMeta) video.removeEventListener('loadedmetadata', onMeta)
      if (onFrame) {
        video.removeEventListener('loadeddata', onFrame)
        video.removeEventListener('canplay', onFrame)
      }
      video.removeAttribute('src')
      video.replaceChildren()
      video.load()
    }
    video = null
    stillImage = null
    texture.dispose()
  }

  return {
    get texture() { return texture },
    get uvs() { return uvs },
    get ready() { return ready },
    sync,
    dispose,
  }
}
