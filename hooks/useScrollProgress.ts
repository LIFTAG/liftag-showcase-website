'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook that returns the overall page scroll progress (0-1).
 * Updates via requestAnimationFrame for smooth, jank-free tracking.
 */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const progressRef = useRef(0);

  const update = useCallback(() => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const newProgress = docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0;

    if (Math.abs(newProgress - progressRef.current) > 0.0001) {
      progressRef.current = newProgress;
      setProgress(newProgress);
    }

    rafRef.current = requestAnimationFrame(update);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(update);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [update]);

  return progress;
}

export default useScrollProgress;
