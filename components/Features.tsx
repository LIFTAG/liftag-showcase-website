'use client';

import { useEffect, useRef, useState } from 'react';

/* ---------- Mini Bar Chart Visual ---------- */
function BarChartVisual({ visible }: { visible: boolean }) {
  const barHeights = [40, 65, 50, 80, 55, 90, 70, 95, 75];
  return (
    <div className="flex items-end justify-center gap-2 h-[160px]">
      {barHeights.map((h, i) => (
        <div
          key={i}
          className="w-5 rounded-t-sm"
          style={{
            height: visible ? `${h}%` : '0%',
            background: 'linear-gradient(180deg, #c8ff00 0%, rgba(200,255,0,0.3) 100%)',
            boxShadow: visible ? '0 0 8px rgba(200,255,0,0.3)' : 'none',
            transition: `height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.08}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ---------- Stat Counter "<2s" Visual ---------- */
function StatCounterVisual({ visible }: { visible: boolean }) {
  return (
    <div className="flex items-center justify-center h-[160px]">
      <div
        className="text-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1)' : 'scale(0.5)',
          transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <div
          className="text-6xl font-bold font-mono"
          style={{
            color: '#c8ff00',
            textShadow: '0 0 30px rgba(200,255,0,0.3)',
          }}
        >
          &lt;2s
        </div>
        <div
          className="text-sm mt-2 font-mono"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          average log time
        </div>
      </div>
    </div>
  );
}

/* ---------- QR Grid Visual ---------- */
function QRGridVisual({ visible }: { visible: boolean }) {
  const [cellData, setCellData] = useState<{ delay: number; filled: boolean }[]>([]);
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    setCellData(Array.from({ length: 49 }, (_, i) => ({
      delay: Math.random() * 0.8,
      filled: !((i % 7 === 3 && Math.floor(i / 7) === 3) || Math.random() > 0.65),
    })));
  }, []);

  return (
    <div className="flex items-center justify-center h-[160px]">
      <div className="grid grid-cols-7 gap-1">
        {cellData.map((cell, i) => (
          <div
            key={i}
            className="w-4 h-4 rounded-sm"
            style={{
              background: cell.filled ? '#c8ff00' : 'rgba(255,255,255,0.05)',
              opacity: visible ? (cell.filled ? 0.9 : 0.3) : 0,
              transform: visible ? 'scale(1)' : 'scale(0)',
              transition: `all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${cell.delay}s`,
              boxShadow: cell.filled && visible ? '0 0 4px rgba(200,255,0,0.2)' : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------- Video Player Visual ---------- */
function VideoPlayerVisual({ visible }: { visible: boolean }) {
  const [time, setTime] = useState(42);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (visible && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => {
          if (prev <= 0) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [visible]);

  const formatTime = (s: number) => `0:${s.toString().padStart(2, '0')}`;

  return (
    <div className="flex items-center justify-center h-[160px]">
      <div
        className="rounded-xl overflow-hidden w-[260px]"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s ease',
        }}
      >
        {/* Video area */}
        <div
          className="relative h-[120px] flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          {/* Play button */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(255,45,85,0.2)',
              border: '2px solid rgba(255,45,85,0.4)',
            }}
          >
            <div
              className="ml-1"
              style={{
                width: 0,
                height: 0,
                borderTop: '8px solid transparent',
                borderBottom: '8px solid transparent',
                borderLeft: '14px solid #ff2d55',
              }}
            />
          </div>
          {/* Exercise label */}
          <div
            className="absolute top-3 left-3 text-xs font-mono px-2 py-0.5 rounded"
            style={{
              background: 'rgba(0,0,0,0.6)',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            Form Check
          </div>
        </div>
        {/* Progress bar */}
        <div className="px-3 py-2 flex items-center gap-2">
          <div
            className="flex-1 h-1 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${((42 - time) / 42) * 100}%`,
                background: '#ff2d55',
                transition: 'width 0.3s linear',
              }}
            />
          </div>
          <span
            className="text-xs font-mono"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            {formatTime(time)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Features Section ---------- */
const FEATURES = [
  {
    title: 'Detailed Analytics',
    description:
      'Track every metric that matters. Volume, frequency, progressive overload - all visualized in beautiful, interactive charts.',
    Visual: BarChartVisual,
  },
  {
    title: 'Lightning Fast Logging',
    description:
      'Log a set in under 2 seconds. No scrolling through menus, no complex forms. Just tap and go.',
    Visual: StatCounterVisual,
  },
  {
    title: 'QR Code Integration',
    description:
      'Every machine gets a unique QR code. Scan it once and the exercise is pre-filled. No searching required.',
    Visual: QRGridVisual,
  },
  {
    title: 'Form Check Videos',
    description:
      'Record and review your form on any exercise. Share with coaches, compare across sessions.',
    Visual: VideoPlayerVisual,
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-20 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
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
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-2">
            Everything You Need
          </h2>
          <p
            className="mt-4 text-lg max-w-2xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            Built by lifters, for lifters. Every feature designed to make your
            workout smoother.
          </p>
        </div>

        {/* Feature Rows */}
        {FEATURES.map((feature, i) => (
          <FeatureRowItem key={feature.title} feature={feature} index={i} />
        ))}
      </div>
    </section>
  );
}

function FeatureRowItem({
  feature,
  index,
}: {
  feature: (typeof FEATURES)[number];
  index: number;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const reverse = index % 2 === 1;

  return (
    <div
      ref={rowRef}
      className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-16 md:py-24`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(40px)',
        transition: `all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
      }}
    >
      <div
        className={`flex flex-col gap-4 ${reverse ? 'md:order-2' : ''}`}
      >
        <h3 className="text-2xl md:text-3xl font-bold text-white">
          {feature.title}
        </h3>
        <p
          className="text-base leading-relaxed max-w-md"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          {feature.description}
        </p>
      </div>
      <div className={`${reverse ? 'md:order-1' : ''}`}>
        <feature.Visual visible={visible} />
      </div>
    </div>
  );
}
