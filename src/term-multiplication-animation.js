export const TERM_MULTIPLICATION_FILL_DURATION_MS = 900;

function clampUnit(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.min(1, Math.max(0, numericValue));
}

export function easeInOutCubic(value) {
  const progress = clampUnit(value);
  return progress < 0.5
    ? 4 * progress ** 3
    : 1 - ((-2 * progress + 2) ** 3) / 2;
}

export function termMultiplicationFillFrame(elapsed) {
  const safeElapsed = Number.isFinite(Number(elapsed)) ? Number(elapsed) : 0;
  const progress = clampUnit(safeElapsed / TERM_MULTIPLICATION_FILL_DURATION_MS);
  const eased = easeInOutCubic(progress);

  return Object.freeze({
    progress,
    eased,
    fillScale: eased,
    fillOpacity: Number((0.18 + 0.82 * eased).toFixed(4)),
    complete: progress === 1,
  });
}
