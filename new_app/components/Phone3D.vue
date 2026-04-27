<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'

const props = withDefaults(defineProps<{
  screenshotSrc: string
  tiltDelayMs?: number
}>(), {
  tiltDelayMs: 0,
})

const containerRef = ref<HTMLDivElement | null>(null)
let cleanup: (() => void) | null = null
let updateTexture: ((src: string) => void) | null = null
let initObserver: IntersectionObserver | null = null
let initialized = false

function initPhone() {
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
  renderer.toneMappingExposure = 1.4
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100)
  camera.position.set(0, 0, 3.92)

  scene.add(new THREE.AmbientLight(0xffffff, 0.5))

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.5)
  keyLight.position.set(2, 3, 5)
  keyLight.castShadow = true
  keyLight.shadow.mapSize.width = 1024
  keyLight.shadow.mapSize.height = 1024
  keyLight.shadow.camera.near = 0.5
  keyLight.shadow.camera.far = 15
  keyLight.shadow.camera.left = -2
  keyLight.shadow.camera.right = 2
  keyLight.shadow.camera.top = 3
  keyLight.shadow.camera.bottom = -3
  keyLight.shadow.radius = 6
  scene.add(keyLight)

  const fillLight = new THREE.DirectionalLight(0x8899cc, 0.3)
  fillLight.position.set(-3, 1, 3)
  scene.add(fillLight)

  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 6),
    new THREE.ShadowMaterial({ opacity: 0.35 }),
  )
  shadowPlane.position.z = -0.15
  shadowPlane.receiveShadow = true
  scene.add(shadowPlane)

  const W = 0.95
  const H = 1.95
  const D = 0.08
  const R = 0.14
  const BEZEL = 0.025

  function roundedRect(w: number, h: number, r: number) {
    const shape = new THREE.Shape()
    const hw = w / 2
    const hh = h / 2

    shape.moveTo(-hw + r, -hh)
    shape.lineTo(hw - r, -hh)
    shape.quadraticCurveTo(hw, -hh, hw, -hh + r)
    shape.lineTo(hw, hh - r)
    shape.quadraticCurveTo(hw, hh, hw - r, hh)
    shape.lineTo(-hw + r, hh)
    shape.quadraticCurveTo(-hw, hh, -hw, hh - r)
    shape.lineTo(-hw, -hh + r)
    shape.quadraticCurveTo(-hw, -hh, -hw + r, -hh)

    return shape
  }

  const bodyGeo = new THREE.ExtrudeGeometry(roundedRect(W, H, R), {
    steps: 1,
    depth: D,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 5,
  })
  bodyGeo.center()

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0x1c1c1e,
    metalness: 0.95,
    roughness: 0.2,
    clearcoat: 0.8,
    clearcoatRoughness: 0.15,
  })
  const body = new THREE.Mesh(bodyGeo, bodyMat)
  body.castShadow = true

  const scrW = W - BEZEL * 2
  const scrH = H - BEZEL * 2
  const scrR = R - BEZEL
  const screenGeo = new THREE.ShapeGeometry(roundedRect(scrW, scrH, scrR))
  const pos = screenGeo.attributes.position as THREE.BufferAttribute
  const uvs = new Float32Array(pos.count * 2)

  for (let i = 0; i < pos.count; i += 1) {
    uvs[i * 2] = (pos.getX(i) + scrW / 2) / scrW
    uvs[i * 2 + 1] = (pos.getY(i) + scrH / 2) / scrH
  }

  screenGeo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))

  const textureLoader = new THREE.TextureLoader()
  let activeTexture = textureLoader.load(props.screenshotSrc)
  activeTexture.colorSpace = THREE.SRGBColorSpace
  const screenMat = new THREE.MeshBasicMaterial({ map: activeTexture, toneMapped: false })

  const screen = new THREE.Mesh(
    screenGeo,
    screenMat,
  )
  screen.position.z = D / 2 + 0.013

  const glass = new THREE.Mesh(
    new THREE.ShapeGeometry(roundedRect(scrW, scrH, scrR)),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.03,
      roughness: 0.05,
      metalness: 0,
      clearcoat: 1,
    }),
  )
  glass.position.z = D / 2 + 0.014

  const diW = 0.26
  const diH = 0.065
  const diShape = new THREE.Shape()
  const diR = diH / 2
  diShape.absarc(diW / 2 - diR, 0, diR, -Math.PI / 2, Math.PI / 2, false)
  diShape.absarc(-diW / 2 + diR, 0, diR, Math.PI / 2, -Math.PI / 2, false)

  const dynamicIsland = new THREE.Mesh(
    new THREE.ShapeGeometry(diShape),
    new THREE.MeshBasicMaterial({ color: 0x000000 }),
  )
  dynamicIsland.position.set(0, scrH / 2 - 0.06, D / 2 + 0.0145)

  const btnMat = new THREE.MeshPhysicalMaterial({
    color: 0x2a2a2e,
    metalness: 0.95,
    roughness: 0.15,
  })

  const powerBtn = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.19, 0.05), btnMat)
  powerBtn.position.set(W / 2 + 0.014, 0.35, 0)

  const volUp = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.13, 0.05), btnMat)
  volUp.position.set(-W / 2 - 0.014, 0.36, 0)

  const volDown = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.13, 0.05), btnMat)
  volDown.position.set(-W / 2 - 0.014, 0.16, 0)

  const muteSwitch = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.08, 0.04), btnMat)
  muteSwitch.position.set(-W / 2 - 0.014, 0.58, 0)

  const camHousing = new THREE.Mesh(
    new THREE.ExtrudeGeometry(roundedRect(0.35, 0.35, 0.06), {
      depth: 0.015,
      bevelEnabled: true,
      bevelThickness: 0.005,
      bevelSize: 0.005,
      bevelSegments: 3,
    }),
    new THREE.MeshPhysicalMaterial({
      color: 0x1c1c1e,
      metalness: 0.9,
      roughness: 0.2,
    }),
  )
  camHousing.position.set(-0.15, 0.6, -D / 2 - 0.02)

  const lensGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.02, 24)
  const lensMat = new THREE.MeshPhysicalMaterial({
    color: 0x0a0a12,
    metalness: 0.5,
    roughness: 0.05,
    clearcoat: 1,
  })
  const lensRingGeo = new THREE.TorusGeometry(0.048, 0.005, 8, 32)
  const lensRingMat = new THREE.MeshPhysicalMaterial({
    color: 0x333338,
    metalness: 0.95,
    roughness: 0.1,
  })

  function makeLens(x: number, y: number) {
    const lens = new THREE.Mesh(lensGeo, lensMat)
    lens.rotation.x = Math.PI / 2
    lens.position.set(x, y, -D / 2 - 0.03)

    const ring = new THREE.Mesh(lensRingGeo, lensRingMat)
    ring.position.set(x, y, -D / 2 - 0.022)

    return [lens, ring]
  }

  const [l1, r1] = makeLens(-0.22, 0.68)
  const [l2, r2] = makeLens(-0.08, 0.68)
  const [l3, r3] = makeLens(-0.15, 0.52)

  const phone = new THREE.Group()
  phone.add(body, screen, glass, dynamicIsland, powerBtn, volUp, volDown, muteSwitch)
  phone.add(camHousing, l1, r1, l2, r2, l3, r3)
  phone.rotation.x = 0.08
  phone.rotation.y = -0.12
  scene.add(phone)

  updateTexture = (src: string) => {
    const previousTexture = activeTexture
    activeTexture = textureLoader.load(src, () => {
      screenMat.map = activeTexture
      screenMat.needsUpdate = true
      previousTexture.dispose()
      renderer.render(scene, camera)
    })
    activeTexture.colorSpace = THREE.SRGBColorSpace
  }

  let gyroActive = false
  let gyroCleanup: (() => void) | null = null
  let targetRotX = 0.08
  let targetRotY = -0.12
  let currentRotX = 0.08
  let currentRotY = -0.12
  let animId = 0
  let isVisible = false
  const pointerSamples: Array<{ time: number, mx: number, my: number }> = []

  function applyPointerTilt(mx: number, my: number) {
    targetRotY = mx * 0.35
    targetRotX = my * 0.15
    keyLight.position.x = 2 + mx * 1.5
    keyLight.position.y = 3 - my
  }

  function delayedPointerSample(time: number) {
    if (!pointerSamples.length) return null

    while (pointerSamples.length > 2 && pointerSamples[1].time <= time) {
      pointerSamples.shift()
    }

    const previous = pointerSamples[0]
    const next = pointerSamples[1]
    if (time < previous.time) return null
    if (!next) return previous

    const t = Math.min(1, Math.max(0, (time - previous.time) / Math.max(1, next.time - previous.time)))
    return {
      time,
      mx: previous.mx + (next.mx - previous.mx) * t,
      my: previous.my + (next.my - previous.my) * t,
    }
  }

  const onMouseMove = (event: MouseEvent) => {
    if (gyroActive) return

    const mx = (event.clientX / window.innerWidth - 0.5) * 2
    const my = (event.clientY / window.innerHeight - 0.5) * 2
    const delay = Math.max(0, props.tiltDelayMs)

    if (delay > 0) {
      pointerSamples.push({ time: performance.now(), mx, my })
      if (pointerSamples.length > 80) pointerSamples.shift()
      return
    }

    applyPointerTilt(mx, my)
  }
  window.addEventListener('mousemove', onMouseMove)

  const onDeviceOrientation = (event: DeviceOrientationEvent) => {
    if (event.gamma == null || event.beta == null) return

    gyroActive = true

    const mx = Math.max(-1, Math.min(1, event.gamma / 30))
    const my = Math.max(-1, Math.min(1, (event.beta - 45) / 30))

    applyPointerTilt(mx, my)
  }

  function enableGyro() {
    window.addEventListener('deviceorientation', onDeviceOrientation)
  }

  const deviceOrientation = window.DeviceOrientationEvent as (typeof DeviceOrientationEvent & {
    requestPermission?: () => Promise<PermissionState>
  }) | undefined

  if (deviceOrientation && typeof deviceOrientation.requestPermission === 'function') {
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
  } else if (deviceOrientation) {
    enableGyro()
    gyroCleanup = () => window.removeEventListener('deviceorientation', onDeviceOrientation)
  }

  const animate = () => {
    if (!isVisible) {
      animId = 0
      return
    }

    animId = requestAnimationFrame(animate)
    const delay = Math.max(0, props.tiltDelayMs)
    if (!gyroActive && delay > 0) {
      const delayed = delayedPointerSample(performance.now() - delay)
      if (delayed) applyPointerTilt(delayed.mx, delayed.my)
    }

    currentRotX += (targetRotX - currentRotX) * 0.06
    currentRotY += (targetRotY - currentRotY) * 0.06
    phone.rotation.x = currentRotX
    phone.rotation.y = currentRotY
    renderer.render(scene, camera)
  }

  const visObserver = new IntersectionObserver(
    (entries) => {
      isVisible = entries[0]?.isIntersecting ?? false
      if (isVisible && !animId) animate()
    },
    { threshold: 0 },
  )
  visObserver.observe(container)

  const onResize = () => {
    const w = Math.max(container.clientWidth, 1)
    const h = Math.max(container.clientHeight, 1)

    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }
  window.addEventListener('resize', onResize, { passive: true })

  cleanup = () => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('resize', onResize)
    gyroCleanup?.()
    visObserver.disconnect()
    isVisible = false
    cancelAnimationFrame(animId)

    updateTexture = null
    activeTexture.dispose()
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
</script>

<template>
  <div ref="containerRef" class="phone-3d-mount" />
</template>
