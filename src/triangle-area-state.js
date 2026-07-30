import {
  INITIAL_APEX,
  buildTriangleAreaGeometry,
  clampApex,
} from "./triangle-area-geometry.js";

export const AREA_VIEWS = Object.freeze({
  initial: "initial",
  animating: "animating",
  completed: "completed",
});

export function createTriangleAreaState(apex = INITIAL_APEX) {
  return {
    view: AREA_VIEWS.initial,
    apex: clampApex(apex),
  };
}

export function startSupplement(state) {
  if (state.view !== AREA_VIEWS.initial) return state;
  return { ...state, view: AREA_VIEWS.animating };
}

export function finishSupplement(state) {
  if (state.view !== AREA_VIEWS.animating) return state;
  return { ...state, view: AREA_VIEWS.completed };
}

export function moveApex(state, point) {
  if (state.view === AREA_VIEWS.animating) return state;
  return { ...state, apex: clampApex(point) };
}

export function resetTriangleAreaState(state) {
  if (state.view === AREA_VIEWS.animating) return state;
  return createTriangleAreaState();
}

export function triangleAreaViewModel(state) {
  return {
    state,
    geometry: buildTriangleAreaGeometry(state.apex),
    inputLocked: state.view === AREA_VIEWS.animating,
    showAnimatedCopy: state.view === AREA_VIEWS.animating,
    showCompletedCopy: state.view === AREA_VIEWS.completed,
    showFormulas: state.view === AREA_VIEWS.completed,
    showQuestion: state.view !== AREA_VIEWS.completed,
  };
}
