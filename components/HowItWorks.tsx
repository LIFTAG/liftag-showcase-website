'use client';

import { useEffect, useRef, useState } from 'react';

const STEPS = [
  {
    number: '01',
    title: 'Scan the QR Code',
    description:
      'Walk up to any equipped machine, scan the QR code, and instantly connect. No searching, no setup.',
  },
  {
    number: '02',
    title: 'Log Your Set',
    description:
      'Enter your weight and reps with a single tap. PRs are detected automatically. It takes under 2 seconds.',
  },
  {
    number: '03',
    title: 'Track Your Progress',
    description:
      'Watch your strength grow over time with beautiful charts and detailed analytics. All automatic.',
  },
];

function QRScannerPanel() {
  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <style jsx>{`
        @keyframes scanLine {
          0%, 100% { top: 10%; }
          50% { top: 85%; }
        }
        .scan-line {
          animation: scanLine 2.5s ease-in-out infinite;
        }
      `}</style>
      {/* Phone frame */}
      <div
        className="relative rounded-[2rem] overflow-hidden"
        style={{
          width: '220px',
          height: '380px',
          background: 'rgba(255,255,255,0.03)',
          border: '2px solid rgba(255,255,255,0.08)',
          boxShadow: '0 0 40px rgba(255,45,85,0.1)',
        }}
      >
        {/* Notch */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 rounded-b-xl"
          style={{
            width: '80px',
            height: '20px',
            background: '#000',
            borderBottomLeftRadius: '12px',
            borderBottomRightRadius: '12px',
          }}
        />

        {/* Scanner viewport */}
        <div className="absolute inset-10 flex items-center justify-center">
          <div className="relative w-full h-full">
            {/* QR scan corners */}
            <div
              className="absolute top-0 left-0 w-6 h-6"
              style={{
                borderTop: '3px solid #ff2d55',
                borderLeft: '3px solid #ff2d55',
                borderTopLeftRadius: '4px',
              }}
            />
            <div
              className="absolute top-0 right-0 w-6 h-6"
              style={{
                borderTop: '3px solid #ff2d55',
                borderRight: '3px solid #ff2d55',
                borderTopRightRadius: '4px',
              }}
            />
            <div
              className="absolute bottom-0 left-0 w-6 h-6"
              style={{
                borderBottom: '3px solid #ff2d55',
                borderLeft: '3px solid #ff2d55',
                borderBottomLeftRadius: '4px',
              }}
            />
            <div
              className="absolute bottom-0 right-0 w-6 h-6"
              style={{
                borderBottom: '3px solid #ff2d55',
                borderRight: '3px solid #ff2d55',
                borderBottomRightRadius: '4px',
              }}
            />

            {/* Scan line */}
            <div
              className="scan-line absolute left-[5%] w-[90%] h-[2px]"
              style={{
                background: 'linear-gradient(90deg, transparent, #ff2d55, transparent)',
                boxShadow: '0 0 15px rgba(255,45,85,0.6)',
              }}
            />

            {/* QR placeholder dots */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <div className="grid grid-cols-5 gap-2">
                {[1,0,1,1,0,1,1,1,0,1,0,0,1,1,0,1,0,1,0,1,1,1,0,1,1].map((v, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-sm"
                    style={{
                      background: v ? 'rgba(255,255,255,0.5)' : 'transparent',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SetLoggerPanel() {
  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <div
        className="rounded-2xl p-6 w-[280px]"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* Exercise name */}
        <div className="text-center mb-5">
          <span
            className="text-xs font-mono uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            Current Exercise
          </span>
          <h3 className="text-white text-lg font-semibold mt-1">Bench Press</h3>
        </div>

        {/* Weight & Reps inputs */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label
              className="block text-xs mb-1 font-mono"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              WEIGHT
            </label>
            <div
              className="rounded-lg px-3 py-2 text-white text-center text-xl font-semibold"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              80<span className="text-sm ml-1 opacity-50">kg</span>
            </div>
          </div>
          <div className="flex-1">
            <label
              className="block text-xs mb-1 font-mono"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              REPS
            </label>
            <div
              className="rounded-lg px-3 py-2 text-white text-center text-xl font-semibold"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              8
            </div>
          </div>
        </div>

        {/* LOG SET button */}
        <button
          className="w-full py-3 rounded-xl font-bold text-sm text-black cursor-pointer"
          style={{
            background: '#c8ff00',
            boxShadow: '0 0 20px rgba(200,255,0,0.2)',
          }}
        >
          LOG SET
        </button>

        {/* PR badge */}
        <div className="flex justify-center mt-3">
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              background: 'rgba(255,45,85,0.15)',
              color: '#ff2d55',
              border: '1px solid rgba(255,45,85,0.3)',
              boxShadow: '0 0 12px rgba(255,45,85,0.15)',
            }}
          >
            <span>&#9733;</span> New PR!
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressChartPanel() {
  const [draw, setDraw] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDraw(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const points = '30,140 70,120 110,125 150,95 190,100 230,70 270,60 310,40';
  const pathLength = 500;

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full gap-6">
      {/* Chart */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          width: '340px',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-white text-sm font-semibold">Bench Press Progress</span>
          <span
            className="text-xs font-mono"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            Last 8 weeks
          </span>
        </div>
        <svg viewBox="0 0 340 160" className="w-full" style={{ overflow: 'visible' }}>
          {/* Grid lines */}
          {[40, 80, 120].map((y) => (
            <line
              key={y}
              x1="20"
              y1={y}
              x2="320"
              y2={y}
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="4 4"
            />
          ))}
          {/* Area fill */}
          <polygon
            points={`30,140 ${points} 310,140`}
            fill="url(#chartGrad)"
            style={{
              opacity: draw ? 0.3 : 0,
              transition: 'opacity 1.5s ease 0.5s',
            }}
          />
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c8ff00" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#c8ff00" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke="#c8ff00"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: pathLength,
              strokeDashoffset: draw ? 0 : pathLength,
              transition: 'stroke-dashoffset 2s ease',
              filter: 'drop-shadow(0 0 6px rgba(200,255,0,0.4))',
            }}
          />
          {/* Endpoint dot */}
          <circle
            cx="310"
            cy="40"
            r="4"
            fill="#c8ff00"
            style={{
              opacity: draw ? 1 : 0,
              transition: 'opacity 0.3s ease 2s',
              filter: 'drop-shadow(0 0 8px rgba(200,255,0,0.6))',
            }}
          />
        </svg>
      </div>

      {/* Stats row */}
      <div className="flex gap-4">
        {[
          { label: 'Total Sets', value: '247' },
          { label: 'Volume', value: '18.4t' },
          { label: 'Best', value: '100kg' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="text-center px-4 py-2 rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="text-white text-lg font-bold">{stat.value}</div>
            <div
              className="text-xs font-mono"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionHeight = sectionRef.current.offsetHeight - window.innerHeight;
      const progress = Math.min(Math.max(-rect.top / sectionHeight, 0), 1);
      setScrollProgress(progress);
      setActiveStep(Math.min(Math.floor(progress * 3), 2));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const panels = [QRScannerPanel, SetLoggerPanel, ProgressChartPanel];

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative"
      style={{ height: '300vh' }}
    >
      <div
        ref={stickyRef}
        className="sticky top-0 h-screen w-full overflow-hidden flex items-center"
      >
        {/* Background subtle gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(255,45,85,0.03) 0%, transparent 70%)',
          }}
        />

        {/* Header */}
        <div className="absolute top-20 left-0 w-full text-center z-10 px-6">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-mono tracking-widest uppercase mb-4"
            style={{
              background: 'rgba(255,45,85,0.1)',
              color: '#ff2d55',
              border: '1px solid rgba(255,45,85,0.2)',
            }}
          >
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-2">
            Three Simple Steps
          </h2>
        </div>

        {/* Horizontal scrolling panels container */}
        <div
          className="flex items-center gap-0 w-full"
          style={{
            transform: `translateX(${-scrollProgress * 200}vw)`,
            transition: 'transform 0.05s linear',
            width: '300vw',
          }}
        >
          {STEPS.map((step, i) => {
            const PanelVisual = panels[i];
            return (
              <div
                key={step.number}
                className="w-screen h-screen flex items-center justify-center px-6"
                style={{ flexShrink: 0 }}
              >
                <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center mt-16">
                  {/* Text */}
                  <div className="flex flex-col gap-4">
                    <span
                      className="text-6xl font-bold font-mono"
                      style={{
                        color: 'rgba(255,45,85,0.15)',
                        WebkitTextStroke: '1px rgba(255,45,85,0.3)',
                      }}
                    >
                      {step.number}
                    </span>
                    <h3 className="text-3xl font-bold text-white">{step.title}</h3>
                    <p
                      className="text-base leading-relaxed"
                      style={{ color: 'rgba(255,255,255,0.6)' }}
                    >
                      {step.description}
                    </p>
                  </div>
                  {/* Visual */}
                  <div className="h-[400px]">
                    <PanelVisual />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step indicator dots */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full transition-all duration-300"
              style={{
                background:
                  activeStep === i ? '#ff2d55' : 'rgba(255,255,255,0.2)',
                boxShadow:
                  activeStep === i
                    ? '0 0 10px rgba(255,45,85,0.5)'
                    : 'none',
                transform: activeStep === i ? 'scale(1.3)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        {/* Red neon scrollbar on right */}
        <div
          className="absolute right-4 top-1/2 -translate-y-1/2 w-1 rounded-full"
          style={{
            height: '120px',
            background: 'rgba(255,45,85,0.1)',
          }}
        >
          <div
            className="w-full rounded-full transition-all duration-150"
            style={{
              height: `${((activeStep + 1) / 3) * 100}%`,
              background: '#ff2d55',
              boxShadow: '0 0 10px rgba(255,45,85,0.5), 0 0 20px rgba(255,45,85,0.2)',
            }}
          />
        </div>
      </div>
    </section>
  );
}
