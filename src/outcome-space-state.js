import { COMPLETE_DIE_SPACE, INCOMPLETE_DIE_SPACE, evenProbability } from "./outcome-space-math.js";

export const OUTCOME_SPACE_VIEWS = Object.freeze({
  irritation: "irritation",
  wrong: "wrong",
  missing: "missing",
  complete: "complete",
  conclusion: "conclusion",
});

const ORDER = Object.freeze(Object.values(OUTCOME_SPACE_VIEWS));
const WRONG = evenProbability(INCOMPLETE_DIE_SPACE);
const CORRECT = evenProbability(COMPLETE_DIE_SPACE);
const CONCLUSION = "Der Nenner basiert auf allen möglichen elementaren Ergebnissen.";
const EXPLANATION = "Der Nenner einer Laplace-Wahrscheinlichkeit basiert auf dem vollständigen Ergebnisraum. Man darf mögliche Ergebnisse nicht vergessen.";

function make(view, locked = false) {
  return Object.freeze({ view, locked: Boolean(locked) });
}

export function createOutcomeSpaceState() {
  return make(OUTCOME_SPACE_VIEWS.irritation);
}

export function nextOutcomeSpaceState(current) {
  if (current.locked) return current;
  const index = ORDER.indexOf(current.view);
  if (index < 0 || index >= ORDER.length - 1) return current;
  return make(ORDER[index + 1], true);
}

export function finishOutcomeSpaceReveal(current) {
  return current.locked ? make(current.view) : current;
}

export function resetOutcomeSpaceState() {
  return createOutcomeSpaceState();
}

export function outcomeSpaceViewModel(current) {
  const rank = ORDER.indexOf(current.view);
  if (rank < 0) throw new RangeError("Unbekannter Lernzustand.");
  const showWrong = rank >= 1;
  const showMissing = rank >= 2;
  const showComplete = rank >= 3;
  const favorableResults = showComplete ? [...CORRECT.favorable] : showWrong ? [...WRONG.favorable] : [];
  const labNames = [
    "Zufallslabor: Fünf Würfelergebnisse sind notiert, ein Platz bleibt leer.",
    "Zufallslabor: Im notierten Raum sind 2 und 4 günstig; die Rechnung ergibt 2 durch 5 gleich 40 Prozent.",
    "Zufallslabor: Ergebnis 6 fehlt im bisher notierten Ergebnisraum.",
    "Zufallslabor: Der vollständige Ergebnisraum enthält 1, 2, 3, 4, 5 und 6; günstig sind 2, 4 und 6.",
    "Zufallslabor: Vollständiger Ergebnisraum; 3 durch 6 ist ein Halb und damit 50 Prozent.",
  ];
  const insights = {
    irritation: "Für das Ereignis „gerade Zahl“ sind bisher nur fünf mögliche Ergebnisse notiert.",
    wrong: "Aus dem unvollständigen Raum entsteht die Rechnung 2/5 = 40 %.",
    missing: "Ergebnis 6 fehlt – und 6 ist ebenfalls gerade.",
    complete: "Mit allen möglichen Ergebnissen gilt 3/6 = 1/2 = 50 %.",
    conclusion: CONCLUSION,
  };
  return Object.freeze({
    view: current.view,
    showWrong,
    showMissing,
    showSix: showComplete,
    showComplete,
    showConclusion: rank >= 4,
    showNext: rank < 4,
    favorableResults: Object.freeze(favorableResults),
    incompleteSet: "{1, 2, 3, 4, 5}",
    completeSet: "{1, 2, 3, 4, 5, 6}",
    wrongEquation: `${WRONG.fraction} = ${WRONG.percent} %`,
    correctEquation: `${CORRECT.fraction} = 1/2 = ${CORRECT.percent} %`,
    labAriaLabel: labNames[rank],
    insight: insights[current.view],
    liveText: rank >= 4 ? `${insights[current.view]} ${EXPLANATION}` : insights[current.view],
    conclusion: CONCLUSION,
    explanation: EXPLANATION,
  });
}
