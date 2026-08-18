export const ANGLE_SUM_REVEAL_DURATION = 650;

export function angleSumRevealFrame(elapsed) {
  if (!Number.isFinite(elapsed)) throw new RangeError("Animationszeit muss endlich sein.");
  if (elapsed < 0) throw new RangeError("Animationszeit darf nicht negativ sein.");
  const raw = Math.max(0, Math.min(1, elapsed / ANGLE_SUM_REVEAL_DURATION));
  const progress = raw * raw * (3 - 2 * raw);
  return Object.freeze({ progress, opacity: progress, complete: raw === 1 });
}
