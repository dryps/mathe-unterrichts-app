export const DEFAULT_REFLECTION_BASE = 2;

export function normalizeReflectionBase(value) {
  if (value === "" || value === null || value === undefined) return DEFAULT_REFLECTION_BASE;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return DEFAULT_REFLECTION_BASE;
  return Math.max(1, Math.min(4, Math.round(numeric)));
}

export function numberLinePercent(value) {
  if (!Number.isFinite(value)) throw new RangeError("Zahlengeradenwert muss endlich sein.");
  const bounded = Math.max(-8, Math.min(8, value));
  return ((bounded + 8) / 16) * 100;
}

export function createReflectionModel(value) {
  const base = normalizeReflectionBase(value);
  const greater = base + 3;
  const positive = Object.freeze([base, greater]);
  const negative = Object.freeze([-base, -greater]);
  return Object.freeze({
    base,
    greater,
    positive,
    negative,
    sourceTrue: positive[0] < positive[1],
    resultTrue: negative[0] > negative[1],
    sourceEquation: `${base} < ${greater}`,
    resultEquation: `−${base} > −${greater}`,
  });
}
