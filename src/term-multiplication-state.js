import {
  TERM_MULTIPLICATION_DEFAULT_X,
  createTermMultiplicationModel,
  normalizeTermMultiplicationX,
} from "./term-multiplication-math.js";

export const TERM_MULTIPLICATION_VIEWS = Object.freeze({
  irritation: "irritation",
  addition: "addition",
  square: "square",
  filling: "filling",
  area: "area",
  comparison: "comparison",
  explore: "explore",
  conclusion: "conclusion",
});

const INSIGHTS = Object.freeze({
  irritation: "Zweimal x kann Addition oder Multiplikation bedeuten.",
  addition: "Beim Addieren liegen zwei x-Längen hintereinander: zusammen 2x.",
  square: "Beim Multiplizieren spannen zwei Seitenlängen x ein Quadrat auf.",
  filling: "Die beiden Längen bestimmen eine Fläche.",
  area: "Ein Quadrat mit Seitenlänge x hat die Fläche x².",
  comparison: "2x beschreibt hier eine Länge, x² eine Fläche.",
  explore: "Verändere x und beobachte Länge und Fläche gleichzeitig.",
  conclusion: "2x und x² sind nicht zwei Schreibweisen für dasselbe.",
});

function state(view, x, locked) {
  return Object.freeze({ view, x, locked });
}

export function createTermMultiplicationState() {
  return state(
    TERM_MULTIPLICATION_VIEWS.irritation,
    TERM_MULTIPLICATION_DEFAULT_X,
    false,
  );
}

export function nextTermMultiplicationState(current) {
  if (current.locked) return current;

  const nextView = {
    [TERM_MULTIPLICATION_VIEWS.irritation]: TERM_MULTIPLICATION_VIEWS.addition,
    [TERM_MULTIPLICATION_VIEWS.addition]: TERM_MULTIPLICATION_VIEWS.square,
    [TERM_MULTIPLICATION_VIEWS.square]: TERM_MULTIPLICATION_VIEWS.filling,
    [TERM_MULTIPLICATION_VIEWS.area]: TERM_MULTIPLICATION_VIEWS.comparison,
    [TERM_MULTIPLICATION_VIEWS.comparison]: TERM_MULTIPLICATION_VIEWS.explore,
  }[current.view];

  if (!nextView) return current;
  return state(
    nextView,
    current.x,
    nextView === TERM_MULTIPLICATION_VIEWS.filling,
  );
}

export function finishTermMultiplicationFill(current) {
  if (current.view !== TERM_MULTIPLICATION_VIEWS.filling) return current;
  return state(TERM_MULTIPLICATION_VIEWS.area, current.x, false);
}

export function setTermMultiplicationX(current, value) {
  const interactiveViews = [
    TERM_MULTIPLICATION_VIEWS.explore,
    TERM_MULTIPLICATION_VIEWS.conclusion,
  ];
  if (!interactiveViews.includes(current.view) || current.locked) return current;

  const x = normalizeTermMultiplicationX(value);
  if (x === current.x) return current;
  return state(TERM_MULTIPLICATION_VIEWS.conclusion, x, false);
}

export function resetTermMultiplicationState() {
  return createTermMultiplicationState();
}

export function termMultiplicationViewModel(current) {
  const math = createTermMultiplicationModel(current.x);
  const showExplore = [
    TERM_MULTIPLICATION_VIEWS.explore,
    TERM_MULTIPLICATION_VIEWS.conclusion,
  ].includes(current.view);

  return Object.freeze({
    ...math,
    showIrritation: current.view === TERM_MULTIPLICATION_VIEWS.irritation,
    showAddition: current.view === TERM_MULTIPLICATION_VIEWS.addition,
    showSquare: current.view === TERM_MULTIPLICATION_VIEWS.square,
    showFilling: current.view === TERM_MULTIPLICATION_VIEWS.filling,
    showArea: current.view === TERM_MULTIPLICATION_VIEWS.area,
    showComparison: current.view === TERM_MULTIPLICATION_VIEWS.comparison,
    showExplore,
    showConclusion: current.view === TERM_MULTIPLICATION_VIEWS.conclusion,
    showNext: !showExplore,
    interactive: showExplore && !current.locked,
    controlsLocked: current.locked,
    insight: INSIGHTS[current.view],
    conclusion: "2x und x² sind nicht zwei Schreibweisen für dasselbe.",
  });
}
