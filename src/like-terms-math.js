export const TERM_KINDS = Object.freeze({
  x: "x",
  one: "one",
});

const validKinds = new Set(Object.values(TERM_KINDS));

export function createTerm(kind, coefficient) {
  if (!validKinds.has(kind)) {
    throw new TypeError(`Unbekannter Bausteintyp: ${kind}`);
  }
  if (!Number.isInteger(coefficient) || coefficient < 1) {
    throw new RangeError("Der Koeffizient muss eine positive ganze Zahl sein.");
  }
  return Object.freeze({ kind, coefficient });
}

export function areLikeTerms(left, right) {
  return left.kind === right.kind;
}

export function combineLikeTerms(left, right) {
  if (!areLikeTerms(left, right)) return null;
  return createTerm(left.kind, left.coefficient + right.coefficient);
}

export function formatTerm(term) {
  return term.kind === TERM_KINDS.x
    ? `${term.coefficient}x`
    : String(term.coefficient);
}

export function formatSum(left, right) {
  const expression = `${formatTerm(left)} + ${formatTerm(right)}`;
  const combined = combineLikeTerms(left, right);
  return combined ? `${expression} = ${formatTerm(combined)}` : expression;
}
