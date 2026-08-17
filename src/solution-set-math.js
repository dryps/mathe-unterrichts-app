export const DEFAULT_TEST_VALUE = 4;

export function normalizeTestValue(value) {
  if (value === "" || value === null || value === undefined) return DEFAULT_TEST_VALUE;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return DEFAULT_TEST_VALUE;
  return Math.max(-2, Math.min(6, Math.round(numeric)));
}

export function solutionLinePercent(value) {
  if (!Number.isFinite(value)) throw new RangeError("Zahlengeradenwert muss endlich sein.");
  const bounded = Math.max(-2, Math.min(6, value));
  return ((bounded + 2) / 8) * 100;
}

export function createSolutionSetModel(value) {
  const x = normalizeTestValue(value);
  const left = 2 * x;
  const isSolution = left < 6;
  return Object.freeze({
    x,
    left,
    sourceEquation: "2x < 6",
    substitution: `2 · ${x} = ${left}`,
    testedComparison: `${left} < 6`,
    isSolution,
    truthText: isSolution ? "wahr" : "falsch",
    solutionInequality: "x < 3",
    boundary: 3,
  });
}
