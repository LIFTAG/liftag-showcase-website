'use client';

export default function Footer() {
  return (
    <footer className="relative w-full py-12">
      {/* Gradient glow top border */}
      <div
        className="absolute top-0 left-0 w-full h-[1px]"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, #c8ff00 30%, #ff2d55 70%, transparent 100%)',
          boxShadow: '0 0 15px rgba(200,255,0,0.3), 0 0 15px rgba(255,45,85,0.3)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center gap-6">
          {/* Logo + brand */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-black text-sm"
              style={{ background: '#c8ff00' }}
            >
              L
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">
              Liftio
            </span>
          </div>

          {/* Copyright */}
          <p
            className="text-sm font-mono"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            &copy; {new Date().getFullYear()} Liftio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
