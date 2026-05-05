<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'
import { useSharedMouse, delayedSampleAt } from '../composables/useSharedMouse'

const props = withDefaults(defineProps<{
  tiltDelayMs?: number
}>(), {
  tiltDelayMs: 0,
})

const containerRef = ref<HTMLDivElement | null>(null)
let cleanup: (() => void) | null = null
let initObserver: IntersectionObserver | null = null
let initialized = false

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

function configureFaceUvs(geo: THREE.ShapeGeometry, w: number, h: number) {
  const pos = geo.attributes.position as THREE.BufferAttribute
  const uvs = new Float32Array(pos.count * 2)

  for (let i = 0; i < pos.count; i += 1) {
    uvs[i * 2] = (pos.getX(i) + w / 2) / w
    uvs[i * 2 + 1] = (pos.getY(i) + h / 2) / h
  }

  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
}

function initTag() {
  const container = containerRef.value
  if (!container || initialized) return

  initialized = true
  const mount = container

  const width = Math.max(mount.clientWidth, 1)
  const height = Math.max(mount.clientHeight, 1)

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.35
  mount.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100)
  camera.position.set(0, 0, 3.3)

  scene.add(new THREE.AmbientLight(0xffffff, 0.48))

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.55)
  keyLight.position.set(2, 3, 4)
  scene.add(keyLight)

  const edgeLight = new THREE.DirectionalLight(0x9fd7ff, 0.36)
  edgeLight.position.set(-3, -1, 3)
  scene.add(edgeLight)

  const W = 1.1
  const H = 1.1
  const D = 0.08
  const R = 0.22

  const tag = new THREE.Group()

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
  tag.add(body)

  const faceCanvas = document.createElement('canvas')
  faceCanvas.width = 512
  faceCanvas.height = 512
  const faceCtx = faceCanvas.getContext('2d')
  const faceTexture = new THREE.CanvasTexture(faceCanvas)
  faceTexture.colorSpace = THREE.SRGBColorSpace
  faceTexture.wrapS = THREE.ClampToEdgeWrapping
  faceTexture.wrapT = THREE.ClampToEdgeWrapping

  const textCanvas = document.createElement('canvas')
  textCanvas.width = 512
  textCanvas.height = 256
  const textCtx = textCanvas.getContext('2d')
  const textTexture = new THREE.CanvasTexture(textCanvas)
  textTexture.colorSpace = THREE.SRGBColorSpace
  textTexture.wrapS = THREE.ClampToEdgeWrapping
  textTexture.wrapT = THREE.ClampToEdgeWrapping

  function drawText() {
    if (!textCtx) return

    const w = textCanvas.width
    const h = textCanvas.height
    textCtx.clearRect(0, 0, w, h)
    textCtx.font = '900 122px JetBrains Mono, SF Mono, monospace'
    textCtx.textAlign = 'center'
    textCtx.textBaseline = 'middle'
    textCtx.fillStyle = 'rgba(204,255,0,0.98)'
    textCtx.shadowColor = 'rgba(204,255,0,0.72)'
    textCtx.shadowBlur = 28

    const letters = ['N', 'F', 'C']
    const spacing = 98
    letters.forEach((letter, index) => {
      textCtx.fillText(letter, w / 2 + (index - 1) * spacing, h / 2 + 10)
    })

    textCtx.shadowBlur = 0
    textTexture.needsUpdate = true
  }

  function drawFace(mx = 0, my = 0) {
    if (!faceCtx) return

    const size = faceCanvas.width
    faceCtx.clearRect(0, 0, size, size)

    const base = faceCtx.createLinearGradient(0, 0, size, size)
    base.addColorStop(0, '#171f1d')
    base.addColorStop(0.58, '#07100d')
    base.addColorStop(1, '#010202')
    faceCtx.fillStyle = base
    faceCtx.fillRect(0, 0, size, size)

    const shine = faceCtx.createRadialGradient(
      size * (0.42 + mx * 0.12),
      size * (0.36 + my * 0.1),
      0,
      size * (0.42 + mx * 0.12),
      size * (0.36 + my * 0.1),
      size * 0.42,
    )
    shine.addColorStop(0, 'rgba(255,255,255,0.16)')
    shine.addColorStop(0.46, 'rgba(255,255,255,0.04)')
    shine.addColorStop(1, 'rgba(255,255,255,0)')
    faceCtx.fillStyle = shine
    faceCtx.fillRect(0, 0, size, size)

    faceCtx.strokeStyle = 'rgba(255,255,255,0.06)'
    faceCtx.lineWidth = 4
    faceCtx.strokeRect(44, 44, size - 88, size - 88)

    faceTexture.needsUpdate = true
  }

  drawFace()
  drawText()

  const faceW = W - 0.07
  const faceH = H - 0.07
  const faceR = R - 0.035
  const faceGeo = new THREE.ShapeGeometry(roundedRect(faceW, faceH, faceR))
  configureFaceUvs(faceGeo, faceW, faceH)

  const face = new THREE.Mesh(
    faceGeo,
    new THREE.MeshBasicMaterial({
      map: faceTexture,
      toneMapped: false,
    }),
  )
  face.position.z = D / 2 + 0.003
  face.renderOrder = 1
  tag.add(face)

  const text = new THREE.Mesh(
    new THREE.PlaneGeometry(0.76, 0.36),
    new THREE.MeshBasicMaterial({
      map: textTexture,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    }),
  )
  text.position.z = D / 2 + 0.018
  text.renderOrder = 4
  tag.add(text)

  const glass = new THREE.Mesh(
    new THREE.ShapeGeometry(roundedRect(faceW, faceH, faceR)),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.035,
      roughness: 0.04,
      metalness: 0,
      clearcoat: 1,
    }),
  )
  glass.position.z = D / 2 + 0.022
  glass.renderOrder = 5
  tag.add(glass)

  let targetRotX = 0.08
  let targetRotY = -0.12
  let currentRotX = 0.08
  let currentRotY = -0.12
  let animId = 0
  let isVisible = false
  let resizeRaf = 0
  let lastMx = 0
  let lastMy = 0

  const sharedMouse = useSharedMouse()

  function applyPointerTilt(mx: number, my: number) {
    targetRotY = mx * 0.35
    targetRotX = my * 0.15
    keyLight.position.x = 2 + mx * 1.5
    keyLight.position.y = 3 - my

    if (Math.abs(mx - lastMx) > 0.01 || Math.abs(my - lastMy) > 0.01) {
      lastMx = mx
      lastMy = my
      drawFace(mx, my)
    }
  }

  function animate() {
    if (!isVisible || document.hidden) {
      animId = 0
      return
    }

    animId = requestAnimationFrame(animate)

    const delay = Math.max(0, props.tiltDelayMs)
    if (delay > 0) {
      const delayed = delayedSampleAt(sharedMouse.samples, performance.now() - delay)
      if (delayed) applyPointerTilt(delayed.mx, delayed.my)
    } else if (sharedMouse.samples.length > 0) {
      applyPointerTilt(sharedMouse.latest.mx, sharedMouse.latest.my)
    }

    currentRotX += (targetRotX - currentRotX) * 0.06
    currentRotY += (targetRotY - currentRotY) * 0.06
    tag.rotation.x = currentRotX
    tag.rotation.y = currentRotY
    renderer.render(scene, camera)
  }

  scene.add(tag)
  renderer.render(scene, camera)

  const visObserver = new IntersectionObserver(
    (entries) => {
      isVisible = entries[0]?.isIntersecting ?? false
      if (isVisible && !animId && !document.hidden) animate()
    },
    { threshold: 0 },
  )
  visObserver.observe(mount)

  function applyResize() {
    const nextW = Math.max(mount.clientWidth, 1)
    const nextH = Math.max(mount.clientHeight, 1)
    renderer.setSize(nextW, nextH)
    camera.aspect = nextW / nextH
    camera.updateProjectionMatrix()
    renderer.render(scene, camera)
  }

  function onResize() {
    if (resizeRaf) return
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = 0
      applyResize()
    })
  }
  window.addEventListener('resize', onResize, { passive: true })

  cleanup = () => {
    window.removeEventListener('resize', onResize)
    if (resizeRaf) cancelAnimationFrame(resizeRaf)
    visObserver.disconnect()
    isVisible = false
    cancelAnimationFrame(animId)

    faceTexture.dispose()
    textTexture.dispose()
    renderer.dispose()
    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return
      object.geometry.dispose()
      const materials = Array.isArray(object.material) ? object.material : [object.material]
      materials.forEach((material) => material.dispose())
    })

    if (mount.contains(renderer.domElement)) {
      mount.removeChild(renderer.domElement)
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
      initTag()
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
</script>

<template>
  <div ref="containerRef" class="nfc-tag-3d-mount" />
</template>

<style scoped>
.nfc-tag-3d-mount {
  width: 100%;
  height: 100%;
}

.nfc-tag-3d-mount :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
