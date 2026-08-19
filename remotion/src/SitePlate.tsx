import React from 'react';
import {Img, staticFile} from 'remotion';
import {COLORS, fonts} from './theme';

type SitePlateProps = {
  src: string;
  width: number;
  height: number;
  rotateY: number;
  rotateX?: number;
  translateX: number;
  translateY: number;
  scale: number;
  opacity: number;
  sweep?: number;
  scan?: number;
  imageScale?: number;
  reflect?: boolean;
};

export const SitePlate: React.FC<SitePlateProps> = ({
  src,
  width,
  height,
  rotateY,
  rotateX = 0,
  translateX,
  translateY,
  scale,
  opacity,
  sweep = 0,
  scan,
  imageScale = 1,
  reflect = false,
}) => {
  const chromeH = 42;
  const pageH = height - chromeH;
  const developing = scan !== undefined;
  const scanAmt = developing ? Math.min(1, Math.max(0, scan)) : 1;
  const painted = !developing || scanAmt >= 0.995;
  const sweepX = -40 + sweep * 140;

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: 0,
        width,
        height,
        marginLeft: -width / 2,
        opacity,
        transform: `translateX(${translateX}px) translateY(${translateY}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
        transformOrigin: 'center center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '12%',
          right: '12%',
          top: height - 8,
          height: 56,
          borderRadius: '50%',
          background: 'rgba(204, 255, 0, 0.14)',
          filter: 'blur(22px)',
          transform: 'scaleY(0.4)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '8%',
          right: '8%',
          top: height - 18,
          height: 48,
          borderRadius: '50%',
          background: 'rgba(0, 0, 0, 0.55)',
          filter: 'blur(18px)',
          transform: 'scaleY(0.45)',
        }}
      />
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 22,
          overflow: 'hidden',
          background: COLORS.bezel,
          border: `1px solid ${COLORS.rim}`,
          boxShadow: `
            0 0 0 1px rgba(204, 255, 0, 0.16),
            0 28px 90px rgba(0, 0, 0, 0.68),
            0 0 80px rgba(204, 255, 0, 0.06),
            inset 0 0 0 1px rgba(204, 255, 0, 0.06)
          `,
        }}
      >
        <div
          style={{
            position: 'relative',
            height: chromeH,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '0 14px',
            background: '#101110',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <span style={dot('#FF5F57')} />
          <span style={dot('#FEBC2E')} />
          <span style={dot('#28C840')} />
          <div
            style={{
              flex: 1,
              height: 22,
              borderRadius: 7,
              background: '#1A1B19',
              color: COLORS.muted,
              fontFamily: fonts.proto,
              fontSize: 12,
              letterSpacing: '0.08em',
              display: 'flex',
              alignItems: 'center',
              padding: '0 10px',
            }}
          >
            liftag.fit
          </div>
          {developing ? (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: 1,
                background: 'rgba(204, 255, 0, 0.08)',
              }}
            >
              <div
                style={{
                  width: `${scanAmt * 100}%`,
                  height: '100%',
                  background: COLORS.lime,
                  boxShadow: '0 0 8px rgba(204, 255, 0, 0.7)',
                }}
              />
            </div>
          ) : null}
        </div>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: pageH,
            overflow: 'hidden',
            background: '#070807',
          }}
        >
          <Img
            src={staticFile(src)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top center',
              display: 'block',
              transform: `scale(${imageScale})`,
              transformOrigin: 'center top',
              clipPath: painted
                ? undefined
                : `inset(0 0 ${(1 - scanAmt) * 100}% 0)`,
            }}
          />
          {developing && scanAmt > 0.02 && scanAmt < 0.99 ? (
            <>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: scanAmt * pageH - 36,
                  height: 36,
                  background:
                    'linear-gradient(to bottom, transparent, rgba(204, 255, 0, 0.1))',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: scanAmt * pageH,
                  height: 2,
                  background: COLORS.lime,
                  boxShadow:
                    '0 0 8px #CCFF00, 0 0 22px rgba(204, 255, 0, 0.85)',
                }}
              />
            </>
          ) : null}
          {sweep > 0.02 && sweep < 0.98 ? (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(105deg, transparent ${sweepX}%, rgba(255,255,255,0.07) ${sweepX + 12}%, transparent ${sweepX + 24}%)`,
                mixBlendMode: 'screen',
              }}
            />
          ) : null}
        </div>
      </div>
      {reflect ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: height + 10,
            height: height * 0.28,
            overflow: 'hidden',
            opacity: 0.22,
            transform: 'scaleY(-1)',
            transformOrigin: 'top center',
            maskImage:
              'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 72%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 72%)',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: '100%',
              height,
              borderRadius: 22,
              overflow: 'hidden',
              background: COLORS.bezel,
              filter: 'blur(0.4px)',
            }}
          >
            <div style={{height: chromeH, background: '#101110'}} />
            <Img
              src={staticFile(src)}
              style={{
                width: '100%',
                height: pageH,
                objectFit: 'cover',
                objectPosition: 'top center',
                display: 'block',
                clipPath: painted
                  ? undefined
                  : `inset(0 0 ${(1 - scanAmt) * 100}% 0)`,
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

const dot = (color: string): React.CSSProperties => ({
  width: 9,
  height: 9,
  borderRadius: '50%',
  background: color,
  flex: '0 0 auto',
});
