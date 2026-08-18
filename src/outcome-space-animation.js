export const OUTCOME_SPACE_REVEAL_DURATION = 650;

function clamp(value) {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
}

export function outcomeSpaceRevealFrame(elapsed) {
  if (!Number.isFinite(elapsed) || elapsed < 0) throw new RangeError("Animationszeit muss endlich und nicht negativ sein.");
  const progress = clamp(elapsed / OUTCOME_SPACE_REVEAL_DURATION);
  const eased = 1 - (1 - progress) ** 3;
  return Object.freeze({ progress, opacity: eased, complete: progress === 1 });
}
