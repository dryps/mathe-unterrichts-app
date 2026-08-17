import { createReflectionModel, DEFAULT_REFLECTION_BASE, normalizeReflectionBase } from "./negative-inequality-math.js";

export const NEGATIVE_INEQUALITY_VIEWS = Object.freeze({
  irritation: "irritation",
  ordered: "ordered",
  reflecting: "reflecting",
  reflected: "reflected",
  explore: "explore",
  conclusion: "conclusion",
});

const CONCLUSION = "Negative Skalierung kehrt die Ordnung um.";
const make = (view, base, locked) => Object.freeze({ view, base, locked });

export function createNegativeInequalityState() {
  return make(NEGATIVE_INEQUALITY_VIEWS.irritation, DEFAULT_REFLECTION_BASE, false);
}

export function nextNegativeInequalityState(current) {
  if (current.locked) return current;
  const next = {
    irritation: NEGATIVE_INEQUALITY_VIEWS.ordered,
    ordered: NEGATIVE_INEQUALITY_VIEWS.reflecting,
    reflected: NEGATIVE_INEQUALITY_VIEWS.explore,
  }[current.view];
  return next ? make(next, current.base, next === NEGATIVE_INEQUALITY_VIEWS.reflecting) : current;
}

export function finishReflection(current) {
  return current.view === NEGATIVE_INEQUALITY_VIEWS.reflecting
    ? make(NEGATIVE_INEQUALITY_VIEWS.reflected, current.base, false)
    : current;
}

export function setReflectionBase(current, value) {
  if (![NEGATIVE_INEQUALITY_VIEWS.explore, NEGATIVE_INEQUALITY_VIEWS.conclusion].includes(current.view) || current.locked) return current;
  const base = normalizeReflectionBase(value);
  return base === current.base ? current : make(NEGATIVE_INEQUALITY_VIEWS.conclusion, base, false);
}

export function resetNegativeInequalityState() {
  return createNegativeInequalityState();
}

export function negativeInequalityViewModel(current) {
  const math = createReflectionModel(current.base);
  const showResult = [NEGATIVE_INEQUALITY_VIEWS.reflected, NEGATIVE_INEQUALITY_VIEWS.explore, NEGATIVE_INEQUALITY_VIEWS.conclusion].includes(current.view);
  const showExplore = [NEGATIVE_INEQUALITY_VIEWS.explore, NEGATIVE_INEQUALITY_VIEWS.conclusion].includes(current.view);
  const insights = {
    irritation: "2 ist kleiner als 5. Was passiert mit dieser Ordnung bei der Multiplikation mit −1?",
    ordered: "Auf der Zahlengeraden liegt 2 links von 5.",
    reflecting: "Beide Zahlen werden gleichzeitig an der Null gespiegelt.",
    reflected: "Nach der Spiegelung liegt −5 links von −2. Deshalb gilt −2 > −5.",
    explore: "Verändere das Zahlenpaar und beobachte dieselbe Ordnungsumkehr.",
    conclusion: CONCLUSION,
  };
  return Object.freeze({
    ...math,
    showLine: current.view !== NEGATIVE_INEQUALITY_VIEWS.irritation,
    showResult,
    showExplore,
    showConclusion: current.view === NEGATIVE_INEQUALITY_VIEWS.conclusion,
    showNext: !showExplore,
    controlsLocked: current.locked,
    interactive: showExplore && !current.locked,
    reflecting: current.view === NEGATIVE_INEQUALITY_VIEWS.reflecting,
    multiplier: showResult ? -1 : 1,
    insight: insights[current.view],
    conclusion: CONCLUSION,
  });
}
