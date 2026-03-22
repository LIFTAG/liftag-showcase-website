'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';

interface IntroRevealProps {
  onComplete: () => void;
  triggerReveal: boolean;
}

const NEON_GREEN = '#c8ff00';
const HOLE_OFFSET_X = -0.18;
const HOLE_OFFSET_Y = 0.18;
const INTRO_START_SIZE = 200;
const ANIM_DURATION = 2000; // ms
const FADE_START = 0.6; // fade begins at 60% of animation

/**
 * Ease-in quintic: slow start, accelerates at the end.
 */
function easeInQuintic(t: number): number {
  return t * t * t * t * t;
}

const IntroReveal: React.FC<IntroRevealProps> = ({ onComplete, triggerReveal }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const silhouetteRef = useRef<HTMLImageElement | null>(null);
  const animStartRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const completedRef = useRef(false);

  // Load silhouette image
  useEffect(() => {
    const img = new Image();
    img.src = '/logo_silluette.png';
    img.onload = () => {
      silhouetteRef.current = img;
    };
  }, []);

  // Draw neon green fill with silhouette hole punched via destination-out
  const drawFrame = useCallback((t: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const diagonal = Math.sqrt(W * W + H * H);
    const endSize = diagonal * 8;

    const eased = easeInQuintic(t);
    const currentSize = INTRO_START_SIZE + (endSize - INTRO_START_SIZE) * eased;

    // Rotation: clockwise ~30deg, using -(t^2) * (PI/6)
    const rotation = -(t * t) * (Math.PI / 6);

    // Calculate opacity for fade-out after 60%
    let opacity = 1;
    if (t > FADE_START) {
      opacity = 1 - (t - FADE_START) / (1 - FADE_START);
      opacity = Math.max(0, opacity);
    }

    // Clear canvas
    ctx.clearRect(0, 0, W, H);

    // Save state and apply global alpha
    ctx.save();
    ctx.globalAlpha = opacity;

    // Draw neon green background fill
    ctx.fillStyle = NEON_GREEN;
    ctx.fillRect(0, 0, W, H);

    // Punch out silhouette holes using destination-out compositing
    if (silhouetteRef.current) {
      ctx.globalCompositeOperation = 'destination-out';

      const img = silhouetteRef.current;
      const cx = W / 2 + W * HOLE_OFFSET_X;
      const cy = H / 2 + H * HOLE_OFFSET_Y;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      ctx.drawImage(
        img,
        -currentSize / 2,
        -currentSize / 2,
        currentSize,
        currentSize
      );
      ctx.restore();

      // Reset composite operation
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.restore();
  }, []);

  // Resize canvas to window
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
    // Redraw at current state if animating
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  // Initial draw (full green screen before animation starts)
  useEffect(() => {
    drawFrame(0);
  }, [drawFrame]);

  // Animation loop triggered by triggerReveal
  useEffect(() => {
    if (!triggerReveal || completedRef.current) return;

    animStartRef.current = null;

    const animate = (timestamp: number) => {
      if (animStartRef.current === null) {
        animStartRef.current = timestamp;
      }

      const elapsed = timestamp - animStartRef.current;
      const t = Math.min(elapsed / ANIM_DURATION, 1);

      drawFrame(t);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete
        completedRef.current = true;
        setVisible(false);
        onComplete();
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [triggerReveal, drawFrame, onComplete]);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] pointer-events-none"
      style={{ willChange: 'opacity' }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ display: 'block' }}
      />
    </div>
  );
};

export default IntroReveal;
