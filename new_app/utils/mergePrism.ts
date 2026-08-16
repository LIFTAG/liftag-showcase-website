/**
 * Backing-store scale for the merge crystal.
 *
 * Same idea as the forged plate: a 1.25 cap on a 2x display is what reads as
 * pixels, because the silhouette is shaded, not meshed. The crystal does not
 * get the plate's full native cap. Each hit runs three IOR paths with bounces,
 * and MergeParticles is live in the same section.
 */
export function prismBufferScale(
  devicePixelRatio: number,
  hardwareConcurrency: number,
  _innerWidth: number,
) {
  const native = devicePixelRatio > 0 ? devicePixelRatio : 1
  const cap = hardwareConcurrency <= 4 ? 1 : 1.75
  return Math.min(native, cap)
}
