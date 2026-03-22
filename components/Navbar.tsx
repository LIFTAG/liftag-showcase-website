'use client';

import { useEffect, useState, useCallback } from 'react';

const NAV_LINKS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'For Gyms', href: '#for-gyms' },
  { label: 'Roadmap', href: '#roadmap' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 w-full z-[1000] transition-all duration-300"
      style={{
        background: scrolled || mobileOpen ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.2)',
        backdropFilter: scrolled || mobileOpen ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled || mobileOpen ? 'blur(20px)' : 'none',
        borderBottom: scrolled
          ? '1px solid rgba(255,255,255,0.08)'
          : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
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

        {/* Desktop Nav Links */}
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

        <div className="flex items-center gap-3">
          {/* CTA */}
          <button
            className="btn-shine relative overflow-hidden inline-flex items-center justify-center px-4 py-2 sm:px-5 rounded-full font-semibold text-sm text-black cursor-pointer border-none transition-all duration-200 hover:-translate-y-px"
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
            <span className="hidden sm:inline">Get Early Access</span>
            <span className="sm:hidden">Join</span>
          </button>

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg transition-colors duration-200"
            style={{ background: mobileOpen ? 'rgba(255,255,255,0.1)' : 'transparent' }}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            <div className="w-5 h-4 relative flex flex-col justify-between">
              <span
                className="block w-full h-[2px] rounded-full bg-white transition-all duration-300 origin-center"
                style={{
                  transform: mobileOpen ? 'translateY(7px) rotate(45deg)' : 'none',
                }}
              />
              <span
                className="block w-full h-[2px] rounded-full bg-white transition-all duration-300"
                style={{
                  opacity: mobileOpen ? 0 : 1,
                  transform: mobileOpen ? 'scaleX(0)' : 'scaleX(1)',
                }}
              />
              <span
                className="block w-full h-[2px] rounded-full bg-white transition-all duration-300 origin-center"
                style={{
                  transform: mobileOpen ? 'translateY(-7px) rotate(-45deg)' : 'none',
                }}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div
        className="md:hidden overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: mobileOpen ? '320px' : '0px',
          opacity: mobileOpen ? 1 : 0,
          borderTop: mobileOpen ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
        }}
      >
        <div className="px-4 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              className="block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200"
              style={{
                color: 'rgba(255,255,255,0.8)',
                transitionDelay: mobileOpen ? `${i * 50}ms` : '0ms',
                transform: mobileOpen ? 'translateX(0)' : 'translateX(-12px)',
                opacity: mobileOpen ? 1 : 0,
              }}
              onClick={(e) => handleNavClick(e, link.href)}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
