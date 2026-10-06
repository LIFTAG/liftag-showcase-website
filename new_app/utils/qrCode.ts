import { encode } from 'uqr'

/** Light border the QR spec requires so a scanner can find the symbol. */
const QUIET_ZONE = 4

/** Logo side as a share of the code, about what the install code's icon covers. */
export const QR_LOGO_RATIO = 0.23

export interface QrCodeSvg {
  /** Side of the square viewBox in modules, quiet zone included. */
  size: number
  /** Every dark module as one SVG path, one subpath per horizontal run. */
  path: string
  /** Side of the empty square left in the centre for a logo, in modules; 0 for none. */
  mark: number
}

export interface QrCodeOptions {
  /**
   * Clears a centred square for a logo, as a fraction of the full viewBox side.
   * Rounded to an odd number of modules so it stays centred on the symbol.
   */
  markRatio?: number
}

/**
 * Encodes text as QR modules for an inline SVG. It runs in-process on the
 * server and the client, so a private share URL never reaches a QR service.
 *
 * A plain code uses medium error correction, which keeps a share link (about
 * 75 bytes with its query) at version 5 with big, easily scanned modules. A
 * code with a logo needs high correction instead: the cleared centre reads as
 * damage, and level H rebuilds the data from what is left.
 */
export function qrCodeSvg(text: string, { markRatio = 0 }: QrCodeOptions = {}): QrCodeSvg {
  const { data, size } = encode(text, markRatio > 0
    ? { ecc: 'H', border: 0 }
    : { ecc: 'M', boostEcc: true, border: 0 })
  const total = size + QUIET_ZONE * 2
  const mark = markRatio > 0 ? Math.round((total * markRatio - 1) / 2) * 2 + 1 : 0
  const markStart = (size - mark) / 2
  const markEnd = markStart + mark
  const isLight = (x: number, y: number) =>
    !data[y]![x] || (x >= markStart && x < markEnd && y >= markStart && y < markEnd)

  let path = ''
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (isLight(x, y)) continue
      const start = x
      while (x + 1 < size && !isLight(x + 1, y)) x++
      const run = x - start + 1
      path += `M${start + QUIET_ZONE} ${y + QUIET_ZONE}h${run}v1h-${run}z`
    }
  }
  return { size: total, path, mark }
}
