'use client';

import { useEffect, useState } from 'react';

const NAV_LINKS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'For Gyms', href: '#for-gyms' },
  { label: 'Roadmap', href: '#roadmap' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 w-full z-[1000] transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.2)',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled
          ? '1px solid rgba(255,255,255,0.08)'
          : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 no-underline">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-black text-sm"
            style={{ background: '#c8ff00' }}
          >
            L
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">
            Liftio
          </span>
        </a>

        {/* Nav Links — uses .nav-link-glow from globals.css for red neon underline */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="nav-link-glow relative text-sm font-medium py-1 transition-colors duration-300"
              style={{ color: 'rgba(255,255,255,0.7)' }}
              onClick={(e) => handleNavClick(e, link.href)}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA — uses .btn-shine from globals.css for sweep effect */}
        <button
          className="btn-shine relative overflow-hidden inline-flex items-center justify-center px-5 py-2 rounded-full font-semibold text-sm text-black cursor-pointer border-none transition-all duration-200 hover:-translate-y-px"
          style={{
            background: '#c8ff00',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow =
              '0 0 20px rgba(200,255,0,0.4), 0 4px 15px rgba(200,255,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Get Early Access
        </button>
      </div>
    </nav>
  );
}
