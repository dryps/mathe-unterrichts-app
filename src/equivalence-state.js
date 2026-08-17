import { addToEquation, createEquation, divideEquation, equationModel, solveEquation } from "./equivalence-math.js";

export const EQUIVALENCE_VIEWS = Object.freeze({
  irritation: "irritation",
  oneSided: "oneSided",
  restore: "restore",
  subtractBoth: "subtractBoth",
  divideBoth: "divideBoth",
  explore: "explore",
  conclusion: "conclusion",
});

const ORIGINAL = createEquation(3, 5, 0, 20);
const ORIGINAL_SOLUTION = solveEquation(ORIGINAL);
const CONCLUSION = "Zulässige gleiche Operationen auf beiden Seiten erhalten die Lösungsmenge.";

const INSIGHTS = Object.freeze({
  irritation: "Die Waage ist im Gleichgewicht: Für x = 5 haben beide Seiten den Wert 20.",
  oneSided: "Nur links fünf zu entfernen verändert die Gleichung – die Waage kippt.",
  restore: "Erst zurück zur ursprünglichen Gleichung: Beide Seiten wiegen wieder gleich viel.",
  subtractBoth: "Fünf auf beiden Seiten zu entfernen erhält das Gleichgewicht und ergibt 3x = 15.",
  divideBoth: "Beide Seiten durch drei zu teilen erhält das Gleichgewicht und zeigt x = 5.",
  explore: "Verändere beide Seiten um denselben Wert und beobachte die Waage.",
  conclusion: CONCLUSION,
});

const make = (view, delta) => Object.freeze({ view, delta });
const clampDelta = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return -5;
  return Math.max(-8, Math.min(8, Math.round(numeric)));
};

export function createEquivalenceState() {
  return make(EQUIVALENCE_VIEWS.irritation, -5);
}

export function nextEquivalenceState(current) {
  const next = {
    irritation: EQUIVALENCE_VIEWS.oneSided,
    oneSided: EQUIVALENCE_VIEWS.restore,
    restore: EQUIVALENCE_VIEWS.subtractBoth,
    subtractBoth: EQUIVALENCE_VIEWS.divideBoth,
    divideBoth: EQUIVALENCE_VIEWS.explore,
  }[current.view];
  return next ? make(next, current.delta) : current;
}

export function setEquivalenceDelta(current, value) {
  if (![EQUIVALENCE_VIEWS.explore, EQUIVALENCE_VIEWS.conclusion].includes(current.view)) return current;
  const delta = clampDelta(value);
  return delta === current.delta ? current : make(EQUIVALENCE_VIEWS.conclusion, delta);
}

export function resetEquivalenceState() {
  return createEquivalenceState();
}

function equationForState(state) {
  if (state.view === EQUIVALENCE_VIEWS.oneSided) return addToEquation(ORIGINAL, -5, 0);
  if (state.view === EQUIVALENCE_VIEWS.subtractBoth) return addToEquation(ORIGINAL, -5, -5);
  if (state.view === EQUIVALENCE_VIEWS.divideBoth) return divideEquation(addToEquation(ORIGINAL, -5, -5), 3);
  if ([EQUIVALENCE_VIEWS.explore, EQUIVALENCE_VIEWS.conclusion].includes(state.view)) {
    return addToEquation(ORIGINAL, state.delta, state.delta);
  }
  return ORIGINAL;
}

export function equivalenceViewModel(state) {
  const model = equationModel(equationForState(state), ORIGINAL_SOLUTION);
  const showExplore = [EQUIVALENCE_VIEWS.explore, EQUIVALENCE_VIEWS.conclusion].includes(state.view);
  const operation = state.delta < 0 ? `− ${Math.abs(state.delta)}` : `+ ${state.delta}`;
  return Object.freeze({
    ...model,
    equation: `${model.leftText} = ${model.rightText}`,
    operation,
    insight: INSIGHTS[state.view],
    conclusion: CONCLUSION,
    showWarning: state.view === EQUIVALENCE_VIEWS.oneSided,
    showRestore: state.view === EQUIVALENCE_VIEWS.restore,
    showSubtractBoth: state.view === EQUIVALENCE_VIEWS.subtractBoth,
    showDivideBoth: state.view === EQUIVALENCE_VIEWS.divideBoth,
    showGroups: state.view === EQUIVALENCE_VIEWS.divideBoth,
    showExplore,
    showConclusion: state.view === EQUIVALENCE_VIEWS.conclusion,
    showNext: !showExplore,
    interactive: showExplore,
  });
}
