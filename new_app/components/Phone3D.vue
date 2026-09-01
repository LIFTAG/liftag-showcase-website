<script lang="ts">
// Module scope on purpose: `<script setup>` runs per instance, and the desktop
// page mounts ~8 phones that pull from the same small screenshot set. Sharing
// the cache means each screenshot is fetched and decoded once for the whole
// page. Entries are plain decoded HTMLImageElements with nothing
// renderer-specific about them, so they are safe to hand to any instance. The
// screenshot set is small and stays on the page, so nothing is evicted.
const imageCache = new Map<string, Promise<HTMLImageElement>>()
</script>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { useSharedMouse, delayedSampleAt, onMouseEvent } from '../composables/useSharedMouse'
import { coverFitScreenUVs } from '../utils/macbookScreen'
import {
  createPhoneModel,
  PHONE_REST_ROT_X,
  PHONE_REST_ROT_Y,
  PHONE_SCR_H,
  PHONE_SCR_W,
} from '../utils/phoneModel'
import type { ScreenVideoSegment, ScreenVideoSource } from '../utils/screenVideo'
import { createScreenVideoElement, createSegmentPlayback } from '../utils/screenVideo'

const emit = defineEmits<{
  ready: []
}>()

const props = withDefaults(defineProps<{
  screenshotSrc: string
  // Screen footage that takes over the display from `screenshotSrc`. The
  // screenshot stays loaded underneath as the poster for reduced motion and
  // for the window before the first video frame decodes.
  videoSources?: ScreenVideoSource[]
  // Which slice of that footage the screen is showing. See ScreenVideoSegment.
  videoSegment?: ScreenVideoSegment
  tiltDelayMs?: number
  screenTransition?: boolean
  screenTransitionDirection?: 'up' | 'down' | 'left' | 'right'
  // Skip shadow casting and lower DPR cap for cheaper rendering on background
  // phones where the visual fidelity loss is imperceptible.
  lite?: boolean
  // Static 3D keeps the real geometry and lighting but renders only when the
  // texture or viewport changes. It avoids pointer, gyro, and idle rAF work.
  interactive?: boolean
  // Main hero phones can retain lite lighting while using a sharper source,
  // texture canvas, and framebuffer.
  crispScreen?: boolean
  // A short, throttled real-3D sweep followed by a long idle pause. This is
  // deliberately separate from the continuously interactive pointer path.
  idleMotion?: boolean
}>(), {
  videoSources: undefined,
  videoSegment: undefined,
  tiltDelayMs: 0,
  screenTransition: false,
  screenTransitionDirection: 'up',
  lite: false,
  interactive: true,
  crispScreen: false,
  idleMotion: false,
})

const containerRef = ref<HTMLDivElement | null>(null)
let cleanup: (() => void) | null = null
let updateTexture: ((src: string) => void) | null = null
let setVideoSources: ((sources?: ScreenVideoSource[]) => void) | null = null
let setVideoSegment: ((segment?: ScreenVideoSegment) => void) | null = null
let initObserver: IntersectionObserver | null = null
let initialized = false

function initPhone() {
  const container = containerRef.value
  if (!container || initialized) return

  initialized = true

  const width = Math.max(container.clientWidth, 1)
  const height = Math.max(container.clientHeight, 1)

  const isLite = props.lite
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: isLite ? 'low-power' : 'high-performance',
  })
  renderer.setSize(width, height)
  // Background phones cap at 1.25 DPR. A crisp lite phone still skips shadows
  // and uses the low-power GPU preference, but keeps the main-phone DPR.
  const pixelRatioCap = isLite && !props.crispScreen ? 1.25 : 2
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, pixelRatioCap))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.4
  renderer.shadowMap.enabled = !isLite
  renderer.shadowMap.type = THREE.PCFShadowMap

  // Mirrors HeroParticles: a lost context must not be force-lost again on
  // unmount, so track it and let cleanup skip forceContextLoss.
  let contextBroken = false
  const onContextLost = (event: Event) => {
    event.preventDefault()
    contextBroken = true
  }
  renderer.domElement.addEventListener('webglcontextlost', onContextLost, false)
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100)
  camera.position.set(0, 0, 3.92)

  scene.add(new THREE.AmbientLight(0xffffff, 0.5))

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.5)
  keyLight.position.set(2, 3, 5)
  keyLight.castShadow = !isLite
  if (!isLite) {
    keyLight.shadow.mapSize.width = 1024
    keyLight.shadow.mapSize.height = 1024
    keyLight.shadow.camera.near = 0.5
    keyLight.shadow.camera.far = 15
    keyLight.shadow.camera.left = -2
    keyLight.shadow.camera.right = 2
    keyLight.shadow.camera.top = 3
    keyLight.shadow.camera.bottom = -3
    keyLight.shadow.radius = 6
  }
  scene.add(keyLight)

  const fillLight = new THREE.DirectionalLight(0x8899cc, 0.3)
  fillLight.position.set(-3, 1, 3)
  scene.add(fillLight)

  if (!isLite) {
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 6),
      new THREE.ShadowMaterial({ opacity: 0.35 }),
    )
    shadowPlane.position.z = -0.15
    shadowPlane.receiveShadow = true
    scene.add(shadowPlane)
  }

  const scrW = PHONE_SCR_W
  const scrH = PHONE_SCR_H

  function configureScreenTexture(texture: THREE.Texture) {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.wrapS = THREE.ClampToEdgeWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    texture.repeat.set(1, 1)
    texture.offset.set(0, 0)
    texture.magFilter = THREE.LinearFilter
    texture.minFilter = THREE.LinearMipmapLinearFilter
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
  }

  type ScreenImage = HTMLImageElement | HTMLCanvasElement

  const screenTextureCanvas = document.createElement('canvas')
  const screenTextureScale = props.crispScreen ? 2 : 1
  screenTextureCanvas.width = 393 * screenTextureScale
  screenTextureCanvas.height = 852 * screenTextureScale
  const screenTextureCtx = screenTextureCanvas.getContext('2d')
  if (screenTextureCtx) {
    screenTextureCtx.imageSmoothingEnabled = true
    screenTextureCtx.imageSmoothingQuality = 'high'
    screenTextureCtx.fillStyle = '#050505'
    screenTextureCtx.fillRect(0, 0, screenTextureCanvas.width, screenTextureCanvas.height)
  }

  let currentSrc = props.screenshotSrc
  let currentScreenImage: ScreenImage | null = null
  let textureRequestId = 0
  let screenTransition: {
    from: ScreenImage
    to: ScreenImage
    direction: 'up' | 'down' | 'left' | 'right'
    start: number
    duration: number
  } | null = null

  function imageSize(image: ScreenImage) {
    if (image instanceof HTMLImageElement) {
      return {
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height,
      }
    }

    return {
      width: image.width,
      height: image.height,
    }
  }

  function drawScreenImage(image: ScreenImage, x = 0, y = 0) {
    if (!screenTextureCtx) return

    const { width: imageW, height: imageH } = imageSize(image)
    const canvasW = screenTextureCanvas.width
    const canvasH = screenTextureCanvas.height
    const scale = Math.max(canvasW / imageW, canvasH / imageH)
    const drawW = imageW * scale
    const drawH = imageH * scale
    const drawX = (canvasW - drawW) / 2 + x
    const drawY = (canvasH - drawH) / 2 + y

    screenTextureCtx.drawImage(image, drawX, drawY, drawW, drawH)
  }

  function drawStaticScreen(image: ScreenImage | null = currentScreenImage) {
    if (!screenTextureCtx || !image) return

    screenTextureCtx.clearRect(0, 0, screenTextureCanvas.width, screenTextureCanvas.height)
    drawScreenImage(image)
    activeTexture.needsUpdate = true
  }

  function snapshotScreen() {
    const snapshot = document.createElement('canvas')
    snapshot.width = screenTextureCanvas.width
    snapshot.height = screenTextureCanvas.height
    snapshot.getContext('2d')?.drawImage(screenTextureCanvas, 0, 0)
    return snapshot
  }

  function loadScreenImage(src: string) {
    const cached = imageCache.get(src)
    if (cached) return cached

    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.decoding = 'async'
      image.onload = () => {
        const decodePromise = image.decode ? image.decode() : Promise.resolve()
        decodePromise
          .then(() => resolve(image))
          .catch(() => resolve(image))
      }
      image.onerror = reject
      image.src = src
    })

    imageCache.set(src, promise)
    return promise
  }

  function renderScreenTransition(now: number) {
    if (!screenTransition || !screenTextureCtx) return

    const progress = Math.min(1, (now - screenTransition.start) / screenTransition.duration)
    const eased = 1 - Math.pow(1 - progress, 3)
    const isHorizontal = screenTransition.direction === 'left' || screenTransition.direction === 'right'
    const offset = (isHorizontal ? screenTextureCanvas.width : screenTextureCanvas.height)
      * eased
      * (screenTransition.direction === 'up' || screenTransition.direction === 'left' ? -1 : 1)
    const x = isHorizontal ? offset : 0
    const y = isHorizontal ? 0 : offset

    screenTextureCtx.clearRect(0, 0, screenTextureCanvas.width, screenTextureCanvas.height)
    drawScreenImage(screenTransition.to)
    drawScreenImage(screenTransition.from, x, y)

    const edge = isHorizontal
      ? screenTransition.direction === 'left'
        ? screenTextureCanvas.width + x
        : x
      : screenTransition.direction === 'up'
        ? screenTextureCanvas.height + y
        : y
    const maxEdge = isHorizontal ? screenTextureCanvas.width : screenTextureCanvas.height
    if (edge > 0 && edge < maxEdge) {
      const gradient = isHorizontal
        ? screenTextureCtx.createLinearGradient(edge - 24, 0, edge + 24, 0)
        : screenTextureCtx.createLinearGradient(0, edge - 24, 0, edge + 24)
      gradient.addColorStop(0, 'rgba(0,0,0,0)')
      gradient.addColorStop(0.5, 'rgba(0,0,0,0.32)')
      gradient.addColorStop(1, 'rgba(0,0,0,0)')
      screenTextureCtx.fillStyle = gradient
      if (isHorizontal) {
        screenTextureCtx.fillRect(edge - 24, 0, 48, screenTextureCanvas.height)
      } else {
        screenTextureCtx.fillRect(0, edge - 24, screenTextureCanvas.width, 48)
      }
    }

    activeTexture.needsUpdate = true

    if (progress >= 1) {
      currentScreenImage = screenTransition.to
      screenTransition = null
      drawStaticScreen()
    }
  }

  let activeTexture = new THREE.CanvasTexture(screenTextureCanvas)
  configureScreenTexture(activeTexture)
  const screenMat = new THREE.MeshBasicMaterial({ map: activeTexture, toneMapped: false })

  const phoneModel = createPhoneModel({
    screenMaterial: screenMat,
    castShadow: !isLite,
  })
  const phone = phoneModel.group
  phone.rotation.x = PHONE_REST_ROT_X
  phone.rotation.y = PHONE_REST_ROT_Y
  scene.add(phone)

  let textureReady = false
  let announcedReady = false
  const announceReady = () => {
    if (announcedReady) return
    if (!textureReady) return
    if (container.clientWidth < 8 || container.clientHeight < 8) return
    announcedReady = true
    emit('ready')
  }

  const initialSrc = currentSrc
  loadScreenImage(initialSrc)
    .then((image) => {
      if (initialSrc !== currentSrc || initialSrc !== props.screenshotSrc) return
      currentScreenImage = image
      drawStaticScreen(image)
      renderer.render(scene, camera)
      textureReady = true
      announceReady()
    })
    .catch(() => {
      textureReady = true
      announceReady()
    })

  updateTexture = (src: string) => {
    if (src === currentSrc) return

    const requestId = textureRequestId + 1
    textureRequestId = requestId
    const previousImage = screenTransition ? snapshotScreen() : currentScreenImage
    currentSrc = src

    loadScreenImage(src)
      .then((nextImage) => {
        if (requestId !== textureRequestId || src !== currentSrc) return

        // With footage bound to the screen the canvas is off screen, so the
        // swipe would animate something nobody can see. Keep the poster
        // current - reduced motion and video teardown both fall back to it -
        // and skip both the transition and the redraw it would need.
        if (videoTexture) {
          currentScreenImage = nextImage
          screenTransition = null
          drawStaticScreen(nextImage)
          return
        }

        if (!props.screenTransition || !previousImage || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          currentScreenImage = nextImage
          screenTransition = null
          drawStaticScreen(nextImage)
          renderer.render(scene, camera)
          return
        }

        screenTransition = {
          from: previousImage,
          to: nextImage,
          direction: props.screenTransitionDirection,
          start: performance.now(),
          duration: 760,
        }

        if (isVisible && !animId) animate()
      })
      .catch(() => {})
  }

  let screenVideo: HTMLVideoElement | null = null
  let videoTexture: THREE.VideoTexture | null = null
  let videoPlayback: ReturnType<typeof createSegmentPlayback> | null = null
  let onVideoPlaying: (() => void) | null = null
  // initPhone runs 600px out. Autoplay-adjacent playback makes a browser fetch
  // the whole file the moment a source is attached, so hold the sources until
  // the phone is actually approaching the viewport (the 300px observer below).
  let videoAllowed = false
  let pendingVideoSources: ScreenVideoSource[] | undefined

  function videoRunning() {
    return Boolean(screenVideo && !screenVideo.paused && !screenVideo.ended)
  }

  function disposeVideo() {
    videoPlayback?.dispose()
    if (screenVideo) {
      if (onVideoPlaying) screenVideo.removeEventListener('playing', onVideoPlaying)
      // Both the attribute and the <source> children have to go before load(),
      // or the reload just re-picks a source and keeps the download alive.
      screenVideo.removeAttribute('src')
      screenVideo.replaceChildren()
      screenVideo.load()
    }
    videoTexture?.dispose()
    videoPlayback = null
    onVideoPlaying = null
    screenVideo = null
    videoTexture = null
  }

  setVideoSources = (sources?: ScreenVideoSource[]) => {
    pendingVideoSources = sources
    disposeVideo()
    screenMat.map = activeTexture
    screenMat.needsUpdate = true

    if (!sources?.length || reducedMotionMql.matches) {
      if (isVisible) renderer.render(scene, camera)
      return
    }

    if (!videoAllowed) return

    const video = createScreenVideoElement(sources)
    const texture = new THREE.VideoTexture(video)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.generateMipmaps = false

    screenVideo = video
    videoTexture = texture

    // A playing VideoTexture needs a render per frame, so playback has to pull
    // the loop (see animate) back out of its parked state.
    onVideoPlaying = () => {
      if (!animId && isVisible && !document.hidden && !motionHeld) animate()
    }
    video.addEventListener('playing', onVideoPlaying)

    video.addEventListener('loadeddata', () => {
      if (videoTexture !== texture) return

      const uv = coverFitScreenUVs({
        sourceWidth: video.videoWidth,
        sourceHeight: video.videoHeight,
        screenWidth: scrW,
        screenHeight: scrH,
      })
      texture.wrapS = THREE.ClampToEdgeWrapping
      texture.wrapT = THREE.ClampToEdgeWrapping
      texture.repeat.set(uv.repeatX, uv.repeatY)
      texture.offset.set(uv.offsetX, uv.offsetY)

      screenMat.map = texture
      screenMat.needsUpdate = true
      if (isVisible) renderer.render(scene, camera)
    }, { once: true })

    videoPlayback = createSegmentPlayback(video)
    videoPlayback.setSegment(props.videoSegment)
    videoPlayback.setActive(isVisible && !document.hidden && !motionHeld)

    video.load()
  }

  setVideoSegment = (segment?: ScreenVideoSegment) => {
    videoPlayback?.setSegment(segment)
  }

  let gyroActive = false
  let gyroCleanup: (() => void) | null = null
  let targetRotX = PHONE_REST_ROT_X
  let targetRotY = PHONE_REST_ROT_Y
  let currentRotX = PHONE_REST_ROT_X
  let currentRotY = PHONE_REST_ROT_Y
  let animId = 0
  let isVisible = false
  // Set while the mobile nav drawer covers the page (see SiteNav). The drawer's
  // backdrop blur repaints from whatever is underneath, so a phone that keeps
  // rendering behind it costs a WebGL frame plus a full-screen re-blur to show
  // nothing. Read eagerly: a phone can initialise with the drawer already open.
  let motionHeld = document.documentElement.hasAttribute('data-liftag-nav-open')
  let idleTimer = 0
  let idleMotionActive = false
  let idleMotionStart = 0
  let lastIdleRender = 0
  const restRotX = PHONE_REST_ROT_X
  const restRotY = PHONE_REST_ROT_Y
  // The 2.4s sweep and 8.1s rest form the same 10.5s cadence used by the
  // mobile hero's two CSS rear phones.
  const idleDuration = 2400
  const idlePause = 8100
  const idleFrameInterval = 1000 / 60
  // Below this the tilt left to travel is far under a pixel on screen, so the
  // interactive loop parks instead of redrawing identical frames forever.
  const tiltConvergeEpsilon = 0.0001
  const reducedMotionMql = window.matchMedia('(prefers-reduced-motion: reduce)')
  // Shared singleton - replaces a per-instance window mousemove listener.
  // animate() reads from sharedMouse.latest (delay = 0) or interpolates from
  // sharedMouse.samples (delay > 0), so behaviour matches the original to
  // within one rAF frame.
  const sharedMouse = props.interactive ? useSharedMouse() : null

  // Records the sources so the 300px observer below can attach them; nothing
  // is fetched until it does.
  setVideoSources(props.videoSources)

  function clearIdleTimer() {
    if (!idleTimer) return
    window.clearTimeout(idleTimer)
    idleTimer = 0
  }

  function resetIdlePose() {
    idleMotionActive = false
    currentRotX = restRotX
    currentRotY = restRotY
    phone.rotation.x = restRotX
    phone.rotation.y = restRotY
    keyLight.position.set(2, 3, 5)
  }

  function scheduleIdleMotion(delay = 3200) {
    clearIdleTimer()
    if (!props.idleMotion || props.interactive || reducedMotionMql.matches || !isVisible || document.hidden || motionHeld) return

    idleTimer = window.setTimeout(() => {
      idleTimer = 0
      if (!isVisible || document.hidden || motionHeld || reducedMotionMql.matches) return

      idleMotionActive = true
      idleMotionStart = performance.now()
      lastIdleRender = 0
      if (!animId) animate()
    }, delay)
  }

  function applyPointerTilt(mx: number, my: number) {
    targetRotY = mx * 0.35
    targetRotX = my * 0.15
    keyLight.position.x = 2 + mx * 1.5
    keyLight.position.y = 3 - my
  }

  const onDeviceOrientation = (event: DeviceOrientationEvent) => {
    if (event.gamma == null || event.beta == null) return

    gyroActive = true

    // Reduced motion keeps the interactive phone at its rest pose.
    if (reducedMotionMql.matches) return

    const mx = Math.max(-1, Math.min(1, event.gamma / 30))
    const my = Math.max(-1, Math.min(1, (event.beta - 45) / 30))

    applyPointerTilt(mx, my)
    wakeTilt()
  }

  function enableGyro() {
    window.addEventListener('deviceorientation', onDeviceOrientation)
  }

  const deviceOrientation = window.DeviceOrientationEvent as (typeof DeviceOrientationEvent & {
    requestPermission?: () => Promise<PermissionState>
  }) | undefined

  if (props.interactive && deviceOrientation && typeof deviceOrientation.requestPermission === 'function') {
    const requestOnTap = () => {
      deviceOrientation.requestPermission?.()
        .then((state) => {
          if (state === 'granted') enableGyro()
        })
        .catch(() => {})
    }

    container.addEventListener('touchend', requestOnTap, { once: true })
    gyroCleanup = () => {
      container.removeEventListener('touchend', requestOnTap)
      window.removeEventListener('deviceorientation', onDeviceOrientation)
    }
  } else if (props.interactive && deviceOrientation) {
    enableGyro()
    gyroCleanup = () => window.removeEventListener('deviceorientation', onDeviceOrientation)
  }

  const animate = () => {
    if (!isVisible || document.hidden || motionHeld) {
      animId = 0
      return
    }

    if (props.interactive || screenTransition || idleMotionActive || videoRunning()) {
      animId = requestAnimationFrame(animate)
    } else {
      animId = 0
    }

    const now = performance.now()
    // A playing VideoTexture uploads a new frame every tick; skipping the draw
    // would leave the screen on whichever frame was last rendered.
    let shouldRender = props.interactive || Boolean(screenTransition) || videoRunning()

    if (props.interactive && !gyroActive && !reducedMotionMql.matches && sharedMouse) {
      const delay = Math.max(0, props.tiltDelayMs)
      if (delay > 0) {
        const delayed = delayedSampleAt(sharedMouse.samples, performance.now() - delay)
        if (delayed) applyPointerTilt(delayed.mx, delayed.my)
      } else if (sharedMouse.samples.length > 0) {
        // Skip until first real mouse event - otherwise (0,0) pulls the phone
        // away from its rest pose immediately on visibility.
        applyPointerTilt(sharedMouse.latest.mx, sharedMouse.latest.my)
      }
    }

    let parkTilt = false

    if (props.interactive) {
      currentRotX += (targetRotX - currentRotX) * 0.06
      currentRotY += (targetRotY - currentRotY) * 0.06

      // Render-on-demand: once the tilt has converged and nothing else is
      // animating, every further frame would be identical. Snap onto the
      // target, draw it once below, then park - wakeTilt() restarts the loop
      // on the next pointer or gyro event, and the visibility/texture paths
      // restart it for their own reasons.
      const tiltDelta = Math.max(
        Math.abs(targetRotX - currentRotX),
        Math.abs(targetRotY - currentRotY),
      )
      if (tiltDelta < tiltConvergeEpsilon && !screenTransition && !idleMotionActive && !videoRunning()) {
        currentRotX = targetRotX
        currentRotY = targetRotY
        parkTilt = true
      }
    } else if (idleMotionActive) {
      const progress = Math.min(1, (now - idleMotionStart) / idleDuration)
      const outbound = Math.min(1, progress / 0.42)
      const settleProgress = Math.max(0, (progress - 0.42) / 0.58)
      const turnOut = 1 - Math.pow(1 - outbound, 4)
      const settle = 1 - settleProgress * settleProgress * (3 - 2 * settleProgress)
      const arc = progress <= 0.42 ? turnOut : settle

      // Tilt toward the fixed key light so the real clear-coated top and right
      // edges catch a brief white specular highlight. No screen overlay or
      // synthetic reflection is involved.
      currentRotX = restRotX + arc * 0.03
      currentRotY = restRotY - arc * 0.11

      if (now - lastIdleRender >= idleFrameInterval || progress >= 1) {
        lastIdleRender = now
        shouldRender = true
      }

      if (progress >= 1) {
        resetIdlePose()
        scheduleIdleMotion(idlePause)
      }
    }

    phone.rotation.x = currentRotX
    phone.rotation.y = currentRotY
    renderScreenTransition(now)
    if (shouldRender) renderer.render(scene, camera)

    if (parkTilt) {
      cancelAnimationFrame(animId)
      animId = 0
    }
  }

  // The keyLight position is set directly in applyPointerTilt rather than
  // lerped, so a parked loop is already showing the pose it would settle on.
  // Under reduced motion the tilt is never applied, so waking would only
  // redraw the same rest pose once per pointer event.
  const wakeTilt = () => {
    if (animId || !isVisible || document.hidden || motionHeld || reducedMotionMql.matches) return
    animate()
  }

  const unsubscribeMouse = props.interactive ? onMouseEvent(wakeTilt) : null

  // Shared by every path that can hand the phone back its motion - becoming
  // visible, the tab returning, the drawer closing.
  const resumeMotion = () => {
    if (!isVisible || document.hidden || motionHeld) return

    videoPlayback?.setActive(true)

    if (props.interactive || screenTransition || videoRunning()) {
      if (!animId) animate()
    } else {
      renderer.render(scene, camera)
      scheduleIdleMotion()
    }
  }

  const suspendMotion = () => {
    videoPlayback?.setActive(false)
    clearIdleTimer()
    resetIdlePose()
  }

  const videoObserver = new IntersectionObserver(
    (entries) => {
      if (!entries[0]?.isIntersecting) return

      videoObserver.disconnect()
      videoAllowed = true
      if (pendingVideoSources?.length) setVideoSources?.(pendingVideoSources)
    },
    { rootMargin: '300px 0px' },
  )
  videoObserver.observe(container)

  const visObserver = new IntersectionObserver(
    (entries) => {
      isVisible = entries[0]?.isIntersecting ?? false
      if (isVisible) resumeMotion()
      else suspendMotion()
    },
    { threshold: 0 },
  )
  visObserver.observe(container)

  const onDocumentVisibilityChange = () => {
    if (document.hidden) suspendMotion()
    else resumeMotion()
  }
  document.addEventListener('visibilitychange', onDocumentVisibilityChange)

  const onNavOpenChange = (event: Event) => {
    const next = Boolean((event as CustomEvent<{ open?: boolean }>).detail?.open)
    if (next === motionHeld) return

    motionHeld = next
    if (motionHeld) suspendMotion()
    else resumeMotion()
  }
  window.addEventListener('liftag:nav-open-change', onNavOpenChange)

  const onReducedMotionChange = () => {
    // Turning the preference on tears the footage down and leaves the still
    // screenshot on the screen; turning it off re-attaches it.
    setVideoSources?.(pendingVideoSources)
    clearIdleTimer()
    resetIdlePose()
    // resetIdlePose() only rewinds the current pose. Rewinding the targets too
    // keeps an interactive phone from lerping back onto a stale pointer tilt
    // that is no longer being refreshed, and leaves it converged so it parks.
    // Turning the preference back off restores tilt on the next mouse event.
    targetRotX = restRotX
    targetRotY = restRotY
    if (isVisible) {
      renderer.render(scene, camera)
      scheduleIdleMotion()
    }
  }
  reducedMotionMql.addEventListener('change', onReducedMotionChange)

  const applyResize = () => {
    const w = Math.max(container.clientWidth, 1)
    const h = Math.max(container.clientHeight, 1)

    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
    renderer.render(scene, camera)
    announceReady()
  }
  let resizeRaf = 0
  const onResize = () => {
    if (resizeRaf) return
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = 0
      applyResize()
    })
  }
  window.addEventListener('resize', onResize, { passive: true })
  // The hero phones mount after hydration, so the first clientWidth can be 0
  // before the cluster's layout. Window resize never fires for that, and the
  // old pointer-gated remount is gone, so observe the container itself.
  const resizeObserver = typeof ResizeObserver === 'undefined'
    ? null
    : new ResizeObserver(onResize)
  resizeObserver?.observe(container)

  cleanup = () => {
    window.removeEventListener('resize', onResize)
    resizeObserver?.disconnect()
    if (resizeRaf) {
      cancelAnimationFrame(resizeRaf)
      resizeRaf = 0
    }
    document.removeEventListener('visibilitychange', onDocumentVisibilityChange)
    window.removeEventListener('liftag:nav-open-change', onNavOpenChange)
    reducedMotionMql.removeEventListener('change', onReducedMotionChange)
    clearIdleTimer()
    idleMotionActive = false
    unsubscribeMouse?.()
    gyroCleanup?.()
    videoObserver.disconnect()
    visObserver.disconnect()
    isVisible = false
    cancelAnimationFrame(animId)

    updateTexture = null
    setVideoSources = null
    setVideoSegment = null
    disposeVideo()
    activeTexture.dispose()
    renderer.domElement.removeEventListener('webglcontextlost', onContextLost)
    renderer.dispose()
    if (!contextBroken) renderer.forceContextLoss()

    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return

      object.geometry.dispose()
      const materials = Array.isArray(object.material) ? object.material : [object.material]
      materials.forEach((material) => material.dispose())
    })

    if (container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement)
    }
  }
}

function initWhenNearViewport() {
  const container = containerRef.value
  if (!container) return

  initObserver = new IntersectionObserver(
    (entries) => {
      if (!entries[0]?.isIntersecting) return

      initObserver?.disconnect()
      initObserver = null
      initPhone()
    },
    { rootMargin: '600px 0px' },
  )

  initObserver.observe(container)
}

onMounted(initWhenNearViewport)
onBeforeUnmount(() => {
  initObserver?.disconnect()
  cleanup?.()
})

watch(
  () => props.screenshotSrc,
  (src) => {
    if (updateTexture) {
      updateTexture(src)
    } else {
      initPhone()
    }
  },
)

watch(() => props.videoSources, (sources) => setVideoSources?.(sources))
watch(() => props.videoSegment, (segment) => setVideoSegment?.(segment))
</script>

<template>
  <div ref="containerRef" class="phone-3d-mount" />
</template>
