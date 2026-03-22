// @ts-nocheck
"use client";
/* eslint-disable */

import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import Phone3D from "./Phone3D";

export default function LiftioApp() {
  useEffect(() => {
    'use strict';

    // Mount Three.js phone into container
    const phone3dContainer = document.getElementById('phone3dContainer');
    if (phone3dContainer) {
      const root = createRoot(phone3dContainer);
      root.render(<Phone3D screenshotSrc="/screenshot1.png" />);
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

    // The densest filled area of the silhouette is bottom-left
    // (where circle arc meets the L-bar). Offset the hole center there.
    // Normalized offset from image center: ~0.18 left, ~0.18 down
    const HOLE_OFFSET_X = -0.18;
    const HOLE_OFFSET_Y = 0.18;

    function sizeIntroCanvas() {
      introCanvas.width = window.innerWidth;
      introCanvas.height = window.innerHeight;
    }
    sizeIntroCanvas();
    window.addEventListener('resize', () => { if (!introComplete) sizeIntroCanvas(); });

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

        // Rapid fade starting at 60%
        if (t > 0.6) {
          const fadeT = (t - 0.6) / 0.1;
          introReveal.style.opacity = Math.max(0, 1 - fadeT);
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
          setTimeout(() => document.getElementById('navBrand')?.classList.add('nav-in'), 200);
          setTimeout(() => document.getElementById('navLink0')?.classList.add('nav-in'), 400);
          setTimeout(() => document.getElementById('navLink1')?.classList.add('nav-in'), 500);
          setTimeout(() => document.getElementById('navLink2')?.classList.add('nav-in'), 600);
          setTimeout(() => document.getElementById('navLink3')?.classList.add('nav-in'), 700);
          setTimeout(() => document.getElementById('navCta')?.classList.add('nav-in'), 500);
        }
      }
      requestAnimationFrame(animate);
    }

    /* ═══════════════════════════════════════
       LASER REVEAL — Vertical laser wipe
    ═══════════════════════════════════════ */
    function runLaserReveal(el, fromRight, duration, onDone) {
      if (!el || el.classList.contains('reveal-done')) return;

      el.classList.add('sweeping');
      const start = performance.now();

      function animate(now) {
        const t = Math.min((now - start) / duration, 1);
        // Smooth ease-in-out
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

        if (t < 1) {
          requestAnimationFrame(animate);
        } else {
          el.classList.remove('sweeping');
          el.classList.add('reveal-done');
          el.style.clipPath = 'inset(-20% 0 -20% 0)';
          if (onDone) onDone();
        }
      }
      requestAnimationFrame(animate);
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

      // Scan: left to right, green
      runLaserReveal(scan, false, 600, () => {
        // Track: right to left, red
        setTimeout(() => {
          runLaserReveal(track, true, 600, () => {
            // Progress: left to right, green
            setTimeout(() => {
              runLaserReveal(progress, false, 600, () => {
                // After all lasers done, animate hero elements in sequence
                revealHeroElement('heroBadge', 100);
                revealHeroElement('heroLogo', 300);
                revealHeroElement('heroSub', 600);
                revealHeroElement('heroActions', 800);
              });
            }, 120);
          });
        }, 120);
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
      const dpr = window.devicePixelRatio || 1;
      canvasW = Math.round(window.innerWidth * dpr);
      canvasH = Math.round(window.innerHeight * dpr);
      canvas.width = canvasW;
      canvas.height = canvasH;
      lastRenderedKey = '';
    }
    window.addEventListener('resize', sizeCanvas);
    sizeCanvas();

    // --- Load frames ---
    const BATCH_SIZE = 40;

    function loadFrame(index) {
      return new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
          frames[index] = img;
          loadedCount++;
          if (index === 0) drawSingle(0);
          // Start intro after first batch loads (don't wait for all 774 frames)
          if (loadedCount >= BATCH_SIZE || loadedCount === TOTAL_FRAMES) runIntroReveal();
          resolve();
        };
        img.onerror = () => { loadedCount++; if (loadedCount >= BATCH_SIZE || loadedCount === TOTAL_FRAMES) runIntroReveal(); resolve(); };
        img.src = framePaths[index];
      });
    }

    async function loadAll() {
      for (let i = 0; i < TOTAL_FRAMES; i += BATCH_SIZE) {
        const batch = [];
        for (let j = i; j < Math.min(i + BATCH_SIZE, TOTAL_FRAMES); j++) batch.push(loadFrame(j));
        await Promise.all(batch);
      }
    }
    loadAll();

    // Failsafe: if intro hasn't fired after 3s, force it
    setTimeout(() => {
      runIntroReveal();
      // Hard fallback: ensure content is visible no matter what
      setTimeout(() => {
        const hero = document.getElementById('heroContent');
        if (hero && !hero.classList.contains('revealed')) hero.classList.add('revealed');
        if (introReveal && !introReveal.classList.contains('done')) introReveal.classList.add('done');
      }, 2500);
    }, 3000);

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
      const burnDuration = 80; // ms each char stays green
      const stagger = 12; // ms between chars

      allChars.forEach((ch, i) => {
        setTimeout(() => {
          ch.classList.add('burn');
          setTimeout(() => {
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
            const origTexts = ['03', 'Log and move on.', 'Weight. Reps. Save. The fastest logging flow in fitness — so you stay in the zone.'];
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
      const origTexts = ['03', 'Log and move on.', 'Weight. Reps. Save. The fastest logging flow in fitness — so you stay in the zone.'];
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
        const fadeOut = isLast ? 0.75 : 0.85;

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

    // --- Tick ---
    function tick() {
      const scrollY = window.scrollY;
      const totalMax = document.documentElement.scrollHeight - window.innerHeight;
      const totalProgress = totalMax > 0 ? scrollY / totalMax : 0;

      // Global scroll progress bar
      scrollProgress.style.width = (totalProgress * 100) + '%';

      // Navbar background
      navbar.classList.toggle('scrolled', scrollY > 60);

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
          else s += scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        }
        el.textContent = s;
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
        el.textContent = el.dataset.final;
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

    hiwLogBtn.addEventListener('click', () => {
      if (hiwWeightEl.textContent === '85' && hiwRepsEl.textContent === '9') {
        hiwPREl.style.visibility = 'visible';
        hiwPREl.style.opacity = '1';
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
      // Dots
      const activeIdx = Math.min(2, Math.floor(p * 3));
      hiwDots.forEach((d, i) => d.classList.toggle('active', i === activeIdx));

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
      hiwScanCorners.style.transform = `translateX(${cornersOffset}px)`;
      hiwScanLine.style.transform = `translateX(${cornersOffset}px)`;
      hiwQRIcon.style.transform = `translateX(${qrOffset}px)`;

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
      const easedP = 1 - Math.pow(1 - chartP, 3);

      // Clip rect reveals both the line and gradient fill
      if (hiwChartClipRect) {
        hiwChartClipRect.setAttribute('width', String(easedP * 290));
      }
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
      } else if (hiwChartDot) {
        hiwChartDot.setAttribute('opacity', '0');
      }
      // Stats count up
      if (hiwStatStrength) hiwStatStrength.textContent = `+${Math.round(easedP * 32)}%`;
      if (hiwStatSessions) hiwStatSessions.textContent = String(Math.round(easedP * 24));
      if (hiwStatPRs) hiwStatPRs.textContent = String(Math.round(easedP * 7));
    }

    /* ═══════════════════════════════════════
       FEATURES — Reveal on scroll
    ═══════════════════════════════════════ */
    const featObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.2 });
    document.querySelectorAll('.feature-row').forEach(el => featObserver.observe(el));

    // Video timer countdown
    const videoTimer = document.getElementById('videoTimer');
    const timerParent = videoTimer.closest('.feature-row');
    let timerStarted = false;
    const timerObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !timerStarted) {
          timerStarted = true;
          let seconds = 42;
          const interval = setInterval(() => {
            seconds--;
            const m = Math.floor(seconds / 60);
            const s = seconds % 60;
            videoTimer.textContent = `${m}:${String(s).padStart(2, '0')}`;
            if (seconds <= 0) clearInterval(interval);
          }, 1000);
        }
      });
    }, { threshold: 0.3 });
    timerObserver.observe(timerParent);

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
          const idx = parseInt(e.target.dataset.dash);
          dashZones.forEach((z, i) => z.classList.toggle('active', i === idx));
          ownerBlocks.forEach(b => b.classList.toggle('active-block', parseInt(b.dataset.dash) === idx));
        }
      });
    }, { threshold: 0.15, rootMargin: '-30% 0px -30% 0px' });
    ownerBlocks.forEach(el => dashObserver.observe(el));

    /* ═══════════════════════════════════════
       ROADMAP — Scroll-Driven Timeline
    ═══════════════════════════════════════ */
    const roadmapTimeline = document.getElementById('roadmapTimeline');
    const roadmapLine = document.getElementById('roadmapLineActive');
    const rmItems = document.querySelectorAll('[data-rm]');

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
    }

    /* ═══════════════════════════════════════
       CTA — Fitness Label Particle System
    ═══════════════════════════════════════ */
    const ctaCanvas = document.getElementById('ctaCanvas') as HTMLCanvasElement;
    const ctaCtx = ctaCanvas.getContext('2d');
    let ctaParticles: any[] = [];
    let ctaActive = false;
    let ctaMouseX = -1, ctaMouseY = -1;

    // Labels with sentiment: true = positive (green), false = negative (red)
    const ctaLabels: [string, boolean][] = [
      ['PR!', true], ['PB!', true], ['NEW PR!', true], ['REP PR!', true],
      ['+5%', true], ['+8%', true], ['+12%', true], ['+3%', true], ['+15%', true], ['+20%', true],
      ['+5kg', true], ['+10kg', true], ['+2.5kg', true], ['+20kg', true],
      ['+10lb', true], ['+25lb', true], ['+5lb', true],
      ['↑ VOL', true], ['↑ STR', true], ['STREAK', true],
      ['-3kg', false], ['-5lb', false], ['-2%', false], ['-5%', false],
      ['MISSED', false], ['FAILED', false], ['-1 REP', false],
      ['3×8', true], ['5×5', true], ['4×12', true], ['1RM', true],
      ['7 DAYS', true], ['30 DAYS', true],
      ['100kg', true], ['225lb', true],
    ];

    const ctaGreen: [number, number, number] = [200, 255, 0];
    const ctaRed: [number, number, number] = [255, 45, 85];

    function initCTAParticles() {
      const w = ctaCanvas.width = ctaCanvas.parentElement.offsetWidth;
      const h = ctaCanvas.height = ctaCanvas.parentElement.offsetHeight;
      const count = window.innerWidth < 768 ? 60 : 150;
      ctaParticles = [];
      for (let i = 0; i < count; i++) {
        const [label, positive] = ctaLabels[Math.floor(Math.random() * ctaLabels.length)];
        const color = positive ? ctaGreen : ctaRed;
        const size = Math.random() * 3 + 5;
        ctaParticles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          label,
          color,
          size,
          baseAlpha: Math.random() * 0.25 + 0.08,
          alpha: 0,
          rotation: (Math.random() - 0.5) * 0.4,
          rotSpeed: (Math.random() - 0.5) * 0.003,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.02 + 0.01,
          hoverScale: 1,
        });
      }
    }

    function drawCTAParticles() {
      if (!ctaActive) return;
      const w = ctaCanvas.width, h = ctaCanvas.height;
      ctaCtx.clearRect(0, 0, w, h);
      const now = performance.now() * 0.001;

      for (const p of ctaParticles) {
        // Gentle floating drift using sine waves
        const t = now + p.pulsePhase;
        p.x += p.vx + Math.sin(t * p.pulseSpeed * 30) * 0.15;
        p.y += p.vy + Math.cos(t * p.pulseSpeed * 20) * 0.12;
        p.rotation += p.rotSpeed + Math.sin(t * 0.5 + p.pulsePhase) * 0.002;
        if (p.x < -50) p.x = w + 50; if (p.x > w + 50) p.x = -50;
        if (p.y < -20) p.y = h + 20; if (p.y > h + 20) p.y = -20;

        // Pulse alpha
        const pulse = Math.sin(t * p.pulseSpeed * 60) * 0.5 + 0.5;
        p.alpha = p.baseAlpha * (0.6 + pulse * 0.4);

        // Gentle mouse repulsion
        if (ctaMouseX > 0) {
          const dx = p.x - ctaMouseX, dy = p.y - ctaMouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const force = (120 - dist) / 120 * 0.25;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        // Damping — high so they stay floaty, not flung
        p.vx *= 0.96; p.vy *= 0.96;

        // Scale spring
        p.hoverScale += (1 - p.hoverScale) * 0.1;

        // Draw
        ctaCtx.save();
        ctaCtx.translate(p.x, p.y);
        ctaCtx.rotate(p.rotation);
        ctaCtx.scale(p.hoverScale, p.hoverScale);

        const [r, g, b] = p.color;
        const a = p.alpha;

        ctaCtx.font = `800 ${p.size}px 'JetBrains Mono', monospace`;
        ctaCtx.textAlign = 'center';
        ctaCtx.textBaseline = 'middle';

        // Glow for bright particles
        if (a > 0.3) {
          ctaCtx.shadowColor = `rgba(${r},${g},${b},${a * 0.6})`;
          ctaCtx.shadowBlur = 12;
        }

        ctaCtx.fillStyle = `rgba(${r},${g},${b},${a})`;
        ctaCtx.fillText(p.label, 0, 0);
        ctaCtx.restore();
      }

      // Connection lines between nearby same-color particles
      ctaCtx.lineWidth = 0.5;
      for (let i = 0; i < ctaParticles.length; i++) {
        for (let j = i + 1; j < ctaParticles.length; j++) {
          const a = ctaParticles[i], b = ctaParticles[j];
          if (a.color !== b.color) continue;
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 70) {
            const lineA = (1 - dist / 70) * 0.06 * Math.min(a.alpha, b.alpha) * 4;
            ctaCtx.strokeStyle = `rgba(${a.color[0]},${a.color[1]},${a.color[2]},${lineA})`;
            ctaCtx.beginPath();
            ctaCtx.moveTo(a.x, a.y);
            ctaCtx.lineTo(b.x, b.y);
            ctaCtx.stroke();
          }
        }
      }
      requestAnimationFrame(drawCTAParticles);
    }

    const ctaSection = document.getElementById('cta');
    const ctaObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !ctaActive) {
          ctaActive = true;
          initCTAParticles();
          drawCTAParticles();
        } else if (!e.isIntersecting) {
          ctaActive = false;
        }
      });
    }, { threshold: 0.1 });
    ctaObserver.observe(ctaSection);

    ctaSection.addEventListener('mousemove', (e) => {
      const rect = ctaSection.getBoundingClientRect();
      ctaMouseX = e.clientX - rect.left;
      ctaMouseY = e.clientY - rect.top;
    });
    ctaSection.addEventListener('mouseleave', () => { ctaMouseX = -1; });

    window.addEventListener('resize', () => { if (ctaActive) initCTAParticles(); });

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

    /* ═══════════════════════════════════════
       UNIFIED SCROLL UPDATES
    ═══════════════════════════════════════ */
    function scrollUpdates() {
      updateHIW();
      updateRoadmap();
      updateDashMomentum();
      requestAnimationFrame(scrollUpdates);
    }
    requestAnimationFrame(scrollUpdates);


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
          <div className="nav-logo"><img src="logo.png" alt="Liftio" /></div>
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
        <div className="hero-badge hero-element" id="heroBadge">
          <span className="hero-badge-dot"></span>
          Now in early access
        </div>
        <div className="hero-logo-icon hero-element" id="heroLogo"><img src="logo.png" alt="Liftio" /></div>
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
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            Get Started
          </a>
          <a href="#how" className="btn-secondary">See How It Works</a>
        </div>
      </div>


      {/* Scrollytelling runway */}
      <div className="scroll-runway" id="scrollRunway">
        <div className="scroll-content">
          <section className="scene-section" data-scene="0">
            <div className="scene-text" id="text0">
              <div className="scene-number">01</div>
              <h2 className="scene-heading">Walk up. Scan the code.</h2>
              <p className="scene-desc">Every machine in your gym has a Liftio QR code. One scan and you're tracking — no
                searching, no setup.</p>
            </div>
          </section>
          <section className="scene-section" data-scene="1">
            <div className="scene-text" id="text1">
              <div className="scene-number">02</div>
              <h2 className="scene-heading scramble-text" data-final="See your history. Beat it."></h2>
              <p className="scene-desc scramble-text"
                data-final="Instantly see your last performance, personal bests, and projected targets. Progressive overload, automated.">
              </p>
            </div>
          </section>
          <section className="scene-section" data-scene="2" style={{ 'height': '300vh' }}>
            <div className="scene-text" id="text2">
              <div className="scene-number">03</div>
              <h2 className="scene-heading">Log and move on.</h2>
              <p className="scene-desc">Weight. Reps. Save. The fastest logging flow in fitness — so you stay in the zone.</p>
            </div>
          </section>
        </div>
      </div>

      {/* Transition */}
      <div className="section-transition"></div>

      {/* ═══ HOW IT WORKS — Horizontal Scroll ═══ */}
      <section className="section hiw-section" id="how">
        <div className="hiw-sticky">
          <div className="hiw-header">
            <div className="section-label">How It Works</div>
          </div>
          <div className="hiw-track" id="hiwTrack">
            {/* Panel 1: Animated QR scan */}
            <div className="hiw-panel">
              <div className="hiw-panel-number">01</div>
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
            {/* Panel 2: Live set logging UI */}
            <div className="hiw-panel">
              <div className="hiw-panel-number">02</div>
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
                  <div className="hiw-log-btn" id="hiwLogBtn" style={{ 'cursor': 'pointer' }}>LOG SET</div>
                  <div className="hiw-log-pb" id="hiwPR" style={{ 'visibility': 'hidden', 'opacity': '0', 'transition': 'opacity 0.4s ease, visibility 0.4s ease' }}>NEW PR! <span style={{ 'color': 'var(--accent)' }}>+5kg</span></div>
                </div>
              </div>
              <h3 className="hiw-panel-title">Track Your Sets</h3>
              <p className="hiw-panel-desc">Enter weight and reps. See your previous performance, personal bests, and projected
                targets.</p>
              <div className="hiw-panel-line"></div>
            </div>
            {/* Panel 3: Progress chart */}
            <div className="hiw-panel">
              <div className="hiw-panel-number">03</div>
              <div className="hiw-panel-visual">
                <div className="hiw-chart-card">
                  <div className="hiw-chart-title">Bench Press — 12 weeks</div>
                  <svg className="hiw-chart-svg" viewBox="-5 -5 290 130" fill="none">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                      </linearGradient>
                      <clipPath id="chartClip">
                        <rect id="hiwChartClipRect" x="-5" y="-5" width="0" height="130" />
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
          {/* red scrollbar removed */}
          <div className="hiw-dots" id="hiwDots">
            <div className="hiw-dot active"></div>
            <div className="hiw-dot"></div>
            <div className="hiw-dot"></div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES — Alternating Rows ═══ */}
      <section className="section features-section" id="features">
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
            <h3 className="feature-title">Your previous sets, PBs, and projected targets — the moment you scan.</h3>
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
                strokeLinecap="round" opacity="0.7">
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
            </div>
            <div className="owner-feature-block reveal" data-dash="1">
              <div className="feature-number">QR CODE GENERATION</div>
              <h3 className="feature-title">Generate unique QR PDFs to print and stick, or link pre-printed stickers.</h3>
              <p className="feature-desc">Scan or input a physical sticker's ID and link it to the digital machine profile.
                Flexible for any gym setup.</p>
            </div>
            <div className="owner-feature-block reveal" data-dash="2">
              <div className="feature-number">USAGE ANALYTICS</div>
              <h3 className="feature-title">See which machines get the most scans, peak hours, and equipment trends.</h3>
              <p className="feature-desc">Data-driven decisions for your facility — know what equipment your members actually
                use.</p>
            </div>
            <div className="owner-feature-block reveal" data-dash="3">
              <div className="feature-number">PREMIUM EXPERIENCE</div>
              <h3 className="feature-title">Stand out from every other gym with a smart, branded workout experience.</h3>
              <p className="feature-desc">Your members get intelligent tracking that keeps them coming back. Retention through
                innovation.</p>
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
                <p className="rm-desc">QR scan-to-track loop, automatic sessions, progressive overload display, instructional
                  videos, gym owner portal.</p>
              </div>
            </div>
            <div className="rm-item future" data-rm>
              <div className="rm-node"></div>
              <div>
                <div className="rm-version">V2 — DISCOVERY</div>
                <h3 className="rm-title">Gym Discovery & Analytics</h3>
                <p className="rm-desc">Interactive gym map for users. Equipment usage analytics dashboards for gym owners.</p>
              </div>
            </div>
            <div className="rm-item future" data-rm>
              <div className="rm-node"></div>
              <div>
                <div className="rm-version">V3 — TRAINERS</div>
                <h3 className="rm-title">Trainer Integration</h3>
                <p className="rm-desc">Trainer profiles, client progress monitoring, offline mode with background sync.</p>
              </div>
            </div>
            <div className="rm-item future" data-rm>
              <div className="rm-node"></div>
              <div>
                <div className="rm-version">V4 — AI</div>
                <h3 className="rm-title">Smart Insights</h3>
                <p className="rm-desc">AI plateau detection, rest optimization, context-aware coaching chatbot.</p>
              </div>
            </div>
            <div className="rm-item future" data-rm>
              <div className="rm-node"></div>
              <div>
                <div className="rm-version">V5 — COMMUNITY</div>
                <h3 className="rm-title">Social Ecosystem</h3>
                <p className="rm-desc">Gym reviews, user-generated content, trainer discovery marketplace.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA — Particle Background ═══ */}
      <section className="section cta-section" id="cta">
        <div className="cta-canvas"><canvas id="ctaCanvas"></canvas></div>
        <div className="cta-content">
          <div className="cta-logo reveal"><img src="logo.png" alt="Liftio" /></div>
          <h2 className="cta-title reveal reveal-delay-1">Ready to track<br />like you train?</h2>
          <p className="cta-desc reveal reveal-delay-2">Join the early access waitlist. Be first to bring Liftio to your gym.
          </p>
          <div className="hero-actions reveal reveal-delay-3">
            <a href="#" className="btn-primary btn-primary-glow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              Get Early Access
            </a>
            <a href="#" className="btn-secondary">Contact Us</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo"><img src="logo.png" alt="Liftio" /></div>
            <span className="footer-name">Liftio</span>
          </div>
          <span className="footer-copy">© 2026 Liftio. All rights reserved.</span>
        </div>
      </footer>

    </>
  );
}
