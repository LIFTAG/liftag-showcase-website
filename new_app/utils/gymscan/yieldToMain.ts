/**
 * End the current task so input, paint and running animations get a turn
 * between pieces of boot work. scheduler.yield() resumes ahead of other
 * queued tasks where it exists; a zero timeout elsewhere.
 *
 * Both 3D stages boot while something else is on screen (the arrival logo,
 * or a chapter being scrolled), so their one-off work is cut into tasks.
 */
export function yieldToMain(): Promise<void> {
  const scheduler = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler
  if (typeof scheduler?.yield === 'function') return scheduler.yield()
  return new Promise(resolve => setTimeout(resolve, 0))
}
