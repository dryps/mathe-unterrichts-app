import {
  BRACKET_SIGN_DEFAULT_OUTER_FACTOR,
  createBracketSignModel,
  normalizeBracketOuterFactor,
} from "./bracket-sign-math.js";

export const BRACKET_SIGN_VIEWS = Object.freeze({
  irritation: "irritation",
  package: "package",
  plus: "plus",
  acting: "acting",
  minus: "minus",
  comparison: "comparison",
  explore: "explore",
  conclusion: "conclusion",
});

const INSIGHTS = Object.freeze({
  irritation: "Warum verändert nur eine der beiden Klammern ihre inneren Vorzeichen?",
  package: "Die Klammer hält +x und −3 als ein gemeinsames Paket zusammen.",
  plus: "Der Faktor +1 erhält jedes Vorzeichen im Paket.",
  acting: "Der Faktor −1 erreicht beide Terme im Paket.",
  minus: "Aus +x wird −x und aus −3 wird +3.",
  comparison: "+1 erhält beide Vorzeichen; −1 kehrt beide um.",
  explore: "Wechsle den äußeren Faktor und beobachte beide Paketbestandteile.",
  conclusion: "Das Minus wirkt auf das gesamte Paket.",
});

function state(view, outerFactor, locked) {
  return Object.freeze({ view, outerFactor, locked });
}

export function createBracketSignState() {
  return state(BRACKET_SIGN_VIEWS.irritation, BRACKET_SIGN_DEFAULT_OUTER_FACTOR, false);
}

export function nextBracketSignState(current) {
  if (current.locked) return current;
  const nextView = {
    [BRACKET_SIGN_VIEWS.irritation]: BRACKET_SIGN_VIEWS.package,
    [BRACKET_SIGN_VIEWS.package]: BRACKET_SIGN_VIEWS.plus,
    [BRACKET_SIGN_VIEWS.plus]: BRACKET_SIGN_VIEWS.acting,
    [BRACKET_SIGN_VIEWS.minus]: BRACKET_SIGN_VIEWS.comparison,
    [BRACKET_SIGN_VIEWS.comparison]: BRACKET_SIGN_VIEWS.explore,
  }[current.view];
  if (!nextView) return current;
  return state(nextView, current.outerFactor, nextView === BRACKET_SIGN_VIEWS.acting);
}

export function finishBracketSignAction(current) {
  if (current.view !== BRACKET_SIGN_VIEWS.acting) return current;
  return state(BRACKET_SIGN_VIEWS.minus, current.outerFactor, false);
}

export function setBracketOuterFactor(current, value) {
  const interactiveViews = [BRACKET_SIGN_VIEWS.explore, BRACKET_SIGN_VIEWS.conclusion];
  if (!interactiveViews.includes(current.view) || current.locked) return current;
  const outerFactor = normalizeBracketOuterFactor(value);
  if (outerFactor === current.outerFactor) return current;
  return state(BRACKET_SIGN_VIEWS.conclusion, outerFactor, false);
}

export function resetBracketSignState() {
  return createBracketSignState();
}

export function bracketSignViewModel(current) {
  const effectiveFactor = current.view === BRACKET_SIGN_VIEWS.plus ? 1 : current.outerFactor;
  const math = createBracketSignModel(effectiveFactor);
  const showPackage = [
    BRACKET_SIGN_VIEWS.package,
    BRACKET_SIGN_VIEWS.plus,
    BRACKET_SIGN_VIEWS.acting,
    BRACKET_SIGN_VIEWS.minus,
    BRACKET_SIGN_VIEWS.explore,
    BRACKET_SIGN_VIEWS.conclusion,
  ].includes(current.view);
  const showExplore = [BRACKET_SIGN_VIEWS.explore, BRACKET_SIGN_VIEWS.conclusion].includes(
    current.view,
  );

  return Object.freeze({
    ...math,
    plusModel: createBracketSignModel(1),
    minusModel: createBracketSignModel(-1),
    showIrritation: current.view === BRACKET_SIGN_VIEWS.irritation,
    showPackage,
    showPlus: current.view === BRACKET_SIGN_VIEWS.plus,
    showActing: current.view === BRACKET_SIGN_VIEWS.acting,
    showMinus: current.view === BRACKET_SIGN_VIEWS.minus,
    showComparison: current.view === BRACKET_SIGN_VIEWS.comparison,
    showExplore,
    showConclusion: current.view === BRACKET_SIGN_VIEWS.conclusion,
    showNext: !showExplore,
    interactive: showExplore && !current.locked,
    controlsLocked: current.locked,
    insight: INSIGHTS[current.view],
    conclusion: "Das Minus wirkt auf das gesamte Paket.",
  });
}
