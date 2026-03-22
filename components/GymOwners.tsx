'use client';

import { useEffect, useRef, useState } from 'react';

const FEATURES = [
  {
    title: 'Real-Time Occupancy',
    description:
      'Know exactly how busy your gym is at any moment. Members can check before they leave home.',
    zone: 0,
  },
  {
    title: 'Equipment Analytics',
    description:
      'See which machines are most used, which need maintenance, and optimize your floor plan.',
    zone: 1,
  },
  {
    title: 'Member Insights',
    description:
      'Understand member behavior, retention patterns, and engagement metrics at a glance.',
    zone: 2,
  },
  {
    title: 'Revenue Dashboard',
    description:
      'Track memberships, class bookings, and revenue streams in one unified dashboard.',
    zone: 3,
  },
];

/* ---------- Dashboard Mockup ---------- */
function DashboardMockup({ activeZone }: { activeZone: number }) {
  return (
    <div
      className="rounded-2xl overflow-hidden w-full max-w-[480px]"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}
    >
      {/* Window chrome */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
        <div className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
        <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
        <span
          className="ml-3 text-xs font-mono"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          Liftio Dashboard
        </span>
      </div>

      {/* Dashboard grid */}
      <div className="grid grid-cols-2 gap-3 p-4">
        {/* Zone 0 - Occupancy */}
        <DashboardZone
          active={activeZone === 0}
          title="Occupancy"
          color="#c8ff00"
        >
          <div className="flex items-end gap-1 mt-2">
            {[35, 55, 70, 85, 65, 45, 30].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm"
                style={{
                  height: `${h}%`,
                  maxHeight: '50px',
                  background:
                    activeZone === 0
                      ? `rgba(200,255,0,${0.3 + i * 0.1})`
                      : 'rgba(255,255,255,0.08)',
                  transition: 'background 0.5s ease',
                }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span
              className="text-2xl font-bold"
              style={{ color: activeZone === 0 ? '#c8ff00' : 'rgba(255,255,255,0.6)' }}
            >
              73%
            </span>
            <span className="text-xs self-end" style={{ color: 'rgba(255,255,255,0.4)' }}>
              capacity
            </span>
          </div>
        </DashboardZone>

        {/* Zone 1 - Equipment */}
        <DashboardZone
          active={activeZone === 1}
          title="Equipment"
          color="#ff2d55"
        >
          <div className="space-y-2 mt-2">
            {['Bench Press', 'Squat Rack', 'Cable'].map((name, i) => (
              <div key={name} className="flex items-center gap-2">
                <div
                  className="h-1.5 rounded-full flex-1"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${90 - i * 20}%`,
                      background:
                        activeZone === 1 ? '#ff2d55' : 'rgba(255,255,255,0.2)',
                      transition: 'background 0.5s ease',
                    }}
                  />
                </div>
                <span
                  className="text-[10px] font-mono w-14 text-right"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  {name}
                </span>
              </div>
            ))}
          </div>
        </DashboardZone>

        {/* Zone 2 - Members */}
        <DashboardZone
          active={activeZone === 2}
          title="Members"
          color="#c8ff00"
        >
          <div className="flex items-center gap-3 mt-3">
            <div
              className="text-2xl font-bold"
              style={{ color: activeZone === 2 ? '#c8ff00' : 'rgba(255,255,255,0.6)' }}
            >
              1,247
            </div>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span
              className="text-xs font-mono"
              style={{ color: activeZone === 2 ? '#c8ff00' : 'rgba(255,255,255,0.4)' }}
            >
              +12%
            </span>
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
              this month
            </span>
          </div>
        </DashboardZone>

        {/* Zone 3 - Revenue */}
        <DashboardZone
          active={activeZone === 3}
          title="Revenue"
          color="#ff2d55"
        >
          <div className="mt-2">
            <svg viewBox="0 0 100 40" className="w-full">
              <polyline
                points="0,35 15,30 30,25 45,28 60,15 75,18 90,8 100,10"
                fill="none"
                stroke={activeZone === 3 ? '#ff2d55' : 'rgba(255,255,255,0.15)'}
                strokeWidth="2"
                strokeLinecap="round"
                style={{ transition: 'stroke 0.5s ease' }}
              />
            </svg>
          </div>
          <div
            className="text-lg font-bold mt-1"
            style={{ color: activeZone === 3 ? '#ff2d55' : 'rgba(255,255,255,0.6)' }}
          >
            $24.8k
          </div>
        </DashboardZone>
      </div>
    </div>
  );
}

function DashboardZone({
  active,
  title,
  color,
  children,
}: {
  active: boolean;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-3 transition-all duration-500"
      style={{
        background: active
          ? `rgba(${color === '#c8ff00' ? '200,255,0' : '255,45,85'},0.05)`
          : 'rgba(255,255,255,0.02)',
        border: `1px solid ${
          active
            ? `rgba(${color === '#c8ff00' ? '200,255,0' : '255,45,85'},0.2)`
            : 'rgba(255,255,255,0.06)'
        }`,
        boxShadow: active
          ? `0 0 20px rgba(${color === '#c8ff00' ? '200,255,0' : '255,45,85'},0.08)`
          : 'none',
      }}
    >
      <span
        className="text-[10px] font-mono uppercase tracking-wider"
        style={{ color: active ? color : 'rgba(255,255,255,0.4)' }}
      >
        {title}
      </span>
      {children}
    </div>
  );
}

/* ---------- GymOwners Section ---------- */
export default function GymOwners() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [activeZone, setActiveZone] = useState(-1);
  const lerpY = useRef(0);
  const targetY = useRef(0);
  const rafId = useRef<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionHeight = sectionRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;

      // Calculate which feature block is in view
      const scrollIntoSection = -rect.top;
      const featureHeight = (sectionHeight - viewportHeight) / FEATURES.length;

      if (scrollIntoSection < 0) {
        setActiveZone(-1);
      } else {
        const idx = Math.floor(scrollIntoSection / featureHeight);
        setActiveZone(Math.min(idx, FEATURES.length - 1));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth momentum lerp for dashboard
  useEffect(() => {
    const animate = () => {
      lerpY.current += (targetY.current - lerpY.current) * 0.08;
      if (dashboardRef.current) {
        dashboardRef.current.style.transform = `translateY(${lerpY.current}px)`;
      }
      rafId.current = requestAnimationFrame(animate);
    };
    rafId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId.current);
  }, []);

  return (
    <section
      id="for-gyms"
      ref={sectionRef}
      className="relative py-20 md:py-32"
      style={{ minHeight: '200vh' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 md:mb-24">
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-mono tracking-widest uppercase mb-4"
            style={{
              background: 'rgba(255,45,85,0.1)',
              color: '#ff2d55',
              border: '1px solid rgba(255,45,85,0.2)',
            }}
          >
            For Gym Owners
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-2">
            Your Gym, Supercharged
          </h2>
          <p
            className="mt-4 text-lg max-w-2xl mx-auto"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            Give your members a premium experience while unlocking powerful
            insights for your business.
          </p>
        </div>

        {/* Split layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
          {/* Left - Sticky Dashboard */}
          <div className="hidden md:block">
            <div className="sticky top-32">
              <div ref={dashboardRef}>
                <DashboardMockup activeZone={activeZone} />
              </div>
            </div>
          </div>

          {/* Right - Scrolling feature blocks */}
          <div className="flex flex-col gap-12 md:gap-32">
            {FEATURES.map((feature, i) => (
              <FeatureBlock
                key={feature.title}
                feature={feature}
                isActive={activeZone === i}
                index={i}
              />
            ))}
          </div>
        </div>

        {/* Mobile dashboard (below on small screens) */}
        <div className="md:hidden mt-16">
          <DashboardMockup activeZone={Math.max(activeZone, 0)} />
        </div>
      </div>
    </section>
  );
}

function FeatureBlock({
  feature,
  isActive,
  index,
}: {
  feature: (typeof FEATURES)[number];
  isActive: boolean;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
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

  return (
    <div
      ref={ref}
      className="py-8 md:py-16 transition-all duration-500"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? `scale(${isActive ? 1 : 0.96})`
          : 'translateY(30px) scale(0.96)',
        transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold font-mono transition-all duration-500"
          style={{
            background: isActive
              ? 'rgba(200,255,0,0.15)'
              : 'rgba(255,255,255,0.05)',
            color: isActive ? '#c8ff00' : 'rgba(255,255,255,0.3)',
            border: `1px solid ${
              isActive ? 'rgba(200,255,0,0.3)' : 'rgba(255,255,255,0.08)'
            }`,
            boxShadow: isActive ? '0 0 15px rgba(200,255,0,0.1)' : 'none',
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </div>
        <div>
          <h3
            className="text-xl md:text-2xl font-bold transition-colors duration-500"
            style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.6)' }}
          >
            {feature.title}
          </h3>
          <p
            className="mt-2 text-sm md:text-base leading-relaxed max-w-sm transition-colors duration-500"
            style={{
              color: isActive
                ? 'rgba(255,255,255,0.7)'
                : 'rgba(255,255,255,0.4)',
            }}
          >
            {feature.description}
          </p>
        </div>
      </div>
    </div>
  );
}
