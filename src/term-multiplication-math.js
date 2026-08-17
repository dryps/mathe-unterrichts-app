export const TERM_MULTIPLICATION_MIN_X = 1;
export const TERM_MULTIPLICATION_MAX_X = 5;
export const TERM_MULTIPLICATION_DEFAULT_X = 3;

export function normalizeTermMultiplicationX(value) {
  if (value === null || value === undefined || value === "") {
    return TERM_MULTIPLICATION_DEFAULT_X;
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return TERM_MULTIPLICATION_DEFAULT_X;

  return Math.min(
    TERM_MULTIPLICATION_MAX_X,
    Math.max(TERM_MULTIPLICATION_MIN_X, Math.round(numericValue)),
  );
}

export function createTermMultiplicationModel(value) {
  const x = normalizeTermMultiplicationX(value);
  const additiveLength = 2 * x;
  const squareArea = x * x;
  const sameNumericValue = additiveLength === squareArea;

  return Object.freeze({
    x,
    additiveLength,
    squareArea,
    additionStructure: "x + x = 2x",
    multiplicationStructure: "x · x = x²",
    additionFormula: `x + x = 2x = ${additiveLength}`,
    multiplicationFormula: `x · x = x² = ${squareArea}`,
    sameNumericValue,
    comparisonNote: sameNumericValue
      ? `Beide Zahlenwerte sind ${additiveLength}. Trotzdem bleibt 2x eine Länge und x² eine Fläche.`
      : `Länge ${additiveLength} und Fläche ${squareArea} haben verschiedene Werte.`,
  });
}
