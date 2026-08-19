import React from 'react';
import {COLORS, fonts} from './theme';

type LaserTextProps = {
  text: string;
  progress: number;
  fontSize: number;
  color?: string;
  italic?: boolean;
  letterSpacing?: string;
  fontWeight?: number;
  fontFamily?: string;
  showBeam?: boolean;
  glow?: boolean;
  uppercase?: boolean;
  sparks?: boolean;
};

type Spark = {
  at: number;
  dx: number;
  dy: number;
  size: number;
  life: number;
};

const SPARKS: ReadonlyArray<Spark> = [
  {at: 0.06, dx: 7, dy: -22, size: 2, life: 0.16},
  {at: 0.11, dx: -9, dy: 16, size: 2, life: 0.14},
  {at: 0.17, dx: 4, dy: -28, size: 2, life: 0.18},
  {at: 0.22, dx: 12, dy: 10, size: 2, life: 0.12},
  {at: 0.28, dx: -6, dy: -18, size: 2, life: 0.15},
  {at: 0.35, dx: 10, dy: 24, size: 2, life: 0.17},
  {at: 0.41, dx: -11, dy: -12, size: 2, life: 0.13},
  {at: 0.48, dx: 5, dy: -30, size: 2, life: 0.19},
  {at: 0.54, dx: -8, dy: 20, size: 2, life: 0.14},
  {at: 0.61, dx: 14, dy: -16, size: 2, life: 0.16},
  {at: 0.68, dx: -4, dy: 26, size: 2, life: 0.15},
  {at: 0.74, dx: 9, dy: -24, size: 2, life: 0.17},
  {at: 0.81, dx: -12, dy: 14, size: 2, life: 0.14},
  {at: 0.87, dx: 6, dy: -20, size: 2, life: 0.12},
];

const TRAILS: ReadonlyArray<{lag: number; opacity: number; blur: number}> = [
  {lag: 0.015, opacity: 0.42, blur: 1.2},
  {lag: 0.032, opacity: 0.24, blur: 2.4},
  {lag: 0.05, opacity: 0.12, blur: 3.6},
];

const BEAM_SHADOW =
  '0 0 6px #fff, 0 0 20px #CCFF00, 0 0 50px #CCFF00, 0 0 100px rgba(204,255,0,0.55)';

const ENTER = 0.17;
const EXIT = 0.15;

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function smoothstep(t: number): number {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

function easeOutQuart(t: number): number {
  const inv = 1 - clamp01(t);
  return 1 - inv * inv * inv * inv;
}

export const LaserText: React.FC<LaserTextProps> = ({
  text,
  progress,
  fontSize,
  color = COLORS.white,
  italic = true,
  letterSpacing = '-0.05em',
  fontWeight = 700,
  fontFamily = fonts.display,
  showBeam = true,
  glow = false,
  uppercase = true,
  sparks = true,
}) => {
  const reveal = clamp01(progress);
  const growIn = easeOutQuart(reveal / ENTER);
  const shrinkOut = easeOutQuart((1 - reveal) / EXIT);
  const beamLive = Math.min(growIn, shrinkOut);
  const laserOn = showBeam && beamLive > 0.012;

  const sweepA = ENTER * 0.5;
  const sweepB = 1 - EXIT * 0.35;
  const sweep = smoothstep((reveal - sweepA) / (sweepB - sweepA));
  const clipRight = sweep >= 0.995 ? '-0.16em' : `${(1 - sweep) * 100}%`;
  const beamX = reveal <= ENTER ? 0 : Math.min(sweep * 100, 96.5);

  const beamTop = fontSize * -0.55;
  const beamHeight = fontSize * 2.05;
  const sparkOriginY = fontSize * 0.42;
  const flareW = 36 + 112 * beamLive;

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        whiteSpace: 'nowrap',
        overflow: 'visible',
        paddingRight: '0.12em',
      }}
    >
      <div
        style={{
          fontFamily,
          fontSize,
          fontWeight,
          fontStyle: italic ? 'italic' : 'normal',
          color,
          letterSpacing,
          lineHeight: 0.86,
          textTransform: uppercase === false ? undefined : 'uppercase',
          clipPath: `inset(-28% ${clipRight} -28% -0.08em)`,
          textShadow:
            glow || sweep > 0.97
              ? `0 0 ${28 + 14 * sweep}px rgba(204, 255, 0, ${0.18 + 0.12 * sweep}), 0 0 88px rgba(204, 255, 0, 0.1)`
              : undefined,
        }}
      >
        {text}
      </div>
      {laserOn
        ? TRAILS.map((trail) => {
            const p = beamX - trail.lag * 100;
            if (p < -2) return null;
            return (
              <div
                key={trail.lag}
                style={{
                  position: 'absolute',
                  left: `${p}%`,
                  top: beamTop,
                  width: 2,
                  height: beamHeight,
                  transform: `translateX(-50%) scaleY(${beamLive})`,
                  transformOrigin: 'center center',
                  pointerEvents: 'none',
                  opacity: trail.opacity * beamLive,
                  filter: `blur(${trail.blur}px)`,
                  background: '#fff',
                  boxShadow: '0 0 8px #CCFF00, 0 0 22px rgba(204,255,0,0.4)',
                }}
              />
            );
          })
        : null}
      {laserOn ? (
        <div
          style={{
            position: 'absolute',
            left: `${beamX}%`,
            top: beamTop,
            width: 2,
            height: beamHeight,
            transform: `translateX(-50%) scaleY(${beamLive})`,
            transformOrigin: 'center center',
            pointerEvents: 'none',
            opacity: 0.2 + 0.8 * beamLive,
            background: '#fff',
            boxShadow: BEAM_SHADOW,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 64 + 56 * beamLive,
              height: fontSize * 2.6,
              transform: 'translate(-50%, -50%)',
              background:
                'radial-gradient(ellipse 50% 45% at center, rgba(204, 255, 0, 0.35) 0%, rgba(204, 255, 0, 0.08) 50%, transparent 70%)',
              opacity: beamLive,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: flareW,
              height: 1,
              transform: 'translate(-50%, -50%)',
              background:
                'linear-gradient(90deg, transparent 0%, #CCFF00 50%, transparent 100%)',
              opacity: 0.35 + 0.5 * beamLive,
            }}
          />
        </div>
      ) : null}
      {sparks
        ? SPARKS.map((spark, i) => {
            const t = (sweep - spark.at) / spark.life;
            if (t < 0 || t >= 1) return null;
            const ease = 1 - (1 - t) * (1 - t);
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${spark.at * 100}%`,
                  top: sparkOriginY,
                  width: spark.size,
                  height: spark.size,
                  borderRadius: '50%',
                  pointerEvents: 'none',
                  background: COLORS.lime,
                  boxShadow: '0 0 4px #CCFF00, 0 0 8px rgba(204,255,0,0.4)',
                  opacity: (1 - t) * 0.9 * beamLive,
                  transform: `translate(-50%, -50%) translate(${spark.dx * ease}px, ${spark.dy * ease}px) scale(${1.35 * (1 - t)})`,
                }}
              />
            );
          })
        : null}
    </div>
  );
};
