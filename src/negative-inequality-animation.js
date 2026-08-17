export const REFLECTION_DURATION = 1000;

export function reflectionFrame(elapsed) {
  if (!Number.isFinite(elapsed)) throw new RangeError("Zeit der Animation muss endlich sein.");
  if (elapsed < 0) throw new RangeError("Zeit der Animation darf nicht negativ sein.");
  const progress = Math.max(0, Math.min(1, elapsed / REFLECTION_DURATION));
  const eased = progress * progress * (3 - 2 * progress);
  const multiplier = Math.round((1 - 2 * eased) * 1000) / 1000;
  return Object.freeze({ progress, multiplier, complete: progress === 1 });
}
