import { normalizeX } from "./terms-variables-math.js";

export const TERMS_VARIABLES_VIEWS = Object.freeze({
  irritation: "irritation",
  structure: "structure",
  assigned: "assigned",
  changing: "changing",
  comparison: "comparison",
  exploration: "exploration",
});

export const TERMS_VARIABLES_INSIGHTS = Object.freeze({
  irritation: "Ist das eine Zahl – oder beschreibt der Term etwas?",
  structure: "Der Term besteht aus zweimal x und drei Einern.",
  assigned: "Wenn x einen Wert bekommt, bekommt auch der Term einen Wert.",
  changing: "x verändert sich – der Aufbau des Terms bleibt gleich.",
  comparison: "Derselbe Term kann verschiedene Werte haben.",
  exploration: "2x + 3 bleibt derselbe Term. Wenn x sich ändert, ändert sich sein Wert.",
});

export function createTermsVariablesState() {
  return { view: TERMS_VARIABLES_VIEWS.irritation, x: null, locked: false };
}

export function nextTermsVariablesState(state) {
  if (state.locked) return state;

  const transition = {
    [TERMS_VARIABLES_VIEWS.irritation]: {
      view: TERMS_VARIABLES_VIEWS.structure,
      x: null,
      locked: false,
    },
    [TERMS_VARIABLES_VIEWS.structure]: {
      view: TERMS_VARIABLES_VIEWS.assigned,
      x: 1,
      locked: false,
    },
    [TERMS_VARIABLES_VIEWS.assigned]: {
      view: TERMS_VARIABLES_VIEWS.changing,
      x: 1,
      locked: true,
    },
    [TERMS_VARIABLES_VIEWS.changing]: state.x === 3
      ? { view: TERMS_VARIABLES_VIEWS.comparison, x: 3, locked: false }
      : null,
    [TERMS_VARIABLES_VIEWS.comparison]: {
      view: TERMS_VARIABLES_VIEWS.exploration,
      x: 3,
      locked: false,
    },
  }[state.view];

  return transition ?? state;
}

export function advanceChangingValue(state, value) {
  if (state.view !== TERMS_VARIABLES_VIEWS.changing || !state.locked) return state;
  const next = normalizeX(value);
  if (next !== state.x + 1 || ![2, 3].includes(next)) return state;
  return { ...state, x: next, locked: next !== 3 };
}

export function setExplorationX(state, value) {
  if (state.view !== TERMS_VARIABLES_VIEWS.exploration || state.locked) return state;
  const x = normalizeX(value);
  return x === state.x ? state : { ...state, x };
}

export function resetTermsVariablesState() {
  return createTermsVariablesState();
}

export function termsVariablesViewModel(state) {
  const showBlocks = state.view !== TERMS_VARIABLES_VIEWS.irritation;
  const showAssigned = [
    TERMS_VARIABLES_VIEWS.assigned,
    TERMS_VARIABLES_VIEWS.changing,
    TERMS_VARIABLES_VIEWS.exploration,
  ].includes(state.view);
  const showComparison = state.view === TERMS_VARIABLES_VIEWS.comparison;
  const showExploration = state.view === TERMS_VARIABLES_VIEWS.exploration;

  return Object.freeze({
    showBlocks,
    showAssigned,
    showComparison,
    showExploration,
    showConclusion: showExploration,
    showNext: state.view !== TERMS_VARIABLES_VIEWS.exploration,
    nextDisabled: state.locked,
    resetDisabled: false,
    sliderDisabled: !showExploration,
    insight: TERMS_VARIABLES_INSIGHTS[state.view],
  });
}
