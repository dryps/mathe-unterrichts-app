export const BOTH_SIDES_DEFAULT_SHARED = 2;

export function normalizeSharedCoefficient(value) {
  if (value === "" || value === null || value === undefined) return BOTH_SIDES_DEFAULT_SHARED;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return BOTH_SIDES_DEFAULT_SHARED;
  return Math.max(1, Math.min(4, Math.round(numeric)));
}

const xTerm = (coefficient) => coefficient === 1 ? "x" : `${coefficient}x`;

export function createCancellationModel(value) {
  const shared = normalizeSharedCoefficient(value);
  const solution = 5;
  const sourceLeftX = shared + 3;
  const sourceRightX = shared;
  const sourceLeftValue = sourceLeftX * solution + 3;
  const sourceRightValue = sourceRightX * solution + 18;
  return Object.freeze({
    shared,
    solution,
    sourceLeftX,
    sourceRightX,
    sourceLeftValue,
    sourceRightValue,
    removedLeftX: shared,
    removedRightX: shared,
    remainingLeftX: 3,
    remainingRightX: 0,
    reducedLeftValue: 18,
    reducedRightValue: 18,
    sourceEquation: `${xTerm(sourceLeftX)} + 3 = ${xTerm(sourceRightX)} + 18`,
    reducedEquation: "3x + 3 = 18",
  });
}
