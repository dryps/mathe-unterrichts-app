export const BRACKET_SIGN_DEFAULT_OUTER_FACTOR = -1;

export function normalizeBracketOuterFactor(value) {
  if (value === null || value === undefined || value === "") {
    return BRACKET_SIGN_DEFAULT_OUTER_FACTOR;
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue === 0) {
    return BRACKET_SIGN_DEFAULT_OUTER_FACTOR;
  }
  return numericValue > 0 ? 1 : -1;
}

export function createBracketSignModel(value) {
  const outerFactor = normalizeBracketOuterFactor(value);
  const innerTerms = Object.freeze([1, -3]);
  const resultTerms = Object.freeze(innerTerms.map((term) => outerFactor * term));
  const isMinus = outerFactor === -1;

  return Object.freeze({
    outerFactor,
    innerTerms,
    resultTerms,
    innerLabels: Object.freeze(["+x", "−3"]),
    resultLabels: Object.freeze(isMinus ? ["−x", "+3"] : ["+x", "−3"]),
    sourceExpression: isMinus ? "−(x − 3)" : "+(x − 3)",
    multiplicationExpression: isMinus ? "−1 · (x − 3)" : "+1 · (x − 3)",
    resultExpression: isMinus ? "−x + 3" : "x − 3",
    ruleExplanation: isMinus
      ? "Der Faktor −1 wirkt auf +x und auf −3. Beide Vorzeichen wechseln."
      : "Der Faktor +1 wirkt auf +x und auf −3. Beide Vorzeichen bleiben.",
  });
}
