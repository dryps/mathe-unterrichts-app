import {
  numberLineTicks,
  snapNumberLineValue,
} from "./number-line-geometry.js";
import { NUMBER_LINE_MOTION_PATHS } from "./number-line-animation.js";

export const NUMBER_LINE_VIEWS = Object.freeze({
  initial: "initial",
  movingRight: "moving-right",
  right: "right",
  movingHome: "moving-home",
  home: "home",
  movingNegative: "moving-negative",
  negative: "negative",
  free: "free",
});

export const NUMBER_LINE_INSIGHTS = Object.freeze({
  [NUMBER_LINE_VIEWS.initial]: "Beginne bei der Null.",
  [NUMBER_LINE_VIEWS.movingRight]: "Beobachte die Richtung.",
  [NUMBER_LINE_VIEWS.right]: "Nach rechts werden Zahlen größer.",
  [NUMBER_LINE_VIEWS.movingHome]: "Der Punkt kehrt zur Null zurück.",
  [NUMBER_LINE_VIEWS.home]: "Bis zur Null ist alles vertraut.",
  [NUMBER_LINE_VIEWS.movingNegative]: "Die Bewegung geht über die Null hinaus.",
  [NUMBER_LINE_VIEWS.negative]: "Die Zahlengerade verläuft in beide Richtungen.",
  [NUMBER_LINE_VIEWS.free]:
    "Positive und negative Zahlen beschreiben zwei entgegengesetzte Richtungen.",
});

export function createNumberLineState() {
  return {
    view: NUMBER_LINE_VIEWS.initial,
    value: 0,
    locked: false,
  };
}

export function startNextNumberLineStep(state) {
  if (state.locked) return state;
  const transitions = {
    [NUMBER_LINE_VIEWS.initial]: NUMBER_LINE_VIEWS.movingRight,
    [NUMBER_LINE_VIEWS.right]: NUMBER_LINE_VIEWS.movingHome,
    [NUMBER_LINE_VIEWS.home]: NUMBER_LINE_VIEWS.movingNegative,
  };
  if (state.view === NUMBER_LINE_VIEWS.negative) {
    return { view: NUMBER_LINE_VIEWS.free, value: state.value, locked: false };
  }
  const nextView = transitions[state.view];
  if (!nextView) return state;
  return { ...state, view: nextView, locked: true };
}

export function finishNumberLineMotion(state) {
  const completions = {
    [NUMBER_LINE_VIEWS.movingRight]: {
      view: NUMBER_LINE_VIEWS.right,
      value: 3,
    },
    [NUMBER_LINE_VIEWS.movingHome]: {
      view: NUMBER_LINE_VIEWS.home,
      value: 0,
    },
    [NUMBER_LINE_VIEWS.movingNegative]: {
      view: NUMBER_LINE_VIEWS.negative,
      value: -3,
    },
  };
  const completed = completions[state.view];
  return completed ? { ...completed, locked: false } : state;
}

export function moveNumberLinePoint(state, value) {
  if (state.view !== NUMBER_LINE_VIEWS.free || state.locked) return state;
  return { ...state, value: snapNumberLineValue(value) };
}

export function resetNumberLineState() {
  return createNumberLineState();
}

export function motionPathForView(view) {
  const paths = {
    [NUMBER_LINE_VIEWS.movingRight]: NUMBER_LINE_MOTION_PATHS.right,
    [NUMBER_LINE_VIEWS.movingHome]: NUMBER_LINE_MOTION_PATHS.home,
    [NUMBER_LINE_VIEWS.movingNegative]: NUMBER_LINE_MOTION_PATHS.negative,
  };
  return paths[view] ?? null;
}

export function numberLineViewModel(state) {
  const showNegative = [
    NUMBER_LINE_VIEWS.movingNegative,
    NUMBER_LINE_VIEWS.negative,
    NUMBER_LINE_VIEWS.free,
  ].includes(state.view);
  return {
    state,
    ticks: numberLineTicks(showNegative),
    showNegative,
    showCurrentValue: state.view === NUMBER_LINE_VIEWS.free,
    interactive: state.view === NUMBER_LINE_VIEWS.free && !state.locked,
    showNextButton: state.view !== NUMBER_LINE_VIEWS.free,
    controlsLocked: state.locked,
    insight: NUMBER_LINE_INSIGHTS[state.view],
  };
}
