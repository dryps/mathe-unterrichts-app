export const DISTRIBUTION_DEFAULT_FACTOR = 3;

export function normalizeDistributionFactor(value) {
  if (value === null || value === undefined || value === "") return DISTRIBUTION_DEFAULT_FACTOR;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return DISTRIBUTION_DEFAULT_FACTOR;
  return Math.min(5, Math.max(2, Math.round(numeric)));
}

export function createDistributionModel(value) {
  const factor = normalizeDistributionFactor(value);
  const packages = Object.freeze(
    Array.from({ length: factor }, (_, index) => Object.freeze({ index: index + 1, xUnits: 1, ones: 2 })),
  );
  const totalX = factor;
  const totalOnes = factor * 2;
  return Object.freeze({
    factor,
    packages,
    totalX,
    totalOnes,
    sourceExpression: `${factor}(x + 2)`,
    copiesExpression: Array.from({ length: factor }, () => "(x + 2)").join(" + "),
    expandedExpression: `${factor}x + ${totalOnes}`,
    equation: `${factor}(x + 2) = ${factor}x + ${totalOnes}`,
  });
}
