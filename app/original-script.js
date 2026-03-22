    (() => {
      'use strict';

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
            // Trigger scan-reveal animation
            setTimeout(runScanReveal, 400);
          }

          if (elapsed < duration) {
            requestAnimationFrame(animate);
          } else {
            introReveal.classList.add('done');
            introComplete = true;
          }
        }
        requestAnimationFrame(animate);
      }

      /* ═══════════════════════════════════════
         SCAN REVEAL — "Scan." text effect
      ═══════════════════════════════════════ */
      function runScanReveal() {
        const el = document.querySelector('.scan-reveal');
        if (!el || el.classList.contains('scan-done')) return;

        el.classList.add('scanning');
        const duration = 1100;
        const start = performance.now();

        function animate(now) {
          const t = Math.min((now - start) / duration, 1);
          // Smooth ease-in-out
          const eased = t < 0.5
            ? 2 * t * t
            : 1 - Math.pow(-2 * t + 2, 2) / 2;
          const pos = eased * 110;
          // Reveal text from top down via clip-path
          el.style.clipPath = `inset(0 0 ${100 - Math.min(pos, 100)}% 0)`;
          // Move the scan line
          el.style.setProperty('--scan-pos', pos + '%');

          if (t < 1) {
            requestAnimationFrame(animate);
          } else {
            el.classList.remove('scanning');
            el.classList.add('scan-done');
            el.style.clipPath = '';
            // Chain: trigger Track scramble after Scan completes
            setTimeout(runTrackReveal, 200);
          }
        }
        requestAnimationFrame(animate);
      }

      /* ═══════════════════════════════════════
         PROGRESS REVEAL — Expand from center
      ═══════════════════════════════════════ */
      function runProgressReveal() {
        const el = document.querySelector('.progress-reveal');
        const mask = el.querySelector('.prog-mask');
        if (!el || el.classList.contains('expand-done')) return;

        const dur1 = 600;  // rectangle expands
        const dur2 = 500;  // text reveals behind it, rectangle fades
        const start = performance.now();

        function animate(now) {
          const elapsed = now - start;

          if (elapsed < dur1) {
            // Phase 1: underline sweeps in
            const t = elapsed / dur1;
            const eased = 1 - Math.pow(1 - t, 3);
            mask.style.width = (eased * 100) + '%';
          } else if (elapsed < dur1 + 50) {
            // Brief pause at full line
            mask.style.width = '100%';
          } else if (!el.classList.contains('text-up')) {
            // Phase 2: text jumps up from below the line
            el.classList.add('text-up');
            // Fade out line after text lands
            setTimeout(() => {
              el.classList.add('expand-done');
              mask.style.transition = 'opacity 0.5s ease';
              mask.style.opacity = '0';
            }, 500);
            return;
          }
          requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
      }

      /* ═══════════════════════════════════════
         TRACK REVEAL — Scramble/ticker effect
      ═══════════════════════════════════════ */
      function runTrackReveal() {
        const el = document.querySelector('.track-reveal');
        if (!el || el.classList.contains('resolved')) return;

        const target = el.dataset.text;
        let i = 0;
        el.textContent = '';

        const interval = setInterval(() => {
          i++;
          el.textContent = target.slice(0, i);
          if (i >= target.length) {
            clearInterval(interval);
            el.classList.add('resolved');
            setTimeout(runProgressReveal, 80);
          }
        }, 100);
      }

      /* ═══════════════════════════════════════
         FRAME-BASED SCROLLYTELLING
      ═══════════════════════════════════════ */
      const TOTAL_FRAMES = 774;
      const SCENE_COUNT = 3;
      const LERP_SPEED = 0.15;

      const framePaths = [];
      for (let f = 1; f <= TOTAL_FRAMES; f++) {
        framePaths.push(`frames/f_${String(f).padStart(4, '0')}.jpg`);
      }

      const canvas = document.getElementById('frameCanvas');
      const ctx = canvas.getContext('2d', { alpha: false });
      const scrollProgress = document.getElementById('scrollProgress');
      const heroContent = document.getElementById('heroContent');
      const navbar = document.getElementById('navbar');
      const canvasViewport = document.getElementById('canvasViewport');
      const phoneMockup = document.getElementById('phoneMockup');
      const phoneInner = document.getElementById('phoneInner');
      const frameCanvasEl = document.getElementById('frameCanvas');

      phoneMockup.addEventListener('mouseenter', () => {
        frameCanvasEl.style.filter = 'blur(12px) brightness(0.7)';
      });
      phoneMockup.addEventListener('mouseleave', () => {
        frameCanvasEl.style.filter = 'none';
      });
      const phoneGlow = document.getElementById('phoneGlow');
      let mouseX = 0.5, mouseY = 0.5;
      let phoneProgress = 0; // lerped scroll progress for phone

      document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX / window.innerWidth;
        mouseY = e.clientY / window.innerHeight;
        // 3D tilt
        const tiltX = (mouseY - 0.5) * -20;
        const tiltY = (mouseX - 0.5) * 20;
        phoneInner.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        // Glow follows cursor — hotspot shifts toward cursor
        phoneGlow.style.setProperty('--glow-x', (mouseX * 100) + '%');
        phoneGlow.style.setProperty('--glow-y', (mouseY * 100) + '%');
        // Intensify blur when cursor is near center
        const dist = Math.sqrt((mouseX - 0.5) ** 2 + (mouseY - 0.5) ** 2);
        const blur = 12 + (1 - dist * 2) * 10;
        phoneGlow.style.filter = `blur(${Math.max(8, blur)}px)`;
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
            if (loadedCount === TOTAL_FRAMES) runIntroReveal();
            resolve();
          };
          img.onerror = () => { loadedCount++; resolve(); };
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
      function updateTexts(progress) {
        const sp = progress * SCENE_COUNT;
        sceneTexts.forEach((el, i) => {
          const lp = sp - i;
          const isLast = (i === SCENE_COUNT - 1);
          const fadeIn = isLast ? 0.35 : (i === 1 ? 0.35 : 0.15);
          const fadeOut = isLast ? 1.0 : 0.85;
          if (lp >= fadeIn && lp <= fadeOut) {
            el.classList.add('visible');
            el.classList.remove('exiting');
          } else if (!isLast && lp > fadeOut && lp <= 1.0) {
            el.classList.remove('visible');
            el.classList.add('exiting');
          } else {
            el.classList.remove('visible', 'exiting');
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

            phoneMockup.style.transform = `translateY(calc(-50% + ${ty}vh)) rotate(${rot}deg)`;
            phoneMockup.style.opacity = opacity;
          } else {
            phoneMockup.style.transform = 'translateY(120vh)';
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
            resolveScramble(desc, 1000);
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

      function updateHIW() {
        const rect = hiwSection.getBoundingClientRect();
        const sectionTop = -rect.top;
        const sectionH = rect.height - window.innerHeight;
        if (sectionH <= 0) return;
        const p = Math.max(0, Math.min(1, sectionTop / sectionH));
        hiwTrack.style.transform = `translateX(-${p * 66.667}%)`;
        // Red scrollbar thumb
        const trackH = redScrollbar.offsetHeight - 60;
        redThumb.style.top = (p * trackH) + 'px';
        // Dots
        const activeIdx = Math.min(2, Math.floor(p * 3));
        hiwDots.forEach((d, i) => d.classList.toggle('active', i === activeIdx));
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
         CTA — Particle System
      ═══════════════════════════════════════ */
      const ctaCanvas = document.getElementById('ctaCanvas');
      const ctaCtx = ctaCanvas.getContext('2d');
      let ctaParticles = [];
      let ctaActive = false;
      let ctaMouseX = -1, ctaMouseY = -1;

      function initCTAParticles() {
        const w = ctaCanvas.width = ctaCanvas.parentElement.offsetWidth;
        const h = ctaCanvas.height = ctaCanvas.parentElement.offsetHeight;
        const count = window.innerWidth < 768 ? 50 : 120;
        ctaParticles = [];
        for (let i = 0; i < count; i++) {
          ctaParticles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            r: Math.random() * 1.5 + 0.5,
            a: Math.random() * 0.2 + 0.1
          });
        }
      }

      function drawCTAParticles() {
        if (!ctaActive) return;
        const w = ctaCanvas.width, h = ctaCanvas.height;
        ctaCtx.clearRect(0, 0, w, h);

        for (const p of ctaParticles) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;

          // Mouse repulsion
          if (ctaMouseX > 0) {
            const dx = p.x - ctaMouseX, dy = p.y - ctaMouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              const force = (120 - dist) / 120 * 0.8;
              p.x += (dx / dist) * force;
              p.y += (dy / dist) * force;
            }
          }

          ctaCtx.beginPath();
          ctaCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctaCtx.fillStyle = `rgba(200,255,0,${p.a})`;
          ctaCtx.fill();
        }

        // Connections
        ctaCtx.strokeStyle = 'rgba(200,255,0,0.04)';
        ctaCtx.lineWidth = 0.5;
        for (let i = 0; i < ctaParticles.length; i++) {
          for (let j = i + 1; j < ctaParticles.length; j++) {
            const dx = ctaParticles[i].x - ctaParticles[j].x;
            const dy = ctaParticles[i].y - ctaParticles[j].y;
            if (Math.abs(dx) < 80 && Math.abs(dy) < 80) {
              ctaCtx.beginPath();
              ctaCtx.moveTo(ctaParticles[i].x, ctaParticles[i].y);
              ctaCtx.lineTo(ctaParticles[j].x, ctaParticles[j].y);
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

    })();
