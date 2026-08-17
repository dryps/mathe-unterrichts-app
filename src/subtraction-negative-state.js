import { snapNegativeSubtrahend } from "./subtraction-negative-geometry.js";

export const SUBTRACTION_VIEWS = Object.freeze({
  prompt: "prompt",
  start: "start",
  negative: "negative",
  reversing: "reversing",
  moving: "moving",
  result: "result",
  free: "free",
  conclusion: "conclusion",
});

export const SUBTRACTION_INSIGHTS = Object.freeze({
  prompt: "Warum führen zwei Minuszeichen hier nach rechts?",
  start: "Wir starten bei 4.",
  negative: "−2 bedeutet: zwei Einheiten nach links.",
  reversing: "Subtrahieren kehrt die Richtung um.",
  moving: "Die negative Richtung wurde umgekehrt – deshalb gehen wir nach rechts.",
  result: "Die negative Richtung wurde umgekehrt – deshalb gehen wir nach rechts.",
  free: "Ziehe das violette Pfeilende und beobachte die Richtungsumkehr.",
  conclusion: "Subtrahieren kehrt die Richtung um.",
});

export function createSubtractionState() {
  return { view: SUBTRACTION_VIEWS.prompt, subtrahend: -2, locked: false };
}

export function nextSubtractionState(state) {
  if (state.locked) return state;
  const next = {
    prompt: SUBTRACTION_VIEWS.start,
    start: SUBTRACTION_VIEWS.negative,
    negative: SUBTRACTION_VIEWS.reversing,
    result: SUBTRACTION_VIEWS.free,
  }[state.view];
  if (!next) return state;
  return { ...state, view: next, locked: next === SUBTRACTION_VIEWS.reversing };
}

export function finishDirectionReversal(state) {
  if (state.view !== SUBTRACTION_VIEWS.reversing) return state;
  return { ...state, view: SUBTRACTION_VIEWS.moving, locked: true };
}

export function finishSubtractionMovement(state) {
  if (state.view !== SUBTRACTION_VIEWS.moving) return state;
  return { ...state, view: SUBTRACTION_VIEWS.result, locked: false };
}

export function moveSubtrahend(state, subtrahend) {
  if (
    ![SUBTRACTION_VIEWS.free, SUBTRACTION_VIEWS.conclusion].includes(state.view) ||
    state.locked
  ) {
    return state;
  }
  const snapped = snapNegativeSubtrahend(subtrahend);
  if (snapped === state.subtrahend && state.view === SUBTRACTION_VIEWS.conclusion) {
    return state;
  }
  return { ...state, view: SUBTRACTION_VIEWS.conclusion, subtrahend: snapped };
}

export function resetSubtractionState() {
  return createSubtractionState();
}

export function subtractionViewModel(state) {
  const order = Object.values(SUBTRACTION_VIEWS);
  const index = order.indexOf(state.view);
  const at = (view) => index >= order.indexOf(view);
  const stableEnd = [
    SUBTRACTION_VIEWS.result,
    SUBTRACTION_VIEWS.free,
    SUBTRACTION_VIEWS.conclusion,
  ].includes(state.view);
  const interactive = [SUBTRACTION_VIEWS.free, SUBTRACTION_VIEWS.conclusion].includes(
    state.view,
  ) && !state.locked;

  return {
    showPrompt: state.view === SUBTRACTION_VIEWS.prompt,
    showAxis: at(SUBTRACTION_VIEWS.start),
    showStart: at(SUBTRACTION_VIEWS.start),
    showFormula: at(SUBTRACTION_VIEWS.start),
    highlightStart: state.view === SUBTRACTION_VIEWS.start,
    highlightSubtrahend: [
      SUBTRACTION_VIEWS.negative,
      SUBTRACTION_VIEWS.reversing,
    ].includes(state.view),
    highlightOperator: state.view === SUBTRACTION_VIEWS.reversing,
    showOriginalVector:
      state.view === SUBTRACTION_VIEWS.negative ||
      state.view === SUBTRACTION_VIEWS.moving ||
      stableEnd,
    showReversalVector: state.view === SUBTRACTION_VIEWS.reversing,
    showEffectiveVector: state.view === SUBTRACTION_VIEWS.moving || stableEnd,
    showMovingPoint: state.view === SUBTRACTION_VIEWS.moving,
    showEnd: stableEnd,
    showEquations: stableEnd,
    showConclusion: state.view === SUBTRACTION_VIEWS.conclusion,
    interactive,
    showNext: ![
      SUBTRACTION_VIEWS.free,
      SUBTRACTION_VIEWS.conclusion,
    ].includes(state.view),
    controlsLocked: state.locked,
    insight: SUBTRACTION_INSIGHTS[state.view],
  };
}
