// @ts-nocheck
"use client";
/* eslint-disable */

import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import Phone3D from "./Phone3D";

export default function LiftioApp() {
  useEffect(() => {
    'use strict';

    // Console easter egg for devs
    console.log(
      '%c⚡ LIFTIO',
      'color: #c8ff00; font-size: 28px; font-weight: 900; text-shadow: 0 0 20px rgba(200,255,0,0.5); background: #000; padding: 12px 20px; border-radius: 8px;'
    );
    console.log(
      '%cBuilt with obsessive attention to detail.\nThink you can keep up? → liftio.fit/careers',
      'color: rgba(255,255,255,0.5); font-size: 11px; line-height: 1.8;'
    );

    // Mount Three.js phone into container
    const phone3dContainer = document.getElementById('phone3dContainer');
    if (phone3dContainer) {
      const root = createRoot(phone3dContainer);
      root.render(<Phone3D screenshotSrc="/screenshot1.webp" />);
    }

    /* ═══════════════════════════════════════
       INTRO REVEAL — Logo silhouette mask
    ═══════════════════════════════════════ */
    const introReveal = document.getElementById('introReveal');
    const introCanvas = document.getElementById('introCanvas');
    const introCtx = introCanvas.getContext('2d');

    // Use SVG for crisp scaling at any size
    const silhouetteImg = new Image();
    silhouetteImg.src = 'logo_silluette.svg';

    let introStarted = false;
    let introComplete = false;
    let introRotation = 0;

    const HOLE_OFFSET_X = 0;
    const HOLE_OFFSET_Y = 0;

    function sizeIntroCanvas() {
      introCanvas.width = window.innerWidth;
      introCanvas.height = window.innerHeight;
    }
    sizeIntroCanvas();
    window.addEventListener('resize', () => { if (!introComplete) sizeIntroCanvas(); }, { passive: true });

    // Draw one frame: neon green fill with silhouette punched out
    function drawIntroFrame(holeScale) {
      const w = introCanvas.width;
      const h = introCanvas.height;

      introCtx.clearRect(0, 0, w, h);

      introCtx.globalCompositeOperation = 'source-over';
      introCtx.fillStyle = '#c8ff00';
      introCtx.fillRect(0, 0, w, h);

      introCtx.globalCompositeOperation = 'destination-out';

      if (silhouetteImg.complete && silhouetteImg.naturalWidth > 0) {
        const aspect = silhouetteImg.naturalWidth / silhouetteImg.naturalHeight;
        const sw = holeScale * aspect;
        const sh = holeScale;
        const cx = w / 2 - (HOLE_OFFSET_X * sw);
        const cy = h / 2 - (HOLE_OFFSET_Y * sh);

        introCtx.save();
        introCtx.translate(cx, cy);
        introCtx.rotate(-introRotation);
        introCtx.drawImage(silhouetteImg, -sw / 2, -sh / 2, sw, sh);
        introCtx.restore();
      }

      introCtx.globalCompositeOperation = 'source-over';
    }

    const INTRO_START_SIZE = 200;

    silhouetteImg.onload = () => drawIntroFrame(INTRO_START_SIZE);
    drawIntroFrame(INTRO_START_SIZE);

    function runIntroReveal() {
      if (introStarted) return;
      introStarted = true;

      const diagonal = Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2);
      const endSize = diagonal * 8;
      const duration = 2000;
      const start = performance.now();

      function animate(now) {
        const elapsed = now - start;
        let t = Math.min(elapsed / duration, 1);

        // Ease-in quintic — very slow start, explosive end
        const easedT = t * t * t * t * t;

        const size = INTRO_START_SIZE + (endSize - INTRO_START_SIZE) * easedT;
        // Clockwise rotation (~30° total)
        introRotation = -(t * t) * (Math.PI / 6);
        drawIntroFrame(size);

        // Pull green pane upward towards the end of the zoom
        if (t > 0.72) {
          const pullT = Math.min((t - 0.72) / 0.22, 1);
          // Ease-out cubic for a fast start, smooth deceleration
          const easedPull = 1 - Math.pow(1 - pullT, 3);
          introReveal.style.transform = `translateY(${-easedPull * 100}%)`;
        }

        // Reveal hero content
        const hero = document.getElementById('heroContent');
        if (t > 0.4 && !hero.classList.contains('revealed')) {
          hero.classList.add('revealed');
          // Trigger laser reveal animations
          setTimeout(runAllReveals, 400);
        }

        if (elapsed < duration) {
          requestAnimationFrame(animate);
        } else {
          introReveal.classList.add('done');
          introComplete = true;
          // Navbar enters after overlay is gone
          setTimeout(() => document.getElementById('navBrand')?.classList.add('nav-in'), 1200);
          setTimeout(() => document.getElementById('navLink0')?.classList.add('nav-in'), 1400);
          setTimeout(() => document.getElementById('navLink1')?.classList.add('nav-in'), 1500);
          setTimeout(() => document.getElementById('navLink2')?.classList.add('nav-in'), 1600);
          setTimeout(() => document.getElementById('navLink3')?.classList.add('nav-in'), 1700);
          setTimeout(() => document.getElementById('navCta')?.classList.add('nav-in'), 1500);
          // Show scroll hint after nav finishes entering
          setTimeout(() => document.getElementById('scrollHint')?.classList.add('visible'), 2200);
        }
      }
      requestAnimationFrame(animate);
    }

    /* ═══════════════════════════════════════
       LASER REVEAL — Charge → Sweep → Sparks
    ═══════════════════════════════════════ */
    function emitLaserSparks(el, posPercent, isGreen) {
      const rect = el.getBoundingClientRect();
      const x = rect.left + (posPercent / 100) * rect.width;
      const y = rect.top + rect.height / 2;
      const count = 1 + Math.floor(Math.random() * 2); // 1-2 sparks
      for (let i = 0; i < count; i++) {
        const spark = document.createElement('div');
        spark.className = 'laser-spark';
        const angle = (Math.random() - 0.5) * Math.PI * 0.9;
        const dist = 12 + Math.random() * 28;
        spark.style.left = x + 'px';
        spark.style.top = y + 'px';
        spark.style.background = isGreen ? 'var(--accent)' : 'var(--red-neon)';
        spark.style.boxShadow = isGreen
          ? '0 0 4px var(--accent), 0 0 8px var(--accent-glow)'
          : '0 0 4px var(--red-neon), 0 0 8px var(--red-neon-glow)';
        spark.style.setProperty('--sx', (Math.cos(angle) * dist * 0.4) + 'px');
        spark.style.setProperty('--sy', (Math.sin(angle) * dist) + 'px');
        document.body.appendChild(spark);
        setTimeout(() => spark.remove(), 450);
      }
    }

    function runLaserReveal(el, fromRight, duration, onDone) {
      if (!el || el.classList.contains('reveal-done')) return;

      const isGreen = el.classList.contains('laser-green');
      const rect = el.getBoundingClientRect();
      const chargeX = fromRight ? rect.right : rect.left;

      // Phase 1: Beam grows top-to-bottom at the start edge
      const beam = document.createElement('div');
      beam.className = 'laser-charge-beam ' + (isGreen ? 'green' : 'red');
      beam.style.left = chargeX + 'px';
      beam.style.top = (rect.top - rect.height * 0.2) + 'px';
      beam.style.height = (rect.height * 1.4) + 'px';
      document.body.appendChild(beam);

      setTimeout(() => {
        // Phase 2: Sweep with sparks
        el.classList.add('sweeping');
        el.style.setProperty('--laser-pos', fromRight ? '100%' : '0%');
        const start = performance.now();
        let lastSparkTime = 0;

        function animate(now) {
          const t = Math.min((now - start) / duration, 1);
          const eased = t < 0.5
            ? 2 * t * t
            : 1 - Math.pow(-2 * t + 2, 2) / 2;
          const pos = eased * 100;

          if (fromRight) {
            el.style.clipPath = `inset(-20% 0 -20% ${100 - Math.min(pos, 100)}%)`;
            el.style.setProperty('--laser-pos', (100 - pos) + '%');
          } else {
            el.style.clipPath = `inset(-20% ${100 - Math.min(pos, 100)}% -20% 0)`;
            el.style.setProperty('--laser-pos', pos + '%');
          }

          // Move the charge beam to follow the sweep
          beam.style.left = (rect.left + (fromRight ? (100 - pos) : pos) / 100 * rect.width) + 'px';

          // Emit sparks at the beam edge
          if (now - lastSparkTime > 70 && t > 0.04 && t < 0.92) {
            lastSparkTime = now;
            emitLaserSparks(el, fromRight ? (100 - pos) : pos, isGreen);
          }

          if (t < 1) {
            requestAnimationFrame(animate);
          } else {
            el.classList.remove('sweeping');
            el.classList.add('reveal-done');
            el.style.clipPath = 'inset(-20% 0 -20% 0)';
            // Phase 3: Beam shrinks bottom-to-top (disappears same way it appeared)
            beam.style.animation = 'chargeShrink 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
            setTimeout(() => beam.remove(), 300);
            if (onDone) onDone();
          }
        }
        requestAnimationFrame(animate);
      }, 250);
    }

    function revealHeroElement(id, delay) {
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hero-in');
      }, delay);
    }

    function runAllReveals() {
      const scan = document.getElementById('revealScan');
      const track = document.getElementById('revealTrack');
      const progress = document.getElementById('revealProgress');

      // Scan: left to right, green laser
      runLaserReveal(scan, false, 550, () => {
        // Track: right to left, red laser
        runLaserReveal(track, true, 550, () => {
          // Progress: left to right, green laser
          runLaserReveal(progress, false, 550, () => {
            // After all lasers done, animate hero elements in sequence
            revealHeroElement('heroLogo', 100);
            revealHeroElement('heroSub', 400);
            revealHeroElement('heroActions', 600);
          });
        });
      });
    }

    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    /* ═══════════════════════════════════════
       FRAME-BASED SCROLLYTELLING
    ═══════════════════════════════════════ */
    const TOTAL_FRAMES = 387;
    const SCENE_COUNT = 3;
    const LERP_SPEED = 0.15;

    const framePaths = [];
    for (let f = 1; f <= TOTAL_FRAMES; f++) {
      framePaths.push(`frames/f_${String(f).padStart(4, '0')}.webp`);
    }

    const canvas = document.getElementById('frameCanvas');
    const ctx = canvas.getContext('2d', { alpha: false });
    const scrollProgress = document.getElementById('scrollProgress');
    const heroContent = document.getElementById('heroContent');
    const navbar = document.getElementById('navbar');
    const canvasViewport = document.getElementById('canvasViewport');
    const phoneMockup = document.getElementById('phoneMockup');
    const frameCanvasEl = document.getElementById('frameCanvas');
    let phoneProgress = 0; // lerped scroll progress for phone

    let phoneHovered = false;
    let phoneScale = 1;
    phoneMockup.addEventListener('mouseenter', () => {
      phoneHovered = true;
      frameCanvasEl.style.filter = 'blur(12px) brightness(0.7)';
    });
    phoneMockup.addEventListener('mouseleave', () => {
      phoneHovered = false;
      frameCanvasEl.style.filter = 'none';
    });
    const videoOverlay = document.getElementById('videoOverlay');
    const sceneTexts = [
      document.getElementById('text0'),
      document.getElementById('text1'),
      document.getElementById('text2')
    ];

    const frames = new Array(TOTAL_FRAMES);
    let loadedCount = 0;
    let currentFrame = 0;
    let targetFrame = 0;
    let lastRenderedKey = '';
    let canvasW, canvasH;

    // Runway metrics
    const runway = document.getElementById('scrollRunway');

    function sizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // cap DPR for perf
      canvasW = Math.round(window.innerWidth * dpr);
      canvasH = Math.round(window.innerHeight * dpr);
      canvas.width = canvasW;
      canvas.height = canvasH;
      lastRenderedKey = '';
    }
    window.addEventListener('resize', sizeCanvas, { passive: true });
    sizeCanvas();

    // --- Load frames (sliding window — only ~60 frames in memory at a time) ---
    const BATCH_SIZE = 40;
    const WINDOW_HALF = 30; // keep 30 frames before & after current position

    // Loading indicator inside the intro reveal canvas
    const loadingLabel = document.createElement('div');
    loadingLabel.id = 'frameLoadingLabel';
    loadingLabel.textContent = '0 %';
    Object.assign(loadingLabel.style, {
      position: 'fixed', bottom: '48px', left: '50%', transform: 'translateX(-50%)',
      zIndex: '100001', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px',
      color: '#000', letterSpacing: '0.06em', opacity: '0.6', pointerEvents: 'none',
    });
    introReveal?.parentNode?.appendChild(loadingLabel);

    function loadFrame(index: number): Promise<void> {
      if (index < 0 || index >= TOTAL_FRAMES) return Promise.resolve();
      if (frames[index]) return Promise.resolve(); // already loaded — no-op
      return new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
          frames[index] = img;
          loadedCount++;
          if (index === 0) drawSingle(0);
          // Update loading indicator
          const pct = Math.round((loadedCount / TOTAL_FRAMES) * 100);
          if (loadingLabel) loadingLabel.textContent = `${pct} %`;
          // Start intro once 60% of frames are loaded
          const revealThreshold = Math.ceil(TOTAL_FRAMES * 0.6);
          if (loadedCount >= revealThreshold && !introStarted) {
            if (loadingLabel) loadingLabel.remove();
            runIntroReveal();
          }
          resolve();
        };
        img.onerror = () => {
          loadedCount++;
          const pct = Math.round((loadedCount / TOTAL_FRAMES) * 100);
          if (loadingLabel) loadingLabel.textContent = `${pct} %`;
          const revealThreshold = Math.ceil(TOTAL_FRAMES * 0.6);
          if (loadedCount >= revealThreshold && !introStarted) {
            if (loadingLabel) loadingLabel.remove();
            runIntroReveal();
          }
          resolve();
        };
        img.src = framePaths[index];
      });
    }

    // Initial load: ALL frames must be loaded before the intro starts
    async function loadAllFrames() {
      const batch: Promise<void>[] = [];
      for (let j = 0; j < TOTAL_FRAMES; j++) batch.push(loadFrame(j));
      await Promise.all(batch);
    }
    loadAllFrames();

    // Sliding window: load frames near current position, evict distant ones
    let windowLoading = false;
    async function maintainWindow() {
      if (windowLoading) return;
      windowLoading = true;
      try {
        const center = Math.round(Math.max(0, Math.min(TOTAL_FRAMES - 1, targetFrame)));
        const lo = Math.max(0, center - WINDOW_HALF);
        const hi = Math.min(TOTAL_FRAMES - 1, center + WINDOW_HALF);

        // Evict frames outside the window (but keep the first BATCH_SIZE for intro)
        for (let i = 0; i < TOTAL_FRAMES; i++) {
          if (frames[i] && (i < lo || i > hi) && i >= BATCH_SIZE) {
            frames[i] = null;
          }
        }

        // Load missing frames within the window, prioritising closest to center
        const needed: number[] = [];
        for (let i = lo; i <= hi; i++) {
          if (!frames[i]) needed.push(i);
        }
        needed.sort((a, b) => Math.abs(a - center) - Math.abs(b - center));

        // Load in small sub-batches to stay responsive
        const SUB_BATCH = 8;
        for (let i = 0; i < needed.length; i += SUB_BATCH) {
          const sub = needed.slice(i, i + SUB_BATCH).map(idx => loadFrame(idx));
          await Promise.all(sub);
        }
      } finally {
        windowLoading = false;
      }
    }

    // Failsafe: if intro hasn't fired after 15s (slow connections), force it
    setTimeout(() => {
      if (loadingLabel?.parentNode) loadingLabel.remove();
      runIntroReveal();
      // Hard fallback: ensure content is visible no matter what
      setTimeout(() => {
        const hero = document.getElementById('heroContent');
        if (hero && !hero.classList.contains('revealed')) hero.classList.add('revealed');
        if (introReveal && !introReveal.classList.contains('done')) introReveal.classList.add('done');
      }, 2500);
    }, 15000);

    // --- Draw ---
    function coverFit(iw, ih) {
      const scale = Math.max(canvasW / iw, canvasH / ih);
      const sw = iw * scale, sh = ih * scale;
      return { x: (canvasW - sw) / 2, y: (canvasH - sh) / 2, w: sw, h: sh };
    }

    function drawSingle(i) {
      const img = frames[i];
      if (!img) return;
      const p = coverFit(img.naturalWidth, img.naturalHeight);
      ctx.globalAlpha = 1;
      ctx.drawImage(img, p.x, p.y, p.w, p.h);
    }

    function drawBlended(frac) {
      const maxIdx = TOTAL_FRAMES - 1;
      const c = Math.max(0, Math.min(maxIdx, frac));
      const lo = Math.floor(c), hi = Math.min(lo + 1, maxIdx);
      const t = c - lo;
      const key = `${lo}:${(t * 50) | 0}`;
      if (key === lastRenderedKey) return;
      lastRenderedKey = key;

      const a = frames[lo], b = frames[hi];
      if (!a && !b) return;

      if (lo === hi || t < 0.02 || !b) { if (a) { drawSingle(lo); } return; }
      if (t > 0.98 || !a) { if (b) { drawSingle(hi); } return; }

      const pA = coverFit(a.naturalWidth, a.naturalHeight);
      ctx.globalAlpha = 1;
      ctx.drawImage(a, pA.x, pA.y, pA.w, pA.h);
      const pB = coverFit(b.naturalWidth, b.naturalHeight);
      ctx.globalAlpha = t;
      ctx.drawImage(b, pB.x, pB.y, pB.w, pB.h);
      ctx.globalAlpha = 1;
    }

    // --- Scroll mapping (only within the runway) ---
    function getRunwayProgress() {
      const rect = runway.getBoundingClientRect();
      const runwayTop = window.scrollY + rect.top;
      const runwayH = rect.height - window.innerHeight;
      if (runwayH <= 0) return 0;
      const p = (window.scrollY - runwayTop) / runwayH;
      return Math.max(0, Math.min(1, p));
    }

    function isInRunway() {
      const rect = runway.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    }

    // --- Scene texts ---
    let text2LaserFired = false;
    let text2LaserDone = false;

    function laserBurnText2() {
      if (text2LaserFired) return;
      text2LaserFired = true;
      const el = sceneTexts[2];
      el.classList.remove('visible', 'exiting');
      el.classList.add('laser-active');

      // Wrap every character in each child element
      const children = Array.from(el.children) as HTMLElement[];
      const allChars: HTMLElement[] = [];

      children.forEach(child => {
        const text = child.textContent || '';
        child.textContent = '';
        for (let i = 0; i < text.length; i++) {
          const span = document.createElement('span');
          span.className = 'laser-char';
          span.textContent = text[i] === ' ' ? '\u00A0' : text[i];
          child.appendChild(span);
          allChars.push(span);
        }
      });

      // Sweep: burn then vanish, left to right
      const total = allChars.length;
      const burnDuration = 40; // ms each char stays lit
      const stagger = 8; // ms between chars

      allChars.forEach((ch, i) => {
        setTimeout(() => {
          ch.style.color = '#eaffe8';
          ch.classList.add('burn');
          setTimeout(() => {
            ch.style.color = '';
            ch.classList.remove('burn');
            ch.classList.add('gone');
          }, burnDuration);
        }, i * stagger);
      });

      // After all done, mark complete — hide first, then restore text
      setTimeout(() => {
        text2LaserDone = true;
        el.style.opacity = '0';
        el.style.transition = 'none';
        // Wait a frame for opacity:0 to paint, then restore text and remove laser-active
        requestAnimationFrame(() => {
          children.forEach((child, ci) => {
            const origTexts = ['03', 'Log and move on.', 'Weight. Reps. Done. Stay in the zone.'];
            child.textContent = origTexts[ci] || '';
          });
          el.classList.remove('laser-active');
        });
      }, total * stagger + burnDuration + 400);
    }

    function resetText2Laser() {
      if (!text2LaserFired) return;
      text2LaserFired = false;
      text2LaserDone = false;
      const el = sceneTexts[2];
      el.classList.remove('laser-active');
      el.style.opacity = '';
      el.style.transition = '';
      const children = Array.from(el.children) as HTMLElement[];
      const origTexts = ['03', 'Log and move on.', 'Weight. Reps. Done. Stay in the zone.'];
      children.forEach((child, ci) => {
        child.textContent = origTexts[ci] || '';
      });
    }

    function updateTexts(progress) {
      const sp = progress * SCENE_COUNT;
      sceneTexts.forEach((el, i) => {
        const lp = sp - i;
        const isLast = (i === SCENE_COUNT - 1);
        const fadeIn = isLast ? 0.35 : (i === 1 ? 0.35 : 0.15);
        const fadeOut = isLast ? 0.6 : 0.85;

        if (isLast) {
          // Text2: custom laser exit
          if (lp >= fadeIn && lp <= fadeOut) {
            resetText2Laser();
            el.classList.add('visible');
            el.classList.remove('exiting');
          } else if (lp > fadeOut && lp <= 1.0) {
            laserBurnText2();
          } else {
            resetText2Laser();
            el.classList.remove('visible', 'exiting');
          }
        } else {
          if (lp >= fadeIn && lp <= fadeOut) {
            el.classList.add('visible');
            el.classList.remove('exiting');
          } else if (lp > fadeOut && lp <= 1.0) {
            el.classList.remove('visible');
            el.classList.add('exiting');
          } else {
            el.classList.remove('visible', 'exiting');
          }
        }
      });
    }

    // --- Unified Tick (single rAF loop) ---
    let lastScrollY = -1;
    let isScrolling = false;
    let scrollTimeout: any = null;

    // Track scroll state for efficient updates
    let scrollHintHidden = false;
    window.addEventListener('scroll', () => {
      isScrolling = true;
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => { isScrolling = false; }, 150);
      // Hide scroll hint on first meaningful scroll
      if (!scrollHintHidden && window.scrollY > 80) {
        scrollHintHidden = true;
        document.getElementById('scrollHint')?.classList.remove('visible');
      }
    }, { passive: true });

    function tick() {
      const scrollY = window.scrollY;
      const scrollChanged = scrollY !== lastScrollY;
      lastScrollY = scrollY;

      // Only do heavy work when scroll position changed or animations are lerping
      const totalMax = document.documentElement.scrollHeight - window.innerHeight;
      const totalProgress = totalMax > 0 ? scrollY / totalMax : 0;

      if (scrollChanged) {
        // Global scroll progress bar
        scrollProgress.style.width = (totalProgress * 100) + '%';
        // Navbar background
        navbar.classList.toggle('scrolled', scrollY > 60);
      }

      // Video area
      const inRunway = isInRunway();
      const runwayP = getRunwayProgress();

      if (inRunway) {
        canvasViewport.style.display = 'block';
        videoOverlay.style.display = 'block';

        targetFrame = runwayP * (TOTAL_FRAMES - 1);
        const diff = targetFrame - currentFrame;
        currentFrame += Math.abs(diff) > 0.05 ? diff * LERP_SPEED : diff;

        drawBlended(currentFrame);
        maintainWindow();
        updateTexts(runwayP);

        // Phone mockup: lerp its own progress for momentum
        phoneProgress += (runwayP - phoneProgress) * 0.07;

        const phoneEnter = 0.60;
        const phonePeak = 0.70;
        const phoneExit = 0.80;

        if (phoneProgress >= phoneEnter && phoneProgress <= phoneExit) {
          let ty, rot, opacity;

          if (phoneProgress <= phonePeak) {
            // Rising up
            const p = (phoneProgress - phoneEnter) / (phonePeak - phoneEnter);
            const ep = 1 - Math.pow(1 - p, 3); // ease-out
            ty = (1 - ep) * 100; // 100vh → 0
            rot = (1 - ep) * -8 + 3; // -8° → 3° (left to right tilt)
            opacity = 1;
          } else {
            // Sinking back down
            const p = (phoneProgress - phonePeak) / (phoneExit - phonePeak);
            const ep = p * p; // ease-in
            ty = ep * 100; // 0 → 100vh
            rot = 3 - ep * 8; // 3° → -5°
            opacity = 1 - ep;
          }

          phoneScale += ((phoneHovered ? 1.08 : 1) - phoneScale) * 0.08;
          phoneMockup.style.transform = `translateY(calc(-50% + ${ty}vh)) rotate(${rot}deg) scale(${phoneScale})`;
          phoneMockup.style.opacity = opacity;
        } else {
          phoneMockup.style.transform = 'translateY(120vh) scale(1)';
          phoneMockup.style.opacity = 0;
        }

        // Hero
        heroContent.classList.toggle('hidden', runwayP > 0.04);

        // Resolve scramble at ~8s mark (progress ≈ 0.496)
        if (runwayP >= 0.46 && !scrambleStarted) {
          scrambleStarted = true;
          const heading = text1El.querySelector('.scene-heading');
          const desc = text1El.querySelector('.scene-desc');
          resolveScramble(heading, 300);
          resolveScramble(desc, 500);
        }
      } else {
        // Past the runway — hide video
        const rect = runway.getBoundingClientRect();
        if (rect.bottom <= 0) {
          canvasViewport.style.display = 'none';
          videoOverlay.style.display = 'none';
        }
        heroContent.classList.add('hidden');
      }

      // --- Merged scroll updates (was a separate rAF loop) ---
      updateHIW();
      updateRoadmap();
      updateDashMomentum();
      updateFeaturesBg();

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    /* ═══════════════════════════════════════
       SCROLL REVEAL (IntersectionObserver)
    ═══════════════════════════════════════ */
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    /* ═══════════════════════════════════════
       ACTIVE NAV SECTION TRACKING
    ═══════════════════════════════════════ */
    const navSectionLinks = document.querySelectorAll('.nav-links a');
    const sectionIds = ['how', 'features', 'owners', 'roadmap'];
    const navSectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navSectionLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('nav-section-active', href === '#' + id);
          });
        }
      });
    }, { threshold: 0.15, rootMargin: '-20% 0px -60% 0px' });
    sectionIds.forEach(id => {
      const section = document.getElementById(id);
      if (section) navSectionObserver.observe(section);
    });

    /* ═══════════════════════════════════════
       SCENE 2 SCRAMBLE TEXT
    ═══════════════════════════════════════ */
    const scrambleEls = document.querySelectorAll('.scramble-text');
    const scrambleChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@#$%&*+-=?!';
    let scrambleStarted = false;
    let scrambleIntervals = [];

    // Start random characters immediately
    scrambleEls.forEach(el => {
      const len = el.dataset.final.length;
      function randomize() {
        let s = '';
        for (let i = 0; i < len; i++) {
          if (el.dataset.final[i] === ' ') s += ' ';
          else if (el.dataset.final[i] === '|') s += '<br>';
          else s += scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        }
        el.innerHTML = s;
      }
      const iv = setInterval(randomize, 50);
      scrambleIntervals.push({ el, iv });
      randomize();
    });

    function resolveScramble(el, delay) {
      setTimeout(() => {
        const iv = scrambleIntervals.find(s => s.el === el);
        if (iv) clearInterval(iv.iv);

        // Flash green
        el.innerHTML = el.dataset.final.replace(/\|/g, '<br>');
        el.classList.add('flash');

        // Flash off after brief moment
        setTimeout(() => {
          el.classList.remove('flash');
          el.classList.add('flash-off', 'resolved');
        }, 150);
      }, delay);
    }

    // Trigger scramble resolve at ~8th second of video (runwayP ≈ 0.496)
    const text1El = document.getElementById('text1');

    /* ═══════════════════════════════════════
       COUNTER ANIMATION
    ═══════════════════════════════════════ */
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          entry.target.dataset.counted = 'true';
          const target = parseInt(entry.target.dataset.target);
          const suffix = entry.target.dataset.suffix || '';
          const duration = 2000;
          const start = performance.now();

          function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * target);
            entry.target.textContent = current + suffix;
            if (progress < 1) requestAnimationFrame(update);
          }
          requestAnimationFrame(update);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

    /* ═══════════════════════════════════════
       HOW IT WORKS — Horizontal Scroll
    ═══════════════════════════════════════ */
    const hiwSection = document.getElementById('how');
    const hiwTrack = document.getElementById('hiwTrack');
    const redThumb = document.getElementById('redThumb');
    const redScrollbar = document.getElementById('redScrollbar');
    const hiwDots = document.querySelectorAll('.hiw-dot');

    const hiwScanCorners = document.getElementById('hiwScanCorners');
    const hiwScanLine = document.getElementById('hiwScanLine');
    const hiwQRIcon = document.getElementById('hiwQRIcon');
    let hiwLerpedP = 0;
    let hiwQRLerpedP = 0;

    // Glass pane tilt state (scroll + cursor, updated per-frame)
    const hiwGlassPanes = document.querySelectorAll('.hiw-glass-pane') as NodeListOf<HTMLElement>;
    let hiwScrollTiltY = 0;
    const paneState = Array.from(hiwGlassPanes).map(() => ({
      cursorRY: 0, cursorRX: 0, hoverScale: 0, hovered: false,
    }));

    // Scan frame cursor-following state (panel 1)
    let scanTargetX = 0, scanTargetY = 0;
    let scanCurrentX = 0, scanCurrentY = 0;

    // Mark panel 1 for scan text effect
    if (hiwGlassPanes[0]) hiwGlassPanes[0].classList.add('scan-interactive');

    // Panel 2 log card repulsion + swap
    let logRepelTargetX = 0, logRepelTargetY = 0;
    let logRepelCurrentX = 0, logRepelCurrentY = 0;
    let logSwapTarget = 0, logSwapProgress = 0;
    const logVisual = hiwGlassPanes[1]?.querySelector('.hiw-panel-visual') as HTMLElement;
    const logTitle = hiwGlassPanes[1]?.querySelector('.hiw-panel-title') as HTMLElement;
    const logDesc = hiwGlassPanes[1]?.querySelector('.hiw-panel-desc') as HTMLElement;
    const logLine = hiwGlassPanes[1]?.querySelector('.hiw-panel-line') as HTMLElement;
    let logSwapOffsetDown = 0, logSwapOffsetUp = 0;
    if (logVisual && logTitle && logDesc) {
      logSwapOffsetDown = logTitle.offsetHeight + logDesc.offsetHeight + 60;
      logSwapOffsetUp = logVisual.offsetHeight + 36;
    }

    // Panel 3 chart cursor bias
    let chartCursorTarget = 0, chartCursorCurrent = 0;

    /* ── Strength Curve (HIW background) ── */
    const hiwCurveCanvas = document.getElementById('hiwCurveCanvas') as HTMLCanvasElement;
    const hiwCurveCtx = hiwCurveCanvas?.getContext('2d');

    // Curve data points: [x (0-1), y (0-1 where 0=top, 1=bottom)]
    // Panel 1 range (x 0-0.33): flat baseline
    // Panel 2 range (x 0.33-0.66): climbing with variation
    // Panel 3 range (x 0.66-1.0): dramatic surge
    const curvePoints: [number, number][] = [
      [0.00, 0.78],
      [0.05, 0.78],
      [0.10, 0.77],
      [0.15, 0.78],
      [0.20, 0.77],
      [0.25, 0.78],
      [0.30, 0.76],
      // climb begins
      [0.35, 0.73],
      [0.38, 0.74],
      [0.42, 0.69],
      [0.46, 0.66],
      [0.49, 0.68],
      [0.53, 0.62],
      [0.57, 0.58],
      [0.60, 0.60],
      [0.64, 0.54],
      // surge
      [0.68, 0.50],
      [0.72, 0.44],
      [0.76, 0.40],
      [0.80, 0.34],
      [0.84, 0.30],
      [0.88, 0.24],
      [0.92, 0.20],
      [0.96, 0.15],
      [1.00, 0.10],
    ];

    // Data point markers with contextual labels
    const dataMarkers: { x: number; label: string; sub: string; above: boolean }[] = [
      { x: 0.30, label: '60kg × 8',  sub: 'W1',  above: true },
      { x: 0.38, label: '62.5kg',    sub: 'W2',  above: false },
      { x: 0.46, label: '65kg × 8',  sub: 'W3',  above: true },
      { x: 0.53, label: 'Bench',     sub: 'W5',  above: false },
      { x: 0.60, label: '70kg × 6',  sub: 'W6',  above: true },
      { x: 0.68, label: '+5kg PR',   sub: 'W8',  above: false },
      { x: 0.76, label: '80kg × 5',  sub: 'W9',  above: true },
      { x: 0.84, label: 'Squat 1RM', sub: 'W10', above: false },
      { x: 0.92, label: '90kg × 3',  sub: 'W11', above: true },
      { x: 1.00, label: 'NEW PR!',   sub: 'W12', above: false },
    ];
    const markerFlashTime: number[] = new Array(dataMarkers.length).fill(0);

    // Y-axis weight labels (very faint)
    const yAxisLabels = ['100kg', '80kg', '60kg', '40kg', '20kg'];
    // X-axis date labels
    const xAxisLabels = [
      { x: 0.0, text: 'JAN' },
      { x: 0.33, text: 'FEB' },
      { x: 0.66, text: 'MAR' },
      { x: 1.0, text: 'APR' },
    ];

    function sizeHIWCurveCanvas() {
      if (!hiwCurveCanvas || !hiwCurveCtx) return;
      const rect = hiwCurveCanvas.parentElement!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      hiwCurveCanvas.width = rect.width * dpr;
      hiwCurveCanvas.height = rect.height * dpr;
      hiwCurveCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    sizeHIWCurveCanvas();
    window.addEventListener('resize', sizeHIWCurveCanvas, { passive: true });

    // Interpolate Y at any X along the curve using catmull-rom-ish lerp
    function curveYAtX(xNorm: number): number {
      for (let i = 0; i < curvePoints.length - 1; i++) {
        const [x0, y0] = curvePoints[i];
        const [x1, y1] = curvePoints[i + 1];
        if (xNorm >= x0 && xNorm <= x1) {
          const t = (xNorm - x0) / (x1 - x0);
          // Smooth step for nice interpolation
          const s = t * t * (3 - 2 * t);
          return y0 + (y1 - y0) * s;
        }
      }
      return curvePoints[curvePoints.length - 1][1];
    }

    function drawHIWCurve(p: number) {
      if (!hiwCurveCtx || !hiwCurveCanvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = hiwCurveCanvas.width / dpr;
      const h = hiwCurveCanvas.height / dpr;
      hiwCurveCtx.clearRect(0, 0, w, h);

      // The line draws from left to right based on scroll progress
      // Map p to how far the line has drawn (with some lead/lag)
      const drawProgress = Math.min(1, p * 1.1); // slightly ahead of scroll
      if (drawProgress <= 0.001) return;

      const padX = 40;
      const padTop = h * 0.1;
      const padBot = h * 0.15;
      const graphW = w - padX * 2;
      const graphH = h - padTop - padBot;

      // Convert normalized point to canvas coords
      const toCanvasX = (xn: number) => padX + xn * graphW;
      const toCanvasY = (yn: number) => padTop + yn * graphH;

      // === Draw subtle baseline/grid with axis labels ===
      hiwCurveCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      hiwCurveCtx.lineWidth = 1;
      for (let gy = 0; gy <= 4; gy++) {
        const yy = padTop + (gy / 4) * graphH;
        hiwCurveCtx.beginPath();
        hiwCurveCtx.moveTo(padX, yy);
        hiwCurveCtx.lineTo(padX + graphW * drawProgress, yy);
        hiwCurveCtx.stroke();

        // Y-axis weight labels (very faint, only when visible)
        if (drawProgress > 0.02 && yAxisLabels[gy]) {
          const labelAlpha = Math.min(0.12, drawProgress * 0.4);
          hiwCurveCtx.font = "500 10px 'JetBrains Mono', monospace";
          hiwCurveCtx.fillStyle = `rgba(255, 255, 255, ${labelAlpha})`;
          hiwCurveCtx.textAlign = 'right';
          hiwCurveCtx.textBaseline = 'middle';
          hiwCurveCtx.fillText(yAxisLabels[gy], padX - 10, yy);
        }
      }

      // X-axis date labels
      xAxisLabels.forEach(({ x: xn, text }) => {
        if (xn > drawProgress) return;
        const xx = toCanvasX(xn);
        const yy = toCanvasY(1) + 18;
        const labelAge = (drawProgress - xn) * 5; // fade in over scroll distance
        const labelAlpha = Math.min(0.15, labelAge * 0.15);
        if (labelAlpha < 0.01) return;
        hiwCurveCtx.font = "600 9px 'JetBrains Mono', monospace";
        hiwCurveCtx.fillStyle = `rgba(255, 255, 255, ${labelAlpha})`;
        hiwCurveCtx.textAlign = 'center';
        hiwCurveCtx.textBaseline = 'top';
        hiwCurveCtx.fillText(text, xx, yy);
      });

      // Vertical grid lines at date marks (very subtle)
      xAxisLabels.forEach(({ x: xn }) => {
        if (xn > drawProgress || xn === 0) return;
        const xx = toCanvasX(xn);
        hiwCurveCtx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
        hiwCurveCtx.lineWidth = 1;
        hiwCurveCtx.beginPath();
        hiwCurveCtx.moveTo(xx, padTop);
        hiwCurveCtx.lineTo(xx, toCanvasY(1));
        hiwCurveCtx.stroke();
      });

      // === Draw the curve (smooth path) ===
      const steps = Math.floor(drawProgress * 200);
      if (steps < 2) return;

      // Gradient fill under the curve
      const grad = hiwCurveCtx.createLinearGradient(0, padTop, 0, padTop + graphH);
      grad.addColorStop(0, 'rgba(200, 255, 0, 0.18)');
      grad.addColorStop(1, 'rgba(200, 255, 0, 0)');

      hiwCurveCtx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const xn = (i / 200);
        const yn = curveYAtX(xn);
        const cx = toCanvasX(xn);
        const cy = toCanvasY(yn);
        if (i === 0) hiwCurveCtx.moveTo(cx, cy);
        else hiwCurveCtx.lineTo(cx, cy);
      }
      // Fill area under curve
      const lastXn = steps / 200;
      const lastCx = toCanvasX(lastXn);
      hiwCurveCtx.lineTo(lastCx, toCanvasY(1));
      hiwCurveCtx.lineTo(toCanvasX(0), toCanvasY(1));
      hiwCurveCtx.closePath();
      hiwCurveCtx.fillStyle = grad;
      hiwCurveCtx.fill();

      // Stroke the line itself
      hiwCurveCtx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const xn = (i / 200);
        const yn = curveYAtX(xn);
        const cx = toCanvasX(xn);
        const cy = toCanvasY(yn);
        if (i === 0) hiwCurveCtx.moveTo(cx, cy);
        else hiwCurveCtx.lineTo(cx, cy);
      }

      // Green glow (shadowBlur for smooth gaussian spread)
      hiwCurveCtx.save();
      hiwCurveCtx.shadowColor = 'rgba(200, 255, 0, 0.6)';
      hiwCurveCtx.shadowBlur = 20;
      hiwCurveCtx.strokeStyle = 'rgba(200, 255, 0, 0.35)';
      hiwCurveCtx.lineWidth = 1.5;
      hiwCurveCtx.stroke();
      hiwCurveCtx.restore();

      // Bright core (white-green, thin)
      hiwCurveCtx.strokeStyle = 'rgba(230, 255, 200, 0.85)';
      hiwCurveCtx.lineWidth = 1;
      hiwCurveCtx.stroke();

      // === Leading glow dot ===
      const tipXn = lastXn;
      const tipYn = curveYAtX(tipXn);
      const tipX = toCanvasX(tipXn);
      const tipY = toCanvasY(tipYn);

      const glowGrad = hiwCurveCtx.createRadialGradient(tipX, tipY, 0, tipX, tipY, 70);
      glowGrad.addColorStop(0, 'rgba(200, 255, 0, 0.8)');
      glowGrad.addColorStop(0.3, 'rgba(200, 255, 0, 0.25)');
      glowGrad.addColorStop(0.6, 'rgba(200, 255, 0, 0.06)');
      glowGrad.addColorStop(1, 'rgba(200, 255, 0, 0)');
      hiwCurveCtx.fillStyle = glowGrad;
      hiwCurveCtx.beginPath();
      hiwCurveCtx.arc(tipX, tipY, 70, 0, Math.PI * 2);
      hiwCurveCtx.fill();

      // Solid tip dot
      hiwCurveCtx.fillStyle = 'rgba(200, 255, 0, 0.9)';
      hiwCurveCtx.beginPath();
      hiwCurveCtx.arc(tipX, tipY, 4, 0, Math.PI * 2);
      hiwCurveCtx.fill();

      // === Data point markers with labels ===
      const now = performance.now();
      dataMarkers.forEach((marker, mi) => {
        if (marker.x > drawProgress) {
          markerFlashTime[mi] = 0;
          return;
        }
        const mx = toCanvasX(marker.x);
        const my = toCanvasY(curveYAtX(marker.x));

        // Flash when first revealed
        if (markerFlashTime[mi] === 0) markerFlashTime[mi] = now;
        const age = now - markerFlashTime[mi];
        const flashAlpha = age < 600 ? 0.8 * (1 - age / 600) : 0;

        // Flash ring
        if (flashAlpha > 0) {
          const flashRadius = 4 + (age / 600) * 20;
          hiwCurveCtx.strokeStyle = `rgba(200, 255, 0, ${flashAlpha})`;
          hiwCurveCtx.lineWidth = 1.5;
          hiwCurveCtx.beginPath();
          hiwCurveCtx.arc(mx, my, flashRadius, 0, Math.PI * 2);
          hiwCurveCtx.stroke();
        }

        // Solid dot
        hiwCurveCtx.fillStyle = 'rgba(200, 255, 0, 0.8)';
        hiwCurveCtx.beginPath();
        hiwCurveCtx.arc(mx, my, 3, 0, Math.PI * 2);
        hiwCurveCtx.fill();

        // Marker glow
        hiwCurveCtx.fillStyle = 'rgba(200, 255, 0, 0.25)';
        hiwCurveCtx.beginPath();
        hiwCurveCtx.arc(mx, my, 14, 0, Math.PI * 2);
        hiwCurveCtx.fill();

        // Data label — fades in after flash, drifts slightly upward
        const labelDelay = 300; // ms after flash before label appears
        const labelFadeDur = 500;
        const labelAge = Math.max(0, age - labelDelay);
        const labelAlpha = Math.min(0.22, (labelAge / labelFadeDur) * 0.22);
        if (labelAlpha > 0.01) {
          const drift = Math.min(6, (labelAge / 1000) * 6); // subtle upward drift
          const labelY = marker.above ? my - 16 - drift : my + 18 + drift;
          const isSpecial = marker.label.includes('PR');

          // Main label (exercise/weight)
          hiwCurveCtx.font = `${isSpecial ? '700' : '500'} 10px 'JetBrains Mono', monospace`;
          hiwCurveCtx.textAlign = 'center';
          hiwCurveCtx.textBaseline = marker.above ? 'bottom' : 'top';
          hiwCurveCtx.fillStyle = isSpecial
            ? `rgba(255, 45, 85, ${labelAlpha * 1.5})`
            : `rgba(200, 255, 0, ${labelAlpha})`;
          hiwCurveCtx.fillText(marker.label, mx, labelY);

          // Sub label (week)
          hiwCurveCtx.font = "400 8px 'JetBrains Mono', monospace";
          hiwCurveCtx.fillStyle = `rgba(255, 255, 255, ${labelAlpha * 0.6})`;
          const subY = marker.above ? labelY - 12 : labelY + 13;
          hiwCurveCtx.fillText(marker.sub, mx, subY);
        }
      });
    }

    const hiwWeightEl = document.getElementById('hiwWeight');
    const hiwRepsEl = document.getElementById('hiwReps');
    const hiwPREl = document.getElementById('hiwPR');
    const hiwLogBtn = document.getElementById('hiwLogBtn');

    // Chart scroll-driven elements
    const hiwChartLine = document.getElementById('hiwChartLine') as SVGPolylineElement | null;
    const hiwChartClipRect = document.getElementById('hiwChartClipRect') as SVGRectElement | null;
    const hiwChartDot = document.getElementById('hiwChartDot') as SVGCircleElement | null;
    const hiwStatStrength = document.getElementById('hiwStatStrength');
    const hiwStatSessions = document.getElementById('hiwStatSessions');
    const hiwStatPRs = document.getElementById('hiwStatPRs');

    // Chart data points for dot positioning
    const chartPts: [number, number][] = [[0, 100], [40, 92], [80, 85], [120, 78], [160, 65], [200, 55], [240, 40], [280, 20]];

    // Dot click/keyboard → smooth scroll to corresponding panel
    hiwDots.forEach((dot, i) => {
      (dot as HTMLElement).style.cursor = 'pointer';
      const scrollToPanel = () => {
        if (!hiwSection) return;
        const rect = hiwSection.getBoundingClientRect();
        const sectionH = rect.height - window.innerHeight;
        const targetP = i / 2;
        const sectionTop = window.scrollY + rect.top;
        const targetScroll = sectionTop + targetP * sectionH;
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      };
      dot.addEventListener('click', scrollToPanel);
      dot.addEventListener('keydown', (e: any) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          scrollToPanel();
        }
      });
    });

    hiwLogBtn.addEventListener('click', () => {
      if (hiwWeightEl.textContent === '85' && hiwRepsEl.textContent === '9') {
        hiwPREl.style.visibility = 'visible';
        hiwPREl.style.opacity = '1';
        // Sparkle celebration burst
        const rect = hiwPREl.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        for (let i = 0; i < 12; i++) {
          const spark = document.createElement('div');
          spark.className = 'pr-sparkle';
          const angle = (Math.PI * 2 / 12) * i + (Math.random() - 0.5) * 0.4;
          const dist = 25 + Math.random() * 35;
          const isGreen = Math.random() > 0.3;
          spark.style.left = cx + 'px';
          spark.style.top = cy + 'px';
          spark.style.background = isGreen ? 'var(--accent)' : 'var(--red-neon)';
          spark.style.boxShadow = isGreen
            ? '0 0 6px var(--accent), 0 0 12px var(--accent-glow)'
            : '0 0 6px var(--red-neon), 0 0 12px var(--red-neon-glow)';
          spark.style.setProperty('--sx', Math.cos(angle) * dist + 'px');
          spark.style.setProperty('--sy', Math.sin(angle) * dist + 'px');
          document.body.appendChild(spark);
          setTimeout(() => spark.remove(), 700);
        }
      }
    });
    // Keyboard support for LOG SET button
    hiwLogBtn.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        hiwLogBtn.click();
      }
    });

    function updateHIW() {
      if (!hiwSection || !hiwTrack) return;
      const rect = hiwSection.getBoundingClientRect();
      const sectionTop = -rect.top;
      const sectionH = rect.height - window.innerHeight;
      if (sectionH <= 0) return;
      const p = Math.max(0, Math.min(1, sectionTop / sectionH));
      hiwTrack.style.transform = `translateX(-${p * 66.667}%)`;
      // Strength curve background
      drawHIWCurve(p);
      // Dots
      const activeIdx = Math.min(2, Math.floor(p * 3));
      hiwDots.forEach((d, i) => {
        const isActive = i === activeIdx;
        d.classList.toggle('active', isActive);
        d.setAttribute('aria-selected', String(isActive));
      });

      // Panel 2 weight/reps: fully incremented by the time panel 2 is centered
      // Panel 2 is centered at p=0.5. Ramp from p=0.35 to p=0.5
      const rampStart = 0.25;
      const rampEnd = 0.45;
      if (p < rampStart) {
        hiwWeightEl.textContent = '0';
        hiwRepsEl.textContent = '0';
      } else if (p >= rampStart && p <= rampEnd) {
        const localP = Math.min(1, (p - rampStart) / (rampEnd - rampStart));
        hiwWeightEl.textContent = String(Math.round(localP * 85));
        hiwRepsEl.textContent = String(Math.round(localP * 9));
      } else {
        hiwWeightEl.textContent = '85';
        hiwRepsEl.textContent = '9';
      }

      // Inertia: elements lag behind scroll, easing into place
      hiwLerpedP += (p - hiwLerpedP) * 0.12;
      hiwQRLerpedP += (p - hiwQRLerpedP) * 0.06;
      const cornersOffset = (p - hiwLerpedP) * 600;
      const qrOffset = (p - hiwQRLerpedP) * 900;

      // Lerp scan frame toward cursor (or back to origin)
      scanCurrentX += (scanTargetX - scanCurrentX) * 0.14;
      scanCurrentY += (scanTargetY - scanCurrentY) * 0.14;

      hiwScanCorners.style.transform = `translate(${cornersOffset + scanCurrentX}px, ${scanCurrentY}px)`;
      hiwScanLine.style.transform = `translate(${cornersOffset + scanCurrentX}px, ${scanCurrentY}px)`;
      hiwQRIcon.style.transform = `translateX(${qrOffset}px)`;

      // QR icon: gray when scan frame moves away, green when on it
      const frameDist = Math.sqrt(scanCurrentX * scanCurrentX + scanCurrentY * scanCurrentY);
      const qrOnFrame = frameDist < 20;
      hiwQRIcon.style.stroke = qrOnFrame ? 'var(--accent)' : 'rgba(255,255,255,0.15)';
      hiwQRIcon.style.opacity = qrOnFrame ? '0.4' : '0.2';

      // Scan text reveal: set frame position relative to title/desc
      const firstPane = hiwGlassPanes[0];
      if (firstPane) {
        const pTitle = firstPane.querySelector('.hiw-panel-title') as HTMLElement;
        const pDesc = firstPane.querySelector('.hiw-panel-desc') as HTMLElement;
        const scanArea = firstPane.querySelector('.hiw-scan-area') as HTMLElement;
        if (pTitle && scanArea) {
          const pr = firstPane.getBoundingClientRect();
          const sr = scanArea.getBoundingClientRect();
          const frameCX = (sr.left + sr.width / 2 - pr.left) + scanCurrentX;
          const frameCY = (sr.top + sr.height / 2 - pr.top) + scanCurrentY;
          const tr = pTitle.getBoundingClientRect();
          pTitle.style.setProperty('--scan-x', `${frameCX - (tr.left - pr.left)}px`);
          pTitle.style.setProperty('--scan-y', `${frameCY - (tr.top - pr.top)}px`);
          if (pDesc) {
            const dr = pDesc.getBoundingClientRect();
            pDesc.style.setProperty('--scan-x', `${frameCX - (dr.left - pr.left)}px`);
            pDesc.style.setProperty('--scan-y', `${frameCY - (dr.top - pr.top)}px`);
          }
        }
      }

      // Panel 3 chart: draw line as we scroll into it
      const chartStart = 0.72;
      const chartEnd = 1.0;
      let chartP = 0;
      if (p <= chartStart) {
        chartP = 0;
      } else if (p >= chartEnd) {
        chartP = 1;
      } else {
        chartP = (p - chartStart) / (chartEnd - chartStart);
      }
      // Ease-out for smooth feel
      const baseEasedP = 1 - Math.pow(1 - chartP, 3);

      // Cursor bias: lerp and blend with scroll-driven progress
      chartCursorCurrent += (chartCursorTarget - chartCursorCurrent) * 0.1;
      const easedP = Math.max(0, Math.min(1, baseEasedP + chartCursorCurrent));

      // Dot follows the line endpoint
      if (hiwChartDot && chartP > 0) {
        const totalLen = chartPts.length - 1;
        const idx = Math.min(easedP * totalLen, totalLen);
        const i0 = Math.floor(idx);
        const i1 = Math.min(i0 + 1, totalLen);
        const t = idx - i0;
        const cx = chartPts[i0][0] + (chartPts[i1][0] - chartPts[i0][0]) * t;
        const cy = chartPts[i0][1] + (chartPts[i1][1] - chartPts[i0][1]) * t;
        hiwChartDot.setAttribute('cx', String(cx));
        hiwChartDot.setAttribute('cy', String(cy));
        hiwChartDot.setAttribute('opacity', chartP > 0.02 ? '1' : '0');
        // Clip rect tracks the dot so the line never extends past it
        if (hiwChartClipRect) hiwChartClipRect.setAttribute('width', String(cx + 10));
      } else if (hiwChartDot) {
        hiwChartDot.setAttribute('opacity', '0');
        if (hiwChartClipRect) hiwChartClipRect.setAttribute('width', '0');
      }
      // Stats count up
      if (hiwStatStrength) hiwStatStrength.textContent = `+${Math.round(easedP * 32)}%`;
      if (hiwStatSessions) hiwStatSessions.textContent = String(Math.round(easedP * 24));
      if (hiwStatPRs) hiwStatPRs.textContent = String(Math.round(easedP * 7));

      // Panel 2: log card repulsion + position swap
      logRepelCurrentX += (logRepelTargetX - logRepelCurrentX) * 0.12;
      logRepelCurrentY += (logRepelTargetY - logRepelCurrentY) * 0.12;

      // Swap when pushed down enough (cursor near top of pane)
      if (logRepelCurrentY > 35) logSwapTarget = 1;
      else if (logRepelCurrentY < 15) logSwapTarget = 0;

      logSwapProgress += (logSwapTarget - logSwapProgress) * 0.18;

      if (logVisual) {
        const vy = logRepelCurrentY * (1 - logSwapProgress) + logSwapOffsetDown * logSwapProgress;
        logVisual.style.transform = `translate(${logRepelCurrentX}px, ${vy}px)`;
      }
      if (logTitle) {
        logTitle.style.transform = `translateY(${-logSwapOffsetUp * logSwapProgress}px)`;
      }
      if (logDesc) {
        logDesc.style.transform = `translateY(${-logSwapOffsetUp * logSwapProgress}px)`;
      }
      if (logLine) {
        logLine.style.transform = `translateY(${-logSwapOffsetUp * logSwapProgress}px)`;
      }

      // Glass pane scroll tilt — inertia: cards resist horizontal motion
      const scrollVelocity = p - hiwLerpedP;
      hiwScrollTiltY = Math.max(-8, Math.min(8, -scrollVelocity * 220));

      hiwGlassPanes.forEach((pane, i) => {
        const s = paneState[i];
        if (!s.hovered) {
          s.cursorRY *= 0.87;
          s.cursorRX *= 0.87;
          s.hoverScale += (0 - s.hoverScale) * 0.12;
        } else {
          s.hoverScale += (0.03 - s.hoverScale) * 0.15;
        }
        const ry = hiwScrollTiltY + s.cursorRY;
        const rx = s.cursorRX;
        const sc = 1 + s.hoverScale;
        pane.style.transform = `perspective(800px) rotateY(${ry}deg) rotateX(${rx}deg) scale3d(${sc},${sc},${sc})`;
      });
    }

    /* ═══════════════════════════════════════
       GLASS PANE — 3D tilt + cursor glow
    ═══════════════════════════════════════ */
    if (window.matchMedia('(hover: hover)').matches) {
      hiwGlassPanes.forEach((pane, idx) => {
        // Create edge glow element
        const edgeGlow = document.createElement('div');
        edgeGlow.className = 'glass-edge-glow';
        pane.appendChild(edgeGlow);

        pane.addEventListener('mousemove', (e: MouseEvent) => {
          const rect = pane.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          const y = (e.clientY - rect.top) / rect.height;

          // Update pane state — transform applied in updateHIW()
          paneState[idx].cursorRY = (x - 0.5) * 14;
          paneState[idx].cursorRX = (0.5 - y) * 10;

          // Cursor position for glow effects
          pane.style.setProperty('--mx', `${x * 100}%`);
          pane.style.setProperty('--my', `${y * 100}%`);

          // Panel 1: scan frame follows cursor
          if (idx === 0) {
            const scanArea = pane.querySelector('.hiw-scan-area');
            if (scanArea) {
              const sr = scanArea.getBoundingClientRect();
              const scx = sr.left + sr.width / 2;
              const scy = sr.top + sr.height / 2;
              scanTargetX = (e.clientX - scx) * 0.55;
              scanTargetY = (e.clientY - scy) * 0.55;
            }
          }

          // Panel 2: log card repelled by cursor
          if (idx === 1) {
            logRepelTargetX = -(x - 0.5) * 50;
            logRepelTargetY = -(y - 0.5) * 100;
          }

          // Panel 3: chart follows cursor X
          if (idx === 2) {
            chartCursorTarget = (x - 0.5) * 1.2;
          }
        });

        pane.addEventListener('mouseenter', () => {
          paneState[idx].hovered = true;
          edgeGlow.style.opacity = '1';
          pane.classList.add('glass-hovered');
        });

        pane.addEventListener('mouseleave', () => {
          paneState[idx].hovered = false;
          edgeGlow.style.opacity = '0';
          pane.classList.remove('glass-hovered');
          // Panel 1: scan frame returns to origin
          if (idx === 0) {
            scanTargetX = 0;
            scanTargetY = 0;
          }
          // Panel 2: log card returns
          if (idx === 1) {
            logRepelTargetX = 0;
            logRepelTargetY = 0;
            logSwapTarget = 0;
          }
          // Panel 3: chart returns to scroll-driven position
          if (idx === 2) {
            chartCursorTarget = 0;
          }
        });
      });
    }

    /* ═══════════════════════════════════════
       FEATURES — Reveal on scroll
    ═══════════════════════════════════════ */
    const featObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.2 });
    document.querySelectorAll('.feature-row').forEach(el => featObserver.observe(el));

    // Video timer countdown (hover-reactive: speeds up when card is hovered)
    const videoTimer = document.getElementById('videoTimer');
    const timerParent = videoTimer?.closest('.feature-row');
    let timerStarted = false;
    let timerSpeedMultiplier = 1;
    const timerCard = videoTimer?.closest('.feat-card');
    if (timerCard) {
      timerCard.addEventListener('mouseenter', () => { timerSpeedMultiplier = 5; });
      timerCard.addEventListener('mouseleave', () => { timerSpeedMultiplier = 1; });
    }
    const timerObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !timerStarted) {
          timerStarted = true;
          let seconds = 42;
          const tick = () => {
            if (seconds <= 0) return;
            seconds = Math.max(0, seconds - timerSpeedMultiplier);
            const m = Math.floor(seconds / 60);
            const s = Math.floor(seconds) % 60;
            videoTimer.textContent = `${m}:${String(s).padStart(2, '0')}`;
            setTimeout(tick, timerSpeedMultiplier > 1 ? 200 : 1000);
          };
          tick();
        }
      });
    }, { threshold: 0.3 });
    if (timerParent) timerObserver.observe(timerParent);

    // QR grid generation
    const qrGrid = document.getElementById('qrGrid');
    if (qrGrid) {
      const pattern = [
        1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0,
        0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0,
        1, 1, 1, 0, 1, 1, 1
      ];
      pattern.forEach((v, i) => {
        const cell = document.createElement('div');
        cell.className = 'qr-cell ' + (v ? 'dark' : 'light');
        cell.style.transitionDelay = (Math.random() * 0.8 + 0.2) + 's';
        qrGrid.appendChild(cell);
      });
    }

    /* ═══════════════════════════════════════
       FEATURE CARDS — Hover-Reactive Visuals
    ═══════════════════════════════════════ */
    // Mini bars: react to mouse Y position on hover
    const miniBarsContainer = document.querySelector('.mini-bars');
    if (miniBarsContainer) {
      const miniBars = miniBarsContainer.querySelectorAll('.mini-bar');
      const barParentCard = miniBarsContainer.closest('.feat-card');
      barParentCard?.addEventListener('mousemove', (e: any) => {
        const rect = barParentCard.getBoundingClientRect();
        const normalizedY = 1 - ((e.clientY - rect.top) / rect.height);
        miniBars.forEach((bar, i) => {
          const baseHeight = [30, 45, 40, 60, 55, 75, 70, 90, 100][i] || 50;
          const influence = normalizedY * 30 - 15;
          const wave = Math.sin((i / miniBars.length) * Math.PI * 2 + performance.now() * 0.002) * 8;
          const h = Math.max(10, Math.min(100, baseHeight + influence + wave));
          (bar as HTMLElement).style.height = h + '%';
        });
      });
      barParentCard?.addEventListener('mouseleave', () => {
        miniBars.forEach((bar, i) => {
          const baseHeight = [30, 45, 40, 60, 55, 75, 70, 90, 100][i] || 50;
          (bar as HTMLElement).style.height = baseHeight + '%';
        });
      });
    }

    // QR grid: shuffle cells on hover
    if (qrGrid) {
      const qrCard = qrGrid.closest('.feat-card');
      let qrShuffleInterval: any = null;
      qrCard?.addEventListener('mouseenter', () => {
        qrShuffleInterval = setInterval(() => {
          const cells = qrGrid.querySelectorAll('.qr-cell');
          const idx = Math.floor(Math.random() * cells.length);
          const cell = cells[idx];
          const isDark = cell.classList.contains('dark');
          cell.classList.toggle('dark', !isDark);
          cell.classList.toggle('light', isDark);
        }, 80);
      });
      qrCard?.addEventListener('mouseleave', () => {
        if (qrShuffleInterval) clearInterval(qrShuffleInterval);
      });
    }

    /* ═══════════════════════════════════════
       FEATURE CARDS — 3D Tilt + Glow Follow
    ═══════════════════════════════════════ */
    document.querySelectorAll('.feat-card').forEach((card: any) => {
      card.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -4;
        const rotateY = ((x - centerX) / centerX) * 4;
        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        card.style.setProperty('--glow-x', x + 'px');
        card.style.setProperty('--glow-y', y + 'px');
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });

    const featSection = document.getElementById('features');
    const featGridBg = featSection?.querySelector('.feat-grid-bg') as HTMLElement | null;
    const featRows = document.querySelectorAll('.feature-row') as NodeListOf<HTMLElement>;
    const featSpotlight = document.getElementById('featSpotlight') as HTMLElement | null;
    let spotY = 0;
    let spotX = 0;

    function updateFeaturesBg() {
      if (!featSection) return;
      const viewH = window.innerHeight;
      const sRect = featSection.getBoundingClientRect();
      const sP = (viewH - sRect.top) / (sRect.height + viewH);

      // Grid: gentle vertical drift
      if (featGridBg) {
        featGridBg.style.transform = `translateY(${(0.5 - sP) * 80}px)`;
      }

      const t = performance.now() * 0.001;

      // Calculate charge per row + track the active card for the spotlight
      let closestDist = Infinity;
      let targetY = 0;
      let targetX = sRect.width * 0.5;

      featRows.forEach(row => {
        const rr = row.getBoundingClientRect();
        const cy = rr.top + rr.height * 0.5;
        const dist = Math.abs(cy - viewH * 0.5);
        // Charge: 1 when centered, 0 when > 60% of viewport away
        const charge = Math.max(0, 1 - dist / (viewH * 0.6));

        // Set --charge on the card
        const card = row.querySelector('.feat-card') as HTMLElement;
        if (card) card.style.setProperty('--charge', String(charge.toFixed(3)));

        // Track the closest row for the spotlight
        if (dist < closestDist) {
          closestDist = dist;
          targetY = rr.top - sRect.top + rr.height * 0.5;
          const vis = row.querySelector('.feature-visual');
          if (vis) {
            const vr = vis.getBoundingClientRect();
            targetX = vr.left - sRect.left + vr.width * 0.5;
          }
        }
      });

      // Spotlight lerps toward the active card
      if (featSpotlight) {
        spotY += (targetY - spotY) * 0.06;
        spotX += (targetX - spotX) * 0.04;
        const pulse = 1 + Math.sin(t * 1.8) * 0.05;
        featSpotlight.style.transform =
          `translate(${spotX - 350}px, ${spotY - 250}px) scale(${pulse})`;
        featSpotlight.style.opacity = (sP > 0.05 && sP < 0.95) ? '1' : '0';
      }
    }

    /* ═══════════════════════════════════════
       GYM OWNERS — Dashboard Sync
    ═══════════════════════════════════════ */
    const dashZones = [
      document.getElementById('dz0'),
      document.getElementById('dz1'),
      document.getElementById('dz2'),
      document.getElementById('dz3')
    ];
    const ownerBlocks = document.querySelectorAll('[data-dash]');
    const dashObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          const idx = parseInt((e.target as HTMLElement).dataset.dash!);
          dashZones.forEach((z, i) => z?.classList.toggle('active', i === idx));
          ownerBlocks.forEach(b => b.classList.toggle('active-block', parseInt((b as HTMLElement).dataset.dash!) === idx));
        }
      });
    }, { threshold: 0.15, rootMargin: '-30% 0px -30% 0px' });
    ownerBlocks.forEach(el => dashObserver.observe(el));

    /* ═══════════════════════════════════════
       GYM OWNERS — Living Dashboard Simulation
    ═══════════════════════════════════════ */
    const dashMockup = document.querySelector('.dash-body');
    let dashSimActive = false;
    let dashSimInterval: any = null;

    const simNames = ['alex.m', 'sarah.k', 'mike.j', 'emma.r', 'chris.t', 'lisa.p', 'james.w', 'anna.c', 'tom.b', 'kate.d'];
    const simMachines = ['Bench Press', 'Squat Rack', 'Cable Machine', 'Leg Press', 'Pull-up Bar', 'Lat Pulldown', 'Deadlift Platform', 'Smith Machine'];

    // Create the activity feed container
    const feedContainer = document.createElement('div');
    feedContainer.className = 'dash-activity-feed';
    if (dashMockup) dashMockup.appendChild(feedContainer);

    // Create live stats bar
    const liveStats = document.createElement('div');
    liveStats.className = 'dash-live-stats';
    let scanCount = 847;
    let activeNow = 23;
    liveStats.innerHTML = `
      <span><span class="dash-live-pulse"></span>LIVE</span>
      <span>SCANS: <span class="dash-live-stat-value" id="dashScanCount">${scanCount}</span></span>
      <span>ACTIVE: <span class="dash-live-stat-value red" id="dashActiveNow">${activeNow}</span></span>
    `;
    const dashTopbar = document.querySelector('.dash-topbar');
    if (dashTopbar && dashTopbar.parentElement) {
      dashTopbar.parentElement.insertBefore(liveStats, dashTopbar.nextSibling);
    }

    function addFeedEvent() {
      const name = simNames[Math.floor(Math.random() * simNames.length)];
      const machine = simMachines[Math.floor(Math.random() * simMachines.length)];
      const isPositive = Math.random() > 0.2;
      const now = new Date();
      const timeStr = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');

      const item = document.createElement('div');
      item.className = 'dash-feed-item';
      item.innerHTML = `
        <span class="dash-feed-dot ${isPositive ? '' : 'red'}"></span>
        <span class="dash-feed-time">${timeStr}</span>
        <span>${name} scanned <span style="color:var(--text-mid)">${machine}</span></span>
      `;
      feedContainer.prepend(item);

      // Keep max 4 items
      while (feedContainer.children.length > 4) {
        feedContainer.removeChild(feedContainer.lastChild!);
      }

      // Update scan counter
      scanCount += Math.floor(Math.random() * 3) + 1;
      const scanEl = document.getElementById('dashScanCount');
      if (scanEl) scanEl.textContent = String(scanCount);

      // Fluctuate active count
      activeNow += Math.random() > 0.5 ? 1 : -1;
      activeNow = Math.max(18, Math.min(31, activeNow));
      const activeEl = document.getElementById('dashActiveNow');
      if (activeEl) activeEl.textContent = String(activeNow);
    }

    const ownersSection = document.getElementById('owners');
    const dashSimObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !dashSimActive) {
          dashSimActive = true;
          addFeedEvent();
          dashSimInterval = setInterval(addFeedEvent, 2500 + Math.random() * 2000);
        } else if (!e.isIntersecting && dashSimActive) {
          dashSimActive = false;
          if (dashSimInterval) clearInterval(dashSimInterval);
        }
      });
    }, { threshold: 0.1 });
    if (ownersSection) dashSimObserver.observe(ownersSection);

    /* ═══════════════════════════════════════
       ROADMAP — Scroll-Driven Timeline + Root System
    ═══════════════════════════════════════ */
    const roadmapTimeline = document.getElementById('roadmapTimeline');
    const roadmapLine = document.getElementById('roadmapLineActive');
    const rmItems = document.querySelectorAll('[data-rm]');
    const rmCanvas = document.getElementById('rmRootsCanvas') as HTMLCanvasElement;
    const rmCtx = rmCanvas?.getContext('2d');

    function sizeRmCanvas() {
      if (!rmCanvas || !rmCtx || !roadmapTimeline) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = roadmapTimeline.getBoundingClientRect();
      rmCanvas.width = rect.width * dpr;
      rmCanvas.height = rect.height * dpr;
      rmCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    sizeRmCanvas();
    window.addEventListener('resize', sizeRmCanvas, { passive: true });

    // Track per-node root animation progress
    const rmRootProgress: number[] = new Array(rmItems.length).fill(0);
    const rmPoweredAt: number[] = new Array(rmItems.length).fill(0);


    function drawRoots() {
      if (!rmCtx || !rmCanvas || !roadmapTimeline) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = rmCanvas.width / dpr;
      const h = rmCanvas.height / dpr;
      rmCtx.clearRect(0, 0, w, h);

      const timelineRect = roadmapTimeline.getBoundingClientRect();
      const now = performance.now();

      // Ambient breathing glow on powered nodes
      rmItems.forEach((item, idx) => {
        if (!item.classList.contains('powered')) return;
        const nd = item.querySelector('.rm-node') as HTMLElement;
        if (!nd) return;
        const nr = nd.getBoundingClientRect();
        const nx = nr.left + nr.width / 2 - timelineRect.left;
        const ny = nr.top + nr.height / 2 - timelineRect.top;
        const breathe = 0.5 + Math.sin(now * 0.002 + idx * 1.5) * 0.25;
        const ag = rmCtx.createRadialGradient(nx, ny, 0, nx, ny, 70);
        ag.addColorStop(0, `rgba(200,255,0,${breathe * 0.05})`);
        ag.addColorStop(1, 'rgba(200,255,0,0)');
        rmCtx.fillStyle = ag;
        rmCtx.beginPath();
        rmCtx.arc(nx, ny, 70, 0, Math.PI * 2);
        rmCtx.fill();
      });

      rmItems.forEach((item, i) => {
        if (!item.classList.contains('powered')) {
          rmRootProgress[i] = 0;
          rmPoweredAt[i] = 0;
          return;
        }
        if (rmPoweredAt[i] === 0) rmPoweredAt[i] = now;
        const elapsed = now - rmPoweredAt[i];
        rmRootProgress[i] = Math.min(1, elapsed / 1200); // 1.2s to fully grow

        const node = item.querySelector('.rm-node') as HTMLElement;
        const branches = item.querySelectorAll('.rm-branch span');
        if (!node || branches.length === 0) return;

        const nodeRect = node.getBoundingClientRect();
        const nodeX = nodeRect.left + nodeRect.width / 2 - timelineRect.left;
        const nodeY = nodeRect.top + nodeRect.height / 2 - timelineRect.top;

        branches.forEach((label, bi) => {
          const labelRect = (label as HTMLElement).getBoundingClientRect();
          // Target: edge of label closest to node
          const isLeft = labelRect.left < nodeRect.left;
          const endX = isLeft
            ? labelRect.right - timelineRect.left + 4
            : labelRect.left - timelineRect.left - 4;
          const endY = labelRect.top + labelRect.height / 2 - timelineRect.top;

          // Staggered progress per branch
          const branchDelay = bi * 0.15;
          const branchP = Math.max(0, Math.min(1,
            (rmRootProgress[i] - branchDelay) / (1 - branchDelay)
          ));
          if (branchP <= 0) return;

          // Ease-out for organic growth
          const eased = 1 - Math.pow(1 - branchP, 3);

          // Calculate organic cubic bezier control points
          const dx = endX - nodeX;
          const dy = endY - nodeY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // First control point: goes mostly horizontal from node
          const cp1x = nodeX + dx * 0.2;
          const cp1y = nodeY + dy * 0.05 + (bi % 2 === 0 ? -8 : 8);
          // Second control point: curves toward the end
          const cp2x = nodeX + dx * 0.7;
          const cp2y = endY + (bi % 2 === 0 ? 6 : -6);

          // Draw partial path based on progress
          const steps = 40;
          const drawSteps = Math.floor(eased * steps);
          if (drawSteps < 2) return;

          // Taper: thicker near node, thinner at tip
          for (let s = 0; s < drawSteps - 1; s++) {
            const t0 = s / steps;
            const t1 = (s + 1) / steps;

            // Cubic bezier interpolation
            const x0 = bezierPt(nodeX, cp1x, cp2x, endX, t0);
            const y0 = bezierPt(nodeY, cp1y, cp2y, endY, t0);
            const x1 = bezierPt(nodeX, cp1x, cp2x, endX, t1);
            const y1 = bezierPt(nodeY, cp1y, cp2y, endY, t1);

            // Taper width: 2px at node → 0.5px at tip
            const segWidth = 2 - (t0 * 1.5);
            // Alpha: brighter near node, dimmer at tip
            const segAlpha = 0.5 - t0 * 0.3;

            rmCtx.beginPath();
            rmCtx.moveTo(x0, y0);
            rmCtx.lineTo(x1, y1);
            rmCtx.strokeStyle = `rgba(200, 255, 0, ${segAlpha})`;
            rmCtx.lineWidth = Math.max(0.5, segWidth);
            rmCtx.lineCap = 'round';
            rmCtx.stroke();
          }

          // Glow pass (wider, dimmer)
          rmCtx.beginPath();
          for (let s = 0; s <= drawSteps; s++) {
            const t = s / steps;
            const x = bezierPt(nodeX, cp1x, cp2x, endX, t);
            const y = bezierPt(nodeY, cp1y, cp2y, endY, t);
            if (s === 0) rmCtx.moveTo(x, y);
            else rmCtx.lineTo(x, y);
          }
          rmCtx.strokeStyle = 'rgba(200, 255, 0, 0.08)';
          rmCtx.lineWidth = 8;
          rmCtx.lineCap = 'round';
          rmCtx.stroke();

          // Tip glow dot — stays at growth front, persists at endpoint
          {
            const tipT = eased;
            const tipX = bezierPt(nodeX, cp1x, cp2x, endX, tipT);
            const tipY = bezierPt(nodeY, cp1y, cp2y, endY, tipT);
            const tipGrad = rmCtx.createRadialGradient(tipX, tipY, 0, tipX, tipY, 10);
            tipGrad.addColorStop(0, 'rgba(200, 255, 0, 0.5)');
            tipGrad.addColorStop(1, 'rgba(200, 255, 0, 0)');
            rmCtx.fillStyle = tipGrad;
            rmCtx.beginPath();
            rmCtx.arc(tipX, tipY, 10, 0, Math.PI * 2);
            rmCtx.fill();
          }
        });
      });
    }

    // Cubic bezier helper
    function bezierPt(p0: number, p1: number, p2: number, p3: number, t: number): number {
      const mt = 1 - t;
      return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
    }

    function updateRoadmap() {
      if (!roadmapTimeline) return;
      const rect = roadmapTimeline.getBoundingClientRect();
      const viewH = window.innerHeight;
      const progress = Math.max(0, Math.min(1, (viewH - rect.top) / (rect.height + viewH * 0.5)));
      roadmapLine.style.height = (progress * 100) + '%';

      rmItems.forEach((item, i) => {
        const itemRect = item.getBoundingClientRect();
        const itemMid = itemRect.top + itemRect.height / 2;
        if (itemMid < viewH * 0.75) {
          item.classList.add('visible');
          if (progress > (i + 0.5) / rmItems.length) {
            item.classList.add('powered');
          }
        }
      });

      drawRoots();
    }

    /* ═══════════════════════════════════════
       CTA — Staggered entrance
    ═══════════════════════════════════════ */
    const ctaObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const content = e.target.querySelector('.cta-content');
          if (!content) return;
          content.querySelector('.cta-logo')?.classList.add('visible');
          content.querySelector('.cta-title')?.classList.add('visible');
          content.querySelector('.cta-desc')?.classList.add('visible');
          content.querySelector('.cta-actions')?.classList.add('visible');
          ctaObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    const ctaSection = document.getElementById('cta');
    if (ctaSection) ctaObserver.observe(ctaSection);

    /* ═══════════════════════════════════════
       DASHBOARD MOMENTUM
    ═══════════════════════════════════════ */
    const dashCol = document.querySelector('.owners-dash-col');
    let dashLerpY = 0;

    function updateDashMomentum() {
      const scrollY = window.scrollY;
      dashLerpY += (scrollY - dashLerpY) * 0.08;
      const offset = (scrollY - dashLerpY) * -0.15;
      dashCol.style.transform = `translateY(${offset}px)`;
    }

    /* scrollUpdates merged into tick() above */


  }, []);

  return (
    <>

      {/* Intro Reveal */}
      <div className="intro-reveal" id="introReveal">
        <canvas id="introCanvas"></canvas>
      </div>


      {/* Scroll progress */}
      <div className="scroll-progress" id="scrollProgress"></div>

      {/* Navbar */}
      <nav className="navbar" id="navbar">
        <a href="#" className="nav-brand" id="navBrand">
          <div className="nav-logo"><img src="logo.webp" alt="Liftio" /></div>
          <span className="nav-wordmark">Liftio</span>
        </a>
        <ul className="nav-links">
          <li><a href="#how" className="nav-anim nav-anim-link" id="navLink0">How It Works</a></li>
          <li><a href="#features" className="nav-anim nav-anim-link" id="navLink1">Features</a></li>
          <li><a href="#owners" className="nav-anim nav-anim-link" id="navLink2">For Gyms</a></li>
          <li><a href="#roadmap" className="nav-anim nav-anim-link" id="navLink3">Roadmap</a></li>
        </ul>
        <a href="#cta" className="nav-cta" id="navCta">Get Early Access</a>
      </nav>

      {/* ═══ CANVAS (scrollytelling) ═══ */}
      <div className="canvas-viewport" id="canvasViewport">
        <canvas id="frameCanvas"></canvas>
      </div>
      <div className="video-overlay" id="videoOverlay"></div>

      {/* Phone mockup — Three.js 3D */}
      <div className="phone-mockup" id="phoneMockup">
        <div className="phone-3d-container" id="phone3dContainer"></div>
      </div>

      {/* Hero content */}
      <div className="hero-content" id="heroContent">
        <div className="hero-logo-icon hero-element" id="heroLogo"><img src="logo.webp" alt="Liftio" /></div>
        <h1 className="hero-title">
          <span className="line laser-reveal laser-green" id="revealScan">Scan.</span>
          <span className="line accent laser-reveal laser-red from-right" id="revealTrack">Track.</span>
          <span className="line laser-reveal laser-green" id="revealProgress">Progress.</span>
        </h1>
        <p className="hero-sub hero-element" id="heroSub">QR codes on every machine. Instant workout tracking. Zero friction between you and your gains.
        </p>
        <div className="hero-actions hero-element" id="heroActions">
          <a href="#cta" className="btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            Get Started
          </a>
          <a href="#how" className="btn-secondary">See How It Works</a>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="scroll-hint" id="scrollHint">
        <span className="scroll-hint-text">Scroll</span>
        <div className="scroll-hint-line"></div>
      </div>

      {/* Scrollytelling runway */}
      <div className="scroll-runway" id="scrollRunway">
        <div className="scroll-content">
          <section className="scene-section" data-scene="0">
            <div className="scene-text" id="text0">
              <div className="scene-number">01</div>
              <h2 className="scene-heading">Walk up. Scan the code.</h2>
              <p className="scene-desc">One scan. Instantly tracking.</p>
            </div>
          </section>
          <section className="scene-section" data-scene="1">
            <div className="scene-text" id="text1">
              <div className="scene-number">02</div>
              <h2 className="scene-heading scramble-text" data-final="See history.|Beat it."></h2>
              <p className="scene-desc scramble-text"
                data-final="Your history, PRs, and targets.|All right there.">
              </p>
            </div>
          </section>
          <section className="scene-section" data-scene="2" style={{ 'height': '300vh' }}>
            <div className="scene-text" id="text2">
              <div className="scene-number">03</div>
              <h2 className="scene-heading">Log and move on.</h2>
              <p className="scene-desc">Weight. Reps. Done. Stay in the zone.</p>
            </div>
          </section>
        </div>
      </div>

      {/* Transition */}
      <div className="section-transition"></div>

      {/* ═══ HOW IT WORKS — Horizontal Scroll ═══ */}
      <section className="section hiw-section" id="how">
        <div className="hiw-sticky">
          <div className="hiw-bg-glow"></div>
          <canvas className="hiw-curve-canvas" id="hiwCurveCanvas"></canvas>
          <div className="hiw-header">
            <div className="section-label">How It Works</div>
          </div>
          <div className="hiw-track" id="hiwTrack">
            {/* Panel 1: Animated QR scan */}
            <div className="hiw-panel">
              <div className="hiw-panel-number">01</div>
              <div className="hiw-glass-pane">
                <div className="hiw-panel-visual">
                  <div className="hiw-phone-frame">
                    <div className="hiw-scan-area">
                      <div className="hiw-scan-corners" id="hiwScanCorners">
                        <span></span><span></span><span></span><span></span>
                      </div>
                      <div className="hiw-scan-line" id="hiwScanLine"></div>
                      <svg id="hiwQRIcon" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1"
                        opacity="0.4">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                        <rect x="14" y="14" width="4" height="4" />
                        <line x1="18" y1="14" x2="18" y2="18" />
                        <line x1="14" y1="18" x2="18" y2="18" />
                      </svg>
                    </div>
                  </div>
                </div>
                <h3 className="hiw-panel-title">Scan the QR Code</h3>
                <p className="hiw-panel-desc">Open Liftio, point your camera at the machine's QR code. The exercise loads
                  instantly.</p>
                <div className="hiw-panel-line"></div>
              </div>
            </div>
            {/* Panel 2: Live set logging UI */}
            <div className="hiw-panel">
              <div className="hiw-panel-number">02</div>
              <div className="hiw-glass-pane">
                <div className="hiw-panel-visual">
                  <div className="hiw-log-card">
                    <div className="hiw-log-exercise">Bench Press</div>
                    <div className="hiw-log-previous">Last session: 80kg × 10</div>
                    <div className="hiw-log-inputs">
                      <div className="hiw-log-field">
                        <div className="hiw-log-label">WEIGHT</div>
                        <div className="hiw-log-value"><span id="hiwWeight">0</span><span
                          className="hiw-log-unit">kg</span></div>
                      </div>
                      <div className="hiw-log-x">×</div>
                      <div className="hiw-log-field">
                        <div className="hiw-log-label">REPS</div>
                        <div className="hiw-log-value"><span id="hiwReps">0</span></div>
                      </div>
                    </div>
                    <div className="hiw-log-btn" id="hiwLogBtn" role="button" tabIndex={0} style={{ 'cursor': 'pointer' }}>LOG SET</div>
                    <div className="hiw-log-pb" id="hiwPR" style={{ 'visibility': 'hidden', 'opacity': '0', 'transition': 'opacity 0.4s ease, visibility 0.4s ease' }}>NEW PR! <span style={{ 'color': 'var(--accent)' }}>+5kg</span></div>
                  </div>
                </div>
                <h3 className="hiw-panel-title">Track Your Sets</h3>
                <p className="hiw-panel-desc">Enter weight and reps. See your previous performance, personal bests, and projected
                  targets.</p>
                <div className="hiw-panel-line"></div>
              </div>
            </div>
            {/* Panel 3: Progress chart */}
            <div className="hiw-panel">
              <div className="hiw-panel-number">03</div>
              <div className="hiw-glass-pane">
                <div className="hiw-panel-visual">
                  <div className="hiw-chart-card">
                    <div className="hiw-chart-title">Bench Press — 12 weeks</div>
                    <svg className="hiw-chart-svg" viewBox="-5 -15 310 150" fill="none">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                        </linearGradient>
                        <clipPath id="chartClip">
                          <rect id="hiwChartClipRect" x="-5" y="-15" width="0" height="150" />
                        </clipPath>
                      </defs>
                      <polyline id="hiwChartLine" className="hiw-chart-line" points="0,100 40,92 80,85 120,78 160,65 200,55 240,40 280,20"
                        stroke="var(--accent)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"
                        clipPath="url(#chartClip)" />
                      <polygon className="hiw-chart-fill"
                        points="0,100 40,92 80,85 120,78 160,65 200,55 240,40 280,20 280,120 0,120" fill="url(#chartGrad)"
                        clipPath="url(#chartClip)" />
                      <circle id="hiwChartDot" cx="0" cy="100" r="4" fill="var(--accent)" opacity="0" />
                    </svg>
                    <div className="hiw-chart-stats">
                      <div className="hiw-chart-stat"><span id="hiwStatStrength" style={{ 'color': 'var(--accent)', 'fontWeight': '800' }}>+0%</span><br /><span
                        style={{ 'color': 'var(--text-dim)', 'fontSize': '0.6rem' }}>STRENGTH</span></div>
                      <div className="hiw-chart-stat"><span id="hiwStatSessions" style={{ 'color': 'var(--red-neon)', 'fontWeight': '800' }}>0</span><br /><span
                        style={{ 'color': 'var(--text-dim)', 'fontSize': '0.6rem' }}>SESSIONS</span></div>
                      <div className="hiw-chart-stat"><span id="hiwStatPRs" style={{ 'fontWeight': '800' }}>0</span><br /><span
                        style={{ 'color': 'var(--text-dim)', 'fontSize': '0.6rem' }}>NEW PRs</span></div>
                    </div>
                  </div>
                </div>
                <h3 className="hiw-panel-title">Watch Progress Compound</h3>
                <p className="hiw-panel-desc">Over weeks and months, Liftio builds your complete strength story — every rep, every
                  PR.</p>
                <div className="hiw-panel-line"></div>
              </div>
            </div>
          </div>
          {/* red scrollbar removed */}
          <div className="hiw-dots" id="hiwDots" role="tablist" aria-label="How it works steps">
            <div className="hiw-dot active" role="tab" tabIndex={0} aria-label="Step 1: Scan" aria-selected="true"></div>
            <div className="hiw-dot" role="tab" tabIndex={0} aria-label="Step 2: Track" aria-selected="false"></div>
            <div className="hiw-dot" role="tab" tabIndex={0} aria-label="Step 3: Progress" aria-selected="false"></div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES — Alternating Rows ═══ */}
      <section className="section features-section" id="features">
        {/* Background grid */}
        <div className="feat-grid-bg" aria-hidden="true"></div>
        <div className="feat-spotlight" id="featSpotlight" aria-hidden="true"></div>
        <div className="section-inner">
          <div className="section-label reveal">Features</div>
          <h2 className="section-title reveal reveal-delay-1">Built for lifters<br />who mean business.</h2>
          <p className="section-subtitle reveal reveal-delay-2">Every feature serves one goal: keep you progressing with zero
            wasted time.</p>
        </div>

        <div className="feature-row" data-feat>
          <div className="feature-visual">
            <div className="feat-card">
              <div className="mini-bars">
                <div className="mini-bar"></div>
                <div className="mini-bar"></div>
                <div className="mini-bar"></div>
                <div className="mini-bar"></div>
                <div className="mini-bar"></div>
                <div className="mini-bar"></div>
                <div className="mini-bar"></div>
                <div className="mini-bar"></div>
                <div className="mini-bar"></div>
              </div>
            </div>
          </div>
          <div className="feature-info">
            <div className="feature-number">01 — PROGRESSIVE OVERLOAD</div>
            <h3 className="feature-title">Your previous sets, PRs, and projected targets — the moment you scan.</h3>
            <p className="feature-desc">No more guessing what you lifted last week. Liftio remembers everything and shows you
              exactly what to beat today.</p>
          </div>
        </div>

        <div className="feature-row" data-feat>
          <div className="feature-visual">
            <div className="feat-card" style={{ 'justifyContent': 'center' }}>
              <div className="feat-stat counter" data-target="2" data-suffix="s" data-decimal="0">{"<2s"}</div>
              <div className="feat-stat-sub">Scan to log — the fastest in fitness</div>
            </div>
          </div>
          <div className="feature-info">
            <div className="feature-number">02 — AUTOMATIC SESSIONS</div>
            <h3 className="feature-title">Your first scan starts a session. Your last set ends it.</h3>
            <p className="feature-desc">After 60 minutes of inactivity, the session auto-closes and timestamps your final set.
              Zero buttons, zero friction.</p>
          </div>
        </div>

        <div className="feature-row" data-feat>
          <div className="feature-visual">
            <div className="feat-card" style={{ 'justifyContent': 'center' }}>
              <div className="qr-grid" id="qrGrid"></div>
            </div>
          </div>
          <div className="feature-info">
            <div className="feature-number">03 — QR-LINKED MACHINES</div>
            <h3 className="feature-title">Each code maps to the exact machine you're standing at.</h3>
            <p className="feature-desc">Assigned exercises, custom instructions, form videos, and your entire history on that
              specific machine — all linked to one QR code.</p>
          </div>
        </div>

        <div className="feature-row" data-feat>
          <div className="feature-visual">
            <div className="feat-card" style={{ 'justifyContent': 'center', 'gap': '12px' }}>
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.2"
                strokeLinecap="round" opacity="0.7" aria-hidden="true">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
              <div
                style={{ 'fontFamily': '\'JetBrains Mono\',monospace', 'fontSize': '0.7rem', 'color': 'var(--text-dim)', 'letterSpacing': '0.1em' }}>
                ► <span id="videoTimer">0:42</span> — BENCH PRESS FORM</div>
            </div>
          </div>
          <div className="feature-info">
            <div className="feature-number">04 — MACHINE-SPECIFIC VIDEOS</div>
            <h3 className="feature-title">Don't know the exercise? Tap play.</h3>
            <p className="feature-desc">Form videos filmed on the exact machine you're standing at. Target muscle diagrams and
              step-by-step instructions included.</p>
          </div>
        </div>
      </section>

      {/* ═══ FOR GYM OWNERS — Split Screen ═══ */}
      <section className="section" id="owners">
        <div className="section-inner" style={{ 'paddingBottom': '0' }}>
          <div className="section-label reveal">For Gym Owners</div>
          <h2 className="section-title reveal reveal-delay-1">Digitize your floor<br />in an afternoon.</h2>
          <p className="section-subtitle reveal reveal-delay-2">Give your members a premium digital experience. Give yourself
            actionable usage data.</p>
        </div>
        <div className="owners-split">
          <div className="owners-dash-col">
            <div className="dash-mockup">
              <div className="dash-topbar">
                <div className="dash-dot r"></div>
                <div className="dash-dot y"></div>
                <div className="dash-dot g"></div>
                <span className="dash-topbar-title">LIFTIO DASHBOARD</span>
              </div>
              <div className="dash-body">
                <div className="dash-zone active" id="dz0">
                  <div className="dash-zone-label">EQUIPMENT</div>
                  <div className="dash-mini-grid">
                    <div className="dash-mini-item"></div>
                    <div className="dash-mini-item"></div>
                    <div className="dash-mini-item"></div>
                    <div className="dash-mini-item"></div>
                    <div className="dash-mini-item"></div>
                    <div className="dash-mini-item"></div>
                    <div className="dash-mini-item"></div>
                    <div className="dash-mini-item"></div>
                  </div>
                </div>
                <div className="dash-zone" id="dz1">
                  <div className="dash-zone-label">QR CODES</div>
                  <div style={{ 'display': 'flex', 'gap': '8px', 'alignItems': 'center' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    <div
                      style={{ 'padding': '4px 12px', 'background': 'var(--accent-dim)', 'borderRadius': '6px', 'fontSize': '0.6rem', 'fontWeight': '700', 'color': 'var(--accent)', 'letterSpacing': '0.1em' }}>
                      GENERATE</div>
                  </div>
                </div>
                <div className="dash-zone" id="dz2">
                  <div className="dash-zone-label">ANALYTICS</div>
                  <div className="dash-mini-bars">
                    <div className="dash-mini-bar" style={{ 'height': '30%', 'opacity': '0.4' }}></div>
                    <div className="dash-mini-bar" style={{ 'height': '55%', 'opacity': '0.6' }}></div>
                    <div className="dash-mini-bar" style={{ 'height': '45%', 'opacity': '0.5' }}></div>
                    <div className="dash-mini-bar" style={{ 'height': '80%', 'opacity': '0.8' }}></div>
                    <div className="dash-mini-bar" style={{ 'height': '65%', 'opacity': '0.7' }}></div>
                    <div className="dash-mini-bar" style={{ 'height': '100%' }}></div>
                  </div>
                </div>
                <div className="dash-zone" id="dz3">
                  <div className="dash-zone-label">MEMBER EXPERIENCE</div>
                  <div style={{ 'display': 'flex', 'gap': '4px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--accent)" stroke="none">
                      <polygon
                        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--accent)" stroke="none">
                      <polygon
                        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--accent)" stroke="none">
                      <polygon
                        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--accent)" stroke="none">
                      <polygon
                        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.15)" stroke="none">
                      <polygon
                        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="owners-features-col">
            <div className="owner-feature-block reveal" data-dash="0">
              <div className="feature-number">EQUIPMENT MANAGEMENT</div>
              <h3 className="feature-title">Add machines, assign exercises, upload custom form videos, and generate QR codes —
                all from one dashboard.</h3>
              <p className="feature-desc">Every machine gets a digital profile with instructions, target muscles, and linked
                exercises.</p>
              <div className="dash-zone-mobile">
                <div className="dash-zone-label">EQUIPMENT</div>
                <div className="dash-mini-grid">
                  <div className="dash-mini-item"></div><div className="dash-mini-item"></div>
                  <div className="dash-mini-item"></div><div className="dash-mini-item"></div>
                  <div className="dash-mini-item"></div><div className="dash-mini-item"></div>
                  <div className="dash-mini-item"></div><div className="dash-mini-item"></div>
                </div>
              </div>
            </div>
            <div className="owner-feature-block reveal" data-dash="1">
              <div className="feature-number">QR CODE GENERATION</div>
              <h3 className="feature-title">Generate unique QR PDFs to print and stick, or link pre-printed stickers.</h3>
              <p className="feature-desc">Scan or input a physical sticker's ID and link it to the digital machine profile.
                Flexible for any gym setup.</p>
              <div className="dash-zone-mobile">
                <div className="dash-zone-label">QR CODES</div>
                <div style={{ 'display': 'flex', 'gap': '8px', 'alignItems': 'center' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                  </svg>
                  <div style={{ 'padding': '4px 12px', 'background': 'var(--accent-dim)', 'borderRadius': '6px', 'fontSize': '0.6rem', 'fontWeight': '700', 'color': 'var(--accent)', 'letterSpacing': '0.1em' }}>GENERATE</div>
                </div>
              </div>
            </div>
            <div className="owner-feature-block reveal" data-dash="2">
              <div className="feature-number">USAGE ANALYTICS</div>
              <h3 className="feature-title">See which machines get the most scans, peak hours, and equipment trends.</h3>
              <p className="feature-desc">Data-driven decisions for your facility — know what equipment your members actually
                use.</p>
              <div className="dash-zone-mobile">
                <div className="dash-zone-label">ANALYTICS</div>
                <div className="dash-mini-bars">
                  <div className="dash-mini-bar" style={{ 'height': '30%', 'opacity': '0.4' }}></div>
                  <div className="dash-mini-bar" style={{ 'height': '55%', 'opacity': '0.6' }}></div>
                  <div className="dash-mini-bar" style={{ 'height': '45%', 'opacity': '0.5' }}></div>
                  <div className="dash-mini-bar" style={{ 'height': '80%', 'opacity': '0.8' }}></div>
                  <div className="dash-mini-bar" style={{ 'height': '65%', 'opacity': '0.7' }}></div>
                  <div className="dash-mini-bar" style={{ 'height': '100%' }}></div>
                </div>
              </div>
            </div>
            <div className="owner-feature-block reveal" data-dash="3">
              <div className="feature-number">PREMIUM EXPERIENCE</div>
              <h3 className="feature-title">Stand out from every other gym with a smart, branded workout experience.</h3>
              <p className="feature-desc">Your members get intelligent tracking that keeps them coming back. Retention through
                innovation.</p>
              <div className="dash-zone-mobile">
                <div className="dash-zone-label">MEMBER EXPERIENCE</div>
                <div style={{ 'display': 'flex', 'gap': '4px' }}>
                  {[1,2,3,4].map(s => (
                    <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="var(--accent)" stroke="none">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.15)" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ROADMAP — Centered Alternating Timeline ═══ */}
      <section className="section" id="roadmap">
        <div className="section-inner">
          <div className="section-label reveal" style={{ 'textAlign': 'center' }}>Roadmap</div>
          <h2 className="section-title reveal reveal-delay-1" style={{ 'textAlign': 'center', 'margin': '0 auto 20px' }}>We're
            just<br />getting started.</h2>
          <p className="section-subtitle reveal reveal-delay-2" style={{ 'textAlign': 'center', 'margin': '0 auto 80px' }}>Built in public.
            Shipping fast. Here's what's coming next.</p>

          <div className="roadmap-timeline" id="roadmapTimeline">
            <canvas className="rm-roots-canvas" id="rmRootsCanvas"></canvas>
            <div className="roadmap-line-ghost"></div>
            <div className="roadmap-line-active" id="roadmapLineActive"></div>

            <div className="rm-item" data-rm>
              <div className="rm-node"></div>
              <div>
                <div className="rm-live-badge">
                  <div className="rm-live-dot"></div> LIVE
                </div>
                <div className="rm-version">V1 — NOW</div>
                <h3 className="rm-title">The Core Foundation</h3>
                <div className="rm-roots">
                  <div className="rm-trunk"></div>
                  <div className="rm-branch" style={{ '--i': 0, '--angle': '-12deg', '--len': '38px' } as React.CSSProperties}><span>QR Scan-to-Track</span></div>
                  <div className="rm-branch" style={{ '--i': 1, '--angle': '4deg', '--len': '50px' } as React.CSSProperties}><span>Auto Sessions</span></div>
                  <div className="rm-branch" style={{ '--i': 2, '--angle': '-8deg', '--len': '44px' } as React.CSSProperties}><span>Progressive Overload</span></div>
                  <div className="rm-branch" style={{ '--i': 3, '--angle': '10deg', '--len': '36px' } as React.CSSProperties}><span>Form Videos</span></div>
                  <div className="rm-branch" style={{ '--i': 4, '--angle': '-5deg', '--len': '52px' } as React.CSSProperties}><span>Gym Owner Portal</span></div>
                </div>
              </div>
            </div>
            <div className="rm-item future" data-rm>
              <div className="rm-node"></div>
              <div>
                <div className="rm-version">V2 — DISCOVERY</div>
                <h3 className="rm-title">Gym Discovery & Analytics</h3>
                <div className="rm-roots">
                  <div className="rm-trunk"></div>
                  <div className="rm-branch" style={{ '--i': 0, '--angle': '8deg', '--len': '46px' } as React.CSSProperties}><span>Interactive Gym Map</span></div>
                  <div className="rm-branch" style={{ '--i': 1, '--angle': '-6deg', '--len': '40px' } as React.CSSProperties}><span>Usage Analytics</span></div>
                  <div className="rm-branch" style={{ '--i': 2, '--angle': '14deg', '--len': '34px' } as React.CSSProperties}><span>Equipment Trends</span></div>
                </div>
              </div>
            </div>
            <div className="rm-item future" data-rm>
              <div className="rm-node"></div>
              <div>
                <div className="rm-version">V3 — TRAINERS</div>
                <h3 className="rm-title">Trainer Integration</h3>
                <div className="rm-roots">
                  <div className="rm-trunk"></div>
                  <div className="rm-branch" style={{ '--i': 0, '--angle': '-10deg', '--len': '42px' } as React.CSSProperties}><span>Trainer Profiles</span></div>
                  <div className="rm-branch" style={{ '--i': 1, '--angle': '6deg', '--len': '48px' } as React.CSSProperties}><span>Progress Monitoring</span></div>
                  <div className="rm-branch" style={{ '--i': 2, '--angle': '-3deg', '--len': '38px' } as React.CSSProperties}><span>Offline + Sync</span></div>
                </div>
              </div>
            </div>
            <div className="rm-item future" data-rm>
              <div className="rm-node"></div>
              <div>
                <div className="rm-version">V4 — AI</div>
                <h3 className="rm-title">Smart Insights</h3>
                <div className="rm-roots">
                  <div className="rm-trunk"></div>
                  <div className="rm-branch" style={{ '--i': 0, '--angle': '12deg', '--len': '44px' } as React.CSSProperties}><span>Plateau Detection</span></div>
                  <div className="rm-branch" style={{ '--i': 1, '--angle': '-8deg', '--len': '52px' } as React.CSSProperties}><span>Rest Optimization</span></div>
                  <div className="rm-branch" style={{ '--i': 2, '--angle': '5deg', '--len': '40px' } as React.CSSProperties}><span>AI Coach Chatbot</span></div>
                </div>
              </div>
            </div>
            <div className="rm-item future" data-rm>
              <div className="rm-node"></div>
              <div>
                <div className="rm-version">V5 — COMMUNITY</div>
                <h3 className="rm-title">Social Ecosystem</h3>
                <div className="rm-roots">
                  <div className="rm-trunk"></div>
                  <div className="rm-branch" style={{ '--i': 0, '--angle': '-14deg', '--len': '36px' } as React.CSSProperties}><span>Gym Reviews</span></div>
                  <div className="rm-branch" style={{ '--i': 1, '--angle': '8deg', '--len': '46px' } as React.CSSProperties}><span>User Content</span></div>
                  <div className="rm-branch" style={{ '--i': 2, '--angle': '-4deg', '--len': '42px' } as React.CSSProperties}><span>Trainer Marketplace</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA — Ticker Tape Background ═══ */}
      <section className="section cta-section" id="cta">
        <div className="cta-ticker-bg" aria-hidden="true">
          <div className="cta-ticker-row" style={{ '--ticker-speed': '80s', '--ticker-dir': '-1' } as React.CSSProperties}>
            <div className="cta-ticker-track">
              <span className="ticker-g">85kg × 8 Bench Press</span><span className="ticker-g">NEW PR!</span><span className="ticker-r">MISSED</span><span className="ticker-g">+5kg Squat</span><span className="ticker-g">12wk STREAK</span><span className="ticker-g">4×12 OHP</span><span className="ticker-g">90kg × 3 Deadlift</span><span className="ticker-r">-3kg</span><span className="ticker-g">PR! +10%</span><span className="ticker-g">5×5 Squat</span><span className="ticker-g">100kg × 5</span><span className="ticker-r">FAILED</span><span className="ticker-g">+2.5kg</span><span className="ticker-g">30 DAYS</span>
              <span className="ticker-g">85kg × 8 Bench Press</span><span className="ticker-g">NEW PR!</span><span className="ticker-r">MISSED</span><span className="ticker-g">+5kg Squat</span><span className="ticker-g">12wk STREAK</span><span className="ticker-g">4×12 OHP</span><span className="ticker-g">90kg × 3 Deadlift</span><span className="ticker-r">-3kg</span><span className="ticker-g">PR! +10%</span><span className="ticker-g">5×5 Squat</span><span className="ticker-g">100kg × 5</span><span className="ticker-r">FAILED</span><span className="ticker-g">+2.5kg</span><span className="ticker-g">30 DAYS</span>
            </div>
          </div>
          <div className="cta-ticker-row" style={{ '--ticker-speed': '120s', '--ticker-dir': '1' } as React.CSSProperties}>
            <div className="cta-ticker-track">
              <span className="ticker-g">+15% Strength</span><span className="ticker-g">225lb × 5</span><span className="ticker-g">7 DAYS</span><span className="ticker-r">-5lb</span><span className="ticker-g">REP PR!</span><span className="ticker-g">Cable Row 60kg</span><span className="ticker-g">1RM 120kg</span><span className="ticker-g">+20%</span><span className="ticker-r">-2%</span><span className="ticker-g">42 SESSIONS</span><span className="ticker-g">Leg Press 180kg</span><span className="ticker-g">3×8</span><span className="ticker-g">↑ VOL</span><span className="ticker-g">PR!</span>
              <span className="ticker-g">+15% Strength</span><span className="ticker-g">225lb × 5</span><span className="ticker-g">7 DAYS</span><span className="ticker-r">-5lb</span><span className="ticker-g">REP PR!</span><span className="ticker-g">Cable Row 60kg</span><span className="ticker-g">1RM 120kg</span><span className="ticker-g">+20%</span><span className="ticker-r">-2%</span><span className="ticker-g">42 SESSIONS</span><span className="ticker-g">Leg Press 180kg</span><span className="ticker-g">3×8</span><span className="ticker-g">↑ VOL</span><span className="ticker-g">PR!</span>
            </div>
          </div>
          <div className="cta-ticker-row" style={{ '--ticker-speed': '95s', '--ticker-dir': '-1' } as React.CSSProperties}>
            <div className="cta-ticker-track">
              <span className="ticker-g">Bench Press 80kg</span><span className="ticker-g">+8%</span><span className="ticker-g">NEW PR +5kg</span><span className="ticker-g">4×12 Lat Pulldown</span><span className="ticker-r">-1 REP</span><span className="ticker-g">STREAK 7</span><span className="ticker-g">70kg × 10</span><span className="ticker-g">↑ STR</span><span className="ticker-g">+12%</span><span className="ticker-r">-5%</span><span className="ticker-g">Squat 100kg</span><span className="ticker-g">5×5</span><span className="ticker-g">SESSION #247</span><span className="ticker-g">+10lb</span>
              <span className="ticker-g">Bench Press 80kg</span><span className="ticker-g">+8%</span><span className="ticker-g">NEW PR +5kg</span><span className="ticker-g">4×12 Lat Pulldown</span><span className="ticker-r">-1 REP</span><span className="ticker-g">STREAK 7</span><span className="ticker-g">70kg × 10</span><span className="ticker-g">↑ STR</span><span className="ticker-g">+12%</span><span className="ticker-r">-5%</span><span className="ticker-g">Squat 100kg</span><span className="ticker-g">5×5</span><span className="ticker-g">SESSION #247</span><span className="ticker-g">+10lb</span>
            </div>
          </div>
          <div className="cta-ticker-row" style={{ '--ticker-speed': '140s', '--ticker-dir': '1' } as React.CSSProperties}>
            <div className="cta-ticker-track">
              <span className="ticker-g">+25lb</span><span className="ticker-g">OHP 60kg × 6</span><span className="ticker-g">PR! Deadlift</span><span className="ticker-g">3×8 Rows</span><span className="ticker-r">MISSED</span><span className="ticker-g">90kg × 3</span><span className="ticker-g">+3%</span><span className="ticker-g">14 WEEK STREAK</span><span className="ticker-g">Incline Bench 65kg</span><span className="ticker-g">REP PR!</span><span className="ticker-r">-2.5kg</span><span className="ticker-g">4×10</span><span className="ticker-g">+5kg</span><span className="ticker-g">VOLUME ↑</span>
              <span className="ticker-g">+25lb</span><span className="ticker-g">OHP 60kg × 6</span><span className="ticker-g">PR! Deadlift</span><span className="ticker-g">3×8 Rows</span><span className="ticker-r">MISSED</span><span className="ticker-g">90kg × 3</span><span className="ticker-g">+3%</span><span className="ticker-g">14 WEEK STREAK</span><span className="ticker-g">Incline Bench 65kg</span><span className="ticker-g">REP PR!</span><span className="ticker-r">-2.5kg</span><span className="ticker-g">4×10</span><span className="ticker-g">+5kg</span><span className="ticker-g">VOLUME ↑</span>
            </div>
          </div>
          <div className="cta-ticker-row" style={{ '--ticker-speed': '70s', '--ticker-dir': '-1' } as React.CSSProperties}>
            <div className="cta-ticker-track">
              <span className="ticker-g">120kg × 1 Squat</span><span className="ticker-g">NEW PR!</span><span className="ticker-g">+15%</span><span className="ticker-g">Hip Thrust 100kg</span><span className="ticker-g">5×5 Bench</span><span className="ticker-r">FAILED</span><span className="ticker-g">+10kg</span><span className="ticker-g">PERSONAL BEST</span><span className="ticker-g">Romanian DL 80kg</span><span className="ticker-g">8 WEEK STREAK</span><span className="ticker-r">-3%</span><span className="ticker-g">4×12</span><span className="ticker-g">1RM 140kg</span><span className="ticker-g">+8%</span>
              <span className="ticker-g">120kg × 1 Squat</span><span className="ticker-g">NEW PR!</span><span className="ticker-g">+15%</span><span className="ticker-g">Hip Thrust 100kg</span><span className="ticker-g">5×5 Bench</span><span className="ticker-r">FAILED</span><span className="ticker-g">+10kg</span><span className="ticker-g">PERSONAL BEST</span><span className="ticker-g">Romanian DL 80kg</span><span className="ticker-g">8 WEEK STREAK</span><span className="ticker-r">-3%</span><span className="ticker-g">4×12</span><span className="ticker-g">1RM 140kg</span><span className="ticker-g">+8%</span>
            </div>
          </div>
          <div className="cta-ticker-row" style={{ '--ticker-speed': '110s', '--ticker-dir': '1' } as React.CSSProperties}>
            <div className="cta-ticker-track">
              <span className="ticker-g">Chest Press 50kg</span><span className="ticker-g">+5%</span><span className="ticker-g">3×10 Curls</span><span className="ticker-g">STREAK 21</span><span className="ticker-g">Leg Extension 70kg</span><span className="ticker-r">-1 REP</span><span className="ticker-g">+7.5kg</span><span className="ticker-g">PR! Squat</span><span className="ticker-g">60 SESSIONS</span><span className="ticker-g">Smith Machine 80kg</span><span className="ticker-g">↑ VOL</span><span className="ticker-r">-5lb</span><span className="ticker-g">5×5 OHP</span><span className="ticker-g">+12%</span>
              <span className="ticker-g">Chest Press 50kg</span><span className="ticker-g">+5%</span><span className="ticker-g">3×10 Curls</span><span className="ticker-g">STREAK 21</span><span className="ticker-g">Leg Extension 70kg</span><span className="ticker-r">-1 REP</span><span className="ticker-g">+7.5kg</span><span className="ticker-g">PR! Squat</span><span className="ticker-g">60 SESSIONS</span><span className="ticker-g">Smith Machine 80kg</span><span className="ticker-g">↑ VOL</span><span className="ticker-r">-5lb</span><span className="ticker-g">5×5 OHP</span><span className="ticker-g">+12%</span>
            </div>
          </div>
        </div>
        <div className="cta-content">
          <div className="cta-logo"><img src="logo.webp" alt="Liftio" /></div>
          <h2 className="cta-title">Ready to track<br />like you train?</h2>
          <p className="cta-desc">Join the early access waitlist. Be first to bring Liftio to your gym.
          </p>
          <div className="hero-actions cta-actions">
            <a href="#cta" className="btn-primary btn-primary-glow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              Get Early Access
            </a>
            <a href="#cta" className="btn-secondary">Contact Us</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo"><img src="logo.webp" alt="Liftio" /></div>
            <span className="footer-name">Liftio</span>
          </div>
          <span className="footer-copy">© 2026 Liftio. All rights reserved.</span>
        </div>
      </footer>

    </>
  );
}
