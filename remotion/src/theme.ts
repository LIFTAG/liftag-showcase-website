import {Easing, interpolate} from 'remotion';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadJetBrainsMono} from '@remotion/google-fonts/JetBrainsMono';
import {loadFont as loadSpaceGrotesk} from '@remotion/google-fonts/SpaceGrotesk';

const space = loadSpaceGrotesk('normal', {
  weights: ['500', '600', '700'],
  subsets: ['latin'],
});
const inter = loadInter('normal', {
  weights: ['400', '500'],
  subsets: ['latin'],
});
const mono = loadJetBrainsMono('normal', {
  weights: ['400', '500', '700'],
  subsets: ['latin'],
});

export const fonts = {
  display: space.fontFamily,
  body: inter.fontFamily,
  proto: mono.fontFamily,
};

export const COLORS = {
  bg: '#070807',
  surface: '#0E0E0E',
  lime: '#CCFF00',
  red: '#FF2D55',
  white: '#F4F5F0',
  muted: 'rgba(244, 245, 240, 0.42)',
  dim: 'rgba(244, 245, 240, 0.22)',
  rim: '#333333',
  bezel: '#0A0A0A',
  ink: '#0E0E0E',
} as const;

export const FPS = 30;
export const DURATION = 360;

export type Variant = 'reel' | 'square';

export type SafeBox = {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
};

export type Layout = {
  variant: Variant;
  width: number;
  height: number;
  safe: SafeBox;
  contentX: number;
  wordmarkSize: number;
  wordmarkSettledSize: number;
  wordmarkY: number;
  wordmarkSettledY: number;
  statementY: number;
  statementSize: number;
  refreshSize: number;
  siteW: number;
  siteH: number;
  siteY: number;
  captionY: number;
  captionSize: number;
  urlSize: number;
  pillSize: number;
  taglineSize: number;
  endY: number;
  protocolSize: number;
  markSize: number;
};

export function getLayout(variant: Variant): Layout {
  const isSquare = variant === 'square';
  return {
    variant,
    width: 1080,
    height: isSquare ? 1080 : 1920,
    safe: isSquare
      ? {xMin: 72, xMax: 1008, yMin: 72, yMax: 1008}
      : {xMin: 80, xMax: 960, yMin: 280, yMax: 1480},
    contentX: isSquare ? 80 : 96,
    wordmarkSize: isSquare ? 132 : 176,
    wordmarkSettledSize: isSquare ? 48 : 58,
    wordmarkY: isSquare ? 404 : 812,
    wordmarkSettledY: isSquare ? 88 : 304,
    statementY: isSquare ? 260 : 548,
    statementSize: isSquare ? 68 : 90,
    refreshSize: isSquare ? 100 : 132,
    siteW: isSquare ? 800 : 940,
    siteH: isSquare ? 450 : 590,
    siteY: isSquare ? 176 : 390,
    captionY: isSquare ? 668 : 1140,
    captionSize: isSquare ? 16 : 20,
    urlSize: isSquare ? 92 : 136,
    pillSize: isSquare ? 20 : 24,
    taglineSize: isSquare ? 13 : 15,
    endY: isSquare ? 348 : 680,
    protocolSize: isSquare ? 15 : 18,
    markSize: isSquare ? 40 : 48,
  };
}

export const easeOutExp = Easing.out(Easing.exp);
export const easeDesigned = Easing.bezier(0.16, 1, 0.3, 1);

export function clampInterpolate(
  frame: number,
  input: readonly [number, number],
  output: readonly [number, number],
  easing?: (t: number) => number,
): number {
  return interpolate(frame, input, output, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });
}

export function fadeWindow(
  frame: number,
  fadeIn: readonly [number, number],
  fadeOut: readonly [number, number],
): number {
  return (
    clampInterpolate(frame, fadeIn, [0, 1]) *
    clampInterpolate(frame, fadeOut, [1, 0])
  );
}

/** Deterministic 0..1 hash. Use this instead of Math.random() for motes/sparks. */
export function hash01(seed: number): number {
  const t = Math.sin(seed * 12.9898 + 78.233) * 43758.5453123;
  return t - Math.floor(t);
}
