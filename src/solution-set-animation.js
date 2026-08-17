export const SOLUTION_REVEAL_DURATION = 800;

export function solutionRevealFrame(elapsed) {
  if (!Number.isFinite(elapsed)) throw new RangeError("Zeit der Animation muss endlich sein.");
  if (elapsed < 0) throw new RangeError("Zeit der Animation darf nicht negativ sein.");
  const raw = Math.max(0, Math.min(1, elapsed / SOLUTION_REVEAL_DURATION));
  const progress = Math.round((raw * raw * (3 - 2 * raw)) * 1000) / 1000;
  return Object.freeze({ progress, complete: raw === 1 });
}
