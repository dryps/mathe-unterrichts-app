import { snapFirstFactor } from "./multiplication-negative-geometry.js";

export const MULTIPLICATION_VIEWS = Object.freeze({
  prompt: "prompt",
  known: "known",
  pattern: "pattern",
  crossing: "crossing",
  confirmation: "confirmation",
  free: "free",
  conclusion: "conclusion",
});

export const MULTIPLICATION_INSIGHTS = Object.freeze({
  prompt: "Warum sollte das Ergebnis positiv werden?",
  known: "Der erste Faktor wird jedes Mal um 1 kleiner.",
  pattern: "Das Ergebnis wird jedes Mal um 2 größer.",
  crossing: "Das Muster geht über die Null hinweg weiter.",
  confirmation: "Damit das Muster erhalten bleibt, werden die Produkte positiv.",
  free: "Verändere nur den ersten Faktor und beobachte das vollständige Produktmuster.",
  conclusion: "Das Muster läuft über die Null weiter.",
});

export function createMultiplicationState() {
  return { view: MULTIPLICATION_VIEWS.prompt, firstFactor: -1, locked: false };
}

export function nextMultiplicationState(state) {
  if (state.locked) return state;
  const next = {
    prompt: MULTIPLICATION_VIEWS.known,
    known: MULTIPLICATION_VIEWS.pattern,
    pattern: MULTIPLICATION_VIEWS.crossing,
    crossing: MULTIPLICATION_VIEWS.confirmation,
    confirmation: MULTIPLICATION_VIEWS.free,
  }[state.view];
  if (!next) return state;
  return { ...state, view: next, locked: next !== MULTIPLICATION_VIEWS.free };
}

export function finishMultiplicationTransition(state) {
  return state.locked ? { ...state, locked: false } : state;
}

export function moveFirstFactor(state, firstFactor) {
  if (
    state.locked ||
    ![MULTIPLICATION_VIEWS.free, MULTIPLICATION_VIEWS.conclusion].includes(state.view)
  ) {
    return state;
  }
  const snapped = snapFirstFactor(firstFactor);
  if (snapped === state.firstFactor) return state;
  return {
    ...state,
    view: MULTIPLICATION_VIEWS.conclusion,
    firstFactor: snapped,
  };
}

export function resetMultiplicationState(state = createMultiplicationState()) {
  return state.locked ? state : createMultiplicationState();
}

export function multiplicationViewModel(state) {
  const order = Object.values(MULTIPLICATION_VIEWS);
  const index = order.indexOf(state.view);
  const at = (view) => index >= order.indexOf(view);
  const interactive =
    [MULTIPLICATION_VIEWS.free, MULTIPLICATION_VIEWS.conclusion].includes(state.view) &&
    !state.locked;

  return {
    showPrompt: state.view === MULTIPLICATION_VIEWS.prompt,
    showKnown: at(MULTIPLICATION_VIEWS.known),
    showPattern: at(MULTIPLICATION_VIEWS.pattern),
    showCrossing: at(MULTIPLICATION_VIEWS.crossing),
    showConfirmation: at(MULTIPLICATION_VIEWS.confirmation),
    showExplorer: at(MULTIPLICATION_VIEWS.free),
    showConclusion: state.view === MULTIPLICATION_VIEWS.conclusion,
    showNext: ![MULTIPLICATION_VIEWS.free, MULTIPLICATION_VIEWS.conclusion].includes(
      state.view,
    ),
    controlsLocked: state.locked,
    interactive,
    insight: MULTIPLICATION_INSIGHTS[state.view],
  };
}
