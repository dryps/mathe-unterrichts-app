import { EQUAL_SPINNER_ANGLES, UNEQUAL_SPINNER_ANGLES, spinnerProbability, spinnerSegments } from "./laplace-math.js";

export const LAPLACE_VIEWS = Object.freeze({
  irritation: "irritation",
  count: "count",
  areas: "areas",
  probability: "probability",
  explore: "explore",
});

const ORDER = Object.freeze(Object.values(LAPLACE_VIEWS));
const CONCLUSION = "Reines Zählen funktioniert nur bei gleich wahrscheinlichen Elementarereignissen.";
const EXPLANATION = "Bei einem Laplace-Experiment sind alle Elementarereignisse gleich wahrscheinlich. Nur dann gilt P(E) = Anzahl günstiger Ergebnisse / Anzahl möglicher Ergebnisse.";

function validateResult(result) {
  if (!Number.isInteger(result) || result < 1 || result > 4) throw new RangeError("Ergebnis muss zwischen 1 und 4 liegen.");
}

function make(view, locked = false, selectedResult = 1) {
  validateResult(selectedResult);
  return Object.freeze({ view, locked: Boolean(locked), selectedResult });
}

export function createLaplaceState() {
  return make(LAPLACE_VIEWS.irritation);
}

export function nextLaplaceState(current) {
  if (current.locked) return current;
  const index = ORDER.indexOf(current.view);
  if (index < 0 || index >= ORDER.length - 1) return current;
  return make(ORDER[index + 1], true, current.selectedResult);
}

export function finishLaplaceReveal(current) {
  return current.locked ? make(current.view, false, current.selectedResult) : current;
}

export function setLaplaceResult(current, result) {
  validateResult(result);
  if (current.locked || current.view !== LAPLACE_VIEWS.explore) return current;
  return make(current.view, false, result);
}

export function resetLaplaceState() {
  return createLaplaceState();
}

export function laplaceViewModel(current) {
  const rank = ORDER.indexOf(current.view);
  if (rank < 0) throw new RangeError("Unbekannter Lernzustand.");
  const equal = spinnerProbability(EQUAL_SPINNER_ANGLES, current.selectedResult);
  const unequal = spinnerProbability(UNEQUAL_SPINNER_ANGLES, current.selectedResult);
  const showAreas = rank >= 2;
  const showProbability = rank >= 3;
  const equalSegments = spinnerSegments(EQUAL_SPINNER_ANGLES);
  const unequalSegments = spinnerSegments(UNEQUAL_SPINNER_ANGLES);
  const equalNames = [
    "Glücksrad A mit vier beschrifteten Feldern.",
    `Glücksrad A: Ergebnis ${current.selectedResult} ist eines von vier beschrifteten Ergebnissen.`,
    `Glücksrad A: Ergebnis ${current.selectedResult} liegt in einem ${equal.angle} Grad großen Feld; alle vier Felder sind gleich groß.`,
    `Glücksrad A: Ergebnis ${current.selectedResult} liegt in einem ${equal.angle} Grad großen Feld und hat Wahrscheinlichkeit ${equal.fraction}.`,
  ];
  const unequalNames = [
    "Glücksrad B mit vier beschrifteten Feldern.",
    `Glücksrad B: Ergebnis ${current.selectedResult} ist eines von vier beschrifteten Ergebnissen.`,
    `Glücksrad B: Ergebnis ${current.selectedResult} liegt in einem ${unequal.angle} Grad großen Feld; die vier Felder sind unterschiedlich groß.`,
    `Glücksrad B: Ergebnis ${current.selectedResult} liegt in einem ${unequal.angle} Grad großen Feld und hat Wahrscheinlichkeit ${unequal.fraction}.`,
  ];
  const insights = {
    irritation: "Beide Glücksräder tragen dieselben vier Beschriftungen. Sind die Chancen deshalb gleich?",
    count: `Reines Zählen sagt bei beiden Rädern: Ergebnis ${current.selectedResult} ist 1 von 4.`,
    areas: "Die Beschriftungen sind gleich, aber die Feldgrößen nicht.",
    probability: `Bei Rad A gilt P(${current.selectedResult}) = ${equal.fraction}; bei Rad B gilt P(${current.selectedResult}) = ${unequal.fraction}.`,
    explore: CONCLUSION,
  };
  return Object.freeze({
    view: current.view,
    selectedResult: current.selectedResult,
    equalSegments,
    unequalSegments,
    displayUnequalSegments: showAreas ? unequalSegments : equalSegments,
    equalHeading: showAreas ? "gleich große Felder" : "vier beschriftete Ergebnisse",
    unequalHeading: showAreas ? "unterschiedlich große Felder" : "vier beschriftete Ergebnisse",
    equalAngle: equal.angle,
    unequalAngle: unequal.angle,
    equalProbability: equal.fraction,
    unequalProbability: unequal.fraction,
    equalAriaLabel: equalNames[Math.min(rank, 3)],
    unequalAriaLabel: unequalNames[Math.min(rank, 3)],
    sliderValueText: `Ergebnis ${current.selectedResult} von 4; Rad A ${equal.fraction}, Rad B ${unequal.fraction}`,
    showCount: rank >= 1,
    showAreas,
    showProbability,
    showExplore: rank >= 4,
    showConclusion: rank >= 4,
    showNext: rank < 4,
    controlsInteractive: rank >= 4 && !current.locked,
    insight: insights[current.view],
    liveText: rank >= 4 ? `${insights[current.view]} ${EXPLANATION}` : insights[current.view],
    conclusion: CONCLUSION,
    explanation: EXPLANATION,
  });
}
