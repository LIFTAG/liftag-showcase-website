<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { useSharedMouse } from '../composables/useSharedMouse'

const props = withDefaults(defineProps<{
  screenshotSrc: string
  videoSrc?: string
  openProgress?: number
  tiltDelayMs?: number
}>(), {
  openProgress: 0,
  tiltDelayMs: 0,
})

const containerRef = ref<HTMLDivElement | null>(null)

let cleanup: (() => void) | null = null
let updateTexture: ((src: string) => void) | null = null
let setVideoSource: ((src?: string) => void) | null = null
let setOpenProgress: ((p: number) => void) | null = null
let initObserver: IntersectionObserver | null = null
let initialized = false

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v))
}

function smoothstep(v: number) {
  const t = clamp01(v)
  return t * t * (3 - 2 * t)
}

function roundedRect(w: number, h: number, r: number) {
  const shape = new THREE.Shape()
  const hw = w / 2
  const hh = h / 2
  const rr = Math.min(r, hw, hh)

  shape.moveTo(-hw + rr, -hh)
  shape.lineTo(hw - rr, -hh)
  shape.quadraticCurveTo(hw, -hh, hw, -hh + rr)
  shape.lineTo(hw, hh - rr)
  shape.quadraticCurveTo(hw, hh, hw - rr, hh)
  shape.lineTo(-hw + rr, hh)
  shape.quadraticCurveTo(-hw, hh, -hw, hh - rr)
  shape.lineTo(-hw, -hh + rr)
  shape.quadraticCurveTo(-hw, -hh, -hw + rr, -hh)

  return shape
}

function initMacbook() {
  const container = containerRef.value
  if (!container || initialized) return

  initialized = true

  const width = Math.max(container.clientWidth, 1)
  const height = Math.max(container.clientHeight, 1)

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.25
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.VSMShadowMap
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  // FOV / position chosen so the lid stays in frame at every rotation angle —
  // peak vertical reach is around -90° (mid-animation), not at -108° (fully open).
  const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100)
  camera.position.set(0, 0.75, 6.1)
  camera.lookAt(0, 0.25, 0)

  scene.add(new THREE.AmbientLight(0xffffff, 0.55))

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.4)
  keyLight.position.set(2.5, 4, 4.5)
  keyLight.castShadow = true
  keyLight.shadow.mapSize.width = 1024
  keyLight.shadow.mapSize.height = 1024
  keyLight.shadow.camera.near = 0.5
  keyLight.shadow.camera.far = 18
  keyLight.shadow.camera.left = -3
  keyLight.shadow.camera.right = 3
  keyLight.shadow.camera.top = 3
  keyLight.shadow.camera.bottom = -3
  keyLight.shadow.radius = 8
  scene.add(keyLight)

  const fillLight = new THREE.DirectionalLight(0x99aacc, 0.32)
  fillLight.position.set(-3, 1.5, 2)
  scene.add(fillLight)

  const accentLight = new THREE.PointLight(0xccff00, 0.55, 10, 2)
  accentLight.position.set(0, 1.5, 1.6)
  scene.add(accentLight)

  // Ground shadow plane (catches the laptop's shadow)
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 6),
    new THREE.ShadowMaterial({ opacity: 0.32 }),
  )
  shadowPlane.rotation.x = -Math.PI / 2
  shadowPlane.position.y = -0.18
  shadowPlane.receiveShadow = true
  scene.add(shadowPlane)

  // Dimensions
  const W = 2.8       // base + lid width
  const D = 1.92      // base depth
  const T = 0.085     // base thickness
  const R = 0.09      // base corner radius
  const LT = 0.038    // lid thickness
  const H = 1.83      // lid height (when laid flat = depth)

  const aluMat = new THREE.MeshPhysicalMaterial({
    color: 0x2b2b2f,
    metalness: 0.92,
    roughness: 0.32,
    clearcoat: 0.4,
    clearcoatRoughness: 0.4,
  })

  // ---- Base ----
  const baseGeo = new THREE.ExtrudeGeometry(roundedRect(W, D, R), {
    steps: 1,
    depth: T,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    bevelSegments: 4,
  })
  baseGeo.center()
  baseGeo.rotateX(-Math.PI / 2) // shape XY plane → XZ plane (top-down view)

  const base = new THREE.Mesh(baseGeo, aluMat)
  base.castShadow = true
  base.receiveShadow = true
  base.position.y = -T / 2

  // Keyboard well (recessed dark inset)
  const kbW = W * 0.78
  const kbD = D * 0.42
  const keyboardWell = new THREE.Mesh(
    new THREE.PlaneGeometry(kbW, kbD),
    new THREE.MeshStandardMaterial({
      color: 0x0a0a0c,
      metalness: 0.4,
      roughness: 0.85,
    }),
  )
  keyboardWell.rotation.x = -Math.PI / 2
  keyboardWell.position.set(0, 0.001, -D * 0.12)
  keyboardWell.receiveShadow = true

  // Subtle keyboard "key grid" via canvas texture
  const kbCanvas = document.createElement('canvas')
  kbCanvas.width = 1024
  kbCanvas.height = 512
  const kbCtx = kbCanvas.getContext('2d')
  if (kbCtx) {
    kbCtx.fillStyle = '#0a0a0c'
    kbCtx.fillRect(0, 0, 1024, 512)

    const cols = 14
    const rows = 5
    const padX = 30
    const padY = 30
    const gap = 10
    const keyW = (1024 - padX * 2 - gap * (cols - 1)) / cols
    const keyH = (512 - padY * 2 - gap * (rows - 1)) / rows

    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const x = padX + c * (keyW + gap)
        const y = padY + r * (keyH + gap)
        const grd = kbCtx.createLinearGradient(x, y, x, y + keyH)
        grd.addColorStop(0, '#28282c')
        grd.addColorStop(1, '#16161a')
        kbCtx.fillStyle = grd
        const kr = 6
        kbCtx.beginPath()
        kbCtx.moveTo(x + kr, y)
        kbCtx.lineTo(x + keyW - kr, y)
        kbCtx.quadraticCurveTo(x + keyW, y, x + keyW, y + kr)
        kbCtx.lineTo(x + keyW, y + keyH - kr)
        kbCtx.quadraticCurveTo(x + keyW, y + keyH, x + keyW - kr, y + keyH)
        kbCtx.lineTo(x + kr, y + keyH)
        kbCtx.quadraticCurveTo(x, y + keyH, x, y + keyH - kr)
        kbCtx.lineTo(x, y + kr)
        kbCtx.quadraticCurveTo(x, y, x + kr, y)
        kbCtx.closePath()
        kbCtx.fill()
      }
    }
  }
  const kbTex = new THREE.CanvasTexture(kbCanvas)
  kbTex.colorSpace = THREE.SRGBColorSpace
  keyboardWell.material = new THREE.MeshStandardMaterial({
    map: kbTex,
    metalness: 0.3,
    roughness: 0.9,
  })

  // Trackpad
  const tpW = W * 0.32
  const tpD = D * 0.27
  const trackpad = new THREE.Mesh(
    new THREE.PlaneGeometry(tpW, tpD),
    new THREE.MeshPhysicalMaterial({
      color: 0x1a1a1d,
      metalness: 0.55,
      roughness: 0.42,
      clearcoat: 0.35,
    }),
  )
  trackpad.rotation.x = -Math.PI / 2
  trackpad.position.set(0, 0.0008, D * 0.28)

  // Hinge cylinder along back edge
  const hinge = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.022, W * 0.62, 24),
    new THREE.MeshPhysicalMaterial({
      color: 0x1f1f22,
      metalness: 0.95,
      roughness: 0.25,
    }),
  )
  hinge.rotation.z = Math.PI / 2
  hinge.position.set(0, 0.012, -D / 2 + 0.06)

  // ---- Lid (group rooted at hinge) ----
  const lidGroup = new THREE.Group()
  lidGroup.position.set(0, 0, -D / 2 + 0.04)

  const lidGeo = new THREE.ExtrudeGeometry(roundedRect(W, H, R), {
    steps: 1,
    depth: LT,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.005,
    bevelSegments: 3,
  })
  lidGeo.center()
  lidGeo.rotateX(-Math.PI / 2)
  // After centering, lid spans z ∈ [-H/2, H/2]; shift so z ∈ [0, H] (pivot at lid back edge)
  lidGeo.translate(0, LT / 2, H / 2)

  const lid = new THREE.Mesh(lidGeo, aluMat)
  lid.castShadow = true
  lid.receiveShadow = true
  lidGroup.add(lid)

  // Screen panel (inner side of lid) — thin bezels like M-series MacBook
  const SW = 2.72
  const SH = 1.74
  const screenGeo = new THREE.PlaneGeometry(SW, SH)
  // Default plane normal +Z; rotate so it faces -Y (the inner/keyboard-facing side of the lid).
  // After rotation, plane sits in lid-local XZ plane with normal pointing -Y.
  // v=1 (originally at +Y) maps to +Z → ends up at the FRONT of the lid (top of screen when open).
  screenGeo.rotateX(Math.PI / 2)

  const textureLoader = new THREE.TextureLoader()
  let posterTexture = textureLoader.load(
    props.screenshotSrc,
    () => {
      renderer.render(scene, camera)
    },
    undefined,
    (err) => {
      console.error('[Macbook3D] failed to load screenshot', props.screenshotSrc, err)
    },
  )
  posterTexture.colorSpace = THREE.SRGBColorSpace
  posterTexture.anisotropy = renderer.capabilities.getMaxAnisotropy?.() ?? 1
  let screenVideo: HTMLVideoElement | null = null
  let videoTexture: THREE.VideoTexture | null = null

  const screenMat = new THREE.MeshBasicMaterial({
    map: posterTexture,
    toneMapped: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
    depthWrite: true,
  })
  const screen = new THREE.Mesh(screenGeo, screenMat)
  // -Y in lid local is the inner (keyboard-facing) side, which becomes camera-facing when open.
  // Push the screen well outward so it wins the depth test against the black bezel/lid behind it.
  screen.position.set(0, -0.014, H / 2)
  screen.renderOrder = 2
  lidGroup.add(screen)

  // Bezel: larger black plane sitting behind the screen, fills the gap between screen and lid edge
  const bezelGeo = new THREE.PlaneGeometry(W - 0.06, H - 0.06)
  bezelGeo.rotateX(Math.PI / 2)
  const bezel = new THREE.Mesh(
    bezelGeo,
    new THREE.MeshBasicMaterial({ color: 0x000000 }),
  )
  bezel.position.set(0, -0.006, H / 2)
  bezel.renderOrder = 1
  lidGroup.add(bezel)

  // Camera notch hint (tiny dark dot)
  const notch = new THREE.Mesh(
    new THREE.CircleGeometry(0.018, 16),
    new THREE.MeshBasicMaterial({ color: 0x0a0a0a }),
  )
  notch.rotation.x = Math.PI / 2
  notch.position.set(0, -0.001, H - 0.04)
  lidGroup.add(notch)

  // ---- Macbook root group (drives mouse tilt) ----
  const macbook = new THREE.Group()
  macbook.add(base, keyboardWell, trackpad, hinge, lidGroup)
  macbook.rotation.x = 0
  macbook.rotation.y = -0.06
  scene.add(macbook)

  updateTexture = (src: string) => {
    const previous = posterTexture
    posterTexture = textureLoader.load(src, () => {
      if (!videoTexture) {
        screenMat.map = posterTexture
        screenMat.needsUpdate = true
      }
      previous.dispose()
      renderer.render(scene, camera)
    })
    posterTexture.colorSpace = THREE.SRGBColorSpace
    posterTexture.anisotropy = renderer.capabilities.getMaxAnisotropy?.() ?? 1
  }

  // ---- Animation state ----
  const closedAngle = 0
  const openAngle = -THREE.MathUtils.degToRad(108) // open ~108°
  let targetOpen = clamp01(props.openProgress)
  let currentOpen = targetOpen

  setOpenProgress = (p: number) => {
    targetOpen = clamp01(p)
  }

  let targetTiltX = 0
  let targetTiltY = -0.06
  let currentTiltX = 0
  let currentTiltY = -0.06
  let animId = 0
  let isVisible = false

  function disposeVideo() {
    screenVideo?.pause()
    if (screenVideo) {
      screenVideo.removeAttribute('src')
      screenVideo.load()
    }
    videoTexture?.dispose()
    screenVideo = null
    videoTexture = null
  }

  function playVideo() {
    if (!screenVideo || !isVisible) return
    const playAttempt = screenVideo.play()
    if (playAttempt) {
      playAttempt.catch(() => {
        // Muted autoplay is expected to work, but keep the poster if a browser blocks it.
      })
    }
  }

  setVideoSource = (src?: string) => {
    disposeVideo()
    screenMat.map = posterTexture
    screenMat.needsUpdate = true

    if (!src || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      renderer.render(scene, camera)
      return
    }

    const video = document.createElement('video')
    video.src = src
    video.muted = true
    video.defaultMuted = true
    video.loop = true
    video.autoplay = true
    video.playsInline = true
    video.preload = 'metadata'
    video.setAttribute('muted', '')
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', '')

    const texture = new THREE.VideoTexture(video)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.generateMipmaps = false

    screenVideo = video
    videoTexture = texture

    video.addEventListener('loadeddata', () => {
      if (videoTexture !== texture) return
      screenMat.map = texture
      screenMat.needsUpdate = true
      renderer.render(scene, camera)
      playVideo()
    }, { once: true })

    video.load()
    playVideo()
  }

  setVideoSource(props.videoSrc)

  // Shared singleton — replaces a per-instance window mousemove listener.
  // animate() reads sharedMouse.latest each frame; tilt result is identical
  // because targetTilt is lerped, not driven by per-event deltas.
  const sharedMouse = useSharedMouse()

  const animate = () => {
    if (!isVisible || document.hidden) {
      animId = 0
      return
    }
    animId = requestAnimationFrame(animate)

    // Skip until first real mouse event — otherwise (0,0) pulls the laptop
    // away from its -0.06 rest yaw immediately on visibility.
    if (sharedMouse.samples.length > 0) {
      targetTiltY = -0.06 + sharedMouse.latest.mx * 0.18
      targetTiltX = -sharedMouse.latest.my * 0.05
    }

    currentOpen += (targetOpen - currentOpen) * 0.14
    currentTiltX += (targetTiltX - currentTiltX) * 0.06
    currentTiltY += (targetTiltY - currentTiltY) * 0.06

    const eased = smoothstep(currentOpen)
    lidGroup.rotation.x = closedAngle + (openAngle - closedAngle) * eased

    macbook.rotation.x = currentTiltX
    macbook.rotation.y = currentTiltY

    renderer.render(scene, camera)
  }

  const visObserver = new IntersectionObserver(
    (entries) => {
      isVisible = entries[0]?.isIntersecting ?? false
      if (isVisible) {
        if (!document.hidden) playVideo()
        if (!animId && !document.hidden) animate()
      } else {
        screenVideo?.pause()
      }
    },
    { threshold: 0 },
  )
  visObserver.observe(container)

  const onDocumentVisibilityChange = () => {
    if (document.hidden) {
      screenVideo?.pause()
      return
    }
    if (isVisible) {
      playVideo()
      if (!animId) animate()
    }
  }
  document.addEventListener('visibilitychange', onDocumentVisibilityChange)

  const applyResize = () => {
    const w = Math.max(container.clientWidth, 1)
    const h = Math.max(container.clientHeight, 1)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
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

  cleanup = () => {
    window.removeEventListener('resize', onResize)
    if (resizeRaf) {
      cancelAnimationFrame(resizeRaf)
      resizeRaf = 0
    }
    document.removeEventListener('visibilitychange', onDocumentVisibilityChange)
    visObserver.disconnect()
    isVisible = false
    cancelAnimationFrame(animId)

    updateTexture = null
    setVideoSource = null
    setOpenProgress = null
    disposeVideo()
    posterTexture.dispose()
    kbTex.dispose()
    renderer.dispose()

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
      initMacbook()
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
    if (updateTexture) updateTexture(src)
    else initMacbook()
  },
)

watch(
  () => props.videoSrc,
  (src) => {
    if (setVideoSource) setVideoSource(src)
    else initMacbook()
  },
)

watch(
  () => props.openProgress,
  (p) => {
    if (setOpenProgress) setOpenProgress(p)
    else initMacbook()
  },
  { immediate: true },
)
</script>

<template>
  <div ref="containerRef" class="macbook-3d-mount" />
</template>

<style scoped>
.macbook-3d-mount {
  width: 100%;
  height: 100%;
}
</style>
