export const DISTRIBUTION_COPY_DURATION = 1100;

const clamp = (value) => Math.min(1, Math.max(0, value));
const ease = (value) => value * value * (3 - 2 * value);

export function distributionCopyFrame(elapsed, factor) {
  if (!Number.isFinite(elapsed) || elapsed < 0) throw new RangeError("Animationszeit muss endlich und nicht negativ sein.");
  if (!Number.isInteger(factor) || factor < 2 || factor > 5) throw new RangeError("Faktor muss eine ganze Zahl zwischen 2 und 5 sein.");
  const progress = clamp(elapsed / DISTRIBUTION_COPY_DURATION);
  const revealSpan = 1 - (factor - 1) * 0.15;
  const packageProgress = Object.freeze(
    Array.from({ length: factor }, (_, index) => ease(clamp((progress - index * 0.15) / revealSpan))),
  );
  return Object.freeze({ progress, packageProgress, complete: progress === 1 });
}
