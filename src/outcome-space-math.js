export const INCOMPLETE_DIE_SPACE = Object.freeze([1, 2, 3, 4, 5]);
export const COMPLETE_DIE_SPACE = Object.freeze([1, 2, 3, 4, 5, 6]);

function validateDieSpace(space) {
  if (!Array.isArray(space) || space.length === 0) {
    throw new RangeError("Der Ergebnisraum darf nicht leer sein.");
  }
  if (new Set(space).size !== space.length) {
    throw new RangeError("Würfelergebnisse müssen eindeutig sein.");
  }
  if (!space.every((value) => Number.isInteger(value) && value >= 1 && value <= 6)) {
    throw new RangeError("Erlaubt sind nur Würfelergebnisse von 1 bis 6.");
  }
}

export function evenProbability(space) {
  validateDieSpace(space);
  const favorable = space.filter((value) => value % 2 === 0);
  const numerator = favorable.length;
  const denominator = space.length;
  return Object.freeze({
    favorable: Object.freeze(favorable),
    numerator,
    denominator,
    fraction: `${numerator}/${denominator}`,
    percent: (numerator / denominator) * 100,
  });
}
