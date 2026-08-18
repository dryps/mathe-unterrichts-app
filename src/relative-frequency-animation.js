export const RELATIVE_FREQUENCY_REVEAL_DURATION = 650;

export function relativeFrequencyRevealFrame(elapsed) {
  if (!Number.isFinite(elapsed) || elapsed < 0) throw new RangeError("Zeit muss endlich und nicht negativ sein.");
  const progress = Math.min(1, elapsed / RELATIVE_FREQUENCY_REVEAL_DURATION);
  return Object.freeze({
    opacity: 1 - (1 - progress) ** 3,
    complete: progress === 1,
  });
}
