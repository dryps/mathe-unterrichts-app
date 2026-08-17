export const MULTIPLICATION_REVEAL_DURATION_MS = 650;

export function easeInOutCubic(progress) {
  const clamped = Math.max(0, Math.min(1, progress));
  return clamped < 0.5
    ? 4 * clamped ** 3
    : 1 - ((-2 * clamped + 2) ** 3) / 2;
}

export function multiplicationRevealFrame(elapsed) {
  if (!Number.isFinite(elapsed)) {
    throw new RangeError("Die Animationszeit muss endlich sein.");
  }
  const bounded = Math.max(0, Math.min(MULTIPLICATION_REVEAL_DURATION_MS, elapsed));
  const progress = easeInOutCubic(bounded / MULTIPLICATION_REVEAL_DURATION_MS);
  return Object.freeze({
    progress,
    opacity: progress,
    translateY: (1 - progress) * 12,
    complete: elapsed >= MULTIPLICATION_REVEAL_DURATION_MS,
  });
}
