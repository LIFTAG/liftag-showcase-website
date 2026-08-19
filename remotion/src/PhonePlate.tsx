import React from 'react';
import {Img, staticFile} from 'remotion';
import {COLORS} from './theme';

type PhonePlateProps = {
  src: string;
  width: number;
  height: number;
  rotateY: number;
  translateX: number;
  translateY: number;
  scale: number;
  opacity: number;
  zIndex: number;
};

export const PhonePlate: React.FC<PhonePlateProps> = ({
  src,
  width,
  height,
  rotateY,
  translateX,
  translateY,
  scale,
  opacity,
  zIndex,
}) => {
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
        zIndex,
        transform: `translateX(${translateX}px) translateY(${translateY}px) rotateY(${rotateY}deg) scale(${scale})`,
        transformOrigin: 'center center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 48,
          background: COLORS.bezel,
          border: `1.5px solid ${COLORS.rim}`,
          overflow: 'hidden',
          boxShadow: `
            0 0 0 1px rgba(204, 255, 0, 0.18),
            0 24px 56px rgba(0, 0, 0, 0.7),
            0 0 40px rgba(204, 255, 0, 0.05),
            inset 0 0 0 1px rgba(204, 255, 0, 0.06)
          `,
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>
    </div>
  );
};
