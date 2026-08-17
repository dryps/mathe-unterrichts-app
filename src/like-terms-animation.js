export const LIKE_TERMS_MERGE_DURATION_MS = 1100;

export function easeInOutCubic(progress) {
  const bounded = Math.max(0, Math.min(1, progress));
  return bounded < 0.5
    ? 4 * bounded ** 3
    : 1 - ((-2 * bounded + 2) ** 3) / 2;
}

export function likeTermsMergeFrame(elapsed) {
  if (!Number.isFinite(elapsed)) {
    throw new RangeError("Die Animationszeit muss endlich sein.");
  }

  const boundedElapsed = Math.max(
    0,
    Math.min(LIKE_TERMS_MERGE_DURATION_MS, elapsed),
  );
  const progress = easeInOutCubic(
    boundedElapsed / LIKE_TERMS_MERGE_DURATION_MS,
  );

  return {
    progress,
    shift: progress,
    gap: 1 - progress,
    complete: elapsed >= LIKE_TERMS_MERGE_DURATION_MS,
  };
}
