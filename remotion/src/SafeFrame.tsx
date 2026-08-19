import React from 'react';
import type {Layout} from './theme';

export const SafeFrame: React.FC<{layout: Layout}> = ({layout}) => {
  const {safe, width, height, variant} = layout;
  const boxW = safe.xMax - safe.xMin;
  const boxH = safe.yMax - safe.yMin;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 80,
      }}
    >
      {variant === 'reel' ? (
        <>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 250,
              background: 'rgba(255, 45, 85, 0.08)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 400,
              background: 'rgba(255, 45, 85, 0.08)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 120,
              height,
              background: 'rgba(255, 45, 85, 0.06)',
            }}
          />
        </>
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: safe.xMin,
          top: safe.yMin,
          width: boxW,
          height: boxH,
          border: '1px solid rgba(204, 255, 0, 0.45)',
          boxSizing: 'border-box',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: safe.xMin + 8,
          top: safe.yMin + 8,
          fontSize: 11,
          letterSpacing: '0.16em',
          color: 'rgba(204, 255, 0, 0.7)',
          fontFamily: 'monospace',
        }}
      >
        SAFE {width}x{height}
      </div>
    </div>
  );
};
