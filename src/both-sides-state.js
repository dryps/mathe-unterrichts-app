import { BOTH_SIDES_DEFAULT_SHARED, createCancellationModel, normalizeSharedCoefficient } from "./both-sides-math.js";

export const BOTH_SIDES_VIEWS = Object.freeze({
  irritation: "irritation",
  decompose: "decompose",
  removing: "removing",
  reduced: "reduced",
  explore: "explore",
  conclusion: "conclusion",
});

const CONCLUSION = "„Rüberbringen“ ist verkürzte Schreibweise einer Äquivalenzumformung.";
const INSIGHTS = Object.freeze({
  irritation: "Auf beiden Seiten liegen x-Terme. Was bedeutet es wirklich, 2x „rüberzubringen“?",
  decompose: "Links und rechts wird dieselbe Gruppe aus zwei x-Bausteinen markiert.",
  removing: "Dieselben zwei x-Bausteine werden gleichzeitig auf beiden Seiten entfernt.",
  reduced: "Übrig bleibt 3x + 3 = 18 – dieselbe Subtraktion auf beiden Seiten erklärt jeden Schritt.",
  explore: "Verändere die gemeinsame x-Gruppe: Auf beiden Seiten wird stets exakt dieselbe Gruppe entfernt.",
  conclusion: CONCLUSION,
});

const make = (view, shared, locked) => Object.freeze({ view, shared, locked });

export function createBothSidesState() {
  return make(BOTH_SIDES_VIEWS.irritation, BOTH_SIDES_DEFAULT_SHARED, false);
}

export function nextBothSidesState(current) {
  if (current.locked) return current;
  const next = {
    irritation: BOTH_SIDES_VIEWS.decompose,
    decompose: BOTH_SIDES_VIEWS.removing,
    reduced: BOTH_SIDES_VIEWS.explore,
  }[current.view];
  return next ? make(next, current.shared, next === BOTH_SIDES_VIEWS.removing) : current;
}

export function finishBothSidesRemoval(current) {
  return current.view === BOTH_SIDES_VIEWS.removing
    ? make(BOTH_SIDES_VIEWS.reduced, current.shared, false)
    : current;
}

export function setSharedCoefficient(current, value) {
  if (![BOTH_SIDES_VIEWS.explore, BOTH_SIDES_VIEWS.conclusion].includes(current.view) || current.locked) return current;
  const shared = normalizeSharedCoefficient(value);
  return shared === current.shared ? current : make(BOTH_SIDES_VIEWS.conclusion, shared, false);
}

export function resetBothSidesState() {
  return createBothSidesState();
}

export function bothSidesViewModel(current) {
  const math = createCancellationModel(current.shared);
  const reduced = [BOTH_SIDES_VIEWS.reduced, BOTH_SIDES_VIEWS.explore, BOTH_SIDES_VIEWS.conclusion].includes(current.view);
  const showExplore = [BOTH_SIDES_VIEWS.explore, BOTH_SIDES_VIEWS.conclusion].includes(current.view);
  const showSource = current.view !== BOTH_SIDES_VIEWS.reduced;
  const showDecomposition = [BOTH_SIDES_VIEWS.decompose, BOTH_SIDES_VIEWS.removing, BOTH_SIDES_VIEWS.explore, BOTH_SIDES_VIEWS.conclusion].includes(current.view);
  return Object.freeze({
    ...math,
    equation: reduced ? math.reducedEquation : math.sourceEquation,
    showSource,
    showDecomposition,
    showRemoved: showDecomposition,
    removing: current.view === BOTH_SIDES_VIEWS.removing,
    showReduced: reduced,
    showExplore,
    showConclusion: current.view === BOTH_SIDES_VIEWS.conclusion,
    showNext: !showExplore,
    interactive: showExplore && !current.locked,
    controlsLocked: current.locked,
    insight: INSIGHTS[current.view],
    conclusion: CONCLUSION,
  });
}
