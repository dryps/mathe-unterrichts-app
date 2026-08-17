import { TERM_KINDS, createTerm, formatSum } from "./like-terms-math.js";

export const LIKE_TERM_VIEWS = Object.freeze({
  irritation: "irritation",
  groups: "groups",
  merging: "merging",
  combined: "combined",
  counterexample: "counterexample",
  comparison: "comparison",
  explore: "explore",
  conclusion: "conclusion",
});

export const LIKE_TERM_INSIGHTS = Object.freeze({
  irritation: "Warum kann ich nur einen dieser Terme weiter zusammenfassen?",
  groups: "Beide Gruppen bestehen aus derselben Art Baustein.",
  merging: "Gleichartige Terme lassen sich zusammenfassen.",
  combined: "Gleichartige Terme lassen sich zusammenfassen.",
  counterexample: "x-Bausteine und Einer sind nicht gleichartig.",
  comparison: "Zusammenfassen bedeutet: gleiche Arten zählen.",
  explore: "Verändere beide Gruppen und zähle gleiche x-Bausteine.",
  conclusion: "Nur Gleichartiges kann zusammengefasst werden.",
});

function state(view, first, second, locked) {
  return Object.freeze({ view, first, second, locked });
}

export function createLikeTermsState() {
  return state(LIKE_TERM_VIEWS.irritation, 3, 2, false);
}

export function nextLikeTermsState(current) {
  if (current.locked) return current;
  const nextView = {
    [LIKE_TERM_VIEWS.irritation]: LIKE_TERM_VIEWS.groups,
    [LIKE_TERM_VIEWS.groups]: LIKE_TERM_VIEWS.merging,
    [LIKE_TERM_VIEWS.combined]: LIKE_TERM_VIEWS.counterexample,
    [LIKE_TERM_VIEWS.counterexample]: LIKE_TERM_VIEWS.comparison,
    [LIKE_TERM_VIEWS.comparison]: LIKE_TERM_VIEWS.explore,
  }[current.view];
  if (!nextView) return current;
  return state(nextView, current.first, current.second, nextView === LIKE_TERM_VIEWS.merging);
}

export function finishLikeTermsMerge(current) {
  if (current.view !== LIKE_TERM_VIEWS.merging) return current;
  return state(LIKE_TERM_VIEWS.combined, current.first, current.second, false);
}

function clampCoefficient(coefficient) {
  const number = Number(coefficient);
  if (!Number.isFinite(number)) {
    throw new RangeError("Die Gruppengröße muss endlich sein.");
  }
  return Math.max(1, Math.min(4, Math.round(number)));
}

export function setGroupCoefficient(current, group, coefficient) {
  if (!['first', 'second'].includes(group)) {
    throw new TypeError(`Unbekannte Gruppe: ${group}`);
  }
  if (
    ![LIKE_TERM_VIEWS.explore, LIKE_TERM_VIEWS.conclusion].includes(current.view) ||
    current.locked
  ) {
    return current;
  }
  const nextCoefficient = clampCoefficient(coefficient);
  if (nextCoefficient === current[group]) return current;
  return state(
    LIKE_TERM_VIEWS.conclusion,
    group === "first" ? nextCoefficient : current.first,
    group === "second" ? nextCoefficient : current.second,
    false,
  );
}

export function resetLikeTermsState() {
  return createLikeTermsState();
}

export function likeTermsViewModel(current) {
  const xLeft = createTerm(TERM_KINDS.x, current.first);
  const xRight = createTerm(TERM_KINDS.x, current.second);
  const showExplore = [LIKE_TERM_VIEWS.explore, LIKE_TERM_VIEWS.conclusion].includes(
    current.view,
  );

  return Object.freeze({
    showIrritation: current.view === LIKE_TERM_VIEWS.irritation,
    showBlocks: current.view !== LIKE_TERM_VIEWS.irritation,
    showLikeGroups: current.view === LIKE_TERM_VIEWS.groups,
    showMerging: current.view === LIKE_TERM_VIEWS.merging,
    showCombined: current.view === LIKE_TERM_VIEWS.combined,
    showCounterexample: current.view === LIKE_TERM_VIEWS.counterexample,
    showComparison: current.view === LIKE_TERM_VIEWS.comparison,
    showExplore,
    showConclusion: current.view === LIKE_TERM_VIEWS.conclusion,
    showNext: !showExplore,
    interactive: showExplore && !current.locked,
    controlsLocked: current.locked,
    insight: LIKE_TERM_INSIGHTS[current.view],
    formula: formatSum(xLeft, xRight),
  });
}
