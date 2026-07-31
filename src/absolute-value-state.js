import { snapAbsoluteValueNumber } from "./absolute-value-geometry.js";

export const ABSOLUTE_VALUE_VIEWS = Object.freeze({
  prompt: "prompt",
  revealingDirection: "revealing-direction",
  direction: "direction",
  revealingDistance: "revealing-distance",
  distance: "distance",
  revealingOpposite: "revealing-opposite",
  opposite: "opposite",
  revealingFree: "revealing-free",
  free: "free",
  conclusion: "conclusion",
});

export const ABSOLUTE_VALUE_INSIGHTS = Object.freeze({
  [ABSOLUTE_VALUE_VIEWS.prompt]: "Was misst der Betrag eigentlich?",
  [ABSOLUTE_VALUE_VIEWS.revealingDirection]:
    "Beobachte die Richtung von der Null.",
  [ABSOLUTE_VALUE_VIEWS.direction]: "Das Vorzeichen zeigt die Richtung.",
  [ABSOLUTE_VALUE_VIEWS.revealingDistance]:
    "Jetzt betrachten wir nur die zurückgelegte Strecke.",
  [ABSOLUTE_VALUE_VIEWS.distance]:
    "Der Betrag misst den Abstand zur Null.",
  [ABSOLUTE_VALUE_VIEWS.revealingOpposite]:
    "Vergleiche nun die beiden Seiten der Null.",
  [ABSOLUTE_VALUE_VIEWS.opposite]:
    "Verschiedene Richtungen können denselben Abstand haben.",
  [ABSOLUTE_VALUE_VIEWS.revealingFree]:
    "Jetzt kannst du den Abstand selbst erkunden.",
  [ABSOLUTE_VALUE_VIEWS.free]:
    "Ziehe den Punkt und beobachte seinen Abstand zur Null.",
  [ABSOLUTE_VALUE_VIEWS.conclusion]:
    "Der Betrag sagt, wie weit eine Zahl von der Null entfernt ist – nicht auf welcher Seite sie liegt.",
});

export function createAbsoluteValueState() {
  return {
    view: ABSOLUTE_VALUE_VIEWS.prompt,
    value: -4,
    locked: false,
  };
}

export function startNextAbsoluteValueStep(state) {
  if (state.locked) return state;
  const transitions = {
    [ABSOLUTE_VALUE_VIEWS.prompt]: ABSOLUTE_VALUE_VIEWS.revealingDirection,
    [ABSOLUTE_VALUE_VIEWS.direction]: ABSOLUTE_VALUE_VIEWS.revealingDistance,
    [ABSOLUTE_VALUE_VIEWS.distance]: ABSOLUTE_VALUE_VIEWS.revealingOpposite,
    [ABSOLUTE_VALUE_VIEWS.opposite]: ABSOLUTE_VALUE_VIEWS.revealingFree,
  };
  const view = transitions[state.view];
  return view ? { ...state, view, locked: true } : state;
}

export function finishAbsoluteValueTransition(state) {
  const completions = {
    [ABSOLUTE_VALUE_VIEWS.revealingDirection]: ABSOLUTE_VALUE_VIEWS.direction,
    [ABSOLUTE_VALUE_VIEWS.revealingDistance]: ABSOLUTE_VALUE_VIEWS.distance,
    [ABSOLUTE_VALUE_VIEWS.revealingOpposite]: ABSOLUTE_VALUE_VIEWS.opposite,
    [ABSOLUTE_VALUE_VIEWS.revealingFree]: ABSOLUTE_VALUE_VIEWS.free,
  };
  const view = completions[state.view];
  return view ? { ...state, view, locked: false } : state;
}

export function transitionKindForAbsoluteView(view) {
  const kinds = {
    [ABSOLUTE_VALUE_VIEWS.revealingDirection]: "direction",
    [ABSOLUTE_VALUE_VIEWS.revealingDistance]: "distance",
    [ABSOLUTE_VALUE_VIEWS.revealingOpposite]: "opposite",
    [ABSOLUTE_VALUE_VIEWS.revealingFree]: "free",
  };
  return kinds[view] ?? null;
}

export function moveAbsoluteValuePoint(state, value) {
  if (
    ![ABSOLUTE_VALUE_VIEWS.free, ABSOLUTE_VALUE_VIEWS.conclusion].includes(
      state.view,
    ) ||
    state.locked
  ) {
    return state;
  }
  const snapped = snapAbsoluteValueNumber(value);
  if (snapped === state.value) return state;
  return {
    ...state,
    view: ABSOLUTE_VALUE_VIEWS.conclusion,
    value: snapped,
  };
}

export function resetAbsoluteValueState() {
  return createAbsoluteValueState();
}

export function absoluteValueViewModel(state) {
  const prompt = state.view === ABSOLUTE_VALUE_VIEWS.prompt;
  const stages = Object.values(ABSOLUTE_VALUE_VIEWS);
  const stageIndex = stages.indexOf(state.view);
  const directionIndex = stages.indexOf(ABSOLUTE_VALUE_VIEWS.revealingDirection);
  const distanceIndex = stages.indexOf(ABSOLUTE_VALUE_VIEWS.revealingDistance);
  const oppositeIndex = stages.indexOf(ABSOLUTE_VALUE_VIEWS.revealingOpposite);
  const freeIndex = stages.indexOf(ABSOLUTE_VALUE_VIEWS.revealingFree);
  const interactive = [
    ABSOLUTE_VALUE_VIEWS.free,
    ABSOLUTE_VALUE_VIEWS.conclusion,
  ].includes(state.view) && !state.locked;

  return {
    state,
    showPrompt: prompt,
    showAxis: !prompt,
    showNegativeReference: !prompt && stageIndex < freeIndex,
    showDirection: stageIndex >= directionIndex && stageIndex < distanceIndex,
    showNegativeDistance: stageIndex >= distanceIndex,
    showNegativeFormula: stageIndex >= distanceIndex && stageIndex < freeIndex,
    showPositiveReference: stageIndex >= oppositeIndex && stageIndex < freeIndex,
    showPositiveDistance: stageIndex >= oppositeIndex && stageIndex < freeIndex,
    showEqualityFormula: stageIndex >= oppositeIndex && stageIndex < freeIndex,
    showDraggablePoint: stageIndex >= freeIndex,
    showDynamicFormula: stageIndex >= freeIndex,
    interactive,
    showNextButton: stageIndex < freeIndex,
    controlsLocked: state.locked,
    insight: ABSOLUTE_VALUE_INSIGHTS[state.view],
  };
}
