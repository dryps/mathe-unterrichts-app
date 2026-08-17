export const TERM_DIVISION_BUILD_DURATION = 1000;

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function smoothStep(value) {
  const progress = clamp01(value);
  return progress * progress * (3 - 2 * progress);
}

export function termDivisionBuildFrame(elapsed, groups) {
  if (!Number.isFinite(elapsed) || elapsed < 0) {
    throw new RangeError("Animationszeit muss endlich und nicht negativ sein.");
  }
  if (!Number.isInteger(groups) || groups < 2 || groups > 5) {
    throw new RangeError("Gruppenanzahl muss ganzzahlig zwischen 2 und 5 liegen.");
  }

  const progress = clamp01(elapsed / TERM_DIVISION_BUILD_DURATION);
  const packageProgress = Object.freeze(
    Array.from({ length: groups }, (_, index) => smoothStep(progress * groups - index)),
  );

  return Object.freeze({
    progress,
    packageProgress,
    complete: progress === 1,
  });
}
