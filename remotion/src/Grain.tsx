import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

const GRAIN_STEPS: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [-88, 44],
  [132, -66],
  [-44, -132],
  [176, 88],
  [-176, 154],
  [66, -44],
  [-132, -88],
];

const GRAIN_SVG =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncA type='linear' slope='0.55'/></feComponentTransfer></filter><rect width='220' height='220' filter='url(%23n)'/></svg>\")";

export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const [x, y] = GRAIN_STEPS[Math.floor(frame / 6) % GRAIN_STEPS.length];

  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        opacity: 0.05,
        inset: -180,
        width: 'auto',
        height: 'auto',
        backgroundImage: GRAIN_SVG,
        backgroundRepeat: 'repeat',
        backgroundSize: '220px 220px',
        transform: `translate3d(${x}px, ${y}px, 0)`,
      }}
    />
  );
};

export const Scanlines: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        opacity: 0.016,
        backgroundImage:
          'repeating-linear-gradient(to bottom, transparent 0, transparent 4px, #F4F5F0 4px, #F4F5F0 5px)',
      }}
    />
  );
};

export const Vignette: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        background:
          'radial-gradient(ellipse 78% 62% at 50% 46%, transparent 0%, rgba(7, 8, 7, 0.18) 72%, rgba(7, 8, 7, 0.55) 100%)',
      }}
    />
  );
};
