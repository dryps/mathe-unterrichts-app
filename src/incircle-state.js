import {
  INITIAL_TEST_TARGET,
  INITIAL_VERTICES,
  attemptVertexMove,
  buildIncircleGeometry,
  copyVertices,
} from "./incircle-geometry.js";

export const INCIRCLE_VIEWS = Object.freeze({
  first: "first",
  allBisectors: "all-bisectors",
  incircle: "incircle",
});

export const INCIRCLE_INSIGHTS = Object.freeze({
  [INCIRCLE_VIEWS.first]:
    "Jeder Punkt auf der Winkelhalbierenden ist von beiden Schenkeln gleich weit entfernt.",
  [INCIRCLE_VIEWS.allBisectors]: "I ist von allen drei Seiten gleich weit entfernt.",
  [INCIRCLE_VIEWS.incircle]: "Deshalb ist I der Mittelpunkt des Inkreises.",
});

export function createIncircleState() {
  return {
    view: INCIRCLE_VIEWS.first,
    vertices: copyVertices(INITIAL_VERTICES),
    testTarget: { ...INITIAL_TEST_TARGET },
    feedback: "",
  };
}

export function advanceIncircle(state) {
  const nextView = {
    [INCIRCLE_VIEWS.first]: INCIRCLE_VIEWS.allBisectors,
    [INCIRCLE_VIEWS.allBisectors]: INCIRCLE_VIEWS.incircle,
  }[state.view];
  if (!nextView) return state;
  return { ...state, view: nextView, feedback: "" };
}

export function moveTestPoint(state, target) {
  if (state.view !== INCIRCLE_VIEWS.first) return state;
  const geometry = buildIncircleGeometry(state.vertices, target);
  return { ...state, testTarget: geometry.testPoint, feedback: "" };
}

export function moveIncircleVertex(state, key, target) {
  if (state.view !== INCIRCLE_VIEWS.incircle) return state;
  const result = attemptVertexMove(state.vertices, key, target);
  if (!result.accepted) {
    return { ...state, feedback: result.reason };
  }
  return { ...state, vertices: result.vertices, feedback: "" };
}

export function resetIncircleState() {
  return createIncircleState();
}

export function incircleViewModel(state) {
  const geometry = buildIncircleGeometry(state.vertices, state.testTarget);
  const showCenter =
    state.view === INCIRCLE_VIEWS.allBisectors ||
    state.view === INCIRCLE_VIEWS.incircle;
  const showCircle = state.view === INCIRCLE_VIEWS.incircle;

  return {
    state,
    geometry,
    showTestPoint: state.view === INCIRCLE_VIEWS.first,
    bisectorCount: state.view === INCIRCLE_VIEWS.first ? 1 : 3,
    showCenter,
    showCircle,
    verticesMovable: showCircle,
    showPrimaryButton: !showCircle,
    primaryButtonLabel:
      state.view === INCIRCLE_VIEWS.first
        ? "Alle Winkelhalbierenden zeigen"
        : "Inkreis zeigen",
    insight: INCIRCLE_INSIGHTS[state.view],
  };
}
