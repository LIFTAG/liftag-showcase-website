'use client';

import { useEffect, useRef, useState } from 'react';

const MILESTONES = [
  {
    version: 'V1',
    title: 'Foundation',
    date: 'Q1 2025',
    items: ['QR code scanning', 'Set logging', 'Basic analytics', 'Gym dashboard'],
    live: true,
  },
  {
    version: 'V2',
    title: 'Intelligence',
    date: 'Q2 2025',
    items: ['AI workout suggestions', 'Form check video', 'Social features', 'Leaderboards'],
    live: false,
  },
  {
    version: 'V3',
    title: 'Ecosystem',
    date: 'Q3 2025',
    items: [
      'Wearable integration',
      'Nutrition tracking',
      'Coach marketplace',
      'API for gyms',
    ],
    live: false,
  },
  {
    version: 'V4',
    title: 'Scale',
    date: 'Q4 2025',
    items: [
      'Multi-gym networks',
      'Franchise tools',
      'Advanced AI coaching',
      'Global expansion',
    ],
    live: false,
  },
];

export default function Roadmap() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [lineProgress, setLineProgress] = useState(0);
  const [visibleItems, setVisibleItems] = useState<boolean[]>(
    new Array(MILESTONES.length).fill(false)
  );

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionTop = rect.top;
      const sectionHeight = rect.height;
      const viewportHeight = window.innerHeight;

      // Line progress: from when section enters view to when it leaves
      const start = viewportHeight * 0.6;
      const end = -sectionHeight + viewportHeight * 0.4;
      const progress = Math.min(Math.max((start - sectionTop) / (start - end), 0), 1);
      setLineProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver for individual items
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleItems((prev) => {
              const next = [...prev];
              next[i] = true;
              return next;
            });
          }
        },
        { threshold: 0.3 }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <section id="roadmap" ref={sectionRef} className="relative py-20 md:py-32">
      <style jsx>{`
        @keyframes pulsingDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.5); }
        }
        .live-pulse {
          animation: pulsingDot 2s ease-in-out infinite;
        }
        @keyframes nodeGlow {
          0%, 100% { box-shadow: 0 0 8px rgba(200,255,0,0.3); }
          50% { box-shadow: 0 0 20px rgba(200,255,0,0.6), 0 0 40px rgba(200,255,0,0.2); }
        }
        .node-powered {
          animation: nodeGlow 2s ease-in-out infinite;
        }
      `}</style>
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 md:mb-24">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-mono tracking-widest uppercase mb-4"
            style={{
              background: 'rgba(200,255,0,0.1)',
              color: '#c8ff00',
              border: '1px solid rgba(200,255,0,0.2)',
            }}
          >
            Roadmap
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-2">
            What&apos;s Coming
          </h2>
          <p
            className="mt-4 text-lg max-w-2xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            Our vision for the future of gym technology.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Ghost line (background) */}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-0 w-[2px] h-full rounded-full"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          />

          {/* Active line (draws based on scroll) */}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-0 w-[2px] rounded-full"
            style={{
              height: `${lineProgress * 100}%`,
              background: 'linear-gradient(180deg, #c8ff00, rgba(200,255,0,0.3))',
              boxShadow: '0 0 10px rgba(200,255,0,0.3)',
              transition: 'height 0.1s linear',
            }}
          />

          {/* Timeline items */}
          <div className="relative flex flex-col gap-20 md:gap-28">
            {MILESTONES.map((milestone, i) => {
              const isLeft = i % 2 === 0;
              const isPowered = lineProgress > (i + 0.5) / MILESTONES.length;

              return (
                <div
                  key={milestone.version}
                  ref={(el) => { itemRefs.current[i] = el; }}
                  className="relative"
                  style={{
                    opacity: visibleItems[i] ? 1 : 0,
                    transform: visibleItems[i]
                      ? 'translateX(0) translateY(0)'
                      : `translateX(${isLeft ? '-40px' : '40px'}) translateY(20px)`,
                    transition: `all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${i * 0.1}s`,
                  }}
                >
                  {/* Node dot */}
                  <div
                    className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full z-10 ${
                      isPowered ? 'node-powered' : ''
                    }`}
                    style={{
                      background: isPowered ? '#c8ff00' : 'rgba(255,255,255,0.15)',
                      border: `2px solid ${
                        isPowered ? '#c8ff00' : 'rgba(255,255,255,0.1)'
                      }`,
                      top: '1.5rem',
                    }}
                  />

                  {/* Content card */}
                  <div
                    className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-start`}
                  >
                    <div
                      className={`${
                        isLeft
                          ? 'md:text-right md:pr-12'
                          : 'md:col-start-2 md:pl-12'
                      }`}
                    >
                      {/* Version + date */}
                      <div
                        className={`flex items-center gap-3 mb-3 ${
                          isLeft ? 'md:justify-end' : ''
                        }`}
                      >
                        <span
                          className="text-lg font-bold font-mono"
                          style={{
                            color: isPowered ? '#c8ff00' : 'rgba(255,255,255,0.4)',
                          }}
                        >
                          {milestone.version}
                        </span>
                        <span
                          className="text-xs font-mono"
                          style={{ color: 'rgba(255,255,255,0.3)' }}
                        >
                          {milestone.date}
                        </span>
                        {milestone.live && (
                          <span
                            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                            style={{
                              background: 'rgba(200,255,0,0.15)',
                              color: '#c8ff00',
                              border: '1px solid rgba(200,255,0,0.3)',
                            }}
                          >
                            <span
                              className="live-pulse w-1.5 h-1.5 rounded-full inline-block"
                              style={{ background: '#c8ff00' }}
                            />
                            LIVE
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3
                        className="text-2xl font-bold mb-3"
                        style={{
                          color: isPowered ? '#ffffff' : 'rgba(255,255,255,0.6)',
                        }}
                      >
                        {milestone.title}
                      </h3>

                      {/* Items */}
                      <ul className="flex flex-col gap-2">
                        {milestone.items.map((item) => (
                          <li
                            key={item}
                            className={`flex items-center gap-2 text-sm ${
                              isLeft ? 'md:justify-end' : ''
                            }`}
                            style={{
                              color: isPowered
                                ? 'rgba(255,255,255,0.7)'
                                : 'rgba(255,255,255,0.4)',
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{
                                background: isPowered ? '#c8ff00' : 'rgba(255,255,255,0.2)',
                              }}
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Empty column for alternating layout */}
                    {isLeft && <div className="hidden md:block" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
