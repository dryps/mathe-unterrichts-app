import { snapOrderNumberLineValue } from "./order-number-line-geometry.js";

export const ORDER_NUMBER_LINE_VIEWS = Object.freeze({
  prompt: "prompt",
  introducing: "introducing",
  line: "line",
  revealingComparison: "revealing-comparison",
  comparison: "comparison",
  revealingFree: "revealing-free",
  free: "free",
  conclusion: "conclusion",
});

export const ORDER_NUMBER_LINE_INSIGHTS = Object.freeze({
  [ORDER_NUMBER_LINE_VIEWS.prompt]: "Schau nicht nur auf 8 und 3.",
  [ORDER_NUMBER_LINE_VIEWS.introducing]:
    "Beobachte, wo die beiden Zahlen liegen.",
  [ORDER_NUMBER_LINE_VIEWS.line]:
    "Auf der Zahlengeraden liegen größere Zahlen weiter rechts.",
  [ORDER_NUMBER_LINE_VIEWS.revealingComparison]:
    "Die Positionen entscheiden über den Vergleich.",
  [ORDER_NUMBER_LINE_VIEWS.comparison]:
    "−3 liegt weiter rechts und ist deshalb größer.",
  [ORDER_NUMBER_LINE_VIEWS.revealingFree]:
    "Jetzt kannst du die Ordnung selbst erkunden.",
  [ORDER_NUMBER_LINE_VIEWS.free]:
    "Ziehe den Punkt: weiter links bedeutet kleiner.",
  [ORDER_NUMBER_LINE_VIEWS.conclusion]:
    "Die Position auf der Zahlengeraden entscheidet. Weiter rechts bedeutet größer.",
});

export function createOrderNumberLineState() {
  return {
    view: ORDER_NUMBER_LINE_VIEWS.prompt,
    value: 0,
    locked: false,
  };
}

export function startNextOrderNumberLineStep(state) {
  if (state.locked) return state;
  const transitions = {
    [ORDER_NUMBER_LINE_VIEWS.prompt]: ORDER_NUMBER_LINE_VIEWS.introducing,
    [ORDER_NUMBER_LINE_VIEWS.line]:
      ORDER_NUMBER_LINE_VIEWS.revealingComparison,
    [ORDER_NUMBER_LINE_VIEWS.comparison]:
      ORDER_NUMBER_LINE_VIEWS.revealingFree,
  };
  const view = transitions[state.view];
  return view ? { ...state, view, locked: true } : state;
}

export function finishOrderNumberLineTransition(state) {
  const completions = {
    [ORDER_NUMBER_LINE_VIEWS.introducing]: ORDER_NUMBER_LINE_VIEWS.line,
    [ORDER_NUMBER_LINE_VIEWS.revealingComparison]:
      ORDER_NUMBER_LINE_VIEWS.comparison,
    [ORDER_NUMBER_LINE_VIEWS.revealingFree]: ORDER_NUMBER_LINE_VIEWS.free,
  };
  const view = completions[state.view];
  return view ? { ...state, view, locked: false } : state;
}

export function transitionKindForOrderView(view) {
  const kinds = {
    [ORDER_NUMBER_LINE_VIEWS.introducing]: "introduction",
    [ORDER_NUMBER_LINE_VIEWS.revealingComparison]: "comparison",
    [ORDER_NUMBER_LINE_VIEWS.revealingFree]: "free",
  };
  return kinds[view] ?? null;
}

export function moveOrderNumberLinePoint(state, value) {
  if (
    ![ORDER_NUMBER_LINE_VIEWS.free, ORDER_NUMBER_LINE_VIEWS.conclusion].includes(
      state.view,
    ) ||
    state.locked
  ) {
    return state;
  }
  const snapped = snapOrderNumberLineValue(value);
  if (snapped === state.value) return state;
  return {
    ...state,
    view: ORDER_NUMBER_LINE_VIEWS.conclusion,
    value: snapped,
  };
}

export function resetOrderNumberLineState() {
  return createOrderNumberLineState();
}

export function orderNumberLineViewModel(state) {
  const prompt = state.view === ORDER_NUMBER_LINE_VIEWS.prompt;
  const comparison = [
    ORDER_NUMBER_LINE_VIEWS.revealingComparison,
    ORDER_NUMBER_LINE_VIEWS.comparison,
  ].includes(state.view);
  const draggable = [
    ORDER_NUMBER_LINE_VIEWS.revealingFree,
    ORDER_NUMBER_LINE_VIEWS.free,
    ORDER_NUMBER_LINE_VIEWS.conclusion,
  ].includes(state.view);

  return {
    state,
    showPrompt: prompt,
    showAxis: !prompt,
    showReferenceMarkers: !prompt,
    referenceMarkersMuted: draggable,
    showComparison: comparison,
    showDraggablePoint: draggable,
    interactive:
      [ORDER_NUMBER_LINE_VIEWS.free, ORDER_NUMBER_LINE_VIEWS.conclusion].includes(
        state.view,
      ) && !state.locked,
    showNextButton: [
      ORDER_NUMBER_LINE_VIEWS.prompt,
      ORDER_NUMBER_LINE_VIEWS.introducing,
      ORDER_NUMBER_LINE_VIEWS.line,
      ORDER_NUMBER_LINE_VIEWS.revealingComparison,
      ORDER_NUMBER_LINE_VIEWS.comparison,
      ORDER_NUMBER_LINE_VIEWS.revealingFree,
    ].includes(state.view),
    controlsLocked: state.locked,
    insight: ORDER_NUMBER_LINE_INSIGHTS[state.view],
  };
}
