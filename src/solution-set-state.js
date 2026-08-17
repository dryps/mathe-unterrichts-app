import { createSolutionSetModel, DEFAULT_TEST_VALUE, normalizeTestValue } from "./solution-set-math.js";

export const SOLUTION_SET_VIEWS = Object.freeze({
  irritation: "irritation",
  testing: "testing",
  boundary: "boundary",
  revealing: "revealing",
  solution: "solution",
  explore: "explore",
  conclusion: "conclusion",
});

const CONCLUSION = "Ungleichungen beschreiben häufig Mengen von Lösungen.";
const make = (view, x, locked = false, hasTested = false) => Object.freeze({ view, x, locked, hasTested });

export function createSolutionSetState() {
  return make(SOLUTION_SET_VIEWS.irritation, DEFAULT_TEST_VALUE);
}

export function nextSolutionSetState(current) {
  if (current.locked) return current;
  let next = null;
  if (current.view === SOLUTION_SET_VIEWS.irritation) next = SOLUTION_SET_VIEWS.testing;
  if (current.view === SOLUTION_SET_VIEWS.testing && current.hasTested) next = SOLUTION_SET_VIEWS.boundary;
  if (current.view === SOLUTION_SET_VIEWS.boundary) next = SOLUTION_SET_VIEWS.revealing;
  if (current.view === SOLUTION_SET_VIEWS.solution) next = SOLUTION_SET_VIEWS.explore;
  return next ? make(next, current.x, next === SOLUTION_SET_VIEWS.revealing, current.hasTested) : current;
}

export function finishSolutionReveal(current) {
  return current.view === SOLUTION_SET_VIEWS.revealing
    ? make(SOLUTION_SET_VIEWS.solution, current.x, false, current.hasTested)
    : current;
}

export function setSolutionTestValue(current, value) {
  if (current.locked || ![SOLUTION_SET_VIEWS.testing, SOLUTION_SET_VIEWS.explore, SOLUTION_SET_VIEWS.conclusion].includes(current.view)) return current;
  const x = normalizeTestValue(value);
  const view = current.view === SOLUTION_SET_VIEWS.testing ? SOLUTION_SET_VIEWS.testing : SOLUTION_SET_VIEWS.conclusion;
  return make(view, x, false, true);
}

export function resetSolutionSetState() {
  return createSolutionSetState();
}

export function solutionSetViewModel(current) {
  const math = createSolutionSetModel(current.x);
  const showTest = current.view !== SOLUTION_SET_VIEWS.irritation;
  const showBoundary = [SOLUTION_SET_VIEWS.boundary, SOLUTION_SET_VIEWS.revealing, SOLUTION_SET_VIEWS.solution, SOLUTION_SET_VIEWS.explore, SOLUTION_SET_VIEWS.conclusion].includes(current.view);
  const showSolutionLine = [SOLUTION_SET_VIEWS.revealing, SOLUTION_SET_VIEWS.solution, SOLUTION_SET_VIEWS.explore, SOLUTION_SET_VIEWS.conclusion].includes(current.view);
  const showSolutionRange = [SOLUTION_SET_VIEWS.solution, SOLUTION_SET_VIEWS.explore, SOLUTION_SET_VIEWS.conclusion].includes(current.view);
  const showExplore = [SOLUTION_SET_VIEWS.explore, SOLUTION_SET_VIEWS.conclusion].includes(current.view);
  const showConclusion = current.view === SOLUTION_SET_VIEWS.conclusion;
  const showNext = current.view === SOLUTION_SET_VIEWS.irritation
    || (current.view === SOLUTION_SET_VIEWS.testing && current.hasTested)
    || current.view === SOLUTION_SET_VIEWS.boundary
    || current.view === SOLUTION_SET_VIEWS.solution;
  const insights = {
    irritation: "Die Ungleichung fragt nicht nur nach einem einzigen x. Welche Werte könnten passen?",
    testing: current.hasTested ? `${math.testedComparison} ist ${math.truthText}. Prüfe danach den Übergang vom Einzelwert zum ganzen Bereich.` : "Verändere x und beobachte, wann 2x < 6 wahr oder falsch ist.",
    boundary: "Teile beide Seiten durch 2. Die Grenze liegt bei 3; wegen „kleiner als“ gehört 3 nicht dazu.",
    revealing: "Jetzt werden alle Zahlen links von 3 gleichzeitig markiert.",
    solution: "Nicht nur ein Wert passt: Jeder Wert links von 3 erfüllt die Ungleichung.",
    explore: "Teste weitere Werte gegen den vollständig markierten Lösungsbereich.",
    conclusion: CONCLUSION,
  };
  return Object.freeze({
    ...math,
    showTest,
    showBoundary,
    showSolutionLine,
    showSolutionRange,
    showExplore,
    showConclusion,
    showNext,
    controlsLocked: current.locked,
    testInteractive: [SOLUTION_SET_VIEWS.testing, SOLUTION_SET_VIEWS.explore, SOLUTION_SET_VIEWS.conclusion].includes(current.view) && !current.locked,
    revealing: current.view === SOLUTION_SET_VIEWS.revealing,
    insight: insights[current.view],
    conclusion: CONCLUSION,
  });
}
