// @ts-nocheck
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface Phone3DProps {
  screenshotSrc: string;
}

export default function Phone3D({ screenshotSrc }: Phone3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // --- Scene & Camera ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.5);

    // --- Lighting ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(2, 3, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 15;
    keyLight.shadow.camera.left = -2;
    keyLight.shadow.camera.right = 2;
    keyLight.shadow.camera.top = 3;
    keyLight.shadow.camera.bottom = -3;
    keyLight.shadow.radius = 6;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x8899cc, 0.3);
    fillLight.position.set(-3, 1, 3);
    scene.add(fillLight);

    // --- Shadow catcher plane (invisible, receives shadow) ---
    const shadowGeo = new THREE.PlaneGeometry(4, 6);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.position.z = -0.15;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // No glow light — just keep key/fill for shine

    // --- Phone dimensions (thin, modern) ---
    const W = 0.95;
    const H = 1.95;
    const D = 0.08;
    const R = 0.14; // corner radius
    const BEZEL = 0.025; // very thin bezel

    // --- Rounded rect shape helper ---
    function roundedRect(w, h, r) {
      const s = new THREE.Shape();
      const hw = w / 2, hh = h / 2;
      s.moveTo(-hw + r, -hh);
      s.lineTo(hw - r, -hh);
      s.quadraticCurveTo(hw, -hh, hw, -hh + r);
      s.lineTo(hw, hh - r);
      s.quadraticCurveTo(hw, hh, hw - r, hh);
      s.lineTo(-hw + r, hh);
      s.quadraticCurveTo(-hw, hh, -hw, hh - r);
      s.lineTo(-hw, -hh + r);
      s.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
      return s;
    }

    // --- Body ---
    const bodyGeo = new THREE.ExtrudeGeometry(roundedRect(W, H, R), {
      steps: 1,
      depth: D,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.012,
      bevelSegments: 5,
    });
    bodyGeo.center();

    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: 0x1c1c1e,
      metalness: 0.95,
      roughness: 0.2,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;

    // --- Screen (rounded corners matching iPhone) ---
    const scrW = W - BEZEL * 2;
    const scrH = H - BEZEL * 2;
    const scrR = R - BEZEL; // screen corner radius matches body minus bezel

    const screenShape = roundedRect(scrW, scrH, scrR);
    const screenGeo = new THREE.ShapeGeometry(screenShape);

    // Compute UVs for the rounded shape so the texture maps correctly
    const pos = screenGeo.attributes.position;
    const uvs = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
      uvs[i * 2] = (pos.getX(i) + scrW / 2) / scrW;
      uvs[i * 2 + 1] = (pos.getY(i) + scrH / 2) / scrH;
    }
    screenGeo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    const tex = new THREE.TextureLoader().load(screenshotSrc);
    tex.colorSpace = THREE.SRGBColorSpace;

    const screenMat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.z = D / 2 + 0.013;

    // --- Screen glass overlay (subtle reflection, also rounded) ---
    const glassGeo = new THREE.ShapeGeometry(roundedRect(scrW, scrH, scrR));
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.03,
      roughness: 0.05,
      metalness: 0,
      clearcoat: 1,
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.z = D / 2 + 0.014;

    // --- Dynamic Island ---
    const diW = 0.26, diH = 0.065;
    const diShape = new THREE.Shape();
    const dir = diH / 2;
    diShape.absarc(diW / 2 - dir, 0, dir, -Math.PI / 2, Math.PI / 2, false);
    diShape.absarc(-diW / 2 + dir, 0, dir, Math.PI / 2, -Math.PI / 2, false);
    const diGeo = new THREE.ShapeGeometry(diShape);
    const diMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const di = new THREE.Mesh(diGeo, diMat);
    di.position.set(0, scrH / 2 - 0.06, D / 2 + 0.0145);

    // --- Side buttons ---
    const btnMat = new THREE.MeshPhysicalMaterial({
      color: 0x2a2a2e,
      metalness: 0.95,
      roughness: 0.15,
    });

    // Power button (right side)
    const powerGeo = new THREE.BoxGeometry(0.014, 0.19, 0.05);
    const powerBtn = new THREE.Mesh(powerGeo, btnMat);
    powerBtn.position.set(W / 2 + 0.014, 0.35, 0);

    // Volume buttons (left side, close together)
    const volGeo = new THREE.BoxGeometry(0.014, 0.13, 0.05);
    const volUp = new THREE.Mesh(volGeo, btnMat);
    volUp.position.set(-W / 2 - 0.014, 0.36, 0);
    const volDown = new THREE.Mesh(volGeo, btnMat);
    volDown.position.set(-W / 2 - 0.014, 0.16, 0);

    // Mute switch (above volume buttons)
    const muteGeo = new THREE.BoxGeometry(0.014, 0.08, 0.04);
    const muteSwitch = new THREE.Mesh(muteGeo, btnMat);
    muteSwitch.position.set(-W / 2 - 0.014, 0.58, 0);

    // --- Camera module (back) ---
    const camHousingGeo = new THREE.ExtrudeGeometry(roundedRect(0.35, 0.35, 0.06), {
      depth: 0.015, bevelEnabled: true,
      bevelThickness: 0.005, bevelSize: 0.005, bevelSegments: 3,
    });
    const camHousingMat = new THREE.MeshPhysicalMaterial({
      color: 0x1c1c1e, metalness: 0.9, roughness: 0.2,
    });
    const camHousing = new THREE.Mesh(camHousingGeo, camHousingMat);
    camHousing.position.set(-0.15, 0.6, -D / 2 - 0.02);

    const lensGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.02, 24);
    const lensMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a0a12, metalness: 0.5, roughness: 0.05, clearcoat: 1,
    });
    const lensRingMat = new THREE.MeshPhysicalMaterial({
      color: 0x333338, metalness: 0.95, roughness: 0.1,
    });
    const lensRingGeo = new THREE.TorusGeometry(0.048, 0.005, 8, 32);

    function makeLens(x, y) {
      const lens = new THREE.Mesh(lensGeo, lensMat);
      lens.rotation.x = Math.PI / 2;
      lens.position.set(x, y, -D / 2 - 0.03);
      const ring = new THREE.Mesh(lensRingGeo, lensRingMat);
      ring.position.set(x, y, -D / 2 - 0.022);
      return [lens, ring];
    }

    const [l1, r1] = makeLens(-0.22, 0.68);
    const [l2, r2] = makeLens(-0.08, 0.68);
    const [l3, r3] = makeLens(-0.15, 0.52);

    // --- Assemble ---
    const phone = new THREE.Group();
    phone.add(body, screen, glass, di, powerBtn, volUp, volDown, muteSwitch);
    phone.add(camHousing, l1, r1, l2, r2, l3, r3);

    phone.rotation.x = 0.08;
    phone.rotation.y = -0.12;
    scene.add(phone);

    // --- State ---
    let targetRotX = 0.08, targetRotY = -0.12;
    let currentRotX = 0.08, currentRotY = -0.12;
    let animId = 0;

    const onMouseMove = (e) => {
      if (gyroActive) return; // gyro takes priority on mobile
      const mx = (e.clientX / window.innerWidth - 0.5) * 2;
      const my = (e.clientY / window.innerHeight - 0.5) * 2;
      targetRotY = mx * 0.35;
      targetRotX = -my * 0.15;
      keyLight.position.x = 2 + mx * 1.5;
      keyLight.position.y = 3 - my * 1;
    };
    window.addEventListener("mousemove", onMouseMove);

    // --- Gyroscope tilt for mobile ---
    let gyroActive = false;
    let gyroCleanup: (() => void) | null = null;

    const onDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      gyroActive = true;
      const mx = Math.max(-1, Math.min(1, e.gamma / 30));
      const my = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
      targetRotY = mx * 0.35;
      targetRotX = -my * 0.15;
      keyLight.position.x = 2 + mx * 1.5;
      keyLight.position.y = 3 - my * 1;
    };

    function enableGyro() {
      window.addEventListener("deviceorientation", onDeviceOrientation);
    }

    // Try gyro directly (works on Android + older iOS)
    const DOE = (window as any).DeviceOrientationEvent;
    if (DOE && typeof DOE.requestPermission === "function") {
      // iOS 13+ — request on tap of the phone mockup itself
      const requestOnTap = () => {
        DOE.requestPermission().then((state: string) => {
          if (state === "granted") enableGyro();
        }).catch(() => {});
      };
      container.addEventListener("touchend", requestOnTap, { once: true });
      gyroCleanup = () => {
        container.removeEventListener("touchend", requestOnTap);
        window.removeEventListener("deviceorientation", onDeviceOrientation);
      };
    } else if (DOE) {
      // Android / non-permission browsers — just enable
      enableGyro();
      gyroCleanup = () => window.removeEventListener("deviceorientation", onDeviceOrientation);
    }

    // Visibility-aware render loop — pause when off-screen
    let isVisible = false;
    const visObserver = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? false;
        if (isVisible && !animId) animate();
      },
      { threshold: 0 }
    );
    visObserver.observe(container);

    function animate() {
      if (!isVisible) { animId = 0; return; }
      animId = requestAnimationFrame(animate);
      currentRotX += (targetRotX - currentRotX) * 0.06;
      currentRotY += (targetRotY - currentRotY) * 0.06;
      phone.rotation.x = currentRotX;
      phone.rotation.y = currentRotY;
      renderer.render(scene, camera);
    }
    animate();

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize, { passive: true });

    cleanupRef.current = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      gyroCleanup?.();
      visObserver.disconnect();
      isVisible = false;
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };

    return () => cleanupRef.current?.();
  }, [screenshotSrc]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
    />
  );
}
