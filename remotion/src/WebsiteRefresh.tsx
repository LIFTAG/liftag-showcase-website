import React from 'react';
import {AbsoluteFill, Easing, Img, staticFile, useCurrentFrame} from 'remotion';
import {Atmosphere} from './Atmosphere';
import {Grain, Scanlines, Vignette} from './Grain';
import {LaserText} from './LaserText';
import {SafeFrame} from './SafeFrame';
import {SitePlate} from './SitePlate';
import {COPY, type Locale, type ReelCopy} from './copy';
import {
  COLORS,
  clampInterpolate,
  easeDesigned,
  easeOutExp,
  fadeWindow,
  fonts,
  getLayout,
  type Layout,
  type Variant,
} from './theme';

export type WebsiteRefreshProps = {
  variant: Variant;
  showSafe: boolean;
  locale: Locale;
};

export const WebsiteRefresh: React.FC<WebsiteRefreshProps> = ({
  variant = 'reel',
  showSafe = false,
  locale = 'en',
}) => {
  const frame = useCurrentFrame();
  const layout = getLayout(variant);
  const copy = COPY[locale];

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bg,
        fontFamily: fonts.body,
        color: COLORS.white,
      }}
    >
      <Atmosphere frame={frame} layout={layout} />
      <ChargeScene frame={frame} layout={layout} copy={copy} />
      <LaserScene frame={frame} layout={layout} />
      <StatementScene frame={frame} layout={layout} copy={copy} />
      <ProductScene frame={frame} layout={layout} copy={copy} />
      <EndCard frame={frame} layout={layout} copy={copy} />
      <Vignette />
      <Scanlines />
      <Grain />
      {showSafe ? <SafeFrame layout={layout} /> : null}
    </AbsoluteFill>
  );
};

const ChargeScene: React.FC<{frame: number; layout: Layout; copy: ReelCopy}> = ({
  frame,
  layout,
  copy,
}) => {
  const opacity = fadeWindow(frame, [0, 1], [28, 36]);
  if (opacity <= 0) return null;

  const label = clampInterpolate(frame, [2, 14], [0, 1], easeDesigned);
  const rule = clampInterpolate(frame, [6, 24], [0, 1], easeDesigned);
  const tracking = clampInterpolate(frame, [2, 16], [0.46, 0.28], easeDesigned);
  const pulse = clampInterpolate(frame, [10, 26], [0, 1], easeDesigned);
  const ping = clampInterpolate(frame, [20, 34], [0, 1], easeOutExp);
  const y = layout.height / 2 - 10;
  const railW = layout.variant === 'square' ? 280 : 340;

  return (
    <AbsoluteFill style={{opacity}}>
      {ping < 0.99 ? (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: y + 18,
            width: railW + 80,
            height: railW + 80,
            marginLeft: -(railW + 80) / 2,
            marginTop: -(railW + 80) / 2,
            borderRadius: '50%',
            border: '1px solid rgba(204, 255, 0, 0.45)',
            transform: `scale(${0.55 + ping * 0.85})`,
            opacity: (1 - ping) * 0.4,
          }}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: y - 36,
          textAlign: 'center',
          fontFamily: fonts.proto,
          fontSize: layout.protocolSize,
          fontWeight: 500,
          letterSpacing: `${tracking}em`,
          color: COLORS.muted,
          opacity: label,
        }}
      >
        {copy.protocol}
      </div>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: y + 18,
          width: railW,
          height: 1,
          marginLeft: -railW / 2,
          background: COLORS.lime,
          boxShadow: '0 0 12px rgba(204, 255, 0, 0.7), 0 0 28px rgba(204, 255, 0, 0.28)',
          transform: `scaleX(${rule})`,
          transformOrigin: 'center center',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: y + 14,
          width: 1,
          height: 9,
          marginLeft: -railW / 2,
          background: COLORS.lime,
          opacity: rule,
          boxShadow: '0 0 8px rgba(204, 255, 0, 0.7)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: y + 14,
          width: 1,
          height: 9,
          marginLeft: railW / 2,
          background: COLORS.lime,
          opacity: rule,
          boxShadow: '0 0 8px rgba(204, 255, 0, 0.7)',
        }}
      />
      {rule > 0.08 ? (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: y + 16,
            width: 5,
            height: 5,
            marginLeft: -railW / 2 + pulse * railW - 2.5,
            borderRadius: '50%',
            background: '#fff',
            opacity: 0.95,
            boxShadow: '0 0 8px #fff, 0 0 18px #CCFF00, 0 0 32px rgba(204, 255, 0, 0.7)',
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

const LaserScene: React.FC<{frame: number; layout: Layout}> = ({
  frame,
  layout,
}) => {
  const opacity = fadeWindow(frame, [32, 34], [148, 160]);
  if (opacity <= 0) return null;

  const progress = clampInterpolate(frame, [32, 68], [0, 1], Easing.inOut(Easing.quad));
  const settle = clampInterpolate(frame, [72, 78], [0, 1], easeDesigned);
  const x = clampInterpolate(settle, [0, 1], [layout.width / 2, layout.contentX]);
  const selfX = clampInterpolate(settle, [0, 1], [-50, 0]);
  const y = clampInterpolate(settle, [0, 1], [layout.wordmarkY, layout.wordmarkSettledY]);
  const scale = clampInterpolate(settle, [0, 1], [
    1,
    layout.wordmarkSettledSize / layout.wordmarkSize,
  ]);

  const flash = fadeWindow(frame, [62, 64], [66, 74]);

  return (
    <AbsoluteFill style={{opacity, overflow: 'visible'}}>
      {flash > 0 ? (
        <AbsoluteFill style={{background: COLORS.lime, opacity: flash * 0.07}} />
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          transform: `translate(${x}px, ${y}px) translateX(${selfX}%) scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <LaserText
          text="LIFTAG"
          progress={progress}
          fontSize={layout.wordmarkSize}
          showBeam={settle < 0.15}
          glow={progress > 0.98}
        />
      </div>
    </AbsoluteFill>
  );
};

const StatementScene: React.FC<{frame: number; layout: Layout; copy: ReelCopy}> = ({
  frame,
  layout,
  copy,
}) => {
  const opacity = fadeWindow(frame, [76, 80], [148, 160]);
  if (opacity <= 0) return null;

  const line1 = clampInterpolate(frame, [78, 96], [0, 1], Easing.inOut(Easing.quad));
  const line2 = clampInterpolate(frame, [88, 106], [0, 1], Easing.inOut(Easing.quad));
  const line3 = clampInterpolate(frame, [96, 114], [0, 1], Easing.inOut(Easing.quad));
  const under = clampInterpolate(frame, [114, 128], [0, 1], easeDesigned);
  const punch =
    frame < 113
      ? 1
      : clampInterpolate(frame, [113, 124], [1.03, 1], easeOutExp);
  const shakeX = frame === 114 ? 3 : frame === 115 ? -2 : 0;
  const glitchOn = frame >= 114 && frame <= 115;
  const glitchAmt = frame === 115 ? 6 : 4;
  const flash = glitchOn ? (frame === 115 ? 0.14 : 0.08) : 0;

  return (
    <AbsoluteFill style={{opacity}}>
      {flash > 0 ? (
        <AbsoluteFill style={{background: COLORS.red, opacity: flash}} />
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: layout.contentX,
          top: layout.statementY,
          display: 'flex',
          flexDirection: 'column',
          gap: layout.variant === 'square' ? 6 : 10,
          overflow: 'visible',
          transform: `translateX(${shakeX}px)`,
        }}
      >
        <LaserText
          text={copy.line1}
          progress={line1}
          fontSize={layout.statementSize}
          sparks={false}
        />
        <LaserText
          text={copy.line2}
          progress={line2}
          fontSize={layout.statementSize}
          sparks={false}
        />
        <div
          style={{
            position: 'relative',
            display: 'inline-block',
            transform: `scale(${punch})`,
            transformOrigin: 'left center',
          }}
        >
          {glitchOn ? (
            <>
              <span
                style={{
                  ...refreshStyle(layout.refreshSize),
                  position: 'absolute',
                  left: glitchAmt,
                  top: -1,
                  color: COLORS.red,
                  opacity: 0.85,
                }}
              >
                {copy.refresh}
              </span>
              <span
                style={{
                  ...refreshStyle(layout.refreshSize),
                  position: 'absolute',
                  left: -glitchAmt + 1,
                  top: 1,
                  color: COLORS.lime,
                  opacity: 0.7,
                }}
              >
                {copy.refresh}
              </span>
            </>
          ) : null}
          <LaserText
            text={copy.refresh}
            progress={line3}
            fontSize={layout.refreshSize}
            color={COLORS.lime}
            letterSpacing="-0.04em"
            glow={line3 > 0.96}
          />
          <div
            style={{
              width: '100%',
              height: 2,
              marginTop: layout.variant === 'square' ? 8 : 12,
              background: COLORS.lime,
              boxShadow: '0 0 12px rgba(204, 255, 0, 0.55)',
              transform: `scaleX(${under})`,
              transformOrigin: 'left center',
              opacity: under,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const refreshStyle = (fontSize: number): React.CSSProperties => ({
  fontFamily: fonts.display,
  fontStyle: 'italic',
  fontWeight: 700,
  fontSize,
  letterSpacing: '-0.04em',
  lineHeight: 0.84,
  textTransform: 'uppercase',
  color: COLORS.lime,
  paddingRight: '0.22em',
});

const captionRow = (
  layout: Layout,
  tracking: string,
  parts: readonly string[],
  ops: readonly number[],
): React.ReactNode => (
  <div
    style={{
      position: 'absolute',
      left: layout.contentX,
      top: layout.captionY,
      display: 'flex',
      alignItems: 'center',
      gap: layout.variant === 'square' ? 12 : 16,
      fontFamily: fonts.proto,
      fontSize: layout.captionSize,
      fontWeight: 500,
      letterSpacing: tracking,
      color: COLORS.lime,
    }}
  >
    {parts.map((part, i) => {
      const op = ops[i] ?? 0;
      return (
        <React.Fragment key={part}>
          {i > 0 ? (
            <span style={{opacity: op * 0.55, letterSpacing: 0}}>·</span>
          ) : null}
          <span style={{opacity: op}}>{part}</span>
        </React.Fragment>
      );
    })}
  </div>
);

const ProductScene: React.FC<{frame: number; layout: Layout; copy: ReelCopy}> = ({
  frame,
  layout,
  copy,
}) => {
  const opacity = fadeWindow(frame, [154, 162], [288, 308]);
  if (opacity <= 0) return null;

  const recede = clampInterpolate(frame, [288, 308], [0, 1], easeDesigned);
  const mark = fadeWindow(frame, [160, 172], [284, 300]);
  const siteIn = clampInterpolate(frame, [156, 176], [0, 1], easeOutExp);
  const scan = clampInterpolate(frame, [168, 198], [0, 1], easeDesigned);
  const sweep = clampInterpolate(frame, [186, 220], [0, 1], easeDesigned);
  const imageScale = clampInterpolate(frame, [168, 226], [1.055, 1], easeDesigned);
  const page = clampInterpolate(frame, [208, 230], [0, 1], easeDesigned);
  const libScan = clampInterpolate(frame, [212, 242], [0, 1], easeDesigned);
  const libSweep = clampInterpolate(frame, [226, 268], [0, 1], easeDesigned);
  const libScale = clampInterpolate(frame, [212, 270], [1.05, 1], easeDesigned);
  const part0 = fadeWindow(frame, [172, 184], [208, 222]);
  const part1 = fadeWindow(frame, [180, 192], [208, 222]);
  const part2 = fadeWindow(frame, [188, 200], [208, 222]);
  const lib0 = fadeWindow(frame, [220, 234], [288, 304]);
  const lib1 = fadeWindow(frame, [226, 240], [288, 304]);
  const idle = Math.sin(frame / 36) * 1.2;
  const idleY = Math.sin(frame / 44) * 3;
  const groupY = recede * 80 + idleY * (1 - recede);
  const groupScale = 1 - recede * 0.1;
  const heroOp = siteIn * (1 - page);
  const libOp = page;

  return (
    <AbsoluteFill style={{opacity}}>
      <div
        style={{
          position: 'absolute',
          left: layout.contentX,
          top: layout.wordmarkSettledY,
          opacity: mark,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Img
          src={staticFile('logo.svg')}
          style={{width: layout.markSize, height: layout.markSize, display: 'block'}}
        />
        <span
          style={{
            fontFamily: fonts.display,
            fontStyle: 'italic',
            fontWeight: 700,
            fontSize: layout.wordmarkSettledSize * 0.72,
            letterSpacing: '-0.04em',
            color: COLORS.white,
          }}
        >
          LIFTAG
        </span>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: layout.siteY,
          height: layout.siteH + 80,
          perspective: 1800,
          perspectiveOrigin: '50% 40%',
          transform: `translateY(${groupY}px) scale(${groupScale})`,
          transformOrigin: 'center center',
        }}
      >
        {heroOp > 0.01 ? (
          <SitePlate
            src="screens/site-hero.jpg"
            width={layout.siteW}
            height={layout.siteH}
            rotateY={-8 + siteIn * 3 + idle * (1 - recede) - page * 10}
            rotateX={4.5 - siteIn * 2.5}
            translateX={-page * 36}
            translateY={(1 - siteIn) * 140}
            scale={0.94 + siteIn * 0.06 - page * 0.04}
            opacity={heroOp}
            sweep={sweep}
            scan={scan}
            imageScale={imageScale}
            reflect={layout.variant === 'reel'}
          />
        ) : null}
        {libOp > 0.01 ? (
          <SitePlate
            src="screens/site-library.jpg"
            width={layout.siteW}
            height={layout.siteH}
            rotateY={4 - page * 10 + idle * (1 - recede)}
            rotateX={3 - page * 1.5}
            translateX={(1 - page) * 48}
            translateY={(1 - page) * 90}
            scale={0.92 + page * 0.08}
            opacity={libOp}
            sweep={libSweep}
            scan={libScan}
            imageScale={libScale}
            reflect={layout.variant === 'reel'}
          />
        ) : null}
      </div>
      {captionRow(layout, copy.productTracking, copy.productParts, [part0, part1, part2])}
      {captionRow(layout, copy.productTracking, copy.libraryParts, [lib0, lib1])}
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{frame: number; layout: Layout; copy: ReelCopy}> = ({
  frame,
  layout,
  copy,
}) => {
  const opacity = fadeWindow(frame, [288, 296], [1000, 1001]);
  if (opacity <= 0) return null;

  const urlProgress = clampInterpolate(frame, [292, 316], [0, 1], Easing.inOut(Easing.quad));
  const urlScale = clampInterpolate(frame, [292, 312], [1.08, 1], easeOutExp);
  const tag = clampInterpolate(frame, [304, 318], [0, 1], easeDesigned);
  const mark = clampInterpolate(frame, [290, 304], [0, 1], easeDesigned);
  const markScale = clampInterpolate(frame, [290, 306], [0.86, 1], easeOutExp);
  const under = clampInterpolate(frame, [308, 324], [0, 1], easeDesigned);
  const tagTrack = clampInterpolate(frame, [304, 322], [0.26, 0.16], easeDesigned);
  const caretOn =
    urlProgress > 0.98 && frame < 336 && Math.floor(frame / 7) % 2 === 0;

  return (
    <AbsoluteFill style={{opacity}}>
      <div
        style={{
          position: 'absolute',
          left: layout.contentX,
          top: layout.endY,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        <div
          style={{
            opacity: mark,
            marginBottom: layout.variant === 'square' ? 18 : 22,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            transform: `scale(${markScale})`,
            transformOrigin: 'left center',
          }}
        >
          <Img
            src={staticFile('logo.svg')}
            style={{
              width: layout.markSize,
              height: layout.markSize,
              display: 'block',
              filter:
                mark > 0.9
                  ? 'drop-shadow(0 0 10px rgba(204, 255, 0, 0.35))'
                  : undefined,
            }}
          />
          <span
            style={{
              fontFamily: fonts.display,
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: layout.wordmarkSettledSize * 0.72,
              letterSpacing: '-0.04em',
              color: COLORS.white,
            }}
          >
            LIFTAG
          </span>
        </div>
        <div
          style={{
            transform: `scale(${urlScale})`,
            transformOrigin: 'left center',
            display: 'flex',
            alignItems: 'flex-start',
          }}
        >
          <div style={{display: 'inline-block'}}>
            <LaserText
              text="liftag.fit"
              progress={urlProgress}
              fontSize={layout.urlSize}
              italic={false}
              uppercase={false}
              letterSpacing="-0.045em"
              glow={urlProgress > 0.96}
            />
            <div
              style={{
                width: '100%',
                height: 2,
                marginTop: 14,
                background: COLORS.lime,
                boxShadow: '0 0 12px rgba(204, 255, 0, 0.5)',
                transform: `scaleX(${under})`,
                transformOrigin: 'left center',
                opacity: under,
              }}
            />
          </div>
          <div
            style={{
              width: 3,
              height: layout.urlSize * 0.72,
              marginLeft: 6,
              marginTop: layout.urlSize * 0.08,
              background: COLORS.lime,
              opacity: caretOn ? 0.9 : 0,
              boxShadow: '0 0 10px rgba(204, 255, 0, 0.7)',
            }}
          />
        </div>
        <div
          style={{
            marginTop: layout.variant === 'square' ? 28 : 36,
            opacity: tag,
            fontFamily: fonts.proto,
            fontSize: layout.taglineSize,
            fontWeight: 500,
            letterSpacing: `${tagTrack}em`,
            color: COLORS.muted,
          }}
        >
          {copy.tagline}
        </div>
      </div>
    </AbsoluteFill>
  );
};
