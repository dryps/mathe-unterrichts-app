export const BOTH_SIDES_REMOVAL_DURATION = 900;

export function bothSidesRemovalFrame(elapsed) {
  if (!Number.isFinite(elapsed) || elapsed < 0) throw new RangeError("Zeit der Animation muss endlich und nicht negativ sein.");
  const progress = Math.max(0, Math.min(1, elapsed / BOTH_SIDES_REMOVAL_DURATION));
  const eased = progress * progress * (3 - 2 * progress);
  return Object.freeze({
    progress,
    opacity: Math.round((1 - eased) * 1000) / 1000,
    lift: progress === 0 ? 0 : Math.round(-24 * eased * 1000) / 1000,
    complete: progress === 1,
  });
}
