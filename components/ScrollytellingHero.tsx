'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const TOTAL_FRAMES = 774;
const BATCH_SIZE = 40;
const LERP_SPEED = 0.15;
const FRAME_PATH_PREFIX = '/frames/f_';

// Scroll runway & scene configuration
const RUNWAY_HEIGHT_VH = 700;
const SCENE_1_HEIGHT_VH = 200;
const SCENE_2_HEIGHT_VH = 200;
const SCENE_3_HEIGHT_VH = 300;

// Scene 1 text effect timings (within scene progress 0..1)
const SCAN_REVEAL_START = 0.0;
const SCAN_REVEAL_END = 0.35;
const TRACK_TYPE_START = 0.25;
const TRACK_TYPE_END = 0.55;
const PROGRESS_ANIM_START = 0.45;
const PROGRESS_ANIM_END = 0.75;

// Scene 2 scramble
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
const SCRAMBLE_RESOLVE_THRESHOLD = 0.45;

// Phone mockup
const PHONE_APPEAR_START = 0.60;
const PHONE_APPEAR_END = 0.80;

/* ------------------------------------------------------------------ */
/*  Utility: pad frame number to 4 digits                              */
/* ------------------------------------------------------------------ */
function padFrame(n: number): string {
  return n.toString().padStart(4, '0');
}

/* ------------------------------------------------------------------ */
/*  CSS keyframe animations (to be exported for globals.css)           */
/* ------------------------------------------------------------------ */
export const scrollytellingCSS = `
/* Scan reveal red neon line */
@keyframes scanLine {
  0% { clip-path: inset(0 0 100% 0); }
  100% { clip-path: inset(0 0 0% 0); }
}

/* Typewriter cursor blink (scrollytelling inline spans) */
@keyframes scrollyCursorBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* Progress text underline sweep */
@keyframes underlineSweep {
  0% { transform: scaleX(0); transform-origin: left; }
  100% { transform: scaleX(1); transform-origin: left; }
}

/* Progress text jump up */
@keyframes jumpUp {
  0% { transform: translateY(40px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

/* Hero content reveal */
.hero-content-hidden {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}
.hero-content-hidden.revealed {
  opacity: 1;
  transform: translateY(0);
}

/* Phone mockup neon glow */
@keyframes phoneGlow {
  0%, 100% { box-shadow: 0 0 30px 5px rgba(200, 255, 0, 0.3); }
  50% { box-shadow: 0 0 60px 15px rgba(200, 255, 0, 0.5); }
}
`;

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */
interface ScrollytellingHeroProps {
  onFramesLoaded: () => void;
  introComplete?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
const ScrollytellingHero: React.FC<ScrollytellingHeroProps> = ({ onFramesLoaded }) => {
  // Refs for canvas and DOM elements
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runwayRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const videoOverlayRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Scene text refs
  const scanTextRef = useRef<HTMLDivElement>(null);
  const trackTextRef = useRef<HTMLDivElement>(null);
  const progressTextRef = useRef<HTMLDivElement>(null);
  const scene2TextRef = useRef<HTMLDivElement>(null);

  // Phone mockup ref
  const phoneMockupRef = useRef<HTMLDivElement>(null);

  // Frame loading state
  const framesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const loadedCountRef = useRef(0);
  const [framesLoaded, setFramesLoaded] = useState(false);

  // Animation state refs
  const currentFrameRef = useRef(0);
  const displayFrameRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const isRunwayVisibleRef = useRef(true);

  // Track text typewriter state
  const trackRevealedRef = useRef(0);
  const trackFullText = 'Track.';

  // Scene 2 scramble state
  const scene2TargetText = 'YOUR FITNESS JOURNEY';
  const scene2ResolvedRef = useRef('');

  // Hero revealed
  const heroRevealedRef = useRef(false);

  /* ---------------------------------------------------------------- */
  /*  Load frames in batches                                           */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    let cancelled = false;

    const loadBatch = async (startIdx: number) => {
      if (cancelled) return;

      const promises: Promise<void>[] = [];
      const end = Math.min(startIdx + BATCH_SIZE, TOTAL_FRAMES);

      for (let i = startIdx; i < end; i++) {
        const frameNum = i + 1; // frames are 1-indexed
        const src = `${FRAME_PATH_PREFIX}${padFrame(frameNum)}.jpg`;

        const p = new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            if (!cancelled) {
              framesRef.current[i] = img;
              loadedCountRef.current++;
            }
            resolve();
          };
          img.onerror = () => {
            resolve(); // skip failed frames
          };
          img.src = src;
        });
        promises.push(p);
      }

      await Promise.all(promises);

      if (!cancelled && end < TOTAL_FRAMES) {
        loadBatch(end);
      } else if (!cancelled && loadedCountRef.current > 0) {
        setFramesLoaded(true);
        onFramesLoaded();
      }
    };

    loadBatch(0);

    return () => {
      cancelled = true;
    };
  }, [onFramesLoaded]);

  /* ---------------------------------------------------------------- */
  /*  Canvas resize handler                                            */
  /* ---------------------------------------------------------------- */
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  /* ---------------------------------------------------------------- */
  /*  Draw a frame onto the canvas with cover-fit                      */
  /* ---------------------------------------------------------------- */
  const drawImageCover = useCallback((ctx: CanvasRenderingContext2D, img: HTMLImageElement, alpha: number = 1) => {
    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio || 1;
    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    if (iw === 0 || ih === 0) return;

    // Cover-fit calculation
    const canvasAspect = cw / ch;
    const imgAspect = iw / ih;

    let sx = 0, sy = 0, sw = iw, sh = ih;

    if (imgAspect > canvasAspect) {
      // Image is wider: crop sides
      sw = ih * canvasAspect;
      sx = (iw - sw) / 2;
    } else {
      // Image is taller: crop top/bottom
      sh = iw / canvasAspect;
      sy = (ih - sh) / 2;
    }

    if (alpha < 1) {
      ctx.globalAlpha = alpha;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
    if (alpha < 1) {
      ctx.globalAlpha = 1;
    }
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Compute scene progress values from runway scroll                 */
  /* ---------------------------------------------------------------- */
  const computeSceneProgress = useCallback((runwayProgress: number) => {
    const totalVH = RUNWAY_HEIGHT_VH;
    const s1End = SCENE_1_HEIGHT_VH / totalVH;
    const s2End = (SCENE_1_HEIGHT_VH + SCENE_2_HEIGHT_VH) / totalVH;
    const s3End = (SCENE_1_HEIGHT_VH + SCENE_2_HEIGHT_VH + SCENE_3_HEIGHT_VH) / totalVH;

    let scene1P = 0, scene2P = 0, scene3P = 0;

    if (runwayProgress <= s1End) {
      scene1P = runwayProgress / s1End;
    } else if (runwayProgress <= s2End) {
      scene1P = 1;
      scene2P = (runwayProgress - s1End) / (s2End - s1End);
    } else if (runwayProgress <= s3End) {
      scene1P = 1;
      scene2P = 1;
      scene3P = (runwayProgress - s2End) / (s3End - s2End);
    } else {
      scene1P = 1;
      scene2P = 1;
      scene3P = 1;
    }

    return { scene1P, scene2P, scene3P, runwayP: runwayProgress };
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Update scene text overlays                                       */
  /* ---------------------------------------------------------------- */
  const updateSceneTexts = useCallback((scene1P: number, scene2P: number, scene3P: number, runwayP: number) => {
    // --- Scene 1: "Scan." with scan-reveal effect ---
    if (scanTextRef.current) {
      const scanVisible = scene1P > 0 && scene1P < 1;
      scanTextRef.current.style.opacity = scanVisible ? '1' : '0';
      scanTextRef.current.style.pointerEvents = scanVisible ? 'auto' : 'none';

      if (scanVisible) {
        const scanT = Math.min(Math.max((scene1P - SCAN_REVEAL_START) / (SCAN_REVEAL_END - SCAN_REVEAL_START), 0), 1);
        // Red neon line sweeps top-to-bottom via clip-path
        const clipBottom = 100 - scanT * 100;
        scanTextRef.current.style.clipPath = `inset(0 0 ${clipBottom}% 0)`;
      }
    }

    // --- Scene 1: "Track." with typewriter effect ---
    if (trackTextRef.current) {
      const trackVisible = scene1P > 0 && scene1P < 1;
      trackTextRef.current.style.opacity = trackVisible ? '1' : '0';

      if (trackVisible) {
        const typeT = Math.min(Math.max((scene1P - TRACK_TYPE_START) / (TRACK_TYPE_END - TRACK_TYPE_START), 0), 1);
        const charsToShow = Math.floor(typeT * trackFullText.length);

        if (charsToShow !== trackRevealedRef.current) {
          trackRevealedRef.current = charsToShow;
          const displayed = trackFullText.substring(0, charsToShow);
          const cursorSpan = '<span class="inline-block w-[3px] h-[1em] bg-[#c8ff00] ml-[2px]" style="animation: scrollyCursorBlink 0.7s step-end infinite"></span>';
          trackTextRef.current.innerHTML = displayed + (typeT < 1 ? cursorSpan : '');
        }
      }
    }

    // --- Scene 1: "Progress." with underline sweep + jump up ---
    if (progressTextRef.current) {
      const progVisible = scene1P > 0 && scene1P < 1;
      progressTextRef.current.style.opacity = progVisible ? '1' : '0';

      if (progVisible) {
        const progT = Math.min(Math.max((scene1P - PROGRESS_ANIM_START) / (PROGRESS_ANIM_END - PROGRESS_ANIM_START), 0), 1);
        // Jump up from below
        const translateY = (1 - progT) * 40;
        progressTextRef.current.style.transform = `translateY(${translateY}px)`;
        progressTextRef.current.style.opacity = progT > 0 ? String(progT) : '0';

        // Underline sweep
        const underline = progressTextRef.current.querySelector('.progress-underline') as HTMLElement;
        if (underline) {
          underline.style.transform = `scaleX(${progT})`;
        }
      }
    }

    // --- Scene 2: Scramble text effect ---
    if (scene2TextRef.current) {
      const scene2Visible = scene2P > 0 && scene2P < 1;
      scene2TextRef.current.style.opacity = scene2Visible ? '1' : '0';

      if (scene2Visible) {
        let result = '';
        for (let i = 0; i < scene2TargetText.length; i++) {
          if (scene2TargetText[i] === ' ') {
            result += ' ';
          } else if (scene2P >= SCRAMBLE_RESOLVE_THRESHOLD) {
            // Resolve characters progressively after threshold
            const resolveProgress = (scene2P - SCRAMBLE_RESOLVE_THRESHOLD) / (1 - SCRAMBLE_RESOLVE_THRESHOLD);
            const charThreshold = i / scene2TargetText.length;
            if (resolveProgress >= charThreshold) {
              result += scene2TargetText[i];
            } else {
              result += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
            }
          } else {
            result += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          }
        }
        scene2ResolvedRef.current = result;
        scene2TextRef.current.textContent = result;
      }
    }

    // --- Phone mockup ---
    if (phoneMockupRef.current) {
      const phoneVisible = runwayP >= PHONE_APPEAR_START && runwayP <= PHONE_APPEAR_END;
      phoneMockupRef.current.style.opacity = phoneVisible ? '1' : '0';
      phoneMockupRef.current.style.pointerEvents = phoneVisible ? 'auto' : 'none';

      if (phoneVisible) {
        const phoneT = (runwayP - PHONE_APPEAR_START) / (PHONE_APPEAR_END - PHONE_APPEAR_START);
        // 3D tilt with lerped momentum
        const tiltX = Math.sin(phoneT * Math.PI) * 15;
        const tiltY = Math.cos(phoneT * Math.PI * 0.5) * 10;
        const scale = 0.8 + phoneT * 0.2;
        phoneMockupRef.current.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scale})`;
      }
    }

    // --- Hero content reveal ---
    if (heroContentRef.current && !heroRevealedRef.current && scene3P > 0.1) {
      heroRevealedRef.current = true;
      heroContentRef.current.classList.add('revealed');
    }
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Main animation loop                                              */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    let running = true;

    const tick = () => {
      if (!running) return;

      const runway = runwayRef.current;
      const canvas = canvasRef.current;

      if (runway && canvas) {
        const rect = runway.getBoundingClientRect();
        const runwayTop = -rect.top;
        const runwayHeight = rect.height - window.innerHeight;
        const runwayProgress = Math.min(Math.max(runwayTop / runwayHeight, 0), 1);

        // Determine if runway is in view
        const pastRunway = rect.bottom < 0;
        const beforeRunway = rect.top > window.innerHeight;
        isRunwayVisibleRef.current = !pastRunway && !beforeRunway;

        // Hide canvas and overlay when scrolled past runway
        if (canvasContainerRef.current) {
          canvasContainerRef.current.style.display = isRunwayVisibleRef.current ? 'block' : 'none';
        }
        if (videoOverlayRef.current) {
          videoOverlayRef.current.style.display = isRunwayVisibleRef.current ? 'block' : 'none';
        }

        if (isRunwayVisibleRef.current) {
          // Target frame from scroll position
          const targetFrame = runwayProgress * (TOTAL_FRAMES - 1);
          currentFrameRef.current = targetFrame;

          // Lerp display frame toward target
          displayFrameRef.current += (targetFrame - displayFrameRef.current) * LERP_SPEED;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            const dpr = window.devicePixelRatio || 1;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const floorFrame = Math.floor(displayFrameRef.current);
            const ceilFrame = Math.min(floorFrame + 1, TOTAL_FRAMES - 1);
            const blend = displayFrameRef.current - floorFrame;

            // Draw floor frame
            const frameA = framesRef.current[floorFrame];
            if (frameA) {
              drawImageCover(ctx, frameA, 1);
            }

            // Cross-blend with ceil frame (sub-frame blending)
            if (blend > 0.01) {
              const frameB = framesRef.current[ceilFrame];
              if (frameB) {
                drawImageCover(ctx, frameB, blend);
              }
            }
          }

          // Update scene text overlays
          const { scene1P, scene2P, scene3P, runwayP } = computeSceneProgress(runwayProgress);
          updateSceneTexts(scene1P, scene2P, scene3P, runwayP);
        }
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      running = false;
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [drawImageCover, computeSceneProgress, updateSceneTexts]);

  return (
    <>
      {/* Scroll runway - this is the tall scrollable area */}
      <div
        ref={runwayRef}
        className="relative w-full"
        style={{ height: `${RUNWAY_HEIGHT_VH}vh` }}
      >
        {/* Sticky canvas container - viewport-locked */}
        <div
          ref={canvasContainerRef}
          className="sticky top-0 left-0 w-full h-screen overflow-hidden"
          style={{ zIndex: 1 }}
        >
          {/* Frame canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0"
            style={{ display: 'block' }}
          />

          {/* Video overlay gradient */}
          <div
            ref={videoOverlayRef}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.6) 100%)',
              zIndex: 2,
            }}
          />

          {/* Scene 1 text overlays */}
          {/* "Scan." - red neon line scan-reveal effect */}
          <div
            ref={scanTextRef}
            className="absolute left-[6%] sm:left-[10%] top-[20%] text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-wider"
            style={{
              opacity: 0,
              color: '#ff2020',
              textShadow: '0 0 20px rgba(255,32,32,0.8), 0 0 40px rgba(255,32,32,0.4)',
              clipPath: 'inset(0 0 100% 0)',
              zIndex: 10,
              fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
            }}
          >
            Scan.
            {/* Red neon scan line */}
            <div
              className="absolute left-0 right-0 h-[3px]"
              style={{
                background: 'linear-gradient(90deg, transparent, #ff2020, transparent)',
                boxShadow: '0 0 15px 3px rgba(255,32,32,0.6)',
                bottom: '0',
              }}
            />
          </div>

          {/* "Track." - typewriter with green cursor */}
          <div
            ref={trackTextRef}
            className="absolute left-[6%] sm:left-[10%] top-[40%] text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-wider"
            style={{
              opacity: 0,
              color: '#ffffff',
              textShadow: '0 0 10px rgba(255,255,255,0.3)',
              zIndex: 10,
              fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
            }}
          />

          {/* "Progress." - underline sweep + jump up */}
          <div
            ref={progressTextRef}
            className="absolute left-[6%] sm:left-[10%] top-[60%] text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-wider"
            style={{
              opacity: 0,
              color: '#c8ff00',
              textShadow: '0 0 20px rgba(200,255,0,0.5), 0 0 40px rgba(200,255,0,0.2)',
              zIndex: 10,
              transform: 'translateY(40px)',
              fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
            }}
          >
            Progress.
            {/* Underline sweep element */}
            <div
              className="progress-underline absolute bottom-[-4px] left-0 w-full h-[4px]"
              style={{
                background: '#c8ff00',
                boxShadow: '0 0 10px rgba(200,255,0,0.6)',
                transform: 'scaleX(0)',
                transformOrigin: 'left',
                transition: 'none',
              }}
            />
          </div>

          {/* Scene 2 text - scramble effect */}
          <div
            ref={scene2TextRef}
            className="absolute inset-0 flex items-center justify-center text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-center px-4"
            style={{
              opacity: 0,
              color: '#ffffff',
              textShadow: '0 0 15px rgba(255,255,255,0.3)',
              zIndex: 10,
              fontFamily: '"Courier New", monospace',
              letterSpacing: '0.15em',
            }}
          >
            {scene2TargetText}
          </div>

          {/* Phone mockup */}
          <div
            ref={phoneMockupRef}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              opacity: 0,
              zIndex: 15,
              width: '280px',
              height: '560px',
              transition: 'opacity 0.3s ease',
            }}
          >
            <div
              className="relative w-full h-full rounded-[40px] overflow-hidden border-[3px] border-gray-700"
              style={{
                background: 'linear-gradient(145deg, #1a1a1a, #0a0a0a)',
                animation: 'phoneGlow 3s ease-in-out infinite',
              }}
            >
              {/* Phone screen content */}
              <div className="absolute inset-[8px] rounded-[32px] overflow-hidden bg-black">
                {/* Phone notch */}
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[30px] rounded-b-[16px]"
                  style={{ background: '#0a0a0a' }}
                />
                {/* Phone screen mockup image */}
                <img
                  src="/screenshot1.png"
                  alt="App preview"
                  className="w-full h-full object-cover"
                />
                {/* Green glow overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(200,255,0,0.05) 0%, transparent 70%)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Hero content (badge, logo, title, subtitle, buttons) */}
          <div
            ref={heroContentRef}
            className="hero-content-hidden absolute inset-0 flex flex-col items-center justify-center text-center px-4"
            style={{ zIndex: 20 }}
          >
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
              style={{
                background: 'rgba(200,255,0,0.1)',
                border: '1px solid rgba(200,255,0,0.3)',
                color: '#c8ff00',
              }}
            >
              <span className="inline-block w-2 h-2 rounded-full bg-[#c8ff00] animate-pulse" />
              Now in Beta
            </div>

            {/* Logo */}
            <img
              src="/logo.png"
              alt="Liftio"
              className="w-48 md:w-64 mb-8"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(200,255,0,0.3))',
              }}
            />

            {/* Title */}
            <h1
              className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight mb-4"
              style={{
                color: '#ffffff',
                textShadow: '0 0 30px rgba(200,255,0,0.2)',
              }}
            >
              Your Fitness,{' '}
              <span style={{ color: '#c8ff00' }}>Reimagined</span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-lg md:text-xl max-w-2xl mb-10"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              AI-powered workout tracking that sees your form, counts your reps,
              and pushes your limits.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className="px-8 py-4 rounded-full text-lg font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105"
                style={{
                  background: '#c8ff00',
                  color: '#000000',
                  boxShadow: '0 0 30px rgba(200,255,0,0.3)',
                }}
              >
                Get Early Access
              </button>
              <button
                className="px-8 py-4 rounded-full text-lg font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105"
                style={{
                  background: 'transparent',
                  color: '#ffffff',
                  border: '2px solid rgba(255,255,255,0.3)',
                }}
              >
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ScrollytellingHero;
