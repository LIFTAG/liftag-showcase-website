/** Frozen entry-only artwork and choreography. Portable: no app or native imports. */
export const LOGO_VIEWBOX = 887;
export const MARK_CENTER_X = 443.174;
export const MARK_CENTER_Y = 429.744;
export const RING_MID_RADIUS = 387.7767;
export const RING_WIDTH = 83.93460000000005;
export const LOGO_MARK_PATH = "M443.174 0C680.515 0 872.918 192.403 872.918 429.744C872.918 667.085 680.515 859.488 443.174 859.488C349.377 859.488 262.599 829.439 191.941 778.441L190.275 777.232C172.448 764.235 155.658 749.9 140.055 734.374L138.549 732.867C111.488 705.673 88.044 674.876 68.9998 641.259C33.6246 578.814 13.4295 506.637 13.4295 429.744C13.4296 192.403 205.833 6.60082e-05 443.174 0ZM443.174 83.9346C252.188 83.9346 97.3641 238.759 97.3641 429.744C97.3641 478.129 107.257 524.048 125.099 565.718H195.189C197.785 561.229 200.588 556.749 203.608 552.282L203.671 552.324L388.185 232.735L335.737 202.454L506.899 107.437L510.192 303.176L457.967 273.023L288.011 567.396H600.971V535.502C600.971 525.304 609.238 517.036 619.436 517.036C629.634 517.036 637.901 525.304 637.901 535.502V548.932C637.901 540.588 644.666 533.823 653.01 533.823C661.354 533.823 668.118 540.588 668.118 548.932V669.797C668.118 678.141 661.353 684.905 653.01 684.905C644.666 684.905 637.901 678.141 637.901 669.797V679.869C637.901 690.067 629.634 698.335 619.436 698.335C609.238 698.335 600.971 690.067 600.971 679.869V647.974H254.704C254.321 654.577 254.875 660.773 256.072 666.607C260.139 686.427 272.766 707.407 294.081 728.56C303.444 737.851 313.981 746.675 325.252 754.951C362.021 768.286 401.712 775.554 443.174 775.554C634.159 775.554 788.983 620.73 788.983 429.744C788.983 238.759 634.159 83.9346 443.174 83.9346Z";

/** Milliseconds of choreography; this never imposes a minimum loading time. */
export const LOGO_ASSEMBLY_MS: number = 1750;
/** Mark draws on centre stage, then yields left for the word. */
export const LOGO_NAME_MS: number = 840;
/** Slide plus letter seat, including the last character's stagger. */
export const LOGO_SIGN_MS: number = 800;
/** Flight of the assembled lockup into the header. */
export const LOGO_FLIGHT_MS: number = 850;
/** Overlay unmount; slightly after the flight so the last pose can hold. */
export const LOGO_OPEN_MS: number = 880;

// Centreline reveals fill the artwork, rather than tracing its perimeter.
// The generous connector mask is clipped to the original logo: its asymmetric
// bend and the short bridge on the left must not become a generic rounded L.
// Start on the left band at the height of the bar/arrow root. The two fronts
// leave this junction together, before the connecting curve grows inward.
const ringStartY: number = 607.685;
const ringStartX: number = MARK_CENTER_X - Math.sqrt(
  RING_MID_RADIUS ** 2 - (ringStartY - MARK_CENTER_Y) ** 2,
);
const ringOppositeX: number = 2 * MARK_CENTER_X - ringStartX;
const ringOppositeY: number = 2 * MARK_CENTER_Y - ringStartY;

/** The shared root stays embedded in the circle while the branches unfurl. */
export const LOGO_ASSEMBLY_ORIGIN = { x: ringStartX, y: ringStartY } as const;

export const LOGO_ASSEMBLY_PATHS = {
  bar: "M238 607.685H600.971",
  connector: "M190 606C190 700 235 758 310.55 794.13",
  ringClockwise: `M${ringStartX} ${ringStartY}A${RING_MID_RADIUS} ${RING_MID_RADIUS} 0 0 1 ${ringOppositeX} ${ringOppositeY}`,
  ringCounterclockwise: `M${ringStartX} ${ringStartY}A${RING_MID_RADIUS} ${RING_MID_RADIUS} 0 0 0 ${ringOppositeX} ${ringOppositeY}`,
  innerPlate:
    "M600.971 535.502C600.971 525.304 609.238 517.036 619.436 517.036C629.634 517.036 637.901 525.304 637.901 535.502V679.869C637.901 690.067 629.634 698.335 619.436 698.335C609.238 698.335 600.971 690.067 600.971 679.869Z",
  outerPlate:
    "M637.901 548.932C637.901 540.588 644.666 533.823 653.01 533.823C661.354 533.823 668.118 540.588 668.118 548.932V669.797C668.118 678.141 661.353 684.905 653.01 684.905C644.666 684.905 637.901 678.141 637.901 669.797Z",
} as const;

export interface LogoAssemblyFrame {
  root: number;
  shaft: number;
  head: number;
  bar: number;
  innerPlate: number;
  innerPlateOpacity: number;
  outerPlate: number;
  outerPlateOpacity: number;
  connector: number;
  ring: number;
  settle: number;
  /** A tiny load transfer, in artwork units, shared by the bar and plates. */
  load: number;
  complete: boolean;
}

function phase(ms: number, start: number, end: number): number {
  "worklet";
  return Math.max(0, Math.min(1, (ms - start) / (end - start)));
}

/** Critically damped draw: quick acceleration, then a smooth, monotonic landing. */
function draw(t: number): number {
  "worklet";
  return (1 - (1 + 6 * t) * Math.exp(-6 * t)) / (1 - 7 * Math.exp(-6));
}

/** Damped spring with a restrained 4.5% overshoot and exact endpoint values. */
function spring(t: number): number {
  "worklet";
  return (1 - Math.exp(-7 * t) * (Math.cos(7 * t) + Math.sin(7 * t))) /
    (1 - Math.exp(-7) * (Math.cos(7) + Math.sin(7)));
}

function impact(ms: number, start: number): number {
  "worklet";
  const t: number = phase(ms, start, start + 260);
  return Math.sin(t * Math.PI * 2) * (1 - t) * 5;
}

/** One UI-thread clock keeps all pieces in phase, even while boot blocks JS. */
export function logoAssemblyFrame(progress: number): LogoAssemblyFrame {
  "worklet";
  const ms: number = progress * LOGO_ASSEMBLY_MS;
  return {
    root: draw(phase(ms, 160, 480)),
    shaft: spring(phase(ms, 205, 820)),
    head: spring(phase(ms, 320, 980)),
    bar: draw(phase(ms, 205, 680)),
    innerPlate: spring(phase(ms, 700, 1130)),
    innerPlateOpacity: phase(ms, 700, 770),
    outerPlate: spring(phase(ms, 930, 1390)),
    outerPlateOpacity: phase(ms, 930, 1000),
    connector: draw(phase(ms, 160, 740)),
    ring: draw(phase(ms, 0, 1550)),
    settle: spring(phase(ms, 0, 1100)),
    load: impact(ms, 845) + impact(ms, 1085),
    complete: progress >= 1,
  };
}

/** Grow out of the ring band without exposing a full-width cap at onset. */
export function logoRootScale(root: number): { x: number; y: number } {
  "worklet";
  return { x: root, y: 0.4 + 0.6 * root };
}

/**
 * A single seven-vertex outline, growing from a rectangle into the source arrow.
 * At head=0 the five leading vertices are collinear: a flat rectangular end.
 * The shoulders then flare while the midpoint extends into the tip, so the
 * head stays physically joined to the shaft throughout, with no alpha reveal.
 * Paired x/y coordinates let both the native builder and raster tests use the
 * same geometry without parsing an SVG string on every animation frame.
 */
export function logoArrowPoints(shaft: number, head: number): readonly number[] {
  "worklet";
  const leftX: number = 183.333 + (388.185 - 183.333) * shaft;
  const leftY: number = 587.541 + (232.735 - 587.541) * shaft;
  const rightX: number = 253.115 + (457.967 - 253.115) * shaft;
  const rightY: number = 627.829 + (273.023 - 627.829) * shaft;
  return [
    183.333, 587.541,
    leftX, leftY,
    leftX - 52.448 * head, leftY - 30.281 * head,
    (leftX + rightX) / 2 + 83.823 * head,
    (leftY + rightY) / 2 - 145.442 * head,
    rightX + 52.225 * head, rightY + 30.153 * head,
    rightX, rightY,
    253.115, 627.829,
  ];
}
