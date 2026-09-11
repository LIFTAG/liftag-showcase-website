import type { PhoneBox } from "./handoff.ts";
import { clamp01, smoothstep } from "./timeline.ts";

/** Review card fade as it blooms from the Bratislava pin. */
export type ListingMorphBeats = {
  card: number;
};

export function listingMorphBeats(listing: number): ListingMorphBeats {
  const m = clamp01(listing);
  return {
    card: smoothstep(m / 0.22),
  };
}

export type DiscoveryListingStyle = {
  listing: number;
  card: number;
  phoneOut: number;
  box: (PhoneBox & { radius: number }) | null;
};

/** CSS vars published by the discovery sticky, read by the cinema overlay. */
export function listingFromStyle(style: CSSStyleDeclaration): DiscoveryListingStyle {
  const listing = Number.parseFloat(style.getPropertyValue("--gd-listing") || "0") || 0;
  const card = Number.parseFloat(style.getPropertyValue("--gd-listing-card") || "0") || 0;
  const phoneOut = Number.parseFloat(style.getPropertyValue("--gd-phone-out") || "0") || 0;
  const left = Number.parseFloat(style.getPropertyValue("--gd-box-left") || "");
  const top = Number.parseFloat(style.getPropertyValue("--gd-box-top") || "");
  const width = Number.parseFloat(style.getPropertyValue("--gd-box-width") || "");
  const height = Number.parseFloat(style.getPropertyValue("--gd-box-height") || "");
  const radius = Number.parseFloat(style.getPropertyValue("--gd-box-radius") || "");
  const box =
    Number.isFinite(left) &&
    Number.isFinite(top) &&
    Number.isFinite(width) &&
    Number.isFinite(height) &&
    width > 1 &&
    height > 1
      ? {
          x: left,
          y: top,
          w: width,
          h: height,
          radius: Number.isFinite(radius) ? radius : 0,
        }
      : null;
  return { listing, card, phoneOut, box };
}
