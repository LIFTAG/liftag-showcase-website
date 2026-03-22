'use client';

import { useEffect, useState } from 'react';

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = docHeight > 0 ? scrollTop / docHeight : 0;
      setProgress(Math.min(scrolled, 1));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full z-[9999] h-[3px]" style={{ pointerEvents: 'none' }}>
      <div
        className="h-full"
        style={{
          width: `${progress * 100}%`,
          background: '#c8ff00',
          boxShadow: '0 0 8px rgba(200,255,0,0.4), 0 0 20px rgba(200,255,0,0.15)',
          transition: 'width 0.1s linear',
        }}
      />
    </div>
  );
}
