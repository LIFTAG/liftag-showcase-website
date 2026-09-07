import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { createPhoneModel, PHONE_H, PHONE_SCR_H, PHONE_SCR_W, PHONE_SCREEN_Z } from '../phoneModel.ts'
import { disposeTree } from './dispose.ts'
import { recordingCycle } from './coachingTimeline.ts'

export const RECORDING_DURATION = 4.8

export interface RecordingMotion {
  durationSeconds: number
  carriage: {
    axis: [number, number, number]
    displacementMeters: number
    samples: [number, number][]
  }
}

export interface RecordingSceneFrame {
  seconds: number
  room: number
  recording: number
  transfer: number
  video?: HTMLVideoElement | null
}

const DEFAULT_MOTION: RecordingMotion = {
  durationSeconds: RECORDING_DURATION,
  carriage: {
    axis: [0, .786, -.618],
    displacementMeters: .14,
    samples: [[0, 0], [.0833, 0], [.5, 1], [.5833, 1], [1, 0]],
  },
}

export function sampleRecordingMotion(motion: RecordingMotion, seconds: number): number {
  const t = recordingCycle(seconds, motion.durationSeconds) / motion.durationSeconds
  const samples = motion.carriage.samples
  const found = samples.findIndex(sample => sample[0] >= t)
  const next = found < 0 ? samples.length - 1 : Math.max(1, found)
  const [ta, va] = samples[next - 1] ?? [0, 0]
  const [tb, vb] = samples[next] ?? samples.at(-1) ?? [1, 0]
  return THREE.MathUtils.lerp(va, vb, (t - ta) / Math.max(.0001, tb - ta))
}

/** Props surrounding the existing hero machine. The machine itself is never cloned. */
export function createRecordingScene(loggerTexture: THREE.Texture) {
  const group = new THREE.Group()
  group.name = 'LiftagRecordingBay'
  group.visible = false

  const graphite = new THREE.MeshStandardMaterial({ color: 0x202620, roughness: .7, metalness: .18 })
  const black = new THREE.MeshStandardMaterial({ color: 0x090c09, roughness: .52, metalness: .52 })
  const lime = new THREE.MeshBasicMaterial({ color: 0xccff00, toneMapped: false })

  const tripod = new THREE.Group()
  tripod.name = 'RecordingTripod'
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(.018, .025, 1.05, 8), black)
  stem.position.y = .64
  tripod.add(stem)
  for (let i = 0; i < 3; i++) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(.011, .016, .72, 7), black)
    leg.position.set(Math.cos(i * Math.PI * 2 / 3) * .22, .3, Math.sin(i * Math.PI * 2 / 3) * .22)
    leg.rotation.z = Math.cos(i * Math.PI * 2 / 3) * .32
    leg.rotation.x = Math.sin(i * Math.PI * 2 / 3) * .32
    tripod.add(leg)
  }
  const phone = new THREE.Mesh(new THREE.BoxGeometry(.18, .34, .025), black)
  phone.position.y = 1.28
  const lens = new THREE.Mesh(new THREE.CircleGeometry(.025, 18), lime)
  lens.position.set(0, 1.34, -.014)
  lens.rotation.y = Math.PI
  tripod.add(phone, lens)
  tripod.position.set(-1.7, 0, -1.3)
  tripod.rotation.y = Math.atan2(1.7, 1.3)
  group.add(tripod)

  // The established logger remains in the bay as the destination. Its close
  // framing matches the phone-only shot at both ends of the camera move.
  const loggerScreenMaterial = new THREE.MeshBasicMaterial({ map: loggerTexture, toneMapped: false })
  const loggerModel = createPhoneModel({ screenMaterial: loggerScreenMaterial, castShadow: true })
  const loggerPhone = loggerModel.group
  const phoneScale = 1.38 / PHONE_H
  loggerPhone.scale.setScalar(phoneScale)
  loggerPhone.position.set(-1, 1.18, 1.65)
  loggerPhone.rotation.y = -1.61
  group.add(loggerPhone)

  const posterTexture = new THREE.Texture()
  posterTexture.colorSpace = THREE.SRGBColorSpace
  const poster = new Image()
  poster.onload = () => { if (!disposed) { posterTexture.image = poster; posterTexture.needsUpdate = true } }
  poster.src = '/assets/gym3d/recording/pivot-leg-press-poster.webp'
  const slotWidth = PHONE_SCR_W * phoneScale * (724 / 768)
  const slotHeight = PHONE_SCR_H * phoneScale * (424 / 1536)
  const thumbnailMaterial = new THREE.MeshBasicMaterial({ map: posterTexture, toneMapped: false, transparent: true, opacity: 0 })
  poster.onerror = () => {
    if (disposed) return
    thumbnailMaterial.map = null
    thumbnailMaterial.color.set(0x26341a)
    thumbnailMaterial.needsUpdate = true
  }
  const thumbnail = new THREE.Mesh(new THREE.PlaneGeometry(slotWidth, slotHeight), thumbnailMaterial)
  thumbnail.renderOrder = 5
  group.add(thumbnail)
  const sourceThumbnailRotation = new THREE.Quaternion()

  const points: THREE.Vector3[] = []
  loggerPhone.updateMatrixWorld(true)
  tripod.updateMatrixWorld(true)
  const dockPoint = new THREE.Vector3(0, (0.5 - 521 / 1536) * PHONE_SCR_H, PHONE_SCREEN_Z + .006)
    .multiplyScalar(phoneScale)
    .applyQuaternion(loggerPhone.quaternion)
    .add(loggerPhone.position)
  const capturePoint = new THREE.Vector3()
  lens.getWorldPosition(capturePoint)
  const curve = new THREE.QuadraticBezierCurve3(
    capturePoint,
    capturePoint.clone().lerp(dockPoint, .5).add(new THREE.Vector3(0, .72, .18)),
    dockPoint,
  )
  for (let i = 0; i <= 64; i++) points.push(curve.getPoint(i / 64))
  thumbnail.position.copy(points[0]!)
  thumbnail.lookAt(4.15, 1.92, 4.62)
  sourceThumbnailRotation.copy(thumbnail.quaternion)
  const traceGeometry = new THREE.BufferGeometry().setFromPoints(points)
  traceGeometry.setDrawRange(0, 0)
  const trace = new THREE.Line(traceGeometry, new THREE.LineBasicMaterial({ color: 0xccff00, transparent: true, opacity: .75, toneMapped: false }))
  trace.frustumCulled = false
  group.add(trace)

  let mixer: THREE.AnimationMixer | null = null
  let mannequin: THREE.Object3D | null = null
  let motion = DEFAULT_MOTION
  let loading: Promise<void> | null = null
  let disposed = false
  const carriageOffset = new THREE.Vector3()
  let videoTexture: THREE.VideoTexture | null = null
  let videoElement: HTMLVideoElement | null = null

  // Visible immediately if the GLB is late or unavailable: a faceless,
  // graphite athlete with supported torso and feet planted on the plate.
  const fallback = new THREE.Group()
  fallback.name = 'RecordingMannequinFallback'
  const body = (geometry: THREE.BufferGeometry, position: [number, number, number], rotation: [number, number, number] = [0, 0, 0]) => {
    const mesh = new THREE.Mesh(geometry, graphite); mesh.position.set(...position); mesh.rotation.set(...rotation); mesh.castShadow = true; fallback.add(mesh)
  }
  body(new THREE.SphereGeometry(.14, 16, 12), [0, 1.62, .28])
  body(new THREE.CapsuleGeometry(.2, .5, 6, 12), [0, 1.27, .1], [.55, 0, 0])
  body(new THREE.CapsuleGeometry(.105, .55, 5, 10), [-.2, .91, -.18], [-.82, 0, -.08])
  body(new THREE.CapsuleGeometry(.105, .55, 5, 10), [.2, .91, -.18], [-.82, 0, .08])
  body(new THREE.CapsuleGeometry(.085, .5, 5, 10), [-.22, .69, -.52], [-1.05, 0, 0])
  body(new THREE.CapsuleGeometry(.085, .5, 5, 10), [.22, .69, -.52], [-1.05, 0, 0])
  group.add(fallback)

  async function load() {
    if (loading) return loading
    loading = Promise.all([
      new GLTFLoader().loadAsync('/assets/gym3d/recording/pivot-leg-press-mannequin.glb'),
      fetch('/assets/gym3d/recording/pivot-leg-press-motion.json').then(response => response.ok ? response.json() as Promise<RecordingMotion> : DEFAULT_MOTION).catch(() => DEFAULT_MOTION),
    ]).then(([gltf, metadata]) => {
      if (disposed) { disposeTree(gltf.scene); return }
      motion = metadata
      mannequin = gltf.scene.getObjectByName('RecordingRig') ?? gltf.scene
      mannequin.traverse(node => {
        if (!(node instanceof THREE.Mesh)) return
        node.castShadow = true
        node.receiveShadow = true
        const materials = Array.isArray(node.material) ? node.material : [node.material]
        for (const material of materials) {
          if (!(material instanceof THREE.MeshStandardMaterial)) continue
          material.color.set(0x292f2a)
          material.roughness = .72
          material.metalness = .12
        }
      })
      group.add(mannequin)
      fallback.visible = false
      const clip = gltf.animations.find(item => item.name === 'PivotLegPressCycle') ?? gltf.animations[0]
      if (clip) { mixer = new THREE.AnimationMixer(mannequin); mixer.clipAction(clip).play() }
    }).catch(() => { fallback.visible = true })
    return loading
  }

  function update(frame: RecordingSceneFrame) {
    group.visible = frame.room > .002
    group.traverse(node => { if (node instanceof THREE.Mesh) node.visible = group.visible })
    tripod.visible = group.visible
    lens.scale.setScalar(.72 + frame.recording * .48)
    const lineMaterial = trace.material as THREE.LineBasicMaterial
    lineMaterial.opacity = frame.transfer * .82
    traceGeometry.setDrawRange(0, Math.round(65 * frame.transfer))
    thumbnail.visible = frame.transfer > .005
    thumbnailMaterial.opacity = Math.min(1, frame.transfer * 2)
    if (frame.video && frame.video.readyState >= 2 && frame.video.videoWidth) {
      if (videoElement !== frame.video) {
        videoTexture?.dispose()
        videoElement = frame.video
        videoTexture = new THREE.VideoTexture(frame.video)
        videoTexture.colorSpace = THREE.SRGBColorSpace
        videoTexture.generateMipmaps = false
        thumbnailMaterial.map = videoTexture
        thumbnailMaterial.needsUpdate = true
      }
    }
    curve.getPoint(frame.transfer, thumbnail.position)
    thumbnail.scale.setScalar(THREE.MathUtils.lerp(.72, 1, frame.transfer))
    thumbnail.quaternion.slerpQuaternions(sourceThumbnailRotation, loggerPhone.quaternion, frame.transfer)
    mixer?.setTime(recordingCycle(frame.seconds, RECORDING_DURATION))
    const scalar = sampleRecordingMotion(motion, frame.seconds)
    return carriageOffset.set(...motion.carriage.axis).normalize().multiplyScalar(motion.carriage.displacementMeters * scalar)
  }

  return {
    group, load, update,
    dispose() {
      disposed = true
      poster.onload = null
      poster.onerror = null
      mixer?.stopAllAction()
      group.removeFromParent()
      disposeTree(group)
      videoTexture?.dispose()
      graphite.dispose(); black.dispose(); lime.dispose(); posterTexture.dispose(); traceGeometry.dispose()
    },
  }
}
