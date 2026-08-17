export const TERM_DIVISION_MIN_GROUPS = 2;
export const TERM_DIVISION_MAX_GROUPS = 5;
export const TERM_DIVISION_DEFAULT_GROUPS = 3;
export const TERM_DIVISION_GROUP_SIZE = 4;

export function normalizeTermDivisionGroups(value) {
  if (value === null || value === undefined || value === "") {
    return TERM_DIVISION_DEFAULT_GROUPS;
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return TERM_DIVISION_DEFAULT_GROUPS;

  return Math.min(
    TERM_DIVISION_MAX_GROUPS,
    Math.max(TERM_DIVISION_MIN_GROUPS, Math.round(numericValue)),
  );
}

export function createTermDivisionModel(value) {
  const groups = normalizeTermDivisionGroups(value);
  const packages = Object.freeze(
    Array.from({ length: groups }, () =>
      Object.freeze(Array.from({ length: TERM_DIVISION_GROUP_SIZE }, () => "x")),
    ),
  );

  return Object.freeze({
    groups,
    divisor: groups,
    groupSize: TERM_DIVISION_GROUP_SIZE,
    totalXUnits: groups * TERM_DIVISION_GROUP_SIZE,
    resultCoefficient: TERM_DIVISION_GROUP_SIZE,
    factorExpression: `${groups} · ${TERM_DIVISION_GROUP_SIZE} · x`,
    divisionExpression: `(${groups} · ${TERM_DIVISION_GROUP_SIZE} · x) : ${groups}`,
    resultExpression: `${TERM_DIVISION_GROUP_SIZE}x`,
    equation: `(${groups} · ${TERM_DIVISION_GROUP_SIZE} · x) : ${groups} = ${TERM_DIVISION_GROUP_SIZE}x`,
    packages,
    explanation:
      `Der vorhandene Faktor ${groups} erzeugt ${groups} gleiche Pakete. ` +
      `Durch ${groups} teilen fragt nach dem Inhalt einer Gruppe: ${TERM_DIVISION_GROUP_SIZE}x.`,
  });
}
