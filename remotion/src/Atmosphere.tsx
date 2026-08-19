import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, fadeWindow, hash01, type Layout} from './theme';

type AtmosphereProps = {
  frame: number;
  layout: Layout;
};

const MOTE_COUNT = 14;

type Mote = {
  x: number;
  y: number;
  size: number;
  opacity: number;
  phase: number;
  ampX: number;
  ampY: number;
  speed: number;
};

const MOTES: ReadonlyArray<Mote> = Array.from({length: MOTE_COUNT}, (_, i) => ({
  x: hash01(i * 7 + 1),
  y: hash01(i * 7 + 2),
  size: 1 + hash01(i * 7 + 3) * 2,
  opacity: 0.1 + hash01(i * 7 + 4) * 0.12,
  phase: hash01(i * 7 + 5) * Math.PI * 2,
  ampX: 8 + hash01(i * 7 + 6) * 10,
  ampY: 6 + hash01(i * 7 + 7) * 8,
  speed: 0.008 + hash01(i * 7 + 8) * 0.006,
}));

const BRACKET = 18;

export const Atmosphere: React.FC<AtmosphereProps> = ({frame, layout}) => {
  const live = Math.min(frame, 280);
  const isSquare = layout.variant === 'square';
  const breath = 0.0575 + 0.0125 * Math.sin((live / 18) * Math.PI);
  const laser = fadeWindow(frame, [32, 40], [70, 78]);
  const punch = fadeWindow(frame, [112, 116], [120, 128]);
  const product = fadeWindow(frame, [154, 166], [228, 246]);
  const glow = breath + laser * 0.034 + punch * 0.048 + product * 0.02;

  const statementFloor = fadeWindow(frame, [80, 96], [142, 156]);
  const productFloor = fadeWindow(frame, [154, 168], [228, 246]);
  const floorOpacity =
    statementFloor * (isSquare ? 0.085 : 0.095) + productFloor * 0.055;

  const fiducials = fadeWindow(frame, [2, 12], [58, 72]);
  const {safe} = layout;
  const pad = isSquare ? 20 : 14;
  const arm = BRACKET;
  const corners = [
    {left: safe.xMin + pad, top: safe.yMin + pad, topEdge: true, leftEdge: true},
    {
      left: safe.xMax - pad - arm,
      top: safe.yMin + pad,
      topEdge: true,
      leftEdge: false,
    },
    {
      left: safe.xMin + pad,
      top: safe.yMax - pad - arm,
      topEdge: false,
      leftEdge: true,
    },
    {
      left: safe.xMax - pad - arm,
      top: safe.yMax - pad - arm,
      topEdge: false,
      leftEdge: false,
    },
  ];

  const side = isSquare ? 72 : 24;
  const floorBottom = isSquare ? 48 : 0;
  const safeW = safe.xMax - safe.xMin;
  const safeH = safe.yMax - safe.yMin;

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 48% at 50% 46%, rgba(204, 255, 0, ${glow}) 0%, transparent 68%)`,
        }}
      />
      {floorOpacity > 0.001 ? (
        <div
          style={{
            position: 'absolute',
            left: side,
            right: side,
            bottom: floorBottom,
            height: isSquare ? '46%' : '52%',
            perspective: isSquare ? 760 : 980,
            perspectiveOrigin: '50% 0%',
            overflow: 'hidden',
            opacity: floorOpacity,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '-28%',
              width: '156%',
              bottom: '-8%',
              height: '165%',
              transform: `rotateX(${isSquare ? 74 : 72}deg)`,
              transformOrigin: '50% 100%',
              backgroundImage: `
                linear-gradient(rgba(204, 255, 0, 0.9) 1px, transparent 1px),
                linear-gradient(90deg, rgba(204, 255, 0, 0.9) 1px, transparent 1px)
              `,
              backgroundSize: '70px 70px',
              maskImage:
                'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.35) 40%, transparent 72%)',
              WebkitMaskImage:
                'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.35) 40%, transparent 72%)',
            }}
          />
        </div>
      ) : null}
      {fiducials > 0.001
        ? corners.map((c, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: c.left,
                top: c.top,
                width: arm,
                height: arm,
                opacity: fiducials * 0.42,
                borderTop: c.topEdge ? `1px solid ${COLORS.lime}` : undefined,
                borderBottom: c.topEdge ? undefined : `1px solid ${COLORS.lime}`,
                borderLeft: c.leftEdge ? `1px solid ${COLORS.lime}` : undefined,
                borderRight: c.leftEdge ? undefined : `1px solid ${COLORS.lime}`,
                boxSizing: 'border-box',
              }}
            />
          ))
        : null}
      {MOTES.map((mote, i) => {
        const x = safe.xMin + mote.x * safeW + Math.sin(live * mote.speed + mote.phase) * mote.ampX;
        const y =
          safe.yMin +
          mote.y * safeH +
          Math.cos(live * mote.speed * 0.82 + mote.phase * 0.7) * mote.ampY;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: mote.size,
              height: mote.size,
              borderRadius: '50%',
              background: COLORS.lime,
              opacity: mote.opacity,
              boxShadow: '0 0 5px rgba(204, 255, 0, 0.35)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
