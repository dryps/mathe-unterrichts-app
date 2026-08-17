export const TERM_COEFFICIENT = 2;
export const TERM_CONSTANT = 3;
export const TERM_EXPRESSION = "2x + 3";
export const X_MIN = 0;
export const X_MAX = 5;

export function normalizeX(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    throw new RangeError("x muss eine endliche Zahl sein.");
  }
  return Math.max(X_MIN, Math.min(X_MAX, Math.round(numeric)));
}

export function termValue(x) {
  return TERM_COEFFICIENT * normalizeX(x) + TERM_CONSTANT;
}

export function termSnapshot(x) {
  const normalized = normalizeX(x);
  const value = termValue(normalized);
  const xBlockValues = Object.freeze([normalized, normalized]);
  const unitValues = Object.freeze([1, 1, 1]);

  return Object.freeze({
    x: normalized,
    expression: TERM_EXPRESSION,
    coefficient: TERM_COEFFICIENT,
    constant: TERM_CONSTANT,
    xBlockValues,
    unitValues,
    expanded: `${normalized} + ${normalized} + 3 = ${value}`,
    substituted: `2 · ${normalized} + 3 = ${value}`,
    value,
  });
}
